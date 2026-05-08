import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../config/api';

function VerifyComplaints() {
  const { wardenId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isWarden } = useUser();
  
  // State management
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'in_progress', 'completed'
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Notification compose state
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: 'complaint_update',
    priority: 'normal'
  });
  
  // Complaint update state
  const [updateData, setUpdateData] = useState({
    status: '',
    wardenComments: '',
    estimatedResolution: ''
  });

  useEffect(() => {
    // Check if user is authenticated and is a warden
    if (!currentUser || !isWarden() || String(currentUser.Id) !== String(wardenId)) {
      console.log('Access denied - user:', currentUser, 'wardenId:', wardenId);
      navigate('/signup');
      return;
    }
    
    // Fetch complaints on component load
    fetchComplaints();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchComplaints, 30000);
    return () => clearInterval(interval);
  }, [currentUser, wardenId, navigate]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      console.log('Fetching complaints...');
      
      const response = await fetch(`${API_BASE_URL}/warden-api/complaints/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok) {
        setComplaints(result.payload || []);
        console.log('Complaints loaded:', result.payload?.length || 0);
      } else {
        setError(result.message || 'Failed to fetch complaints');
        console.error('Failed to fetch complaints:', result.message);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus, comments = '') => {
    setActionLoading(complaintId);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      
      // FIXED: Correct API endpoint URL
      const response = await fetch(`${API_BASE_URL}/warden-api/warden/verify/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          wardenId: currentUser.Id,
          wardenName: `${currentUser.firstName} ${currentUser.lastName}`,
          wardenComments: comments,
          updatedAt: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`Complaint ${newStatus.toLowerCase()} successfully!`);
        fetchComplaints(); // Refresh the list
        
        // Send notification to student
        const updatedComplaint = result.payload || complaints.find(c => c._id === complaintId);
        await sendAutoNotification(updatedComplaint, newStatus);
      } else {
        setError(result.message || `Failed to update complaint status`);
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // FIXED: Complete sendAutoNotification function
  const sendAutoNotification = async (complaint, newStatus) => {
    if (!complaint || (!complaint.studentId && !complaint.studentRollNo && !complaint.createdBy)) return;

    try {
      const token = localStorage.getItem('authToken');
      const notificationTitle = `Complaint ${newStatus}: ${complaint.title}`;
      const notificationMessage = `Your complaint "${complaint.title}" has been ${newStatus.toLowerCase()} by ${currentUser.firstName} ${currentUser.lastName}. ${updateData.wardenComments ? `Warden comments: ${updateData.wardenComments}` : ''}`;

      const response = await fetch(`${API_BASE_URL}/warden-api/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId: currentUser.Id,
          senderName: `${currentUser.firstName} ${currentUser.lastName}`,
          senderRole: 'warden',
          recipientId: complaint.studentId || complaint.studentRollNo || complaint.createdBy,
          recipientEmail: complaint.studentEmail,
          title: notificationTitle,
          message: notificationMessage,
          type: 'complaint_update',
          priority: 'normal',
          relatedComplaintId: complaint._id
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Auto notification sent successfully');
      } else {
        console.error('Auto notification failed:', result.message);
      }
    } catch (error) {
      console.error('Error sending auto notification:', error);
    }
  };

  // FIXED: Complete sendCustomNotification function
  const sendCustomNotification = async (e) => {
    e.preventDefault();
    
    if (!selectedComplaint || !notificationData.title.trim() || !notificationData.message.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setActionLoading('notification');
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/warden-api/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId: currentUser.Id,
          senderName: `${currentUser.firstName} ${currentUser.lastName}`,
          senderRole: 'warden',
          recipientId: selectedComplaint.studentId || selectedComplaint.studentRollNo || selectedComplaint.createdBy,
          recipientEmail: selectedComplaint.studentEmail,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          priority: notificationData.priority,
          relatedComplaintId: selectedComplaint._id
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Notification sent successfully!');
        setShowNotificationModal(false);
        setNotificationData({
          title: '',
          message: '',
          type: 'complaint_update',
          priority: 'normal'
        });
      } else {
        setError(result.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateData({
      status: complaint.status || 'Pending',
      wardenComments: complaint.wardenComments || '',
      estimatedResolution: complaint.estimatedResolution || ''
    });
    setShowDetailsModal(true);
  };

  const openNotificationModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNotificationData({
      title: `Update: ${complaint.title}`,
      message: `Regarding your complaint "${complaint.title}", `,
      type: 'complaint_update',
      priority: 'normal'
    });
    setShowNotificationModal(true);
  };

  const updateComplaintWithDetails = async (e) => {
    e.preventDefault();
    
    if (!selectedComplaint) return;
    
    setActionLoading(selectedComplaint._id);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/warden-api/complaints/${selectedComplaint._id}/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: updateData.status,
          wardenId: currentUser.Id,
          wardenName: `${currentUser.firstName} ${currentUser.lastName}`,
          wardenComments: updateData.wardenComments,
          estimatedResolution: updateData.estimatedResolution,
          updatedAt: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Complaint updated successfully!');
        setShowDetailsModal(false);
        fetchComplaints();
        
        // Send notification
        await sendAutoNotification(selectedComplaint, updateData.status);
      } else {
        setError(result.message || 'Failed to update complaint');
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getFilteredComplaints = () => {
    switch (filter) {
      case 'pending':
        return complaints.filter(c => !c.status || c.status.toLowerCase() === 'pending' || c.status.toLowerCase() === 'not started');
      case 'in_progress':
        return complaints.filter(c => c.status?.toLowerCase() === 'in progress');
      case 'completed':
        return complaints.filter(c => c.status?.toLowerCase() === 'completed');
      case 'verified':
        return complaints.filter(c => c.status?.toLowerCase() === 'verified');
      case 'rejected':
        return complaints.filter(c => c.status?.toLowerCase() === 'rejected');
      default:
        return complaints;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'badge bg-success';
      case 'in progress':
        return 'badge bg-warning text-dark';
      case 'verified':
        return 'badge bg-info';
      case 'rejected':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'border-danger';
      case 'medium': return 'border-warning';
      case 'low': return 'border-success';
      default: return 'border-primary';
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

  const goBack = () => {
    navigate(`/warden-profile/${wardenId}`);
  };

  // Auto-hide message
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  if (!currentUser || !isWarden()) {
    return (
      <div className="container">
        <div className="row justify-content-center mt-5">
          <div className="col-md-6">
            <div className="alert alert-warning text-center">
              <h4>Access Denied</h4>
              <p>Warden access required to verify complaints.</p>
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredComplaints = getFilteredComplaints();
  const statusCounts = {
    total: complaints.length,
    pending: complaints.filter(c => !c.status || c.status.toLowerCase() === 'pending' || c.status.toLowerCase() === 'not started').length,
    inProgress: complaints.filter(c => c.status?.toLowerCase() === 'in progress').length,
    completed: complaints.filter(c => c.status?.toLowerCase() === 'completed').length,
    verified: complaints.filter(c => c.status?.toLowerCase() === 'verified').length,
    rejected: complaints.filter(c => c.status?.toLowerCase() === 'rejected').length
  };

  return (
    <div className="container-fluid">
      <style>{`
        .verify-shell {
          background: #f6f8fb;
          min-height: 100vh;
        }
        .verify-summary {
          border: 1px solid #e6ebf2;
          border-radius: 8px;
          background: #fff;
        }
        .verify-stat {
          border: 1px solid #e9eef5;
          border-radius: 8px;
          background: #fff;
          min-height: 92px;
        }
        .verify-table th {
          white-space: nowrap;
          font-size: 0.82rem;
          text-transform: uppercase;
          color: #506070;
        }
        .verify-action-grid {
          display: grid;
          grid-template-columns: repeat(2, 36px);
          gap: 6px;
        }
      `}</style>
      <div className="verify-shell">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
            <div className="container">
              <span className="navbar-brand mb-0 h1">
                <i className="fas fa-clipboard-check me-2"></i>
                Verify Complaints
              </span>
              <div className="navbar-nav ms-auto d-flex flex-row flex-wrap gap-2 align-items-center">
                <Link to="/" className="btn btn-outline-light btn-sm">
                  <i className="fas fa-home me-1"></i>
                  Home
                </Link>
                <button type="button" className="btn btn-outline-light btn-sm" onClick={goBack}>
                  <i className="fas fa-arrow-left me-1"></i>
                  Dashboard
                </button>
                <Link to="/signout" className="btn btn-outline-light btn-sm">
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Sign Out
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="verify-summary p-3 shadow-sm">
            <div className="container">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                <div>
                  <h4 className="text-success mb-1">
                    <i className="fas fa-tasks me-2"></i>
                    Complaint Management Center
                  </h4>
                  <p className="text-muted mb-0">Review, verify, reject, or notify students from one focused queue.</p>
                </div>
                <button 
                  className="btn btn-outline-success"
                  onClick={fetchComplaints}
                  disabled={loading}
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              <div className="row g-3 mt-2">
                {[
                  ['Total', statusCounts.total, 'fa-layer-group', 'text-primary'],
                  ['Pending', statusCounts.pending, 'fa-hourglass-half', 'text-secondary'],
                  ['In Progress', statusCounts.inProgress, 'fa-play-circle', 'text-info'],
                  ['Completed', statusCounts.completed, 'fa-check-double', 'text-success'],
                  ['Verified', statusCounts.verified, 'fa-shield-alt', 'text-success'],
                  ['Rejected', statusCounts.rejected, 'fa-times-circle', 'text-danger']
                ].map(([label, value, icon, color]) => (
                  <div className="col-6 col-md-4 col-xl-2" key={label}>
                    <div className="verify-stat p-3">
                      <div className={`mb-2 ${color}`}>
                        <i className={`fas ${icon}`}></i>
                      </div>
                      <div className="h4 mb-0 fw-bold">{value}</div>
                      <div className="small text-muted">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {(message || error) && (
        <div className="row mt-3">
          <div className="col-12">
            <div className="container">
              <div className={`alert ${message ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                <i className={`fas ${message ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                {message || error}
                <button type="button" className="btn-close" onClick={() => {setMessage(''); setError('');}}></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="container">
            <div className="card">
              <div className="card-header bg-white">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div className="d-flex flex-wrap gap-2" role="group" aria-label="Complaint filters">
                    <button 
                      className={`btn btn-sm ${filter === 'all' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setFilter('all')}
                    >
                      All ({statusCounts.total})
                    </button>
                    <button 
                      className={`btn btn-sm ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => setFilter('pending')}
                    >
                      Pending ({statusCounts.pending})
                    </button>
                    <button 
                      className={`btn btn-sm ${filter === 'in_progress' ? 'btn-info' : 'btn-outline-info'}`}
                      onClick={() => setFilter('in_progress')}
                    >
                      In Progress ({statusCounts.inProgress})
                    </button>
                    <button 
                      className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('completed')}
                    >
                      Completed ({statusCounts.completed})
                    </button>
                    <button 
                      className={`btn btn-sm ${filter === 'verified' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setFilter('verified')}
                    >
                      Verified ({statusCounts.verified})
                    </button>
                    <button 
                      className={`btn btn-sm ${filter === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => setFilter('rejected')}
                    >
                      Rejected ({statusCounts.rejected})
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-body p-0">
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading complaints...</p>
                  </div>
                )}

                {!loading && filteredComplaints.length === 0 && (
                  <div className="text-center py-5">
                    <i className="fas fa-clipboard fa-4x text-muted mb-3"></i>
                    <h5 className="text-muted">No Complaints Found</h5>
                    <p className="text-muted">
                      {filter === 'all' ? "No complaints have been submitted yet." : 
                       `No ${filter.replace('_', ' ')} complaints found.`}
                    </p>
                  </div>
                )}

                {!loading && filteredComplaints.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 verify-table">
                      <thead className="table-success">
                        <tr>
                          <th>Complaint Details</th>
                          <th>Student Info</th>
                          <th>Status</th>
                          <th>Priority</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredComplaints.map((complaint, index) => (
                          <tr key={complaint._id || index} className={getPriorityColor(complaint.priority)}>
                            <td>
                              <div>
                                <strong className="text-primary">{complaint.title || 'No Title'}</strong>
                                <br />
                                <small className="text-muted">
                                  <i className="fas fa-tag me-1"></i>
                                  {complaint.category || 'N/A'} | 
                                  <i className="fas fa-building ms-2 me-1"></i>
                                  {complaint.block || 'N/A'} - {complaint.roomno || 'N/A'}
                                </small>
                                <br />
                                <small className="text-truncate d-block" style={{maxWidth: '200px'}}>
                                  {complaint.description || 'No description'}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <strong>{complaint.studentName || 'N/A'}</strong>
                                <br />
                                <small className="text-muted">
                                  <i className="fas fa-envelope me-1"></i>
                                  {complaint.studentEmail || 'N/A'}
                                </small>
                                <br />
                                <small className="text-muted">
                                  <i className="fas fa-id-card me-1"></i>
                                  ID: {complaint.studentRollNo || complaint.createdBy || 'N/A'}
                                </small>
                              </div>
                            </td>
                            <td>
                              <span className={getStatusBadgeClass(complaint.status)}>
                                {complaint.status || 'Pending'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                complaint.priority?.toLowerCase() === 'high' ? 'bg-danger' :
                                complaint.priority?.toLowerCase() === 'medium' ? 'bg-warning' :
                                'bg-success'
                              }`}>
                                {complaint.priority || 'Normal'}
                              </span>
                            </td>
                            <td>
                              <small>
                                <i className="fas fa-calendar me-1"></i>
                                {formatDate(complaint.createdAt)}
                                {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                                  <>
                                    <br />
                                    <i className="fas fa-edit me-1"></i>
                                    Updated: {formatDate(complaint.updatedAt)}
                                  </>
                                )}
                              </small>
                            </td>
                            <td>
                              <div className="verify-action-grid" role="group" aria-label="Complaint actions">
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => viewComplaintDetails(complaint)}
                                  title="View Details"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                
                                {complaint.status?.toLowerCase() !== 'verified' && (
                                  <>
                                    <button 
                                      className="btn btn-sm btn-outline-info"
                                      onClick={() => updateComplaintStatus(complaint._id, 'In Progress')}
                                      disabled={actionLoading === complaint._id}
                                      title="Mark In Progress"
                                    >
                                      {actionLoading === complaint._id ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                      ) : (
                                        <i className="fas fa-play"></i>
                                      )}
                                    </button>
                                    
                                    <button 
                                      className="btn btn-sm btn-outline-success"
                                      onClick={() => updateComplaintStatus(complaint._id, 'verified')}
                                      disabled={actionLoading === complaint._id}
                                      title="Verify"
                                    >
                                      {actionLoading === complaint._id ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                      ) : (
                                        <i className="fas fa-check"></i>
                                      )}
                                    </button>
                                    
                                    <button 
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => updateComplaintStatus(complaint._id, 'rejected')}
                                      disabled={actionLoading === complaint._id}
                                      title="Reject"
                                    >
                                      {actionLoading === complaint._id ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                      ) : (
                                        <i className="fas fa-times"></i>
                                      )}
                                    </button>
                                  </>
                                )}
                                
                                <button 
                                  className="btn btn-sm btn-outline-warning"
                                  onClick={() => openNotificationModal(complaint)}
                                  title="Send Notification"
                                >
                                  <i className="fas fa-bell"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-clipboard-check me-2"></i>
                  Complaint Details & Update
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-primary">Complaint Information</h6>
                    <div className="mb-3">
                      <strong>Title:</strong> {selectedComplaint.title}
                    </div>
                    <div className="mb-3">
                      <strong>Description:</strong><br />
                      {selectedComplaint.description}
                    </div>
                    <div className="mb-3">
                      <strong>Category:</strong> {selectedComplaint.category}
                    </div>
                    <div className="mb-3">
                      <strong>Location:</strong> Block {selectedComplaint.block}, Room {selectedComplaint.roomno}
                    </div>
                    <div className="mb-3">
                      <strong>Priority:</strong> 
                      <span className={`badge ms-2 ${
                        selectedComplaint.priority?.toLowerCase() === 'high' ? 'bg-danger' :
                        selectedComplaint.priority?.toLowerCase() === 'medium' ? 'bg-warning' :
                        'bg-success'
                      }`}>
                        {selectedComplaint.priority || 'Normal'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h6 className="text-success">Student Information</h6>
                    <div className="mb-3">
                      <strong>Name:</strong> {selectedComplaint.studentName}
                    </div>
                    <div className="mb-3">
                      <strong>Email:</strong> {selectedComplaint.studentEmail}
                    </div>
                    <div className="mb-3">
                      <strong>Student ID:</strong> {selectedComplaint.studentRollNo || selectedComplaint.createdBy}
                    </div>
                    <div className="mb-3">
                      <strong>Created:</strong> {formatDate(selectedComplaint.createdAt)}
                    </div>
                    <div className="mb-3">
                      <strong>Current Status:</strong>
                      <span className={`ms-2 ${getStatusBadgeClass(selectedComplaint.status)}`}>
                        {selectedComplaint.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <hr />
                
                <form onSubmit={updateComplaintWithDetails}>
                  <h6 className="text-warning">Update Complaint</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Status *</label>
                        <select 
                          className="form-select"
                          value={updateData.status}
                          onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                          required
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Estimated Resolution</label>
                        <input 
                          type="date"
                          className="form-control"
                          value={updateData.estimatedResolution}
                          onChange={(e) => setUpdateData({...updateData, estimatedResolution: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Warden Comments</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={updateData.wardenComments}
                      onChange={(e) => setUpdateData({...updateData, wardenComments: e.target.value})}
                      placeholder="Enter your comments about this complaint..."
                      maxLength="500"
                    />
                    <div className="form-text">{updateData.wardenComments.length}/500 characters</div>
                  </div>
                  
                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowDetailsModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                      disabled={actionLoading === selectedComplaint._id}
                    >
                      {actionLoading === selectedComplaint._id ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i>
                          Update Complaint
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showNotificationModal && selectedComplaint && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <i className="fas fa-paper-plane me-2"></i>
                  Send Notification to {selectedComplaint.studentName}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowNotificationModal(false)}
                ></button>
              </div>
              <form onSubmit={sendCustomNotification}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Notification Type</label>
                    <select 
                      className="form-select"
                      value={notificationData.type}
                      onChange={(e) => setNotificationData({...notificationData, type: e.target.value})}
                    >
                      <option value="complaint_update">Complaint Update</option>
                      <option value="general">General</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Priority</label>
                    <select 
                      className="form-select"
                      value={notificationData.priority}
                      onChange={(e) => setNotificationData({...notificationData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Title *</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={notificationData.title}
                      onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
                      placeholder="Enter notification title"
                      maxLength="100"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Message *</label>
                    <textarea 
                      className="form-control"
                      rows="4"
                      value={notificationData.message}
                      onChange={(e) => setNotificationData({...notificationData, message: e.target.value})}
                      placeholder="Enter your message"
                      maxLength="500"
                      required
                    />
                    <div className="form-text">{notificationData.message.length}/500 characters</div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowNotificationModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-warning"
                    disabled={actionLoading === 'notification'}
                  >
                    {actionLoading === 'notification' ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-1"></i>
                        Send Notification
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default VerifyComplaints;
