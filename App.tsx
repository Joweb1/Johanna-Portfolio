import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Preloader from './components/Preloader';
import Hero from './components/Hero';
import Services from './components/Services';
import WhyMe from './components/WhyMe';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import ThemeToggle from './components/ThemeToggle';
import AIChatbot from './components/AIChatbot';
import AIVoiceAgent from './components/AIVoiceAgent';
import AutoScroll from './components/AutoScroll';
import About from './components/About';
import Success from './components/Success';
import Contact from './components/Contact';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register global plugins once
gsap.registerPlugin(ScrollTrigger);

type Theme = 'system' | 'dark' | 'light';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('system');

  // Theme Logic
  useEffect(() => {
    const applyTheme = (targetTheme: 'dark' | 'light') => {
      document.documentElement.setAttribute('data-theme', targetTheme);
    };

    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (theme === 'system') {
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleSystemChange);
    } else {
      applyTheme(theme);
    }

    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  // AI Voice Control Event Listener for Theme
  useEffect(() => {
      const handleAIThemeChange = (e: CustomEvent) => {
          const mode = e.detail; // 'dark' or 'light'
          if (mode === 'dark' || mode === 'light') {
              setTheme(mode);
          }
      };

      window.addEventListener('ai-change-theme', handleAIThemeChange as EventListener);
      return () => window.removeEventListener('ai-change-theme', handleAIThemeChange as EventListener);
  }, []);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [loading]);

  return (
    <div className="relative min-h-screen">
      <Preloader onComplete={() => setLoading(false)} />
      
      {!loading && (
        <>
           <ScrollToTop />
           <Navigation />
           <ThemeToggle currentTheme={theme} onThemeChange={setTheme} />
           <AutoScroll />
           <AIVoiceAgent />
           <AIChatbot />
           
           <main className="relative z-10">
             <Routes>
               <Route path="/" element={
                 <>
                   <Hero />
                   <Services />
                   <WhyMe />
                   <Footer />
                 </>
               } />
               <Route path="/about" element={<About />} />
               <Route path="/services" element={<Services />} />
               <Route path="/why-me" element={<WhyMe />} />
               <Route path="/success" element={<Success />} />
               <Route path="/contact" element={<Contact />} />
             </Routes>
           </main>
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;