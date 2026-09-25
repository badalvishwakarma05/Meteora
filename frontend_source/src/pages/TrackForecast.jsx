import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Download, Play, AlertTriangle, MapPin, Wind, Droplets, RefreshCw, X, ShieldAlert, CheckCircle2, Navigation, AlertCircle, Sparkles, Compass } from 'lucide-react';
import { trackData, trackDataByCyclone, intensityHistory, ensembleModels, activeCyclones } from '../data/mockData';
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

  const [trackFilter, setTrackFilter] = useState('all');
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

  const activeTrackWaypoints = (trackDataByCyclone && trackDataByCyclone[cyclone.id]) || trackDataByCyclone?.DANA || trackData;

  const filteredTrackWaypoints = activeTrackWaypoints.filter(row => {
    if (trackFilter === 'observed') return !row.predicted;
    if (trackFilter === 'predicted') return row.predicted;
    return true;
  });

  const observedCount = activeTrackWaypoints.filter(r => !r.predicted).length;
  const predictedCount = activeTrackWaypoints.filter(r => r.predicted).length;

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
    showToast(`Loaded trajectory and synoptic sequence for ${storm?.name || id}.`, 'info');
  };

  const handleRunPrediction = async () => {
    setIsPredicting(true);
    showToast('Executing 96-hour multi-model trajectory & synoptic inference...', 'info');

    const data = await runCityImpactPrediction(cyclone.lat || 15.4, cyclone.lon || 87.2, cyclone.wind || 175);
    if (data && data.success) {
      setCityImpacts(data.affected_cities || []);
      setHistoricalAnalogues(data.historical_analogues || []);
    }

    setIsPredicting(false);
    showToast('96-Hour Synoptic Track & Landfall Matrix updated successfully.', 'success');
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
    <div className="flex flex-col gap-5 min-h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-xs text-[#88a0c0] font-mono">Ensemble Guidance &amp; Landfall Prediction</div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Track &amp; Forecast Analysis</h1>
          </div>
          {/* Cyclone selector */}
          <select
            value={selected}
            onChange={e => handleSelectCyclone(e.target.value)}
            className="text-xs sm:text-sm font-bold px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:border-[#00d4ff] shadow-sm"
          >
            {activeCyclones.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] font-semibold text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/40 transition-all shadow-sm"
          >
            <Download size={14} className="text-cyan-600 dark:text-[#00d4ff]" />
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
      <div className="flex flex-col lg:flex-row gap-5 flex-1 items-stretch min-h-0">
        {/* Left Column: Map + Track Table */}
        <div className="flex flex-col gap-4 flex-1 min-w-0 min-h-full">
          {/* Map */}
          <div className="h-[340px] sm:h-[380px] min-h-[320px] rounded-xl overflow-hidden border border-slate-200 dark:border-[#1a3a6b] shadow-md shrink-0">
            <CycloneMap onSelectCyclone={(c) => handleSelectCyclone(c.id)} />
          </div>

          {/* 6-Hourly Track Positions Table (Expanded to fill available space) */}
          <div className="rounded-2xl border border-slate-200 dark:border-[#1a3a6b] overflow-hidden bg-white dark:bg-[#0d1f3c] flex-1 flex flex-col min-h-[380px] shadow-xl">
            {/* Table Header Bar */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] flex items-center justify-between flex-wrap gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
                <h3 className="text-xs font-bold tracking-wider text-slate-800 dark:text-white uppercase font-mono">
                  6-Hourly Synoptic Track Sequence ({cyclone.name})
                </h3>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-[#102a4c] p-1 rounded-lg text-[11px] font-mono">
                <button
                  onClick={() => setTrackFilter('all')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${
                    trackFilter === 'all'
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({activeTrackWaypoints.length})
                </button>
                <button
                  onClick={() => setTrackFilter('observed')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${
                    trackFilter === 'observed'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Observed ({observedCount})
                </button>
                <button
                  onClick={() => setTrackFilter('predicted')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${
                    trackFilter === 'predicted'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  AI Forecast ({predictedCount})
                </button>
              </div>
            </div>

            {/* Scrollable Table Body */}
            <div className="overflow-x-auto overflow-y-auto flex-1 min-h-[260px] scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-slate-100 dark:scrollbar-track-[#0a1628]">
              <table className="w-full text-xs font-mono">
                <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-[#0a1628] text-slate-600 dark:text-[#88a0c0] shadow-sm border-b border-slate-200 dark:border-[#1a3a6b]">
                  <tr className="text-left uppercase text-[10px] tracking-wider">
                    <th className="px-3.5 py-2.5">Date / Time (UTC · IST)</th>
                    <th className="px-3.5 py-2.5">Eye Coordinates</th>
                    <th className="px-3.5 py-2.5">Sustained Wind</th>
                    <th className="px-3.5 py-2.5">Central Pressure</th>
                    <th className="px-3.5 py-2.5">Intensity &amp; Stage</th>
                    <th className="px-3.5 py-2.5">Status &amp; Verification Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1a3a6b]/60">
                  {filteredTrackWaypoints.map((row, i) => (
                    <tr
                      key={i}
                      className={`hover:bg-slate-50 dark:hover:bg-[#102a4c] transition-colors ${
                        row.predicted
                          ? 'text-cyan-700 dark:text-cyan-300 italic bg-cyan-50/20 dark:bg-cyan-950/15'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      <td className="px-3.5 py-2.5">
                        <div className="font-bold text-slate-900 dark:text-white">{row.time}</div>
                        <div className="text-[10px] text-slate-500 dark:text-[#88a0c0]">{row.ist || ''}</div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="font-semibold text-cyan-700 dark:text-cyan-300">
                          {row.lat}°N, {row.lon}°E
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="font-black text-slate-900 dark:text-white text-sm">{row.wind}</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#88a0c0] ml-1">km/h</span>
                        {row.gusts && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400">
                            Gusts: {row.gusts} km/h
                          </div>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{row.pressure}</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#88a0c0] ml-1">hPa</span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              row.category >= 4
                                ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-400'
                                : row.category === 3
                                ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-500/40 text-orange-700 dark:text-orange-400'
                                : 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-[#00d4ff]'
                            }`}
                          >
                            CAT {row.category}
                          </span>
                          <span className="text-[10px] text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                            {row.stage || `Stage ${row.category}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        {row.predicted ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 dark:bg-[#00d4ff]/15 border border-cyan-300 dark:border-[#00d4ff]/30 text-cyan-700 dark:text-cyan-300 flex items-center gap-1">
                              <Sparkles size={10} className="text-cyan-600 dark:text-[#00d4ff]" />
                              <span>{row.source || 'AI Neural Forecast'}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              <span>{row.source || 'Observed (IBTrACS)'}</span>
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Footer Info Strip */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0a1628] border-t border-slate-200 dark:border-[#1a3a6b] text-[11px] font-mono text-slate-500 dark:text-[#88a0c0] flex items-center justify-between flex-wrap gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span>Active Sequence: <strong className="text-slate-800 dark:text-white">{filteredTrackWaypoints.length} waypoints shown</strong></span>
              </div>
              <div className="text-cyan-600 dark:text-[#00d4ff] font-semibold text-[10px] sm:text-[11px]">
                Ground-Truth: NOAA IBTrACS v04 &amp; IMD Synoptic Bulletin · Model: 72h CNN-LSTM Trajectory
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Intensity Forecast, Ensemble, Landfall Card */}
        <div className="w-full lg:w-96 flex flex-col gap-4 flex-shrink-0">
          {/* Rapid Intensification Alert Banner */}
          <div
            className="rounded-xl p-3.5 border border-amber-300 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 flex items-start gap-3 shadow-sm"
          >
            <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs text-amber-700 dark:text-amber-400 tracking-wider font-mono">
                RAPID INTENSIFICATION WARNING
              </div>
              <div className="text-[11px] text-amber-900 dark:text-amber-200 mt-0.5">
                Wind speed increased by +55 km/h in 24 hours. Central convective core stabilized.
              </div>
              <div className="text-[10px] font-mono text-amber-700 dark:text-amber-400/80 mt-1 font-semibold">
                Neural Confidence: 87.4%
              </div>
            </div>
          </div>

          {/* AI Coastal City Landfall Danger Matrix */}
          <div className="rounded-xl border border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] overflow-hidden shadow-md">
            <div className="px-4 py-3 bg-slate-50 dark:bg-[#0a1628] border-b border-slate-200 dark:border-[#1a3a6b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-cyan-600 dark:text-[#00d4ff]" />
                <h3 className="text-xs font-bold tracking-widest text-slate-900 dark:text-white uppercase font-mono">
                  Coastal Landfall Danger Matrix
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-[#00d4ff] font-semibold">
                Decay Model Active
              </span>
            </div>

            <div className="p-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1a3a6b] text-slate-500 dark:text-[#88a0c0] font-mono text-[10px] uppercase">
                    <th className="pb-2 pl-2">City</th>
                    <th className="pb-2">Dist</th>
                    <th className="pb-2">ETA</th>
                    <th className="pb-2">Wind</th>
                    <th className="pb-2">Danger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1a3a6b]/60 font-mono">
                  {cityImpacts.slice(0, 5).map((item, idx) => {
                    const isSevere = item.danger_score >= 85;
                    const isModerate = item.danger_score >= 60 && item.danger_score < 85;
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#102a4c] transition-colors">
                        <td className="py-2.5 pl-2 font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <MapPin size={11} className={isSevere ? 'text-red-500' : isModerate ? 'text-amber-500' : 'text-cyan-600 dark:text-[#00d4ff]'} />
                          <span>{item.city}</span>
                          <span className="text-[10px] text-slate-500 dark:text-[#88a0c0]">({item.state})</span>
                        </td>
                        <td className="py-2.5 text-slate-500 dark:text-[#88a0c0]">{item.distance_km}km</td>
                        <td className="py-2.5 font-semibold text-slate-900 dark:text-white">{item.eta_hours}h</td>
                        <td className="py-2.5 font-bold text-slate-900 dark:text-white">{item.predicted_wind_kmh}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${
                              isSevere
                                ? 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/40'
                                : isModerate
                                ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-yellow-300 border-amber-300 dark:border-amber-500/40'
                                : 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-[#00d4ff] border-cyan-300 dark:border-cyan-500/40'
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
          <div className="rounded-xl border border-slate-200 dark:border-[#1a3a6b] p-4 bg-white dark:bg-[#0d1f3c] shadow-md">
            <h3 className="text-xs font-bold tracking-widest text-slate-700 dark:text-[#88a0c0] uppercase font-mono mb-3">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" className="dark:stroke-[#1a3a6b]" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} interval={4} />
                <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x="Now" stroke="#ff9500" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="wind" stroke="#00d4ff" strokeWidth={2} fill="url(#iGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Multi-Model Ensemble Matrix */}
          <div className="rounded-xl border border-slate-200 dark:border-[#1a3a6b] p-4 bg-white dark:bg-[#0d1f3c] shadow-md">
            <h3 className="text-xs font-bold tracking-widest text-slate-700 dark:text-[#88a0c0] uppercase font-mono mb-2.5">
              Ensemble Model Trajectory Comparison
            </h3>
            <div className="space-y-2">
              {ensembleModels.map((m, i) => {
                const isOurs = m.model.includes('METEORA');
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs ${
                      isOurs
                        ? 'bg-cyan-50 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-blue-500/10 border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-[#00d4ff]'
                        : 'bg-slate-50 dark:bg-[#0a1628] border-slate-200 dark:border-[#1a3a6b] text-slate-600 dark:text-[#88a0c0]'
                    }`}
                  >
                    <div className={`w-1 h-7 rounded-full ${isOurs ? 'bg-cyan-500 dark:bg-[#00d4ff]' : 'bg-slate-300 dark:bg-[#1a3a6b]'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white text-[11px]">{m.model}</div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-[#88a0c0] truncate">
                        {m.track} · Landfall: {m.landfall}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-cyan-700 dark:text-[#00d4ff]">
                      {m.wind} km/h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Landfall Parameters Card */}
          <div className="rounded-xl border border-slate-200 dark:border-[#1a3a6b] p-4 bg-white dark:bg-[#0d1f3c] shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                <MapPin size={14} className="text-cyan-600 dark:text-[#00d4ff]" />
                <span>Estimated Landfall</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono">
                91% Confidence
              </span>
            </div>

            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1a3a6b]">
                <span className="text-slate-500 dark:text-[#88a0c0]">Location Target</span>
                <span className="font-semibold text-slate-900 dark:text-white">{cyclone.landfallLocation || 'Odisha Coast (Puri)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1a3a6b]">
                <span className="text-slate-500 dark:text-[#88a0c0]">Landfall Window</span>
                <span className="font-mono text-slate-900 dark:text-white">{cyclone.landfall || '14-Sep 18:00 IST'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1a3a6b]">
                <span className="text-slate-500 dark:text-[#88a0c0]">Peak Inundation Surge</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-[#00d4ff]">3.5 – 4.2 Meters</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1a3a6b]">
                <span className="text-slate-500 dark:text-[#88a0c0]">24-hr Expected Rainfall</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-[#00d4ff]">200 – 300 mm</span>
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
                className="flex-1 py-2 rounded-lg font-semibold text-xs border border-slate-300 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-slate-800 dark:text-white hover:border-cyan-500/40 transition-colors shadow-sm"
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
          <div className="w-full max-w-md rounded-xl border border-red-500/50 p-6 bg-white dark:bg-[#0d1f3c] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a3a6b] mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-red-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Emergency Warning Broadcast</h3>
              </div>
              <button onClick={() => setAlertModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDispatchAlert} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Alert Warning Stage</label>
                <select
                  value={alertForm.stage}
                  onChange={e => setAlertForm({ ...alertForm, stage: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-[#00d4ff]"
                >
                  <option>RED (Warning / Action - Landfall &lt; 24h)</option>
                  <option>ORANGE (Alert - Landfall &lt; 48h)</option>
                  <option>YELLOW (Watch - Landfall &lt; 72h)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">High-Risk Coastal Districts</label>
                <input
                  type="text"
                  value={alertForm.districts}
                  onChange={e => setAlertForm({ ...alertForm, districts: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-slate-900 dark:text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Estimated Evacuation Requirement</label>
                <input
                  type="text"
                  value={alertForm.evacuationCount}
                  onChange={e => setAlertForm({ ...alertForm, evacuationCount: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-slate-900 dark:text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="p-2.5 rounded bg-amber-50 dark:bg-[#0a1628] border border-amber-300 dark:border-amber-500/40 text-[11px] text-amber-900 dark:text-amber-200">
                ⚠ This will trigger an immediate push notification and SMS cascade to National Disaster Response Force (NDRF) and State Disaster Management Authorities (SDMA).
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAlertModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-500/30"
                >
                  Confirm &amp; Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW IMPACT ZONE MODAL */}
      {impactModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-[#1a3a6b] p-6 bg-white dark:bg-[#0d1f3c] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a3a6b] mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Coastal Inundation &amp; Impact Zone Assessment</h3>
                <div className="text-xs text-slate-500 dark:text-[#88a0c0] font-mono mt-0.5">{cyclone.name} Landfall Simulation</div>
              </div>
              <button onClick={() => setImpactModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center text-xs mb-4">
              <div className="p-2.5 rounded border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628]">
                <div className="text-slate-500 dark:text-[#88a0c0] text-[10px] font-mono">COASTLINE THREAT</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">180 km Front</div>
              </div>
              <div className="p-2.5 rounded border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628]">
                <div className="text-slate-500 dark:text-[#88a0c0] text-[10px] font-mono">POPULATION AT RISK</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">1.42 Million</div>
              </div>
              <div className="p-2.5 rounded border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628]">
                <div className="text-slate-500 dark:text-[#88a0c0] text-[10px] font-mono">SHELTERS ACTIVE</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">840 Centers</div>
              </div>
            </div>

            <div className="space-y-2 text-xs mb-5">
              <div className="font-bold text-slate-900 dark:text-white text-xs font-mono">Priority District Inundation Matrix:</div>
              {[
                { district: 'Puri District', surge: '3.8 - 4.2m', rainfall: '280 mm', alert: 'RED', alertClass: 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/40' },
                { district: 'Jagatsinghpur', surge: '3.2 - 3.6m', rainfall: '250 mm', alert: 'RED', alertClass: 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/40' },
                { district: 'Kendrapara', surge: '2.8 - 3.2m', rainfall: '220 mm', alert: 'ORANGE', alertClass: 'bg-amber-50 dark:bg-yellow-500/20 text-amber-700 dark:text-yellow-300 border-amber-300 dark:border-yellow-500/40' },
                { district: 'Bhadrak', surge: '2.0 - 2.5m', rainfall: '190 mm', alert: 'ORANGE', alertClass: 'bg-amber-50 dark:bg-yellow-500/20 text-amber-700 dark:text-yellow-300 border-amber-300 dark:border-yellow-500/40' },
              ].map(d => (
                <div key={d.district} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b]">
                  <span className="font-semibold text-slate-900 dark:text-white">{d.district}</span>
                  <span className="text-cyan-600 dark:text-[#00d4ff] font-mono">Surge: {d.surge}</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono">Rain: {d.rainfall}</span>
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
