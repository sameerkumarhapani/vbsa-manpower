import React, { useState } from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import { Edit2, Save, X, Plus } from 'lucide-react';

const tableContainerStyle = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '32px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
};

const titleStyle = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 700,
  color: '#1f2937',
  letterSpacing: '0.5px',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '16px',
};

const thStyle = {
  background: '#f3f4f6',
  padding: '10px 12px',
  fontSize: '12px',
  fontWeight: 700,
  color: '#374151',
  textTransform: 'uppercase',
  borderBottom: '1px solid #e5e7eb',
  letterSpacing: '0.5px',
};

const tdStyle = {
  padding: '10px 12px',
  fontSize: '13px',
  color: '#374151',
  borderBottom: '1px solid #f1f5f9',
};

const ConfigurationView = () => {
  const { manpowerRoles, assetTypes, addManpowerRole, updateManpowerRole, addAssetType, updateAssetType } = useConfig();
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleRatio, setNewRoleRatio] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetRatio, setNewAssetRatio] = useState('');

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '28px', color: '#111827' }}>Configuration</h1>

      {/* Manpower Roles */}
      <div style={tableContainerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={titleStyle}>Manpower Roles</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Role name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
            />
            <input
              type="text"
              placeholder="Ratio"
              value={newRoleRatio}
              onChange={(e) => setNewRoleRatio(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
            />
            <button
              onClick={() => { if (newRoleName) { addManpowerRole(newRoleName, newRoleRatio); setNewRoleName(''); setNewRoleRatio(''); } }}
              style={{ padding: '8px 14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Sr. No.</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Ratio for Services</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {manpowerRoles.map((item, idx) => (
              <tr key={item.id}>
                <td style={tdStyle}><strong>{idx + 1}</strong></td>
                <td style={tdStyle}>{item.name}</td>
                <td style={tdStyle}>
                  {editingRoleId === item.id ? (
                    <input
                      type="text"
                      value={item.ratio}
                      onChange={(e) => updateManpowerRole(item.id, { ratio: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
                    />
                  ) : (
                    item.ratio || <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No ratio set</span>
                  )}
                </td>
                <td style={tdStyle}>
                  {editingRoleId === item.id ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setEditingRoleId(null)}
                        style={{ padding: '6px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        <Save size={14} /> Save
                      </button>
                      <button
                        onClick={() => setEditingRoleId(null)}
                        style={{ padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingRoleId(item.id)}
                      style={{ padding: '6px 10px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Asset Types */}
      <div style={tableContainerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={titleStyle}>Asset List</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Asset type"
              value={newAssetName}
              onChange={(e) => setNewAssetName(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
            />
            <input
              type="text"
              placeholder="Ratio"
              value={newAssetRatio}
              onChange={(e) => setNewAssetRatio(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
            />
            <button
              onClick={() => { if (newAssetName) { addAssetType(newAssetName, newAssetRatio); setNewAssetName(''); setNewAssetRatio(''); } }}
              style={{ padding: '8px 14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Sr. No.</th>
              <th style={thStyle}>Asset / Type</th>
              <th style={thStyle}>Ratio for Services</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assetTypes.map((item, idx) => (
              <tr key={item.id}>
                <td style={tdStyle}><strong>{idx + 1}</strong></td>
                <td style={tdStyle}>{item.name}</td>
                <td style={tdStyle}>
                  {editingAssetId === item.id ? (
                    <input
                      type="text"
                      value={item.ratio}
                      onChange={(e) => updateAssetType(item.id, { ratio: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
                    />
                  ) : (
                    item.ratio || <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No ratio set</span>
                  )}
                </td>
                <td style={tdStyle}>
                  {editingAssetId === item.id ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setEditingAssetId(null)}
                        style={{ padding: '6px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        <Save size={14} /> Save
                      </button>
                      <button
                        onClick={() => setEditingAssetId(null)}
                        style={{ padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingAssetId(item.id)}
                      style={{ padding: '6px 10px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfigurationView;
