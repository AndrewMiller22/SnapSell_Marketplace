

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container text-center py-5 my-5">
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <p className="fs-4 text-muted mb-4">Page not found.</p>
      <Link to="/" className="btn btn-primary">
        Go to Home
      </Link>
    </div>
  );
}
