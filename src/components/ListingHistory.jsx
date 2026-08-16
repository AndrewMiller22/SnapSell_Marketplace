import { useEffect, useState } from 'react';
import { fetchListingHistory } from '../api/historyApi';
import { useAuth } from '../context/AuthContext';

export default function ListingHistory({ listingId }) {
  const { token, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchListingHistory(listingId, token)
      .then((response) => setHistory(response.data))
      .catch(() => setError('Listing history could not be loaded.'));
  }, [isAuthenticated, listingId, token]);

  if (!isAuthenticated) return null;

  return (
    <section className="mt-5">
      <h2 className="h4">Listing history</h2>
      {error && <div className="alert alert-warning">{error}</div>}
      {!error && history.length === 0 && <p className="text-muted">No updates have been recorded yet.</p>}
      <div className="list-group">
        {history.map((entry) => (
          <div className="list-group-item" key={entry._id}>
            <div>{entry.description}</div>
            <small className="text-muted">
              {entry.username} · {new Date(entry.actionDate || entry.createdAt).toLocaleString('en-CA')}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}
