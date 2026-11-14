import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2, Sparkles } from 'lucide-react';

export default function VideoIntroAnimation({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [bufferText, setBufferText] = useState('Opening Campus Drivers...');
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch((err) => {
        console.log('Autoplay error:', err);
      });
    }

    // 4-second opening buffer ticker (0% -> 100% in 4000ms)
    const startTime = Date.now();
    const duration = 4000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (pct < 35) {
        setBufferText('Opening Campus Drivers...');
      } else if (pct < 75) {
        setBufferText('Loading Corridor Assets...');
      } else if (pct < 98) {
        setBufferText('Launching Campus Drivers...');
      } else {
        setBufferText('Opening...');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        handleFinish();
      }
    }, 30);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleFinish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600);
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const next = !videoRef.current.muted;
      videoRef.current.muted = next;
      setIsMuted(next);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[99999] w-screen h-screen bg-black flex items-center justify-center overflow-hidden transition-opacity duration-700 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* Video Viewport with Soft Feathered Border Fades */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
        <video
          ref={videoRef}
          src="/assets/intro_ad.mp4"
          autoPlay
          playsInline
          muted={isMuted}
          onEnded={handleFinish}
          className="w-full h-full object-contain md:object-cover bg-black"
          style={{
            WebkitMaskImage: 'radial-gradient(ellipse 95% 92% at 50% 50%, black 70%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 95% 92% at 50% 50%, black 70%, transparent 100%)',
          }}
        />

        {/* 🎭 Seamless Border Fade Overlays - Removes any hard boundary lines */}
        {/* Left Border Soft Gradient */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-32 md:w-44 bg-gradient-to-r from-black via-black/75 to-transparent z-20" />

        {/* Right Border Soft Gradient */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-32 md:w-44 bg-gradient-to-l from-black via-black/75 to-transparent z-20" />

        {/* Top Border Soft Gradient */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-28 md:h-36 bg-gradient-to-b from-black via-black/60 to-transparent z-20" />

        {/* Bottom Border Soft Gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-40 md:h-52 bg-gradient-to-t from-black via-black/80 to-transparent z-20" />

        {/* Perimeter Feathered Inset Vignette */}
        <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_90px_35px_#000000] sm:shadow-[inset_0_0_150px_60px_#000000]" />
      </div>

      {/* 🚀 NICHE BEECH ME: 4-SECOND OPENING / DOWNLOAD BUFFER CARD */}
      <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
        <div className="flex flex-col gap-2 px-5 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-zinc-700/70 shadow-[0_12px_40px_rgba(0,0,0,0.9)] w-[280px] sm:w-[340px]">
          {/* Top Label Row: Loader + Status Text + Monospace Percentage */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold tracking-tight">
              <Loader2 size={14} className="text-white animate-spin shrink-0" />
              <span className="truncate">{bufferText}</span>
            </div>
            <span className="font-mono text-zinc-300 font-bold text-[11px] bg-zinc-900/90 px-2 py-0.5 rounded-md border border-zinc-700/60 shrink-0">
              {Math.round(progress)}%
            </span>
          </div>

          {/* 4s Opening Buffer Progress Bar */}
          <div className="w-full h-2 rounded-full bg-zinc-900/90 overflow-hidden border border-zinc-800 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-zinc-400 via-white to-zinc-200 shadow-[0_0_12px_rgba(255,255,255,0.7)] transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Subtext info */}
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles size={10} className="text-zinc-300" />
              Chandigarh University UP
            </span>
            <span className="font-mono text-zinc-500">4s Buffer</span>
          </div>
        </div>
      </div>

      {/* Subtle Floating Sound Toggle in Bottom Right */}
      <button
        onClick={toggleSound}
        className="absolute bottom-8 right-6 sm:right-8 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white/90 text-xs font-semibold backdrop-blur-md border border-white/20 transition active:scale-95 shadow-2xl"
      >
        {isMuted ? (
          <>
            <VolumeX size={15} className="text-zinc-400" />
            <span className="hidden sm:inline">Tap for Sound</span>
          </>
        ) : (
          <>
            <Volume2 size={15} className="text-emerald-400" />
            <span className="hidden sm:inline">Sound ON</span>
          </>
        )}
      </button>
    </div>
  );
}
