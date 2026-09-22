import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, LogOut, CheckCircle, AlertTriangle,
  X, Activity, Wifi, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDisasterAlert } from '../context/DisasterAlertContext';
import UserProfileModal from './UserProfileModal';

export default function TopNav() {
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const { condition, activeCyclone, selectedRegion, setSelectedRegion, COASTAL_REGIONS } = useDisasterAlert();
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);

  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 1,
      title: 'RAPID INTENSIFICATION DETECTED',
      storm: 'CYCLONE DANA (Bay of Bengal)',
      desc: 'Central pressure dropped by 18 hPa in the last 12 hours. Sustained surface winds reached 185 km/h.',
      severity: 'critical',
      time: '12 min ago',
      acknowledged: false,
    },
    {
      id: 2,
      title: 'LANDFALL ADVISORY ISSUED',
      storm: 'CYCLONE DANA (Odisha Coast)',
      desc: 'Landfall trajectory confirmed near Puri on 14-Sep 18:00 IST. Storm surge 3.5m - 4.2m expected.',
      severity: 'critical',
      time: '34 min ago',
      acknowledged: false,
    },
    {
      id: 3,
      title: 'LOW INTENSITY DEPRESSION',
      storm: 'DEPRESSION BOB-01 (South BoB)',
      desc: 'Low pressure area concentrated into depression near lat 12.1°N, lon 82.3°E. Movement WNW.',
      severity: 'moderate',
      time: '1h 10m ago',
      acknowledged: true,
    },
  ]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (d) =>
    d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: 'Asia/Kolkata',
    }) + ' IST';

  const unackCount = activeAlerts.filter(a => !a.acknowledged).length;

  const handleAcknowledge = (id) => {
    setActiveAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    showToast('Alert acknowledged.', 'success');
  };

  const handleDismiss = (id) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    showToast('Signed out of METEORA Command Center.', 'info');
    navigate('/');
  };

  return (
    <>
      <header className="flex flex-wrap items-center justify-between px-3 sm:px-6 min-h-14 py-2 sm:py-0 border-b border-[#1a3a6b] bg-[#0d1f3c]/95 backdrop-blur-xl z-30 relative select-none gap-2 sm:gap-3">
        {/* Left: Meteorological Authority & Live Sync (METEORA) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-[#00d4ff] border border-[#00d4ff]/30">
              MoES · IMD
            </span>
            <span className="text-[#8892a4] text-[11px] font-medium hidden md:inline">
              National Tropical Cyclone Warning Centre
            </span>
          </div>

          {/* Live Indicator Beacon */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE SYNC</span>
          </div>
        </div>

        {/* Center: Live Clock, Broadcast Status & State Selector */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Prominent Coastal State / Monitoring Zone Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0a1628] border border-cyan-500/30 text-xs text-white shadow-inner">
            <MapPin size={14} className="text-[#00d4ff]" />
            <span className="text-[10px] font-bold uppercase text-[#8892a4] hidden xl:inline">State / Zone:</span>
            <select
              value={selectedRegion?.id || 'OD'}
              onChange={(e) => {
                const reg = COASTAL_REGIONS?.find(r => r.id === e.target.value);
                if (reg) {
                  setSelectedRegion(reg);
                  showToast(`Monitoring Region set to ${reg.name}`, 'info');
                }
              }}
              className="bg-transparent text-xs font-bold text-[#00d4ff] focus:outline-none cursor-pointer py-0.5 border-none"
            >
              {COASTAL_REGIONS?.map(reg => (
                <option key={reg.id} value={reg.id} className="bg-[#0a1628] text-white font-sans">
                  {reg.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a1628] border border-white/[0.08] text-xs">
            <span className="text-[10px] font-mono uppercase font-bold text-[#8892a4]">CITIZEN BROADCAST:</span>
            <span
              className={`w-2 h-2 rounded-full ${
                condition === 'severe' ? 'bg-red-500 animate-ping' :
                condition === 'intermediate' ? 'bg-yellow-400' : 'bg-cyan-400'
              }`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-wider ${
                condition === 'severe' ? 'text-red-400' :
                condition === 'intermediate' ? 'text-yellow-300' : 'text-[#00d4ff]'
              }`}
            >
              {condition === 'severe' ? 'CRITICAL SEVERE' : condition === 'intermediate' ? 'INTERMEDIATE' : 'SAFE WATCH'}
            </span>
            {activeCyclone && (
              <span className="text-[10px] font-mono text-[#8892a4] border-l border-white/[0.1] pl-2">
                {activeCyclone.name} ({activeCyclone.category})
              </span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0a1628] border border-[#1a3a6b] text-xs font-mono text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>{fmt(time)}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0 ml-auto">
          {/* Diagnostics quick status */}
          <button
            onClick={() => setDiagnosticsOpen(true)}
            className="hidden lg:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#1a3a6b] hover:border-[#00d4ff] bg-[#0a1628] text-[#8892a4] hover:text-white transition-all cursor-pointer"
          >
            <Wifi size={13} className="text-[#00d4ff]" />
            <span>Downlink OK</span>
          </button>

          {/* Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => { setAlertsOpen(!alertsOpen); setProfileOpen(false); }}
              className="relative p-2 sm:p-2.5 rounded-xl border border-[#1a3a6b] hover:border-[#00d4ff] bg-[#0a1628] hover:bg-[#0d1f3c] text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Weather Alerts"
            >
              <Bell size={16} />
              {unackCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center bg-red-500 text-white text-[10px] animate-pulse">
                  {unackCount}
                </span>
              )}
            </button>

            {/* Alerts Drawer */}
            {alertsOpen && (
              <div className="absolute right-0 top-12 w-[calc(100vw-24px)] max-w-sm sm:w-96 rounded-2xl border border-[#1a3a6b] bg-[#0d1f3c] shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                <div className="flex items-center justify-between p-4 border-b border-[#1a3a6b] bg-[#0a1628]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Active Alerts ({activeAlerts.length})
                    </span>
                  </div>
                  {activeAlerts.length > 0 && (
                    <button
                      onClick={() => setActiveAlerts([])}
                      className="text-[11px] text-gray-400 hover:text-white hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="p-3 max-h-80 overflow-y-auto space-y-2.5">
                  {activeAlerts.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#8892a4]">
                      <CheckCircle size={22} className="mx-auto text-emerald-400 mb-1.5" />
                      <div>All weather alerts resolved.</div>
                    </div>
                  ) : (
                    activeAlerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          alert.acknowledged
                            ? 'bg-[#0a1628]/40 border-[#1a3a6b]/40 opacity-60'
                            : alert.severity === 'critical'
                            ? 'bg-red-950/30 border-red-500/40 shadow-sm'
                            : 'bg-amber-950/20 border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`font-bold text-[11px] ${alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                            {alert.title}
                          </span>
                          <span className="text-[10px] text-[#8892a4]">{alert.time}</span>
                        </div>
                        <div className="font-semibold text-white text-xs mb-1">{alert.storm}</div>
                        <div className="text-[11px] text-[#8892a4] leading-relaxed mb-2.5">{alert.desc}</div>
                        <div className="flex items-center gap-2 pt-2 border-t border-[#1a3a6b]">
                          {!alert.acknowledged && (
                            <button
                              onClick={() => handleAcknowledge(alert.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#00d4ff] text-black hover:opacity-90 cursor-pointer"
                            >
                              Acknowledge
                            </button>
                          )}
                          <button
                            onClick={() => handleDismiss(alert.id)}
                            className="px-2 py-1 rounded text-[11px] text-gray-400 hover:text-white ml-auto cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setAlertsOpen(false); }}
              className="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 sm:pr-3 rounded-xl border border-[#1a3a6b] hover:border-[#00d4ff] bg-[#0a1628] hover:bg-[#0d1f3c] transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-black bg-gradient-to-tr from-[#00d4ff] to-[#4facfe] shadow-md shrink-0">
                {currentUser?.avatarInitials || 'MK'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight">
                  {currentUser?.name || 'Dr. M. Kumar'}
                </div>
                <div className="text-[10px] text-[#8892a4] leading-tight">
                  {currentUser?.role || 'Senior Forecaster'}
                </div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-14 w-60 max-w-[calc(100vw-24px)] rounded-2xl border border-[#1a3a6b] bg-[#0d1f3c] shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                <div className="p-3.5 border-b border-[#1a3a6b] bg-[#0a1628]">
                  <div className="font-bold text-white text-xs">{currentUser?.name || 'Dr. M. Kumar'}</div>
                  <div className="text-[11px] text-[#8892a4]">{currentUser?.email || 'dr.kumar@imd.gov.in'}</div>
                  <div className="text-[10px] text-[#00d4ff] mt-0.5">{currentUser?.department || 'Cyclone Warning Division'}</div>
                </div>

                <div className="p-2 text-xs space-y-0.5">
                  <button
                    onClick={() => { setProfileOpen(false); setUserProfileModalOpen(true); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-[#0a1628] hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>Personnel Profile</span>
                    <span className="text-[10px] text-[#00d4ff] font-mono">View/Edit</span>
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-[#0a1628] hover:text-white transition-colors cursor-pointer"
                  >
                    System Preferences
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); setDiagnosticsOpen(true); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-[#0a1628] hover:text-white transition-colors cursor-pointer"
                  >
                    Sensor Downlinks
                  </button>
                </div>

                <div className="p-2 border-t border-[#1a3a6b] bg-[#0a1628]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* User Profile & Personnel Info Modal */}
      <UserProfileModal
        isOpen={userProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
      />

      {/* Diagnostics Modal */}
      {diagnosticsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-[#1a3a6b] p-6 bg-[#0d1f3c] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a3a6b] mb-4">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#00d4ff]" />
                <h3 className="font-bold text-white text-sm">Sensor Downlink Health</h3>
              </div>
              <button onClick={() => setDiagnosticsOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs mb-5">
              {[
                { name: 'INSAT-3D Thermal IR Payload', status: 'Online · 24ms Latency', ok: true },
                { name: 'INSAT-3DR Multispectral Stream', status: 'Online · 31ms Latency', ok: true },
                { name: 'Oceansat Scatterometer Feed', status: 'Online · Calibrated', ok: true },
                { name: 'Dvorak Neural Inference Cluster', status: '94.2% Validation Score', ok: true },
              ].map((d, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-[#1a3a6b] bg-[#0a1628]">
                  <div>
                    <div className="font-semibold text-white">{d.name}</div>
                    <div className="text-[11px] text-[#8892a4]">{d.status}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setDiagnosticsOpen(false)}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-black bg-[#00d4ff] hover:opacity-90 cursor-pointer transition-opacity"
            >
              Close Diagnostics
            </button>
          </div>
        </div>
      )}
    </>
  );
}
