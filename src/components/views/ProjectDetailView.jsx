import React, { useState } from 'react';
import { useProjects } from '../../contexts/ProjectsContext';
import SubprojectOverviewTab from './SubprojectOverviewTab';

const ProjectDetailView = ({ onBack, onCreateSubproject }) => {
  const { projects, selectedProjectId, getSubprojectsOf } = useProjects();
  const project = projects.find(p => p.id === selectedProjectId);
  const subprojects = selectedProjectId ? getSubprojectsOf(selectedProjectId) : [];
  const [activeTab, setActiveTab] = useState('subprojects'); // 'subprojects' or 'overview'

  if (!project) {
    return (
      <div style={{ padding: 24 }}>
        <p>Project not found.</p>
        <button onClick={onBack} style={{ padding:'8px 14px', border:'1px solid #e5e7eb', background:'white', borderRadius:6 }}>Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <h1 className="page-title">{project.name}</h1>
        <p className="page-subtitle">Label {project.label} • {project.startDate} → {project.endDate}</p>
      </div>

      <div className="content-section">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', paddingBottom: '0' }}>
          <button
            onClick={() => setActiveTab('subprojects')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'subprojects' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'subprojects' ? 'white' : '#6b7280',
              fontWeight: activeTab === 'subprojects' ? 700 : 600,
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              if (activeTab !== 'subprojects') {
                e.target.style.background = '#f3f4f6';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== 'subprojects') {
                e.target.style.background = 'transparent';
              }
            }}
          >
            Subprojects
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'overview' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'overview' ? 'white' : '#6b7280',
              fontWeight: activeTab === 'overview' ? 700 : 600,
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              if (activeTab !== 'overview') {
                e.target.style.background = '#f3f4f6';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== 'overview') {
                e.target.style.background = 'transparent';
              }
            }}
          >
            Overview
          </button>
        </div>

        {/* Subprojects Tab Content */}
        {activeTab === 'subprojects' && (
          <>
            <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 className="section-title">Subprojects</h2>
              <button className="btn-primary" onClick={() => onCreateSubproject?.()}>
                + New Subproject
              </button>
            </div>

            {subprojects.length === 0 ? (
              <div style={{ padding: 20, background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:8 }}>
                No subprojects yet.
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Sr.</th>
                    <th>Name</th>
                    <th>Label</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subprojects.map((sp, idx) => (
                    <tr key={sp.id}>
                      <td>{idx + 1}</td>
                      <td><strong>{sp.name}</strong></td>
                      <td>{sp.label}</td>
                      <td>{sp.startDate}</td>
                      <td>{sp.endDate}</td>
                      <td>{sp.status || 'Planning'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <SubprojectOverviewTab subprojects={subprojects} />
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={onBack} style={{ padding:'10px 20px', border:'1px solid #e5e7eb', background:'white', borderRadius:6 }}>Back</button>
      </div>

    </div>
  );
};

export default ProjectDetailView;
