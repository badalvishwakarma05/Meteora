# CycloneAI — UI Architecture & Element Analysis Specification
**Project:** Artificial Intelligence (AI) / Machine Learning (ML) Based System for Identification, Classification, and Prediction of Tropical Cyclone Patterns Using Multi-Source Satellite Data  
**Organization:** Ministry of Earth Sciences (MoES)  
**Department:** India Meteorological Department (IMD)  
**Category:** Software | **Theme:** Disaster Management  

---

## 1. Executive Summary & Design Philosophy

The CycloneAI user interface is designed as an operational, 24/7 mission-critical command center web application for meteorologists, forecasters, and disaster management authorities. Its purpose is to ingest high-volume, multi-source satellite streams (INSAT-3D, INSAT-3DR, Doppler Weather Radar, and global constellations), apply real-time computer vision and machine learning inference, and present actionable intelligence with zero cognitive overload.

### Key Design Pillars:
1. **Operational Mission-Control Palette**: Built on deep navy and slate surfaces (#081220, #0c1b33) to eliminate eye strain during prolonged shifts in low-light command rooms.
2. **Dynamic Cyclone Approach Theming**: The interface dynamically morphs its aesthetic, ambient illumination, alerts, and KPIs based on meteorological threat severity:
   - **Normal / Calm Condition**: Emerald/cyan glow, fair-weather maritime safety indicators, and low depression monitoring.
   - **Intermediate Advisory**: Sunset amber glow, squally wind alerts, Category 1–2 advisory tracking, and cautionary port signals.
   - **Severe Threat Emergency**: Deep crimson alert glow, Great Danger Signal IX/X, hurricane-force wind indicators, and imminent landfall warnings.
3. **Institutional Entry Portal (/)**: Dedicated front page featuring the official institutional crest, system description, operational capability blocks, and instant 1-click Login to access command center that auto-authenticates operational staff directly into the protected dashboard.
4. **Clean, Uncluttered Interface**: All legacy or redundant options (such as Front Portal within the dashboard) have been eliminated. Every control in the Top Navigation and Side Navigation is purpose-built.
5. **High-Precision GIS Mapping**: Fully functional GIS engine powered by ArcGIS World Dark Gray Canvas and World Imagery with zero watermarks, interactive track polylines, and cone-of-uncertainty overlays.

---

## 2. Complete UI Architecture

### 2.1 Component Hierarchy Tree

App.jsx (BrowserRouter + AuthProvider + ToastProvider)
│
├── Public Routes
│   └── / (LandingPage.jsx - Institutional Entry Portal with 1-Click Login)
│
└── Protected Routes (Wrapped in ProtectedRoute.jsx)
    └── AppLayout.jsx (Master Shell: Flex-column, 100vh)
        │
        ├── TopNav.jsx (Persistent Global Header)
        │   ├── IMD Crest & CycloneAI Branding
        │   ├── Real-Time Indian Standard Time (IST) Clock (1Hz tick)
        │   ├── Live Satellite Ground Station Telemetry Beacon
        │   ├── Emergency Notification Drawer with Unread Count & Dismiss
        │   └── Operator Profile Dropdown (Dr. M. Kumar - Sign Out)
        │
        └── Main Shell (Flex-row, flex-1, overflow-hidden)
            │
            ├── SideNav.jsx (Collapsible Sidebar, w-60 <-> w-18)
            │   ├── Brand Icon & Text
            │   ├── 8 Active Route Links with Cyan Active Pills
            │   ├── Collapse/Expand Floating Button
            │   └── Sign Out Action
            │
            └── <Outlet /> (Dynamic Route Viewport, flex-1, overflow-y-auto)
                ├── /dashboard        -> Dashboard.jsx (Dynamic Approach Theming)
                ├── /satellite        -> SatelliteFeed.jsx (Multi-Spectral Ingestion)
                ├── /detection        -> Detection.jsx (YOLO-v8 / ViT Inference)
                ├── /classification   -> Classification.jsx (Automated Dvorak Gauges)
                ├── /forecast         -> TrackForecast.jsx (96h Trajectory Ensemble)
                ├── /historical       -> HistoricalData.jsx (Climatological Archive)
                ├── /reports          -> Reports.jsx (Automated IMD Bulletins)
                └── /settings         -> Settings.jsx (Sensors, Thresholds & Models)

### 2.2 Dynamic Threat Theming Engine (Dashboard.jsx)

The dashboard features a reactive state machine (pproachCondition: 'calm' | 'intermediate' | 'severe'):
- **Ambient Lighting**: CSS radial gradients with lur-[120px] that dynamically transition between emerald (#00e676), amber (#ff9100), and crimson (#ff1744).
- **Condition Controller Bar**: Interactive 3-stage switch allowing forecasters to preview or respond to changing basin threat levels.
- **Active Cyclone Selection**: Clicking any active storm card automatically switches the dashboard's theme to match that cyclone's severity.
- **Synchronized Visuals**: KPI cards, GIS threat markers, advisory banners, and the intensity curve graph stroke and gradient dynamically adapt to the active condition.

---

## 3. Exhaustive Analysis of Every UI Element

### 3.1 Front Entry Portal (LandingPage.jsx)
- **Institutional Top Strip**: MoES & IMD authority metadata with 24/7 operational indicators.
- **App Crest**: Glowing cyan shield icon with pulse animation.
- **1-Click Command Center Login**: Login to access command center button that automatically fills credentials and unlocks the dashboard.
- **Operational Feature Showcase**: 6 interactive feature cards detailing real-time tracking, satellite feeds, AI detection, Dvorak classification, trajectory forecasts, and bulletin generation.
- **Authentication Modal**: Full manual login and registration dialog for new forecasters.

### 3.2 Global Header (TopNav.jsx)
- **IMD Gradient Crest**: High-contrast icon linking back to /dashboard.
- **Live IST Engine**: Precision 24-hour clock formatted as DD-MMM-YYYY HH:mm:ss IST.
- **Telemetry Beacon**: Live network pulse confirming telemetry synchronization.
- **Emergency Notification Drawer**: Slide-over panel displaying real-time cyclone alerts with Acknowledge and Dismiss actions.
- **Operator Menu**: Forecaster profile pill with instant Sign Out action.

### 3.3 Collapsible Sidebar (SideNav.jsx)
- **8 Dedicated Routes**: Dashboard, Satellite Feed, Detection, Classification, Track & Forecast, Historical Data, Reports, Settings.
- **Active State**: High-visibility cyan fill (#00d4ff) with dark typography.
- **Collapse Toggle**: Smooth transition between expanded (240px) and icon-only (72px) viewports to maximize workspace.
- **Sign Out**: Clean logout button at the bottom (legacy Front Portal removed).

### 3.4 Operational Dashboard (Dashboard.jsx)
- **Dynamic Approach Controller**: 3-stage condition selector (Normal / Calm, Intermediate, Severe Threat).
- **Dynamic Advisory Strip**: Responsive warning banner updating advice according to threat level.
- **4 Key Performance Indicators (KPIs)**:
  1. *Active Systems*: Count and organization level.
  2. *Peak Basin Wind*: Sustained surface velocity in km/h.
  3. *Coastal Danger Signal*: Standard port cautionary signal (e.g. Signal IX).
  4. *Next Satellite Pass*: Real-time countdown timer to next downlink.
- **GIS Synoptic Map (CycloneMap.jsx)**: Clean ArcGIS World Dark Gray Base with layer switcher, active storm markers, observed historical path, and 72h AI trajectory cone.
- **Active Tropical Systems Stack (CycloneCard.jsx)**: Glassmorphic cards with intensity category badges, peak winds, central pressure, and one-click deep link to ensemble forecasts.
- **Dynamic Intensity Curve**: Recharts area chart with ±24h, ±48h, and ±72h toggles, dynamic color gradients, and reference lines.
- **Live Satellite Ingestion Feed**: High-resolution INSAT-3D thermal infrared preview with channel switcher.

---

## 4. Interactive Elements & Actions Inventory

| Element | Location | Trigger | Action & Result |
|---|---|---|---|
| **Login to Access Command Center** | LandingPage | Click | Auto-authenticates and navigates to /dashboard |
| **Feature Cards (1–6)** | LandingPage | Click | Auto-authenticates and opens specific route |
| **Register New Account** | LandingPage | Click | Opens user registration modal |
| **Condition Pills (Calm / Inter / Severe)**| Dashboard | Click | Morphs dashboard theme, ambient glow, and KPIs |
| **Cyclone Card Selection** | Dashboard | Click | Updates selected storm and syncs approach theme |
| **Forecast Deep Link** | CycloneCard | Click | Navigates to /forecast with storm state pre-loaded |
| **Map Layer Switcher** | CycloneMap | Click | Toggles between Dark Canvas, Satellite, Oceanic & Atmospheric |
| **Intensity Range Toggles** | Dashboard | Click | Switches chart display window between ±24h, ±48h, ±72h |
| **Alert Bell & Actions** | TopNav | Click | Toggles notification drawer; acknowledge/dismiss alerts |
| **Operator Profile & Sign Out** | TopNav / SideNav | Click | Clears session, displays toast, redirects to / |
| **Sidebar Collapse/Expand** | SideNav | Click | Expands or minimizes sidebar width |

---

## 5. Technology Stack & Verification

- **Frontend Core**: React 18 + Vite v8 + React Router DOM v7
- **Styling**: Tailwind CSS v4 + custom glassmorphic tokens & dynamic gradients
- **Mapping**: Leaflet v1.9 + React-Leaflet v5 (ArcGIS World Dark Gray Base & World Imagery)
- **Data Visualizations**: Recharts v2 (AreaChart, ResponsiveContainer, Custom Tooltips)
- **Icons**: Lucide React
- **Authentication**: Custom AuthContext with persistent session state and ProtectedRoute guards

---

## 6. How to Run Locally

`ash
# 1. Open project directory
cd C:\Users\GoldBerg\Desktop\cyclone-ai

# 2. Build production assets
npm run build

# 3. Launch local preview server
npm run preview -- --port 5173 --host
# Access via: http://localhost:5173
`
