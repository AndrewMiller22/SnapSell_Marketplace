/* SnapSell Marketplace - Login Page
  Description: Sends the login identifier and password to the API, saves the returned user
  and token, then redirects. */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ProtectedRoute passes the page they wanted, otherwise go home
  const redirectTo = location.state?.from || '/';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await loginUser(form);
      login(response.data, response.token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // The API sends a readable message, e.g. "Invalid login details"
      setError(err.response?.data?.message || 'Unable to log in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h4 fw-bold mb-1">Welcome back</h1>
              <p className="text-muted small mb-4">
                Log in to post and manage your listings.
              </p>

              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="identifier" className="form-label">Email, phone number or username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="identifier"
                    name="identifier"
                    value={form.identifier}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? 'Logging in…' : 'Login'}
                </button>
              </form>

              <p className="text-center text-muted small mt-4 mb-0">
                Don&apos;t have an account? <Link to="/register">Register</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
