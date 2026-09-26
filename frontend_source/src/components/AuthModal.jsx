import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X, Lock, Mail, User, Shield, Phone, MapPin, CheckCircle,
  AlertCircle, ArrowRight, Sparkles, Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', initialRole = 'forecaster' }) {
  const [activeTab, setActiveTab] = useState(initialMode); // 'login' | 'signup'
  const [loginRole, setLoginRole] = useState(initialRole); // 'forecaster' | 'citizen'
  const [signupRole, setSignupRole] = useState(initialRole === 'citizen' ? 'Citizen' : 'Operational Forecaster');

  const { login, signup, loginAsDemo, loginAsCitizen } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    district: 'Puri',
    password: '',
    confirmPassword: '',
    role: 'Operational Forecaster',
    department: 'India Meteorological Department (IMD)',
    station: 'New Delhi HQ',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const navigateAfterAuth = (user) => {
    onClose();
    const from = location.state?.from?.pathname;
    if (from && from !== '/login' && from !== '/') {
      if (user.role === 'Citizen' && from.startsWith('/citizen')) {
        navigate(from, { replace: true });
        return;
      }
      if (user.role !== 'Citizen' && !from.startsWith('/citizen')) {
        navigate(from, { replace: true });
        return;
      }
    }
    if (user.role === 'Citizen') {
      navigate('/citizen/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    const email = loginEmail.trim() || (loginRole === 'citizen' ? 'citizen@coastal.in' : 'dr.kumar@imd.gov.in');
    const pass = loginPassword.trim() || 'password123';

    setLoading(true);
    try {
      const user = login(email, pass);
      showToast(`Welcome back, ${user.name}! Authenticated to ${user.role === 'Citizen' ? 'Citizen Safety Portal' : 'Command Center'}.`, 'success');
      navigateAfterAuth(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!signupData.name || !signupData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const isCitizen = signupRole === 'Citizen';
      const user = signup({
        name: signupData.name,
        email: signupData.email || (isCitizen ? `${signupData.name.toLowerCase().replace(/\s+/g, '')}@citizen.in` : `${signupData.name.toLowerCase().replace(/\s+/g, '')}@imd.gov.in`),
        phone: signupData.phone,
        district: signupData.district,
        password: signupData.password,
        role: isCitizen ? 'Citizen' : signupRole,
        department: isCitizen ? 'Civilian / Coastal Resident' : (signupData.department || 'India Meteorological Department (IMD)'),
        station: isCitizen ? `${signupData.district || 'Puri'} Sector` : (signupData.station || 'Regional Meteorological Centre'),
      });
      showToast(`Account registered successfully for ${user.name}!`, 'success');
      navigateAfterAuth(user);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoKey, label) => {
    setError('');
    let user;
    if (demoKey === 'citizen') {
      user = loginAsCitizen();
    } else {
      user = loginAsDemo(demoKey);
    }
    showToast(`Authenticated as ${user.name} (${label})`, 'info');
    navigateAfterAuth(user);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] transition-colors"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black bg-gradient-to-br from-[#00d4ff] to-[#0066cc] text-slate-950 shadow-md">
              IMD
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                <span>METEORA™ Access Gateway</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-[#00d4ff] border border-cyan-300 dark:border-cyan-500/40">
                  Dual-Portal
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#88a0c0] font-mono">
                Ministry of Earth Sciences · MoES / IMD
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#102a4c] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle: Sign In vs Register */}
        <div className="flex border-b border-slate-200 dark:border-[#1a3a6b] text-xs font-bold font-mono bg-slate-100 dark:bg-[#0a1628] transition-colors">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 cursor-pointer ${
              activeTab === 'login'
                ? 'border-cyan-500 text-cyan-700 dark:text-[#00d4ff] bg-white dark:bg-[#0d1f3c]'
                : 'border-transparent text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In to Terminal
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setError(''); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 cursor-pointer ${
              activeTab === 'signup'
                ? 'border-cyan-500 text-cyan-700 dark:text-[#00d4ff] bg-white dark:bg-[#0d1f3c]'
                : 'border-transparent text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto font-mono space-y-4">
          {error && (
            <div className="p-3 rounded-xl flex items-start gap-2 text-xs border border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Section */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] transition-colors">
            <div className="text-[11px] font-bold text-slate-700 dark:text-[#88a0c0] uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield size={13} className="text-cyan-600 dark:text-[#00d4ff]" />
                <span>Instant 1-Click Role Access</span>
              </span>
              <span className="text-[10px] text-cyan-600 dark:text-[#00d4ff] font-normal">No password required</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('kumar', 'Senior Meteorologist')}
                className="text-xs p-2.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] text-left hover:border-cyan-500 cursor-pointer shadow-sm hover:scale-[1.02] transition-all"
              >
                <div className="font-bold text-slate-900 dark:text-white truncate">Dr. M. Kumar</div>
                <div className="text-[10px] text-cyan-700 dark:text-cyan-400 truncate">Senior Meteorologist (IMD)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('citizen', 'Coastal Resident')}
                className="text-xs p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-500/40 bg-white dark:bg-[#0d1f3c] text-left hover:border-emerald-500 cursor-pointer shadow-sm hover:scale-[1.02] transition-all"
              >
                <div className="font-bold text-slate-900 dark:text-white truncate">Rajesh Mohapatra</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate">Citizen · Puri Sector</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('sharma', 'Operational Forecaster')}
                className="text-xs p-2.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] text-left hover:border-cyan-500 cursor-pointer shadow-sm hover:scale-[1.02] transition-all"
              >
                <div className="font-bold text-slate-900 dark:text-white truncate">Dr. P. Sharma</div>
                <div className="text-[10px] text-slate-500 dark:text-[#88a0c0] truncate">Forecaster · Kolkata ACWC</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin', 'Disaster Admin')}
                className="text-xs p-2.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] text-left hover:border-cyan-500 cursor-pointer shadow-sm hover:scale-[1.02] transition-all"
              >
                <div className="font-bold text-slate-900 dark:text-white truncate">Disaster Admin</div>
                <div className="text-[10px] text-slate-500 dark:text-[#88a0c0] truncate">MoES HQ Authority</div>
              </button>
            </div>
          </div>

          {/* 1. SIGN IN TAB */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Portal Selector Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-100 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b]">
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole('forecaster');
                    setLoginEmail('dr.kumar@imd.gov.in');
                    setLoginPassword('password123');
                  }}
                  className={`py-1.5 text-xs rounded-md font-bold transition-all cursor-pointer ${
                    loginRole === 'forecaster'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Forecaster / Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole('citizen');
                    setLoginEmail('citizen@coastal.in');
                    setLoginPassword('password123');
                  }}
                  className={`py-1.5 text-xs rounded-md font-bold transition-all cursor-pointer ${
                    loginRole === 'citizen'
                      ? 'bg-emerald-500 text-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Citizen / Public
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-700 dark:text-[#88a0c0] font-medium block mb-1">
                  {loginRole === 'citizen' ? 'Email or Registered ID' : 'Official IMD / MoES Email'}
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#88a0c0]" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder={loginRole === 'citizen' ? 'citizen@coastal.in' : 'dr.kumar@imd.gov.in'}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-700 dark:text-[#88a0c0] font-medium block">Password</label>
                  <span
                    className="text-[11px] text-cyan-600 dark:text-[#00d4ff] cursor-pointer hover:underline"
                    onClick={() => {
                      if (loginRole === 'citizen') {
                        setLoginEmail('citizen@coastal.in');
                      } else {
                        setLoginEmail('dr.kumar@imd.gov.in');
                      }
                      setLoginPassword('password123');
                    }}
                  >
                    Auto-fill default
                  </span>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#88a0c0]" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#88a0c0]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-cyan-500 rounded" />
                  <span>Remember session</span>
                </label>
                <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">24/7 Support Guide</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 ${
                  loginRole === 'citizen'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white dark:text-slate-950 shadow-emerald-500/20'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                }`}
              >
                <span>{loading ? 'Authenticating...' : loginRole === 'citizen' ? 'Enter Citizen Safety Portal' : 'Sign In to Command Center'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            /* 2. SIGNUP TAB */
            <form onSubmit={handleSignupSubmit} className="space-y-3 font-mono">
              {/* Role Selection */}
              <div>
                <label className="text-xs text-slate-700 dark:text-[#88a0c0] font-medium block mb-1">Account Category</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-100 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b]">
                  <button
                    type="button"
                    onClick={() => setSignupRole('Citizen')}
                    className={`py-1.5 text-xs rounded-md font-bold transition-all cursor-pointer ${
                      signupRole === 'Citizen'
                        ? 'bg-emerald-500 text-white dark:text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Coastal Resident
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('Operational Forecaster')}
                    className={`py-1.5 text-xs rounded-md font-bold transition-all cursor-pointer ${
                      signupRole !== 'Citizen'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Forecaster / Admin
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 dark:text-[#88a0c0] font-medium block mb-1">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#88a0c0]" />
                  <input
                    type="text"
                    required
                    value={signupData.name}
                    onChange={e => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder={signupRole === 'Citizen' ? 'e.g. Rajesh Mohapatra' : 'e.g. Dr. Rajesh Verma'}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans shadow-sm"
                  />
                </div>
              </div>

              {signupRole === 'Citizen' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-700 dark:text-[#88a0c0] font-medium block mb-1">Mobile for SMS</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#88a0c0]" />
                      <input
                        type="tel"
                        required
                        value={signupData.phone}
                        onChange={e => setSignupData({ ...signupData, phone: e.target.value })}
                        placeholder="+91 Mobile"
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 dark:text-[#88a0c0] font-medium block mb-1">District</label>
                    <select
                      value={signupData.district}
                      onChange={e => setSignupData({ ...signupData, district: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs text-slate-900 dark:text-white shadow-sm"
                    >
                      <option value="Puri">Puri (Odisha)</option>
                      <option value="Jagatsinghpur">Jagatsinghpur (Odisha)</option>
                      <option value="Kendrapara">Kendrapara (Odisha)</option>
                      <option value="Balasore">Balasore (Odisha)</option>
                      <option value="East Midnapore">Digha (West Bengal)</option>
                      <option value="Visakhapatnam">Visakhapatnam (Andhra)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-slate-700 dark:text-[#88a0c0] font-medium block mb-1">Official Email (@imd.gov.in / @moes.gov.in)</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#88a0c0]" />
                      <input
                        type="email"
                        required
                        value={signupData.email}
                        onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                        placeholder="r.verma@imd.gov.in"
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-700 dark:text-[#88a0c0] font-medium block mb-1">Designation</label>
                      <select
                        value={signupRole}
                        onChange={e => setSignupRole(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs text-slate-900 dark:text-white shadow-sm"
                      >
                        <option>Operational Forecaster</option>
                        <option>Senior Meteorologist</option>
                        <option>Disaster Response Officer</option>
                        <option>System Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 dark:text-[#88a0c0] font-medium block mb-1">Station / Unit</label>
                      <input
                        type="text"
                        value={signupData.station}
                        onChange={e => setSignupData({ ...signupData, station: e.target.value })}
                        placeholder="New Delhi HQ"
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs text-slate-900 dark:text-white shadow-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-700 dark:text-[#88a0c0] font-medium block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={signupData.password}
                    onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 dark:text-[#88a0c0] font-medium block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={signupData.confirmPassword}
                    onChange={e => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-[#88a0c0] flex items-start gap-1.5 pt-1">
                <CheckCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>By registering, you establish authenticated access to the official METEORA early warning framework.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 mt-2 ${
                  signupRole === 'Citizen'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white dark:text-slate-950 shadow-emerald-500/20'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                }`}
              >
                <span>{loading ? 'Registering Account...' : signupRole === 'Citizen' ? 'Register & Open Citizen Portal' : 'Register & Enter Command Center'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-5 py-2.5 text-center border-t border-slate-200 dark:border-[#1a3a6b] text-[11px] text-slate-500 dark:text-[#88a0c0] bg-slate-50 dark:bg-[#0a1628] font-mono transition-colors">
          MoES / IMD Tropical Cyclone Warning Framework · National Security Isolation
        </div>
      </div>
    </div>
  );
}
