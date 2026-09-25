import { Wind, Gauge, MapPin } from 'lucide-react';

const severityConfig = {
  severe:   { label: 'CRITICAL SEVERE', bg: 'bg-red-500/20', text: 'text-red-400 font-black', border: 'border-red-500/40' },
  moderate: { label: 'INTERMEDIATE ADVISORY', bg: 'bg-yellow-500/20', text: 'text-yellow-300 font-bold', border: 'border-yellow-500/40' },
  low:      { label: 'NORMAL / SAFE WATCH', bg: 'bg-sky-500/20', text: 'text-sky-400 font-medium', border: 'border-sky-500/40' },
};

export default function CycloneCard({ cyclone, onViewDetails, isSelected }) {
  const cfg = severityConfig[cyclone.severity] || severityConfig.low;

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(cyclone)}
      className={`rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-md ${
        isSelected
          ? 'border-cyan-500 bg-cyan-50/80 dark:bg-[#0f274a] shadow-cyan-500/20 ring-1 ring-cyan-500'
          : 'border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] hover:border-cyan-500/60 hover:bg-slate-50 dark:hover:bg-[#0f2444]'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white text-sm tracking-wider">{cyclone.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30">
              CAT {cyclone.category}
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">{cyclone.status}</span>
          </div>
        </div>
        <div className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          {cfg.label}
        </div>
      </div>

      {/* Telemetry Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-50 dark:bg-[#0a1628] p-2.5 rounded-xl border border-slate-200 dark:border-[#1a3a6b]/60">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#8892a4] text-xs">
          <Wind size={13} className="text-cyan-600 dark:text-[#00d4ff]" />
          <span>Wind</span>
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white ml-auto">{cyclone.wind} km/h</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#8892a4] text-xs border-l border-slate-200 dark:border-[#1a3a6b]/60 pl-2">
          <Gauge size={13} className="text-amber-500 dark:text-amber-400" />
          <span>Pressure</span>
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white ml-auto">{cyclone.pressure} hPa</span>
        </div>
      </div>

      {/* Location Coordinates */}
      <div className="flex items-center gap-1.5 mb-2.5 text-xs text-slate-500 dark:text-[#8892a4]">
        <MapPin size={13} className="text-red-500 dark:text-red-400" />
        <span>{cyclone.basin}</span>
        <span className="font-mono text-xs ml-auto font-bold text-cyan-700 dark:text-cyan-300">
          {cyclone.lat}°N, {cyclone.lon}°E
        </span>
      </div>

      {/* Landfall Warning Box if applicable */}
      {cyclone.landfall && (
        <div className="text-xs mb-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/40">
          <div className="font-bold text-red-600 dark:text-red-400 text-[11px] tracking-wider">⚠ LANDFALL IMMINENT</div>
          <div className="text-slate-800 dark:text-gray-200 font-medium text-xs mt-0.5">{cyclone.landfall}</div>
          <div className="text-slate-500 dark:text-gray-400 text-[10px] mt-0.5">{cyclone.landfallLocation}</div>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onViewDetails && onViewDetails(cyclone); }}
        className="w-full text-xs font-bold py-2 rounded-xl border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 hover:bg-[#00d4ff] hover:text-black transition-all shadow-sm cursor-pointer"
      >
        View Trajectory &amp; Ensemble &rarr;
      </button>
    </div>
  );
}
