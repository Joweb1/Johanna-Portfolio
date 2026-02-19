import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Clock, Share2, TrendingUp, Hexagon } from 'lucide-react';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const [showContent, setShowContent] = useState(true);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setShowContent(false);
          onComplete();
        }
      });

      // Initial States
      gsap.set(cubeRef.current, { rotationX: 45, rotationY: 45, scale: 0 });
      gsap.set(".cube-face-content", { opacity: 0 });
      gsap.set(textRef.current, { scale: 0, opacity: 0 });
      
      // Ensure curtains are fully visible
      gsap.set(".curtain-block", { scaleX: 1, skewY: 0 });

      // 1. Cube Emergence (Construct)
      tl.to(cubeRef.current, {
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.75)"
      });

      // 2. Face 1: Clock (Front)
      tl.to(".face-front .cube-face-content", { opacity: 1, duration: 0.1 })
        .to(".face-front .icon-main", { rotation: 360, duration: 0.5, ease: "back.out(2)" });

      // 3. Rotate to Face 2: Network (Right) -> Rotate Y -90
      tl.to(cubeRef.current, {
        rotationY: -90,
        duration: 0.8,
        ease: "power4.inOut"
      }, "+=0.2")
      .to(".face-right .cube-face-content", { opacity: 1, duration: 0.1 }, "<0.4")
      .fromTo(".face-right .icon-main", { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(3)" }, "<0.4");

      // 4. Rotate to Face 3: Chart (Top) -> Rotate X -90
      tl.to(cubeRef.current, {
        rotationX: 90,
        duration: 0.8,
        ease: "power4.inOut"
      }, "+=0.2")
      .to(".face-top .cube-face-content", { opacity: 1, duration: 0.1 }, "<0.4")
      .fromTo(".face-top .icon-main", { y: 20 }, { y: 0, duration: 0.4, ease: "back.out(3)" }, "<0.4");

      // 5. The "Shock" Spin & Morph to Text
      tl.to(cubeRef.current, {
        rotationX: 720,
        rotationY: 720,
        scale: 0.1,
        duration: 1.0,
        ease: "expo.in"
      }, "+=0.3")
      .to(cubeRef.current, { opacity: 0, duration: 0.1 }) // Vanish cube
      
      // 6. Text Explosion
      .to(textRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.1, // Instant appearance
        ease: "none"
      })
      .fromTo(".logo-char", 
        { y: 50, opacity: 0, rotationX: -90 },
        { y: 0, opacity: 1, rotationX: 0, stagger: 0.03, duration: 0.6, ease: "back.out(2)" }
      )
      .to(textRef.current, {
        scale: 1.1,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.5,
        delay: 0.8, 
        ease: "power2.in"
      });

      // 7. Realistic Curtain Reveal
      // Left Curtain: Pulls left, slightly skews up at corner
      tl.to(".curtain-left", {
          scaleX: 0,
          skewY: 10, // Slight dragging effect at the bottom as it pulls
          duration: 2.0,
          ease: "power4.inOut"
      }, "-=0.2");

      // Right Curtain: Pulls right, slightly skews down
      tl.to(".curtain-right", {
          scaleX: 0,
          skewY: -10,
          duration: 2.0,
          ease: "power4.inOut"
      }, "<");

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  if (!showContent) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none perspective-container">
      <style>{`
        .perspective-container {
          perspective: 1200px;
        }
        .cube-wrapper {
          position: relative;
          width: 150px;
          height: 150px;
          transform-style: preserve-3d;
        }
        .cube-face {
          position: absolute;
          width: 150px;
          height: 150px;
          border: 2px solid var(--accent);
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px var(--accent) inset;
        }
        .face-front  { transform: rotateY(0deg) translateZ(75px); }
        .face-right  { transform: rotateY(90deg) translateZ(75px); }
        .face-back   { transform: rotateY(180deg) translateZ(75px); }
        .face-left   { transform: rotateY(-90deg) translateZ(75px); }
        .face-top    { transform: rotateX(90deg) translateZ(75px); }
        .face-bottom { transform: rotateX(-90deg) translateZ(75px); }

        .glow-filter {
          filter: drop-shadow(0 0 10px var(--accent));
        }
      `}</style>
      
      {/* 
          REALISTIC CURTAIN BLOCKS 
          We use two distinct blocks. The gradients simulate vertical folds (repeating linear)
          and a spotlight effect (radial) that anchors to the center opening.
      */}
      
      {/* Left Curtain */}
      <div 
        className="curtain-block curtain-left absolute top-0 left-0 h-full z-20 pointer-events-auto"
        style={{
            width: '51%', // Slight overlap to prevent gap
            transformOrigin: 'left center', // Shrinks towards left wall
            backgroundColor: 'var(--bg-main)',
            backgroundImage: `
                radial-gradient(circle at 100% 50%, color-mix(in srgb, var(--accent), transparent 60%) 0%, transparent 50%),
                repeating-linear-gradient(90deg, 
                    rgba(0,0,0,0.95) 0%, 
                    rgba(20,20,20,0.8) 5%, 
                    color-mix(in srgb, var(--accent), transparent 92%) 10%, 
                    rgba(20,20,20,0.8) 15%, 
                    rgba(0,0,0,0.95) 20%
                )
            `,
            backgroundSize: '100% 100%, 200px 100%', // Radial covers all, folds repeat every 200px (scales with width)
            boxShadow: 'inset -10px 0 50px rgba(0,0,0,0.8)' // Shadow at the meeting edge
        }}
      ></div>

      {/* Right Curtain */}
      <div 
        className="curtain-block curtain-right absolute top-0 right-0 h-full z-20 pointer-events-auto"
        style={{
            width: '51%',
            transformOrigin: 'right center', // Shrinks towards right wall
            backgroundColor: 'var(--bg-main)',
            backgroundImage: `
                radial-gradient(circle at 0% 50%, color-mix(in srgb, var(--accent), transparent 60%) 0%, transparent 50%),
                repeating-linear-gradient(90deg, 
                    rgba(0,0,0,0.95) 0%, 
                    rgba(20,20,20,0.8) 5%, 
                    color-mix(in srgb, var(--accent), transparent 92%) 10%, 
                    rgba(20,20,20,0.8) 15%, 
                    rgba(0,0,0,0.95) 20%
                )
            `,
            backgroundSize: '100% 100%, 200px 100%',
            boxShadow: 'inset 10px 0 50px rgba(0,0,0,0.8)'
        }}
      ></div>

      {/* 3D Cube Content (z-30) */}
      <div className="relative z-30">
        <div ref={cubeRef} className="cube-wrapper">
          <div className="cube-face face-front">
            <div className="cube-face-content flex flex-col items-center gap-2">
              <Clock className="icon-main w-16 h-16 text-gold glow-filter" strokeWidth={1.5} />
              <span className="text-white text-xs tracking-[0.2em] font-serif uppercase mt-2">Time</span>
            </div>
          </div>
          <div className="cube-face face-right">
            <div className="cube-face-content flex flex-col items-center gap-2">
              <Share2 className="icon-main w-16 h-16 text-gold glow-filter" strokeWidth={1.5} />
              <span className="text-white text-xs tracking-[0.2em] font-serif uppercase mt-2">Network</span>
            </div>
          </div>
          <div className="cube-face face-top">
             <div className="cube-face-content flex flex-col items-center gap-2">
              <TrendingUp className="icon-main w-16 h-16 text-gold glow-filter" strokeWidth={1.5} />
              <span className="text-white text-xs tracking-[0.2em] font-serif uppercase mt-2">Growth</span>
            </div>
          </div>
          <div className="cube-face face-back opacity-50"><Hexagon className="text-gold/20 w-8 h-8" /></div>
          <div className="cube-face face-left opacity-50"><Hexagon className="text-gold/20 w-8 h-8" /></div>
          <div className="cube-face face-bottom opacity-50"><Hexagon className="text-gold/20 w-8 h-8" /></div>
        </div>
      </div>

      {/* Final Text Reveal Container (z-40) */}
      <div ref={textRef} className="absolute z-40 flex flex-col items-center w-full px-4">
        <div className="flex justify-center items-center flex-wrap gap-x-2 gap-y-0 overflow-hidden text-center">
            {"Johanna".split('').map((char, i) => (
                <span key={`j-${i}`} className="logo-char font-serif text-4xl md:text-6xl text-white font-bold inline-block">
                    {char}
                </span>
            ))}
            <span className="w-2 md:w-4 inline-block"></span>
            {"Uroh".split('').map((char, i) => (
                <span key={`u-${i}`} className="logo-char font-serif text-4xl md:text-6xl text-gold font-bold inline-block">
                    {char}
                </span>
            ))}
        </div>
        <div className="logo-char h-0.5 w-48 md:w-64 bg-gold mt-4"></div>
      </div>

    </div>
  );
};

export default Preloader;