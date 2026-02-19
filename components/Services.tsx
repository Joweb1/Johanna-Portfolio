import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICES } from '../constants';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Services: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(c => c !== null);
      const totalCards = cards.length;

      // Position cards: First one is visible, others are off-screen to the right
      gsap.set(cards, { 
        xPercent: (i) => i === 0 ? 0 : 100, 
        scale: 1,
        autoAlpha: 1,
        filter: "blur(0px) brightness(1)",
        zIndex: (i) => i + 1
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          start: "top top",
          end: `+=${totalCards * 100}%`, // Scroll distance proportional to items
          scrub: 1, // Smooth scrubbing
          snap: {
            snapTo: 1 / (totalCards - 1),
            duration: 0.8,
            ease: "power3.inOut"
          }
        }
      });

      // Create the chain of animations
      cards.forEach((card, i) => {
        if (i === totalCards - 1) return; // Last card doesn't need to leave (or next one doesn't exist)

        const nextCard = cards[i + 1];

        // The "Transition" Step
        tl.to(card, {
          scale: 0.85,
          xPercent: -15, // Move slightly left
          filter: "blur(15px) brightness(0.5)", // The requested blur & dim
          duration: 1,
          ease: "power2.inOut"
        })
        .to(nextCard, {
          xPercent: 0, // Slide in from right
          scale: 1,
          filter: "blur(0px) brightness(1)",
          duration: 1,
          ease: "power2.inOut"
        }, "<"); // Happen exactly at same time
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="services" className="relative h-screen bg-navy overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-10 left-10 md:top-20 md:left-20 z-0">
         <h2 className="font-serif text-[15vw] leading-none text-muted/10 font-bold select-none">
            SERVICES
         </h2>
      </div>

      {/* Cards Container */}
      <div className="relative w-full h-full flex items-center justify-center perspective-1000">
        {SERVICES.map((service, index) => (
          <div
            key={service.id}
            ref={el => { cardsRef.current[index] = el }}
            className="absolute w-[85vw] h-[70vh] md:w-[70vw] md:h-[75vh] bg-navy-light rounded-3xl overflow-hidden shadow-2xl border border-dim"
            style={{ willChange: "transform, filter" }}
          >
            {/* --- Image Layer --- */}
            <div className="absolute inset-0">
                <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover opacity-60 transition-transform duration-[2s] ease-out hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent"></div>
            </div>

            {/* --- Content Overlay --- */}
            <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-end">
                {/* Floating Top Badge */}
                <div className="absolute top-8 left-8 md:top-12 md:left-12 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-white">{service.iconType}</span>
                </div>

                {/* Number */}
                <div className="absolute top-8 right-8 md:top-12 md:right-12 font-serif text-6xl md:text-8xl text-transparent stroke-text opacity-50">
                    0{index + 1}
                    <style>{`.stroke-text { -webkit-text-stroke: 1px var(--stroke-color); }`}</style>
                </div>

                {/* Text Content */}
                <div className="max-w-3xl transform translate-y-0 transition-transform duration-500">
                    <h3 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-none">
                        {service.title}
                    </h3>
                    <div className="w-24 h-1 bg-gold mb-8"></div>
                    
                    <div className="flex flex-col md:flex-row gap-8 md:items-end justify-between">
                        <p className="font-sans text-secondary text-lg md:text-xl leading-relaxed max-w-xl">
                            {service.description}
                        </p>
                        
                        <div className="flex flex-col gap-3 shrink-0">
                            {service.details.slice(0,2).map((detail, i) => (
                                <div key={i} className="flex items-center gap-2 text-muted text-sm tracking-wider uppercase">
                                    <div className="w-1 h-1 bg-gold rounded-full"></div>
                                    {detail}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Interaction CTA */}
                <div className="absolute bottom-8 right-8 w-16 h-16 md:w-24 md:h-24 bg-gold rounded-full flex items-center justify-center cursor-pointer group hover:bg-white transition-colors duration-300">
                    <ArrowUpRight size={32} className="text-navy group-hover:rotate-45 transition-transform duration-300" />
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center gap-3 z-20">
         {SERVICES.map((_, i) => (
             <div key={i} className="w-2 h-2 rounded-full bg-dim"></div>
         ))}
      </div>
    </section>
  );
};

export default Services;