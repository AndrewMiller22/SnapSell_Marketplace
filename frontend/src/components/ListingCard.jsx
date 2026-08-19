

import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const categoryHighlight = (category, details) => {
  if (!details) return null;
  switch (category) {
    case 'Vehicles': {
      const parts = [details.year, details.make, details.model].filter(Boolean);
      const sub = [details.colour, details.mileage ? `${Number(details.mileage).toLocaleString()} km` : null].filter(Boolean);
      return { primary: parts.join(' '), secondary: sub.join(' · ') };
    }
    case 'Electronics':
      return { primary: [details.brand, details.model].filter(Boolean).join(' '), secondary: details.storageCapacity || '' };
    case 'Clothing':
      return { primary: details.brand || '', secondary: [details.size, details.colour, details.gender].filter(Boolean).join(' · ') };
    case 'Sports':
      return { primary: details.brand || '', secondary: [details.sportType, details.size].filter(Boolean).join(' · ') };
    case 'Collectibles':
      return { primary: details.era || '', secondary: details.brand || '' };
    case 'Home and Garden':
      return { primary: details.roomType || '', secondary: details.material || '' };
    default:
      return null;
  }
};

export default function ListingCard({ listing }) {
  const { _id, title, price, category, condition, location, status, images, categoryDetails } = listing;
  const thumbnail = images && images.length > 0 ? images[0] : null;
  const isVideo = thumbnail && thumbnail.startsWith('data:video/');
  const mediaCount = images ? images.length : 0;
  const highlight = categoryHighlight(category, categoryDetails);

  return (
    <div className="col">
      <div className="card h-100 shadow-sm listing-card">
        {/* Thumbnail / placeholder */}
        <div className="listing-card__media-wrap position-relative">
          {thumbnail ? (
            isVideo ? (
              <video
                src={thumbnail}
                className="card-img-top listing-card__img"
                muted
                playsInline
              />
            ) : (
              <img
                src={thumbnail}
                alt={title}
                className="card-img-top listing-card__img"
              />
            )
          ) : (
            <div className="listing-card__placeholder d-flex align-items-center justify-content-center bg-light text-muted">
              <span className="fs-1">📷</span>
            </div>
          )}
          {mediaCount > 1 && (
            <span className="listing-card__media-count">
              🖼 {mediaCount}
            </span>
          )}
        </div>

        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <h6 className="card-title mb-0 fw-semibold text-truncate me-2">{title}</h6>
            <StatusBadge status={status} />
          </div>

          {highlight && highlight.primary && (
            <p className="text-dark small fw-semibold mb-0">{highlight.primary}</p>
          )}
          {highlight && highlight.secondary && (
            <p className="text-muted small mb-1">{highlight.secondary}</p>
          )}

          <p className="text-muted small mb-1">
            {category} &bull; {condition}
          </p>
          <p className="text-muted small mb-2">
            📍 {location?.city || location?.address || 'Location not specified'}
          </p>

          <p className="fw-bold text-primary fs-5 mt-auto mb-0">
            ${Number(price).toFixed(2)}
          </p>
        </div>

        <div className="card-footer bg-transparent border-0 pt-0">
          <Link
            to={`/listings/${_id}`}
            className="btn btn-outline-primary btn-sm w-100"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
