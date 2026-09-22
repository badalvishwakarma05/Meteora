import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AdminProtectedRoute({ children }) {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Strict Privacy: Citizens cannot access Administrator Command Center
  if (currentUser?.role === 'Citizen') {
    return <Navigate to="/citizen/dashboard" replace />;
  }

  return children;
}

export function CitizenProtectedRoute({ children }) {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Strict Privacy: Administrators cannot access Citizen Portal
  if (currentUser?.role !== 'Citizen') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
