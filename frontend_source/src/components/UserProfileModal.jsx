import { useState, useEffect } from 'react';
import {
  X, User, Phone, MapPin, Shield, CheckCircle2, AlertTriangle,
  Mail, Building, Radio, LifeBuoy, Bell, Save, LogOut, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDisasterAlert } from '../context/DisasterAlertContext';
import { useToast } from '../context/ToastContext';
import { CITIZEN_TRANSLATIONS } from '../data/citizenTranslations';

export default function UserProfileModal({ isOpen, onClose }) {
  const { currentUser, isCitizen, updateProfile, logout } = useAuth();
  const { language, shelters, sosBeacons } = useDisasterAlert();
  const { showToast } = useToast();

  const t = CITIZEN_TRANSLATIONS[language] || CITIZEN_TRANSLATIONS.English;

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    district: currentUser?.district || 'Puri',
    address: currentUser?.address || 'Near Grand Road / Light House Colony',
    familyMembers: currentUser?.familyMembers || 4,
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        district: currentUser.district || 'Puri',
        address: currentUser.address || 'Near Grand Road / Light House Colony',
        familyMembers: currentUser.familyMembers || 4,
      });
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    showToast('Profile information updated successfully.', 'success');
  };

  const handleSignOut = () => {
    onClose();
    logout();
    showToast('Logged out successfully.', 'info');
  };

  const userSOSCount = sosBeacons?.filter(
    b => b.name?.toLowerCase() === currentUser?.name?.toLowerCase() || b.phone === currentUser?.phone
  ).length || 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl border border-[#1a3a6b] bg-[#0d1f3c] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a3a6b] bg-[#0a1628] font-mono">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm bg-gradient-to-br from-cyan-400 to-blue-600 text-[#050d1a]"
            >
              <User size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {isCitizen ? 'Citizen Safety Profile & Emergency ID' : 'Official Meteorological Personnel Profile'}
              </h2>
              <div className="text-[11px] text-[#88a0c0]">
                {isCitizen
                  ? 'National Disaster Management Authority (NDMA) Citizen Registry'
                  : 'India Meteorological Department · Ministry of Earth Sciences'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#88a0c0] hover:text-white hover:bg-[#102a4c] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 font-mono">
          {/* User Identity Hero Card */}
          <div className="p-5 rounded-2xl bg-[#0a1628] border border-[#1a3a6b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-inner">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg ${
                  isCitizen
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950'
                    : 'bg-gradient-to-br from-cyan-400 to-blue-600 text-[#050d1a]'
                }`}
              >
                {currentUser?.avatarInitials || 'CZ'}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white font-sans">{currentUser?.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded font-mono uppercase tracking-wider border ${
                      isCitizen
                        ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                        : 'border-cyan-500/40 bg-cyan-500/20 text-[#00d4ff]'
                    }`}
                  >
                    {isCitizen ? 'VERIFIED CITIZEN' : currentUser?.role || 'OFFICIAL FORECASTER'}
                  </span>
                </div>

                <div className="text-xs text-[#88a0c0] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Mail size={12} className="text-[#00d4ff]" />
                    {currentUser?.email}
                  </span>
                  {currentUser?.phone && (
                    <span className="flex items-center gap-1 text-slate-300 font-mono">
                      <Phone size={12} className="text-emerald-400" />
                      {currentUser?.phone}
                    </span>
                  )}
                  {currentUser?.district && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin size={12} className="text-amber-400" />
                      {currentUser?.district}, Odisha
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit / View Toggle */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-[#1a3a6b] bg-[#0d1f3c] text-white hover:border-cyan-500/40 transition-colors cursor-pointer self-stretch sm:self-auto text-center"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Information'}
            </button>
          </div>

          {/* Form Mode or Display Mode */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 p-5 rounded-2xl bg-[#0a1628] border border-[#1a3a6b]">
              <div className="font-bold text-white text-xs uppercase tracking-wider border-b border-[#1a3a6b] pb-2">
                Edit Personal & Contact Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#88a0c0] uppercase font-bold block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1f3c] border border-[#1a3a6b] text-xs text-white focus:outline-none focus:border-[#00d4ff] font-sans"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#88a0c0] uppercase font-bold block mb-1">Mobile Phone (For Alerts)</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1f3c] border border-[#1a3a6b] text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#88a0c0] uppercase font-bold block mb-1">Coastal District</label>
                  <select
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1f3c] border border-[#1a3a6b] text-xs text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer"
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
                  <label className="text-xs text-[#88a0c0] uppercase font-bold block mb-1">Household / Family Count</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.familyMembers}
                    onChange={e => setFormData({ ...formData, familyMembers: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1f3c] border border-[#1a3a6b] text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#88a0c0] uppercase font-bold block mb-1">Exact Address / Landmark</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1f3c] border border-[#1a3a6b] text-xs text-white focus:outline-none focus:border-[#00d4ff] font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#00d4ff] hover:bg-cyan-300 text-[#050d1a] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-cyan-500/20"
              >
                <Save size={14} />
                <span>Save Profile Changes</span>
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Card 1: Emergency Information */}
              <div className="p-4 rounded-2xl bg-[#0a1628] border border-[#1a3a6b] space-y-3 shadow-inner">
                <div className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-[#1a3a6b] pb-1.5 flex items-center gap-1.5">
                  <Shield size={13} className="text-[#00d4ff]" />
                  <span>Disaster Profile & Evacuation</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[#88a0c0] text-[10px] uppercase font-bold block">Assigned Coastal Sector</span>
                    <span className="font-bold text-white text-xs">{currentUser?.district || 'Puri'} Coastal Risk Zone 1</span>
                  </div>
                  <div>
                    <span className="text-[#88a0c0] text-[10px] uppercase font-bold block">Local Address / Village</span>
                    <span className="text-slate-300 text-xs font-sans">{currentUser?.address || 'Near Grand Road / Light House Colony'}</span>
                  </div>
                  <div>
                    <span className="text-[#88a0c0] text-[10px] uppercase font-bold block">Household Members</span>
                    <span className="font-bold text-[#00d4ff] font-mono text-xs">{currentUser?.familyMembers || 4} Persons Registered</span>
                  </div>
                  <div>
                    <span className="text-[#88a0c0] text-[10px] uppercase font-bold block">Nearest Designated Shelter</span>
                    <span className="text-emerald-400 text-xs font-sans">{shelters?.[0]?.name || 'Puri Town Hall MPCS'} (1.8 km)</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Security & Alert Network */}
              <div className="p-4 rounded-2xl bg-[#0a1628] border border-[#1a3a6b] space-y-3 shadow-inner">
                <div className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-[#1a3a6b] pb-1.5 flex items-center gap-1.5">
                  <Bell size={13} className="text-amber-400" />
                  <span>Emergency Alert Network</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#88a0c0] text-[11px]">Offline SMS Broadcast:</span>
                    <span className="text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1">
                      <Check size={12} /> Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#88a0c0] text-[11px]">Primary Alert Language:</span>
                    <span className="text-[#00d4ff] font-bold font-mono text-[11px]">{language}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#88a0c0] text-[11px]">Dispatched SOS Alerts:</span>
                    <span className="text-amber-400 font-bold font-mono text-[11px]">{userSOSCount} Beacons</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#88a0c0] text-[11px]">Role Authority:</span>
                    <span className="text-slate-300 text-[11px]">{currentUser?.department || 'Civilian Resident'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1a3a6b] text-[10px] text-[#88a0c0]">
                  Registered with State Emergency Operation Centre (SEOC) & National Disaster Response Force.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1a3a6b] bg-[#0a1628] flex items-center justify-between gap-3 font-mono">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#88a0c0] hover:text-white hover:bg-[#102a4c] border border-[#1a3a6b] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out of Portal</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00d4ff] hover:bg-cyan-300 text-[#050d1a] cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
