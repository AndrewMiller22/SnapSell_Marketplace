

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-primary sticky-top shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand fw-bold fs-4" to="/">
          📸 SnapSell
        </NavLink>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto mb-2 mb-md-0 gap-1 align-items-md-center">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  'nav-link' + (isActive ? ' active fw-semibold' : '')
                }
                to="/"
                end
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  'nav-link' + (isActive ? ' active fw-semibold' : '')
                }
                to="/marketplace"
              >
                Marketplace
              </NavLink>
            </li>

            {/* Auth links – swap based on login state */}
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      'nav-link' + (isActive ? ' active fw-semibold' : '')
                    }
                    to="/profile"
                  >
                    👤 {user?.username}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm ms-1"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="btn btn-light btn-sm text-primary fw-semibold ms-1"
                    to="/register"
                  >
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
