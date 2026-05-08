import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';

const UserContext = createContext();

/** Build a consistent user object from API / localStorage JSON. Returns null if unusable. */
function normalizeStoredUser(parsedUser) {
  if (!parsedUser || typeof parsedUser !== 'object') return null;

  // Prefer API "Id" (warden login sets this to Mongo _id; avoid employeeId winning and breaking /warden-profile/... routes)
  const displayId =
    parsedUser.Id ||
    parsedUser.id ||
    parsedUser.studentId ||
    parsedUser.employeeId;
  const mongoId =
    parsedUser._id != null && parsedUser._id !== ''
      ? String(parsedUser._id)
      : /^[a-fA-F0-9]{24}$/.test(String(displayId || ''))
        ? String(displayId)
        : null;

  if (!mongoId && !displayId) return null;

  return {
    ...parsedUser,
    _id: mongoId ?? parsedUser._id,
    Id: displayId,
    firstName: parsedUser.firstName || parsedUser.first_name || '',
    lastName: parsedUser.lastName || parsedUser.last_name || '',
    email: parsedUser.email || '',
    role: parsedUser.role || 'student',
    employeeId: parsedUser.employeeId || null,
    department: parsedUser.department || null,
    hostelBlock: parsedUser.hostelBlock || null,
    experience: parsedUser.experience || null,
    studentId: parsedUser.studentId || null,
    block: parsedUser.block || null,
    roomno: parsedUser.roomno || null,
    phone: parsedUser.phone || null
  };
}

function readSessionFromStorage() {
  const token = localStorage.getItem('authToken');
  const userInfo = localStorage.getItem('userInfo');
  if (!token || !userInfo) return null;
  try {
    const parsedUser =
      typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
    const user = normalizeStoredUser(parsedUser);
    if (!user) return null;
    return { token, user };
  } catch {
    return null;
  }
}

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // MOVED: Load notifications function defined before useEffect
  const loadNotifications = useCallback(async (userId, userRole) => {
    if (!userId || !userRole) {
      console.warn('Cannot load notifications: missing userId or userRole');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.warn('Cannot load notifications: no auth token');
        return;
      }
      
      // Choose API endpoint based on user role
      let apiEndpoint;
      if (userRole === 'warden') {
        apiEndpoint = `${API_BASE_URL}/warden-api/notifications/${userId}`;
      } else {
        apiEndpoint = `${API_BASE_URL}/student-api/notifications/${userId}`;
      }
      
      console.log('Loading notifications from:', apiEndpoint);
      
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
        console.warn('Failed to load notifications:', response.status, response.statusText);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  }, []);

  // Initialize user from localStorage on app start
  useEffect(() => {
    const session = readSessionFromStorage();

    if (session) {
      setCurrentUser(session.user);
      setAuthToken(session.token);
      if (session.user._id) {
        loadNotifications(String(session.user._id), session.user.role);
      }
    } else {
      const hadStaleKeys =
        localStorage.getItem('authToken') || localStorage.getItem('userInfo');
      if (hadStaleKeys) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
      }
    }

    setLoading(false);
  }, [loadNotifications]);

  /** Re-read localStorage into React state (fixes stale UI after route changes or logout). */
  const syncAuthFromStorage = useCallback(() => {
    const session = readSessionFromStorage();
    if (!session) {
      setCurrentUser(null);
      setAuthToken(null);
      setNotifications([]);
      return;
    }
    setCurrentUser(session.user);
    setAuthToken(session.token);
  }, []);

  // UPDATED: Login function with better role handling
  const login = useCallback((user, token) => {
    console.log('UserContext login called with:', { user, token });
    
    if (!user) {
      console.error('Login failed: User data is missing');
      return false;
    }
    
    if (!token) {
      console.error('Login failed: Token is missing');
      return false;
    }

    const normalizedUser = normalizeStoredUser(user);
    if (!normalizedUser) {
      console.error('Login failed: No user ID found in user object:', user);
      return false;
    }

    setCurrentUser(normalizedUser);
    setAuthToken(token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userInfo', JSON.stringify(normalizedUser));

    if (normalizedUser._id) {
      loadNotifications(String(normalizedUser._id), normalizedUser.role);
    }

    console.log('Login completed successfully');
    return true;
  }, [loadNotifications]);

  // Logout function
  const logout = useCallback(() => {
    console.log('Logging out user');
    setCurrentUser(null);
    setAuthToken(null);
    setNotifications([]);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
  }, []);

  // Update user info
  const updateUser = useCallback((updatedUser) => {
    console.log('Updating user:', updatedUser);
    const mongoId = updatedUser._id;
    const displayId = updatedUser.studentId || updatedUser.employeeId || updatedUser.Id || updatedUser.id;
    
    const normalizedUser = { 
      ...updatedUser, 
      _id: mongoId,
      Id: displayId
    };
    setCurrentUser(normalizedUser);
    localStorage.setItem('userInfo', JSON.stringify(normalizedUser));
  }, []);

  // Add notification
  const addNotification = useCallback((notification) => {
    console.log('Adding notification:', notification);
    setNotifications(prev => [notification, ...prev]);
  }, []);

  // UPDATED: Mark notification as read based on user role
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No auth token available');
        return;
      }
      
      let apiEndpoint;
      if (currentUser?.role === 'warden') {
        apiEndpoint = `${API_BASE_URL}/warden-api/notifications/${notificationId}/mark-read`;
      } else {
        apiEndpoint = `${API_BASE_URL}/student-api/notifications/${notificationId}/mark-read`;
      }

      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const idStr = String(notificationId);
        setNotifications(prev => 
          prev.map(notification => 
            String(notification._id) === idStr
              ? { ...notification, isRead: true }
              : notification
          )
        );
      } else {
        console.error('Failed to mark notification as read:', response.status);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [currentUser]);

  // UPDATED: Delete notification based on user role
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No auth token available');
        return;
      }
      
      let apiEndpoint;
      if (currentUser?.role === 'warden') {
        apiEndpoint = `${API_BASE_URL}/warden-api/notifications/${notificationId}`;
      } else {
        apiEndpoint = `${API_BASE_URL}/student-api/notifications/${notificationId}`;
      }

      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const idStr = String(notificationId);
        setNotifications(prev => 
          prev.filter(notification => String(notification._id) !== idStr)
        );
      } else {
        console.error('Failed to delete notification:', response.status);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [currentUser]);

  // Get unread notifications count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(notification => !notification.isRead).length;
  }, [notifications]);

  // UPDATED: Student / hosteler portal (anything that is not warden)
  const isStudent = useCallback(() => {
    return !!(currentUser && currentUser.role !== 'warden');
  }, [currentUser]);

  // Check if user is warden
  const isWarden = useCallback(() => {
    return currentUser && currentUser.role === 'warden';
  }, [currentUser]);

  // Dashboard URL: only wardens use the warden profile; everyone else (Hosteler, student, etc.) uses student profile
  const getDashboardUrl = useCallback(() => {
    if (!currentUser || currentUser.Id == null || currentUser.Id === '') {
      return '/signup';
    }
    if (currentUser.role === 'warden') {
      return `/warden-profile/${currentUser.Id}`;
    }
    return `/student-profile/${currentUser.Id}`;
  }, [currentUser]);

  const getUserRoleDisplay = useCallback(() => {
    if (currentUser?.role === 'warden') return 'Warden';
    if (currentUser) return 'Student';
    return 'Unknown';
  }, [currentUser]);

  // UPDATED: Check if user can access warden features
  const canAccessWardenFeatures = useCallback(() => {
    return currentUser && currentUser.role === 'warden';
  }, [currentUser]);

  const canAccessStudentFeatures = useCallback(() => {
    return !!(currentUser && currentUser.role !== 'warden');
  }, [currentUser]);

  // Get user full name
  const getUserFullName = useCallback(() => {
    if (!currentUser) return '';
    return `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
  }, [currentUser]);

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
    syncAuthFromStorage,
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
