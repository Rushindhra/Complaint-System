import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import PageNav from '../components/PageNav';

function NavigationTest() {
  const { currentUser, authToken, login, logout } = useUser();
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, { test, result, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  // Test localStorage with detailed parsing
  const testLocalStorage = () => {
    try {
      const token = localStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo');
      
      addTestResult('localStorage Check', token && userInfo ? 'PASS' : 'FAIL', 
        `Token: ${token ? 'Present' : 'Missing'}, UserInfo: ${userInfo ? 'Present' : 'Missing'}`);
      
      if (userInfo) {
        try {
          // Show raw data first
          addTestResult('Raw UserInfo', 'INFO', `Length: ${userInfo.length} chars, Starts with: ${userInfo.substring(0, 50)}...`);
          
          // Try to parse
          const parsed = JSON.parse(userInfo);
          addTestResult('JSON Parse', 'SUCCESS', `Type: ${typeof parsed}, Keys: ${Object.keys(parsed).join(', ')}`);
          
          // Check for user ID fields
          const possibleIds = ['Id', '_id', 'id', 'studentId', 'wardenId', 'employeeId'];
          const foundIds = possibleIds.filter(field => parsed[field]);
          const userId = foundIds.length > 0 ? parsed[foundIds[0]] : null;
          
          addTestResult('User ID Check', userId ? 'FOUND' : 'MISSING', 
            `Found IDs: [${foundIds.join(', ')}], Value: ${userId}`);
          
          // Check essential fields
          const essentialFields = ['firstName', 'lastName', 'email', 'role'];
          const missingFields = essentialFields.filter(field => !parsed[field]);
          
          addTestResult('Essential Fields', missingFields.length === 0 ? 'COMPLETE' : 'INCOMPLETE',
            missingFields.length > 0 ? `Missing: ${missingFields.join(', ')}` : 'All present');
            
        } catch (parseError) {
          addTestResult('JSON Parse', 'FAILED', `Error: ${parseError.message}`);
          addTestResult('Corruption Check', 'DETECTED', 'UserInfo contains invalid JSON - needs cleanup');
        }
      }
    } catch (error) {
      addTestResult('localStorage Check', 'ERROR', error.message);
    }
  };

  // Fix corrupted localStorage
  const fixCorruptedData = () => {
    try {
      // Clear all auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      
      // Clear any other potential auth keys
      const keysToRemove = ['user', 'token', 'auth', 'session'];
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          addTestResult('Cleanup', 'REMOVED', `Cleared key: ${key}`);
        }
      });
      
      // Reset context
      logout();
      
      addTestResult('Data Cleanup', 'COMPLETED', 'All corrupted data cleared - ready for fresh login');
      
      // Refresh the page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      addTestResult('Data Cleanup', 'FAILED', `Error: ${error.message}`);
    }
  };

  // Create clean test data
  const createTestData = (userType) => {
    const testUsers = {
      student: {
        Id: 'TEST_STUDENT_123',
        firstName: 'Test',
        lastName: 'Student',
        email: 'test.student@example.com',
        role: 'student',
        roomNumber: '101',
        block: 'A',
        year: '2nd Year',
        branch: 'Computer Science'
      },
      warden: {
        Id: 'TEST_WARDEN_456',
        firstName: 'Test',
        lastName: 'Warden',
        email: 'test.warden@example.com',
        role: 'warden',
        employeeId: 'WRD001',
        department: 'Student Affairs',
        hostelBlock: 'Block A'
      }
    };

    const user = testUsers[userType];
    const testToken = 'test_token_' + Date.now();

    try {
      // Test JSON serialization
      const userJson = JSON.stringify(user);
      const parsedBack = JSON.parse(userJson);
      
      if (parsedBack.Id !== user.Id) {
        throw new Error('User ID lost during JSON serialization');
      }

      // Store in localStorage
      localStorage.setItem('authToken', testToken);
      localStorage.setItem('userInfo', userJson);
      
      addTestResult(`Create Test ${userType}`, 'SUCCESS', `Created clean test data for ${user.Id}`);
      
      // Test the login context
      if (login(user, testToken)) {
        addTestResult('Context Login', 'SUCCESS', 'User context updated successfully');
        
        // Test navigation after short delay
        setTimeout(() => {
          const targetPath = userType === 'student' 
            ? `/student-profile/${user.Id}` 
            : `/warden-profile/${user.Id}`;
          
          addTestResult('Test Navigation', 'INITIATED', `Target: ${targetPath}`);
          navigate(targetPath);
        }, 1000);
      } else {
        addTestResult('Context Login', 'FAILED', 'Login function returned false');
      }
      
    } catch (error) {
      addTestResult(`Create Test ${userType}`, 'FAILED', `Error: ${error.message}`);
    }
  };

  // Test API endpoints
  const testAPIEndpoints = async () => {
    const endpoints = [
      { name: 'Student Login', url: 'http://localhost:4700/student-api/login' },
      { name: 'Warden Login', url: 'http://localhost:4700/warden-api/login' },
      { name: 'Notifications', url: 'http://localhost:4700/api/notifications/test' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        });
        
        addTestResult(`API: ${endpoint.name}`, 
          response.status < 500 ? 'ACCESSIBLE' : 'ERROR', 
          `Status: ${response.status}`);
      } catch (error) {
        addTestResult(`API: ${endpoint.name}`, 'ERROR', `Network: ${error.message}`);
      }
    }
  };

  // Test navigation paths
  const testNavigationPaths = () => {
    const paths = [
      '/student-profile/TEST123',
      '/warden-profile/WRD123',
      '/signup',
      '/signup/register',
      '/signup/warden-register'
    ];

    paths.forEach(path => {
      try {
        // Test if path is valid
        const isValid = path.split('/').length >= 2;
        addTestResult(`Path: ${path}`, isValid ? 'VALID' : 'INVALID', '');
      } catch (error) {
        addTestResult(`Path: ${path}`, 'ERROR', error.message);
      }
    });
  };

  // Simulate login for testing
  const simulateLogin = (userType) => {
    const testUsers = {
      student: {
        Id: 'TEST_STUDENT_123',
        firstName: 'Test',
        lastName: 'Student',
        email: 'teststudent@example.com',
        role: 'student'
      },
      warden: {
        Id: 'TEST_WARDEN_456',
        firstName: 'Test',
        lastName: 'Warden',
        email: 'testwarden@example.com',
        role: 'warden'
      }
    };

    const testToken = 'test_token_' + Date.now();
    const user = testUsers[userType];

    if (login(user, testToken)) {
      addTestResult(`Simulate ${userType} Login`, 'SUCCESS', `UserId: ${user.Id}`);
      
      // Test navigation
      setTimeout(() => {
        const targetPath = userType === 'student' 
          ? `/student-profile/${user.Id}` 
          : `/warden-profile/${user.Id}`;
        
        addTestResult('Navigation Attempt', 'INITIATED', `Target: ${targetPath}`);
        navigate(targetPath);
      }, 1000);
    } else {
      addTestResult(`Simulate ${userType} Login`, 'FAILED', 'Login function returned false');
    }
  };

  // Clear all tests
  const clearTests = () => {
    setTestResults([]);
    logout();
    localStorage.clear();
    addTestResult('Reset', 'COMPLETED', 'All data cleared');
  };

  useEffect(() => {
    // Run initial tests
    testLocalStorage();
    testNavigationPaths();
  }, []);

  return (
    <>
    <PageNav />
    <div className="container mt-4 pb-5">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h3 className="mb-0">
                <i className="fas fa-bug me-2"></i>
                Navigation Debug Tool
              </h3>
            </div>
            <div className="card-body">
              
              {/* Current State */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h5>Current State</h5>
                  <div className="bg-light p-3 rounded">
                    <p><strong>User:</strong> {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Not logged in'}</p>
                    <p><strong>User ID:</strong> {currentUser?.Id || 'N/A'}</p>
                    <p><strong>Role:</strong> {currentUser?.role || 'N/A'}</p>
                    <p><strong>Token:</strong> {authToken ? 'Present' : 'Missing'}</p>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <h5>Quick Actions</h5>
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary" onClick={() => createTestData('student')}>
                      Test Student Login (Clean Data)
                    </button>
                    <button className="btn btn-success" onClick={() => createTestData('warden')}>
                      Test Warden Login (Clean Data)
                    </button>
                    <button className="btn btn-warning" onClick={testAPIEndpoints}>
                      Test API Endpoints
                    </button>
                    <button className="btn btn-info" onClick={testLocalStorage}>
                      Analyze Current Data
                    </button>
                    <button className="btn btn-danger" onClick={fixCorruptedData}>
                      Fix Corrupted Data & Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Results */}
              <div className="row">
                <div className="col-12">
                  <h5>Test Results</h5>
                  <div className="table-responsive">
                    <table className="table table-striped table-sm">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Test</th>
                          <th>Result</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testResults.map((result, index) => (
                          <tr key={index}>
                            <td>{result.timestamp}</td>
                            <td>{result.test}</td>
                            <td>
                              <span className={`badge ${
                                result.result === 'PASS' || result.result === 'SUCCESS' || result.result === 'ACCESSIBLE' ? 'bg-success' :
                                result.result === 'FAIL' || result.result === 'ERROR' ? 'bg-danger' :
                                result.result === 'INITIATED' || result.result === 'VALID' ? 'bg-info' :
                                'bg-warning'
                              }`}>
                                {result.result}
                              </span>
                            </td>
                            <td>{result.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {testResults.length === 0 && (
                    <div className="text-center py-3 text-muted">
                      <i className="fas fa-flask fa-2x mb-2"></i>
                      <p>Run tests to see results</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Navigation */}
              <div className="row mt-4">
                <div className="col-12">
                  <h5>Manual Navigation Test</h5>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="/student-profile/123 or /warden-profile/456"
                      id="manualPath"
                    />
                    <button 
                      className="btn btn-outline-primary" 
                      onClick={() => {
                        const path = document.getElementById('manualPath').value;
                        if (path) {
                          addTestResult('Manual Navigation', 'INITIATED', `Path: ${path}`);
                          navigate(path);
                        }
                      }}
                    >
                      Navigate
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="row mt-4">
                <div className="col-12">
                  <div className="alert alert-info">
                    <h6><i className="fas fa-info-circle me-2"></i>Debug Instructions</h6>
                    <ol>
                      <li>Check if your backend is running on port 4700</li>
                      <li>Test API endpoints to ensure they're accessible</li>
                      <li>Use "Test Student/Warden Login" to simulate the login process</li>
                      <li>Check the browser console for detailed error messages</li>
                      <li>Verify that user ID fields match your backend response structure</li>
                    </ol>
                  </div>
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

export default NavigationTest;