import React, { useState } from 'react';

const Step5_AttendanceDevice = ({ formData, setFormData }) => {
  const [note, setNote] = useState('');

  const addNote = () => {
    if (!note) return;
    const next = [...(formData.attendanceDevices || []), { note, createdAt: new Date().toISOString() }];
    setFormData({ ...formData, attendanceDevices: next });
    setNote('');
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>User Attendance & Device Issuance</h2>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Notes / Issuance Records</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Short note" value={note} onChange={e=>setNote(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }} />
          <button onClick={addNote} style={{ padding: '8px 12px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 8 }}>Add</button>
        </div>
      </div>

      <div>
        {(formData.attendanceDevices || []).length === 0 ? (
          <div style={{ color: '#6b7280' }}>No records yet.</div>
        ) : (
          <ul>
            {formData.attendanceDevices.map((r,i)=>(<li key={i}>{new Date(r.createdAt).toLocaleString()} — {r.note}</li>))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Step5_AttendanceDevice;
