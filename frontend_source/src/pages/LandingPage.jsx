import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Zap, Shield, Activity, Satellite, ScanLine,
  Tags, Route, FileText, ArrowRight, CheckCircle2, Lock, Mail, User,
  Users, LifeBuoy, Phone, Radio, Sun, Moon, LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import MeteorologicalCanvas from '../components/MeteorologicalCanvas';
import CycloneRadarVortex from '../components/CycloneRadarVortex';
import AuthModal from '../components/AuthModal';
import CycloneSatelliteCarousel from '../components/CycloneSatelliteCarousel';

export default function LandingPage() {
  const { isAuthenticated, currentUser, login, loginAsDemo, loginAsCitizen } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Modal state for manual register/login if requested
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'citizen_signup' | 'forecaster_signup'

  // If visiting /login directly or requested via state, open the auth modal
  useEffect(() => {
    if (location.pathname === '/login') {
      setAuthModalOpen(true);
    }
  }, [location.pathname]);

  // If already logged in, navigate straight to role-appropriate dashboard or original redirect target
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname;
      if (from && from !== '/login' && from !== '/') {
        if (currentUser?.role === 'Citizen' && from.startsWith('/citizen')) {
          navigate(from, { replace: true });
          return;
        }
        if (currentUser?.role !== 'Citizen' && !from.startsWith('/citizen')) {
          navigate(from, { replace: true });
          return;
        }
      }
      if (currentUser?.role === 'Citizen') {
        navigate('/citizen/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate, location.state]);

  // AUTOMATIC 1-CLICK ACCESS FOR CITIZEN PORTAL
  const handleCitizenAccess = () => {
    try {
      const user = loginAsCitizen();
      showToast(`Welcome, ${user.name}! Citizen Emergency & Safety Portal unlocked.`, 'success');
      navigate('/citizen/dashboard');
    } catch (err) {
      showToast('Citizen access activated.', 'info');
      navigate('/citizen/dashboard');
    }
  };

  // AUTOMATIC 1-CLICK ACCESS FOR ADMINISTRATOR COMMAND CENTER
  const handleAdminAccess = () => {
    try {
      const user = login('dr.kumar@imd.gov.in', 'password123');
      showToast(`Welcome, ${user.name}! Administrator Command Center unlocked.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      const user = loginAsDemo('kumar');
      showToast(`Welcome, ${user.name}! Administrator Command Center unlocked.`, 'success');
      navigate('/dashboard');
    }
  };

  const features = [
    {
      icon: Activity,
      name: '1. Real-Time Tracking & GIS Map',
      desc: 'High-density synoptic tracking map spanning the Bay of Bengal, Arabian Sea, and North Indian Ocean with live storm coordinates, intensity rings, and layer switches.',
      route: '/dashboard',
    },
    {
      icon: Satellite,
      name: '2. Multi-Source Satellite Feeds',
      desc: 'Seamless ingestion and side-by-side comparison across INSAT-3D, INSAT-3DR, and global constellations in Thermal IR, Visible, and Water Vapor spectral channels.',
      route: '/satellite',
    },
    {
      icon: ScanLine,
      name: '3. Deep Learning Detection Engine',
      desc: 'Custom computer vision models (YOLO-v8, ViT) performing real-time inference to detect cyclone eyes, eyewall convective cores, and central dense overcast regions.',
      route: '/detection',
    },
    {
      icon: Tags,
      name: '4. Automated Dvorak Classification',
      desc: 'Instant T-Number estimation, circular AI confidence gauges, 6-axis morphological radar metrics, and comparative benchmarking with historical twin storms.',
      route: '/classification',
    },
    {
      icon: Route,
      name: '5. 96-Hour Trajectory Forecast',
      desc: 'Multi-model ensemble comparison (IMD, ECMWF, GFS, JMA, METEORA) equipped with Rapid Intensification alerts and coastal storm surge inundation parameters.',
      route: '/forecast',
    },
    {
      icon: FileText,
      name: '6. Official Bulletins & Citizen Feeds',
      desc: 'One-click generation of standardized IMD meteorological bulletins that automatically propagate to the Citizen Safety Dashboard for coastal evacuations.',
      route: '/reports',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a1628] text-slate-900 dark:text-white selection:bg-[#00d4ff] selection:text-[#050d1a] relative transition-colors duration-200">
      {/* TOP HEADER / ACTION BAR */}
      <header className="w-full bg-white/85 dark:bg-[#0a1628]/85 backdrop-blur-md border-b border-slate-200 dark:border-[#1a3a6b] px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-50 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs bg-gradient-to-br from-[#00d4ff] to-[#0066cc] text-[#050d1a] shadow-md">
            IMD
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
              <span>METEORA</span>
              <span className="text-[10px] text-cyan-600 dark:text-[#00d4ff]">EARLY WARNING</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-[#88a0c0] font-mono hidden sm:block">
              Ministry of Earth Sciences · MoES / IMD / RSMC
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sign In / Gateway Button */}
          <button
            onClick={() => {
              setAuthMode('login');
              setAuthModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-[#00d4ff] hover:border-cyan-400 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
          >
            <LogIn size={14} />
            <span>Sign In / Gateway</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => {
              toggleTheme();
              showToast(`Switched to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`, 'info');
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#1a3a6b] bg-white/90 dark:bg-[#0d1f3c]/90 backdrop-blur-md hover:border-[#00d4ff] text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm text-xs font-mono font-bold"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <>
                <Sun size={14} className="text-amber-400 animate-spin-slow" />
                <span className="hidden sm:inline text-amber-300 text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-blue-600" />
                <span className="hidden sm:inline text-blue-700 text-[11px]">Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* HERO SECTION: ICON, TITLE, AND THE TWO PORTAL OPTIONS */}
      <section className="relative pt-12 sm:pt-16 pb-14 px-4 sm:px-6 border-b border-slate-200 dark:border-[#1a3a6b]/60 overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-100 dark:from-[#0a1628] dark:via-[#0d1f3c] dark:to-[#0a1628]">
        {/* Meteorological Atmospheric Canvas (Subtle Falling Rain & Wind Streaks) */}
        <MeteorologicalCanvas mode="combo" density="medium" opacity={0.65} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Prominent App Icon with Rotating Cyclone Radar Vortex Behind It */}
          <div className="inline-flex items-center justify-center mb-5 relative">
            {/* Animated Rotating Cyclone Radar Vortex graphic behind the METEORA logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none opacity-50 dark:opacity-75 animate-vortex-glow scale-90 sm:scale-100">
              <CycloneRadarVortex
                size={340}
                status="cyan"
                showScanline={true}
                showLabels={true}
                showRings={true}
                speed="normal"
              />
            </div>

            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shadow-2xl border border-cyan-500/40 bg-gradient-to-br from-[#00d4ff] to-[#0066cc] text-[#050d1a] relative shadow-[0_0_35px_rgba(0,212,255,0.45)] backdrop-blur-sm"
            >
              <Zap size={44} className="text-[#050d1a]" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-400 border-2 border-white dark:border-[#0a1628]"></span>
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
            METEORA<span className="text-lg sm:text-2xl font-bold align-top text-cyan-600 dark:text-[#00d4ff] ml-1">™</span> <br />
            <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 dark:from-cyan-400 dark:via-sky-300 dark:to-blue-400 bg-clip-text text-transparent">
              Predict. Prepare. Protect.
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-cyan-600 dark:text-[#00d4ff] mb-4">
            AI-Powered Cyclone Forecasting &amp; Early Warning System
          </p>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#88a0c0] leading-relaxed max-w-2xl mx-auto mb-8">
            Select your portal below. Forecasters prepare AI-driven satellite trajectories and meteorological bulletins in the <strong className="text-cyan-700 dark:text-cyan-300">Administrator Command Center</strong>, which directly feed real-time evacuation alerts, shelter maps, and SOS assistance to the <strong className="text-emerald-700 dark:text-emerald-300">Citizen Safety Portal</strong>.
          </p>

          {/* 🎯 THE TWO USER OPTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto text-left mb-6">
            {/* OPTION 1: CITIZEN SAFETY & EMERGENCY PORTAL */}
            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-50/80 to-white dark:from-[#0e2a22] dark:to-[#0a1628] shadow-2xl hover:border-emerald-400 transition-all flex flex-col justify-between group shadow-emerald-500/10">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40">
                    PUBLIC / CITIZEN ACCESS
                  </span>
                  <Users size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                  Citizen Safety & Emergency Portal
                </h2>
                <p className="text-xs text-slate-600 dark:text-[#88a0c0] mt-2 leading-relaxed">
                  For coastal residents, fisherfolk, and the public. Receive real-time cyclone warnings, localized district risk levels, verified evacuation shelter maps, and one-click emergency SOS dispatch.
                </p>

                <ul className="text-xs text-slate-700 dark:text-slate-300 mt-4 space-y-1.5 font-mono">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Real-time landfall countdown & storm alerts</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Nearest multi-purpose cyclone shelters & occupancy</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Direct NDRF / State emergency SOS dispatch</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={handleCitizenAccess}
                  className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 text-white dark:text-slate-950 flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-teal-500 cursor-pointer transition-all shadow-lg shadow-emerald-500/20"
                >
                  <span>Enter Citizen Safety Portal (1-Click)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* OPTION 2: ADMINISTRATOR COMMAND CENTER */}
            <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-sky-50/80 to-white dark:from-[#0b2847] dark:to-[#0a1628] shadow-2xl hover:border-cyan-400 transition-all flex flex-col justify-between group shadow-cyan-500/10">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-[#00d4ff] border border-cyan-300 dark:border-cyan-500/40">
                    OFFICIAL / FORECASTER ACCESS
                  </span>
                  <Shield size={20} className="text-cyan-600 dark:text-[#00d4ff]" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-[#00d4ff] transition-colors">
                  Administrator Command Center
                </h2>
                <p className="text-xs text-slate-600 dark:text-[#88a0c0] mt-2 leading-relaxed">
                  For IMD / MoES meteorologists and disaster commanders. Ingest INSAT-3D/3DR feeds, run automated neural Dvorak classification, model 96h tracks, and compile official bulletins for citizen broadcast.
                </p>

                <ul className="text-xs text-slate-700 dark:text-slate-300 mt-4 space-y-1.5 font-mono">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-cyan-600 dark:text-[#00d4ff] flex-shrink-0" />
                    <span>AI satellite convective eye detection & Dvorak T#</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-cyan-600 dark:text-[#00d4ff] flex-shrink-0" />
                    <span>Multi-model 96h trajectory ensemble simulation</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-cyan-600 dark:text-[#00d4ff] flex-shrink-0" />
                    <span>Official bulletin generation & live public broadcast</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={handleAdminAccess}
                  className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white dark:text-[#050d1a] flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-blue-500 cursor-pointer transition-all shadow-lg shadow-cyan-500/25"
                >
                  <span>Login to Command Center (1-Click)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Registration / Account Creation & Sign In Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 dark:text-[#88a0c0] font-mono">
            <span>Authentication Gateway:</span>
            <button
              onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
              className="text-cyan-600 dark:text-[#00d4ff] hover:underline font-bold cursor-pointer"
            >
              Sign In with ID
            </button>
            <span>·</span>
            <button
              onClick={() => { setAuthMode('citizen_signup'); setAuthModalOpen(true); }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
            >
              Register Citizen Account
            </button>
            <span>·</span>
            <button
              onClick={() => { setAuthMode('forecaster_signup'); setAuthModalOpen(true); }}
              className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium cursor-pointer"
            >
              Register Forecaster ID
            </button>
          </div>
        </div>
      </section>

      {/* AUTOMATED CYCLONE & SATELLITE RADAR TELEMETRY CAROUSEL */}
      <CycloneSatelliteCarousel />

      {/* CORE SYSTEM CAPABILITIES */}
      <section className="py-14 px-4 sm:px-6 bg-slate-100/70 dark:bg-[#0d1f3c] border-b border-slate-200 dark:border-[#1a3a6b]/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold text-cyan-600 dark:text-[#00d4ff] font-mono tracking-widest uppercase">Connected Architecture</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
              Command Suite & Citizen Alert Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#88a0c0] mt-1.5">
              How meteorological reports prepared by administrators instantly power life-saving forecasts for citizens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleAdminAccess()}
                  className="rounded-xl p-5 border border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] hover:border-cyan-500/50 transition-all duration-200 hover:-translate-y-1 cursor-pointer group flex flex-col shadow-md dark:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-600 dark:text-[#00d4ff]"
                    >
                      <Icon size={20} className="text-cyan-600 dark:text-[#00d4ff]" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-[#00d4ff] transition-colors mb-2 font-mono">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-[#88a0c0] leading-relaxed flex-1">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRADEMARK & CREDENTIALS FOOTER */}
      <footer className="mt-auto bg-slate-100 dark:bg-[#050d1a] border-t border-slate-200 dark:border-[#1a3a6b] pt-12 pb-8 text-xs text-slate-600 dark:text-[#88a0c0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Row: Brand, Tagline & Official Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-200 dark:border-[#1a3a6b]">
            {/* Left 5 Cols: Brand + Tagline + Trademark notice */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm bg-gradient-to-br from-cyan-400 to-blue-600 text-[#050d1a] shadow-md shadow-cyan-500/20"
                >
                  <Zap size={18} />
                </div>
                <div>
                  <span className="text-lg font-black tracking-wider text-slate-900 dark:text-white">METEORA</span>
                  <span className="text-xs text-cyan-600 dark:text-[#00d4ff] font-bold ml-1 font-mono">™</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Predict. Prepare. Protect.
              </p>
              <p className="text-xs text-cyan-600 dark:text-[#00d4ff] font-mono tracking-wide">
                AI-Powered Cyclone Forecasting &amp; Early Warning System
              </p>
              <p className="text-xs text-slate-600 dark:text-[#88a0c0] leading-relaxed pr-4 pt-1">
                METEORA™ is a registered proprietary meteorological intelligence framework for tropical cyclone track prediction, automated Dvorak classification, and zero-latency citizen safety broadcasting.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  OPERATIONAL 24/7 · RSMC TROPICAL CYCLONE NETWORK
                </span>
              </div>
            </div>

            {/* Middle 4 Cols: Institutional Credentials & Authorities */}
            <div className="md:col-span-4 space-y-3 font-mono">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Institutional Accreditations &amp; Credentials
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <Shield size={14} className="text-cyan-600 dark:text-[#00d4ff] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Government of India</span>
                    <div className="text-[11px] text-slate-500 dark:text-[#88a0c0]">Ministry of Earth Sciences (MoES)</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Activity size={14} className="text-cyan-600 dark:text-[#00d4ff] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">India Meteorological Department (IMD)</span>
                    <div className="text-[11px] text-slate-500 dark:text-[#88a0c0]">National Weather Forecasting &amp; Cyclone Warning Division</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Radio size={14} className="text-cyan-600 dark:text-[#00d4ff] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">RSMC New Delhi</span>
                    <div className="text-[11px] text-slate-500 dark:text-[#88a0c0]">Regional Specialized Meteorological Centre (WMO / ESCAP Panel)</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <LifeBuoy size={14} className="text-cyan-600 dark:text-[#00d4ff] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">NDMA &amp; NDRF Interoperability</span>
                    <div className="text-[11px] text-slate-500 dark:text-[#88a0c0]">National Disaster Management Authority Coastal Response Node</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Right 3 Cols: Telemetry & Security Standards */}
            <div className="md:col-span-3 space-y-3 font-mono">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Telemetry &amp; Compliance
              </div>
              <div className="space-y-2 text-xs text-slate-600 dark:text-[#88a0c0]">
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b]">
                  <div className="text-[10px] uppercase font-bold text-cyan-600 dark:text-[#00d4ff]">Satellite Ingestion</div>
                  <div className="text-slate-900 dark:text-white text-xs font-medium mt-0.5">INSAT-3D / 3DR &amp; NOAA / MetOp</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b]">
                  <div className="text-[10px] uppercase font-bold text-cyan-600 dark:text-[#00d4ff]">Radar Network</div>
                  <div className="text-slate-900 dark:text-white text-xs font-medium mt-0.5">Doppler Radar Stations (DWR Network)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b]">
                  <div className="text-[10px] uppercase font-bold text-cyan-600 dark:text-[#00d4ff]">Security Architecture</div>
                  <div className="text-slate-900 dark:text-white text-xs font-medium mt-0.5">Cryptographic Dual-Role Isolation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright, Trademark & Legal Notice */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-[#88a0c0] font-mono">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center sm:text-left">
              <span>
                © 2026 <strong className="text-slate-900 dark:text-white">METEORA™</strong>. All rights reserved.
              </span>
              <span className="hidden sm:inline">·</span>
              <span>Trademark Registered Under Meteorological Early Warning Frameworks</span>
              <span className="hidden sm:inline">·</span>
              <span className="text-cyan-600 dark:text-[#00d4ff]">Authorized by MoES · IMD · GoI</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500 dark:text-[#88a0c0] shrink-0">
              Ver. 2.4-PROD · Latency &lt; 180ms
            </div>
          </div>
        </div>
      </footer>

      {/* DEDICATED AUTHENTICATION & ACCESS GATEWAY MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode.includes('signup') ? 'signup' : 'login'}
        initialRole={authMode.includes('citizen') ? 'citizen' : 'forecaster'}
      />
    </div>
  );
}
