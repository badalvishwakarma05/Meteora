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

export const trackDataByCyclone = {
  DANA: [
    { time: '10-Sep 12:00', ist: '17:30 IST', lat: 10.5, lon: 90.2, wind: 55, gusts: 70, pressure: 1002, category: 1, stage: 'Depression', predicted: false, source: 'IMD Synoptic' },
    { time: '10-Sep 18:00', ist: '23:30 IST', lat: 11.2, lon: 89.8, wind: 75, gusts: 90, pressure: 998, category: 1, stage: 'Deep Depression', predicted: false, source: 'IMD Synoptic' },
    { time: '11-Sep 00:00', ist: '05:30 IST', lat: 12.1, lon: 89.5, wind: 95, gusts: 115, pressure: 992, category: 1, stage: 'Cyclonic Storm', predicted: false, source: 'NOAA IBTrACS' },
    { time: '11-Sep 06:00', ist: '11:30 IST', lat: 12.8, lon: 89.0, wind: 110, gusts: 130, pressure: 985, category: 2, stage: 'Severe Cyclonic Storm', predicted: false, source: 'NOAA IBTrACS' },
    { time: '11-Sep 12:00', ist: '17:30 IST', lat: 13.5, lon: 88.5, wind: 130, gusts: 150, pressure: 975, category: 2, stage: 'Severe Cyclonic Storm', predicted: false, source: 'IMD Doppler' },
    { time: '11-Sep 18:00', ist: '23:30 IST', lat: 14.1, lon: 88.0, wind: 155, gusts: 175, pressure: 965, category: 3, stage: 'Very Severe Cyclonic Storm', predicted: false, source: 'IMD Doppler' },
    { time: '12-Sep 00:00', ist: '05:30 IST', lat: 14.8, lon: 87.6, wind: 175, gusts: 195, pressure: 958, category: 3, stage: 'Very Severe Cyclonic Storm', predicted: false, source: 'INSAT-3DR Rapid-Scan' },
    { time: '12-Sep 06:00', ist: '11:30 IST', lat: 15.4, lon: 87.2, wind: 185, gusts: 205, pressure: 955, category: 3, stage: 'VSCS (Current Fix)', predicted: false, source: 'Active Eye Radar' },
    { time: '12-Sep 12:00', ist: '17:30 IST', lat: 16.1, lon: 86.8, wind: 195, gusts: 215, pressure: 950, category: 4, stage: 'Extremely Severe (Peak)', predicted: true, source: 'METEORA AI (+6h)' },
    { time: '12-Sep 18:00', ist: '23:30 IST', lat: 16.9, lon: 86.3, wind: 200, gusts: 220, pressure: 948, category: 4, stage: 'Extremely Severe (Peak)', predicted: true, source: 'METEORA AI (+12h)' },
    { time: '13-Sep 00:00', ist: '05:30 IST', lat: 17.7, lon: 85.8, wind: 195, gusts: 215, pressure: 950, category: 4, stage: 'Extremely Severe', predicted: true, source: 'METEORA AI (+18h)' },
    { time: '13-Sep 06:00', ist: '11:30 IST', lat: 18.5, lon: 85.2, wind: 185, gusts: 205, pressure: 955, category: 3, stage: 'Very Severe (Coast Approaching)', predicted: true, source: 'METEORA AI (+24h)' },
    { time: '13-Sep 18:00', ist: '23:30 IST', lat: 19.5, lon: 84.5, wind: 175, gusts: 195, pressure: 960, category: 3, stage: 'VSCS (Landfall Near Puri)', predicted: true, source: 'METEORA AI (+36h Landfall)' },
    { time: '14-Sep 06:00', ist: '11:30 IST', lat: 20.1, lon: 84.0, wind: 165, gusts: 185, pressure: 965, category: 3, stage: 'VSCS (Inland Crossing)', predicted: true, source: 'METEORA AI (+48h)' },
    { time: '14-Sep 18:00', ist: '23:30 IST', lat: 20.8, lon: 83.4, wind: 110, gusts: 130, pressure: 982, category: 2, stage: 'Severe Cyclonic Storm (Decay)', predicted: true, source: 'METEORA AI (+60h Decay)' },
    { time: '15-Sep 06:00', ist: '11:30 IST', lat: 21.4, lon: 82.8, wind: 65, gusts: 80, pressure: 998, category: 1, stage: 'Deep Depression (Dissipation)', predicted: true, source: 'METEORA AI (+72h)' }
  ],
  REMAL: [
    { time: '24-May 00:00', ist: '05:30 IST', lat: 15.1, lon: 66.0, wind: 55, gusts: 70, pressure: 1004, category: 1, stage: 'Depression', predicted: false, source: 'IMD Synoptic' },
    { time: '24-May 06:00', ist: '11:30 IST', lat: 15.9, lon: 65.8, wind: 70, gusts: 85, pressure: 1000, category: 1, stage: 'Deep Depression', predicted: false, source: 'IMD Synoptic' },
    { time: '24-May 12:00', ist: '17:30 IST', lat: 16.8, lon: 65.5, wind: 90, gusts: 105, pressure: 995, category: 1, stage: 'Cyclonic Storm', predicted: false, source: 'NOAA IBTrACS' },
    { time: '24-May 18:00', ist: '23:30 IST', lat: 17.5, lon: 65.0, wind: 105, gusts: 120, pressure: 992, category: 1, stage: 'Cyclonic Storm', predicted: false, source: 'NOAA IBTrACS' },
    { time: '25-May 00:00', ist: '05:30 IST', lat: 18.2, lon: 64.5, wind: 120, gusts: 140, pressure: 990, category: 1, stage: 'Severe Cyclonic Storm', predicted: false, source: 'Active Radar' },
    { time: '25-May 06:00', ist: '11:30 IST', lat: 19.0, lon: 64.1, wind: 130, gusts: 150, pressure: 986, category: 2, stage: 'Severe Cyclonic Storm', predicted: true, source: 'METEORA AI (+6h)' },
    { time: '25-May 12:00', ist: '17:30 IST', lat: 19.8, lon: 63.8, wind: 135, gusts: 155, pressure: 984, category: 2, stage: 'Severe Cyclonic Storm', predicted: true, source: 'METEORA AI (+12h)' },
    { time: '25-May 18:00', ist: '23:30 IST', lat: 20.5, lon: 63.5, wind: 125, gusts: 145, pressure: 988, category: 2, stage: 'Recurving North-East', predicted: true, source: 'METEORA AI (+18h)' },
    { time: '26-May 00:00', ist: '05:30 IST', lat: 21.0, lon: 63.2, wind: 110, gusts: 130, pressure: 992, category: 1, stage: 'Weakening Maritime Low', predicted: true, source: 'METEORA AI (+24h)' },
    { time: '26-May 12:00', ist: '17:30 IST', lat: 22.0, lon: 62.8, wind: 75, gusts: 90, pressure: 998, category: 1, stage: 'Dissipating in Open Sea', predicted: true, source: 'METEORA AI (+36h)' }
  ],
  BOB01: [
    { time: '01-Oct 00:00', ist: '05:30 IST', lat: 10.4, lon: 84.8, wind: 40, gusts: 55, pressure: 1010, category: 1, stage: 'Well-Marked Low', predicted: false, source: 'IMD Synoptic' },
    { time: '01-Oct 06:00', ist: '11:30 IST', lat: 10.8, lon: 84.1, wind: 48, gusts: 60, pressure: 1008, category: 1, stage: 'Low Pressure Area', predicted: false, source: 'IMD Synoptic' },
    { time: '01-Oct 12:00', ist: '17:30 IST', lat: 11.2, lon: 83.5, wind: 55, gusts: 70, pressure: 1006, category: 1, stage: 'Depression BOB-01', predicted: false, source: 'NOAA IBTrACS' },
    { time: '01-Oct 18:00', ist: '23:30 IST', lat: 11.7, lon: 82.9, wind: 60, gusts: 75, pressure: 1005, category: 1, stage: 'Deep Depression', predicted: false, source: 'NOAA IBTrACS' },
    { time: '02-Oct 00:00', ist: '05:30 IST', lat: 12.1, lon: 82.3, wind: 65, gusts: 80, pressure: 1005, category: 1, stage: 'Depression (Current Fix)', predicted: false, source: 'IMD Radar Chennai' },
    { time: '02-Oct 06:00', ist: '11:30 IST', lat: 12.5, lon: 81.6, wind: 60, gusts: 75, pressure: 1006, category: 1, stage: 'Weakening Near Tamil Nadu Coast', predicted: true, source: 'METEORA AI (+6h)' },
    { time: '02-Oct 12:00', ist: '17:30 IST', lat: 12.9, lon: 80.8, wind: 50, gusts: 65, pressure: 1008, category: 1, stage: 'Coastal Rainband Influx', predicted: true, source: 'METEORA AI (+12h)' },
    { time: '02-Oct 18:00', ist: '23:30 IST', lat: 13.2, lon: 80.2, wind: 40, gusts: 55, pressure: 1010, category: 1, stage: 'Fissuring over Land', predicted: true, source: 'METEORA AI (+18h)' }
  ]
};

export const trackData = trackDataByCyclone.DANA;

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
