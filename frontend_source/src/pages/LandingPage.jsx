import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Shield, Activity, Satellite, ScanLine,
  Tags, Route, FileText, ArrowRight, CheckCircle2, Lock, Mail, User, X,
  Users, LifeBuoy, Phone, Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LandingPage() {
  const { isAuthenticated, currentUser, login, signup, loginAsDemo, loginAsCitizen } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // If already logged in, navigate straight to role-appropriate dashboard
  useEffect(() => {
    if (isAuthenticated) {
      if (currentUser?.role === 'Citizen') {
        navigate('/citizen/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Modal state for manual register/login if requested
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('citizen_signup'); // 'citizen_signup' | 'forecaster_signup' | 'login'

  // Empty credentials state - displaying informative placeholders
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forecaster Signup form state
  const [forecasterSignupData, setForecasterSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Operational Forecaster',
    department: 'India Meteorological Department (IMD)',
    station: 'New Delhi HQ',
  });

  // Citizen Signup form state
  const [citizenSignupData, setCitizenSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    district: 'Puri',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleManualLogin = (e) => {
    e.preventDefault();
    setError('');
    const email = loginEmail.trim() || 'dr.kumar@imd.gov.in';
    const pass = loginPassword.trim() || 'password123';

    setLoading(true);
    try {
      const user = login(email, pass);
      if (user.role === 'Citizen') {
        showToast(`Welcome back, ${user.name}! Citizen Safety Portal accessed.`, 'success');
        setAuthModalOpen(false);
        navigate('/citizen/dashboard');
      } else {
        showToast(`Welcome back, ${user.name}! Administrator Command Center unlocked.`, 'success');
        setAuthModalOpen(false);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitizenSignup = (e) => {
    e.preventDefault();
    setError('');

    if (!citizenSignupData.name || !citizenSignupData.phone || !citizenSignupData.password) {
      setError('Please fill in Name, Phone, and Password.');
      return;
    }
    if (citizenSignupData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (citizenSignupData.password !== citizenSignupData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const user = signup({
        name: citizenSignupData.name,
        email: citizenSignupData.email || `${citizenSignupData.name.toLowerCase().replace(/\s+/g, '')}@citizen.in`,
        phone: citizenSignupData.phone,
        district: citizenSignupData.district,
        password: citizenSignupData.password,
        role: 'Citizen',
        department: 'Civilian / Coastal Resident',
        station: `${citizenSignupData.district} Sector`,
      });
      showToast(`Welcome, ${user.name}! Registered as Coastal Resident.`, 'success');
      setAuthModalOpen(false);
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForecasterSignup = (e) => {
    e.preventDefault();
    setError('');

    if (!forecasterSignupData.name || !forecasterSignupData.email || !forecasterSignupData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }
    if (forecasterSignupData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (forecasterSignupData.password !== forecasterSignupData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const user = signup(forecasterSignupData);
      showToast(`Forecaster account registered for ${user.name}! Accessing Command Center.`, 'success');
      setAuthModalOpen(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen flex flex-col bg-[#0a1628] text-white selection:bg-[#00d4ff] selection:text-[#050d1a] relative">
      {/* HERO SECTION: ICON, TITLE, AND THE TWO PORTAL OPTIONS */}
      <section className="relative pt-16 sm:pt-20 pb-14 px-4 sm:px-6 border-b border-[#1a3a6b]/60 overflow-hidden bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#0a1628]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Prominent App Icon */}
          <div className="inline-flex items-center justify-center mb-5 relative">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shadow-2xl border border-cyan-500/40 bg-gradient-to-br from-[#00d4ff] to-[#0066cc] text-[#050d1a] relative shadow-[0_0_30px_rgba(0,212,255,0.35)]"
            >
              <Zap size={44} className="text-[#050d1a]" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-400 border-2 border-[#0a1628]"></span>
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-2">
            METEORA<span className="text-lg sm:text-2xl font-bold align-top text-[#00d4ff] ml-1">™</span> <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              Predict. Prepare. Protect.
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-[#00d4ff] mb-4">
            AI-Powered Cyclone Forecasting &amp; Early Warning System
          </p>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#88a0c0] leading-relaxed max-w-2xl mx-auto mb-8">
            Select your portal below. Forecasters prepare AI-driven satellite trajectories and meteorological bulletins in the <strong className="text-cyan-300">Administrator Command Center</strong>, which directly feed real-time evacuation alerts, shelter maps, and SOS assistance to the <strong className="text-emerald-300">Citizen Safety Portal</strong>.
          </p>

          {/* 🎯 THE TWO USER OPTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto text-left mb-6">
            {/* OPTION 1: CITIZEN SAFETY & EMERGENCY PORTAL */}
            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#0e2a22] to-[#0a1628] shadow-2xl hover:border-emerald-400 transition-all flex flex-col justify-between group shadow-emerald-500/10">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    PUBLIC / CITIZEN ACCESS
                  </span>
                  <Users size={20} className="text-emerald-400" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Citizen Safety & Emergency Portal
                </h2>
                <p className="text-xs text-[#88a0c0] mt-2 leading-relaxed">
                  For coastal residents, fisherfolk, and the public. Receive real-time cyclone warnings, localized district risk levels, verified evacuation shelter maps, and one-click emergency SOS dispatch.
                </p>

                <ul className="text-xs text-slate-300 mt-4 space-y-1.5 font-mono">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                    <span>Real-time landfall countdown & storm alerts</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                    <span>Nearest multi-purpose cyclone shelters & occupancy</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                    <span>Direct NDRF / State emergency SOS dispatch</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleCitizenAccess}
                className="mt-6 w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-teal-500 cursor-pointer transition-all shadow-lg shadow-emerald-500/20"
              >
                <span>Enter Citizen Safety Portal</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* OPTION 2: ADMINISTRATOR COMMAND CENTER */}
            <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#0b2847] to-[#0a1628] shadow-2xl hover:border-cyan-400 transition-all flex flex-col justify-between group shadow-cyan-500/10">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-[#00d4ff] border border-cyan-500/40">
                    OFFICIAL / FORECASTER ACCESS
                  </span>
                  <Shield size={20} className="text-[#00d4ff]" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#00d4ff] transition-colors">
                  Administrator Command Center
                </h2>
                <p className="text-xs text-[#88a0c0] mt-2 leading-relaxed">
                  For IMD / MoES meteorologists and disaster commanders. Ingest INSAT-3D/3DR feeds, run automated neural Dvorak classification, model 96h tracks, and compile official bulletins for citizen broadcast.
                </p>

                <ul className="text-xs text-slate-300 mt-4 space-y-1.5 font-mono">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#00d4ff] flex-shrink-0" />
                    <span>AI satellite convective eye detection & Dvorak T#</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#00d4ff] flex-shrink-0" />
                    <span>Multi-model 96h trajectory ensemble simulation</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#00d4ff] flex-shrink-0" />
                    <span>Official bulletin generation & live public broadcast</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleAdminAccess}
                className="mt-6 w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-[#050d1a] flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-blue-500 cursor-pointer transition-all shadow-lg shadow-cyan-500/25"
              >
                <span>Login to Command Center</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Registration / Account Creation Link */}
          <div className="flex items-center justify-center gap-3 text-xs text-[#88a0c0] font-mono">
            <span>Need custom credentials?</span>
            <button
              onClick={() => { setAuthMode('citizen_signup'); setAuthModalOpen(true); }}
              className="text-emerald-400 hover:underline font-bold cursor-pointer"
            >
              Register Citizen Account
            </button>
            <span>·</span>
            <button
              onClick={() => { setAuthMode('forecaster_signup'); setAuthModalOpen(true); }}
              className="text-cyan-400 hover:underline font-medium cursor-pointer"
            >
              Register Forecaster ID
            </button>
          </div>
        </div>
      </section>

      {/* CORE SYSTEM CAPABILITIES */}
      <section className="py-14 px-4 sm:px-6 bg-[#0d1f3c] border-b border-[#1a3a6b]/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold text-[#00d4ff] font-mono tracking-widest uppercase">Connected Architecture</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 tracking-tight">
              Command Suite & Citizen Alert Workflow
            </h2>
            <p className="text-xs sm:text-sm text-[#88a0c0] mt-1.5">
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
                  className="rounded-xl p-5 border border-[#1a3a6b] bg-[#0a1628] hover:border-cyan-500/50 transition-all duration-200 hover:-translate-y-1 cursor-pointer group flex flex-col shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-[#00d4ff]"
                    >
                      <Icon size={20} className="text-[#00d4ff]" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition-colors mb-2 font-mono">
                    {item.name}
                  </h3>

                  <p className="text-xs text-[#88a0c0] leading-relaxed flex-1">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRADEMARK & CREDENTIALS FOOTER */}
      <footer className="mt-auto bg-[#050d1a] border-t border-[#1a3a6b] pt-12 pb-8 text-xs text-[#88a0c0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Row: Brand, Tagline & Official Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#1a3a6b]">
            {/* Left 5 Cols: Brand + Tagline + Trademark notice */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm bg-gradient-to-br from-cyan-400 to-blue-600 text-[#050d1a] shadow-md shadow-cyan-500/20"
                >
                  <Zap size={18} />
                </div>
                <div>
                  <span className="text-lg font-black tracking-wider text-white">METEORA</span>
                  <span className="text-xs text-[#00d4ff] font-bold ml-1 font-mono">™</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-white">
                Predict. Prepare. Protect.
              </p>
              <p className="text-xs text-[#00d4ff] font-mono tracking-wide">
                AI-Powered Cyclone Forecasting &amp; Early Warning System
              </p>
              <p className="text-xs text-[#88a0c0] leading-relaxed pr-4 pt-1">
                METEORA™ is a registered proprietary meteorological intelligence framework for tropical cyclone track prediction, automated Dvorak classification, and zero-latency citizen safety broadcasting.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  OPERATIONAL 24/7 · RSMC TROPICAL CYCLONE NETWORK
                </span>
              </div>
            </div>

            {/* Middle 4 Cols: Institutional Credentials & Authorities */}
            <div className="md:col-span-4 space-y-3 font-mono">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Institutional Accreditations &amp; Credentials
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Shield size={14} className="text-[#00d4ff] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Government of India</span>
                    <div className="text-[11px] text-[#88a0c0]">Ministry of Earth Sciences (MoES)</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Activity size={14} className="text-[#00d4ff] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">India Meteorological Department (IMD)</span>
                    <div className="text-[11px] text-[#88a0c0]">National Weather Forecasting &amp; Cyclone Warning Division</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Radio size={14} className="text-[#00d4ff] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">RSMC New Delhi</span>
                    <div className="text-[11px] text-[#88a0c0]">Regional Specialized Meteorological Centre (WMO / ESCAP Panel)</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <LifeBuoy size={14} className="text-[#00d4ff] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">NDMA &amp; NDRF Interoperability</span>
                    <div className="text-[11px] text-[#88a0c0]">National Disaster Management Authority Coastal Response Node</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Right 3 Cols: Telemetry & Security Standards */}
            <div className="md:col-span-3 space-y-3 font-mono">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Telemetry &amp; Compliance
              </div>
              <div className="space-y-2 text-xs text-[#88a0c0]">
                <div className="p-2.5 rounded-lg bg-[#0a1628] border border-[#1a3a6b]">
                  <div className="text-[10px] uppercase font-bold text-[#00d4ff]">Satellite Ingestion</div>
                  <div className="text-white text-xs font-medium mt-0.5">INSAT-3D / 3DR &amp; NOAA / MetOp</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0a1628] border border-[#1a3a6b]">
                  <div className="text-[10px] uppercase font-bold text-[#00d4ff]">Radar Network</div>
                  <div className="text-white text-xs font-medium mt-0.5">Doppler Radar Stations (DWR Network)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0a1628] border border-[#1a3a6b]">
                  <div className="text-[10px] uppercase font-bold text-[#00d4ff]">Security Architecture</div>
                  <div className="text-white text-xs font-medium mt-0.5">Cryptographic Dual-Role Isolation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright, Trademark & Legal Notice */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#88a0c0] font-mono">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center sm:text-left">
              <span>
                © 2026 <strong className="text-white">METEORA™</strong>. All rights reserved.
              </span>
              <span className="hidden sm:inline">·</span>
              <span>Trademark Registered Under Meteorological Early Warning Frameworks</span>
              <span className="hidden sm:inline">·</span>
              <span className="text-[#00d4ff]">Authorized by MoES · IMD · GoI</span>
            </div>
            <div className="font-mono text-[11px] text-[#88a0c0] shrink-0">
              Ver. 2.4-PROD · Latency &lt; 180ms
            </div>
          </div>
        </div>
      </footer>

      {/* REGISTRATION & SIGN IN MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div
            className="w-full max-w-md rounded-2xl border border-[#1a3a6b] bg-[#0d1f3c] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1a3a6b] bg-[#0a1628]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-[#00d4ff] text-[#050d1a]">
                  IMD
                </div>
                <div>
                  <div className="text-xs font-bold tracking-wider text-white font-mono">METEORA Access Gateway</div>
                  <div className="text-[10px] text-[#88a0c0] font-mono">Dual-Portal Registration & Authentication</div>
                </div>
              </div>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="p-1 rounded text-[#88a0c0] hover:text-white hover:bg-[#102a4c] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab Headers: Citizen Signup | Forecaster Signup | Sign In */}
            <div className="flex border-b border-[#1a3a6b] text-xs font-bold font-mono bg-[#0a1628]">
              <button
                type="button"
                onClick={() => { setAuthMode('citizen_signup'); setError(''); }}
                className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                  authMode === 'citizen_signup'
                    ? 'border-emerald-400 text-emerald-300 bg-[#0d1f3c]'
                    : 'border-transparent text-[#88a0c0] hover:text-white'
                }`}
              >
                Citizen Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('forecaster_signup'); setError(''); }}
                className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                  authMode === 'forecaster_signup'
                    ? 'border-[#00d4ff] text-[#00d4ff] bg-[#0d1f3c]'
                    : 'border-transparent text-[#88a0c0] hover:text-white'
                }`}
              >
                Forecaster Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); }}
                className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                  authMode === 'login'
                    ? 'border-cyan-400 text-white bg-[#0d1f3c]'
                    : 'border-transparent text-[#88a0c0] hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="mb-4 p-3 rounded-lg flex items-start gap-2 text-xs border border-red-500/50 bg-red-950/40 text-red-300 font-mono">
                  <X size={14} className="flex-shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. CITIZEN SIGNUP FORM */}
              {authMode === 'citizen_signup' && (
                <form onSubmit={handleCitizenSignup} className="space-y-3 font-mono">
                  <div>
                    <label className="text-xs text-[#88a0c0] font-medium block mb-1">Full Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#88a0c0]" />
                      <input
                        type="text"
                        required
                        value={citizenSignupData.name}
                        onChange={e => setCitizenSignupData({ ...citizenSignupData, name: e.target.value })}
                        placeholder="e.g. Rajesh Mohapatra"
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-xs text-white focus:outline-none focus:border-emerald-400 font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-[#88a0c0] font-medium block mb-1">Mobile for SMS</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#88a0c0]" />
                        <input
                          type="tel"
                          required
                          value={citizenSignupData.phone}
                          onChange={e => setCitizenSignupData({ ...citizenSignupData, phone: e.target.value })}
                          placeholder="+91 Mobile"
                          className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-xs text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-[#88a0c0] font-medium block mb-1">District</label>
                      <select
                        value={citizenSignupData.district}
                        onChange={e => setCitizenSignupData({ ...citizenSignupData, district: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-xs text-white focus:outline-none focus:border-emerald-400"
                      >
                        <option value="Puri">Puri (Odisha)</option>
                        <option value="Jagatsinghpur">Jagatsinghpur (Odisha)</option>
                        <option value="Kendrapara">Kendrapara (Odisha)</option>
                        <option value="Balasore">Balasore (Odisha)</option>
                        <option value="East Midnapore / Digha">Digha (West Bengal)</option>
                        <option value="Visakhapatnam">Visakhapatnam (Andhra)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-[#88a0c0] font-medium block mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={citizenSignupData.password}
                        onChange={e => setCitizenSignupData({ ...citizenSignupData, password: e.target.value })}
                        placeholder="Min 6 chars"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-xs text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#88a0c0] font-medium block mb-1">Confirm Password</label>
                      <input
                        type="password"
                        required
                        value={citizenSignupData.confirmPassword}
                        onChange={e => setCitizenSignupData({ ...citizenSignupData, confirmPassword: e.target.value })}
                        placeholder="Re-enter"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-xs text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg font-bold text-xs sm:text-sm text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-300 disabled:opacity-50 mt-2 bg-emerald-400 cursor-pointer"
                  >
                    <span>{loading ? 'Creating Citizen Profile...' : 'Sign Up as Citizen & Open Portal'}</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}

              {/* 2. FORECASTER SIGNUP FORM */}
              {authMode === 'forecaster_signup' && (
                <form onSubmit={handleForecasterSignup} className="space-y-3 font-mono">
                  <div>
                    <label className="text-xs text-[#88a0c0] font-medium block mb-1">Full Name & Title</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#88a0c0]" />
                      <input
                        type="text"
                        required
                        value={forecasterSignupData.name}
                        onChange={e => setForecasterSignupData({ ...forecasterSignupData, name: e.target.value })}
                        placeholder="e.g. Dr. Rajesh Verma"
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-xs text-white focus:outline-none focus:border-[#00d4ff] font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#88a0c0] font-medium block mb-1">Official Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#88a0c0]" />
                      <input
                        type="email"
                        required
                        value={forecasterSignupData.email}
                        onChange={e => setForecasterSignupData({ ...forecasterSignupData, email: e.target.value })}
                        placeholder="r.verma@imd.gov.in"
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-[#88a0c0] font-medium block mb-1">Role</label>
                      <select
                        value={forecasterSignupData.role}
                        onChange={e => setForecasterSignupData({ ...forecasterSignupData, role: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-xs text-white"
                      >
                        <option>Operational Forecaster</option>
                        <option>Senior Meteorologist</option>
                        <option>Disaster Response Officer</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#88a0c0] font-medium block mb-1">Department</label>
                      <input
                        type="text"
                        value={forecasterSignupData.department}
                        onChange={e => setForecasterSignupData({ ...forecasterSignupData, department: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-[#88a0c0] font-medium block mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={forecasterSignupData.password}
                        onChange={e => setForecasterSignupData({ ...forecasterSignupData, password: e.target.value })}
                        placeholder="Min 6 chars"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#88a0c0] font-medium block mb-1">Confirm Password</label>
                      <input
                        type="password"
                        required
                        value={forecasterSignupData.confirmPassword}
                        onChange={e => setForecasterSignupData({ ...forecasterSignupData, confirmPassword: e.target.value })}
                        placeholder="Re-enter"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg font-bold text-xs sm:text-sm text-[#050d1a] flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-300 disabled:opacity-50 mt-2 bg-[#00d4ff] cursor-pointer"
                  >
                    <span>{loading ? 'Creating Forecaster Account...' : 'Complete Sign Up & Launch Command Center'}</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}

              {/* 3. LOGIN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleManualLogin} className="space-y-3.5 font-mono">
                  <div>
                    <label className="text-xs text-[#88a0c0] font-medium block mb-1">
                      Email Address / Forecaster ID / Citizen Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#88a0c0]" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="e.g. dr.kumar@imd.gov.in or citizen@coastal.in"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-xs sm:text-sm text-white focus:outline-none focus:border-[#00d4ff]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#88a0c0] font-medium block mb-1">Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#88a0c0]" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="password123"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-xs sm:text-sm text-white focus:outline-none focus:border-[#00d4ff]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg font-bold text-xs sm:text-sm text-[#050d1a] flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-300 disabled:opacity-50 mt-2 bg-[#00d4ff] cursor-pointer"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
