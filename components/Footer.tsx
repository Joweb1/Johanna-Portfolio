import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { SUCCESS_STORY, NAV_ITEMS } from '../constants';
import { Instagram, Linkedin, Mail, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
        // Rotating Watermark
        gsap.to(watermarkRef.current, {
            rotation: 360,
            duration: 60,
            repeat: -1,
            ease: "linear"
        });

        // Success Story Reveal
        gsap.from(".success-story", {
            y: 50,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
                trigger: ".success-story",
                start: "top 80%"
            }
        });

        // Footer Content Reveal
        gsap.from(".footer-content", {
            y: 30,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8,
            scrollTrigger: {
                trigger: ".footer-main",
                start: "top 90%"
            }
        });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer id="contact" ref={containerRef} className="relative bg-navy text-white pt-24 overflow-hidden">
      
      {/* Background Watermark */}
      <div ref={watermarkRef} className="absolute -top-1/4 -right-1/4 w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] opacity-[0.03] pointer-events-none select-none flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow">
            <path id="curve" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" fill="transparent" />
            <text width="500">
                <textPath href="#curve" className="text-[24px] font-serif uppercase tracking-widest fill-current">
                    Johanna Uroh • Virtual Assistant • Trading Coach • Social Media •
                </textPath>
            </text>
        </svg>
        <div className="absolute font-serif text-[15vw] font-bold">JU</div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Success Story Section */}
        <div className="success-story max-w-4xl mx-auto text-center mb-32 bg-navy-light/50 p-12 rounded-2xl border border-dim backdrop-blur-sm">
            <h4 className="text-gold text-lg tracking-widest uppercase mb-6 font-semibold">{SUCCESS_STORY.title}</h4>
            <p className="font-serif text-2xl md:text-3xl italic leading-relaxed text-white">
                "{SUCCESS_STORY.content}"
            </p>
        </div>

        {/* Main Footer Content */}
        <div className="footer-main grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-24 border-b border-dim">
            <div className="footer-content lg:col-span-5">
                <h2 className="font-serif text-5xl md:text-7xl mb-8 leading-tight">
                    Let's Achieve Your <br />
                    <span className="text-gold italic">Goals Together.</span>
                </h2>
                <p className="text-secondary max-w-md text-lg">
                    Turn your vision into reality. Collaborative strategies for sustainable growth and efficiency.
                </p>
            </div>

            <div className="footer-content lg:col-span-3 lg:col-start-7">
                <h3 className="text-gold font-semibold uppercase tracking-widest mb-6">Explore</h3>
                <ul className="space-y-4 font-sans text-lg">
                    {NAV_ITEMS.map(item => (
                        <li key={item.label}>
                            <a href={item.href} className="text-secondary hover:text-gold transition-colors">{item.label}</a>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="footer-content lg:col-span-3">
                <h3 className="text-gold font-semibold uppercase tracking-widest mb-6">Connect</h3>
                <div className="flex gap-6 mb-8">
                    <a href="#" className="w-10 h-10 rounded-full border border-dim text-white flex items-center justify-center hover:bg-gold hover:border-gold hover:text-navy transition-all">
                        <Instagram size={20} />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full border border-dim text-white flex items-center justify-center hover:bg-gold hover:border-gold hover:text-navy transition-all">
                        <Linkedin size={20} />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full border border-dim text-white flex items-center justify-center hover:bg-gold hover:border-gold hover:text-navy transition-all">
                        <Twitter size={20} />
                    </a>
                </div>
                <a href="mailto:urohjohanna25@gmail.com" className="flex items-center gap-2 text-secondary hover:text-gold transition-colors text-lg">
                    <Mail size={20} />
                    urohjohanna25@gmail.com
                </a>
            </div>
        </div>

        <div className="py-8 text-center text-muted text-sm flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Johanna Uroh. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Designed with Luxury & Efficiency.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;