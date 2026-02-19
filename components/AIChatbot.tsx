import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import gsap from 'gsap';
import { HERO_CONTENT, SERVICES, WHY_ME_ITEMS, SUCCESS_STORY } from '../constants';

// --- System Instruction Construction ---
const SYSTEM_INSTRUCTION = `You are the AI Digital Assistant for Johanna Uroh's portfolio website. 
Your goal is to represent Johanna professionally, answer potential client questions, and encourage them to book a collaboration.

Here is the context about Johanna:
Profile: ${HERO_CONTENT.subheadline}
Success Story: ${SUCCESS_STORY.content}

Services Offered:
${SERVICES.map(s => `- ${s.title}: ${s.description} (${s.details.join(', ')})`).join('\n')}

Why Choose Her:
${WHY_ME_ITEMS.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Tone: Professional, luxurious, efficient, warm, and helpful. 
Keep text responses concise (under 3 sentences) unless asked for details.`;

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

const AIChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: "Hello! I'm Johanna's AI assistant. How can I help you grow your business today?" }
    ]);
    const [inputText, setInputText] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // AI Refs
    const aiRef = useRef<GoogleGenAI | null>(null);
    const chatSessionRef = useRef<any>(null); // For text chat history
    
    // --- Initialization ---
    useEffect(() => {
        if (process.env.API_KEY) {
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
    }, []);

    // --- Animations ---
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            if (isOpen) {
                gsap.fromTo(chatWindowRef.current, 
                    { opacity: 0, y: 20, scale: 0.95 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" }
                );
            }
        }, containerRef);
        return () => ctx.revert();
    }, [isOpen]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    // --- Text Chat Logic ---
    const handleSendText = async () => {
        if (!inputText.trim() || !aiRef.current) return;
        
        const userMsg = inputText;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInputText('');
        setIsThinking(true);

        try {
            // Initialize chat if not exists
            if (!chatSessionRef.current) {
                chatSessionRef.current = aiRef.current.chats.create({
                    model: 'gemini-3-flash-preview',
                    config: { systemInstruction: SYSTEM_INSTRUCTION }
                });
            }

            // Create a placeholder message for streaming
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            // Use streaming
            const resultStream = await chatSessionRef.current.sendMessageStream({ message: userMsg });
            
            setIsThinking(false);

            let fullText = '';
            for await (const chunk of resultStream) {
                const c = chunk as GenerateContentResponse;
                const text = c.text; 
                if (text) {
                    fullText += text;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMsg = newMessages[newMessages.length - 1];
                        if (lastMsg.role === 'model') {
                            lastMsg.text = fullText;
                        }
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setIsThinking(false);
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg.role === 'model' && lastMsg.text === '') {
                     // Replace empty placeholder
                     newMessages[newMessages.length - 1].text = "I apologize, I'm having trouble connecting right now. Please try again.";
                     return newMessages;
                }
                return [...prev, { role: 'model', text: "I apologize, I'm having trouble connecting right now. Please try again." }];
            });
        }
    };

    return (
        <div ref={containerRef} className="fixed bottom-6 right-6 z-[80] flex flex-col items-end pointer-events-none">
            
            {/* Chat Window */}
            {isOpen && (
                <div 
                    ref={chatWindowRef}
                    className="pointer-events-auto w-[90vw] md:w-[380px] h-[500px] bg-navy/95 backdrop-blur-xl border border-dim rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
                >
                    {/* Header */}
                    <div className="h-16 border-b border-dim flex items-center justify-between px-6 bg-navy-light/30">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                            <span className="font-serif text-white font-medium tracking-wide">Johanna AI</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-navy-light text-secondary hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 relative overflow-hidden flex flex-col">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div 
                                        className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-gold text-navy rounded-br-none font-medium' 
                                            : 'bg-navy-light text-white rounded-bl-none border border-dim'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            
                            {/* Thinking/Typing Indicator */}
                            {isThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-navy-light border border-dim px-4 py-4 rounded-2xl rounded-bl-none flex gap-1.5 items-center">
                                        <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-150"></span>
                                        <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-300"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-dim bg-navy">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                                    placeholder="Ask about services..."
                                    className="w-full bg-navy-light border border-dim rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors placeholder:text-muted shadow-inner"
                                />
                                <button 
                                    onClick={handleSendText}
                                    disabled={!inputText.trim() || isThinking}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gold rounded-full text-navy hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="pointer-events-auto group relative w-14 h-14 rounded-full bg-navy border border-gold/30 shadow-[0_0_20px_rgba(201,162,77,0.3)] flex items-center justify-center text-gold hover:bg-gold hover:text-navy transition-all duration-300"
                >
                    <div className="absolute inset-0 rounded-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"></div>
                    <div className="relative z-10">
                        <MessageSquare size={24} />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 bg-white text-navy px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
                        Chat
                    </div>
                </button>
            )}
        </div>
    );
};

export default AIChatbot;