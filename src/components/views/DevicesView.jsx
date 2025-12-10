import React, { useState, useMemo, useRef } from 'react';
import { Trash2, Edit2, Filter, X, Upload, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';

const DevicesView = () => {
  const { user, roleHierarchy, getVisibleUsers, devices, addDevices, getVisibleDevices } = useAuth();

  // Bulk upload state for devices
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [bulkUploadError, setBulkUploadError] = useState('');
  const [bulkUploadSuccess, setBulkUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Determine allowed roles for the current user
  const allowedRoles = useMemo(() => {
    if (!user || !roleHierarchy[user.role]) return null;
    return roleHierarchy[user.role].canViewRoles;
  }, [user, roleHierarchy]);

  // Use getVisibleDevices from context which applies role-based filtering
  const visibleDevices = useMemo(() => {
    if (typeof getVisibleDevices === 'function') return getVisibleDevices();
    // Fallback to basic filtering
    if (!user) return [];
    if (!allowedRoles) return devices;
    return devices.filter(device => allowedRoles.includes(device.assignedRole));
  }, [getVisibleDevices, devices, allowedRoles, user]);

  // Filter modal and filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDeviceType, setFilterDeviceType] = useState('');
  const [filterVendorName, setFilterVendorName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { assetTypes } = useConfig();
  const uniqueDeviceTypes = useMemo(() => {
    const configured = assetTypes.map(a => a.name);
    const s = new Set([...devices.map(d => d.type), ...configured]);
    return Array.from(s).sort();
  }, [devices, assetTypes]);

  const uniqueVendorNames = useMemo(() => {
    const s = new Set(devices.map(d => d.vendorName).filter(Boolean));
    return Array.from(s).sort();
  }, [devices]);

  const filteredDevices = useMemo(() => {
    return visibleDevices.filter((d) => {
      const typeMatch = !filterDeviceType || d.type === filterDeviceType;
      const vendorMatch = !filterVendorName || d.vendorName === filterVendorName;
      const statusMatch = !filterStatus || d.status === filterStatus;
      return typeMatch && vendorMatch && statusMatch;
    });
  }, [visibleDevices, filterDeviceType, filterVendorName, filterStatus]);

  // Download CSV template for device bulk upload
  const downloadTemplate = () => {
    const headers = [
      'Device ID',
      'Model No',
      'Device Type',
      'Vendor Organization',
      'Status (Active/Inactive/Maintenance)',
      'Synced On (optional)',
      'Assigned Role'
    ];

    const sampleRow = [
      'DV-2001',
      'FPT-BIO-2024A',
      'Biometric Device',
      'FingerPrint Tech',
      'Active',
      '2025-11-21 09:17:10',
      'Biometric Operator'
    ];

    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'device_bulk_upload_template.csv';
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

        const newDevices = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          if (values.length < 4) {
            errors.push(`Row ${i + 1}: Incomplete data (expected at least 4 columns)`);
            continue;
          }

          const deviceData = {
            deviceId: values[0] || `DV-${Date.now()}-${i}`,
            modelNo: values[1] || '',
            type: values[2] || '',
            vendorName: values[3] || '',
            status: values[4] || 'Active',
            syncedOn: values[5] || new Date().toISOString().slice(0, 19).replace('T', ' '),
            assignedRole: values[6] || '',
          };

          // Basic validation
          if (!deviceData.modelNo) {
            errors.push(`Row ${i + 1}: Model No is required`);
            continue;
          }
          if (!deviceData.type) {
            errors.push(`Row ${i + 1}: Device Type is required`);
            continue;
          }
          newDevices.push(deviceData);
        }

        if (newDevices.length > 0) {
          addDevices(newDevices);
          setBulkUploadSuccess(`Successfully uploaded ${newDevices.length} device(s)${errors.length > 0 ? `. ${errors.length} row(s) had errors.` : ''}`);
          setBulkUploadFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          setBulkUploadError('No valid data found in the file');
        }

        if (errors.length > 0) {
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
      <div className="page-header">
        <h1 className="page-title">Devices Management</h1>
        <p className="page-subtitle">Track and manage all venue devices</p>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">All Devices</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
              }}
              onMouseOver={(e) => { e.target.style.background = '#f9fafb'; e.target.style.borderColor = '#d1d5db'; }}
              onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#e5e7eb'; }}
            >
              <Filter size={16} />
              Filter
              {(filterDeviceType || filterVendorName || filterStatus) && (
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
                  {(filterDeviceType ? 1 : 0) + (filterVendorName ? 1 : 0) + (filterStatus ? 1 : 0)}
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
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Model No.</th>
              <th>Device Type</th>
              <th>Vendor Organization Name</th>
              <th>Status</th>
              <th>Synced On</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device) => (
              <tr key={device.deviceId}>
                <td><strong>{device.deviceId}</strong></td>
                <td>{device.modelNo}</td>
                <td>{device.type}</td>
                <td>{device.vendorName}</td>
                <td>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background:
                        device.status === 'Active'
                          ? '#d1fae5'
                          : device.status === 'Maintenance'
                            ? '#fef3c7'
                            : '#fee2e2',
                      color:
                        device.status === 'Active'
                          ? '#059669'
                          : device.status === 'Maintenance'
                            ? '#f59e0b'
                            : '#dc2626',
                    }}
                  >
                    {device.status}
                  </span>
                </td>
                <td>{device.syncedOn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            zIndex: 999,
          }}
          onClick={() => setShowBulkUploadModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '85vh',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={20} />
                Bulk Upload Devices
              </h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={downloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #e5e7eb', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>
                  <Download size={16} />
                  Download Template
                </button>
                <button onClick={() => setShowBulkUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#6b7280' }}>
                  <X size={24} />
                </button>
              </div>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <p style={{ color: '#6b7280', marginBottom: '12px' }}>Upload a CSV file with device details. The template provides expected columns.</p>

              <div style={{ marginBottom: '12px' }}>
                <input ref={fileInputRef} type="file" accept=".csv,.xls,.xlsx" onChange={handleBulkFileChange} />
              </div>

              {bulkUploadError && <div style={{ color: '#dc2626', marginBottom: '8px' }}>{bulkUploadError}</div>}
              {bulkUploadSuccess && <div style={{ color: '#059669', marginBottom: '8px' }}>{bulkUploadSuccess}</div>}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <button onClick={() => { setBulkUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; setBulkUploadError(''); setBulkUploadSuccess(''); }} style={{ padding: '10px 20px', border: '1px solid #e5e7eb', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>Clear</button>
              <button onClick={handleBulkUpload} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Upload</button>
            </div>
          </div>
        </div>
      )}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={20} />
                Filter Devices
              </h2>
              <button onClick={() => setShowFilterModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#6b7280' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Device Type</label>
                <select value={filterDeviceType} onChange={(e) => setFilterDeviceType(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                  <option value="">All Types</option>
                  {uniqueDeviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Vendor Organization Name</label>
                <select value={filterVendorName} onChange={(e) => setFilterVendorName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                  <option value="">All Vendors</option>
                  {uniqueVendorNames.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <button onClick={() => { setFilterDeviceType(''); setFilterVendorName(''); setFilterStatus(''); }} style={{ padding: '10px 20px', border: '1px solid #e5e7eb', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>Clear</button>
              <button onClick={() => setShowFilterModal(false)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesView;
