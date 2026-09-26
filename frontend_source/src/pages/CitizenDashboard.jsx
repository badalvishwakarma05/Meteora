import { useState, useEffect, useRef } from 'react';
import {
  Radio, FileText, MapPin, Shield, LifeBuoy, CheckSquare, Square,
  Wind, Waves, Clock, Volume2, VolumeX, Navigation, Phone, Send,
  CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight, ExternalLink,
  ChevronRight, Info, Sparkles, UserCheck, Flame, PhoneCall, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDisasterAlert } from '../context/DisasterAlertContext';
import { useToast } from '../context/ToastContext';
import { CITIZEN_TRANSLATIONS } from '../data/citizenTranslations';
import MeteorologicalCanvas from '../components/MeteorologicalCanvas';
import CycloneRadarVortex from '../components/CycloneRadarVortex';

export default function CitizenDashboard() {
  const { currentUser, updateProfile } = useAuth();
  const {
    condition,
    activeCyclone,
    activeBulletin,
    shelters,
    sosBeacons,
    dispatchSOS,
    registerSMSAlerts,
    language,
    isLiveWeatherActive,
  } = useDisasterAlert();
  const { showToast } = useToast();

  // Active translation dictionary
  const t = CITIZEN_TRANSLATIONS[language] || CITIZEN_TRANSLATIONS.English;

  // Sidebar navigation tab state: 'situation' | 'report' | 'district' | 'shelters' | 'sos' | 'checklist' | 'profile'
  const [activeTab, setActiveTab] = useState('situation');

  // Real Audible Text-To-Speech state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Profile Form state for in-page profile editing
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || 'Rajesh Mohapatra',
    phone: currentUser?.phone || '+91 98765 43210',
    email: currentUser?.email || 'citizen@coastal.in',
    district: currentUser?.district || 'Puri',
    address: currentUser?.address || 'Near Grand Road / Light House Colony',
    familyMembers: currentUser?.familyMembers || 4,
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
    setProfileEditing(false);
    showToast('Citizen profile information updated successfully.', 'success');
  };

  // Selected coastal district for localized threat checking
  const [selectedDistrict, setSelectedDistrict] = useState(
    currentUser?.district || 'Puri'
  );

  // Preparedness checklist state
  const [checklist, setChecklist] = useState({
    water: true,
    food: true,
    powerbank: true,
    medicines: false,
    documents: true,
    gasValve: false,
  });

  // SOS Form state
  const [sosData, setSosData] = useState({
    name: currentUser?.name || 'Citizen',
    phone: currentUser?.phone || '+91 98765 43210',
    district: currentUser?.district || 'Puri',
    address: 'Near Coastal Road / Light House',
    peopleCount: 4,
    needType: 'Evacuation & Medical Assistance',
  });
  const [sosSent, setSosSent] = useState(false);
  const [sosTrackingCode, setSosTrackingCode] = useState('SOS-892144');
  const [smsPhone, setSmsPhone] = useState('');

  // Handle external tab change events
  useEffect(() => {
    const handleCustomTab = (e) => {
      if (e.detail) setActiveTab(e.detail);
    };
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['situation', 'report', 'district', 'shelters', 'sos', 'checklist', 'profile'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('citizen-tab-change', handleCustomTab);
    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) handleHashChange();

    return () => {
      window.removeEventListener('citizen-tab-change', handleCustomTab);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Web Speech API Voice synthesis setup & cleanup
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoices = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', onVoices);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  // Stop audio when language or condition changes
  useEffect(() => {
    if (isPlayingAudio && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [language, condition]);

  // Real Audible Text-To-Speech Broadcast
  const handleSpeakAudio = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported on this device.', 'warning');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    const spokenScript = t.ttsScript?.[condition] || t.ttsScript?.severe || 'Emergency cyclone warning advisory.';
    const utterance = new SpeechSynthesisUtterance(spokenScript);

    const langCodes = {
      English: 'en-IN',
      Hindi: 'hi-IN',
      Bengali: 'bn-IN',
      Odia: 'or-IN',
    };

    const targetLang = langCodes[language] || 'en-IN';
    utterance.lang = targetLang;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match =
        voices.find(v => v.lang.toLowerCase() === targetLang.toLowerCase()) ||
        voices.find(v => v.lang.toLowerCase().startsWith(targetLang.split('-')[0].toLowerCase())) ||
        voices.find(v => v.lang.toLowerCase().includes('in')) ||
        voices[0];
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = (err) => {
      console.warn('Speech synthesis playback error:', err);
      setIsPlayingAudio(false);
    };

    window.speechSynthesis.speak(utterance);
    showToast(`Broadcasting official advisory in ${language}...`, 'info');
  };

  // Lamp properties based on condition - OCEANIC THEME
  const lampConfig = {
    safe: {
      color: '#00d4ff',
      lightCore: '#70e2ff',
      lightDark: '#0088cc',
      label: t.statusSafe,
      desc: t.statusSafeDesc,
      badgeBg: 'bg-cyan-500/20 text-[#00d4ff] border-cyan-500/40',
      glowShadow: '0 0 30px rgba(0, 212, 255, 0.45)',
    },
    intermediate: {
      color: '#ffd60a',
      lightCore: '#fff3b0',
      lightDark: '#cc9900',
      label: t.statusIntermediate,
      desc: t.statusIntermediateDesc,
      badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      glowShadow: '0 0 30px rgba(255, 214, 10, 0.45)',
    },
    severe: {
      color: '#ff1744',
      lightCore: '#ff6b81',
      lightDark: '#b70020',
      label: t.statusSevere,
      desc: t.statusSevereDesc,
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
      glowShadow: '0 0 45px rgba(255, 23, 68, 0.65)',
    },
  }[condition] || {
    color: '#ff1744',
    lightCore: '#ff6b81',
    lightDark: '#b70020',
    label: t.statusSevere,
    desc: t.statusSevereDesc,
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
    glowShadow: '0 0 45px rgba(255, 23, 68, 0.65)',
  };

  const affectedDistricts = activeBulletin?.affectedDistricts && activeBulletin.affectedDistricts.length > 0
    ? activeBulletin.affectedDistricts
    : [
        { name: 'Puri', state: 'Odisha', alertLevel: 'red', wind: '185 km/h', surge: '4.2m', evacuation: 'Mandatory Immediate', sheltersOpen: 48, contact: '06752-223322' },
        { name: 'Jagatsinghpur', state: 'Odisha', alertLevel: 'red', wind: '175 km/h', surge: '3.8m', evacuation: 'Mandatory Immediate', sheltersOpen: 36, contact: '06722-220088' },
        { name: 'Kendrapara', state: 'Odisha', alertLevel: 'red', wind: '165 km/h', surge: '3.5m', evacuation: 'High Priority', sheltersOpen: 42, contact: '06727-232144' },
        { name: 'Balasore', state: 'Odisha', alertLevel: 'orange', wind: '130 km/h', surge: '2.5m', evacuation: 'Standby / Low-lying', sheltersOpen: 28, contact: '06782-262100' },
        { name: 'East Midnapore / Digha', state: 'West Bengal', alertLevel: 'orange', wind: '125 km/h', surge: '2.8m', evacuation: 'Coastal lowlands', sheltersOpen: 32, contact: '03228-252200' },
        { name: 'Visakhapatnam', state: 'Andhra Pradesh', alertLevel: 'yellow', wind: '75 km/h', surge: '1.0m', evacuation: 'Cautionary watch', sheltersOpen: 20, contact: '0891-2565454' },
      ];

  const districtInfo = affectedDistricts.find(
    d => d.name?.toLowerCase().includes(selectedDistrict?.toLowerCase())
  ) || affectedDistricts[0];

  const totalTasks = Object.keys(checklist).length;
  const completedTasks = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSOSSubmit = (e) => {
    e.preventDefault();
    dispatchSOS(sosData);
    setSosTrackingCode(`SOS-${Date.now().toString().slice(-6)}`);
    setSosSent(true);
    showToast('EMERGENCY SOS DISPATCHED: Distress beacon sent to IMD & NDRF Command.', 'info', 8000);
  };

  const handleRegisterSMS = (e) => {
    e.preventDefault();
    if (!smsPhone || smsPhone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'warning');
      return;
    }
    registerSMSAlerts(smsPhone);
    setSmsPhone('');
    showToast('Subscribed to free offline SMS emergency broadcasts!', 'success');
  };

  // Sidebar navigation items
  const navItems = [
    {
      id: 'situation',
      label: t.navSituation,
      icon: Radio,
      badge: lampConfig.label,
      badgeColor: lampConfig.badgeBg,
    },
    {
      id: 'report',
      label: t.navReport,
      icon: FileText,
      badge: 'IMD',
      badgeColor: 'border border-cyan-500/40 bg-cyan-500/10 text-[#00d4ff] font-mono',
    },
    {
      id: 'district',
      label: t.navDistrict,
      icon: MapPin,
      badge: districtInfo.name,
      badgeColor: 'border border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono',
    },
    {
      id: 'shelters',
      label: t.navShelters,
      icon: Shield,
      badge: `${shelters.length} Open`,
      badgeColor: 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono',
    },
    {
      id: 'sos',
      label: t.navSOS,
      icon: LifeBuoy,
      highlight: true,
      badge: 'URGENT',
      badgeColor: 'border border-red-500/40 bg-red-500/20 text-red-300 font-mono animate-pulse',
    },
    {
      id: 'checklist',
      label: t.navChecklist,
      icon: CheckSquare,
      badge: `${progressPercent}%`,
      badgeColor: 'border border-blue-500/40 bg-blue-500/10 text-cyan-300 font-mono',
    },
    {
      id: 'profile',
      label: 'My Safety Profile',
      icon: User,
      badge: currentUser?.district || 'Puri',
      badgeColor: 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono',
    },
  ];

  return (
    <div className="flex flex-col md:flex-row flex-1 w-full h-full overflow-x-hidden md:overflow-hidden bg-slate-50 dark:bg-[#0a1628] text-slate-900 dark:text-white transition-colors duration-200">
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-full md:w-64 lg:w-72 h-auto md:h-full flex-shrink-0 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] z-20 select-none overflow-x-auto md:overflow-y-auto p-3 sm:p-4 gap-3">
        <div className="flex flex-col gap-3">
          {/* Sidebar Header */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b] shadow-sm dark:shadow-lg">
            <div className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-[#7090b0] uppercase font-bold mb-2">
              PUBLIC SAFETY NAVIGATION
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-100 dark:bg-[#102a4c] border border-slate-200 dark:border-[#1a3a6b]">
              <div
                className="w-3.5 h-3.5 rounded-full lamp-active relative flex items-center justify-center flex-shrink-0"
                style={{
                  '--lamp-color': lampConfig.color,
                  background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${lampConfig.lightCore} 40%, ${lampConfig.color} 75%, ${lampConfig.lightDark} 100%)`,
                  boxShadow: `0 0 10px ${lampConfig.color}`,
                }}
              />
              <div className="truncate font-mono">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${lampConfig.badgeBg}`}>
                  {lampConfig.label}
                </span>
                <div className="text-[10px] text-slate-500 dark:text-[#7090b0] truncate mt-1">
                  {activeCyclone?.shortName || 'CYCLONE DANA'}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Buttons */}
          <nav className="flex flex-row md:flex-col gap-1.5 p-1.5 rounded-2xl bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b] shadow-sm dark:shadow-lg font-mono overflow-x-auto md:overflow-x-visible">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    window.location.hash = item.id;
                  }}
                  className={`w-auto md:w-full flex items-center justify-between px-3 md:px-3.5 py-2.5 md:py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-700 dark:text-[#00d4ff] border border-cyan-500/40 shadow-sm dark:shadow-lg shadow-cyan-950/40'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#102a4c] hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
                    <Icon
                      size={16}
                      className={`flex-shrink-0 ${
                        isActive ? 'text-cyan-600 dark:text-[#00d4ff]' : item.highlight ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-[#7090b0]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ml-2 hidden sm:inline-block ${
                        isActive ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-[#00d4ff] border-cyan-300 dark:border-cyan-500/40' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Helplines Quick Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b] text-xs font-mono">
          <div className="text-[10px] tracking-wider text-slate-500 dark:text-[#7090b0] uppercase font-bold mb-2">
            DIRECT 24/7 HELPLINES
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
            <a
              href="tel:1078"
              className="p-1.5 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-500/20 text-center transition-colors"
            >
              NDRF 1078
            </a>
            <a
              href="tel:1070"
              className="p-1.5 rounded-lg bg-amber-100 dark:bg-orange-500/10 text-amber-800 dark:text-orange-300 border border-amber-300 dark:border-orange-500/30 hover:bg-amber-200 dark:hover:bg-orange-500/20 text-center transition-colors"
            >
              SEOC 1070
            </a>
            <a
              href="tel:1554"
              className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 hover:bg-cyan-200 dark:hover:bg-cyan-500/20 text-center transition-colors"
            >
              Coast 1554
            </a>
            <a
              href="tel:112"
              className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 hover:bg-blue-200 dark:hover:bg-blue-500/20 text-center transition-colors"
            >
              Police 112
            </a>
          </div>
        </div>
      </aside>

      {/* EXPANSIVE MAIN WORKSPACE */}
      <main className="flex-1 h-full overflow-x-hidden overflow-y-auto p-4 sm:p-7 lg:p-8 space-y-6 bg-slate-50 dark:bg-[#0a1628] w-full min-w-0">
        {/* TAB 1: CURRENT SITUATION */}
        {activeTab === 'situation' && (
          <div className="space-y-6 w-full">
            {/* ATMOSPHERIC TELEMETRY BANNER */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#0d1f3c] border border-[#1a3a6b] shadow-lg font-mono">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00d4ff]"></span>
                </span>
                <span className="text-[11px] font-bold tracking-wider text-[#00d4ff] uppercase">
                  {isLiveWeatherActive ? 'LIVE ATMOSPHERIC TELEMETRY STREAM' : 'SYNOPTIC STREAM PAUSED'}
                </span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span className="hidden md:inline text-[11px] text-[#7090b0]">
                  IMD Doppler Radar & INSAT-3DR Continuous Telemetry
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-slate-300">
                  Wind: <strong className="text-white font-bold">{activeCyclone?.wind || 185} km/h</strong>
                </span>
                <span className="text-slate-300 hidden sm:inline">
                  Pressure: <strong className="text-white font-bold">{activeCyclone?.pressure || 948} hPa</strong>
                </span>
                <span className="text-slate-300 hidden md:inline">
                  Surge: <strong className="text-white font-bold">{activeCyclone?.surge || '3.5m'}</strong>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${lampConfig.badgeBg}`}
                >
                  {lampConfig.label}
                </span>
              </div>
            </div>

            {/* 1. HERO SITUATION & GLOWING LAMP CARD */}
            <div
              className="w-full p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#1a3a6b] bg-gradient-to-br from-[#0d1f3c] via-[#102a4c] to-[#0a1628] shadow-2xl relative overflow-hidden transition-all duration-700"
            >
              {/* Meteorological Canvas Background (Subtle Rain & Wind Particles) */}
              <MeteorologicalCanvas mode="combo" density="low" opacity={0.3} />

              {/* Ambient Rotating Cyclone Radar Vortex graphic in background */}
              <div className="absolute -right-12 sm:right-10 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 sm:opacity-35 -z-0">
                <CycloneRadarVortex
                  size={320}
                  status={condition}
                  showScanline={true}
                  showRings={true}
                  speed={condition === 'severe' ? 'fast' : condition === 'intermediate' ? 'normal' : 'slow'}
                />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                {/* Left Side: Glowing Lamp + Condition Details */}
                <div className="flex items-start sm:items-center gap-5">
                  <div className="relative flex items-center justify-center flex-shrink-0 pt-1 sm:pt-0">
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center p-2 shadow-2xl border-2 border-white/20 bg-[#0a1628]"
                    >
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full lamp-active relative flex items-center justify-center transition-all duration-700"
                        style={{
                          '--lamp-color': lampConfig.color,
                          background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${lampConfig.lightCore} 40%, ${lampConfig.color} 75%, ${lampConfig.lightDark} 100%)`,
                          boxShadow: `${lampConfig.glowShadow}, inset 0 0 5px #ffffff`,
                        }}
                      >
                        <span className="absolute top-1 left-1.5 w-2.5 h-2.5 rounded-full bg-white/95 filter blur-[0.4px]" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-xs px-3 py-1 rounded-lg font-bold font-mono tracking-wider uppercase border ${lampConfig.badgeBg}`}>
                        {lampConfig.label}
                      </span>
                      <span className="text-xs text-[#7090b0] font-mono">
                        {activeCyclone?.name || 'CYCLONE DANA (BOB-02)'}
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wide">
                      {lampConfig.desc}
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                      {activeBulletin?.headline || "Very Severe Cyclonic Storm 'DANA' approaching Odisha & Bengal coast. Move to nearest cyclone shelter immediately."}
                    </p>
                  </div>
                </div>

                {/* Right Side: Landfall ETA Countdown & Audible Speech Button */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0 font-mono">
                  {/* Landfall ETA Badge */}
                  <div className="px-4 py-3 rounded-2xl bg-[#0a1628]/80 border border-[#1a3a6b] text-center backdrop-blur">
                    <span className="text-[10px] text-[#7090b0] uppercase font-bold tracking-wider block">
                      {t.landfallEta}
                    </span>
                    <span
                      className="text-lg sm:text-xl font-black text-[#00d4ff] mt-0.5 block"
                    >
                      {activeCyclone?.etaHours || '5h 30m'}
                    </span>
                  </div>

                  {/* Real Audible Voice Broadcast Button */}
                  <button
                    onClick={handleSpeakAudio}
                    className={`px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-red-500/30 text-red-300 border border-red-500 animate-pulse'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-950/50'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX size={16} />
                        <span>{t.stopBroadcast}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={16} className="text-white" />
                        <span>{t.listenBroadcast}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Audio Wave Visualizer when playing */}
              {isPlayingAudio && (
                <div className="mt-4 pt-3 border-t border-[#1a3a6b] flex items-center justify-between text-xs text-cyan-300 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>{t.playingBroadcast}</span>
                  </div>
                  <div className="flex items-end gap-1 h-4">
                    <span className="w-1 bg-[#00d4ff] rounded-full animate-pulse h-2" />
                    <span className="w-1 bg-[#00d4ff] rounded-full animate-pulse h-4" />
                    <span className="w-1 bg-[#00d4ff] rounded-full animate-pulse h-3" />
                    <span className="w-1 bg-[#00d4ff] rounded-full animate-pulse h-4" />
                    <span className="w-1 bg-[#00d4ff] rounded-full animate-pulse h-1" />
                  </div>
                </div>
              )}
            </div>

            {/* 2. FOUR PRIMARY TELEMETRY METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Metric 1: Peak Wind */}
              <div className="p-4 rounded-2xl bg-[#0d1f3c] border border-[#1a3a6b] shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#7090b0] uppercase font-bold tracking-wider font-mono">
                    {t.peakWind}
                  </div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {activeCyclone?.wind || 185}{' '}
                    <span className="text-xs font-normal text-slate-400">km/h</span>
                  </div>
                  <div className="text-[11px] text-cyan-400 mt-0.5 font-mono">
                    {t.gustsReaching} {activeCyclone?.gusts || 205} km/h
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Wind size={20} className="text-[#00d4ff]" />
                </div>
              </div>

              {/* Metric 2: Storm Surge */}
              <div className="p-4 rounded-2xl bg-[#0d1f3c] border border-[#1a3a6b] shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#7090b0] uppercase font-bold tracking-wider font-mono">
                    {t.stormSurge}
                  </div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {activeCyclone?.surge || '3.5m - 4.2m'}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-0.5 font-mono">
                    {t.inundationUpTo}
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Waves size={20} className="text-emerald-400" />
                </div>
              </div>

              {/* Metric 3: Landfall Sector */}
              <div className="p-4 rounded-2xl bg-[#0d1f3c] border border-[#1a3a6b] shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#7090b0] uppercase font-bold tracking-wider font-mono">
                    {t.landfallSector}
                  </div>
                  <div className="text-base font-bold text-white mt-1 truncate max-w-[150px]">
                    {activeCyclone?.landfallSector || 'Puri Coast, Odisha'}
                  </div>
                  <div className="text-[11px] text-amber-400 mt-0.5 font-mono">
                    {activeCyclone?.landfallTime || '14-Sep 18:00 IST'}
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <MapPin size={20} className="text-amber-400" />
                </div>
              </div>

              {/* Metric 4: Pucca Shelters */}
              <div className="p-4 rounded-2xl bg-[#0d1f3c] border border-[#1a3a6b] shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#7090b0] uppercase font-bold tracking-wider font-mono">
                    {t.openShelters}
                  </div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {shelters?.length || 5}{' '}
                    <span className="text-xs font-normal text-slate-400">Verified</span>
                  </div>
                  <div className="text-[11px] text-purple-400 mt-0.5 font-mono">
                    {t.equippedWith}
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                  <Shield size={20} className="text-purple-400" />
                </div>
              </div>
            </div>

            {/* 3. FEATURE GATEWAY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Card A: Official Report */}
              <button
                onClick={() => {
                  setActiveTab('report');
                  window.location.hash = 'report';
                }}
                className="p-5 rounded-2xl bg-[#0d1f3c] hover:bg-[#102a4c] border border-[#1a3a6b] hover:border-cyan-500/50 text-left transition-all group cursor-pointer shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <FileText size={20} className="text-[#00d4ff]" />
                  <ArrowRight size={16} className="text-[#7090b0] group-hover:text-[#00d4ff] group-hover:translate-x-1 transition-all" />
                </div>
                <div className="font-bold text-white text-sm font-mono">{t.viewFullReport}</div>
                <div className="text-xs text-[#7090b0] mt-1 leading-relaxed">
                  {t.officialReportSubtitle}
                </div>
              </button>

              {/* Card B: Cyclone Shelters */}
              <button
                onClick={() => {
                  setActiveTab('shelters');
                  window.location.hash = 'shelters';
                }}
                className="p-5 rounded-2xl bg-[#0d1f3c] hover:bg-[#102a4c] border border-[#1a3a6b] hover:border-emerald-500/50 text-left transition-all group cursor-pointer shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <Shield size={20} className="text-emerald-400" />
                  <ArrowRight size={16} className="text-[#7090b0] group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="font-bold text-white text-sm font-mono">{t.findShelter}</div>
                <div className="text-xs text-[#7090b0] mt-1 leading-relaxed">
                  {t.sheltersSubtitle}
                </div>
              </button>

              {/* Card C: Emergency SOS */}
              <button
                onClick={() => {
                  setActiveTab('sos');
                  window.location.hash = 'sos';
                }}
                className="p-5 rounded-2xl bg-[#0d1f3c] hover:bg-[#102a4c] border border-[#1a3a6b] hover:border-red-500/50 text-left transition-all group cursor-pointer shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <LifeBuoy size={20} className="text-red-400" />
                  <ArrowRight size={16} className="text-[#7090b0] group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="font-bold text-white text-sm font-mono">{t.dispatchSOSPrompt}</div>
                <div className="text-xs text-[#7090b0] mt-1 leading-relaxed">
                  {t.sosSubtitle}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: OFFICIAL WARNING REPORT */}
        {activeTab === 'report' && (
          <div className="p-6 rounded-3xl bg-[#0d1f3c] border border-[#1a3a6b] shadow-2xl space-y-5">
            <div className="border-b border-[#1a3a6b] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
              <div>
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#00d4ff]" />
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                    {t.officialReportTitle}
                  </h2>
                </div>
                <div className="text-xs text-[#7090b0] mt-1">
                  {t.officialReportSubtitle} · {activeBulletin?.issuedAt || '14-Sep 18:00 IST'}
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-lg font-bold border border-cyan-500/40 bg-cyan-500/10 text-[#00d4ff] self-start sm:self-auto">
                AUTHENTICATED IMD FEED
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a1628] border border-[#1a3a6b] space-y-2 font-mono">
              <div className="text-xs font-bold text-[#00d4ff] uppercase tracking-wider">
                {t.verbatimDispatch}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {activeBulletin?.body || activeBulletin?.headline || "Very Severe Cyclonic Storm 'DANA' rapidly approaching Odisha & West Bengal coasts. Landfall expected near Puri."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#0a1628] border border-[#1a3a6b]">
                <div className="font-bold text-[#00d4ff] uppercase tracking-wider mb-1">
                  {t.windField}
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {activeBulletin?.windForecast || "Gale surface winds reaching 175-185 km/h with gusts up to 205 km/h."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0a1628] border border-[#1a3a6b]">
                <div className="font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  {t.surgeForecast}
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {activeBulletin?.surgeForecast || "Storm surge of 3.5m to 4.2m above astronomical tide is very likely to inundate low-lying coastal belts."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0a1628] border border-[#1a3a6b]">
                <div className="font-bold text-red-400 uppercase tracking-wider mb-1">
                  {t.maritimeBan}
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {activeBulletin?.fishermenWarning || "Total suspension of maritime and fishing operations. Sea condition is phenomenal."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0a1628] border border-[#1a3a6b]">
                <div className="font-bold text-amber-400 uppercase tracking-wider mb-1">
                  {t.transportStatus}
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {activeBulletin?.transportAdvisory || "East Coast Railway cancelled 48 coastal trains. Bhubaneswar Airport flight operations suspended."}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1a3a6b] flex items-center justify-between text-xs text-[#7090b0] font-mono">
              <span>Signed by: {activeBulletin?.author || 'Dr. M. Kumar (Senior Meteorologist)'}</span>
              <span className="text-emerald-400 font-bold">Verified RSMC New Delhi</span>
            </div>
          </div>
        )}

        {/* TAB 3: DISTRICT RISK CHECKER */}
        {activeTab === 'district' && (
          <div className="p-6 rounded-3xl bg-[#0d1f3c] border border-[#1a3a6b] shadow-2xl space-y-5">
            <div className="border-b border-[#1a3a6b] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#00d4ff]" />
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                    {t.districtSelectorTitle}
                  </h2>
                </div>
                <div className="text-xs text-[#7090b0] mt-1">
                  Localized coastal threat status and emergency directives
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-[#7090b0] font-bold">{t.selectDistrict}</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    showToast(`Showing threat analysis for ${e.target.value}.`, 'info');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#0a1628] border border-[#1a3a6b] text-xs font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {affectedDistricts.map(d => (
                    <option key={d.name} value={d.name} className="bg-[#0a1628] text-white">
                      {d.name} ({d.state})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0a1628] border border-[#1a3a6b] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 font-mono">
                <div>
                  <h3 className="text-xl font-bold text-white">{districtInfo.name} District</h3>
                  <div className="text-xs text-[#7090b0] mt-0.5">{districtInfo.state} Coastal Belt</div>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-lg font-bold uppercase border ${
                    districtInfo.alertLevel === 'red' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                    districtInfo.alertLevel === 'orange' ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' :
                    districtInfo.alertLevel === 'yellow' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                    'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {districtInfo.alertLevel === 'red' ? 'RED ALERT · IMMEDIATE EVACUATION' :
                   districtInfo.alertLevel === 'orange' ? 'ORANGE ALERT · STANDBY' :
                   districtInfo.alertLevel === 'yellow' ? 'YELLOW ALERT · CAUTIONARY WATCH' : 'SAFE / NORMAL WATCH'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono">
                <div className="p-3.5 rounded-xl bg-[#102a4c] border border-[#1a3a6b]">
                  <span className="text-[10px] text-[#7090b0] uppercase font-bold block">{t.surfaceWinds}</span>
                  <span className="text-lg font-bold text-white mt-1 block">{districtInfo.wind}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#102a4c] border border-[#1a3a6b]">
                  <span className="text-[10px] text-[#7090b0] uppercase font-bold block">{t.stormSurge}</span>
                  <span className="text-lg font-bold text-emerald-400 mt-1 block">{districtInfo.surge}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#102a4c] border border-[#1a3a6b]">
                  <span className="text-[10px] text-[#7090b0] uppercase font-bold block">{t.evacuationDirective}</span>
                  <span className="text-sm font-bold text-amber-300 mt-1 block">
                    {districtInfo.evacuation}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1a3a6b] flex items-center justify-between text-xs font-mono">
                <span className="text-[#7090b0]">{t.localHelpline}</span>
                <a
                  href={`tel:${districtInfo.contact}`}
                  className="px-3 py-1 rounded-lg bg-cyan-500/10 text-[#00d4ff] border border-cyan-500/30 font-bold hover:bg-cyan-500/20 transition-colors"
                >
                  📞 {districtInfo.contact}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CYCLONE SHELTERS */}
        {activeTab === 'shelters' && (
          <div className="p-6 rounded-3xl bg-[#0d1f3c] border border-[#1a3a6b] shadow-2xl space-y-5">
            <div className="border-b border-[#1a3a6b] pb-4 font-mono">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-emerald-400" />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  {t.sheltersListTitle}
                </h2>
              </div>
              <div className="text-xs text-[#7090b0] mt-1">
                {t.sheltersSubtitle}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shelters.map((sh) => {
                const occupancyPercent = Math.round((sh.occupied / sh.capacity) * 100);
                return (
                  <div key={sh.id} className="p-4 rounded-2xl bg-[#0a1628] border border-[#1a3a6b] space-y-3 font-mono">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white font-sans">{sh.name}</h4>
                        <div className="text-xs text-[#7090b0] mt-0.5">
                          {sh.district} ·{' '}
                          <span className="text-cyan-400 font-bold">
                            {sh.distanceKm} km {t.distanceAway}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast(`Navigation loaded for ${sh.name}. Follow coastal evacuation corridor.`, 'info')}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00d4ff] border border-cyan-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Navigation size={12} />
                        <span>{t.directionsBtn}</span>
                      </button>
                    </div>

                    {/* Occupancy */}
                    <div>
                      <div className="flex justify-between text-xs text-[#7090b0] mb-1">
                        <span>{t.occupancy}</span>
                        <span className="font-mono text-slate-300">
                          {sh.occupied} / {sh.capacity} ({occupancyPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#102a4c] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            occupancyPercent > 80 ? 'bg-red-500' : occupancyPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${occupancyPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Amenities chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sh.amenities?.map((am, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#102a4c] text-slate-300 border border-[#1a3a6b]">
                          {am}
                        </span>
                      ))}
                    </div>

                    {/* Manager Phone */}
                    <div className="pt-2 border-t border-[#1a3a6b] flex items-center justify-between text-xs">
                      <span className="text-[#7090b0]">Manager: {sh.managerName}</span>
                      <a href={`tel:${sh.phone}`} className="text-emerald-400 font-mono font-bold hover:underline">
                        {sh.phone}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: EMERGENCY SOS */}
        {activeTab === 'sos' && (
          <div className="p-6 rounded-3xl bg-[#0d1f3c] border border-red-500/40 shadow-2xl space-y-5 font-mono">
            <div className="border-b border-[#1a3a6b] pb-4">
              <div className="flex items-center gap-2">
                <LifeBuoy size={20} className="text-red-400" />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  {t.sosTitle}
                </h2>
              </div>
              <div className="text-xs text-[#7090b0] mt-1">
                {t.sosSubtitle}
              </div>
            </div>

            {sosSent ? (
              <div className="p-6 rounded-2xl bg-[#0a1628] border border-emerald-500/40 text-center space-y-3">
                <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                <div className="text-lg font-black text-white">{t.beaconActive}</div>
                <p className="text-xs text-slate-300 max-w-md mx-auto font-sans">
                  {t.beaconActiveDesc}
                </p>
                <div className="text-xs font-mono text-[#7090b0]">
                  Tracking Code: <span className="text-[#00d4ff] font-bold">{sosTrackingCode}</span>
                </div>
                <button
                  onClick={() => setSosSent(false)}
                  className="px-4 py-2 rounded-xl bg-[#102a4c] hover:bg-[#163866] border border-[#1a3a6b] text-xs font-bold text-white cursor-pointer transition-colors"
                >
                  Send Another Distress Update
                </button>
              </div>
            ) : (
              <form onSubmit={handleSOSSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#7090b0] uppercase font-bold block mb-1">
                      {t.yourName}
                    </label>
                    <input
                      type="text"
                      required
                      value={sosData.name}
                      onChange={e => setSosData({ ...sosData, name: e.target.value })}
                      placeholder="e.g. Ramesh Mohapatra"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0a1628] border border-[#1a3a6b] text-sm text-white focus:outline-none focus:border-red-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#7090b0] uppercase font-bold block mb-1">
                      {t.yourPhone}
                    </label>
                    <input
                      type="tel"
                      required
                      value={sosData.phone}
                      onChange={e => setSosData({ ...sosData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0a1628] border border-[#1a3a6b] text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#7090b0] uppercase font-bold block mb-1">
                      {t.strandedPeople}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={sosData.peopleCount}
                      onChange={e => setSosData({ ...sosData, peopleCount: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0a1628] border border-[#1a3a6b] text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#7090b0] uppercase font-bold block mb-1">
                      {t.emergencyNature}
                    </label>
                    <select
                      value={sosData.needType}
                      onChange={e => setSosData({ ...sosData, needType: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0a1628] border border-[#1a3a6b] text-sm text-white focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="Evacuation & Medical Assistance">Medical Emergency & Immediate Evacuation</option>
                      <option value="Rising Storm Surge Water / Cut Off">Rising Inundation Surge / Cut Off</option>
                      <option value="Collapsed Structure / Trapped">Building Collapse / Trapped Family</option>
                      <option value="Drinking Water & Food Exhausted">Drinking Water & Food Exhausted</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#7090b0] uppercase font-bold block mb-1">
                    {t.locationLandmark}
                  </label>
                  <input
                    type="text"
                    required
                    value={sosData.address}
                    onChange={e => setSosData({ ...sosData, address: e.target.value })}
                    placeholder="e.g. Near Grand Road, Village Pentha, Ward 4"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a1628] border border-[#1a3a6b] text-sm text-white focus:outline-none focus:border-red-500 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-lg shadow-red-950/50 cursor-pointer transition-all"
                >
                  {t.transmitSOS}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 6: SAFETY CHECKLIST & SMS BROADCAST */}
        {activeTab === 'checklist' && (
          <div className="p-6 rounded-3xl bg-[#0d1f3c] border border-[#1a3a6b] shadow-2xl space-y-6">
            <div className="font-mono">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-[#00d4ff]" />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  {t.checklistTitle}
                </h2>
              </div>
              <div className="text-xs text-[#7090b0] mt-1">
                {t.checklistSubtitle}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="p-4 rounded-2xl bg-[#0a1628] border border-[#1a3a6b] space-y-2 font-mono">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#7090b0]">Preparedness Progress</span>
                <span className="text-[#00d4ff]">{progressPercent}% {t.checklistReady}</span>
              </div>
              <div className="w-full h-2.5 bg-[#102a4c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
              {[
                { key: 'water', label: '15 Liters clean drinking water sealed in safe containers' },
                { key: 'food', label: '3 days non-perishable dry ration (chuda, biscuits, canned food)' },
                { key: 'powerbank', label: 'Mobile phones, powerbanks and emergency flashlights charged 100%' },
                { key: 'medicines', label: 'Essential prescription medicines and emergency first-aid kit' },
                { key: 'documents', label: 'Aadhaar cards, land records & cash packed in waterproof plastic pouches' },
                { key: 'gasValve', label: 'LPG cylinder valve closed and main electricity breaker turned off' },
              ].map(item => (
                <div
                  key={item.key}
                  onClick={() => toggleChecklist(item.key)}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0a1628] hover:bg-[#102a4c] border border-[#1a3a6b]/60 cursor-pointer text-xs sm:text-sm transition-colors"
                >
                  {checklist[item.key] ? (
                    <CheckSquare size={18} className="text-[#00d4ff] flex-shrink-0" />
                  ) : (
                    <Square size={18} className="text-slate-500 flex-shrink-0" />
                  )}
                  <span className={checklist[item.key] ? 'line-through text-slate-500' : 'text-slate-200'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Offline SMS Subscription Card */}
            <div className="p-5 rounded-2xl bg-[#0a1628] border border-[#1a3a6b] space-y-3 font-mono">
              <div className="font-bold text-white text-sm">{t.offlineSMSTitle}</div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {t.offlineSMSDesc}
              </p>
              <form onSubmit={handleRegisterSMS} className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={smsPhone}
                  onChange={e => setSmsPhone(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#102a4c] border border-[#1a3a6b] text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white cursor-pointer transition-colors shadow-lg shadow-cyan-950/40"
                >
                  {t.subscribeSMS}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 7: CITIZEN SAFETY PROFILE */}
        {activeTab === 'profile' && (
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-[#0d1f3c] border border-[#1a3a6b] shadow-2xl space-y-6">
            {/* Header */}
            <div className="border-b border-[#1a3a6b] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
              <div>
                <div className="flex items-center gap-2">
                  <User size={20} className="text-emerald-400" />
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                    Citizen Safety Profile & Emergency Information
                  </h2>
                </div>
                <div className="text-xs text-[#7090b0] mt-1">
                  National Disaster Management Authority (NDMA) · Coastal Resident Registry
                </div>
              </div>

              <button
                onClick={() => setProfileEditing(!profileEditing)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold border border-[#1a3a6b] bg-[#102a4c] text-cyan-300 hover:border-cyan-500/50 transition-colors cursor-pointer self-start sm:self-auto"
              >
                {profileEditing ? 'Cancel Edit' : 'Edit Profile Information'}
              </button>
            </div>

            {/* Profile Hero Card */}
            <div className="p-6 rounded-2xl bg-[#0a1628] border border-[#1a3a6b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 font-mono">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-500/40 flex items-center justify-center text-xl font-bold text-emerald-300 shadow-lg">
                  {currentUser?.avatarInitials || 'CZ'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white font-sans">{currentUser?.name || 'Citizen'}</h3>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      VERIFIED CITIZEN
                    </span>
                  </div>
                  <div className="text-xs text-[#7090b0] mt-1 flex flex-wrap items-center gap-3">
                    <span className="text-slate-300">📱 {currentUser?.phone || '+91 98765 43210'}</span>
                    <span className="text-slate-300">✉️ {currentUser?.email || 'citizen@coastal.in'}</span>
                    <span className="text-slate-300">📍 {currentUser?.district || 'Puri'}, Odisha</span>
                  </div>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[#102a4c] border border-[#1a3a6b] text-right">
                <span className="text-[10px] text-[#7090b0] uppercase font-bold block">Evacuation Zone</span>
                <span className="text-xs font-bold text-amber-300">
                  {currentUser?.district || 'Puri'} Coastal Risk Zone 1
                </span>
              </div>
            </div>

            {/* In-page Edit Form or Overview Cards */}
            {profileEditing ? (
              <form onSubmit={handleProfileSave} className="p-6 rounded-2xl bg-[#0a1628] border border-[#1a3a6b] space-y-4 font-mono">
                <div className="font-bold text-white text-xs uppercase tracking-wider border-b border-[#1a3a6b] pb-2">
                  Update Your Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#7090b0] uppercase font-bold block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#102a4c] border border-[#1a3a6b] text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#7090b0] uppercase font-bold block mb-1">Mobile Number (SMS Broadcasts)</label>
                    <input
                      type="tel"
                      required
                      value={profileForm.phone}
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#102a4c] border border-[#1a3a6b] text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#7090b0] uppercase font-bold block mb-1">Coastal District</label>
                    <select
                      value={profileForm.district}
                      onChange={e => setProfileForm({ ...profileForm, district: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#102a4c] border border-[#1a3a6b] text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="Puri">Puri (Odisha)</option>
                      <option value="Jagatsinghpur">Jagatsinghpur (Odisha)</option>
                      <option value="Kendrapara">Kendrapara (Odisha)</option>
                      <option value="Balasore">Balasore (Odisha)</option>
                      <option value="East Midnapore / Digha">East Midnapore / Digha (West Bengal)</option>
                      <option value="Visakhapatnam">Visakhapatnam (Andhra Pradesh)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#7090b0] uppercase font-bold block mb-1">Household / Family Count</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={profileForm.familyMembers}
                      onChange={e => setProfileForm({ ...profileForm, familyMembers: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#102a4c] border border-[#1a3a6b] text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#7090b0] uppercase font-bold block mb-1">Local Address / Landmark</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#102a4c] border border-[#1a3a6b] text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-950/40"
                >
                  Save Profile Changes
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Details Card 1 */}
                <div className="p-5 rounded-2xl bg-[#0a1628] border border-[#1a3a6b] space-y-3">
                  <div className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] border-b border-[#1a3a6b] pb-2">
                    Disaster Registration & Location
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-[#7090b0]">Citizen Name:</span>
                      <span className="text-white font-bold font-sans">{currentUser?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7090b0]">Coastal District:</span>
                      <span className="text-white font-bold">{currentUser?.district || 'Puri'}, Odisha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7090b0]">Registered Address:</span>
                      <span className="text-slate-300 font-sans">{currentUser?.address || 'Near Grand Road / Light House Colony'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7090b0]">Household Count:</span>
                      <span className="text-white font-bold">{currentUser?.familyMembers || 4} Persons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7090b0]">Designated Shelter:</span>
                      <span className="text-emerald-400 font-semibold font-sans">{shelters?.[0]?.name || 'Puri Town Hall MPCS'}</span>
                    </div>
                  </div>
                </div>

                {/* Details Card 2 */}
                <div className="p-5 rounded-2xl bg-[#0a1628] border border-[#1a3a6b] space-y-3">
                  <div className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] border-b border-[#1a3a6b] pb-2">
                    Emergency Broadcast & Network
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-[#7090b0]">SMS Alert Broadcast:</span>
                      <span className="text-emerald-400 font-bold">Subscribed (Active)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7090b0]">Warning Language:</span>
                      <span className="text-white font-bold">{language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7090b0]">Emergency Contacts:</span>
                      <span className="text-cyan-300">NDRF 1078 / SEOC 1070</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7090b0]">Dispatched SOS Alerts:</span>
                      <span className="text-amber-300 font-bold">
                        {sosBeacons?.filter(b => b.name?.toLowerCase() === currentUser?.name?.toLowerCase() || b.phone === currentUser?.phone).length || 0} Active
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7090b0]">Registry Authority:</span>
                      <span className="text-slate-300">NDMA Citizen Protection Grid</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
