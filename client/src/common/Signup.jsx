import { useForm } from 'react-hook-form';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '../context/UserContext';
import PageNav from '../components/PageNav';

function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('student');
  
  const showingRegister = location.pathname.includes('/register');
  const showingWardenRegister = location.pathname.includes('/warden-register');

  async function handleLogin(data) {
    setIsLoading(true);
    setMessage('');

    try {
      const apiEndpoint = loginType === 'student' 
        ? 'http://localhost:4700/student-api/login'
        : 'http://localhost:4700/warden-api/login';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.username,
          password: data.password
        })
      });

      const result = await response.json();

      if (response.ok) {
        const userData = result.payload || result.user || result.data || result;
        const token = result.token || result.authToken || result.accessToken;
        const userId = userData.Id || userData._id || userData.id || userData.studentId || userData.wardenId;
        
        if (!userId || !token) {
          setMessage('Login successful but user data incomplete. Please contact support.');
          return;
        }
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        login(userData, token);
        
        setMessage(`${loginType === 'student' ? 'Student' : 'Warden'} login successful! Redirecting...`);
        
        setTimeout(() => {
          if (loginType === 'student') {
            navigate(`/student-profile/${userId}`);
          } else {
            navigate(`/warden-profile/${userId}`);
          }
        }, 1500);
      } else {
        if (response.status === 401) {
          setMessage('Invalid credentials. Please check your email and password.');
        } else {
          setMessage(result.message || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (showingRegister || showingWardenRegister) {
    return <Outlet />;
  }

  return (
    <>
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .smooth-shadow {
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        .role-btn {
          transition: all 0.3s ease;
        }
        .role-btn.active {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
        }
      `}</style>

      <div className="min-vh-100 d-flex flex-column" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <PageNav />
        <div className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div className="row g-0 glass-card" style={{borderRadius: '24px', overflow: 'hidden'}}>
                
                {/* Left Side - Form */}
                <div className="col-md-6 p-5">
                  {/* Logo */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-4">
                      <img
                        src="/complaint-system-logo.svg"
                        alt="Complaint System logo"
                        className="smooth-shadow"
                        style={{width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover'}}
                      />
                      <div className="ms-3">
                        <h4 className="mb-0 fw-bold">Complaint System</h4>
                        <small className="text-muted">Campus Solutions</small>
                      </div>
                    </div>
                    <h2 className="fw-bold mb-2">Welcome Back</h2>
                    <p className="text-muted">Sign in to access your account</p>
                  </div>

                  {/* Role Selector */}
                  <div className="d-flex gap-2 p-2 bg-light mb-4" style={{borderRadius: '12px'}}>
                    <button
                      type="button"
                      className={`btn flex-fill role-btn ${loginType === 'student' ? 'active' : ''}`}
                      onClick={() => setLoginType('student')}
                      style={{borderRadius: '8px', padding: '12px'}}
                    >
                      <i className="fas fa-user-graduate me-2"></i>
                      Student
                    </button>
                    <button
                      type="button"
                      className={`btn flex-fill role-btn ${loginType === 'warden' ? 'active' : ''}`}
                      onClick={() => setLoginType('warden')}
                      style={{borderRadius: '8px', padding: '12px'}}
                    >
                      <i className="fas fa-user-tie me-2"></i>
                      Warden
                    </button>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleSubmit(handleLogin)}>
                    {/* Email */}
                    <div className="mb-4">
                      <label className="form-label fw-medium">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0" style={{borderRadius: '12px 0 0 12px'}}>
                          <i className="fas fa-envelope text-muted"></i>
                        </span>
                        <input
                          type="email"
                          {...register('username', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Please enter a valid email address'
                            }
                          })}
                          className="form-control border-start-0 ps-0"
                          placeholder={`Enter ${loginType === 'student' ? 'Student' : 'Warden'} Email`}
                          style={{borderRadius: '0 12px 12px 0', padding: '12px'}}
                        />
                      </div>
                      {errors.username && <small className="text-danger">{errors.username.message}</small>}
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                      <label className="form-label fw-medium">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0" style={{borderRadius: '12px 0 0 12px'}}>
                          <i className="fas fa-lock text-muted"></i>
                        </span>
                        <input
                          type="password"
                          {...register('password', { 
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Password must be at least 6 characters' }
                          })}
                          className="form-control border-start-0 ps-0"
                          placeholder="Enter Password"
                          style={{borderRadius: '0 12px 12px 0', padding: '12px'}}
                        />
                      </div>
                      {errors.password && <small className="text-danger">{errors.password.message}</small>}
                    </div>

                    {/* Remember & Forgot */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="remember" />
                        <label className="form-check-label small" htmlFor="remember">
                          Remember me
                        </label>
                      </div>
                      <Link to="#" className="small text-primary text-decoration-none fw-medium">
                        Forgot password?
                      </Link>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit"
                      className="btn btn-primary w-100 py-3 fw-semibold smooth-shadow hover-lift"
                      disabled={isLoading}
                      style={{borderRadius: '12px'}}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Logging in...
                        </>
                      ) : (
                        <>
                          <i className={`fas ${loginType === 'student' ? 'fa-user-graduate' : 'fa-user-tie'} me-2`}></i>
                          Login as {loginType === 'student' ? 'Student' : 'Warden'}
                        </>
                      )}
                    </button>
                  </form>

                  {/* Message */}
                  {message && (
                    <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'} mt-4 mb-0`} style={{borderRadius: '12px'}}>
                      <i className={`fas ${message.includes('successful') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                      {message}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="d-flex align-items-center my-4">
                    <hr className="flex-grow-1" />
                    <span className="px-3 text-muted small">or</span>
                    <hr className="flex-grow-1" />
                  </div>

                  {/* Register Links */}
                  <div className="text-center">
                    <p className="text-muted small mb-3">Don't have an account?</p>
                    <div className="d-flex gap-2">
                      <Link 
                        to="/signup/register" 
                        className="btn btn-outline-primary flex-fill hover-lift"
                        style={{borderRadius: '12px', padding: '10px'}}
                      >
                        <i className="fas fa-user-plus me-1"></i>
                        Student
                      </Link>
                      <Link 
                        to="/signup/warden-register" 
                        className="btn btn-outline-success flex-fill hover-lift"
                        style={{borderRadius: '12px', padding: '10px'}}
                      >
                        <i className="fas fa-user-shield me-1"></i>
                        Warden
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Right Side - Info */}
                <div className="col-md-6 bg-primary bg-gradient text-white p-5 d-none d-md-flex flex-column justify-content-center position-relative" style={{overflow: 'hidden'}}>
                  <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                    <div style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '40px 40px',
                      width: '100%',
                      height: '100%'
                    }}></div>
                  </div>

                  <div className="position-relative">
                    <h2 className="display-6 fw-bold mb-4">
                      Manage Complaints Efficiently
                    </h2>
                    <p className="lead mb-5 opacity-90">
                      Join thousands of users who trust Complaint System for seamless campus management
                    </p>

                    <div className="d-flex flex-column gap-4">
                      {[
                        {icon: 'fa-bolt', title: 'Fast Resolution', desc: 'Quick and efficient complaint handling'},
                        {icon: 'fa-shield-alt', title: 'Secure Platform', desc: 'Your data is safe with us'},
                        {icon: 'fa-chart-line', title: 'Track Progress', desc: 'Monitor complaint status in real-time'}
                      ].map((item, idx) => (
                        <div key={idx} className="d-flex gap-3">
                          <div className="bg-white bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px', minWidth: '48px'}}>
                            <i className={`fas ${item.icon} fs-5`}></i>
                          </div>
                          <div>
                            <h5 className="mb-1">{item.title}</h5>
                            <p className="mb-0 small opacity-75">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
