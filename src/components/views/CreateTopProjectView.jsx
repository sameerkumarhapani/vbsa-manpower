import React, { useState } from 'react';
import { useProjects } from '../../contexts/ProjectsContext';
import { FolderOpen, Calendar, Tag, ChevronLeft } from 'lucide-react';

const CreateTopProjectView = ({ onBack, isModal = false }) => {
  const { addProject } = useProjects();
  const [form, setForm] = useState({ name: '', label: '', startDate: '', endDate: '', status: 'Planning' });

  const handleSubmit = () => {
    if (!form.name || !form.startDate || !form.endDate || !form.label) {
      alert('Please fill all required fields');
      return;
    }
    addProject(form);
    alert('Project created');
    onBack?.();
  };

  const card = (
      <div style={{
        maxWidth: 780,
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: 24 }}>
          {/* Project Name */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:6 }}>Project Name *</label>
            <input
              value={form.name}
              onChange={e=>setForm({ ...form, name: e.target.value })}
              placeholder="e.g., CET 2026-27"
              style={{ marginTop:8, width:'100%', padding:'12px 14px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14 }}
            />
          </div>

          {/* Label (free text) */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#4338ca', marginBottom:6 }}>Label *</label>
            <input
              value={form.label}
              onChange={e=>setForm({ ...form, label: e.target.value })}
              placeholder="Enter any label (e.g., FY 2026-27, Phase 1)"
              style={{ marginTop:8, width:'100%', padding:'12px 14px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14, background:'#ffffff' }}
            />
          </div>

          {/* Dates */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14, marginBottom: 18 }}>
            <div>
              <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'#374151', marginBottom:6 }}>
                <Calendar size={14} /> Start Date *
              </label>
              <input type="date" value={form.startDate} onChange={e=>setForm({ ...form, startDate: e.target.value })} style={{ marginTop:8, width:'100%', padding:'12px 14px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14 }} />
            </div>
            <div>
              <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'#374151', marginBottom:6 }}>
                <Calendar size={14} /> End Date *
              </label>
              <input type="date" value={form.endDate} onChange={e=>setForm({ ...form, endDate: e.target.value })} style={{ marginTop:8, width:'100%', padding:'12px 14px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14 }} />
            </div>
          </div>

          {/* Status segmented control */}
          <div style={{ marginBottom: 4 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:6 }}>Status</label>
            <div style={{ display:'inline-flex', gap:6, padding:4, background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:10, marginTop:8 }}>
              {['Planning','In Progress','Completed'].map(s => (
                <button key={s} onClick={()=>setForm({ ...form, status: s })} style={{ padding:'8px 12px', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:700, background: form.status===s? '#eef2ff':'transparent', color: form.status===s? '#4338ca':'#374151' }}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, padding:'16px 24px', borderTop:'1px solid #e5e7eb', background:'#fafafa' }}>
          <button onClick={onBack} style={{ padding:'10px 16px', border:'1px solid #e5e7eb', background:'white', color:'#374151', borderRadius:8, cursor:'pointer' }}>Back</button>
          <button onClick={handleSubmit} style={{ padding:'10px 16px', background:'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 }}>Create Project</button>
        </div>
      </div>
  );

  // Fields-only variant for modal usage (no inner card/header)
  const fieldsOnly = (
    <div>
      {/* Project Name */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:6 }}>Project Name *</label>
        <input
          value={form.name}
          onChange={e=>setForm({ ...form, name: e.target.value })}
          placeholder="e.g., CET 2026-27"
          style={{ marginTop:8, width:'100%', padding:'12px 14px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14 }}
        />
      </div>

      {/* Label (free text) */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#4338ca', marginBottom:6 }}>Label *</label>
        <input
          value={form.label}
          onChange={e=>setForm({ ...form, label: e.target.value })}
          placeholder="Enter any label (e.g., FY 2026-27, Phase 1)"
          style={{ marginTop:8, width:'100%', padding:'12px 14px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14, background:'#ffffff' }}
        />
      </div>

      {/* Dates */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14, marginBottom: 18 }}>
        <div>
          <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'#374151', marginBottom:6 }}>
            <Calendar size={14} /> Start Date *
          </label>
          <input type="date" value={form.startDate} onChange={e=>setForm({ ...form, startDate: e.target.value })} style={{ marginTop:8, width:'100%', padding:'12px 14px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14 }} />
        </div>
        <div>
          <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'#374151', marginBottom:6 }}>
            <Calendar size={14} /> End Date *
          </label>
          <input type="date" value={form.endDate} onChange={e=>setForm({ ...form, endDate: e.target.value })} style={{ marginTop:8, width:'100%', padding:'12px 14px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14 }} />
        </div>
      </div>

      {/* Status segmented control */}
      <div style={{ marginBottom: 4 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:6 }}>Status</label>
        <div style={{ display:'inline-flex', gap:6, padding:4, background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:10, marginTop:8 }}>
          {['Planning','In Progress','Completed'].map(s => (
            <button key={s} onClick={()=>setForm({ ...form, status: s })} style={{ padding:'8px 12px', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:700, background: form.status===s? '#eef2ff':'transparent', color: form.status===s? '#4338ca':'#374151' }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:16 }}>
        <button onClick={onBack} style={{ padding:'10px 16px', border:'1px solid #e5e7eb', background:'white', color:'#374151', borderRadius:8, cursor:'pointer' }}>Back</button>
        <button onClick={handleSubmit} style={{ padding:'10px 16px', background:'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 }}>Create Project</button>
      </div>
    </div>
  );

  if (isModal) {
    return fieldsOnly;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color:'#111827', display:'flex', alignItems:'center', gap:8 }}>
          <FolderOpen size={22} color="var(--color-primary)" /> Create Project
        </h1>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', border:'1px solid #e5e7eb', background:'white', borderRadius:8, cursor:'pointer', color:'#374151' }}>
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      {card}
    </div>
  );
};

export default CreateTopProjectView;
