import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import PageNav from '../components/PageNav';
import { API_BASE_URL } from '../config/api';

function Register() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const password = watch('password');

  async function handleFormSubmit(data) {
    if (data.password !== data.confirmpassword) {
      setMessage('Passwords do not match!');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const registrationData = {
        role: 'Hosteler',
        Id: data.RollNumber,
        firstName: data.firstName,
        lastName: data.lastName || '',
        email: data.email,
        password: data.password,
        roomNumber: parseInt(data.roomnumber, 10),
        block: parseInt(data.block, 10)
      };

      const response = await fetch(`${API_BASE_URL}/student-api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      const contentType = response.headers.get('content-type');
      let result;

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error('Server returned non-JSON response. Check if the API endpoint exists.');
      }

      if (response.ok) {
        setMessage('Student registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/signup');
        }, 2000);
      } else {
        if (response.status === 409) {
          setMessage('User already exists with this email. Please use a different email.');
        } else {
          setMessage(result.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);

      if (error.message === 'Failed to fetch') {
        setMessage(`Cannot connect to server. Please check if the backend server is running on ${API_BASE_URL}`);
      } else {
        setMessage('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
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
        .hover-lift:hover {
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
        .form-control, .form-select {
          border-radius: 12px;
          padding: 12px 16px;
          border: 2px solid #e9ecef;
        }
        .form-control:focus, .form-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
        }
      `}</style>

      <div className="min-vh-100 d-flex flex-column" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <PageNav />
        <div className="flex-grow-1 py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-10">
                <div className="glass-card p-4 p-md-5" style={{borderRadius: '24px'}}>

                  <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center gap-3 mb-4">
                      <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center smooth-shadow" style={{width: '56px', height: '56px'}}>
                        <i className="fas fa-user-graduate text-white fs-3"></i>
                      </div>
                      <div className="text-start">
                        <h2 className="mb-0 fw-bold">Student registration</h2>
                        <p className="mb-0 text-muted">Create your hosteler account</p>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-primary border-0 mb-4" style={{borderRadius: '12px', background: 'linear-gradient(135deg, #e7f3ff 0%, #f0f8ff 100%)'}}>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-graduation-cap fs-4 me-3 text-primary"></i>
                      <div>
                        <h6 className="mb-1 fw-semibold">Registering as a student</h6>
                        <small className="text-muted">
                          Submit complaints and track their status. Warden?{' '}
                          <Link to="/signup/warden-register" className="fw-semibold">
                            Register as warden
                          </Link>
                        </small>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Roll Number <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        {...register('RollNumber', {
                          required: 'Roll Number is required',
                          minLength: { value: 4, message: 'Roll Number must be at least 4 characters' },
                          maxLength: { value: 15, message: 'Roll Number must not exceed 15 characters' }
                        })}
                        placeholder="Enter your roll number"
                        className="form-control"
                      />
                      {errors.RollNumber && <small className="text-danger">{errors.RollNumber.message}</small>}
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Block Number <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          {...register('block', {
                            required: 'Block number is required',
                            min: { value: 1, message: 'Block must be a positive number' }
                          })}
                          placeholder="Block Number"
                          className="form-control"
                        />
                        {errors.block && <small className="text-danger">{errors.block.message}</small>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Room Number <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          {...register('roomnumber', {
                            required: 'Room number is required',
                            min: { value: 1, message: 'Room number must be positive' }
                          })}
                          placeholder="Room Number"
                          className="form-control"
                        />
                        {errors.roomnumber && <small className="text-danger">{errors.roomnumber.message}</small>}
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">First Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          {...register('firstName', {
                            required: 'First Name is required',
                            minLength: { value: 2, message: 'First name must be at least 2 characters' },
                            pattern: {
                              value: /^[A-Za-z\s]+$/,
                              message: 'Only letters and spaces allowed'
                            }
                          })}
                          placeholder="First Name"
                          className="form-control"
                        />
                        {errors.firstName && <small className="text-danger">{errors.firstName.message}</small>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Last Name</label>
                        <input
                          type="text"
                          {...register('lastName', {
                            pattern: {
                              value: /^[A-Za-z\s]*$/,
                              message: 'Only letters and spaces allowed'
                            }
                          })}
                          placeholder="Last Name (Optional)"
                          className="form-control"
                        />
                        {errors.lastName && <small className="text-danger">{errors.lastName.message}</small>}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Email Address <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Please enter a valid email address'
                          }
                        })}
                        placeholder="your.email@example.com"
                        className="form-control"
                      />
                      {errors.email && <small className="text-danger">{errors.email.message}</small>}
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Password <span className="text-danger">*</span></label>
                        <input
                          type="password"
                          {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Password must be at least 6 characters' },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                              message: 'Must contain uppercase, lowercase, and number'
                            }
                          })}
                          placeholder="Enter password"
                          className="form-control"
                        />
                        {errors.password && <small className="text-danger">{errors.password.message}</small>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Confirm Password <span className="text-danger">*</span></label>
                        <input
                          type="password"
                          {...register('confirmpassword', {
                            required: 'Please confirm your password',
                            validate: value => value === password || 'Passwords do not match'
                          })}
                          placeholder="Confirm password"
                          className="form-control"
                        />
                        {errors.confirmpassword && <small className="text-danger">{errors.confirmpassword.message}</small>}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-3 fw-semibold smooth-shadow hover-lift"
                      disabled={isLoading}
                      style={{borderRadius: '12px'}}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Registering...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-2"></i>
                          Register as student
                        </>
                      )}
                    </button>
                  </form>

                  {message && (
                    <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'} mt-4 mb-0 border-0`} style={{borderRadius: '12px'}}>
                      <i className={`fas ${message.includes('successful') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                      {message}
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <p className="mb-0 text-muted">
                      Already have an account?{' '}
                      <Link to="/signup" className="text-primary fw-semibold text-decoration-none">
                        Sign in
                      </Link>
                    </p>
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

export default Register;
