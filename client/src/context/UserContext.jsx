import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Initialize user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    
    console.log('Initializing user context...');
    console.log('Token from localStorage:', token ? 'Present' : 'Missing');
    console.log('UserInfo from localStorage:', userInfo ? 'Present' : 'Missing');
    
    if (token && userInfo) {
      try {
        // First, check if userInfo is already an object
        let parsedUser;
        if (typeof userInfo === 'string') {
          parsedUser = JSON.parse(userInfo);
        } else {
          parsedUser = userInfo;
        }
        
        console.log('Parsed user data:', parsedUser);
        
        // Validate the parsed user object
        if (!parsedUser || typeof parsedUser !== 'object') {
          throw new Error('Invalid user object structure');
        }
        
        // Extract user ID with multiple fallbacks
        const userId = parsedUser.Id || parsedUser._id || parsedUser.id || 
                      parsedUser.studentId || parsedUser.wardenId || parsedUser.employeeId;
        
        if (!userId) {
          throw new Error('No valid user ID found in user data');
        }
        
        // Normalize user object based on role
        const normalizedUser = {
          ...parsedUser,
          Id: userId,
          // Ensure essential fields exist
          firstName: parsedUser.firstName || parsedUser.first_name || '',
          lastName: parsedUser.lastName || parsedUser.last_name || '',
          email: parsedUser.email || '',
          role: parsedUser.role || 'student',
          // Warden specific fields
          employeeId: parsedUser.employeeId || null,
          department: parsedUser.department || null,
          hostelBlock: parsedUser.hostelBlock || null,
          experience: parsedUser.experience || null,
          // Student specific fields  
          studentId: parsedUser.studentId || null,
          block: parsedUser.block || null,
          roomno: parsedUser.roomno || null,
          phone: parsedUser.phone || null
        };
        
        console.log('Normalized user:', normalizedUser);
        
        setCurrentUser(normalizedUser);
        setAuthToken(token);
        
        // Load notifications for the user
        loadNotifications(userId, normalizedUser.role);
        
        console.log('User context initialized successfully');
      } catch (error) {
        console.error('Error parsing user info from localStorage:', error);
        console.error('Raw userInfo value:', userInfo);
        
        // Clear corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        
        // Set error state or show message to user
        console.warn('Cleared corrupted user data. User needs to login again.');
      }
    } else {
      console.log('No stored auth data found');
    }
    setLoading(false);
  }, []);

  // UPDATED: Load notifications based on user role
  const loadNotifications = async (userId, userRole) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Choose API endpoint based on user role
      let apiEndpoint;
      if (userRole === 'warden') {
        apiEndpoint = `http://localhost:4700/warden-api/notifications/${userId}`;
      } else {
        apiEndpoint = `http://localhost:4700/student-api/notifications/${userId}`;
      }
      
      const response = await fetch(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setNotifications(result.payload || []);
        console.log(`Loaded ${result.payload?.length || 0} notifications for ${userRole}`);
      } else {
        console.warn('Failed to load notifications:', response.status);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // UPDATED: Login function with better role handling
  const login = (user, token) => {
    console.log('UserContext login called with:', { user, token });
    
    // Validate inputs
    if (!user) {
      console.error('Login failed: User data is missing');
      return false;
    }
    
    if (!token) {
      console.error('Login failed: Token is missing');
      return false;
    }
    
    // Ensure user has an ID field
    const userId = user.Id || user._id || user.id || user.studentId || user.wardenId;
    if (!userId) {
      console.error('Login failed: User ID is missing from user object:', user);
      return false;
    }
    
    // Ensure user object has Id property and role for consistency
    const normalizedUser = { 
      ...user, 
      Id: userId,
      role: user.role || 'student' // Default to student if role not specified
    };
    
    console.log('Setting user in context:', normalizedUser);
    
    setCurrentUser(normalizedUser);
    setAuthToken(token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userInfo', JSON.stringify(normalizedUser));
    
    // Load notifications after login based on role
    loadNotifications(userId, normalizedUser.role);
    
    console.log('Login completed successfully');
    return true;
  };

  // Logout function
  const logout = () => {
    console.log('Logging out user');
    setCurrentUser(null);
    setAuthToken(null);
    setNotifications([]);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
  };

  // Update user info
  const updateUser = (updatedUser) => {
    console.log('Updating user:', updatedUser);
    const normalizedUser = { ...updatedUser, Id: updatedUser.Id || updatedUser._id };
    setCurrentUser(normalizedUser);
    localStorage.setItem('userInfo', JSON.stringify(normalizedUser));
  };

  // Add notification
  const addNotification = (notification) => {
    console.log('Adding notification:', notification);
    setNotifications(prev => [notification, ...prev]);
  };

  // UPDATED: Mark notification as read based on user role
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Choose API endpoint based on user role
      let apiEndpoint;
      if (currentUser?.role === 'warden') {
        apiEndpoint = `http://localhost:4700/warden-api/notifications/${notificationId}/mark-read`;
      } else {
        apiEndpoint = `http://localhost:4700/student-api/notifications/${notificationId}/mark-read`;
      }

      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // UPDATED: Delete notification based on user role
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Choose API endpoint based on user role
      let apiEndpoint;
      if (currentUser?.role === 'warden') {
        apiEndpoint = `http://localhost:4700/warden-api/notifications/${notificationId}`;
      } else {
        apiEndpoint = `http://localhost:4700/student-api/notifications/${notificationId}`;
      }

      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get unread notifications count
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
  };

  // UPDATED: Check if user is student - more flexible
  const isStudent = () => {
    return currentUser && (
      currentUser.role === 'student' || 
      currentUser.role === 'hosteller' || 
      !currentUser.role || 
      currentUser.role === ''
    );
  };

  // Check if user is warden
  const isWarden = () => {
    return currentUser && currentUser.role === 'warden';
  };

  // UPDATED: Get user dashboard URL with better logic
  const getDashboardUrl = () => {
    if (!currentUser || !currentUser.Id) {
      console.log('No current user or ID, redirecting to signup');
      return '/signup';
    }
    
    console.log('Getting dashboard URL for user:', currentUser);
    
    if (isWarden()) {
      const url = `/warden-profile/${currentUser.Id}`;
      console.log('Warden dashboard URL:', url);
      return url;
    } else if (isStudent()) {
      const url = `/student-profile/${currentUser.Id}`;
      console.log('Student dashboard URL:', url);
      return url;
    }
    
    console.log('Unknown role, redirecting to signup');
    return '/signup';
  };

  // UPDATED: Get user role display name
  const getUserRoleDisplay = () => {
    if (isWarden()) return 'Warden';
    if (isStudent()) return 'Student';
    return 'Unknown';
  };

  // UPDATED: Check if user can access warden features
  const canAccessWardenFeatures = () => {
    return currentUser && currentUser.role === 'warden';
  };

  // UPDATED: Check if user can access student features
  const canAccessStudentFeatures = () => {
    return currentUser && (
      currentUser.role === 'student' || 
      currentUser.role === 'hosteller' || 
      !currentUser.role
    );
  };

  // Get user full name
  const getUserFullName = () => {
    if (!currentUser) return '';
    return `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
  };

  const value = {
    currentUser,
    authToken,
    loading,
    notifications,
    login,
    logout,
    updateUser,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    getUnreadCount,
    isStudent,
    isWarden,
    getDashboardUrl,
    loadNotifications,
    getUserRoleDisplay,
    canAccessWardenFeatures,
    canAccessStudentFeatures,
    getUserFullName
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};