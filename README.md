# 🌀 METEORA — Satellite Cyclone Intelligence & Disaster Response Platform

**METEORA** is an end-to-end, multi-modal Meteorological & Tropical Cyclone Forecasting Platform. It integrates automated ISRO **MOSDAC** INSAT-3D/3R HDF5 satellite data downloading, **Open-Meteo & NOAA IBTrACS** environmental ground-truth ingestion, a hybrid **CNN-GRU-BiLSTM** deep learning neural network for rapid intensification & trajectory forecasting, **Historical Track Mapping & Trajectory Playback**, and dual interactive GIS dashboard portals (Django & React Vite).

---

## 📌 Master System Architecture

```text
                                 ┌────────────────────────────────────────────────────────┐
                                 │           ISRO MOSDAC Satellite API Downlink           │
                                 └───────────────────────────┬────────────────────────────┘
                                                             │ (mdapi.py / config.py)
                                                             ▼
                                 ┌────────────────────────────────────────────────────────┐
                                 │           Open-Meteo & NOAA IBTrACS Ingestion          │
                                 │                 (weather_noaa_api.py)                  │
                                 └───────────────────────────┬────────────────────────────┘
                                                             │
                                                             ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                               Multi-Modal Data Fusion & Neural Training Pipeline                                        │
 │                                             (train_pipeline.py)                                                         │
 ├─────────────────────────────────────────┬───────────────────────────────────────────┬───────────────────────────────────┤
 │   Spatial Stream (HDF5 128x128)         │   Temporal Stream (Weather T=4)           │   Target Labels (NOAA Ground-Truth│
 │   TimeDistributed 2D CNN (128-d)        │   Sequential 2-Layer GRU (64-d)           │   Next Lat, Next Lon, Next Wind   │
 └─────────────────────────────────────────┴─────────────────────┬─────────────────────┴───────────────────────────────────┘
                                                                 │ Concat (192-d) ──► BiLSTM (256-d)
                                                                 ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                  Backend Servers & REST API Services                                                    │
 ├─────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────┤
 │   Flask Prediction Microservice (app.py :5000)          │   Django Web Platform & REST API (manage.py :8000)            │
 │   • /predict & /run-inference                           │   • /api/historical-tracks/ & /api/ml/intensification/        │
 │   • /api/historical-tracks                              │   • Interactive Leaflet GIS & Multi-Portal Dashboard          │
 └─────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────┘
                                                                 │
                                                                 ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                               Interactive GIS Dashboards & Forecasting Portals                                          │
 ├────────────────────────────────────────┬────────────────────────────────────────┬───────────────────────────────────────┤
 │ 🗺️ Synoptic GIS Surface Map            │ ⏯️ Historical Track Mapping & Playback  │ 🛡️ Citizen Safety & Evacuation Portal │
 │ 40 Ocean Buoys & 3 Ensemble Tracks     │ Step-by-Step Trajectory Animation      │ Multi-Purpose Cyclone Shelters & SOS  │
 └────────────────────────────────────────┴────────────────────────────────────────┴───────────────────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. 🛰️ Automated MOSDAC Bulk Satellite Downloader (`mdapi.py`)
- **Automated Token Management (`config.py`)**: Automatically authenticates with MOSDAC using `USERNAME` and `PASSWORD` via `get_fresh_token()`.
- **Dynamic 401/403 Token Recovery**: If tokens expire mid-stream, `download_file_with_retry()` automatically refreshes tokens and seamlessly resumes downloads without crashing or halting the script.
- **Synoptic 6-Hour Hour-Based Filter**: Replaces rigid exact-string matching with hour-based parsing (`00`, `06`, `12`, `18` UTC) to download **only the first available file per block** across the 7-Day Peak Window (`2023-06-06` to `2023-06-12` for Cyclone Biparjoy).
- **Fault-Tolerant Streaming (`.part`)**: Streams files into temporary `.part` containers with `timeout=(30, 300)` and atomic renaming upon 100% byte verification, with automatic corrupted file cleanup upon connection drops.

### 2. 🌦️ Environmental & Ground-Truth Ingestion (`weather_noaa_api.py`)
- **Open-Meteo Historical Weather API**: Pulls hourly atmospheric parameters for the active cyclone basin:
  - Sea Level Pressure & Surface Pressure ($\text{hPa}$)
  - Wind Speed at 10m ($\text{km/h}$ and $\text{knots}$) & Wind Direction ($^\circ$)
  - Temperature at 2m ($^\circ\text{C}$) & Relative Humidity ($\%$)
  - Output: [`data/ground_truth/biparjoy_weather.csv`](file:///d:/mdapi/data/ground_truth/biparjoy_weather.csv)
- **NOAA IBTrACS Ground Truth Dataset**: Pulls official synoptic best-track records (Latitude, Longitude, Max Sustained Wind, Central Pressure, Storm Category):
  - Output: [`data/ground_truth/biparjoy_track_labels.csv`](file:///d:/mdapi/data/ground_truth/biparjoy_track_labels.csv)

### 3. 🧠 Hybrid CNN-GRU-BiLSTM Deep Learning Pipeline (`train_pipeline.py`)
- **Multi-Modal Synchronization**: Merges spatial thermal-IR patches ($128 \times 128$) with sliding sequences of atmospheric precursors ($T=4$ timesteps).
- **Network Architecture**:
  - **TimeDistributed 2D CNN**: 4-layer convolutional feature extractor generating 128-dimensional spatial embeddings per timestep.
  - **Sequential GRU Branch**: 2-layer GRU processing sequential 6-dimensional weather variables into 64-dimensional temporal embeddings.
  - **Feature Concatenation**: Concatenates spatial and atmospheric representations ($128 + 64 = 192$).
  - **Bidirectional LSTM (BiLSTM)**: Evaluates forward and backward sequential dependencies across the observation sequence ($256$ context units).
  - **Dense Prediction Head**: Multi-head regression forecasting **Next-Step Latitude (°N)**, **Longitude (°E)**, and **Max Sustained Wind Speed (kts)**.
- **Model Checkpoints**: Saves trained artifacts to `models/cyclone_cnn_gru_bilstm.pth`, `models/model_metadata.json`, and `models/scaler_params.json`.

### 4. ⚡ Prediction Microservice Backend (`app.py`)
- **Fast Live Inference**: Loads the trained PyTorch network on startup and serves predictions on port `5000`.
- **Comprehensive Output Payload**:
  - Rapid Intensification Probability ($\%$ risk score) & Alert Badges
  - Next-step Latitude and Longitude coordinates for map plotting
  - Max Sustained Wind Speed ($\text{kts}$ / $\text{km/h}$) & Central Minimum Pressure ($\text{hPa}$)
  - 36-Hour Multi-Step Forecast Trajectory & 3 Ensemble Uncertainty Spread Tracks
  - Universal CORS support for frontend clients.

### 5. 🗺️ Historical Cyclone Track Mapping & Playback (`tab-historical`)
- **Multi-Cyclone Catalog**: Supports Cyclone Biparjoy (2023), Cyclone Michaung (2023), Cyclone Mocha (2023), Super Cyclone Amphan (2020), and Cyclone Tauktae (2021).
- **Interactive Leaflet Map Canvas**:
  - Segmented polyline with color-coded intensity classifications (CS, SCS, VSCS, ESCS, SuCS).
  - Waypoint circle markers with detailed meteorological popups.
  - Pulsing dynamic cyclone vortex eye marker tracking active playback position.
- **Interactive Animation Controller**:
  - **Play / Pause**: Smooth step-by-step automatic animation.
  - **Step Forward / Step Backward**: Manual waypoint inspection.
  - **Speed Selector**: 0.5x, 1.0x, 2.0x, and 5.0x playback speeds.
  - **Timeline Scrubber**: Interactive range slider to scrub through all 56 synoptic observations.
  - **Synchronized Waypoint Log Table**: Click any row in the log table to jump map focus.

### 6. 🌐 High-Density GIS Surface Tracking (Django Portal)
- **40 Ocean Buoy Sensors**: Scattered across the Bay of Bengal & Arabian Sea with live hover telemetry (temperature, barometric pressure, wave height, salinity).
- **3 Ensemble Perturbation Trajectories**: Mathematical forecast uncertainty paths (ECMWF, GFS, UKMET).
- **Coastal Impact Zones GeoJSON**: Dynamic coastal state polygons (Odisha, West Bengal, Andhra Pradesh, Gujarat, Tamil Nadu) with trajectory proximity fills and vulnerability ratings.

---

## 📂 Project Directory Structure

```text
d:\mdapi/
├── config.py                       # Python credentials (USERNAME, PASSWORD, API URLs)
├── config.json                     # JSON MOSDAC credentials & search parameters
├── mdapi.py                        # Automated MOSDAC bulk satellite downloader
├── weather_noaa_api.py             # Open-Meteo & NOAA IBTrACS data ingestion pipeline
├── train_pipeline.py               # CNN-GRU-BiLSTM multi-modal model training pipeline
├── app.py                          # Flask prediction microservice & historical track API
├── run_server.bat                  # One-click startup script
├── manage.py                       # Django management script
├── core/                           # Django core settings & root URLs
├── viewer/                         # Django web app & REST API
│   ├── views.py                    # REST views & historical tracks endpoint
│   ├── urls.py                     # API routing table
│   └── templates/viewer/index.html # Integrated multi-portal HTML UI with Leaflet GIS
├── ml/                             # Machine learning modules & preprocessing
│   ├── preprocess.py               # HDF5 parsing, brightness temp conversion & patch cropping
│   └── models/                     # Deep learning architectures
├── models/                         # Trained model checkpoints & metadata
│   ├── cyclone_cnn_gru_bilstm.pth  # Primary trained PyTorch model weights
│   ├── model_metadata.json         # Architecture specs & training hyperparameter logs
│   └── scaler_params.json          # Feature normalization scalers
├── data/                           # Downloaded datasets & ground truth
│   ├── mosdac/                     # Downloaded INSAT-3D/3R .h5 satellite files
│   └── ground_truth/               # Ingested Open-Meteo & NOAA CSVs
│       ├── biparjoy_weather.csv    # 168 hourly environmental records
│       └── biparjoy_track_labels.csv # 56 synoptic ground-truth waypoints
└── frontend_source/                # React Vite frontend dashboard
```

---

## ⚡ Quick Start & Execution Guide

### Step 1: Download MOSDAC Satellite Dataset
Configure your credentials in `config.py` or `config.json`, then execute:
```bash
python mdapi.py
```
*Discovers synoptic 6-hour files across the 7-day window and downloads them into `data/mosdac/Biparjoy/`.*

---

### Step 2: Fetch Open-Meteo & NOAA Ground-Truth Data
```bash
python weather_noaa_api.py
```
*Generates `data/ground_truth/biparjoy_weather.csv` and `data/ground_truth/biparjoy_track_labels.csv`.*

---

### Step 3: Train the Multi-Modal CNN-GRU-BiLSTM Model
```bash
python train_pipeline.py
```
*Trains the neural network across 35 epochs and exports model weights to `models/cyclone_cnn_gru_bilstm.pth`.*

---

### Step 4: Launch Web Servers & Dashboards

#### Option A: Launch Flask Prediction Backend (Port 5000)
```bash
python app.py
```

#### Option B: Launch Django Integrated Web Portal (Port 8000)
```bash
python manage.py runserver 0.0.0.0:8000
```
*Navigate to [http://127.0.0.1:8000/](http://127.0.0.1:8000/) in your browser.*

#### Option C: One-Click Master Launcher (Windows)
Double-click **`run_server.bat`** or run:
```powershell
.\run_server.bat
```

---

## 🧪 REST API Reference

| Endpoint | Service | Method | Description |
| :--- | :--- | :--- | :--- |
| `/predict` | Flask (`app.py`) | `POST` / `GET` | Live multi-modal CNN-GRU-BiLSTM prediction |
| `/run-inference` | Flask (`app.py`) | `POST` / `GET` | Alias for live multi-modal inference |
| `/api/historical-tracks` | Flask & Django | `GET` | Returns chronological cyclone track waypoints & metadata (`?cyclone=Biparjoy`) |
| `/api/ml/intensification/` | Django & Flask | `GET` / `POST` | Live rapid intensification probability and risk classification |
| `/api/files/` | Django & Flask | `GET` | Lists available MOSDAC `.h5` satellite files in `./data/` |
| `/api/ground-truth` | Flask (`app.py`) | `GET` | Ingested Open-Meteo & NOAA ground truth records |
| `/api/spatial-risk/` | Django (`viewer`) | `GET` | Regional spatial vulnerability index across coastal states |

---

## 📜 Technology Stack & Acknowledgments
- **Data Providers**: ISRO **MOSDAC** (INSAT-3D/3DR TIR1), **Open-Meteo Historical Archive**, NOAA **NCEI IBTrACS**, and India Meteorological Department (**IMD**).
- **Deep Learning Frameworks**: PyTorch (`TimeDistributed-CNN`, `GRU`, `BiLSTM`), NumPy, H5py, Pandas, Scikit-learn.
- **Web & GIS Engines**: Django, Flask, Leaflet.js, CartoDB Dark Matter, ESRI World Imagery, TailwindCSS, Lucide Icons.
