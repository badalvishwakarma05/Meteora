import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Download, MapPin, Square, Check, RefreshCw, HardDrive } from 'lucide-react';
import { satelliteFeeds } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { fetchAvailableFiles, extractPatch } from '../services/api';

const bands = ['IR 10.8μm', 'Visible', 'Water Vapor 6.2μm', 'RGB Composite'];
const sources = ['INSAT-3D', 'INSAT-3DR', 'GOES-East', 'Meteosat'];

export default function SatelliteFeed() {
  const { showToast } = useToast();
  const [source, setSource] = useState('INSAT-3D');
  const [band, setBand] = useState('IR 10.8μm');
  const [playing, setPlaying] = useState(false);
  const [timeIndex, setTimeIndex] = useState(24); // 0 to 24
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [comparison, setComparison] = useState(false);
  const [activeTool, setActiveTool] = useState(null); // 'marker' | 'region'
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [patchData, setPatchData] = useState(null);
  const [loadingPatch, setLoadingPatch] = useState(false);
  const [markers, setMarkers] = useState([
    { id: 1, x: 52, y: 44, label: 'Eye Center (15.4°N, 87.2°E)' },
  ]);

  // Load available .h5 files from backend data directory
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

  // Fetch patch when selectedFile changes
  useEffect(() => {
    if (!selectedFile) return;
    async function loadPatch() {
      setLoadingPatch(true);
      const res = await extractPatch({ fileName: selectedFile });
      if (res && res.success) {
        setPatchData(res);
        showToast(`Extracted patch for ${selectedFile}`, 'success');
      }
      setLoadingPatch(false);
    }
    loadPatch();
  }, [selectedFile]);

  // Automated frame playback loop
  useEffect(() => {
    let interval = null;
    if (playing) {
      interval = setInterval(() => {
        setTimeIndex(prev => (prev < 24 ? prev + 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playing]);

  const handleSourceChange = (s) => {
    setSource(s);
    showToast(`Switched telemetry downlink to ${s}.`, 'info');
  };

  const handleBandChange = (b) => {
    setBand(b);
    showToast(`Switched channel to ${b}.`, 'info');
  };

  const handleDownloadFrame = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const content = `METEORA Satellite Snapshot Export
----------------------------------------
Source Sensor: ${source}
Channel: ${band}
Observation Time: 14-Sep-2024 (Hour -${24 - timeIndex}h)
Spatial Resolution: 4km
Calibration: Radiometric Brightness Temp (-80C to +30C)
Center Coordinates: 15.4N, 87.2E
Processing Pipeline: IMD-MoES AI Enhanced v2.4
Export Timestamp: ${new Date().toUTCString()}
----------------------------------------`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${source}_${band.replace(/\s+/g, '_')}_${timestamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded metadata snapshot for ${source} (${band}).`, 'success');
  };

  const handleCanvasClick = (e) => {
    if (!activeTool) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    if (activeTool === 'marker') {
      const lat = (10 + (100 - y) * 0.15).toFixed(1);
      const lon = (80 + x * 0.15).toFixed(1);
      const newMarker = { id: Date.now(), x, y, label: `Point (${lat}°N, ${lon}°E)` };
      setMarkers(prev => [...prev, newMarker]);
      showToast(`Marker placed at ${lat}°N, ${lon}°E.`, 'success');
    } else if (activeTool === 'region') {
      showToast(`Region selected at (${x}%, ${y}%). Convective flux sampled.`, 'info');
    }
  };

  const getGradient = () => {
    if (band === 'Visible') {
      return 'radial-gradient(ellipse at 55% 45%, #ffffff 0%, #a8d5e5 30%, #3a7bd5 60%, #0a1628 100%)';
    }
    if (band === 'Water Vapor 6.2μm') {
      return 'radial-gradient(ellipse at 55% 45%, #e056fd 0%, #686de0 35%, #130f40 75%, #050d1a 100%)';
    }
    return 'radial-gradient(ellipse at 55% 45%, #ff1744 0%, #ff9100 25%, #ffd600 45%, #00b0ff 70%, #0a1628 100%)';
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 dark:text-[#88a0c0]">Multi-Sensor Downlink Engine</div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Live Satellite Feed Viewer</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setComparison(!comparison);
              showToast(comparison ? 'Exited dual compare mode.' : 'Activated dual satellite compare mode.', 'info');
            }}
            className={`text-xs sm:text-sm px-3 py-2 rounded-lg border font-semibold transition-all cursor-pointer shadow-sm ${
              comparison
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-[#00d4ff] border-cyan-500/50'
                : 'bg-white dark:bg-[#0a1628] text-slate-700 dark:text-[#88a0c0] border-slate-300 dark:border-[#1a3a6b] hover:border-cyan-500/40 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {comparison ? '✓ Dual Compare Active' : 'Enable Dual Compare Mode'}
          </button>
          <button
            onClick={handleDownloadFrame}
            className="flex items-center gap-2 text-xs sm:text-sm px-3.5 py-2 rounded-lg font-bold text-slate-950 bg-cyan-400 dark:bg-[#00d4ff] hover:bg-cyan-300 border border-cyan-400 transition-colors cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Download size={14} />
            <span>Download Frame</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        {/* Main Viewer Area */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Source Selector Tabs */}
          <div className="flex gap-1 p-1 rounded-xl border border-slate-200 dark:border-[#1a3a6b] bg-slate-100 dark:bg-[#0a1628] shadow-sm">
            {sources.map(s => (
              <button
                key={s}
                onClick={() => handleSourceChange(s)}
                className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-all cursor-pointer border ${
                  source === s
                    ? 'bg-white dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-blue-500/20 text-cyan-700 dark:text-[#00d4ff] border-slate-200 dark:border-cyan-500/40 shadow-sm'
                    : 'bg-transparent text-slate-600 dark:text-[#88a0c0] border-transparent hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Band Selector & HDF5 Dataset File Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {bands.map(b => (
                <button
                  key={b}
                  onClick={() => handleBandChange(b)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer shadow-sm ${
                    band === b
                      ? 'bg-cyan-500/20 text-cyan-700 dark:text-[#00d4ff] border-cyan-500/50'
                      : 'bg-white dark:bg-[#0d1f3c] text-slate-600 dark:text-[#88a0c0] border-slate-300 dark:border-[#1a3a6b] hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/30'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* HDF5 Dataset File Selector Dropdown */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl border border-slate-300 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] shadow-sm">
              <HardDrive size={14} className="text-cyan-600 dark:text-[#00d4ff]" />
              <span className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium">Dataset:</span>
              <select
                value={selectedFile}
                onChange={e => {
                  setSelectedFile(e.target.value);
                  showToast(`Selected satellite file: ${e.target.value}`, 'info');
                }}
                className="text-xs bg-slate-50 dark:bg-[#0a1628] text-slate-900 dark:text-white font-mono font-semibold px-2 py-1 rounded-lg border border-slate-300 dark:border-[#1a3a6b] focus:outline-none focus:border-cyan-500"
              >
                {availableFiles.length > 0 ? (
                  availableFiles.map(f => <option key={f} value={f} className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">{f}</option>)
                ) : (
                  <option value="" className="bg-white dark:bg-[#0a1628] text-slate-900 dark:text-white">No .h5 files found in ./data/</option>
                )}
              </select>
            </div>
          </div>

          {/* Image Canvas Container */}
          <div className="flex gap-3 flex-1 min-h-[320px] rounded-2xl overflow-hidden shadow-lg">
            {/* Primary Frame */}
            <div
              className={`flex-1 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[#1a3a6b] select-none bg-[#050d1a] ${
                activeTool ? 'cursor-crosshair' : 'cursor-default'
              }`}
              onClick={handleCanvasClick}
            >
              {/* Real Extracted Base64 Thermal Patch or Synthetic Cloud Field */}
              {patchData && patchData.image_uri ? (
                <img
                  src={patchData.image_uri}
                  alt="Extracted HDF5 Thermal Patch"
                  className="w-full h-full object-contain transition-all duration-300"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  }}
                />
              ) : (
                <div
                  className="absolute inset-0 transition-all duration-300"
                  style={{
                    background: getGradient(),
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div
                      className="w-56 h-56 rounded-full cyclone-spin opacity-60"
                      style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.8) 10%, rgba(255,100,50,0.4) 35%, transparent 70%)',
                      }}
                    />
                    <div className="w-6 h-6 rounded-full bg-[#0a1628] border border-cyan-400 absolute" />
                  </div>
                </div>
              )}

              {loadingPatch && (
                <div className="absolute inset-0 bg-[#0a1628]/80 backdrop-blur-sm flex items-center justify-center z-30">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 dark:text-[#00d4ff]">
                    <RefreshCw size={16} className="animate-spin text-cyan-400" />
                    <span>Extracting HDF5 Radiometric Patch...</span>
                  </div>
                </div>
              )}

              {/* User-Placed Custom Markers */}
              {markers.map(m => (
                <div
                  key={m.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                  style={{ left: `${m.x}%`, top: `${m.y}%` }}
                >
                  <div className="w-3 h-3 rounded-full bg-[#00d4ff] border-2 border-white shadow-[0_0_8px_#00d4ff]" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0a1628]/90 border border-cyan-500/40 text-cyan-300 whitespace-nowrap block mt-1">
                    {m.label}
                  </span>
                </div>
              ))}

              {/* Metadata Overlay Bottom Bar */}
              <div className="absolute bottom-0 inset-x-0 px-3.5 py-2 flex items-center justify-between backdrop-blur-md bg-slate-900/85 dark:bg-[#0a1628]/85 border-t border-slate-700 dark:border-[#1a3a6b] z-20">
                <div className="text-xs font-mono text-slate-300 dark:text-[#88a0c0]">
                  <span className="text-white font-bold">{source}</span> · {band} · Frame: -{24 - timeIndex}h (14-Sep 12:00 UTC)
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold font-mono">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  DOWNLINK SYNCHRONIZED
                </div>
              </div>

              {/* Thermal Temperature Scale */}
              <div className="absolute right-3 top-4 bottom-12 w-3 rounded overflow-hidden border border-slate-300 dark:border-[#1a3a6b] z-20"
                   style={{ background: 'linear-gradient(to bottom, #ff1744, #ff9100, #ffd600, #00e676, #00b0ff, #0a1628)' }} />
            </div>

            {/* Comparison Frame (when enabled) */}
            {comparison && (
              <div
                className="flex-1 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[#1a3a6b] bg-[#050d1a]"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(ellipse at 45% 55%, #e056fd 0%, #686de0 35%, #050d1a 100%)',
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-52 h-52 rounded-full cyclone-spin opacity-50"
                         style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.7) 10%, transparent 65%)' }} />
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 px-3.5 py-2 backdrop-blur-md bg-slate-900/85 dark:bg-[#0a1628]/85 border-t border-slate-700 dark:border-[#1a3a6b] text-xs font-mono text-slate-300 dark:text-[#88a0c0]">
                  <span className="text-white font-bold">INSAT-3DR</span> · Water Vapor 6.2μm · Frame: -{24 - timeIndex}h
                </div>
              </div>
            )}
          </div>

          {/* Interactive Playback & Image Processing Controls */}
          <div className="rounded-2xl p-3.5 border border-slate-200 dark:border-[#1a3a6b] flex flex-wrap items-center gap-4 bg-white dark:bg-[#0d1f3c] shadow-lg">
            {/* Playback Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTimeIndex(Math.max(0, timeIndex - 1))}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#102a4c] text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Step Backward 1 Hour"
              >
                <SkipBack size={16} />
              </button>
              <button
                onClick={() => setPlaying(!playing)}
                className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all text-slate-950 bg-cyan-400 dark:bg-[#00d4ff] hover:bg-cyan-300 border border-cyan-400 cursor-pointer shadow-md shadow-cyan-500/20"
                title={playing ? 'Pause Loop' : 'Play 24h Loop'}
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}
                <span>{playing ? 'Pause' : 'Play Loop'}</span>
              </button>
              <button
                onClick={() => setTimeIndex(Math.min(24, timeIndex + 1))}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#102a4c] text-slate-600 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Step Forward 1 Hour"
              >
                <SkipForward size={16} />
              </button>
            </div>

            {/* Timeline Range Scrubber */}
            <div className="flex-1 min-w-[200px] flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-600 dark:text-[#88a0c0]">
                <span>-24h (T0)</span>
                <span className="text-cyan-700 dark:text-[#00d4ff] font-bold">-{24 - timeIndex}h Observed</span>
                <span>Now (T+0)</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={timeIndex}
                onChange={e => setTimeIndex(Number(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-200 dark:bg-[#0a1628] rounded cursor-pointer"
              />
            </div>

            {/* Image Enhancements */}
            <div className="flex items-center gap-3 text-xs border-l border-slate-200 dark:border-[#1a3a6b] pl-3">
              <div>
                <span className="text-slate-600 dark:text-[#88a0c0] text-[10px] block">Brightness: {brightness}%</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={e => setBrightness(Number(e.target.value))}
                  className="w-16 accent-cyan-500 h-1 bg-slate-200 dark:bg-[#0a1628] rounded cursor-pointer"
                />
              </div>
              <div>
                <span className="text-slate-600 dark:text-[#88a0c0] text-[10px] block">Contrast: {contrast}%</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={e => setContrast(Number(e.target.value))}
                  className="w-16 accent-cyan-500 h-1 bg-slate-200 dark:bg-[#0a1628] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Telemetry & Spatial Annotation Suite */}
        <div className="w-full lg:w-72 flex flex-col gap-3 flex-shrink-0">
          {/* Active Dataset HDF5 Radiometric Metrics */}
          {patchData && patchData.stats ? (
            <div className="rounded-2xl p-3.5 border border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] space-y-2 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1a3a6b] pb-2">
                <span className="text-[10px] font-bold tracking-widest text-cyan-700 dark:text-[#00d4ff] uppercase font-mono">HDF5 Radiometric Stats</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-[11px] font-mono space-y-1 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-[#88a0c0]">Active File:</span>
                  <span className="text-slate-900 dark:text-white font-bold truncate max-w-[150px]" title={patchData.selected_file}>{patchData.selected_file}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-[#88a0c0]">Min Brightness:</span>
                  <span className="text-cyan-700 dark:text-[#00d4ff] font-bold">{patchData.stats.min}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-[#88a0c0]">Max Brightness:</span>
                  <span className="text-cyan-700 dark:text-[#00d4ff] font-bold">{patchData.stats.max}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-[#88a0c0]">Mean Radiance:</span>
                  <span className="text-sky-600 dark:text-sky-300 font-bold">{patchData.stats.mean}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-[#88a0c0]">Std Deviation:</span>
                  <span className="text-sky-600 dark:text-sky-300 font-bold">{patchData.stats.std}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-[#88a0c0]">Target Center:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{patchData.target_lat}°N, {patchData.target_lon}°E</span>
                </div>
              </div>
            </div>
          ) : null}

          <h3 className="text-xs font-bold tracking-widest text-slate-600 dark:text-[#88a0c0] uppercase font-mono">
            Active Satellite Downlinks
          </h3>

          <div className="space-y-2.5">
            {satelliteFeeds.map(f => (
              <div
                key={f.id}
                onClick={() => handleSourceChange(f.source)}
                className={`rounded-xl p-3 border cursor-pointer transition-all shadow-sm ${
                  source === f.source ? 'border-cyan-500 bg-slate-100 dark:bg-[#102a4c]' : 'border-slate-200 dark:border-[#1a3a6b] bg-white dark:bg-[#0d1f3c] hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{f.source}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-[#88a0c0] space-y-0.5 font-mono">
                  <div>Band: <span className="text-cyan-700 dark:text-[#00d4ff]">{f.band}</span></div>
                  <div>Resolution: <span className="text-slate-800 dark:text-white">{f.resolution}</span></div>
                  <div>Sync: <span className="text-slate-600 dark:text-slate-300">{f.time}</span></div>
                </div>
              </div>
            ))}
          </div>

          {/* Spatial Annotation Suite */}
          <div className="rounded-2xl p-3.5 border border-slate-200 dark:border-[#1a3a6b] mt-auto bg-white dark:bg-[#0d1f3c] shadow-lg">
            <h4 className="text-xs font-bold tracking-widest text-slate-600 dark:text-[#88a0c0] uppercase mb-2 font-mono">
              Spatial Annotation Tools
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const next = activeTool === 'marker' ? null : 'marker';
                  setActiveTool(next);
                  showToast(next ? 'Click on satellite canvas to place coordinate marker.' : 'Marker tool deactivated.', 'info');
                }}
                className={`w-full py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  activeTool === 'marker'
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-[#00d4ff] border-cyan-500/50'
                    : 'bg-slate-50 dark:bg-[#0a1628] border-slate-300 dark:border-[#1a3a6b] text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/40'
                }`}
              >
                <MapPin size={13} />
                <span>{activeTool === 'marker' ? 'Click Canvas to Mark' : 'Place Coordinate Marker'}</span>
              </button>

              <button
                onClick={() => {
                  const next = activeTool === 'region' ? null : 'region';
                  setActiveTool(next);
                  showToast(next ? 'Click on canvas to sample bounding convective flux.' : 'Region tool deactivated.', 'info');
                }}
                className={`w-full py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  activeTool === 'region'
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-[#00d4ff] border-cyan-500/50'
                    : 'bg-slate-50 dark:bg-[#0a1628] border-slate-300 dark:border-[#1a3a6b] text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/40'
                }`}
              >
                <Square size={13} />
                <span>{activeTool === 'region' ? 'Sampling Mode Active' : 'Sample Convective Flux'}</span>
              </button>

              {markers.length > 0 && (
                <button
                  onClick={() => { setMarkers([]); showToast('All placed markers cleared.', 'info'); }}
                  className="w-full py-1.5 rounded-lg text-[11px] text-slate-500 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#102a4c] transition-colors cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-[#1a3a6b]"
                >
                  Clear Placed Markers ({markers.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
