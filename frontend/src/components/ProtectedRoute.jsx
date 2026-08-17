/* SnapSell Marketplace - Protected Route
  Description: Wraps any page that needs a login. Anonymous visitors are sent
  to the login page instead. */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Remember where they were going so login can send them back there
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
