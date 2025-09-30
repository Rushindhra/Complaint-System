// Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

// Team member data - Replace with actual names and LinkedIn profiles
const teamMembers = [
  {
    name: "Sri Koushik Ravikanti",
    role: "Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/sri-koushik-ravikanti-812011290"
  },
  {
    name: "Vaishnavi Muthe",
    role: "Full Stack Developer", 
    linkedin: "https://www.linkedin.com/in/vaishnavi-muthe-aa5716351"
  },
  {
    name: "Laxmi Prasanna Ravikanti",
    role: "Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/laxmi-prasanna-ravikanti-17389b305"
  },
  {
    name: "Rushindhra Marri",
    role: "Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/rushindhra-marri"
  },
  {
    name: "Keerthi Manthri",
    role: "Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/keerthi-manthri-1715562b3"
  }
];

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light mt-5">
      {/* Custom Styles */}
      <style>{`
        .social-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          text-decoration: none;
        }
        
        .social-icon:hover {
          background-color: #198754;
          transform: translateY(-3px);
          color: white;
        }

        .team-member-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
          height: 100%;
        }
        
        .team-member-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #198754;
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .team-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #198754, #20c997);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
          font-size: 24px;
          font-weight: bold;
          color: white;
        }

        .linkedin-btn {
          background: #0077b5;
          border: none;
          color: white;
          padding: 8px 15px;
          border-radius: 20px;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .linkedin-btn:hover {
          background: #005885;
          transform: scale(1.05);
          color: white;
        }

        .linktree-btn {
          background: linear-gradient(135deg, #39E09B, #0077b5);
          border: none;
          color: white;
          padding: 12px 25px;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          box-shadow: 0 4px 15px rgba(57, 224, 155, 0.3);
        }

        .linktree-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(57, 224, 155, 0.4);
          color: white;
        }

        .footer-link {
          color: #adb5bd;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: #198754;
        }

        .feature-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }

        .feature-icon {
          color: #198754;
          margin-right: 10px;
          font-size: 16px;
        }
      `}</style>

      <div className="container py-5">
        <div className="row">
          {/* About Section */}
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="d-flex align-items-center mb-3">
              <i className="fas fa-clipboard-list text-success fs-3 me-3"></i>
              <div>
                <h4 className="text-success mb-0">ComplaintHub</h4>
                <small className="text-muted">Campus Solutions</small>
              </div>
            </div>
            <p className="text-muted mb-4">
              A comprehensive complaint management system designed to streamline 
              issue reporting and resolution in educational institutions.
            </p>
            <div className="d-flex gap-3">
              <a href="https://github.com/complainthub" className="social-icon" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://twitter.com/complainthub" className="social-icon" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com/complainthub" className="social-icon" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="text-success mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="footer-link">
                  <i className="fas fa-home me-2"></i>Home
                </Link>
              </li>
            </ul>
          </div>
          
          
          {/* Support */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="text-success mb-3">Support</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/help" className="footer-link">
                  <i className="fas fa-question-circle me-2"></i>Help Center
                </a>
              </li>
              <li className="mb-2">
                <a href="/faq" className="footer-link">
                  <i className="fas fa-comments me-2"></i>FAQ
                </a>
              </li>
              <li className="mb-2">
                <a href="/support" className="footer-link">
                  <i className="fas fa-headset me-2"></i>Customer Support
                </a>
              </li>
              <li className="mb-2">
                <a href="/feedback" className="footer-link">
                  <i className="fas fa-star me-2"></i>Feedback
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-12 mb-4">
            <h5 className="text-success mb-3">Contact Info</h5>
            <div className="mb-2">
              <i className="fas fa-map-marker-alt text-success me-2"></i>
              <span className="text-muted">Hyderabad, Telangana, India</span>
            </div>
            <div className="mb-2">
              <i className="fas fa-envelope text-success me-2"></i>
              <a href="mailto:support@complainthub.com" className="footer-link">
                support@complainthub.com
              </a>
            </div>
            <div className="mb-3">
              <i className="fas fa-phone text-success me-2"></i>
              <a href="tel:+919876543210" className="footer-link">
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>
        
        <hr className="border-secondary my-5" />
        
        {/* Team Section - Horizontal Layout */}
        <div className="row mb-5">
          <div className="col-12 text-center mb-4">
            <h3 className="text-success mb-2">
              <i className="fas fa-users me-3"></i>Meet Our Development Team
            </h3>
            <p className="text-muted">
              Built with passion and dedication by 5 talented developers
            </p>
          </div>
          
          {/* Team Members in Horizontal Cards */}
          {teamMembers.map((member, index) => (
            <div key={index} className="col-lg-2 col-md-4 col-sm-6 mb-4">
              <div className="team-member-card">
                <div className="team-avatar">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h6 className="text-light mb-1">{member.name}</h6>
                <div className="text-success small mb-2">{member.role}</div>
                <p className="text-muted small mb-3" style={{fontSize: '0.75rem', minHeight: '40px'}}>
                  {member.contribution}
                </p>
                <a 
                  href={member.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="linkedin-btn"
                  title={`Connect with ${member.name} on LinkedIn`}
                >
                  <i className="fab fa-linkedin me-1"></i>
                  Connect
                </a>
              </div>
            </div>
          ))}

          
        </div>
        
        <hr className="border-secondary my-4" />
        
        {/* Copyright Section */}
        <div className="row align-items-center ">
          <div className="col-md-6">
            <p className="text-muted mb-0">
              <i className="fas fa-copyright me-2 primary"></i>
              {currentYear} ComplaintHub. All Rights Reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="text-muted mb-0">
              Made with <i className="fas fa-heart text-danger mx-1"></i> by Team ComplaintHub
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;