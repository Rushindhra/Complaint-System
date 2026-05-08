
// ============= Signout.jsx =============
import React, { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function Signout() {
  const navigate = useNavigate();
  const { logout } = useUser();

  useLayoutEffect(() => {
    logout();
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 900);
    return () => clearTimeout(timer);
  }, [logout, navigate]);

  return (
    <>
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      <div className="min-vh-100 d-flex flex-column" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="glass-card p-5 text-center" style={{borderRadius: '24px'}}>
                <div className="mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle pulse" style={{width: '100px', height: '100px'}}>
                    <i className="fas fa-sign-out-alt text-primary" style={{fontSize: '48px'}}></i>
                  </div>
                </div>
                <h2 className="fw-bold mb-3">Signing Out...</h2>
                <p className="text-muted mb-4">
                  Thank you for using Complaint System. You are being logged out securely.
                </p>
                <div className="spinner-border text-primary mb-4" role="status" style={{width: '3rem', height: '3rem'}}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="small text-muted mb-0">
                  <i className="fas fa-shield-alt me-2"></i>
                  Redirecting to home page...
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

export default Signout;
