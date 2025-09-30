import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, useParams } from 'react-router-dom';

function NotificationSystem() {
  const { currentUser, isWarden, isStudent, notifications, markNotificationAsRead, deleteNotification, loadNotifications } = useUser();
  const navigate = useNavigate();
  const { studentId, wardenId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showComposeModal, setShowComposeModal] = useState(false);
  
  // Compose notification state (for wardens)
  const [composeData, setComposeData] = useState({
    recipientId: '',
    recipientEmail: '',
    title: '',
    message: '',
    type: 'general', // 'general', 'complaint_update', 'urgent'
    priority: 'normal' // 'low', 'normal', 'high'
  });
  
  // Student list for wardens
  const [studentList, setStudentList] = useState([]);

  useEffect(() => {
    // Check access permissions
    if (!currentUser) {
      navigate('/signup');
      return;
    }

    if (isStudent() && currentUser.Id !== studentId) {
      navigate('/signup');
      return;
    }

    if (isWarden() && currentUser.Id !== wardenId) {
      navigate('/signup');
      return;
    }

    // Load notifications
    refreshNotifications();
    
    // Load student list if user is warden
    if (isWarden()) {
      loadStudentList();
    }

    // Set up real-time notification polling
    const interval = setInterval(refreshNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [currentUser, studentId, wardenId]);

  const refreshNotifications = async () => {
    if (currentUser) {
      await loadNotifications(currentUser.Id);
    }
  };

  const loadStudentList = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:4700/warden-api/students/list', {
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
      const response = await fetch('http://localhost:4700/api/notifications/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId: currentUser.Id,
          senderName: `${currentUser.firstName} ${currentUser.lastName}`,
          senderRole: currentUser.role,
          recipientId: composeData.recipientId,
          recipientEmail: composeData.recipientEmail,
          title: composeData.title,
          message: composeData.message,
          type: composeData.type,
          priority: composeData.priority
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
      const token = localStorage.getItem('authToken');
      const promises = selectedNotifications.map(id => {
        if (action === 'read') {
          return markNotificationAsRead(id);
        } else if (action === 'delete') {
          return deleteNotification(id);
        }
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
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllNotifications = () => {
    const filteredNotifications = getFilteredNotifications();
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  const getFilteredNotifications = () => {
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

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <nav className="navbar navbar-expand-lg navbar-dark bg-info shadow-sm">
            <div className="container">
              <span className="navbar-brand mb-0 h1">
                <i className="fas fa-bell me-2"></i>
                Notifications
              </span>
              <div className="navbar-nav ms-auto">
                <button className="btn btn-outline-light" onClick={goBack}>
                  <i className="fas fa-arrow-left me-1"></i>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="bg-light p-3 rounded shadow-sm">
            <div className="container">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="text-info mb-1">
                    <i className="fas fa-inbox me-2"></i>
                    Notification Center
                  </h4>
                  <p className="text-muted mb-0">
                    Total: {notifications.length} | 
                    Unread: {notifications.filter(n => !n.isRead).length} | 
                    Read: {notifications.filter(n => n.isRead).length}
                  </p>
                </div>
                
                {/* Warden Compose Button */}
                {isWarden() && (
                  <button 
                    className="btn btn-success"
                    onClick={() => setShowComposeModal(true)}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Send Notification
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
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

      {/* Controls */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="container">
            <div className="card">
              <div className="card-header bg-light">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    {/* Filter Buttons */}
                    <div className="btn-group" role="group">
                      <button 
                        className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('all')}
                      >
                        All ({notifications.length})
                      </button>
                      <button 
                        className={`btn btn-sm ${filter === 'unread' ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => setFilter('unread')}
                      >
                        Unread ({notifications.filter(n => !n.isRead).length})
                      </button>
                      <button 
                        className={`btn btn-sm ${filter === 'read' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setFilter('read')}
                      >
                        Read ({notifications.filter(n => n.isRead).length})
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    {/* Bulk Actions */}
                    <div className="d-flex justify-content-end gap-2">
                      <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={selectAllNotifications}
                      >
                        <i className="fas fa-check-square me-1"></i>
                        {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
                      </button>
                      
                      {selectedNotifications.length > 0 && (
                        <>
                          <button 
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleBulkAction('read')}
                          >
                            <i className="fas fa-check me-1"></i>
                            Mark Read ({selectedNotifications.length})
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleBulkAction('delete')}
                          >
                            <i className="fas fa-trash me-1"></i>
                            Delete ({selectedNotifications.length})
                          </button>
                        </>
                      )}
                      
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={refreshNotifications}
                        disabled={loading}
                      >
                        <i className="fas fa-sync-alt me-1"></i>
                        Refresh
                      </button>
                    </div>
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
                        className={`list-group-item ${!notification.isRead ? 'bg-light border-start border-warning border-4' : ''}`}
                      >
                        <div className="d-flex align-items-start">
                          {/* Selection Checkbox */}
                          <div className="form-check me-3">
                            <input 
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedNotifications.includes(notification._id)}
                              onChange={() => toggleNotificationSelection(notification._id)}
                            />
                          </div>
                          
                          {/* Notification Icon */}
                          <div className="me-3">
                            <i className={`fas ${getTypeIcon(notification.type)} fa-lg ${getPriorityColor(notification.priority)}`}></i>
                          </div>
                          
                          {/* Notification Content */}
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className={`mb-1 ${!notification.isRead ? 'fw-bold' : ''}`}>
                                  {notification.title || 'Notification'}
                                  {!notification.isRead && (
                                    <span className="badge bg-warning text-dark ms-2">New</span>
                                  )}
                                  {notification.priority === 'high' && (
                                    <span className="badge bg-danger ms-2">High Priority</span>
                                  )}
                                </h6>
                                <p className="mb-1 text-muted">{notification.message}</p>
                                <small className="text-muted">
                                  <i className="fas fa-user me-1"></i>
                                  From: {notification.senderName} ({notification.senderRole}) |
                                  <i className="fas fa-clock ms-2 me-1"></i>
                                  {formatDate(notification.createdAt)}
                                </small>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="btn-group-vertical" role="group">
                                {!notification.isRead && (
                                  <button 
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleMarkAsRead(notification._id)}
                                    title="Mark as read"
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                )}
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteNotification(notification._id)}
                                  title="Delete"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
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
      </div>

      {/* Compose Modal for Wardens */}
      {showComposeModal && isWarden() && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="fas fa-paper-plane me-2"></i>
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
                            const selectedStudent = studentList.find(s => s._id === e.target.value);
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
                
                <div className="modal-footer">
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