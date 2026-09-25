import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wind, Gauge, Satellite, RefreshCw, Activity, Eye, ArrowRight,
  AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Layers,
  Radio, Play, Pause, Zap, Thermometer, Compass, Droplets,
  CloudRain, Navigation, ArrowDownRight, ArrowUpRight, Globe
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import KpiCard from '../components/KpiCard';
import CycloneCard from '../components/CycloneCard';
import CycloneMap from '../components/CycloneMap';
import MultiModalEngineWidget from '../components/MultiModalEngineWidget';
import { activeCyclones, intensityHistory } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { useDisasterAlert } from '../context/DisasterAlertContext';

function Countdown() {
  const [secs, setSecs] = useState(211);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 1800)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return <span className="font-mono text-[#00d4ff]">{m}:{s}</span>;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs border border-slate-200 dark:border-[#1a3a6b] shadow-xl backdrop-blur-md bg-white/95 dark:bg-[#0a1628]/95">
      <div className="text-slate-500 dark:text-[#88a0c0] text-[11px]">{label}</div>
      <div className="font-mono font-bold text-sm text-cyan-600 dark:text-[#00d4ff]">
        {payload[0].value} km/h
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    condition,
    setForecastAlert,
    activeCyclone,
    isLiveWeatherActive,
    toggleLiveWeather,
    weatherCountdown,
    liveWeatherData,
    liveWeatherLoading,
    loadLiveWeatherData,
  } = useDisasterAlert();

  const [selectedCycloneId, setSelectedCycloneId] = useState(activeCyclone?.id || 'DANA');
  const [chartRange, setChartRange] = useState('72h'); // '24h' | '48h' | '72h'

  // Flaring glow state when condition changes
  const [conditionChanged, setConditionChanged] = useState(false);
  const prevConditionRef = useRef(condition);

  useEffect(() => {
    if (prevConditionRef.current !== condition) {
      setConditionChanged(true);
      prevConditionRef.current = condition;
      const timer = setTimeout(() => setConditionChanged(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [condition]);

  // Sync selectedCycloneId with activeCyclone from context
  useEffect(() => {
    if (activeCyclone?.id) {
      setSelectedCycloneId(activeCyclone.id);
    }
  }, [activeCyclone]);

  // Synchronized forecast condition themes
  const themes = {
    safe: {
      name: 'Safe / Normal Watch',
      shortLabel: 'Safe',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      bannerBg: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200',
      bannerIcon: CheckCircle2,
      bannerText: 'METEOROLOGICAL STATUS: SAFE — Basin synoptic parameters within safe thresholds. Low pressure dissipation.',
      kpiVariant: 'calm',
      chartColor: '#00c851',
    },
    intermediate: {
      name: 'Intermediate Cyclonic Advisory',
      shortLabel: 'Intermediate',
      badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      bannerBg: 'bg-yellow-950/40 border-yellow-800/60 text-yellow-200',
      bannerIcon: AlertTriangle,
      bannerText: 'METEOROLOGICAL STATUS: INTERMEDIATE — Category 1 cyclonic system detected. Coastal gale warnings with squally winds up to 120 km/h.',
      kpiVariant: 'warning',
      chartColor: '#ff9500',
    },
    severe: {
      name: 'Severe Tropical Cyclone Emergency',
      shortLabel: 'Severe',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40 font-black',
      bannerBg: 'bg-red-950/40 border-red-800/60 text-red-200',
      bannerIcon: ShieldAlert,
      bannerText: 'METEOROLOGICAL STATUS: SEVERE — Category 4 Very Severe Cyclone. Imminent coastal landfall with hurricane-force winds (185 km/h).',
      kpiVariant: 'danger',
      chartColor: '#00d4ff',
    },
  };
  themes.calm = themes.safe;

  const currentTheme = themes[condition] || themes.severe;
  const BannerIcon = currentTheme.bannerIcon;

  // Handle clicking on active cyclones to immediately inspect and record forecast alert
  const handleSelectCyclone = (c) => {
    setSelectedCycloneId(c.id);
    setForecastAlert(c.id);
    showToast(`⚡ Recorded ${c.name} as active forecasted threat. Synchronized with Citizen Portal!`, 'success', 4000);
  };

  // Authoritative manual forecast change
  const handleManualAlertLevel = (level) => {
    setForecastAlert(level);
    const label = level === 'severe' ? 'Severe' : level === 'intermediate' ? 'Intermediate' : 'Safe';
    showToast(`🚨 Synoptic Status Calibrated: ${label}. Citizen Dashboard and alert feed updated in real time.`, 'success', 4000);
  };

  // Filter intensity data based on range
  const filteredIntensity = intensityHistory.filter((_, idx) => {
    if (chartRange === '24h') return idx >= 8 && idx <= 16;
    if (chartRange === '48h') return idx >= 4 && idx <= 18;
    return true;
  });

  return (
    <div className="flex flex-col gap-4 pb-6 relative">
      {/* SYNCHRONIZED FORECAST RECORDING & CITIZEN BROADCAST BAR */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-[#1a3a6b]/70 bg-[#0d1f3c]/90 shadow-xl backdrop-blur-md transition-all duration-500">
        {/* Left: Forecast Assessment Information */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0a1628] border border-[#1a3a6b] flex items-center justify-center flex-shrink-0">
            <BannerIcon size={18} className={condition === 'severe' ? 'text-red-400' : condition === 'intermediate' ? 'text-yellow-400' : 'text-emerald-400'} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Forecasted Meteorological Assessment
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${currentTheme.badgeBg}`}>
                {currentTheme.name}
              </span>
              <span className="text-[10px] font-mono text-[#00d4ff] font-bold">
                [{activeCyclone?.name || selectedCycloneId}]
              </span>
            </div>
            <p className="text-[11px] text-[#88a0c0] leading-tight mt-0.5">
              Authoritative IMD forecast stream directly synchronized with Citizen Emergency Portal
            </p>
          </div>
        </div>

        {/* Center: Synoptic Alert Controls (Safe / Intermediate / Severe) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#0a1628] border border-[#1a3a6b]">
          <span className="text-[10px] font-mono uppercase font-black text-[#88a0c0] px-2 tracking-wider flex items-center gap-1.5">
            <Radio size={12} className="text-[#00d4ff]" />
            SYNOPTIC ALERT LEVEL:
          </span>

          {/* Safe Button */}
          <button
            onClick={() => handleManualAlertLevel('safe')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              condition === 'safe'
                ? 'bg-emerald-600 text-white font-bold border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-[#0a1628] text-[#88a0c0] border-[#1a3a6b] hover:text-white hover:border-emerald-500/50'
            }`}
            title="Calibrate Synoptic Stage to Safe"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${condition === 'safe' ? 'bg-white' : 'bg-emerald-400'}`}></span>
            <span>Safe</span>
          </button>

          {/* Intermediate Button */}
          <button
            onClick={() => handleManualAlertLevel('intermediate')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              condition === 'intermediate'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#0a1628] text-[#88a0c0] border-[#1a3a6b] hover:text-white hover:border-yellow-500/50'
            }`}
            title="Calibrate Synoptic Stage to Intermediate"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${condition === 'intermediate' ? 'bg-slate-950' : 'bg-amber-400'}`}></span>
            <span>Intermediate</span>
          </button>

          {/* Severe Button */}
          <button
            onClick={() => handleManualAlertLevel('severe')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              condition === 'severe'
                ? 'bg-red-600 text-white font-bold border-red-500 shadow-md shadow-red-500/20'
                : 'bg-[#0a1628] text-[#88a0c0] border-[#1a3a6b] hover:text-white hover:border-red-500/50'
            }`}
            title="Calibrate Synoptic Stage to Severe"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${condition === 'severe' ? 'bg-white' : 'bg-red-400'}`}></span>
            <span>Severe</span>
          </button>
        </div>

        {/* Right: Status Light Indicator + Real-Time Weather Stream Toggle */}
        <div className="flex items-center gap-3">
          {/* Live Weather Stream Toggle */}
          <button
            onClick={() => {
              toggleLiveWeather();
              showToast(
                !isLiveWeatherActive
                  ? 'Real-Time Weather Stream resumed. Synoptic conditions evolving automatically.'
                  : 'Real-Time Weather Stream paused. Current synoptic conditions locked.',
                'info'
              );
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a1628] border border-[#1a3a6b] hover:border-cyan-500/60 text-[11px] font-mono transition-colors cursor-pointer"
            title="Toggle autonomous real-time weather progression"
          >
            {isLiveWeatherActive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-[#00d4ff] font-bold">Live Stream: {weatherCountdown}s</span>
              </>
            ) : (
              <>
                <Play size={12} className="text-cyan-400" />
                <span className="text-[#88a0c0]">Stream: Paused</span>
              </>
            )}
          </button>

          {/* Status Light Lens */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#0a1628] border border-[#1a3a6b] shadow-inner select-none">
            <span className="text-[10px] font-mono tracking-wider text-[#88a0c0] uppercase font-semibold">
              STATUS LIGHT
            </span>

            <div className="relative flex items-center justify-center">
              <div
                className="relative flex items-center justify-center rounded-full p-[2.5px] transition-all duration-700 shadow-inner"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #1a3a6b, #050d1a)',
                  boxShadow: condition === 'severe'
                    ? '0 0 16px rgba(255, 23, 68, 0.6), inset 0 0 4px rgba(0,0,0,0.8)'
                    : condition === 'intermediate'
                    ? '0 0 14px rgba(255, 214, 10, 0.5), inset 0 0 4px rgba(0,0,0,0.8)'
                    : '0 0 14px rgba(0, 212, 255, 0.5), inset 0 0 4px rgba(0,0,0,0.8)',
                }}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-500 relative flex items-center justify-center ${
                    conditionChanged ? 'lamp-flare-trigger' : 'lamp-active'
                  }`}
                  style={{
                    background: condition === 'severe'
                      ? 'radial-gradient(circle at 35% 35%, #ff6b81, #ff1744 60%, #b70020)'
                      : condition === 'intermediate'
                      ? 'radial-gradient(circle at 35% 35%, #fff3b0, #ffd60a 60%, #cc9900)'
                      : 'radial-gradient(circle at 35% 35%, #70e2ff, #00d4ff 60%, #0088cc)',
                    boxShadow: condition === 'severe'
                      ? '0 0 8px #ff1744, 0 0 14px #ff1744'
                      : condition === 'intermediate'
                      ? '0 0 8px #ffd60a, 0 0 14px #ffd60a'
                      : '0 0 8px #00d4ff, 0 0 14px #00d4ff',
                  }}
                >
                  <span className="absolute top-[1.5px] left-[1.5px] w-1 h-1 rounded-full bg-white/80" />
                </div>
              </div>
            </div>

            <div
              className={`text-[11px] px-2.5 py-0.5 rounded font-bold tracking-wider uppercase transition-all duration-500 border ${currentTheme.badgeBg}`}
            >
              {currentTheme.shortLabel}
            </div>
          </div>
        </div>
      </div>

      {/* COMPACT DYNAMIC ADVISORY STRIP */}
      <div className={`px-3.5 py-2 rounded-xl border text-[11px] font-medium flex items-center gap-2 transition-all duration-300 ${currentTheme.bannerBg}`}>
        <BannerIcon size={14} className="flex-shrink-0" />
        <span className="truncate">{currentTheme.bannerText}</span>
      </div>

      {/* GEOGRAPHIC REGIONAL RISK ALERT CARD MODULE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1f3c] border border-[#1a3a6b]/80 shadow-xl space-y-3.5 relative overflow-hidden flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1a3a6b] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0a1628] border border-[#1a3a6b] flex items-center justify-center text-[#00d4ff] flex-shrink-0">
              <Zap size={18} className="text-[#00d4ff]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                GEOGRAPHIC REGIONAL RISK ALERT & SPATIAL VULNERABILITY INDEX
              </h3>
              <div className="text-[11px] text-[#88a0c0]">Automated spatial boundary lookup & coastal state impact rating based on MOSDAC telemetry</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#0a1628] text-[#00d4ff] border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider self-start sm:self-auto flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-ping"></span>
            SPATIAL RISK ENGINE LIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { state: 'Odisha', score: '88.4', code: 'HIGH RISK', badge: 'bg-red-500/20 text-red-300 border-red-500/40 font-black', border: 'border-red-500/50', dist: '182 km', wind: '185 km/h', surge: '4.2 m', urgency: '⚡ MANDATORY EVACUATION DISPATCH' },
            { state: 'West Bengal', score: '62.1', code: 'MODERATE RISK', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-bold', border: 'border-yellow-500/40', dist: '310 km', wind: '125 km/h', surge: '2.8 m', urgency: '⚠️ PREPARE EMERGENCY SHELTERS' },
            { state: 'Andhra Pradesh', score: '24.5', code: 'SAFE WATCH', badge: 'bg-blue-500/20 text-sky-300 border-blue-500/40 font-medium', border: 'border-[#1a3a6b]', dist: '460 km', wind: '75 km/h', surge: '1.0 m', urgency: '✓ MONITOR METEOROLOGICAL BULLETINS' },
            { state: 'Tamil Nadu', score: '12.8', code: 'SAFE WATCH', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-medium', border: 'border-[#1a3a6b]', dist: '680 km', wind: '45 km/h', surge: '0.4 m', urgency: '✓ NORMAL COASTAL OPERATIONS' },
          ].map((st, i) => (
            <div key={i} className={`p-3.5 rounded-xl bg-[#0a1628] border ${st.border} space-y-2 transition-all hover:border-cyan-500/50 shadow-inner`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wide">{st.state}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] border ${st.badge}`}>
                  {st.code}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black font-mono text-white">{st.score}<span className="text-xs text-[#88a0c0]">/100</span></div>
                <div className="text-[10px] font-mono text-[#88a0c0]">{st.dist} to Eye</div>
              </div>
              <div className="space-y-1 text-[11px] font-mono text-[#88a0c0] pt-1 border-t border-[#1a3a6b]">
                <div className="flex justify-between"><span>Est. Wind:</span><strong className="text-white">{st.wind}</strong></div>
                <div className="flex justify-between"><span>Storm Surge:</span><strong className="text-[#00d4ff]">{st.surge}</strong></div>
              </div>
              <div className="text-[10px] text-[#88a0c0] font-semibold pt-1 border-t border-[#1a3a6b] truncate" title={st.urgency}>
                {st.urgency}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIVE OPEN-METEO ATMOSPHERIC PRECURSOR STREAMING WIDGET */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0d1f3c] border border-slate-200 dark:border-[#1a3a6b]/80 shadow-xl space-y-4 relative overflow-hidden transition-all duration-300">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1a3a6b] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-[#0a1628] border border-cyan-200 dark:border-[#1a3a6b] flex items-center justify-center text-cyan-600 dark:text-[#00d4ff] flex-shrink-0 shadow-sm">
              <Globe size={20} className="text-cyan-600 dark:text-[#00d4ff] animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                  LIVE OPEN-METEO ATMOSPHERIC PRECURSORS INGESTION
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  REAL-TIME API SYNC
                </span>
                <span className="text-[10px] font-mono text-cyan-700 dark:text-[#00d4ff] font-bold">
                  [{liveWeatherData?.latitude?.toFixed(2) ?? '15.40'}°N, {liveWeatherData?.longitude?.toFixed(2) ?? '87.20'}°E]
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#88a0c0] mt-0.5 font-sans">
                Real-time atmospheric variables ingested from Open-Meteo Live Synoptic API (<code className="text-cyan-700 dark:text-[#00d4ff] font-mono text-[11px]">https://api.open-meteo.com/v1/forecast</code>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap font-mono text-xs">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b] text-[11px] text-slate-600 dark:text-[#88a0c0]">
              <span className="text-slate-400 dark:text-[#88a0c0]">Target:</span>
              <span className="font-bold text-slate-800 dark:text-white">{activeCyclone?.name || 'CYCLONE DANA (BOB-02)'}</span>
            </div>

            <button
              onClick={() => {
                loadLiveWeatherData(activeCyclone?.lat || 15.4, activeCyclone?.lon || 87.2);
                showToast('⚡ Ingested latest live weather precursor telemetry from Open-Meteo.', 'success', 3000);
              }}
              disabled={liveWeatherLoading}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] hover:border-cyan-500 text-slate-700 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm disabled:opacity-60"
              title="Manually fetch latest Open-Meteo live precursors"
            >
              <RefreshCw size={12} className={liveWeatherLoading ? 'animate-spin text-cyan-500' : 'text-cyan-600 dark:text-[#00d4ff]'} />
              <span>{liveWeatherLoading ? 'INGESTING...' : 'REFRESH LIVE STREAM'}</span>
            </button>
          </div>
        </div>

        {/* 5-Column Precursor Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 font-sans">
          {/* 1. Surface Pressure */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b] space-y-1.5 hover:border-cyan-500/50 transition-all shadow-sm dark:shadow-inner">
            <div className="flex items-center justify-between text-slate-500 dark:text-[#88a0c0] text-[11px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Gauge size={13} className="text-cyan-600 dark:text-[#00d4ff]" />
                SURFACE PRESSURE
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">P_sfc</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {liveWeatherData?.surface_pressure_hpa ? liveWeatherData.surface_pressure_hpa.toFixed(1) : '996.4'}
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-[#88a0c0]">hPa</span>
            </div>
            <div className="pt-1 border-t border-slate-200 dark:border-[#1a3a6b] flex flex-col gap-0.5 text-[10px] font-mono">
              <div className="flex items-center justify-between text-slate-600 dark:text-[#88a0c0]">
                <span>Tendency (3h):</span>
                <span className={`font-bold flex items-center gap-0.5 ${
                  (liveWeatherData?.pressure_tendency_3h_hpa ?? -3.2) < 0 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500'
                }`}>
                  <ArrowDownRight size={11} />
                  {liveWeatherData?.pressure_tendency_3h_hpa ? liveWeatherData.pressure_tendency_3h_hpa.toFixed(1) : '-3.2'} hPa
                </span>
              </div>
              <div className="text-[10px] text-red-500 dark:text-red-400 font-bold truncate">
                {liveWeatherData?.pressure_tendency_status || 'Rapid Falling (Deepening)'}
              </div>
            </div>
          </div>

          {/* 2. Sustained Wind & Gusts */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b] space-y-1.5 hover:border-cyan-500/50 transition-all shadow-sm dark:shadow-inner">
            <div className="flex items-center justify-between text-slate-500 dark:text-[#88a0c0] text-[11px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Wind size={13} className="text-cyan-600 dark:text-[#00d4ff]" />
                10M WIND SPEED
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">V_10m</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {liveWeatherData?.wind_speed_kmh ? liveWeatherData.wind_speed_kmh.toFixed(1) : '68.4'}
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-[#88a0c0]">km/h</span>
            </div>
            <div className="pt-1 border-t border-slate-200 dark:border-[#1a3a6b] flex flex-col gap-0.5 text-[10px] font-mono">
              <div className="flex items-center justify-between text-slate-600 dark:text-[#88a0c0]">
                <span>SI Unit:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {liveWeatherData?.wind_speed_mps ? liveWeatherData.wind_speed_mps.toFixed(1) : '19.0'} m/s
                </span>
              </div>
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-bold">
                <span>Peak Gusts:</span>
                <span>{liveWeatherData?.wind_gusts_kmh ? liveWeatherData.wind_gusts_kmh.toFixed(1) : '92.5'} km/h</span>
              </div>
            </div>
          </div>

          {/* 3. Wind Direction & Compass */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b] space-y-1.5 hover:border-cyan-500/50 transition-all shadow-sm dark:shadow-inner">
            <div className="flex items-center justify-between text-slate-500 dark:text-[#88a0c0] text-[11px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Compass size={13} className="text-cyan-600 dark:text-[#00d4ff]" />
                WIND DIRECTION
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">Dir</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {liveWeatherData?.wind_direction_deg ? Math.round(liveWeatherData.wind_direction_deg) : '72'}°
                </div>
                <span className="text-sm font-mono font-extrabold text-cyan-600 dark:text-[#00d4ff]">
                  {liveWeatherData?.wind_cardinal_direction || 'ENE'}
                </span>
              </div>
              <div
                className="w-7 h-7 rounded-full bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center transition-transform duration-500"
                style={{ transform: `rotate(${liveWeatherData?.wind_direction_deg || 72}deg)` }}
                title={`Wind direction: ${liveWeatherData?.wind_direction_deg || 72}°`}
              >
                <Navigation size={13} className="text-cyan-700 dark:text-[#00d4ff] fill-cyan-500" />
              </div>
            </div>
            <div className="pt-1 border-t border-slate-200 dark:border-[#1a3a6b] flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-[#88a0c0]">
              <span>Heading Vector:</span>
              <span className="font-bold text-slate-800 dark:text-white">Inflow to Core</span>
            </div>
          </div>

          {/* 4. Surface Ambient Temperature */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b] space-y-1.5 hover:border-cyan-500/50 transition-all shadow-sm dark:shadow-inner">
            <div className="flex items-center justify-between text-slate-500 dark:text-[#88a0c0] text-[11px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Thermometer size={13} className="text-cyan-600 dark:text-[#00d4ff]" />
                SURFACE TEMP
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">T_2m</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {liveWeatherData?.temperature_c ? liveWeatherData.temperature_c.toFixed(1) : '28.6'}
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-[#88a0c0]">°C</span>
            </div>
            <div className="pt-1 border-t border-slate-200 dark:border-[#1a3a6b] flex flex-col gap-0.5 text-[10px] font-mono">
              <div className="flex items-center justify-between text-slate-600 dark:text-[#88a0c0]">
                <span>Fahrenheit:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {liveWeatherData?.temperature_c ? ((liveWeatherData.temperature_c * 9/5) + 32).toFixed(1) : '83.5'}°F
                </span>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                Warm Sea Fuel (&gt;26.5°C)
              </div>
            </div>
          </div>

          {/* 5. Humidity & WMO Weather Description */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b] space-y-1.5 hover:border-cyan-500/50 transition-all shadow-sm dark:shadow-inner sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-[#88a0c0] text-[11px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Droplets size={13} className="text-cyan-600 dark:text-[#00d4ff]" />
                REL HUMIDITY
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">RH</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {liveWeatherData?.relative_humidity_pct ? Math.round(liveWeatherData.relative_humidity_pct) : '91'}
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-[#88a0c0]">%</span>
            </div>
            <div className="pt-1 border-t border-slate-200 dark:border-[#1a3a6b] flex flex-col gap-0.5 text-[10px]">
              <div className="flex items-center justify-between text-slate-600 dark:text-[#88a0c0] font-mono">
                <span>WMO Code:</span>
                <span className="font-bold text-slate-800 dark:text-white">#{liveWeatherData?.weather_code ?? 65}</span>
              </div>
              <div className="text-[10px] text-cyan-700 dark:text-[#00d4ff] font-bold truncate">
                {liveWeatherData?.weather_description || 'Heavy Rain & Squall'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Synoptic Ingestion Status Bar */}
        <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b] text-[11px] flex flex-col md:flex-row items-start md:items-center justify-between gap-1.5 text-slate-600 dark:text-[#88a0c0] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry Pipeline: <strong className="text-slate-800 dark:text-white">Open-Meteo WMO Live Stream</strong></span>
            <span className="text-slate-400 dark:text-[#88a0c0]/60">|</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Ready for CNN-LSTM Feature Injection</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-[#88a0c0]">
            Timestamp: {liveWeatherData?.timestamp ? new Date(liveWeatherData.timestamp).toUTCString() : new Date().toUTCString()}
          </div>
        </div>
      </div>

      {/* MULTI-MODAL DATA FUSION ENGINE STATUS & STREAMING PRECURSOR WIDGET */}
      <MultiModalEngineWidget />

      {/* TOP 4 KPI OPTIONS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <KpiCard
          icon={Activity}
          label="ACTIVE CYCLONES"
          value="3 Systems"
          sub="1 Severe · 1 Moderate · 1 Low"
          variant={currentTheme.kpiVariant}
        />
        <KpiCard
          icon={Eye}
          label="MONITORING ZONES"
          value="7 Basins"
          sub="BoB · Arabian Sea · Indian Ocean"
          variant="accent"
        />
        <KpiCard
          icon={Satellite}
          label="SATELLITE FEEDS"
          value="3 Active"
          sub="INSAT-3D · INSAT-3DR · GOES"
          variant="calm"
        />
        <KpiCard
          icon={RefreshCw}
          label="NEXT DOWNLINK"
          value={<Countdown />}
          sub="Auto-refresh every 30 min"
          variant="accent"
        />
      </div>

      {/* MAIN CONTENT: MAP + ACTIVE CYCLONES STACK */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 min-h-[350px]">
        {/* Real-time Map Viewport */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#88a0c0] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse"></span>
              <span>REAL-TIME SYNOPTIC SURFACE TRACKING — NORTH INDIAN OCEAN</span>
            </h2>
            <span className="text-[11px] font-mono text-[#88a0c0]">
              14-Sep-2024 12:00 UTC · RSMC New Delhi
            </span>
          </div>

          <div className="flex-1 rounded-2xl overflow-hidden h-[350px] sm:h-[400px] lg:h-full min-h-[350px]">
            <CycloneMap
              threatLevel={condition}
              onSelectCyclone={handleSelectCyclone}
            />
          </div>
        </div>

        {/* Active Tropical Systems List */}
        <div className="w-full lg:w-[38%] flex flex-col gap-3 overflow-y-auto flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#88a0c0]">
              ACTIVE TROPICAL SYSTEMS ({activeCyclones.length})
            </h2>
            <span
              onClick={() => navigate('/forecast')}
              className="text-[11px] text-[#00d4ff] font-semibold cursor-pointer hover:underline"
            >
              View All Tracks →
            </span>
          </div>

          {activeCyclones.map(c => {
            const isForecastingThis = activeCyclone?.id === c.id || selectedCycloneId === c.id;
            return (
              <div key={c.id} className="relative group">
                <CycloneCard
                  cyclone={c}
                  isSelected={isForecastingThis}
                  onViewDetails={() => handleSelectCyclone(c)}
                />
                {/* Authoritative Forecast & Broadcast Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCyclone(c);
                  }}
                  className={`absolute top-3.5 right-3.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer z-10 flex items-center gap-1 border ${
                    isForecastingThis
                      ? 'bg-[#00d4ff] text-[#050d1a] border-cyan-300 shadow-md shadow-cyan-500/25'
                      : 'bg-[#0a1628] text-cyan-300 border-[#1a3a6b] hover:bg-[#00d4ff] hover:text-[#050d1a] hover:border-cyan-400'
                  }`}
                  title={`Forecast ${c.name} & broadcast to citizen portal`}
                >
                  <Zap size={10} className={isForecastingThis ? 'text-[#050d1a]' : 'text-cyan-400'} />
                  <span>{isForecastingThis ? '✓ ACTIVE FORECAST' : 'FORECAST THIS'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM ANALYTICS ROW: GRAPH & SATELLITE IMAGES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Dynamic Intensity Curve */}
        <div className="rounded-xl p-3.5 border border-[#1a3a6b] bg-[#0d1f3c] flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
                <span>INTENSITY TREND CURVE — CYCLONE {selectedCycloneId}</span>
              </h3>
              <span className="text-[10px] text-[#88a0c0]">Historical observation + neural ensemble forecast</span>
            </div>

            {/* Range Toggle Buttons */}
            <div className="flex gap-1 p-0.5 rounded-lg bg-[#0a1628] border border-[#1a3a6b]">
              {['24h', '48h', '72h'].map(r => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer border ${
                    chartRange === r
                      ? 'bg-[#00d4ff] text-[#050d1a] border-[#00d4ff]'
                      : 'bg-transparent text-[#88a0c0] border-transparent hover:text-white'
                  }`}
                >
                  ±{r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-[160px]">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={filteredIntensity} margin={{ top: 6, right: 6, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity="0.4" />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a3a6b" />
                <XAxis dataKey="time" tick={{ fill: '#88a0c0', fontSize: 9 }} interval={2} />
                <YAxis tick={{ fill: '#88a0c0', fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x="Now" stroke="#ff9500" strokeDasharray="3 3" label={{ value: 'NOW', fill: '#ff9500', fontSize: 9 }} />
                <Area type="monotone" dataKey="wind" stroke="#00d4ff" strokeWidth={2} fill="url(#windGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Satellite Cyclone Imagery Feed */}
        <div className="rounded-xl p-3.5 border border-[#1a3a6b] bg-[#0d1f3c] flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-[#88a0c0] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
                  <span>AI SATELLITE INGESTION & CYCLONE IMAGERY</span>
                </h3>
                <span className="text-[10px] text-[#88a0c0]/80">Live multi-spectral downlinks with neural bounding boxes</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-[#0a1628] text-[#00d4ff] border border-[#1a3a6b] tracking-wider">
                NEURAL OVERLAY ON
              </span>
            </div>

            {/* Side-by-Side Professional Cyclone Image Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Image 1: INSAT-3D Thermal Infrared Convective Core */}
              <div
                onClick={() => navigate('/detection')}
                className="rounded-xl border border-[#1a3a6b] hover:border-cyan-500/60 transition-all bg-[#0a1628] p-2 cursor-pointer group flex flex-col shadow-inner"
              >
                <div className="h-28 relative rounded-lg bg-[#050d1a] overflow-hidden border border-[#1a3a6b]/80 flex items-center justify-center select-none">
                  {/* Grid Overlay */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00d4ff_1px,transparent_1px)] [background-size:12px_12px]" />

                  {/* High-Contrast Dynamic IR Cyclone Graphic */}
                  <svg viewBox="0 0 200 140" className="w-full h-full">
                    <defs>
                      <radialGradient id="irGrad" cx="52%" cy="48%" r="45%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="20%" stopColor="#ff1744" />
                        <stop offset="45%" stopColor="#ff9100" />
                        <stop offset="70%" stopColor="#ffd600" />
                        <stop offset="90%" stopColor="#00b0ff" />
                        <stop offset="100%" stopColor="#0a1628" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Outer cloud arms */}
                    <path
                      d="M 40,30 Q 80,10 130,25 Q 170,40 160,80 Q 150,120 100,125 Q 50,120 40,80 Z"
                      fill="url(#irGrad)"
                      className="cyclone-spin opacity-85 origin-[104px_68px]"
                    />
                    <path
                      d="M 60,45 Q 95,25 140,45 Q 165,75 145,105 Q 110,125 75,100 Z"
                      fill="url(#irGrad)"
                      className="cyclone-spin opacity-70 origin-[104px_68px]"
                      style={{ animationDirection: 'reverse', animationDuration: '18s' }}
                    />

                    {/* Eyewall ring */}
                    <circle cx="104" cy="68" r="18" fill="#ff1744" opacity="0.8" />
                    <circle cx="104" cy="68" r="7" fill="#050d1a" />

                    {/* Neural Detection Bounding Box */}
                    <rect x="74" y="38" width="60" height="60" fill="none" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="4 3" />
                    {/* Bounding Box Corner Marks */}
                    <path d="M 74,48 L 74,38 L 84,38" fill="none" stroke="#00d4ff" strokeWidth="2.5" />
                    <path d="M 124,38 L 134,38 L 134,48" fill="none" stroke="#00d4ff" strokeWidth="2.5" />
                    <path d="M 74,88 L 74,98 L 84,98" fill="none" stroke="#00d4ff" strokeWidth="2.5" />
                    <path d="M 124,98 L 134,98 L 134,88" fill="none" stroke="#00d4ff" strokeWidth="2.5" />

                    {/* Center Crosshair */}
                    <line x1="96" y1="68" x2="112" y2="68" stroke="#ff3b3b" strokeWidth="1.5" />
                    <line x1="104" y1="60" x2="104" y2="76" stroke="#ff3b3b" strokeWidth="1.5" />
                  </svg>

                  {/* Telemetry HUD Badges */}
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded font-bold bg-black/80 text-emerald-400 border border-emerald-500/40">
                      EYE 94.2%
                    </span>
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-black/80 text-cyan-300">
                      -75°C
                    </span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 text-[8px] font-mono text-slate-300 bg-black/80 px-1 rounded border border-[#1a3a6b]">
                    15.4°N, 87.2°E
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-[11px] group-hover:text-[#00d4ff] transition-colors flex items-center gap-1.5">
                      <span>INSAT-3D Thermal IR</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    </div>
                    <div className="text-[10px] text-[#88a0c0] truncate">Cyclone DANA Convective Core</div>
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400 font-bold">10.8µm</span>
                </div>
              </div>

              {/* Image 2: INSAT-3DR Multispectral Spiral Cloud Bands */}
              <div
                onClick={() => navigate('/satellite')}
                className="rounded-xl border border-[#1a3a6b] hover:border-cyan-500/60 transition-all bg-[#0a1628] p-2 cursor-pointer group flex flex-col shadow-inner"
              >
                <div className="h-28 relative rounded-lg bg-[#050d1a] overflow-hidden border border-[#1a3a6b]/80 flex items-center justify-center select-none">
                  {/* Grid Overlay */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00d4ff_1px,transparent_1px)] [background-size:12px_12px]" />

                  {/* High-Contrast Visible Spectrum Cyclone Graphic */}
                  <svg viewBox="0 0 200 140" className="w-full h-full">
                    <defs>
                      <radialGradient id="visGrad" cx="50%" cy="50%" r="48%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="35%" stopColor="#e0f2fe" stopOpacity="0.8" />
                        <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#0369a1" stopOpacity="0.1" />
                      </radialGradient>
                    </defs>

                    {/* Swirling cyclone cloud arms */}
                    <path
                      d="M 50,25 Q 90,5 140,20 Q 180,45 170,85 Q 155,125 105,130 Q 45,120 35,75 Z"
                      fill="url(#visGrad)"
                      className="cyclone-spin opacity-90 origin-[100px_70px]"
                    />
                    <path
                      d="M 65,40 Q 105,20 150,40 Q 170,75 150,110 Q 105,135 65,105 Z"
                      fill="url(#visGrad)"
                      className="cyclone-spin opacity-65 origin-[100px_70px]"
                      style={{ animationDirection: 'reverse', animationDuration: '22s' }}
                    />

                    {/* Central Dense Overcast (CDO) Core */}
                    <circle cx="100" cy="70" r="22" fill="#ffffff" opacity="0.9" />
                    <circle cx="100" cy="70" r="11" fill="#bae6fd" opacity="0.9" />

                    {/* Neural Detection Bounding Box */}
                    <rect x="65" y="35" width="70" height="70" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3" />
                    {/* Corner Reticles */}
                    <path d="M 65,45 L 65,35 L 75,35" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                    <path d="M 125,35 L 135,35 L 135,45" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                    <path d="M 65,95 L 65,105 L 75,105" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                    <path d="M 125,105 L 135,105 L 135,95" fill="none" stroke="#38bdf8" strokeWidth="2.5" />

                    {/* Center Crosshair */}
                    <line x1="92" y1="70" x2="108" y2="70" stroke="#0284c7" strokeWidth="1.5" />
                    <line x1="100" y1="62" x2="100" y2="78" stroke="#0284c7" strokeWidth="1.5" />
                  </svg>

                  {/* Telemetry HUD Badges */}
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded font-bold bg-black/80 text-cyan-400 border border-cyan-500/40">
                      CDO 89.7%
                    </span>
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-black/80 text-sky-300">
                      ALBEDO 0.82
                    </span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 text-[8px] font-mono text-slate-300 bg-black/80 px-1 rounded border border-[#1a3a6b]">
                    18.2°N, 64.5°E
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-[11px] group-hover:text-[#00d4ff] transition-colors flex items-center gap-1.5">
                      <span>INSAT-3DR Multispectral</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    </div>
                    <div className="text-[10px] text-[#88a0c0] truncate">Outer Convective Cloud Shield</div>
                  </div>
                  <span className="text-[9px] font-mono text-sky-400 font-bold">0.65µm</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/satellite')}
            className="w-full mt-2.5 text-xs py-2 rounded-xl font-bold border border-[#1a3a6b] text-[#00d4ff] bg-[#0a1628] hover:bg-[#00d4ff] hover:text-[#050d1a] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Open High-Resolution Satellite Console →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
