import { useState } from 'react';
import { submitQuestion } from '../api/questionsApi';
import { useAuth } from '../context/AuthContext';

export default function QuestionSection({ listingId }) {
  const { token, user } = useAuth();
  const [question, setQuestion] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    const form = { question };
    if (!user) {
      form.askerName = guestName;
      form.askerEmail = guestEmail;
    }

    try {
      await submitQuestion(listingId, form, token);
      setQuestion('');
      setGuestName('');
      setGuestEmail('');
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

        {!user && (
          <div className="row g-2 mb-3">
            <div className="col-sm-6">
              <label className="form-label" htmlFor="guestName">Your name <span className="text-danger">*</span></label>
              <input
                id="guestName"
                className="form-control"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                minLength="2"
                maxLength="80"
                required
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="guestEmail">Email <span className="text-muted">(optional)</span></label>
              <input
                id="guestEmail"
                type="email"
                className="form-control"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                maxLength="120"
              />
            </div>
          </div>
        )}

        {user && (
          <p className="small text-muted mb-2">Sending as <strong>{user.fullName || user.username}</strong></p>
        )}

        <label className="form-label" htmlFor="question">Message</label>
        <textarea
          id="question"
          name="question"
          className="form-control mb-3"
          rows="3"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          minLength="5"
          maxLength="500"
          required
        />

        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </section>
  );
}
