import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Satellite, Activity, Wind, Compass, Play, Pause,
  ChevronLeft, ChevronRight, Eye, ShieldAlert, Sparkles,
  Maximize2, Radio, Layers, AlertCircle, RefreshCw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import CycloneRadarVortex from './CycloneRadarVortex';

export const SLIDES = [
  {
    id: 'dana-insat',
    title: 'INSAT-3DR Multispectral Thermal IR (10.8µm)',
    cycloneName: 'CYCLONE DANA',
    basin: 'Bay of Bengal',
    category: 'Very Severe Cyclonic Storm (VSCS)',
    categoryBadge: 'CAT-3 VSCS',
    severity: 'severe',
    wind: '185 km/h',
    gusts: '205 km/h',
    pressure: '955 hPa',
    coordinates: '15.4°N, 87.2°E',
    eyeTemp: '-78.4°C (CDO Top)',
    dvorak: 'T5.5',
    spectralBand: 'Enhanced BD Thermal IR',
    status: 'ACTIVE WARNING',
    accentColor: '#00d4ff',
    gradient: 'radial-gradient(circle at 50% 50%, #ff1744 0%, #ff9100 25%, #ffd600 40%, #00e5ff 65%, #0d1f3c 85%)',
    radarColor: 'cyan',
    highlights: ['Well-defined circular central eye', 'Cold convective cloud top (-78°C)', 'Landfall track toward Odisha coast'],
    timeAgo: 'Updated 4m ago · INSAT-3DR Rapid-Scan',
  },
  {
    id: 'amphan-radar',
    title: 'Doppler Weather Radar (DWR) Reflectivity (dBZ)',
    cycloneName: 'SUPER CYCLONE AMPHAN',
    basin: 'Bay of Bengal (Benchmark System)',
    category: 'Super Cyclonic Storm (SuCS)',
    categoryBadge: 'CAT-5 SuCS',
    severity: 'severe',
    wind: '260 km/h',
    gusts: '285 km/h',
    pressure: '920 hPa',
    coordinates: '19.8°N, 88.6°E',
    eyeTemp: '-84.2°C (Eyewall)',
    dvorak: 'T7.0',
    spectralBand: 'Doppler Z-Reflectivity (55+ dBZ)',
    status: 'HISTORICAL BENCHMARK',
    accentColor: '#ff1744',
    gradient: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #d50000 20%, #ff6d00 45%, #00c853 70%, #050d1a 90%)',
    radarColor: 'severe',
    highlights: ['Closed concentric double eyewall', 'Max reflectivity > 58 dBZ in eyewall', 'Extremely rapid intensification'],
    timeAgo: 'MoES Supercomputer Calibration Archive',
  },
  {
    id: 'biparjoy-scatter',
    title: 'NOAA-20 / MetOp-C Scatterometer Surface Wind Vectors',
    cycloneName: 'CYCLONE BIPARJOY',
    basin: 'East Central Arabian Sea',
    category: 'Extremely Severe Cyclonic Storm (ESCS)',
    categoryBadge: 'CAT-3 ESCS',
    severity: 'intermediate',
    wind: '165 km/h',
    gusts: '185 km/h',
    pressure: '970 hPa',
    coordinates: '20.8°N, 69.5°E',
    eyeTemp: '-72.0°C (Spiral Core)',
    dvorak: 'T4.5',
    spectralBand: 'ASCAT Ocean Surface Vectors',
    status: 'SURGE INUNDATION MODEL',
    accentColor: '#ffd600',
    gradient: 'radial-gradient(circle at 50% 50%, #ff6b81 0%, #ffb142 30%, #34ace0 60%, #1e272e 85%)',
    radarColor: 'intermediate',
    highlights: ['Extended maritime wind radius (320 km)', 'Recurving track toward Gujarat coast', '2.8m tidal storm surge anomaly'],
    timeAgo: 'IMD Area Cyclone Warning Centre Ingestion',
  },
  {
    id: 'remal-wv',
    title: 'INSAT-3DR Water Vapor Deep Convection (6.9µm)',
    cycloneName: 'CYCLONE REMAL',
    basin: 'North Bay of Bengal',
    category: 'Severe Cyclonic Storm (SCS)',
    categoryBadge: 'CAT-1 SCS',
    severity: 'intermediate',
    wind: '120 km/h',
    gusts: '140 km/h',
    pressure: '990 hPa',
    coordinates: '18.2°N, 64.5°E',
    eyeTemp: '-68.5°C (Rainband)',
    dvorak: 'T3.5',
    spectralBand: 'Upper Troposphere Water Vapor',
    status: 'COASTAL INFLUX',
    accentColor: '#38bdf8',
    gradient: 'radial-gradient(circle at 50% 50%, #00f2fe 0%, #4facfe 35%, #000c40 75%, #050d1a 95%)',
    radarColor: 'cyan',
    highlights: ['Broad moisture convergence feeder band', 'Upper-level anticyclonic outflow', 'Heavy precipitation across Sundarbans delta'],
    timeAgo: 'RSMC Real-Time Telemetry Node',
  },
  {
    id: 'yolo-vision',
    title: 'AI Computer Vision (YOLO-v8 & ViT) Neural Eye Segmenter',
    cycloneName: 'NEURAL CONVECTIVE VORTEX (BOB-01)',
    basin: 'North Indian Ocean (MoES AI Testbed)',
    category: 'Automated Dvorak & Eye Segmentation',
    categoryBadge: 'AI INFERENCE',
    severity: 'safe',
    wind: '65 km/h',
    gusts: '80 km/h',
    pressure: '1005 hPa',
    coordinates: '12.1°N, 82.3°E',
    eyeTemp: '-55.0°C (Incipient)',
    dvorak: 'T2.0',
    spectralBand: 'ViT Spatial Attention Map (94.2%)',
    status: 'NEURAL PRE-DETECTION',
    accentColor: '#10b981',
    gradient: 'radial-gradient(circle at 50% 50%, #00e676 0%, #00b0ff 35%, #2979ff 65%, #050d1a 90%)',
    radarColor: 'safe',
    highlights: ['Sub-pixel eye center localization', '94.2% neural confidence validation', 'Early formation warning (+18h lead time)'],
    timeAgo: 'METEORA AI Pipeline Latency: 24ms',
  },
];

export default function CycloneSatelliteCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  const { isDark } = useTheme();
  const timerRef = useRef(null);

  const currentSlide = SLIDES[currentIndex];

  // Auto slide effect
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => (prev + 1) % SLIDES.length);
    }, 4800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentIndex]);

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((currentIndex + 1) % SLIDES.length);
  };

  const goToPrev = () => {
    setDirection(-1);
    setCurrentIndex((currentIndex - 1 + SLIDES.length) % SLIDES.length);
  };

  const goToSlide = (idx) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden bg-slate-100/80 dark:bg-[#071324] border-b border-slate-200 dark:border-[#1a3a6b]/60 transition-colors">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-[#00d4ff] border border-cyan-300 dark:border-cyan-500/30 mb-2.5">
              <Satellite size={14} className="text-cyan-600 dark:text-[#00d4ff] animate-pulse" />
              <span>Live Satellite &amp; Doppler Radar Feeds</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Real-Time Earth Observation Telemetry
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#88a0c0] mt-1 max-w-2xl font-mono">
              Continuous multi-spectral satellite imagery and Doppler radar convective feeds processed by the METEORA AI pipeline.
            </p>
          </div>

          {/* Playback Controls & Status Badge */}
          <div className="flex items-center gap-2 sm:gap-3 self-start md:self-auto font-mono">
            {/* Live Data Beacon */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[11px] uppercase tracking-wider">Stream Online</span>
            </div>

            {/* Play / Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] hover:border-cyan-500 text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white text-xs transition-all cursor-pointer shadow-sm"
              title={isPlaying ? 'Pause Slideshow' : 'Resume Auto-slide'}
            >
              {isPlaying ? (
                <>
                  <Pause size={13} className="text-cyan-600 dark:text-[#00d4ff]" />
                  <span className="text-[11px]">Auto</span>
                </>
              ) : (
                <>
                  <Play size={13} className="text-emerald-500" />
                  <span className="text-[11px]">Paused</span>
                </>
              )}
            </button>

            {/* Prev / Next Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrev}
                className="p-1.5 rounded-xl border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] hover:border-cyan-500 text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                title="Previous Slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToNext}
                className="p-1.5 rounded-xl border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] hover:border-cyan-500 text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                title="Next Slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 🌟 MAIN CAROUSEL FRAME WITH FUTURISTIC GLOWING BORDER */}
        <div
          className="relative rounded-3xl border-2 border-cyan-500/60 dark:border-cyan-400/60 bg-white/95 dark:bg-[#0b1b36]/95 animate-cyber-glow backdrop-blur-xl overflow-hidden transition-all duration-300 group"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          {/* Top Cyber HUD Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-100 dark:bg-[#061020] border-b border-slate-200 dark:border-[#1a3a6b] font-mono text-[11px] transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              <span className="font-bold text-slate-900 dark:text-white tracking-wider uppercase">
                {currentSlide.title}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 dark:text-[#88a0c0]">
              <span className="hidden sm:inline">{currentSlide.timeAgo}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-700 dark:text-[#00d4ff] border border-cyan-500/30">
                FRAME {currentIndex + 1} / {SLIDES.length}
              </span>
            </div>
          </div>

          {/* Slide Content Display (Animated with Framer Motion) */}
          <div className="p-4 sm:p-7 min-h-[440px] flex flex-col justify-between relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: direction * 40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -direction * 40, scale: 0.98 }}
                transition={{ duration: 0.42, ease: [0.25, 1, 0.5, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1"
              >
                {/* Left 7 Cols: High-Tech Satellite & Radar Visual Viewport */}
                <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-slate-300 dark:border-[#1a3a6b] bg-[#050d1a] shadow-xl aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center select-none group/viewport">
                  {/* Atmospheric Canvas Gradients & Thermal Heatmap Simulation */}
                  <div
                    className="absolute inset-0 opacity-80 transition-all duration-700"
                    style={{ background: currentSlide.gradient }}
                  />

                  {/* Synthetic Grid & Range Crosshairs */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#00d4ff0a_1px,transparent_1px),linear-gradient(to_bottom,#00d4ff0a_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

                  {/* Doppler / Satellite Animated Radar Swirl Centerpiece */}
                  <div className="relative z-10 scale-90 sm:scale-110">
                    <CycloneRadarVortex
                      size={280}
                      status={currentSlide.radarColor}
                      showScanline={true}
                      showLabels={true}
                      showRings={true}
                      speed="normal"
                    />
                  </div>

                  {/* Floating Eye Temperature HUD Overlay */}
                  <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 font-mono">
                    <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
                      <Radio size={12} className="text-cyan-400 animate-pulse" />
                      <span>{currentSlide.spectralBand}</span>
                    </div>
                    <div className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-md border border-white/10 text-cyan-300 text-[10px]">
                      FIX: {currentSlide.coordinates}
                    </div>
                  </div>

                  {/* Live Status Overlay & Dvorak T-Number Tag */}
                  <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5 font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-red-600/80 backdrop-blur-md text-white text-[10px] font-black tracking-widest uppercase border border-red-400/40 shadow-lg">
                      {currentSlide.status}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-yellow-300 text-[10px] font-bold border border-yellow-400/30">
                      DVORAK {currentSlide.dvorak}
                    </span>
                  </div>

                  {/* Bottom Telemetry Ticker Overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6 z-20 flex items-center justify-between font-mono text-[10px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>SYNOPTIC EYE CORE: {currentSlide.eyeTemp}</span>
                    </div>
                    <div className="hidden sm:block text-cyan-300 font-bold">
                      RANGE: 600 KM SWEEP
                    </div>
                  </div>
                </div>

                {/* Right 5 Cols: Cyclone Telemetry & Real-Time Analytics HUD */}
                <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4 font-mono">
                  <div>
                    {/* Badge Category */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950 font-sans">
                        {currentSlide.categoryBadge}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-[#88a0c0] truncate font-semibold">
                        {currentSlide.basin}
                      </span>
                    </div>

                    {/* Cyclone Name */}
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                      {currentSlide.cycloneName}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans leading-relaxed">
                      {currentSlide.category}
                    </p>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] transition-colors">
                      <div className="text-[10px] text-slate-500 dark:text-[#88a0c0] uppercase flex items-center gap-1 font-bold">
                        <Wind size={12} className="text-cyan-600 dark:text-[#00d4ff]" />
                        <span>Sustained Wind</span>
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                        {currentSlide.wind}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Gusts to {currentSlide.gusts}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] transition-colors">
                      <div className="text-[10px] text-slate-500 dark:text-[#88a0c0] uppercase flex items-center gap-1 font-bold">
                        <Compass size={12} className="text-amber-500" />
                        <span>Central Pressure</span>
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                        {currentSlide.pressure}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Drop: -35 hPa / 24h
                      </div>
                    </div>
                  </div>

                  {/* Highlights Bulletins */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] space-y-1.5 transition-colors">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-[#88a0c0] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={13} className="text-cyan-600 dark:text-[#00d4ff]" />
                      <span>Meteorological Observations</span>
                    </div>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 font-sans">
                      {currentSlide.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0 mt-1.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Interactive Slide Selector Tabs / Thumbnails */}
          <div className="p-3 sm:p-4 bg-slate-100 dark:bg-[#061020] border-t border-slate-200 dark:border-[#1a3a6b] transition-colors">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {SLIDES.map((slide, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(idx)}
                    className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer font-mono ${
                      isActive
                        ? 'border-cyan-500 dark:border-[#00d4ff] bg-white dark:bg-[#0d1f3c] shadow-md shadow-cyan-500/20 scale-[1.02]'
                        : 'border-slate-200 dark:border-[#1a3a6b] bg-slate-50/80 dark:bg-[#0a1628]/60 hover:border-slate-300 dark:hover:border-cyan-500/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-[10px] font-black uppercase ${isActive ? 'text-cyan-700 dark:text-[#00d4ff]' : 'text-slate-500 dark:text-[#88a0c0]'}`}>
                        {slide.categoryBadge}
                      </span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {slide.cycloneName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-[#88a0c0] truncate">
                      {slide.wind} · {slide.pressure}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Linear Progress Bar Indicator */}
            <div className="w-full bg-slate-200 dark:bg-[#102a4c] h-1 rounded-full mt-3 overflow-hidden">
              <motion.div
                key={currentIndex}
                initial={{ width: '0%' }}
                animate={{ width: isPlaying ? '100%' : '100%' }}
                transition={{ duration: isPlaying ? 4.8 : 0, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
