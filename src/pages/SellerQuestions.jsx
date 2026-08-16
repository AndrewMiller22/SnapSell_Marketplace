import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { answerQuestion, fetchSellerQuestions } from '../api/questionsApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SellerQuestions() {
  const { token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSellerQuestions(token)
      .then((response) => setQuestions(response.data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load your messages.'))
      .finally(() => setLoading(false));
  }, [token]);

  const submitAnswer = async (questionId) => {
    const answer = (drafts[questionId] || '').trim();
    if (answer.length < 2) return;
    setError('');
    try {
      const response = await answerQuestion(questionId, answer, token);
      setQuestions((current) => current.map((item) => item._id === questionId ? response.data : item));
      setDrafts((current) => ({ ...current, [questionId]: '' }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save the answer.');
    }
  };

  if (loading) return <div className="container my-5"><LoadingSpinner /></div>;

  return (
    <div className="container my-5">
      <h1 className="h2 mb-4">Messages from buyers</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {questions.length === 0 && <div className="alert alert-info">You have not received any messages yet.</div>}

      {questions.map((item) => (
        <article className="card mb-3 shadow-sm" key={item._id}>
          <div className="card-body">
            <div className="d-flex justify-content-between gap-3 flex-wrap">
              <h2 className="h5 mb-1">{item.listing?.title || 'Listing'}</h2>
              <Link to={`/listings/${item.listing?._id}`} className="btn btn-sm btn-outline-primary">View listing</Link>
            </div>
            <p className="small text-muted mb-3">
              From {item.askerName}{item.askerEmail ? ` (${item.askerEmail})` : ''} · {new Date(item.createdAt).toLocaleString('en-CA')}
            </p>
            <p><strong>Message:</strong> {item.question}</p>

            {item.answer && (
              <div className="alert alert-success py-2">
                <strong>Your reply:</strong> {item.answer}
                <div className="small mt-1">Replied {new Date(item.answeredAt).toLocaleString('en-CA')}</div>
              </div>
            )}

            <label className="form-label" htmlFor={`answer-${item._id}`}>
              {item.answer ? 'Update reply' : 'Reply'}
            </label>
            <textarea
              id={`answer-${item._id}`}
              className="form-control mb-2"
              rows="3"
              maxLength="1000"
              value={drafts[item._id] || ''}
              onChange={(event) => setDrafts((current) => ({ ...current, [item._id]: event.target.value }))}
            />
            <button className="btn btn-primary" onClick={() => submitAnswer(item._id)} disabled={(drafts[item._id] || '').trim().length < 2}>
              Save reply
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
