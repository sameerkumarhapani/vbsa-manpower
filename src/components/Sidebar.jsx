import React from 'react';
import { Layout, LayoutGrid, Smartphone, FolderOpen, FileText, Store, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const { user, logout } = useAuth();

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout, roles: null },
    { id: 'vendors', label: 'Vendors', icon: Store, roles: ['Super Admin'] },
    { id: 'users', label: 'Users', icon: LayoutGrid, roles: null },
    { id: 'devices', label: 'Devices', icon: Smartphone, roles: null },
    { id: 'projects', label: 'Projects', icon: FolderOpen, roles: null },
    { id: 'configuration', label: 'Configuration', icon: Settings, roles: null },
    { id: 'reports', label: 'Reports', icon: FileText, roles: null },
  ];

  // Filter menu items based on user role
  const visibleMenuItems = allMenuItems.filter((item) => {
    if (item.roles === null) return true; // Available to all roles
    return item.roles.includes(user?.role);
  });

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">VBSA</div>
        <span className="role-badge">{user?.role.toUpperCase()}</span>
      </div>

      <nav className="sidebar-nav">
        {visibleMenuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <IconComponent size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.fullName.charAt(0)}</div>
          <div className="user-details">
            <p className="user-name">{user?.fullName}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
