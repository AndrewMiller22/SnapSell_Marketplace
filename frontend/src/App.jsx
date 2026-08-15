

import { Routes, Route } from 'react-router-dom';
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
import './App.css';

/*
 * PERSON 2 – uncomment these once you create the pages:
 * import CreateListing from './pages/CreateListing';
 * import EditListing from './pages/EditListing';
 * import MyListings from './pages/MyListings';
 */

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main>
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

          {/* Person 2 – replace null with your page components */}
          <Route path="/listings/create" element={null} />
          <Route path="/listings/edit/:id" element={null} />
          <Route path="/my-listings" element={null} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="bg-dark text-white-50 text-center py-3 mt-5 small">
        {`(c) ${new Date().getFullYear()} SnapSell Marketplace`}
      </footer>
    </AuthProvider>
  );
}