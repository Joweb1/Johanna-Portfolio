import React, { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import gsap from 'gsap';

type Theme = 'system' | 'dark' | 'light';

interface ThemeToggleProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentTheme, onThemeChange }) => {
  const containerRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const cycleTheme = () => {
    if (currentTheme === 'system') onThemeChange('dark');
    else if (currentTheme === 'dark') onThemeChange('light');
    else onThemeChange('system');
  };

  useEffect(() => {
    // Animate icon transition
    const ctx = gsap.context(() => {
      gsap.fromTo(iconRef.current, 
        { y: 20, opacity: 0, rotation: -90 },
        { y: 0, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [currentTheme]);

  const getIcon = () => {
    switch (currentTheme) {
      case 'light': return <Sun size={20} className="text-gold" />;
      case 'dark': return <Moon size={20} className="text-gold" />;
      default: return <Monitor size={20} className="text-gold" />;
    }
  };

  const getLabel = () => {
    switch (currentTheme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      default: return 'Auto';
    }
  };

  return (
    <button
      ref={containerRef}
      onClick={cycleTheme}
      className="fixed bottom-8 left-8 z-[100] group flex items-center gap-3 bg-navy-light/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-full hover:border-gold transition-colors duration-300 shadow-lg"
      aria-label="Toggle Theme"
    >
      <div ref={iconRef} className="relative z-10">
        {getIcon()}
      </div>
      <span className="text-xs font-bold uppercase tracking-widest opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 group-hover:pl-2 transition-all duration-300 overflow-hidden whitespace-nowrap text-white">
        {getLabel()} Mode
      </span>
      <div className="absolute inset-0 rounded-full bg-gold/10 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
    </button>
  );
};

export default ThemeToggle;