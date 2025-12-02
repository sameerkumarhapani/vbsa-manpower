import React, { useState } from 'react';
import { Download, Filter } from 'lucide-react';

const ReportsView = () => {
  const [reports] = useState([
    { id: 1, name: 'Monthly Activity Report', generatedDate: '2025-01-30', period: 'January 2025', format: 'PDF' },
    { id: 2, name: 'Device Utilization Report', generatedDate: '2025-01-28', period: 'Q1 2025', format: 'PDF' },
    { id: 3, name: 'User Performance Metrics', generatedDate: '2025-01-25', period: 'January 2025', format: 'Excel' },
    { id: 4, name: 'System Health Report', generatedDate: '2025-01-20', period: 'January 2025', format: 'PDF' },
  ]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">View and download system reports</p>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Available Reports</h2>
          <button className="btn-primary">
            <Filter size={16} style={{ marginRight: '8px' }} />
            Filter Reports
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Period</th>
              <th>Generated Date</th>
              <th>Format</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td><strong>{report.name}</strong></td>
                <td>{report.period}</td>
                <td>{report.generatedDate}</td>
                <td>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: report.format === 'PDF' ? '#fee2e2' : '#dbeafe',
                      color: report.format === 'PDF' ? '#dc2626' : 'var(--color-primary)',
                    }}
                  >
                    {report.format}
                  </span>
                </td>
                <td>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-primary)',
                      fontWeight: 500,
                      fontSize: '13px',
                    }}
                  >
                    <Download size={16} />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsView;
