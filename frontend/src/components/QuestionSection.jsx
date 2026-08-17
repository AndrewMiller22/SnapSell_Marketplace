import { useEffect, useState } from 'react';
import { fetchAnsweredQuestions, submitQuestion } from '../api/questionsApi';

const emptyForm = { askerName: '', askerEmail: '', question: '' };

export default function QuestionSection({ listingId }) {
  const [form, setForm] = useState(emptyForm);
  const [answered, setAnswered] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnsweredQuestions(listingId)
      .then((response) => setAnswered(response.data))
      .catch(() => setAnswered([]));
  }, [listingId]);

  const update = ({ target }) => setForm((current) => ({ ...current, [target.name]: target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await submitQuestion(listingId, form);
      setForm(emptyForm);
      setMessage('Your message was sent to the seller.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send your message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-5">
      <h2 className="h4">Messages about this listing</h2>

      {answered.length > 0 && (
        <div className="mb-4">
          {answered.map((item) => (
            <div className="border rounded p-3 mb-2 bg-light" key={item._id}>
              <p className="mb-1"><strong>{item.askerName}:</strong> {item.question}</p>
              <p className="mb-0 text-secondary"><strong>Seller reply:</strong> {item.answer}</p>
            </div>
          ))}
        </div>
      )}

      <form className="card card-body" onSubmit={handleSubmit}>
        <h3 className="h6">Message the seller</h3>
        <p className="small text-muted">No account is required.</p>
        {message && <div className="alert alert-success py-2">{message}</div>}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="askerName">Your name</label>
            <input id="askerName" name="askerName" className="form-control" value={form.askerName} onChange={update} minLength="2" maxLength="80" required />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="askerEmail">Email (optional)</label>
            <input id="askerEmail" name="askerEmail" type="email" className="form-control" value={form.askerEmail} onChange={update} maxLength="120" />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="question">Message</label>
            <textarea id="question" name="question" className="form-control" rows="3" value={form.question} onChange={update} minLength="5" maxLength="500" required />
          </div>
          <div className="col-12">
            <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Sending…' : 'Send message'}</button>
          </div>
        </div>
      </form>
    </section>
  );
}
