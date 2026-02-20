import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { NAV_ITEMS, ACCENT_COLORS } from '../constants';
import { Menu, X, ArrowUpRight, Palette } from 'lucide-react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);
    
    const headerRef = useRef<HTMLElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const bgPanelsRef = useRef<(HTMLDivElement | null)[]>([]);
    const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
    const closeBtnRef = useRef<HTMLButtonElement>(null);

    // AI Control Listeners
    useEffect(() => {
        const handleAIMenu = (e: CustomEvent) => {
            if (e.detail === 'open') setIsOpen(true);
            if (e.detail === 'close') setIsOpen(false);
        };

        const handleAIAccent = (e: CustomEvent) => {
            const color = e.detail;
            if (color && color.value) {
                changeAccentColor(color);
            }
        };

        window.addEventListener('ai-toggle-menu', handleAIMenu as EventListener);
        window.addEventListener('ai-change-accent', handleAIAccent as EventListener);

        return () => {
            window.removeEventListener('ai-toggle-menu', handleAIMenu as EventListener);
            window.removeEventListener('ai-change-accent', handleAIAccent as EventListener);
        };
    }, []);

    // Scroll detection for compact navbar state and visibility
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 50);

            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const changeAccentColor = (color: typeof ACCENT_COLORS[0]) => {
        document.documentElement.style.setProperty('--accent', color.value);
        document.documentElement.style.setProperty('--accent-light', color.light);
    };

    // Build the GSAP Timeline once
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ paused: true });

            // 1. Curtain Effect
            tl.to(bgPanelsRef.current, {
                height: "100%",
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.inOut"
            });

            // 2. Logo Text Animation (Overlay)
            tl.fromTo(".nav-title-char", {
                y: 100,
                rotateX: -90,
                opacity: 0
            }, {
                y: 0,
                rotateX: 0,
                opacity: 1,
                stagger: 0.03,
                duration: 0.8,
                ease: "back.out(1.7)"
            }, "-=0.4");

            // 3. Content Reveal Sequence
            tl.fromTo(linksRef.current, {
                y: 150,
                opacity: 0,
                skewY: 5,
                rotateX: -10
            }, {
                y: 0,
                opacity: 1,
                skewY: 0,
                rotateX: 0,
                duration: 0.8,
                stagger: 0.05,
                ease: "power4.out"
            }, "-=0.6");

            // Close Button Spin & Fade In
            tl.fromTo(closeBtnRef.current, { 
                scale: 0, 
                rotation: -180 
            }, { 
                scale: 1, 
                rotation: 0, 
                duration: 0.6, 
                ease: "back.out(1.7)" 
            }, "-=0.8");

            // Theme Picker & Footer info fade in
            tl.fromTo(".menu-extras", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.5");

            tlRef.current = tl;

            // --- Header Load Animation ---
            // Animates the main header text on page load
            gsap.from(".header-char", {
                y: 40,
                opacity: 0,
                rotateX: -90,
                stagger: 0.03,
                duration: 1,
                ease: "elastic.out(1, 0.75)",
                delay: 2 // Wait for preloader roughly
            });

        }, headerRef); // Scope to the entire header component

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (tlRef.current) {
            if (isOpen) {
                tlRef.current.play();
                document.body.style.overflow = 'hidden'; 
            } else {
                tlRef.current.reverse();
                document.body.style.overflow = ''; 
            }
        }
    }, [isOpen]);

    return (
        <header ref={headerRef} className="fixed top-0 left-0 w-full z-50 pointer-events-none">
            {/* --- VISIBLE TOP BAR --- */}
            <div 
                className={`relative z-50 transition-all duration-500 ease-in-out pointer-events-auto transform
                ${scrolled ? 'py-4 bg-navy/80 backdrop-blur-md shadow-sm' : 'py-8 bg-transparent'}
                ${!isVisible && !isOpen ? '-translate-y-full' : 'translate-y-0'}
            `}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link 
                        to="/" 
                        className={`group relative z-50 flex items-center gap-2 font-serif text-xl md:text-2xl font-bold tracking-widest transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
                    >
                        <div className="flex overflow-hidden">
                            {"Johanna".split('').map((char, i) => (
                                <span key={`h-j-${i}`} className="header-char inline-block text-white origin-bottom">
                                    {char}
                                </span>
                            ))}
                        </div>
                        <div className="flex overflow-hidden">
                            {"Uroh".split('').map((char, i) => (
                                <span key={`h-u-${i}`} className="header-char inline-block text-gold origin-bottom">
                                    {char}
                                </span>
                            ))}
                        </div>
                        {/* Hover Underline */}
                        <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </Link>

                    <button 
                        onClick={() => setIsOpen(true)}
                        className={`group flex items-center gap-3 px-5 py-2.5 rounded-full transition-all duration-500 overflow-hidden border border-navy/10 ${isOpen ? 'opacity-0 pointer-events-none' : 'bg-navy text-white hover:bg-gold hover:text-navy hover:border-gold hover:shadow-[0_0_20px_var(--accent)]'}`}
                    >
                        <span className="relative z-10 font-bold uppercase text-[10px] tracking-[0.2em] group-hover:pr-2 transition-all">Menu</span>
                        <div className="relative z-10">
                           <Menu size={16} />
                        </div>
                    </button>
                </div>
            </div>

            {/* --- FULLSCREEN OVERLAY --- */}
            <div 
                ref={menuRef} 
                className={`absolute inset-0 w-screen h-screen z-[60] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
                <div ref={el => { bgPanelsRef.current[0] = el }} className="absolute inset-0 bg-gold z-30 w-full h-0 bottom-0 top-auto"></div>
                <div ref={el => { bgPanelsRef.current[1] = el }} className="absolute inset-0 bg-navy z-40 w-full h-0 bottom-0 top-auto"></div>

                <div className="absolute inset-0 z-50 flex flex-col justify-center items-center h-full w-full">
                    
                    {/* Overlay Header: Logo (Left) & Close (Right) */}
                    <Link 
                        to="/"
                        onClick={() => setIsOpen(false)}
                        className="absolute top-8 left-6 md:top-12 md:left-12 z-50 group cursor-pointer overflow-hidden"
                    >
                        <div className="flex gap-3 font-serif text-3xl md:text-4xl font-bold tracking-wide">
                            <div className="flex overflow-hidden">
                                {"Johanna".split('').map((char, i) => (
                                    <span key={`j-${i}`} className="nav-title-char inline-block text-white origin-bottom">
                                        {char}
                                    </span>
                                ))}
                            </div>
                            <div className="flex overflow-hidden">
                                {"Uroh".split('').map((char, i) => (
                                    <span key={`u-${i}`} className="nav-title-char inline-block text-gold origin-bottom">
                                        {char}
                                    </span>
                                ))}
                            </div>
                        </div>
                         <div className="w-full h-[2px] bg-white/20 mt-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </Link>

                    <button 
                        ref={closeBtnRef}
                        onClick={() => setIsOpen(false)}
                        className="absolute top-8 right-6 md:top-12 md:right-12 w-16 h-16 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-navy transition-all duration-300 group z-50 cursor-pointer"
                        aria-label="Close Menu"
                    >
                        <div className="absolute inset-0 rounded-full border border-white/50 scale-110 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500"></div>
                        <X size={32} strokeWidth={1.5} className="group-hover:rotate-90 transition-transform duration-500 ease-out" />
                    </button>

                    <nav className="flex flex-col gap-2 md:gap-4 items-center w-full max-w-4xl px-6 mb-8">
                        {NAV_ITEMS.map((item, index) => (
                            <div key={item.label} className="overflow-hidden w-full flex justify-center group relative">
                                <Link 
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    // @ts-ignore
                                    ref={el => { linksRef.current[index] = el }}
                                    className="relative block font-serif text-5xl md:text-7xl lg:text-8xl text-transparent hover:text-white transition-colors duration-700 flex items-center gap-6 py-2"
                                    style={{ 
                                        WebkitTextStroke: '1px var(--stroke-color)',
                                        cursor: 'pointer' 
                                    }}
                                >
                                    <span className="hidden md:block text-sm font-sans text-gold font-bold tracking-widest opacity-0 -translate-x-8 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-75">
                                        0{index + 1}
                                    </span>
                                    <span className="relative z-10">{item.label}</span>
                                    <ArrowUpRight className="opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 text-gold w-8 h-8 md:w-12 md:h-12" />
                                    <span className="absolute left-0 bottom-4 md:bottom-8 w-full h-[2px] bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right group-hover:origin-left ease-out"></span>
                                </Link>
                            </div>
                        ))}
                    </nav>

                    {/* Footer / Contact Info / Accent Picker */}
                    <div className="menu-extras flex flex-col items-center gap-8">
                        {/* Accent Color Picker */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 text-muted text-xs tracking-[0.2em] uppercase">
                                <Palette size={14} />
                                <span>Personalize Theme</span>
                            </div>
                            <div className="flex gap-4 p-2 rounded-full bg-white/5 border border-dim backdrop-blur-sm">
                                {ACCENT_COLORS.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => changeAccentColor(color)}
                                        className="w-8 h-8 rounded-full border border-dim transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-white/50"
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                        aria-label={`Set accent color to ${color.name}`}
                                    ></button>
                                ))}
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-muted font-sans text-xs tracking-[0.3em] uppercase mb-4">Get in Touch</p>
                            <a href="mailto:urohjohanna25@gmail.com" className="text-xl text-white font-serif italic hover:text-gold transition-colors">urohjohanna25@gmail.com</a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navigation;