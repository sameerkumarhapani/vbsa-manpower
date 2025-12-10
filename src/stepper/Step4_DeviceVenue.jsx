import React, { useState, useMemo, useEffect } from 'react';
import { HelpCircle, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Device types with their ratios (per the attachment)
const DEVICE_TYPES = [
  { id: 1, name: 'HHMD', ratio: 100, ratioCount: 2, label: 'HHMD (Handheld Metal Detectors)' },
  { id: 2, name: 'Body Cam', ratio: 24, ratioCount: 1, label: 'Body Cams' },
  { id: 3, name: 'Servers', ratio: 100, ratioCount: 2, label: 'Servers' },
  { id: 4, name: 'CCTV Kit', ratio: 24, ratioCount: 1, ratioExtra: 5, label: 'CCTV Kit' },
  { id: 5, name: 'Biometric', ratio: 50, ratioCount: 1, label: 'Biometric Tabs + Fingerprint Reader Kit' },
];

// Dummy candidates per venue (in real scenario, this would come from exam data)
const VENUE_CANDIDATES = {
  'Mumbai University Exam Centre': 250,
  'IIT Bombay Campus': 180,
  'Savitribai Phule Pune University': 320,
  'COEP Technological University': 200,
  'Nagpur University Exam Hall': 150,
  'VNIT Nagpur': 170,
  'Dr. Babasaheb Ambedkar University': 140,
  'Aurangabad College': 130,
  'Nashik University Centre': 160,
  'KKHA Exam Centre': 155,
  'Shivaji University': 190,
  'Kolhapur Engineering Centre': 210,
};

const Step4_DeviceVenue = ({ formData, setFormData }) => {
  const [tooltipActive, setTooltipActive] = useState(null);
  const { user } = useAuth();

  // Auto-calculate buffer as 10% of required (rounded up)
  const calculateBuffer = (required) => Math.ceil(required * 0.1);

  // Helper: Generate random device requirements for a date
  const generateRandomDeviceDataForDate = () => {
    return {
      required: Math.floor(Math.random() * 30) + 5, // 5-35
      buffer: Math.floor(Math.random() * 8) + 1,    // 1-8
    };
  };
  
  // Get unique venues from partner<>venue mappings (Step 2)
  const mappedVenues = useMemo(() => {
    const venueSet = new Set();
    (formData.vendorMappings || []).forEach(vm => {
      // Support both old single-venue format and new multi-venue format
      if (Array.isArray(vm.venues)) {
        vm.venues.forEach(v => {
          if (v.venueName) venueSet.add(v.venueName);
        });
      } else if (vm.venueName) {
        venueSet.add(vm.venueName);
      }
    });
    return Array.from(venueSet).sort();
  }, [formData.vendorMappings]);

  // Initialize device mappings - create initial structure on first render or when venues change
  const createInitialMappings = () => {
    const initial = [];
    mappedVenues.forEach(venueName => {
      DEVICE_TYPES.forEach(device => {
        const candidates = VENUE_CANDIDATES[venueName] || 100;
        let required = Math.ceil((device.ratioCount * candidates) / device.ratio);
        if (device.ratioExtra) {
          required += device.ratioExtra;
        }
        initial.push({
          venueName,
          deviceType: device.name,
          deviceId: device.id,
          candidates,
          required,
          buffer: calculateBuffer(required),
          sent: 0,
          received: 0,
        });
      });
    });
    return initial;
  };

  // Initialize per-date device data with random values
  const initializePerDateDeviceData = () => {
    const dateData = {};
    (formData.selectedDates || []).forEach(date => {
      const mappingsForDate = [];
      mappedVenues.forEach(venueName => {
        DEVICE_TYPES.forEach(device => {
          const randomData = generateRandomDeviceDataForDate();
          // For lab-wise devices (Body Cam, CCTV Kit) create two lab rows: Lab-1 and Lab-2
          const labDevices = ['Body Cam', 'CCTV Kit'];
          if (labDevices.includes(device.name)) {
            ['Lab-1', 'Lab-2'].forEach(lab => {
              mappingsForDate.push({
                venueName,
                locationType: lab,
                deviceType: device.name,
                deviceId: device.id,
                candidates: VENUE_CANDIDATES[venueName] || 100,
                required: Math.max(1, Math.floor(randomData.required / 2)),
                buffer: Math.max(0, Math.floor(randomData.buffer / 2)),
                sent: 0,
                received: 0,
              });
            });
          } else {
            // Common devices
            mappingsForDate.push({
              venueName,
              locationType: 'Common',
              deviceType: device.name,
              deviceId: device.id,
              candidates: VENUE_CANDIDATES[venueName] || 100,
              required: randomData.required,
              buffer: randomData.buffer,
              sent: 0,
              received: 0,
            });
          }
        });
      });
      dateData[date] = mappingsForDate;
    });
    return dateData;
  };

  const [deviceMappings, setDeviceMappings] = useState(() => {
    // If formData contains device requirement rows (has `required` field), reuse them.
    if (formData.mappedDevices && formData.mappedDevices.length > 0 && formData.mappedDevices[0].required !== undefined) {
      return formData.mappedDevices;
    }
    // otherwise initialize requirement rows freshly
    return createInitialMappings();
  });

  // Per-date device mappings with random data
  const [perDateDeviceMappings, setPerDateDeviceMappings] = useState(() => {
    if (formData.perDateDeviceMappings) {
      return formData.perDateDeviceMappings;
    }
    return initializePerDateDeviceData();
  });

  // Actual mapped devices (instances) — empty by default, stored in formData.mappedDevices
  const [mappedDevicesList, setMappedDevicesList] = useState(() => {
    // If formData.mappedDevices contains requirement rows (has `required`), ignore them for the mapped-instances list
    if (formData.mappedDevices && formData.mappedDevices.length > 0 && formData.mappedDevices[0].required !== undefined) {
      return [];
    }
    return formData.mappedDevices || [];
  });

  // Device master list (Device Management). Copied from DevicesView master list to use in modal
  const DEVICES_MASTER = [
    { deviceId: 'DV-1001', name: 'Biometric-Scanner-01', type: 'Biometric Device', vendorName: 'FingerPrint Tech' },
    { deviceId: 'DV-1002', name: 'BodyCam-01', type: 'Body Camera', vendorName: 'ActionCam Pro' },
    { deviceId: 'DV-1003', name: 'Server-01', type: 'Server', vendorName: 'Cloud Infrastructure Inc' },
    { deviceId: 'DV-1004', name: 'CCTV-02', type: 'CCTV', vendorName: 'SecureVision Systems' },
    { deviceId: 'DV-1005', name: 'Biometric-Terminal-02', type: 'Biometric Device', vendorName: 'BioMetrics India' },
    { deviceId: 'DV-1006', name: 'BodyCam-02', type: 'Body Camera', vendorName: 'BodyTrack Solutions' },
    { deviceId: 'DV-1007', name: 'Server-02', type: 'Server', vendorName: 'Network Solutions Ltd' },
    { deviceId: 'DV-1008', name: 'CCTV-03', type: 'CCTV', vendorName: 'CameraGuard India' },
    { deviceId: 'DV-1009', name: 'Biometric-Scanner-03', type: 'Biometric Device', vendorName: 'FingerPrint Tech' },
    { deviceId: 'DV-1010', name: 'BodyCam-03', type: 'Body Camera', vendorName: 'ActionCam Pro' },
    { deviceId: 'DV-1011', name: 'Server-03', type: 'Server', vendorName: 'Cloud Infrastructure Inc' },
    { deviceId: 'DV-1012', name: 'CCTV-04', type: 'CCTV', vendorName: 'SecureVision Systems' },
  ];

  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState(() => new Set());
  const [selectedVenueForMapping, setSelectedVenueForMapping] = useState(mappedVenues[0] || '');
  const [filterMapDeviceType, setFilterMapDeviceType] = useState('');
  const [filterMapPartnerName, setFilterMapPartnerName] = useState('');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isEditingBuffers, setIsEditingBuffers] = useState(false);
  const [preEditMappings, setPreEditMappings] = useState(null);

  // Device Handling Activity state
  const [deviceActivities, setDeviceActivities] = useState(() => formData.deviceActivities || []);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState({ venueName: '', deviceType: '', action: 'send', quantity: 1, remarks: '' });

  // Selected date for Device Handling Status
  const [selectedStatusDate, setSelectedStatusDate] = useState(() => {
    const dates = formData.selectedDates || [];
    return dates.length > 0 ? dates[0] : '';
  });

  const toggleSelectDevice = (deviceId) => {
    const s = new Set(selectedDevices);
    if (s.has(deviceId)) s.delete(deviceId); else s.add(deviceId);
    setSelectedDevices(s);
  };

  const handleRemoveMapping = (deviceId) => {
    if (!window.confirm('Remove mapping for ' + deviceId + ' ?')) return;
    const updated = (mappedDevicesList || []).filter(m => m.deviceId !== deviceId);
    setMappedDevicesList(updated);
    setFormData({ ...formData, mappedDevices: updated, mappedDevicesSavedAt: new Date().toISOString(), mappedDevicesBy: user?.fullName || 'Unknown' });
  };

  const handleMapSelected = () => {
    if (!selectedVenueForMapping) { alert('Please select a venue to map devices to'); return; }
    const selected = DEVICES_MASTER.filter(d => selectedDevices.has(d.deviceId));
    if (selected.length === 0) { alert('Please select at least one device'); return; }
    const nowIso = new Date().toISOString();
    const additions = selected.map(d => ({
      venueName: selectedVenueForMapping,
      deviceType: d.type,
      deviceId: d.deviceId,
      deviceName: d.name,
      partnerName: d.vendorName,
      mappedAt: nowIso,
      mappedBy: user?.fullName || 'Unknown',
    }));
    // avoid duplicates by deviceId
    const existingIds = new Set((mappedDevicesList || []).map(m => m.deviceId));
    const toAdd = additions.filter(a => !existingIds.has(a.deviceId));
    const updated = [...mappedDevicesList, ...toAdd];
    setMappedDevicesList(updated);
    setFormData({ ...formData, mappedDevices: updated, mappedDevicesSavedAt: nowIso, mappedDevicesBy: user?.fullName || 'Unknown' });
    setSelectedDevices(new Set());
    setShowMapModal(false);
  };

  const groupedMappedByVenue = useMemo(() => {
    const g = {};
    (mappedDevicesList || []).forEach((r, idx) => {
      if (!g[r.venueName]) g[r.venueName] = [];
      g[r.venueName].push({ ...r, index: idx });
    });
    return g;
  }, [mappedDevicesList]);

  const uniqueMapDeviceTypes = useMemo(() => Array.from(new Set(DEVICES_MASTER.map(d => d.type))).sort(), []);
  const uniqueMapVendors = useMemo(() => Array.from(new Set(DEVICES_MASTER.map(d => d.vendorName))).sort(), []);
  // For the "Map Devices to Venue" modal we only allow mapping Body Camera and Server types
  const MAP_MODAL_DEVICE_TYPES = ['Body Camera', 'Server'];

  const filteredDevicesForModal = useMemo(() => {
    let list = DEVICES_MASTER.slice();
    if (filterMapDeviceType) list = list.filter(d => d.type === filterMapDeviceType);
    if (filterMapPartnerName) list = list.filter(d => d.vendorName === filterMapPartnerName);
    if (mapSearchQuery && mapSearchQuery.trim()) {
      const q = mapSearchQuery.trim().toLowerCase();
      list = list.filter(d => (d.deviceId || '').toLowerCase().includes(q) || (d.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [filterMapDeviceType, filterMapPartnerName, mapSearchQuery]);

  // Re-initialize when venues or dates change
  useEffect(() => {
    if (mappedVenues.length > 0 && (!deviceMappings || deviceMappings.length === 0)) {
      setDeviceMappings(createInitialMappings());
    }
    // Re-generate per-date device data when dates change
    setPerDateDeviceMappings(initializePerDateDeviceData());
  }, [mappedVenues, formData.selectedDates]);

  // Get device mappings for the selected date
  const adjustedDeviceMappings = useMemo(() => {
    if (!selectedStatusDate) {
      return deviceMappings;
    }
    // Return the specific mappings for the selected date
    return perDateDeviceMappings[selectedStatusDate] || deviceMappings;
  }, [selectedStatusDate, perDateDeviceMappings, deviceMappings]);

  // Calculate total for a device row
  const calculateTotal = (required, buffer) => required + buffer;

  // Calculate variance with count difference
  const getVariance = (received, total) => {
    const diff = received - total;
    if (diff > 0) return { status: 'Surplus', count: `+${diff}`, color: '#10b981' };
    if (diff < 0) return { status: 'Deficient', count: `${diff}`, color: '#ef4444' };
    return { status: 'Match', count: '0', color: '#6366f1' };
  };

  // Handle input changes
  const handleChange = (index, field, value) => {
    const updated = [...deviceMappings];
    updated[index] = { ...updated[index], [field]: parseInt(value) || 0 };
    setDeviceMappings(updated);
  };

  // Save to formData
  const handleSave = () => {
    const nowIso = new Date().toISOString();
    // Persist the per-date device mappings and actual mapped devices (instances)
    setFormData({ 
      ...formData, 
      perDateDeviceMappings, 
      mappedDevices: mappedDevicesList, 
      mappedDevicesSavedAt: nowIso, 
      mappedDevicesBy: user?.fullName || 'Unknown' 
    });
  };

  // Group data by venue for merged rows
  const groupedByVenue = useMemo(() => {
    const grouped = {};
    adjustedDeviceMappings.forEach((row, idx) => {
      if (!grouped[row.venueName]) {
        grouped[row.venueName] = [];
      }
      grouped[row.venueName].push({ ...row, index: idx });
    });
    return grouped;
  }, [adjustedDeviceMappings]);

  // Map venue -> partner name (safe lookup)
  const venueToPartner = useMemo(() => {
    const map = {};
    (formData.vendorMappings || []).forEach(vm => {
      const partner = vm.partnerName || vm.partner || vm.vendorName || vm.vendor || '—';
      // Support both old single-venue format and new multi-venue format
      if (Array.isArray(vm.venues)) {
        vm.venues.forEach(v => {
          if (v.venueName) map[v.venueName] = partner;
        });
      } else {
        const venue = vm.venueName || vm.venue || vm.name;
        if (venue) map[venue] = partner;
      }
    });
    return map;
  }, [formData.vendorMappings]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ marginTop: 0, marginBottom: 0 }}>Device Handling Status</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Select Date:</label>
          <select
            value={selectedStatusDate}
            onChange={e => setSelectedStatusDate(e.target.value)}
            style={{
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              fontSize: 12,
              fontWeight: 500,
              color: '#374151',
              background: 'white',
              cursor: 'pointer',
              minWidth: 150,
            }}
          >
            <option value="">Select a date</option>
            {(formData.selectedDates || []).map(date => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {deviceMappings.length === 0 ? (
          <div style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>No venues mapped from partner mappings. Please complete Step 2 first.</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }}>Venue</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }}>Common/Lab-wise</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }}>Device</th>
                    <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        Required
                        <button onClick={() => setTooltipActive(tooltipActive === 'required' ? null : 'required')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                          <HelpCircle size={14} color="var(--color-primary)" />
                        </button>
                      </div>
                      {tooltipActive === 'required' && (
                        <div style={{ position: 'absolute', background: '#1f2937', color: 'white', padding: '6px 8px', borderRadius: 4, fontSize: 11, marginTop: 4, width: 200, zIndex: 100 }}>
                          Calculated: (candidates × ratio) / 100
                        </div>
                      )}
                    </th>
                    <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        Buffer
                        <button onClick={() => setTooltipActive(tooltipActive === 'buffer' ? null : 'buffer')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                          <HelpCircle size={14} color="var(--color-primary)" />
                        </button>
                      </div>
                      {tooltipActive === 'buffer' && (
                        <div style={{ position: 'absolute', background: '#1f2937', color: 'white', padding: '6px 8px', borderRadius: 4, fontSize: 11, marginTop: 4, width: 200, zIndex: 100 }}>
                          Auto: 10% of Required (rounded up)
                        </div>
                      )}
                    </th>
                    <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        Total
                        <button onClick={() => setTooltipActive(tooltipActive === 'total' ? null : 'total')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                          <HelpCircle size={14} color="var(--color-primary)" />
                        </button>
                      </div>
                      {tooltipActive === 'total' && (
                        <div style={{ position: 'absolute', background: '#1f2937', color: 'white', padding: '6px 8px', borderRadius: 4, fontSize: 11, marginTop: 4, width: 200, zIndex: 100 }}>
                          Required + Buffer
                        </div>
                      )}
                    </th>
                    <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }}>Received</th>
                    <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap' }}>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedByVenue).map(([venueName, devices]) => {
                    // desired order of location groups
                    const locationOrder = ['Common', 'Lab-1', 'Lab-2'];
                    // group devices by locationType preserving order
                    const groups = locationOrder
                      .map(loc => ({ loc, rows: devices.filter(d => (d.locationType || 'Common') === loc) }))
                      .filter(g => g.rows.length > 0);

                    const rowsJsx = [];
                    groups.forEach((group, groupIdx) => {
                      group.rows.forEach((row, idx) => {
                        rowsJsx.push(
                          <tr key={`${row.deviceId}-${row.locationType}-${row.index || idx}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            {/* venue cell only on first overall row for this venue */}
                            {groupIdx === 0 && idx === 0 && (
                              <td rowSpan={devices.length} style={{ padding: '6px', verticalAlign: 'middle', fontWeight: 600, fontSize: 12, borderRight: '1px solid #e5e7eb' }}>
                                {venueName}
                              </td>
                            )}
                            {/* location cell only on first row of the group */}
                            {idx === 0 && (
                              <td rowSpan={group.rows.length} style={{ padding: '6px', borderRight: '1px solid #e5e7eb', verticalAlign: 'middle', fontWeight: 600 }}>
                                {group.loc}
                              </td>
                            )}
                            <td style={{ padding: '6px', borderRight: '1px solid #e5e7eb' }}>
                              <span style={{ padding: '3px 6px', borderRadius: 3, fontSize: 11, fontWeight: 600, background: '#f0f4ff', color: 'var(--color-primary)' }}>
                                {row.deviceType}
                              </span>
                            </td>
                            <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #e5e7eb' }}>
                              <input
                                type="number"
                                value={row.required}
                                readOnly
                                style={{
                                  width: 50,
                                  padding: '4px 4px',
                                  borderRadius: 3,
                                  border: '1px solid #d1d5db',
                                  background: '#f9fafb',
                                  textAlign: 'center',
                                  cursor: 'not-allowed',
                                  fontSize: 12,
                                }}
                              />
                            </td>
                            <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #e5e7eb' }}>
                              <input
                                type="number"
                                value={typeof row.buffer !== 'undefined' ? row.buffer : calculateBuffer(row.required)}
                                readOnly={!isEditingBuffers}
                                onChange={e => handleChange(row.index, 'buffer', e.target.value)}
                                style={{
                                  width: 50,
                                  padding: '4px 4px',
                                  borderRadius: 3,
                                  border: '1px solid #d1d5db',
                                  background: isEditingBuffers ? 'white' : '#f9fafb',
                                  textAlign: 'center',
                                  cursor: isEditingBuffers ? 'text' : 'not-allowed',
                                  fontSize: 12,
                                }}
                              />
                            </td>
                            <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #e5e7eb' }}>
                              <input
                                type="number"
                                value={calculateTotal(row.required, (typeof row.buffer !== 'undefined' && row.buffer !== null) ? Number(row.buffer) : calculateBuffer(row.required))}
                                readOnly
                                style={{
                                  width: 50,
                                  padding: '4px 4px',
                                  borderRadius: 3,
                                  border: '1px solid #d1d5db',
                                  background: '#f9fafb',
                                  textAlign: 'center',
                                  cursor: 'not-allowed',
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              />
                            </td>
                            <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #e5e7eb' }}>
                              <input
                                type="number"
                                value={row.received || 0}
                                disabled
                                style={{
                                  width: 50,
                                  padding: '4px 4px',
                                  borderRadius: 3,
                                  border: '1px solid #d1d5db',
                                  textAlign: 'center',
                                  fontSize: 12,
                                  background: '#fafafa'
                                }}
                              />
                            </td>
                            <td style={{ padding: '6px', textAlign: 'center' }}>
                              {(() => {
                                const total = calculateTotal(row.required, calculateBuffer(row.required));
                                const variance = getVariance(row.received, total);
                                return (
                                  <span
                                    style={{
                                      padding: '3px 6px',
                                      borderRadius: 3,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      background: variance.color + '20',
                                      color: variance.color,
                                    }}
                                  >
                                    {variance.count}
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                        );
                      });
                    });
                    return rowsJsx;
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {!isEditingBuffers ? (
                <button
                  onClick={() => { setPreEditMappings(deviceMappings.map(d => ({ ...d }))); setIsEditingBuffers(true); }}
                  type="button"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    background: 'white',
                    color: 'var(--color-primary)',
                    border: '1px solid var(--color-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      // Cancel - revert
                      if (preEditMappings) setDeviceMappings(preEditMappings);
                      setPreEditMappings(null);
                      setIsEditingBuffers(false);
                    }}
                    type="button"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      background: 'white',
                      color: '#374151',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      // persist buffers into formData and localStorage
                      const normalized = deviceMappings.map(dm => ({ ...dm, buffer: parseInt(dm.buffer) || calculateBuffer(dm.required) }));
                      setDeviceMappings(normalized);
                      const nowIso = new Date().toISOString();
                      setFormData({ ...formData, deviceMappings: normalized, deviceMappingsSavedAt: nowIso });
                      try { localStorage.setItem('deviceMappings', JSON.stringify(normalized)); } catch (e) { /* ignore */ }
                      setPreEditMappings(null);
                      setIsEditingBuffers(false);
                      alert('Buffer values updated and saved locally.');
                    }}
                    type="button"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    Update
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Device Handling Activity Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Device Handling Activity</h2>
        <button
          onClick={() => {
            setActivityForm({ venueName: mappedVenues[0] || '', deviceType: DEVICE_TYPES[0]?.name || '', action: 'send', quantity: 1, remarks: '' });
            setShowActivityModal(true);
          }}
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 6,
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13
          }}
        >
          <Plus size={14} /> Log Activity
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {deviceActivities.length === 0 ? (
          <div style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>No device handling activities logged yet. Use <strong>Log Activity</strong> to record send/receive actions.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>Date/Time</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>Venue</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>Device Type</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap' }}>Action</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap' }}>Quantity</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>Remarks</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>Logged By</th>
                </tr>
              </thead>
              <tbody>
                {deviceActivities.map((activity, idx) => (
                  <tr key={activity.id || idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 6px', fontSize: 12 }}>{new Date(activity.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '8px 6px', fontWeight: 600 }}>{activity.venueName}</td>
                    <td style={{ padding: '8px 6px' }}>
                      <span style={{ padding: '3px 6px', borderRadius: 3, fontSize: 11, fontWeight: 600, background: '#f0f4ff', color: 'var(--color-primary)' }}>
                        {activity.deviceType}
                      </span>
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        background: activity.action === 'send' ? '#fef3c7' : '#d1fae5',
                        color: activity.action === 'send' ? '#92400e' : '#065f46'
                      }}>
                        {activity.action === 'send' ? '📤 Sent' : '📥 Received'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600 }}>{activity.quantity}</td>
                    <td style={{ padding: '8px 6px', color: '#6b7280', fontSize: 12 }}>{activity.remarks || '—'}</td>
                    <td style={{ padding: '8px 6px', fontSize: 12 }}>{activity.loggedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Device Mapping Section */}
      <h2 style={{ marginTop: 24, marginBottom: 12 }}>Device Mapping</h2>

      <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>Mapped Devices</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{(mappedDevicesList && mappedDevicesList.length) ? `${mappedDevicesList.length} rows` : 'No mapped devices'}</div>
            <button
              onClick={() => { setShowMapModal(true); setSelectedVenueForMapping(mappedVenues[0] || ''); }}
              type="button"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 6, background: 'white', border: '1px solid #e5e7eb', cursor: 'pointer', fontWeight: 600 }}
            >
              <Plus size={14} /> Map Device
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {(!mappedDevicesList || mappedDevicesList.length === 0) ? (
            <div style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>
              No devices mapped yet. Use <strong>Map Device</strong> to assign devices to venues.
            </div>
          ) : (
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }}>Venue Name</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }}>Device Type</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }}>Device ID</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }}>Device Name</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }}>Partner Name</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }}>Activity</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedMappedByVenue).map(([venueName, rows]) => (
                  rows.map((row, i) => (
                    <tr key={row.deviceId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      {i === 0 && (
                        <td rowSpan={rows.length} style={{ padding: '8px 6px', verticalAlign: 'middle', fontWeight: 600, fontSize: 12, borderRight: '1px solid #e5e7eb' }}>{venueName}</td>
                      )}
                      <td style={{ padding: '8px 6px', borderRight: '1px solid #e5e7eb' }}>{row.deviceType}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #e5e7eb' }}>{row.deviceId}</td>
                      <td style={{ padding: '8px 6px', borderRight: '1px solid #e5e7eb' }}>{row.deviceName}</td>
                      <td style={{ padding: '8px 6px', borderRight: '1px solid #e5e7eb' }}>{row.partnerName || venueToPartner[venueName] || '—'}</td>
                      <td style={{ padding: '8px 6px', borderRight: '1px solid #e5e7eb', fontSize: 12, color: '#6b7280' }}>Mapped by {row.mappedBy || formData.mappedDevicesBy || user?.fullName || 'Unknown'} on {row.mappedAt ? new Date(row.mappedAt).toLocaleString() : (formData.mappedDevicesSavedAt ? new Date(formData.mappedDevicesSavedAt).toLocaleString() : 'Not saved')}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                        <button onClick={() => handleRemoveMapping(row.deviceId)} type="button" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #fca5a5', background: 'white', cursor: 'pointer', fontSize: 13, color: '#dc2626' }}>Remove</button>
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showMapModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }} onClick={() => setShowMapModal(false)}>
          <div style={{ width: '90%', maxWidth: 900, maxHeight: '85vh', overflow: 'auto', background: 'white', borderRadius: 12, padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Map Devices to Venue</div>
              <button onClick={() => setShowMapModal(false)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#6b7280' }}>×</button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
              <div style={{ minWidth: 220 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Select Venue *</label>
                <select value={selectedVenueForMapping} onChange={e => setSelectedVenueForMapping(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
                  <option value="">Select a venue</option>
                  {mappedVenues.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input placeholder="Search by ID or name" value={mapSearchQuery} onChange={e => setMapSearchQuery(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', minWidth: 220 }} />
                  <select value={filterMapDeviceType} onChange={e => setFilterMapDeviceType(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db' }}>
                    <option value="">All Types</option>
                    {MAP_MODAL_DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={filterMapPartnerName} onChange={e => setFilterMapPartnerName(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db' }}>
                    <option value="">All Partners</option>
                    {uniqueMapVendors.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setSelectedDevices(new Set(filteredDevicesForModal.map(d => d.deviceId))); }} type="button" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>Select All</button>
                  <button onClick={() => setSelectedDevices(new Set())} type="button" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>Clear</button>
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600 }}> </th>
                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600 }}>Device ID</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600 }}>Device Name</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600 }}>Device Type</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600 }}>Partner Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevicesForModal.map(d => (
                    <tr key={d.deviceId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                        <input type="checkbox" checked={selectedDevices.has(d.deviceId)} onChange={() => toggleSelectDevice(d.deviceId)} />
                      </td>
                      <td style={{ padding: '8px 6px' }}><strong>{d.deviceId}</strong></td>
                      <td style={{ padding: '8px 6px' }}>{d.name}</td>
                      <td style={{ padding: '8px 6px' }}>{d.type}</td>
                      <td style={{ padding: '8px 6px' }}>{d.vendorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowMapModal(false)} type="button" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Cancel</button>
              <button onClick={handleMapSelected} type="button" style={{ padding: '8px 12px', borderRadius: 8, background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', border: 'none' }}>Map Selected</button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }} onClick={() => setShowActivityModal(false)}>
          <div style={{ width: 500, maxWidth: '95%', background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Log Device Activity</div>
              <button onClick={() => setShowActivityModal(false)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#6b7280' }}>×</button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Venue <span style={{ color: '#dc2626' }}>*</span></label>
                <select
                  value={activityForm.venueName}
                  onChange={(e) => setActivityForm({ ...activityForm, venueName: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                >
                  <option value="">Select venue</option>
                  {mappedVenues.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Device Type <span style={{ color: '#dc2626' }}>*</span></label>
                <select
                  value={activityForm.deviceType}
                  onChange={(e) => setActivityForm({ ...activityForm, deviceType: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                >
                  <option value="">Select device type</option>
                  {DEVICE_TYPES.map(dt => <option key={dt.id} value={dt.name}>{dt.label || dt.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Action <span style={{ color: '#dc2626' }}>*</span></label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="action"
                      value="send"
                      checked={activityForm.action === 'send'}
                      onChange={(e) => setActivityForm({ ...activityForm, action: e.target.value })}
                    />
                    <span style={{ padding: '4px 8px', borderRadius: 4, background: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: 12 }}>📤 Send</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="action"
                      value="receive"
                      checked={activityForm.action === 'receive'}
                      onChange={(e) => setActivityForm({ ...activityForm, action: e.target.value })}
                    />
                    <span style={{ padding: '4px 8px', borderRadius: 4, background: '#d1fae5', color: '#065f46', fontWeight: 600, fontSize: 12 }}>📥 Receive</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Quantity <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  type="number"
                  min="1"
                  value={activityForm.quantity}
                  onChange={(e) => setActivityForm({ ...activityForm, quantity: parseInt(e.target.value) || 1 })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Remarks</label>
                <textarea
                  value={activityForm.remarks}
                  onChange={(e) => setActivityForm({ ...activityForm, remarks: e.target.value })}
                  placeholder="Optional notes..."
                  rows={2}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1d5db', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => setShowActivityModal(false)} type="button" style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  if (!activityForm.venueName) { alert('Please select a venue'); return; }
                  if (!activityForm.deviceType) { alert('Please select a device type'); return; }
                  if (!activityForm.quantity || activityForm.quantity < 1) { alert('Please enter valid quantity'); return; }

                  const newActivity = {
                    id: `ACT-${Date.now()}`,
                    venueName: activityForm.venueName,
                    deviceType: activityForm.deviceType,
                    action: activityForm.action,
                    quantity: activityForm.quantity,
                    remarks: activityForm.remarks,
                    timestamp: new Date().toISOString(),
                    loggedBy: user?.fullName || 'Unknown',
                  };

                  const updated = [newActivity, ...deviceActivities];
                  setDeviceActivities(updated);

                  // Update received counts in deviceMappings
                  if (activityForm.action === 'receive') {
                    const updatedMappings = deviceMappings.map(dm => {
                      if (dm.venueName === activityForm.venueName && dm.deviceType === activityForm.deviceType) {
                        return { ...dm, received: (dm.received || 0) + activityForm.quantity };
                      }
                      return dm;
                    });
                    setDeviceMappings(updatedMappings);
                    setFormData({ ...formData, deviceActivities: updated, deviceMappings: updatedMappings });
                  } else {
                    setFormData({ ...formData, deviceActivities: updated });
                  }

                  setShowActivityModal(false);
                  alert(`Activity logged: ${activityForm.action === 'send' ? 'Sent' : 'Received'} ${activityForm.quantity} ${activityForm.deviceType} ${activityForm.action === 'send' ? 'to' : 'from'} ${activityForm.venueName}`);
                }}
                type="button"
                style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Log Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4_DeviceVenue;
