// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import { useUser } from '../contexts/UserContext';

// function StudentProfile() {
//   const { studentId } = useParams();
//   const navigate = useNavigate();
//   const { currentUser, logout } = useUser();
//   const [complaints, setComplaints] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' or 'profile'

//   useEffect(() => {
//     // Check if user is authenticated and matches the profile being viewed
//     if (!currentUser || currentUser.Id !== studentId) {
//       navigate('/signup');
//       return;
//     }
    
//     // Fetch complaints automatically on component load
//     fetchAllComplaints();
//   }, [currentUser, studentId, navigate]);

//   const fetchAllComplaints = async () => {
//     if (!currentUser) return;
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const token = localStorage.getItem('authToken');
//       const response = await fetch(`http://localhost:4700/student-api/complaints/${currentUser.Id}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const result = await response.json();

//       if (response.ok) {
//         setComplaints(result.payload || []);
//       } else {
//         setError(result.message || 'Failed to fetch complaints');
//       }
//     } catch (error) {
//       console.error('Error fetching complaints:', error);
//       setError('Network error. Please check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/signup');
//   };

//   const getStatusBadgeClass = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return 'badge bg-success';
//       case 'in progress':
//         return 'badge bg-warning text-dark';
//       case 'verified':
//         return 'badge bg-info';
//       case 'rejected':
//         return 'badge bg-danger';
//       default:
//         return 'badge bg-secondary';
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (!currentUser) {
//     return (
//       <div className="container">
//         <div className="row justify-content-center mt-5">
//           <div className="col-md-6">
//             <div className="alert alert-warning text-center">
//               <h4>Access Denied</h4>
//               <p>Please log in to view your profile.</p>
//               <button 
//                 className="btn btn-primary"
//                 onClick={() => navigate('/signup')}
//               >
//                 Go to Login
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container-fluid">
//       {/* Header Section */}
//       <div className="row">
//         <div className="col-12">
//           <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
//             <div className="container">
//               <span className="navbar-brand mb-0 h1">
//                 <i className="fas fa-user-graduate me-2"></i>
//                 Student Portal
//               </span>
              
//               {/* Navigation Buttons */}
//               <div className="navbar-nav ms-auto d-flex flex-row gap-2">
//                 <button
//                   className={`btn ${activeTab === 'complaints' ? 'btn-light' : 'btn-outline-light'} me-2`}
//                   onClick={() => {
//                     setActiveTab('complaints');
//                     fetchAllComplaints();
//                   }}
//                 >
//                   <i className="fas fa-list me-1"></i>
//                   View All Complaints
//                 </button>
                
//                 <Link 
//                   to={`/student-profile/${studentId}/complaint-form`} 
//                   className="btn btn-success me-2"
//                 >
//                   <i className="fas fa-plus me-1"></i>
//                   Post Complaint
//                 </Link>
                
//                 <button
//                   className={`btn ${activeTab === 'profile' ? 'btn-light' : 'btn-outline-light'} me-2`}
//                   onClick={() => setActiveTab('profile')}
//                 >
//                   <i className="fas fa-user me-1"></i>
//                   Profile
//                 </button>
                
//                 <button 
//                   className="btn btn-outline-light"
//                   onClick={handleLogout}
//                 >
//                   <i className="fas fa-sign-out-alt me-1"></i>
//                   Logout
//                 </button>
//               </div>
//             </div>
//           </nav>
//         </div>
//       </div>

//       {/* Welcome Section */}
//       <div className="row mt-3">
//         <div className="col-12">
//           <div className="bg-light p-3 rounded shadow-sm">
//             <div className="container">
//               <h2 className="text-primary mb-1">
//                 Welcome, {currentUser.firstName} {currentUser.lastName}!
//               </h2>
//               <p className="text-muted mb-0">
//                 <i className="fas fa-id-card me-1"></i>
//                 Roll No: <strong>{currentUser.Id}</strong> | 
//                 <i className="fas fa-envelope ms-2 me-1"></i>
//                 {currentUser.email} | 
//                 <i className="fas fa-bed ms-2 me-1"></i>
//                 Room: <strong>{currentUser.roomNumber || 'Not assigned'}</strong> | 
//                 <i className="fas fa-building ms-2 me-1"></i>
//                 Block: <strong>{currentUser.block || 'Not assigned'}</strong>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="row mt-4">
//         <div className="col-12">
//           <div className="container">
            
//             {/* Complaints Tab */}
//             {activeTab === 'complaints' && (
//               <div>
//                 <div className="d-flex justify-content-between align-items-center mb-4">
//                   <h3 className="text-dark">
//                     <i className="fas fa-clipboard-list me-2"></i>
//                     My Complaints
//                   </h3>
//                   <div className="d-flex gap-2">
//                     <button 
//                       className="btn btn-outline-primary btn-sm"
//                       onClick={fetchAllComplaints}
//                       disabled={loading}
//                     >
//                       <i className="fas fa-sync-alt me-1"></i>
//                       {loading ? 'Refreshing...' : 'Refresh'}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Error Message */}
//                 {error && (
//                   <div className="alert alert-danger" role="alert">
//                     <i className="fas fa-exclamation-triangle me-2"></i>
//                     {error}
//                   </div>
//                 )}

//                 {/* Loading State */}
//                 {loading && (
//                   <div className="text-center py-5">
//                     <div className="spinner-border text-primary" role="status">
//                       <span className="visually-hidden">Loading...</span>
//                     </div>
//                     <p className="mt-2 text-muted">Loading your complaints...</p>
//                   </div>
//                 )}

//                 {/* Complaints List */}
//                 {!loading && !error && (
//                   <div>
//                     {complaints.length === 0 ? (
//                       <div className="text-center py-5">
//                         <div className="card border-0 bg-light">
//                           <div className="card-body">
//                             <i className="fas fa-clipboard fa-3x text-muted mb-3"></i>
//                             <h5 className="text-muted">No Complaints Found</h5>
//                             <p className="text-muted">You haven't filed any complaints yet.</p>
//                             <Link to="/complaint-form" className="btn btn-primary">
//                               <i className="fas fa-plus me-1"></i>
//                               File Your First Complaint
//                             </Link>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="row">
//                         {complaints.map((complaint, index) => (
//                           <div key={complaint._id || index} className="col-lg-6 col-md-6 col-sm-12 mb-4">
//                             <div className="card h-100 shadow-sm border-start border-4 border-primary">
//                               <div className="card-header bg-white d-flex justify-content-between align-items-center">
//                                 <h6 className="mb-0 text-primary fw-bold">
//                                   {complaint.title || 'No Title'}
//                                 </h6>
//                                 <span className={getStatusBadgeClass(complaint.status)}>
//                                   {complaint.status || 'Not Started'}
//                                 </span>
//                               </div>
//                               <div className="card-body">
//                                 <p className="card-text text-muted">
//                                   <strong>Description:</strong> {complaint.description || 'No description available'}
//                                 </p>
//                                 <div className="row">
//                                   <div className="col-6">
//                                     <small className="text-muted">
//                                       <i className="fas fa-tag me-1"></i>
//                                       <strong>Category:</strong> {complaint.category || 'N/A'}
//                                     </small>
//                                   </div>
//                                   <div className="col-6">
//                                     <small className="text-muted">
//                                       <i className="fas fa-door-open me-1"></i>
//                                       <strong>Room:</strong> {complaint.roomno || 'N/A'}
//                                     </small>
//                                   </div>
//                                 </div>
//                                 <div className="row mt-2">
//                                   <div className="col-6">
//                                     <small className="text-muted">
//                                       <i className="fas fa-building me-1"></i>
//                                       <strong>Block:</strong> {complaint.block || 'N/A'}
//                                     </small>
//                                   </div>
//                                   <div className="col-6">
//                                     <small className="text-muted">
//                                       <i className="fas fa-calendar me-1"></i>
//                                       <strong>Created:</strong> {formatDate(complaint.createdAt)}
//                                     </small>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="card-footer bg-white border-top-0">
//                                 <small className="text-muted">
//                                   <i className="fas fa-clock me-1"></i>
//                                   Last Updated: {formatDate(complaint.updatedAt) || 'Never'}
//                                 </small>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Profile Tab */}
//             {activeTab === 'profile' && (
//               <div>
//                 <h3 className="text-dark mb-4">
//                   <i className="fas fa-user me-2"></i>
//                   Profile Information
//                 </h3>
//                 <div className="row">
//                   <div className="col-md-8">
//                     <div className="card shadow-sm">
//                       <div className="card-header bg-primary text-white">
//                         <h5 className="mb-0">
//                           <i className="fas fa-user-circle me-2"></i>
//                           Personal Details
//                         </h5>
//                       </div>
//                       <div className="card-body">
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Full Name:</strong></div>
//                           <div className="col-sm-8">{currentUser.firstName} {currentUser.lastName}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Roll Number:</strong></div>
//                           <div className="col-sm-8">{currentUser.Id}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Email:</strong></div>
//                           <div className="col-sm-8">{currentUser.email}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Phone:</strong></div>
//                           <div className="col-sm-8">{currentUser.phone || 'Not provided'}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Room Number:</strong></div>
//                           <div className="col-sm-8">{currentUser.roomNumber || 'Not assigned'}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Block:</strong></div>
//                           <div className="col-sm-8">{currentUser.block || 'Not assigned'}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Role:</strong></div>
//                           <div className="col-sm-8">
//                             <span className="badge bg-info">{currentUser.role || 'Student'}</span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="card-footer">
//                         <button className="btn btn-outline-primary">
//                           <i className="fas fa-edit me-1"></i>
//                           Edit Profile
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-md-4">
//                     <div className="card shadow-sm">
//                       <div className="card-header bg-info text-white">
//                         <h6 className="mb-0">
//                           <i className="fas fa-chart-pie me-2"></i>
//                           Quick Stats
//                         </h6>
//                       </div>
//                       <div className="card-body">
//                         <div className="d-flex justify-content-between align-items-center mb-2">
//                           <span>Total Complaints:</span>
//                           <span className="badge bg-primary">{complaints.length}</span>
//                         </div>
//                         <div className="d-flex justify-content-between align-items-center mb-2">
//                           <span>Completed:</span>
//                           <span className="badge bg-success">
//                             {complaints.filter(c => c.status?.toLowerCase() === 'completed').length}
//                           </span>
//                         </div>
//                         <div className="d-flex justify-content-between align-items-center mb-2">
//                           <span>In Progress:</span>
//                           <span className="badge bg-warning text-dark">
//                             {complaints.filter(c => c.status?.toLowerCase() === 'in progress').length}
//                           </span>
//                         </div>
//                         <div className="d-flex justify-content-between align-items-center">
//                           <span>Pending:</span>
//                           <span className="badge bg-secondary">
//                             {complaints.filter(c => !c.status || c.status?.toLowerCase() === 'not done yet').length}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default StudentProfile;

// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import { useUser } from '../contexts/UserContext';

// function StudentProfile() {
//   const { studentId } = useParams();
//   const navigate = useNavigate();
//   const { currentUser, logout } = useUser();
//   const [complaints, setComplaints] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' or 'profile'

//   useEffect(() => {
//     // Check if user is authenticated and matches the profile being viewed
//     if (!currentUser || currentUser.Id !== studentId) {
//       navigate('/signup');
//       return;
//     }
    
//     // Fetch complaints automatically on component load
//     fetchAllComplaints();
//   }, [currentUser, studentId, navigate]);

//   const fetchAllComplaints = async () => {
//     if (!currentUser) return;
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const token = localStorage.getItem('authToken');
//       const response = await fetch(`http://localhost:4700/student-api/complaints/${currentUser.Id}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const result = await response.json();

//       if (response.ok) {
//         setComplaints(result.payload || []);
//       } else {
//         setError(result.message || 'Failed to fetch complaints');
//       }
//     } catch (error) {
//       console.error('Error fetching complaints:', error);
//       setError('Network error. Please check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/signup');
//   };

//   const getStatusBadgeClass = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return 'badge bg-success';
//       case 'in progress':
//         return 'badge bg-warning text-dark';
//       case 'verified':
//         return 'badge bg-info';
//       case 'rejected':
//         return 'badge bg-danger';
//       default:
//         return 'badge bg-secondary';
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (!currentUser) {
//     return (
//       <div className="container">
//         <div className="row justify-content-center mt-5">
//           <div className="col-md-6">
//             <div className="alert alert-warning text-center">
//               <h4>Access Denied</h4>
//               <p>Please log in to view your profile.</p>
//               <button 
//                 className="btn btn-primary"
//                 onClick={() => navigate('/signup')}
//               >
//                 Go to Login
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container-fluid">
//       {/* Header Section */}
//       <div className="row">
//         <div className="col-12">
//           <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
//             <div className="container">
//               <span className="navbar-brand mb-0 h1">
//                 <i className="fas fa-user-graduate me-2"></i>
//                 Student Portal
//               </span>
              
//               {/* Navigation Buttons */}
//               <div className="navbar-nav ms-auto d-flex flex-row gap-2">
//                 <button
//                   className={`btn ${activeTab === 'complaints' ? 'btn-light' : 'btn-outline-light'} me-2`}
//                   onClick={() => {
//                     setActiveTab('complaints');
//                     fetchAllComplaints();
//                   }}
//                 >
//                   <i className="fas fa-list me-1"></i>
//                   View All Complaints
//                 </button>
                
//                 {/* Fixed Link path - removed nested route structure */}
//                 <Link 
//                   to={`/student-profile/${studentId}/complaint-form`} 
//                   className="btn btn-success me-2"
//                 >
//                   <i className="fas fa-plus me-1"></i>
//                   Post Complaint
//                 </Link>
                
//                 <button
//                   className={`btn ${activeTab === 'profile' ? 'btn-light' : 'btn-outline-light'} me-2`}
//                   onClick={() => setActiveTab('profile')}
//                 >
//                   <i className="fas fa-user me-1"></i>
//                   Profile
//                 </button>
                
//                 <button 
//                   className="btn btn-outline-light"
//                   onClick={handleLogout}
//                 >
//                   <i className="fas fa-sign-out-alt me-1"></i>
//                   Logout
//                 </button>
//               </div>
//             </div>
//           </nav>
//         </div>
//       </div>

//       {/* Welcome Section */}
//       <div className="row mt-3">
//         <div className="col-12">
//           <div className="bg-light p-3 rounded shadow-sm">
//             <div className="container">
//               <h2 className="text-primary mb-1">
//                 Welcome, {currentUser.firstName} {currentUser.lastName}!
//               </h2>
//               <p className="text-muted mb-0">
//                 <i className="fas fa-id-card me-1"></i>
//                 Roll No: <strong>{currentUser.Id}</strong> | 
//                 <i className="fas fa-envelope ms-2 me-1"></i>
//                 {currentUser.email} | 
//                 <i className="fas fa-bed ms-2 me-1"></i>
//                 Room: <strong>{currentUser.roomNumber || 'Not assigned'}</strong> | 
//                 <i className="fas fa-building ms-2 me-1"></i>
//                 Block: <strong>{currentUser.block || 'Not assigned'}</strong>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="row mt-4">
//         <div className="col-12">
//           <div className="container">
            
//             {/* Complaints Tab */}
//             {activeTab === 'complaints' && (
//               <div>
//                 <div className="d-flex justify-content-between align-items-center mb-4">
//                   <h3 className="text-dark">
//                     <i className="fas fa-clipboard-list me-2"></i>
//                     My Complaints
//                   </h3>
//                   <div className="d-flex gap-2">
//                     <button 
//                       className="btn btn-outline-primary btn-sm"
//                       onClick={fetchAllComplaints}
//                       disabled={loading}
//                     >
//                       <i className="fas fa-sync-alt me-1"></i>
//                       {loading ? 'Refreshing...' : 'Refresh'}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Error Message */}
//                 {error && (
//                   <div className="alert alert-danger" role="alert">
//                     <i className="fas fa-exclamation-triangle me-2"></i>
//                     {error}
//                   </div>
//                 )}

//                 {/* Loading State */}
//                 {loading && (
//                   <div className="text-center py-5">
//                     <div className="spinner-border text-primary" role="status">
//                       <span className="visually-hidden">Loading...</span>
//                     </div>
//                     <p className="mt-2 text-muted">Loading your complaints...</p>
//                   </div>
//                 )}

//                 {/* Complaints List */}
//                 {!loading && !error && (
//                   <div>
//                     {complaints.length === 0 ? (
//                       <div className="text-center py-5">
//                         <div className="card border-0 bg-light">
//                           <div className="card-body">
//                             <i className="fas fa-clipboard fa-3x text-muted mb-3"></i>
//                             <h5 className="text-muted">No Complaints Found</h5>
//                             <p className="text-muted">You haven't filed any complaints yet.</p>
//                             {/* Fixed Link path here too */}
//                             <Link to={`/student-profile/${studentId}/complaint-form`} className="btn btn-primary">
//                               <i className="fas fa-plus me-1"></i>
//                               File Your First Complaint
//                             </Link>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="row">
//                         {complaints.map((complaint, index) => (
//                           <div key={complaint._id || index} className="col-lg-6 col-md-6 col-sm-12 mb-4">
//                             <div className="card h-100 shadow-sm border-start border-4 border-primary">
//                               <div className="card-header bg-white d-flex justify-content-between align-items-center">
//                                 <h6 className="mb-0 text-primary fw-bold">
//                                   {complaint.title || 'No Title'}
//                                 </h6>
//                                 <span className={getStatusBadgeClass(complaint.status)}>
//                                   {complaint.status || 'Not Started'}
//                                 </span>
//                               </div>
//                               <div className="card-body">
//                                 <p className="card-text text-muted">
//                                   <strong>Description:</strong> {complaint.description || 'No description available'}
//                                 </p>
//                                 <div className="row">
//                                   <div className="col-6">
//                                     <small className="text-muted">
//                                       <i className="fas fa-tag me-1"></i>
//                                       <strong>Category:</strong> {complaint.category || 'N/A'}
//                                     </small>
//                                   </div>
//                                   <div className="col-6">
//                                     <small className="text-muted">
//                                       <i className="fas fa-door-open me-1"></i>
//                                       <strong>Room:</strong> {complaint.roomno || 'N/A'}
//                                     </small>
//                                   </div>
//                                 </div>
//                                 <div className="row mt-2">
//                                   <div className="col-6">
//                                     <small className="text-muted">
//                                       <i className="fas fa-building me-1"></i>
//                                       <strong>Block:</strong> {complaint.block || 'N/A'}
//                                     </small>
//                                   </div>
//                                   <div className="col-6">
//                                     <small className="text-muted">
//                                       <i className="fas fa-calendar me-1"></i>
//                                       <strong>Created:</strong> {formatDate(complaint.createdAt)}
//                                     </small>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="card-footer bg-white border-top-0">
//                                 <small className="text-muted">
//                                   <i className="fas fa-clock me-1"></i>
//                                   Last Updated: {formatDate(complaint.updatedAt) || 'Never'}
//                                 </small>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Profile Tab */}
//             {activeTab === 'profile' && (
//               <div>
//                 <h3 className="text-dark mb-4">
//                   <i className="fas fa-user me-2"></i>
//                   Profile Information
//                 </h3>
//                 <div className="row">
//                   <div className="col-md-8">
//                     <div className="card shadow-sm">
//                       <div className="card-header bg-primary text-white">
//                         <h5 className="mb-0">
//                           <i className="fas fa-user-circle me-2"></i>
//                           Personal Details
//                         </h5>
//                       </div>
//                       <div className="card-body">
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Full Name:</strong></div>
//                           <div className="col-sm-8">{currentUser.firstName} {currentUser.lastName}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Roll Number:</strong></div>
//                           <div className="col-sm-8">{currentUser.Id}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Email:</strong></div>
//                           <div className="col-sm-8">{currentUser.email}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Phone:</strong></div>
//                           <div className="col-sm-8">{currentUser.phone || 'Not provided'}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Room Number:</strong></div>
//                           <div className="col-sm-8">{currentUser.roomNumber || 'Not assigned'}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Block:</strong></div>
//                           <div className="col-sm-8">{currentUser.block || 'Not assigned'}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Role:</strong></div>
//                           <div className="col-sm-8">
//                             <span className="badge bg-info">{currentUser.role || 'Student'}</span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="card-footer">
//                         <button className="btn btn-outline-primary">
//                           <i className="fas fa-edit me-1"></i>
//                           Edit Profile
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-md-4">
//                     <div className="card shadow-sm">
//                       <div className="card-header bg-info text-white">
//                         <h6 className="mb-0">
//                           <i className="fas fa-chart-pie me-2"></i>
//                           Quick Stats
//                         </h6>
//                       </div>
//                       <div className="card-body">
//                         <div className="d-flex justify-content-between align-items-center mb-2">
//                           <span>Total Complaints:</span>
//                           <span className="badge bg-primary">{complaints.length}</span>
//                         </div>
//                         <div className="d-flex justify-content-between align-items-center mb-2">
//                           <span>Completed:</span>
//                           <span className="badge bg-success">
//                             {complaints.filter(c => c.status?.toLowerCase() === 'completed').length}
//                           </span>
//                         </div>
//                         <div className="d-flex justify-content-between align-items-center mb-2">
//                           <span>In Progress:</span>
//                           <span className="badge bg-warning text-dark">
//                             {complaints.filter(c => c.status?.toLowerCase() === 'in progress').length}
//                           </span>
//                         </div>
//                         <div className="d-flex justify-content-between align-items-center">
//                           <span>Pending:</span>
//                           <span className="badge bg-secondary">
//                             {complaints.filter(c => !c.status || c.status?.toLowerCase() === 'not done yet').length}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default StudentProfile;

// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import { useUser } from '../contexts/UserContext';

// function StudentProfile() {
//   const { studentId } = useParams();
//   const navigate = useNavigate();
//   const { currentUser, logout } = useUser();
//   const [complaints, setComplaints] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('complaints');
//   const [hasOpenComplaint, setHasOpenComplaint] = useState(false);
//   const [actionLoading, setActionLoading] = useState(null); // Track loading state for specific actions

//   useEffect(() => {
//     // Check if user is authenticated and matches the profile being viewed
//     if (!currentUser || currentUser.Id !== studentId) {
//       navigate('/signup');
//       return;
//     }
    
//     // Fetch complaints automatically on component load
//     fetchAllComplaints();
//   }, [currentUser, studentId, navigate]);

//   const fetchAllComplaints = async () => {
//     if (!currentUser) return;
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const token = localStorage.getItem('authToken');
//       const response = await fetch(`http://localhost:4700/student-api/complaints/${currentUser.Id}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const result = await response.json();

//       if (response.ok) {
//         setComplaints(result.payload || []);
//         // Check if there's any open complaint
//         const openComplaint = result.payload?.find(complaint => 
//           complaint.status !== 'Completed' && complaint.status !== 'verified'
//         );
//         setHasOpenComplaint(!!openComplaint);
//       } else {
//         setError(result.message || 'Failed to fetch complaints');
//       }
//     } catch (error) {
//       console.error('Error fetching complaints:', error);
//       setError('Network error. Please check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCompleteComplaint = async (complaintId) => {
//     setActionLoading(complaintId);
//     try {
//       const token = localStorage.getItem('authToken');
//       const response = await fetch(`http://localhost:4700/student-api/${currentUser.Id}/complaints/${complaintId}/status`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ status: 'Completed' })
//       });

//       const result = await response.json();

//       if (response.ok) {
//         // Refresh complaints list
//         fetchAllComplaints();
//         setError(''); // Clear any previous errors
//       } else {
//         setError(result.message || 'Failed to update complaint status');
//       }
//     } catch (error) {
//       console.error('Error updating complaint status:', error);
//       setError('Network error. Please try again.');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleDeleteComplaint = async (complaintId) => {
//     if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
//       return;
//     }

//     setActionLoading(complaintId);
//     try {
//       const token = localStorage.getItem('authToken');
//       const response = await fetch(`http://localhost:4700/student-api/complaint/delete/${complaintId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const result = await response.json();

//       if (response.ok) {
//         // Refresh complaints list
//         fetchAllComplaints();
//         setError(''); // Clear any previous errors
//       } else {
//         setError(result.message || 'Failed to delete complaint');
//       }
//     } catch (error) {
//       console.error('Error deleting complaint:', error);
//       setError('Network error. Please try again.');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/signup');
//   };

//   const getStatusBadgeClass = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return 'badge bg-success';
//       case 'in progress':
//         return 'badge bg-warning text-dark';
//       case 'verified':
//         return 'badge bg-info';
//       case 'rejected':
//         return 'badge bg-danger';
//       default:
//         return 'badge bg-secondary';
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const canEditComplaint = (status) => {
//     const lockedStatuses = ['Resolved', 'Completed', 'verified'];
//     return !lockedStatuses.includes(status);
//   };

//   if (!currentUser) {
//     return (
//       <div className="container">
//         <div className="row justify-content-center mt-5">
//           <div className="col-md-6">
//             <div className="alert alert-warning text-center">
//               <h4>Access Denied</h4>
//               <p>Please log in to view your profile.</p>
//               <button 
//                 className="btn btn-primary"
//                 onClick={() => navigate('/signup')}
//               >
//                 Go to Login
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container-fluid">
//       {/* Header Section */}
//       <div className="row">
//         <div className="col-12">
//           <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
//             <div className="container">
//               <span className="navbar-brand mb-0 h1">
//                 <i className="fas fa-user-graduate me-2"></i>
//                 Student Portal
//               </span>
              
//               {/* Navigation Buttons */}
//               <div className="navbar-nav ms-auto d-flex flex-row gap-2">
//                 <button
//                   className={`btn ${activeTab === 'complaints' ? 'btn-light' : 'btn-outline-light'} me-2`}
//                   onClick={() => {
//                     setActiveTab('complaints');
//                     fetchAllComplaints();
//                   }}
//                 >
//                   <i className="fas fa-list me-1"></i>
//                   View All Complaints
//                 </button>
                
//                 {/* Conditional Post Complaint Button */}
//                 {hasOpenComplaint ? (
//                   <button 
//                     className="btn btn-secondary me-2" 
//                     disabled
//                     title="You have an unresolved complaint. Please resolve it first."
//                   >
//                     <i className="fas fa-lock me-1"></i>
//                     Post Complaint (Locked)
//                   </button>
//                 ) : (
//                   <Link 
//                     to={`/student-profile/${studentId}/complaint-form`} 
//                     className="btn btn-success me-2"
//                   >
//                     <i className="fas fa-plus me-1"></i>
//                     Post Complaint
//                   </Link>
//                 )}
                
//                 <button
//                   className={`btn ${activeTab === 'profile' ? 'btn-light' : 'btn-outline-light'} me-2`}
//                   onClick={() => setActiveTab('profile')}
//                 >
//                   <i className="fas fa-user me-1"></i>
//                   Profile
//                 </button>
                
//                 <button 
//                   className="btn btn-outline-light"
//                   onClick={handleLogout}
//                 >
//                   <i className="fas fa-sign-out-alt me-1"></i>
//                   Logout
//                 </button>
//               </div>
//             </div>
//           </nav>
//         </div>
//       </div>

//       {/* Welcome Section */}
//       <div className="row mt-3">
//         <div className="col-12">
//           <div className="bg-light p-3 rounded shadow-sm">
//             <div className="container">
//               <h2 className="text-primary mb-1">
//                 Welcome, {currentUser.firstName} {currentUser.lastName}!
//               </h2>
//               <p className="text-muted mb-0">
//                 <i className="fas fa-id-card me-1"></i>
//                 Roll No: <strong>{currentUser.Id}</strong> | 
//                 <i className="fas fa-envelope ms-2 me-1"></i>
//                 {currentUser.email} | 
//                 <i className="fas fa-bed ms-2 me-1"></i>
//                 Room: <strong>{currentUser.roomNumber || 'Not assigned'}</strong> | 
//                 <i className="fas fa-building ms-2 me-1"></i>
//                 Block: <strong>{currentUser.block || 'Not assigned'}</strong>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Alert for Open Complaints */}
//       {hasOpenComplaint && (
//         <div className="row mt-3">
//           <div className="col-12">
//             <div className="container">
//               <div className="alert alert-warning d-flex align-items-center" role="alert">
//                 <i className="fas fa-exclamation-triangle me-2"></i>
//                 <strong>Notice:</strong> You have an unresolved complaint. Please resolve your previous complaint before raising a new one.
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="row mt-4">
//         <div className="col-12">
//           <div className="container">
            
//             {/* Complaints Tab */}
//             {activeTab === 'complaints' && (
//               <div>
//                 <div className="d-flex justify-content-between align-items-center mb-4">
//                   <h3 className="text-dark">
//                     <i className="fas fa-clipboard-list me-2"></i>
//                     My Complaints
//                   </h3>
//                   <div className="d-flex gap-2">
//                     <button 
//                       className="btn btn-outline-primary btn-sm"
//                       onClick={fetchAllComplaints}
//                       disabled={loading}
//                     >
//                       <i className="fas fa-sync-alt me-1"></i>
//                       {loading ? 'Refreshing...' : 'Refresh'}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Error Message */}
//                 {error && (
//                   <div className="alert alert-danger" role="alert">
//                     <i className="fas fa-exclamation-triangle me-2"></i>
//                     {error}
//                     <button 
//                       type="button" 
//                       className="btn-close" 
//                       onClick={() => setError('')}
//                       aria-label="Close"
//                     ></button>
//                   </div>
//                 )}

//                 {/* Loading State */}
//                 {loading && (
//                   <div className="text-center py-5">
//                     <div className="spinner-border text-primary" role="status">
//                       <span className="visually-hidden">Loading...</span>
//                     </div>
//                     <p className="mt-2 text-muted">Loading your complaints...</p>
//                   </div>
//                 )}

//                 {/* Complaints List */}
//                 {!loading && !error && (
//                   <div>
//                     {complaints.length === 0 ? (
//                       <div className="text-center py-5">
//                         <div className="card border-0 bg-light">
//                           <div className="card-body">
//                             <i className="fas fa-clipboard fa-3x text-muted mb-3"></i>
//                             <h5 className="text-muted">No Complaints Found</h5>
//                             <p className="text-muted">You haven't filed any complaints yet.</p>
//                             <Link to={`/student-profile/${studentId}/complaint-form`} className="btn btn-primary">
//                               <i className="fas fa-plus me-1"></i>
//                               File Your First Complaint
//                             </Link>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="row">
//                         {complaints.map((complaint, index) => (
//                           <div key={complaint._id || index} className="col-lg-6 col-md-6 col-sm-12 mb-4">
//                             <div className="card h-100 shadow-sm border-start border-4 border-primary">
//                               <div className="card-header bg-white d-flex justify-content-between align-items-center">
//                                 <h6 className="mb-0 text-primary fw-bold">
//                                   {complaint.title || 'No Title'}
//                                 </h6>
//                                 <span className={getStatusBadgeClass(complaint.status)}>
//                                   {complaint.status || 'Not Started'}
//                                 </span>
//                               </div>
//                               <div className="card-body">
//                                 <p className="card-text text-muted">
//                                   <strong>Description:</strong> {complaint.description || 'No description available'}
//                                 </p>
//                                 <div className="row">
//                                   <div className="col-6">
//                                     <small className="text-muted">
//                                       <i className="fas fa-tag me-1"></i>
//                                       <strong>Category:</strong> {complaint.category || 'N/A'}
//                                     </small>
//                                   </div>
//                                   <div className="col-6">
//                                     <small className="text-muted">
//                                       <i className="fas fa-door-open me-1"></i>
//                                       <strong>Room:</strong> {complaint.roomno || 'N/A'}
//                                     </small>
//                                   </div>
//                                 </div>
//                                 <div className="row mt-2">
//                                   <div className="col-6">
//                                     <small className="text-muted">
//                                       <i className="fas fa-building me-1"></i>
//                                       <strong>Block:</strong> {complaint.block || 'N/A'}
//                                     </small>
//                                   </div>
//                                   <div className="col-6">
//                                     <small className="text-muted">
//                                       <i className="fas fa-calendar me-1"></i>
//                                       <strong>Created:</strong> {formatDate(complaint.createdAt)}
//                                     </small>
//                                   </div>
//                                 </div>
//                               </div>
                              
//                               {/* Action Buttons */}
//                               <div className="card-footer bg-white border-top">
//                                 <div className="d-flex justify-content-between align-items-center">
//                                   <small className="text-muted">
//                                     <i className="fas fa-clock me-1"></i>
//                                     Updated: {formatDate(complaint.updatedAt) || 'Never'}
//                                   </small>
                                  
//                                   <div className="btn-group" role="group">
//                                     {/* Complete Button - Only show if not completed */}
//                                     {complaint.status !== 'Completed' && complaint.status !== 'verified' && (
//                                       <button
//                                         className="btn btn-success btn-sm"
//                                         onClick={() => handleCompleteComplaint(complaint._id)}
//                                         disabled={actionLoading === complaint._id}
//                                         title="Mark as completed"
//                                       >
//                                         {actionLoading === complaint._id ? (
//                                           <span className="spinner-border spinner-border-sm" role="status"></span>
//                                         ) : (
//                                           <i className="fas fa-check"></i>
//                                         )}
//                                       </button>
//                                     )}
                                    
//                                     {/* Edit Button - Only show if complaint can be edited */}
//                                     {canEditComplaint(complaint.status) && (
//                                       <button
//                                         className="btn btn-warning btn-sm"
//                                         onClick={() => {
//                                           // Navigate to edit form or implement inline editing
//                                           console.log('Edit complaint:', complaint._id);
//                                           // You can implement this by creating an edit route or modal
//                                         }}
//                                         title="Edit complaint"
//                                       >
//                                         <i className="fas fa-edit"></i>
//                                       </button>
//                                     )}
                                    
//                                     {/* Delete Button */}
//                                     <button
//                                       className="btn btn-danger btn-sm"
//                                       onClick={() => handleDeleteComplaint(complaint._id)}
//                                       disabled={actionLoading === complaint._id}
//                                       title="Delete complaint"
//                                     >
//                                       {actionLoading === complaint._id ? (
//                                         <span className="spinner-border spinner-border-sm" role="status"></span>
//                                       ) : (
//                                         <i className="fas fa-trash"></i>
//                                       )}
//                                     </button>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Profile Tab */}
//             {activeTab === 'profile' && (
//               <div>
//                 <h3 className="text-dark mb-4">
//                   <i className="fas fa-user me-2"></i>
//                   Profile Information
//                 </h3>
//                 <div className="row">
//                   <div className="col-md-8">
//                     <div className="card shadow-sm">
//                       <div className="card-header bg-primary text-white">
//                         <h5 className="mb-0">
//                           <i className="fas fa-user-circle me-2"></i>
//                           Personal Details
//                         </h5>
//                       </div>
//                       <div className="card-body">
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Full Name:</strong></div>
//                           <div className="col-sm-8">{currentUser.firstName} {currentUser.lastName}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Roll Number:</strong></div>
//                           <div className="col-sm-8">{currentUser.Id}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Email:</strong></div>
//                           <div className="col-sm-8">{currentUser.email}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Phone:</strong></div>
//                           <div className="col-sm-8">{currentUser.phone || 'Not provided'}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Room Number:</strong></div>
//                           <div className="col-sm-8">{currentUser.roomNumber || 'Not assigned'}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Block:</strong></div>
//                           <div className="col-sm-8">{currentUser.block || 'Not assigned'}</div>
//                         </div>
//                         <div className="row mb-3">
//                           <div className="col-sm-4"><strong>Role:</strong></div>
//                           <div className="col-sm-8">
//                             <span className="badge bg-info">{currentUser.role || 'Student'}</span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="card-footer">
//                         <button className="btn btn-outline-primary">
//                           <i className="fas fa-edit me-1"></i>
//                           Edit Profile
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-md-4">
//                     <div className="card shadow-sm">
//                       <div className="card-header bg-info text-white">
//                         <h6 className="mb-0">
//                           <i className="fas fa-chart-pie me-2"></i>
//                           Quick Stats
//                         </h6>
//                       </div>
//                       <div className="card-body">
//                         <div className="d-flex justify-content-between align-items-center mb-2">
//                           <span>Total Complaints:</span>
//                           <span className="badge bg-primary">{complaints.length}</span>
//                         </div>
//                         <div className="d-flex justify-content-between align-items-center mb-2">
//                           <span>Completed:</span>
//                           <span className="badge bg-success">
//                             {complaints.filter(c => c.status?.toLowerCase() === 'completed').length}
//                           </span>
//                         </div>
//                         <div className="d-flex justify-content-between align-items-center mb-2">
//                           <span>In Progress:</span>
//                           <span className="badge bg-warning text-dark">
//                             {complaints.filter(c => c.status?.toLowerCase() === 'in progress').length}
//                           </span>
//                         </div>
//                         <div className="d-flex justify-content-between align-items-center">
//                           <span>Pending:</span>
//                           <span className="badge bg-secondary">
//                             {complaints.filter(c => !c.status || c.status?.toLowerCase() === 'not started').length}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default StudentProfile;





import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function StudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { currentUser, logout } = useUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('complaints');
  const [hasOpenComplaint, setHasOpenComplaint] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Add missing state for profile editing
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
  
  // Add missing state for complaint editing
  const [editingComplaintId, setEditingComplaintId] = useState(null);
  const [complaintData, setComplaintData] = useState({
    title: '',
    description: '',
    category: ''
  });
  
  // Add message state for user feedback
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if user is authenticated and matches the profile being viewed
    if (!currentUser || currentUser.Id !== studentId) {
      navigate('/signup');
      return;
    }
    
    // Initialize profile data
    setProfileData({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      phone: currentUser.phone || '',
      roomNumber: currentUser.roomNumber || '',
      block: currentUser.block || '',
      year: currentUser.year || '',
      branch: currentUser.branch || ''
    });
    
    // Fetch complaints automatically on component load
    fetchAllComplaints();
  }, [currentUser, studentId, navigate]);

  const fetchAllComplaints = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4700/student-api/complaints/${currentUser.Id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setComplaints(result.payload || []);
        // Check if there's any open complaint
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

  // Add Update Profile function from first code
  const updateProfile = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setMessage('First name and last name are required');
      return;
    }

    setActionLoading('profile');
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4700/student-api/editprofile/${currentUser.Id}`, {
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
        // Update the current user context if needed
        // updateUserContext(result.payload);
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

  // Add Delete Profile function from first code
  const deleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      return;
    }

    setActionLoading('profile');
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4700/student-api/deleteprofile/${currentUser.Id}`, {
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

  // Add Update Complaint function from first code
  const updateComplaint = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!complaintData.title.trim() || !complaintData.description.trim() || !complaintData.category) {
      setMessage('Please fill in all required fields');
      return;
    }

    setActionLoading(editingComplaintId);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4700/student-api/complaint/edit/${editingComplaintId}`, {
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
        fetchAllComplaints(); // Refresh complaints list
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
      const response = await fetch(`http://localhost:4700/student-api/${currentUser.Id}/complaints/${complaintId}/status`, {
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

  // Enhanced Delete Complaint function from first code
  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    setActionLoading(complaintId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4700/student-api/complaint/delete/${complaintId}`, {
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

  // Add helper functions from first code
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

  const handleLogout = () => {
    logout();
    navigate('/signup');
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

  // Auto-hide message after 5 seconds
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
      <div className="container">
        <div className="row justify-content-center mt-5">
          <div className="col-md-6">
            <div className="alert alert-warning text-center">
              <h4>Access Denied</h4>
              <p>Please log in to view your profile.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/signup')}
              >
                Go to Login
              </button>
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
                <i className="fas fa-user-graduate me-2"></i>
                Student Portal
              </span>
              
              {/* Navigation Buttons */}
              <div className="navbar-nav ms-auto d-flex flex-row gap-2">
                <button
                  className={`btn ${activeTab === 'complaints' ? 'btn-light' : 'btn-outline-light'} me-2`}
                  onClick={() => {
                    setActiveTab('complaints');
                    fetchAllComplaints();
                  }}
                >
                  <i className="fas fa-list me-1"></i>
                  View All Complaints
                </button>
                
                {/* Conditional Post Complaint Button */}
                {hasOpenComplaint ? (
                  <button 
                    className="btn btn-secondary me-2" 
                    disabled
                    title="You have an unresolved complaint. Please resolve it first."
                  >
                    <i className="fas fa-lock me-1"></i>
                    Post Complaint (Locked)
                  </button>
                ) : (
                  <Link 
                    to={`/student-profile/${studentId}/complaint-form`} 
                    className="btn btn-success me-2"
                  >
                    <i className="fas fa-plus me-1"></i>
                    Post Complaint
                  </Link>
                )}
                
                <button
                  className={`btn ${activeTab === 'profile' ? 'btn-light' : 'btn-outline-light'} me-2`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="fas fa-user me-1"></i>
                  Profile
                </button>
                
                <button 
                  className="btn btn-outline-light"
                  onClick={handleLogout}
                >
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
                Welcome, {currentUser.firstName} {currentUser.lastName}!
              </h2>
              <p className="text-muted mb-0">
                <i className="fas fa-id-card me-1"></i>
                Roll No: <strong>{currentUser.Id}</strong> | 
                <i className="fas fa-envelope ms-2 me-1"></i>
                {currentUser.email} | 
                <i className="fas fa-bed ms-2 me-1"></i>
                Room: <strong>{currentUser.roomNumber || 'Not assigned'}</strong> | 
                <i className="fas fa-building ms-2 me-1"></i>
                Block: <strong>{currentUser.block || 'Not assigned'}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert for Open Complaints */}
      {hasOpenComplaint && (
        <div className="row mt-3">
          <div className="col-12">
            <div className="container">
              <div className="alert alert-warning d-flex align-items-center" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Notice:</strong> You have an unresolved complaint. Please resolve your previous complaint before raising a new one.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className="row mt-3">
          <div className="col-12">
            <div className="container">
              <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                <div className="d-flex align-items-center">
                  <i className={`fas ${message.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                  {message}
                  <button 
                    type="button" 
                    className="btn-close ms-auto" 
                    onClick={() => setMessage('')}
                    aria-label="Close"
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="container">
            
            {/* Complaints Tab */}
            {activeTab === 'complaints' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="text-dark">
                    <i className="fas fa-clipboard-list me-2"></i>
                    My Complaints
                  </h3>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={fetchAllComplaints}
                      disabled={loading}
                    >
                      <i className="fas fa-sync-alt me-1"></i>
                      {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError('')}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading your complaints...</p>
                  </div>
                )}

                {/* Complaints List */}
                {!loading && !error && (
                  <div>
                    {complaints.length === 0 ? (
                      <div className="text-center py-5">
                        <div className="card border-0 bg-light">
                          <div className="card-body">
                            <i className="fas fa-clipboard fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">No Complaints Found</h5>
                            <p className="text-muted">You haven't filed any complaints yet.</p>
                            <Link to={`/student-profile/${studentId}/complaint-form`} className="btn btn-primary">
                              <i className="fas fa-plus me-1"></i>
                              File Your First Complaint
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="row">
                        {complaints.map((complaint, index) => (
                          <div key={complaint._id || index} className="col-lg-6 col-md-6 col-sm-12 mb-4">
                            <div className="card h-100 shadow-sm border-start border-4 border-primary">
                              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 text-primary fw-bold">
                                  {complaint.title || 'No Title'}
                                </h6>
                                <span className={getStatusBadgeClass(complaint.status)}>
                                  {complaint.status || 'Not Started'}
                                </span>
                              </div>
                              <div className="card-body">
                                {editingComplaintId === complaint._id ? (
                                  // Edit Form
                                  <form onSubmit={updateComplaint}>
                                    <div className="mb-3">
                                      <label className="form-label">Title *</label>
                                      <input 
                                        type="text"
                                        className="form-control"
                                        value={complaintData.title}
                                        onChange={(e) => setComplaintData({...complaintData, title: e.target.value})}
                                        maxLength="100"
                                        required
                                      />
                                    </div>
                                    
                                    <div className="mb-3">
                                      <label className="form-label">Description *</label>
                                      <textarea 
                                        className="form-control"
                                        rows="3"
                                        value={complaintData.description}
                                        onChange={(e) => setComplaintData({...complaintData, description: e.target.value})}
                                        maxLength="500"
                                        required
                                      />
                                    </div>
                                    
                                    <div className="mb-3">
                                      <label className="form-label">Category *</label>
                                      <select 
                                        className="form-select"
                                        value={complaintData.category}
                                        onChange={(e) => setComplaintData({...complaintData, category: e.target.value})}
                                        required
                                      >
                                        <option value="">Select a category</option>
                                        <option value="Plumbing">Plumbing</option>
                                        <option value="Electricity">Electricity</option>
                                        <option value="Cleaning">Cleaning</option>
                                        <option value="Furniture">Furniture</option>
                                        <option value="WiFi">WiFi</option>
                                        <option value="Food">Food</option>
                                        <option value="Security">Security</option>
                                        <option value="Other">Other</option>
                                      </select>
                                    </div>
                                    
                                    <div className="d-flex gap-2">
                                      <button 
                                        type="submit"
                                        className="btn btn-success btn-sm"
                                        disabled={actionLoading === complaint._id}
                                      >
                                        {actionLoading === complaint._id ? (
                                          <>
                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                            Saving...
                                          </>
                                        ) : (
                                          <>
                                            <i className="fas fa-save me-1"></i>
                                            Save
                                          </>
                                        )}
                                      </button>
                                      <button 
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={cancelEditingComplaint}
                                      >
                                        <i className="fas fa-times me-1"></i>
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  // Display Mode
                                  <>
                                    <p className="card-text text-muted">
                                      <strong>Description:</strong> {complaint.description || 'No description available'}
                                    </p>
                                    <div className="row">
                                      <div className="col-6">
                                        <small className="text-muted">
                                          <i className="fas fa-tag me-1"></i>
                                          <strong>Category:</strong> {complaint.category || 'N/A'}
                                        </small>
                                      </div>
                                      <div className="col-6">
                                        <small className="text-muted">
                                          <i className="fas fa-door-open me-1"></i>
                                          <strong>Room:</strong> {complaint.roomno || 'N/A'}
                                        </small>
                                      </div>
                                    </div>
                                    <div className="row mt-2">
                                      <div className="col-6">
                                        <small className="text-muted">
                                          <i className="fas fa-building me-1"></i>
                                          <strong>Block:</strong> {complaint.block || 'N/A'}
                                        </small>
                                      </div>
                                      <div className="col-6">
                                        <small className="text-muted">
                                          <i className="fas fa-calendar me-1"></i>
                                          <strong>Created:</strong> {formatDate(complaint.createdAt)}
                                        </small>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              {/* Action Buttons - Only show when not editing */}
                              {editingComplaintId !== complaint._id && (
                                <div className="card-footer bg-white border-top">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                      <i className="fas fa-clock me-1"></i>
                                      Updated: {formatDate(complaint.updatedAt) || 'Never'}
                                    </small>
                                    
                                    <div className="btn-group" role="group">
                                      {/* Complete Button - Only show if not completed */}
                                      {complaint.status !== 'Completed' && complaint.status !== 'verified' && (
                                        <button
                                          className="btn btn-success btn-sm"
                                          onClick={() => handleCompleteComplaint(complaint._id)}
                                          disabled={actionLoading === complaint._id}
                                          title="Mark as completed"
                                        >
                                          {actionLoading === complaint._id ? (
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                          ) : (
                                            <i className="fas fa-check"></i>
                                          )}
                                        </button>
                                      )}
                                      
                                      {/* Edit Button - Only show if complaint can be edited */}
                                      {canEditComplaint(complaint.status) && (
                                        <button
                                          className="btn btn-warning btn-sm"
                                          onClick={() => startEditingComplaint(complaint)}
                                          title="Edit complaint"
                                        >
                                          <i className="fas fa-edit"></i>
                                        </button>
                                      )}
                                      
                                      {/* Delete Button */}
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDeleteComplaint(complaint._id)}
                                        disabled={actionLoading === complaint._id}
                                        title="Delete complaint"
                                      >
                                        {actionLoading === complaint._id ? (
                                          <span className="spinner-border spinner-border-sm" role="status"></span>
                                        ) : (
                                          <i className="fas fa-trash"></i>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-dark mb-4">
                  <i className="fas fa-user me-2"></i>
                  Profile Information
                </h3>
                <div className="row">
                  <div className="col-md-8">
                    <div className="card shadow-sm">
                      <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">
                          <i className="fas fa-user-circle me-2"></i>
                          Personal Details
                        </h5>
                      </div>
                      <div className="card-body">
                        {!isEditingProfile ? (
                          // Display Mode
                          <>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Full Name:</strong></div>
                              <div className="col-sm-8">{currentUser.firstName} {currentUser.lastName}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Roll Number:</strong></div>
                              <div className="col-sm-8">{currentUser.Id}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Email:</strong></div>
                              <div className="col-sm-8">{currentUser.email}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Phone:</strong></div>
                              <div className="col-sm-8">{currentUser.phone || 'Not provided'}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Room Number:</strong></div>
                              <div className="col-sm-8">{currentUser.roomNumber || 'Not assigned'}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Block:</strong></div>
                              <div className="col-sm-8">{currentUser.block || 'Not assigned'}</div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-sm-4"><strong>Role:</strong></div>
                              <div className="col-sm-8">
                                <span className="badge bg-info">{currentUser.role || 'Student'}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          // Edit Mode
                          <form onSubmit={updateProfile}>
                            <div className="row mb-3">
                              <div className="col-md-6">
                                <label className="form-label">First Name *</label>
                                <input 
                                  type="text"
                                  className="form-control"
                                  value={profileData.firstName}
                                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                  required
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Last Name *</label>
                                <input 
                                  type="text"
                                  className="form-control"
                                  value={profileData.lastName}
                                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Phone Number</label>
                                                              <input 
                                type="tel"
                                className="form-control"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                placeholder="e.g., +91 9876543210"
                              />
                            </div>
                            
                            <div className="row mb-3">
                              <div className="col-md-6">
                                <label className="form-label">Room Number</label>
                                <input 
                                  type="number"
                                  className="form-control"
                                  value={profileData.roomNumber}
                                  onChange={(e) => setProfileData({...profileData, roomNumber: e.target.value})}
                                  min="1"
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Block</label>
                                <input 
                                  type="text"
                                  className="form-control"
                                  value={profileData.block}
                                  onChange={(e) => setProfileData({...profileData, block: e.target.value})}
                                  placeholder="e.g., A, B, C"
                                  maxLength="10"
                                />
                              </div>
                            </div>
                            
                            <div className="row mb-3">
                              <div className="col-md-6">
                                <label className="form-label">Year</label>
                                <select 
                                  className="form-select" 
                                  value={profileData.year}
                                  onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                                >
                                  <option value="">Select Year</option>
                                  <option value="1st Year">1st Year</option>
                                  <option value="2nd Year">2nd Year</option>
                                  <option value="3rd Year">3rd Year</option>
                                  <option value="4th Year">4th Year</option>
                                </select>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Branch</label>
                                <input 
                                  type="text"
                                  className="form-control"
                                  value={profileData.branch}
                                  onChange={(e) => setProfileData({...profileData, branch: e.target.value})}
                                  placeholder="e.g., Computer Science"
                                />
                              </div>
                            </div>
                            
                            <div className="d-flex gap-2">
                              <button 
                                type="submit"
                                className="btn btn-success"
                                disabled={actionLoading === 'profile'}
                              >
                                {actionLoading === 'profile' ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Saving...
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
                                  setProfileData({
                                    firstName: currentUser.firstName || '',
                                    lastName: currentUser.lastName || '',
                                    phone: currentUser.phone || '',
                                    roomNumber: currentUser.roomNumber || '',
                                    block: currentUser.block || '',
                                    year: currentUser.year || '',
                                    branch: currentUser.branch || ''
                                  });
                                }}
                              >
                                <i className="fas fa-times me-1"></i>
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                      <div className="card-footer">
                        {!isEditingProfile && (
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => setIsEditingProfile(true)}
                              disabled={actionLoading === 'profile'}
                            >
                              <i className="fas fa-edit me-1"></i>
                              Edit Profile
                            </button>
                            <button 
                              className="btn btn-outline-danger"
                              onClick={deleteProfile}
                              disabled={actionLoading === 'profile'}
                            >
                              <i className="fas fa-trash me-1"></i>
                              {actionLoading === 'profile' ? 'Deleting...' : 'Delete Profile'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card shadow-sm">
                      <div className="card-header bg-info text-white">
                        <h6 className="mb-0">
                          <i className="fas fa-chart-pie me-2"></i>
                          Quick Stats
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Total Complaints:</span>
                          <span className="badge bg-primary">{complaints.length}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Completed:</span>
                          <span className="badge bg-success">
                            {complaints.filter(c => c.status?.toLowerCase() === 'completed').length}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>In Progress:</span>
                          <span className="badge bg-warning text-dark">
                            {complaints.filter(c => c.status?.toLowerCase() === 'in progress').length}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Pending:</span>
                          <span className="badge bg-secondary">
                            {complaints.filter(c => !c.status || c.status?.toLowerCase() === 'not started').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {actionLoading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060}}>
          <div className="text-center text-white">
            <div className="spinner-border spinner-border-lg mb-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div>Processing...</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfile;