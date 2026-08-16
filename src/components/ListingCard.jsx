

import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function ListingCard({ listing }) {
  const { _id, title, price, category, condition, location, status, images } = listing;
  const thumbnail = images && images.length > 0 ? images[0] : null;

  return (
    <div className="col">
      <div className="card h-100 shadow-sm listing-card">
        {/* Thumbnail / placeholder */}
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="card-img-top listing-card__img"
          />
        ) : (
          <div className="listing-card__placeholder d-flex align-items-center justify-content-center bg-light text-muted">
            <span className="fs-1">📷</span>
          </div>
        )}

        <div className="card-body d-flex flex-column">
          {/* Status badge in top-right */}
          <div className="d-flex justify-content-between align-items-start mb-1">
            <h6 className="card-title mb-0 fw-semibold text-truncate me-2">{title}</h6>
            <StatusBadge status={status} />
          </div>

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
