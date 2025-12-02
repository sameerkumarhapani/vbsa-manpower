import React, { useState } from 'react';
import { Edit2, Plus, Calendar, Eye } from 'lucide-react';
import { useProjects } from '../../contexts/ProjectsContext';
import CreateTopProjectView from './CreateTopProjectView';

const ProjectsView = ({ onNavigateCreate, onOpenProject }) => {
  const { projects, setSelectedProjectId } = useProjects();
  const hasAny = projects && projects.length > 0;
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Projects Management</h1>
        <p className="page-subtitle">Plan and manage venue events and projects</p>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">All Projects</h2>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} style={{ marginRight: '8px' }} />
            New Project
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Sr.</th>
              <th>Project Name</th>
              <th>Label</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!hasAny) ? (
              <tr>
                <td colSpan={7}>
                  <div style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>No projects yet. Click "New Project" to add one.</div>
                </td>
              </tr>
            ) : projects.map((project, index) => (
              <tr key={project.id}>
                <td>{index + 1}</td>
                <td><strong>{project.name}</strong></td>
                <td>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: '#f0f4ff',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {project.label}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
                    {project.startDate}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
                    {project.endDate}
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background:
                        project.status === 'In Progress'
                          ? '#dbeafe'
                          : project.status === 'Completed'
                            ? '#d1fae5'
                            : '#fef3c7',
                      color:
                        project.status === 'In Progress'
                          ? 'var(--color-primary)'
                          : project.status === 'Completed'
                            ? '#059669'
                            : '#f59e0b',
                    }}
                  >
                    {project.status}
                  </span>
                </td>
                <td>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-primary)',
                      padding: '4px',
                    }}
                    title="Edit Project"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#059669',
                      padding: '4px',
                      marginLeft: '6px',
                    }}
                    title="Open Subprojects"
                    onClick={() => { setSelectedProjectId(project.id); onOpenProject?.(project.id); }}
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
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
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                position: 'sticky',
                top: 0,
                background: 'white',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Create Project</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: '#6b7280',
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <CreateTopProjectView isModal onBack={() => setShowCreateModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsView;
