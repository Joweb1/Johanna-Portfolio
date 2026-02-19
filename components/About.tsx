import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import Hero from './Hero';
import { WHY_ME_ITEMS } from '../constants';

const About: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-detail", {
        y: 50,
        opacity: 0,
        stagger: 0.2,
        scrollTrigger: {
            trigger: ".about-section",
            start: "top 80%"
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-navy min-h-screen">
      <Hero imageOverride="https://raw.githubusercontent.com/Joweb1/Jovibe-images/refs/heads/main/Generated%20Image%20February%2005%2C%202026%20-%2010_55AM.jpg" />
      <section className="about-section py-24 px-6 container mx-auto text-center md:text-left">
        <h2 className="font-serif text-5xl mb-12 text-white about-detail">More Than Just Support</h2>
        <div className="grid md:grid-cols-2 gap-12 text-secondary text-lg leading-relaxed about-detail">
            <p>
                My journey began with a passion for efficiency and financial empowerment. I realized that many entrepreneurs struggle not because they lack vision, but because they lack the time and systems to execute it.
            </p>
            <p>
                As a Stock Trading Coach, I bring that same discipline to financial markets, teaching risk management and strategic growth. Whether organizing your business or your portfolio, my mission is the same: to help you build a legacy.
            </p>
        </div>
        
        <div className="mt-24 about-detail">
             <h3 className="text-gold font-bold uppercase tracking-widest mb-8">My Values</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {WHY_ME_ITEMS.map((item) => (
                     <div key={item.id} className="p-6 border border-dim rounded-xl hover:border-gold transition-colors">
                         <h4 className="font-serif text-xl text-white mb-2">{item.title}</h4>
                     </div>
                 ))}
             </div>
        </div>
      </section>
    </div>
  );
};

export default About;