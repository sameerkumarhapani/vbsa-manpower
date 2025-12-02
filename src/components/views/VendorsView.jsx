import React, { useMemo, useState } from 'react';
import { Edit2, Plus, Building, X, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const VendorsView = () => {
  const { getVisibleVendors, user, getAllExistingMobileNumbers, deactivateUsersByVendor, updateVendor, addVendor, vendors: contextVendors } = useAuth();
  const mockVendors = useMemo(() => getVisibleVendors(), [getVisibleVendors, contextVendors]);
  const existingMobileNumbers = useMemo(() => getAllExistingMobileNumbers(), [getAllExistingMobileNumbers]);
  
  // All available user roles that can be created by vendors
  const allUserRoles = [
    'CCTV Technician',
    'Biometric Operator',
    'Body Cam Operator',
    'Network Administrator',
    'Server Manager',
    'Center Manager',
    'Centre Superintendent',
    'Housekeeping',
    'Electrician',
    'Invigilators',
    'Security Guards',
  ];

  const vendorTypes = [
    'CCTV Partner',
    'Biometric Partner',
    'Body Cam Partner',
    'Technology Partner',
    'Venue Partner',
    'Manpower Partner',
  ];

  const statuses = ['Active', 'Inactive'];

  // State management
  const [vendors, setVendors] = useState(mockVendors);
  const [showForm, setShowForm] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [filterVendorType, setFilterVendorType] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  
  const [formData, setFormData] = useState({
    id: null,
    organizationName: '',
    vendorTypes: [],
    contactPersonName: '',
    contactPersonMobile: '',
    email: '',
    gstNumber: '',
    panNumber: '',
    billingAddress: '',
    city: '',
    state: '',
    pincode: '',
    status: 'Active',
    allowedUserRoles: [],
  });
  const [errors, setErrors] = useState({});

  // Regex patterns
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  // Filter vendors based on selected filters (support multiple vendor types)
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const vendorTypesForVendor = vendor.vendorTypes || (vendor.vendorType ? [vendor.vendorType] : []);
      const typeMatch = !filterVendorType || filterVendorType.length === 0 || filterVendorType.some(t => vendorTypesForVendor.includes(t));
      const statusMatch = !filterStatus || vendor.status === filterStatus;
      return typeMatch && statusMatch;
    });
  }, [vendors, filterVendorType, filterStatus]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
    if (!formData.contactPersonName.trim()) newErrors.contactPersonName = 'Contact person name is required';
    if (!formData.contactPersonMobile.trim()) newErrors.contactPersonMobile = 'Contact person mobile is required';
    
    const mobileDigits = formData.contactPersonMobile.replace(/\D/g, '');
    if (!/^\d{10}$/.test(mobileDigits)) {
      newErrors.contactPersonMobile = 'Mobile number must be exactly 10 digits';
    } else if (existingMobileNumbers.has(mobileDigits) && !editingVendor) {
      // For new vendors, check against existing
      newErrors.contactPersonMobile = 'Mobile number already exists, enter new mobile number';
    } else if (existingMobileNumbers.has(mobileDigits) && editingVendor && editingVendor.phone !== `+91-${mobileDigits}`) {
      // For editing, check if it's a different mobile number
      newErrors.contactPersonMobile = 'Mobile number already exists, enter new mobile number';
    }
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.gstNumber.trim()) newErrors.gstNumber = 'GST number is required';
    if (!gstRegex.test(formData.gstNumber.trim())) newErrors.gstNumber = 'Invalid GST format (15 character GSTIN)';
    if (!formData.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
    if (!panRegex.test(formData.panNumber.trim())) newErrors.panNumber = 'Invalid PAN format (10 character alphanumeric)';
    if (!formData.billingAddress.trim()) newErrors.billingAddress = 'Billing address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (formData.allowedUserRoles.length === 0) newErrors.allowedUserRoles = 'Please select at least one user role';
    if (!formData.vendorTypes || formData.vendorTypes.length === 0) newErrors.vendorTypes = 'Please select at least one vendor type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let fieldErrors = { ...errors };

    // For GST and PAN, convert to uppercase
    if (name === 'gstNumber' || name === 'panNumber') {
      newValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Real-time validation for Mobile Number
    if (name === 'contactPersonMobile') {
      const mobileDigits = newValue.replace(/\D/g, '');
      if (!newValue.trim()) {
        fieldErrors.contactPersonMobile = 'Contact person mobile is required';
      } else if (mobileDigits.length < 10) {
        fieldErrors.contactPersonMobile = `Mobile number should be 10 digits (${mobileDigits.length}/10)`;
      } else if (mobileDigits.length > 10) {
        fieldErrors.contactPersonMobile = 'Mobile number should contain only 10 digits';
      } else if (!/^\d{10}$/.test(mobileDigits)) {
        fieldErrors.contactPersonMobile = 'Mobile number must contain only digits';
      } else if (existingMobileNumbers.has(mobileDigits) && !editingVendor) {
        fieldErrors.contactPersonMobile = 'Mobile number already exists, enter new mobile number';
      } else if (existingMobileNumbers.has(mobileDigits) && editingVendor && editingVendor.phone !== `+91-${mobileDigits}`) {
        fieldErrors.contactPersonMobile = 'Mobile number already exists, enter new mobile number';
      } else {
        delete fieldErrors.contactPersonMobile;
      }
    }

    // Real-time validation for GST Number
    if (name === 'gstNumber') {
      if (!newValue.trim()) {
        fieldErrors.gstNumber = 'GST number is required';
      } else if (newValue.length < 15) {
        fieldErrors.gstNumber = `GST should be 15 characters (${newValue.length}/15)`;
      } else if (!gstRegex.test(newValue)) {
        fieldErrors.gstNumber = 'Invalid GST format';
      } else {
        delete fieldErrors.gstNumber;
      }
    }

    // Real-time validation for PAN Number
    if (name === 'panNumber') {
      if (!newValue.trim()) {
        fieldErrors.panNumber = 'PAN number is required';
      } else if (newValue.length < 10) {
        fieldErrors.panNumber = `PAN should be 10 characters (${newValue.length}/10)`;
      } else if (!panRegex.test(newValue)) {
        fieldErrors.panNumber = 'Invalid PAN format (5 letters + 4 digits + 1 letter)';
      } else {
        delete fieldErrors.panNumber;
      }
    }

    // Clear errors for other fields when user starts typing
    if (name !== 'gstNumber' && name !== 'panNumber' && name !== 'contactPersonMobile' && errors[name]) {
      delete fieldErrors[name];
    }

    setErrors(fieldErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (editingVendor) {
        // Check if vendor is being deactivated
        const isBeingDeactivated = editingVendor.status === 'Active' && formData.status === 'Inactive';
        
        // Create updated vendor object
        const updatedVendorData = {
          ...editingVendor,
          vendorName: formData.organizationName,
          vendorTypes: formData.vendorTypes,
          vendorType: (formData.vendorTypes && formData.vendorTypes[0]) || '',
          contactPerson: formData.contactPersonName,
          phone: `+91-${formData.contactPersonMobile}`,
          email: formData.email,
          gst: formData.gstNumber,
          pan: formData.panNumber,
          address: formData.billingAddress,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          status: formData.status,
          allowedUserRoles: formData.allowedUserRoles,
        };
        
        // Update vendor in local state
        setVendors(
          vendors.map((v) =>
            v.id === editingVendor.id ? updatedVendorData : v
          )
        );
        
        // Update vendor in AuthContext (persists to localStorage)
        updateVendor(updatedVendorData);
        
        // Deactivate all users associated with this vendor if vendor is being deactivated
        if (isBeingDeactivated) {
          deactivateUsersByVendor(editingVendor.vendorName);
          alert('Vendor deactivated successfully! All associated users have also been deactivated.');
        } else {
          alert('Vendor updated successfully!');
        }
      } else {
        // Add new vendor
        const newVendor = {
          id: `v-new-${Date.now()}`,
          vendorName: formData.organizationName,
          vendorTypes: formData.vendorTypes,
          vendorType: (formData.vendorTypes && formData.vendorTypes[0]) || '',
          contactPerson: formData.contactPersonName,
          email: formData.email,
          phone: `+91-${formData.contactPersonMobile}`,
          status: formData.status,
          gst: formData.gstNumber,
          pan: formData.panNumber,
          address: formData.billingAddress,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          allowedUserRoles: formData.allowedUserRoles,
        };
        setVendors([...vendors, newVendor]);
        
        // Add vendor to AuthContext (persists to localStorage)
        addVendor(newVendor);
        
        alert('Vendor added successfully!');
      }
      setShowForm(false);
      resetForm();
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: null,
      organizationName: '',
      vendorTypes: [],
      contactPersonName: '',
      contactPersonMobile: '',
      email: '',
      gstNumber: '',
      panNumber: '',
      billingAddress: '',
      city: '',
      state: '',
      pincode: '',
      status: 'Active',
      allowedUserRoles: [],
    });
    setErrors({});
    setEditingVendor(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (vendor) => {
    const mobileDigits = vendor.phone.replace(/\D/g, '');
    setFormData({
      id: vendor.id,
      organizationName: vendor.vendorName,
      vendorTypes: vendor.vendorTypes || (vendor.vendorType ? [vendor.vendorType] : []),
      contactPersonName: vendor.contactPerson,
      contactPersonMobile: mobileDigits,
      email: vendor.email,
      gstNumber: vendor.gst || '',
      panNumber: vendor.pan || '',
      billingAddress: vendor.address || '',
      city: vendor.city || '',
      state: vendor.state || '',
      pincode: vendor.pincode || '',
      status: vendor.status,
      allowedUserRoles: vendor.allowedUserRoles || [],
    });
    setEditingVendor(vendor);
    setShowForm(true);
  };

  const handleRoleCheckboxChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      allowedUserRoles: prev.allowedUserRoles.includes(role)
        ? prev.allowedUserRoles.filter((r) => r !== role)
        : [...prev.allowedUserRoles, role],
    }));
  };

  const handleVendorTypesChange = (e) => {
    // for <select multiple />
    const options = Array.from(e.target.selectedOptions || []);
    const values = options.map(o => o.value);
    setFormData((prev) => ({ ...prev, vendorTypes: values }));
    // clear validation error as user selects
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.vendorTypes;
      return copy;
    });
  };

  const getVendorTypeColor = (vendorType) => {
    const colors = {
      'CCTV Partner': { bg: '#f0f4ff', color: 'var(--color-primary)' },
      'Biometric Partner': { bg: '#fef3c7', color: '#d97706' },
      'Body Cam Partner': { bg: '#f0fdf4', color: '#059669' },
      'Technology Partner': { bg: '#fef2f2', color: '#dc2626' },
      'Venue Partner': { bg: '#f5f3ff', color: '#7c3aed' },
      'Manpower Partner': { bg: '#cffafe', color: '#0891b2' },
    };
    return colors[vendorType] || { bg: '#f9fafb', color: '#6b7280' };
  };

  const getStatusColor = (status) => {
    return status === 'Active'
      ? { bg: '#d1fae5', color: '#059669' }
      : { bg: '#fee2e2', color: '#dc2626' };
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Vendors Management</h1>
        <p className="page-subtitle">Manage all service vendors and partners</p>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">
            <Building size={20} style={{ marginRight: '8px', display: 'inline' }} />
            All Vendors ({filteredVendors.length})
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              className="btn-secondary"
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
              {(((filterVendorType && filterVendorType.length > 0) || filterStatus)) && (
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
                  {(filterVendorType ? filterVendorType.length : 0) + (filterStatus ? 1 : 0)}
                </span>
              )}
            </button>
            <button className="btn-primary" onClick={handleAddNew}>
              <Plus size={16} style={{ marginRight: '8px' }} />
              Add Vendor
            </button>
          </div>
        </div>

        {filteredVendors.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <p style={{ color: '#6b7280', fontSize: '14px' }}>No vendors found</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Vendor Organization Name</th>
                <th>Vendor Type(s)</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => {
                const vendorTypeList = vendor.vendorTypes || (vendor.vendorType ? [vendor.vendorType] : []);
                const statusColor = getStatusColor(vendor.status);
                return (
                  <tr key={vendor.id}>
                    <td>
                      <strong>{vendor.name}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {vendorTypeList.map((vt) => {
                          const tcol = getVendorTypeColor(vt);
                          return (
                            <span key={vt} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, background: tcol.bg, color: tcol.color }}>
                              {vt}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>{vendor.contactPerson}</td>
                    <td style={{ fontSize: '13px' }}>{vendor.email}</td>
                    <td style={{ fontSize: '13px' }}>{vendor.phone}</td>
                    <td>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: statusColor.bg,
                          color: statusColor.color,
                        }}
                      >
                        {vendor.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(vendor)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-primary)',
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
              maxWidth: '450px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
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
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={20} />
                Filter Vendors
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
            <div style={{ padding: '24px' }}>
              {/* Vendor Type Filter */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#1f2937' }}>Vendor Type</label>
                <select
                  value={filterVendorType && filterVendorType.length > 0 ? filterVendorType[0] : ''}
                  onChange={(e) => setFilterVendorType(e.target.value ? [e.target.value] : [])}
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
                >
                  <option value="">All</option>
                  {vendorTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#1f2937' }}>Status</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    border: filterStatus === '' ? '2px solid var(--color-primary)' : '2px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: filterStatus === '' ? '#f0f4ff' : '#f9fafb',
                    transition: 'all 0.2s ease',
                  }}>
                    <input
                      type="radio"
                      name="status"
                      value=""
                      checked={filterStatus === ''}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      style={{ marginRight: '8px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>All</span>
                  </label>
                  {statuses.map((status) => (
                    <label key={status} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      border: filterStatus === status ? '2px solid var(--color-primary)' : '2px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: filterStatus === status ? '#f0f4ff' : '#f9fafb',
                      transition: 'all 0.2s ease',
                    }}>
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={filterStatus === status}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ marginRight: '8px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Active Filters Display */}
              {((filterVendorType && filterVendorType.length > 0) || filterStatus) && (
                <div style={{
                  padding: '12px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  marginBottom: '20px',
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>Active Filters:</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {filterVendorType && filterVendorType.length > 0 && filterVendorType.map((fv) => (
                      <span key={fv} style={{
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
                        {fv}
                        <button
                          onClick={() => setFilterVendorType(filterVendorType.filter(x => x !== fv))}
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
                    ))}
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
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setFilterVendorType([]);
                  setFilterStatus('');
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

      {/* Add/Edit Vendor Modal */}
      {showForm && (
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
          onClick={handleCloseForm}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
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
                position: 'sticky',
                top: 0,
                background: 'white',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                {editingVendor ? 'Edit Vendor' : 'Onboard New Vendor'}
              </h2>
              <button
                onClick={handleCloseForm}
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
            <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
              {/* Basic Information Section */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organization Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Organization Name *</label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      placeholder="Enter organization name"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: errors.organizationName ? '1px solid #dc2626' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.organizationName && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.organizationName}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Vendor Type(s) *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '10px', border: errors.vendorTypes ? '1px solid #dc2626' : '1px solid #e5e7eb', borderRadius: '6px', height: '150px', overflowY: 'scroll', background: '#fff' }}>
                      {vendorTypes.map((type) => {
                        const checked = formData.vendorTypes.includes(type);
                        return (
                          <label
                            key={type}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              border: '1px solid ' + (checked ? 'var(--color-primary)' : '#e5e7eb'),
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: checked ? '#f0f4ff' : 'white',
                              fontSize: '12px',
                              fontWeight: 500,
                              transition: 'all 0.2s ease',
                            }}
                            onMouseOver={(e) => {
                              if (!checked) e.currentTarget.style.background = '#f9fafb';
                            }}
                            onMouseOut={(e) => {
                              if (!checked) e.currentTarget.style.background = 'white';
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setFormData(prev => {
                                  const exists = prev.vendorTypes.includes(type);
                                  const updated = exists ? prev.vendorTypes.filter(t => t !== type) : [...prev.vendorTypes, type];
                                  const next = { ...prev, vendorTypes: updated };
                                  return next;
                                });
                                setErrors(prev => { const copy = { ...prev }; delete copy.vendorTypes; return copy; });
                              }}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <span style={{ color: '#374151' }}>{type}</span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.vendorTypes && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.vendorTypes}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Contact Person Name *</label>
                    <input
                      type="text"
                      name="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={handleInputChange}
                      placeholder="Enter contact person name"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: errors.contactPersonName ? '1px solid #dc2626' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.contactPersonName && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.contactPersonName}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Contact Person Mobile No. *</label>
                    <input
                      type="tel"
                      name="contactPersonMobile"
                      value={formData.contactPersonMobile}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit mobile number"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: errors.contactPersonMobile ? '1px solid #dc2626' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.contactPersonMobile && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.contactPersonMobile}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: errors.email ? '1px solid #dc2626' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.email && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.email}</p>}
                  </div>

                  {editingVendor && (
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Status *</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Tax & Registration Section */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tax & Registration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>GST Number *</label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      placeholder="15-char GSTIN (e.g., 27AABCT1234A1Z5)"
                      maxLength="15"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: errors.gstNumber ? '1px solid #dc2626' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        textTransform: 'uppercase',
                      }}
                    />
                     {errors.gstNumber && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.gstNumber}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>PAN Number *</label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleInputChange}
                      placeholder="10-char PAN (e.g., AAAPL0000A)"
                      maxLength="10"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: errors.panNumber ? '1px solid #dc2626' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        textTransform: 'uppercase',
                      }}
                    />
                    {errors.panNumber && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.panNumber}</p>}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Billing Address</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Address *</label>
                    <textarea
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      placeholder="Enter complete billing address (street, building, etc.)"
                      rows="2"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: errors.billingAddress ? '1px solid #dc2626' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                      }}
                    />
                    {errors.billingAddress && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.billingAddress}</p>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: errors.city ? '1px solid #dc2626' : '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                      {errors.city && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.city}</p>}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Enter state"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: errors.state ? '1px solid #dc2626' : '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                      {errors.state && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.state}</p>}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="Enter pincode"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: errors.pincode ? '1px solid #dc2626' : '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                      {errors.pincode && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.pincode}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Allowed User Roles Section */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Allowed User Roles *</h3>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>Select which user roles this vendor can create</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {allUserRoles.map((role) => (
                    <label
                      key={role}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: formData.allowedUserRoles.includes(role) ? '#f0f4ff' : 'white',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        if (!formData.allowedUserRoles.includes(role)) {
                          e.currentTarget.style.background = '#f9fafb';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!formData.allowedUserRoles.includes(role)) {
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.allowedUserRoles.includes(role)}
                        onChange={() => handleRoleCheckboxChange(role)}
                        style={{
                          marginRight: '8px',
                          cursor: 'pointer',
                          width: '16px',
                          height: '16px',
                        }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.allowedUserRoles.length === 0 && (
                  <p style={{ color: '#dc2626', fontSize: '12px', margin: '8px 0 0 0' }}>Please select at least one user role</p>
                )}
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                  paddingTop: '20px',
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseForm}
                  style={{
                    padding: '10px 24px',
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
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'white';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
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
                  {editingVendor ? 'Update Vendor' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsView;
