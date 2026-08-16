

const BADGE_COLOURS = {
  Available: 'success',
  Pending: 'warning',
  Sold: 'secondary',
  Expired: 'danger',
};

export default function StatusBadge({ status }) {
  const colour = BADGE_COLOURS[status] || 'light';
  return (
    <span className={`badge bg-${colour} text-${colour === 'warning' ? 'dark' : 'white'}`}>
      {status}
    </span>
  );
}
