/* SnapSell Marketplace - Register Page
  Description: Collects the new user's details, creates the account through the
  API, then logs them straight in. */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // The API never sees confirmPassword, so it is checked here
    if (form.password !== form.confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await registerUser({
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password
      });

      // Registering returns a token, so the new user is logged in right away
      login(response.data, response.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h4 fw-bold mb-1">Create your account</h1>
              <p className="text-muted small mb-4">
                Join SnapSell to buy and sell locally.
              </p>

              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">Full name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                  <div className="form-text">Letters, numbers and underscores only.</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
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
                  <div className="form-text">At least 6 characters.</div>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? 'Creating account…' : 'Register'}
                </button>
              </form>

              <p className="text-center text-muted small mt-4 mb-0">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
