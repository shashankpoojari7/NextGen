"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen({ onComplete }: any) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState("initial");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setMounted(true);

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    requestAnimationFrame(() => setPhase("enter"));

    const logoTimer     = setTimeout(() => setPhase("logo"),  100);
    const textTimer     = setTimeout(() => setPhase("text"),  300);
    const holdTimer     = setTimeout(() => setPhase("hold"),  400);
    const exitTimer     = setTimeout(() => setPhase("exit"),  800);

    const completeTimer = setTimeout(() => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      if (onComplete) onComplete();
    }, 820);

    const hideTimer = setTimeout(() => setHidden(true), 1200);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
      clearTimeout(hideTimer);
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [onComplete]);

  if (hidden) return null;

  if (!mounted) {
    return <div className="fixed inset-0 z-99999 bg-[#0f0f0f]" />;
  }

  return (
    <div
      className="fixed inset-0 z-99999 overflow-hidden"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 300ms ease-out",
        pointerEvents: phase === "exit" ? "none" : "all",
      }}
    >

      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)"
        }}
      />

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, #667eea 0%, transparent 70%)",
            opacity: phase === "initial" || phase === "enter" ? 0 : 0.3,
            transform: phase === "initial" || phase === "enter" ? "scale(0)" : "scale(1)",
            transition: "all 500ms ease",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, #764ba2 0%, transparent 70%)",
            opacity: phase === "initial" || phase === "enter" ? 0 : 0.3,
            transform: phase === "initial" || phase === "enter" ? "scale(0)" : "scale(1)",
            transition: "all 500ms ease 100ms",
          }}
        />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative">
          <div
            className="absolute inset-0 -m-12 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(102,126,234,0.4) 0%, transparent 70%)",
              filter: "blur(20px)",
              opacity: phase === "initial" || phase === "enter" || phase === "exit" ? 0 : 1,
              transform:
                phase === "exit" ? "scale(1.1)" :
                phase === "initial" || phase === "enter" ? "scale(0)" : "scale(1)",
              transition: "all 400ms ease",
            }}
          />

          {/* Logo */}
          <div
            className="relative bg-linear-to-br from-blue-500 to-purple-600 rounded-3xl p-6 shadow-2xl"
            style={{
              opacity: phase === "initial" || phase === "enter" ? 0 : 1,
              transform:
                phase === "initial" || phase === "enter" ? "scale(0) rotate(180deg)" :
                phase === "exit" ? "scale(0.9) rotate(-90deg)" :
                "scale(1) rotate(0deg)",
              transition: "all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
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

        <div className="mt-8 text-center">
          <h1
            className="text-5xl font-bold bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(to right, #60a5fa, #c084fc, #f472b6)",
              fontFamily: "system-ui, -apple-system, sans-serif",
              opacity: phase === "initial" || phase === "enter" || phase === "logo" || phase === "exit" ? 0 : 1,
              transform:
                phase === "initial" || phase === "enter" || phase === "logo" ? "translateY(2rem) scale(0.95)" :
                phase === "exit" ? "translateY(-1rem) scale(0.95)" :
                "translateY(0) scale(1)",
              transition: "all 350ms ease",
            }}
          >
            NextGen
          </h1>

          <p
            className="text-gray-400 text-sm mt-3 tracking-widest"
            style={{
              opacity: phase === "initial" || phase === "enter" || phase === "logo" || phase === "exit" ? 0 : 1,
              transform:
                phase === "initial" || phase === "enter" || phase === "logo" ? "translateY(1rem)" :
                phase === "exit" ? "translateY(-0.5rem)" :
                "translateY(0)",
              transition: "all 350ms ease 100ms",
            }}
          >
            POWERED BY INNOVATION
          </p>
        </div>
      </div>
    </div>
  );
}