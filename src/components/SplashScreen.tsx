"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen({ onComplete }: any) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState("initial");

  useEffect(() => {
    // Immediately show the screen
    setMounted(true);
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Start animations immediately
    requestAnimationFrame(() => {
      setPhase("enter");
    });
    
    // Show logo
    const logoTimer = setTimeout(() => setPhase("logo"), 400);
    
    // Show text
    const textTimer = setTimeout(() => setPhase("text"), 900);
    
    // Hold complete view
    const holdTimer = setTimeout(() => setPhase("hold"), 1400);
    
    // Exit animation
    const exitTimer = setTimeout(() => setPhase("exit"), 2800);
    
    // Complete and allow home to show
    const completeTimer = setTimeout(() => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      if (onComplete) onComplete();
    }, 3500);
    
    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [onComplete]);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-99999 bg-linear-to-br from-gray-900 via-blue-900 to-purple-900" />
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-99999 overflow-hidden transition-opacity duration-700 ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)"
        }}
      />
      
      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-1000 ${
            phase === "initial" || phase === "enter" ? "scale-0 opacity-0" : "scale-100 opacity-30"
          }`}
          style={{ background: "radial-gradient(circle, #667eea 0%, transparent 70%)" }}
        />
        <div 
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-1000 delay-200 ${
            phase === "initial" || phase === "enter" ? "scale-0 opacity-0" : "scale-100 opacity-30"
          }`}
          style={{ background: "radial-gradient(circle, #764ba2 0%, transparent 70%)" }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ${
          phase === "text" || phase === "hold" ? "opacity-20" : "opacity-0"
        }`}
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px"
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Logo container with glow effect */}
        <div className="relative">
          {/* Outer glow ring */}
          <div 
            className={`absolute inset-0 -m-12 rounded-full transition-all duration-1000 ${
              phase === "initial" || phase === "enter" ? "scale-0 opacity-0" : 
              phase === "exit" ? "scale-110 opacity-0" : "scale-100 opacity-100"
            }`}
            style={{
              background: "radial-gradient(circle, rgba(102,126,234,0.4) 0%, transparent 70%)",
              filter: "blur(20px)"
            }}
          />
          
          {/* Logo */}
          <div 
            className={`relative bg-linear-to-br from-blue-500 to-purple-600 rounded-3xl p-6 shadow-2xl transition-all duration-700 ${
              phase === "initial" || phase === "enter" ? "scale-0 rotate-180 opacity-0" : 
              phase === "exit" ? "scale-90 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
            }`}
          >
            <Image
              src="/nextgen.png"
              alt="NextGen Logo"
              width={100}
              height={100}
              className="relative z-10"
              priority
            />
          </div>
        </div>

        {/* Text */}
        <div className="mt-8 text-center">
          <h1 
            className={`text-5xl font-bold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent transition-all duration-700 ${
              phase === "initial" || phase === "enter" || phase === "logo" ? "translate-y-8 opacity-0 scale-95" : 
              phase === "exit" ? "-translate-y-4 opacity-0 scale-95" : "translate-y-0 opacity-100 scale-100"
            }`}
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            NextGen
          </h1>
          
          <p 
            className={`text-gray-400 text-sm mt-3 tracking-widest transition-all duration-700 delay-200 ${
              phase === "initial" || phase === "enter" || phase === "logo" ? "translate-y-4 opacity-0" : 
              phase === "exit" ? "-translate-y-2 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            POWERED BY INNOVATION
          </p>
        </div>

        {/* Loading indicator */}
        <div 
          className={`mt-12 flex gap-2 transition-all duration-700 delay-300 ${
            phase === "initial" || phase === "enter" || phase === "logo" ? "opacity-0" : 
            phase === "exit" ? "opacity-0" : "opacity-100"
          }`}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-linear-to-r from-blue-400 to-purple-400"
              style={{
                animationName: phase === "text" || phase === "hold" ? "pulse" : "none",
                animationDuration: "1.5s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}