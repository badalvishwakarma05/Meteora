import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert, PhoneCall, AlertTriangle, CheckCircle2,
  LifeBuoy, MapPin, User, LogOut, ExternalLink, Globe, Bell, Zap, Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDisasterAlert } from '../context/DisasterAlertContext';
import { useToast } from '../context/ToastContext';
import { CITIZEN_TRANSLATIONS } from '../data/citizenTranslations';
import UserProfileModal from './UserProfileModal';

export default function CitizenLayout() {
  const { currentUser, logout } = useAuth();
  const { condition, activeCyclone, language, setLanguage } = useDisasterAlert();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const t = CITIZEN_TRANSLATIONS[language] || CITIZEN_TRANSLATIONS.English;
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [conditionChanged, setConditionChanged] = useState(false);
  const prevConditionRef = useRef(condition);

  // Flare animation when condition changes
  useEffect(() => {
    if (prevConditionRef.current !== condition) {
      setConditionChanged(true);
      prevConditionRef.current = condition;
      const t = setTimeout(() => setConditionChanged(false), 2400);
      return () => clearTimeout(t);
    }
  }, [condition]);

  // Lamp properties based on condition
  const lampConfig = {
    safe: {
      color: '#00d4ff',
      lightCore: '#70e2ff',
      lightDark: '#0088cc',
      label: t.statusSafe,
      desc: t.statusSafeDesc,
      badgeBg: 'bg-cyan-500/20 text-[#00d4ff] border-cyan-500/40',
    },
    intermediate: {
      color: '#ffd60a',
      lightCore: '#fff3b0',
      lightDark: '#cc9900',
      label: t.statusIntermediate,
      desc: t.statusIntermediateDesc,
      badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    },
    severe: {
      color: '#ff1744',
      lightCore: '#ff6b81',
      lightDark: '#b70020',
      label: t.statusSevere,
      desc: t.statusSevereDesc,
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40 font-bold',
    },
  }[condition] || {
    color: '#ff1744',
    lightCore: '#ff6b81',
    lightDark: '#b70020',
    label: t.statusSevere,
    desc: t.statusSevereDesc,
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40 font-bold',
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out of Citizen Safety Portal.', 'info');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a1628] text-white selection:bg-[#00d4ff] selection:text-[#050d1a]">
      {/* 1. TOP NATIONAL DISASTER BANNER */}
      <div className="w-full bg-[#050d1a] border-b border-[#1a3a6b]/80 px-4 sm:px-6 py-1.5 text-xs text-[#88a0c0] shrink-0 font-mono">
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white font-medium">{t.governmentBanner}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <PhoneCall size={12} className="animate-pulse text-amber-400" />
              <span>{t.helplineText}</span>
            </div>
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-[#0a1628] px-2.5 py-1 rounded-lg border border-[#1a3a6b] text-white shadow-sm">
              <Globe size={13} className="text-[#00d4ff]" />
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  showToast(`Language set to ${e.target.value}.`, 'info');
                }}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                title="Select Regional Language"
              >
                <option value="English" className="bg-[#0a1628] text-white">English</option>
                <option value="Hindi" className="bg-[#0a1628] text-white">हिन्दी (Hindi)</option>
                <option value="Odia" className="bg-[#0a1628] text-white">ଓଡ଼ିଆ (Odia)</option>
                <option value="Bengali" className="bg-[#0a1628] text-white">বাংলা (Bengali)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CITIZEN PUBLIC SAFETY HEADER */}
      <header className="w-full bg-[#0d1f3c]/95 backdrop-blur-xl border-b border-[#1a3a6b] shadow-xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3 shrink-0 z-40">
        {/* Brand & Citizen Indicator */}
        <div className="flex items-center gap-3">
          <Link to="/citizen/dashboard" className="flex items-center gap-2.5 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-gradient-to-br from-cyan-400 to-blue-600 text-[#050d1a] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform"
            >
              <Zap size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-wider text-white">{t.portalTitle}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 tracking-wider">
                  CITIZEN SAFETY
                </span>
              </div>
              <div className="text-[11px] text-[#88a0c0] font-mono truncate">{t.portalSubtitle}</div>
            </div>
          </Link>
        </div>

        {/* Center: Live Situation Light */}
        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#0a1628] border border-[#1a3a6b] select-none font-mono shadow-inner">
          <span className="text-[10px] tracking-wider text-[#88a0c0] uppercase font-semibold">
            LIVE STATUS LIGHT
          </span>

          {/* Glowing Lamp Lens */}
          <div className="relative flex items-center justify-center">
            {conditionChanged && (
              <span
                className="absolute w-8 h-8 rounded-full pointer-events-none lamp-ripple-trigger"
                style={{ background: lampConfig.color }}
              />
            )}

            <div
              className="relative flex items-center justify-center rounded-full p-[2.5px] transition-all duration-700 shadow-inner"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #1a3a6b, #050d1a)',
                boxShadow: `0 0 16px ${lampConfig.color}80, inset 0 0 4px rgba(0,0,0,0.8)`,
              }}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full transition-all duration-500 relative flex items-center justify-center ${
                  conditionChanged ? 'lamp-flare-trigger' : 'lamp-active'
                }`}
                style={{
                  '--lamp-color': lampConfig.color,
                  background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${lampConfig.lightCore} 40%, ${lampConfig.color} 75%, ${lampConfig.lightDark} 100%)`,
                  boxShadow: `0 0 10px ${lampConfig.color}, inset 0 0 3px #ffffff`,
                }}
              >
                <span className="absolute top-[1.5px] left-[1.5px] w-1 h-1 rounded-full bg-white/95 filter blur-[0.2px]" />
              </div>
            </div>
          </div>

          {/* Clean Badge */}
          <div className={`text-[11px] px-2.5 py-0.5 rounded font-bold tracking-wider uppercase border ${lampConfig.badgeBg}`}>
            {lampConfig.label}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono">
          {/* Quick SOS Trigger Button */}
          <button
            onClick={() => {
              window.location.hash = 'sos';
              window.dispatchEvent(new CustomEvent('citizen-tab-change', { detail: 'sos' }));
            }}
            className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white flex items-center gap-1.5 shadow-lg shadow-red-500/25 transition-all hover:scale-105 cursor-pointer"
          >
            <LifeBuoy size={14} />
            <span>{t.navSOS.toUpperCase()}</span>
          </button>

          {/* Authenticated Citizen Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#1a3a6b]">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-2.5 px-2.5 py-1 rounded-xl border border-[#1a3a6b] hover:border-emerald-400 bg-[#0a1628] hover:bg-[#102a4c] transition-all cursor-pointer group shadow-sm"
              title="Click to view and edit Citizen Profile"
            >
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-xs font-bold text-white leading-tight font-sans">
                  {currentUser?.name || 'Citizen'}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {currentUser?.district || 'Coastal'} Sector
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xs font-bold text-slate-950 group-hover:scale-105 transition-transform">
                {currentUser?.avatarInitials || 'CZ'}
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 text-[#88a0c0] hover:text-white transition-colors cursor-pointer"
              title={t.logout}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* User Profile & Information Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* 3. MAIN WORKSPACE VIEWPORT */}
      <div className="flex flex-1 overflow-hidden w-full bg-[#0a1628]">
        <Outlet />
      </div>
    </div>
  );
}
