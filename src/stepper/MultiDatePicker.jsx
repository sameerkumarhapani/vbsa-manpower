import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

// Helper: format Date -> YYYY-MM-DD
const toISODate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const MultiDatePicker = ({ selectedDates = [], onChange, compact = false }) => {
  // react-day-picker expects Date objects (or array of Dates) for selection
  const selected = (selectedDates || []).map(d => new Date(d));

  const handleSelect = (dates) => {
    // `dates` can be undefined, Date or Array
    let arr = [];
    if (!dates) arr = [];
    else if (Array.isArray(dates)) arr = dates;
    else arr = [dates];
    const iso = arr.map(dt => toISODate(dt));
    // sort ISO strings chronologically
    iso.sort();
    onChange(iso);
  };

  const addToday = () => {
    const todayIso = toISODate(new Date());
    if (!selectedDates.includes(todayIso)) onChange([...(selectedDates || []), todayIso].sort());
  };

  const clear = () => onChange([]);

  return (
    <div>
      <DayPicker
        mode="multiple"
        selected={selected}
        onSelect={handleSelect}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={addToday} type="button" style={{ padding: '8px 12px', borderRadius: 8, background: 'white', border: '1px solid #e5e7eb' }}>Add Today</button>
        <button onClick={clear} type="button" style={{ padding: '8px 12px', borderRadius: 8, background: 'white', border: '1px solid #e5e7eb' }}>Clear</button>
      </div>
    </div>
  );
};

export default MultiDatePicker;
