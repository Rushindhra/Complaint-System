import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function Signout() {
  const navigate = useNavigate();
  const { logout } = useUser();

  useEffect(() => {
    // Perform logout operations
    const performLogout = async () => {
      try {
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        
        // Update user context
        if (logout) {
          logout();
        }
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
        
      } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even if there's an error
        navigate('/', { replace: true });
      }
    };

    performLogout();
  }, [navigate, logout]);

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body text-center py-5">
              <div className="mb-4">
                <i className="fas fa-sign-out-alt fa-3x text-info"></i>
              </div>
              <h2 className="text-dark mb-3">Signing Out...</h2>
              <p className="text-muted mb-4">
                Thank you for using the Student Portal. You are being logged out securely.
              </p>
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 small text-muted">
                Redirecting to home page...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signout;