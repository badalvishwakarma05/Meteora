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
      className={`rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-lg ${
        isSelected
          ? 'border-[#00d4ff] bg-[#0f274a] shadow-cyan-500/20 ring-1 ring-[#00d4ff]'
          : 'border-[#1a3a6b] bg-[#0d1f3c] hover:border-[#00d4ff]/60 hover:bg-[#0f2444]'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm tracking-wider">{cyclone.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-cyan-500/30">
              CAT {cyclone.category}
            </span>
            <span className="text-xs font-semibold text-gray-300">{cyclone.status}</span>
          </div>
        </div>
        <div className={`text-[10px] px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          {cfg.label}
        </div>
      </div>

      {/* Telemetry Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3 bg-[#0a1628] p-2.5 rounded-xl border border-[#1a3a6b]/60">
        <div className="flex items-center gap-1.5 text-[#8892a4] text-xs">
          <Wind size={13} className="text-[#00d4ff]" />
          <span>Wind</span>
          <span className="font-mono text-xs font-bold text-white ml-auto">{cyclone.wind} km/h</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#8892a4] text-xs border-l border-[#1a3a6b]/60 pl-2">
          <Gauge size={13} className="text-amber-400" />
          <span>Pressure</span>
          <span className="font-mono text-xs font-bold text-white ml-auto">{cyclone.pressure} hPa</span>
        </div>
      </div>

      {/* Location Coordinates */}
      <div className="flex items-center gap-1.5 mb-2.5 text-xs text-[#8892a4]">
        <MapPin size={13} className="text-red-400" />
        <span>{cyclone.basin}</span>
        <span className="font-mono text-xs ml-auto font-bold text-cyan-300">
          {cyclone.lat}°N, {cyclone.lon}°E
        </span>
      </div>

      {/* Landfall Warning Box if applicable */}
      {cyclone.landfall && (
        <div className="text-xs mb-3 p-2.5 rounded-xl bg-red-950/40 border border-red-500/40">
          <div className="font-bold text-red-400 text-[11px] tracking-wider">⚠ LANDFALL IMMINENT</div>
          <div className="text-gray-200 font-medium text-xs mt-0.5">{cyclone.landfall}</div>
          <div className="text-gray-400 text-[10px] mt-0.5">{cyclone.landfallLocation}</div>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onViewDetails && onViewDetails(cyclone); }}
        className="w-full text-xs font-bold py-2 rounded-xl border border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-[#00d4ff] hover:text-black transition-all shadow-sm cursor-pointer"
      >
        View Trajectory & Ensemble →
      </button>
    </div>
  );
}
