import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, getCredentials } = useAuth();
  const [selectedRole, setSelectedRole] = useState('superadmin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'projectmanager', label: 'Project Manager' },
    { value: 'servermanager', label: 'Server Manager' },
    { value: 'centermanager', label: 'Center Manager' },
    { value: 'venuepm', label: 'Venue Partner PM' },
    { value: 'cctvpm', label: 'CCTV Partner PM' },
    { value: 'biometricpm', label: 'Biometric Partner PM' },
    { value: 'techpm', label: 'Technology Partner PM' },
    { value: 'bodycampm', label: 'Body Cam Partner PM' },
    { value: 'manpowerpm', label: 'Manpower Partner PM' },
  ];

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    const { username: u, password: p } = getCredentials(role);
    setUsername(u);
    setPassword(p);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = login(selectedRole, username, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="logo-large">VBSA</div>
            <h1>Venue Booking & Service</h1>
            <p>Manpower & Devices Onboarding, Mapping and Management Platform</p>
            <div className="features">
              <div className="feature">
                <div className="feature-icon">✓</div>
                <span>Role-Based Access Control</span>
              </div>
              <div className="feature">
                <div className="feature-icon">✓</div>
                <span>Multi-User Management</span>
              </div>
              <div className="feature">
                <div className="feature-icon">✓</div>
                <span>Device Tracking & Mapping</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <h2>Welcome Back</h2>
            <p className="subtitle">Select your role and login to continue</p>

            {/* Role Selection */}
            <div className="role-selection">
              <label className="label">Select Your Role</label>
              <select
                className="role-dropdown"
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="form">
              <div className="form-group">
                <label className="label">Username</label>
                <input
                  type="text"
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isLoading}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="demo-info">
              <p><strong>Demo Credentials:</strong></p>
              <p className="demo-text">Username & Password auto-fill based on selected role</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
