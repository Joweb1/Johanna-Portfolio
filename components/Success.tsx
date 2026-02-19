import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { SUCCESS_STORY } from '../constants';
import { Quote } from 'lucide-react';

const Success: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".success-card", {
                scale: 0.9,
                opacity: 0,
                duration: 1,
                ease: "power2.out",
                stagger: 0.2
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-navy flex items-center justify-center relative overflow-hidden pt-24 pb-12">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
             
             <div className="container mx-auto px-6 relative z-10">
                 <div className="text-center mb-20">
                     <h1 className="font-serif text-6xl md:text-8xl text-white mb-6">Success Stories</h1>
                     <p className="text-secondary text-xl max-w-2xl mx-auto">Real results from real clients. Transforming chaos into clarity and growth.</p>
                 </div>

                 <div className="success-card max-w-5xl mx-auto bg-navy-light/50 backdrop-blur-md border border-gold/30 rounded-3xl p-8 md:p-16 relative">
                     <Quote className="absolute top-8 left-8 text-gold w-12 h-12 opacity-50" />
                     
                     <div className="relative z-10 flex flex-col items-center text-center">
                         <h2 className="text-gold tracking-[0.3em] uppercase font-bold mb-8 text-sm">{SUCCESS_STORY.title}</h2>
                         <p className="font-serif text-2xl md:text-4xl leading-relaxed text-white italic mb-12">
                             "{SUCCESS_STORY.content}"
                         </p>
                         
                         <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-full bg-dim overflow-hidden">
                                 <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" alt="Client" className="w-full h-full object-cover" />
                             </div>
                             <div className="text-left">
                                 <div className="text-white font-bold">Sarah Jenkins</div>
                                 <div className="text-muted text-sm">E-commerce Founder</div>
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="grid md:grid-cols-3 gap-8 mt-24">
                     {[1, 2, 3].map((i) => (
                         <div key={i} className="success-card p-8 border border-dim rounded-xl bg-navy-light/20 hover:bg-navy-light/40 transition-colors cursor-pointer group">
                             <div className="text-gold text-4xl font-serif mb-4 group-hover:translate-x-2 transition-transform">98%</div>
                             <h3 className="text-white font-bold mb-2">Client Retention</h3>
                             <p className="text-muted text-sm">Building long-term partnerships based on trust and consistent delivery.</p>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
};

export default Success;