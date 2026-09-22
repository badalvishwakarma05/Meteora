// Mock data for METEORA application

export const activeCyclones = [
  {
    id: 'DANA',
    name: 'CYCLONE DANA',
    category: 3,
    basin: 'Bay of Bengal',
    wind: 185,
    pressure: 955,
    lat: 15.4,
    lon: 87.2,
    severity: 'severe',
    color: '#ff3b3b',
    status: 'Very Severe Cyclonic Storm',
    movement: 'NNW @ 14 km/h',
    landfall: '14-Sep 18:00 IST',
    landfallLocation: 'Odisha Coast (near Puri)',
  },
  {
    id: 'REMAL',
    name: 'CYCLONE REMAL',
    category: 1,
    basin: 'Arabian Sea',
    wind: 120,
    pressure: 990,
    lat: 18.2,
    lon: 64.5,
    severity: 'moderate',
    color: '#ff9500',
    status: 'Cyclonic Storm',
    movement: 'NE @ 9 km/h',
    landfall: null,
  },
  {
    id: 'BOB01',
    name: 'DEPRESSION BOB-01',
    category: 1,
    basin: 'Bay of Bengal',
    wind: 65,
    pressure: 1005,
    lat: 12.1,
    lon: 82.3,
    severity: 'low',
    color: '#00c851',
    status: 'Depression',
    movement: 'W @ 6 km/h',
    landfall: null,
  },
];

export const trackData = [
  { time: '11-Sep 00:00', lat: 12.1, lon: 89.5, wind: 95, pressure: 992, category: 1, predicted: false },
  { time: '11-Sep 06:00', lat: 12.8, lon: 89.0, wind: 110, pressure: 985, category: 2, predicted: false },
  { time: '11-Sep 12:00', lat: 13.5, lon: 88.5, wind: 130, pressure: 975, category: 2, predicted: false },
  { time: '11-Sep 18:00', lat: 14.1, lon: 88.0, wind: 155, pressure: 965, category: 3, predicted: false },
  { time: '12-Sep 00:00', lat: 14.8, lon: 87.6, wind: 175, pressure: 958, category: 3, predicted: false },
  { time: '12-Sep 06:00', lat: 15.4, lon: 87.2, wind: 185, pressure: 955, category: 3, predicted: false },
  { time: '12-Sep 12:00', lat: 16.1, lon: 86.8, wind: 195, pressure: 950, category: 4, predicted: true },
  { time: '12-Sep 18:00', lat: 16.9, lon: 86.3, wind: 200, pressure: 948, category: 4, predicted: true },
  { time: '13-Sep 00:00', lat: 17.7, lon: 85.8, wind: 195, pressure: 950, category: 4, predicted: true },
  { time: '13-Sep 06:00', lat: 18.5, lon: 85.2, wind: 185, pressure: 955, category: 3, predicted: true },
  { time: '14-Sep 00:00', lat: 19.5, lon: 84.5, wind: 175, pressure: 960, category: 3, predicted: true },
  { time: '14-Sep 18:00', lat: 20.1, lon: 84.0, wind: 165, pressure: 965, category: 3, predicted: true },
];

export const intensityHistory = [
  { time: '-72h', wind: 45 }, { time: '-66h', wind: 55 }, { time: '-60h', wind: 65 },
  { time: '-54h', wind: 75 }, { time: '-48h', wind: 90 }, { time: '-42h', wind: 105 },
  { time: '-36h', wind: 115 }, { time: '-30h', wind: 130 }, { time: '-24h', wind: 145 },
  { time: '-18h', wind: 158 }, { time: '-12h', wind: 170 }, { time: '-6h', wind: 180 },
  { time: 'Now', wind: 185 }, { time: '+6h', wind: 192 }, { time: '+12h', wind: 198 },
  { time: '+18h', wind: 200 }, { time: '+24h', wind: 195 }, { time: '+36h', wind: 188 },
  { time: '+48h', wind: 178 }, { time: '+60h', wind: 170 }, { time: '+72h', wind: 158 },
];

export const ensembleModels = [
  { model: 'IMD Official', track: 'N @ 85.5°E', landfall: '14-Sep 20:00', wind: 170 },
  { model: 'ECMWF', track: 'NNW @ 84.8°E', landfall: '14-Sep 16:00', wind: 178 },
  { model: 'GFS (NOAA)', track: 'N @ 86.0°E', landfall: '15-Sep 02:00', wind: 165 },
  { model: 'METEORA ✦', track: 'NNW @ 84.0°E', landfall: '14-Sep 18:00', wind: 175 },
  { model: 'JMA', track: 'NW @ 83.5°E', landfall: '14-Sep 14:00', wind: 182 },
];

export const historicalCyclones = [
  { name: 'AMPHAN', year: 2020, category: 5, maxWind: 270, similarity: 96, landfall: 'West Bengal', deaths: 128 },
  { name: 'FANI', year: 2019, category: 4, maxWind: 250, similarity: 91, landfall: 'Odisha', deaths: 89 },
  { name: 'PHAILIN', year: 2013, category: 4, maxWind: 210, similarity: 85, landfall: 'Odisha', deaths: 45 },
  { name: 'HUDHUD', year: 2014, category: 3, maxWind: 185, similarity: 82, landfall: 'Andhra Pradesh', deaths: 124 },
  { name: 'AILA', year: 2009, category: 2, maxWind: 110, similarity: 78, landfall: 'West Bengal', deaths: 339 },
];

export const satelliteFeeds = [
  { id: 1, source: 'INSAT-3D', band: 'IR 10.8μm', time: '12:00 UTC', resolution: '4km' },
  { id: 2, source: 'INSAT-3DR', band: 'Visible', time: '12:00 UTC', resolution: '1km' },
  { id: 3, source: 'GOES-East', band: 'Water Vapor', time: '11:45 UTC', resolution: '2km' },
  { id: 4, source: 'Meteosat', band: 'RGB Composite', time: '12:00 UTC', resolution: '3km' },
];

export const classificationFeatures = [
  { feature: 'Eye Diameter', value: '42 km', status: 'Clear Eye Detected', ok: true },
  { feature: 'Eye Wall Symmetry', value: '0.87', status: 'High Symmetry', ok: true },
  { feature: 'CDO Diameter', value: '320 km', status: 'Extensive', ok: true },
  { feature: 'Outflow Pattern', value: 'Radial', status: 'Favorable', ok: true },
  { feature: 'Spiral Bands', value: '4', status: 'Developed', ok: true },
  { feature: 'Dvorak T-Number', value: 'T5.5', status: 'Intense Storm', ok: true },
];

export const kpiData = {
  activeCyclones: 3,
  monitoringZones: 7,
  satelliteSources: ['INSAT-3D', 'INSAT-3DR', 'GOES'],
  nextUpdate: '00:04:32',
};
