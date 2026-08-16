

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchListingById } from '../api/listingsApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import QuestionSection from '../components/QuestionSection';
import ListingHistory from '../components/ListingHistory';
import { useAuth } from '../context/AuthContext';

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchListingById(id)
      .then((data) => setListing(data.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('Listing not found.');
        } else {
          setError('Could not load this listing. Please try again later.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container my-5"><LoadingSpinner /></div>;

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/marketplace" className="btn btn-outline-primary">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const {
    title,
    description,
    price,
    category,
    condition,
    location,
    sellerName,
    images,
    status,
    createdAt,
  } = listing;

  const ownerId = listing.owner?._id || listing.owner;
  const isOwner = Boolean(user?.id && ownerId && String(user.id) === String(ownerId));

  return (
    <div className="container my-5">
      <Link to="/marketplace" className="btn btn-outline-secondary btn-sm mb-4">
        ← Back to Marketplace
      </Link>

      <div className="row g-4">
        {/* Image gallery / placeholder */}
        <div className="col-lg-6">
          {images && images.length > 0 ? (
            <div
              id="listingCarousel"
              className="carousel slide border rounded shadow-sm"
              data-bs-ride="carousel"
            >
              <div className="carousel-inner">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className={`carousel-item${i === 0 ? ' active' : ''}`}
                  >
                    <img
                      src={src}
                      alt={`${title} – image ${i + 1}`}
                      className="d-block w-100 listing-detail__img"
                    />
                  </div>
                ))}
              </div>
              {images.length > 1 && (
                <>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#listingCarousel"
                    data-bs-slide="prev"
                  >
                    <span className="carousel-control-prev-icon" />
                    <span className="visually-hidden">Previous</span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#listingCarousel"
                    data-bs-slide="next"
                  >
                    <span className="carousel-control-next-icon" />
                    <span className="visually-hidden">Next</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="listing-detail__placeholder d-flex align-items-center justify-content-center bg-light border rounded shadow-sm text-muted">
              <span className="display-1">📷</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="col-lg-6">
          <div className="d-flex align-items-start gap-2 mb-2">
            <h1 className="h3 fw-bold mb-0">{title}</h1>
            <StatusBadge status={status} />
          </div>

          <p className="display-6 fw-bold text-primary mb-3">
            ${Number(price).toFixed(2)}
          </p>

          <dl className="row small mb-3">
            <dt className="col-5 text-muted">Category</dt>
            <dd className="col-7">{category}</dd>

            <dt className="col-5 text-muted">Condition</dt>
            <dd className="col-7">{condition}</dd>

            <dt className="col-5 text-muted">Location</dt>
            <dd className="col-7">
              {[location?.address, location?.city, location?.province, location?.postalCode]
                .filter(Boolean)
                .join(', ') || 'Not specified'}
            </dd>

            <dt className="col-5 text-muted">Seller</dt>
            <dd className="col-7">{sellerName}</dd>

            <dt className="col-5 text-muted">Listed</dt>
            <dd className="col-7">
              {new Date(createdAt).toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </dd>
          </dl>

          <h5 className="fw-semibold">Description</h5>
          <p className="text-secondary" style={{ whiteSpace: 'pre-line' }}>
            {description}
          </p>

          {isOwner && (
            <Link to={`/listings/edit/${id}`} className="btn btn-primary btn-sm mt-2">
              Edit Listing
            </Link>
          )}

        </div>
      </div>
      {!isOwner && <QuestionSection listingId={id} />}
      <ListingHistory listingId={id} />
    </div>
  );
}
