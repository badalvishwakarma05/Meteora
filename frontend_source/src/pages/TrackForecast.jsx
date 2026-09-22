import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Download, Play, AlertTriangle, MapPin, Wind, Droplets, RefreshCw, X, ShieldAlert, CheckCircle2, Navigation, AlertCircle } from 'lucide-react';
import { trackData, intensityHistory, ensembleModels, activeCyclones } from '../data/mockData';
import CycloneMap from '../components/CycloneMap';
import { useToast } from '../context/ToastContext';
import { useDisasterAlert } from '../context/DisasterAlertContext';
import { runCityImpactPrediction } from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded px-3 py-2 text-xs bg-[#0a1628]/95 border border-[#1a3a6b] shadow-xl">
      <div className="text-[#88a0c0] font-mono">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="font-mono font-bold text-[#00d4ff]">
          {p.value} km/h
        </div>
      ))}
    </div>
  );
};

export default function TrackForecast() {
  const { showToast } = useToast();
  const location = useLocation();
  const initCyclone = location.state?.cyclone || activeCyclones[0];
  const [selected, setSelected] = useState(initCyclone.id);
  const cyclone = activeCyclones.find(c => c.id === selected) || activeCyclones[0];

  const [isPredicting, setIsPredicting] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [impactModalOpen, setImpactModalOpen] = useState(false);
  const [cityImpacts, setCityImpacts] = useState([
    { city: 'Puri', state: 'Odisha', distance_km: 45, eta_hours: 18, predicted_wind_kmh: 185, predicted_surge_m: 3.8, danger_score: 94, alert_level: 'RED ALERT', severity_code: 'RED', action_required: 'Immediate Evacuation to Shelter' },
    { city: 'Bhubaneswar', state: 'Odisha', distance_km: 82, eta_hours: 22, predicted_wind_kmh: 140, predicted_surge_m: 1.2, danger_score: 82, alert_level: 'HIGH ALERT', severity_code: 'AMBER', action_required: 'Stay Indoors & Stock Supplies' },
    { city: 'Visakhapatnam', state: 'Andhra Pradesh', distance_km: 195, eta_hours: 36, predicted_wind_kmh: 95, predicted_surge_m: 0.5, danger_score: 58, alert_level: 'MODERATE WATCH', severity_code: 'CYAN', action_required: 'Fisherfolk Warning Hoisted' },
  ]);
  const [historicalAnalogues, setHistoricalAnalogues] = useState([]);

  const [alertForm, setAlertForm] = useState({
    stage: 'RED (Warning / Action)',
    districts: 'Puri, Jagatsinghpur, Kendrapara, Bhadrak, Baleshwar',
    evacuationCount: '150,000 Persons',
  });

  const { setForecastAlert } = useDisasterAlert();

  useEffect(() => {
    async function loadImpactPredictions() {
      const data = await runCityImpactPrediction(cyclone.lat || 15.4, cyclone.lon || 87.2, cyclone.wind || 175);
      if (data && data.success) {
        setCityImpacts(data.affected_cities || []);
        setHistoricalAnalogues(data.historical_analogues || []);
      }
    }
    loadImpactPredictions();
  }, [cyclone]);

  const handleSelectCyclone = (id) => {
    setSelected(id);
    const storm = activeCyclones.find(c => c.id === id);
    setForecastAlert(id);
    showToast(`Loaded trajectory and ensemble metrics for ${storm?.name || id}. Synchronized with Citizen Portal.`, 'info');
  };

  const handleRunPrediction = async () => {
    setIsPredicting(true);
    showToast('Executing 96-hour multi-model trajectory & city impact inference...', 'info');

    const data = await runCityImpactPrediction(cyclone.lat || 15.4, cyclone.lon || 87.2, cyclone.wind || 175);
    if (data && data.success) {
      setCityImpacts(data.affected_cities || []);
      setHistoricalAnalogues(data.historical_analogues || []);
    }

    setIsPredicting(false);
    showToast('City Landfall Impact & Danger Ratings recalculated. High-risk zones updated.', 'success');
  };

  const handleExportPDF = () => {
    const content = `=====================================================
INDIA METEOROLOGICAL DEPARTMENT
NATIONAL CYCLONE TRACK & LANDFALL ADVISORY
=====================================================
Target System: ${cyclone.name}
Active Classification: ${cyclone.status} (Category ${cyclone.category})
Basin: ${cyclone.basin}
Current Location: Latitude ${cyclone.lat}N, Longitude ${cyclone.lon}E
Estimated Landfall: ${cyclone.landfall || 'Maritime Recurvature'}
Landfall Location: ${cyclone.landfallLocation || 'Open Ocean'}
Peak Landfall Winds: 175 km/h (Gusting to 195 km/h)
Peak Storm Surge: 3.5 - 4.2 meters above astronomical tide
Disaster Warning Stage: RED ALERT (Immediate Action)
Issued: ${new Date().toUTCString()}
Authorized Forecaster: Dr. M. Kumar (Senior Meteorologist, IMD)
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IMD_Cyclone_Advisory_${cyclone.id}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported official advisory document for ${cyclone.name}.`, 'success');
  };

  const handleDispatchAlert = (e) => {
    e.preventDefault();
    setAlertModalOpen(false);
    const level = alertForm.stage.includes('RED') ? 'severe' : alertForm.stage.includes('YELLOW') ? 'intermediate' : 'safe';
    setForecastAlert(level, { id: cyclone.id, name: cyclone.name });
    showToast(`EMERGENCY ${alertForm.stage} dispatched to NDRF, SDMA, and Citizen Safety Portal!`, 'warning', 6000);
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-xs text-[#88a0c0] font-mono">Ensemble Guidance & Landfall Prediction</div>
            <h1 className="text-xl font-bold text-white tracking-tight">Track & Forecast Analysis</h1>
          </div>
          {/* Cyclone selector */}
          <select
            value={selected}
            onChange={e => handleSelectCyclone(e.target.value)}
            className="text-xs sm:text-sm font-bold px-3 py-2 rounded-lg border border-[#1a3a6b] bg-[#0d1f3c] text-white cursor-pointer focus:outline-none focus:border-[#00d4ff]"
          >
            {activeCyclones.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-[#1a3a6b] bg-[#0d1f3c] font-semibold text-[#88a0c0] hover:text-white hover:border-cyan-500/40 transition-all"
          >
            <Download size={14} className="text-[#00d4ff]" />
            <span>Export Advisory</span>
          </button>

          <button
            onClick={handleRunPrediction}
            disabled={isPredicting}
            className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg font-bold text-[#050d1a] bg-[#00d4ff] hover:bg-cyan-300 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {isPredicting ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            <span>{isPredicting ? 'Recalculating...' : 'Run AI Prediction'}</span>
          </button>
        </div>
      </div>

      {/* Main Content (2 Columns) */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        {/* Left Column: Map + Track Table */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {/* Map */}
          <div className="h-[350px] sm:h-96 md:h-[420px] min-h-[350px] rounded-xl overflow-hidden border border-[#1a3a6b]">
            <CycloneMap onSelectCyclone={(c) => handleSelectCyclone(c.id)} />
          </div>

          {/* 6-Hourly Track Positions Table */}
          <div className="rounded-xl border border-[#1a3a6b] overflow-hidden bg-[#0d1f3c]">
            <div className="px-4 py-2.5 border-b border-[#1a3a6b] bg-[#0a1628] flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-widest text-[#88a0c0] uppercase font-mono">
                6-Hourly Synoptic Track Sequence ({cyclone.name})
              </h3>
              <span className="text-[11px] font-mono text-[#00d4ff]">* Cyan Italics = AI Neural Projections</span>
            </div>

            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1a3a6b] text-[#88a0c0] text-left uppercase text-[10px] tracking-wider font-mono">
                    <th className="px-3.5 py-2">Date/Time</th>
                    <th className="px-3.5 py-2">Coordinates</th>
                    <th className="px-3.5 py-2">Wind (km/h)</th>
                    <th className="px-3.5 py-2">Pressure (hPa)</th>
                    <th className="px-3.5 py-2">Intensity Category</th>
                    <th className="px-3.5 py-2">Verification Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trackData.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-[#1a3a6b]/60 hover:bg-[#102a4c] transition-colors font-mono ${
                        row.predicted ? 'text-cyan-500 font-semibold italic' : 'text-slate-100'
                      }`}
                    >
                      <td className="px-3.5 py-2">{row.time}</td>
                      <td className="px-3.5 py-2">{row.lat}°N, {row.lon}°E</td>
                      <td className="px-3.5 py-2 font-bold text-white">{row.wind}</td>
                      <td className="px-3.5 py-2 text-[#88a0c0]">{row.pressure}</td>
                      <td className="px-3.5 py-2">
                        <span
                          className="px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-bold text-[#00d4ff]"
                        >
                          CAT {row.category}
                        </span>
                      </td>
                      <td className="px-3.5 py-2">
                        {row.predicted ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ff9500]/20 border border-[#ff9500]/40 text-amber-300">
                            AI PREDICTED
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-[11px] font-semibold">✓ Observed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Intensity Forecast, Ensemble, Landfall Card */}
        <div className="w-full lg:w-96 flex flex-col gap-4 flex-shrink-0">
          {/* Rapid Intensification Alert Banner */}
          <div
            className="rounded-xl p-3.5 border border-amber-500/50 bg-amber-950/30 flex items-start gap-3"
          >
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs text-amber-400 tracking-wider font-mono">
                RAPID INTENSIFICATION WARNING
              </div>
              <div className="text-[11px] text-amber-200 mt-0.5">
                Wind speed increased by +55 km/h in 24 hours. Central convective core stabilized.
              </div>
              <div className="text-[10px] font-mono text-amber-400/80 mt-1 font-semibold">
                Neural Confidence: 87.4%
              </div>
            </div>
          </div>

          {/* AI Coastal City Landfall Danger Matrix */}
          <div className="rounded-xl border border-[#1a3a6b] bg-[#0d1f3c] overflow-hidden">
            <div className="px-4 py-3 bg-[#0a1628] border-b border-[#1a3a6b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-[#00d4ff]" />
                <h3 className="text-xs font-bold tracking-widest text-white uppercase font-mono">
                  Coastal Landfall Danger Matrix
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#00d4ff]">
                Decay Model Active
              </span>
            </div>

            <div className="p-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1a3a6b] text-[#88a0c0] font-mono text-[10px] uppercase">
                    <th className="pb-2 pl-2">City</th>
                    <th className="pb-2">Dist</th>
                    <th className="pb-2">ETA</th>
                    <th className="pb-2">Wind</th>
                    <th className="pb-2">Danger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a3a6b]/60 font-mono">
                  {cityImpacts.slice(0, 5).map((item, idx) => {
                    const isSevere = item.danger_score >= 85;
                    const isModerate = item.danger_score >= 60 && item.danger_score < 85;
                    return (
                      <tr key={idx} className="hover:bg-[#102a4c] transition-colors">
                        <td className="py-2.5 pl-2 font-bold text-white flex items-center gap-1">
                          <MapPin size={11} className={isSevere ? 'text-red-400' : isModerate ? 'text-amber-400' : 'text-[#00d4ff]'} />
                          <span>{item.city}</span>
                          <span className="text-[10px] text-[#88a0c0]">({item.state})</span>
                        </td>
                        <td className="py-2.5 text-[#88a0c0]">{item.distance_km}km</td>
                        <td className="py-2.5 font-semibold text-white">{item.eta_hours}h</td>
                        <td className="py-2.5 font-bold text-white">{item.predicted_wind_kmh}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${
                              isSevere
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : isModerate
                                ? 'bg-amber-500/20 text-yellow-300 border-amber-500/40'
                                : 'bg-cyan-500/20 text-[#00d4ff] border-cyan-500/40'
                            }`}
                          >
                            {item.danger_score} · {item.alert_level.split(' ')[0]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 96-Hour Projected Intensity Chart */}
          <div className="rounded-xl border border-[#1a3a6b] p-4 bg-[#0d1f3c]">
            <h3 className="text-xs font-bold tracking-widest text-[#88a0c0] uppercase font-mono mb-3">
              96-Hour Projected Intensity
            </h3>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={intensityHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="iGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a3a6b" />
                <XAxis dataKey="time" tick={{ fill: '#88a0c0', fontSize: 9 }} interval={4} />
                <YAxis tick={{ fill: '#88a0c0', fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x="Now" stroke="#ff9500" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="wind" stroke="#00d4ff" strokeWidth={2} fill="url(#iGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Multi-Model Ensemble Matrix */}
          <div className="rounded-xl border border-[#1a3a6b] p-4 bg-[#0d1f3c]">
            <h3 className="text-xs font-bold tracking-widest text-[#88a0c0] uppercase font-mono mb-2.5">
              Ensemble Model Trajectory Comparison
            </h3>
            <div className="space-y-2">
              {ensembleModels.map((m, i) => {
                const isOurs = m.model.includes('METEORA');
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs ${
                      isOurs ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-[#00d4ff]' : 'bg-[#0a1628] border-[#1a3a6b] text-[#88a0c0]'
                    }`}
                  >
                    <div className={`w-1 h-7 rounded-full ${isOurs ? 'bg-[#00d4ff]' : 'bg-[#1a3a6b]'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-[11px]">{m.model}</div>
                      <div className="text-[10px] font-mono text-[#88a0c0] truncate">
                        {m.track} · Landfall: {m.landfall}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-[#00d4ff]">
                      {m.wind} km/h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Landfall Parameters Card */}
          <div className="rounded-xl border border-[#1a3a6b] p-4 bg-[#0d1f3c]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider font-mono">
                <MapPin size={14} className="text-[#00d4ff]" />
                <span>Estimated Landfall</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-mono">
                91% Confidence
              </span>
            </div>

            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between py-1 border-b border-[#1a3a6b]">
                <span className="text-[#88a0c0]">Location Target</span>
                <span className="font-semibold text-white">{cyclone.landfallLocation || 'Odisha Coast (Puri)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1a3a6b]">
                <span className="text-[#88a0c0]">Landfall Window</span>
                <span className="font-mono text-white">{cyclone.landfall || '14-Sep 18:00 IST'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1a3a6b]">
                <span className="text-[#88a0c0]">Peak Inundation Surge</span>
                <span className="font-mono font-bold text-[#00d4ff]">3.5 – 4.2 Meters</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1a3a6b]">
                <span className="text-[#88a0c0]">24-hr Expected Rainfall</span>
                <span className="font-mono font-bold text-[#00d4ff]">200 – 300 mm</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setAlertModalOpen(true)}
                className="flex-1 py-2 rounded-lg font-bold text-xs text-[#050d1a] bg-[#00d4ff] hover:bg-cyan-300 transition-colors shadow-md shadow-cyan-500/20"
              >
                Issue Alert
              </button>
              <button
                onClick={() => setImpactModalOpen(true)}
                className="flex-1 py-2 rounded-lg font-semibold text-xs border border-[#1a3a6b] bg-[#0a1628] text-white hover:border-cyan-500/40 transition-colors"
              >
                View Impact Zone
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ISSUE ALERT EMERGENCY MODAL */}
      {alertModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-red-500/50 p-6 bg-[#0d1f3c] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a3a6b] mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-red-400" />
                <h3 className="font-bold text-white text-sm">Emergency Warning Broadcast</h3>
              </div>
              <button onClick={() => setAlertModalOpen(false)} className="text-[#88a0c0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDispatchAlert} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#88a0c0] font-medium block mb-1">Alert Warning Stage</label>
                <select
                  value={alertForm.stage}
                  onChange={e => setAlertForm({ ...alertForm, stage: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-white font-semibold focus:outline-none focus:border-[#00d4ff]"
                >
                  <option>RED (Warning / Action - Landfall &lt; 24h)</option>
                  <option>ORANGE (Alert - Landfall &lt; 48h)</option>
                  <option>YELLOW (Watch - Landfall &lt; 72h)</option>
                </select>
              </div>

              <div>
                <label className="text-[#88a0c0] font-medium block mb-1">High-Risk Coastal Districts</label>
                <input
                  type="text"
                  value={alertForm.districts}
                  onChange={e => setAlertForm({ ...alertForm, districts: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="text-[#88a0c0] font-medium block mb-1">Estimated Evacuation Requirement</label>
                <input
                  type="text"
                  value={alertForm.evacuationCount}
                  onChange={e => setAlertForm({ ...alertForm, evacuationCount: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#1a3a6b] bg-[#0a1628] text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="p-2.5 rounded bg-[#0a1628] border border-amber-500/40 text-[11px] text-amber-200">
                ⚠ This will trigger an immediate push notification and SMS cascade to National Disaster Response Force (NDRF) and State Disaster Management Authorities (SDMA).
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAlertModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-[#1a3a6b] text-[#88a0c0] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-500/30"
                >
                  Confirm & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW IMPACT ZONE MODAL */}
      {impactModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-[#1a3a6b] p-6 bg-[#0d1f3c] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a3a6b] mb-4">
              <div>
                <h3 className="font-bold text-white text-sm">Coastal Inundation & Impact Zone Assessment</h3>
                <div className="text-xs text-[#88a0c0] font-mono mt-0.5">{cyclone.name} Landfall Simulation</div>
              </div>
              <button onClick={() => setImpactModalOpen(false)} className="text-[#88a0c0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center text-xs mb-4">
              <div className="p-2.5 rounded border border-[#1a3a6b] bg-[#0a1628]">
                <div className="text-[#88a0c0] text-[10px] font-mono">COASTLINE THREAT</div>
                <div className="font-bold text-white mt-1">180 km Front</div>
              </div>
              <div className="p-2.5 rounded border border-[#1a3a6b] bg-[#0a1628]">
                <div className="text-[#88a0c0] text-[10px] font-mono">POPULATION AT RISK</div>
                <div className="font-bold text-white mt-1">1.42 Million</div>
              </div>
              <div className="p-2.5 rounded border border-[#1a3a6b] bg-[#0a1628]">
                <div className="text-[#88a0c0] text-[10px] font-mono">SHELTERS ACTIVE</div>
                <div className="font-bold text-white mt-1">840 Centers</div>
              </div>
            </div>

            <div className="space-y-2 text-xs mb-5">
              <div className="font-bold text-white text-xs font-mono">Priority District Inundation Matrix:</div>
              {[
                { district: 'Puri District', surge: '3.8 - 4.2m', rainfall: '280 mm', alert: 'RED', alertClass: 'bg-red-500/20 text-red-300 border-red-500/40' },
                { district: 'Jagatsinghpur', surge: '3.2 - 3.6m', rainfall: '250 mm', alert: 'RED', alertClass: 'bg-red-500/20 text-red-300 border-red-500/40' },
                { district: 'Kendrapara', surge: '2.8 - 3.2m', rainfall: '220 mm', alert: 'ORANGE', alertClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
                { district: 'Bhadrak', surge: '2.0 - 2.5m', rainfall: '190 mm', alert: 'ORANGE', alertClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
              ].map(d => (
                <div key={d.district} className="flex items-center justify-between p-2 rounded bg-[#0a1628] border border-[#1a3a6b]">
                  <span className="font-semibold text-white">{d.district}</span>
                  <span className="text-[#00d4ff] font-mono">Surge: {d.surge}</span>
                  <span className="text-slate-300 font-mono">Rain: {d.rainfall}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${d.alertClass}`}>
                    {d.alert}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setImpactModalOpen(false)}
              className="w-full py-2 rounded-lg font-bold text-xs text-[#050d1a] bg-[#00d4ff] hover:bg-cyan-300 transition-colors shadow-md shadow-cyan-500/20"
            >
              Close Impact Zone Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
