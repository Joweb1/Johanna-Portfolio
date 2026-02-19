import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WHY_ME_ITEMS } from '../constants';

gsap.registerPlugin(ScrollTrigger);

const WhyMe: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panels = panelsRef.current.filter(p => p !== null);
      
      // Initial State: All panels (except first) are masked out (circle zero radius)
      // We set the first one to full view.
      panels.forEach((panel, i) => {
        if (i === 0) {
            gsap.set(panel, { clipPath: "circle(150% at 50% 50%)", zIndex: 1 });
        } else {
            gsap.set(panel, { clipPath: "circle(0% at 50% 50%)", zIndex: i + 1 });
        }
        // Set images slightly scaled up for the zoom-out effect
        gsap.set(panel.querySelector('.bg-img'), { scale: 1.3 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          start: "top top",
          end: `+=${panels.length * 100}%`,
          scrub: 1, // Highly responsive scrub
          onUpdate: (self) => {
             // Calculate active index based on progress
             const idx = Math.min(
                 Math.floor(self.progress * panels.length), 
                 panels.length - 1
             );
             setActiveIndex(idx);
          }
        }
      });

      // Build Sequence
      panels.forEach((panel, i) => {
        if (i === 0) return;

        // Animate clip-path to reveal
        tl.to(panel, {
            clipPath: "circle(150% at 50% 50%)",
            duration: 1,
            ease: "power2.inOut"
        }, i - 1); // Stagger based on index

        // Animate Image inside (Zoom Out effect)
        tl.to(panel.querySelector('.bg-img'), {
            scale: 1,
            duration: 1,
            ease: "power2.inOut"
        }, "<");
        
        // Parallax Text slightly
        tl.fromTo(panel.querySelector('.content-box'), 
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, 
            "<+=0.2"
        );
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="whyme" className="relative h-screen bg-navy overflow-hidden">
      
      {/* Permanent Overlay UI (Stays on top while panels change) */}
      <div className="absolute top-0 left-0 w-full h-full z-50 pointer-events-none p-6 md:p-12 flex flex-col justify-between">
         <div className="flex justify-between items-start">
             <div>
                <h2 className="text-white font-serif text-3xl md:text-4xl mix-blend-difference">Why Work<br/>With Me?</h2>
             </div>
             {/* Dynamic Counter */}
             <div className="text-gold font-sans font-bold text-xl md:text-2xl">
                 0{activeIndex + 1} <span className="text-muted text-base">/ 0{WHY_ME_ITEMS.length}</span>
             </div>
         </div>

         {/* Rotating Badge */}
         <div className="absolute bottom-10 right-10 hidden md:flex items-center justify-center">
             <div className="w-32 h-32 rounded-full border border-dim flex items-center justify-center animate-spin-slow bg-navy/20 backdrop-blur-sm">
                 <div className="w-24 h-24 rounded-full border border-gold/40 border-dashed"></div>
             </div>
             <div className="absolute text-white text-xs font-bold tracking-widest uppercase">Scroll</div>
         </div>
      </div>

      {/* Stacked Panels */}
      {WHY_ME_ITEMS.map((item, index) => (
        <div 
            key={item.id}
            ref={el => { panelsRef.current[index] = el }}
            className="absolute inset-0 w-full h-full flex items-center justify-center"
        >
            {/* Background Image Layer */}
            <div className="absolute inset-0 bg-navy">
                <img 
                    src={item.image} 
                    alt={item.title} 
                    className="bg-img w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-transparent to-navy/90"></div>
            </div>

            {/* Content Layer */}
            <div className="content-box relative z-10 max-w-5xl px-6 text-center">
                <div className="inline-block mb-6 overflow-hidden">
                    <span className="block text-gold text-sm md:text-base font-bold tracking-[0.4em] uppercase">
                        Reason 0{index + 1}
                    </span>
                </div>
                
                <h3 className="font-serif text-5xl md:text-7xl lg:text-9xl text-white mb-8 font-medium leading-tight">
                    {item.title}
                </h3>
                
                <p className="font-sans text-secondary text-lg md:text-2xl leading-relaxed max-w-2xl mx-auto">
                    {item.description}
                </p>
            </div>
        </div>
      ))}

    </section>
  );
};

export default WhyMe;