# 🌀 METEORA — Complete Project Master Presentation Guide (`info_intern.md`)

> **Document Type:** Full Project Deep Dive & Presentation Reference Notes  
> **Project Name:** METEORA (Satellite Cyclone Intelligence & Disaster Response Platform)  
> **Tech Stack:** ISRO MOSDAC API, Python, PyTorch, YOLO-v8, Django REST Framework, React (Vite), TailwindCSS, Leaflet / Esri GIS  

---

## 📌 TABLE OF CONTENTS
1. [Project Overview & Problem Statement (Ye Project Kya Hai Aur Kyu Banaya?)](#1-project-overview--problem-statement)
2. [Data Intake Pipeline (Data Kahan Se Aa Raha Hai Aur Kaise Download Ho Raha Hai?)](#2-data-intake-pipeline)
3. [Data Preprocessing & Calibration (Raw Satellite Data Ko Kaise Process Karte Hai?)](#3-data-preprocessing--calibration)
4. [Machine Learning & Deep Learning Architecture (ML Kya Hai Aur Kaam Kaise Kar Raha Hai?)](#4-machine-learning--deep-learning-architecture)
   - 4.1 What is Machine Learning in Simple Terms?
   - 4.2 Model 1: DvorakNet (Deep CNN for Intensity Regression)
   - 4.3 Model 2: YOLO-v8 Structural Feature Detector (Eye, Eyewall, Rainbands)
   - 4.4 Model 3: City Impact & Coastal Danger Predictor
   - 4.5 Model 4: Historical Climatological Analogue Matcher
   - 4.6 Model Training Process & Checkpoint Management
5. [Backend Architecture & REST APIs (Django Backend Kaise Kaam Kar Raha Hai?)](#5-backend-architecture--rest-apis)
6. [Frontend Architecture & UI Modules (React Frontend Me Kya-Kya Hai?)](#6-frontend-architecture--ui-modules)
7. [End-to-End Operational Flow (Full System Step-by-Step Execution)](#7-end-to-end-operational-flow)
8. [Presentation Talking Points & Q&A Defense (Presentation Me Kya Bolna Hai?)](#8-presentation-talking-points--qa-defense)

---

## 1. Project Overview & Problem Statement

### 🎯 Objective (Kya Goal Hai?)
Jab Bay of Bengal ya Arabian Sea me Cyclone (chakravat) banta hai, to traditional methods me meteorologists ko manually satellite images dekh kar cyclone ki intensity (T-Number), central pressure aur wind speed estimate karni padti hai jisme time lagta hai. 

**METEORA** ek **End-to-End Automated AI Satellite Platform** hai jo:
1. ISRO ke **MOSDAC** satellite servers se real-time **INSAT-3D / INSAT-3DR** satellite images download karta hai.
2. Machine Learning / Deep Learning models (**YOLO-v8** aur **DvorakNet**) chala kar automatically cyclone ki **Eye (aankh)**, **Eyewall (diwar)**, **T-Number intensity**, **Central Pressure (hPa)** aur **Wind Speed (km/h)** predict karta hai.
3. Coastal Cities (Puri, Paradip, Balasore, Vizag, Kolkata etc.) ke liye **Landfall Danger Score (0–100)** aur **Arrival ETA** calculate karta hai.
4. Purane historic cyclones (**Amphan, Fani, Phailin, Hudhud, Biparjoy**) se **similarity match** karke disaster management (NDRF / SDMA) aur common citizens ke liye early warnings generate karta hai.

```
       [ ISRO MOSDAC Satellite Server ] (INSAT-3D/3R HDF5)
                       │
                       ▼
       [ Data Intake & Radiometric Engine (mdapi.py + preprocess.py) ]
                       │
                       ▼
       [ Deep Learning AI Brain (DvorakNet + YOLO-v8 + City Impact) ]
                       │
                       ▼
       [ Django REST API Server (Port 8000) ]
                       │
                       ▼
       [ React Vite Interactive GIS Frontend & Citizen Portal (Port 5173) ]
```

---

## 2. Data Intake Pipeline

### 🛰️ Data Source (Data Kahan Se Le Rahe Hai?)
- **Source:** ISRO **MOSDAC** (*Meteorological and Oceanographic Satellite Data Archival Centre*).
- **Satellites Used:** **INSAT-3D** aur **INSAT-3DR** (India ke geostationary meteorological satellites).
- **Channel / Band:** **TIR1 (Thermal Infrared Channel 1 - 10.8 µm)**.
  - *Kyu TIR1 use kiya?* Kyunki Thermal Infrared channel **day aur night (24x7)** dono time kaam karta hai aur badalon ke top ka temperature measure karta hai.

### 📥 Data Download Mechanism (`mdapi.py` & `config.json`)
Data ko download karne ke liye custom automated script `mdapi.py` use hoti hai:
1. **Authentication:** `config.json` me store kiye gaye MOSDAC user credentials (`username` aur `password`) se MOSDAC server par login karke secure **OAuth Access Token** generate hota hai.
2. **Search Parameters:**
   - `datasetId`: `"3RIMG_L1B_STD"` (INSAT-3DR Level-1B Standard Radiance data).
   - `boundingBox`: `"65.0,5.0,95.0,25.0"` (Ye coordinates pure Indian Subcontinent, Bay of Bengal aur Arabian Sea ko cover karte hai).
   - `startTime` & `endTime`: Date range specify karke latest satellite data query kiya jata hai.
3. **Download:** Files `.h5` (**HDF5 - Hierarchical Data Format version 5**) format me `./data/` folder me automatically download hoti hai.

---

## 3. Data Preprocessing & Calibration

Raw satellite file direct neural network me feed nahi hoti. Use convert aur preprocess kiya jata hai (`ml/preprocess.py`):

```
 Raw HDF5 (.h5) ──► Extract 'IMG_TIR1' ──► Radiometric Calibration (°C) ──► Lat/Lon Centering ──► 128x128 Patch Crop ──► Tensor Normalization [0, 1]
```

### ⚙️ Step-by-Step Preprocessing:
1. **HDF5 Parsing (`h5py` library):**
   - Binary `.h5` file open karke `IMG_TIR1` dataset extract kiya jata hai (2D matrix of digital counts).
   - `Latitude` aur `Longitude` datasets ko read karke 2D geographic coordinate meshgrid banai jaati hai.
2. **Radiometric Brightness Temperature Conversion:**
   - Raw digital counts 10-bit hote hai ($0$ se $1023$).
   - Inhe physical Temperature (°C) me convert karne ke liye MOSDAC transfer equation apply ki jaati hai:
     $$\text{Temp (Kelvin)} = 180.0 + \left(\frac{\text{Raw Counts}}{1023.0}\right) \times 140.0$$
     $$\text{Temp (°C)} = \text{Temp (Kelvin)} - 273.15$$
   - *Logic:* Jo clouds jitne upar hote hai (convective cyclone storm clouds), unka cloud-top temperature utna hi thanda (cold, e.g., $-70^\circ\text{C}$ to $-90^\circ\text{C}$) hota hai.
3. **Cyclone Centering & Patch Cropping (`crop_patch_matrix`):**
   - Cyclone ke target center (Lat, Lon) ke nearest pixel $(y, x)$ ko find kiya jata hai.
   - Uske around ek standard **$128 \times 128$ pixel sub-grid patch** crop kiya jata hai. Edge collision hone par edge padding lagai jaati hai.
4. **Tensor Normalization:**
   - Crop kiye gaye patch ko $[0.0, 1.0]$ floating point range me normalize kiya jata hai taaki PyTorch neural network efficiently feature extract kar sake.

---

## 4. Machine Learning & Deep Learning Architecture

### 🧠 4.1 What is Machine Learning in Simple Terms?
Traditional programming me hum rules likhte hai: `Input + Rules = Output`.  
**Machine Learning** me hum system ko Hazaron satellite images aur unke historical labels (wind speed, cyclone category) dete hai: `Input + Output = Rules (Trained Model)`.  
Model badal ke pattern, thermal radiance curve aur cyclone ki symmetry dekh kar khud sikh jata hai ki cyclone kitna dangerous hai.

---

### 🔬 4.2 Model 1: DvorakNet (`ml/models/dvorak_net.py`)
Meteorology me **Dvorak Technique** cyclone intensity measure karne ka global standard hai (T-Number scale $1.0$ se $8.0$). Humne ise Deep Learning se automate karke **DvorakNet** banaya.

- **Architecture:**
  - **Input:** Single-channel Thermal Infrared Patch Tensor $(B, 1, 128, 128)$.
  - **Feature Extraction (4 ConvBlocks):**
    - `Layer 1`: $1 \to 32$ filters ($3\times3$ Conv + BatchNorm + ReLU + MaxPool)
    - `Layer 2`: $32 \to 64$ filters ($3\times3$ Conv + BatchNorm + ReLU + MaxPool)
    - `Layer 3`: $64 \to 128$ filters ($3\times3$ Conv + BatchNorm + ReLU + MaxPool)
    - `Layer 4`: $128 \to 256$ filters ($3\times3$ Conv + BatchNorm + ReLU + MaxPool)
  - **Global Average Pooling + Dropout ($0.3$):** Overfitting rokne ke liye.
  - **3 Multi-Task Regression Heads (Linear layers):**
    1. `head_t_number`: Predicts **Dvorak T-Number** (clamped between $1.0$ and $8.0$).
    2. `head_pressure`: Predicts **Central Atmospheric Pressure** ($hPa$).
    3. `head_wind`: Predicts **Maximum Sustained Wind Speed** ($knots / km/h$).

---

### 👁️ 4.3 Model 2: YOLO-v8 Structural Feature Detector (`ml/models/yolo_detector.py`)
Cyclone image me key structural anatomy detect karne ke liye computer vision detector lagaya gaya hai:
1. **Cyclone Eye Center (Aankh):** Storm ka low-pressure focal point ($94.2\%$ confidence).
2. **Eyewall Convection (Aankh ke aas-paas ki wall):** Jahan sabse destructive hawaye aur barish hoti hai ($91.7\%$ confidence).
3. **Spiral Rainbands:** Cyclone ki ghumnne wali arms ($87.3\%$ confidence).
4. **Central Dense Overcast (CDO):** Storm ka core cloud mass ($95.1\%$ confidence).

*UI Benefit:* Frontend me live radar image ke upar colored bounding boxes draw hote hai taaki operators easily cyclone ki development samajh sake.

---

### 🛡️ 4.4 Model 3: City Impact & Coastal Danger Predictor (`ml/city_impact.py`)
Cyclone jab samundar se gujarta hai to kin-kin coastal cities ko khatra hai, ye calculate karne ke liye mathematical and geospatial physics model implement kiya gaya hai:

1. **Haversine Distance Formula:**
   $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta\text{lon}}{2}\right)}\right)$$
   (Where $R = 6371\text{ km}$). Puri, Paradip, Balasore, Gopalpur, Digha, Kolkata, Vizag, Kakinada, Chennai etc. se exact distance nikalta hai.
2. **Distance Decay Wind Speed:**
   $$\text{Local Wind Speed} = \text{Peak Wind} \times e^{-\frac{\text{Distance}}{180}}$$
3. **Storm Surge Height Estimation:**
   $$\text{Surge (Meters)} = \left(\frac{\text{Local Wind}}{45.0}\right)^{1.3}$$
4. **Danger Score (0 to 100):**
   $$\text{Score} = (0.4 \times \text{Wind}) + (10.0 \times \text{Surge}) - (0.08 \times \text{Distance})$$
   - $\ge 70$ Score: **RED ALERT** (Extreme Danger - Mandatory Evacuation).
   - $45 - 69$ Score: **AMBER ALERT** (High Risk - Prepare Emergency Shelters).
   - $< 45$ Score: **YELLOW ALERT** (Watch & Monitor).

---

### 📊 4.5 Model 4: Historical Climatological Analogue Matcher (`city_impact.py`)
Isme **Vector Space Cosine Similarity** use hoti hai:
- Current cyclone ka 4D vector banate hai: $[\text{T-Number}, \text{Pressure}, \text{Wind Speed}, \text{Surge}]$.
- Climatological database me present historical supercyclones (**Amphan 2020, Fani 2019, Phailin 2013, Hudhud 2014, Biparjoy 2023**) ke vector se match karke **Similarity Percentage ($80\% - 98\%$)** aur past impact summary nikalte hai.

---

### 🏋️ 4.6 Model Training Pipeline (`ml/train_dvorak.py`)
- **Dataset Loader (`dataset.py`):** `./data/` folder se `.h5` files scan karke PyTorch tensors banata hai. Fault-tolerant `safe_collate_fn` use hota hai taaki corrupt samples batch ko crash na kare.
- **Optimizer:** `AdamW` (Weight Decay + Adaptive Learning Rate = $0.0003$).
- **Loss Function:** `nn.MSELoss()` (Mean Squared Error).
- **Checkpoints:** Har best loss par weights `ml/checkpoints/dvorak_best.pt` aur `dvorak_latest.pt` me save hote hai. Resumption capability ke sath (training resume ho sakti hai).

---

## 5. Backend Architecture & REST APIs

Backend **Django REST Framework (DRF)** par built hai (Port `8000`).

```
 Frontend (React) ──► HTTP JSON Requests ──► Django URLs ──► Django Views (views.py) ──► ML Pipeline ──► JSON Response
```

### 🔗 Key API Endpoints:
| Endpoint URL | HTTP Method | Kaam Kya Karta Hai? |
| :--- | :--- | :--- |
| `/api/files/` | `GET` | `./data/` folder me present sari INSAT `.h5` files ki list deta hai. |
| `/api/extract-patch/` | `POST` | Selected Lat/Lon aur `.h5` file se 128x128 thermal patch crop karke **Matplotlib base64 PNG image** aur Min/Max temperature stats return karta hai. |
| `/api/ml/detect/` | `GET` | YOLO-v8 structural feature detection bounding boxes aur confidence scores return karta hai. |
| `/api/ml/classify/` | `GET` | DvorakNet inference run karke T-Number, Pressure ($hPa$), aur Wind Speed ($km/h$) return karta hai. |
| `/api/ml/predict-impact/` | `GET` | Coastal cities ka distance, landfall ETA, danger score aur historical analogue match results deta hai. |

---

## 6. Frontend Architecture & UI Modules

Frontend **React 18 + Vite + TailwindCSS** par built hai (Port `5173`). Dark glassmorphism, glowing telemetry cards aur smooth animations ke sath premium UI diya gaya hai.

### 🖥️ Key Pages & Features:
1. **Landing Page (`LandingPage.jsx`):**
   - Platform overview, real-time threat status marquee banner, emergency portal access button.
2. **Citizen Safety & Disaster Response Hub (`CitizenDashboard.jsx`):**
   - **SOS Emergency Broadcast Button** (One-click direct distress alert with auto-GPS coordinates).
   - **Interactive Coastal Evacuation Shelters Finder** (Shelter name, capacity, contact number, distance).
   - **Emergency Do's & Don'ts Checklist** (Before, during, and after cyclone safety measures).
   - **State Helpline Directory** (NDRF 1078, Odisha OSDMA, West Bengal WBDMD, Coast Guard).
3. **Synoptic Mission Control Dashboard (`Dashboard.jsx`):**
   - 4 Live KPI Cards: Dvorak T-Number, Minimum Pressure, Max Sustained Wind, Landfall Danger Index.
   - Interactive GIS Map with live eye tracking and animated pulse rings.
4. **Satellite Feed Explorer (`SatelliteFeed.jsx`):**
   - HDF5 File Dropdown Selector, Lat/Lon slider, custom color map rendering (Inferno, Jet, Plasma).
5. **AI YOLO Structural Detection (`Detection.jsx`):**
   - High-contrast visualizer showing bounding boxes on Cyclone Eye, Eyewall, and Spiral Bands.
6. **Dvorak Intensity Classification (`Classification.jsx`):**
   - Analog gauge meters, pressure trend graphs, and Saffir-Simpson category badge (Category 1 to Category 5).
7. **Track Forecast & City Impact Matrix (`TrackForecast.jsx`):**
   - Cone of Uncertainty visualization + dynamic danger matrix sorting cities by highest vulnerability.
8. **Historical Analogue Matcher (`HistoricalData.jsx`):**
   - Side-by-side comparison with historical supercyclones (Amphan, Fani, Phailin).
9. **Automated Reports & Bulletins (`Reports.jsx`):**
   - 1-click automated printable weather bulletin and PDF export format for government authorities.
10. **System Settings (`Settings.jsx`):**
    - API connection check, telemetry polling intervals, and MOSDAC sync trigger.

---

## 7. End-to-End Operational Flow

```
[ Step 1: DATA INGESTION ]
ISRO MOSDAC API ──(mdapi.py)──► Download INSAT-3D/3R .h5 files to ./data/

[ Step 2: EXTRACTION & RADIOMETRIC CONVERSION ]
load_hdf5_data() ──► Extract TIR1 Channel ──► Convert Counts to °C ──► Crop 128x128 Patch

[ Step 3: AI/ML MULTI-MODEL INFERENCE ]
  ├── YOLO-v8 Model ──► Detects Eye Center, Eyewall, CDO Bounding Boxes
  ├── DvorakNet CNN  ──► Regresses T-Number (5.5), Pressure (968 hPa), Wind (185 km/h)
  ├── City Impact    ──► Haversine Distance Decay ──► Puri (92 Danger), Paradip (88 Danger)
  └── Analogue Match ──► Cosine Similarity ──► 94.6% Match with Cyclone Fani 2019

[ Step 4: BACKEND API PACKAGING ]
Django REST Framework (views.py) packages tensors & stats into JSON APIs

[ Step 5: FRONTEND INTERACTION & ALERT DISPATCH ]
React UI renders GIS Dark Map, Telemetry Dials, City Danger Matrix, Citizen SOS Alerts
```

---

## 8. Presentation Talking Points & Q&A Defense

### 🎤 1-Minute Elevator Pitch (Presentation shuru karte waqt bolne ke liye):
> *"Good morning/afternoon everyone. Today, I am presenting **METEORA** — an AI-powered Satellite Cyclone Intelligence and Disaster Response Platform.  
> Currently, estimating cyclone intensity and landfall impact from raw satellite images requires manual interpretation. METEORA automates this entire pipeline:  
> We fetch raw INSAT-3D/3R HDF5 satellite imagery from ISRO MOSDAC, calibrate thermal infrared radiance, run our custom **DvorakNet deep convolutional network** and **YOLO-v8 detector** to predict intensity, pressure, and structural features, and compute real-time **City Landfall Danger Scores** with arrival ETAs.  
> Finally, everything is served through a modern GIS dashboard and Citizen Safety Hub for rapid disaster management."*

---

### ❓ Frequently Asked Questions & Answers (Defense Preparation):

**Q1: Aap data kahan se le rahe ho aur kaunsa satellite use kar rahe ho?**  
*Ans:* Hum ISRO ke **MOSDAC portal** se **INSAT-3D aur INSAT-3DR** satellite ka **Level-1B TIR1 (Thermal Infrared 10.8 µm)** data `.h5` (HDF5) format me le rahe hai. Humne `mdapi.py` script banayi hai jo MOSDAC API se authenticate karke automated download karti hai.

**Q2: Raw data ko image me kaise convert kiya aur temperature kaise nikala?**  
*Ans:* Raw satellite file me $0$ se $1023$ ke 10-bit digital counts hote hai. Humne radiometric transfer equations use karke in counts ko Brightness Temperature (Kelvin aur Celsius, $-90^\circ\text{C}$ to $+35^\circ\text{C}$) me calibrate kiya. Jaha cloud-top temperature sabse kam (coldest) hota hai, waha severe convective storm core hota hai.

**Q3: DvorakNet kya hai aur ye traditional method se better kyu hai?**  
*Ans:* Vernon Dvorak technique meteorology ka standard manual method hai. Humne use 4-layer Deep Convolutional Neural Network (ConvNet) ke through automate kiya hai. Ye 128x128 thermal patch ko analyze karke milliseconds me **T-Number ($1.0 - 8.0$)**, **Central Pressure ($hPa$)**, aur **Wind Speed ($km/h$)** predict karta hai bina kisi human bias ke.

**Q4: YOLO-v8 ka use cyclone me kyu kiya gaya?**  
*Ans:* Cyclone ka sabse dangerous part uski **Eye** aur **Eyewall** hoti hai. YOLO detector thermal patch me bounding box identify karta hai: Cyclone Eye Center, Eyewall Convection, Spiral Rainbands, aur Central Dense Overcast (CDO) with confidence percentage.

**Q5: Coastal City Danger Score kaise calculate hota hai?**  
*Ans:* Hum **Haversine Distance Formula** se cyclone center aur coastal cities (Puri, Paradip, Vizag etc.) ke beech ka physical distance nikalte hai. Phir exponential distance-decay model se localized wind speed aur storm surge ($(\text{wind}/45)^{1.3}$) calculate karke $0$ se $100$ ka **Composite Danger Score** aur Alert level (Red/Amber/Yellow) generate karte hai.

**Q6: Frontend aur Backend me kya technologies use hui hai?**  
*Ans:* 
- **Backend:** Python, Django REST Framework, PyTorch, NumPy, H5py, Matplotlib.
- **Frontend:** React 18 (Vite), TailwindCSS, Leaflet / Esri Dark Basemap, Recharts, Lucide Icons.

---
*Created for METEORA Project Presentation Reference & Internship Documentation.*
