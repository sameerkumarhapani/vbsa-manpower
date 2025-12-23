import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext';

const ConfigurationView = () => {
  const { 
    masterUserRoleTypes, 
    userRoles, 
    addUserRole, 
    updateUserRole, 
    deleteUserRole,
    masterDeviceTypes,
    deviceRatios,
    addDeviceRatio,
    updateDeviceRatio,
    deleteDeviceRatio,
    emergencyOnboardingConfig,
    updateEmergencyOnboardingConfig,
    checklistConfig,
    updateChecklistConfig,
  } = useConfig();

  const [activeTab, setActiveTab] = useState('manpower');
  
  const [formData, setFormData] = useState({
    roleName: '',
    ratioType: 'candidate',
    ratioValue: ''
  });

  const [deviceFormData, setDeviceFormData] = useState({
    deviceName: '',
    deviceCount: '',
    candidateCount: ''
  });

  const [emergencyConfigForm, setEmergencyConfigForm] = useState({
    enableBeforeSessionHours: emergencyOnboardingConfig.enableBeforeSessionHours,
    accountValidityHours: emergencyOnboardingConfig.accountValidityHours,
    attendanceCaptureBeforeSessionHours: emergencyOnboardingConfig.attendanceCaptureBeforeSessionHours || 2
  });

  const [checklistConfigForm, setChecklistConfigForm] = useState({
    checklist1: {
      enableBeforeSessionHours: checklistConfig.checklist1.enableBeforeSessionHours,
      disableAfterSessionHours: checklistConfig.checklist1.disableAfterSessionHours,
    },
    checklist2: {
      enableBeforeSessionHours: checklistConfig.checklist2.enableBeforeSessionHours,
      disableAfterSessionHours: checklistConfig.checklist2.disableAfterSessionHours,
    },
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [editDeviceData, setEditDeviceData] = useState({});

  // Get available roles (master list excluding already configured roles)
  const availableRoles = masterUserRoleTypes.filter(
    roleType => !userRoles.some(role => role.roleName === roleType)
  );
  
  // Get available devices (master list excluding already configured devices)
  const availableDevices = masterDeviceTypes.filter(
    deviceType => !deviceRatios.some(device => device.deviceName === deviceType)
  );

  const handleAddRole = () => {
    if (!formData.roleName || !formData.ratioValue) {
      alert('Please fill in all fields');
      return;
    }

    addUserRole(formData.roleName, formData.ratioType, parseInt(formData.ratioValue));
    setFormData({ roleName: '', ratioType: 'candidate', ratioValue: '' });
  };
  
  const handleAddDevice = () => {
    if (!deviceFormData.deviceName || !deviceFormData.deviceCount || !deviceFormData.candidateCount) {
      alert('Please fill in all required fields');
      return;
    }

    addDeviceRatio(
      deviceFormData.deviceName, 
      parseInt(deviceFormData.deviceCount), 
      parseInt(deviceFormData.candidateCount)
    );
    setDeviceFormData({ deviceName: '', deviceCount: '', candidateCount: '' });
  };

  const handleEdit = (role) => {
    setEditingId(role.id);
    setEditData({ ...role });
  };

  const handleSaveEdit = () => {
    updateUserRole(editingId, editData);
    setEditingId(null);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteUserRole(id);
    }
  };
  
  const handleEditDevice = (device) => {
    setEditingDeviceId(device.id);
    setEditDeviceData({ ...device });
  };

  const handleSaveDeviceEdit = () => {
    updateDeviceRatio(editingDeviceId, editDeviceData);
    setEditingDeviceId(null);
    setEditDeviceData({});
  };

  const handleCancelDeviceEdit = () => {
    setEditingDeviceId(null);
    setEditDeviceData({});
  };

  const handleDeleteDevice = (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      deleteDeviceRatio(id);
    }
  };

  const formatRatioDisplay = (role) => {
    if (role.ratioType === 'candidate') {
      return `1 per ${role.ratioValue} Candidates at a venue`;
    } else {
      return `${role.ratioValue} per venue`;
    }
  };
  
  const formatDeviceRatioDisplay = (device) => {
    return `${device.deviceCount} per ${device.candidateCount} Candidates at a venue`;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: 700, 
        marginBottom: '24px', 
        color: '#111827',
        letterSpacing: '0.5px'
      }}>
        Configuration
      </h1>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('manpower')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'manpower' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'manpower' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '-2px'
          }}
        >
          Manpower Ratio
        </button>
        <button
          onClick={() => setActiveTab('device')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'device' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'device' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '-2px'
          }}
        >
          Device Ratio
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'emergency' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'emergency' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '-2px'
          }}
        >
          Emergency Onboarding & Manpower Attendance
        </button>
        <button
          onClick={() => setActiveTab('checklists')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'checklists' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'checklists' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '-2px'
          }}
        >
          Checklists
        </button>
      </div>

      {/* Manpower Ratio Tab Content */}
      {activeTab === 'manpower' && (
        <>
          {/* Add New Role Form */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 700, 
              marginBottom: '20px', 
              color: '#1f2937',
              letterSpacing: '0.3px'
            }}>
              Add New User Role
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr 1fr auto', 
              gap: '12px', 
              alignItems: 'end' 
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  marginBottom: '6px', 
                  color: '#374151' 
                }}>
                  User Role Type
                </label>
                <select
                  value={formData.roleName}
                  onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    background: 'white'
                  }}
                >
                  <option value="">Select Role Type</option>
                  {availableRoles.map((roleType) => (
                    <option key={roleType} value={roleType}>{roleType}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  marginBottom: '6px', 
                  color: '#374151' 
                }}>
                  Ratio Type
                </label>
                <select
                  value={formData.ratioType}
                  onChange={(e) => setFormData({ ...formData, ratioType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option value="candidate">Per Candidates</option>
                  <option value="venue">Per Venue</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  marginBottom: '6px', 
                  color: '#374151' 
                }}>
                  {formData.ratioType === 'candidate' ? 'Candidates Count' : 'Count per Venue'}
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 100"
                  value={formData.ratioValue}
                  onChange={(e) => setFormData({ ...formData, ratioValue: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                onClick={handleAddRole}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#059669'}
                onMouseOut={(e) => e.target.style.background = '#10b981'}
              >
                <Plus size={16} /> Add Role
              </button>
            </div>
          </div>

          {/* User Roles Table */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '2px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 700, 
                color: '#1f2937',
                margin: 0,
                letterSpacing: '0.3px'
              }}>
                Manpower Role Types
              </h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse' 
              }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ 
                      padding: '14px 24px', 
                      textAlign: 'left', 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      color: '#6b7280', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '80px'
                    }}>
                      Sr. No.
                    </th>
                    <th style={{ 
                      padding: '14px 24px', 
                      textAlign: 'left', 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      color: '#6b7280', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Role
                    </th>
                    <th style={{ 
                      padding: '14px 24px', 
                      textAlign: 'left', 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      color: '#6b7280', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Ratio for Services
                    </th>
                    <th style={{ 
                      padding: '14px 24px', 
                      textAlign: 'center', 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      color: '#6b7280', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '160px'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userRoles.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ 
                        padding: '40px', 
                        textAlign: 'center', 
                        color: '#9ca3af',
                        fontSize: '14px'
                      }}>
                        No user roles defined yet. Add your first role above.
                      </td>
                    </tr>
                  ) : (
                    userRoles.map((role, index) => (
                      <tr key={role.id} style={{ 
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ 
                          padding: '16px 24px', 
                          fontSize: '14px', 
                          fontWeight: 700,
                          color: '#374151' 
                        }}>
                          {index + 1}
                        </td>
                        <td style={{ 
                          padding: '16px 24px', 
                          fontSize: '14px', 
                          color: '#111827' 
                        }}>
                          {editingId === role.id ? (
                            <select
                              value={editData.roleName}
                              onChange={(e) => setEditData({ ...editData, roleName: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontFamily: 'inherit'
                              }}
                            >
                              {masterUserRoleTypes.map((roleType) => (
                                <option key={roleType} value={roleType}>{roleType}</option>
                              ))}
                            </select>
                          ) : (
                            role.roleName
                          )}
                        </td>
                        <td style={{ 
                          padding: '16px 24px', 
                          fontSize: '14px', 
                          color: '#374151' 
                        }}>
                          {editingId === role.id ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <select
                                value={editData.ratioType}
                                onChange={(e) => setEditData({ ...editData, ratioType: e.target.value })}
                                style={{
                                  padding: '8px 10px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontFamily: 'inherit'
                                }}
                              >
                                <option value="candidate">Per Candidates</option>
                                <option value="venue">Per Venue</option>
                              </select>
                              <input
                                type="number"
                                min="1"
                                value={editData.ratioValue}
                                onChange={(e) => setEditData({ ...editData, ratioValue: parseInt(e.target.value) })}
                                style={{
                                  width: '80px',
                                  padding: '8px 10px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontFamily: 'inherit'
                                }}
                              />
                            </div>
                          ) : (
                            formatRatioDisplay(role)
                          )}
                        </td>
                        <td style={{ 
                          padding: '16px 24px', 
                          textAlign: 'center' 
                        }}>
                          {editingId === role.id ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={handleSaveEdit}
                                style={{
                                  padding: '8px 14px',
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Save size={14} /> Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                style={{
                                  padding: '8px 14px',
                                  background: '#6b7280',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <X size={14} /> Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleEdit(role)}
                                style={{
                                  padding: '8px 14px',
                                  background: '#6366f1',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Edit2 size={14} /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(role.id)}
                                style={{
                                  padding: '8px 14px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Device Ratio Tab Content */}
      {activeTab === 'device' && (
        <>
          {/* Add New Device Form */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 700, 
              marginBottom: '20px', 
              color: '#1f2937',
              letterSpacing: '0.3px'
            }}>
              Add New Device
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr 1fr auto', 
              gap: '12px', 
              alignItems: 'end' 
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  marginBottom: '6px', 
                  color: '#374151' 
                }}>
                  Device Type
                </label>
                <select
                  value={deviceFormData.deviceName}
                  onChange={(e) => setDeviceFormData({ ...deviceFormData, deviceName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    background: 'white'
                  }}
                >
                  <option value="">Select Device Type</option>
                  {availableDevices.map((deviceType) => (
                    <option key={deviceType} value={deviceType}>{deviceType}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  marginBottom: '6px', 
                  color: '#374151' 
                }}>
                  Device Count
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 2"
                  value={deviceFormData.deviceCount}
                  onChange={(e) => setDeviceFormData({ ...deviceFormData, deviceCount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  marginBottom: '6px', 
                  color: '#374151' 
                }}>
                  Candidates Count
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 100"
                  value={deviceFormData.candidateCount}
                  onChange={(e) => setDeviceFormData({ ...deviceFormData, candidateCount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                onClick={handleAddDevice}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => e.target.style.background = '#059669'}
                onMouseOut={(e) => e.target.style.background = '#10b981'}
              >
                <Plus size={16} /> Add Device
              </button>
            </div>
          </div>

          {/* Device Ratios Table */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '2px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 700, 
                color: '#1f2937',
                margin: 0,
                letterSpacing: '0.3px'
              }}>
                Device Types
              </h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse' 
              }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ 
                      padding: '14px 24px', 
                      textAlign: 'left', 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      color: '#6b7280', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '80px'
                    }}>
                      Sr. No.
                    </th>
                    <th style={{ 
                      padding: '14px 24px', 
                      textAlign: 'left', 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      color: '#6b7280', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Role
                    </th>
                    <th style={{ 
                      padding: '14px 24px', 
                      textAlign: 'left', 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      color: '#6b7280', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Ratio for Services
                    </th>
                    <th style={{ 
                      padding: '14px 24px', 
                      textAlign: 'center', 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      color: '#6b7280', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '160px'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deviceRatios.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ 
                        padding: '40px', 
                        textAlign: 'center', 
                        color: '#9ca3af',
                        fontSize: '14px'
                      }}>
                        No device ratios defined yet. Add your first device above.
                      </td>
                    </tr>
                  ) : (
                    deviceRatios.map((device, index) => (
                      <tr key={device.id} style={{ 
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ 
                          padding: '16px 24px', 
                          fontSize: '14px', 
                          fontWeight: 700,
                          color: '#374151' 
                        }}>
                          {index + 1}
                        </td>
                        <td style={{ 
                          padding: '16px 24px', 
                          fontSize: '14px', 
                          color: '#111827' 
                        }}>
                          {editingDeviceId === device.id ? (
                            <select
                              value={editDeviceData.deviceName}
                              onChange={(e) => setEditDeviceData({ ...editDeviceData, deviceName: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontFamily: 'inherit'
                              }}
                            >
                              {masterDeviceTypes.map((deviceType) => (
                                <option key={deviceType} value={deviceType}>{deviceType}</option>
                              ))}
                            </select>
                          ) : (
                            device.deviceName
                          )}
                        </td>
                        <td style={{ 
                          padding: '16px 24px', 
                          fontSize: '14px', 
                          color: '#374151' 
                        }}>
                          {editingDeviceId === device.id ? (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <input
                                type="number"
                                min="1"
                                value={editDeviceData.deviceCount}
                                onChange={(e) => setEditDeviceData({ ...editDeviceData, deviceCount: parseInt(e.target.value) })}
                                style={{
                                  width: '60px',
                                  padding: '6px 8px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontFamily: 'inherit'
                                }}
                              />
                              <span style={{ fontSize: '13px', color: '#6b7280' }}>per</span>
                              <input
                                type="number"
                                min="1"
                                value={editDeviceData.candidateCount}
                                onChange={(e) => setEditDeviceData({ ...editDeviceData, candidateCount: parseInt(e.target.value) })}
                                style={{
                                  width: '60px',
                                  padding: '6px 8px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontFamily: 'inherit'
                                }}
                              />
                              <span style={{ fontSize: '13px', color: '#6b7280' }}>Candidates</span>
                            </div>
                          ) : (
                            formatDeviceRatioDisplay(device)
                          )}
                        </td>
                        <td style={{ 
                          padding: '16px 24px', 
                          textAlign: 'center' 
                        }}>
                          {editingDeviceId === device.id ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={handleSaveDeviceEdit}
                                style={{
                                  padding: '8px 14px',
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Save size={14} /> Save
                              </button>
                              <button
                                onClick={handleCancelDeviceEdit}
                                style={{
                                  padding: '8px 14px',
                                  background: '#6b7280',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <X size={14} /> Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleEditDevice(device)}
                                style={{
                                  padding: '8px 14px',
                                  background: '#6366f1',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Edit2 size={14} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteDevice(device.id)}
                                style={{
                                  padding: '8px 14px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Emergency Onboarding & Manpower Attendance Tab Content */}
      {activeTab === 'emergency' && (
        <>
          {/* Section 1: Emergency Onboarding */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            maxWidth: '800px',
            marginBottom: '32px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              marginBottom: '8px', 
              color: '#1f2937',
              letterSpacing: '0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>🚨</span> Emergency Onboarding
            </h2>
            <p style={{ 
              fontSize: '13px', 
              color: '#6b7280', 
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Configure time-based settings for emergency user onboarding during exam sessions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Enable Before Session Hours */}
              <div style={{
                background: '#f0f9ff',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #bae6fd'
              }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  color: '#0369a1',
                  marginBottom: '12px'
                }}>
                  🔘 Enable Emergency Onboarding Button (T-X hours)
                </label>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#075985', 
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  The "Emergency Onboarding" button will be enabled <strong>T - X hours</strong> before the exam session start time, where T is the session start time.
                </p>
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={emergencyConfigForm.enableBeforeSessionHours}
                    onChange={(e) => setEmergencyConfigForm({ 
                      ...emergencyConfigForm, 
                      enableBeforeSessionHours: parseInt(e.target.value) || 1 
                    })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #bae6fd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0c4a6e'
                    }}
                  />
                </div>
                <div style={{
                  background: '#e0f2fe',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#075985'
                }}>
                  <strong>Example:</strong> If session starts at 10:00 AM and X = {emergencyConfigForm.enableBeforeSessionHours} hours, 
                  the button will be enabled from {(() => {
                    const exampleTime = new Date();
                    exampleTime.setHours(10 - emergencyConfigForm.enableBeforeSessionHours, 0, 0);
                    return exampleTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                  })()} onwards.
                </div>
              </div>

              {/* Account Validity Hours */}
              <div style={{
                background: '#f0f9ff',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #bae6fd'
              }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  color: '#0369a1',
                  marginBottom: '12px'
                }}>
                  ⏳ Emergency Account Validity Period (Y hours)
                </label>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#075985', 
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  Emergency onboarded user accounts will remain active for the specified duration. After this period, the account will expire automatically.
                </p>
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={emergencyConfigForm.accountValidityHours}
                    onChange={(e) => setEmergencyConfigForm({ 
                      ...emergencyConfigForm, 
                      accountValidityHours: parseInt(e.target.value) || 1 
                    })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #bae6fd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0c4a6e'
                    }}
                  />
                </div>
                <div style={{
                  background: '#e0f2fe',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#075985'
                }}>
                  <strong>Example:</strong> If an emergency user is created at 8:00 AM with Y = {emergencyConfigForm.accountValidityHours} hours, 
                  their account will expire at {(() => {
                    const expiryTime = new Date();
                    expiryTime.setHours(8 + emergencyConfigForm.accountValidityHours, 0, 0);
                    return expiryTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                  })()} and they won't be able to access the system.
                </div>
              </div>

              {/* Save Button for Emergency Onboarding */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  onClick={() => {
                    updateEmergencyOnboardingConfig(emergencyConfigForm);
                    alert('Emergency onboarding configuration saved successfully!');
                  }}
                  style={{
                    padding: '12px 32px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                >
                  <Save size={16} /> Save Configuration
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Manpower Attendance */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            maxWidth: '800px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              marginBottom: '8px', 
              color: '#1f2937',
              letterSpacing: '0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>👥</span> Manpower Attendance
            </h2>
            <p style={{ 
              fontSize: '13px', 
              color: '#6b7280', 
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Configure attendance capture settings for all manpower during exam sessions.
            </p>

            {/* Attendance Capture Configuration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                background: '#f0f9ff',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #bae6fd'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#0369a1',
                  marginBottom: '12px'
                }}>
                  ⏰ Attendance Capture Window (T-Z hours)
                </label>
                <p style={{
                  fontSize: '13px',
                  color: '#075985',
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  Configure how many hours before session start time that attendance can be captured for users.
                </p>
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={emergencyConfigForm.attendanceCaptureBeforeSessionHours}
                    onChange={(e) => setEmergencyConfigForm({ 
                      ...emergencyConfigForm, 
                      attendanceCaptureBeforeSessionHours: parseInt(e.target.value) || 2
                    })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #bae6fd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0c4a6e'
                    }}
                  />
                </div>
                <div style={{
                  background: '#e0f2fe',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#075985'
                }}>
                  <strong>Example:</strong> If session starts at 10:00 AM and Z = {emergencyConfigForm.attendanceCaptureBeforeSessionHours} hours, 
                  attendance can be marked starting from {(() => {
                    const captureTime = new Date();
                    captureTime.setHours(10 - emergencyConfigForm.attendanceCaptureBeforeSessionHours, 0, 0);
                    return captureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                  })()} until session end time.
                </div>
                <div style={{
                  marginTop: '12px',
                  background: '#fef3c7',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #fbbf24',
                  fontSize: '12px',
                  color: '#92400e'
                }}>
                  <strong>Note:</strong> This time window will be reflected in Step-5 → User Attendance & Device Issuance → Session dropdown when marking attendance.
                </div>
              </div>

              {/* Save Button for Manpower Attendance */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  onClick={() => {
                    updateEmergencyOnboardingConfig(emergencyConfigForm);
                    alert('Manpower attendance configuration saved successfully!');
                  }}
                  style={{
                    padding: '12px 32px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                >
                  <Save size={16} /> Save Configuration
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Checklists Tab Content */}
      {activeTab === 'checklists' && (
        <>
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            maxWidth: '900px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              marginBottom: '8px', 
              color: '#1f2937',
              letterSpacing: '0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>📋</span> Checklists Configuration
            </h2>
            <p style={{ 
              fontSize: '13px', 
              color: '#6b7280', 
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Configure time windows for enabling and disabling venue checklists before and after exam sessions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Checklist 1 Configuration */}
              <div style={{
                background: '#fef3c7',
                padding: '24px',
                borderRadius: '12px',
                border: '2px solid #fbbf24'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#92400e',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>📝</span> Checklist-1 Time Window
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Enable Before Session */}
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #fbbf24'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#92400e',
                      marginBottom: '8px'
                    }}>
                      Enable (T-A hours before session)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={checklistConfigForm.checklist1.enableBeforeSessionHours}
                      onChange={(e) => setChecklistConfigForm({
                        ...checklistConfigForm,
                        checklist1: {
                          ...checklistConfigForm.checklist1,
                          enableBeforeSessionHours: parseFloat(e.target.value) || 0
                        }
                      })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #fbbf24',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#78350f'
                      }}
                    />
                    <p style={{ fontSize: '11px', color: '#92400e', marginTop: '8px' }}>
                      Button enabled <strong>{checklistConfigForm.checklist1.enableBeforeSessionHours} hours</strong> before session start
                    </p>
                  </div>

                  {/* Disable After Session */}
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #fbbf24'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#92400e',
                      marginBottom: '8px'
                    }}>
                      Disable (T+B hours after session)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={checklistConfigForm.checklist1.disableAfterSessionHours}
                      onChange={(e) => setChecklistConfigForm({
                        ...checklistConfigForm,
                        checklist1: {
                          ...checklistConfigForm.checklist1,
                          disableAfterSessionHours: parseFloat(e.target.value) || 0
                        }
                      })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #fbbf24',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#78350f'
                      }}
                    />
                    <p style={{ fontSize: '11px', color: '#92400e', marginTop: '8px' }}>
                      Button disabled <strong>{checklistConfigForm.checklist1.disableAfterSessionHours} hours</strong> after session end
                    </p>
                  </div>
                </div>

                {/* Example */}
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: '#fffbeb',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#78350f'
                }}>
                  <strong>Example:</strong> If session is 10:00 AM - 12:00 PM, Checklist-1 will be available from{' '}
                  {(() => {
                    const startTime = new Date();
                    startTime.setHours(10 - checklistConfigForm.checklist1.enableBeforeSessionHours, 0, 0);
                    return startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                  })()} to{' '}
                  {(() => {
                    const endTime = new Date();
                    endTime.setHours(12 + checklistConfigForm.checklist1.disableAfterSessionHours, 0, 0);
                    return endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                  })()}.
                </div>
                
                {/* Important Note */}
                <div style={{
                  marginTop: '12px',
                  padding: '12px 16px',
                  background: '#fef3c7',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b',
                  fontSize: '12px',
                  color: '#92400e'
                }}>
                  <strong>⚠️ Note:</strong> If disable time (T+B hours) is set to 0 or not provided, the Checklist-1 button will remain visible forever on Step-5 for each session and will never be disabled.
                </div>
              </div>

              {/* Checklist 2 Configuration */}
              <div style={{
                background: '#dbeafe',
                padding: '24px',
                borderRadius: '12px',
                border: '2px solid #3b82f6'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1e40af',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>📝</span> Checklist-2 Time Window
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Enable Before Session */}
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #3b82f6'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#1e40af',
                      marginBottom: '8px'
                    }}>
                      Enable (T-A hours before session)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={checklistConfigForm.checklist2.enableBeforeSessionHours}
                      onChange={(e) => setChecklistConfigForm({
                        ...checklistConfigForm,
                        checklist2: {
                          ...checklistConfigForm.checklist2,
                          enableBeforeSessionHours: parseFloat(e.target.value) || 0
                        }
                      })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #3b82f6',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1e3a8a'
                      }}
                    />
                    <p style={{ fontSize: '11px', color: '#1e40af', marginTop: '8px' }}>
                      Button enabled <strong>{checklistConfigForm.checklist2.enableBeforeSessionHours} hours</strong> before session start
                    </p>
                  </div>

                  {/* Disable After Session */}
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #3b82f6'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#1e40af',
                      marginBottom: '8px'
                    }}>
                      Disable (T+B hours after session)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={checklistConfigForm.checklist2.disableAfterSessionHours}
                      onChange={(e) => setChecklistConfigForm({
                        ...checklistConfigForm,
                        checklist2: {
                          ...checklistConfigForm.checklist2,
                          disableAfterSessionHours: parseFloat(e.target.value) || 0
                        }
                      })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #3b82f6',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1e3a8a'
                      }}
                    />
                    <p style={{ fontSize: '11px', color: '#1e40af', marginTop: '8px' }}>
                      Button disabled <strong>{checklistConfigForm.checklist2.disableAfterSessionHours} hours</strong> after session end
                    </p>
                  </div>
                </div>

                {/* Example */}
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: '#eff6ff',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#1e3a8a'
                }}>
                  <strong>Example:</strong> If session is 10:00 AM - 12:00 PM, Checklist-2 will be available from{' '}
                  {(() => {
                    const startTime = new Date();
                    startTime.setHours(10 - checklistConfigForm.checklist2.enableBeforeSessionHours, 0, 0);
                    return startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                  })()} to{' '}
                  {(() => {
                    const endTime = new Date();
                    endTime.setHours(12 + checklistConfigForm.checklist2.disableAfterSessionHours, 0, 0);
                    return endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                  })()}.
                </div>
                
                {/* Important Note */}
                <div style={{
                  marginTop: '12px',
                  padding: '12px 16px',
                  background: '#dbeafe',
                  borderRadius: '8px',
                  border: '1px solid #60a5fa',
                  fontSize: '12px',
                  color: '#1e40af'
                }}>
                  <strong>⚠️ Note:</strong> If disable time (T+B hours) is set to 0 or not provided, the Checklist-2 button will remain visible forever on Step-5 for each session and will never be disabled.
                </div>
              </div>

              {/* Note */}
              <div style={{
                background: '#f0f9ff',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #bae6fd'
              }}>
                <p style={{ fontSize: '13px', color: '#075985', margin: 0, lineHeight: '1.6' }}>
                  <strong>ℹ️ Note:</strong> These time windows will be reflected in <strong>Step-5 → User Attendance & Device Issuance → Open Sessions → Submit Checklist buttons</strong>. Buttons will only be enabled during the configured time window.
                </p>
              </div>

              {/* Save Button */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  onClick={() => {
                    updateChecklistConfig(checklistConfigForm);
                    alert('Checklist configuration saved successfully!');
                  }}
                  style={{
                    padding: '12px 32px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                >
                  <Save size={16} /> Save Configuration
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConfigurationView;
