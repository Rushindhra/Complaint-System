import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

function NotificationSystem() {
  const { currentUser, isWarden, isStudent, notifications, markNotificationAsRead, deleteNotification, loadNotifications } = useUser();
  const navigate = useNavigate();
  const { studentId, wardenId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showComposeModal, setShowComposeModal] = useState(false);
  
  const [composeData, setComposeData] = useState({
    recipientId: '',
    recipientEmail: '',
    title: '',
    message: '',
    type: 'general',
    priority: 'normal'
  });
  
  const [studentList, setStudentList] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/signup');
      return;
    }

    // Check access - compare URL param with user's display ID (studentId/employeeId)
    if (isStudent() && String(currentUser.Id) !== String(studentId)) {
      navigate('/signup');
      return;
    }

    if (isWarden() && String(currentUser.Id) !== String(wardenId)) {
      navigate('/signup');
      return;
    }

    refreshNotifications();
    
    if (isWarden()) {
      loadStudentList();
    }

    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, studentId, wardenId]);

  const refreshNotifications = async () => {
    if (currentUser && currentUser._id) {
      await loadNotifications(
        String(currentUser._id),
        currentUser.role === 'warden' ? 'warden' : currentUser.role || 'student'
      );
    }
  };

  const loadStudentList = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/warden-api/students/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStudentList(result.payload || []);
      }
    } catch (error) {
      console.error('Error loading student list:', error);
    }
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      
      // Use the warden notify endpoint
      const response = await fetch(`${API_BASE_URL}/warden-api/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId: currentUser._id || currentUser.Id,
          senderName: `${currentUser.firstName} ${currentUser.lastName}`,
          senderRole: currentUser.role,
          recipientId: composeData.recipientId,
          recipientEmail: composeData.recipientEmail,
          title: composeData.title,
          message: composeData.message,
          type: composeData.type,
          priority: composeData.priority,
          relatedComplaintId: null
        })
      });

      const result = await response.json();

      if (response.ok) {
        setShowComposeModal(false);
        setComposeData({
          recipientId: '',
          recipientEmail: '',
          title: '',
          message: '',
          type: 'general',
          priority: 'normal'
        });
        alert('Notification sent successfully!');
        refreshNotifications();
      } else {
        setError(result.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      await deleteNotification(notificationId);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedNotifications.length === 0) {
      alert('Please select notifications first');
      return;
    }

    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications?`)) {
      return;
    }

    try {
      const promises = selectedNotifications.map(id => {
        if (action === 'read') {
          return markNotificationAsRead(id);
        } else if (action === 'delete') {
          return deleteNotification(id);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      setSelectedNotifications([]);
      refreshNotifications();
    } catch (error) {
      console.error(`Error with bulk ${action}:`, error);
      setError(`Failed to ${action} notifications`);
    }
  };

  const toggleNotificationSelection = (notificationId) => {
    const idStr = String(notificationId);
    setSelectedNotifications(prev =>
      prev.some(id => String(id) === idStr)
        ? prev.filter(id => String(id) !== idStr)
        : [...prev, idStr]
    );
  };

  const selectAllNotifications = () => {
    const filteredNotifications = getFilteredNotifications();
    const ids = filteredNotifications.map(n => String(n._id));
    const allSelected =
      ids.length > 0 && ids.every(id => selectedNotifications.some(s => String(s) === id));
    if (allSelected) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(ids);
    }
  };

  const getFilteredNotifications = () => {
    if (!notifications || !Array.isArray(notifications)) {
      return [];
    }
    
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'read':
        return notifications.filter(n => n.isRead);
      default:
        return notifications;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-danger';
      case 'normal': return 'text-primary';
      case 'low': return 'text-secondary';
      default: return 'text-primary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'complaint_update': return 'fa-clipboard-check';
      case 'urgent': return 'fa-exclamation-triangle';
      case 'system': return 'fa-cog';
      default: return 'fa-bell';
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
    if (isStudent()) {
      navigate(`/student-profile/${studentId}`);
    } else if (isWarden()) {
      navigate(`/warden-profile/${wardenId}`);
    } else {
      navigate('/signup');
    }
  };

  if (!currentUser) {
    return (
      <div className="container">
        <div className="row justify-content-center mt-5">
          <div className="col-md-6">
            <div className="alert alert-warning text-center">
              <h4>Access Denied</h4>
              <p>Please log in to view notifications.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredNotifications = getFilteredNotifications();
  const notificationsList = notifications || [];
  const unreadCount = notificationsList.filter(n => !n.isRead).length;
  const readCount = notificationsList.filter(n => n.isRead).length;

  const filteredIds = filteredNotifications.map(n => String(n._id));
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every(id => selectedNotifications.some(s => String(s) === id));

  return (
    <div className="container-fluid px-2 px-sm-3 px-lg-4 pb-4">
      <div className="row g-0">
        <div className="col-12">
          <nav className="navbar navbar-dark bg-info shadow-sm px-3 py-2">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 w-100">
              <span className="navbar-brand mb-0 fs-5 text-white">
                <i className="fas fa-bell me-2" aria-hidden="true"></i>
                Notifications
              </span>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/" className="btn btn-outline-light btn-sm">
                  <i className="fas fa-home me-1" aria-hidden="true"></i>
                  Home
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm text-nowrap"
                  onClick={goBack}
                >
                  <i className="fas fa-arrow-left me-1" aria-hidden="true"></i>
                  <span className="d-none d-sm-inline">Dashboard</span>
                  <span className="d-sm-none">Back</span>
                </button>
                <Link to="/signout" className="btn btn-outline-light btn-sm">
                  <i className="fas fa-sign-out-alt me-1" aria-hidden="true"></i>
                  Sign Out
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div className="row mt-3 g-3">
        <div className="col-12">
          <div className="bg-light p-3 p-md-4 rounded shadow-sm">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
              <div className="min-w-0">
                <h4 className="text-info mb-2 fs-5">
                  <i className="fas fa-inbox me-2" aria-hidden="true"></i>
                  Notification Center
                </h4>
                <p className="text-muted mb-0 small">
                  <span className="d-inline-block me-2">Total: {notificationsList.length}</span>
                  <span className="d-inline-block me-2">Unread: {unreadCount}</span>
                  <span className="d-inline-block">Read: {readCount}</span>
                </p>
              </div>

              {isWarden() && (
                <button
                  type="button"
                  className="btn btn-success text-nowrap align-self-stretch align-self-md-center"
                  onClick={() => setShowComposeModal(true)}
                >
                  <i className="fas fa-plus me-1" aria-hidden="true"></i>
                  Send Notification
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="row mt-3">
          <div className="col-12">
            <div className="container">
              <div className="alert alert-danger alert-dismissible fade show">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row mt-3 mt-md-4">
        <div className="col-12 px-0 px-sm-2">
          <div className="card shadow-sm">
              <div className="card-header bg-light py-3">
                <div className="d-flex flex-column gap-3">
                  <div
                    className="d-flex flex-wrap gap-2"
                    role="group"
                    aria-label="Filter notifications"
                  >
                    <button
                      type="button"
                      className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('all')}
                    >
                      All ({notificationsList.length})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${filter === 'unread' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => setFilter('unread')}
                    >
                      Unread ({unreadCount})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${filter === 'read' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setFilter('read')}
                    >
                      Read ({readCount})
                    </button>
                  </div>

                  <div className="d-flex flex-wrap gap-2 align-items-center justify-content-lg-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={selectAllNotifications}
                      disabled={filteredNotifications.length === 0}
                    >
                      <i className="fas fa-check-square me-1" aria-hidden="true"></i>
                      {allFilteredSelected ? 'Deselect All' : 'Select All'}
                    </button>

                    {selectedNotifications.length > 0 && (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleBulkAction('read')}
                        >
                          <i className="fas fa-check me-1" aria-hidden="true"></i>
                          Mark Read ({selectedNotifications.length})
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleBulkAction('delete')}
                        >
                          <i className="fas fa-trash me-1" aria-hidden="true"></i>
                          Delete ({selectedNotifications.length})
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary ms-lg-auto"
                      onClick={refreshNotifications}
                      disabled={loading}
                    >
                      <i className="fas fa-sync-alt me-1" aria-hidden="true"></i>
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card-body p-0">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-inbox fa-4x text-muted mb-3"></i>
                    <h5 className="text-muted">No Notifications</h5>
                    <p className="text-muted">
                      {filter === 'all' ? "You don't have any notifications yet." : 
                       filter === 'unread' ? "All notifications have been read." : 
                       "No read notifications found."}
                    </p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {filteredNotifications.map((notification, index) => (
                      <div
                        key={notification._id || index}
                        className={`list-group-item list-group-item-action px-2 px-md-3 py-3 ${!notification.isRead ? 'bg-light border-start border-warning border-4' : ''}`}
                      >
                        <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-start gap-2 gap-md-3">
                          <div className="d-flex align-items-start flex-grow-1 min-w-0">
                            <div className="form-check me-2 flex-shrink-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={selectedNotifications.some(
                                  id => String(id) === String(notification._id)
                                )}
                                onChange={() => toggleNotificationSelection(notification._id)}
                                aria-label={`Select notification ${notification.title || index + 1}`}
                              />
                            </div>

                            <div className="me-2 flex-shrink-0 d-none d-sm-block">
                              <i
                                className={`fas ${getTypeIcon(notification.type)} fa-lg ${getPriorityColor(notification.priority)}`}
                                aria-hidden="true"
                              ></i>
                            </div>

                            <div className="flex-grow-1 min-w-0">
                              <h6 className={`mb-1 text-break ${!notification.isRead ? 'fw-bold' : ''}`}>
                                <span className="d-sm-none me-2" aria-hidden="true">
                                  <i
                                    className={`fas ${getTypeIcon(notification.type)} ${getPriorityColor(notification.priority)}`}
                                  ></i>
                                </span>
                                {notification.title || 'Notification'}
                                {!notification.isRead && (
                                  <span className="badge bg-warning text-dark ms-2">New</span>
                                )}
                                {notification.priority === 'high' && (
                                  <span className="badge bg-danger ms-2">High</span>
                                )}
                              </h6>
                              <p className="mb-2 text-muted text-break small">
                                {notification.message || ''}
                              </p>
                              <small className="text-muted d-block text-break">
                                <i className="fas fa-user me-1" aria-hidden="true"></i>
                                From: {notification.senderName || 'Unknown'} (
                                {notification.senderRole || '—'})
                                <span className="d-none d-sm-inline"> · </span>
                                <span className="d-sm-none"><br /></span>
                                <i className="fas fa-clock me-1" aria-hidden="true"></i>
                                {formatDate(notification.createdAt)}
                              </small>
                            </div>
                          </div>

                          <div
                            className="d-flex flex-row flex-md-column gap-1 align-self-stretch justify-content-end flex-shrink-0"
                            role="group"
                            aria-label="Notification actions"
                          >
                            {!notification.isRead && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleMarkAsRead(notification._id)}
                                title="Mark as read"
                              >
                                <i className="fas fa-check" aria-hidden="true"></i>
                                <span className="d-md-none ms-1">Read</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteNotification(notification._id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash" aria-hidden="true"></i>
                              <span className="d-md-none ms-1">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      {showComposeModal && isWarden() && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-compose-title"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title" id="notification-compose-title">
                  <i className="fas fa-paper-plane me-2" aria-hidden="true"></i>
                  Send Notification
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowComposeModal(false)}
                ></button>
              </div>
              <form onSubmit={sendNotification}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Recipient Student *</label>
                        <select
                          className="form-select"
                          value={composeData.recipientId}
                          onChange={(e) => {
                            const selectedStudent = studentList.find(
                              s => String(s._id) === e.target.value
                            );
                            setComposeData({
                              ...composeData,
                              recipientId: e.target.value,
                              recipientEmail: selectedStudent?.email || ''
                            });
                          }}
                          required
                        >
                          <option value="">Select Student</option>
                          {studentList.map(student => (
                            <option key={student._id} value={student._id}>
                              {student.firstName} {student.lastName} - {student.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Priority</label>
                        <select
                          className="form-select"
                          value={composeData.priority}
                          onChange={(e) => setComposeData({...composeData, priority: e.target.value})}
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Type</label>
                        <select
                          className="form-select"
                          value={composeData.type}
                          onChange={(e) => setComposeData({...composeData, type: e.target.value})}
                        >
                          <option value="general">General</option>
                          <option value="complaint_update">Complaint Update</option>
                          <option value="urgent">Urgent</option>
                          <option value="system">System</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={composeData.title}
                      onChange={(e) => setComposeData({...composeData, title: e.target.value})}
                      placeholder="Enter notification title"
                      maxLength="100"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Message *</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      value={composeData.message}
                      onChange={(e) => setComposeData({...composeData, message: e.target.value})}
                      placeholder="Enter your message"
                      maxLength="500"
                      required
                    ></textarea>
                    <div className="form-text">
                      {composeData.message.length}/500 characters
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer flex-wrap gap-2 justify-content-end">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowComposeModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? (
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
  );
}

export default NotificationSystem;
