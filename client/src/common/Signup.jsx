import { useForm } from 'react-hook-form';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('student'); // 'student' or 'warden'
  
  // Check if we're showing the register form
  const showingRegister = location.pathname.includes('/register');
  const showingWardenRegister = location.pathname.includes('/warden-register');

  async function handleLogin(data) {
    setIsLoading(true);
    setMessage('');

    try {
      console.log(`${loginType} login attempt with:`, data);

      // Determine API endpoint based on login type
      const apiEndpoint = loginType === 'student' 
        ? 'http://localhost:4700/student-api/login'
        : 'http://localhost:4700/warden-api/login';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.username, // Assuming username is email
          password: data.password
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Login successful, result:', result);
        
        // Extract user data - handle different response structures
        const userData = result.payload || result.user || result.data || result;
        const token = result.token || result.authToken || result.accessToken;
        
        // Ensure we have the user ID (try different possible field names)
        const userId = userData.Id || userData._id || userData.id || userData.studentId || userData.wardenId;
        
        console.log('Extracted userData:', userData);
        console.log('Extracted userId:', userId);
        
        if (!userId) {
          console.error('No user ID found in response:', result);
          setMessage('Login successful but user ID not found. Please contact support.');
          return;
        }
        
        if (!token) {
          console.error('No token found in response:', result);
          setMessage('Login successful but authentication token not found. Please contact support.');
          return;
        }
        
        // Store the token and user info
        localStorage.setItem('authToken', token);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        
        // Update user context
        login(userData, token);
        
        setMessage(`${loginType === 'student' ? 'Student' : 'Warden'} login successful! Redirecting...`);
        
        setTimeout(() => {
          // Navigate based on user role and login type
          if (loginType === 'student') {
            console.log('Navigating to student profile:', `/student-profile/${userId}`);
            navigate(`/student-profile/${userId}`);
          } else {
            console.log('Navigating to warden profile:', `/warden-profile/${userId}`);
            navigate(`/warden-profile/${userId}`);
          }
        }, 1500);
      } else {
        // Handle different error scenarios
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

  // If showing register forms, just show the outlet
  if (showingRegister || showingWardenRegister) {
    return <Outlet />;
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card mt-5">
            <div className="card-header">
              <h2 className="text-center text-info mb-3">Login</h2>
              
              {/* Login Type Selector */}
              <div className="d-flex justify-content-center mb-3">
                <div className="btn-group" role="group">
                  <input 
                    type="radio" 
                    className="btn-check" 
                    name="loginType" 
                    id="studentLogin" 
                    value="student"
                    checked={loginType === 'student'}
                    onChange={(e) => setLoginType(e.target.value)}
                  />
                  <label className="btn btn-outline-primary" htmlFor="studentLogin">
                    <i className="fas fa-user-graduate me-2"></i>
                    Student
                  </label>

                  <input 
                    type="radio" 
                    className="btn-check" 
                    name="loginType" 
                    id="wardenLogin" 
                    value="warden"
                    checked={loginType === 'warden'}
                    onChange={(e) => setLoginType(e.target.value)}
                  />
                  <label className="btn btn-outline-success" htmlFor="wardenLogin">
                    <i className="fas fa-user-tie me-2"></i>
                    Warden
                  </label>
                </div>
              </div>
            </div>
            
            <div className="card-body">
              <form onSubmit={handleSubmit(handleLogin)}>
                {/* Email/Username */}
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-envelope"></i>
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
                      placeholder={`Enter ${loginType === 'student' ? 'Student' : 'Warden'} Email`}
                      className="form-control"
                    />
                  </div>
                  {errors.username && <p className="text-warning small mt-1">{errors.username.message}</p>}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-lock"></i>
                    </span>
                    <input
                      type="password"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                        maxLength: { value: 20, message: 'Password must not exceed 20 characters' }
                      })}
                      placeholder="Enter Password"
                      className="form-control"
                    />
                  </div>
                  {errors.password && <p className="text-warning small mt-1">{errors.password.message}</p>}
                </div>

                <button 
                  type="submit" 
                  className={`btn w-100 ${loginType === 'student' ? 'btn-primary' : 'btn-success'}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
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

              {/* Message display */}
              {message && (
                <div className={`text-center mt-3 alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
                  <i className={`fas ${message.includes('successful') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                  {message}
                </div>
              )}
            </div>
            
            <div className="card-footer text-center">
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-0 small">
                    New Student?{' '}
                    <Link to="/signup/register" className="text-primary text-decoration-none">
                      <i className="fas fa-user-plus me-1"></i>
                      Register Here
                    </Link>
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-0 small">
                    New Warden?{' '}
                    <Link to="/signup/warden-register" className="text-success text-decoration-none">
                      <i className="fas fa-user-shield me-1"></i>
                      Register Here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;