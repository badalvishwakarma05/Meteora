import os
import h5py
import numpy as np

def extract_cyclone_patch(file_path, target_lat, target_lon, patch_size=128):
    with h5py.File(file_path, 'r') as f:
        # Datasets load kar rahe hain
        tir1_2d = np.squeeze(f['IMG_TIR1'][:])
        lat_grid = f['Latitude'][:] / 100.0   # MOSDAC scale factor ke mutabiq adjust
        lon_grid = f['Longitude'][:] / 100.0
        
        # Target lat/lon ke sabse kareeb ka pixel index dhoondhna
        dist_sq = (lat_grid - target_lat)**2 + (lon_grid - target_lon)**2
        min_idx = np.argmin(dist_sq)
        center_y, center_x = np.unravel_index(min_idx, lat_grid.shape)
        
        print(f"Target Center Found at Pixel Y: {center_y}, X: {center_x}")
        
        # Patch boundaries set karna (with edge checking)
        half = patch_size // 2
        y1 = max(0, center_y - half)
        y2 = min(tir1_2d.shape[0], center_y + half)
        x1 = max(0, center_x - half)
        x2 = min(tir1_2d.shape[1], center_x + half)
        
        # Patch extract kar rahe hain
        patch = tir1_2d[y1:y2, x1:x2]
        return patch

# Test run
data_dir = "./data"
files = [f for f in os.listdir(data_dir) if f.endswith('.h5')]

if files:
    file_path = os.path.join(data_dir, files[0])
    
    # Example: Arabian Sea / Bay of Bengal ke aas-paas ka ek dummy coordinate
    sample_lat = 15.0
    sample_lon = 72.0
    
    print(f"Extracting patch around Lat: {sample_lat}, Lon: {sample_lon}...")
    patch = extract_cyclone_patch(file_path, sample_lat, sample_lon)
    print("Extracted Patch Shape:", patch.shape)
else:
    print("Koi `.h5` file nahi mili!")