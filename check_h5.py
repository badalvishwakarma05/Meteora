import os
import h5py
import numpy as np

data_dir = "./data"
files = sorted([f for f in os.listdir(data_dir) if f.endswith('.h5')])

print(f"==================================================")
print(f"  FOUND {len(files)} HDF5 DATASET FILES IN ./data/")
print(f"==================================================")

for idx, f in enumerate(files, 1):
    path = os.path.join(data_dir, f)
    with h5py.File(path, 'r') as hf:
        tir1 = np.squeeze(hf['IMG_TIR1'][:])
        lat = hf['Latitude'][:] / 100.0
        lon = hf['Longitude'][:] / 100.0
        print(f"\n[{idx}] File: {f}")
        print(f"    Grid Dimensions : {tir1.shape}")
        print(f"    Lat Bounds      : {np.min(lat):.2f}°N to {np.max(lat):.2f}°N")
        print(f"    Lon Bounds      : {np.min(lon):.2f}°E to {np.max(lon):.2f}°E")
        print(f"    TIR1 Min Count  : {np.min(tir1)}")
        print(f"    TIR1 Max Count  : {np.max(tir1)}")
        print(f"    TIR1 Mean Count : {np.mean(tir1):.2f}")
        print(f"    TIR1 Std Dev    : {np.std(tir1):.2f}")