

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchListingById } from '../api/listingsApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import QuestionSection from '../components/QuestionSection';
import ListingHistory from '../components/ListingHistory';
import { useAuth } from '../context/AuthContext';

const categoryDetailLabels = {
  Vehicles: { year: 'Year', make: 'Make', model: 'Model', colour: 'Colour', mileage: 'Mileage', transmission: 'Transmission', fuelType: 'Fuel Type' },
  Electronics: { brand: 'Brand', model: 'Model', storageCapacity: 'Storage', screenSize: 'Screen Size' },
  'Home and Garden': { material: 'Material', dimensions: 'Dimensions', roomType: 'Room / Area' },
  Clothing: { brand: 'Brand', size: 'Size', colour: 'Colour', gender: 'For' },
  Sports: { brand: 'Brand', sportType: 'Sport', size: 'Size' },
  Collectibles: { era: 'Era / Year', brand: 'Brand / Maker', material: 'Material' },
};

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);

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

  if (error || !listing) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">{error || 'This listing could not be loaded.'}</div>
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
    categoryDetails,
  } = listing;

  const ownerId = listing.owner?._id || listing.owner;
  const isOwner = Boolean(user?.id && ownerId && String(user.id) === String(ownerId));

  const mediaList = images || [];
  const activeMedia = mediaList[activeIdx] || null;
  const isActiveVideo = activeMedia && activeMedia.startsWith('data:video/');
  const detailLabels = categoryDetailLabels[category] || {};
  const detailEntries = Object.entries(detailLabels).filter(
    ([key]) => categoryDetails && categoryDetails[key]
  );

  return (
    <div className="container my-5">
      <Link to="/marketplace" className="btn btn-outline-secondary btn-sm mb-4">
        ← Back to Marketplace
      </Link>

      <div className="row g-4">
        {/* Media gallery */}
        <div className="col-lg-7">
          {mediaList.length > 0 ? (
            <>
              {/* Main viewer */}
              <div className="listing-detail__main-media border rounded-3 shadow-sm overflow-hidden mb-2">
                {isActiveVideo ? (
                  <video
                    key={activeMedia}
                    src={activeMedia}
                    className="d-block w-100 listing-detail__img"
                    controls
                    playsInline
                  />
                ) : (
                  <img
                    key={activeMedia}
                    src={activeMedia}
                    alt={`${title} – photo ${activeIdx + 1}`}
                    className="d-block w-100 listing-detail__img"
                  />
                )}
              </div>

              {/* Thumbnail strip */}
              {mediaList.length > 1 && (
                <div className="listing-detail__thumbs d-flex gap-2 flex-wrap">
                  {mediaList.map((src, i) => {
                    const isVid = src.startsWith('data:video/');
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveIdx(i)}
                        className={`listing-detail__thumb-btn p-0 border-0 rounded-2 overflow-hidden ${i === activeIdx ? 'listing-detail__thumb-btn--active' : ''}`}
                        aria-label={`View ${isVid ? 'video' : 'photo'} ${i + 1}`}
                      >
                        {isVid ? (
                          <div className="listing-detail__thumb-video-wrap">
                            <video src={src} className="listing-detail__thumb" muted playsInline />
                            <span className="listing-detail__thumb-play">▶</span>
                          </div>
                        ) : (
                          <img src={src} alt={`Thumbnail ${i + 1}`} className="listing-detail__thumb" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="listing-detail__placeholder d-flex align-items-center justify-content-center bg-light border rounded shadow-sm text-muted">
              <span className="display-1">📷</span>
            </div>
          )}
        </div>

        {/* Details panel */}
        <div className="col-lg-5">
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

            {/* Category-specific fields */}
            {detailEntries.map(([key, label]) => (
              <>
                <dt key={`dt-${key}`} className="col-5 text-muted">{label}</dt>
                <dd key={`dd-${key}`} className="col-7">
                  {key === 'mileage'
                    ? `${Number(categoryDetails[key]).toLocaleString()} km`
                    : categoryDetails[key]}
                </dd>
              </>
            ))}

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
      {!isOwner && <QuestionSection listingId={id} sellerName={sellerName} />}
      <ListingHistory listingId={id} />
    </div>
  );
}
