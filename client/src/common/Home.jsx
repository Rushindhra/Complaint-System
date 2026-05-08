import React from 'react';
import { Link } from 'react-router-dom';
import PageNav from '../components/PageNav';

function Home() {
  return (
    <>
      <PageNav />
      <style>{`
        .hero-gradient {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .smooth-shadow {
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }
        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-gradient py-5" style={{minHeight: '600px'}}>
        <div className="container py-5">
          <div className="row align-items-center g-5">
            {/* Left Content */}
            <div className="col-lg-6">
              <div className="mb-4">
                <span className="badge bg-primary bg-opacity-10 text-primary px-4 py-2" style={{fontSize: '14px', borderRadius: '50px'}}>
                  🚀 Professional Complaint Management
                </span>
              </div>
              
              <h1 className="display-3 fw-bold text-dark mb-4" style={{lineHeight: '1.2'}}>
                Streamline Campus
                <span className="text-primary d-block">Complaint Resolution</span>
              </h1>
              
              <p className="lead text-muted mb-5" style={{fontSize: '20px'}}>
                Efficient, transparent, and user-friendly complaint management system designed for modern educational institutions.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-5">
                <Link 
                  to="/signup" 
                  className="btn btn-primary btn-lg px-4 py-3 hover-lift smooth-shadow"
                  style={{borderRadius: '12px', fontWeight: '600'}}
                >
                  Get Started
                  <i className="fas fa-arrow-right ms-2"></i>
                </Link>
                <button className="btn btn-outline-primary btn-lg px-4 py-3 hover-lift" style={{borderRadius: '12px', fontWeight: '600', borderWidth: '2px'}}>
                  <i className="fas fa-play-circle me-2"></i>
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="row g-4 pt-4 border-top">
                <div className="col-4">
                  <div className="text-center">
                    <div className="h2 fw-bold text-dark mb-1">500+</div>
                    <div className="small text-muted">Active Users</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center">
                    <div className="h2 fw-bold text-dark mb-1">95%</div>
                    <div className="small text-muted">Satisfaction</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center">
                    <div className="h2 fw-bold text-dark mb-1">24/7</div>
                    <div className="small text-muted">Support</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="col-lg-6">
              <div className="glass-card rounded-4 p-4 hover-lift">
                <div className="row g-3">
                  {/* Stats Cards */}
                  <div className="col-6">
                    <div className="bg-primary bg-gradient rounded-4 p-4 text-white">
                      <i className="fas fa-clipboard-check mb-3" style={{fontSize: '32px', opacity: '0.8'}}></i>
                      <div className="h3 fw-bold mb-1">247</div>
                      <div className="small opacity-90">Total Complaints</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-success bg-gradient rounded-4 p-4 text-white">
                      <i className="fas fa-check-circle mb-3" style={{fontSize: '32px', opacity: '0.8'}}></i>
                      <div className="h3 fw-bold mb-1">202</div>
                      <div className="small opacity-90">Resolved</div>
                    </div>
                  </div>
                  
                  {/* Activity Card */}
                  <div className="col-12">
                    <div className="bg-white rounded-4 p-4 border">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-semibold mb-0">Recent Activity</h6>
                        <span className="badge bg-success">Live</span>
                      </div>
                      <div className="d-flex flex-column gap-3">
                        {[
                          {status: 'success', title: 'Plumbing Issue', subtitle: 'Room 204 - Resolved', time: '2m'},
                          {status: 'warning', title: 'WiFi Problem', subtitle: 'Block A - In Progress', time: '15m'},
                          {status: 'primary', title: 'Cleaning Request', subtitle: 'Room 315 - New', time: '1h'}
                        ].map((item, idx) => (
                          <div key={idx} className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                            <div className={`bg-${item.status} rounded-circle`} style={{width: '8px', height: '8px'}}></div>
                            <div className="flex-grow-1">
                              <div className="fw-medium small">{item.title}</div>
                              <div className="text-muted" style={{fontSize: '12px'}}>{item.subtitle}</div>
                            </div>
                            <span className="text-muted small">{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="col-12">
                    <div className="bg-white rounded-4 p-4 border">
                      <div className="d-flex justify-content-between small mb-2">
                        <span className="fw-medium">Resolution Rate</span>
                        <span className="fw-bold text-primary">82%</span>
                      </div>
                      <div className="progress" style={{height: '8px'}}>
                        <div className="progress-bar bg-primary" style={{width: '82%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">Everything You Need</h2>
            <p className="lead text-muted">Comprehensive tools for efficient complaint management</p>
          </div>

          <div className="row g-4">
            {[
              {icon: 'fa-bolt', color: 'primary', title: 'Instant Submission', desc: 'Submit complaints quickly with our streamlined interface'},
              {icon: 'fa-bell', color: 'success', title: 'Real-time Updates', desc: 'Get instant notifications on complaint status'},
              {icon: 'fa-chart-line', color: 'info', title: 'Analytics Dashboard', desc: 'Track patterns with comprehensive analytics'},
              {icon: 'fa-shield-alt', color: 'warning', title: 'Secure & Private', desc: 'Enterprise-grade security and encryption'},
              {icon: 'fa-users', color: 'danger', title: 'Multi-user Access', desc: 'Separate portals for different user roles'},
              {icon: 'fa-mobile-alt', color: 'secondary', title: 'Mobile Responsive', desc: 'Access from anywhere on any device'}
            ].map((feature, idx) => (
              <div key={idx} className="col-md-6 col-lg-4">
                <div className="card border-0 h-100 hover-lift" style={{borderRadius: '16px'}}>
                  <div className="card-body p-4">
                    <div className={`feature-icon bg-${feature.color} bg-opacity-10 text-${feature.color} mb-4`}>
                      <i className={`fas ${feature.icon}`}></i>
                    </div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="bg-primary bg-gradient rounded-4 p-5 text-center text-white smooth-shadow">
            <h2 className="display-5 fw-bold mb-4">Ready to Get Started?</h2>
            <p className="lead mb-4 opacity-90">Transform your campus complaint management today</p>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <Link to="/signup" className="btn btn-light btn-lg px-5 py-3 hover-lift" style={{borderRadius: '12px', fontWeight: '600'}}>
                <i className="fas fa-rocket me-2"></i>
                Start Free Trial
              </Link>
              <button className="btn btn-outline-light btn-lg px-5 py-3 hover-lift" style={{borderRadius: '12px', fontWeight: '600', borderWidth: '2px'}}>
                <i className="fas fa-phone me-2"></i>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;