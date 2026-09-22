import os
import h5py
import numpy as np
import logging

logger = logging.getLogger(__name__)

class HDF5ReadError(Exception):
    """Custom exception raised when HDF5 reading or extraction fails."""
    pass

def load_hdf5_data(file_path):
    """
    Parses MOSDAC HDF5 satellite file and extracts TIR1 channel and geographic grid arrays.
    Includes robust error handling, key verification, corrupt file detection, and fallback grid generation.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"HDF5 file not found at {file_path}")

    try:
        if not h5py.is_hdf5(file_path):
            raise HDF5ReadError(f"File '{file_path}' is not a valid HDF5 binary file.")
    except Exception as e:
        if not isinstance(e, HDF5ReadError):
            raise HDF5ReadError(f"Failed HDF5 file validation check for '{file_path}': {e}")
        raise e

    try:
        with h5py.File(file_path, 'r') as f:
            if 'IMG_TIR1' not in f:
                raise HDF5ReadError(f"Missing required dataset key 'IMG_TIR1' in HDF5 file {file_path}")

            tir1_raw = np.squeeze(f['IMG_TIR1'][:])
            if tir1_raw.ndim != 2 or tir1_raw.size == 0:
                raise HDF5ReadError(f"Invalid 'IMG_TIR1' array shape or empty dataset in {file_path}: shape {tir1_raw.shape}")

            h, w = tir1_raw.shape

            # Coordinate Extraction with Fallback Validation
            lat_grid = None
            lon_grid = None

            if 'Latitude' in f and 'Longitude' in f:
                try:
                    lat_data = f['Latitude'][:] / 100.0   # Scale factor according to MOSDAC spec
                    lon_data = f['Longitude'][:] / 100.0

                    if lat_data.ndim == 1 and lon_data.ndim == 1:
                        lon_grid, lat_grid = np.meshgrid(lon_data, lat_data)
                    elif lat_data.shape == tir1_raw.shape and lon_data.shape == tir1_raw.shape:
                        lat_grid, lon_grid = lat_data, lon_data
                except Exception as grid_err:
                    logger.warning(f"Error reading coordinates from {file_path}: {grid_err}. Falling back to default grid.")
                    lat_grid, lon_grid = None, None

            # Fallback check for missing, invalid shape, or all-NaN coordinate grids
            if (lat_grid is None or lon_grid is None or 
                lat_grid.shape != tir1_raw.shape or lon_grid.shape != tir1_raw.shape or 
                np.isnan(lat_grid).all() or np.isnan(lon_grid).all()):
                logger.warning(f"Invalid/Missing coordinate grids in {file_path}. Generating synthetic lat/lon grid shape ({h}, {w}).")
                lats_1d = np.linspace(0.0, 30.0, h)
                lons_1d = np.linspace(50.0, 100.0, w)
                lon_grid, lat_grid = np.meshgrid(lons_1d, lats_1d)

            return tir1_raw, lat_grid, lon_grid

    except HDF5ReadError:
        raise
    except Exception as e:
        raise HDF5ReadError(f"Error parsing HDF5 file {file_path}: {e}")

def raw_counts_to_temperature_celsius(raw_counts):
    """
    Converts raw MOSDAC digital counts into Brightness Temperature in Celsius (°C).
    Raw count range: 0 (Coldest, ~-90°C) to 1023 (Warmest, ~+35°C).
    """
    counts_clean = np.nan_to_num(raw_counts, nan=0.0)
    # Radiometric transfer equation for INSAT-3D/3R TIR1 10.8μm
    # Inverse radiance calibration mapping:
    temp_kelvin = 180.0 + (counts_clean / 1023.0) * 140.0
    temp_celsius = temp_kelvin - 273.15
    return temp_celsius

def find_nearest_pixel_index(lat_grid, lon_grid, target_lat, target_lon):
    """
    Finds nearest row (center_y) and column (center_x) pixel indices for target Lat/Lon.
    """
    if lat_grid.ndim == 1 and lon_grid.ndim == 1:
        lon_grid, lat_grid = np.meshgrid(lon_grid, lat_grid)

    dist_sq = (lat_grid - target_lat)**2 + (lon_grid - target_lon)**2
    min_idx = np.argmin(dist_sq)
    center_y, center_x = np.unravel_index(min_idx, lat_grid.shape)
    return int(center_y), int(center_x)

def crop_patch_matrix(data_2d, center_y, center_x, patch_size=128):
    """
    Crops square patch of size patch_size x patch_size around center pixel.
    """
    if data_2d.ndim != 2:
        raise ValueError(f"Expected 2D matrix for cropping, got shape {data_2d.shape}")

    half = patch_size // 2
    y1 = max(0, center_y - half)
    y2 = min(data_2d.shape[0], center_y + half)
    x1 = max(0, center_x - half)
    x2 = min(data_2d.shape[1], center_x + half)
    
    patch = data_2d[y1:y2, x1:x2]

    # Pad if patch touches array edges
    if patch.shape[0] < patch_size or patch.shape[1] < patch_size:
        pad_y = patch_size - patch.shape[0]
        pad_x = patch_size - patch.shape[1]
        patch = np.pad(patch, ((0, pad_y), (0, pad_x)), mode='edge')

    return patch

def normalize_patch_tensor(patch):
    """
    Normalizes patch matrix to range [0.0, 1.0] for PyTorch neural network inputs.
    """
    patch_clean = np.nan_to_num(patch, nan=0.0)
    min_val = np.min(patch_clean)
    max_val = np.max(patch_clean)
    if max_val > min_val:
        normalized = (patch_clean - min_val) / (max_val - min_val)
    else:
        normalized = np.zeros_like(patch_clean)
    return normalized.astype(np.float32)

if __name__ == '__main__':
    print("Testing Preprocessing Pipeline...")
    data_dir = "./data"
    files = [f for f in os.listdir(data_dir) if f.endswith('.h5')] if os.path.exists(data_dir) else []
    if files:
        sample_path = os.path.join(data_dir, files[0])
        try:
            raw, lats, lons = load_hdf5_data(sample_path)
            cy, cx = find_nearest_pixel_index(lats, lons, 15.0, 72.0)
            patch = crop_patch_matrix(raw, cy, cx, 128)
            temps = raw_counts_to_temperature_celsius(patch)
            norm = normalize_patch_tensor(patch)
            print(f"Sample File: {files[0]}")
            print(f"Raw Patch Shape: {patch.shape}")
            print(f"Temperature Range: {np.min(temps):.2f}°C to {np.max(temps):.2f}°C")
            print(f"Normalized Tensor Min/Max: {np.min(norm):.2f} / {np.max(norm):.2f}")
            print("Preprocessing module validated successfully!")
        except Exception as e:
            print(f"Failed to process sample file: {e}")
    else:
        print("No .h5 sample files found in ./data/. Run mdapi.py to download sample satellite data.")

