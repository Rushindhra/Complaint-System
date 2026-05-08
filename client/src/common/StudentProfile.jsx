import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../config/api';

function StudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { currentUser, logout, notifications, loadNotifications } = useUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('complaints');
  const [hasOpenComplaint, setHasOpenComplaint] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    roomNumber: '',
    block: '',
    year: '',
    branch: ''
  });
  const [editingComplaintId, setEditingComplaintId] = useState(null);
  const [complaintData, setComplaintData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!currentUser || String(currentUser.Id) !== String(studentId)) {
      navigate('/signup');
      return;
    }
    
    setProfileData({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      phone: currentUser.phone || '',
      roomNumber: currentUser.roomNumber || '',
      block: currentUser.block || '',
      year: currentUser.year || '',
      branch: currentUser.branch || ''
    });
    
    fetchAllComplaints();
    if (currentUser._id) {
      loadNotifications(String(currentUser._id), currentUser.role || 'student');
    }
  }, [currentUser, studentId, navigate, loadNotifications]);

  const fetchAllComplaints = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/student-api/complaints/${currentUser.Id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setComplaints(result.payload || []);
        const openComplaint = result.payload?.find(complaint => 
          complaint.status !== 'Completed' && complaint.status !== 'verified'
        );
        setHasOpenComplaint(!!openComplaint);
      } else {
        setError(result.message || 'Failed to fetch complaints');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setMessage('First name and last name are required');
      return;
    }

    setActionLoading('profile');
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/student-api/editprofile/${currentUser.Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setIsEditingProfile(false);
      } else {
        setMessage(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      return;
    }

    setActionLoading('profile');
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/student-api/deleteprofile/${currentUser.Id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Profile deleted successfully!');
        logout();
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setMessage(result.message || 'Failed to delete profile');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const updateComplaint = async (e) => {
    e.preventDefault();
    
    if (!complaintData.title.trim() || !complaintData.description.trim() || !complaintData.category) {
      setMessage('Please fill in all required fields');
      return;
    }

    setActionLoading(editingComplaintId);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/student-api/complaint/edit/${editingComplaintId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(complaintData)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Complaint updated successfully!');
        setEditingComplaintId(null);
        fetchAllComplaints();
        setComplaintData({ title: '', description: '', category: '' });
      } else {
        setMessage(result.message || 'Failed to update complaint');
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteComplaint = async (complaintId) => {
    setActionLoading(complaintId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/student-api/${currentUser.Id}/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Completed' })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Complaint marked as completed!');
        fetchAllComplaints();
        setError('');
      } else {
        setError(result.message || 'Failed to update complaint status');
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    setActionLoading(complaintId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/student-api/complaint/delete/${complaintId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Complaint deleted successfully!');
        fetchAllComplaints();
        setError('');
      } else {
        setError(result.message || 'Failed to delete complaint');
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const startEditingComplaint = (complaint) => {
    setEditingComplaintId(complaint._id);
    setComplaintData({
      title: complaint.title,
      description: complaint.description,
      category: complaint.category
    });
  };

  const cancelEditingComplaint = () => {
    setEditingComplaintId(null);
    setComplaintData({ title: '', description: '', category: '' });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'badge bg-success';
      case 'in progress': return 'badge bg-warning text-dark';
      case 'verified': return 'badge bg-info';
      case 'rejected': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEditComplaint = (status) => {
    const lockedStatuses = ['Resolved', 'Completed', 'verified'];
    return !lockedStatuses.includes(status);
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!currentUser) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-0 shadow-lg" style={{borderRadius: '24px'}}>
                <div className="card-body p-5 text-center">
                  <i className="fas fa-exclamation-triangle text-warning mb-4" style={{fontSize: '64px'}}></i>
                  <h4 className="fw-bold mb-3">Access Denied</h4>
                  <p className="text-muted mb-4">Please log in to view your profile.</p>
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
      </div>
    );
  }

  const unreadWardenNotifications = (notifications || []).filter(
    notification => !notification.isRead && notification.senderRole === 'warden'
  ).length;

  return (
    <>
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .nav-pills .nav-link {
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .nav-pills .nav-link.active {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
        }
        .complaint-card {
          border-radius: 16px;
          border: 2px solid #e9ecef;
          transition: all 0.3s ease;
        }
        .complaint-card:hover {
          border-color: #0d6efd;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        
        {/* Header */}
        <div className="bg-white border-bottom sticky-top">
          <div className="container py-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px'}}>
                  <i className="fas fa-user-graduate text-white fs-4"></i>
                </div>
                <div>
                  <h5 className="mb-0 fw-bold">Student Portal</h5>
                  <small className="text-muted">{currentUser.firstName} {currentUser.lastName}</small>
                </div>
              </div>
              
              <div className="d-flex flex-wrap gap-2 justify-content-end">
                <Link
                  to="/"
                  className="btn btn-outline-secondary"
                  style={{ borderRadius: '8px' }}
                >
                  <i className="fas fa-home me-1"></i>
                  Home
                </Link>
                <Link 
                  to={`/student-profile/${studentId}/notifications`}
                  className="btn btn-outline-primary position-relative"
                  style={{borderRadius: '8px'}}
                >
                  <i className="fas fa-bell me-2"></i>
                  Notifications
                  {unreadWardenNotifications > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {unreadWardenNotifications}
                      <span className="visually-hidden">unread warden notifications</span>
                    </span>
                  )}
                </Link>
                <Link
                  to="/signout"
                  className="btn btn-outline-danger"
                  style={{ borderRadius: '8px' }}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Sign Out
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="bg-primary bg-gradient text-white py-4">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h2 className="fw-bold mb-2">Welcome back, {currentUser.firstName}!</h2>
                <p className="mb-0 opacity-90">
                  <i className="fas fa-id-card me-2"></i>
                  Roll No: <strong>{currentUser.Id}</strong> • 
                  <i className="fas fa-envelope ms-3 me-2"></i>
                  {currentUser.email}
                </p>
              </div>
              <div className="col-md-4 text-end">
                <div className="d-inline-flex flex-column align-items-end">
                  <div className="text-white-50 small mb-1">Your Location</div>
                  <div className="fw-semibold">
                    <i className="fas fa-building me-2"></i>
                    Block {currentUser.block || 'N/A'}, Room {currentUser.roomNumber || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {(message || error) && (
          <div className="container mt-4">
            <div className={`alert ${message ? 'alert-success' : 'alert-danger'} border-0 alert-dismissible fade show`} style={{borderRadius: '12px'}}>
              <i className={`fas ${message ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
              {message || error}
              <button type="button" className="btn-close" onClick={() => { setMessage(''); setError(''); }}></button>
            </div>
          </div>
        )}

        {/* Complaint Alert */}
        {hasOpenComplaint && (
          <div className="container mt-4">
            <div className="alert alert-warning border-0" style={{borderRadius: '12px'}}>
              <div className="d-flex align-items-center">
                <i className="fas fa-info-circle fs-4 me-3"></i>
                <div>
                  <strong>Notice:</strong> You have an unresolved complaint. Please resolve your previous complaint before raising a new one.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container py-4">
          <div className="row g-4">
            
            {/* Sidebar */}
            <div className="col-lg-3">
              <div className="glass-card p-4" style={{borderRadius: '16px', position: 'sticky', top: '100px'}}>
                <ul className="nav nav-pills flex-column gap-2">
                  <li className="nav-item">
                    <button
                      className={`nav-link w-100 text-start ${activeTab === 'complaints' ? 'active' : 'text-dark'}`}
                      onClick={() => setActiveTab('complaints')}
                    >
                      <i className="fas fa-clipboard-list me-2"></i>
                      My Complaints
                    </button>
                  </li>
                  <li className="nav-item">
                    {hasOpenComplaint ? (
                      <button
                        className="nav-link w-100 text-start text-muted"
                        disabled
                        title="Resolve your pending complaint first"
                      >
                        <i className="fas fa-lock me-2"></i>
                        New Complaint
                      </button>
                    ) : (
                      <Link
                        to={`/student-profile/${studentId}/complaint-form`}
                        className="nav-link w-100 text-start text-dark"
                      >
                        <i className="fas fa-plus me-2"></i>
                        New Complaint
                      </Link>
                    )}
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link w-100 text-start ${activeTab === 'profile' ? 'active' : 'text-dark'}`}
                      onClick={() => setActiveTab('profile')}
                    >
                      <i className="fas fa-user me-2"></i>
                      My Profile
                    </button>
                  </li>
                </ul>

                <hr className="my-4" />

                {/* Quick Stats */}
                <div>
                  <h6 className="fw-bold mb-3">Quick Stats</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Total</span>
                    <span className="badge bg-primary">{complaints.length}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Completed</span>
                    <span className="badge bg-success">
                      {complaints.filter(c => c.status?.toLowerCase() === 'completed').length}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">In Progress</span>
                    <span className="badge bg-warning">
                      {complaints.filter(c => c.status?.toLowerCase() === 'in progress').length}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Pending</span>
                    <span className="badge bg-secondary">
                      {complaints.filter(c => !c.status || c.status?.toLowerCase() === 'not started').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-lg-9">
              
              {/* Complaints Tab */}
              {activeTab === 'complaints' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">
                      <i className="fas fa-clipboard-list me-2 text-primary"></i>
                      My Complaints
                    </h4>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={fetchAllComplaints}
                      disabled={loading}
                      style={{borderRadius: '8px'}}
                    >
                      <i className="fas fa-sync-alt me-2"></i>
                      {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>

                  {loading && (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}}>
                      </div>
                      <p className="text-muted">Loading your complaints...</p>
                    </div>
                  )}

                  {!loading && complaints.length === 0 && (
                    <div className="glass-card p-5 text-center" style={{borderRadius: '16px'}}>
                      <i className="fas fa-clipboard fa-3x text-muted mb-3"></i>
                      <h5 className="fw-bold mb-2">No Complaints Found</h5>
                      <p className="text-muted mb-4">You haven't filed any complaints yet.</p>
                      <Link to={`/student-profile/${studentId}/complaint-form`} className="btn btn-primary px-4" style={{borderRadius: '12px'}}>
                        <i className="fas fa-plus me-2"></i>
                        File Your First Complaint
                      </Link>
                    </div>
                  )}

                  {!loading && complaints.length > 0 && (
                    <div className="row g-4">
                      {complaints.map((complaint) => (
                        <div key={complaint._id} className="col-12">
                          <div className="complaint-card bg-white p-4">
                            {editingComplaintId === complaint._id ? (
                              <form onSubmit={updateComplaint}>
                                <div className="mb-3">
                                  <label className="form-label fw-semibold">Title</label>
                                  <input 
                                    type="text"
                                    className="form-control"
                                    value={complaintData.title}
                                    onChange={(e) => setComplaintData({...complaintData, title: e.target.value})}
                                    required
                                    style={{borderRadius: '8px'}}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label fw-semibold">Description</label>
                                  <textarea 
                                    className="form-control"
                                    rows="3"
                                    value={complaintData.description}
                                    onChange={(e) => setComplaintData({...complaintData, description: e.target.value})}
                                    required
                                    style={{borderRadius: '8px'}}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label fw-semibold">Category</label>
                                  <select 
                                    className="form-select"
                                    value={complaintData.category}
                                    onChange={(e) => setComplaintData({...complaintData, category: e.target.value})}
                                    required
                                    style={{borderRadius: '8px'}}
                                  >
                                    <option value="">Select</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Cleaning">Cleaning</option>
                                    <option value="Furniture">Furniture</option>
                                    <option value="WiFi">WiFi</option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>
                                <div className="d-flex gap-2">
                                  <button type="submit" className="btn btn-success" disabled={actionLoading === complaint._id} style={{borderRadius: '8px'}}>
                                    <i className="fas fa-save me-2"></i>
                                    Save
                                  </button>
                                  <button type="button" className="btn btn-secondary" onClick={cancelEditingComplaint} style={{borderRadius: '8px'}}>
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div className="flex-grow-1">
                                    <h5 className="fw-bold mb-2 text-primary">{complaint.title || 'No Title'}</h5>
                                    <p className="text-muted mb-3">{complaint.description || 'No description'}</p>
                                    <div className="d-flex flex-wrap gap-3 small">
                                      <span><i className="fas fa-tag text-primary me-1"></i> {complaint.category}</span>
                                      <span><i className="fas fa-building text-primary me-1"></i> Block {complaint.block}</span>
                                      <span><i className="fas fa-door-open text-primary me-1"></i> Room {complaint.roomno}</span>
                                      <span><i className="fas fa-calendar text-primary me-1"></i> {formatDate(complaint.createdAt)}</span>
                                    </div>
                                  </div>
                                  <span className={getStatusBadgeClass(complaint.status)}>
                                    {complaint.status || 'Pending'}
                                  </span>
                                </div>
                                
                                {editingComplaintId !== complaint._id && (
                                  <div className="d-flex gap-2 border-top pt-3">
                                    {complaint.status !== 'Completed' && complaint.status !== 'verified' && (
                                      <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleCompleteComplaint(complaint._id)}
                                        disabled={actionLoading === complaint._id}
                                        style={{borderRadius: '8px'}}
                                      >
                                        <i className="fas fa-check me-1"></i>
                                        Complete
                                      </button>
                                    )}
                                    {canEditComplaint(complaint.status) && (
                                      <button
                                        className="btn btn-sm btn-warning"
                                        onClick={() => startEditingComplaint(complaint)}
                                        style={{borderRadius: '8px'}}
                                      >
                                        <i className="fas fa-edit me-1"></i>
                                        Edit
                                      </button>
                                    )}
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleDeleteComplaint(complaint._id)}
                                      disabled={actionLoading === complaint._id}
                                      style={{borderRadius: '8px'}}
                                    >
                                      <i className="fas fa-trash me-1"></i>
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h4 className="fw-bold mb-4">
                    <i className="fas fa-user me-2 text-primary"></i>
                    My Profile
                  </h4>
                  
                  <div className="glass-card p-4" style={{borderRadius: '16px'}}>
                    {!isEditingProfile ? (
                      <>
                        <div className="row g-3 mb-4">
                          <div className="col-md-6">
                            <div className="d-flex align-items-center p-3 bg-light" style={{borderRadius: '12px'}}>
                              <i className="fas fa-user text-primary fs-4 me-3"></i>
                              <div>
                                <small className="text-muted d-block">Full Name</small>
                                <strong>{currentUser.firstName} {currentUser.lastName}</strong>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex align-items-center p-3 bg-light" style={{borderRadius: '12px'}}>
                              <i className="fas fa-envelope text-primary fs-4 me-3"></i>
                              <div>
                                <small className="text-muted d-block">Email</small>
                                <strong>{currentUser.email}</strong>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex align-items-center p-3 bg-light" style={{borderRadius: '12px'}}>
                              <i className="fas fa-id-card text-primary fs-4 me-3"></i>
                              <div>
                                <small className="text-muted d-block">Roll Number</small>
                                <strong>{currentUser.Id}</strong>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex align-items-center p-3 bg-light" style={{borderRadius: '12px'}}>
                              <i className="fas fa-phone text-primary fs-4 me-3"></i>
                              <div>
                                <small className="text-muted d-block">Phone</small>
                                <strong>{currentUser.phone || 'Not provided'}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-primary"
                            onClick={() => setIsEditingProfile(true)}
                            style={{borderRadius: '8px'}}
                          >
                            <i className="fas fa-edit me-2"></i>
                            Edit Profile
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={deleteProfile}
                            disabled={actionLoading === 'profile'}
                            style={{borderRadius: '8px'}}
                          >
                            <i className="fas fa-trash me-2"></i>
                            Delete Profile
                          </button>
                        </div>
                      </>
                    ) : (
                      <form onSubmit={updateProfile}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">First Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={profileData.firstName}
                              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                              required
                              style={{borderRadius: '8px'}}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Last Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={profileData.lastName}
                              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                              required
                              style={{borderRadius: '8px'}}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Phone</label>
                            <input
                              type="tel"
                              className="form-control"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                              style={{borderRadius: '8px'}}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Room Number</label>
                            <input
                              type="number"
                              className="form-control"
                              value={profileData.roomNumber}
                              onChange={(e) => setProfileData({...profileData, roomNumber: e.target.value})}
                              style={{borderRadius: '8px'}}
                            />
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-4">
                          <button
                            type="submit"
                            className="btn btn-success"
                            disabled={actionLoading === 'profile'}
                            style={{borderRadius: '8px'}}
                          >
                            <i className="fas fa-save me-2"></i>
                            Save Changes
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setIsEditingProfile(false)}
                            style={{borderRadius: '8px'}}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentProfile;
