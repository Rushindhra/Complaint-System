import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

function Register() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Watch password and role to conditionally validate and show fields
  const password = watch('password');
  const selectedRole = watch('role');

  async function handleFormSubmit(data) {
    // Validate password match
    if (data.password !== data.confirmpassword) {
      setMessage('Passwords do not match!');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      let registrationData;
      let registerUrl;
      const baseUrl = 'http://localhost:4700';

      // Prepare data based on role
      if (data.role === 'warden') {
        // Warden registration data
        registrationData = {
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName || '',
          email: data.email,
          password: data.password,
          phone: data.phone,
          profileImageUrl: data.profileImageUrl || ''
        };
        registerUrl = `${baseUrl}/warden-api/register`; // Update with your warden registration endpoint
      } else {
        // Student/Hosteler registration data
        registrationData = {
          role: data.role,
          Id: data.RollNumber,
          firstName: data.firstName,
          lastName: data.lastName || '',
          email: data.email,
          password: data.password,
          roomNumber: parseInt(data.roomnumber),
          block: parseInt(data.block)
        };
        registerUrl = `${baseUrl}/student-api/register`;
      }

      console.log("Sending registration data:", registrationData);

      // Make API call to backend
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      // Check if response is JSON before parsing
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
        setMessage(`${data.role} registration successful! Redirecting to login...`);
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
        setMessage('❌ Cannot connect to server. Please check if the backend server is running on http://localhost:4700');
      } else {
        setMessage('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card mt-4">
            <div className="card-header">
              <h2 className="text-center text-info mb-0">Registration</h2>
              <p className="text-center text-muted small mb-0 mt-2">
                Register as a Student or Warden
              </p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(handleFormSubmit)}>
                {/* Role Selection */}
                <div className="mb-3">
                  <label className="form-label">Select Role *</label>
                  <select
                    {...register('role', { required: 'Please select a role' })}
                    className="form-control"
                    defaultValue=""
                  >
                    <option value="" disabled>Select Role</option>
                    <option value="Hosteler">Student (Hosteler)</option>
                    <option value="warden">Warden</option>
                  </select>
                  {errors.role && (
                    <p className="text-warning small">{errors.role.message}</p>
                  )}
                </div>

                {/* Conditional Fields for Students */}
                {selectedRole === 'Hosteler' && (
                  <>
                    {/* Roll Number */}
                    <div className="mb-3">
                      <label className="form-label">Roll Number *</label>
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
                      {errors.RollNumber && <p className="text-warning small">{errors.RollNumber.message}</p>}
                    </div>

                    {/* Block and Room Number for Students */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Block Number *</label>
                        <input 
                          type="number" 
                          {...register('block', { 
                            required: 'Block number is required',
                            min: { value: 1, message: 'Block must be a positive number' },
                            max: { value: 20, message: 'Block number seems too high' }
                          })} 
                          placeholder="Block Number" 
                          className="form-control" 
                        />
                        {errors.block && <p className="text-warning small">{errors.block.message}</p>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Room Number *</label>
                        <input 
                          type="number" 
                          {...register('roomnumber', { 
                            required: 'Room number is required',
                            min: { value: 1, message: 'Room number must be a positive number' },
                            max: { value: 999, message: 'Room number seems too high' }
                          })} 
                          placeholder="Room Number" 
                          className="form-control" 
                        />
                        {errors.roomnumber && <p className="text-warning small">{errors.roomnumber.message}</p>}
                      </div>
                    </div>
                  </>
                )}

                {/* Conditional Fields for Wardens */}
                {selectedRole === 'warden' && (
                  <>
                    {/* Phone Number for Warden */}
                    <div className="mb-3">
                      <label className="form-label">Phone Number *</label>
                      <input 
                        type="tel" 
                        {...register('phone', { 
                          required: 'Phone number is required',
                          pattern: {
                            value: /^\d{10}$/,
                            message: 'Phone number must be exactly 10 digits'
                          }
                        })} 
                        placeholder="Enter 10-digit phone number" 
                        className="form-control" 
                        maxLength="10"
                      />
                      {errors.phone && <p className="text-warning small">{errors.phone.message}</p>}
                      <small className="text-muted">Enter exactly 10 digits without spaces or symbols</small>
                    </div>

                    {/* Profile Image URL (Optional) */}
                    <div className="mb-3">
                      <label className="form-label">Profile Image URL (Optional)</label>
                      <input 
                        type="url" 
                        {...register('profileImageUrl', {
                          pattern: {
                            value: /^https?:\/\/.+/,
                            message: 'Please enter a valid URL starting with http:// or https://'
                          }
                        })} 
                        placeholder="https://example.com/profile-image.jpg" 
                        className="form-control" 
                      />
                      {errors.profileImageUrl && <p className="text-warning small">{errors.profileImageUrl.message}</p>}
                    </div>
                  </>
                )}

                {/* Common Fields */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">First Name *</label>
                    <input 
                      type="text" 
                      {...register('firstName', { 
                        required: 'First Name is required',
                        minLength: { value: 2, message: 'First name must be at least 2 characters' },
                        pattern: {
                          value: /^[A-Za-z\s]+$/,
                          message: 'First name can only contain letters and spaces'
                        }
                      })} 
                      placeholder="First Name" 
                      className="form-control" 
                    />
                    {errors.firstName && <p className="text-warning small">{errors.firstName.message}</p>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input 
                      type="text" 
                      {...register('lastName', {
                        pattern: {
                          value: /^[A-Za-z\s]*$/,
                          message: 'Last name can only contain letters and spaces'
                        }
                      })} 
                      placeholder="Last Name (Optional)" 
                      className="form-control" 
                    />
                    {errors.lastName && <p className="text-warning small">{errors.lastName.message}</p>}
                  </div>
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
                    placeholder="your.email@example.com" 
                    className="form-control" 
                  />
                  {errors.email && <p className="text-warning small">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Password *</label>
                    <input 
                      type="password" 
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                        maxLength: { value: 20, message: 'Password must not exceed 20 characters' },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                        }
                      })} 
                      placeholder="Enter password" 
                      className="form-control" 
                    />
                    {errors.password && <p className="text-warning small">{errors.password.message}</p>}
                    <small className="text-muted">Must include uppercase, lowercase, and number</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Confirm Password *</label>
                    <input 
                      type="password" 
                      {...register('confirmpassword', { 
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })} 
                      placeholder="Confirm password" 
                      className="form-control" 
                    />
                    {errors.confirmpassword && <p className="text-warning small">{errors.confirmpassword.message}</p>}
                  </div>
                </div>

                {/* Role-specific Information */}
                {selectedRole && (
                  <div className="alert alert-light border">
                    <h6 className="mb-2">
                      <i className={`fas ${selectedRole === 'warden' ? 'fa-user-tie' : 'fa-graduation-cap'} me-2`}></i>
                      Registration as: {selectedRole === 'warden' ? 'Warden' : 'Student (Hosteler)'}
                    </h6>
                    <small className="text-muted">
                      {selectedRole === 'warden' 
                        ? 'You will have access to complaint verification and management features.'
                        : 'You will be able to submit complaints and track their status.'
                      }
                    </small>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-info w-100" 
                  disabled={isLoading || !selectedRole}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Registering...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-2"></i>
                      Register as {selectedRole === 'warden' ? 'Warden' : 'Student'}
                    </>
                  )}
                </button>
              </form>

              {/* Message display */}
              {message && (
                <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'} mt-3`}>
                  <i className={`fas ${message.includes('successful') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                  {message}
                </div>
              )}
            </div>
            <div className="card-footer text-center">
              <p className="mb-0">
                Already have an account?{' '}
                <Link to="/signup" className="text-info fw-bold">
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

export default Register;