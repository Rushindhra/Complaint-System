import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import PageNav from '../components/PageNav';

function ComplaintForm() {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { currentUser } = useUser();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const watchCategory = watch("category", "");

  async function postComplaint(complaintObj) {
    if (!currentUser) {
      setMessage('Please log in to post a complaint.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const complaintData = {
        title: complaintObj.title,
        description: complaintObj.content,
        category: complaintObj.category === 'other' ? complaintObj.other : complaintObj.category,
        roomno: complaintObj.roomno || currentUser.roomNumber,
        block: complaintObj.block || currentUser.block
      };

      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4700/student-api/${currentUser.Id}/postcomplaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(complaintData)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Complaint posted successfully!');
        reset();
        setTimeout(() => {
          navigate(`/student-profile/${currentUser.Id}`);
        }, 2000);
      } else {
        setMessage(result.message || 'Failed to post complaint. Please try again.');
      }
    } catch (error) {
      console.error('Error posting complaint:', error);
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!currentUser) {
    return (
      <>
        <style>{`
          .glass-card {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
        `}</style>
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="glass-card p-5 text-center" style={{borderRadius: '24px'}}>
                  <i className="fas fa-exclamation-triangle text-warning mb-4" style={{fontSize: '64px'}}></i>
                  <h4 className="fw-bold mb-3">Access Denied</h4>
                  <p className="text-muted mb-4">Please log in to post a complaint.</p>
                  <button 
                    className="btn btn-primary px-5 py-3"
                    onClick={() => navigate('/signup')}
                    style={{borderRadius: '12px'}}
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

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
          transition: all 0.3s ease;
        }
        .form-control:focus, .form-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
        }
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
      `}</style>

      <div className="min-vh-100 d-flex flex-column" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <PageNav />
        <div className="flex-grow-1 py-5">
          <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="glass-card" style={{borderRadius: '24px', overflow: 'hidden'}}>
                
                {/* Header */}
                <div className="bg-primary bg-gradient text-white p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <Link 
                      to={`/student-profile/${studentId || currentUser.Id}`} 
                      className="btn btn-light btn-sm hover-lift"
                      style={{borderRadius: '8px'}}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Profile
                    </Link>
                    
                    <div className="text-center flex-grow-1">
                      <h3 className="mb-0 fw-bold">
                        <i className="fas fa-file-alt me-2"></i>
                        Write a Complaint
                      </h3>
                    </div>
                    
                    <div style={{width: '120px'}}></div>
                  </div>
                </div>

                {/* Form Body */}
                <div className="p-4 p-md-5">
                  <form onSubmit={handleSubmit(postComplaint)}>
                    
                    {/* Title */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        Title <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        className='form-control' 
                        {...register("title", { 
                          required: "Title is required",
                          maxLength: { value: 100, message: "Title must be less than 100 characters" }
                        })}
                        placeholder="Enter a brief title for your complaint"
                      />
                      {errors.title && <small className="text-danger">{errors.title.message}</small>}
                    </div>

                    {/* Description */}
                    <div className='mb-4'>
                      <label className='form-label fw-semibold'>
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea 
                        {...register("content", { 
                          required: "Description is required",
                          maxLength: { value: 500, message: "Description must be less than 500 characters" }
                        })} 
                        className='form-control' 
                        rows="4"
                        placeholder="Describe your complaint in detail..."
                      ></textarea>
                      {errors.content && <small className="text-danger">{errors.content.message}</small>}
                    </div>

                    {/* Category */}
                    <div className='mb-4'>
                      <label className="form-label fw-semibold">
                        Select a category <span className="text-danger">*</span>
                      </label>
                      <select 
                        {...register("category", { required: "Category is required" })} 
                        className="form-select"
                      >
                        <option value="">Select a category</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Furniture">Furniture</option>
                        <option value="WiFi">WiFi</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.category && <small className="text-danger">{errors.category.message}</small>}
                    </div>

                    {/* Other category */}
                    {watchCategory === 'other' && (
                      <div className="mb-4">
                        <label className="form-label fw-semibold">
                          Please specify the category <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="text" 
                          className='form-control' 
                          {...register("other", {
                            required: watchCategory === 'other' ? "Please specify the category" : false
                          })}
                          placeholder="Specify the category"
                        />
                        {errors.other && <small className="text-danger">{errors.other.message}</small>}
                      </div>
                    )}

                    {/* Room and Block */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Room No</label>
                        <input 
                          type="number" 
                          className='form-control' 
                          {...register("roomno", {
                            valueAsNumber: true,
                            min: { value: 1, message: "Room number must be positive" }
                          })}
                          defaultValue={currentUser.roomNumber}
                          placeholder={`Current: ${currentUser.roomNumber || 'Not set'}`}
                        />
                        {errors.roomno && <small className="text-danger">{errors.roomno.message}</small>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Block</label>
                        <input 
                          type="text" 
                          className='form-control' 
                          {...register("block")}
                          defaultValue={currentUser.block}
                          placeholder={`Current: ${currentUser.block || 'Not set'}`}
                        />
                      </div>
                    </div>

                    {/* User Info Display */}
                    <div className="alert alert-primary border-0 mb-4" style={{borderRadius: '12px', background: 'linear-gradient(135deg, #e7f3ff 0%, #f0f8ff 100%)'}}>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-info-circle fs-4 me-3 text-primary"></i>
                        <div>
                          <h6 className="mb-1 fw-semibold">Complaint from:</h6>
                          <small className="text-muted">
                            {currentUser.firstName} {currentUser.lastName} • {currentUser.email}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="d-flex gap-3">
                      <Link 
                        to={`/student-profile/${studentId || currentUser.Id}`}
                        className="btn btn-outline-secondary px-4 py-3 hover-lift"
                        style={{borderRadius: '12px', borderWidth: '2px'}}
                      >
                        <i className="fas fa-times me-2"></i>
                        Cancel
                      </Link>
                      
                      <button 
                        type="submit" 
                        className="btn btn-primary flex-grow-1 py-3 fw-semibold hover-lift"
                        disabled={isLoading}
                        style={{borderRadius: '12px'}}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Posting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Post Complaint
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Message display */}
                  {message && (
                    <div className={`alert border-0 mt-4 mb-0 ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`} style={{borderRadius: '12px'}}>
                      <div className="d-flex align-items-center">
                        <i className={`fas ${message.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-3 fs-4`}></i>
                        <div>
                          <strong>{message.includes('successfully') ? 'Success!' : 'Error'}</strong>
                          <div>{message}</div>
                        </div>
                      </div>
                    </div>
                  )}
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

export default ComplaintForm;