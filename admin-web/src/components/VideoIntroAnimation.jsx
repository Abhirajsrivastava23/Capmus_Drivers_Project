import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2, Sparkles, FastForward, ShieldCheck } from 'lucide-react';

export default function VideoIntroAnimation({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [bufferText, setBufferText] = useState('Connecting to Campus Drivers...');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef(null);

  const handleFinish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setVideoPlaying(true);
          })
          .catch((err) => {
            console.log('Video autoplay prevented or buffering:', err);
            // Non-blocking: background animation continues smoothly
          });
      }
    }

    // Keyboard shortcut (Escape or Space) to skip intro instantly
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Snappy executive opening animation ticker (0% -> 100% in 1800ms)
    const startTime = Date.now();
    const duration = 1800;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (pct < 35) {
        setBufferText('Connecting to Campus Drivers...');
      } else if (pct < 75) {
        setBufferText('Loading NH-27 Corridor...');
      } else {
        setBufferText('Welcome to Campus Drivers');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        handleFinish();
      }
    }, 20);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleSound = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const next = !videoRef.current.muted;
      videoRef.current.muted = next;
      setIsMuted(next);
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-[99999] w-screen h-screen bg-black flex items-center justify-center overflow-hidden transition-opacity duration-500 select-none cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* 🌌 Dynamic Ambient Background with Luxury Motion Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep radial glow center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-zinc-800/40 via-zinc-900/30 to-transparent blur-[120px] animate-pulse" />
        
        {/* Subtle Luxury Highway Speed Lines Grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Executive Branding Backdrop (Always visible if video buffers) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-4">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-zinc-700 via-zinc-900 to-black p-0.5 shadow-[0_0_50px_rgba(255,255,255,0.15)] border border-zinc-700/60 flex items-center justify-center">
              <div className="w-full h-full rounded-[22px] bg-black/90 flex flex-col items-center justify-center p-3">
                <span className="text-2xl sm:text-3xl">🚗</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mt-1">CUUP</span>
              </div>
            </div>
            {/* Pulsing ring aura */}
            <div className="absolute -inset-2 rounded-3xl border border-white/10 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h1 className="text-xl sm:text-2xl font-black tracking-[0.25em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-400">
              Campus Drivers
            </h1>
            <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-zinc-300" />
              <span>Chandigarh University Uttar Pradesh</span>
            </p>
          </div>
        </div>
      </div>

      {/* 🎬 Real Video Viewport with Soft Feathered Border Fades */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden z-10">
        <video
          ref={videoRef}
          src="/assets/intro_ad.mp4"
          autoPlay
          playsInline
          webkit-playsinline="true"
          preload="auto"
          muted={isMuted}
          onEnded={handleFinish}
          onPlay={() => setVideoPlaying(true)}
          onPlaying={() => setVideoPlaying(true)}
          onError={() => {
            console.log('Video intro fallback active');
            setVideoFailed(true);
          }}
          className={`w-full h-full object-contain md:object-cover bg-transparent transition-opacity duration-700 ${
            videoPlaying && !videoFailed ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            WebkitMaskImage: 'radial-gradient(ellipse 95% 92% at 50% 50%, black 72%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 95% 92% at 50% 50%, black 72%, transparent 100%)',
          }}
        />

        {/* 🎭 Seamless Border Fade Overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 md:w-40 bg-gradient-to-r from-black via-black/80 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 md:w-40 bg-gradient-to-l from-black via-black/80 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 sm:h-24 md:h-32 bg-gradient-to-b from-black via-black/70 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-36 md:h-48 bg-gradient-to-t from-black via-black/85 to-transparent z-20" />

        {/* Perimeter Inset Vignette */}
        <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_80px_30px_#000000] sm:shadow-[inset_0_0_140px_50px_#000000]" />
      </div>

      {/* ⚡ TOP RIGHT: SKIP BUTTON (ESC) */}
      <button
        onClick={handleFinish}
        className="absolute top-6 right-6 z-40 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold backdrop-blur-md border border-zinc-700/80 transition active:scale-95 shadow-xl"
        title="Press Escape to skip"
      >
        <span>Skip</span>
        <FastForward size={13} className="text-zinc-400 group-hover:text-white" />
      </button>

      {/* 🚀 BOTTOM CENTER: 4-SECOND OPENING BUFFER CARD */}
      <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
        <div className="flex flex-col gap-2.5 px-5 py-3.5 rounded-2xl bg-black/85 backdrop-blur-2xl border border-zinc-700/70 shadow-[0_12px_40px_rgba(0,0,0,0.95)] w-[290px] sm:w-[350px]">
          {/* Top Label Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold tracking-tight">
              <Loader2 size={13} className="text-white animate-spin shrink-0" />
              <span className="truncate">{bufferText}</span>
            </div>
            <span className="font-mono text-zinc-200 font-bold text-[11px] bg-zinc-900/90 px-2 py-0.5 rounded-md border border-zinc-700/60 shrink-0">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-zinc-900/90 overflow-hidden border border-zinc-800 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-zinc-400 via-white to-zinc-200 shadow-[0_0_12px_rgba(255,255,255,0.7)] transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Subtext Info */}
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles size={10} className="text-zinc-300" />
              Chandigarh University UP
            </span>
            <span className="font-mono text-zinc-500">Official Transit</span>
          </div>
        </div>
      </div>

      {/* 🔊 BOTTOM RIGHT: SOUND TOGGLE BUTTON */}
      <button
        onClick={toggleSound}
        className="absolute bottom-8 right-6 sm:right-8 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black/95 text-white/90 text-xs font-semibold backdrop-blur-md border border-white/20 transition active:scale-95 shadow-2xl"
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
