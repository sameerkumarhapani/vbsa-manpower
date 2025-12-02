import React, { useState } from 'react';
import { useProjects } from '../../contexts/ProjectsContext';
const ProjectDetailView = ({ onBack, onCreateSubproject }) => {
  const { projects, selectedProjectId, getSubprojectsOf } = useProjects();
  const project = projects.find(p => p.id === selectedProjectId);
  const subprojects = selectedProjectId ? getSubprojectsOf(selectedProjectId) : [];

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
          <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={onBack} style={{ padding:'10px 20px', border:'1px solid #e5e7eb', background:'white', borderRadius:6 }}>Back</button>
      </div>

    </div>
  );
};

export default ProjectDetailView;
