

import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ListingDetails from './pages/ListingDetails';
import NotFound from './pages/NotFound';
import './App.css';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="bg-dark text-white-50 text-center py-3 mt-5 small">
        {`(c) ${new Date().getFullYear()} SnapSell Marketplace`}
      </footer>
    </>
  );
}