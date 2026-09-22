# CycloneAI — UI Architecture & Element Analysis Specification
**Project:** Artificial Intelligence (AI) / Machine Learning (ML) Based System for Identification, Classification, and Prediction of Tropical Cyclone Patterns Using Multi-Source Satellite Data  
**Problem Statement ID:** 26070  
**Organization:** Ministry of Earth Sciences (MoES)  
**Department:** India Meteorological Department (IMD)  
**Category:** Software | **Theme:** Disaster Management  

---

## 1. Executive Summary & Design Philosophy

The CycloneAI user interface is designed as an operational, 24/7 mission-critical command center web application for meteorologists, forecasters, and disaster management authorities. Its purpose is to ingest high-volume, multi-source satellite streams (INSAT-3D, INSAT-3DR, GOES, Meteosat), apply real-time computer vision and machine learning inference, and present actionable intelligence with zero cognitive overload.

### Design Principles:
1. **Operational Dark Mode**: Built on a deep oceanic palette (`#0a1628` base canvas, `#0d1f3c` surfaces) to eliminate eye strain during 24-hour shifts in low-light command rooms.
2. **High Information Density with Visual Hierarchy**: Uses high data density without clutter by employing tonal layering, micro-borders (`#1a3a6b`), and distinct status colors.
3. **Dual-Font System**:
   - **Inter**: Primary UI typeface optimized for readability on high-resolution displays.
   - **JetBrains Mono**: Dedicated monospace typeface for numerical telemetry (wind speeds, atmospheric pressures, geographic coordinates, timestamps).
4. **Instant Actionability**: Life-critical metrics (Rapid Intensification, Landfall Warnings) use high-visibility accents (`#ff3b3b` red, `#ff9500` amber) with pulsing indicators.

---

## 2. Complete UI Architecture

### 2.1 Component Hierarchy Tree

```
App.jsx (Root Entry + BrowserRouter)
│
└── AppLayout.jsx (Master Shell: Flex-column, 100vh)
    │
    ├── TopNav.jsx (Persistent Global Header, h-14)
    │   ├── IMD Logo & Branding Block
    │   ├── Live Status Pulsing Beacon
    │   ├── Real-Time IST Clock Engine (1Hz tick)
    │   ├── Telemetry System Health Indicator
    │   ├── Security Clearance Tag (RESTRICTED)
    │   ├── Notification Drawer Bell (Active Alert Counter)
    │   └── User Profile Pill (Dr. M. Kumar - Senior Forecaster)
    │
    └── Main Shell (Flex-row, flex-1, overflow-hidden)
        │
        ├── SideNav.jsx (Collapsible Sidebar, w-56 <-> w-16)
        │   ├── Brand Icon & Text
        │   ├── Navigation Menu (8 Active Route Links with Icons)
        │   ├── Collapse/Expand Floating Button
        │   └── System Version & MoES Authority Tag
        │
        └── <Outlet /> (Dynamic Route Viewport, flex-1, overflow-y-auto)
            ├── /             -> Dashboard.jsx
            ├── /satellite    -> SatelliteFeed.jsx
            ├── /detection    -> Detection.jsx
            ├── /classification -> Classification.jsx
            ├── /forecast     -> TrackForecast.jsx
            ├── /historical   -> HistoricalData.jsx
            ├── /reports      -> Reports.jsx
            └── /settings     -> Settings.jsx
```

### 2.2 Routing & State Architecture
- **Client-Side Routing**: Handled via `react-router-dom` v7 with nested layout routing.
- **Data Flow Model**: Decoupled mock telemetry architecture in `src/data/mockData.js`. Supports plug-and-play REST API or WebSocket integration.
- **Cross-Component Navigation**: Passing active storm contexts (e.g. clicking "View Details" on Cyclone DANA in Dashboard immediately loads its full trajectory in `TrackForecast` using React Router state).

---

## 3. Exhaustive Analysis of Every UI Element

### 3.1 Global Navigation Shell

#### A. Top Navigation Bar (`TopNav.jsx`)
- **IMD Brand Badge**: Hex-gradient square icon with bold IMD typography and department attribution.
- **Live Status Beacon**: Green pulsing ring indicator (`#00c851`) indicating active real-time data sync with Indian Ocean ground stations.
- **IST Clock Engine**: Continuously ticking clock displaying Indian Standard Time in 24-hour format with day, month, and year.
- **System Health Pill**: Green checkmark icon with "All Systems Normal" status label.
- **Clearance Badge**: Cyan border chip displaying "RESTRICTED" to signify official government usage.
- **Notification Center**: Bell icon with absolute-positioned red badge showing count of unresolved alerts (`3`).
- **Operator Profile**: User avatar with initials "MK" and forecaster designation.

#### B. Collapsible Sidebar (`SideNav.jsx`)
- **Collapsible Toggle**: Circular edge button allowing instant transition between expanded (224px) and icon-only (64px) viewports to maximize map display area.
- **Navigation Links**:
  1. `Dashboard` (Home icon): Central operations view.
  2. `Satellite Feed` (Satellite icon): Multi-sensor imagery viewer.
  3. `Detection` (ScanLine icon): AI bounding box inference.
  4. `Classification` (Tags icon): Dvorak storm classification.
  5. `Track & Forecast` (Route icon): Trajectory and landfall prediction.
  6. `Historical Data` (Database icon): Cyclone climatology archive.
  7. `Reports` (FileText icon): Official bulletin generator.
  8. `Settings` (Settings icon): Thresholds, models, and data sources.
- **Active Route Highlighting**: Primary cyan solid pill with black text and smooth transitions.

---

### 3.2 Dashboard Screen (`Dashboard.jsx`)

```
+-----------------------------------------------------------------------------------+
| TopNav: [IMD Logo] [LIVE] [14-Sep-2024 12:00:00 IST] [Health] [Bell (3)] [Profile]|
+-----------------------------------------------------------------------------------+
| Side | [Active Cyclones: 3]  [Zones: 7]  [Sources: 3]  [Next Update: 00:04:32]    |
| Nav  |----------------------------------------------------------------------------|
|      | [ Interactive Map (Bay of Bengal & AS) ] | [ Active Cyclones List ]        |
|      | - Cyclone DANA (Cat 3, Red marker)       | - DANA: 185 km/h, 955 hPa       |
|      | - Cyclone REMAL (Cat 1, Orange marker)   | - REMAL: 120 km/h, 990 hPa      |
|      | - BOB-01 (Depression, Green marker)      | - BOB-01: 65 km/h, 1005 hPa     |
|      | - Past track + Dashed forecast track     | - Landfall warning banner       |
|      | - Map layer toggles & legend             | - "View Details ->" CTA         |
|      |----------------------------------------------------------------------------|
|      | [ Intensity Trend Chart (72h Past + Fcst) ] | [ Live AI Satellite Feed ]   |
|      | - AreaChart with cyan gradient fill         | - INSAT-3D IR Band (94.2%)   |
|      | - Reference Line at 'NOW'                   | - INSAT-3DR VIS Band (89.7%) |
+-----------------------------------------------------------------------------------+
```

- **KPI Metric Strip**:
  - `Active Cyclones`: Red accent with pulsing warning dot, showing storm count and severity distribution.
  - `Monitoring Zones`: Total oceanic basins actively scanned (Bay of Bengal, Arabian Sea, South Indian Ocean).
  - `Satellite Sources`: Active constellation feed count (INSAT-3D, INSAT-3DR, GOES).
  - `Next Update Countdown`: Live ticking countdown timer to next satellite pass.
- **Interactive GIS Map (`CycloneMap.jsx`)**:
  - CartoDB dark matter basemap customized for meteorological visualization.
  - Multi-cyclone markers color-coded by severity (Red = Severe, Orange = Moderate, Green = Low).
  - Concentric intensity rings depicting 34-knot (gale), 50-knot (storm), and 64-knot (hurricane) wind radii.
  - Historical observed tracks (solid white polylines) and AI projected forecast tracks (dashed cyan polylines).
  - Layer switch bar: Instant toggle for Satellite, Infrared, Water Vapor, and Doppler Radar layers.
  - Floating Map Legend HUD with symbol explanations.
- **Active Cyclones List (`CycloneCard.jsx`)**:
  - Individual storm cards showing Category, IMD classification, wind velocity (km/h), central barometric pressure (hPa), coordinates, and movement vector.
  - Landfall warning callout banner with estimated landfall timestamp and target district.
  - Primary button directing directly to focused trajectory screen.
- **Intensity Trend AreaChart**:
  - 144-hour timeline (-72h observed to +72h projected) with gradient area fill.
  - Vertical red reference line marking current time (`NOW`).
- **AI Detection Feed Preview**:
  - Dual satellite frame cards showing automated bounding box overlays and detection confidence scores.

---

### 3.3 Multi-Source Satellite Feed (`SatelliteFeed.jsx`)

- **Constellation Source Tabs**: Seamless selector between INSAT-3D, INSAT-3DR, GOES-East, and Meteosat.
- **Spectral Band Switcher**: Toggles between Thermal IR (10.8 µm), Visible (0.65 µm), Water Vapor (6.2 µm), and False-Color RGB.
- **Compare Mode Split View**: Enables side-by-side simultaneous comparison of two different sensors/bands over the identical geographic bounding box.
- **Thermal Calibration Colorbar**: Vertical gradient legend mapping satellite radiometric brightness temperatures from -80°C to +30°C.
- **24-Hour Timeline Scrubber**: Interactive slider enabling frame-by-frame temporal inspection of cyclone eye development.
- **Image Optimization Controls**: Dedicated brightness and contrast sliders for cloud-top feature enhancement.
- **Spatial Annotation Tools**: Region-drawing and marker-placement tools for meteorologist notes.

---

### 3.4 AI Detection Engine (`Detection.jsx`)

- **Inference Canvas**: High-resolution viewer displaying live AI bounding boxes:
  - Red solid box: Cyclone Eye (confidence >94%).
  - Amber box: Eye Wall convection zone (confidence >91%).
  - Cyan dashed box: Outer spiral convective bands.
  - Green box: Central Dense Overcast (CDO) boundary.
- **Model Selector Dropdown**: Allows forecasters to toggle inference backbones between YOLO-v8, ResNet-50, Vision Transformer (ViT), and EfficientDet.
- **Confidence Threshold Slider**: Range slider (0-100%) dynamically filtering out low-confidence detections.
- **Alert Sensitivity Threshold Slider**: Triggers automated warnings when model certainty exceeds threshold (default 85%).
- **Chronological Detection Log**: Timestamped tabular list of recognized atmospheric structures.

---

### 3.5 AI Classification & Pattern Analysis (`Classification.jsx`)

- **Dvorak T-Number Classification Header**: Prominent classification badge (e.g. `VERY SEVERE CYCLONIC STORM`) based on automated Dvorak pattern recognition.
- **SVG Circular AI Confidence Gauge**: 94.2% radial progress meter rendered in SVG with monospace numeric readouts.
- **Feature Extraction Matrix**:
  - Eye Diameter (km) & circularity score.
  - Eye Wall Symmetry ratio.
  - CDO Diameter (km).
  - Outflow pattern classification (Radial/Anticyclonic).
  - Developed spiral band count.
  - Final Dvorak T-Number (e.g. `T5.5`).
- **Historical Analogue Engine**: Top 5 most structurally similar past cyclones (e.g., Cyclone Amphan 2020 at 96% match, Cyclone Fani 2019 at 91% match) with intensity comparison.
- **6-Axis Hexagonal Radar Chart**: Plots Current Storm vs. Historical Climatological Average across:
  1. Organization
  2. Symmetry
  3. Intensity
  4. Size
  5. Duration
  6. Deepening Rate
- **18-Hour Progressive Timeline**: 6 timestamped thumbnail frames showing morphological evolution.

---

### 3.6 Track & Forecast Analysis (`TrackForecast.jsx`)

- **Cyclone Selection Header**: Quick-switching dropdown between active storms.
- **6-Hourly Track Trajectory Table**:
  - Past positions marked with white text and observed checkmarks.
  - Future projections styled in cyan italics with distinct `AI PREDICTED` badges.
  - Columns: Timestamp, Latitude, Longitude, Wind Speed, Pressure, Saffir-Simpson Category, Prediction Status.
- **96-Hour Intensity Forecast Chart**:
  - AreaChart with reference threshold lines for Cyclone Categories (Depression: 65 km/h, Cyclonic Storm: 90 km/h, Very Severe: 167 km/h, Extremely Severe: 222 km/h).
- **Rapid Intensification (RI) Warning Banner**: High-priority alert triggered when projected wind increases >55 km/h within 24 hours.
- **Multi-Model Ensemble Comparison**: Side-by-side comparison of 5 numerical weather models:
  1. IMD Official Operational Track
  2. ECMWF (European Centre)
  3. GFS (NOAA Global Forecast System)
  4. CycloneAI (Our Deep Learning Model — highlighted in cyan)
  5. JMA (Japan Meteorological Agency)
- **Predicted Landfall Impact Card**:
  - Target coastal coordinate & landmark.
  - Estimated landfall arrival time.
  - Peak sustained surface winds.
  - Inundation storm surge height (meters).
  - 24-hour cumulative rainfall estimate (mm).
  - Vulnerable administrative districts count.
- **Action Buttons**: "Issue Alert" (orange emergency trigger) and "View Impact Zone" (cyan analysis trigger).

---

### 3.7 Historical Data Archive (`HistoricalData.jsx`)

- **Global Archive Search Bar**: Real-time filtering by storm name, year, or landfall province.
- **Category Filter Chips**: Instant filtering by Category 2, 3, 4, or 5 intensity.
- **Summary Metrics Strip**: Total recorded events, Cat 4-5 frequency, average peak wind speed, and date span.
- **Multi-Column Sortable Table**:
  - Clickable headers with directional sort arrows (`↑` / `↓`).
  - Columns: Name, Year, Category, Max Wind, Min Pressure, Landfall Location, Fatalities, Economic Damage (₹ Cr).

---

### 3.8 Reports & Official Bulletins (`Reports.jsx`)

- **Template Gallery**: Pre-formatted templates for Daily Cyclone Bulletins, Special Landfall Warnings, Post-Event Technical Reports, and Public Advisories.
- **Quick Report Builder**: Form pre-populated directly from active telemetry with one click.
- **Live Textarea Editor**: Pre-filled with standardized IMD meteorological bulletin phraseology.
- **Export & Broadcast Actions**:
  - `Generate PDF`: Compiles bulletin with charts and maps for administrative distribution.
  - `Email Distribution`: Dispatches bulletin to registered state disaster management authorities (NDRF, SDMA).
- **Recent Bulletins Archive**: Audit log of previously generated advisories with publication status tags.

---

### 3.9 System Configuration (`Settings.jsx`)

- **Data Ingestion Feeds**: Individual toggle switches enabling/disabling satellite channels and setting update frequencies.
- **AI Model Zoo Management**: Real-time accuracy metrics and update buttons for detection, tracking, and intensity models.
- **Alert & Notification Rules**: Automated triggers for rapid intensification, landfall warnings, SMS dispatches, and email lists.
- **User & Access Management**: Role-based roster displaying active forecaster statuses, designations, and permissions.

---

## 4. Complete Button & Interactive Elements Inventory

| Element | Location | Trigger Type | Action & Destination |
|---|---|---|---|
| **Notification Bell** | TopNav | Click | Opens active emergency alert drawer |
| **User Profile Pill** | TopNav | Click | Displays forecaster credentials & shift status |
| **Sidebar Collapse** | SideNav | Click | Toggles sidebar between 224px and 64px width |
| **Navigation Links (8)** | SideNav | Click | Navigates between routes with active highlight |
| **View Details CTA** | CycloneCard | Click | Navigates to `/forecast` with storm state pre-loaded |
| **Map Layer Toggles** | CycloneMap | Click | Switches map raster layer (Satellite/IR/WV/Radar) |
| **Cyclone Map Markers** | CycloneMap | Click | Opens popup with live wind/pressure telemetry |
| **Source Tabs** | SatelliteFeed | Click | Switches active satellite feed (INSAT/GOES/Meteosat) |
| **Band Selector** | SatelliteFeed | Click | Toggles spectral channel (IR, VIS, Water Vapor, RGB) |
| **Compare Mode** | SatelliteFeed | Click | Toggles side-by-side dual satellite imagery comparison |
| **Timeline Scrubber** | SatelliteFeed | Drag / Input | Steps backward/forward through 24-hour imagery |
| **Brightness/Contrast** | SatelliteFeed | Slider | Real-time CSS filter adjustments on satellite canvas |
| **Run Detection** | Detection | Click | Executes AI object detection inference on frame |
| **Model Selector** | Detection | Dropdown | Selects active neural network architecture |
| **Confidence Slider** | Detection | Drag / Input | Filters out bounding boxes below threshold % |
| **Upload Image** | Classification | File Dialog | Ingests external satellite GeoTIFF/PNG for analysis |
| **Batch Process** | Classification | Click | Executes batch pattern classification across frames |
| **Export Report** | Classification | Click | Generates and downloads PDF classification report |
| **Run AI Prediction**| TrackForecast | Click | Triggers forward 96-hour ML trajectory model |
| **Export PDF** | TrackForecast | Click | Exports track forecast summary and landfall coordinates |
| **Issue Alert** | TrackForecast | Click | Dispatches emergency alert to disaster response teams |
| **Category Filter** | HistoricalData| Click | Filters table by storm severity category |
| **Table Header Sort** | HistoricalData| Click | Re-sorts archive ascending/descending by column |
| **Export CSV** | HistoricalData| Click | Downloads historical climatological dataset as CSV |
| **Generate Bulletin**| Reports | Click | Compiles selected template into official IMD bulletin |
| **Auto-populate** | Reports | Click | Ingests active cyclone metrics into bulletin text fields |
| **Email Distribution**| Reports | Click | Broadcasts bulletin to NDRF/SDMA email channels |
| **Save Settings** | Settings | Click | Persists threshold and model configuration changes |

---

## 5. Technology Stack & Dependencies

- **Build Engine**: Vite v8 + React 18
- **Styling Architecture**: Tailwind CSS v4 + Custom Theme Design Tokens
- **Icons**: Lucide React (featherweight SVG icons)
- **Mapping & Geospatial**: Leaflet v1.9 + React-Leaflet v5 (Dark Matter CartoDB tiles)
- **Charts & Data Visualization**: Recharts v2 (AreaChart, LineChart, RadarChart, ResponsiveContainer)
- **Routing**: React Router DOM v7

---

## 6. How to Run Locally

```bash
# 1. Navigate to the project directory
cd C:\Users\GoldBerg\Desktop\cyclone-ai

# 2. Install dependencies (if needed)
npm install

# 3. Start development server
npm run dev

# 4. Open in browser:
# http://localhost:5173
```
