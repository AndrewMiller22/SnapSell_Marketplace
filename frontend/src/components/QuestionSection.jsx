import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitQuestion } from '../api/questionsApi';
import { useAuth } from '../context/AuthContext';

export default function QuestionSection({ listingId, sellerName }) {
  const { token, user } = useAuth();
  const [question, setQuestion] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setShowModal(true);
      return;
    }
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await submitQuestion(listingId, { question }, token);
      setQuestion('');
      setMessage('Your message was sent to the seller.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send your message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-5">
      <form className="card card-body" onSubmit={handleSubmit}>
        <h2 className="h5 mb-1">Message {sellerName || 'the seller'}</h2>
        <p className="small text-muted mb-3">
          Your message is private and only visible to {sellerName || 'the seller'}.
        </p>

        {message && <div className="alert alert-success py-2">{message}</div>}
        {error && <div className="alert alert-danger py-2">{error}</div>}

        {user && (
          <p className="small text-muted mb-2">
            Sending as <strong>{user.fullName || user.username}</strong>
          </p>
        )}

        <label className="form-label" htmlFor="question">Message</label>
        <textarea
          id="question"
          className="form-control mb-3"
          rows="3"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          minLength={user ? 5 : undefined}
          maxLength="500"
          required={!!user}
          placeholder={!user ? 'Sign in to send a message…' : ''}
        />

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send message'}
        </button>
      </form>

      {showModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Sign in to send a message</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                </div>
                <div className="modal-body pt-3 pb-4">
                  <div className="row g-0">
                    <div className="col-sm-6 text-center pe-sm-3 border-end">
                      <h6 className="fw-semibold mb-1">New here?</h6>
                      <p className="small text-muted mb-3">Create a free account to message sellers.</p>
                      <Link
                        to="/register"
                        className="btn btn-primary w-100"
                        onClick={() => setShowModal(false)}
                      >
                        Register account
                      </Link>
                    </div>
                    <div className="col-sm-6 text-center ps-sm-3 mt-4 mt-sm-0">
                      <h6 className="fw-semibold mb-1">Have an account?</h6>
                      <p className="small text-muted mb-3">Log in to continue.</p>
                      <Link
                        to="/login"
                        className="btn btn-outline-primary w-100"
                        onClick={() => setShowModal(false)}
                      >
                        Log in
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </section>
  );
}
