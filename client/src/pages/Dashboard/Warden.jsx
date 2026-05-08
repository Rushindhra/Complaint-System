import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext.jsx';
import { API_BASE_URL } from '../../config/api';

// Chart.js imports for dynamic charts
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Warden() {
  const { wardenId } = useParams();
  const navigate = useNavigate();
  const { currentUser, logout } = useUser();
  
  // Chart refs
  const categoryChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const [categoryChart, setCategoryChart] = useState(null);
  const [statusChart, setStatusChart] = useState(null);
  
  // State management
  const [wardenData, setWardenData] = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  
  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    employeeId: '',
    department: '',
    experience: '',
    hostelBlock: ''
  });

  // Statistics state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    verified: 0,
    rejected: 0
  });

  // ========== BACKEND API ENDPOINTS - REPLACE WITH YOUR ACTUAL URLs ==========
  const API_ENDPOINTS = {
    // Replace these URLs with your actual backend endpoints
    WARDEN_PROFILE: `${API_BASE_URL}/warden-api/profile/${wardenId}`, // GET warden profile
    UPDATE_PROFILE: `${API_BASE_URL}/warden-api/editprofile/${wardenId}`, // PUT update profile
    DELETE_PROFILE: `${API_BASE_URL}/warden-api/deleteprofwardenudentId/${wardenId}`, // DELETE profile
    ALL_COMPLAINTS: `${API_BASE_URL}/warden-api/complaints/all`, // GET all complaints for warden
    RECENT_ACTIVITY: `${API_BASE_URL}/warden-api/complaints/recent`, // GET recent activities
    COMPLAINT_STATS: `${API_BASE_URL}/warden-api/statuses`, // GET complaint statistics
  };

  useEffect(() => {
    // Check if user is authenticated and is a warden
    if (!currentUser || currentUser.role !== 'warden' || currentUser.Id !== wardenId) {
      navigate('/signup');
      return;
    }
    
    // Initialize profile data
    setProfileData({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      phone: currentUser.phone || '',
      employeeId: currentUser.employeeId || '',
      department: currentUser.department || '',
      experience: currentUser.experience || '',
      hostelBlock: currentUser.hostelBlock || ''
    });
    
    // Fetch all data on component load
    fetchAllData();
  }, [currentUser, wardenId, navigate]);

  // Fetch all required data
  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    
    try {
      await Promise.all([
        fetchWardenProfile(),
        fetchAllComplaints(),
        fetchRecentActivity()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch warden profile data
  const fetchWardenProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.WARDEN_PROFILE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setWardenData(result.payload);
      } else {
        console.warn('Using fallback warden data');
        // Fallback data
        setWardenData({
          firstName: currentUser.firstName || 'Warden',
          lastName: currentUser.lastName || 'Admin',
          email: currentUser.email || 'warden@university.edu',
          employeeId: currentUser.employeeId || 'WRD001',
          phone: currentUser.phone || '+91 9876543210',
          department: currentUser.department || 'Student Affairs',
          experience: currentUser.experience || '5 years',
          hostelBlock: currentUser.hostelBlock || 'Block A',
          profileImage: currentUser.profileImage || null
        });
      }
    } catch (error) {
      console.error('Error fetching warden profile:', error);
      // Set fallback data on error
      setWardenData({
        firstName: currentUser.firstName || 'Warden',
        lastName: currentUser.lastName || 'Admin',
        email: currentUser.email || 'warden@university.edu',
        employeeId: currentUser.employeeId || 'WRD001',
        phone: currentUser.phone || '+91 9876543210',
        department: currentUser.department || 'Student Affairs',
        experience: currentUser.experience || '5 years',
        hostelBlock: currentUser.hostelBlock || 'Block A',
        profileImage: null
      });
    }
  };

  // Fetch all complaints for dashboard
  const fetchAllComplaints = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.ALL_COMPLAINTS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setAllComplaints(result.payload || []);
        calculateStatistics(result.payload || []);
        updateCharts(result.payload || []);
      } else {
        setError('Failed to fetch complaints data');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Network error while fetching complaints');
    }
  };

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.RECENT_ACTIVITY, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setRecentActivity(result.payload || []);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  // Calculate statistics from complaints data
  const calculateStatistics = (complaints) => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status?.toLowerCase() === 'pending' || !c.status).length;
    const inProgress = complaints.filter(c => c.status?.toLowerCase() === 'in progress').length;
    const completed = complaints.filter(c => c.status?.toLowerCase() === 'completed').length;
    const verified = complaints.filter(c => c.status?.toLowerCase() === 'verified').length;
    const rejected = complaints.filter(c => c.status?.toLowerCase() === 'rejected').length;

    setStats({
      total,
      pending,
      inProgress,
      completed,
      verified,
      rejected
    });
  };

  // Update charts with complaint data
  const updateCharts = (complaints) => {
    // Category chart data
    const categories = ['Plumbing', 'Electricity', 'Cleaning', 'Furniture', 'WiFi', 'Food', 'Security', 'Other'];
    const categoryCounts = categories.map(category => 
      complaints.filter(complaint => complaint.category?.toLowerCase() === category.toLowerCase()).length
    );

    const categoryData = {
      labels: categories,
      datasets: [{
        data: categoryCounts,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6B6B', '#C9CBCF'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    // Status chart data
    const statuses = ['Pending', 'In Progress', 'Completed', 'Verified', 'Rejected'];
    const statusCounts = statuses.map(status => 
      complaints.filter(complaint => complaint.status?.toLowerCase() === status.toLowerCase()).length
    );

    const statusData = {
      labels: statuses,
      datasets: [{
        data: statusCounts,
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    // Chart options
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 10,
            usePointStyle: true,
            font: { size: 12 },
            boxWidth: 12
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };

    // Update category chart
    if (categoryChartRef.current) {
      const ctx = categoryChartRef.current.getContext('2d');
      if (categoryChart) categoryChart.destroy();
      const newCategoryChart = new ChartJS(ctx, {
        type: 'doughnut',
        data: categoryData,
        options: chartOptions
      });
      setCategoryChart(newCategoryChart);
    }

    // Update status chart
    if (statusChartRef.current) {
      const ctx = statusChartRef.current.getContext('2d');
      if (statusChart) statusChart.destroy();
      const newStatusChart = new ChartJS(ctx, {
        type: 'doughnut',
        data: statusData,
        options: chartOptions
      });
      setStatusChart(newStatusChart);
    }
  };

  // Update warden profile
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
      const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
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
        await fetchWardenProfile(); // Refresh profile data
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

  // Delete warden profile
  const deleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      return;
    }

    setActionLoading('profile');
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.DELETE_PROFILE, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Profile deleted successfully!');
        localStorage.removeItem('authToken');
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

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/signup');
  };

  // Format date utility
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

  // Auto-hide message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      if (categoryChart) categoryChart.destroy();
      if (statusChart) statusChart.destroy();
    };
  }, [categoryChart, statusChart]);

  if (!currentUser || currentUser.role !== 'warden') {
    return (
      <div className="container">
        <div className="row justify-content-center mt-5">
          <div className="col-md-6">
            <div className="alert alert-warning text-center">
              <h4>Access Denied</h4>
              <p>Warden access required to view this page.</p>
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-auto">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading Warden Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header Section */}
      <div className="row">
        <div className="col-12">
          <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
            <div className="container">
              <span className="navbar-brand mb-0 h1">
                <i className="fas fa-user-tie me-2"></i>
                Warden Portal
              </span>
              
              <div className="navbar-nav ms-auto d-flex flex-row gap-2">
                <button
                  className={`btn ${activeTab === 'dashboard' ? 'btn-light' : 'btn-outline-light'} me-2`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <i className="fas fa-chart-pie me-1"></i>
                  Dashboard
                </button>
                
                <Link 
                  to={`/warden-profile/${wardenId}/verify-complaints`} 
                  className="btn btn-success me-2"
                >
                  <i className="fas fa-check-circle me-1"></i>
                  Verify Complaints
                </Link>
                
                <button
                  className={`btn ${activeTab === 'profile' ? 'btn-light' : 'btn-outline-light'} me-2`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="fas fa-user me-1"></i>
                  Profile
                </button>
                
                <button className="btn btn-outline-light" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Logout
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
              <h2 className="text-primary mb-1">
                Welcome, {wardenData?.firstName} {wardenData?.lastName}!
              </h2>
              <p className="text-muted mb-0">
                <i className="fas fa-id-badge me-1"></i>
                Employee ID: <strong>{wardenData?.employeeId}</strong> | 
                <i className="fas fa-envelope ms-2 me-1"></i>
                {wardenData?.email} | 
                <i className="fas fa-building ms-2 me-1"></i>
                Block: <strong>{wardenData?.hostelBlock}</strong> |
                <i className="fas fa-briefcase ms-2 me-1"></i>
                Department: <strong>{wardenData?.department}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="row mt-3">
          <div className="col-12">
            <div className="container">
              <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                <i className={`fas ${message.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                {message}
                <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Main Content */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="container">
            
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="text-dark">
                    <i className="fas fa-chart-line me-2"></i>
                    Dashboard Overview
                  </h3>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={fetchAllData}
                    disabled={loading}
                  >
                    <i className="fas fa-sync-alt me-1"></i>
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {/* Statistics Cards */}
                <div className="row mb-4">
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card text-white bg-primary h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-clipboard-list fa-2x me-3"></i>
                          <div>
                            <div className="fs-4 fw-bold">{stats.total}</div>
                            <div className="small">Total Complaints</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card text-white bg-warning h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-clock fa-2x me-3"></i>
                          <div>
                            <div className="fs-4 fw-bold">{stats.pending}</div>
                            <div className="small">Pending</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card text-white bg-info h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-spinner fa-2x me-3"></i>
                          <div>
                            <div className="fs-4 fw-bold">{stats.inProgress}</div>
                            <div className="small">In Progress</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card text-white bg-success h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-check fa-2x me-3"></i>
                          <div>
                            <div className="fs-4 fw-bold">{stats.completed}</div>
                            <div className="small">Completed</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card text-white bg-primary h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-check-circle fa-2x me-3"></i>
                          <div>
                            <div className="fs-4 fw-bold">{stats.verified}</div>
                            <div className="small">Verified</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card text-white bg-danger h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-times-circle fa-2x me-3"></i>
                          <div>
                            <div className="fs-4 fw-bold">{stats.rejected}</div>
                            <div className="small">Rejected</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="row mb-4">
                  <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm h-100">
                      <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">
                          <i className="fas fa-chart-pie me-2"></i>
                          Complaints by Category
                        </h5>
                      </div>
                      <div className="card-body">
                        <div style={{ position: 'relative', height: '300px' }}>
                          <canvas ref={categoryChartRef}></canvas>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm h-100">
                      <div className="card-header bg-success text-white">
                        <h5 className="mb-0">
                          <i className="fas fa-chart-doughnut me-2"></i>
                          Complaints by Status
                        </h5>
                      </div>
                      <div className="card-body">
                        <div style={{ position: 'relative', height: '300px' }}>
                          <canvas ref={statusChartRef}></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="card shadow-sm">
                  <div className="card-header bg-info text-white">
                    <h5 className="mb-0">
                      <i className="fas fa-history me-2"></i>
                      Recent Activity
                    </h5>
                  </div>
                  <div className="card-body">
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <i className="fas fa-inbox fa-3x mb-3"></i>
                        <p>No recent activity to display</p>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {recentActivity.slice(0, 10).map((activity, index) => (
                          <div key={index} className="list-group-item d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">
                              <div className="fw-bold">{activity.title || 'Complaint Update'}</div>
                              <small className="text-muted">
                                {activity.studentEmail && (
                                  <>
                                    <i className="fas fa-user me-1"></i>
                                    {activity.studentEmail} |
                                  </>
                                )}
                                <i className="fas fa-tag ms-1 me-1"></i>
                                {activity.category || 'N/A'} |
                                <i className="fas fa-calendar ms-1 me-1"></i>
                                {formatDate(activity.createdAt || activity.updatedAt)}
                              </small>
                            </div>
                            <span className={`badge ${
                              activity.status?.toLowerCase() === 'completed' ? 'bg-success' :
                              activity.status?.toLowerCase() === 'verified' ? 'bg-primary' :
                              activity.status?.toLowerCase() === 'in progress' ? 'bg-warning' :
                              activity.status?.toLowerCase() === 'rejected' ? 'bg-danger' :
                              'bg-secondary'
                            }`}>
                              {activity.status || 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-dark mb-4">
                  <i className="fas fa-user me-2"></i>
                  Warden Profile
                </h3>
                <div className="row">
                  <div className="col-md-8">
                    <div className="card shadow-sm">
                      <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">
                          <i className="fas fa-id-card me-2"></i>
                          Personal Information
                        </h5>
                      </div>
                      <div className="card-body">
                        {!isEditingProfile ? (
                          <>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Full Name:</strong></div>
                              <div className="col-sm-8">{wardenData?.firstName} {wardenData?.lastName}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Employee ID:</strong></div>
                              <div className="col-sm-8">{wardenData?.employeeId}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Email:</strong></div>
                              <div className="col-sm-8">{wardenData?.email}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Phone:</strong></div>
                              <div className="col-sm-8">{wardenData?.phone || 'Not provided'}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Department:</strong></div>
                              <div className="col-sm-8">{wardenData?.department || 'Not specified'}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Experience:</strong></div>
                              <div className="col-sm-8">{wardenData?.experience || 'Not specified'}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Hostel Block:</strong></div>
                              <div className="col-sm-8">{wardenData?.hostelBlock || 'Not assigned'}</div>
                            </div>
                            
                            <div className="mt-4">
                              <button 
                                className="btn btn-primary me-2"
                                onClick={() => setIsEditingProfile(true)}
                              >
                                <i className="fas fa-edit me-1"></i>
                                Edit Profile
                              </button>
                              
                              <button 
                                className="btn btn-danger"
                                onClick={deleteProfile}
                                disabled={actionLoading === 'profile'}
                              >
                                {actionLoading === 'profile' ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-trash me-1"></i>
                                    Delete Profile
                                  </>
                                )}
                              </button>
                            </div>
                          </>
                        ) : (
                          <form onSubmit={updateProfile}>
                            <div className="row mb-3">
                              <div className="col-md-6">
                                <label htmlFor="firstName" className="form-label">First Name *</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="firstName"
                                  value={profileData.firstName}
                                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                  required
                                />
                              </div>
                              <div className="col-md-6">
                                <label htmlFor="lastName" className="form-label">Last Name *</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="lastName"
                                  value={profileData.lastName}
                                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                  required
                                />
                              </div>
                            </div>

                            <div className="row mb-3">
                              <div className="col-md-6">
                                <label htmlFor="employeeId" className="form-label">Employee ID</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="employeeId"
                                  value={profileData.employeeId}
                                  onChange={(e) => setProfileData({...profileData, employeeId: e.target.value})}
                                />
                              </div>
                              <div className="col-md-6">
                                <label htmlFor="phone" className="form-label">Phone Number</label>
                                <input
                                  type="tel"
                                  className="form-control"
                                  id="phone"
                                  value={profileData.phone}
                                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                />
                              </div>
                            </div>

                            <div className="row mb-3">
                              <div className="col-md-6">
                                <label htmlFor="department" className="form-label">Department</label>
                                <select
                                  className="form-select"
                                  id="department"
                                  value={profileData.department}
                                  onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                                >
                                  <option value="">Select Department</option>
                                  <option value="Student Affairs">Student Affairs</option>
                                  <option value="Administration">Administration</option>
                                  <option value="Security">Security</option>
                                  <option value="Maintenance">Maintenance</option>
                                  <option value="IT Services">IT Services</option>
                                  <option value="Food Services">Food Services</option>
                                </select>
                              </div>
                              <div className="col-md-6">
                                <label htmlFor="experience" className="form-label">Experience</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="experience"
                                  placeholder="e.g., 5 years"
                                  value={profileData.experience}
                                  onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                                />
                              </div>
                            </div>

                            <div className="mb-3">
                              <label htmlFor="hostelBlock" className="form-label">Hostel Block</label>
                              <select
                                className="form-select"
                                id="hostelBlock"
                                value={profileData.hostelBlock}
                                onChange={(e) => setProfileData({...profileData, hostelBlock: e.target.value})}
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
                            </div>

                            <div className="mt-4">
                              <button 
                                type="submit" 
                                className="btn btn-success me-2"
                                disabled={actionLoading === 'profile'}
                              >
                                {actionLoading === 'profile' ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-save me-1"></i>
                                    Save Changes
                                  </>
                                )}
                              </button>
                              
                              <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={() => {
                                  setIsEditingProfile(false);
                                  setMessage('');
                                }}
                              >
                                <i className="fas fa-times me-1"></i>
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card shadow-sm">
                      <div className="card-header bg-info text-white">
                        <h5 className="mb-0">
                          <i className="fas fa-chart-bar me-2"></i>
                          Quick Stats
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Total Complaints:</span>
                          <span className="badge bg-primary fs-6">{stats.total}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Pending:</span>
                          <span className="badge bg-warning fs-6">{stats.pending}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>In Progress:</span>
                          <span className="badge bg-info fs-6">{stats.inProgress}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Completed:</span>
                          <span className="badge bg-success fs-6">{stats.completed}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Verified:</span>
                          <span className="badge bg-primary fs-6">{stats.verified}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Rejected:</span>
                          <span className="badge bg-danger fs-6">{stats.rejected}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card shadow-sm mt-4">
                      <div className="card-header bg-secondary text-white">
                        <h5 className="mb-0">
                          <i className="fas fa-info-circle me-2"></i>
                          Profile Tips
                        </h5>
                      </div>
                      <div className="card-body">
                        <ul className="list-unstyled mb-0">
                          <li className="mb-2">
                            <i className="fas fa-check text-success me-2"></i>
                            Keep your contact information updated
                          </li>
                          <li className="mb-2">
                            <i className="fas fa-check text-success me-2"></i>
                            Specify your hostel block for better complaint routing
                          </li>
                          <li className="mb-2">
                            <i className="fas fa-check text-success me-2"></i>
                            Review complaints regularly
                          </li>
                          <li>
                            <i className="fas fa-check text-success me-2"></i>
                            Update your experience and department
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="bg-light p-3 text-center">
            <p className="text-muted mb-0">
              <i className="fas fa-university me-2"></i>
              University Complaint Management System - Warden Portal
              <span className="ms-3">
                <i className="fas fa-phone me-1"></i>
                Support: +91 9876543210
              </span>
              <span className="ms-3">
                <i className="fas fa-envelope me-1"></i>
                help@university.edu
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Warden;
