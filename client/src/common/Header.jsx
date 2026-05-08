import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{`
        .smooth-shadow {
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        .complaint-system-mark {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #2563eb 0%, #0f766e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28);
          overflow: hidden;
        }
        .complaint-system-mark::before {
          content: "";
          position: absolute;
          inset: 7px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          border-radius: 10px;
        }
        .complaint-system-mark::after {
          content: "";
          position: absolute;
          width: 34px;
          height: 34px;
          right: -12px;
          bottom: -12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.18);
        }
        .complaint-system-mark .main-icon {
          position: relative;
          z-index: 2;
          font-size: 22px;
        }
        .complaint-system-mark .status-dot {
          position: absolute;
          z-index: 3;
          right: 8px;
          top: 8px;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: #22c55e;
          border: 2px solid #fff;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.22);
        }
        .complaint-system-logo-img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28);
        }
      `}</style>
      
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-lg smooth-shadow' 
          : 'bg-white border-b border-gray-200'
      }`}>
        <nav className="container mx-auto px-6 py-4">
          <div className="d-flex align-items-center justify-content-between">
            {/* Logo */}
            <Link to="/" className="d-flex align-items-center text-decoration-none hover-lift" style={{gap: '12px'}}>
              <img
                src="/complaint-system-logo.svg"
                alt="Complaint System logo"
                className="complaint-system-logo-img"
              />
              <div>
                <h1 className="mb-0 fw-bold text-dark" style={{fontSize: '20px'}}>Complaint System</h1>
                <p className="mb-0 text-muted" style={{fontSize: '12px'}}>Campus Solutions</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="d-flex align-items-center" style={{gap: '12px'}}>
              <Link 
                to="/" 
                className="btn btn-light hover-lift fw-medium"
                style={{padding: '10px 20px', borderRadius: '8px'}}
              >
                <i className="fas fa-home me-2"></i>
                Home
              </Link>
              
              <Link 
                to="/signup" 
                className="btn btn-primary hover-lift fw-medium smooth-shadow"
                style={{padding: '10px 24px', borderRadius: '8px'}}
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                Sign In
              </Link>
              
              <Link 
                to="/signout" 
                className="btn btn-outline-danger hover-lift fw-medium"
                style={{padding: '10px 24px', borderRadius: '8px'}}
              >
                <i className="fas fa-sign-out-alt me-2"></i>
                Sign Out
              </Link>
            </div>
          </div>
        </nav>
      </header>
      <div style={{height: '80px'}}></div>
    </>
  );
}

export default Header;
