import requests
import pandas as pd
import time
import os

# Target cyclones with approximate coordinates (Lat, Lon) and Dates (3-4 days before landfall)
cyclones = {
    "Michaung": {"lat": 13.08, "lon": 80.27, "start": "2023-11-29", "end": "2023-12-06"}, 
    "Biparjoy": {"lat": 23.23, "lon": 68.56, "start": "2023-06-06", "end": "2023-06-16"}, 
    "Mocha": {"lat": 20.14, "lon": 92.87, "start": "2023-05-09", "end": "2023-05-15"}     
}

def fetch_weather_data():
    all_data = []
    print("Starting historical weather data extraction...")
    
    for name, info in cyclones.items():
        print(f"Fetching precursors for Cyclone {name}...")
        url = "https://archive-api.open-meteo.com/v1/archive"
        params = {
            "latitude": info["lat"],
            "longitude": info["lon"],
            "start_date": info["start"],
            "end_date": info["end"],
            "hourly": "surface_pressure,wind_speed_10m,temperature_2m,relative_humidity_2m",
            "timezone": "auto"
        }
        
        try:
            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                df = pd.DataFrame(data["hourly"])
                
                # Adding our custom tags for dataset fusion later
                df["cyclone_name"] = name
                df["latitude"] = info["lat"]
                df["longitude"] = info["lon"]
                all_data.append(df)
            else:
                print(f"Failed for {name}: API Error {response.status_code}")
        except Exception as e:
            print(f"Error fetching {name}: {e}")
            
        time.sleep(1) # 1 second delay to avoid hitting API rate limits
        
    if all_data:
        # Combine all cyclones into one master dataset
        final_df = pd.concat(all_data, ignore_index=True)
        
        # Save to the data folder alongside your .h5 files
        save_path = os.path.join("data", "cyclone_weather_data.csv")
        final_df.to_csv(save_path, index=False)
        print(f"Success! Master dataset saved to: {save_path}")
        print(final_df.head())

if __name__ == "__main__":
    # Ensure data directory exists
    os.makedirs("data", exist_ok=True)
    fetch_weather_data()
    