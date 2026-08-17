

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchListings } from '../api/listingsApi';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchListings({ status: 'Available' })
      .then((data) => setListings(data.data.slice(0, 6)))
      .catch(() => setError('Could not load listings. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero-section text-white text-center py-5">
        <div className="container py-3">
          <h1 className="display-4 fw-bold mb-3">Buy and Sell Locally</h1>
          <p className="lead mb-4">
            SnapSell connects buyers and sellers in your community. Browse
            thousands of listings across every category.
          </p>
          <Link to="/marketplace" className="btn btn-light btn-lg px-4 fw-semibold">
            Browse Marketplace
          </Link>
        </div>
      </section>

      {/* Featured listings */}
      <section className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 fw-bold mb-0">Recent Listings</h2>
          <Link to="/marketplace" className="btn btn-outline-primary btn-sm">
            View All →
          </Link>
        </div>

        {loading && <LoadingSpinner />}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="text-center text-muted py-5">
            <p className="fs-5">No active listings yet. Check back soon!</p>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* Category quick-links */}
      <section className="bg-light py-5">
        <div className="container">
          <h2 className="h4 fw-bold mb-4 text-center">Browse by Category</h2>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {[
              'Electronics',
              'Vehicles',
              'Home and Garden',
              'Clothing',
              'Sports',
              'Collectibles',
              'Other',
            ].map((cat) => (
              <Link
                key={cat}
                to={`/marketplace?category=${encodeURIComponent(cat)}`}
                className="btn btn-outline-primary"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
