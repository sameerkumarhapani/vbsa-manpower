import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2, Circle } from 'lucide-react';

const ProjectPartnerMappingStep = ({ selectedPartners = [], onPartnersChange }) => {
  const { getVisibleVendors } = useAuth();
  const vendors = getVisibleVendors();

  // Group vendors by type
  const groupedVendors = useMemo(() => {
    const groups = {};
    vendors.forEach(vendor => {
      if (vendor.vendorTypes && vendor.vendorTypes.length > 0) {
        vendor.vendorTypes.forEach(type => {
          if (!groups[type]) {
            groups[type] = [];
          }
          groups[type].push(vendor);
        });
      }
    });
    return groups;
  }, [vendors]);

  const togglePartner = (vendorId) => {
    const newSelected = selectedPartners.includes(vendorId)
      ? selectedPartners.filter(id => id !== vendorId)
      : [...selectedPartners, vendorId];
    onPartnersChange(newSelected);
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
        Map Partners to Project
      </h2>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
        Select partners from each category that will be involved in this project.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {Object.entries(groupedVendors).map(([vendorType, typeVendors]) => (
          <div key={vendorType}>
            <h3 style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#374151',
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: '1px solid #e5e7eb'
            }}>
              {vendorType}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {typeVendors.map(vendor => (
                <div
                  key={vendor.id}
                  onClick={() => togglePartner(vendor.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    backgroundColor: selectedPartners.includes(vendor.id) ? '#eef2ff' : '#ffffff',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    {selectedPartners.includes(vendor.id) ? (
                      <CheckCircle2 size={20} color="var(--color-primary)" />
                    ) : (
                      <Circle size={20} color="#d1d5db" />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#111827',
                      margin: 0,
                      marginBottom: 4
                    }}>
                      {vendor.name}
                    </p>
                    <p style={{
                      fontSize: 12,
                      color: '#6b7280',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {vendor.contactPerson} • {vendor.phone}
                    </p>
                  </div>

                  <div style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: vendor.status === 'Active' ? '#dcfce7' : '#fecaca',
                    color: vendor.status === 'Active' ? '#166534' : '#991b1b',
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 4,
                    flexShrink: 0
                  }}>
                    {vendor.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedPartners.length > 0 && (
        <div style={{
          marginTop: 24,
          padding: 12,
          background: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: 8
        }}>
          <p style={{ fontSize: 13, color: '#1e40af', margin: 0, marginBottom: 8 }}>
            <strong>{selectedPartners.length}</strong> partner(s) selected
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selectedPartners.map(partnerId => {
              // Find vendor by id across all groups
              let vendorName = '';
              for (const typeVendors of Object.values(groupedVendors)) {
                const vendor = typeVendors.find(v => v.id === partnerId);
                if (vendor) {
                  vendorName = vendor.name;
                  break;
                }
              }
              return (
                <span key={partnerId} style={{
                  padding: '6px 12px',
                  background: 'white',
                  border: '1px solid #bfdbfe',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#1e40af'
                }}>
                  {vendorName}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPartnerMappingStep;
