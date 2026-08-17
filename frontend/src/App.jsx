

import { Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ListingDetails from './pages/ListingDetails';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import SellerQuestions from './pages/SellerQuestions';
import CreateListing from './pages/CreateListing';
import './App.css';

/*
 * PERSON 2 – uncomment these once you create the remaining pages:
 * import EditListing from './pages/EditListing';
 * import MyListings from './pages/MyListings';
 */

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="app-main">
        <Routes>
          {/* Public marketplace routes (Person 3) */}
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/listings/:id" element={<ListingDetails />} />

          {/* Public auth routes (Person 1) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure route (Person 1) - anonymous visitors are sent to login */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/messages"
            element={
              <ProtectedRoute>
                <SellerQuestions />
              </ProtectedRoute>
            }
          />

          {/* Keep old bookmarks working while presenting the feature as Messages. */}
          <Route path="/seller/questions" element={<Navigate to="/seller/messages" replace />} />

          <Route
            path="/listings/create"
            element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/listings/edit/:id"
            element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            }
          />

          {/* Person 2 – replace null with your remaining page components */}
          <Route path="/my-listings" element={null} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="app-footer bg-dark text-white-50 text-center py-3 small">
        {`(c) ${new Date().getFullYear()} SnapSell Marketplace`}
      </footer>
    </AuthProvider>
  );
}
