import { useState } from 'react';
import { submitQuestion } from '../api/questionsApi';
import { useAuth } from '../context/AuthContext';

export default function QuestionSection({ listingId }) {
  const { token } = useAuth();
  const [question, setQuestion] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      await submitQuestion(listingId, { question }, token);
      setQuestion('');
      setMessage('Your private message was sent to the seller.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send your message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-5">
      <form className="card card-body" onSubmit={handleSubmit}>
        <h2 className="h5">Message the seller</h2>
        <p className="small text-muted">
          This message is private and will only appear in the Messages area.
        </p>

        {message && <div className="alert alert-success py-2">{message}</div>}
        {error && <div className="alert alert-danger py-2">{error}</div>}

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
          {submitting ? 'Sending…' : 'Send private message'}
        </button>
      </form>
    </section>
  );
}
