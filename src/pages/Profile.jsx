/* SnapSell Marketplace - Profile Page
  Description: Secure page where the logged-in user views and updates their
  details. The password is optional - leaving it blank keeps the current one. */

import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone
} from '../utils/contactValidation';

export default function Profile() {
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [joinedOn, setJoinedOn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const { login } = useAuth();

  // Read from the API rather than saved state, so the page always shows what is actually in the database
  useEffect(() => {
    getUserProfile()
      .then((response) => {
        setForm((current) => ({
          ...current,
          fullName: response.data.fullName,
          username: response.data.username,
          email: response.data.email,
          phone: response.data.phone || ''
        }));
        setJoinedOn(response.data.createdAt);
      })
      .catch(() => setError('Failed to load your profile. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.password !== form.confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isValidPhone(form.phone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setSaving(true);

    try {
      const updates = {
        fullName: form.fullName,
        username: form.username,
        email: normalizeEmail(form.email),
        phone: normalizePhone(form.phone)
      };

      // Only send a password when a new one was typed
      if (form.password) {
        updates.password = form.password;
      }

      const response = await updateUserProfile(updates);

      // Refresh the saved session so the navbar shows the new username
      login(response.data, response.token);

      setForm({ ...form, password: '', confirmPassword: '' });
      setSuccess('Your profile has been updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h4 fw-bold mb-1">My profile</h1>
              {joinedOn && (
                <p className="text-muted small mb-4">
                  Member since {new Date(joinedOn).toLocaleDateString()}
                </p>
              )}

              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success py-2" role="alert">
                  {success}
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
                  />
                </div>

                <div className="mb-4">
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

                <div className="mb-4">
                  <label htmlFor="phone" className="form-label">Phone number</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="4165550123"
                    autoComplete="tel"
                    required
                  />
                  <div className="form-text">Exactly 10 digits are required.</div>
                </div>

                <hr className="my-4" />

                <h2 className="h6 fw-bold mb-1">Change password</h2>
                <p className="text-muted small mb-3">
                  Leave both boxes empty to keep your current password.
                </p>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">New password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">Confirm new password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
