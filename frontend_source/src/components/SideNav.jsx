import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Satellite, ScanLine, Tags, Route,
  Database, FileText, Settings, ChevronLeft, ChevronRight,
  Zap, LogOut
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/satellite',     icon: Satellite,       label: 'Satellite Feed' },
  { to: '/detection',     icon: ScanLine,        label: 'Detection' },
  { to: '/classification',icon: Tags,            label: 'Classification' },
  { to: '/forecast',      icon: Route,           label: 'Track & Forecast' },
  { to: '/historical',    icon: Database,        label: 'Historical Data' },
  { to: '/reports',       icon: FileText,        label: 'Reports' },
  { to: '/settings',      icon: Settings,        label: 'Settings' },
];

export default function SideNav() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    showToast('Signed out of METEORA.', 'info');
    navigate('/');
  };

  return (
    <aside
      className={clsx(
        'flex flex-row md:flex-col w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] transition-all duration-300 relative z-20 select-none shrink-0 overflow-x-auto md:overflow-x-visible shadow-sm',
        collapsed ? 'md:w-18' : 'md:w-60'
      )}
    >
      {/* Brand area (desktop) */}
      <div className="hidden md:flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-[#1a3a6b]">
        <div
          onClick={() => navigate('/dashboard')}
          className="cursor-pointer flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-cyan-500/20 border border-[#00d4ff]/40"
          style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0066cc 100%)' }}
        >
          <Zap size={16} className="text-black" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span className="font-black text-sm tracking-wider block truncate text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-cyan-100 dark:to-[#00d4ff] dark:bg-clip-text">
              METEORA
            </span>
            <span className="text-[10px] text-slate-500 dark:text-[#8892a4] font-medium block truncate" title="Predict. Prepare. Protect.">
              Predict. Prepare. Protect.
            </span>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-row md:flex-col flex-1 py-2 md:py-4 px-2 md:px-3 overflow-x-auto md:overflow-y-auto space-x-1.5 md:space-x-0 md:space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2 md:gap-3 px-3 md:px-3.5 py-2 md:py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 border shrink-0 whitespace-nowrap',
                isActive
                  ? 'bg-cyan-50 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-blue-500/10 text-cyan-700 dark:text-[#00d4ff] border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-[#8892a4] border-transparent hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className={clsx('truncate', collapsed && 'md:hidden')}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <button
        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full border border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] items-center justify-center z-30 transition-all hover:border-cyan-500 dark:hover:border-[#00d4ff] hover:text-cyan-600 dark:hover:text-[#00d4ff] text-slate-600 dark:text-[#8892a4] shadow-md cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Bottom Sign Out Option (desktop) */}
      <div className="hidden md:block p-3 border-t border-slate-200 dark:border-[#1a3a6b]">
        <button
          onClick={handleSignOut}
          className={clsx(
            'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#8892a4] hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all cursor-pointer',
            collapsed && 'justify-center px-0'
          )}
          title="Sign Out"
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span className="truncate">Sign Out</span>}
        </button>

        {!collapsed && (
          <div className="mt-2 text-[10px] text-slate-400 dark:text-[#8892a4]/60 text-center font-mono">
            IMD · RSMC v2.4
          </div>
        )}
      </div>
    </aside>
  );
}
