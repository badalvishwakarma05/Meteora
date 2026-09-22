import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Tooltip as MapTooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, Filter, Download, ArrowUpDown, X, BookOpen, Layers, CheckCircle2,
  MapPin, Wind, Navigation, ShieldAlert, Activity, Calendar, Users, DollarSign, Eye,
  Compass, Map, Radio, Building2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { runCityImpactPrediction } from '../services/api';

const COASTAL_CITIES = [
  { name: 'Puri', lat: 19.8135, lon: 85.8312, state: 'Odisha' },
  { name: 'Paradip', lat: 20.3164, lon: 86.6114, state: 'Odisha' },
  { name: 'Balasore', lat: 21.4942, lon: 86.9317, state: 'Odisha' },
  { name: 'Gopalpur', lat: 19.2647, lon: 84.9144, state: 'Odisha' },
  { name: 'Digha', lat: 21.6266, lon: 87.5074, state: 'West Bengal' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, state: 'West Bengal' },
  { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, state: 'Andhra Pradesh' },
  { name: 'Kakinada', lat: 16.9891, lon: 82.2475, state: 'Andhra Pradesh' },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' },
  { name: 'Cuddalore', lat: 11.7480, lon: 79.7714, state: 'Tamil Nadu' },
  { name: 'Kanyakumari', lat: 8.0883, lon: 77.5385, state: 'Tamil Nadu' },
  { name: 'Jakhau Port', lat: 23.2382, lon: 68.6186, state: 'Gujarat' },
  { name: 'Porbandar', lat: 21.6417, lon: 69.6293, state: 'Gujarat' },
  { name: 'Mumbai', lat: 18.9220, lon: 72.8347, state: 'Maharashtra' },
  { name: 'Chittagong', lat: 22.3569, lon: 91.7832, state: 'Bangladesh' }
];

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

const allData = [
  {
    id: 'DANA_2024',
    name: 'DANA',
    year: 2024,
    category: 4,
    maxWind: 185,
    pressure: 968,
    landfall: 'Odisha (Dhamra Port)',
    deaths: 0,
    damage: '₹1,450 Cr',
    lat: 20.78,
    lon: 86.92,
    basin: 'Bay of Bengal',
    track: [[15.4, 87.2], [17.5, 87.0], [19.2, 86.8], [20.78, 86.92]],
    notes: 'Very Severe Cyclonic Storm. Zero casualty mass evacuation achieved in Bhadrak and Kendrapara coastal districts.'
  },
  {
    id: 'REMAL_2024',
    name: 'REMAL',
    year: 2024,
    category: 3,
    maxWind: 135,
    pressure: 978,
    landfall: 'West Bengal / Bangladesh',
    deaths: 30,
    damage: '₹6,800 Cr',
    lat: 21.95,
    lon: 89.20,
    basin: 'Bay of Bengal',
    track: [[16.2, 88.0], [18.8, 88.5], [20.5, 89.0], [21.95, 89.20]],
    notes: 'Severe Cyclonic Storm bringing torrential rain and heavy tidal inundation across the Sundarbans estuarine delta.'
  },
  {
    id: 'BIPARJOY_2023',
    name: 'BIPARJOY',
    year: 2023,
    category: 3,
    maxWind: 165,
    pressure: 966,
    landfall: 'Gujarat (Jakhau Port)',
    deaths: 12,
    damage: '₹3,200 Cr',
    lat: 23.22,
    lon: 68.63,
    basin: 'Arabian Sea',
    track: [[14.0, 66.5], [17.5, 67.2], [20.8, 67.8], [23.22, 68.63]],
    notes: 'Longest lived Arabian Sea cyclone in recent historical record; crossed coast at Jakhau with heavy storm surge.'
  },
  {
    id: 'AMPHAN_2020',
    name: 'AMPHAN',
    year: 2020,
    category: 5,
    maxWind: 270,
    pressure: 920,
    landfall: 'West Bengal (Sundarbans)',
    deaths: 128,
    damage: '₹1,02,000 Cr',
    lat: 21.70,
    lon: 88.30,
    basin: 'Bay of Bengal',
    track: [[12.5, 86.3], [15.8, 86.8], [19.2, 87.5], [21.70, 88.30]],
    notes: 'Super Cyclonic Storm over Bay of Bengal; catastrophic damage across Sundarbans delta and Kolkata metropolis.'
  },
  {
    id: 'FANI_2019',
    name: 'FANI',
    year: 2019,
    category: 4,
    maxWind: 250,
    pressure: 932,
    landfall: 'Odisha (Puri)',
    deaths: 89,
    damage: '₹23,000 Cr',
    lat: 19.81,
    lon: 85.83,
    basin: 'Bay of Bengal',
    track: [[10.2, 85.0], [14.0, 84.5], [17.5, 84.8], [19.81, 85.83]],
    notes: 'Extremely Severe Cyclonic Storm; direct landfall on Puri city with historic 1.2 million record evacuation.'
  },
  {
    id: 'TITLI_2018',
    name: 'TITLI',
    year: 2018,
    category: 3,
    maxWind: 195,
    pressure: 951,
    landfall: 'Andhra Pradesh (Palasa)',
    deaths: 77,
    damage: '₹5,000 Cr',
    lat: 18.77,
    lon: 84.41,
    basin: 'Bay of Bengal',
    track: [[13.0, 87.0], [15.5, 86.2], [17.2, 85.0], [18.77, 84.41]],
    notes: 'Very Severe Cyclonic Storm crossing Srikakulam district with unexpected sharp north-northeast re-curvature.'
  },
  {
    id: 'OCKHI_2017',
    name: 'OCKHI',
    year: 2017,
    category: 2,
    maxWind: 165,
    pressure: 967,
    landfall: 'Tamil Nadu & Lakshadweep',
    deaths: 218,
    damage: '₹2,400 Cr',
    lat: 8.08,
    lon: 77.55,
    basin: 'Arabian Sea / BOB',
    track: [[6.5, 78.5], [7.2, 77.8], [8.08, 77.55], [11.0, 72.5]],
    notes: 'Rapid genesis in Comorin sea impacting deep-sea fishing fleets off Kanyakumari and Lakshadweep Islands.'
  },
  {
    id: 'VARDAH_2016',
    name: 'VARDAH',
    year: 2016,
    category: 3,
    maxWind: 195,
    pressure: 946,
    landfall: 'Tamil Nadu (Chennai)',
    deaths: 59,
    damage: '₹3,500 Cr',
    lat: 13.08,
    lon: 80.27,
    basin: 'Bay of Bengal',
    track: [[12.0, 87.5], [12.5, 84.8], [12.8, 82.0], [13.08, 80.27]],
    notes: 'Direct hit on Chennai metropolitan area; widespread tree uprooting and major coastal telecom outage.'
  },
  {
    id: 'HUDHUD_2014',
    name: 'HUDHUD',
    year: 2014,
    category: 4,
    maxWind: 215,
    pressure: 943,
    landfall: 'Andhra Pradesh (Visakhapatnam)',
    deaths: 124,
    damage: '₹21,908 Cr',
    lat: 17.68,
    lon: 83.21,
    basin: 'Bay of Bengal',
    track: [[11.5, 90.0], [13.8, 87.5], [15.9, 85.0], [17.68, 83.21]],
    notes: 'Catastrophic landfall directly over Visakhapatnam urban center, airport, and major Eastern Naval Command base.'
  },
  {
    id: 'PHAILIN_2013',
    name: 'PHAILIN',
    year: 2013,
    category: 4,
    maxWind: 210,
    pressure: 940,
    landfall: 'Odisha (Gopalpur)',
    deaths: 45,
    damage: '₹17,000 Cr',
    lat: 19.26,
    lon: 84.91,
    basin: 'Bay of Bengal',
    track: [[12.0, 92.0], [14.5, 89.0], [17.0, 86.5], [19.26, 84.91]],
    notes: 'Historic mass evacuation of over 1 million people across Odisha and Andhra Pradesh minimizing mortality.'
  },
  {
    id: 'THANE_2011',
    name: 'THANE',
    year: 2011,
    category: 3,
    maxWind: 195,
    pressure: 950,
    landfall: 'Tamil Nadu (Cuddalore)',
    deaths: 45,
    damage: '₹5,400 Cr',
    lat: 11.75,
    lon: 79.77,
    basin: 'Bay of Bengal',
    track: [[10.5, 85.0], [11.0, 83.2], [11.4, 81.5], [11.75, 79.77]],
    notes: 'Landfall near Cuddalore and Puducherry causing severe destruction of coastal cashew plantations.'
  },
  {
    id: 'AILA_2009',
    name: 'AILA',
    year: 2009,
    category: 2,
    maxWind: 110,
    pressure: 973,
    landfall: 'West Bengal (Sundarbans)',
    deaths: 339,
    damage: '₹11,900 Cr',
    lat: 21.80,
    lon: 88.20,
    basin: 'Bay of Bengal',
    track: [[17.0, 88.0], [19.0, 88.1], [20.5, 88.15], [21.80, 88.20]],
    notes: 'Severe inundation across Sundarbans delta with breaching of over 400km of coastal embankments.'
  },
  {
    id: 'SIDR_2007',
    name: 'SIDR',
    year: 2007,
    category: 5,
    maxWind: 260,
    pressure: 944,
    landfall: 'Bangladesh (Sundarbans)',
    deaths: 3447,
    damage: '₹84,000 Cr',
    lat: 22.10,
    lon: 89.80,
    basin: 'Bay of Bengal',
    track: [[11.0, 91.0], [15.0, 89.5], [18.5, 89.2], [22.10, 89.80]],
    notes: 'Cat 5 equivalent super cyclone creating 5m storm surge across North Bay of Bengal estuaries.'
  }
];

const catColor = (c) => {
  if (c >= 5) return '#ff3b3b';
  if (c === 4) return '#ff5500';
  if (c === 3) return '#ff9500';
  if (c === 2) return '#ffcc00';
  return '#00c851';
};

const TILE_LAYERS = {
  'Dark Canvas': 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  'OpenStreetMap': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  'Satellite View': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  'Ocean Topo': 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
};

const DARK_LABELS_OVERLAY = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}';
const SATELLITE_LABELS_OVERLAY = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

function MapController({ targetLat, targetLon }) {
  const map = useMap();
  useEffect(() => {
    if (targetLat && targetLon) {
      map.flyTo([targetLat, targetLon], 7, { duration: 1.2 });
    }
  }, [targetLat, targetLon, map]);
  return null;
}

export default function HistoricalData() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('year');
  const [sortDir, setSortDir] = useState('desc');
  const [catFilter, setCatFilter] = useState('all');
  const [selectedStorm, setSelectedStorm] = useState(allData[0]);
  const [analogues, setAnalogues] = useState([]);
  const [activeLayer, setActiveLayer] = useState('Dark Canvas');
  const [showCities, setShowCities] = useState(true);
  const [showRiskRings, setShowRiskRings] = useState(true);

  useEffect(() => {
    async function loadAnalogues() {
      const data = await runCityImpactPrediction(15.4, 87.2, 175);
      if (data && data.success) {
        setAnalogues(data.historical_analogues || []);
      }
    }
    loadAnalogues();
  }, []);

  const filtered = allData
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.landfall.toLowerCase().includes(search.toLowerCase()) ||
      String(c.year).includes(search)
    )
    .filter(c => catFilter === 'all' || c.category === Number(catFilter))
    .sort((a, b) => {
      const v = a[sortField] > b[sortField] ? 1 : -1;
      return sortDir === 'asc' ? v : -v;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleSelectStorm = (storm) => {
    setSelectedStorm(storm);
    showToast(`Focused GIS Map & synoptic dossier on Cyclone ${storm.name} (${storm.year}).`, 'info');
  };

  const handleExportCSV = () => {
    const headers = 'Name,Year,Category,MaxWind_kmh,MinPressure_hPa,LandfallState,Fatalities,EstimatedDamage_INR_Cr,Latitude,Longitude,Basin\n';
    const rows = allData
      .map(c => `"${c.name}",${c.year},${c.category},${c.maxWind},${c.pressure},"${c.landfall}",${c.deaths},"${c.damage}",${c.lat},${c.lon},"${c.basin}"`)
      .join('\n');

    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IMD_Historical_Cyclones_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported historical climatology dataset to CSV.', 'success');
  };

  const nearbyCities = selectedStorm ? COASTAL_CITIES.map(city => ({
    ...city,
    distanceKm: getDistanceKm(selectedStorm.lat, selectedStorm.lon, city.lat, city.lon),
  })).sort((a, b) => a.distanceKm - b.distanceKm) : [];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs text-[#88a0c0] font-mono">Climatological Track Records & Precision GIS</div>
          <h1 className="text-xl font-bold text-white tracking-tight">Historical Cyclone Archive & GIS (2007–2024)</h1>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg font-bold text-[#050d1a] bg-[#00d4ff] hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <Download size={14} />
          <span>Export Complete Dataset (CSV)</span>
        </button>
      </div>

      {/* Stats KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ['Total Archived Events', allData.length + ' Cyclones', '#00d4ff'],
          ['Cat 4–5 Super Cyclones', allData.filter(c => c.category >= 4).length + ' Major Hits', '#ff3b3b'],
          ['Average Max Wind', Math.round(allData.reduce((s, c) => s + c.maxWind, 0) / allData.length) + ' km/h', '#ff9500'],
          ['Recording Span', '2007 – 2024', '#00c851'],
        ].map(([label, val, col]) => (
          <div key={label} className="rounded-xl p-3.5 border border-[#1a3a6b] bg-[#0d1f3c]">
            <div className="text-[10px] tracking-widest text-[#88a0c0] uppercase font-mono mb-1">{label}</div>
            <div className="text-xl sm:text-2xl font-bold font-mono" style={{ color: col }}>{val}</div>
          </div>
        ))}
      </div>

      {/* AI Climatological Analogue Matcher Banner */}
      {analogues.length > 0 && (
        <div className="rounded-xl border border-[#1a3a6b] p-4 bg-[#0d1f3c]">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#00d4ff]" />
              <h3 className="text-xs font-bold tracking-widest text-[#00d4ff] uppercase font-mono">
                AI Climatological Analogue Matcher (Current Cyclone Vector Similarity)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400" /> Cosine Similarity Vector Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {analogues.slice(0, 3).map((item, i) => (
              <div 
                key={i} 
                onClick={() => {
                  const match = allData.find(d => d.name.toUpperCase() === item.name.replace('CYCLONE ', '').toUpperCase());
                  if (match) handleSelectStorm(match);
                }}
                className="p-3 rounded-lg border border-[#1a3a6b] bg-[#0a1628] flex flex-col justify-between hover:border-cyan-500/50 cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">{item.name} ({item.year})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-emerald-500/40 bg-emerald-500/20 text-emerald-300">
                      {item.similarity_pct}% Match
                    </span>
                  </div>
                  <div className="text-[10px] text-[#88a0c0] mb-2">{item.category} · {item.landfall_loc}</div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">{item.impact_summary}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono border-t border-[#1a3a6b] pt-2 mt-2 text-[#88a0c0]">
                  <span>💨 Wind: <strong className="text-white">{item.max_wind_kmh} km/h</strong></span>
                  <span>🌡 Press: <strong className="text-white">{item.min_pressure_hpa} hPa</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SPLIT DASHBOARD: GEOSPATIAL MAP + SIDE DETAILS DOSSIER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: INTERACTIVE LEAFLET MAP (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative h-[520px] rounded-2xl overflow-hidden border border-[#1a3a6b] bg-[#0a1628] shadow-2xl">
            
            {/* Top Map Layer Switcher & Feature Toggles */}
            <div className="absolute top-3.5 right-3.5 z-[999] flex flex-col gap-2 items-end">
              <div className="flex gap-1 p-1 rounded-xl bg-[#0a1628]/90 backdrop-blur-md border border-[#1a3a6b] shadow-lg">
                {Object.keys(TILE_LAYERS).map(layer => {
                  const isActive = activeLayer === layer;
                  return (
                    <button
                      key={layer}
                      onClick={() => setActiveLayer(layer)}
                      className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        isActive ? 'bg-[#00d4ff] text-[#050d1a] font-bold' : 'text-[#88a0c0] hover:text-white'
                      }`}
                    >
                      {layer}
                    </button>
                  );
                })}
              </div>

              {/* Layer Toggles */}
              <div className="flex gap-2 p-1.5 rounded-xl bg-[#0a1628]/90 backdrop-blur-md border border-[#1a3a6b] shadow-lg text-[10px] font-semibold text-slate-300">
                <button
                  onClick={() => setShowCities(!showCities)}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                    showCities ? 'bg-cyan-500/20 text-[#00d4ff] border border-cyan-500/40' : 'text-[#88a0c0] border border-[#1a3a6b]'
                  }`}
                >
                  <Building2 size={11} />
                  <span>Cities & Ports</span>
                </button>
                <button
                  onClick={() => setShowRiskRings(!showRiskRings)}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                    showRiskRings ? 'bg-cyan-500/20 text-[#00d4ff] border border-cyan-500/40' : 'text-[#88a0c0] border border-[#1a3a6b]'
                  }`}
                >
                  <Radio size={11} />
                  <span>Impact Rings</span>
                </button>
              </div>
            </div>

            {/* Map Status Badge */}
            <div className="absolute top-3.5 left-3.5 z-[999] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a1628]/90 backdrop-blur-md border border-[#1a3a6b] text-xs font-mono text-[#00d4ff] shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse inline-block"></span>
              <span>GIS CLIMATE MAP · LABELED BOUNDARIES</span>
            </div>

            {/* GIS Legend */}
            <div className="absolute bottom-4 left-4 z-[999] rounded-xl p-3 text-xs space-y-1 backdrop-blur-xl bg-[#0a1628]/90 border border-[#1a3a6b] shadow-xl text-slate-300 max-w-[220px]">
              <div className="font-bold tracking-widest text-[#00d4ff] text-[9px] uppercase mb-1 flex items-center justify-between font-mono">
                <span>STORM SEVERITY</span>
                <span className="text-white">IMD SCALE</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]"><span className="w-2.5 h-2.5 rounded-full bg-[#ff3b3b]"></span> Cat 5 Super Cyclone (&gt;250 km/h)</div>
              <div className="flex items-center gap-2 text-[10px]"><span className="w-2.5 h-2.5 rounded-full bg-[#ff5500]"></span> Cat 4 Extremely Severe (210–249 km/h)</div>
              <div className="flex items-center gap-2 text-[10px]"><span className="w-2.5 h-2.5 rounded-full bg-[#ff9500]"></span> Cat 3 Very Severe (165–209 km/h)</div>
              <div className="flex items-center gap-2 text-[10px]"><span className="w-2.5 h-2.5 rounded-full bg-[#ffcc00]"></span> Cat 2 Severe Cyclone (&lt;165 km/h)</div>
              <div className="flex items-center gap-2 text-[10px] pt-1 border-t border-[#1a3a6b]"><span className="w-2 h-2 rounded-full bg-[#00d4ff] inline-block border border-white"></span> Coastal City & Port Marker</div>
            </div>

            {/* Leaflet Map Container */}
            <MapContainer
              center={[selectedStorm?.lat || 18.0, selectedStorm?.lon || 84.0]}
              zoom={5}
              style={{ height: '100%', width: '100%', background: '#0a1628' }}
              zoomControl={true}
              attributionControl={false}
            >
              {/* Base Tile Layer */}
              <TileLayer url={TILE_LAYERS[activeLayer]} />
              
              {/* Reference Labels Overlay for Dark Canvas Mode */}
              {activeLayer === 'Dark Canvas' && (
                <TileLayer url={DARK_LABELS_OVERLAY} />
              )}

              {/* Boundary Overlay Layer for Satellite Mode */}
              {activeLayer === 'Satellite View' && (
                <TileLayer url={SATELLITE_LABELS_OVERLAY} />
              )}

              <MapController targetLat={selectedStorm?.lat} targetLon={selectedStorm?.lon} />

              {/* Coastal Cities & Major Ports Layer */}
              {showCities && COASTAL_CITIES.map(city => {
                const distToSelected = selectedStorm ? getDistanceKm(selectedStorm.lat, selectedStorm.lon, city.lat, city.lon) : null;
                const isClose = distToSelected !== null && distToSelected <= 200;

                return (
                  <CircleMarker
                    key={city.name}
                    center={[city.lat, city.lon]}
                    radius={isClose ? 6 : 4}
                    pathOptions={{
                      color: isClose ? '#00d4ff' : '#88a0c0',
                      fillColor: isClose ? '#00d4ff' : '#0a1628',
                      fillOpacity: 0.85,
                      weight: 1.5
                    }}
                  >
                    <MapTooltip permanent={isClose} direction="right" offset={[8, 0]}>
                      <div className="text-[10px] font-bold text-[#00d4ff] bg-[#0d1f3c] border border-cyan-500/40 p-1 rounded leading-tight font-mono">
                        🏙️ {city.name} ({city.state})
                        {distToSelected !== null && (
                          <div className="text-[9px] text-[#88a0c0]">
                            Dist: {distToSelected} km
                          </div>
                        )}
                      </div>
                    </MapTooltip>
                  </CircleMarker>
                );
              })}

              {/* Selected Cyclone Impact Rings */}
              {showRiskRings && selectedStorm && (
                <>
                  <CircleMarker
                    center={[selectedStorm.lat, selectedStorm.lon]}
                    radius={65}
                    pathOptions={{ color: '#ff3b3b', weight: 1, fillOpacity: 0.08, fillColor: '#ff3b3b', dashArray: '4 4' }}
                  />
                  <CircleMarker
                    center={[selectedStorm.lat, selectedStorm.lon]}
                    radius={130}
                    pathOptions={{ color: '#ff9500', weight: 1, fillOpacity: 0.04, fillColor: '#ff9500', dashArray: '6 6' }}
                  />
                </>
              )}

              {/* Historical Storm Markers & Trajectories */}
              {filtered.map(st => {
                const color = catColor(st.category);
                const isSelected = selectedStorm?.id === st.id;

                return (
                  <React.Fragment key={st.id}>
                    {/* Track Polyline */}
                    {st.track && st.track.length > 1 && (
                      <Polyline
                        positions={st.track}
                        color={color}
                        weight={isSelected ? 4 : 2}
                        opacity={isSelected ? 1.0 : 0.4}
                        dashArray={isSelected ? 'None' : '4 4'}
                      />
                    )}

                    {/* Outer Selection Highlight Ring */}
                    {isSelected && (
                      <CircleMarker
                        center={[st.lat, st.lon]}
                        radius={36}
                        pathOptions={{ color: color, weight: 2, fillOpacity: 0.15, fillColor: color }}
                      />
                    )}

                    {/* Main Landfall Marker */}
                    <CircleMarker
                      center={[st.lat, st.lon]}
                      radius={isSelected ? 14 : 9}
                      pathOptions={{ color: '#ffffff', weight: isSelected ? 3 : 1.5, fillColor: color, fillOpacity: 0.95 }}
                      eventHandlers={{
                        click: () => handleSelectStorm(st)
                      }}
                    >
                      <MapTooltip permanent={isSelected} direction="top" offset={[0, -10]}>
                        <div className="font-bold text-xs text-white bg-[#0d1f3c] border border-[#1a3a6b] p-1 rounded font-mono">
                          {st.name} ({st.year}) · Cat {st.category}
                        </div>
                      </MapTooltip>
                      <Popup>
                        <div className="p-1 font-mono text-xs bg-[#0d1f3c] text-white border border-[#1a3a6b] rounded">
                          <div className="font-bold text-sm text-[#00d4ff]">CYCLONE {st.name} ({st.year})</div>
                          <div className="text-[#88a0c0] mb-1">Landfall: {st.landfall}</div>
                          <div className="font-bold text-white">Max Wind: {st.maxWind} km/h</div>
                          <div className="text-amber-300">Pressure: {st.pressure} hPa</div>
                          <button
                            onClick={() => handleSelectStorm(st)}
                            className="mt-2 w-full py-1 bg-[#00d4ff] text-[#050d1a] rounded font-bold text-[10px] hover:bg-cyan-300"
                          >
                            Inspect Full Dossier
                          </button>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDE DETAILS DOSSIER PANEL (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col">
          {selectedStorm ? (
            <div className="h-full rounded-2xl border border-[#1a3a6b] p-5 bg-[#0d1f3c] shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div>
                {/* Dossier Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1a3a6b] mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-[#00d4ff]" />
                    <span className="font-mono text-xs font-bold text-[#88a0c0] uppercase tracking-wider">SYNOPTIC DOSSIER</span>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded border border-red-500/40 bg-red-500/20 text-xs font-bold font-mono text-red-300"
                  >
                    CAT {selectedStorm.category} CYCLONE
                  </span>
                </div>

                {/* Storm Title */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    CYCLONE {selectedStorm.name}
                    <span className="text-base text-[#88a0c0] font-mono">({selectedStorm.year})</span>
                  </h2>
                  <div className="text-xs text-white flex items-center gap-1.5 mt-1 font-semibold font-mono">
                    <MapPin size={13} className="text-[#00d4ff]" />
                    <span>Landfall: {selectedStorm.landfall}</span>
                    <span className="text-[#88a0c0]">· {selectedStorm.basin}</span>
                  </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <div className="p-2.5 rounded-xl border border-[#1a3a6b] bg-[#0a1628]">
                    <div className="text-[10px] text-[#88a0c0] uppercase font-mono flex items-center gap-1">
                      <Wind size={12} className="text-[#00d4ff]" /> Peak Surface Wind
                    </div>
                    <div className="text-lg font-bold font-mono text-white mt-0.5">
                      {selectedStorm.maxWind} <span className="text-xs font-normal text-[#88a0c0]">km/h</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-[#1a3a6b] bg-[#0a1628]">
                    <div className="text-[10px] text-[#88a0c0] uppercase font-mono flex items-center gap-1">
                      <Activity size={12} className="text-[#00d4ff]" /> Min Central Pressure
                    </div>
                    <div className="text-lg font-bold font-mono text-white mt-0.5">
                      {selectedStorm.pressure} <span className="text-xs font-normal text-[#88a0c0]">hPa</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-[#1a3a6b] bg-[#0a1628]">
                    <div className="text-[10px] text-[#88a0c0] uppercase font-mono flex items-center gap-1">
                      <Users size={12} className="text-amber-400" /> Human Casualties
                    </div>
                    <div className="text-lg font-bold font-mono text-white mt-0.5">
                      {selectedStorm.deaths.toLocaleString()} <span className="text-xs font-normal text-[#88a0c0]">Lives</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-[#1a3a6b] bg-[#0a1628]">
                    <div className="text-[10px] text-[#88a0c0] uppercase font-mono flex items-center gap-1">
                      <DollarSign size={12} className="text-emerald-400" /> Infrastructural Loss
                    </div>
                    <div className="text-lg font-bold font-mono text-white mt-0.5">
                      {selectedStorm.damage}
                    </div>
                  </div>
                </div>

                {/* Nearby Coastal Cities Impact Matrix */}
                <div className="p-3 rounded-xl border border-[#1a3a6b] bg-[#0a1628] mb-4">
                  <div className="text-[10px] text-[#88a0c0] uppercase font-bold tracking-wider mb-2 flex items-center gap-1 font-mono">
                    <Building2 size={12} className="text-[#00d4ff]" /> Nearby Coastal Cities & Port Proximity
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    {nearbyCities.slice(0, 3).map((city, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-[#0d1f3c] border border-[#1a3a6b] flex flex-col">
                        <span className="font-bold text-white text-[10px]">{city.name}</span>
                        <span className="text-[#00d4ff] text-[10px]">{city.distanceKm} km away</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Synoptic Notes */}
                <div className="p-3 rounded-xl border border-[#1a3a6b] bg-[#0a1628] mb-4">
                  <div className="text-[10px] text-[#88a0c0] uppercase font-bold tracking-wider mb-1 flex items-center gap-1 font-mono">
                    <ShieldAlert size={12} className="text-red-400" /> Historical Impact & Meteorological Summary
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedStorm.notes}
                  </p>
                </div>

                {/* Coordinates & Basin details */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#88a0c0] px-1 py-1 border-t border-[#1a3a6b]">
                  <span>Coords: {selectedStorm.lat}°N, {selectedStorm.lon}°E</span>
                  <span>Basin: {selectedStorm.basin}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  showToast(`Centered map on Cyclone ${selectedStorm.name} coordinates (${selectedStorm.lat}, ${selectedStorm.lon}).`, 'info');
                }}
                className="w-full mt-4 py-2.5 rounded-xl font-bold text-xs text-[#050d1a] bg-[#00d4ff] hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye size={14} />
                <span>Center GIS Map on {selectedStorm.name} ({selectedStorm.year})</span>
              </button>
            </div>
          ) : (
            <div className="h-full rounded-2xl border border-[#1a3a6b] p-6 bg-[#0d1f3c] flex items-center justify-center text-center text-[#88a0c0]">
              Select any cyclone from the map or table to view full synoptic dossier.
            </div>
          )}
        </div>
      </div>

      {/* FILTER AND SEARCH BAR */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#88a0c0]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cyclone name, year, or landfall province (e.g. Dana, Puri, Gujarat)..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#1a3a6b] bg-[#0d1f3c] text-sm text-white focus:outline-none focus:border-[#00d4ff] font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#88a0c0] font-mono">
          <Filter size={13} />
          <span>Category Filter:</span>
        </div>

        <div className="flex gap-1">
          {['all', '2', '3', '4', '5'].map(c => (
            <button
              key={c}
              onClick={() => {
                setCatFilter(c);
                showToast(`Filter set to ${c === 'all' ? 'All Categories' : `Category ${c}`}.`, 'info');
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer font-mono ${
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

      {/* HISTORICAL ARCHIVE TABLE */}
      <div className="rounded-xl border border-[#1a3a6b] overflow-hidden bg-[#0d1f3c]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a3a6b] bg-[#0a1628] text-xs font-bold text-[#88a0c0] uppercase tracking-wider select-none font-mono">
                {[
                  ['name', 'Storm Name'],
                  ['year', 'Year'],
                  ['category', 'Category'],
                  ['maxWind', 'Max Wind'],
                  ['pressure', 'Min Pressure'],
                  ['landfall', 'Landfall Province'],
                  ['deaths', 'Casualties'],
                  ['damage', 'Damage (INR)'],
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
              {filtered.map(c => {
                const isSelected = selectedStorm?.id === c.id;
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
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"></span>}
                    </td>
                    <td className="px-4 py-3 text-[#88a0c0]">{c.year}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded border text-xs font-bold"
                        style={{
                          borderColor: catColor(c.category) + '60',
                          backgroundColor: catColor(c.category) + '20',
                          color: catColor(c.category),
                        }}
                      >
                        CAT {c.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {c.maxWind} km/h
                    </td>
                    <td className="px-4 py-3 text-[#88a0c0]">{c.pressure} hPa</td>
                    <td className="px-4 py-3 text-white font-sans">{c.landfall}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {c.deaths.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#88a0c0]">{c.damage}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2.5 text-xs text-[#88a0c0] border-t border-[#1a3a6b] bg-[#0a1628] flex items-center justify-between font-mono">
          <span>Showing {filtered.length} of {allData.length} climatological storm records</span>
          <span className="text-[11px] text-[#00d4ff]">Click any storm row to focus GIS Map & load synoptic dossier</span>
        </div>
      </div>
    </div>
  );
}
