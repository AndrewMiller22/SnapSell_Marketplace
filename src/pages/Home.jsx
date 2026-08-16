

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchListings } from '../api/listingsApi';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { parseSignupContact } from '../utils/contactValidation';

const categories = [
  'Electronics',
  'Vehicles',
  'Home and Garden',
  'Clothing',
  'Sports',
  'Collectibles',
  'Other',
];

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signupContact, setSignupContact] = useState('');
  const [signupError, setSignupError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings({ status: 'Available' })
      .then((data) => setListings(data.data.slice(0, 6)))
      .catch(() => setError('Could not load listings. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSignup = (event) => {
    event.preventDefault();
    const parsedContact = parseSignupContact(signupContact);

    if (parsedContact.error) {
      setSignupError(parsedContact.error);
      return;
    }

    setSignupError('');
    navigate('/register', {
      state: {
        signupContact: {
          type: parsedContact.type,
          value: parsedContact.value
        }
      }
    });
  };

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

          <div className="d-flex flex-wrap gap-2 justify-content-center mt-4" aria-label="Marketplace categories">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/marketplace?category=${encodeURIComponent(category)}`}
                className="btn btn-outline-light btn-sm hero-category-link"
              >
                {category}
              </Link>
            ))}
          </div>
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

        {!isAuthenticated && (
          <div className="signup-cta mt-5 mx-auto text-center text-white">
            <p className="text-uppercase small fw-semibold mb-2 signup-cta__eyebrow">
              Ready to join your local marketplace?
            </p>
            <h2 className="h3 fw-bold mb-3">Create your SnapSell account</h2>
            <p className="text-white-50 mb-4">
              Start buying, selling and messaging people in your community.
            </p>

            <form className="signup-contact-form mx-auto" onSubmit={handleSignup} noValidate>
              <label className="visually-hidden" htmlFor="signupContact">
                Email or phone number
              </label>
              <input
                id="signupContact"
                type="text"
                className="signup-contact-input"
                placeholder="Email or phone number"
                value={signupContact}
                onChange={(event) => {
                  setSignupContact(event.target.value);
                  if (signupError) setSignupError('');
                }}
                autoComplete="email"
                aria-describedby={signupError ? 'signupContactError' : undefined}
                aria-invalid={Boolean(signupError)}
              />
              <button className="btn btn-primary fw-semibold signup-contact-button" type="submit">
                Sign Up Now
              </button>
            </form>

            {signupError && (
              <p id="signupContactError" className="signup-error mt-2 mb-0" role="alert">
                {signupError}
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
