import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import DashboardContent from './DashboardContent';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [subView, setSubView] = useState(null); // For handling sub-views like create project

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="dashboard-main">
        <DashboardContent 
          activeMenu={activeMenu} 
          userRole={user?.role} 
          subView={subView}
          setSubView={setSubView}
        />
      </div>
    </div>
  );
};

export default Dashboard;
