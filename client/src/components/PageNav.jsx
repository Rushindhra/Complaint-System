import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

/**
 * Site navigation merged into individual pages (replaces global header).
 */
function PageNav() {
  const location = useLocation();
  const { currentUser, getDashboardUrl, syncAuthFromStorage } = useUser();

  useEffect(() => {
    syncAuthFromStorage();
  }, [location.pathname, syncAuthFromStorage]);

  return (
    <nav className="border-bottom bg-white shadow-sm">
      <div className="container py-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <Link
            to="/"
            className="d-flex align-items-center text-decoration-none text-dark fw-bold gap-2"
          >
            <img
              src="/complaint-system-logo.svg"
              alt="Complaint System logo"
              style={{ width: 40, height: 40, borderRadius: '50%', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)' }}
            />
            <span className="d-none d-sm-inline">Complaint System</span>
          </Link>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Link
              to="/"
              className="btn btn-sm btn-outline-secondary"
            >
              <i className="fas fa-home me-1" aria-hidden="true"></i>
              Home
            </Link>
            {currentUser ? (
              <Link
                to={getDashboardUrl()}
                className="btn btn-sm btn-primary"
              >
                <i className="fas fa-th-large me-1" aria-hidden="true"></i>
                Dashboard
              </Link>
            ) : (
              <Link
                to="/signup"
                className="btn btn-sm btn-primary"
              >
                <i className="fas fa-sign-in-alt me-1" aria-hidden="true"></i>
                Sign In
              </Link>
            )}
            {currentUser && (
              <Link
                to="/signout"
                className="btn btn-sm btn-outline-danger"
              >
                <i className="fas fa-sign-out-alt me-1" aria-hidden="true"></i>
                Sign Out
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default PageNav;
