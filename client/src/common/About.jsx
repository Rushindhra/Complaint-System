// ============= About.jsx =============
import React from 'react';

function About() {
  return (
    <>
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .feature-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
      `}</style>

      <div className="py-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <div className="container py-5">
          
          {/* Hero Section */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle mb-4" style={{width: '80px', height: '80px'}}>
              <i className="fas fa-info-circle text-white" style={{fontSize: '40px'}}></i>
            </div>
            <h1 className="display-4 fw-bold mb-3">About Complaint System</h1>
            <p className="lead text-muted">Revolutionizing campus complaint management</p>
          </div>

          {/* Mission */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8">
              <div className="glass-card p-5 text-center" style={{borderRadius: '24px'}}>
                <h2 className="fw-bold mb-4">Our Mission</h2>
                <p className="lead text-muted mb-0">
                  To provide educational institutions with a streamlined, efficient, and transparent 
                  complaint management system that enhances communication between students, staff, 
                  and administration while ensuring timely resolution of issues.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="row g-4 mb-5">
            {[
              {icon: 'fa-rocket', color: 'primary', title: 'Fast & Efficient', desc: 'Quick complaint submission and resolution tracking'},
              {icon: 'fa-users', color: 'success', title: 'User-Friendly', desc: 'Intuitive interface for all user types'},
              {icon: 'fa-shield-alt', color: 'info', title: 'Secure', desc: 'Enterprise-grade security and data protection'},
              {icon: 'fa-chart-line', color: 'warning', title: 'Analytics', desc: 'Comprehensive reporting and insights'}
            ].map((item, idx) => (
              <div key={idx} className="col-md-6 col-lg-3">
                <div className="glass-card p-4 text-center h-100" style={{borderRadius: '20px'}}>
                  <div className={`feature-icon bg-${item.color} bg-opacity-10 text-${item.color} mx-auto mb-4`}>
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <h5 className="fw-bold mb-3">{item.title}</h5>
                  <p className="text-muted mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="bg-primary bg-gradient text-white p-5 text-center" style={{borderRadius: '24px'}}>
                <h3 className="fw-bold mb-3">Get In Touch</h3>
                <p className="mb-4 opacity-90">Have questions? We'd love to hear from you.</p>
                <button className="btn btn-light btn-lg px-5" style={{borderRadius: '12px'}}>
                  <i className="fas fa-envelope me-2"></i>
                  Contact Us
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default About;
