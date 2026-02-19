import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import Footer from './Footer';

const Contact: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".contact-anim", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out"
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-navy min-h-screen pt-32">
            <div className="container mx-auto px-6 mb-24">
                <div className="grid lg:grid-cols-2 gap-16">
                    <div>
                        <h1 className="font-serif text-6xl md:text-8xl text-white mb-8 contact-anim">Get In Touch</h1>
                        <p className="text-secondary text-xl mb-12 max-w-lg contact-anim">
                            Ready to reclaim your time and scale your business? Fill out the form or reach out directly.
                        </p>
                        
                        <div className="space-y-8 contact-anim">
                            <div>
                                <h3 className="text-gold text-sm tracking-widest uppercase mb-2">Email</h3>
                                <p className="text-2xl text-white">hello@johannauroh.com</p>
                            </div>
                            <div>
                                <h3 className="text-gold text-sm tracking-widest uppercase mb-2">Location</h3>
                                <p className="text-2xl text-white">Global / Remote</p>
                            </div>
                        </div>
                    </div>

                    <form className="bg-navy-light/50 p-8 md:p-12 rounded-3xl border border-dim contact-anim">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-muted text-sm uppercase tracking-wider mb-2">Name</label>
                                <input type="text" className="w-full bg-navy border border-dim rounded-lg p-4 text-white focus:border-gold focus:outline-none transition-colors" placeholder="Jane Doe" />
                            </div>
                            <div>
                                <label className="block text-muted text-sm uppercase tracking-wider mb-2">Email</label>
                                <input type="email" className="w-full bg-navy border border-dim rounded-lg p-4 text-white focus:border-gold focus:outline-none transition-colors" placeholder="jane@example.com" />
                            </div>
                            <div>
                                <label className="block text-muted text-sm uppercase tracking-wider mb-2">Message</label>
                                <textarea rows={4} className="w-full bg-navy border border-dim rounded-lg p-4 text-white focus:border-gold focus:outline-none transition-colors" placeholder="How can I help you?"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-gold text-navy font-bold py-4 rounded-lg hover:bg-white transition-colors">
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Reuse Footer for additional links */}
            <Footer />
        </div>
    );
};

export default Contact;