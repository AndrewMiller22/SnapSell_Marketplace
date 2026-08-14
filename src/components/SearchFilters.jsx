

const CATEGORIES = [
  'Electronics',
  'Vehicles',
  'Home and Garden',
  'Clothing',
  'Sports',
  'Collectibles',
  'Other',
];

const STATUSES = ['Available', 'Pending', 'Sold', 'Expired'];

export default function SearchFilters({ filters, onChange, onReset }) {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="row g-3">
          {/* Keyword search */}
          <div className="col-12 col-md-5">
            <label htmlFor="search" className="form-label fw-semibold small">
              Search
            </label>
            <div className="input-group">
              <span className="input-group-text">🔍</span>
              <input
                id="search"
                name="search"
                type="text"
                className="form-control"
                placeholder="Title or description…"
                value={filters.search}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Category */}
          <div className="col-6 col-md-3">
            <label htmlFor="category" className="form-label fw-semibold small">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={filters.category}
              onChange={handleChange}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="col-6 col-md-2">
            <label htmlFor="status" className="form-label fw-semibold small">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={filters.status}
              onChange={handleChange}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Reset */}
          <div className="col-12 col-md-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={onReset}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
