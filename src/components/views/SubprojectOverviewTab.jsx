import React from 'react';

const SubprojectOverviewTab = ({ subprojects }) => {
  // Create dummy overview data for each subproject
  const overviewData = subprojects.map((sp, idx) => ({
    id: sp.id,
    sr: idx + 1,
    name: sp.name,
    venuesMapped: Math.floor(Math.random() * 15) + 3, // 3-17 venues
    partnersMapped: {
      total: Math.floor(Math.random() * 8) + 2, // 2-9 total
      required: Math.floor(Math.random() * 10) + 5, // 5-14 required
    },
    usersMapped: {
      total: Math.floor(Math.random() * 50) + 20, // 20-69 total
      required: Math.floor(Math.random() * 100) + 50, // 50-149 required
    },
    devicesMapped: {
      total: Math.floor(Math.random() * 30) + 15, // 15-44 total
      required: Math.floor(Math.random() * 60) + 40, // 40-99 required
    },
  }));

  // Determine status and highlight issues
  const getStatus = (partners, users, devices) => {
    const partnerDeficit = partners.total < partners.required;
    const userDeficit = users.total < users.required;
    const deviceDeficit = devices.total < devices.required;

    if (partnerDeficit || userDeficit || deviceDeficit) {
      return { status: 'Requires Attention', color: '#ef4444', bgColor: '#fee2e2' };
    }
    return { status: 'Healthy', color: '#10b981', bgColor: '#d1fae5' };
  };

  return (
    <div>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
        <table className="table" style={{ minWidth: '1200px' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 700, fontSize: '12px', minWidth: '35px' }}>Sr.</th>
              <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: 700, fontSize: '12px', minWidth: '130px' }}>Subproject</th>
              <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 700, fontSize: '12px', minWidth: '90px' }}>Venues Mapped</th>
              <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 700, fontSize: '12px', minWidth: '100px' }}>Partners Mapped</th>
              <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 700, fontSize: '12px', minWidth: '95px' }}>Users Mapped</th>
              <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 700, fontSize: '12px', minWidth: '95px' }}>Devices Mapped</th>
              <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 700, fontSize: '12px', minWidth: '100px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {overviewData.map((row) => {
              const statusInfo = getStatus(row.partnersMapped, row.usersMapped, row.devicesMapped);
              const partnerDeficit = row.partnersMapped.total < row.partnersMapped.required;
              const userDeficit = row.usersMapped.total < row.usersMapped.required;
              const deviceDeficit = row.devicesMapped.total < row.devicesMapped.required;

              return (
                <tr key={row.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600, fontSize: '12px' }}>
                    {row.sr}
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'left', fontWeight: 600, fontSize: '12px' }}>
                    {row.name}
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: '12px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: '#f0f4ff',
                        color: 'var(--color-primary)',
                        fontWeight: 600,
                        fontSize: '11px',
                      }}
                    >
                      {row.venuesMapped}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '8px 4px',
                      textAlign: 'center',
                      fontSize: '12px',
                      background: partnerDeficit ? '#fee2e2' : 'transparent',
                      borderRadius: '4px',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: partnerDeficit ? '#dc2626' : '#374151', fontSize: '11px' }}>
                      {row.partnersMapped.total}/{row.partnersMapped.required}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '8px 4px',
                      textAlign: 'center',
                      fontSize: '12px',
                      background: userDeficit ? '#fee2e2' : 'transparent',
                      borderRadius: '4px',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: userDeficit ? '#dc2626' : '#374151', fontSize: '11px' }}>
                      {row.usersMapped.total}/{row.usersMapped.required}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '8px 4px',
                      textAlign: 'center',
                      fontSize: '12px',
                      background: deviceDeficit ? '#fee2e2' : 'transparent',
                      borderRadius: '4px',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: deviceDeficit ? '#dc2626' : '#374151', fontSize: '11px' }}>
                      {row.devicesMapped.total}/{row.devicesMapped.required}
                    </span>
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        background: statusInfo.bgColor,
                        color: statusInfo.color,
                        fontSize: '11px',
                      }}
                    >
                      {statusInfo.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubprojectOverviewTab;
