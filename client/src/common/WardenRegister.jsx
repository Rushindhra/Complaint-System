import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import PageNav from '../components/PageNav';

function WardenRegister() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage('');

    try {
      const { confirmPassword, ...registrationData } = data;

      const response = await fetch('http://localhost:4700/warden-api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...registrationData,
          role: 'warden'
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Warden registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/signup');
        }, 2000);
      } else {
        setMessage(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .form-control, .form-select {
          border-radius: 12px;
          padding: 12px 16px;
          border: 2px solid #e9ecef;
        }
        .form-control:focus, .form-select:focus {
          border-color: #198754;
          box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.15);
        }
      `}</style>

      <div className="min-vh-100 d-flex flex-column" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <PageNav />
        <div className="container flex-grow-1 py-5">
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <div className="glass-card p-4 p-md-5" style={{borderRadius: '24px'}}>
                
                {/* Header */}
                <div className="bg-success bg-gradient text-white p-4 mb-5" style={{borderRadius: '16px'}}>
                  <div className="text-center">
                    <i className="fas fa-user-tie mb-3" style={{fontSize: '48px'}}></i>
                    <h2 className="mb-2 fw-bold">Warden Registration</h2>
                    <p className="mb-0 opacity-90">Create your warden account</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">
                    
                    {/* Personal Information */}
                    <div className="col-md-6">
                      <h5 className="fw-bold mb-4 text-success">
                        <i className="fas fa-user me-2"></i>
                        Personal Information
                      </h5>
                      
                      <div className="mb-4">
                        <label className="form-label fw-semibold">First Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          {...register('firstName', { 
                            required: 'First name is required',
                            minLength: { value: 2, message: 'First name must be at least 2 characters' },
                            pattern: { value: /^[A-Za-z\s]+$/, message: 'Only letters and spaces allowed' }
                          })}
                          placeholder="Enter first name"
                          className="form-control"
                        />
                        {errors.firstName && <small className="text-danger">{errors.firstName.message}</small>}
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-semibold">Last Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          {...register('lastName', { 
                            required: 'Last name is required',
                            minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                            pattern: { value: /^[A-Za-z\s]+$/, message: 'Only letters and spaces allowed' }
                          })}
                          placeholder="Enter last name"
                          className="form-control"
                        />
                        {errors.lastName && <small className="text-danger">{errors.lastName.message}</small>}
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
                          placeholder="Enter email address"
                          className="form-control"
                        />
                        {errors.email && <small className="text-danger">{errors.email.message}</small>}
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-semibold">Phone Number</label>
                        <input
                          type="tel"
                          {...register('phone', {
                            pattern: {
                              value: /^[+]?[\d\s\-()]{10,15}$/,
                              message: 'Please enter a valid phone number'
                            }
                          })}
                          placeholder="Enter phone number"
                          className="form-control"
                        />
                        {errors.phone && <small className="text-danger">{errors.phone.message}</small>}
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="col-md-6">
                      <h5 className="fw-bold mb-4 text-success">
                        <i className="fas fa-briefcase me-2"></i>
                        Professional Information
                      </h5>

                      <div className="mb-4">
                        <label className="form-label fw-semibold">Employee ID <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          {...register('employeeId', { 
                            required: 'Employee ID is required',
                            minLength: { value: 4, message: 'Employee ID must be at least 4 characters' }
                          })}
                          placeholder="e.g., WRD001"
                          className="form-control"
                        />
                        {errors.employeeId && <small className="text-danger">{errors.employeeId.message}</small>}
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-semibold">Department <span className="text-danger">*</span></label>
                        <select
                          {...register('department', { required: 'Department is required' })}
                          className="form-select"
                        >
                          <option value="">Select Department</option>
                          <option value="Student Affairs">Student Affairs</option>
                          <option value="Administration">Administration</option>
                          <option value="Security">Security</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="IT Services">IT Services</option>
                          <option value="Food Services">Food Services</option>
                        </select>
                        {errors.department && <small className="text-danger">{errors.department.message}</small>}
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-semibold">Assigned Hostel Block <span className="text-danger">*</span></label>
                        <select
                          {...register('hostelBlock', { required: 'Hostel block is required' })}
                          className="form-select"
                        >
                          <option value="">Select Hostel Block</option>
                          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(block => (
                            <option key={block} value={`Block ${block}`}>Block {block}</option>
                          ))}
                        </select>
                        {errors.hostelBlock && <small className="text-danger">{errors.hostelBlock.message}</small>}
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-semibold">Experience</label>
                        <input
                          type="text"
                          {...register('experience')}
                          placeholder="e.g., 5 years"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Section */}
                  <hr className="my-5" />
                  <h5 className="fw-bold mb-4 text-success">
                    <i className="fas fa-lock me-2"></i>
                    Security Information
                  </h5>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Password <span className="text-danger">*</span></label>
                        <input
                          type="password"
                          {...register('password', { 
                            required: 'Password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                              message: 'Must contain uppercase, lowercase, number and special character'
                            }
                          })}
                          placeholder="Enter password"
                          className="form-control"
                        />
                        {errors.password && <small className="text-danger">{errors.password.message}</small>}
                        <small className="text-muted d-block mt-2">
                          Minimum 8 characters with uppercase, lowercase, number and special character
                        </small>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Confirm Password <span className="text-danger">*</span></label>
                        <input
                          type="password"
                          {...register('confirmPassword', { 
                            required: 'Please confirm your password',
                            validate: value => value === password || 'Passwords do not match'
                          })}
                          placeholder="Confirm password"
                          className="form-control"
                        />
                        {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword.message}</small>}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-success w-100 py-3 fw-semibold"
                    disabled={isLoading}
                    style={{borderRadius: '12px', fontSize: '18px'}}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Register as Warden
                      </>
                    )}
                  </button>
                </form>

                {/* Message */}
                {message && (
                  <div className={`alert border-0 mt-4 mb-0 ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`} style={{borderRadius: '12px'}}>
                    <i className={`fas ${message.includes('successful') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                    {message}
                  </div>
                )}

                {/* Login Link */}
                <div className="text-center mt-4">
                  <p className="mb-0 text-muted">
                    Already have a warden account?{' '}
                    <Link to="/signup" className="text-success fw-semibold text-decoration-none">
                      <i className="fas fa-sign-in-alt me-1"></i>
                      Login Here
                    </Link>
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

export default WardenRegister;