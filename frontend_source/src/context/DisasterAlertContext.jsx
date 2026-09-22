import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DisasterAlertContext = createContext(null);

export const COASTAL_REGIONS = [
  { id: 'ALL', name: '🌊 All Coastal Zones (Bay of Bengal & Arabian Sea)', stateName: 'All Regions', lat: 16.0, lon: 82.0, zoom: 5 },
  { id: 'OD', name: '🏛️ Odisha Coast (Puri / Paradip / Balasore)', stateName: 'Odisha', lat: 19.8, lon: 85.8, zoom: 7 },
  { id: 'WB', name: '🌴 West Bengal & Sundarbans (Digha / Sagar Island)', stateName: 'West Bengal', lat: 21.5, lon: 88.3, zoom: 7 },
  { id: 'AP', name: '⚡ Andhra Pradesh (Vizag / Kakinada / Machilipatnam)', stateName: 'Andhra Pradesh', lat: 15.9, lon: 80.6, zoom: 7 },
  { id: 'TN', name: '⚓ Tamil Nadu & Puducherry (Chennai / Cuddalore)', stateName: 'Tamil Nadu', lat: 13.0, lon: 80.2, zoom: 7 },
  { id: 'GJ', name: '🦁 Gujarat Coast (Porbandar / Dwarka / Kutch)', stateName: 'Gujarat', lat: 21.5, lon: 69.6, zoom: 7 },
  { id: 'MH', name: '🏙️ Maharashtra & Konkan (Mumbai / Ratnagiri)', stateName: 'Maharashtra', lat: 18.9, lon: 72.8, zoom: 7 },
  { id: 'KL', name: '🌊 Kerala & Lakshadweep (Kochi / Alappuzha)', stateName: 'Kerala', lat: 9.9, lon: 76.2, zoom: 7 },
];

// Complete synchronized meteorological presets for each forecasted alert level
export const FORECAST_PRESETS = {
  DANA: {
    id: 'DANA',
    name: 'CYCLONE DANA (BOB-02)',
    shortName: 'DANA',
    category: 4,
    status: 'Very Severe Cyclonic Storm',
    condition: 'severe',
    wind: 185,
    gusts: 205,
    pressure: 948,
    lat: 15.4,
    lon: 87.2,
    basin: 'Bay of Bengal',
    landfallTime: '14-Sep-2024 ~18:00 IST',
    landfallSector: 'Puri Coast, Odisha',
    surge: '3.5m - 4.2m',
    etaHours: '5h 30m',
    openShelters: 48,
    bulletin: {
      id: 'bulletin-dana',
      title: 'SPECIAL CYCLONE WARNING BULLETIN #16 · DANA',
      issuedAt: '14-Sep-2024 12:00 UTC (17:30 IST)',
      authority: 'Cyclone Warning Division, IMD New Delhi',
      author: 'Dr. M. Kumar (Senior Meteorologist)',
      severity: 'critical',
      headline: "Very Severe Cyclonic Storm 'DANA' rapidly approaching Odisha & West Bengal coasts. Landfall expected near Puri in ~5-6 hours.",
      windForecast: 'Gale surface winds reaching 175-185 km/h with gusts up to 205 km/h over northwest Bay of Bengal and coastal districts.',
      surgeForecast: 'Storm surge of 3.5m to 4.2m above astronomical tide is very likely to inundate low-lying coastal belts of Puri, Jagatsinghpur, and Kendrapara.',
      evacuationDirective: 'Mandatory immediate evacuation of vulnerable populations within 5 km of coastline. Move to nearest Multi-purpose Cyclone Shelter (MPCS) immediately.',
      fishermenWarning: 'Total suspension of maritime and fishing operations. Sea condition is phenomenal. All boats must remain moored in designated harbors.',
      transportAdvisory: 'East Coast Railway has cancelled 48 coastal trains. Bhubaneswar Airport (BBI) flight operations suspended from 17:00 IST.',
      affectedDistricts: [
        { name: 'Puri', state: 'Odisha', alertLevel: 'red', wind: '185 km/h', surge: '4.2m', evacuation: 'Mandatory Immediate', sheltersOpen: 48, contact: '06752-223322' },
        { name: 'Jagatsinghpur', state: 'Odisha', alertLevel: 'red', wind: '175 km/h', surge: '3.8m', evacuation: 'Mandatory Immediate', sheltersOpen: 36, contact: '06722-220088' },
        { name: 'Kendrapara', state: 'Odisha', alertLevel: 'red', wind: '165 km/h', surge: '3.5m', evacuation: 'High Priority', sheltersOpen: 42, contact: '06727-232144' },
        { name: 'Balasore', state: 'Odisha', alertLevel: 'orange', wind: '130 km/h', surge: '2.5m', evacuation: 'Standby / Low-lying', sheltersOpen: 28, contact: '06782-262100' },
        { name: 'East Midnapore / Digha', state: 'West Bengal', alertLevel: 'orange', wind: '125 km/h', surge: '2.8m', evacuation: 'Coastal lowlands', sheltersOpen: 32, contact: '03228-252200' },
        { name: 'Visakhapatnam', state: 'Andhra Pradesh', alertLevel: 'yellow', wind: '75 km/h', surge: '1.0m', evacuation: 'Cautionary watch', sheltersOpen: 20, contact: '0891-2565454' },
      ],
    },
  },
  REMAL: {
    id: 'REMAL',
    name: 'CYCLONE REMAL (ARB-01)',
    shortName: 'REMAL',
    category: 1,
    status: 'Cyclonic Storm',
    condition: 'intermediate',
    wind: 120,
    gusts: 140,
    pressure: 988,
    lat: 18.2,
    lon: 64.5,
    basin: 'North Bay of Bengal / Bengal Sunderbans',
    landfallTime: '15-Sep-2024 ~04:30 IST',
    landfallSector: 'Sagar Island, West Bengal / Sundarbans',
    surge: '1.5m - 2.2m',
    etaHours: '18h 45m',
    openShelters: 32,
    bulletin: {
      id: 'bulletin-remal',
      title: 'CYCLONE ADVISORY BULLETIN #08 · REMAL',
      issuedAt: '14-Sep-2024 14:00 UTC (19:30 IST)',
      authority: 'Area Cyclone Warning Centre (ACWC), Kolkata',
      author: 'Dr. P. Sharma (Operational Forecaster)',
      severity: 'moderate',
      headline: "Cyclonic Storm 'REMAL' intensifying over northern Bay of Bengal. Squally gale winds and intermediate coastal inundation expected.",
      windForecast: 'Squally surface wind speed reaching 110-120 km/h gusting to 140 km/h likely over north Bay of Bengal and coastal districts.',
      surgeForecast: 'Storm surge of 1.5m to 2.2m above astronomical tide is likely to inundate low-lying areas of South 24 Parganas and East Midnapore.',
      evacuationDirective: 'Precautionary evacuation of kutcha houses and low-lying coastal pockets. Fishermen warned against venturing into rough seas.',
      fishermenWarning: 'Fishermen are advised not to venture into deep sea of north Bay of Bengal. Inshore trawlers must return to port.',
      transportAdvisory: 'Speed restrictions on coastal rail sections. Ferry services across Hooghly river and Sundarbans suspended.',
      affectedDistricts: [
        { name: 'East Midnapore / Digha', state: 'West Bengal', alertLevel: 'yellow', wind: '120 km/h', surge: '2.2m', evacuation: 'Coastal lowlands caution', sheltersOpen: 32, contact: '03228-252200' },
        { name: 'Balasore', state: 'Odisha', alertLevel: 'yellow', wind: '95 km/h', surge: '1.5m', evacuation: 'Standby / Low-lying', sheltersOpen: 28, contact: '06782-262100' },
        { name: 'Kendrapara', state: 'Odisha', alertLevel: 'yellow', wind: '85 km/h', surge: '1.2m', evacuation: 'Cautionary watch', sheltersOpen: 42, contact: '06727-232144' },
        { name: 'Jagatsinghpur', state: 'Odisha', alertLevel: 'yellow', wind: '75 km/h', surge: '1.0m', evacuation: 'Cautionary watch', sheltersOpen: 36, contact: '06722-220088' },
        { name: 'Puri', state: 'Odisha', alertLevel: 'yellow', wind: '65 km/h', surge: '0.8m', evacuation: 'Safe indoor shelter', sheltersOpen: 48, contact: '06752-223322' },
        { name: 'Visakhapatnam', state: 'Andhra Pradesh', alertLevel: 'green', wind: '45 km/h', surge: '0.4m', evacuation: 'Normal conditions', sheltersOpen: 20, contact: '0891-2565454' },
      ],
    },
  },
  BOB01: {
    id: 'BOB01',
    name: 'DEPRESSION BOB-01',
    shortName: 'BOB-01',
    category: 1,
    status: 'Deep Depression',
    condition: 'safe',
    wind: 65,
    gusts: 80,
    pressure: 1005,
    lat: 12.1,
    lon: 82.3,
    basin: 'Central Bay of Bengal',
    landfallTime: 'No Coastal Landfall Projected',
    landfallSector: 'Maritime Open Ocean (Dissipating seaward)',
    surge: '0.5m - 1.0m',
    etaHours: 'Safe (Dispersing)',
    openShelters: 20,
    bulletin: {
      id: 'bulletin-bob01',
      title: 'SYNOPTIC WEATHER REPORT #04 · DEPRESSION BOB-01',
      issuedAt: '14-Sep-2024 16:00 UTC (21:30 IST)',
      authority: 'Regional Specialized Meteorological Centre, IMD New Delhi',
      author: 'Dr. M. Kumar (Senior Meteorologist)',
      severity: 'safe',
      headline: "Deep Depression 'BOB-01' maintaining low intensity over central waters. Basin meteorological parameters remain within safe operational thresholds.",
      windForecast: 'Moderate sea winds reaching 50-65 km/h with gusts up to 80 km/h over central waters. Coastal winds remain below gale force threshold.',
      surgeForecast: 'No significant storm surge expected. Normal astronomical tidal oscillations between 0.5m and 1.0m along shoreline.',
      evacuationDirective: 'Basin conditions SAFE / NORMAL. No civilian evacuation required. Coastal residents may carry out regular daily activities safely.',
      fishermenWarning: 'Fishermen in deep offshore central basin advised caution. Nearshore waters safe for navigation.',
      transportAdvisory: 'All transportation, rail, and port operations functioning under normal schedule with zero weather disruptions.',
      affectedDistricts: [
        { name: 'Puri', state: 'Odisha', alertLevel: 'green', wind: '45 km/h', surge: '0.5m', evacuation: 'Normal', sheltersOpen: 48, contact: '06752-223322' },
        { name: 'Jagatsinghpur', state: 'Odisha', alertLevel: 'green', wind: '40 km/h', surge: '0.4m', evacuation: 'Normal', sheltersOpen: 36, contact: '06722-220088' },
        { name: 'Kendrapara', state: 'Odisha', alertLevel: 'green', wind: '38 km/h', surge: '0.3m', evacuation: 'Normal', sheltersOpen: 42, contact: '06727-232144' },
        { name: 'Balasore', state: 'Odisha', alertLevel: 'green', wind: '35 km/h', surge: '0.2m', evacuation: 'Normal', sheltersOpen: 28, contact: '06782-262100' },
        { name: 'East Midnapore / Digha', state: 'West Bengal', alertLevel: 'green', wind: '35 km/h', surge: '0.3m', evacuation: 'Normal', sheltersOpen: 32, contact: '03228-252200' },
        { name: 'Visakhapatnam', state: 'Andhra Pradesh', alertLevel: 'green', wind: '30 km/h', surge: '0.2m', evacuation: 'Normal', sheltersOpen: 20, contact: '0891-2565454' },
      ],
    },
  },
};

const DEFAULT_SHELTERS = [
  {
    id: 'sh-1',
    name: 'Puri Town Hall Multi-Purpose Cyclone Shelter',
    district: 'Puri, Odisha',
    distanceKm: 1.8,
    capacity: 600,
    occupied: 420,
    status: 'Open & Operational',
    amenities: ['Power Backup (GenSet)', '15,000L Drinking Water', 'First Aid Station', 'Child Care'],
    managerName: 'Suresh Patnaik',
    phone: '+91 94370 12345',
    lat: 19.8135,
    lon: 85.8312,
  },
  {
    id: 'sh-2',
    name: 'Konark Marine Drive Disaster Shelter (MPCS-04)',
    district: 'Puri, Odisha',
    distanceKm: 4.2,
    capacity: 500,
    occupied: 290,
    status: 'Open & Operational',
    amenities: ['Community Kitchen', 'Water Purifier', 'Satellite Radio Phone', 'Solar Backup'],
    managerName: 'Anita Mohanty',
    phone: '+91 94371 67890',
    lat: 19.8876,
    lon: 86.0945,
  },
  {
    id: 'sh-3',
    name: 'Paradip Port Coastal Protection Shelter #12',
    district: 'Jagatsinghpur, Odisha',
    distanceKm: 8.5,
    capacity: 800,
    occupied: 610,
    status: 'Open & Operational',
    amenities: ['NDRF Medical Post', 'Ambulance Standby', 'Emergency Food Stock (3 Days)'],
    managerName: 'Capt. R. Swain',
    phone: '+91 94372 11223',
    lat: 20.2644,
    lon: 86.6712,
  },
  {
    id: 'sh-4',
    name: 'Kendrapara Coastal High School Shelter',
    district: 'Kendrapara, Odisha',
    distanceKm: 6.1,
    capacity: 450,
    occupied: 230,
    status: 'Open & Operational',
    amenities: ['Clean Water', 'First Aid', 'Sanitation Blocks', 'Livestock Enclosure'],
    managerName: 'B. C. Das',
    phone: '+91 94373 44556',
    lat: 20.5012,
    lon: 86.4231,
  },
  {
    id: 'sh-5',
    name: 'Digha Coastal Disaster Shelter (Bengal Zone A)',
    district: 'East Midnapore, West Bengal',
    distanceKm: 3.4,
    capacity: 400,
    occupied: 185,
    status: 'Open & Operational',
    amenities: ['Power Backup', 'Food Ration', 'Police Outpost', 'Water Tanker'],
    managerName: 'Subir Banerjee',
    phone: '+91 98300 77889',
    lat: 21.6266,
    lon: 87.5074,
  },
];

export function DisasterAlertProvider({ children }) {
  // Selected Coastal Region / State Monitoring Zone
  const [selectedRegion, setSelectedRegion] = useState(() => {
    try {
      const saved = localStorage.getItem('cyclone_ai_selected_region');
      if (saved) return JSON.parse(saved);
    } catch {}
    return COASTAL_REGIONS[1]; // Default: Odisha Coast
  });

  // Synchronized condition state: 'severe', 'intermediate', 'safe'
  const [condition, setCondition] = useState(() => {
    return localStorage.getItem('cyclone_ai_condition') || 'severe';
  });

  // Active cyclone system telemetry (synchronized with Administrator's recorded forecast)
  const [activeCyclone, setActiveCyclone] = useState(() => {
    try {
      const saved = localStorage.getItem('cyclone_ai_active_cyclone');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return FORECAST_PRESETS.DANA;
  });

  // Active official bulletin prepared by Administrator
  const [activeBulletin, setActiveBulletin] = useState(() => {
    try {
      const saved = localStorage.getItem('cyclone_ai_active_bulletin');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return FORECAST_PRESETS.DANA.bulletin;
  });

  // Real-time autonomous weather stream & synoptic progression
  const [isLiveWeatherActive, setIsLiveWeatherActive] = useState(() => {
    return localStorage.getItem('cyclone_ai_live_weather') !== 'false';
  });

  const [weatherCountdown, setWeatherCountdown] = useState(25);

  const [liveTelemetry, setLiveTelemetry] = useState(() => ({
    surfaceWind: 185,
    gusts: 205,
    pressure: 948.2,
    surge: '3.5m - 4.2m',
    radarReflectivity: '54 dBZ',
    dvorakT: 'T5.5',
    lastUpdate: 'Live Synoptic Stream Active',
  }));

  // Cyclone shelters directory
  const [shelters, setShelters] = useState(() => {
    const saved = localStorage.getItem('cyclone_ai_shelters');
    return saved ? JSON.parse(saved) : DEFAULT_SHELTERS;
  });

  // Distress SOS alerts dispatched by citizens, received by Administrator
  const [sosBeacons, setSosBeacons] = useState(() => {
    const saved = localStorage.getItem('cyclone_ai_sos_beacons');
    return saved ? JSON.parse(saved) : [
      {
        id: 'sos-1',
        name: 'Tapan Pradhan',
        phone: '+91 98610 54321',
        district: 'Puri (Brahmagiri Sector)',
        peopleCount: 4,
        needType: 'Medical & Evacuation Assistance',
        timestamp: '14-Sep 16:42 IST',
        status: 'Dispatched NDRF Team 4',
        lat: 19.80,
        lon: 85.80,
      },
      {
        id: 'sos-2',
        name: 'Manoranjan Sahoo',
        phone: '+91 94378 90123',
        district: 'Jagatsinghpur (Erasama Block)',
        peopleCount: 6,
        needType: 'Rising Inundation Surge / Cut-off',
        timestamp: '14-Sep 17:05 IST',
        status: 'In Progress (Coast Guard Boat 02)',
        lat: 20.25,
        lon: 86.65,
      },
    ];
  });

  // SMS registered citizen numbers for emergency broadcasts
  const [smsRegistrations, setSmsRegistrations] = useState(() => {
    const saved = localStorage.getItem('cyclone_ai_sms_subscribers');
    return saved ? JSON.parse(saved) : ['+91 98765 43210', '+91 94370 99887'];
  });

  // Multilingual support: 'English' | 'Hindi' | 'Odia' | 'Bengali'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('cyclone_ai_language') || 'English';
  });

  // Keep state in localStorage
  useEffect(() => {
    localStorage.setItem('cyclone_ai_selected_region', JSON.stringify(selectedRegion));
  }, [selectedRegion]);

  useEffect(() => {
    localStorage.setItem('cyclone_ai_condition', condition);
  }, [condition]);

  useEffect(() => {
    localStorage.setItem('cyclone_ai_active_cyclone', JSON.stringify(activeCyclone));
  }, [activeCyclone]);

  useEffect(() => {
    localStorage.setItem('cyclone_ai_active_bulletin', JSON.stringify(activeBulletin));
  }, [activeBulletin]);

  useEffect(() => {
    localStorage.setItem('cyclone_ai_sos_beacons', JSON.stringify(sosBeacons));
  }, [sosBeacons]);

  useEffect(() => {
    localStorage.setItem('cyclone_ai_shelters', JSON.stringify(shelters));
  }, [shelters]);

  useEffect(() => {
    localStorage.setItem('cyclone_ai_sms_subscribers', JSON.stringify(smsRegistrations));
  }, [smsRegistrations]);

  useEffect(() => {
    localStorage.setItem('cyclone_ai_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('cyclone_ai_live_weather', isLiveWeatherActive ? 'true' : 'false');
  }, [isLiveWeatherActive]);

  // Reactive Multi-Tab and Cross-Window Synchronization Listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cyclone_ai_condition' && e.newValue) {
        setCondition(e.newValue);
      }
      if (e.key === 'cyclone_ai_active_cyclone' && e.newValue) {
        try {
          setActiveCyclone(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'cyclone_ai_active_bulletin' && e.newValue) {
        try {
          setActiveBulletin(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'cyclone_ai_live_weather') {
        setIsLiveWeatherActive(e.newValue !== 'false');
      }
    };

    const handleCustomSync = (e) => {
      if (e.detail) {
        if (e.detail.condition) setCondition(e.detail.condition);
        if (e.detail.activeCyclone) setActiveCyclone(e.detail.activeCyclone);
        if (e.detail.activeBulletin) setActiveBulletin(e.detail.activeBulletin);
        if (e.detail.isLiveWeatherActive !== undefined) setIsLiveWeatherActive(e.detail.isLiveWeatherActive);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cyclone-alert-sync', handleCustomSync);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cyclone-alert-sync', handleCustomSync);
    };
  }, []);

  /**
   * PRIMARY SYNCHRONIZATION FUNCTION
   * Recorded on Administrator Interface -> Broadcast & Forecasted directly to Citizen Interface
   * @param {string} target - 'severe' | 'intermediate' | 'safe' or Cyclone ID ('DANA' | 'REMAL' | 'BOB01')
   * @param {object} customOverrides - Optional custom data fields
   */
  const setForecastAlert = useCallback((target, customOverrides = {}) => {
    let newCondition = 'severe';
    let targetPreset = FORECAST_PRESETS.DANA;

    const normalized = (target || '').toUpperCase();

    if (normalized === 'SAFE' || normalized === 'LOW' || normalized === 'BOB01' || normalized.includes('BOB')) {
      newCondition = 'safe';
      targetPreset = FORECAST_PRESETS.BOB01;
    } else if (normalized === 'INTERMEDIATE' || normalized === 'MODERATE' || normalized === 'REMAL') {
      newCondition = 'intermediate';
      targetPreset = FORECAST_PRESETS.REMAL;
    } else {
      newCondition = 'severe';
      targetPreset = FORECAST_PRESETS.DANA;
    }

    const updatedCyclone = {
      ...targetPreset,
      ...customOverrides,
    };

    const updatedBulletin = {
      ...targetPreset.bulletin,
      ...(customOverrides.bulletin || {}),
      id: `bulletin-${Date.now()}`,
      issuedAt: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata',
      }) + ' IST',
    };

    // Update local React state
    setCondition(newCondition);
    setActiveCyclone(updatedCyclone);
    setActiveBulletin(updatedBulletin);
    setWeatherCountdown(25); // Reset countdown on new condition

    // Save to localStorage immediately
    localStorage.setItem('cyclone_ai_condition', newCondition);
    localStorage.setItem('cyclone_ai_active_cyclone', JSON.stringify(updatedCyclone));
    localStorage.setItem('cyclone_ai_active_bulletin', JSON.stringify(updatedBulletin));

    // Dispatch global event for instant cross-tab & in-window reactivity
    window.dispatchEvent(new CustomEvent('cyclone-alert-sync', {
      detail: {
        condition: newCondition,
        activeCyclone: updatedCyclone,
        activeBulletin: updatedBulletin,
      },
    }));

    return { condition: newCondition, activeCyclone: updatedCyclone, activeBulletin: updatedBulletin };
  }, []);

  // Toggle helper for live weather stream
  const toggleLiveWeather = useCallback(() => {
    setIsLiveWeatherActive(prev => {
      const next = !prev;
      localStorage.setItem('cyclone_ai_live_weather', next ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('cyclone-alert-sync', {
        detail: { isLiveWeatherActive: next }
      }));
      return next;
    });
  }, []);

  // Autonomous Real-Time Weather & Cyclonic Condition Engine
  useEffect(() => {
    if (!isLiveWeatherActive) return;

    // 1. High-frequency atmospheric sensor micro-variations (every 2.5s)
    const telemetryInterval = setInterval(() => {
      setActiveCyclone(prev => {
        if (!prev) return prev;
        const currentCond = prev.condition || condition || 'severe';
        const windBase = currentCond === 'severe' ? 185 : currentCond === 'intermediate' ? 120 : 60;
        const gustBase = currentCond === 'severe' ? 205 : currentCond === 'intermediate' ? 140 : 75;
        const pressureBase = currentCond === 'severe' ? 948 : currentCond === 'intermediate' ? 988 : 1005;

        // Subtle realistic atmospheric variations
        const windDelta = Math.round((Math.random() - 0.5) * 4);
        const gustDelta = Math.round((Math.random() - 0.5) * 6);
        const pressDelta = Number(((Math.random() - 0.5) * 0.8).toFixed(1));

        const updatedWind = Math.max(30, windBase + windDelta);
        const updatedGusts = Math.max(updatedWind + 10, gustBase + gustDelta);
        const updatedPressure = Number((pressureBase + pressDelta).toFixed(1));

        setLiveTelemetry({
          surfaceWind: updatedWind,
          gusts: updatedGusts,
          pressure: updatedPressure,
          surge: currentCond === 'severe' ? '3.5m - 4.2m' : currentCond === 'intermediate' ? '1.5m - 2.2m' : '0.5m - 1.0m',
          radarReflectivity: currentCond === 'severe' ? '54 dBZ' : currentCond === 'intermediate' ? '42 dBZ' : '24 dBZ',
          dvorakT: currentCond === 'severe' ? 'T5.5' : currentCond === 'intermediate' ? 'T3.5' : 'T1.5',
          lastUpdate: 'Live Synoptic Stream Active',
        });

        return {
          ...prev,
          wind: updatedWind,
          gusts: updatedGusts,
          pressure: updatedPressure,
        };
      });
    }, 2500);

    // 2. Synoptic Condition Evolution: safe -> intermediate -> severe (every 25s)
    const transitionInterval = setInterval(() => {
      setWeatherCountdown(prev => {
        if (prev <= 1) {
          // Progress through real synoptic stages
          const stages = ['safe', 'intermediate', 'severe'];
          const currIdx = stages.indexOf(condition);
          const nextCondition = stages[(currIdx + 1) % stages.length];
          setForecastAlert(nextCondition);
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(telemetryInterval);
      clearInterval(transitionInterval);
    };
  }, [isLiveWeatherActive, condition, setForecastAlert]);

  // Method for Administrator to publish custom bulletin which immediately propagates to Citizens
  const publishBulletinFromAdmin = (newBulletinData) => {
    const updated = {
      ...activeBulletin,
      ...newBulletinData,
      id: `bulletin-${Date.now()}`,
      issuedAt: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata',
      }) + ' IST',
    };
    setActiveBulletin(updated);
    localStorage.setItem('cyclone_ai_active_bulletin', JSON.stringify(updated));

    window.dispatchEvent(new CustomEvent('cyclone-alert-sync', {
      detail: {
        condition,
        activeCyclone,
        activeBulletin: updated,
      },
    }));

    return updated;
  };

  // Method for Citizens to dispatch emergency SOS
  const dispatchSOS = ({ name, phone, district, peopleCount = 1, needType = 'Emergency Evacuation', lat = 19.81, lon = 85.83 }) => {
    const newBeacon = {
      id: `sos-${Date.now()}`,
      name: name || 'Citizen in Distress',
      phone: phone || 'Not Provided',
      district: district || 'Coastal Sector',
      peopleCount,
      needType,
      timestamp: new Date().toLocaleString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata',
      }) + ' IST',
      status: 'Beacon Active — Notified IMD & NDRF Command',
      lat,
      lon,
    };
    setSosBeacons(prev => [newBeacon, ...prev]);
    return newBeacon;
  };

  // Register mobile number for emergency SMS broadcast
  const registerSMSAlerts = (phone) => {
    if (!phone) return;
    setSmsRegistrations(prev => [...new Set([phone, ...prev])]);
  };

  return (
    <DisasterAlertContext.Provider
      value={{
        condition,
        setCondition,
        activeCyclone,
        setActiveCyclone,
        activeBulletin,
        publishBulletinFromAdmin,
        setForecastAlert,
        FORECAST_PRESETS,
        shelters,
        setShelters,
        sosBeacons,
        dispatchSOS,
        smsRegistrations,
        registerSMSAlerts,
        language,
        setLanguage,
        selectedRegion,
        setSelectedRegion,
        COASTAL_REGIONS,
        isLiveWeatherActive,
        toggleLiveWeather,
        weatherCountdown,
        liveTelemetry,
      }}
    >
      {children}
    </DisasterAlertContext.Provider>
  );
}

export function useDisasterAlert() {
  const context = useContext(DisasterAlertContext);
  if (!context) {
    throw new Error('useDisasterAlert must be used within a DisasterAlertProvider');
  }
  return context;
}
