import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Tooltip as MapTooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, Filter, Download, ArrowUpDown, BookOpen, Layers, CheckCircle2,
  MapPin, Wind, Navigation, ShieldAlert, Activity, Calendar, Users, DollarSign, Eye,
  Compass, Map, Radio, Building2, Sparkles, RefreshCw, ChevronRight, AlertTriangle,
  Play, Pause, FastForward, Clock, Cpu, BarChart3
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { runCityImpactPrediction, fetchHistoricalCyclones, predictCNNLSTMTrajectory } from '../services/api';
import { COASTAL_PORTS, getDistanceKm, getClosestPorts } from '../data/coastalPorts';

const AVAILABLE_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011];

// Fallback comprehensive offline database (2011 - 2026)
const INITIAL_OFFLINE_CYCLONES = [
  {
    id: 'DANA_2024',
    name: 'DANA',
    year: 2024,
    basin: 'Bay of Bengal',
    category: 4,
    max_category: 'Very Severe Cyclonic Storm (VSCS)',
    peak_wind_kts: 100,
    peak_wind_kmh: 185,
    min_pressure_hpa: 968,
    landfall: 'Odisha (Dhamra Port / Habalikhati)',
    deaths: 0,
    damage: '₹1,450 Cr',
    dates_active: '22 Oct 2024 – 26 Oct 2024',
    status: 'Archived (NOAA IBTrACS)',
    notes: 'Very Severe Cyclonic Storm. Zero casualty mass evacuation achieved in Bhadrak and Kendrapara coastal districts.',
    lat: 20.78,
    lon: 86.92,
    track: [[15.4, 87.2], [17.5, 87.0], [19.2, 86.8], [20.4, 86.85], [20.78, 86.92]],
    points: [
      { step: 1, timestamp: '2024-10-22 00:00', lat: 15.4, lon: 87.2, wind_speed_kmh: 65, wind_speed_kts: 35, pressure_hpa: 1000, category: 'Depression', color: '#10b981' },
      { step: 2, timestamp: '2024-10-23 06:00', lat: 17.5, lon: 87.0, wind_speed_kmh: 102, wind_speed_kts: 55, pressure_hpa: 990, category: 'Cyclonic Storm', color: '#06b6d4' },
      { step: 3, timestamp: '2024-10-24 00:00', lat: 19.2, lon: 86.8, wind_speed_kmh: 148, wind_speed_kts: 80, pressure_hpa: 978, category: 'Severe Cyclonic Storm', color: '#f97316' },
      { step: 4, timestamp: '2024-10-24 18:00', lat: 20.4, lon: 86.85, wind_speed_kmh: 185, wind_speed_kts: 100, pressure_hpa: 968, category: 'Very Severe Cyclonic Storm', color: '#ef4444' },
      { step: 5, timestamp: '2024-10-25 00:00', lat: 20.78, lon: 86.92, wind_speed_kmh: 175, wind_speed_kts: 95, pressure_hpa: 972, category: 'Landfall (Dhamra)', color: '#ef4444' }
    ]
  },
  {
    id: 'BIPARJOY_2023',
    name: 'BIPARJOY',
    year: 2023,
    basin: 'Arabian Sea',
    category: 3,
    max_category: 'Extremely Severe Cyclonic Storm (ESCS)',
    peak_wind_kts: 90,
    peak_wind_kmh: 165,
    min_pressure_hpa: 966,
    landfall: 'Gujarat (Jakhau Port / Naliya)',
    deaths: 12,
    damage: '₹3,200 Cr',
    dates_active: '06 Jun 2023 – 16 Jun 2023',
    status: 'Archived (NOAA IBTrACS)',
    notes: 'Longest lived Arabian Sea cyclone in recent historical record (10 days peak); crossed coast at Jakhau.',
    lat: 23.22,
    lon: 68.63,
    track: [[11.5, 66.0], [13.2, 66.0], [15.2, 66.5], [19.2, 67.7], [23.22, 68.63]],
    points: [
      { step: 1, timestamp: '2023-06-06 00:00', lat: 11.5, lon: 66.0, wind_speed_kmh: 65, wind_speed_kts: 35, pressure_hpa: 1000, category: 'Cyclonic Storm', color: '#10b981' },
      { step: 2, timestamp: '2023-06-07 00:00', lat: 13.2, lon: 66.0, wind_speed_kmh: 120, wind_speed_kts: 65, pressure_hpa: 982, category: 'Very Severe Cyclonic Storm', color: '#f97316' },
      { step: 3, timestamp: '2023-06-08 06:00', lat: 15.2, lon: 66.5, wind_speed_kmh: 165, wind_speed_kts: 90, pressure_hpa: 960, category: 'Extremely Severe', color: '#ef4444' },
      { step: 4, timestamp: '2023-06-11 00:00', lat: 19.2, lon: 67.7, wind_speed_kmh: 195, wind_speed_kts: 105, pressure_hpa: 946, category: 'Extremely Severe', color: '#ef4444' },
      { step: 5, timestamp: '2023-06-15 18:00', lat: 23.22, lon: 68.63, wind_speed_kmh: 148, wind_speed_kts: 80, pressure_hpa: 966, category: 'Landfall (Jakhau)', color: '#f97316' }
    ]
  },
  {
    id: 'MICHAUNG_2023',
    name: 'MICHAUNG',
    year: 2023,
    basin: 'Bay of Bengal',
    category: 4,
    max_category: 'Super Cyclonic Storm (SuCS)',
    peak_wind_kts: 105,
    peak_wind_kmh: 195,
    min_pressure_hpa: 960,
    landfall: 'Andhra Pradesh (Bapatla Coast)',
    deaths: 17,
    damage: '₹4,100 Cr',
    dates_active: '01 Dec 2023 – 06 Dec 2023',
    status: 'Archived (NOAA IBTrACS)',
    notes: 'Intense track parallel to Tamil Nadu coast bringing catastrophic 450mm urban flooding across Chennai.',
    lat: 15.8,
    lon: 80.3,
    track: [[8.8, 87.5], [10.8, 85.0], [13.5, 81.8], [15.8, 80.3]],
    points: [
      { step: 1, timestamp: '2023-12-01 00:00', lat: 8.8, lon: 87.5, wind_speed_kmh: 55, wind_speed_kts: 30, pressure_hpa: 1004, category: 'Depression', color: '#10b981' },
      { step: 2, timestamp: '2023-12-02 12:00', lat: 10.8, lon: 85.0, wind_speed_kmh: 83, wind_speed_kts: 45, pressure_hpa: 996, category: 'Cyclonic Storm', color: '#06b6d4' },
      { step: 3, timestamp: '2023-12-04 00:00', lat: 13.5, lon: 81.8, wind_speed_kmh: 120, wind_speed_kts: 65, pressure_hpa: 982, category: 'Severe Cyclonic', color: '#f97316' },
      { step: 4, timestamp: '2023-12-05 06:00', lat: 15.8, lon: 80.3, wind_speed_kmh: 111, wind_speed_kts: 60, pressure_hpa: 986, category: 'Landfall (Bapatla)', color: '#f97316' }
    ]
  },
  {
    id: 'AMPHAN_2020',
    name: 'AMPHAN',
    year: 2020,
    basin: 'Bay of Bengal',
    category: 5,
    max_category: 'Super Cyclonic Storm (SuCS)',
    peak_wind_kts: 145,
    peak_wind_kmh: 270,
    min_pressure_hpa: 920,
    landfall: 'West Bengal (Sundarbans / Bakkhali)',
    deaths: 128,
    damage: '₹1,02,000 Cr',
    dates_active: '16 May 2020 – 21 May 2020',
    status: 'Archived (NOAA IBTrACS)',
    notes: 'First Super Cyclonic Storm in Bay of Bengal since 1999; devastating impact on Kolkata metropolis.',
    lat: 21.70,
    lon: 88.30,
    track: [[10.4, 87.0], [11.5, 86.2], [13.4, 86.4], [16.0, 86.8], [21.70, 88.30]],
    points: [
      { step: 1, timestamp: '2020-05-16 00:00', lat: 10.4, lon: 87.0, wind_speed_kmh: 65, wind_speed_kts: 35, pressure_hpa: 1000, category: 'Depression', color: '#10b981' },
      { step: 2, timestamp: '2020-05-17 00:00', lat: 11.5, lon: 86.2, wind_speed_kmh: 102, wind_speed_kts: 55, pressure_hpa: 990, category: 'Severe Cyclonic', color: '#f97316' },
      { step: 3, timestamp: '2020-05-18 00:00', lat: 13.4, lon: 86.4, wind_speed_kmh: 270, wind_speed_kts: 145, pressure_hpa: 920, category: 'Super Cyclone', color: '#ef4444' },
      { step: 4, timestamp: '2020-05-20 12:00', lat: 21.7, lon: 88.3, wind_speed_kmh: 165, wind_speed_kts: 90, pressure_hpa: 960, category: 'Landfall (Sundarbans)', color: '#ef4444' }
    ]
  },
  {
    id: 'FANI_2019',
    name: 'FANI',
    year: 2019,
    basin: 'Bay of Bengal',
    category: 4,
    max_category: 'Extremely Severe Cyclonic Storm (ESCS)',
    peak_wind_kts: 135,
    peak_wind_kmh: 250,
    min_pressure_hpa: 932,
    landfall: 'Odisha (Puri)',
    deaths: 89,
    damage: '₹23,000 Cr',
    dates_active: '26 Apr 2019 – 04 May 2019',
    status: 'Archived (NOAA IBTrACS)',
    notes: 'Extremely Severe Cyclonic Storm; direct landfall on Puri city with historic 1.2 million record evacuation.',
    lat: 19.81,
    lon: 85.83,
    track: [[5.2, 88.5], [8.5, 87.0], [14.0, 84.5], [17.5, 84.8], [19.81, 85.83]],
    points: [
      { step: 1, timestamp: '2019-04-26 06:00', lat: 5.2, lon: 88.5, wind_speed_kmh: 55, wind_speed_kts: 30, pressure_hpa: 1002, category: 'Depression', color: '#10b981' },
      { step: 2, timestamp: '2019-04-29 00:00', lat: 8.5, lon: 87.0, wind_speed_kmh: 111, wind_speed_kts: 60, pressure_hpa: 986, category: 'Severe Cyclonic', color: '#f97316' },
      { step: 3, timestamp: '2019-05-01 00:00', lat: 14.0, lon: 84.5, wind_speed_kmh: 210, wind_speed_kts: 115, pressure_hpa: 948, category: 'Very Severe', color: '#ef4444' },
      { step: 4, timestamp: '2019-05-03 03:00', lat: 19.81, lon: 85.83, wind_speed_kmh: 210, wind_speed_kts: 115, pressure_hpa: 945, category: 'Landfall (Puri)', color: '#ef4444' }
    ]
  },
  {
    id: 'TAUKTAE_2021',
    name: 'TAUKTAE',
    year: 2021,
    basin: 'Arabian Sea',
    category: 4,
    max_category: 'Extremely Severe Cyclonic Storm (ESCS)',
    peak_wind_kts: 120,
    peak_wind_kmh: 220,
    min_pressure_hpa: 950,
    landfall: 'Gujarat (Saurashtra - Una)',
    deaths: 118,
    damage: '₹15,000 Cr',
    dates_active: '14 May 2021 – 19 May 2021',
    status: 'Archived (NOAA IBTrACS)',
    notes: 'Traversed entire Western Ghats offshore corridor causing major offshore barge distress.',
    lat: 20.8,
    lon: 71.1,
    track: [[10.5, 72.8], [12.8, 72.5], [15.3, 72.8], [18.5, 71.5], [20.8, 71.1]],
    points: [
      { step: 1, timestamp: '2021-05-14 06:00', lat: 10.5, lon: 72.8, wind_speed_kmh: 55, wind_speed_kts: 30, pressure_hpa: 1002, category: 'Depression', color: '#10b981' },
      { step: 2, timestamp: '2021-05-15 06:00', lat: 12.8, lon: 72.5, wind_speed_kmh: 102, wind_speed_kts: 55, pressure_hpa: 988, category: 'Severe Cyclonic', color: '#f97316' },
      { step: 3, timestamp: '2021-05-17 06:00', lat: 18.5, lon: 71.5, wind_speed_kmh: 220, wind_speed_kts: 120, pressure_hpa: 950, category: 'Extremely Severe', color: '#ef4444' },
      { step: 4, timestamp: '2021-05-17 18:00', lat: 20.8, lon: 71.1, wind_speed_kmh: 175, wind_speed_kts: 95, pressure_hpa: 958, category: 'Landfall (Saurashtra)', color: '#ef4444' }
    ]
  }
];

const catColor = (c) => {
  if (c >= 5) return '#ff3b3b';
  if (c === 4) return '#ff5500';
  if (c === 3) return '#ff9500';
  if (c === 2) return '#06b6d4';
  return '#10b981';
};

const TILE_LAYERS = {
  'Satellite View': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  'Ocean Topo': 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
  'Street View': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  'Dark Canvas': 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
};

const DARK_LABELS_OVERLAY = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}';
const SATELLITE_LABELS_OVERLAY = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

function MapController({ targetLat, targetLon }) {
  const map = useMap();
  useEffect(() => {
    if (targetLat && targetLon) {
      map.flyTo([targetLat, targetLon], 6, { duration: 1.2 });
    }
  }, [targetLat, targetLon, map]);
  return null;
}

export default function HistoricalData() {
  const { showToast } = useToast();
  const { isLight } = useTheme();

  // Selected Year Filter (2011 to 2026 or 'all')
  const [selectedYear, setSelectedYear] = useState('all');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [sortField, setSortField] = useState('year');
  const [sortDir, setSortDir] = useState('desc');

  // Cyclones Dataset
  const [cyclones, setCyclones] = useState(INITIAL_OFFLINE_CYCLONES);
  const [loadingCyclones, setLoadingCyclones] = useState(false);
  const [selectedStorm, setSelectedStorm] = useState(INITIAL_OFFLINE_CYCLONES[0]);

  // CNN-LSTM 72h Future Trajectory Forecast State
  const [forecastData, setForecastData] = useState(null);
  const [isForecasting, setIsForecasting] = useState(false);
  const [showForecastOnMap, setShowForecastOnMap] = useState(true);

  // Map & GIS display toggles
  const [activeLayer, setActiveLayer] = useState(isLight ? 'Street View' : 'Dark Canvas');
  const [showCities, setShowCities] = useState(true);
  const [showRiskRings, setShowRiskRings] = useState(true);
  const [analogues, setAnalogues] = useState([]);

  // Sync active layer with theme
  useEffect(() => {
    if (isLight && activeLayer === 'Dark Canvas') {
      setActiveLayer('Street View');
    } else if (!isLight && activeLayer === 'Street View') {
      setActiveLayer('Dark Canvas');
    }
  }, [isLight]);

  // Load NOAA IBTrACS data from backend
  const loadHistoricalData = useCallback(async (year = null) => {
    setLoadingCyclones(true);
    try {
      const data = await fetchHistoricalCyclones(year === 'all' ? null : year, search);
      if (data && data.success && Array.isArray(data.cyclones) && data.cyclones.length > 0) {
        setCyclones(data.cyclones);
        if (!selectedStorm || !data.cyclones.some(c => c.id === selectedStorm.id)) {
          setSelectedStorm(data.cyclones[0]);
        }
      }
    } catch (err) {
      console.warn('Using local dataset:', err);
    } finally {
      setLoadingCyclones(false);
    }
  }, [search, selectedStorm]);

  useEffect(() => {
    loadHistoricalData(selectedYear);
  }, [selectedYear, loadHistoricalData]);

  // Load Climatological Analogue Matcher
  useEffect(() => {
    async function loadAnalogues() {
      const data = await runCityImpactPrediction(15.4, 87.2, 175);
      if (data && data.success) {
        setAnalogues(data.historical_analogues || []);
      }
    }
    loadAnalogues();
  }, []);

  // Run CNN-LSTM Trajectory Forecast whenever selectedStorm changes
  const executeForecastInference = useCallback(async (storm = selectedStorm) => {
    if (!storm) return;
    setIsForecasting(true);

    const pts = storm.points || [];
    const originPoint = pts.length > 0 ? pts[Math.max(0, Math.floor(pts.length / 2))] : { lat: storm.lat, lon: storm.lon };
    const lat = originPoint.lat || storm.lat;
    const lon = originPoint.lon || storm.lon;
    const windKmh = originPoint.wind_speed_kmh || storm.peak_wind_kmh || 140;
    const pressHpa = originPoint.pressure_hpa || storm.min_pressure_hpa || 980;

    try {
      const forecast = await predictCNNLSTMTrajectory({
        lat,
        lon,
        windKmh,
        pressureHpa: pressHpa,
        cycloneName: `CYCLONE ${storm.name}`,
        forecastHours: 72,
        stepHours: 6
      });

      if (forecast && forecast.success) {
        setForecastData(forecast);
        showToast(`CNN-LSTM Deep Learning Engine generated 72h future trajectory for ${storm.name}.`, 'success');
      }
    } catch (err) {
      console.error('Forecast error:', err);
      showToast('Error computing trajectory forecast.', 'warning');
    } finally {
      setIsForecasting(false);
    }
  }, [selectedStorm, showToast]);

  // Automatically compute 72-hour forecast when storm changes
  useEffect(() => {
    if (selectedStorm) {
      executeForecastInference(selectedStorm);
    }
  }, [selectedStorm?.id]);

  const handleSelectStorm = (storm) => {
    setSelectedStorm(storm);
    showToast(`Focused on Cyclone ${storm.name} (${storm.year}) · ${storm.basin}.`, 'info');
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    showToast(year === 'all' ? 'Displaying 11-Year Complete Archive (2011–2026)' : `Filtering NOAA IBTrACS archive for Year ${year}`, 'info');
  };

  // Filter and Sort Cyclones
  const filteredCyclones = useMemo(() => {
    return cyclones
      .filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.landfall?.toLowerCase().includes(search.toLowerCase()) ||
          String(c.year).includes(search) ||
          c.basin?.toLowerCase().includes(search.toLowerCase());
        const matchesYear = selectedYear === 'all' || Number(c.year) === Number(selectedYear);
        const matchesCat = catFilter === 'all' || Number(c.category) === Number(catFilter);
        return matchesSearch && matchesYear && matchesCat;
      })
      .sort((a, b) => {
        const vA = a[sortField] ?? 0;
        const vB = b[sortField] ?? 0;
        const comp = vA > vB ? 1 : -1;
        return sortDir === 'asc' ? comp : -comp;
      });
  }, [cyclones, search, selectedYear, catFilter, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = 'Name,Year,Basin,Category,MaxCategory,MaxWind_kmh,MaxWind_kts,MinPressure_hPa,LandfallLocation,Fatalities,Damage_INR,DatesActive,Status\n';
    const rows = filteredCyclones
      .map(c => `"${c.name}",${c.year},"${c.basin}",${c.category},"${c.max_category || ''}",${c.peak_wind_kmh || c.maxWind || 0},${c.peak_wind_kts || 0},${c.min_pressure_hpa || c.pressure || 0},"${c.landfall}",${c.deaths || 0},"${c.damage}","${c.dates_active || ''}","${c.status || 'NOAA IBTrACS'}"`)
      .join('\n');

    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NOAA_IBTrACS_NI_Cyclones_${selectedYear === 'all' ? '2011_2026' : selectedYear}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported NOAA IBTrACS dataset to CSV.', 'success');
  };

  const nearbyCities = selectedStorm ? COASTAL_PORTS.map(city => ({
    ...city,
    distanceKm: getDistanceKm(selectedStorm.lat, selectedStorm.lon, city.lat, city.lon),
  })).sort((a, b) => a.distanceKm - b.distanceKm) : [];

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. TOP HEADER & METRIC STRIP */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-mono text-[#00d4ff] flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse"></span>
            NOAA IBTrACS NORTH INDIAN OCEAN ARCHIVE (2011 – 2026) & CNN-LSTM ENGINE
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mt-1">
            Cyclone Deep-Dive & 11-Year Historical Prediction Engine
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => executeForecastInference(selectedStorm)}
            disabled={isForecasting || !selectedStorm}
            className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 transition-all shadow-lg shadow-red-500/25 cursor-pointer disabled:opacity-50"
          >
            <Cpu size={15} className={isForecasting ? 'animate-spin' : ''} />
            <span>{isForecasting ? 'Forecasting 72h Path...' : 'Simulate 72h CNN-LSTM Path'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-xl font-bold text-[#050d1a] bg-[#00d4ff] hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Download size={15} />
            <span>Export IBTrACS CSV</span>
          </button>
        </div>
      </div>

      {/* 2. DEDICATED 11-YEAR HISTORICAL SELECTOR STRIP (2011 to 2026) */}
      <div className="rounded-2xl p-4 border border-[#1a3a6b] bg-[#0d1f3c]/90 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#00d4ff]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#00d4ff] font-mono">
              Select Synoptic Season (2011 – 2026 Complete Climatology)
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#88a0c0]">
            Showing <strong className="text-white">{filteredCyclones.length}</strong> cyclones for selected timeframe
          </span>
        </div>

        {/* Scrollable Year Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-cyan-500/30">
          <button
            onClick={() => handleYearChange('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap cursor-pointer ${
              selectedYear === 'all'
                ? 'bg-[#00d4ff] text-[#050d1a] shadow-lg shadow-cyan-500/30 scale-105'
                : 'bg-[#0a1628] text-[#88a0c0] hover:text-white hover:bg-cyan-500/10 border border-[#1a3a6b]'
            }`}
          >
            All Years (2011–2026)
          </button>

          {AVAILABLE_YEARS.map(yr => {
            const isSel = selectedYear === yr;
            const countForYear = cyclones.filter(c => Number(c.year) === yr).length;

            return (
              <button
                key={yr}
                onClick={() => handleYearChange(yr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSel
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105 border border-cyan-300'
                    : 'bg-[#0a1628] text-[#88a0c0] hover:text-white hover:bg-cyan-500/10 border border-[#1a3a6b]'
                }`}
              >
                <span>{yr}</span>
                {countForYear > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${
                    isSel ? 'bg-black/30 text-cyan-200' : 'bg-[#1a3a6b] text-slate-300'
                  }`}>
                    {countForYear}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CYCLONE SELECTION QUICK STRIP FOR ACTIVE YEAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredCyclones.slice(0, 8).map(storm => {
          const isSelected = selectedStorm?.id === storm.id;
          const color = catColor(storm.category);

          return (
            <div
              key={storm.id}
              onClick={() => handleSelectStorm(storm)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-[#102a4c] border-[#00d4ff] shadow-xl shadow-cyan-500/20 scale-[1.02]'
                  : 'bg-[#0d1f3c] border-[#1a3a6b] hover:border-cyan-500/50 hover:bg-[#0f2547]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/20 rounded-bl-full flex items-start justify-end p-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-ping"></span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-white text-sm tracking-wide">
                    {storm.name} <span className="text-xs font-mono text-[#88a0c0]">({storm.year})</span>
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                    style={{ borderColor: `${color}60`, backgroundColor: `${color}20`, color }}
                  >
                    CAT {storm.category}
                  </span>
                </div>

                <div className="text-[11px] text-[#88a0c0] mb-2 flex items-center gap-1 font-mono">
                  <Compass size={12} className="text-[#00d4ff]" />
                  <span className="truncate">{storm.basin} · {storm.landfall}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-[#1a3a6b] text-[#88a0c0]">
                <div>💨 Peak: <strong className="text-white">{storm.peak_wind_kmh || storm.maxWind} km/h</strong></div>
                <div>🌡 Press: <strong className="text-white">{storm.min_pressure_hpa || storm.pressure} hPa</strong></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. MAIN SPLIT VIEW: LEAFLET MAP (WITH ANIMATED GLOWING TRAJECTORY) + SYNOPTIC DOSSIER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: INTERACTIVE LEAFLET GIS MAP (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative h-[400px] sm:h-[480px] md:h-[560px] min-h-[400px] rounded-2xl overflow-hidden border border-[#1a3a6b] bg-[#0a1628] shadow-2xl">
            
            {/* Top Map Layer Switcher & Feature Toggles */}
            <div className="absolute top-3 right-3 z-[999] flex flex-wrap gap-2 items-center max-w-[calc(100%-20px)] justify-end">
              {/* Basemap Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0a1628]/95 backdrop-blur-md border border-[#1a3a6b] shadow-xl">
                {Object.keys(TILE_LAYERS).map(layer => {
                  const isActive = activeLayer === layer;
                  return (
                    <button
                      key={layer}
                      type="button"
                      onClick={() => setActiveLayer(layer)}
                      className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-[#00d4ff] text-[#050d1a] border-[#00d4ff] shadow-md shadow-cyan-500/30'
                          : 'text-[#88a0c0] border-transparent hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {layer}
                    </button>
                  );
                })}
              </div>

              {/* Trajectory & City Toggles */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0a1628]/95 backdrop-blur-md border border-[#1a3a6b] shadow-xl text-[10px] font-semibold text-slate-300">
                <button
                  type="button"
                  onClick={() => setShowForecastOnMap(!showForecastOnMap)}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all border font-bold ${
                    showForecastOnMap
                      ? 'bg-red-500/25 text-red-300 border-red-500/50 shadow-sm shadow-red-500/20'
                      : 'text-[#88a0c0] border-transparent hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Cpu size={11} />
                  <span>72h CNN-LSTM Path</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCities(!showCities)}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all border font-bold ${
                    showCities
                      ? 'bg-cyan-500/25 text-[#00d4ff] border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                      : 'text-[#88a0c0] border-transparent hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Building2 size={11} />
                  <span>Ports & Cities</span>
                </button>
              </div>
            </div>

            {/* Map Top Status & Trajectory Legend Pill Bar */}
            <div className="absolute top-3 left-3 z-[999] flex items-center flex-wrap gap-2 max-w-[calc(100%-240px)]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a1628]/95 backdrop-blur-md border border-[#1a3a6b] text-xs font-mono text-[#00d4ff] shadow-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00d4ff] animate-pulse shrink-0"></span>
                <span className="font-bold tracking-wide">NOAA IBTrACS & CNN-LSTM DUAL TRACK</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a1628]/95 backdrop-blur-md border border-cyan-500/40 text-[11px] font-mono shadow-xl text-slate-200">
                <span className="w-3.5 h-1 bg-[#00d4ff] rounded-full inline-block shrink-0 shadow-sm shadow-cyan-400"></span>
                <span className="text-[#00d4ff] font-bold">Past Track</span>
                <span className="text-slate-400">(Ground-Truth Solid)</span>
              </div>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a1628]/95 backdrop-blur-md border border-red-500/40 text-[11px] font-mono shadow-xl text-slate-200">
                <span className="w-3.5 h-1 border-b-2 border-dotted border-red-400 inline-block shrink-0"></span>
                <span className="text-red-400 font-bold">72h AI Forecast</span>
                <span className="text-slate-400">(Animated Dotted Glow)</span>
              </div>
            </div>

            {/* GIS Legend */}
            <div className="absolute bottom-3 left-3 z-[999] rounded-xl p-3 text-xs space-y-2 backdrop-blur-xl bg-[#0a1628]/95 border border-[#1a3a6b] shadow-xl text-slate-300 max-w-[260px]">
              <div className="font-bold tracking-widest text-[#00d4ff] text-[9px] uppercase font-mono flex items-center justify-between pb-1 border-b border-[#1a3a6b]">
                <span>TRAJECTORY LAYERS</span>
                <span className="text-emerald-400 font-semibold">● ACTIVE</span>
              </div>
              <div className="flex items-center gap-2.5 text-[11px] font-mono">
                <span className="w-4 h-1 bg-[#00d4ff] rounded-full shrink-0"></span>
                <span>NOAA Ground-Truth (Solid)</span>
              </div>
              <div className="flex items-center gap-2.5 text-[11px] font-mono">
                <span className="w-4 h-1 border-b-2 border-dotted border-red-400 shrink-0"></span>
                <span className="text-red-300 font-semibold">CNN-LSTM 72h Forecast (Glowing)</span>
              </div>
              <div className="flex items-center gap-2.5 text-[10px] pt-1.5 border-t border-[#1a3a6b] font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b3b] shrink-0"></span>
                <span>Cat 4–5 Super Cyclone (&gt;210 km/h)</span>
              </div>
              <div className="flex items-center gap-2.5 text-[10px] font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff9500] shrink-0"></span>
                <span>Cat 2–3 Severe Storm (120–209 km/h)</span>
              </div>
            </div>

            {/* LEAFLET MAP CONTAINER */}
            <MapContainer
              center={[selectedStorm?.lat || 18.0, selectedStorm?.lon || 84.0]}
              zoom={5}
              style={{ height: '100%', width: '100%', background: '#0a1628' }}
              zoomControl={true}
              attributionControl={false}
            >
              {/* Dynamic Base Tile Layer with key for instantaneous layer swapping */}
              <TileLayer
                key={activeLayer}
                url={TILE_LAYERS[activeLayer] || TILE_LAYERS['Satellite View']}
              />
              {activeLayer === 'Dark Canvas' && (
                <TileLayer key="dark-labels" url={DARK_LABELS_OVERLAY} />
              )}
              {activeLayer === 'Satellite View' && (
                <TileLayer key="sat-labels" url={SATELLITE_LABELS_OVERLAY} />
              )}

              <MapController targetLat={selectedStorm?.lat} targetLon={selectedStorm?.lon} />

              {/* Coastal Ports & Maritime Cities Layer */}
              {showCities && COASTAL_PORTS.map(port => {
                const dist = selectedStorm ? getDistanceKm(selectedStorm.lat, selectedStorm.lon, port.lat, port.lon) : null;
                const isClose = dist !== null && dist <= 220;
                const isCritical = dist !== null && dist <= 120;

                return (
                  <CircleMarker
                    key={port.id}
                    center={[port.lat, port.lon]}
                    radius={isCritical ? 6.5 : (isClose ? 5.5 : 4)}
                    pathOptions={{
                      color: isCritical ? '#ff3b3b' : (isClose ? '#00d4ff' : '#94a3b8'),
                      fillColor: isCritical ? '#ff3b3b' : (isClose ? '#00d4ff' : '#0a1628'),
                      fillOpacity: isClose ? 0.95 : 0.75,
                      weight: isCritical ? 2.5 : 1.5
                    }}
                  >
                    <MapTooltip permanent={isClose} direction="right" offset={[8, 0]}>
                      <div className="text-[10px] font-bold text-[#00d4ff] bg-[#0d1f3c] border border-cyan-500/40 p-1.5 rounded-lg font-mono shadow-xl">
                        🏙️ {port.name} ({port.state})
                        {dist !== null && (
                          <div className={`text-[9px] font-normal ${isCritical ? 'text-red-400 font-bold' : 'text-[#88a0c0]'}`}>
                            Dist: {dist} km to {selectedStorm.name}
                          </div>
                        )}
                      </div>
                    </MapTooltip>
                    <Popup>
                      <div className="p-1 font-mono text-xs bg-[#0d1f3c] text-white border border-[#1a3a6b] rounded-xl shadow-2xl min-w-[220px]">
                        <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#1a3a6b]">
                          <span className="font-extrabold text-sm text-[#00d4ff]">{port.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                            {port.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1.5">
                          📍 {port.state} · <span className="text-[#88a0c0]">{port.basin}</span>
                        </div>
                        {port.berths > 0 && (
                          <div className="text-[10px] text-[#88a0c0] mt-0.5">
                            ⚓ Berths / Docks: <strong className="text-white">{port.berths}</strong>
                          </div>
                        )}
                        {dist !== null && (
                          <div className="mt-2 pt-1.5 border-t border-[#1a3a6b]">
                            <div className="text-[10px] font-bold uppercase text-[#88a0c0] mb-0.5">Distance to {selectedStorm.name}:</div>
                            <div className={`text-xs font-bold ${isCritical ? 'text-red-400' : (isClose ? 'text-amber-300' : 'text-emerald-400')}`}>
                              {dist} km ({isCritical ? 'CRITICAL EVACUATION ZONE' : (isClose ? 'HIGH ALERT PROXIMITY' : 'SAFE DISTANCE')})
                            </div>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 mt-2 italic leading-tight">
                          {port.description}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* 1. SOLID LINE: Past / Present Ground-Truth Track */}
              {selectedStorm && selectedStorm.track && selectedStorm.track.length > 1 && (
                <>
                  <Polyline
                    positions={selectedStorm.track}
                    pathOptions={{
                      color: '#00d4ff',
                      weight: 4.5,
                      opacity: 0.95,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }}
                  />
                  {/* Waypoint circle markers */}
                  {selectedStorm.points?.map((pt, idx) => (
                    <CircleMarker
                      key={`gt-${idx}`}
                      center={[pt.lat, pt.lon]}
                      radius={idx === selectedStorm.points.length - 1 ? 9 : 5}
                      pathOptions={{
                        color: '#ffffff',
                        weight: 2,
                        fillColor: pt.color || '#00d4ff',
                        fillOpacity: 0.95
                      }}
                    >
                      <Popup>
                        <div className="p-1 font-mono text-xs bg-[#0d1f3c] text-white border border-[#1a3a6b] rounded">
                          <div className="font-bold text-[#00d4ff]">STEP {pt.step}: {selectedStorm.name}</div>
                          <div className="text-[#88a0c0] text-[10px]">{pt.timestamp}</div>
                          <div className="text-white mt-1">Wind: {pt.wind_speed_kmh} km/h ({pt.wind_speed_kts} kts)</div>
                          <div className="text-amber-300">Pressure: {pt.pressure_hpa} hPa</div>
                          <div className="text-emerald-400 font-bold mt-1">{pt.category || pt.status}</div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </>
              )}

              {/* 2. ANIMATED GLOWING DOTTED POLYLINE: CNN-LSTM 72-Hour Future Forecast Path */}
              {showForecastOnMap && forecastData && forecastData.forecast_points && forecastData.forecast_points.length > 0 && (
                <>
                  {/* Glowing background path */}
                  <Polyline
                    positions={forecastData.trajectory_path}
                    pathOptions={{
                      color: '#ff3b3b',
                      weight: 8,
                      opacity: 0.35,
                      dashArray: '4, 8'
                    }}
                  />

                  {/* Main Animated Glowing Polyline */}
                  <Polyline
                    positions={forecastData.trajectory_path}
                    pathOptions={{
                      color: '#ff3b3b',
                      weight: 4,
                      opacity: 1,
                      dashArray: '6, 8',
                      className: 'animate-forecast-glow'
                    }}
                  />

                  {/* Forecast Projection Markers */}
                  {forecastData.forecast_points.map((pt, idx) => (
                    <CircleMarker
                      key={`fc-${idx}`}
                      center={[pt.lat, pt.lon]}
                      radius={pt.is_landfall_step ? 10 : 6}
                      pathOptions={{
                        color: pt.is_landfall_step ? '#ff3b3b' : '#ff9500',
                        weight: 2,
                        fillColor: pt.stage_color || '#ff3b3b',
                        fillOpacity: 0.95,
                        dashArray: pt.is_landfall_step ? 'None' : '2, 2'
                      }}
                    >
                      <MapTooltip direction="top" offset={[0, -8]}>
                        <div className="font-mono text-[10px] bg-[#0d1f3c] text-white p-1 rounded border border-red-500/40">
                          <strong className="text-red-400 font-bold">{pt.forecast_hour} FORECAST</strong>
                          <div>Lat: {pt.lat}°N, Lon: {pt.lon}°E</div>
                          <div>Wind: {pt.wind_speed_kmh} km/h</div>
                          <div>Press: {pt.pressure_hpa} hPa ({pt.pressure_drop_hpa > 0 ? `+${pt.pressure_drop_hpa}` : pt.pressure_drop_hpa} hPa)</div>
                          <div className="text-amber-300 font-bold">{pt.category}</div>
                        </div>
                      </MapTooltip>
                    </CircleMarker>
                  ))}
                </>
              )}
            </MapContainer>
          </div>
        </div>

        {/* RIGHT COLUMN: SYNOPTIC DOSSIER & CNN-LSTM 72H TELEMETRY (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedStorm && (
            <div className="rounded-2xl border border-[#1a3a6b] p-5 bg-[#0d1f3c] shadow-2xl flex flex-col justify-between">
              <div>
                {/* Dossier Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1a3a6b] mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-[#00d4ff]" />
                    <span className="font-mono text-xs font-bold text-[#88a0c0] uppercase tracking-wider">
                      NOAA SYNOPTIC DOSSIER
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded border border-red-500/40 bg-red-500/20 text-xs font-bold font-mono text-red-300">
                    CAT {selectedStorm.category} · {selectedStorm.basin}
                  </span>
                </div>

                {/* Storm Title */}
                <div className="mb-4">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    CYCLONE {selectedStorm.name}
                    <span className="text-base text-[#88a0c0] font-mono">({selectedStorm.year})</span>
                  </h2>
                  <div className="text-xs text-slate-300 flex items-center gap-1.5 mt-1 font-semibold font-mono">
                    <MapPin size={13} className="text-[#00d4ff]" />
                    <span>Landfall: {selectedStorm.landfall}</span>
                    <span className="text-[#88a0c0]">· {selectedStorm.dates_active}</span>
                  </div>
                </div>

                {/* KPI Stat Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <div className="p-3 rounded-xl border border-[#1a3a6b] bg-[#0a1628]">
                    <div className="text-[10px] text-[#88a0c0] uppercase font-mono flex items-center gap-1">
                      <Wind size={12} className="text-[#00d4ff]" /> Peak Ground Truth Wind
                    </div>
                    <div className="text-lg font-bold font-mono text-white mt-0.5">
                      {selectedStorm.peak_wind_kmh || selectedStorm.maxWind} <span className="text-xs font-normal text-[#88a0c0]">km/h</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-[#1a3a6b] bg-[#0a1628]">
                    <div className="text-[10px] text-[#88a0c0] uppercase font-mono flex items-center gap-1">
                      <Activity size={12} className="text-[#00d4ff]" /> Min Central Pressure
                    </div>
                    <div className="text-lg font-bold font-mono text-white mt-0.5">
                      {selectedStorm.min_pressure_hpa || selectedStorm.pressure} <span className="text-xs font-normal text-[#88a0c0]">hPa</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-[#1a3a6b] bg-[#0a1628]">
                    <div className="text-[10px] text-[#88a0c0] uppercase font-mono flex items-center gap-1">
                      <Users size={12} className="text-amber-400" /> Human Fatalities
                    </div>
                    <div className="text-lg font-bold font-mono text-white mt-0.5">
                      {selectedStorm.deaths?.toLocaleString() || 0} <span className="text-xs font-normal text-[#88a0c0]">Lives</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-[#1a3a6b] bg-[#0a1628]">
                    <div className="text-[10px] text-[#88a0c0] uppercase font-mono flex items-center gap-1">
                      <DollarSign size={12} className="text-emerald-400" /> Economic Loss
                    </div>
                    <div className="text-lg font-bold font-mono text-white mt-0.5">
                      {selectedStorm.damage || '₹1,200 Cr'}
                    </div>
                  </div>
                </div>

                {/* 72-Hour CNN-LSTM Trajectory Forecast Card */}
                {forecastData && (
                  <div className="p-3.5 rounded-xl border border-red-500/40 bg-gradient-to-br from-red-950/30 to-[#0a1628] mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold font-mono text-red-300 flex items-center gap-1.5">
                        <Cpu size={14} className="text-red-400 animate-pulse" />
                        <span>CNN-LSTM 72-HOUR TRAJECTORY PROJECTION</span>
                      </div>
                      {forecastData.rapid_intensification_alert && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/30 text-red-300 border border-red-500/50">
                          RAPID INTENSIFICATION
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#88a0c0] mb-2">
                      <div>🎯 Landfall Target: <strong className="text-white">{forecastData.estimated_landfall?.target_coast}</strong></div>
                      <div>⏳ Landfall ETA: <strong className="text-amber-300">+{forecastData.estimated_landfall?.eta_hours}h</strong></div>
                      <div>💨 Peak Projected Wind: <strong className="text-red-400">{forecastData.peak_forecast_wind_kmh} km/h</strong></div>
                      <div>🌊 Estimated Surge: <strong className="text-cyan-300">{forecastData.estimated_landfall?.surge_height_m} meters</strong></div>
                    </div>

                    <p className="text-[11px] text-slate-300 italic">
                      Model uses dual-branch TimeDistributedCNN (INSAT-3D radiometer) + WeatherGRU (Open-Meteo MSL & wind tendencies) with BiLSTM temporal aggregation.
                    </p>
                  </div>
                )}

                {/* Historical Impact Summary */}
                <div className="p-3 rounded-xl border border-[#1a3a6b] bg-[#0a1628] mb-4">
                  <div className="text-[10px] text-[#88a0c0] uppercase font-bold tracking-wider mb-1 flex items-center gap-1 font-mono">
                    <ShieldAlert size={12} className="text-amber-400" /> Synoptic Notes & Mitigation Dossier
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedStorm.notes || 'Verified NOAA IBTrACS synoptic record ingested into METEORA ML repository.'}
                  </p>
                </div>
              </div>

              {/* Retrigger forecast button */}
              <button
                onClick={() => executeForecastInference(selectedStorm)}
                disabled={isForecasting}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-[#050d1a] bg-[#00d4ff] hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={isForecasting ? 'animate-spin' : ''} />
                <span>Re-compute CNN-LSTM 72h Forecast for {selectedStorm.name}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. CNN-LSTM 72-HOUR FUTURE TRAJECTORY BREAKDOWN TABLE */}
      {forecastData && forecastData.forecast_points && (
        <div className="rounded-2xl border border-red-500/40 overflow-hidden bg-[#0d1f3c] shadow-xl">
          <div className="px-4 py-3 bg-gradient-to-r from-red-950/40 to-[#0a1628] border-b border-[#1a3a6b] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-red-400" />
              <h3 className="text-xs font-bold tracking-wider text-white uppercase font-mono">
                CNN-LSTM 72-Hour Step-by-Step Trajectory Forecast Matrix
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-300">
              Model: MultiModalCycloneCNNLSTM (Dual-Branch Spatial + Temporal)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1a3a6b] bg-[#0a1628] text-[#88a0c0] uppercase tracking-wider">
                  <th className="px-4 py-2.5 text-left">Forecast Step</th>
                  <th className="px-4 py-2.5 text-left">Timestamp (UTC)</th>
                  <th className="px-4 py-2.5 text-left">Coordinates</th>
                  <th className="px-4 py-2.5 text-left">Wind Speed</th>
                  <th className="px-4 py-2.5 text-left">Central Pressure</th>
                  <th className="px-4 py-2.5 text-left">Pressure Tendency</th>
                  <th className="px-4 py-2.5 text-left">Storm Category</th>
                  <th className="px-4 py-2.5 text-left">Uncertainty Cone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a3a6b]/60">
                {forecastData.forecast_points.map((step, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-[#102a4c]/60 transition-colors ${
                      step.is_landfall_step ? 'bg-red-500/15 border-l-4 border-l-red-500' : ''
                    }`}
                  >
                    <td className="px-4 py-2.5 font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: step.stage_color }}></span>
                      <span>{step.forecast_hour}</span>
                    </td>
                    <td className="px-4 py-2.5 text-[#88a0c0]">{step.timestamp}</td>
                    <td className="px-4 py-2.5 text-cyan-300">{step.lat}°N, {step.lon}°E</td>
                    <td className="px-4 py-2.5 font-bold text-white">
                      {step.wind_speed_kmh} km/h <span className="text-[10px] text-[#88a0c0]">({step.wind_speed_kts} kts)</span>
                    </td>
                    <td className="px-4 py-2.5 text-amber-300 font-bold">{step.pressure_hpa} hPa</td>
                    <td className="px-4 py-2.5">
                      <span className={step.pressure_drop_hpa <= 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                        {step.pressure_drop_hpa > 0 ? `+${step.pressure_drop_hpa}` : step.pressure_drop_hpa} hPa
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold border"
                        style={{
                          borderColor: `${step.stage_color}60`,
                          backgroundColor: `${step.stage_color}20`,
                          color: step.stage_color
                        }}
                      >
                        {step.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[#88a0c0]">±{step.uncertainty_radius_km} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SEARCH & FILTER BAR */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#88a0c0]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cyclone by name, year, basin, or landfall province (e.g. Dana, 2023, Odisha, Gujarat)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#1a3a6b] bg-[#0d1f3c] text-sm text-white focus:outline-none focus:border-[#00d4ff] font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#88a0c0] font-mono">
          <Filter size={13} />
          <span>Category:</span>
        </div>

        <div className="flex gap-1">
          {['all', '1', '2', '3', '4', '5'].map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer font-mono ${
                catFilter === c
                  ? 'bg-cyan-500/20 text-[#00d4ff] border-cyan-500/50 font-bold'
                  : 'bg-[#0d1f3c] text-[#88a0c0] border-[#1a3a6b] hover:text-white hover:border-cyan-500/30'
              }`}
            >
              {c === 'all' ? 'All' : `Cat ${c}`}
            </button>
          ))}
        </div>
      </div>

      {/* 7. COMPLETE NOAA IBTrACS HISTORICAL ARCHIVE TABLE */}
      <div className="rounded-2xl border border-[#1a3a6b] overflow-hidden bg-[#0d1f3c] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a3a6b] bg-[#0a1628] text-xs font-bold text-[#88a0c0] uppercase tracking-wider select-none font-mono">
                {[
                  ['name', 'Storm Name'],
                  ['year', 'Year'],
                  ['basin', 'Basin'],
                  ['category', 'Category'],
                  ['peak_wind_kmh', 'Peak Wind'],
                  ['min_pressure_hpa', 'Min Pressure'],
                  ['landfall', 'Landfall Target'],
                  ['deaths', 'Casualties'],
                  ['damage', 'Damage (INR)'],
                  ['status', 'NOAA Status']
                ].map(([field, label]) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="text-left px-4 py-3 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>{label}</span>
                      <ArrowUpDown size={11} className={sortField === field ? 'text-[#00d4ff]' : 'text-slate-600'} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3a6b]/60 font-mono">
              {filteredCyclones.map(c => {
                const isSelected = selectedStorm?.id === c.id;
                const col = catColor(c.category);

                return (
                  <tr
                    key={c.id}
                    onClick={() => handleSelectStorm(c)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#102a4c] border-l-4 border-l-[#00d4ff]' : 'hover:bg-[#102a4c]/50'
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                      <span>{c.name}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-ping"></span>}
                    </td>
                    <td className="px-4 py-3 text-cyan-300 font-bold">{c.year}</td>
                    <td className="px-4 py-3 text-[#88a0c0]">{c.basin}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded border text-xs font-bold"
                        style={{
                          borderColor: `${col}60`,
                          backgroundColor: `${col}20`,
                          color: col,
                        }}
                      >
                        CAT {c.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {c.peak_wind_kmh || c.maxWind} km/h
                    </td>
                    <td className="px-4 py-3 text-amber-300 font-bold">{c.min_pressure_hpa || c.pressure} hPa</td>
                    <td className="px-4 py-3 text-white font-sans">{c.landfall}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {c.deaths?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#88a0c0]">{c.damage}</td>
                    <td className="px-4 py-3 text-xs text-emerald-400">{c.status || 'Archived'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2.5 text-xs text-[#88a0c0] border-t border-[#1a3a6b] bg-[#0a1628] flex items-center justify-between font-mono">
          <span>Showing {filteredCyclones.length} of {cyclones.length} NOAA IBTrACS climatological records</span>
          <span className="text-[11px] text-[#00d4ff]">Click any cyclone to view past track & run 72h CNN-LSTM forecast</span>
        </div>
      </div>
    </div>
  );
}
