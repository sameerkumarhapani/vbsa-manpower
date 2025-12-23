import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Edit2, Plus, Filter, X, Camera, Check, AlertCircle, Send, Upload, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';

const UsersView = () => {
  const { getVisibleUsers, user, users, syncUserStatusesWithVendors, addUsers, vendors } = useAuth();
  const allUsers = useMemo(() => getVisibleUsers(), [getVisibleUsers, users]);
  
  // Get emergency onboarding config
  const { emergencyOnboardingConfig } = useConfig();
  
  // Dummy emergency users for demonstration
  const dummyEmergencyUsers = useMemo(() => [
    {
      id: 'emer-1',
      userId: 'EMR-001',
      fullName: 'Rajesh Kumar (Emergency)',
      role: 'CCTV Technician',
      vendorName: 'Tech Solutions Inc',
      mobile: '9876543210',
      mobileVerified: false,
      faceRegistered: false,
      status: 'Active',
      isEmergency: true,
      emergencyCreatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // Created 5 hours ago
      emergencyExpiresAt: new Date(Date.now() + (emergencyOnboardingConfig.accountValidityHours - 5) * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'emer-2',
      userId: 'EMR-002',
      fullName: 'Priya Sharma (Emergency)',
      role: 'Biometric Operator',
      vendorName: 'BioMetrics India',
      mobile: '9876543211',
      mobileVerified: false,
      faceRegistered: false,
      status: 'Active',
      isEmergency: true,
      emergencyCreatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Created 2 hours ago
      emergencyExpiresAt: new Date(Date.now() + (emergencyOnboardingConfig.accountValidityHours - 2) * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'emer-3',
      userId: 'EMR-003',
      fullName: 'Amit Patel (Emergency)',
      role: 'Network Administrator',
      vendorName: 'Network Services Ltd',
      mobile: '9876543212',
      mobileVerified: false,
      faceRegistered: false,
      status: 'Active',
      isEmergency: true,
      emergencyCreatedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // Created 22 hours ago
      emergencyExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // Expires in 2 hours
    }
  ], [emergencyOnboardingConfig.accountValidityHours]);
  
  // Combine regular users with emergency users
  const combinedUsers = useMemo(() => {
    return [...allUsers, ...dummyEmergencyUsers];
  }, [allUsers, dummyEmergencyUsers]);
  
  // Sync user statuses with vendor statuses on mount
  useEffect(() => {
    syncUserStatusesWithVendors();
  }, [syncUserStatusesWithVendors]);
  
  // State management
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showModalSuccess, setShowModalSuccess] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedUserForVerification, setSelectedUserForVerification] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkVerificationSuccess, setShowBulkVerificationSuccess] = useState(false);
  const [bulkVerificationCount, setBulkVerificationCount] = useState(0);
  const [filterRole, setFilterRole] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMobileVerified, setFilterMobileVerified] = useState('');
  const [filterFaceRegistered, setFilterFaceRegistered] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  
  // Bulk upload state
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [bulkUploadError, setBulkUploadError] = useState('');
  const [bulkUploadSuccess, setBulkUploadSuccess] = useState('');
  const fileInputRef = useRef(null);
  
  // State to trigger re-render for countdown timers
  const [, setTimerTick] = useState(0);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNo: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    aadharNo: '',
    role: '',
    vendorName: '',
    facePhoto: null,
    mobileVerified: false,
    faceRegistered: false,
    status: 'Active',
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    mobileNo: '',
    aadharNo: '',
    pinCode: '',
  });
  
  // Update countdown timers every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerTick(prev => prev + 1);
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Get unique roles and vendors from users
  const uniqueRoles = useMemo(() => {
    const roles = new Set(allUsers.map(u => u.role));
    return Array.from(roles).sort();
  }, [allUsers]);

  const uniqueVendors = useMemo(() => {
    const vendors = new Set(allUsers.map(u => u.vendorName).filter(Boolean));
    return Array.from(vendors).sort();
  }, [allUsers]);

  const statuses = ['Active', 'Inactive'];

  // Get configured user roles from ConfigContext
  const { userRoles: configuredUserRoles } = useConfig();
  const configuredRoleNames = useMemo(() => 
    configuredUserRoles.map(r => r.roleName), 
    [configuredUserRoles]
  );
  
  // Merge configured roles with any existing user roles not present in configuration
  const userRoles = useMemo(() => {
    const existingRoles = Array.from(new Set(allUsers.map(u => u.role).filter(Boolean)));
    const merged = Array.from(new Set([...configuredRoleNames, ...existingRoles]));
    return merged.sort();
  }, [configuredRoleNames, allUsers]);

  // Filter users based on selected filters
  const filteredUsers = useMemo(() => {
    const filtered = combinedUsers.filter((user) => {
      const roleMatch = !filterRole || user.role === filterRole;
      const vendorMatch = !filterVendor || user.vendorName === filterVendor;
      const statusMatch = !filterStatus || user.status === filterStatus;
      const mobileVerifiedMatch = !filterMobileVerified || (filterMobileVerified === 'verified' ? user.mobileVerified : !user.mobileVerified);
      const faceRegisteredMatch = !filterFaceRegistered || (filterFaceRegistered === 'registered' ? user.faceRegistered : !user.faceRegistered);
      return roleMatch && vendorMatch && statusMatch && mobileVerifiedMatch && faceRegisteredMatch;
    });

    // Sort users by verification status
    // Priority 1: Both mobile not verified AND face not registered
    // Priority 2: Either mobile not verified OR face not registered (but not both)
    // Priority 3: Both verified and registered
    return filtered.sort((a, b) => {
      const aNotVerified = !a.mobileVerified;
      const aNotRegistered = !a.faceRegistered;
      const bNotVerified = !b.mobileVerified;
      const bNotRegistered = !b.faceRegistered;

      // Calculate priority scores (lower score = higher priority)
      const aScore = (aNotVerified && aNotRegistered) ? 0 : (aNotVerified || aNotRegistered) ? 1 : 2;
      const bScore = (bNotVerified && bNotRegistered) ? 0 : (bNotVerified || bNotRegistered) ? 1 : 2;

      return aScore - bScore;
    });
  }, [allUsers, filterRole, filterVendor, filterStatus, filterMobileVerified, filterFaceRegistered]);

  // Helper function to calculate time remaining for emergency users
  const getTimeRemaining = useCallback((expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) return { text: 'Expired', color: '#dc2626', urgent: true };
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let color = '#22c55e'; // green
    let urgent = false;
    
    if (hours < 2) {
      color = '#dc2626'; // red
      urgent = true;
    } else if (hours < 6) {
      color = '#f59e0b'; // orange
    } else if (hours < 12) {
      color = '#eab308'; // yellow
    }
    
    if (hours >= 1) {
      return { text: `${hours}h ${minutes}m left`, color, urgent };
    } else {
      return { text: `${minutes}m left`, color, urgent };
    }
  }, []);

  // Get users who need verification (mobile not verified OR face not registered)
  const usersNeedingVerification = useMemo(() => {
    return filteredUsers.filter(user => !user.mobileVerified || !user.faceRegistered);
  }, [filteredUsers]);

  // Handle select all for users needing verification
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all users who need verification
      setSelectedUsers(usersNeedingVerification.map(user => user.id));
    } else {
      // Deselect all
      setSelectedUsers([]);
    }
  };

  // Handle individual user selection
  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Handle bulk verification
  const handleBulkVerification = () => {
    if (selectedUsers.length === 0) return;
    
    // Store count and show success modal
    setBulkVerificationCount(selectedUsers.length);
    setShowBulkVerificationSuccess(true);
    
    // Clear selection
    setSelectedUsers([]);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      mobileNo: user.mobile || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      pinCode: user.pinCode || '',
      aadharNo: user.aadharNo || '',
      role: user.role || '',
      vendorName: user.vendorName || '',
      facePhoto: user.facePhoto || null,
      mobileVerified: user.mobileVerified || false,
      faceRegistered: user.faceRegistered || false,
      status: user.status || 'Active',
    });
    if (user.facePhoto) {
      setCapturedPhoto(user.facePhoto);
    }
    setValidationErrors({
      email: '',
      mobileNo: '',
      aadharNo: '',
      pinCode: '',
    });
    setShowUserModal(true);
  };

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateMobileNo = (mobile) => {
    if (!mobile) return '';
    if (mobile.length < 10) {
      return 'Mobile number must be 10 digits';
    }
    // Only allow 8169204566
    if (mobile !== '8169204566') {
      return 'Mobile no. already exist! Please enter another no.';
    }
    return '';
  };

  const validateAadharNo = (aadhar) => {
    if (!aadhar) return '';
    if (aadhar.length < 12) {
      return 'Aadhar number must be 12 digits';
    }
    return '';
  };

  // Auto-fill form when specific Aadhar is entered
  const handleAadharChange = (value) => {
    handleInputChange('aadharNo', value);
    
    // If Aadhar is 178217821782, auto-fill the form with dummy data
    if (value === '178217821782') {
      setFormData(prev => ({
        ...prev,
        aadharNo: value,
        fullName: 'Rajesh Kumar Singh',
        email: 'rajesh.kumar@example.com',
        mobileNo: '8169204566',
        address: '123 MG Road, Near City Mall',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        role: 'CCTV Technician',
        vendorName: uniqueVendors[0] || '',
      }));
      // Clear validation errors for auto-filled fields
      setValidationErrors({
        email: '',
        mobileNo: '',
        aadharNo: '',
        pinCode: '',
      });
    }
  };

  const validatePinCode = (pinCode) => {
    if (!pinCode) return '';
    if (pinCode.length < 6) {
      return 'Pin code must be 6 digits';
    }
    return '';
  };

  // Handle input changes with validation
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Validate on change
    let error = '';
    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'mobileNo':
        error = validateMobileNo(value);
        break;
      case 'aadharNo':
        error = validateAadharNo(value);
        break;
      case 'pinCode':
        error = validatePinCode(value);
        break;
      default:
        break;
    }
    setValidationErrors({ ...validationErrors, [field]: error });
  };

  // Get vendor names for dropdown
  const vendorNames = useMemo(() => {
    return vendors.filter(v => v.status === 'Active').map(v => v.name || v.vendorName);
  }, [vendors]);

  // Download CSV template for bulk upload
  const downloadTemplate = () => {
    const headers = [
      'Full Name',
      'Email',
      'Mobile No',
      'Address',
      'City',
      'State',
      'Pin Code',
      'Aadhar No',
      'Role',
      'Partner Organization',
      'Status (Active/Inactive)'
    ];
    
    const sampleRow = [
      'John Doe',
      'john.doe@example.com',
      '9876543210',
      '123 Main Street, Near Park',
      'Mumbai',
      'Maharashtra',
      '400001',
      '123456789012',
      'CCTV Technician',
      vendorNames[0] || 'Partner Organization Name',
      'Active'
    ];
    
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'user_bulk_upload_template.csv';
    link.click();
  };

  // Handle bulk upload file selection
  const handleBulkFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setBulkUploadError('Please upload a CSV or Excel file');
        setBulkUploadFile(null);
        return;
      }
      setBulkUploadFile(file);
      setBulkUploadError('');
    }
  };

  // Process bulk upload
  const handleBulkUpload = () => {
    if (!bulkUploadFile) {
      setBulkUploadError('Please select a file to upload');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setBulkUploadError('File must contain header row and at least one data row');
          return;
        }

        const newUsers = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
          // Handle CSV parsing with potential commas in quoted fields
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          
          if (values.length < 10) {
            errors.push(`Row ${i + 1}: Incomplete data (expected at least 10 columns)`);
            continue;
          }

          const userData = {
            id: `user-bulk-${Date.now()}-${i}`,
            fullName: values[0],
            email: values[1],
            mobile: values[2],
            address: values[3],
            city: values[4],
            state: values[5],
            pinCode: values[6],
            aadharNo: values[7],
            role: values[8],
            vendorName: values[9],
            status: values[10] || 'Active',
            mobileVerified: false,
            faceRegistered: false,
          };

          // Basic validation
          if (!userData.fullName) {
            errors.push(`Row ${i + 1}: Full name is required`);
            continue;
          }
          if (!userData.mobile || userData.mobile.length !== 10) {
            errors.push(`Row ${i + 1}: Valid 10-digit mobile number is required`);
            continue;
          }
          if (!userData.role) {
            errors.push(`Row ${i + 1}: Role is required`);
            continue;
          }

          newUsers.push(userData);
        }

        if (newUsers.length > 0) {
          addUsers(newUsers);
          setBulkUploadSuccess(`Successfully uploaded ${newUsers.length} user(s)${errors.length > 0 ? `. ${errors.length} row(s) had errors.` : ''}`);
          setBulkUploadFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          setBulkUploadError('No valid data found in the file');
        }

        if (errors.length > 0 && newUsers.length === 0) {
          setBulkUploadError(errors.slice(0, 3).join('; ') + (errors.length > 3 ? `... and ${errors.length - 3} more errors` : ''));
        } else if (errors.length > 0) {
          setBulkUploadError(errors.slice(0, 3).join('; ') + (errors.length > 3 ? `... and ${errors.length - 3} more errors` : ''));
        }
      } catch (err) {
        setBulkUploadError('Error parsing file: ' + err.message);
      }
    };
    reader.readAsText(bulkUploadFile);
  };

  return (
    <div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
      
      <div className="page-header">
        <h1 className="page-title">Users Management</h1>
        <p className="page-subtitle">Manage users under your organization</p>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">
            All Users ({filteredUsers.length}) - {user?.role}
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {selectedUsers.length > 0 && (
              <button
                onClick={handleBulkVerification}
                style={{
                  padding: '10px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#059669';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#10b981';
                }}
              >
                <Send size={16} />
                Send Verification Links ({selectedUsers.length})
              </button>
            )}
            <button 
              onClick={() => setShowFilterModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: '1px solid #e5e7eb',
                background: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#f9fafb';
                e.target.style.borderColor = '#d1d5db';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#e5e7eb';
              }}
            >
              <Filter size={16} />
              Filter
              {(filterRole || filterVendor || filterStatus || filterMobileVerified || filterFaceRegistered) && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                    background: 'var(--color-primary)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 700,
                }}>
                  {(filterRole ? 1 : 0) + (filterVendor ? 1 : 0) + (filterStatus ? 1 : 0) + (filterMobileVerified ? 1 : 0) + (filterFaceRegistered ? 1 : 0)}
                </span>
              )}
            </button>
            <button 
              onClick={() => { setShowBulkUploadModal(true); setBulkUploadError(''); setBulkUploadSuccess(''); setBulkUploadFile(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: '1px solid #e5e7eb',
                background: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              <Upload size={16} />
              Bulk Upload
            </button>
            <button 
              onClick={() => setShowUserModal(true)}
              className="btn-primary"
            >
              <Plus size={16} style={{ marginRight: '8px' }} />
              Add User
            </button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <p style={{ color: '#6b7280', fontSize: '14px' }}>No users found for your role</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={usersNeedingVerification.length > 0 && selectedUsers.length === usersNeedingVerification.length}
                    onChange={handleSelectAll}
                    disabled={usersNeedingVerification.length === 0}
                    style={{ cursor: usersNeedingVerification.length === 0 ? 'not-allowed' : 'pointer' }}
                    title={usersNeedingVerification.length === 0 ? 'No users need verification' : 'Select all users needing verification'}
                  />
                </th>
                <th>User ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Vendor Organization</th>
                <th>Mobile No.</th>
                <th>Verification Status</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const needsVerification = !user.mobileVerified || !user.faceRegistered;
                return (
                <tr key={user.id}>
                  <td style={{ width: '40px' }}>
                    {needsVerification ? (
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>-</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#6366f1', background: '#eef2ff', padding: '4px 8px', borderRadius: '4px' }}>
                      {user.userId || '-'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <strong>{user.fullName}</strong>
                      {user.isEmergency && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fbbf24',
                              display: 'inline-block'
                            }}
                          >
                            Emergency Onboarded
                          </span>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: getTimeRemaining(user.emergencyExpiresAt).color + '20',
                              color: getTimeRemaining(user.emergencyExpiresAt).color,
                              border: `1px solid ${getTimeRemaining(user.emergencyExpiresAt).color}`,
                              display: 'inline-block',
                              animation: getTimeRemaining(user.emergencyExpiresAt).urgent ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                            }}
                          >
                            ⏰ {getTimeRemaining(user.emergencyExpiresAt).text}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: '#f0f4ff',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#374151' }}>
                      {user.vendorName || '-'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#374151' }}>
                      {user.mobile ? `+91-${user.mobile}` : '-'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        {user.mobileVerified ? (
                          <>
                            <Check size={14} style={{ color: '#059669' }} />
                            <span style={{ color: '#059669', fontWeight: 500 }}>Mobile Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} style={{ color: '#dc2626' }} />
                            <span style={{ color: '#dc2626', fontWeight: 500 }}>Mobile Not Verified</span>
                          </>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        {user.faceRegistered ? (
                          <>
                            <Check size={14} style={{ color: '#059669' }} />
                            <span style={{ color: '#059669', fontWeight: 500 }}>Face Registered</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} style={{ color: '#dc2626' }} />
                            <span style={{ color: '#dc2626', fontWeight: 500 }}>Face Not Registered</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: (user.status === 'Active' || !user.status) ? '#d1fae5' : '#fee2e2',
                        color: (user.status === 'Active' || !user.status) ? '#059669' : '#dc2626',
                      }}
                    >
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {!user.isEmergency && (
                        <>
                          <button
                            onClick={() => handleEditUser(user)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--color-primary)',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Edit User"
                          >
                            <Edit2 size={16} />
                          </button>
                          {(!user.mobileVerified || !user.faceRegistered) && (
                            <button
                              onClick={() => {
                                setSelectedUserForVerification(user);
                                setShowVerificationModal(true);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#10b981',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title="Send Verification Link"
                            >
                              <Send size={16} />
                            </button>
                          )}
                        </>
                      )}
                      {user.isEmergency && (
                        <button
                          onClick={() => {
                            setSelectedUserForVerification(user);
                            setShowVerificationModal(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: '#6366f1',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#4f46e5'}
                          onMouseLeave={(e) => e.target.style.background = '#6366f1'}
                          title="Convert emergency user to permanent account"
                        >
                          <Send size={14} />
                          Convert to Permanent
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
          onClick={() => setShowFilterModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '85vh',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                background: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={20} />
                Filter Users
              </h2>
              <button
                onClick={() => setShowFilterModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: '#6b7280',
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ 
              padding: '24px', 
              overflowY: 'auto', 
              flex: 1,
              minHeight: 0,
            }}>
              {/* Role Filter */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#1f2937' }}>Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb), 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Vendor Organization Filter */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#1f2937' }}>Vendor Organization</label>
                <select
                  value={filterVendor}
                  onChange={(e) => setFilterVendor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb), 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">All Vendors</option>
                  {uniqueVendors.map((vendor) => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#1f2937' }}>Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb), 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">All Status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Mobile Verification Filter */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#1f2937' }}>Mobile Verification</label>
                <select
                  value={filterMobileVerified}
                  onChange={(e) => setFilterMobileVerified(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb), 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">All</option>
                  <option value="verified">Verified</option>
                  <option value="not-verified">Not Verified</option>
                </select>
              </div>

              {/* Face Registration Filter */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#1f2937' }}>Face Registration</label>
                <select
                  value={filterFaceRegistered}
                  onChange={(e) => setFilterFaceRegistered(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb), 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">All</option>
                  <option value="registered">Registered</option>
                  <option value="not-registered">Not Registered</option>
                </select>
              </div>

              {/* Active Filters Display */}
              {(filterRole || filterVendor || filterStatus || filterMobileVerified || filterFaceRegistered) && (
                <div style={{
                  padding: '12px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  marginBottom: '20px',
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>Active Filters:</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {filterRole && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}>
                        {filterRole}
                        <button
                          onClick={() => setFilterRole('')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0',
                          }}
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filterVendor && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}>
                        {filterVendor}
                        <button
                          onClick={() => setFilterVendor('')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0',
                          }}
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filterStatus && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}>
                        {filterStatus}
                        <button
                          onClick={() => setFilterStatus('')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0',
                          }}
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filterMobileVerified && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        background: 'var(--color-primary-2)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}>
                        Mobile: {filterMobileVerified === 'verified' ? 'Verified' : 'Not Verified'}
                        <button
                          onClick={() => setFilterMobileVerified('')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0',
                          }}
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filterFaceRegistered && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        background: '#ec4899',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}>
                        Face: {filterFaceRegistered === 'registered' ? 'Registered' : 'Not Registered'}
                        <button
                          onClick={() => setFilterFaceRegistered('')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0',
                          }}
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                padding: '16px 24px',
                borderTop: '1px solid #e5e7eb',
                background: '#f9fafb',
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setFilterRole('');
                  setFilterVendor('');
                  setFilterStatus('');
                  setFilterMobileVerified('');
                  setFilterFaceRegistered('');
                }}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f3f4f6';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'white';
                }}
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 20px rgba(var(--color-primary-rgb), 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showUserModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            overflowY: 'auto',
            padding: '20px',
          }}
          onClick={() => {
            setShowUserModal(false);
            setEditingUser(null);
            setFormData({
              fullName: '',
              email: '',
              mobileNo: '',
              address: '',
              city: '',
              state: '',
              pinCode: '',
              aadharNo: '',
              role: '',
              vendorName: '',
              facePhoto: null,
              mobileVerified: false,
              faceRegistered: false,
              status: 'Active',
            });
            setValidationErrors({
              email: '',
              mobileNo: '',
              aadharNo: '',
              pinCode: '',
            });
            setCapturedPhoto(null);
            setCameraActive(false);
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '700px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              maxHeight: '90vh',
              overflowY: 'auto',
              margin: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                background: 'white',
                position: 'sticky',
                top: 0,
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{editingUser ? 'Edit User' : 'Create New User'}</h2>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                  setFormData({
                    fullName: '',
                    email: '',
                    mobileNo: '',
                    address: '',
                    city: '',
                    state: '',
                    pinCode: '',
                    aadharNo: '',
                    role: '',
                    vendorName: '',
                    facePhoto: null,
                    mobileVerified: false,
                    faceRegistered: false,
                    status: 'Active',
                  });
                  setValidationErrors({
                    email: '',
                    mobileNo: '',
                    aadharNo: '',
                    pinCode: '',
                  });
                  setCapturedPhoto(null);
                  setCameraActive(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: '#6b7280',
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Success Message */}
              {showModalSuccess && (
                <div
                  style={{
                    marginBottom: '24px',
                    padding: '16px',
                    background: modalSuccessMessage.includes('fix all validation') || modalSuccessMessage.includes('fill all required') ? '#fee2e2' : '#d1fae5',
                    border: `1px solid ${modalSuccessMessage.includes('fix all validation') || modalSuccessMessage.includes('fill all required') ? '#fca5a5' : '#6ee7b7'}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  {modalSuccessMessage.includes('fix all validation') || modalSuccessMessage.includes('fill all required') ? (
                    <AlertCircle size={20} style={{ color: '#dc2626', marginTop: '2px', flexShrink: 0 }} />
                  ) : (
                    <Check size={20} style={{ color: '#059669', marginTop: '2px', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: modalSuccessMessage.includes('fix all validation') || modalSuccessMessage.includes('fill all required') ? '#dc2626' : '#059669' 
                    }}>
                      {modalSuccessMessage.includes('fix all validation') || modalSuccessMessage.includes('fill all required') ? 'Error!' : 'Success!'}
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '13px', 
                      color: modalSuccessMessage.includes('fix all validation') || modalSuccessMessage.includes('fill all required') ? '#991b1b' : '#047857' 
                    }}>
                      {modalSuccessMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Basic Details Section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: '#1f2937' }}>Basic Details</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Email ID *</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${validationErrors.email ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {validationErrors.email && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Mobile No. *</label>
                    <input
                      type="tel"
                      placeholder="Enter 10 digit mobile"
                      value={formData.mobileNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleInputChange('mobileNo', value);
                      }}
                      maxLength="10"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${validationErrors.mobileNo ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {validationErrors.mobileNo && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>
                        {validationErrors.mobileNo}
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Aadhar No. *</label>
                    <input
                      type="text"
                      placeholder="Enter 12 digit aadhar"
                      value={formData.aadharNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                        handleAadharChange(value);
                      }}
                      maxLength="12"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${validationErrors.aadharNo ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {validationErrors.aadharNo && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>
                        {validationErrors.aadharNo}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Address *</label>
                  <input
                    type="text"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>City *</label>
                    <input
                      type="text"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>State *</label>
                    <input
                      type="text"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Pin Code *</label>
                    <input
                      type="text"
                      placeholder="Enter pin code"
                      value={formData.pinCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        handleInputChange('pinCode', value);
                      }}
                      maxLength="6"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${validationErrors.pinCode ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {validationErrors.pinCode && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>
                        {validationErrors.pinCode}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">Select Role</option>
                      {userRoles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Vendor Organization *</label>
                    <select
                      value={formData.vendorName}
                      onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">Select Vendor</option>
                      {uniqueVendors.map((vendor) => (
                        <option key={vendor} value={vendor}>{vendor}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {editingUser && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Status</label>
                      <select
                        value={formData.status || 'Active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div></div>
                  </div>
                )}
              </div>

              {/* Face Capture Section */}
              <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: '#1f2937' }}>Face Registration *</h3>
                
                {!cameraActive ? (
                  <div style={{ textAlign: 'center' }}>
                    {capturedPhoto ? (
                      <div>
                        <img
                          src={capturedPhoto}
                          alt="Captured"
                          style={{
                            maxWidth: '200px',
                            height: '200px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            marginBottom: '16px',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                          <button
                            onClick={() => setCameraActive(true)}
                            style={{
                              padding: '10px 20px',
                              border: '1px solid #e5e7eb',
                              background: 'white',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#374151',
                            }}
                          >
                            Retake Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCameraActive(true)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '16px 24px',
                          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600,
                          marginLeft: 'auto',
                          marginRight: 'auto',
                        }}
                      >
                        <Camera size={18} />
                        Capture Face
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{
                    position: 'relative',
                    background: '#000',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                  }}>
                    <button
                      onClick={() => setShowVerificationModal(false)}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Close
                    </button>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '200px',
                      height: '200px',
                      border: '3px solid #fff',
                      borderRadius: '50%',
                      boxShadow: 'inset 0 0 0 100px rgba(0, 0, 0, 0.3)',
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '12px',
                    }}>
                      <button
                        onClick={() => {
                          const video = document.querySelector('video');
                          const canvas = document.createElement('canvas');
                          canvas.width = video.videoWidth;
                          canvas.height = video.videoHeight;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(video, 0, 0);
                          setCapturedPhoto(canvas.toDataURL('image/jpeg'));
                          setCameraActive(false);
                          // Stop camera stream
                          if (video.srcObject) {
                            video.srcObject.getTracks().forEach(track => track.stop());
                          }
                          setFormData({ ...formData, facePhoto: canvas.toDataURL('image/jpeg'), faceRegistered: true });
                        }}
                        style={{
                          padding: '10px 24px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        Capture
                      </button>
                      <button
                        onClick={() => {
                          setCameraActive(false);
                          // Stop camera stream
                          const video = document.querySelector('video');
                          if (video && video.srcObject) {
                            video.srcObject.getTracks().forEach(track => track.stop());
                          }
                        }}
                        style={{
                          padding: '10px 24px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
                  Live face capture for attendance verification
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                padding: '16px 24px',
                borderTop: '1px solid #e5e7eb',
                background: '#f9fafb',
                position: 'sticky',
                bottom: 0,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                  setFormData({
                    fullName: '',
                    email: '',
                    mobileNo: '',
                    address: '',
                    city: '',
                    state: '',
                    pinCode: '',
                    aadharNo: '',
                    role: '',
                    vendorName: '',
                    facePhoto: null,
                    mobileVerified: false,
                    faceRegistered: false,
                    status: 'Active',
                  });
                  setValidationErrors({
                    email: '',
                    mobileNo: '',
                    aadharNo: '',
                    pinCode: '',
                  });
                  setCapturedPhoto(null);
                  setCameraActive(false);
                }}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  transition: 'all 0.3s ease',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  // Check for validation errors
                  if (validationErrors.email || validationErrors.mobileNo || 
                      validationErrors.aadharNo || validationErrors.pinCode) {
                    setModalSuccessMessage('Please fix all validation errors before submitting');
                    setShowModalSuccess(true);
                    setTimeout(() => setShowModalSuccess(false), 3000);
                    return;
                  }
                  
                  if (!formData.fullName || !formData.email || !formData.mobileNo || !formData.address || 
                      !formData.city || !formData.state || !formData.pinCode || !formData.aadharNo || 
                      !formData.role || !formData.vendorName || !capturedPhoto) {
                    setModalSuccessMessage('Please fill all required fields and capture face photo');
                    setShowModalSuccess(true);
                    setTimeout(() => setShowModalSuccess(false), 3000);
                    return;
                  }
                  
                  // Show success message in modal
                  if (editingUser) {
                    setModalSuccessMessage(`User account updated successfully! Changes have been saved for ${formData.fullName}.`);
                  } else {
                    setModalSuccessMessage(`User account created successfully! A verification link has been sent to +91-${formData.mobileNo}. User needs to verify mobile and register face before first login.`);
                  }
                  setShowModalSuccess(true);
                  
                  // Reset form and close modal after showing success message
                  setTimeout(() => {
                    setShowUserModal(false);
                    setShowModalSuccess(false);
                    setEditingUser(null);
                    setFormData({
                      fullName: '',
                      email: '',
                      mobileNo: '',
                      address: '',
                      city: '',
                      state: '',
                      pinCode: '',
                      aadharNo: '',
                      role: '',
                      vendorName: '',
                      facePhoto: null,
                      mobileVerified: false,
                      faceRegistered: false,
                      status: 'Active',
                    });
                    setValidationErrors({
                      email: '',
                      mobileNo: '',
                      aadharNo: '',
                      pinCode: '',
                    });
                    setCapturedPhoto(null);
                    setCameraActive(false);
                  }, 2000);
                }}
                disabled={validationErrors.mobileNo || validationErrors.aadharNo || validationErrors.email || validationErrors.pinCode}
                style={{
                  padding: '10px 20px',
                  background: (validationErrors.mobileNo || validationErrors.aadharNo || validationErrors.email || validationErrors.pinCode) 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (validationErrors.mobileNo || validationErrors.aadharNo || validationErrors.email || validationErrors.pinCode) 
                    ? 'not-allowed' 
                    : 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  opacity: (validationErrors.mobileNo || validationErrors.aadharNo || validationErrors.email || validationErrors.pinCode) 
                    ? 0.6 
                    : 1,
                }}
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Link Modal */}
      {showVerificationModal && selectedUserForVerification && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
          onClick={() => {
            setShowVerificationModal(false);
            setSelectedUserForVerification(null);
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              padding: '0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={20} style={{ color: selectedUserForVerification.isEmergency ? '#6366f1' : '#10b981' }} />
                {selectedUserForVerification.isEmergency ? 'Convert to Permanent Account' : 'Send Verification Link'}
              </h2>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setSelectedUserForVerification(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: '#6b7280',
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {selectedUserForVerification.isEmergency && (
                <div
                  style={{
                    padding: '16px',
                    background: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <AlertCircle size={20} style={{ color: '#92400e', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#92400e' }}>
                      Emergency Onboarded User
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#78350f' }}>
                      This user was onboarded using emergency access. Time remaining: <strong>{getTimeRemaining(selectedUserForVerification.emergencyExpiresAt).text}</strong>
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#78350f', fontWeight: 600 }}>
                      Converting to permanent will send mobile and face verification links.
                    </p>
                  </div>
                </div>
              )}
              
              <div
                style={{
                  padding: '16px',
                  background: '#d1fae5',
                  border: '1px solid #6ee7b7',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <Check size={20} style={{ color: '#059669', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#059669' }}>
                    {selectedUserForVerification.isEmergency ? 'Conversion Link Will Be Sent!' : 'Verification Link Sent Successfully!'}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                    A verification link {selectedUserForVerification.isEmergency ? 'will be' : 'has been'} sent to <strong>{selectedUserForVerification.fullName}</strong>'s mobile number <strong>+91-{selectedUserForVerification.mobile}</strong> via SMS and WhatsApp.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>
                  Verification Details:
                </h3>
                <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                  <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>User Name:</span>
                    {selectedUserForVerification.fullName}
                  </p>
                  <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>Mobile No.:</span>
                    +91-{selectedUserForVerification.mobile}
                  </p>
                  <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>Role:</span>
                    {selectedUserForVerification.role}
                  </p>
                  <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>Status:</span>
                    {!selectedUserForVerification.mobileVerified && !selectedUserForVerification.faceRegistered ? (
                      <span style={{ color: '#dc2626', fontWeight: 500 }}>Mobile & Face verification pending</span>
                    ) : !selectedUserForVerification.mobileVerified ? (
                      <span style={{ color: '#dc2626', fontWeight: 500 }}>Mobile verification pending</span>
                    ) : !selectedUserForVerification.faceRegistered ? (
                      <span style={{ color: '#dc2626', fontWeight: 500 }}>Face registration pending</span>
                    ) : (
                      <span style={{ color: '#059669', fontWeight: 500 }}>All verified</span>
                    )}
                  </p>
                </div>
              </div>

              <div style={{ 
                padding: '12px', 
                background: '#f0f9ff', 
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#0369a1'
              }}>
                <strong>Note:</strong> The user will receive a link to verify their mobile number and register their face for biometric authentication.
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '16px 24px',
                borderTop: '1px solid #e5e7eb',
                background: '#f9fafb',
              }}
            >
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setSelectedUserForVerification(null);
                }}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Verification Success Modal */}
      {showBulkVerificationSuccess && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
          onClick={() => setShowBulkVerificationSuccess(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              padding: '0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={20} style={{ color: '#10b981' }} />
                Verification Links Sent
              </h2>
              <button
                onClick={() => setShowBulkVerificationSuccess(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: '#6b7280',
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  padding: '16px',
                  background: '#d1fae5',
                  border: '1px solid #6ee7b7',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <Check size={20} style={{ color: '#059669', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#059669' }}>
                    Success!
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                    Verification links have been sent successfully to <strong>{bulkVerificationCount} user(s)</strong> via SMS and WhatsApp.
                  </p>
                </div>
              </div>

              <div style={{ 
                padding: '12px', 
                background: '#f0f9ff', 
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#0369a1'
              }}>
                <strong>Note:</strong> Users will receive a link to verify their mobile number and register their face for biometric authentication.
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '16px 24px',
                borderTop: '1px solid #e5e7eb',
                background: '#f9fafb',
              }}
            >
              <button
                onClick={() => setShowBulkVerificationSuccess(false)}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowBulkUploadModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '500px',
              maxWidth: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Bulk Upload Users</h2>
              <button
                onClick={() => setShowBulkUploadModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                Upload a CSV file with user data. Download the template to see the required format.
              </p>
              
              <button
                onClick={downloadTemplate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  border: '1px solid var(--color-primary)',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  marginBottom: '20px',
                }}
              >
                <Download size={16} />
                Download Template
              </button>

              <div
                style={{
                  border: '2px dashed #e5e7eb',
                  borderRadius: '8px',
                  padding: '30px',
                  textAlign: 'center',
                  background: '#f9fafb',
                  cursor: 'pointer',
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={40} color="#9ca3af" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px 0' }}>
                  {bulkUploadFile ? bulkUploadFile.name : 'Click to select file or drag and drop'}
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  Supported formats: CSV
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleBulkFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {bulkUploadError && (
                <div style={{ marginTop: '12px', padding: '10px', background: '#fef2f2', borderRadius: '6px', color: '#dc2626', fontSize: '13px' }}>
                  {bulkUploadError}
                </div>
              )}

              {bulkUploadSuccess && (
                <div style={{ marginTop: '12px', padding: '10px', background: '#f0fdf4', borderRadius: '6px', color: '#059669', fontSize: '13px' }}>
                  {bulkUploadSuccess}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowBulkUploadModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={!bulkUploadFile}
                style={{
                  padding: '10px 20px',
                  background: bulkUploadFile ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)' : '#e5e7eb',
                  color: bulkUploadFile ? 'white' : '#9ca3af',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: bulkUploadFile ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Upload & Import
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default UsersView;
