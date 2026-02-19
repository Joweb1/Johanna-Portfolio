import React, { useState, useEffect, useRef } from 'react';
import { ChevronsDown, Pause } from 'lucide-react';

const AutoScroll: React.FC = () => {
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollRaf = useRef<number | null>(null);
    
    // Animation Refs
    const lastTimeRef = useRef<number>(0);
    const timeAccumulatorRef = useRef<number>(0);
    const currentSpeedRef = useRef<number>(0);

    // AI Control Listener
    useEffect(() => {
        const handleAIScroll = (e: CustomEvent) => {
            if (e.detail === 'start' && !isScrolling) startScrolling();
            if (e.detail === 'stop' && isScrolling) stopScrolling();
        };

        window.addEventListener('ai-toggle-scroll', handleAIScroll as EventListener);
        return () => window.removeEventListener('ai-toggle-scroll', handleAIScroll as EventListener);
    }, [isScrolling]);

    const startScrolling = () => {
        setIsScrolling(true);
        lastTimeRef.current = performance.now();
        timeAccumulatorRef.current = 0;
        currentSpeedRef.current = 2; // Initial speed

        const scrollStep = (timestamp: number) => {
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;

            // Safety check for large time jumps (tab switching)
            if (deltaTime > 100) {
                scrollRaf.current = requestAnimationFrame(scrollStep);
                return;
            }

            // 1. Detect Context (Are we in the complex pinned sections?)
            const services = document.getElementById('services');
            const whyme = document.getElementById('whyme');
            
            const isSectionActive = (el: HTMLElement | null) => {
                if (!el) return false;
                const rect = el.getBoundingClientRect();
                const vh = window.innerHeight;
                // Consider active if it covers the center line of viewport
                return (rect.top < vh * 0.5 && rect.bottom > vh * 0.5);
            };

            const inSpecialSection = isSectionActive(services) || isSectionActive(whyme);

            // 2. Determine Target Speed
            let targetSpeed = 2.5; // Base speed (Increased from 1)

            if (inSpecialSection) {
                // Human-Like Rhythm: "Move Fast -> Stop & Read"
                timeAccumulatorRef.current += deltaTime;
                
                // Cycle Configuration
                const cycleDuration = 3500; // 3.5s total cycle
                const fastPhaseDuration = 1000; // 1s to switch content
                
                const phase = timeAccumulatorRef.current % cycleDuration;
                
                if (phase < fastPhaseDuration) {
                    // Fast Transition Phase
                    targetSpeed = 12; // Fast burst to change slide
                } else {
                    // Slow Reading Phase
                    targetSpeed = 0.5; // Very slow crawl
                }
            } else {
                // Reset timer occasionally to prevent overflow or sync issues when re-entering
                // (optional, but keeps numbers sane)
                if (timeAccumulatorRef.current > 100000) timeAccumulatorRef.current = 0;
            }

            // 3. Smooth Speed Transition (Lerp)
            // Use a low factor for weightiness/smoothness
            const smoothing = 0.05;
            currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * smoothing;

            // 4. Apply Scroll
            window.scrollBy(0, currentSpeedRef.current);
            
            // 5. Boundary Check
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
                stopScrolling();
            } else {
                scrollRaf.current = requestAnimationFrame(scrollStep);
            }
        };
        
        scrollRaf.current = requestAnimationFrame(scrollStep);
    };

    const stopScrolling = () => {
        setIsScrolling(false);
        if (scrollRaf.current) {
            cancelAnimationFrame(scrollRaf.current);
            scrollRaf.current = null;
        }
    };

    const toggleScroll = () => {
        if (isScrolling) stopScrolling();
        else startScrolling();
    };

    // Stop on user interaction
    useEffect(() => {
        const handleInteraction = (e: Event) => {
            // Ignore if clicking the toggle button itself (handled by onClick)
            if ((e.target as HTMLElement).closest('button')?.getAttribute('aria-label')?.includes('Auto Scroll')) {
                return;
            }
            if (isScrolling) stopScrolling();
        };

        const events = ['wheel', 'touchstart', 'keydown', 'mousedown'];
        events.forEach(event => window.addEventListener(event, handleInteraction));

        return () => {
            events.forEach(event => window.removeEventListener(event, handleInteraction));
        };
    }, [isScrolling]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
        };
    }, []);

    return (
        <div className="fixed bottom-44 right-6 z-[85] flex items-center justify-end pointer-events-none">
            <div className="relative pointer-events-auto group">
                {/* Pulse Ring when active */}
                {isScrolling && (
                     <div className="absolute inset-0 rounded-full bg-gold opacity-75 animate-ping"></div>
                )}
                
                <button
                    onClick={toggleScroll}
                    className={`
                        relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border
                        ${isScrolling 
                            ? 'bg-gold border-gold text-navy shadow-[0_0_20px_rgba(201,162,77,0.6)]' 
                            : 'bg-navy border-gold/30 text-gold hover:bg-gold hover:text-navy hover:border-gold'
                        }
                    `}
                    aria-label={isScrolling ? "Pause Auto Scroll" : "Start Auto Scroll"}
                >
                    {isScrolling ? (
                        <Pause size={20} className="fill-current" />
                    ) : (
                        <ChevronsDown size={24} className="group-hover:translate-y-1 transition-transform" />
                    )}
                </button>

                {/* Tooltip */}
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-navy px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none shadow-md border border-dim">
                    {isScrolling ? 'Pause Scroll' : 'Auto Scroll'}
                </div>
            </div>
        </div>
    );
};

export default AutoScroll;