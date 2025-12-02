import React, { useEffect, useState } from 'react';
import MultiDatePicker from './MultiDatePicker';

const Step1_ProjectDetails = ({ formData, setFormData }) => {
  // Ensure default structures exist and provide per-date session times
  useEffect(() => {
    // selectedDates: array of 'YYYY-MM-DD'
    if (!formData.selectedDates) {
      setFormData({ ...formData, selectedDates: [] });
    }

    // sessionTemplates: default labeled sessions (Session-1..3) with default times
    if (!formData.sessionTemplates) {
      const defaults = [
        { id: 1, label: 'Session-1', startTime: '09:00', endTime: '12:00' },
        { id: 2, label: 'Session-2', startTime: '13:00', endTime: '16:00' },
        { id: 3, label: 'Session-3', startTime: '17:00', endTime: '20:00' },
      ];
      // write defaults into formData so other steps/readers see them
      setFormData(prev => ({ ...prev, sessionTemplates: defaults }));
    }

    // dateSessionMap: { 'YYYY-MM-DD': { [sessionId]: { startTime, endTime, enabled } } }
    if (!formData.dateSessionMap) {
      const map = {};
      (formData.selectedDates || []).forEach(d => {
        map[d] = {};
      });
      setFormData({ ...formData, dateSessionMap: map });
    }
  }, []);

  // Helper: when dates change, ensure map entries exist and use template defaults
  const getDefaultTemplates = () => (formData.sessionTemplates && formData.sessionTemplates.length) ? formData.sessionTemplates : [
    { id: 1, label: 'Session-1', startTime: '09:00', endTime: '12:00' },
    { id: 2, label: 'Session-2', startTime: '13:00', endTime: '16:00' },
    { id: 3, label: 'Session-3', startTime: '17:00', endTime: '20:00' },
  ];

  const handleDateChange = (nextDates) => {
    const next = Array.isArray(nextDates) ? nextDates : [];
    const map = { ...(formData.dateSessionMap || {}) };
    const templates = getDefaultTemplates();
    // ensure templates exist in formData so UI is reactive across steps
    if (!formData.sessionTemplates || formData.sessionTemplates.length === 0) {
      setFormData(prev => ({ ...prev, sessionTemplates: templates }));
    }
    next.forEach(d => {
      if (!map[d]) {
        map[d] = {};
        templates.forEach(t => {
          map[d][t.id] = { startTime: t.startTime || t.start || '09:00', endTime: t.endTime || t.end || '12:00', enabled: true };
        });
      } else {
        // ensure all template ids exist for this date
        templates.forEach(t => {
          if (!map[d][t.id]) {
            map[d][t.id] = { startTime: t.startTime || t.start || '09:00', endTime: t.endTime || t.end || '12:00', enabled: true };
          }
        });
      }
    });

    // remove dates that are no longer selected
    Object.keys(map).forEach(existingDate => {
      if (!next.includes(existingDate)) delete map[existingDate];
    });

    setFormData(prev => ({ ...prev, selectedDates: next, dateSessionMap: map }));
  };

  const updateDateSession = (date, sessionId, key, value) => {
    setFormData(prev => {
      const map = { ...(prev.dateSessionMap || {}) };
      if (!map[date]) map[date] = {};
      const entry = map[date][sessionId] ? { ...map[date][sessionId] } : { startTime: '', endTime: '', enabled: true };
      entry[key] = value;
      map[date][sessionId] = entry;
      return { ...prev, dateSessionMap: map };
    });
  };

  const updateTemplateTime = (sessionId, key, value) => {
    setFormData(prev => {
      const templates = (prev.sessionTemplates || []).map(t => (t.id === sessionId ? { ...t, [key]: value } : t));
      return { ...prev, sessionTemplates: templates };
    });
    // Do not override per-date edits; only affect future-initialized dates
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>Project Details</h2>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Subproject Name *</label>
        <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., CET - MBA" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Exam *</label>
        <select value={formData.label || ''} onChange={e => setFormData({ ...formData, label: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
          <option value="">Select an exam</option>
          <option value="CET 2025">CET 2025</option>
          <option value="UPSC 2026">UPSC 2026</option>
          <option value="CET 2026">CET 2026</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Select Dates *</label>

        <div style={{ marginBottom: 8 }}>
          <MultiDatePicker compact selectedDates={formData.selectedDates || []} onChange={handleDateChange} />
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>Select dates from the calendar. For each date you can edit session timings individually.</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Sessions (per-date editable)</label>

        {/* Template defaults */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          {(formData.sessionTemplates || []).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>
              <div style={{ fontWeight: 700 }}>{t.label}</div>
              <input type="time" value={t.startTime || t.start || ''} onChange={e => updateTemplateTime(t.id, 'startTime', e.target.value)} style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db' }} />
              <span style={{ fontSize: 12 }}>to</span>
              <input type="time" value={t.endTime || t.end || ''} onChange={e => updateTemplateTime(t.id, 'endTime', e.target.value)} style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db' }} />
            </div>
          ))}
        </div>

        {/* Per-date editable grid */}
        {(formData.selectedDates || []).length === 0 ? (
          <div style={{ color: '#6b7280' }}>No dates selected.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {(formData.selectedDates || []).map(d => (
              <div key={d} style={{ padding: 10, border: '1px solid #eef2ff', borderRadius: 8 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{new Date(d).toLocaleDateString()}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(formData.sessionTemplates || []).map(t => {
                    const entry = (formData.dateSessionMap && formData.dateSessionMap[d] && formData.dateSessionMap[d][t.id]) || { startTime: t.startTime || t.start || '09:00', endTime: t.endTime || t.end || '12:00', enabled: true };
                    return (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, border: '1px solid #e5e7eb', background: entry.enabled ? '#fff' : '#f8fafc' }}>
                        <input type="checkbox" checked={!!entry.enabled} onChange={e => updateDateSession(d, t.id, 'enabled', e.target.checked)} />
                        <div style={{ fontWeight: 700 }}>{t.label}</div>
                        <input type="time" value={entry.startTime || ''} onChange={e => updateDateSession(d, t.id, 'startTime', e.target.value)} style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db' }} />
                        <span style={{ fontSize: 12 }}>to</span>
                        <input type="time" value={entry.endTime || ''} onChange={e => updateDateSession(d, t.id, 'endTime', e.target.value)} style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db' }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Status</label>
        <select value={formData.status || 'Planning'} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}>
          <option>Planning</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Description</label>
        <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
      </div>
    </div>
  );
};

export default Step1_ProjectDetails;
