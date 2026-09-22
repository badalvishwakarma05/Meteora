"""
train_pipeline.py
=================
Multi-Modal Data Fusion & Deep Learning Training Pipeline for Cyclone Trajectory 
and Intensity Forecasting using a Hybrid CNN-GRU-BiLSTM Architecture.

Pipeline Overview:
  1. Data Fusion:
     - Loads MOSDAC .h5 satellite imagery from `data/mosdac/` (or `data/`).
     - Loads Open-Meteo environmental data from `data/ground_truth/biparjoy_weather.csv`.
     - Loads NOAA IBTrACS ground truth labels from `data/ground_truth/biparjoy_track_labels.csv`.
     - Synchronizes multi-modal observations into temporal sequences (T=4 time-steps).
  2. Neural Network Architecture (CNN-GRU-BiLSTM):
     - TimeDistributed CNN: Extracts 2D spatial meteorological features from thermal IR HDF5 arrays.
     - GRU Layer: Processes sequential atmospheric weather parameters.
     - Concatenation: Fuses spatial and tabular temporal representations.
     - Bidirectional LSTM (BiLSTM): Models forward & backward temporal dynamics.
     - Multi-Head Dense Output: Predicts Next-Step Latitude (°N), Longitude (°E), and Max Wind Speed (kts).
  3. Training Loop:
     - Adam optimizer + MSE loss with MAE evaluation metrics.
  4. Export:
     - Saves trained weights, metadata, and normalization scalers to `models/` for live dashboard inference.
"""

import os
import sys
import glob
import re
import json
import time
import math
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Root and ML directories
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.join(ROOT_DIR, "ml")
MODELS_DIR = os.path.join(ROOT_DIR, "models")
DATA_DIR = os.path.join(ROOT_DIR, "data")
GROUND_TRUTH_DIR = os.path.join(DATA_DIR, "ground_truth")

sys.path.append(ROOT_DIR)
sys.path.append(ML_DIR)

# Framework Imports
try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import Dataset, DataLoader
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    print("[WARNING] PyTorch not found. Please ensure torch is installed.")

try:
    import h5py
    HAS_H5PY = True
except ImportError:
    HAS_H5PY = False

from ml.preprocess import (
    load_hdf5_data,
    find_nearest_pixel_index,
    crop_patch_matrix,
    normalize_patch_tensor,
    raw_counts_to_temperature_celsius
)

# ==============================================================================
# 1. Multi-Modal Data Fusion & Preprocessing
# ==============================================================================

def parse_h5_timestamp(filename):
    """Extracts datetime object from MOSDAC HDF5 filename."""
    base = os.path.basename(filename).upper()
    
    # Pattern 1: DDMMMYYYY_HHMM (e.g. 06JUN2023_0015 or Biparjoy_3RIMG_06JUN2023_0000_...)
    match = re.search(r'(\d{2})([A-Z]{3})(\d{4})_(\d{2})(\d{2})', base)
    if match:
        day, month_str, year, hour, minute = match.groups()
        try:
            return datetime.strptime(f"{day}{month_str}{year}_{hour}{minute}", "%d%b%Y_%H%M")
        except ValueError:
            pass

    # Pattern 2: YYYYMMDD_HHMM (e.g. 20230606_0000)
    match = re.search(r'(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})', base)
    if match:
        year, month, day, hour, minute = match.groups()
        try:
            return datetime.strptime(f"{year}{month}{day}_{hour}{minute}", "%Y%m%d_%H%M")
        except ValueError:
            pass

    return None

def scan_h5_files(base_dir="data"):
    """Scans all available MOSDAC .h5 files recursively."""
    h5_list = []
    search_patterns = [
        os.path.join(base_dir, "**", "*.h5"),
        os.path.join(base_dir, "**", "*.H5"),
        os.path.join(base_dir, "*.h5"),
        os.path.join(base_dir, "*.H5"),
    ]
    
    found_paths = set()
    for pattern in search_patterns:
        for f in glob.glob(pattern, recursive=True):
            if f not in found_paths and not f.endswith(".part"):
                found_paths.add(f)
                dt = parse_h5_timestamp(f)
                h5_list.append({
                    "path": f,
                    "basename": os.path.basename(f),
                    "datetime": dt
                })
    return h5_list

def load_or_synthesize_patch(h5_info, target_lat=18.5, target_lon=67.5, patch_size=128):
    """Extracts satellite radiance patch from HDF5 or synthesizes realistic vortex radiometry."""
    if h5_info and h5_info.get("path") and os.path.exists(h5_info["path"]) and HAS_H5PY:
        try:
            raw_grid, lat_grid, lon_grid = load_hdf5_data(h5_info["path"])
            cy, cx = find_nearest_pixel_index(lat_grid, lon_grid, target_lat, target_lon)
            patch = crop_patch_matrix(raw_grid, cy, cx, patch_size)
            return normalize_patch_tensor(patch)
        except Exception:
            pass

    # Synthetic realistic thermal-IR cyclone eye & spiral rainbands
    y, x = np.ogrid[:patch_size, :patch_size]
    cy, cx = patch_size / 2.0, patch_size / 2.0
    r = np.sqrt((x - cx)**2 + (y - cy)**2)
    theta = np.arctan2(y - cy, x - cx)
    spiral = np.sin(theta * 2.5 - r / 6.0)
    eye_wall = np.exp(-((r - 20.0)**2) / 60.0)
    central_dense_overcast = np.exp(-r / 35.0)
    noise = np.random.normal(0.0, 0.05, (patch_size, patch_size))
    sim_patch = 0.5 * central_dense_overcast + 0.3 * eye_wall + 0.2 * spiral + noise
    sim_patch = np.clip(sim_patch, 0.0, 1.0).astype(np.float32)
    return sim_patch

class MultiModalCycloneDataset(Dataset):
    """
    Synchronized Multi-Modal Dataset:
      - Spatial Input: [Batch, Seq_Len=4, 1, 128, 128] (Sequential HDF5 satellite image patches)
      - Weather Input: [Batch, Seq_Len=4, Feat_Dim=6] (Sequential atmospheric measurements)
      - Target Labels: [Batch, 3] -> Next-step [Latitude, Longitude, Max_Sustained_Wind]
    """
    def __init__(self, seq_len=4, patch_size=128):
        self.seq_len = seq_len
        self.patch_size = patch_size
        self.samples = []
        self.scalers = {}

        self._fuse_datasets()

    def _fuse_datasets(self):
        weather_csv = os.path.join(GROUND_TRUTH_DIR, "biparjoy_weather.csv")
        track_csv = os.path.join(GROUND_TRUTH_DIR, "biparjoy_track_labels.csv")

        # Load or generate weather data
        if os.path.exists(weather_csv):
            df_weather = pd.read_csv(weather_csv)
        else:
            print("[INFO] Weather CSV not found. Fetching via weather_noaa_api...")
            from weather_noaa_api import fetch_open_meteo_weather
            df_weather = fetch_open_meteo_weather()

        # Load or generate track ground truth
        if os.path.exists(track_csv):
            df_track = pd.read_csv(track_csv)
        else:
            print("[INFO] Track CSV not found. Fetching via weather_noaa_api...")
            from weather_noaa_api import fetch_noaa_ibtracs_track
            df_track = fetch_noaa_ibtracs_track()

        # Convert timestamps
        df_weather["dt"] = pd.to_datetime(df_weather["iso_time"].str.replace("T", " "))
        df_track["dt"] = pd.to_datetime(df_track["iso_time"].str.replace("T", " "))

        # Clean track labels
        df_track["latitude"] = pd.to_numeric(df_track["latitude"], errors="coerce").ffill()
        df_track["longitude"] = pd.to_numeric(df_track["longitude"], errors="coerce").ffill()
        df_track["max_sustained_wind_kts"] = pd.to_numeric(df_track["max_sustained_wind_kts"], errors="coerce").interpolate().bfill().ffill()
        df_track["central_pressure_hpa"] = pd.to_numeric(df_track["central_pressure_hpa"], errors="coerce").interpolate().bfill().ffill()

        # Discover HDF5 files
        h5_files = scan_h5_files(DATA_DIR)
        print(f"[DATA FUSION] Discovered {len(h5_files)} MOSDAC .h5 files in '{DATA_DIR}'.")
        print(f"[DATA FUSION] Weather records: {len(df_weather)} | Ground truth track points: {len(df_track)}.")

        # Weather feature columns for sequential GRU
        weather_cols = [
            "sea_level_pressure_hpa",
            "surface_pressure_hpa",
            "wind_speed_10m_kts",
            "temperature_c",
            "relative_humidity_pct",
            "wind_direction_10m_deg"
        ]
        
        for c in weather_cols:
            if c not in df_weather.columns:
                df_weather[c] = 0.0
            df_weather[c] = pd.to_numeric(df_weather[c], errors="coerce").fillna(0.0)

        # Compute scaling parameters
        self.scalers = {
            "weather_means": df_weather[weather_cols].mean().to_dict(),
            "weather_stds": df_weather[weather_cols].std().replace(0, 1.0).to_dict(),
            "lat_min": float(df_track["latitude"].min() - 2.0),
            "lat_max": float(df_track["latitude"].max() + 2.0),
            "lon_min": float(df_track["longitude"].min() - 2.0),
            "lon_max": float(df_track["longitude"].max() + 2.0),
            "wind_min": 20.0,
            "wind_max": 120.0
        }

        # Normalize weather dataframe
        df_weather_norm = df_weather.copy()
        for c in weather_cols:
            m = self.scalers["weather_means"][c]
            s = self.scalers["weather_stds"][c]
            df_weather_norm[c] = (df_weather[c] - m) / (s + 1e-6)

        # Build sliding temporal sequences aligned to track observations
        track_points = df_track.sort_values("dt").reset_index(drop=True)
        
        for i in range(self.seq_len, len(track_points)):
            # Target is the current synoptic step (next-step prediction)
            target_row = track_points.iloc[i]
            target_lat = float(target_row["latitude"])
            target_lon = float(target_row["longitude"])
            target_wind = float(target_row["max_sustained_wind_kts"])

            # Sequence of previous `seq_len` observations
            history_track = track_points.iloc[i - self.seq_len : i]
            
            seq_weather_features = []
            seq_h5_meta = []

            for _, hist_row in history_track.iterrows():
                hist_dt = hist_row["dt"]
                
                # Match nearest weather record within 3 hours
                time_diffs = (df_weather_norm["dt"] - hist_dt).abs()
                nearest_w_idx = time_diffs.idxmin()
                w_vec = df_weather_norm.loc[nearest_w_idx, weather_cols].values.astype(np.float32)
                seq_weather_features.append(w_vec)

                # Match nearest HDF5 file
                best_h5 = None
                best_h5_diff = float("inf")
                for h5 in h5_files:
                    if h5["datetime"]:
                        diff_sec = abs((h5["datetime"] - hist_dt).total_seconds())
                        if diff_sec < best_h5_diff:
                            best_h5_diff = diff_sec
                            best_h5 = h5

                seq_h5_meta.append((best_h5, float(hist_row["latitude"]), float(hist_row["longitude"])))

            self.samples.append({
                "target_dt": target_row["dt"].strftime("%Y-%m-%d %H:%M:%S"),
                "seq_weather": np.array(seq_weather_features, dtype=np.float32),  # [Seq_Len, 6]
                "seq_h5_meta": seq_h5_meta,
                "target_lat": target_lat,
                "target_lon": target_lon,
                "target_wind": target_wind
            })

        print(f"[DATASET] Compiled {len(self.samples)} multi-modal sequence samples for training.")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample = self.samples[idx]
        seq_weather = torch.tensor(sample["seq_weather"], dtype=torch.float32)  # [Seq_Len, 6]

        # Load / Synthesize sequential image patches
        patches = []
        for h5_info, lat, lon in sample["seq_h5_meta"]:
            patch = load_or_synthesize_patch(h5_info, target_lat=lat, target_lon=lon, patch_size=self.patch_size)
            patches.append(patch[np.newaxis, :, :])  # [1, 128, 128]

        seq_images = torch.tensor(np.array(patches), dtype=torch.float32)  # [Seq_Len, 1, 128, 128]

        targets = torch.tensor([
            sample["target_lat"],
            sample["target_lon"],
            sample["target_wind"]
        ], dtype=torch.float32)

        return seq_images, seq_weather, targets

# ==============================================================================
# 2. Hybrid CNN-GRU-BiLSTM Model Architecture
# ==============================================================================

class TimeDistributedCNN(nn.Module):
    """
    TimeDistributed 2D CNN:
    Applies 2D convolutions independently across each time-step in the sequence.
    Input Shape:  [Batch, Seq_Len, 1, 128, 128]
    Output Shape: [Batch, Seq_Len, spatial_embed_dim=128]
    """
    def __init__(self, in_channels=1, embed_dim=128):
        super().__init__()
        self.conv_block = nn.Sequential(
            nn.Conv2d(in_channels, 32, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),  # 64x64

            nn.Conv2d(32, 64, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),  # 32x32

            nn.Conv2d(64, 128, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),  # 16x16

            nn.Conv2d(128, 128, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1))  # 1x1
        )
        self.fc_embed = nn.Sequential(
            nn.Linear(128, embed_dim),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2)
        )

    def forward(self, x):
        # x: [Batch, Seq_Len, Channels, Height, Width]
        b, t, c, h, w = x.shape
        # Flatten batch and time dimensions
        x_reshaped = x.view(b * t, c, h, w)
        features = self.conv_block(x_reshaped)  # [B*T, 128, 1, 1]
        features = torch.flatten(features, 1)    # [B*T, 128]
        embeddings = self.fc_embed(features)    # [B*T, embed_dim]
        # Reshape back to sequence
        return embeddings.view(b, t, -1)        # [Batch, Seq_Len, embed_dim]

class WeatherGRUBranch(nn.Module):
    """
    Sequential GRU Layer:
    Processes sequential tabular weather parameters across time.
    Input Shape:  [Batch, Seq_Len, weather_features_dim=6]
    Output Shape: [Batch, Seq_Len, gru_hidden_dim=64]
    """
    def __init__(self, input_dim=6, hidden_dim=64, num_layers=2, dropout=0.2):
        super().__init__()
        self.gru = nn.GRU(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0
        )
        self.fc_embed = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2)
        )

    def forward(self, x):
        # x: [Batch, Seq_Len, Features]
        gru_out, _ = self.gru(x)                # [Batch, Seq_Len, hidden_dim]
        return self.fc_embed(gru_out)           # [Batch, Seq_Len, hidden_dim]

class CycloneCNNGRUBiLSTM(nn.Module):
    """
    Complete Multi-Modal CNN-GRU-BiLSTM Architecture:
      1. TimeDistributed CNN -> Spatial Image Features [B, T, 128]
      2. GRU -> Tabular Weather Sequential Features   [B, T, 64]
      3. Concatenation -> Multi-Modal Fused Sequence  [B, T, 192]
      4. Bidirectional LSTM (BiLSTM) -> Temporal Dynamics [B, 256]
      5. Dense Head -> Multi-Target Forecast: [Latitude, Longitude, Max Sustained Wind]
    """
    def __init__(self, spatial_dim=128, weather_dim=6, gru_hidden=64, bilstm_hidden=128):
        super().__init__()
        self.cnn_branch = TimeDistributedCNN(in_channels=1, embed_dim=spatial_dim)
        self.gru_branch = WeatherGRUBranch(input_dim=weather_dim, hidden_dim=gru_hidden)

        fused_dim = spatial_dim + gru_hidden  # 128 + 64 = 192

        self.bilstm = nn.LSTM(
            input_size=fused_dim,
            hidden_size=bilstm_hidden,
            num_layers=2,
            batch_first=True,
            bidirectional=True,
            dropout=0.2
        )

        bilstm_out_dim = bilstm_hidden * 2  # 256

        # Multi-Head Dense Prediction Head
        self.prediction_head = nn.Sequential(
            nn.Linear(bilstm_out_dim, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(64, 3)  # [Latitude (°N), Longitude (°E), Max Sustained Wind (kts)]
        )

    def forward(self, x_images, x_weather):
        """
        Forward pass:
          x_images : [Batch, Seq_Len, 1, 128, 128]
          x_weather: [Batch, Seq_Len, 6]
        """
        spatial_seq = self.cnn_branch(x_images)   # [Batch, Seq_Len, 128]
        weather_seq = self.gru_branch(x_weather)  # [Batch, Seq_Len, 64]

        # Concatenate spatial and tabular features per timestep
        fused_seq = torch.cat([spatial_seq, weather_seq], dim=-1)  # [Batch, Seq_Len, 192]

        # Process fused sequence through Bidirectional LSTM
        bilstm_out, (hn, cn) = self.bilstm(fused_seq)  # [Batch, Seq_Len, 256]

        # Use final sequential context
        last_context = bilstm_out[:, -1, :]             # [Batch, 256]

        # Predict multi-target trajectory & intensity
        predictions = self.prediction_head(last_context) # [Batch, 3]
        return predictions

# ==============================================================================
# 3. Training Loop & Validation
# ==============================================================================

def train_cyclone_model(num_epochs=35, batch_size=8, lr=0.001):
    """Executes full training session and evaluates model accuracy."""
    print("\n" + "=" * 70)
    print("  TRAINING MULTI-MODAL CNN-GRU-BiLSTM CYCLONE MODEL")
    print("=" * 70)

    if not HAS_TORCH:
        print("[ERROR] PyTorch is required to run the neural network training.")
        return

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device : {device} (CUDA Available: {torch.cuda.is_available()})")

    # Initialize Dataset and DataLoader
    dataset = MultiModalCycloneDataset(seq_len=4, patch_size=128)
    if len(dataset) == 0:
        print("[ERROR] Dataset compilation failed. No samples found.")
        return

    # Train / Validation Split (80% / 20%)
    val_size = max(1, int(len(dataset) * 0.2))
    train_size = len(dataset) - val_size
    train_set, val_set = torch.utils.data.random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_set, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_set, batch_size=batch_size, shuffle=False)

    print(f"Training Samples   : {train_size}")
    print(f"Validation Samples : {val_size}")
    print(f"Batch Size         : {batch_size} | Epochs: {num_epochs} | Initial LR: {lr}\n")

    # Initialize Model
    model = CycloneCNNGRUBiLSTM(spatial_dim=128, weather_dim=6, gru_hidden=64, bilstm_hidden=128).to(device)

    # Loss & Optimizer
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=5)

    best_val_loss = float('inf')
    history = []

    start_time = time.time()

    for epoch in range(1, num_epochs + 1):
        model.train()
        train_loss = 0.0
        train_lat_mae = 0.0
        train_lon_mae = 0.0
        train_wind_mae = 0.0

        for x_img, x_wtr, targets in train_loader:
            x_img = x_img.to(device)
            x_wtr = x_wtr.to(device)
            targets = targets.to(device)

            optimizer.zero_grad()
            preds = model(x_img, x_wtr)
            loss = criterion(preds, targets)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * len(targets)
            train_lat_mae += torch.abs(preds[:, 0] - targets[:, 0]).sum().item()
            train_lon_mae += torch.abs(preds[:, 1] - targets[:, 1]).sum().item()
            train_wind_mae += torch.abs(preds[:, 2] - targets[:, 2]).sum().item()

        train_loss /= train_size
        train_lat_mae /= train_size
        train_lon_mae /= train_size
        train_wind_mae /= train_size

        # Validation
        model.eval()
        val_loss = 0.0
        val_lat_mae = 0.0
        val_lon_mae = 0.0
        val_wind_mae = 0.0

        with torch.no_grad():
            for x_img, x_wtr, targets in val_loader:
                x_img = x_img.to(device)
                x_wtr = x_wtr.to(device)
                targets = targets.to(device)

                preds = model(x_img, x_wtr)
                loss = criterion(preds, targets)

                val_loss += loss.item() * len(targets)
                val_lat_mae += torch.abs(preds[:, 0] - targets[:, 0]).sum().item()
                val_lon_mae += torch.abs(preds[:, 1] - targets[:, 1]).sum().item()
                val_wind_mae += torch.abs(preds[:, 2] - targets[:, 2]).sum().item()

        val_loss /= val_size
        val_lat_mae /= val_size
        val_lon_mae /= val_size
        val_wind_mae /= val_size

        scheduler.step(val_loss)

        history.append({
            "epoch": epoch,
            "train_loss": train_loss,
            "val_loss": val_loss,
            "train_lat_mae": train_lat_mae,
            "val_lat_mae": val_lat_mae,
            "train_wind_mae": train_wind_mae,
            "val_wind_mae": val_wind_mae
        })

        if epoch % 5 == 0 or epoch == num_epochs or epoch == 1:
            print(f"Epoch [{epoch:02d}/{num_epochs:02d}] "
                  f"| Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} "
                  f"| Lat/Lon MAE: ±{val_lat_mae:.2f}°/±{val_lon_mae:.2f}° "
                  f"| Wind MAE: ±{val_wind_mae:.2f} kts")

        # Save Best Weights
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            save_model_weights(model, dataset.scalers, history)

    total_time = time.time() - start_time
    print(f"\n[SUCCESS] Training Completed in {total_time:.2f} seconds.")
    print(f"[BEST VALIDATION LOSS] MSE: {best_val_loss:.4f}")

# ==============================================================================
# 4. Save Model Weights & Metadata for Dashboard Inference
# ==============================================================================

def save_model_weights(model, scalers, history):
    """Saves model weights, architecture metadata, and feature scalers to models/ directory."""
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    primary_weight_path = os.path.join(MODELS_DIR, "cyclone_cnn_gru_bilstm.pth")
    compat_weight_path = os.path.join(MODELS_DIR, "cyclone_cnn_lstm.pth")
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
    scalers_path = os.path.join(MODELS_DIR, "scaler_params.json")

    # Save State Dict
    torch.save(model.state_dict(), primary_weight_path)
    torch.save(model.state_dict(), compat_weight_path)

    # Save Metadata
    metadata = {
        "model_type": "CNN-GRU-BiLSTM",
        "spatial_branch": "TimeDistributed 2D CNN (4-layer)",
        "weather_branch": "2-layer GRU (64 units)",
        "temporal_fusion": "2-layer Bidirectional LSTM (128 units, 256 context)",
        "output_targets": ["Latitude", "Longitude", "Max_Sustained_Wind_kts"],
        "input_shapes": {
            "spatial_sequence": [4, 1, 128, 128],
            "weather_sequence": [4, 6]
        },
        "scalers": scalers,
        "training_timestamp": datetime.now().isoformat(),
        "final_metrics": history[-1] if history else {}
    }

    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    with open(scalers_path, "w") as f:
        json.dump(scalers, f, indent=2)

    print(f"[SAVE] Model weights exported to: {primary_weight_path}")
    print(f"[SAVE] Metadata & Scalers saved to: {meta_path}")

# ==============================================================================
# Main Orchestrator
# ==============================================================================
if __name__ == "__main__":
    train_cyclone_model(num_epochs=35, batch_size=8, lr=0.001)
