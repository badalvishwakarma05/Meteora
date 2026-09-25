/**
 * coastalPorts.js
 * ===============
 * Comprehensive centralized dataset of major Indian coastal ports, deepwater harbours,
 * and maritime cities for the METEORA GIS GIS Mapping & Landfall Early Warning Engine.
 */

export const COASTAL_PORTS = [
  // --- ODISHA COAST ---
  {
    id: 'PARADIP',
    name: 'Paradip Port',
    type: 'Major Port',
    state: 'Odisha',
    basin: 'Bay of Bengal',
    lat: 20.3164,
    lon: 86.6114,
    berths: 16,
    criticalZone: 'Mahanadi Estuary',
    evacuationPriority: 'High',
    description: 'Major bulk cargo deepwater port on Odisha coast; critical hub for coal and iron ore.'
  },
  {
    id: 'DHAMRA',
    name: 'Dhamra Port',
    type: 'Deepwater Port',
    state: 'Odisha',
    basin: 'Bay of Bengal',
    lat: 20.7842,
    lon: 86.9214,
    berths: 5,
    criticalZone: 'Bhadrak Estuary',
    evacuationPriority: 'Very High',
    description: 'All-weather deep-draft port near Bhitarkanika National Park; direct landfall target for Cyclone Dana & Yaas.'
  },
  {
    id: 'PURI',
    name: 'Puri Coastal Urban',
    type: 'Maritime City',
    state: 'Odisha',
    basin: 'Bay of Bengal',
    lat: 19.8135,
    lon: 85.8312,
    berths: 0,
    criticalZone: 'Chilika Spit',
    evacuationPriority: 'Critical',
    description: 'Dense coastal tourism and heritage center; direct landfall epicenter for Cyclone Fani (2019).'
  },
  {
    id: 'GOPALPUR',
    name: 'Gopalpur Port',
    type: 'Commercial Port',
    state: 'Odisha',
    basin: 'Bay of Bengal',
    lat: 19.2647,
    lon: 84.9144,
    berths: 4,
    criticalZone: 'Ganjam Coast',
    evacuationPriority: 'High',
    description: 'Deepwater commercial port on South Odisha coast; direct landfall site for Super Cyclone Phailin (2013).'
  },
  {
    id: 'BALASORE',
    name: 'Balasore / Chandipur',
    type: 'Defence & Port Zone',
    state: 'Odisha',
    basin: 'Bay of Bengal',
    lat: 21.4942,
    lon: 86.9317,
    berths: 2,
    criticalZone: 'Subarnarekha Delta',
    evacuationPriority: 'High',
    description: 'Coastal district with DRDO Integrated Test Range and extensive tidal mudflats.'
  },

  // --- WEST BENGAL COAST ---
  {
    id: 'DIGHA',
    name: 'Digha Coast',
    type: 'Maritime City',
    state: 'West Bengal',
    basin: 'Bay of Bengal',
    lat: 21.6266,
    lon: 87.5074,
    berths: 0,
    criticalZone: 'East Midnapore',
    evacuationPriority: 'Very High',
    description: 'Prominent coastal tourist town bordering Odisha; vulnerable to severe storm surge inundation.'
  },
  {
    id: 'HALDIA',
    name: 'Haldia Port',
    type: 'Major Dock Complex',
    state: 'West Bengal',
    basin: 'Bay of Bengal',
    lat: 22.0232,
    lon: 88.0645,
    berths: 14,
    criticalZone: 'Hooghly River Mouth',
    evacuationPriority: 'High',
    description: 'Syama Prasad Mookerjee Port subsidiary; heavy petrochemical and industrial shipping hub.'
  },
  {
    id: 'KOLKATA',
    name: 'Kolkata Port (SMP)',
    type: 'Major Riverine Port',
    state: 'West Bengal',
    basin: 'Bay of Bengal',
    lat: 22.5726,
    lon: 88.3639,
    berths: 22,
    criticalZone: 'Hooghly Estuary',
    evacuationPriority: 'Critical',
    description: 'Oldest operating port in India; major metropolis impacted by Category 5 Cyclone Amphan.'
  },
  {
    id: 'SAGAR',
    name: 'Sagar Island',
    type: 'Coastal Island & Lighthouse',
    state: 'West Bengal',
    basin: 'Bay of Bengal',
    lat: 21.6500,
    lon: 88.1000,
    berths: 1,
    criticalZone: 'Sundarbans Delta',
    evacuationPriority: 'Critical',
    description: 'Low-lying delta island in the mouth of the Hooghly River; epicenter for tidal surges.'
  },

  // --- ANDHRA PRADESH COAST ---
  {
    id: 'VIZAG',
    name: 'Visakhapatnam Port',
    type: 'Major Port & Naval Base',
    state: 'Andhra Pradesh',
    basin: 'Bay of Bengal',
    lat: 17.6868,
    lon: 83.2185,
    berths: 24,
    criticalZone: 'Dolphin Nose Headland',
    evacuationPriority: 'Critical',
    description: 'One of 12 major ports in India and headquarters of Eastern Naval Command; struck by Cyclone Hudhud (2014).'
  },
  {
    id: 'GANGAVARAM',
    name: 'Gangavaram Port',
    type: 'Deepwater Port',
    state: 'Andhra Pradesh',
    basin: 'Bay of Bengal',
    lat: 17.6186,
    lon: 83.2389,
    berths: 9,
    criticalZone: 'South Vizag Coast',
    evacuationPriority: 'High',
    description: 'Deepest port in India with 21m water depth capable of handling Capesize vessels.'
  },
  {
    id: 'KAKINADA',
    name: 'Kakinada Deepwater Port',
    type: 'Deepwater Port',
    state: 'Andhra Pradesh',
    basin: 'Bay of Bengal',
    lat: 16.9891,
    lon: 82.2475,
    berths: 7,
    criticalZone: 'Godavari Estuary / Hope Island',
    evacuationPriority: 'High',
    description: 'Natural harbour shielded by Hope Island barrier spit with offshore oil & gas exploration support.'
  },
  {
    id: 'BAPATLA',
    name: 'Bapatla / Suryalanka',
    type: 'Maritime City',
    state: 'Andhra Pradesh',
    basin: 'Bay of Bengal',
    lat: 15.9042,
    lon: 80.4674,
    berths: 0,
    criticalZone: 'Krishna-Guntur Coast',
    evacuationPriority: 'Very High',
    description: 'Coastal landfall crossing zone for Cyclone Michaung (2023) and historic 1977 Andhra cyclone.'
  },
  {
    id: 'KRISHNAPATNAM',
    name: 'Krishnapatnam Port',
    type: 'Major Commercial Port',
    state: 'Andhra Pradesh',
    basin: 'Bay of Bengal',
    lat: 14.2500,
    lon: 80.1200,
    berths: 12,
    criticalZone: 'Nellore Coast',
    evacuationPriority: 'High',
    description: 'Deep draft, all-weather modern container and multi-commodity port on Nellore coast.'
  },

  // --- TAMIL NADU & PUDUCHERRY COAST ---
  {
    id: 'CHENNAI',
    name: 'Chennai Port',
    type: 'Major Port',
    state: 'Tamil Nadu',
    basin: 'Bay of Bengal',
    lat: 13.0827,
    lon: 80.2707,
    berths: 26,
    criticalZone: 'Coromandel Urban Coast',
    evacuationPriority: 'Critical',
    description: 'Second largest container port in India; major automobile and container logistics gateway.'
  },
  {
    id: 'ENNORE',
    name: 'Kamarajar Port (Ennore)',
    type: 'Major Port',
    state: 'Tamil Nadu',
    basin: 'Bay of Bengal',
    lat: 13.2500,
    lon: 80.3300,
    berths: 8,
    criticalZone: 'North Chennai Coast',
    evacuationPriority: 'High',
    description: 'First corporatized major port in India with dedicated thermal coal handling berths.'
  },
  {
    id: 'CUDDALORE',
    name: 'Cuddalore Port',
    type: 'Minor Port & Chemical Hub',
    state: 'Tamil Nadu',
    basin: 'Bay of Bengal',
    lat: 11.7480,
    lon: 79.7714,
    berths: 2,
    criticalZone: 'Uppanar Estuary',
    evacuationPriority: 'High',
    description: 'Coastal industrial port town prone to severe cyclone landfalls (Thane, Gaja, Senyar).'
  },
  {
    id: 'NAGAPATTINAM',
    name: 'Nagapattinam Port',
    type: 'Commercial Port',
    state: 'Tamil Nadu',
    basin: 'Bay of Bengal',
    lat: 10.7672,
    lon: 79.8449,
    berths: 3,
    criticalZone: 'Cauvery Delta',
    evacuationPriority: 'High',
    description: 'Historic port in the Cauvery delta region directly impacted by Cyclone Gaja (2018).'
  },
  {
    id: 'TUTICORIN',
    name: 'V.O. Chidambaranar (Tuticorin)',
    type: 'Major Port',
    state: 'Tamil Nadu',
    basin: 'Gulf of Mannar',
    lat: 8.7642,
    lon: 78.1348,
    berths: 14,
    criticalZone: 'Gulf of Mannar',
    evacuationPriority: 'High',
    description: 'Major southern maritime gateway connecting international East-West shipping lanes.'
  },
  {
    id: 'KANYAKUMARI',
    name: 'Kanyakumari',
    type: 'Maritime City',
    state: 'Tamil Nadu',
    basin: 'Indian Ocean Confluence',
    lat: 8.0883,
    lon: 77.5385,
    berths: 1,
    criticalZone: 'Cape Comorin',
    evacuationPriority: 'High',
    description: 'Southernmost tip of the Indian mainland at confluence of Bay of Bengal, Arabian Sea, and Indian Ocean.'
  },

  // --- KERALA & KARNATAKA & GOA ---
  {
    id: 'COCHIN',
    name: 'Cochin Port (Kochi)',
    type: 'Major Port & Transshipment',
    state: 'Kerala',
    basin: 'Arabian Sea',
    lat: 9.9312,
    lon: 76.2673,
    berths: 18,
    criticalZone: 'Vembanad Lake Estuary',
    evacuationPriority: 'High',
    description: 'Natural all-weather port featuring the International Container Transshipment Terminal (ICTT) at Vallarpadam.'
  },
  {
    id: 'VIZHINJAM',
    name: 'Vizhinjam International Seaport',
    type: 'Mega Transshipment Port',
    state: 'Kerala',
    basin: 'Arabian Sea',
    lat: 8.3750,
    lon: 76.9900,
    berths: 4,
    criticalZone: 'Trivandrum South Coast',
    evacuationPriority: 'High',
    description: 'Deep-draft 20m international transshipment terminal located just 10 nautical miles from international shipping channel.'
  },
  {
    id: 'MANGALORE',
    name: 'New Mangalore Port',
    type: 'Major Port',
    state: 'Karnataka',
    basin: 'Arabian Sea',
    lat: 12.9200,
    lon: 74.8100,
    berths: 16,
    criticalZone: 'Gurupura River Mouth',
    evacuationPriority: 'Moderate',
    description: 'Only major port in Karnataka; primary exporter of iron ore, coffee, and cashew commodities.'
  },
  {
    id: 'MORMUGAO',
    name: 'Mormugao Port',
    type: 'Major Port',
    state: 'Goa',
    basin: 'Arabian Sea',
    lat: 15.4100,
    lon: 73.8000,
    berths: 11,
    criticalZone: 'Zuari River Estuary',
    evacuationPriority: 'Moderate',
    description: 'Leading iron ore exporting port in India situated on a natural harbour.'
  },

  // --- MAHARASHTRA COAST ---
  {
    id: 'JNPT',
    name: 'JNPT / Nhava Sheva',
    type: 'Major Container Port',
    state: 'Maharashtra',
    basin: 'Arabian Sea',
    lat: 18.9500,
    lon: 72.9500,
    berths: 20,
    criticalZone: 'Thane Creek / Navi Mumbai',
    evacuationPriority: 'Critical',
    description: 'Handles over 50% of containerized cargo across all major ports in India.'
  },
  {
    id: 'MUMBAI',
    name: 'Mumbai Port (MbPA)',
    type: 'Major Port & Metropolis',
    state: 'Maharashtra',
    basin: 'Arabian Sea',
    lat: 18.9220,
    lon: 72.8347,
    berths: 32,
    criticalZone: 'Mumbai Natural Harbour',
    evacuationPriority: 'Critical',
    description: 'Premier natural deep-water harbour servicing financial capital of India; threatened by Cyclone Nisarga (2020).'
  },
  {
    id: 'ALIBAUG',
    name: 'Alibaug Coast',
    type: 'Maritime City',
    state: 'Maharashtra',
    basin: 'Arabian Sea',
    lat: 18.6414,
    lon: 72.8722,
    berths: 0,
    criticalZone: 'Raigad Coastline',
    evacuationPriority: 'High',
    description: 'Coastal headland of Raigad district; direct landfall point for Cyclone Nisarga.'
  },

  // --- GUJARAT COAST ---
  {
    id: 'KANDLA',
    name: 'Deendayal Port (Kandla)',
    type: 'Major Port',
    state: 'Gujarat',
    basin: 'Arabian Sea',
    lat: 23.0100,
    lon: 70.2200,
    berths: 18,
    criticalZone: 'Gulf of Kutch',
    evacuationPriority: 'Very High',
    description: 'Highest cargo volume handling major port in India; major crude oil and grain terminal.'
  },
  {
    id: 'MUNDRA',
    name: 'Mundra Port',
    type: 'Commercial Mega Port',
    state: 'Gujarat',
    basin: 'Arabian Sea',
    lat: 22.8400,
    lon: 69.7000,
    berths: 28,
    criticalZone: 'Gulf of Kutch',
    evacuationPriority: 'Very High',
    description: 'Largest commercial port in India handling over 150 million tonnes annually.'
  },
  {
    id: 'JAKHAU',
    name: 'Jakhau Port',
    type: 'Deep Sea Port & Coastal Post',
    state: 'Gujarat',
    basin: 'Arabian Sea',
    lat: 23.2382,
    lon: 68.6186,
    berths: 2,
    criticalZone: 'Kutch Bordering Estuary',
    evacuationPriority: 'Critical',
    description: 'Westernmost port of India near Sir Creek; direct landfall epicenter for Cyclone Biparjoy (2023).'
  },
  {
    id: 'PORBANDAR',
    name: 'Porbandar Port',
    type: 'All-Weather Port',
    state: 'Gujarat',
    basin: 'Arabian Sea',
    lat: 21.6417,
    lon: 69.6293,
    berths: 6,
    criticalZone: 'Saurashtra West Coast',
    evacuationPriority: 'High',
    description: 'All-weather port on Saurashtra coast supporting chemical, cement, and fishing industries.'
  },
  {
    id: 'VERAVAL',
    name: 'Veraval Port',
    type: 'Commercial Fishing Hub',
    state: 'Gujarat',
    basin: 'Arabian Sea',
    lat: 20.9000,
    lon: 70.3667,
    berths: 3,
    criticalZone: 'Somnath Coast',
    evacuationPriority: 'High',
    description: 'One of the largest fishing ports in Asia; severely affected by Cyclone Tauktae (2021).'
  },
  {
    id: 'PIPAVAV',
    name: 'Pipavav Port',
    type: 'Private Container Port',
    state: 'Gujarat',
    basin: 'Arabian Sea',
    lat: 20.9100,
    lon: 71.5000,
    berths: 8,
    criticalZone: 'Gulf of Khambhat Entrance',
    evacuationPriority: 'High',
    description: 'India’s first private sector port specializing in containers, bulk cargo, and LPG.'
  },
  {
    id: 'HAZIRA',
    name: 'Hazira Port (Surat)',
    type: 'Deepwater Commercial Port',
    state: 'Gujarat',
    basin: 'Arabian Sea',
    lat: 21.1000,
    lon: 72.6300,
    berths: 6,
    criticalZone: 'Tapi Estuary / Gulf of Khambhat',
    evacuationPriority: 'High',
    description: 'Major industrial deepwater port handling LNG imports, chemicals, and steel.'
  },

  // --- REGIONAL CROSS-BORDER COOPERATION ---
  {
    id: 'CHITTAGONG',
    name: 'Chittagong Port',
    type: 'International Major Port',
    state: 'Chittagong Division, Bangladesh',
    basin: 'Bay of Bengal',
    lat: 22.3569,
    lon: 91.7832,
    berths: 19,
    criticalZone: 'Karnaphuli River Estuary',
    evacuationPriority: 'High',
    description: 'Principal seaport of Bangladesh handling 90% of export-import ocean commerce.'
  }
];

/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in kilometers.
 */
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Returns ports sorted by proximity to a given cyclone position.
 */
export function getClosestPorts(cycloneLat, cycloneLon, limit = 5) {
  return COASTAL_PORTS.map(port => ({
    ...port,
    distanceKm: getDistanceKm(cycloneLat, cycloneLon, port.lat, port.lon),
  }))
  .sort((a, b) => a.distanceKm - b.distanceKm)
  .slice(0, limit);
}
