/**
 * Excel Export Utility
 * Provides functions to export data to Excel format
 */

// Helper to download blob as Excel file
export const downloadExcel = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Helper to escape CSV special characters
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Helper to convert data to CSV format
const convertToCSV = (headers, rows) => {
  const csvHeaders = headers.map(escapeCSV).join(',');
  const csvRows = rows.map(row =>
    headers.map(header => escapeCSV(row[header])).join(',')
  );
  return [csvHeaders, ...csvRows].join('\n');
};

// Helper to convert CSV to Excel-compatible format (using XLSX-like structure via blob)
export const createExcelFromCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadExcel(blob, filename);
};

/**
 * Export User Mapping data
 */
export const exportUserMappings = (mappings, filename = 'user-mappings.csv') => {
  const headers = [
    'Sr.',
    'User Name',
    'User Role',
    'Partner Name',
    'Venue Name',
    'City',
    'Email',
    'Mobile'
  ];

  const rows = (mappings || []).map((m, idx) => {
    const venueList = Array.isArray(m.venues) ? m.venues : (m.venueName ? [{ venueName: m.venueName, city: m.city }] : []);
    const venueNames = venueList.map(v => v.venueName).join('; ');
    const cities = venueList.map(v => v.city).join('; ');

    return {
      'Sr.': idx + 1,
      'User Name': m.userName || '',
      'User Role': m.userRole || '',
      'Partner Name': m.partnerName || '',
      'Venue Name': venueNames,
      'City': cities,
      'Email': m.userEmail || '',
      'Mobile': m.userMobile || ''
    };
  });

  const csv = convertToCSV(headers, rows);
  createExcelFromCSV(csv, filename);
};

/**
 * Export Partner Mapping data
 */
export const exportPartnerMappings = (mappings, filename = 'partner-mappings.csv') => {
  const headers = [
    'Sr.',
    'Partner Name',
    'Partner Type',
    'Venue Name',
    'Contact Person',
    'Phone',
    'Status'
  ];

  const rows = (mappings || []).map((m, idx) => {
    const venueList = Array.isArray(m.venues) ? m.venues : (m.venueName ? [{ venueName: m.venueName, city: m.city }] : []);
    const venueNames = venueList.map(v => v.venueName).join('; ');

    return {
      'Sr.': idx + 1,
      'Partner Name': m.partnerName || '',
      'Partner Type': m.partnerType || '',
      'Venue Name': venueNames,
      'Contact Person': m.contactPerson || '',
      'Phone': m.phone || '',
      'Status': m.status || ''
    };
  });

  const csv = convertToCSV(headers, rows);
  createExcelFromCSV(csv, filename);
};

/**
 * Export Device Handling Status data
 */
export const exportDeviceHandlingStatus = (mappings, filename = 'device-handling-status.csv') => {
  const headers = [
    'Sr.',
    'Venue Name',
    'Device Type',
    'Candidates',
    'Required',
    'Buffer',
    'Total',
    'Sent',
    'Received',
    'Variance'
  ];

  const rows = (mappings || []).map((m, idx) => {
    const total = (m.required || 0) + (m.buffer || 0);
    const variance = (m.received || 0) - total;
    const varianceStatus = variance > 0 ? `Surplus +${variance}` : variance < 0 ? `Deficient ${variance}` : 'Match';

    return {
      'Sr.': idx + 1,
      'Venue Name': m.venueName || '',
      'Device Type': m.deviceType || '',
      'Candidates': m.candidates || '',
      'Required': m.required || '',
      'Buffer': m.buffer || '',
      'Total': total,
      'Sent': m.sent || 0,
      'Received': m.received || 0,
      'Variance': varianceStatus
    };
  });

  const csv = convertToCSV(headers, rows);
  createExcelFromCSV(csv, filename);
};

/**
 * Export Attendance data for a specific session
 */
export const exportSessionAttendance = (sessionLabel, attendanceRecords, sessionId, filename = null) => {
  if (!filename) {
    const sanitized = (sessionLabel || 'session').replace(/\s+/g, '_').toLowerCase();
    filename = `attendance-${sanitized}-${Date.now()}.csv`;
  }

  const headers = [
    'Sr.',
    'User Name',
    'User Role',
    'Venue Name',
    'Session',
    'Device ID',
    'Device Name',
    'Device Type',
    'Lab(s)',
    'Marked By',
    'Marked On',
    'Face Image Present'
  ];

  const sessionRecords = (attendanceRecords || []).filter(r => r.sessionId === sessionId);

  const rows = sessionRecords.map((r, idx) => {
    const labs = (r.labs || []).join('; ');
    const markedOn = r.allottedOn ? new Date(r.allottedOn).toLocaleString() : '';

    return {
      'Sr.': idx + 1,
      'User Name': r.userName || '',
      'User Role': r.userRole || '',
      'Venue Name': r.venueName || '',
      'Session': sessionLabel || '',
      'Device ID': r.deviceId || '',
      'Device Name': r.deviceName || '',
      'Device Type': r.deviceType || '',
      'Lab(s)': labs,
      'Marked By': r.allottedBy || '',
      'Marked On': markedOn,
      'Face Image Present': r.faceImage ? 'Yes' : 'No'
    };
  });

  const csv = convertToCSV(headers, rows);
  createExcelFromCSV(csv, filename);
};

/**
 * Export all attendance data across all sessions
 */
export const exportAllAttendance = (attendanceRecords, sessions = [], filename = 'attendance-all.csv') => {
  const headers = [
    'Sr.',
    'User Name',
    'User Role',
    'Venue Name',
    'Session',
    'Device ID',
    'Device Name',
    'Device Type',
    'Lab(s)',
    'Marked By',
    'Marked On',
    'Face Image Present'
  ];

  const rows = (attendanceRecords || []).map((r, idx) => {
    const labs = (r.labs || []).join('; ');
    const markedOn = r.allottedOn ? new Date(r.allottedOn).toLocaleString() : '';

    return {
      'Sr.': idx + 1,
      'User Name': r.userName || '',
      'User Role': r.userRole || '',
      'Venue Name': r.venueName || '',
      'Session': r.sessionLabel || '',
      'Device ID': r.deviceId || '',
      'Device Name': r.deviceName || '',
      'Device Type': r.deviceType || '',
      'Lab(s)': labs,
      'Marked By': r.allottedBy || '',
      'Marked On': markedOn,
      'Face Image Present': r.faceImage ? 'Yes' : 'No'
    };
  });

  const csv = convertToCSV(headers, rows);
  createExcelFromCSV(csv, filename);
};
