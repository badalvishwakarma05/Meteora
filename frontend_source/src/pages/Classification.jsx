import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, BarChart2, CheckCircle, RefreshCw, ZoomIn, ZoomOut, X, Info, HardDrive } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { classificationFeatures, historicalCyclones } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { runAIClassification, fetchAvailableFiles } from '../services/api';

const radarData = [
  { axis: 'Organization', current: 88, historical: 65 },
  { axis: 'Symmetry',     current: 87, historical: 58 },
  { axis: 'Intensity',    current: 92, historical: 70 },
  { axis: 'Size',         current: 78, historical: 55 },
  { axis: 'Duration',     current: 65, historical: 72 },
  { axis: 'Deepening',    current: 95, historical: 48 },
];

const timelineFrames = [
  { time: '00:00 UTC', class: 'Cyclonic Storm', conf: 82, severity: 'low' },
  { time: '03:00 UTC', class: 'Severe CS', conf: 86, severity: 'moderate' },
  { time: '06:00 UTC', class: 'Severe CS', conf: 89, severity: 'moderate' },
  { time: '09:00 UTC', class: 'Very Severe CS', conf: 91, severity: 'severe' },
  { time: '12:00 UTC', class: 'Very Severe CS', conf: 94, severity: 'severe' },
  { time: '15:00 UTC', class: 'Very Severe CS', conf: 94, severity: 'severe' },
];

function ConfidenceGauge({ value }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ;
  return (
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="#1a3a6b" strokeWidth="8" />
      <circle cx="45" cy="45" r={r} fill="none" stroke="#00d4ff" strokeWidth="8"
              strokeDasharray={`${filled} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 45 45)" />
      <text x="45" y="49" textAnchor="middle" fill="#00d4ff" fontSize="16" fontWeight="bold" fontFamily="JetBrains Mono">
        {value}%
      </text>
    </svg>
  );
}

export default function Classification() {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [band, setBand] = useState('IR');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [selectedHistorical, setSelectedHistorical] = useState(null);
  const [liveDvorak, setLiveDvorak] = useState(null);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');

  useEffect(() => {
    async function loadFiles() {
      const files = await fetchAvailableFiles();
      setAvailableFiles(files);
      if (files.length > 0) {
        setSelectedFile(files[0]);
      }
    }
    loadFiles();
  }, []);

  useEffect(() => {
    if (!selectedFile) return;
    async function loadLiveClassification() {
      const res = await runAIClassification(selectedFile);
      if (res && res.success && res.classification) {
        setLiveDvorak(res.classification);
      }
    }
    loadLiveClassification();
  }, [selectedFile]);

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast(`Uploaded satellite frame "${file.name}". Processing DvorakNet classification...`, 'info');
      const res = await runAIClassification(file.name);
      if (res && res.classification) {
        setLiveDvorak(res.classification);
      }
      showToast(`Pattern analysis completed for "${file.name}".`, 'success');
    }
  };

  const handleRunBatch = () => {
    setBatchModalOpen(true);
    setBatchProgress(10);
    showToast('Starting batch processing for last 48-hour INSAT-3D passes...', 'info');

    const interval = setInterval(() => {
      setBatchProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          showToast('Batch processing complete. 48 frames classified and archived.', 'success');
          return 100;
        }
        return p + 25;
      });
    }, 500);
  };

  const handleExportReport = () => {
    const reportData = `=====================================================
INDIA METEOROLOGICAL DEPARTMENT
AI-BASED TROPICAL CYCLONE CLASSIFICATION REPORT
=====================================================
Cyclone Identification: CYCLONE DANA (BOB-02)
Basin: West-Central Bay of Bengal
Analysis Timestamp: ${new Date().toUTCString()}
Evaluated By: METEORA Neural Dvorak Engine v2.4

CLASSIFICATION SUMMARY:
- IMD Classification: VERY SEVERE CYCLONIC STORM (VSCS)
- Saffir-Simpson Equivalent: Category 3
- AI Model Confidence: 94.2%
- Estimated Maximum Sustained Wind: 165 - 175 km/h
- Estimated Central Pressure: 955 hPa

AUTOMATED DVORAK PARAMETERS:
- Final T-Number: T5.5 (Current Intensity CI: 5.5)
- Eye Diameter: 42 km (Clear Eye Defined)
- Eye Wall Symmetry: 0.87 (High Azimuthal Symmetry)
- CDO Diameter: 320 km (Extensive Cold Cloud Shield)
- Outflow Pattern: Radial & Anticyclonic
- Spiral Rainbands: 4 Well-Developed Curvature Bands

CLIMATOLOGICAL ANALOGUE SIMILARITY:
- CYCLONE AMPHAN (2020): 96% Match
- CYCLONE FANI (2019): 91% Match
- CYCLONE PHAILIN (2013): 85% Match

Official Warning Authority: Cyclone Warning Division, New Delhi
=====================================================`;

    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `METEORA_Classification_DANA_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Classification & Dvorak T-Number report exported successfully.', 'success');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadImage}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 dark:text-[#88a0c0]">Automated Dvorak & Pattern Recognition</div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">AI Classification & Analysis</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* HDF5 Dataset Selector */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] shadow-sm">
            <HardDrive size={14} className="text-cyan-600 dark:text-[#00d4ff]" />
            <span className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium hidden sm:inline">HDF5 File:</span>
            <select
              value={selectedFile}
              onChange={e => {
                setSelectedFile(e.target.value);
                showToast(`Selected dataset for classification: ${e.target.value}`, 'info');
              }}
              className="text-xs bg-slate-50 dark:bg-[#0a1628] text-slate-900 dark:text-white font-mono font-semibold px-2 py-1 rounded border border-slate-300 dark:border-[#1a3a6b] focus:outline-none focus:border-cyan-500"
            >
              {availableFiles.length > 0 ? (
                availableFiles.map(f => <option key={f} value={f} className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">{f}</option>)
              ) : (
                <option value="" className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">No .h5 files found</option>
              )}
            </select>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] font-semibold text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/50 transition-all shadow-sm cursor-pointer"
          >
            <Upload size={14} className="text-cyan-600 dark:text-[#00d4ff]" />
            <span>Upload Satellite Frame</span>
          </button>
          <button
            onClick={handleRunBatch}
            className="flex items-center gap-2 text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] font-semibold text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/50 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw size={14} className="text-cyan-600 dark:text-[#00d4ff]" />
            <span>Batch Process</span>
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg font-bold text-slate-950 bg-cyan-400 dark:bg-[#00d4ff] hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <FileText size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* TOP SECTION: Satellite Viewer + Classification Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Satellite Viewer */}
        <div className="rounded-xl border border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] overflow-hidden flex flex-col shadow-lg">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628]">
            <div className="flex gap-1">
              {['IR', 'Visible', 'WV', 'RGB'].map(b => (
                <button
                  key={b}
                  onClick={() => {
                    setBand(b);
                    showToast(`Switched classification sensor channel to ${b}.`, 'info');
                  }}
                  className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                    band === b ? 'bg-cyan-500/20 text-cyan-700 dark:text-[#00d4ff] border border-cyan-500/50' : 'bg-slate-100 dark:bg-[#0d1f3c] text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel(Math.min(1.6, zoomLevel + 0.2))}
                className="w-7 h-7 rounded text-xs font-bold flex items-center justify-center bg-slate-100 dark:bg-[#0a1628] border border-slate-300 dark:border-[#1a3a6b] text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/40 transition-colors cursor-pointer shadow-sm"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              <button
                onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.2))}
                className="w-7 h-7 rounded text-xs font-bold flex items-center justify-center bg-slate-100 dark:bg-[#0a1628] border border-slate-300 dark:border-[#1a3a6b] text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/40 transition-colors cursor-pointer shadow-sm"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
            </div>
          </div>

          {/* Satellite Image Viewport */}
          <div
            className="relative flex-1 min-h-[280px] overflow-hidden select-none bg-[#050d1a]"
          >
            <div
              className="absolute inset-0 transition-transform duration-200 flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Cloud Spiral */}
              <div
                className="w-64 h-64 rounded-full cyclone-spin opacity-60"
                style={{
                  background: 'radial-gradient(circle, rgba(255,50,50,0.8) 10%, rgba(255,160,0,0.4) 35%, transparent 70%)',
                }}
              />
              {/* Overlaid Detection Features */}
              <div
                className="absolute border-2 border-[#ff3b3b] rounded text-[10px] font-mono font-bold px-1.5 py-0.5 text-white bg-black/70 shadow-[0_0_8px_#ff3b3b]"
                style={{ width: 80, height: 80 }}
              >
                Eye Wall 92%
              </div>
              <div
                className="absolute border-2 border-dashed border-[#00d4ff] rounded text-[10px] font-mono font-bold px-1.5 py-0.5 text-cyan-300 bg-black/70 shadow-[0_0_8px_#00d4ff]"
                style={{ width: 190, height: 190 }}
              >
                CDO Shield 95%
              </div>
            </div>

            {/* Temperature Bar */}
            <div className="absolute right-3 top-4 bottom-10 w-3 rounded border border-slate-300 dark:border-[#1a3a6b] overflow-hidden bg-gradient-to-b from-[#ff1744] via-[#ffd600] to-[#0a1628]" />
          </div>

          {/* Metadata Bar */}
          <div className="px-3.5 py-2 text-xs font-mono flex items-center justify-between bg-slate-50 dark:bg-[#0a1628] border-t border-slate-200 dark:border-[#1a3a6b] text-slate-600 dark:text-[#88a0c0]">
            <span className="text-slate-900 dark:text-white font-semibold">INSAT-3D · Ch: {band}</span>
            <span>14-Sep 12:00 UTC · Res: 4km</span>
          </div>
        </div>

        {/* Classification Results Panel */}
        <div className="rounded-xl border border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] p-5 flex flex-col gap-4 shadow-lg">
          {/* Classification Badge */}
          <div
            className="rounded-xl p-3.5 text-center border border-red-500/40 bg-gradient-to-r from-red-500/15 dark:from-red-500/20 to-orange-500/15 dark:to-orange-500/20 shadow-md"
          >
            <div className="text-[10px] font-bold tracking-widest text-red-600 dark:text-red-400 uppercase mb-1 font-mono">
              AUTOMATED DVORAK CLASSIFICATION
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">VERY SEVERE CYCLONIC STORM</div>
            <div className="text-xs font-bold text-red-600 dark:text-red-300 mt-0.5 font-mono">Saffir-Simpson Equivalent: Category 3</div>
          </div>

          {/* AI Confidence Gauge */}
          <div className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628]">
            <ConfidenceGauge value={94} />
            <div>
              <div className="text-xs font-bold text-slate-600 dark:text-[#88a0c0] uppercase tracking-wide">AI Confidence Index</div>
              <div className="text-2xl font-black font-mono text-cyan-700 dark:text-[#00d4ff]">94.2%</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" /> High Certainty · CI 5.5
              </div>
            </div>
          </div>

          {/* Feature Matrix */}
          <div className="space-y-1.5 flex-1">
            <div className="text-xs font-bold tracking-widest uppercase text-slate-600 dark:text-[#88a0c0]">
              Extracted Morphological Features
            </div>
            {classificationFeatures.map(f => (
              <div
                key={f.feature}
                className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-[#1a3a6b]/80 text-xs"
              >
                <span className="text-slate-600 dark:text-[#88a0c0]">{f.feature}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{f.value}</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-medium">
                  <CheckCircle size={11} className="text-emerald-600 dark:text-emerald-400" /> {f.status}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleExportReport}
            className="w-full py-2.5 rounded-lg font-bold text-xs text-slate-950 bg-cyan-400 dark:bg-[#00d4ff] hover:bg-cyan-300 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            Generate & Download Official Report
          </button>
        </div>
      </div>

      {/* MIDDLE SECTION: Temporal Pattern Timeline */}
      <div className="rounded-xl border border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold tracking-widest text-slate-700 dark:text-[#88a0c0] uppercase font-mono">
            Progressive Pattern Evolution (Last 18 Hours)
          </h3>
          <span className="text-xs text-cyan-600 dark:text-[#00d4ff] font-semibold font-mono">↑ Continuous Intensification Observed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {timelineFrames.map((f, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden border border-slate-200 dark:border-[#1a3a6b] p-2 bg-slate-50 dark:bg-[#0a1628] hover:border-cyan-500/50 transition-all cursor-pointer shadow-sm"
              onClick={() => showToast(`Selected frame at ${f.time}: Classified as ${f.class}.`, 'info')}
            >
              <div className="h-16 rounded bg-[#050d1a] flex items-center justify-center relative mb-2 border border-slate-200 dark:border-[#1a3a6b]">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/40 cyclone-spin" />
                <span className="absolute bottom-1 right-1 text-[9px] font-mono text-slate-400 dark:text-[#88a0c0]">{f.time}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{f.class}</div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-[#88a0c0]">Conf: <span className="text-cyan-700 dark:text-[#00d4ff] font-bold">{f.conf}%</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION: Historical Matches + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Historical Matches */}
        <div className="rounded-xl border border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] p-4 shadow-lg">
          <h3 className="text-xs font-bold tracking-widest text-slate-700 dark:text-[#88a0c0] uppercase font-mono mb-3">
            Top Climatological Twin Storms
          </h3>
          <div className="space-y-2.5">
            {historicalCyclones.map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] hover:border-cyan-500/40 transition-colors"
              >
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-[#88a0c0] w-4">0{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {h.name} <span className="text-slate-500 dark:text-[#88a0c0] font-normal">({h.year})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-[#88a0c0]">
                    Cat {h.category} · Peak Wind: {h.maxWind} km/h · Landfall: {h.landfall}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">{h.similarity}% Match</span>
                  <button
                    onClick={() => setSelectedHistorical(h)}
                    className="px-2.5 py-1 rounded text-xs font-semibold border border-slate-300 dark:border-[#1a3a6b] text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/50 transition-colors cursor-pointer shadow-sm"
                  >
                    Learn
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] p-4 flex flex-col shadow-lg">
          <h3 className="text-xs font-bold tracking-widest text-slate-700 dark:text-[#88a0c0] uppercase font-mono mb-3">
            Multi-Axis Morphological Radar Metrics
          </h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#94a3b8" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Active Storm (DANA)" dataKey="current" stroke="#0284c7" fill="#0284c7" fillOpacity={0.25} />
                <Radar name="Historical Average" dataKey="historical" stroke="#ea580c" fill="#ea580c" fillOpacity={0.15} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', fontSize: 11 }}
                  labelStyle={{ color: '#0284c7' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BATCH PROCESSING PROGRESS MODAL */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-[#1a3a6b] p-6 bg-white dark:bg-[#0d1f3c] shadow-2xl transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Batch Pattern Classification Engine</h3>
              {batchProgress === 100 && (
                <button onClick={() => setBatchModalOpen(false)} className="text-slate-500 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-slate-600 dark:text-[#88a0c0]">
                <span>Processing 48 Satellite Frames</span>
                <span className="text-cyan-700 dark:text-[#00d4ff] font-mono font-bold">{batchProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b] overflow-hidden">
                <div
                  className="h-full bg-cyan-500 dark:bg-[#00d4ff] transition-all duration-300"
                  style={{ width: `${batchProgress}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#88a0c0]">
                {batchProgress < 100
                  ? 'Extracting Dvorak cloud curvature and azimuthal symmetry...'
                  : '✓ All 48 frames processed. Climatological trend synchronized.'}
              </div>
            </div>

            {batchProgress === 100 && (
              <button
                onClick={() => setBatchModalOpen(false)}
                className="w-full mt-5 py-2 rounded-lg font-bold text-xs text-slate-950 bg-cyan-400 dark:bg-[#00d4ff] hover:bg-cyan-300 transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            )}
          </div>
        </div>
      )}

      {/* HISTORICAL COMPARISON MODAL */}
      {selectedHistorical && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-[#1a3a6b] p-6 bg-white dark:bg-[#0d1f3c] shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a3a6b] mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Climatological Dossier: CYCLONE {selectedHistorical.name} ({selectedHistorical.year})
                </h3>
                <div className="text-xs text-cyan-700 dark:text-[#88a0c0] font-mono mt-0.5">
                  {selectedHistorical.similarity}% Structural Similarity to Cyclone DANA
                </div>
              </div>
              <button onClick={() => setSelectedHistorical(null)} className="text-slate-500 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 rounded border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628]">
                <div className="text-slate-500 dark:text-[#88a0c0] text-[10px] font-mono">PEAK SUSTAINED WIND</div>
                <div className="font-mono font-bold text-base text-slate-900 dark:text-white mt-0.5">{selectedHistorical.maxWind} km/h</div>
              </div>
              <div className="p-3 rounded border border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628]">
                <div className="text-slate-500 dark:text-[#88a0c0] text-[10px] font-mono">LANDFALL ZONE</div>
                <div className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{selectedHistorical.landfall}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#88a0c0] leading-relaxed mb-5">
              Historical analysis shows that Cyclone {selectedHistorical.name} underwent rapid intensification in the central Bay of Bengal due to warm sea surface temperatures (&gt;30°C) and low vertical wind shear, mirroring the active convective pattern observed in Cyclone DANA.
            </p>

            <button
              onClick={() => setSelectedHistorical(null)}
              className="w-full py-2 rounded-lg font-bold text-xs text-slate-950 bg-cyan-400 dark:bg-[#00d4ff] hover:bg-cyan-300 transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
