import math

# Coastal Cities Database (Latitude, Longitude, State/Country, Population/Infrastructure Rank)
COASTAL_CITIES = [
    {'name': 'Puri', 'lat': 19.8135, 'lon': 85.8312, 'state': 'Odisha', 'coastal_type': 'Direct Oceanfront'},
    {'name': 'Paradip', 'lat': 20.3164, 'lon': 86.6114, 'state': 'Odisha', 'coastal_type': 'Major Port & Industrial'},
    {'name': 'Balasore', 'lat': 21.4942, 'lon': 86.9317, 'state': 'Odisha', 'coastal_type': 'Northern Coastal Plain'},
    {'name': 'Gopalpur', 'lat': 19.2647, 'lon': 84.9144, 'state': 'Odisha', 'coastal_type': 'Southern Odisha Coast'},
    {'name': 'Digha', 'lat': 21.6266, 'lon': 87.5074, 'state': 'West Bengal', 'coastal_type': 'Coastal Tourism & Plain'},
    {'name': 'Kolkata (Sunderbans)', 'lat': 22.5726, 'lon': 88.3639, 'state': 'West Bengal', 'coastal_type': 'Deltaic Estuary'},
    {'name': 'Visakhapatnam', 'lat': 17.6868, 'lon': 83.2185, 'state': 'Andhra Pradesh', 'coastal_type': 'Deepwater Port & Hills'},
    {'name': 'Kakinada', 'lat': 16.9891, 'lon': 82.2475, 'state': 'Andhra Pradesh', 'coastal_type': 'Godavari Basin'},
    {'name': 'Chennai', 'lat': 13.0827, 'lon': 80.2707, 'state': 'Tamil Nadu', 'coastal_type': 'Coromandel Coast'},
    {'name': 'Chittagong', 'lat': 22.3569, 'lon': 91.7832, 'state': 'Bangladesh', 'coastal_type': 'Northeast Bay Estuary'},
]

# Historical Cyclones Climatological Database
HISTORICAL_CYCLONES = [
    {
        'id': 'AMPHAN_2020',
        'name': 'CYCLONE AMPHAN',
        'year': 2020,
        'basin': 'Bay of Bengal',
        'category': 'Super Cyclonic Storm (SuCS)',
        't_number': 7.0,
        'min_pressure_hpa': 920,
        'max_wind_kmh': 240,
        'surge_m': 4.5,
        'landfall_loc': 'Sunderbans (WB/BD)',
        'vector': [7.0, 920, 240, 4.5],
        'impact_summary': 'Category 5 Equivalent. Extensive coastal surge and wind damage across Sunderbans and Kolkata.'
    },
    {
        'id': 'FANI_2019',
        'name': 'CYCLONE FANI',
        'year': 2019,
        'basin': 'Bay of Bengal',
        'category': 'Extremely Severe Cyclonic Storm (ESCS)',
        't_number': 6.5,
        'min_pressure_hpa': 932,
        'max_wind_kmh': 215,
        'surge_m': 3.8,
        'landfall_loc': 'Puri, Odisha',
        'vector': [6.5, 932, 215, 3.8],
        'impact_summary': 'Direct hit on Puri coast. High wind damage with 1.2M citizens evacuated in record time.'
    },
    {
        'id': 'PHAILIN_2013',
        'name': 'CYCLONE PHAILIN',
        'year': 2013,
        'basin': 'Bay of Bengal',
        'category': 'Extremely Severe Cyclonic Storm (ESCS)',
        't_number': 6.0,
        'min_pressure_hpa': 940,
        'max_wind_kmh': 200,
        'surge_m': 3.5,
        'landfall_loc': 'Gopalpur, Odisha',
        'vector': [6.0, 940, 200, 3.5],
        'impact_summary': 'Massive evacuation of 1M+ coastal residents minimized casualties across southern Odisha.'
    },
    {
        'id': 'HUDHUD_2014',
        'name': 'CYCLONE HUDHUD',
        'year': 2014,
        'basin': 'Bay of Bengal',
        'category': 'Very Severe Cyclonic Storm (VSCS)',
        't_number': 5.5,
        'min_pressure_hpa': 950,
        'max_wind_kmh': 185,
        'surge_m': 2.8,
        'landfall_loc': 'Visakhapatnam, AP',
        'vector': [5.5, 950, 185, 2.8],
        'impact_summary': 'Direct hit on Vizag port & urban infrastructure with extreme gusting.'
    },
    {
        'id': 'BIPARJOY_2023',
        'name': 'CYCLONE BIPARJOY',
        'year': 2023,
        'basin': 'Arabian Sea',
        'category': 'Very Severe Cyclonic Storm (VSCS)',
        't_number': 5.0,
        'min_pressure_hpa': 966,
        'max_wind_kmh': 165,
        'surge_m': 2.5,
        'landfall_loc': 'Jakhau Port, Gujarat',
        'vector': [5.0, 966, 165, 2.5],
        'impact_summary': 'Long-duration Arabian Sea track leading to Jakhau landfall.'
    }
]

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculates great circle distance in km between two lat/lon points.
    """
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class CityImpactPredictor:
    """
    Evaluates geospatial proximity, landfall ETA, storm surge, and risk danger levels
    for coastal cities relative to a predicted cyclone track.
    """
    def __init__(self, cities=COASTAL_CITIES):
        self.cities = cities

    def predict_impact(self, current_lat, current_lon, wind_speed_kmh=175.0, storm_speed_kmh=18.0):
        """
        Computes distance, ETA, and risk classification for all coastal cities.
        """
        impact_results = []

        for city in self.cities:
            dist_km = haversine_distance(current_lat, current_lon, city['lat'], city['lon'])
            
            # Estimated Time of Arrival (Hours) assuming direct approach vector
            eta_hours = round(dist_km / max(5.0, storm_speed_kmh), 1)

            # Wind speed attenuation with distance (Distance decay model)
            local_wind_kmh = max(20.0, wind_speed_kmh * math.exp(-dist_km / 180.0))

            # Estimated Storm Surge Height (Meters)
            local_surge_m = max(0.5, (local_wind_kmh / 45.0) ** 1.3)

            # Danger Score (0 to 100)
            raw_score = (local_wind_kmh * 0.4) + (local_surge_m * 10.0) - (dist_km * 0.08)
            danger_score = round(max(5.0, min(99.0, raw_score)), 1)

            # Alert Level Classification
            if danger_score >= 70 or dist_km < 120:
                alert_level = 'Red Alert (Extreme Danger)'
                severity_code = 'RED'
                action_required = 'Mandatory Evacuation / Shelter In Place'
            elif danger_score >= 45 or dist_km < 250:
                alert_level = 'Amber Alert (High Risk)'
                severity_code = 'AMBER'
                action_required = 'Prepare Emergency Supplies & Coastal Warning'
            else:
                alert_level = 'Yellow Alert (Moderate Watch)'
                severity_code = 'YELLOW'
                action_required = 'Monitor Meteorological Bulletins'

            impact_results.append({
                'city': city['name'],
                'state': city['state'],
                'lat': city['lat'],
                'lon': city['lon'],
                'coastal_type': city['coastal_type'],
                'distance_km': round(dist_km, 1),
                'eta_hours': eta_hours,
                'predicted_wind_kmh': round(local_wind_kmh, 1),
                'predicted_surge_m': round(local_surge_m, 1),
                'danger_score': danger_score,
                'alert_level': alert_level,
                'severity_code': severity_code,
                'action_required': action_required
            })

        # Sort cities by highest risk score
        impact_results.sort(key=lambda x: x['danger_score'], reverse=True)
        return impact_results

class HistoricalAnalogueMatcher:
    """
    Computes Cosine & Euclidean similarity between current cyclone telemetry
    and historical climatological benchmarks.
    """
    def __init__(self, historical_db=HISTORICAL_CYCLONES):
        self.db = historical_db

    def find_analogue_matches(self, t_number=5.5, min_pressure_hpa=955, max_wind_kmh=175, surge_m=3.0):
        target_vec = [t_number, min_pressure_hpa, max_wind_kmh, surge_m]
        results = []

        for cyc in self.db:
            v = cyc['vector']
            # Normalized Cosine Similarity Calculation
            dot_product = sum(t * h for t, h in zip(target_vec, v))
            norm_t = math.sqrt(sum(t ** 2 for t in target_vec))
            norm_h = math.sqrt(sum(h ** 2 for h in v))

            if norm_t > 0 and norm_h > 0:
                cosine_sim = dot_product / (norm_t * norm_h)
            else:
                cosine_sim = 0.0

            # Scale to 70% - 99% human-readable match percentage
            similarity_pct = round(max(60.0, min(98.5, cosine_sim * 98.5)), 1)

            results.append({
                'id': cyc['id'],
                'name': cyc['name'],
                'year': cyc['year'],
                'basin': cyc['basin'],
                'category': cyc['category'],
                't_number': cyc['t_number'],
                'min_pressure_hpa': cyc['min_pressure_hpa'],
                'max_wind_kmh': cyc['max_wind_kmh'],
                'surge_m': cyc['surge_m'],
                'landfall_loc': cyc['landfall_loc'],
                'similarity_pct': similarity_pct,
                'impact_summary': cyc['impact_summary']
            })

        results.sort(key=lambda x: x['similarity_pct'], reverse=True)
        return results
