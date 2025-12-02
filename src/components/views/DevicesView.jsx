import React, { useState, useMemo } from 'react';
import { Trash2, Edit2, Filter, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';

const DevicesView = () => {
  const { user, roleHierarchy, getVisibleUsers } = useAuth();
  const [devices] = useState([
    { deviceId: 'DV-1001', modelNo: 'FPT-BIO-2024A', type: 'Biometric Device', vendorName: 'FingerPrint Tech', status: 'Active', syncedOn: '2025-11-21 09:17:10', assignedRole: 'Biometric Operator' },
    { deviceId: 'DV-1002', modelNo: 'ACP-BC-X500', type: 'Body Camera', vendorName: 'ActionCam Pro', status: 'Maintenance', syncedOn: '2025-11-20 18:45:02', assignedRole: 'Body Cam Operator' },
    { deviceId: 'DV-1003', modelNo: 'CI-SRV-PRO-8', type: 'Server', vendorName: 'Cloud Infrastructure Inc', status: 'Active', syncedOn: '2025-11-21 08:55:44', assignedRole: 'Server Manager' },
    { deviceId: 'DV-1004', modelNo: 'SVS-CAM-4K-02', type: 'CCTV', vendorName: 'SecureVision Systems', status: 'Active', syncedOn: '2025-11-21 09:20:01', assignedRole: 'CCTV Technician' },
    { deviceId: 'DV-1005', modelNo: 'BMI-TERM-500', type: 'Biometric Device', vendorName: 'BioMetrics India', status: 'Active', syncedOn: '2025-11-21 07:45:12', assignedRole: 'Venue Staff' },
    { deviceId: 'DV-1006', modelNo: 'BTS-BC-PRO-2', type: 'Body Camera', vendorName: 'BodyTrack Solutions', status: 'Active', syncedOn: '2025-11-21 06:30:55', assignedRole: 'Body Cam Operator' },
    { deviceId: 'DV-1007', modelNo: 'NSL-SRV-ENT-4', type: 'Server', vendorName: 'Network Solutions Ltd', status: 'Active', syncedOn: '2025-11-20 22:10:05', assignedRole: 'Server Manager' },
    { deviceId: 'DV-1008', modelNo: 'CGI-CAM-HD-03', type: 'CCTV', vendorName: 'CameraGuard India', status: 'Active', syncedOn: '2025-11-21 05:50:33', assignedRole: 'CCTV Technician' },
    { deviceId: 'DV-1009', modelNo: 'FPT-BIO-2024B', type: 'Biometric Device', vendorName: 'FingerPrint Tech', status: 'Active', syncedOn: '2025-11-18 11:12:09', assignedRole: 'Venue Staff' },
    { deviceId: 'DV-1010', modelNo: 'ACP-BC-X300', type: 'Body Camera', vendorName: 'ActionCam Pro', status: 'Inactive', syncedOn: '2025-11-15 14:20:00', assignedRole: 'Event Manager' },
    { deviceId: 'DV-1011', modelNo: 'CI-SRV-STD-4', type: 'Server', vendorName: 'Cloud Infrastructure Inc', status: 'Active', syncedOn: '2025-11-21 09:00:00', assignedRole: 'Server Manager' },
    { deviceId: 'DV-1012', modelNo: 'SVS-CAM-4K-04', type: 'CCTV', vendorName: 'SecureVision Systems', status: 'Active', syncedOn: '2025-11-20 08:05:44', assignedRole: 'CCTV Technician' },
  ]);

  // Determine allowed roles for the current user
  const allowedRoles = useMemo(() => {
    if (!user || !roleHierarchy[user.role]) return null;
    return roleHierarchy[user.role].canViewRoles;
  }, [user, roleHierarchy]);

  // Filter devices based on allowed roles
  const visibleDevices = useMemo(() => {
    if (!user) return [];
    if (!allowedRoles) return devices; // Super Admin, Project Manager, Server Manager see all
    return devices.filter(device => allowedRoles.includes(device.assignedRole));
  }, [devices, allowedRoles, user]);

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
