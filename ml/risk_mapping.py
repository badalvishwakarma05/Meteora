import os
import math
import logging
import numpy as np
import h5py

logger = logging.getLogger(__name__)

# Spatial boundaries (Bounding boxes & Centroids) for Indian Coastal States & Maritime Zones
COASTAL_STATES = [
    {
        'id': 'OD',
        'name': 'Odisha',
        'full_title': 'Odisha Coastal Belt',
        'bbox': {'min_lat': 18.8, 'max_lat': 22.6, 'min_lon': 84.4, 'max_lon': 87.6},
        'centroid': {'lat': 19.8, 'lon': 85.8},
        'vulnerability_factor': 1.15,  # High bathymetric storm surge sensitivity
        'key_districts': ['Puri', 'Jagatsinghpur', 'Kendrapara', 'Balasore', 'Ganjam'],
        'emergency_contact': '0674-2534177 (Odisha SDMA)',
        'shelters_available': 480,
    },
    {
        'id': 'WB',
        'name': 'West Bengal',
        'full_title': 'West Bengal & Sundarbans Delta',
        'bbox': {'min_lat': 21.0, 'max_lat': 23.2, 'min_lon': 86.8, 'max_lon': 89.5},
        'centroid': {'lat': 21.5, 'lon': 88.3},
        'vulnerability_factor': 1.20,  # Deltaic estuarine surge amplifications
        'key_districts': ['East Midnapore (Digha)', 'South 24 Parganas', 'North 24 Parganas', 'Kolkata'],
        'emergency_contact': '033-22143526 (WB Disaster Control)',
        'shelters_available': 390,
    },
    {
        'id': 'AP',
        'name': 'Andhra Pradesh',
        'full_title': 'Andhra Pradesh Coastal Zone',
        'bbox': {'min_lat': 13.5, 'max_lat': 19.1, 'min_lon': 79.8, 'max_lon': 84.8},
        'centroid': {'lat': 15.9, 'lon': 80.6},
        'vulnerability_factor': 1.05,
        'key_districts': ['Visakhapatnam', 'Kakinada', 'Machilipatnam', 'Nellore', 'Srikakulam'],
        'emergency_contact': '0863-2377112 (AP State Disaster Center)',
        'shelters_available': 410,
    },
    {
        'id': 'TN',
        'name': 'Tamil Nadu',
        'full_title': 'Tamil Nadu & Puducherry Coast',
        'bbox': {'min_lat': 8.0, 'max_lat': 13.6, 'min_lon': 77.0, 'max_lon': 80.4},
        'centroid': {'lat': 13.0, 'lon': 80.2},
        'vulnerability_factor': 1.00,
        'key_districts': ['Chennai', 'Cuddalore', 'Nagapattinam', 'Ramanathapuram', 'Puducherry'],
        'emergency_contact': '044-28888000 (TN TNSDMA Control Room)',
        'shelters_available': 350,
    },
    {
        'id': 'GJ',
        'name': 'Gujarat',
        'full_title': 'Gujarat Coast & Gulf of Kutch',
        'bbox': {'min_lat': 20.0, 'max_lat': 24.6, 'min_lon': 68.0, 'max_lon': 73.2},
        'centroid': {'lat': 21.5, 'lon': 69.6},
        'vulnerability_factor': 1.10,
        'key_districts': ['Kutch (Jakhau)', 'Porbandar', 'Devbhumi Dwarka', 'Jamnagar', 'Junagadh'],
        'emergency_contact': '079-23251900 (GSDMA Control Room)',
        'shelters_available': 310,
    },
    {
        'id': 'MH',
        'name': 'Maharashtra',
        'full_title': 'Maharashtra & Konkan Coast',
        'bbox': {'min_lat': 15.6, 'max_lat': 20.2, 'min_lon': 72.4, 'max_lon': 73.8},
        'centroid': {'lat': 18.9, 'lon': 72.8},
        'vulnerability_factor': 0.95,
        'key_districts': ['Mumbai City', 'Mumbai Suburban', 'Raigad (Alibaug)', 'Ratnagiri', 'Sindhudurg'],
        'emergency_contact': '022-22027990 (Maharashtra SDMA)',
        'shelters_available': 280,
    },
    {
        'id': 'KL',
        'name': 'Kerala',
        'full_title': 'Kerala & Lakshadweep Coastline',
        'bbox': {'min_lat': 8.2, 'max_lat': 12.9, 'min_lon': 74.5, 'max_lon': 77.6},
        'centroid': {'lat': 9.9, 'lon': 76.2},
        'vulnerability_factor': 0.90,
        'key_districts': ['Thiruvananthapuram', 'Alappuzha', 'Ernakulam (Kochi)', 'Kozhikode', 'Kannur'],
        'emergency_contact': '0471-2331639 (Kerala SDMA)',
        'shelters_available': 260,
    },
]

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculates great circle distance in km between two lat/lon coordinates."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(max(0.0, a)), math.sqrt(max(0.0, 1.0 - a)))
    return R * c

def distance_to_bbox(lat, lon, bbox):
    """
    Computes shortest distance in km from point (lat, lon) to a rectangular bounding box.
    """
    clamped_lat = max(bbox['min_lat'], min(lat, bbox['max_lat']))
    clamped_lon = max(bbox['min_lon'], min(lon, bbox['max_lon']))
    return haversine_distance(lat, lon, clamped_lat, clamped_lon)

def extract_cyclone_center_coords(file_path):
    """
    Extracts cyclone center Lat/Lon from MOSDAC HDF5 metadata, or detects the
    coldest cloud-top brightness temperature minimum (cyclone eye core).
    """
    if not os.path.exists(file_path):
        return 15.4, 87.2  # Fallback default coordinates (Bay of Bengal)

    try:
        if not h5py.is_hdf5(file_path):
            return 15.4, 87.2

        with h5py.File(file_path, 'r') as f:
            # 1. Check metadata attributes for explicit cyclone center or bounding box center
            if 'IMG_TIR1' in f:
                tir1_raw = np.squeeze(f['IMG_TIR1'][:])
                
                # Check for explicit Latitude / Longitude datasets
                if 'Latitude' in f and 'Longitude' in f:
                    try:
                        lat_data = f['Latitude'][:] / 100.0
                        lon_data = f['Longitude'][:] / 100.0
                        
                        if lat_data.ndim == 1 and lon_data.ndim == 1:
                            lon_grid, lat_grid = np.meshgrid(lon_data, lat_data)
                        elif lat_data.shape == tir1_raw.shape:
                            lat_grid, lon_grid = lat_data, lon_data
                        else:
                            lat_grid, lon_grid = None, None

                        if lat_grid is not None and lon_grid is not None:
                            # Locate center of minimum raw count (coldest cloud top / eye wall)
                            clean_tir1 = np.where(tir1_raw <= 0, 9999, tir1_raw)
                            min_idx = np.argmin(clean_tir1)
                            y_min, x_min = np.unravel_index(min_idx, clean_tir1.shape)
                            
                            center_lat = float(lat_grid[y_min, x_min])
                            center_lon = float(lon_grid[y_min, x_min])
                            
                            # Validate non-NaN and within reasonable regional bounds
                            if 0.0 <= center_lat <= 40.0 and 40.0 <= center_lon <= 110.0:
                                return round(center_lat, 2), round(center_lon, 2)
                    except Exception as err:
                        logger.warning(f"Metadata coordinate extraction notice: {err}")

            # 2. Check for global attributes
            for attr in ['Center_Latitude', 'TARGET_LAT', 'SAT_LAT']:
                if attr in f.attrs:
                    return float(f.attrs[attr]), float(f.attrs.get('Center_Longitude', f.attrs.get('TARGET_LON', 87.2)))

    except Exception as e:
        logger.warning(f"Failed extracting HDF5 coords from {file_path}: {e}")

    return 15.4, 87.2

class GeographicRiskEvaluator:
    """
    Evaluates spatial risk levels across Indian coastal states based on cyclone position and intensity.
    """
    def __init__(self, states=COASTAL_STATES):
        self.states = states

    def evaluate_state_risks(self, lat, lon, wind_speed_kmh=185.0, pressure_hpa=948.0, t_number=5.5):
        """
        Computes regional risk scores, warning codes, wind attenuation, storm surge height,
        and evacuation directives for each coastal state.
        """
        results = []
        highest_severity_state = None
        max_vulnerability_score = -1.0

        for st in self.states:
            # 1. Spatial Proximity Calculation (Distance to state boundary & centroid)
            dist_to_border = distance_to_bbox(lat, lon, st['bbox'])
            dist_to_centroid = haversine_distance(lat, lon, st['centroid']['lat'], st['centroid']['lon'])
            effective_dist = min(dist_to_border, dist_to_centroid * 0.7)

            # 2. Local Wind Speed Attenuation Model (Exponential radial decay)
            decay_scale = 220.0  # Radial influence scale in km
            local_wind_kmh = max(15.0, wind_speed_kmh * math.exp(-effective_dist / decay_scale))

            # 3. Storm Surge Estimation (Meters) adjusted by bathymetric vulnerability factor
            base_surge = (local_wind_kmh / 45.0) ** 1.35
            local_surge_m = max(0.3, base_surge * st['vulnerability_factor'])

            # 4. Composite Risk Vulnerability Index (0 to 100)
            proximity_factor = max(0.0, (500.0 - effective_dist) / 500.0)
            intensity_factor = min(1.0, wind_speed_kmh / 220.0)
            
            raw_vulnerability = (proximity_factor * 60.0) + (intensity_factor * 30.0) + ((t_number / 7.0) * 10.0)
            vulnerability_score = round(max(5.0, min(99.0, raw_vulnerability * st['vulnerability_factor'])), 1)

            # 5. Warning Level Classification & Color Codes
            if vulnerability_score >= 65.0 or (effective_dist < 150.0 and wind_speed_kmh >= 110.0):
                alert_level = 'HIGH RISK (RED ALERT)'
                severity_code = 'HIGH'
                badge_color = 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                header_glow = 'shadow-rose-500/20 border-rose-500/30'
                evacuation_directive = 'Mandatory Immediate Evacuation of Low-lying & 5km Coastal Belt'
                action_urgency = 'CRITICAL RESCUE DISPATCH'
            elif vulnerability_score >= 38.0 or effective_dist < 350.0:
                alert_level = 'MODERATE RISK (AMBER ALERT)'
                severity_code = 'MODERATE'
                badge_color = 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                header_glow = 'shadow-amber-500/20 border-amber-500/30'
                evacuation_directive = 'Prepare Emergency Provisions & Standby Shelters'
                action_urgency = 'HIGH ALERT MONITORING'
            else:
                alert_level = 'SAFE / WATCH (GREEN ALERT)'
                severity_code = 'SAFE'
                badge_color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                header_glow = 'shadow-emerald-500/20 border-emerald-500/30'
                evacuation_directive = 'Normal Operations. Monitor Meteorological Advisories'
                action_urgency = 'NORMAL WATCH'

            state_eval = {
                'id': st['id'],
                'name': st['name'],
                'full_title': st['full_title'],
                'vulnerability_score': vulnerability_score,
                'alert_level': alert_level,
                'severity_code': severity_code,
                'badge_color': badge_color,
                'header_glow': header_glow,
                'distance_km': round(effective_dist, 1),
                'predicted_wind_kmh': round(local_wind_kmh, 1),
                'predicted_surge_m': round(local_surge_m, 1),
                'key_districts': st['key_districts'],
                'emergency_contact': st['emergency_contact'],
                'shelters_available': st['shelters_available'],
                'evacuation_directive': evacuation_directive,
                'action_urgency': action_urgency,
            }

            results.append(state_eval)

            if vulnerability_score > max_vulnerability_score:
                max_vulnerability_score = vulnerability_score
                highest_severity_state = state_eval

        # Sort states by highest vulnerability score first
        results.sort(key=lambda x: x['vulnerability_score'], reverse=True)

        return {
            'cyclone_center': {'lat': lat, 'lon': lon},
            'intensity_inputs': {
                'wind_speed_kmh': wind_speed_kmh,
                'pressure_hpa': pressure_hpa,
                't_number': t_number
            },
            'highest_risk_state': highest_severity_state,
            'state_evaluations': results
        }
