import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Mail, User, Shield, Building, MapPin, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const { login, signup, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Operational Forecaster',
    department: 'India Meteorological Department (IMD)',
    station: 'New Delhi HQ',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = login(loginEmail, loginPassword);
      showToast(`Welcome back, ${user.name}! Access granted to METEORA Command Center.`, 'success');
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!signupData.name || !signupData.email || !signupData.password) {
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
      const user = signup(signupData);
      showToast(`Account created successfully for ${user.name}! Logged into Command Center.`, 'success');
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoKey, label) => {
    setError('');
    const user = loginAsDemo(demoKey);
    showToast(`Authenticated as ${user.name} (${label})`, 'info');
    onClose();
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200 transition-colors"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-cyan-500 text-slate-950">
              IMD
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest text-slate-900 dark:text-white font-mono">METEORA Access Gateway</div>
              <div className="text-[11px] text-slate-500 dark:text-[#88a0c0] font-mono">Ministry of Earth Sciences · MoES / IMD</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#102a4c] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 dark:border-[#1a3a6b] text-xs font-bold font-mono bg-slate-100 dark:bg-[#0a1628] transition-colors">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 cursor-pointer ${
              mode === 'login'
                ? 'border-cyan-500 text-cyan-700 dark:text-[#00d4ff] bg-white dark:bg-[#0d1f3c]'
                : 'border-transparent text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In to Terminal
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 cursor-pointer ${
              mode === 'signup'
                ? 'border-cyan-500 text-cyan-700 dark:text-[#00d4ff] bg-white dark:bg-[#0d1f3c]'
                : 'border-transparent text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Register New Forecaster
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto font-mono">
          {error && (
            <div className="mb-4 p-3 rounded-lg flex items-start gap-2 text-xs border border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Buttons */}
          <div className="mb-5 p-3 rounded-lg border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] transition-colors">
            <div className="text-[11px] font-bold text-slate-600 dark:text-[#88a0c0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield size={12} className="text-cyan-600 dark:text-[#00d4ff]" />
              <span>Instant 1-Click Demo Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('kumar', 'Senior Meteorologist')}
                className="text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] text-left transition-all hover:border-cyan-500 cursor-pointer shadow-sm"
              >
                <div className="font-semibold text-slate-900 dark:text-white truncate">Dr. M. Kumar</div>
                <div className="text-[10px] text-slate-500 dark:text-[#88a0c0] truncate">Senior Meteorologist</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin', 'Command Admin')}
                className="text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] text-left transition-all hover:border-cyan-500 cursor-pointer shadow-sm"
              >
                <div className="font-semibold text-slate-900 dark:text-white truncate">Disaster Admin</div>
                <div className="text-[10px] text-slate-500 dark:text-[#88a0c0] truncate">MoES HQ Authority</div>
              </button>
            </div>
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Official Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#88a0c0]" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="e.g. dr.kumar@imd.gov.in"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium block">Password</label>
                  <span className="text-[11px] text-cyan-600 dark:text-[#00d4ff] cursor-pointer hover:underline"
                        onClick={() => { setLoginEmail('dr.kumar@imd.gov.in'); setLoginPassword('password123'); }}>
                    Auto-fill Demo Pass
                  </span>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#88a0c0]" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#88a0c0]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-cyan-500 rounded" />
                  <span>Remember session</span>
                </label>
                <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Station authorization guide</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg font-bold text-sm text-slate-950 flex items-center justify-center gap-2 transition-all hover:bg-cyan-400 disabled:opacity-50 bg-cyan-500 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Command Center'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 font-mono">
              <div>
                <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Full Name & Title</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#88a0c0]" />
                  <input
                    type="text"
                    required
                    value={signupData.name}
                    onChange={e => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Verma"
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Official Email (@imd.gov.in / @moes.gov.in)</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#88a0c0]" />
                  <input
                    type="email"
                    required
                    value={signupData.email}
                    onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="r.verma@imd.gov.in"
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Role</label>
                  <select
                    value={signupData.role}
                    onChange={e => setSignupData({ ...signupData, role: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs text-slate-900 dark:text-white shadow-sm"
                  >
                    <option className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">Operational Forecaster</option>
                    <option className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">Senior Meteorologist</option>
                    <option className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">Disaster Response Officer</option>
                    <option className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">Remote Sensing Analyst</option>
                    <option className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Department</label>
                  <input
                    type="text"
                    value={signupData.department}
                    onChange={e => setSignupData({ ...signupData, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs text-slate-900 dark:text-white shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#88a0c0]" />
                    <input
                      type="password"
                      required
                      value={signupData.password}
                      onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                      placeholder="Min 6 chars"
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#88a0c0]" />
                    <input
                      type="password"
                      required
                      value={signupData.confirmPassword}
                      onChange={e => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0a1628] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-[#88a0c0] flex items-start gap-1.5 pt-1">
                <CheckCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>By registering, you confirm authorization under Ministry of Earth Sciences meteorological protocols.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg font-bold text-sm text-slate-950 flex items-center justify-center gap-2 transition-all hover:bg-cyan-400 disabled:opacity-50 mt-2 bg-cyan-500 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <span>{loading ? 'Creating Credentials...' : 'Register & Enter Command Center'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 text-center border-t border-slate-200 dark:border-[#1a3a6b] text-[11px] text-slate-500 dark:text-[#88a0c0] bg-slate-50 dark:bg-[#0a1628] font-mono transition-colors">
          National Disaster Management Theme · MoES Official Prototype
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}
