import React from 'react';
import { Link } from 'react-router-dom';

const teamMembers = [
  {
    name: "Sri Koushik",
    role: "Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/sri-koushik-ravikanti-812011290"
  },
  {
    name: "Vaishnavi",
    role: "Full Stack Developer", 
    linkedin: "https://www.linkedin.com/in/vaishnavi-muthe-aa5716351"
  },
  {
    name: "Laxmi Prasanna",
    role: "Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/laxmi-prasanna-ravikanti-17389b305"
  },
  {
    name: "Rushindhra",
    role: "Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/rushindhra-marri"
  },
  {
    name: "Keerthi",
    role: "Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/keerthi-manthri-1715562b3"
  }
];

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <>
      <style>{`
        .footer-gradient {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        }
        .team-card {
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .team-card:hover {
          transform: translateY(-4px);
          border-color: #0d6efd;
          box-shadow: 0 12px 24px rgba(13, 110, 253, 0.15);
        }
        .team-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: white;
          margin: 0 auto 16px;
        }
        .social-icon {
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: white;
          border: 2px solid #e9ecef;
          color: #6c757d;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .social-icon:hover {
          border-color: #0d6efd;
          color: #0d6efd;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
        }
        .linkedin-btn {
          background: #0077b5;
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          font-weight: 500;
        }
        .linkedin-btn:hover {
          background: #005885;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 119, 181, 0.3);
          color: white;
        }
        .footer-brand-logo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.22);
        }
      `}</style>

      <footer className="footer-gradient border-top mt-5">
        <div className="container py-5">
          
          {/* Main Footer Content */}
          <div className="row g-4 mb-5">
            
            {/* About Section */}
            <div className="col-lg-4 col-md-6">
              <div className="d-flex align-items-center mb-4">
                <img src="/complaint-system-logo.svg" alt="Complaint System logo" className="footer-brand-logo me-3" />
                <div>
                  <h4 className="mb-0 fw-bold text-dark">Complaint System</h4>
                  <small className="text-muted">Campus Solutions</small>
                </div>
              </div>
              <p className="text-muted mb-4">
                A comprehensive complaint management system designed to streamline 
                issue reporting and resolution in educational institutions.
              </p>
              <div className="d-flex gap-2">
                <a href="https://linkedin.com" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="https://instagram.com/complaintsystem" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://github.com/complaintsystem" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <i className="fab fa-github"></i>
                </a>
                <a href="https://twitter.com/complaintsystem" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="col-lg-2 col-md-6">
              <h5 className="fw-bold text-dark mb-4">Quick Links</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link to="/" className="text-muted text-decoration-none d-inline-flex align-items-center">
                    <i className="fas fa-home me-2 text-primary"></i>Home
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/signup" className="text-muted text-decoration-none d-inline-flex align-items-center">
                    <i className="fas fa-sign-in-alt me-2 text-primary"></i>Login
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Support */}
            <div className="col-lg-3 col-md-6">
              <h5 className="fw-bold text-dark mb-4">Support</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a href="#" className="text-muted text-decoration-none d-inline-flex align-items-center">
                    <i className="fas fa-question-circle me-2 text-primary"></i>Help Center
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-muted text-decoration-none d-inline-flex align-items-center">
                    <i className="fas fa-comments me-2 text-primary"></i>FAQ
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-muted text-decoration-none d-inline-flex align-items-center">
                    <i className="fas fa-headset me-2 text-primary"></i>Customer Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="col-lg-3 col-md-6">
              <h5 className="fw-bold text-dark mb-4">Contact Info</h5>
              <div className="d-flex align-items-start mb-3">
                <i className="fas fa-map-marker-alt text-primary me-3 mt-1"></i>
                <span className="text-muted">Hyderabad, Telangana, India</span>
              </div>
              <div className="d-flex align-items-start mb-3">
                <i className="fas fa-envelope text-primary me-3 mt-1"></i>
                <a href="mailto:support@complaintsystem.com" className="text-muted text-decoration-none">
                  support@complaintsystem.com
                </a>
              </div>
              <div className="d-flex align-items-start">
                <i className="fas fa-phone text-primary me-3 mt-1"></i>
                <a href="tel:+919876543210" className="text-muted text-decoration-none">
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>
          
          <hr className="my-5" style={{opacity: '0.1'}} />
          
          {/* Team Section */}
          <div className="text-center mb-5">
            <h3 className="fw-bold text-dark mb-2">
              <i className="fas fa-users me-3 text-primary"></i>
              Meet Our Development Team
            </h3>
            <p className="text-muted mb-5">
              Built with passion and dedication by 5 talented developers
            </p>
          </div>
          
          <div className="row g-4 mb-5">
            {teamMembers.map((member, index) => (
              <div key={index} className="col-lg-2 col-md-4 col-sm-6">
                <div className="team-card text-center h-100">
                  <div className="team-avatar">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h6 className="fw-bold mb-1">{member.name}</h6>
                  <div className="text-primary small mb-3">{member.role}</div>
                  <a 
                    href={member.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="linkedin-btn"
                  >
                    <i className="fab fa-linkedin me-1"></i>
                    Connect
                  </a>
                </div>
              </div>
            ))}
            
            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="team-card text-center h-100 d-flex flex-column justify-content-center">
                <div className="text-primary mb-3">
                  <i className="fas fa-plus-circle" style={{fontSize: '48px'}}></i>
                </div>
                <h6 className="fw-bold mb-2">Join Our Team</h6>
                <p className="text-muted small mb-0">We're always looking for talented developers</p>
              </div>
            </div>
          </div>
          
          <hr className="my-5" style={{opacity: '0.1'}} />
          
          {/* Copyright */}
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p className="text-muted mb-0">
                <i className="fas fa-copyright me-2"></i>
                {currentYear} Complaint System. All Rights Reserved.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <p className="text-muted mb-0">
                Made with <i className="fas fa-heart text-danger mx-1">❤️</i> by Team Complaint System
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
