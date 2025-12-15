import React, { useState, useMemo } from 'react';
import { Plus, Filter, Edit2, Download } from 'lucide-react';
import { exportPartnerMappings } from '../utils/excelExport';

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

// Mock venues - colleges in Maharashtra
const ALL_VENUES = [
  { id: 'v-mum-001', name: 'Mumbai University Exam Centre', city: 'Mumbai', lat: 19.184926, lng: 72.833073 },
  { id: 'v-mum-002', name: 'IIT Bombay Campus', city: 'Mumbai', lat: 19.1136, lng: 72.9108 },
  { id: 'v-pune-001', name: 'Savitribai Phule Pune University', city: 'Pune', lat: 18.5204, lng: 73.8567 },
  { id: 'v-pune-002', name: 'COEP Technological University', city: 'Pune', lat: 18.5309, lng: 73.8234 },
  { id: 'v-nag-001', name: 'Nagpur University Exam Hall', city: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { id: 'v-nag-002', name: 'VNIT Nagpur', city: 'Nagpur', lat: 21.1881, lng: 79.0912 },
  { id: 'v-aurang-001', name: 'Dr. Babasaheb Ambedkar University', city: 'Aurangabad', lat: 19.8762, lng: 75.3433 },
  { id: 'v-aurang-002', name: 'Aurangabad College', city: 'Aurangabad', lat: 19.8878, lng: 75.3591 },
  { id: 'v-nashik-001', name: 'Nashik University Centre', city: 'Nashik', lat: 19.9975, lng: 73.7898 },
  { id: 'v-nashik-002', name: 'KKHA Exam Centre', city: 'Nashik', lat: 19.9989, lng: 73.8234 },
  { id: 'v-kolhapur-001', name: 'Shivaji University', city: 'Kolhapur', lat: 16.7050, lng: 74.2432 },
  { id: 'v-kolhapur-002', name: 'Kolhapur Engineering Centre', city: 'Kolhapur', lat: 16.7084, lng: 74.2254 },
];

const Step2_PartnerVenue = ({ formData, setFormData, parentPartnerIds = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [selectedVenues, setSelectedVenues] = useState([]); // multi-select venues
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterVenue, setFilterVenue] = useState('');
  const [filterPartnerType, setFilterPartnerType] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);

  // Filter partners: only show those mapped to parent project
  const filteredPartners = useMemo(() => {
    if (parentPartnerIds.length === 0) {
      return ALL_PARTNERS; // Show all if no parent project or no mappings
    }
    return ALL_PARTNERS.filter(p => parentPartnerIds.includes(p.id));
  }, [parentPartnerIds]);

  // Get unique partner types for filter dropdown
  const uniquePartnerTypes = useMemo(() => {
    const types = new Set();
    filteredPartners.forEach(p => p.vendorTypes.forEach(t => types.add(t)));
    return Array.from(types).sort();
  }, [filteredPartners]);

  // Get unique venues for filter dropdown
  const uniqueVenues = useMemo(() => {
    return ALL_VENUES.map(v => v.name).sort();
  }, []);

  // Filter mappings based on selected filters
  const filteredMappings = useMemo(() => {
    return (formData.vendorMappings || []).filter(m => {
      if (filterVenue && m.venueName !== filterVenue) return false;
      if (filterPartnerType && m.partnerType !== filterPartnerType) return false;
      return true;
    });
  }, [formData.vendorMappings, filterVenue, filterPartnerType]);

  const handleAddMapping = () => {
    if (!selectedPartner || selectedVenues.length === 0) return;
    
    const partner = filteredPartners.find(p => p.id === selectedPartner);
    if (!partner) return;

    // Build venues array from selected venue IDs
    const venues = selectedVenues.map(vid => {
      const v = ALL_VENUES.find(venue => venue.id === vid);
      return v ? { venueId: v.id, venueName: v.name, city: v.city, lat: v.lat, lng: v.lng } : null;
    }).filter(Boolean);

    const newMapping = { 
      partnerId: partner.id,
      partnerName: partner.name,
      partnerType: partner.vendorTypes[0],
      venues, // array of venue objects
      contactPerson: partner.contactPerson,
      phone: partner.phone,
      status: partner.status
    };

    if (editingIdx !== null) {
      const next = [...(formData.vendorMappings || [])];
      next[editingIdx] = newMapping;
      setFormData({ ...formData, vendorMappings: next });
      setEditingIdx(null);
    } else {
      const next = [...(formData.vendorMappings || []), newMapping];
      setFormData({ ...formData, vendorMappings: next });
    }
    
    setSelectedPartner('');
    setSelectedVenues([]);
    setShowModal(false);
  };

  const handleEditMapping = (idx) => {
    const m = (formData.vendorMappings || [])[idx];
    setSelectedPartner(m.partnerId);
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

  const selectAllVenues = () => setSelectedVenues(ALL_VENUES.map(v => v.id));
  const clearAllVenues = () => setSelectedVenues([]);

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>Partner ↔ Venue Mapping</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 14, color: '#6b7280' }}>{filteredMappings.length} mapping(s)</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => exportPartnerMappings(filteredMappings, 'partner-venue-mapping.csv')} type="button" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'white', color: '#374151', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowFilterModal(true)} type="button" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'white', color: '#374151', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
            <Filter size={16} /> Filter
          </button>
          <button onClick={() => { setShowModal(true); setEditingIdx(null); setSelectedPartner(''); setSelectedVenues([]); }} type="button" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', border: 'none', cursor: 'pointer' }}>
            <Plus size={16} /> Map Partner to Venues
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {filteredMappings.length === 0 ? (
          <div style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>No mappings yet. Click "+Map Partner to Venues" to add.</div>
        ) : (
          <table className="table" style={{ marginBottom: 0 }}>
            <thead>
              <tr>
                <th>Sr.</th>
                <th>Partner Name</th>
                <th>Partner Type</th>
                <th>Venue Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Status</th>
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
                    <td><strong>{m.partnerName}</strong></td>
                    <td>
                      <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: '#f0f4ff', color: 'var(--color-primary)' }}>
                        {m.partnerType}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {venueList.map((v, vi) => (
                          <span key={vi} style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 6, fontSize: 12, background: '#eef2ff', color: '#374151' }}>
                            {v.venueName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{m.contactPerson}</td>
                    <td style={{ fontSize: 13 }}>{m.phone}</td>
                    <td>
                      <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: m.status === 'Active' ? '#d1fae5' : '#fecaca', color: m.status === 'Active' ? '#059669' : '#dc2626' }}>
                        {m.status}
                      </span>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }} onClick={() => setShowModal(false)}>
          <div style={{ width: 420, maxWidth: '95%', background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{editingIdx !== null ? 'Edit Mapping' : 'Map Partner to Venue'}</div>
              <button onClick={() => setShowModal(false)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#6b7280' }}>×</button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Select Partner *</label>
              <select value={selectedPartner} onChange={e => setSelectedPartner(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
                <option value="">Choose a partner</option>
                {filteredPartners.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.vendorTypes[0]})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Select Venues * <span style={{ fontWeight: 400, color: '#6b7280' }}>({selectedVenues.length} selected)</span></label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button type="button" onClick={selectAllVenues} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', fontSize: 12 }}>Select All</button>
                <button type="button" onClick={clearAllVenues} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', fontSize: 12 }}>Clear All</button>
              </div>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}>
                {ALL_VENUES.map(v => (
                  <label key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', background: selectedVenues.includes(v.id) ? '#eef2ff' : 'transparent' }}>
                    <input type="checkbox" checked={selectedVenues.includes(v.id)} onChange={() => toggleVenue(v.id)} />
                    <span style={{ flex: 1 }}>{v.name}</span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>({v.city})</span>
                  </label>
                ))}
              </div>
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
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Venue Name</label>
              <select value={filterVenue} onChange={e => setFilterVenue(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
                <option value="">All Venues</option>
                {uniqueVenues.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Partner Type</label>
              <select value={filterPartnerType} onChange={e => setFilterPartnerType(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
                <option value="">All Types</option>
                {uniquePartnerTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => { setFilterVenue(''); setFilterPartnerType(''); }} type="button" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Clear</button>
              <button onClick={() => setShowFilterModal(false)} type="button" style={{ padding: '8px 12px', borderRadius: 8, background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', border: 'none' }}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2_PartnerVenue;
