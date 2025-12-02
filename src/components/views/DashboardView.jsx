import React from 'react';
import { Users, Smartphone, FolderOpen, TrendingUp, Activity } from 'lucide-react';

const DashboardView = ({ userRole }) => {
  const dashboardData = {
    admin: {
      title: 'Admin Dashboard',
      subtitle: 'Complete system overview',
      stats: [
        { label: 'Total Users', value: '248', icon: '👥', change: '+12%' },
        { label: 'Active Devices', value: '1,420', icon: '📱', change: '+8%' },
        { label: 'Projects', value: '45', icon: '📁', change: '+5%' },
        { label: 'System Health', value: '99.8%', icon: '✅', change: 'Normal' },
      ],
    },
    manager: {
      title: 'Manager Dashboard',
      subtitle: 'Team and resource overview',
      stats: [
        { label: 'Team Members', value: '48', icon: '👥', change: '+2' },
        { label: 'Managed Devices', value: '320', icon: '📱', change: '+15' },
        { label: 'Active Projects', value: '12', icon: '📁', change: '+1' },
        { label: 'Utilization', value: '87%', icon: '📊', change: '+5%' },
      ],
    },
    operator: {
      title: 'Operator Dashboard',
      subtitle: 'Device and task overview',
      stats: [
        { label: 'Assigned Devices', value: '25', icon: '📱', change: 'Current' },
        { label: 'Pending Tasks', value: '8', icon: '⚙️', change: '3 new' },
        { label: 'Success Rate', value: '96%', icon: '✅', change: '+2%' },
        { label: 'Active Sessions', value: '5', icon: '🔄', change: 'Now' },
      ],
    },
    viewer: {
      title: 'Viewer Dashboard',
      subtitle: 'System overview (read-only)',
      stats: [
        { label: 'Total Users', value: '248', icon: '👥', change: '-' },
        { label: 'Active Devices', value: '1,420', icon: '📱', change: '-' },
        { label: 'Projects', value: '45', icon: '📁', change: '-' },
        { label: 'System Status', value: 'Healthy', icon: '✅', change: '-' },
      ],
    },
  };

  const data = dashboardData[userRole] || dashboardData.viewer;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{data.title}</h1>
        <p className="page-subtitle">{data.subtitle}</p>
      </div>

      <div className="stats-grid">
        {data.stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-icon">{stat.icon}</div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-change">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Quick Access</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {userRole === 'admin' && (
            <>
              <div style={{ background: '#f0f4ff', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚙️</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>System Settings</div>
              </div>
              <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔐</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f59e0b' }}>User Permissions</div>
              </div>
              <div style={{ background: '#fee2e2', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>Activity Logs</div>
              </div>
            </>
          )}
          {userRole === 'manager' && (
            <>
              <div style={{ background: '#f0f4ff', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>Team Management</div>
              </div>
              <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f59e0b' }}>Performance</div>
              </div>
              <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>Resource Allocation</div>
              </div>
            </>
          )}
          {userRole === 'operator' && (
            <>
              <div style={{ background: '#f0f4ff', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📱</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>My Devices</div>
              </div>
              <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>Active Tasks</div>
              </div>
            </>
          )}
          {userRole === 'viewer' && (
            <>
              <div style={{ background: '#f0f4ff', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>View Reports</div>
              </div>
              <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>Analytics</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
