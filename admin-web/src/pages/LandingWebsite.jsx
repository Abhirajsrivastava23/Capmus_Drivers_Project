import React, { useState } from 'react';
import VideoIntroAnimation from '../components/VideoIntroAnimation';
import {
  Download,
  Smartphone,
  Car,
  ShieldCheck,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Lock,
  QrCode,
  Star,
  ChevronRight,
  Shield,
  PhoneCall,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function LandingWebsite({ onOpenAdmin }) {
  const [downloadCount, setDownloadCount] = useState(50);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const handleDownloadApk = () => {
    setIsDownloading(true);
    setDownloadCount((prev) => prev + 1);

    // Trigger download
    const link = document.createElement('a');
    link.href = '/downloads/CampusDrivers_v1.0.0.apk';
    link.setAttribute('download', 'CampusDrivers_v1.0.0.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  const routes = [
    {
      city: 'Kanpur',
      time: '1h 30m',
      cost: '₹250',
      drop: 'Kanpur Central / Mall Road / Rawatpur',
      seats: '3 seats typical',
      saving: 'Save ~₹750 vs Taxi',
      popular: true,
    },
    {
      city: 'Unnao',
      time: '30m',
      cost: '₹80',
      drop: 'Unnao Bypass / Railway Station',
      seats: '3 seats typical',
      saving: 'Save ~₹350 vs Auto',
      popular: false,
    },
    {
      city: 'Lucknow City',
      time: '45m',
      cost: '₹120',
      drop: 'Charbagh / Alambagh / Hazratganj',
      seats: '4 seats typical',
      saving: 'Save ~₹450 vs Cab',
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#090A0D] text-zinc-100 font-sans selection:bg-zinc-700 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* 🎬 Fullscreen Edge-to-Edge Intro Video Animation */}
      {showIntro && (
        <VideoIntroAnimation onComplete={() => setShowIntro(false)} />
      )}

      {/* 🚀 TOP NAVIGATION BAR - Sleek Obsidian & Silver Hairline */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#090A0D]/95 border-b border-zinc-800/80 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              onClick={onOpenAdmin}
              title="Campus Drivers – Click or press Ctrl+C for Admin"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-700/80 shadow-lg shadow-black/40 bg-black flex items-center justify-center shrink-0 cursor-pointer"
            >
              <img
                src="/assets/campus_f1_square.png"
                alt="Chandigarh University Campus Drivers Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-xl text-white tracking-tight whitespace-nowrap">
                  Campus Drivers
                </span>
                <span
                  onClick={onOpenAdmin}
                  className="bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-zinc-700 whitespace-nowrap cursor-pointer transition"
                >
                  CUUP Official
                </span>
              </div>
              <p className="hidden sm:block text-xs text-zinc-400 whitespace-nowrap">
                Chandigarh University Uttar Pradesh (NH-27)
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-zinc-400 whitespace-nowrap">
            <a href="#routes" className="hover:text-white transition-colors">
              Routes & Fares
            </a>
            <a href="#download" className="hover:text-white transition-colors">
              Download APK
            </a>
            <a href="#safety" className="hover:text-white transition-colors">
              Safety & Verification
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="/app"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-zinc-700/80 transition-all hover:border-zinc-500 hover:text-white whitespace-nowrap"
            >
              <span>Launch Web App</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>

            <button
              onClick={handleDownloadApk}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-zinc-200 text-black text-xs font-extrabold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-md shadow-white/10 transition-all hover:scale-[1.02] whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-black shrink-0" />
              <span>Download APK</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 🌟 HERO SECTION - Monochrome Luxury */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pt-20 lg:pb-32 w-full max-w-full">
        {/* Subtle Silver Glow Effects - constrained so they can never cause horizontal scroll */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[500px] h-60 sm:h-[300px] bg-white/[0.03] blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-0 sm:right-10 w-48 sm:w-[300px] h-48 sm:h-[220px] bg-zinc-400/[0.04] blur-[70px] sm:blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Column: Headlines & Download CTAs */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 text-xs font-semibold shadow-inner max-w-full">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">Student-Only Ride Sharing • NH-27 Corridor</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] break-words">
                Carpooling made exclusively for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                  Chandigarh University
                </span>{' '}
                Students
              </h1>

              <p className="text-sm sm:text-lg text-zinc-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Connect students with cars leaving CUUP campus with peers heading to{' '}
                <span className="text-white font-bold">Kanpur, Unnao & Lucknow</span>. Share fuel expenses,
                travel in comfort on your daily university schedule, and ride 100% verified.
              </p>

              {/* Direct Download & Launch CTA Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 w-full">
                <button
                  onClick={handleDownloadApk}
                  disabled={isDownloading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-white via-zinc-100 to-zinc-200 hover:from-zinc-100 hover:to-white text-zinc-950 font-black text-sm px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-xl shadow-white/10 border border-white/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-5 h-5 text-zinc-950 shrink-0" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-700">
                      {isDownloading ? 'Downloading...' : 'Direct Release'}
                    </div>
                    <div className="text-xs sm:text-sm font-black">Download Android APK (v1.0)</div>
                  </div>
                </button>

                <a
                  href="/app"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 font-bold text-sm px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl border border-zinc-700 shadow-lg shadow-black/40 transition-all hover:border-zinc-500"
                >
                  <Smartphone className="w-5 h-5 text-zinc-300 shrink-0" />
                  <span>Launch Web App</span>
                  <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
                </a>
              </div>

              {/* Verified Trust Stats - Black, White & Silver */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-zinc-800/90 max-w-lg mx-auto lg:mx-0">
                <div className="p-2 sm:p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-center lg:text-left">
                  <div className="text-xl sm:text-2xl font-black text-white">100%</div>
                  <div className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-0.5">Verified Students</div>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-center lg:text-left">
                  <div className="text-xl sm:text-2xl font-black text-zinc-100">₹80 - ₹250</div>
                  <div className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-0.5">Fair Fuel Share</div>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-center lg:text-left">
                  <div className="text-xl sm:text-2xl font-black text-zinc-200">4:30 PM</div>
                  <div className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-0.5">Daily Departures</div>
                </div>
              </div>
            </div>

            {/* Right Column: Official CU F1 Drivers Banner & Phone Mockup */}
            <div className="lg:col-span-5 flex flex-col items-center gap-6 w-full max-w-full overflow-hidden">
              {/* Official CU Campus Drivers Poster Card */}
              <div className="w-full max-w-[340px] rounded-3xl overflow-hidden border border-zinc-700/80 bg-[#121318] shadow-2xl shadow-black/80 group">
                <div className="relative h-44 overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src="/assets/cu_drivers_hero.jpg"
                    alt="Chandigarh University Campus Drivers Official"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white">
                    <span className="text-[11px] font-black tracking-wider uppercase text-zinc-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Chandigarh University
                    </span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                      Official Carpool
                    </span>
                  </div>
                </div>
              </div>

              {/* Phone Mockup Showcase */}
              <div className="relative w-full max-w-[320px] sm:max-w-[340px] mx-auto rounded-[36px] sm:rounded-[44px] bg-[#121318] p-3 sm:p-3.5 shadow-2xl shadow-black/80 border-4 border-zinc-700">
                {/* Speaker Notch */}
                <div className="absolute top-7 left-1/2 -translate-x-1/2 w-28 h-4 bg-zinc-950 rounded-full z-30 flex items-center justify-center border border-zinc-800">
                  <div className="w-3 h-3 rounded-full bg-zinc-800 ml-12" />
                </div>

                {/* Simulated Screen */}
                <div className="rounded-[36px] bg-[#090A0D] text-white overflow-hidden relative min-h-[580px] flex flex-col border border-zinc-800">
                  {/* Mock Mobile Header - Deep Matte Obsidian */}
                  <div className="bg-[#090A0D] px-5 pt-9 pb-5 text-white border-b border-zinc-800">
                    <div className="flex items-center justify-between text-xs text-zinc-500 pb-3">
                      <span>9:41</span>
                      <span className="font-bold">5G • 100%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-zinc-500">Chandigarh University UP</div>
                        <div className="text-lg font-black text-white">Hello, Ananya 👋</div>
                        <div className="inline-flex items-center gap-1 bg-[#18181B] text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border border-zinc-700">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span>Verified Student</span>
                        </div>
                      </div>
                      <div className="w-11 h-11 rounded-2xl overflow-hidden border border-zinc-700 bg-black flex items-center justify-center shadow-sm shrink-0">
                        <img
                          src="/assets/campus_f1_square.png"
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mock Ride Card Inside App */}
                  <div className="p-4 space-y-3 flex-1 bg-[#090A0D]">
                    <div className="bg-[#121318] rounded-2xl p-4 border border-zinc-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center text-xs border border-zinc-700">
                            AS
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Ananya Sharma</div>
                            <div className="text-[10px] text-zinc-400">5.0 ★ • 15 rides completed</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-white">₹250</div>
                          <div className="text-[9px] text-zinc-500">per seat</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-[#181920] p-2 rounded-xl text-xs border border-zinc-800">
                        <span className="font-bold text-zinc-200">Hyundai i10 • Silver</span>
                        <span className="bg-black text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-zinc-700">
                          UP32 AB 1234
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-zinc-400">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <Clock className="w-3.5 h-3.5 text-zinc-300" />
                          <span>04:30 PM Departure</span>
                        </div>
                        <div className="text-[11px] text-zinc-500">CUUP Main Gate ➔ Kanpur Central</div>
                      </div>

                      <button
                        onClick={handleDownloadApk}
                        className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-extrabold rounded-xl shadow-sm text-center transition"
                      >
                        Book 1 Seat (₹250)
                      </button>
                    </div>

                    {/* Quick Corridor Route Pill */}
                    <div className="bg-[#121318] border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs shadow-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-400" />
                        <div>
                          <div className="font-bold text-white">Unnao Shuttle Available</div>
                          <div className="text-[10px] text-zinc-400">30 mins • ₹80 only</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  {/* Mock Bottom Tab Bar - Dark Monochrome */}
                  <div className="bg-[#090A0D] border-t border-zinc-800 px-6 py-2.5 flex items-center justify-between text-[10px] font-bold text-zinc-500">
                    <div className="text-white flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-white mb-1" />
                      <span>Home</span>
                    </div>
                    <div className="flex flex-col items-center hover:text-zinc-300">
                      <span>Find Ride</span>
                    </div>
                    <div className="flex flex-col items-center text-white font-black">
                      <Car className="w-4 h-4 mb-0.5 text-white" />
                      <span>Offer Ride</span>
                    </div>
                    <div className="flex flex-col items-center hover:text-zinc-300">
                      <span>My Rides</span>
                    </div>
                    <div className="flex flex-col items-center hover:text-zinc-300">
                      <span>Profile</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🛣️ POPULAR NH-27 CORRIDOR ROUTES & FARES - Brushed Obsidian Cards */}
      <section id="routes" className="py-16 sm:py-20 bg-zinc-950/60 border-y border-zinc-800/80 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-3">
              Campus Travel Corridor
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Direct Travel from Chandigarh University UP (NH-27)
            </p>
            <p className="text-zinc-400 mt-4 text-sm sm:text-base">
              Say goodbye to expensive commercial taxis or overcrowding. Share empty seats with university
              batchmates with guaranteed fair cost contribution rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {routes.map((route) => (
              <div
                key={route.city}
                className="bg-[#111217] rounded-3xl p-7 border border-zinc-800/80 hover:border-zinc-500 transition-all hover:shadow-2xl hover:shadow-black/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {route.time}
                    </span>
                    {route.popular && (
                      <span className="bg-zinc-800 text-zinc-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-zinc-700">
                        High Demand
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-white">{route.city}</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{route.drop}</p>

                  <div className="my-6 pt-6 border-t border-zinc-800/80 flex items-baseline justify-between">
                    <div>
                      <div className="text-xs text-zinc-400 font-medium">Cost Contribution</div>
                      <div className="text-3xl font-black text-white">{route.cost}</div>
                    </div>
                    <span className="text-xs text-zinc-300 bg-zinc-800/80 font-bold px-2.5 py-1 rounded-lg border border-zinc-700">
                      {route.saving}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadApk}
                  className="w-full py-3.5 bg-zinc-900 hover:bg-white hover:text-black text-white text-xs font-bold rounded-xl transition-all border border-zinc-700 hover:border-white flex items-center justify-center gap-2 group shadow-sm"
                >
                  <span>Book in App</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📥 DOWNLOAD APK CENTER - Executive Black, Titanium & Silver */}
      <section id="download" className="py-16 sm:py-24 relative overflow-hidden w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#121319] via-[#0E0F14] to-[#0A0A0E] rounded-[24px] sm:rounded-[36px] p-5 sm:p-12 lg:p-16 border border-zinc-700/80 relative shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-8 space-y-5 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-xs font-bold max-w-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                  <span className="truncate">Latest Release v1.0.0 (Official Build)</span>
                </div>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Download the Official Campus Drivers Android APK
                </h2>

                <p className="text-zinc-300 text-xs sm:text-base leading-relaxed">
                  Install the standalone release directly on your Android phone without needing Play Store login.
                  Built with fast socket updates, emergency SOS triggers, and verified Chandigarh University UP
                  student authorization.
                </p>

                {/* File Specs & Download Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <button
                    onClick={handleDownloadApk}
                    disabled={isDownloading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 bg-white hover:bg-zinc-200 text-black font-black text-xs sm:text-sm px-5 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl shadow-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] border border-zinc-300"
                  >
                    <Download className="w-5 h-5 text-black shrink-0" />
                    <span>{isDownloading ? 'Downloading File...' : 'Download Campus Drivers APK (v1.0 • 34 MB)'}</span>
                  </button>

                  <div className="text-xs text-zinc-400 flex items-center justify-center sm:justify-start gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse" />
                    <span>{downloadCount}+ students downloaded this week</span>
                  </div>
                </div>

                {/* 3 Step Installation Guide - Clean Silver Stepper */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-zinc-800/80 text-xs">
                  <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
                    <div className="font-extrabold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-white text-black font-black flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <span>Download APK</span>
                    </div>
                    <p className="text-zinc-400">Click the white download button above to save the .apk file.</p>
                  </div>
                  <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
                    <div className="font-extrabold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-white text-black font-black flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <span>Install on Android</span>
                    </div>
                    <p className="text-zinc-400">Open file & tap 'Install' (Allow unknown sources if prompted).</p>
                  </div>
                  <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
                    <div className="font-extrabold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-white text-black font-black flex items-center justify-center text-[10px]">
                        3
                      </span>
                      <span>Sign In with CU Mail</span>
                    </div>
                    <p className="text-zinc-400">Use your @cumail.in or Student ID to access student carpooling.</p>
                  </div>
                </div>
              </div>

              {/* QR Code Scan Card - Monochrome Minimalist */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center bg-[#15161D] p-8 rounded-3xl border border-zinc-700/80 text-center space-y-4 shadow-xl">
                <div className="w-36 h-36 bg-white p-3 rounded-2xl flex items-center justify-center shadow-lg border border-zinc-300">
                  <QrCode className="w-full h-full text-black" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white">Scan from Phone</div>
                  <div className="text-xs text-zinc-400 mt-1">Directly download APK on your mobile</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🛡️ CAMPUS SAFETY & VERIFICATION */}
      <section id="safety" className="py-16 sm:py-20 bg-zinc-950/40 border-t border-zinc-800/80 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-3">
              Student Safety Protocols
            </h2>
            <p className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Strict Verification for Chandigarh University Students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#111217] p-6 rounded-2xl border border-zinc-800/80 hover:border-zinc-600 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center border border-zinc-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">ID Verification</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Only students with verified physical Chandigarh University IDs can offer or book seats.
              </p>
            </div>

            <div className="bg-[#111217] p-6 rounded-2xl border border-zinc-800/80 hover:border-zinc-600 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center border border-zinc-700">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">UP Registration Check</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Personal vehicles only (e.g. UP32 AB 1234). Commercial taxis are strictly forbidden.
              </p>
            </div>

            <div className="bg-[#111217] p-6 rounded-2xl border border-zinc-800/80 hover:border-zinc-600 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center border border-zinc-700">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">SOS Emergency</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                One-tap SOS dispatching to UP Police (112), Women Helpline (1090) & CUUP Campus Proctor.
              </p>
            </div>

            <div className="bg-[#111217] p-6 rounded-2xl border border-zinc-800/80 hover:border-zinc-600 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center border border-zinc-700">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">5-Star Driving Reviews</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Passengers rate drivers on driving safety, behaviour, and punctuality after every journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🧭 HOW IT WORKS */}
      <section id="how-it-works" className="py-16 sm:py-20 border-t border-zinc-800/80 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Drivers */}
            <div className="bg-[#111217] rounded-3xl p-8 border border-zinc-800/80 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-700">
                <Car className="w-3.5 h-3.5 text-zinc-300" />
                <span>For Car Owners (Drivers)</span>
              </div>
              <h3 className="text-2xl font-black text-white">Offer empty seats & share fuel expenses</h3>
              <div className="space-y-4 text-xs text-zinc-300">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 text-white font-black flex items-center justify-center shrink-0 border border-zinc-700">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-white">Publish your journey:</span> Select destination (Kanpur,
                    Unnao, Lucknow), pick departure time, and seats available.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 text-white font-black flex items-center justify-center shrink-0 border border-zinc-700">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-white">Confirm passenger requests:</span> Accept booking
                    requests from verified university students.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 text-white font-black flex items-center justify-center shrink-0 border border-zinc-700">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-white">Drive together & split cost:</span> Pick up at CUUP Main
                    Gate and receive fuel contribution via UPI or cash.
                  </div>
                </div>
              </div>
            </div>

            {/* For Passengers */}
            <div className="bg-[#111217] rounded-3xl p-8 border border-zinc-800/80 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-700">
                <Users className="w-3.5 h-3.5 text-zinc-300" />
                <span>For Passengers (Riders)</span>
              </div>
              <h3 className="text-2xl font-black text-white">Find comfortable rides with student peers</h3>
              <div className="space-y-4 text-xs text-zinc-300">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 text-white font-black flex items-center justify-center shrink-0 border border-zinc-700">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-white">Search available rides:</span> Filter rides by
                    destination, journey date, and vehicle AC preferences.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 text-white font-black flex items-center justify-center shrink-0 border border-zinc-700">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-white">Instant Confirmation Panel:</span> Review driver rating,
                    UP car registration number, and book your seat in 1 tap.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 text-white font-black flex items-center justify-center shrink-0 border border-zinc-700">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-white">Contact & Travel:</span> Unlock driver's direct contact,
                    board at campus gate, and enjoy a safe highway journey.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 FOOTER - Black & Silver Minimal */}
      <footer className="bg-[#050608] border-t border-zinc-900 py-12 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-700 bg-black flex items-center justify-center shrink-0">
              <img
                src="/assets/campus_f1_square.png"
                alt="Campus Drivers Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm">Campus Drivers</span>
              <p className="text-[11px] text-zinc-500">
                Chandigarh University Uttar Pradesh (Lucknow Campus, NH-27)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={handleDownloadApk} className="hover:text-white transition-colors font-bold">
              Download APK (v1.0)
            </button>
            <a
              href="/app"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors font-bold"
            >
              Open Web App
            </a>
          </div>

          <p className="text-zinc-500">© 2026 Campus Drivers. Designed for CUUP Carpooling.</p>
        </div>
      </footer>
    </div>
  );
}
