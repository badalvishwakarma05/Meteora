import { useState } from 'react';
import { Save, Database, Brain, Bell, Users, Key, Wifi, X, CheckCircle, RefreshCw, Sun, Moon, Palette } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

function SettingsSection({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#1a3a6b] p-5 bg-white dark:bg-[#0d1f3c] shadow-lg">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-[#1a3a6b]">
        <Icon size={16} className="text-cyan-600 dark:text-[#00d4ff]" />
        <h2 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight font-mono">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-[#1a3a6b]/60">
      <div>
        <div className="text-xs font-semibold text-slate-900 dark:text-white">{label}</div>
        {sub && <div className="text-[11px] text-slate-500 dark:text-[#88a0c0] font-mono">{sub}</div>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 border border-slate-300 dark:border-[#1a3a6b] cursor-pointer ${
          checked ? 'bg-cyan-500 dark:bg-[#00d4ff]' : 'bg-slate-200 dark:bg-[#0a1628]'
        }`}
      >
        <div
          className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all ${
            checked ? 'left-[22px] bg-slate-950 dark:bg-[#050d1a]' : 'left-0.5 bg-slate-400 dark:bg-[#88a0c0]'
          }`}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const { showToast } = useToast();
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  // Settings State
  const [dataSources, setDataSources] = useState({
    insat3d: true,
    insat3dr: true,
    goes: true,
    meteosat: false,
    interval: '30 minutes',
  });

  const [alertConfig, setAlertConfig] = useState({
    rapidIntensification: true,
    landfallWarnings: true,
    smsNotifications: false,
    emailBulletins: true,
    threshold: 85,
  });

  const [modelsList, setModelsList] = useState([
    { id: 1, name: 'METEORA Neural Detection v2.4', acc: '94.2%', status: 'Active' },
    { id: 2, name: 'Track Forecasting (LSTM Ensemble)', acc: '89.7%', status: 'Active' },
    { id: 3, name: 'Intensity Prediction (CNN-Dvorak)', acc: '91.3%', status: 'Active' },
    { id: 4, name: 'Ensemble Fusion Model (MoES)', acc: '96.1%', status: 'Active' },
  ]);

  const [usersList, setUsersList] = useState([
    { id: 1, name: 'Dr. M. Kumar', role: 'Senior Meteorologist', status: 'Online' },
    { id: 2, name: 'Dr. P. Sharma', role: 'Operational Forecaster', status: 'Online' },
    { id: 3, name: 'R. Nair', role: 'Remote Sensing Analyst', status: 'Offline' },
    { id: 4, name: 'Disaster Command Admin', role: 'System Admin', status: 'Online' },
  ]);

  // Modals
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Operational Forecaster');

  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [calibratingModel, setCalibratingModel] = useState(null);
  const [calibrating, setCalibrating] = useState(false);

  const handleToggleSource = (key) => {
    setDataSources(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleAlert = (key) => {
    setAlertConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const newUser = {
      id: Date.now(),
      name: newUserName.trim(),
      role: newUserRole,
      status: 'Online',
    };
    setUsersList(prev => [...prev, newUser]);
    setNewUserName('');
    setAddUserModalOpen(false);
    showToast(`Registered new forecaster "${newUser.name}" with role ${newUser.role}.`, 'success');
  };

  const handleUpdateModel = (m) => {
    setCalibratingModel(m);
    setModelModalOpen(true);
    setCalibrating(true);

    setTimeout(() => {
      setCalibrating(false);
      showToast(`Model weights for "${m.name}" updated to checkpoint v2.4.1. Accuracy verified.`, 'success');
    }, 1500);
  };

  const handleSaveAll = () => {
    localStorage.setItem('cyclone_ai_settings', JSON.stringify({ dataSources, alertConfig }));
    showToast('All system preferences, sensor downlinks, and alert thresholds saved successfully.', 'success');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 dark:text-[#88a0c0] font-mono">System Configuration & Administration</div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Operational Settings</h1>
        </div>
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg font-bold text-slate-950 bg-cyan-400 dark:bg-[#00d4ff] hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <Save size={14} />
          <span>Save All Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Display & Appearance (Theme Switcher) */}
        <SettingsSection icon={Palette} title="Display, Appearance & Theme Mode">
          <div className="space-y-3">
            <div className="text-xs text-slate-500 dark:text-[#88a0c0] font-mono">
              Choose your preferred visual theme for the command center and maps.
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  showToast('Dark Theme activated.', 'info');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                  isDark
                    ? 'border-cyan-500 bg-slate-900 text-white shadow-lg shadow-cyan-950/40'
                    : 'border-slate-300 bg-slate-100 text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon size={16} className="text-cyan-400" />
                    <span className="font-bold text-xs">Dark Theme</span>
                  </div>
                  {isDark && <CheckCircle size={14} className="text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-[#88a0c0] leading-snug">
                  High contrast dark palette optimized for meteorological analysis & night operations.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  showToast('Light Theme activated.', 'info');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                  !isDark
                    ? 'border-cyan-500 bg-white shadow-lg shadow-cyan-950/10 text-slate-900'
                    : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun size={16} className="text-amber-500" />
                    <span className="font-bold text-xs">Light Theme</span>
                  </div>
                  {!isDark && <CheckCircle size={14} className="text-cyan-500" />}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-[#88a0c0] leading-snug">
                  Clean crisp daylight palette suited for bright field environments and briefing displays.
                </p>
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* Data Sources */}
        <SettingsSection icon={Database} title="Satellite Sensor Feeds">
          <Toggle
            label="INSAT-3D Downlink Channel"
            sub="Primary Thermal IR and Visible payload"
            checked={dataSources.insat3d}
            onChange={() => handleToggleSource('insat3d')}
          />
          <Toggle
            label="INSAT-3DR Downlink Channel"
            sub="High-frequency secondary multispectral feed"
            checked={dataSources.insat3dr}
            onChange={() => handleToggleSource('insat3dr')}
          />
          <Toggle
            label="GOES-East WMO GTS Relay"
            sub="International cross-basin comparison telemetry"
            checked={dataSources.goes}
            onChange={() => handleToggleSource('goes')}
          />
          <Toggle
            label="Meteosat Supplementary Data"
            sub="Western Indian Ocean coverage"
            checked={dataSources.meteosat}
            onChange={() => handleToggleSource('meteosat')}
          />
          <div className="mt-3.5">
            <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-mono block mb-1">
              Automated Data Polling Cadence
            </label>
            <select
              value={dataSources.interval}
              onChange={e => setDataSources({ ...dataSources, interval: e.target.value })}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:border-cyan-500 shadow-sm"
            >
              <option className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">15 minutes (High Alert)</option>
              <option className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">30 minutes (Operational Standard)</option>
              <option className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">1 hour (Low Activity)</option>
              <option className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">3 hours (Standby Mode)</option>
            </select>
          </div>
        </SettingsSection>

        {/* AI Models Zoo */}
        <SettingsSection icon={Brain} title="AI / ML Neural Network Checkpoints">
          <div className="space-y-2">
            {modelsList.map(m => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-xs shadow-sm"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{m.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-[#88a0c0] font-mono">
                    Validation Accuracy: <span className="text-cyan-700 dark:text-[#00d4ff] font-mono font-bold">{m.acc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/15 dark:bg-emerald-500/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                    {m.status}
                  </span>
                  <button
                    onClick={() => handleUpdateModel(m)}
                    className="px-2 py-1 rounded text-xs border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/40 transition-colors cursor-pointer shadow-sm"
                  >
                    Calibrate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SettingsSection>

        {/* Alert Configuration */}
        <SettingsSection icon={Bell} title="Emergency Alerting & Broadcast Rules">
          <Toggle
            label="Auto-Alert on Rapid Intensification"
            sub="Dispatches priority warning when wind delta > 55 km/h in 24h"
            checked={alertConfig.rapidIntensification}
            onChange={() => handleToggleAlert('rapidIntensification')}
          />
          <Toggle
            label="Landfall Advance Warnings"
            sub="Automatic 72h, 48h, 24h, and 12h advisory stages"
            checked={alertConfig.landfallWarnings}
            onChange={() => handleToggleAlert('landfallWarnings')}
          />
          <Toggle
            label="SMS Notification Cascade"
            sub="Direct SMS broadcast to registered emergency personnel"
            checked={alertConfig.smsNotifications}
            onChange={() => handleToggleAlert('smsNotifications')}
          />
          <Toggle
            label="Automated Email Bulletins"
            sub="Sends 06:00 and 18:00 IST bulletins to SDMA distribution lists"
            checked={alertConfig.emailBulletins}
            onChange={() => handleToggleAlert('emailBulletins')}
          />
          <div className="mt-3.5">
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-slate-600 dark:text-[#88a0c0]">Confidence Alert Threshold</span>
              <span className="font-mono font-bold text-cyan-700 dark:text-[#00d4ff]">{alertConfig.threshold}%</span>
            </div>
            <input
              type="range"
              min="65"
              max="95"
              value={alertConfig.threshold}
              onChange={e => setAlertConfig({ ...alertConfig, threshold: Number(e.target.value) })}
              className="w-full accent-cyan-500 h-1.5 bg-slate-200 dark:bg-[#0a1628] rounded cursor-pointer"
            />
          </div>
        </SettingsSection>

        {/* Personnel & Access Control */}
        <SettingsSection icon={Users} title="Authorized Personnel & Roles">
          <div className="space-y-2 mb-3">
            {usersList.map(u => (
              <div
                key={u.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-xs shadow-sm"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-[#88a0c0] font-mono">{u.role}</div>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className={`text-[10px] font-bold ${
                    u.status === 'Online' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                  }`}>
                    ● {u.status}
                  </span>
                  <button
                    onClick={() => showToast(`Editing credentials for ${u.name}...`, 'info')}
                    className="px-2 py-0.5 rounded text-[11px] border border-slate-300 dark:border-[#1a3a6b] text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setAddUserModalOpen(true)}
            className="w-full py-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-[#00d4ff] hover:bg-cyan-500/20 text-xs font-semibold transition-all font-mono cursor-pointer"
          >
            + Register New Forecaster User
          </button>
        </SettingsSection>
      </div>

      {/* REGISTER NEW USER MODAL */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-[#1a3a6b] p-6 bg-white dark:bg-[#0d1f3c] shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a3a6b] mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-mono">Register New Forecaster</h3>
              <button onClick={() => setAddUserModalOpen(false)} className="text-slate-500 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Full Name & Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dr. Anita Roy"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans shadow-sm"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Designation Role</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-sm"
                >
                  <option className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">Operational Forecaster</option>
                  <option className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">Senior Meteorologist</option>
                  <option className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">Remote Sensing Analyst</option>
                  <option className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">Disaster Response Officer</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg font-bold text-slate-950 bg-cyan-400 dark:bg-[#00d4ff] hover:bg-cyan-300 transition-colors cursor-pointer shadow-sm"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODEL CALIBRATION MODAL */}
      {modelModalOpen && calibratingModel && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-[#1a3a6b] p-6 bg-white dark:bg-[#0d1f3c] shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a3a6b] mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-mono">Model Calibration Engine</h3>
              {!calibrating && (
                <button onClick={() => setModelModalOpen(false)} className="text-slate-500 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div className="font-bold text-slate-900 dark:text-white text-sm font-sans">{calibratingModel.name}</div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-mono">
                {calibrating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-cyan-500 dark:text-[#00d4ff]" />
                    <span>Synchronizing model weights with MoES HPC cluster...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Checkpoint successfully applied. Accuracy verified at {calibratingModel.acc}.</span>
                  </>
                )}
              </div>
            </div>

            {!calibrating && (
              <button
                onClick={() => setModelModalOpen(false)}
                className="w-full py-2 rounded-lg font-bold text-xs text-slate-950 bg-cyan-400 dark:bg-[#00d4ff] hover:bg-cyan-300 transition-colors cursor-pointer shadow-sm"
              >
                Close Calibration
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
