import React, { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { HERO_CONTENT } from '../constants';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
  imageOverride?: string;
}

const Hero: React.FC<HeroProps> = ({ imageOverride }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Canvas Constellation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Get the dynamic accent color from CSS
    const getAccentColor = () => {
      const color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      return color || '#FF0080'; 
    };

    const particles: { x: number; y: number; vx: number; vy: number }[] = [];
    // Increased particle count density (divisor from 15000 to 12000)
    const particleCount = Math.floor((width * height) / 12000); 
    const connectionDistance = 160;
    const mouse = { x: -1000, y: -1000 };

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const accentColor = getAccentColor();
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        
        if (distMouse < 200) {
            p.x += dxMouse * 0.01;
            p.y += dyMouse * 0.01;
        }

        ctx.beginPath();
        // Slightly larger particles for visibility
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = accentColor; 
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = accentColor; 
            // Increased opacity calculation for better visibility in light mode
            ctx.globalAlpha = Math.min(1, (1 - dist / connectionDistance) + 0.1);
            // Thicker lines
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Reveal Animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const chars = textRef.current?.querySelectorAll('.char');
      
      const tl = gsap.timeline({ delay: 2.2 }); 

      // Text Stagger
      if (chars && chars.length > 0) {
        tl.from(chars, {
          y: 100,
          opacity: 0,
          rotationX: -90,
          stagger: 0.02,
          duration: 1.2,
          ease: "elastic.out(1, 0.75)"
        });
      }

      tl.from(".hero-sub", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.8");

      tl.from(".hero-cta", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.6");

      // Image Reveal
      if (imageWrapperRef.current) {
        tl.from(imageWrapperRef.current, {
            scaleY: 0,
            transformOrigin: "bottom",
            duration: 1.5,
            ease: "power4.out"
        }, "-=1.5");
      }

      if (imageRef.current) {
        tl.from(imageRef.current, {
            scale: 1.4,
            duration: 2,
            ease: "power2.out"
        }, "-=1.5");
      }

    }, containerRef);
    return () => ctx.revert();
  }, []);

  const splitHeadline = HERO_CONTENT.headline.split("").map((char, index) => (
    <span key={index} className="char inline-block whitespace-pre">
      {char}
    </span>
  ));

  const displayImage = imageOverride || HERO_CONTENT.profileImage;

  return (
    <section id="hero" ref={containerRef} className="relative w-full min-h-screen flex items-center overflow-hidden bg-navy pt-24 pb-12 transition-colors duration-500">
      {/* Increased opacity from 30 to 60 for better visibility */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60 pointer-events-none md:pointer-events-auto" />
      
      <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
        
        {/* Left: Text Content */}
        <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 ref={textRef} className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium text-white leading-tight mb-8 overflow-hidden">
            {splitHeadline}
            </h1>

            <p className="hero-sub text-lg md:text-xl text-secondary max-w-xl mx-auto lg:mx-0 mb-12 font-sans leading-relaxed">
            {HERO_CONTENT.subheadline}
            </p>

            <div className="hero-cta flex flex-col lg:flex-row items-center lg:items-start gap-6">
            <button className="group relative px-8 py-4 bg-white text-navy font-sans tracking-wider overflow-hidden rounded-full transition-all hover:shadow-xl hover:shadow-gold/20">
                <span className="relative z-10 flex items-center gap-2 font-bold">
                {HERO_CONTENT.cta}
                </span>
                <div className="absolute inset-0 bg-gold transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
            </button>
            </div>
        </div>

        {/* Right: Image Content */}
        <div className="relative h-[50vh] lg:h-[70vh] w-full flex justify-center lg:justify-end order-1 lg:order-2">
            <div ref={imageWrapperRef} className="relative w-full md:w-3/4 lg:w-full h-full overflow-hidden rounded-t-[10rem] rounded-b-xl border-4 border-gold shadow-2xl z-10">
                <div className="absolute inset-0 bg-gold/10 mix-blend-overlay z-10 pointer-events-none"></div>
                <img 
                    ref={imageRef}
                    src={displayImage} 
                    alt="Johanna Uroh" 
                    className="w-full h-full object-cover"
                />
            </div>
            
            {/* Decorative Circle Behind */}
            <div className="absolute top-1/2 left-1/2 lg:left-auto lg:right-0 -translate-x-1/2 lg:translate-x-10 -translate-y-1/2 w-[120%] h-[120%] border border-gold/20 rounded-full animate-spin-slow z-0 pointer-events-none opacity-50"></div>
        </div>

      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-gold z-20">
        <ArrowDown size={32} strokeWidth={1.5} />
      </div>
    </section>
  );
};

export default Hero;