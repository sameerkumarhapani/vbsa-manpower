import React from 'react';
import DashboardView from './views/DashboardView';
import UsersView from './views/UsersView';
import DevicesView from './views/DevicesView';
import ProjectsView from './views/ProjectsView';
// CreateProjectView (subproject form) removed to disable create/edit/view flows
import { useProjects } from '../contexts/ProjectsContext';
import CreateTopProjectView from './views/CreateTopProjectView';
import ProjectDetailView from './views/ProjectDetailView';
import StepperMain from '../stepper/StepperMain';
import ReportsView from './views/ReportsView';
import VendorsView from './views/VendorsView';
import ConfigurationView from './views/ConfigurationView';
import './DashboardContent.css';

const DashboardContent = ({ activeMenu, userRole, subView, setSubView }) => {
  const { selectedSubprojectId, subprojectMode, getSubprojectById, setSelectedSubprojectId, setSubprojectMode } = useProjects();
  const renderContent = () => {
    // Handle sub-views for Projects
    if (activeMenu === 'projects') {
      if (subView === 'create-project') return <CreateTopProjectView onBack={() => setSubView(null)} />;
      if (subView === 'project-detail') return (
        <ProjectDetailView
          onBack={() => setSubView(null)}
          onCreateSubproject={() => setSubView('create-subproject')}
        />
      );
      if (subView === 'create-subproject') return (
        <StepperMain onBack={() => setSubView('project-detail')} />
      );
      // Note: subproject create/edit/view flows have been removed from the portal.
    }

    // Handle main views
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardView userRole={userRole} />;
      case 'users':
        return <UsersView />;
      case 'devices':
        return <DevicesView />;
      case 'projects':
        return <ProjectsView onNavigateCreate={() => setSubView('create-project')} onOpenProject={() => setSubView('project-detail')} />;
      case 'reports':
        return <ReportsView />;
      case 'vendors':
        return <VendorsView />;
      case 'configuration':
        return <ConfigurationView />;
      default:
        return <DashboardView userRole={userRole} />;
    }
  };

  return <div className="dashboard-content">{renderContent()}</div>;
};

export default DashboardContent;
