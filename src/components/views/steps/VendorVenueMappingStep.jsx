import React, { useState, useMemo } from 'react';
import { Filter, Trash2, Download } from 'lucide-react';
import { exportPartnerMappings } from '../../../utils/excelExport';

const VendorVenueMappingStep = ({
  vendors = [],
  vendorMappings = [],
  vendorTypeCategories = [],
  selectedVendorTypeFilter = 'All',
  setSelectedVendorTypeFilter = () => {},
  mappedVendorVenueFilter = 'All',
  mappedVendorTypeFilter = 'All',
  setMappedVendorVenueFilter = () => {},
  setMappedVendorTypeFilter = () => {},
  showMappedVendorFilterModal = false,
  setShowMappedVendorFilterModal = () => {},
  tempMappedVenueFilter = 'All',
  setTempMappedVenueFilter = () => {},
  tempMappedTypeFilter = 'All',
  setTempMappedTypeFilter = () => {},
  showRemoveVendorConfirmModal = false,
  setShowRemoveVendorConfirmModal = () => {},
  vendorToRemove = null,
  setVendorToRemove = () => {},
  handleAddVendorMapping = () => {},
  handleRemoveVendorMapping = () => {},
}) => {
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter vendor mappings
  const filteredMappings = useMemo(() => {
    return (vendorMappings || []).filter(m => {
      if (mappedVendorVenueFilter !== 'All' && m.venue !== mappedVendorVenueFilter) return false;
      if (mappedVendorTypeFilter !== 'All' && m.vendorTypes && !m.vendorTypes.includes(mappedVendorTypeFilter)) return false;
      return true;
    });
  }, [vendorMappings, mappedVendorVenueFilter, mappedVendorTypeFilter]);

  // Get unique venues for filter
  const uniqueVenues = useMemo(() => {
    const venues = new Set(vendorMappings.map(m => m.venue).filter(Boolean));
    return Array.from(venues).sort();
  }, [vendorMappings]);

  // Get unique vendor types for filter
  const uniqueVendorTypes = useMemo(() => {
    const types = new Set();
    (vendorMappings || []).forEach(m => {
      if (m.vendorTypes && Array.isArray(m.vendorTypes)) {
        m.vendorTypes.forEach(t => types.add(t));
      }
    });
    return Array.from(types).sort();
  }, [vendorMappings]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#1f2937' }}>
          Vendor ↔ Venue Mapping
        </h2>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {filteredMappings.length} mapping(s)
        </div>
      </div>

      {/* Mapped Vendors */}
      {filteredMappings.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#374151' }}>
              Mapped Vendors
              {(mappedVendorVenueFilter !== 'All' || mappedVendorTypeFilter !== 'All') && (
                <span
                  style={{
                    marginLeft: '8px',
                    padding: '4px 8px',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                    color: 'white',
                    fontSize: '11px',
                    borderRadius: '8px',
                    fontWeight: 600,
                  }}
                >
                  Filtered
                </span>
              )}
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => exportPartnerMappings(filteredMappings, 'vendor-venue-mapping.csv')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
                title="Export vendor mappings as CSV"
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={() => {
                  setTempMappedVenueFilter(mappedVendorVenueFilter);
                  setTempMappedTypeFilter(mappedVendorTypeFilter);
                  setShowFilterModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background:
                    mappedVendorVenueFilter !== 'All' || mappedVendorTypeFilter !== 'All'
                      ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)'
                      : 'white',
                  color: mappedVendorVenueFilter !== 'All' || mappedVendorTypeFilter !== 'All' ? 'white' : '#374151',
                  border:
                    mappedVendorVenueFilter !== 'All' || mappedVendorTypeFilter !== 'All'
                      ? 'none'
                      : '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <Filter size={16} />
                Filter
                {(() => {
                  const activeFilters =
                    (mappedVendorVenueFilter !== 'All' ? 1 : 0) + (mappedVendorTypeFilter !== 'All' ? 1 : 0);
                  return activeFilters > 0 ? (
                    <span
                      style={{
                        marginLeft: '4px',
                        padding: '2px 6px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        fontSize: '11px',
                        borderRadius: '10px',
                        fontWeight: 700,
                      }}
                    >
                      {activeFilters}
                    </span>
                  ) : null;
                })()}
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Vendor Type</th>
                  <th>Venue Name</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.map((mapping, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{mapping.vendorName}</strong>
                    </td>
                    <td>
                      {mapping.vendorTypes && mapping.vendorTypes.length > 0 ? (
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: '#f0fdf4',
                            color: '#16a34a',
                          }}
                        >
                          {mapping.vendorTypes[0]}
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1f2937' }}>{mapping.venue}</span>
                    </td>
                    <td>{mapping.contactPerson || '—'}</td>
                    <td style={{ fontSize: '13px' }}>{mapping.contactPhone || '—'}</td>
                    <td>
                      <button
                        onClick={() => {
                          setVendorToRemove(mapping);
                          setShowRemoveVendorConfirmModal(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#dc2626',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Remove mapping"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available Vendors */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#374151' }}>
            Available Vendors
          </h3>
          <button
            onClick={() => setSelectedVendorTypeFilter('All')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: selectedVendorTypeFilter !== 'All' ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)' : 'white',
              color: selectedVendorTypeFilter !== 'All' ? 'white' : '#374151',
              border: selectedVendorTypeFilter !== 'All' ? 'none' : '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <Filter size={16} />
            Filter
            {selectedVendorTypeFilter !== 'All' && (
              <span
                style={{
                  marginLeft: '4px',
                  padding: '2px 6px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontSize: '11px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                1
              </span>
            )}
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Vendor Type</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors
              .filter(vendor => {
                const notMapped = !vendorMappings.find(m => m.vendorId === vendor.id);
                const typeMatch =
                  selectedVendorTypeFilter === 'All' ||
                  (vendor.vendorTypes && vendor.vendorTypes.includes(selectedVendorTypeFilter));
                return notMapped && typeMatch;
              })
              .map(vendor => (
                <tr key={vendor.id}>
                  <td>
                    <strong>{vendor.name}</strong>
                  </td>
                  <td>
                    {vendor.vendorTypes && vendor.vendorTypes.length > 0 ? (
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: '#f0f4ff',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {vendor.vendorTypes[0]}
                      </span>
                    ) : (
                      <span style={{ color: '#6b7280' }}>—</span>
                    )}
                  </td>
                  <td>{vendor.contactPerson || '—'}</td>
                  <td style={{ fontSize: '13px' }}>{vendor.phone || '—'}</td>
                  <td>
                    <button
                      onClick={() => handleAddVendorMapping(vendor)}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Map Vendor
                    </button>
                  </td>
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
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              padding: '0',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Filter size={20} color="white" />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                  Filter Vendor Mappings
                </h3>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  Venue Name
                </label>
                <select
                  value={tempMappedVenueFilter}
                  onChange={e => setTempMappedVenueFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="All">All Venues</option>
                  {uniqueVenues.map(venue => (
                    <option key={venue} value={venue}>
                      {venue}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  Vendor Type
                </label>
                <select
                  value={tempMappedTypeFilter}
                  onChange={e => setTempMappedTypeFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="All">All Types</option>
                  {uniqueVendorTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '16px 24px',
                borderTop: '1px solid #e5e7eb',
                background: '#f9fafb',
              }}
            >
              <button
                onClick={() => {
                  setTempMappedVenueFilter('All');
                  setTempMappedTypeFilter('All');
                  setMappedVendorVenueFilter('All');
                  setMappedVendorTypeFilter('All');
                  setShowFilterModal(false);
                }}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Clear Filters
              </button>
              <button
                onClick={() => {
                  setMappedVendorVenueFilter(tempMappedVenueFilter);
                  setMappedVendorTypeFilter(tempMappedTypeFilter);
                  setShowFilterModal(false);
                }}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorVenueMappingStep;
