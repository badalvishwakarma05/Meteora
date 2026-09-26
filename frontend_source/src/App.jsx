import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { DisasterAlertProvider } from './context/DisasterAlertContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminProtectedRoute, CitizenProtectedRoute } from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import CitizenLayout from './components/CitizenLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import SatelliteFeed from './pages/SatelliteFeed';
import Detection from './pages/Detection';
import Classification from './pages/Classification';
import TrackForecast from './pages/TrackForecast';
import HistoricalData from './pages/HistoricalData';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DisasterAlertProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* 1. Landing Page / Authentication Portal */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LandingPage />} />

                {/* 2. Citizen Safety & Emergency Portal (Strictly for Authenticated Citizens) */}
                <Route
                  element={
                    <CitizenProtectedRoute>
                      <CitizenLayout />
                    </CitizenProtectedRoute>
                  }
                >
                  <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
                </Route>

                {/* 3. Administrator Command Center (Strictly for Authenticated Forecasters / Admins) */}
                <Route
                  element={
                    <AdminProtectedRoute>
                      <AppLayout />
                    </AdminProtectedRoute>
                  }
                >
                  <Route path="/dashboard"      element={<Dashboard />} />
                  <Route path="/satellite"      element={<SatelliteFeed />} />
                  <Route path="/detection"      element={<Detection />} />
                  <Route path="/classification" element={<Classification />} />
                  <Route path="/forecast"       element={<TrackForecast />} />
                  <Route path="/historical"     element={<HistoricalData />} />
                  <Route path="/reports"        element={<Reports />} />
                  <Route path="/settings"       element={<Settings />} />
                </Route>

                {/* Catch-all redirect to Landing Page */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </DisasterAlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
