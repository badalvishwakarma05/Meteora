import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { activeCyclones } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { useDisasterAlert } from '../context/DisasterAlertContext';

const tracks = {
  DANA:  [[16.1,86.8],[15.4,87.2],[14.1,88.0],[12.8,89.0],[11.2,89.8]],
  REMAL: [[19.5,63.2],[18.2,64.5],[16.8,65.5],[15.1,66.0]],
  BOB01: [[12.1,82.3],[11.2,83.5],[10.4,84.8]],
};

const predictedTracks = {
  DANA:  [[15.4,87.2],[16.9,86.3],[18.5,85.2],[19.5,84.5],[20.1,84.0]],
  REMAL: [[18.2,64.5],[19.8,63.8],[21.0,63.2]],
  BOB01: [[12.1,82.3],[12.5,81.0],[13.2,80.2]],
};

// Historical Training Cyclones (Used to train the Multi-Modal CNN-LSTM model)
const historicalTrainingTracks = [
  {
    id: 'MICHAUNG_2023',
    name: 'Cyclone Michaung (Historical Training)',
    basin: 'Bay of Bengal',
    dates: 'Nov 29 - Dec 06, 2023',
    peakWind: '110 km/h',
    coords: [[8.5, 88.0], [10.2, 85.5], [12.0, 83.0], [13.8, 81.2], [15.8, 80.3]]
  },
  {
    id: 'BIPARJOY_2023',
    name: 'Cyclone Biparjoy (Historical Training)',
    basin: 'Arabian Sea',
    dates: 'Jun 06 - Jun 16, 2023',
    peakWind: '165 km/h',
    coords: [[12.5, 66.0], [14.8, 66.2], [17.5, 67.4], [20.2, 67.0], [22.8, 68.2], [23.8, 69.5]]
  },
  {
    id: 'MOCHA_2023',
    name: 'Cyclone Mocha (Historical Training)',
    basin: 'Bay of Bengal',
    dates: 'May 09 - May 15, 2023',
    peakWind: '215 km/h',
    coords: [[9.0, 89.0], [11.5, 88.2], [14.0, 88.5], [17.5, 91.0], [20.1, 92.8]]
  }
];

// Negative Samples: Low-Pressure Areas (LPAs) actively filtered out by AI as non-threats
const negativeSampleLPAs = [
  {
    id: 'LPA-BOB-01',
    name: 'Low-Pressure Area BOB-01',
    lat: 11.2,
    lon: 86.8,
    pressure: 1007,
    wind: 28,
    basin: 'Bay of Bengal',
    status: 'Dissipating (Safe)',
    aiDecision: 'Filtered by AI: Non-Intensifying Negative Training Sample',
    precursorDeltaP: '-1.5 hPa (Stable)'
  },
  {
    id: 'LPA-ARB-02',
    name: 'Trough Low ARB-02',
    lat: 16.5,
    lon: 67.8,
    pressure: 1006,
    wind: 32,
    basin: 'Arabian Sea',
    status: 'Dissipating (Safe)',
    aiDecision: 'Filtered by AI: Non-Intensifying Negative Training Sample',
    precursorDeltaP: '-2.0 hPa (Stable)'
  },
  {
    id: 'LPA-BOB-03',
    name: 'Monsoon Depression BOB-03',
    lat: 18.8,
    lon: 89.2,
    pressure: 1008,
    wind: 24,
    basin: 'North Bay of Bengal',
    status: 'Dissipating (Safe)',
    aiDecision: 'Filtered by AI: Non-Intensifying Negative Training Sample',
    precursorDeltaP: '-0.8 hPa (Stable)'
  }
];

// Basemap layers (Esri & OpenStreetMap)
const TILE_LAYERS = {
  Infrared: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  Satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  'Water Vapor': 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
  Radar: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

function MapController({ selectedRegion }) {
  const map = useMap();
  React.useEffect(() => {
    if (selectedRegion && selectedRegion.lat && selectedRegion.lon) {
      map.flyTo([selectedRegion.lat, selectedRegion.lon], selectedRegion.zoom || 6, {
        duration: 1.2
      });
    }
  }, [selectedRegion, map]);
  return null;
}

export default function CycloneMap({ onSelectCyclone, threatLevel = 'severe' }) {
  const [activeLayer, setActiveLayer] = useState('Infrared');
  const { showToast } = useToast();
  const { selectedRegion } = useDisasterAlert();

  const handleLayerChange = (layer) => {
    setActiveLayer(layer);
    showToast(`Switched map layer to ${layer}.`, 'info');
  };

  const getMarkerColor = (severity) => {
    if (severity === 'severe') return '#ff3b3b';
    if (severity === 'moderate') return '#ff9500';
    return '#00c851';
  };

  return (
    <div className="relative h-[350px] md:h-full min-h-[350px] w-full rounded-2xl overflow-hidden border border-[#1a3a6b]/60 shadow-2xl bg-[#0a1628] touch-pan-x touch-pan-y">
      {/* Clean Layer Switcher (Top Right) */}
      <div className="absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 z-[999] flex flex-wrap gap-1 p-1 rounded-xl bg-[#0a1628]/90 backdrop-blur-md border border-[#1a3a6b] shadow-lg max-w-[calc(100%-20px)]">
        {Object.keys(TILE_LAYERS).map(layer => {
          const isActive = activeLayer === layer;
          return (
            <button
              key={layer}
              onClick={() => handleLayerChange(layer)}
              className="text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-semibold transition-all cursor-pointer border"
              style={{
                background: isActive ? '#00d4ff' : 'transparent',
                color: isActive ? '#050d1a' : '#88a0c0',
                borderColor: isActive ? '#00d4ff' : 'transparent',
              }}
            >
              {layer}
            </button>
          );
        })}
      </div>

      {/* Floating Modern Legend (Bottom Left) */}
      <div className="absolute bottom-2.5 sm:bottom-4 left-2.5 sm:left-4 z-[999] rounded-xl p-2.5 sm:p-3 text-[10px] sm:text-xs space-y-1 sm:space-y-1.5 backdrop-blur-xl bg-[#0a1628]/90 border border-[#1a3a6b] shadow-xl max-w-[180px] sm:max-w-none">
        <div className="font-bold tracking-widest text-cyan-400 text-[9px] uppercase mb-1">
          GIS MAP LEGEND
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 border-t-2 border-[#00d4ff] inline-block"></span>
          <span className="text-[#88a0c0] text-[11px]">Observed Path</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 border-t-2 border-dashed border-[#ff9500] inline-block"></span>
          <span className="text-amber-300 text-[11px]">AI Forecast (72h)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 border-t-2 border-dotted border-slate-400 inline-block"></span>
          <span className="text-slate-300 text-[11px]">Historical Tracks (Training)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400 border border-slate-600 inline-block"></span>
          <span className="text-slate-300 text-[11px]">LPA: Dissipating (Safe)</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-[#1a3a6b]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b3b] inline-block"></span>
          <span className="text-red-300 text-[11px] font-bold">Severe (Cat 3+)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff9500] inline-block"></span>
          <span className="text-yellow-300 text-[11px]">Moderate (Cat 1-2)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00c851] inline-block"></span>
          <span className="text-emerald-300 text-[11px]">Depression (Low)</span>
        </div>
      </div>

      <MapContainer
        center={[15.5, 82.5]}
        zoom={4}
        style={{ height: '100%', width: '100%', minHeight: '350px', background: '#0a1628' }}
        zoomControl={true}
        attributionControl={false}
        className="touch-pan-x touch-pan-y w-full h-full min-h-[350px]"
      >
        <TileLayer
          key={activeLayer}
          url={TILE_LAYERS[activeLayer]}
        />
        <MapController selectedRegion={selectedRegion} />

        {/* 1. HISTORICAL TRAINING TRACKS (FAINT DOTTED OVERLAY) */}
        {historicalTrainingTracks.map(ht => (
          <React.Fragment key={ht.id}>
            <Polyline
              positions={ht.coords}
              color="#94a3b8"
              weight={1.8}
              opacity={0.45}
              dashArray="3 5"
            />
            {/* Start waypoint marker */}
            <CircleMarker
              center={ht.coords[0]}
              radius={3}
              pathOptions={{ color: '#94a3b8', weight: 1, fillColor: '#64748b', fillOpacity: 0.6 }}
            >
              <Popup>
                <div style={{ background: '#0d1f3c', color: 'white', padding: '10px', borderRadius: '8px', minWidth: 180, border: '1px solid #1a3a6b', fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', color: '#94a3b8' }}>{ht.name}</div>
                  <div style={{ color: '#88a0c0', marginTop: 3 }}>🗓 Window: {ht.dates}</div>
                  <div style={{ color: '#00d4ff', marginTop: 2 }}>💨 Peak Wind: {ht.peakWind}</div>
                  <div style={{ color: '#64748b', marginTop: 4, fontStyle: 'italic', borderTop: '1px solid #1a3a6b', paddingTop: 3 }}>
                    Multi-Modal Training Set Reference
                  </div>
                </div>
              </Popup>
            </CircleMarker>
            {/* Landfall / End waypoint marker */}
            <CircleMarker
              center={ht.coords[ht.coords.length - 1]}
              radius={4}
              pathOptions={{ color: '#cbd5e1', weight: 1, fillColor: '#475569', fillOpacity: 0.8 }}
            >
              <Tooltip direction="top" offset={[0, -6]}
                className="cyclone-tooltip"
                style={{
                  background: '#0a1628',
                  border: '1px solid #475569',
                  color: '#cbd5e1',
                  fontSize: '9px',
                  fontWeight: 600,
                  padding: '1px 5px',
                  borderRadius: '4px'
                }}>
                Historical: {ht.id.split('_')[0]}
              </Tooltip>
              <Popup>
                <div style={{ background: '#0d1f3c', color: 'white', padding: '10px', borderRadius: '8px', minWidth: 180, border: '1px solid #1a3a6b', fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', color: '#cbd5e1' }}>{ht.name} (Landfall)</div>
                  <div style={{ color: '#88a0c0', marginTop: 3 }}>📍 {ht.basin}</div>
                  <div style={{ color: '#00d4ff', marginTop: 2 }}>⚡ Category: {ht.category || 'Cyclonic Storm'}</div>
                  <div style={{ color: '#64748b', marginTop: 4, fontStyle: 'italic', borderTop: '1px solid #1a3a6b', paddingTop: 3 }}>
                    Supervised Precursor Ground Truth
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          </React.Fragment>
        ))}

        {/* 2. NEGATIVE SAMPLE MARKERS (LOW-PRESSURE AREAS / LPAs WITH DISSIPATING TAGS) */}
        {negativeSampleLPAs.map(lpa => (
          <React.Fragment key={lpa.id}>
            {/* Faint Outer Ring */}
            <CircleMarker
              center={[lpa.lat, lpa.lon]}
              radius={14}
              pathOptions={{ color: '#64748b', weight: 0.8, fillOpacity: 0.08, fillColor: '#64748b' }}
            />
            {/* Neutral Center Marker */}
            <CircleMarker
              center={[lpa.lat, lpa.lon]}
              radius={5.5}
              pathOptions={{ color: '#94a3b8', weight: 1.5, fillColor: '#334155', fillOpacity: 0.9 }}
            >
              <Tooltip permanent direction="top" offset={[0, -8]}
                className="cyclone-tooltip"
                style={{
                  background: '#0a1628',
                  border: '1px solid #475569',
                  color: '#94a3b8',
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap'
                }}>
                AI Status: Dissipating (Safe)
              </Tooltip>
              <Popup>
                <div style={{ background: '#0d1f3c', color: 'white', padding: '11px', borderRadius: '10px', minWidth: 200, border: '1px solid #334155', fontSize: '11px' }}>
                  <div style={{ fontWeight: '800', color: '#94a3b8', fontSize: 12 }}>{lpa.name}</div>
                  <div style={{ fontSize: 10, color: '#38bdf8', marginTop: 2, fontWeight: 'bold' }}>
                    ✓ {lpa.status}
                  </div>
                  <div style={{ fontSize: 11, marginTop: 5, color: '#cbd5e1' }}>
                    💨 Max Wind: {lpa.wind} km/h | 🌡 Pressure: {lpa.pressure} hPa
                  </div>
                  <div style={{ fontSize: 10, color: '#88a0c0', marginTop: 2 }}>
                    📍 {lpa.lat}°N, {lpa.lon}°E ({lpa.basin})
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 5, borderTop: '1px solid #1a3a6b', paddingTop: 4 }}>
                    Precursor Gradient: {lpa.precursorDeltaP}
                  </div>
                  <div style={{ fontSize: 10, color: '#00d4ff', marginTop: 3, fontWeight: '600' }}>
                    {lpa.aiDecision}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          </React.Fragment>
        ))}

        {/* 3. ACTIVE LIVE CYCLONES */}
        {activeCyclones.map(c => {
          const color = getMarkerColor(c.severity);
          const pastTrack = tracks[c.id] || [];
          const futureTrack = predictedTracks[c.id] || [];

          return (
            <React.Fragment key={c.id}>
              {/* Past track */}
              {pastTrack.length > 1 && (
                <Polyline positions={pastTrack} color="#00d4ff" weight={2} opacity={0.7} />
              )}
              {/* Predicted track (dashed) */}
              {futureTrack.length > 1 && (
                <Polyline
                  positions={futureTrack}
                  color="#ff9500"
                  weight={2.5}
                  opacity={0.95}
                  dashArray="5 6"
                />
              )}
              {/* Outer Intensity Ring */}
              <CircleMarker
                center={[c.lat, c.lon]}
                radius={48}
                pathOptions={{ color: color, weight: 0.8, fillOpacity: 0.08, fillColor: color }}
              />
              {/* Inner Core Ring */}
              <CircleMarker
                center={[c.lat, c.lon]}
                radius={26}
                pathOptions={{ color: color, weight: 1.2, fillOpacity: 0.2, fillColor: color }}
              />
              {/* Center Storm Eye Marker */}
              <CircleMarker
                center={[c.lat, c.lon]}
                radius={11}
                pathOptions={{ color: '#ffffff', weight: 2.5, fillColor: color, fillOpacity: 1 }}
                eventHandlers={{
                  click: () => onSelectCyclone && onSelectCyclone(c)
                }}
              >
                <Tooltip permanent direction="top" offset={[0, -12]}
                  className="cyclone-tooltip"
                  style={{
                    background: '#0d1f3c',
                    border: `1px solid ${color}`,
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '6px'
                  }}>
                  {c.id}
                </Tooltip>
                <Popup>
                  <div style={{ background: '#0d1f3c', color: 'white', padding: '12px', borderRadius: '10px', minWidth: 190, border: '1px solid #1a3a6b' }}>
                    <div style={{ fontWeight: '800', color: '#00d4ff', fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: '#88a0c0', marginTop: 2 }}>{c.status}</div>
                    <div style={{ fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                      💨 Wind: {c.wind} km/h | 🌡 {c.pressure} hPa
                    </div>
                    <div style={{ fontSize: 11, color: '#88a0c0', marginTop: 3 }}>
                      📍 {c.lat}°N, {c.lon}°E ({c.basin})
                    </div>
                    {c.landfall && (
                      <div style={{ fontSize: 11, color: '#ff9500', marginTop: 5, fontWeight: 'bold', borderTop: '1px solid #1a3a6b', paddingTop: 4 }}>
                        ⚠ Landfall: {c.landfall}
                      </div>
                    )}
                    <button
                      onClick={() => onSelectCyclone && onSelectCyclone(c)}
                      style={{
                        marginTop: 10,
                        width: '100%',
                        padding: '6px 10px',
                        background: '#00d4ff',
                        color: '#050d1a',
                        fontSize: 11,
                        fontWeight: 'bold',
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Analyze Full Trajectory →
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
