import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';

function WardenRegister() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Watch password for confirmation validation
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage('');

    try {
      // Remove confirmPassword from the data before sending
      const { confirmPassword, ...registrationData } = data;

      const response = await fetch('http://localhost:4700/warden-api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...registrationData,
          role: 'warden' // Ensure role is set
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
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card mt-4">
            <div className="card-header bg-success text-white">
              <h2 className="text-center mb-0">
                <i className="fas fa-user-tie me-2"></i>
                Warden Registration
              </h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                  {/* Personal Information */}
                  <div className="col-md-6">
                    <h5 className="text-success mb-3">
                      <i className="fas fa-user me-2"></i>
                      Personal Information
                    </h5>
                    
                    {/* First Name */}
                    <div className="mb-3">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        {...register('firstName', { 
                          required: 'First name is required',
                          minLength: { value: 2, message: 'First name must be at least 2 characters' },
                          maxLength: { value: 50, message: 'First name must not exceed 50 characters' },
                          pattern: { value: /^[A-Za-z\s]+$/, message: 'First name can only contain letters and spaces' }
                        })}
                        placeholder="Enter first name"
                        className="form-control"
                      />
                      {errors.firstName && <p className="text-danger small">{errors.firstName.message}</p>}
                    </div>

                    {/* Last Name */}
                    <div className="mb-3">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        {...register('lastName', { 
                          required: 'Last name is required',
                          minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                          maxLength: { value: 50, message: 'Last name must not exceed 50 characters' },
                          pattern: { value: /^[A-Za-z\s]+$/, message: 'Last name can only contain letters and spaces' }
                        })}
                        placeholder="Enter last name"
                        className="form-control"
                      />
                      {errors.lastName && <p className="text-danger small">{errors.lastName.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label">Email Address *</label>
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
                      {errors.email && <p className="text-danger small">{errors.email.message}</p>}
                    </div>

                    {/* Phone */}
                    <div className="mb-3">
                      <label className="form-label">Phone Number</label>
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
                      {errors.phone && <p className="text-danger small">{errors.phone.message}</p>}
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="col-md-6">
                    <h5 className="text-success mb-3">
                      <i className="fas fa-briefcase me-2"></i>
                      Professional Information
                    </h5>

                    {/* Employee ID */}
                    <div className="mb-3">
                      <label className="form-label">Employee ID *</label>
                      <input
                        type="text"
                        {...register('employeeId', { 
                          required: 'Employee ID is required',
                          minLength: { value: 4, message: 'Employee ID must be at least 4 characters' },
                          maxLength: { value: 20, message: 'Employee ID must not exceed 20 characters' }
                        })}
                        placeholder="Enter employee ID (e.g., WRD001)"
                        className="form-control"
                      />
                      {errors.employeeId && <p className="text-danger small">{errors.employeeId.message}</p>}
                    </div>

                    {/* Department */}
                    <div className="mb-3">
                      <label className="form-label">Department *</label>
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
                        <option value="Academic Affairs">Academic Affairs</option>
                      </select>
                      {errors.department && <p className="text-danger small">{errors.department.message}</p>}
                    </div>

                    {/* Hostel Block */}
                    <div className="mb-3">
                      <label className="form-label">Assigned Hostel Block *</label>
                      <select
                        {...register('hostelBlock', { required: 'Hostel block is required' })}
                        className="form-select"
                      >
                        <option value="">Select Hostel Block</option>
                        <option value="Block A">Block A</option>
                        <option value="Block B">Block B</option>
                        <option value="Block C">Block C</option>
                        <option value="Block D">Block D</option>
                        <option value="Block E">Block E</option>
                        <option value="Block F">Block F</option>
                        <option value="Block G">Block G</option>
                        <option value="Block H">Block H</option>
                      </select>
                      {errors.hostelBlock && <p className="text-danger small">{errors.hostelBlock.message}</p>}
                    </div>

                    {/* Experience */}
                    <div className="mb-3">
                      <label className="form-label">Experience</label>
                      <input
                        type="text"
                        {...register('experience')}
                        placeholder="e.g., 5 years"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="row">
                  <div className="col-12">
                    <hr className="my-4" />
                    <h5 className="text-success mb-3">
                      <i className="fas fa-lock me-2"></i>
                      Security Information
                    </h5>
                  </div>
                  
                  <div className="col-md-6">
                    {/* Password */}
                    <div className="mb-3">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        {...register('password', { 
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' },
                          maxLength: { value: 20, message: 'Password must not exceed 20 characters' },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                            message: 'Password must contain uppercase, lowercase, number and special character'
                          }
                        })}
                        placeholder="Enter password"
                        className="form-control"
                      />
                      {errors.password && <p className="text-danger small">{errors.password.message}</p>}
                      <div className="form-text">
                        Password must contain at least 8 characters with uppercase, lowercase, number and special character.
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    {/* Confirm Password */}
                    <div className="mb-3">
                      <label className="form-label">Confirm Password *</label>
                      <input
                        type="password"
                        {...register('confirmPassword', { 
                          required: 'Please confirm your password',
                          validate: value => value === password || 'Passwords do not match'
                        })}
                        placeholder="Confirm password"
                        className="form-control"
                      />
                      {errors.confirmPassword && <p className="text-danger small">{errors.confirmPassword.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-success btn-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Register as Warden
                      </>
                    )}
                  </button>
                </div>
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
              <p className="mb-0">
                Already have a warden account?{' '}
                <Link to="/signup" className="text-success text-decoration-none">
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Login Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WardenRegister;