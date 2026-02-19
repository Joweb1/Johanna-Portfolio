import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Sparkles } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { useNavigate } from 'react-router-dom';
import { HERO_CONTENT, SERVICES, ACCENT_COLORS } from '../constants';
import gsap from 'gsap';

const SYSTEM_INSTRUCTION = `You are the AI Digital Assistant for Johanna Uroh's portfolio.
You have control over the website interface. You can navigate pages, change the theme, change the accent color, toggle the menu, and control auto-scrolling.
When a user asks to perform an action (like "Go to contact page" or "Make the site pink"), execute the corresponding tool.
Context: ${HERO_CONTENT.subheadline}
Services: ${SERVICES.map(s => s.title).join(', ')}.
Tone: Professional, luxurious, concise, warm. 
Spoken responses must be short (1-2 sentences).`;

// --- Tool Definitions ---
const controlTools: FunctionDeclaration[] = [
    {
        name: "changeTheme",
        description: "Change the website theme to dark or light mode.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                mode: { type: Type.STRING, enum: ["dark", "light"] }
            },
            required: ["mode"]
        }
    },
    {
        name: "navigate",
        description: "Navigate to a specific page on the website.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                page: { type: Type.STRING, enum: ["home", "about", "services", "why-me", "success", "contact"] }
            },
            required: ["page"]
        }
    },
    {
        name: "setAccentColor",
        description: "Change the website's main accent color.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                color: { type: Type.STRING, enum: ACCENT_COLORS.map(c => c.name) }
            },
            required: ["color"]
        }
    },
    {
        name: "toggleAutoScroll",
        description: "Start or stop the auto-scrolling feature.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, enum: ["start", "stop"] }
            },
            required: ["action"]
        }
    },
    {
        name: "toggleMenu",
        description: "Open or close the main navigation menu.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, enum: ["open", "close"] }
            },
            required: ["action"]
        }
    }
];

const COMMANDS = [
    "Switch to Light Mode",
    "Go to Services",
    "Make it Pink",
    "Start Scrolling",
    "Open Menu",
    "Go to Contact"
];

function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    const uint8 = new Uint8Array(int16.buffer);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8[i]);
    }
    return {
        data: btoa(binary),
        mimeType: 'audio/pcm;rate=16000',
    };
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
}

const AIVoiceAgent: React.FC = () => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState<'idle' | 'listening' | 'speaking'>('idle');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Tooltip State
    const [commandIndex, setCommandIndex] = useState(0);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // AI Refs
    const aiRef = useRef<GoogleGenAI | null>(null);
    const liveSessionRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    
    // Audio Context Refs
    const inputCtxRef = useRef<AudioContext | null>(null);
    const outputCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceMapRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);
    const rafIdRef = useRef<number | null>(null);

    // DOM Refs for Animation
    const orbRef = useRef<HTMLDivElement>(null);
    const ring1Ref = useRef<HTMLDivElement>(null);
    const ring2Ref = useRef<HTMLDivElement>(null);

    // Initialize AI Client
    useEffect(() => {
        if (process.env.API_KEY) {
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
    }, []);

    // Tooltip Animation Loop
    useEffect(() => {
        if (isActive) return;
        const interval = setInterval(() => {
            setCommandIndex((prev) => (prev + 1) % COMMANDS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isActive]);

    // Tool Execution Logic
    const executeTool = (name: string, args: any) => {
        console.log("Executing Tool:", name, args);
        switch(name) {
            case 'changeTheme':
                window.dispatchEvent(new CustomEvent('ai-change-theme', { detail: args.mode }));
                return { result: `Theme changed to ${args.mode}` };
            
            case 'navigate':
                const pathMap: Record<string, string> = {
                    'home': '/',
                    'about': '/about',
                    'services': '/services',
                    'why-me': '/why-me',
                    'success': '/success',
                    'contact': '/contact'
                };
                const path = pathMap[args.page] || '/';
                navigate(path);
                return { result: `Navigated to ${args.page}` };

            case 'setAccentColor':
                // Find hex color
                const colorObj = ACCENT_COLORS.find(c => c.name === args.color);
                if (colorObj) {
                     window.dispatchEvent(new CustomEvent('ai-change-accent', { detail: colorObj }));
                     return { result: `Accent color set to ${args.color}` };
                }
                return { result: `Color ${args.color} not found` };

            case 'toggleAutoScroll':
                window.dispatchEvent(new CustomEvent('ai-toggle-scroll', { detail: args.action }));
                return { result: `Auto scroll ${args.action}ed` };

            case 'toggleMenu':
                window.dispatchEvent(new CustomEvent('ai-toggle-menu', { detail: args.action }));
                return { result: `Menu ${args.action}ed` };

            default:
                return { result: "Tool not found" };
        }
    };

    // --- Cleanup Logic ---
    const handleCleanup = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        try {
            if (inputCtxRef.current && inputCtxRef.current.state !== 'closed') inputCtxRef.current.close();
            if (outputCtxRef.current && outputCtxRef.current.state !== 'closed') outputCtxRef.current.close();
        } catch (e) {
            console.warn("Context closure warning:", e);
        }
        
        setIsActive(false);
        setStatus('idle');
        setIsProcessing(false);
        liveSessionRef.current = null;
        sourceMapRef.current.clear();
        
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        gsap.killTweensOf([orbRef.current, ring1Ref.current, ring2Ref.current]);
        gsap.to([orbRef.current, ring1Ref.current, ring2Ref.current], { scale: 1, opacity: 1 });
    };

    // --- Audio Visualization Loop ---
    useEffect(() => {
        const animate = () => {
            if (analyserRef.current && isActive && status === 'speaking' && outputCtxRef.current?.state === 'running') {
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);
                
                let sum = 0;
                for(let i=0; i<dataArray.length; i++) sum += dataArray[i];
                const avg = sum / dataArray.length;
                const normVol = Math.min(avg / 50, 1.5); 
                
                if (orbRef.current) {
                    gsap.to(orbRef.current, { 
                        scale: 1 + (normVol * 0.4), 
                        duration: 0.1,
                        ease: "power1.out"
                    });
                }
                
                if (ring1Ref.current && ring2Ref.current) {
                     gsap.to(ring1Ref.current, { opacity: normVol, scale: 1 + normVol, duration: 0.2 });
                     gsap.to(ring2Ref.current, { opacity: normVol * 0.5, scale: 1.2 + normVol, duration: 0.2 });
                }
            } else if (isActive && status === 'listening') {
                if (orbRef.current) {
                     gsap.to(orbRef.current, { scale: 1.1, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut", overwrite: "auto" });
                }
            }
            rafIdRef.current = requestAnimationFrame(animate);
        };

        if (isActive) animate();
        return () => { if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current); };
    }, [isActive, status]);


    // --- Session Management ---
    const startSession = async () => {
        if (isProcessing || !aiRef.current) return;
        setIsProcessing(true);

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Microphone access is not supported in this browser.");
            }

            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            inputCtxRef.current = inputCtx;
            outputCtxRef.current = outputCtx;
            nextStartTimeRef.current = 0;

            const analyser = outputCtx.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
                if (!liveSessionRef.current) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                liveSessionRef.current.then((session: any) => {
                     try { session.sendRealtimeInput({ media: pcmBlob }); } catch(err) {}
                });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);

            // Connect
            const sessionPromise = aiRef.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: SYSTEM_INSTRUCTION,
                    tools: [{ functionDeclarations: controlTools }],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                },
                callbacks: {
                    onopen: () => {
                        console.log("Voice Active");
                        setIsActive(true);
                        setStatus('listening');
                        setIsProcessing(false);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        // Handle Tool Calls
                        if (msg.toolCall) {
                            const responses = [];
                            for (const fc of msg.toolCall.functionCalls) {
                                const result = executeTool(fc.name, fc.args);
                                responses.push({
                                    id: fc.id,
                                    name: fc.name,
                                    response: result
                                });
                            }
                            sessionPromise.then(session => {
                                session.sendToolResponse({ functionResponses: responses });
                            });
                        }

                        // Handle Audio
                        const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio) {
                            setStatus('speaking');
                            const audioBytes = base64ToUint8Array(base64Audio);
                            const audioBuffer = await decodeAudioData(audioBytes, outputCtx);
                            
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(analyser); 
                            analyser.connect(outputCtx.destination);
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            
                            sourceMapRef.current.add(source);
                            source.onended = () => {
                                sourceMapRef.current.delete(source);
                                if (sourceMapRef.current.size === 0) setStatus('listening');
                            };
                        }
                    },
                    onclose: () => { console.log("Session Closed"); handleCleanup(); },
                    onerror: (e) => { console.error("Session Error", e); handleCleanup(); }
                }
            });
            liveSessionRef.current = sessionPromise;

        } catch (e: any) {
            console.error("Voice Agent Error:", e);
            if (e.name === 'NotAllowedError' || e.message?.includes('Permission denied')) {
                alert("Microphone access was denied. Please allow microphone access.");
            }
            handleCleanup();
        }
    };

    const stopSession = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        if (liveSessionRef.current) {
            liveSessionRef.current.then(session => session.close()).catch(() => handleCleanup());
        } else {
            handleCleanup();
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-[90] flex items-center justify-end pointer-events-none">
            <style>{`
                @keyframes ripple {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(3); opacity: 0; }
                }
                .ripple-effect {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    border-radius: 9999px;
                    background: var(--accent);
                    z-index: -1;
                    animation: ripple 2s infinite linear;
                }
                .ripple-delay-1 { animation-delay: 0.5s; }
                .ripple-delay-2 { animation-delay: 1s; }
            `}</style>
            
            {/* --- Status / Tooltip --- */}
            <div className="mr-4 transition-all duration-500 transform relative pointer-events-auto">
                 {/* Status Label (Visible when Active) */}
                <div className={`transition-all duration-500 absolute right-0 top-1/2 -translate-y-1/2 whitespace-nowrap ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
                    <div className="bg-navy/80 backdrop-blur-md border border-gold/30 px-4 py-2 rounded-full shadow-lg">
                        <span className="text-gold font-mono text-xs tracking-widest uppercase flex items-center gap-2">
                            {status === 'listening' && (
                                <>
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                                    </span>
                                    Listening
                                </>
                            )}
                            {status === 'speaking' && (
                                 <>
                                    <AudioWaveformIcon className="w-3 h-3 animate-pulse" />
                                    Speaking
                                 </>
                            )}
                        </span>
                    </div>
                </div>

                {/* Animated Tooltip (Visible on Hover when Inactive) */}
                <div 
                    className={`transition-all duration-500 absolute right-0 top-1/2 -translate-y-1/2 whitespace-nowrap group-hover/btn:opacity-100 group-hover/btn:translate-x-0 ${!isActive ? 'opacity-0 translate-x-4' : 'hidden'}`}
                >
                    <div className="bg-white text-navy px-4 py-2 rounded-lg shadow-xl border border-dim relative overflow-hidden min-w-[180px] flex items-center justify-center">
                         <div className="flex items-center gap-2">
                            <Sparkles size={12} className="text-gold shrink-0" />
                            <div className="relative h-5 w-40 overflow-hidden text-center">
                                {COMMANDS.map((cmd, i) => (
                                    <span 
                                        key={i}
                                        className={`absolute inset-0 flex items-center justify-center text-xs font-bold transition-all duration-500 transform
                                            ${i === commandIndex ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
                                        `}
                                    >
                                        "{cmd}"
                                    </span>
                                ))}
                            </div>
                         </div>
                         {/* Arrow */}
                         <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-dim transform rotate-45"></div>
                    </div>
                </div>
            </div>

            {/* --- The Orb Button --- */}
            <div className="relative pointer-events-auto group/btn">
                {/* Visualizer Rings / Ripple */}
                {status === 'speaking' && (
                    <>
                        <div className="ripple-effect"></div>
                        <div className="ripple-effect ripple-delay-1"></div>
                        <div className="ripple-effect ripple-delay-2"></div>
                    </>
                )}
                
                <div 
                    ref={ring1Ref}
                    className={`absolute inset-0 rounded-full border border-gold/40 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0 scale-50'}`}
                ></div>
                 <div 
                    ref={ring2Ref}
                    className={`absolute inset-0 -m-2 rounded-full border border-gold/20 transition-all duration-500 delay-75 ${isActive ? 'opacity-100' : 'opacity-0 scale-50'}`}
                ></div>

                {/* Main Button / Core */}
                <button
                    onClick={isActive ? stopSession : startSession}
                    disabled={isProcessing}
                    className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {/* Background Layer (Glass vs Gold Gradient) */}
                    <div 
                        ref={orbRef}
                        className={`absolute inset-0 rounded-full transition-all duration-500 shadow-[0_0_20px_rgba(201,162,77,0.3)]
                        ${isActive 
                            ? 'bg-gradient-to-tr from-gold to-yellow-200 border-none' 
                            : 'bg-navy border border-gold/30 group-hover:bg-gold group-hover:border-gold'
                        }`}
                    ></div>

                    {/* Icon Layer */}
                    <div className={`relative z-20 transition-colors duration-300 ${isActive ? 'text-navy' : 'text-gold group-hover:text-navy'}`}>
                        {isActive ? <PhoneOff size={24} /> : <Mic size={24} />}
                    </div>
                </button>
            </div>
        </div>
    );
};

const AudioWaveformIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 4V20M8 9V15M16 9V15M4 11V13M20 11V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default AIVoiceAgent;