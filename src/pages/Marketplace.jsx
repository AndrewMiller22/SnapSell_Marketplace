

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchListings } from '../api/listingsApi';
import ListingCard from '../components/ListingCard';
import SearchFilters from '../components/SearchFilters';
import LoadingSpinner from '../components/LoadingSpinner';

const EMPTY_FILTERS = { search: '', category: '', status: '' };

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
  });

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadListings = useCallback((activeFilters) => {
    setLoading(true);
    setError(null);

    const params = Object.fromEntries(
      Object.entries(activeFilters).filter(([, v]) => v !== '')
    );

    fetchListings(params)
      .then((data) => setListings(data.data))
      .catch(() => setError('Failed to load listings. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '')
    );
    setSearchParams(params, { replace: true });
    loadListings(filters);
  }, [filters, loadListings, setSearchParams]);

  const handleReset = () => setFilters(EMPTY_FILTERS);

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold mb-0">Marketplace</h1>
        <span className="text-muted small">
          {!loading && !error && `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`}
        </span>
      </div>

      <SearchFilters filters={filters} onChange={setFilters} onReset={handleReset} />

      {loading && <LoadingSpinner />}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="text-center text-muted py-5">
          <p className="fs-5">No listings match your search.</p>
          <button className="btn btn-outline-primary" onClick={handleReset}>
            Clear filters
          </button>
        </div>
      )}

      {!loading && !error && listings.length > 0 && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
