import React, { useState, useMemo } from 'react';
import { Plus, Filter, Edit2, Search, X, Download } from 'lucide-react';
import { exportUserMappings } from '../utils/excelExport';

// Mock partners from vendor management with contact details
const ALL_PARTNERS = [
  { id: 'v-cctv-001', name: 'SecureVision Systems', vendorTypes: ['CCTV Partner'], contactPerson: 'Suresh Reddy', phone: '+91-9876543210', status: 'Active' },
  { id: 'v-cctv-002', name: 'CameraGuard India', vendorTypes: ['CCTV Partner'], contactPerson: 'Priya Singh', phone: '+91-9876543211', status: 'Active' },
  { id: 'v-bio-001', name: 'FingerPrint Tech', vendorTypes: ['Biometric Partner'], contactPerson: 'Anil Kumar', phone: '+91-9876543212', status: 'Active' },
  { id: 'v-bio-002', name: 'BioMetrics India', vendorTypes: ['Biometric Partner'], contactPerson: 'Kavya Nair', phone: '+91-9876543213', status: 'Inactive' },
  { id: 'v-bc-001', name: 'ActionCam Pro', vendorTypes: ['Body Cam Partner'], contactPerson: 'Rohit Sharma', phone: '+91-9876543214', status: 'Active' },
  { id: 'v-bc-002', name: 'BodyTrack Solutions', vendorTypes: ['Body Cam Partner'], contactPerson: 'Neha Desai', phone: '+91-9876543215', status: 'Active' },
  { id: 'v-tech-001', name: 'Network Solutions Ltd', vendorTypes: ['Technology Partner'], contactPerson: 'Sanjay Patel', phone: '+91-9876543216', status: 'Active' },
  { id: 'v-tech-002', name: 'Cloud Infrastructure Inc', vendorTypes: ['Technology Partner'], contactPerson: 'Vikas Gupta', phone: '+91-9876543217', status: 'Active' },
  { id: 'v-venue-001', name: 'Premium Venues Corp', vendorTypes: ['Venue Partner'], contactPerson: 'Rajesh Kapoor', phone: '+91-9876543218', status: 'Active' },
  { id: 'v-venue-002', name: 'EventSpace India', vendorTypes: ['Venue Partner'], contactPerson: 'Anjali Verma', phone: '+91-9876543219', status: 'Active' },
  { id: 'v-mp-001', name: 'SecureForce Staffing', vendorTypes: ['Manpower Partner'], contactPerson: 'Rajesh Singh', phone: '+91-9876543220', status: 'Active' },
  { id: 'v-mp-002', name: 'ManpowerHub Solutions', vendorTypes: ['Manpower Partner'], contactPerson: 'Divya Sharma', phone: '+91-9876543221', status: 'Active' },
];

// Mock users from user management
const ALL_USERS = [
  // CCTV Team
  { id: 'cctv-001', userId: 'USR001', fullName: 'Deepak Singh', email: 'deepak.singh@vbsa.com', role: 'CCTV Technician', vendorName: 'SecureVision Systems', mobile: '9876543210' },
  { id: 'cctv-002', userId: 'USR002', fullName: 'Manoj Kumar', email: 'manoj.kumar@vbsa.com', role: 'CCTV Technician', vendorName: 'CameraGuard India', mobile: '9876543211' },
  
  // Biometric Team
  { id: 'bio-001', userId: 'USR003', fullName: 'Priya Mishra', email: 'priya.mishra@vbsa.com', role: 'Biometric Operator', vendorName: 'FingerPrint Tech', mobile: '9876543212' },
  { id: 'bio-002', userId: 'USR004', fullName: 'Anita Desai', email: 'anita.desai@vbsa.com', role: 'Biometric Operator', vendorName: 'BioMetrics India', mobile: '9876543213' },
  
  // Body Cam Team
  { id: 'bc-001', userId: 'USR005', fullName: 'Harsh Patel', email: 'harsh.patel@vbsa.com', role: 'Body Cam Operator', vendorName: 'ActionCam Pro', mobile: '9876543214' },
  { id: 'bc-002', userId: 'USR006', fullName: 'Rahul Joshi', email: 'rahul.joshi@vbsa.com', role: 'Body Cam Operator', vendorName: 'BodyTrack Solutions', mobile: '9876543215' },
  
  // Technology Team
  { id: 'tech-001', userId: 'USR007', fullName: 'Arjun Saxena', email: 'arjun.saxena@vbsa.com', role: 'Network Administrator', vendorName: 'Network Solutions Ltd', mobile: '9876543216' },
  { id: 'tech-002', userId: 'USR008', fullName: 'Nikhil Bhat', email: 'nikhil.bhat@vbsa.com', role: 'Server Manager', vendorName: 'Cloud Infrastructure Inc', mobile: '9876543217' },
  
  // Venue Team
  { id: 'venue-001', userId: 'USR009', fullName: 'Meera Nair', email: 'meera.nair@vbsa.com', role: 'Center Manager', vendorName: 'Premium Venues Corp', mobile: '9876543218' },
  { id: 'venue-002', userId: 'USR010', fullName: 'Suresh Rao', email: 'suresh.rao@vbsa.com', role: 'Centre Superintendent', vendorName: 'EventSpace India', mobile: '9876543219' },
  { id: 'venue-003', userId: 'USR011', fullName: 'Lakshmi Srinivasan', email: 'lakshmi.srinivasan@vbsa.com', role: 'Housekeeping', vendorName: 'Premium Venues Corp', mobile: '9876543220' },
  { id: 'venue-004', userId: 'USR012', fullName: 'Ramesh Kumar', email: 'ramesh.kumar@vbsa.com', role: 'Electrician', vendorName: 'EventSpace India', mobile: '9876543221' },
  { id: 'venue-005', userId: 'USR013', fullName: 'Divya Chakraborty', email: 'divya.chakraborty@vbsa.com', role: 'Invigilators', vendorName: 'Premium Venues Corp', mobile: '9876543222' },
  
  // Manpower Team
  { id: 'mp-001', userId: 'USR014', fullName: 'Vikram Singh', email: 'vikram.singh@vbsa.com', role: 'Security Guards', vendorName: 'SecureForce Staffing', mobile: '9876543223' },
  { id: 'mp-002', userId: 'USR015', fullName: 'Ajay Kumar', email: 'ajay.kumar@vbsa.com', role: 'Security Guards', vendorName: 'ManpowerHub Solutions', mobile: '9876543224' },
  { id: 'mp-003', userId: 'USR016', fullName: 'Sneha Verma', email: 'sneha.verma@vbsa.com', role: 'Invigilators', vendorName: 'SecureForce Staffing', mobile: '9876543225' },
  { id: 'mp-004', userId: 'USR017', fullName: 'Ravi Shankar', email: 'ravi.shankar@vbsa.com', role: 'Housekeeping', vendorName: 'ManpowerHub Solutions', mobile: '9876543226' },
];

// Mock venues - colleges in Maharashtra
const ALL_VENUES = [
  { id: 'v-mum-001', code: 'MUM001', name: 'Mumbai University Exam Centre', city: 'Mumbai', district: 'Mumbai', lat: 19.184926, lng: 72.833073 },
  { id: 'v-mum-002', code: 'MUM002', name: 'IIT Bombay Campus', city: 'Mumbai', district: 'Mumbai', lat: 19.1136, lng: 72.9108 },
  { id: 'v-pune-001', code: 'PUN001', name: 'Savitribai Phule Pune University', city: 'Pune', district: 'Pune', lat: 18.5204, lng: 73.8567 },
  { id: 'v-pune-002', code: 'PUN002', name: 'COEP Technological University', city: 'Pune', district: 'Pune', lat: 18.5309, lng: 73.8234 },
  { id: 'v-nag-001', code: 'NAG001', name: 'Nagpur University Exam Hall', city: 'Nagpur', district: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { id: 'v-nag-002', code: 'NAG002', name: 'VNIT Nagpur', city: 'Nagpur', district: 'Nagpur', lat: 21.1881, lng: 79.0912 },
  { id: 'v-aurang-001', code: 'AUR001', name: 'Dr. Babasaheb Ambedkar University', city: 'Aurangabad', district: 'Aurangabad', lat: 19.8762, lng: 75.3433 },
  { id: 'v-aurang-002', code: 'AUR002', name: 'Aurangabad College', city: 'Aurangabad', district: 'Aurangabad', lat: 19.8878, lng: 75.3591 },
  { id: 'v-nashik-001', code: 'NAS001', name: 'Nashik University Centre', city: 'Nashik', district: 'Nashik', lat: 19.9975, lng: 73.7898 },
  { id: 'v-nashik-002', code: 'NAS002', name: 'KKHA Exam Centre', city: 'Nashik', district: 'Nashik', lat: 19.9989, lng: 73.8234 },
  { id: 'v-kolhapur-001', code: 'KOL001', name: 'Shivaji University', city: 'Kolhapur', district: 'Kolhapur', lat: 16.7050, lng: 74.2432 },
  { id: 'v-kolhapur-002', code: 'KOL002', name: 'Kolhapur Engineering Centre', city: 'Kolhapur', district: 'Kolhapur', lat: 16.7084, lng: 74.2254 },
];

const Step3_UserVenue = ({ formData, setFormData }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedVenues, setSelectedVenues] = useState([]); // multi-select venues
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterVenue, setFilterVenue] = useState('');
  const [filterPartner, setFilterPartner] = useState('');
  const [filterUserRole, setFilterUserRole] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  // New states for user search and venue filters
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [venueSearchQuery, setVenueSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterCity, setFilterCity] = useState('');

  // Get unique user roles for filter dropdown
  const uniqueUserRoles = useMemo(() => {
    const roles = new Set();
    ALL_USERS.forEach(u => roles.add(u.role));
    return Array.from(roles).sort();
  }, []);

  // Get unique venues for filter dropdown
  const uniqueVenues = useMemo(() => {
    return ALL_VENUES.map(v => v.name).sort();
  }, []);

  // Get unique partners for filter dropdown
  const uniquePartners = useMemo(() => {
    return ALL_PARTNERS.map(p => p.name).sort();
  }, []);

  // Get unique districts for venue filters
  const uniqueDistricts = useMemo(() => {
    const districts = new Set();
    ALL_VENUES.forEach(v => districts.add(v.district));
    return Array.from(districts).sort();
  }, []);

  // Get unique cities for venue filters
  const uniqueCities = useMemo(() => {
    const cities = new Set();
    ALL_VENUES.forEach(v => cities.add(v.city));
    return Array.from(cities).sort();
  }, []);

  // Get users filtered by selected partner
  const filteredUsersByPartner = useMemo(() => {
    if (!selectedPartner) return [];
    const partner = ALL_PARTNERS.find(p => p.id === selectedPartner);
    if (!partner) return [];
    // Only match on user's full name (case-insensitive, partial)
    let users = ALL_USERS.filter(u => u.vendorName === partner.name);
    if (userSearchQuery.trim()) {
      const query = userSearchQuery.toLowerCase();
      users = users.filter(u => u.fullName.toLowerCase().includes(query));
    }
    return users;
  }, [selectedPartner, userSearchQuery]);

  // Get venues associated with selected partner from Step 2 mappings, filtered by search/district/city
  const filteredVenuesByPartner = useMemo(() => {
    if (!selectedPartner) return [];
    const partnerMapping = (formData.vendorMappings || []).find(m => m.partnerId === selectedPartner);
    if (!partnerMapping) return [];
    
    // Get venues from partner mapping
    let venues = [];
    if (Array.isArray(partnerMapping.venues)) {
      venues = partnerMapping.venues.map(v => ALL_VENUES.find(venue => venue.id === v.venueId)).filter(Boolean);
    } else if (partnerMapping.venueId) {
      const venue = ALL_VENUES.find(v => v.id === partnerMapping.venueId);
      venues = venue ? [venue] : [];
    }

    // Apply search filter
    if (venueSearchQuery.trim()) {
      const query = venueSearchQuery.toLowerCase();
      venues = venues.filter(v => 
        v.name.toLowerCase().includes(query) ||
        v.code.toLowerCase().includes(query)
      );
    }

    // Apply district filter
    if (filterDistrict) {
      venues = venues.filter(v => v.district === filterDistrict);
    }

    // Apply city filter
    if (filterCity) {
      venues = venues.filter(v => v.city === filterCity);
    }

    return venues;
  }, [selectedPartner, formData.vendorMappings, venueSearchQuery, filterDistrict, filterCity]);

  // Filter mappings based on selected filters
  const filteredMappings = useMemo(() => {
    return (formData.userMappings || []).filter(m => {
      if (filterPartner && m.partnerName !== filterPartner) return false;
      if (filterVenue && m.venueName !== filterVenue) return false;
      if (filterUserRole && m.userRole !== filterUserRole) return false;
      return true;
    });
  }, [formData.userMappings, filterPartner, filterVenue, filterUserRole]);

  const handleAddMapping = () => {
    if (!selectedPartner || !selectedUser || selectedVenues.length === 0) return;
    
    const partner = ALL_PARTNERS.find(p => p.id === selectedPartner);
    const user = ALL_USERS.find(u => u.id === selectedUser);
    
    if (!partner || !user) return;

    // Build venues array from selected venue IDs
    const venues = selectedVenues.map(vid => {
      const v = ALL_VENUES.find(venue => venue.id === vid);
      return v ? { venueId: v.id, venueName: v.name, city: v.city, lat: v.lat, lng: v.lng } : null;
    }).filter(Boolean);

    const newMapping = { 
      partnerId: partner.id,
      partnerName: partner.name,
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      userEmail: user.email,
      userMobile: user.mobile,
      venues, // array of venue objects
    };

    if (editingIdx !== null) {
      const next = [...(formData.userMappings || [])];
      next[editingIdx] = newMapping;
      setFormData({ ...formData, userMappings: next });
      setEditingIdx(null);
    } else {
      const next = [...(formData.userMappings || []), newMapping];
      setFormData({ ...formData, userMappings: next });
    }
    
    setSelectedPartner('');
    setSelectedUser('');
    setSelectedVenues([]);
    setShowModal(false);
  };

  const handleEditMapping = (idx) => {
    const m = (formData.userMappings || [])[idx];
    setSelectedPartner(m.partnerId);
    setSelectedUser(m.userId);
    // Support both old single-venue format and new multi-venue format
    if (Array.isArray(m.venues)) {
      setSelectedVenues(m.venues.map(v => v.venueId));
    } else if (m.venueId) {
      setSelectedVenues([m.venueId]);
    } else {
      setSelectedVenues([]);
    }
    setEditingIdx(idx);
    setShowModal(true);
  };

  const toggleVenue = (venueId) => {
    setSelectedVenues(prev => 
      prev.includes(venueId) ? prev.filter(id => id !== venueId) : [...prev, venueId]
    );
  };

  const selectAllVenues = () => setSelectedVenues(filteredVenuesByPartner.map(v => v.id));
  const clearAllVenues = () => setSelectedVenues([]);

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>User ↔ Venue Mapping</h2>

   

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 14, color: '#6b7280' }}>{filteredMappings.length} mapping(s)</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => exportUserMappings(filteredMappings, 'user-venue-mapping.csv')} type="button" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'white', color: '#374151', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowFilterModal(true)} type="button" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'white', color: '#374151', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
            <Filter size={16} /> Filter
          </button>
          <button onClick={() => { setShowModal(true); setEditingIdx(null); setSelectedPartner(''); setSelectedUser(''); setSelectedVenues([]); }} type="button" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', border: 'none', cursor: 'pointer' }}>
            <Plus size={16} /> Map User to Venues
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {filteredMappings.length === 0 ? (
          <div style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>No mappings yet. Click "+Map User to Venues" to add.</div>
        ) : (
          <table className="table" style={{ marginBottom: 0 }}>
            <thead>
              <tr>
                <th>Sr.</th>
                <th>User Name</th>
                <th>User Role</th>
                <th>Venue Name</th>
                <th>Partner Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>City</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMappings.map((m, i) => {
                // Support both old single-venue and new multi-venue format
                const venueList = Array.isArray(m.venues) ? m.venues : (m.venueName ? [{ venueName: m.venueName, city: m.city }] : []);
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td><strong>{m.userName}</strong></td>
                    <td>
                      <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: '#f0f4ff', color: 'var(--color-primary)' }}>
                        {m.userRole}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {venueList.map((v, vi) => {
                          const venueObj = ALL_VENUES.find(venue => venue.venueName === v.venueName);
                          return (
                            <span key={vi} style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 6, fontSize: 12, background: '#eef2ff', color: '#374151' }}>
                              {venueObj?.code ? `${venueObj.code} - ` : ''}{v.venueName}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td><strong>{m.partnerName}</strong></td>
                    <td style={{ fontSize: 12 }}>{m.userEmail}</td>
                    <td style={{ fontSize: 12 }}>{m.userMobile}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {venueList.map((v, vi) => (
                          <span key={vi} style={{ fontSize: 12, color: '#6b7280' }}>{v.city}{vi < venueList.length - 1 ? ',' : ''}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button onClick={() => handleEditMapping(i)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: 4 }}>
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }} onClick={() => { setShowModal(false); setUserDropdownOpen(false); }}>
          <div style={{ width: 420, maxWidth: '95%', background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{editingIdx !== null ? 'Edit Mapping' : 'Map User to Venue'}</div>
              <button onClick={() => setShowModal(false)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#6b7280' }}>×</button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Select Partner *</label>
              <select value={selectedPartner} onChange={e => { setSelectedPartner(e.target.value); setSelectedUser(''); setSelectedVenues([]); setUserSearchQuery(''); setVenueSearchQuery(''); setFilterDistrict(''); setFilterCity(''); setUserDropdownOpen(false); }} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
                <option value="">Choose a partner</option>
                {ALL_PARTNERS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Select User *</label>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => { if (selectedPartner) setUserDropdownOpen(v => !v); }}
                  role="button"
                  tabIndex={0}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: selectedPartner ? 'pointer' : 'not-allowed',
                    opacity: selectedPartner ? 1 : 0.6
                  }}
                >
                  <div style={{ color: selectedUser ? '#111827' : '#6b7280' }}>
                    {selectedUser ? `${ALL_USERS.find(u => u.id === selectedUser)?.fullName} (${ALL_USERS.find(u => u.id === selectedUser)?.role})` : `Choose a user ${filteredUsersByPartner.length > 0 ? `(${filteredUsersByPartner.length} found)` : ''}`}
                  </div>
                  <div style={{ marginLeft: 8, color: '#6b7280' }}>{userDropdownOpen ? '▴' : '▾'}</div>
                </div>

                {userDropdownOpen && (
                  <div style={{ position: 'absolute', left: 0, right: 0, marginTop: 8, zIndex: 1400 }} onClick={e => e.stopPropagation()}>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', padding: 8, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
                      <div style={{ position: 'relative', marginBottom: 8 }}>
                        <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#6b7280' }} />
                        <input
                          value={userSearchQuery}
                          onChange={e => setUserSearchQuery(e.target.value)}
                          placeholder="Search by name, email, mobile, or ID"
                          style={{ width: '100%', padding: '8px 10px 8px 36px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13 }}
                        />
                        {userSearchQuery && (
                          <button onClick={() => setUserSearchQuery('')} style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                        {filteredUsersByPartner.length === 0 ? (
                          <div style={{ padding: 8, color: '#6b7280' }}>No users match your search</div>
                        ) : (
                          filteredUsersByPartner.map(u => (
                            <div key={u.id} onClick={() => { setSelectedUser(u.id); setUserDropdownOpen(false); }} style={{ padding: 8, borderRadius: 6, cursor: 'pointer', background: selectedUser === u.id ? '#eef2ff' : 'transparent' }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{u.fullName}</div>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>{u.role} • {u.userId} • {u.mobile}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Select Venues * <span style={{ fontWeight: 400, color: '#6b7280' }}>({selectedVenues.length} selected)</span></label>
              {!selectedPartner ? (
                <div style={{ padding: 16, textAlign: 'center', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
                  Please select a partner first to see available venues
                </div>
              ) : filteredVenuesByPartner.length === 0 && !venueSearchQuery && !filterDistrict && !filterCity ? (
                <div style={{ padding: 16, textAlign: 'center', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 8, background: '#fef2f2' }}>
                  No venues mapped for this partner. Please map venues in Step 2 first.
                </div>
              ) : (
                <>
                  {/* Venue Search Bar */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Search size={16} style={{ position: 'absolute', left: 10, color: '#6b7280' }} />
                      <input
                        type="text"
                        placeholder="Search venues by name or code (e.g., MUM001)"
                        value={venueSearchQuery}
                        onChange={e => setVenueSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 10px 10px 36px',
                          borderRadius: 8,
                          border: '1px solid #d1d5db',
                          fontSize: 13
                        }}
                      />
                      {venueSearchQuery && (
                        <button
                          onClick={() => setVenueSearchQuery('')}
                          style={{
                            position: 'absolute',
                            right: 10,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: 0
                          }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* District and City Filters */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>District</label>
                      <select
                        value={filterDistrict}
                        onChange={e => setFilterDistrict(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                      >
                        <option value="">All</option>
                        {uniqueDistricts.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>City</label>
                      <select
                        value={filterCity}
                        onChange={e => setFilterCity(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                      >
                        <option value="">All</option>
                        {uniqueCities.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <button type="button" onClick={selectAllVenues} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', fontSize: 12 }}>Select All</button>
                    <button type="button" onClick={clearAllVenues} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', fontSize: 12 }}>Clear All</button>
                  </div>
                  <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}>
                    {filteredVenuesByPartner.length === 0 ? (
                      <div style={{ padding: 12, textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
                        No venues match your filters
                      </div>
                    ) : (
                      filteredVenuesByPartner.map(v => (
                        <label key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px', borderRadius: 6, cursor: 'pointer', background: selectedVenues.includes(v.id) ? '#eef2ff' : 'transparent' }}>
                          <input type="checkbox" checked={selectedVenues.includes(v.id)} onChange={() => toggleVenue(v.id)} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{v.code} - {v.name}</div>
                            <div style={{ fontSize: 11, color: '#6b7280' }}>{v.city}, {v.district}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowModal(false)} type="button" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Cancel</button>
              <button onClick={handleAddMapping} type="button" style={{ padding: '8px 12px', borderRadius: 8, background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', border: 'none' }}>{editingIdx !== null ? 'Update' : 'Add Mapping'}</button>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }} onClick={() => setShowFilterModal(false)}>
          <div style={{ width: 420, maxWidth: '95%', background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Filter Mappings</div>
              <button onClick={() => setShowFilterModal(false)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#6b7280' }}>×</button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Partner</label>
              <select value={filterPartner} onChange={e => setFilterPartner(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
                <option value="">All Partners</option>
                {uniquePartners.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Venue Name</label>
              <select value={filterVenue} onChange={e => setFilterVenue(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
                <option value="">All Venues</option>
                {uniqueVenues.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>User Role</label>
              <select value={filterUserRole} onChange={e => setFilterUserRole(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
                <option value="">All Roles</option>
                {uniqueUserRoles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => { setFilterPartner(''); setFilterVenue(''); setFilterUserRole(''); }} type="button" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Clear</button>
              <button onClick={() => setShowFilterModal(false)} type="button" style={{ padding: '8px 12px', borderRadius: 8, background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', border: 'none' }}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3_UserVenue;
