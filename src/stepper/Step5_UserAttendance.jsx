import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { exportSessionAttendance } from '../utils/excelExport';

// Small self-contained Step5: User Attendance & Device Issuance
// - Section 1: Users table with Mark Attendance button
// - Section 2: Sessions accordion (date-time sessions from project) with table of allotted devices/attendance
// - Modal: opened from Mark Attendance; prefilled user fields, lab select (multi for Server Manager), session select, device type, device id filtered by type

const DEVICES_MASTER = [
  { deviceId: 'DV-1001', name: 'Biometric-Scanner-01', type: 'Biometric', vendorName: 'FingerPrint Tech' },
  { deviceId: 'DV-1002', name: 'BodyCam-01', type: 'Body Cam', vendorName: 'ActionCam Pro' },
  { deviceId: 'DV-1003', name: 'Server-01', type: 'Servers', vendorName: 'Cloud Infrastructure Inc' },
  { deviceId: 'DV-1004', name: 'CCTV-02', type: 'CCTV Kit', vendorName: 'SecureVision Systems' },
  { deviceId: 'DV-1005', name: 'Biometric-Terminal-02', type: 'Biometric', vendorName: 'BioMetrics India' },
  { deviceId: 'DV-1006', name: 'BodyCam-02', type: 'Body Cam', vendorName: 'BodyTrack Solutions' },
];

const LABS = ['Lab-1', 'Lab-2', 'Lab-3'];
const DEVICE_TYPES = ['HHMD', 'Body Cam', 'Servers', 'CCTV Kit', 'Biometric'];

// User roles for emergency onboarding
const USER_ROLES = [
  'CCTV Technician',
  'Biometric Operator',
  'Body Cam Operator',
  'Network Administrator',
  'Server Manager',
  'Center Manager',
  'Centre Superintendent',
  'Housekeeping',
  'Electrician',
  'Venue Staff',
  'Security Guard',
  'IT Support',
];

const Step5_UserAttendance = ({ formData, setFormData }) => {
  const { user } = useAuth();
  const { emergencyOnboardingConfig, checklistConfig } = useConfig();

  // Users source: prefer `formData.userMappings` (users mapped to venues in Step 3).
  // If none present, fall back to `formData.users` or a small sample fallback for UI.
  const users = useMemo(() => {
    const mappings = formData.userMappings || [];
    if (Array.isArray(mappings) && mappings.length) {
      // Flatten: each user-venue combination becomes a row
      const result = [];
      mappings.forEach(m => {
        // Support both old single-venue and new multi-venue format
        const venueList = Array.isArray(m.venues) ? m.venues : (m.venueName ? [{ venueName: m.venueName, city: m.city, lat: m.lat, lng: m.lng }] : []);
        
        if (venueList.length === 0) {
          // No venues, still add user with empty venue
          result.push({
            id: m.userId,
            fullName: m.userName,
            role: m.userRole,
            venue: '',
            venues: [],
            email: m.userEmail,
            mobile: m.userMobile,
            lat: null,
            lng: null,
          });
        } else {
          // Create one entry per venue for the user
          venueList.forEach((v, vIdx) => {
            result.push({
              id: `${m.userId}-v${vIdx}`, // unique id per user-venue combo
              odId: m.userId, // original user id
              fullName: m.userName,
              role: m.userRole,
              venue: v.venueName || '',
              venues: venueList,
              email: m.userEmail,
              mobile: m.userMobile,
              lat: v.lat || v.latitude || null,
              lng: v.lng || v.longitude || null,
            });
          });
        }
      });
      return result;
    }
    if (formData.users && Array.isArray(formData.users) && formData.users.length) return formData.users;
    return [
      { id: 'U1', fullName: 'Amit Sharma', role: 'Venue Staff', venue: formData.venueName || (formData.vendorMappings && formData.vendorMappings[0] && formData.vendorMappings[0].venueName) || 'Mumbai University Exam Centre' },
      { id: 'U2', fullName: 'Priya Rao', role: 'Server Manager', venue: formData.venueName || 'Mumbai University Exam Centre' },
      { id: 'U3', fullName: 'Rahul Verma', role: 'Biometric Operator', venue: formData.venueName || 'IIT Bombay Campus' },
    ];
  }, [formData.userMappings, formData.users, formData.vendorMappings]);

  // Sessions source -- prefer per-date session map + templates defined in Step 1
  const sessions = useMemo(() => {
    const dates = formData.selectedDates || [];
    const templatesRaw = formData.sessionTemplates || formData.sessions || formData.projectSessions || formData.project?.sessions || [];

    const templates = (templatesRaw || []).map((t, idx) => {
      const id = t?.id ?? `T-${idx + 1}`;
      const label = t?.label ?? `Session-${idx + 1}`;
      const start = t?.startTime ?? t?.start ?? '09:00';
      const end = t?.endTime ?? t?.end ?? '12:00';
      return { id, label, start, end, raw: t };
    });

    // If we have dates and templates, expand per-date sessions using dateSessionMap overrides
    if (Array.isArray(dates) && dates.length > 0 && templates.length > 0) {
      const out = [];
      dates.forEach((d) => {
        const dateObj = new Date(d);
        if (isNaN(dateObj.getTime())) return;
        templates.forEach((t) => {
          const perDate = (formData.dateSessionMap && formData.dateSessionMap[d] && formData.dateSessionMap[d][t.id]) || null;
          const enabled = perDate ? (perDate.enabled !== false) : true;
          if (!enabled) return; // skip disabled session for this date

          const startStr = perDate?.startTime ?? t.start;
          const endStr = perDate?.endTime ?? t.end;
          const [sh, sm] = String(startStr).split(':').map(x => parseInt(x, 10));
          const [eh, em] = String(endStr).split(':').map(x => parseInt(x, 10));
          const startDt = new Date(dateObj);
          startDt.setHours(Number.isFinite(sh) ? sh : 0, Number.isFinite(sm) ? sm : 0, 0, 0);
          const endDt = new Date(dateObj);
          endDt.setHours(Number.isFinite(eh) ? eh : 0, Number.isFinite(em) ? em : 0, 0, 0);
          const id = `${t.id}::${d}`;
          const label = `${startDt.toLocaleDateString()} ${startDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${endDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          out.push({ id, label, startISO: startDt.toISOString(), endISO: endDt.toISOString(), templateId: t.id, date: d, raw: t });
        });
      });
      return out;
    }

    // Fallback: normalize templates without dates
    return templates.map((t, idx) => ({ id: t.id || `S-${idx}`, label: t.label, raw: t, startISO: null, endISO: null }));
  }, [formData.selectedDates, formData.sessionTemplates, formData.dateSessionMap, formData.sessions, formData.projectSessions, formData.project]);

  // Sessions that are allowed to be used for marking attendance in the modal.
  // Show all sessions but mark which are within time window (sessionStart - Z hours to sessionEnd)
  // Z hours is configured in Emergency Onboarding settings
  const sessionsWithAvailability = useMemo(() => {
    const now = Date.now();
    const captureWindowHours = emergencyOnboardingConfig?.attendanceCaptureBeforeSessionHours || 2;
    return (sessions || []).map(s => {
      const startISO = s.startISO || (s.raw && (s.raw.startISO || s.raw.start)) || null;
      const endISO = s.endISO || (s.raw && (s.raw.endISO || s.raw.end)) || null;
      const startTime = startISO ? new Date(startISO).getTime() : null;
      const endTime = endISO ? new Date(endISO).getTime() : null;
      let isAvailable = false;
      if (startTime && endTime) {
        const windowStart = startTime - (captureWindowHours * 60 * 60 * 1000);
        isAvailable = now >= windowStart && now <= endTime;
      }
      return { ...s, isAvailable };
    });
  }, [sessions, emergencyOnboardingConfig]);

  // Session filter: 'live' (today's sessions in IST) or 'all'
  const [sessionFilter, setSessionFilter] = useState('live');

  // Get current date in IST (UTC+5:30)
  const getTodayIST = () => {
    const now = new Date();
    // Convert to IST by adding 5:30 hours offset
    const istOffset = 5.5 * 60 * 60 * 1000;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const istDate = new Date(utc + istOffset);
    return istDate.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const todayIST = getTodayIST();

  // Filter sessions based on selected tab
  const filteredSessions = useMemo(() => {
    if (sessionFilter === 'all') return sessions;
    // 'live' filter: only sessions for today's date in IST
    return sessions.filter(s => {
      // Extract date from session
      if (s.date) return s.date === todayIST;
      if (s.startISO) {
        const sessionDate = s.startISO.split('T')[0];
        return sessionDate === todayIST;
      }
      return false;
    });
  }, [sessions, sessionFilter, todayIST]);

  // Attendance records: stored in formData.attendanceRecords
  const [attendanceRecords, setAttendanceRecords] = useState(() => formData.attendanceRecords || []);
  const [showDeallocateModal, setShowDeallocateModal] = useState(false);
  const [deallocateSessionId, setDeallocateSessionId] = useState(null);
  const [deallocateList, setDeallocateList] = useState([]);
  const [selectedDeallocateIds, setSelectedDeallocateIds] = useState(new Set());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [modalForm, setModalForm] = useState({ labs: [], sessionId: '', deviceType: '', deviceId: '' });
  const [faceImage, setFaceImage] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Emergency Onboarding state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({ name: '', mobile: '', aadhar: '', role: '', partnerId: '' });

  // Venue Checklist state
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [checklistSessionId, setChecklistSessionId] = useState(null);
  const [checklistForm, setChecklistForm] = useState({});
  const [activeChecklistTab, setActiveChecklistTab] = useState('checklist1'); // 'checklist1' or 'checklist2'
  const [checklistSubmissions, setChecklistSubmissions] = useState({ checklist1: null, checklist2: null }); // track submissions for both
  const [emergencyFaceImage, setEmergencyFaceImage] = useState('');
  const [emergencyShowCamera, setEmergencyShowCamera] = useState(false);
  const emergencyVideoRef = useRef(null);
  const emergencyStreamRef = useRef(null);
  const [emergencyUsers, setEmergencyUsers] = useState(() => formData.emergencyUsers || []);

  // Get unique partners from vendorMappings for Emergency Onboarding dropdown
  const partnerOptions = useMemo(() => {
    const seen = new Set();
    const partners = [];
    (formData.vendorMappings || []).forEach(vm => {
      if (vm.partnerId && !seen.has(vm.partnerId)) {
        seen.add(vm.partnerId);
        partners.push({ id: vm.partnerId, name: vm.partnerName || vm.vendorName || vm.partnerId });
      }
    });
    return partners;
  }, [formData.vendorMappings]);

  // Filter out expired emergency users (older than 24 hours)
  const activeEmergencyUsers = useMemo(() => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return (emergencyUsers || []).filter(u => {
      const createdAt = new Date(u.createdAt).getTime();
      return (now - createdAt) < twentyFourHours;
    });
  }, [emergencyUsers]);

  // Combined users: regular users + active emergency users
  const allUsers = useMemo(() => {
    const emergencyMapped = activeEmergencyUsers.map(eu => ({
      id: eu.id,
      fullName: eu.name,
      role: eu.role,
      venue: '', // Emergency users don't have venue assignment initially
      venues: [],
      email: '',
      mobile: eu.mobile,
      lat: null,
      lng: null,
      isEmergency: true,
      expiresAt: new Date(new Date(eu.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
    }));
    return [...users, ...emergencyMapped];
  }, [users, activeEmergencyUsers]);

  const openModalForUser = (u) => {
    setModalUser(u);
    const defaultSession = sessionsWithAvailability[0]?.id || sessions[0]?.id || ''
    setModalForm({ labs: [], sessionId: defaultSession, deviceType: '', deviceId: '' });
    setFaceImage('');
    setShowCamera(false);
    setShowModal(true);
  };

  useEffect(() => {
    if (!showCamera) {
      // stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    }
  }, [showCamera]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.srcObject = s;
        try { await videoRef.current.play(); } catch(e) { /* ignore play errors */ }
      }
      setShowCamera(true);
    } catch (err) {
      alert('Unable to access camera: ' + (err && err.message));
    }
  };

  const captureFace = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;

    const ensureReady = () => new Promise((resolve) => {
      if ((v.videoWidth && v.videoHeight) || v.readyState >= 2) return resolve();
      const onMeta = () => { v.removeEventListener('loadedmetadata', onMeta); resolve(); };
      v.addEventListener('loadedmetadata', onMeta);
      // fallback timeout
      setTimeout(resolve, 500);
    });

    ensureReady().then(() => {
      const width = v.videoWidth || v.clientWidth || 320;
      const height = v.videoHeight || v.clientHeight || 240;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      try {
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      } catch (err) {
        // fallback: fill blank
        ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
      }
      const data = canvas.toDataURL('image/jpeg', 0.8);
      setFaceImage(data);
      // stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      try { v.pause(); } catch(e) {}
      setShowCamera(false);
    });
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => deg * Math.PI / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getCurrentPositionAsync = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(pos => resolve(pos), err => reject(err), { enableHighAccuracy: true, timeout: 10000 });
  });

  const deviceOptionsForType = useMemo(() => {
    if (!modalForm.deviceType) return DEVICES_MASTER;
    return DEVICES_MASTER.filter(d => (d.type || '').toLowerCase().includes((modalForm.deviceType || '').toLowerCase()) || d.type === modalForm.deviceType);
  }, [modalForm.deviceType]);

  // Map of deviceId -> userId for devices currently allocated (and not deallocated)
  const allocatedDeviceMap = useMemo(() => {
    const map = {};
    (attendanceRecords || []).forEach(r => {
      if (r.deviceId && !r.deallocatedOn) map[r.deviceId] = r.userId;
    });
    return map;
  }, [attendanceRecords]);

  // Include allocation status on each device option so UI can disable already-allocated devices
  const deviceOptionsWithStatus = useMemo(() => {
    // Start with devices matching the selected type (or all if none selected)
    const matched = (!modalForm.deviceType)
      ? DEVICES_MASTER.slice()
      : DEVICES_MASTER.filter(d => (d.type || '').toLowerCase().includes((modalForm.deviceType || '').toLowerCase()) || d.type === modalForm.deviceType);

    // Ensure devices that are currently allocated (even if they don't match the type filter) are included so users can see "Already allocated" entries
    const allocatedIds = new Set(Object.keys(allocatedDeviceMap));
    const allocatedExtras = DEVICES_MASTER.filter(d => allocatedIds.has(d.deviceId) && !matched.some(m => m.deviceId === d.deviceId));

    const combined = [...matched, ...allocatedExtras];

    // Attach allocation metadata
    return combined.map(d => ({
      ...d,
      allocatedTo: allocatedDeviceMap[d.deviceId] || null,
      isAllocated: !!allocatedDeviceMap[d.deviceId]
    }));
  }, [modalForm.deviceType, allocatedDeviceMap]);

  const handleSubmitAttendance = async () => {
    try {
      if (!modalUser) return;
      if (!modalForm.sessionId) { alert('Please select a session'); return; }
      if (!modalForm.labs || modalForm.labs.length === 0) { alert('Please select lab(s)'); return; }
      if (!modalForm.deviceType) { alert('Please select device type'); return; }
      if (!modalForm.deviceId) { alert('Please select device'); return; }
      if (!faceImage) { alert('Please capture face image before submitting attendance'); return; }

      // Prevent remarking attendance for same user+session
      const already = (attendanceRecords || []).some(r => r.userId === modalUser.id && r.sessionId === modalForm.sessionId && r.present);
      if (already) {
        alert('Attendance for this user in the selected session has already been marked. Re-marking is not allowed.');
        return;
      }

      // Geofence check: skip for Mumbai University Exam Centre (special exemption)
      const vLat = modalUser.lat || modalUser.latitude || modalUser.venueLat;
      const vLng = modalUser.lng || modalUser.longitude || modalUser.venueLng;
      const venueName = String(modalUser.venue || modalUser.venueName || '').toLowerCase();
      const isMumbaiExam = venueName.includes('mumbai university exam centre') || venueName.includes('mumbai university exam center') || modalUser.venueId === 'v-mum-001';

      let userLat, userLng, distance;
      if (!isMumbaiExam) {
        if (vLat == null || vLng == null) {
          alert('Venue coordinates not available for geofence check. Cannot mark attendance.');
          return;
        }

        const pos = await getCurrentPositionAsync();
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
        distance = haversineDistance(vLat, vLng, userLat, userLng);
        if (distance > 100) {
          alert(`You are outside the allowed perimeter (${Math.round(distance)} m). Move within 100 m to mark attendance.`);
          return;
        }
      }

      const device = DEVICES_MASTER.find(d => d.deviceId === modalForm.deviceId) || null;
      const record = {
        id: `AR-${Date.now()}`,
        userId: modalUser.id,
        userName: modalUser.fullName,
        userRole: modalUser.role,
        venueName: modalUser.venue || '',
        venueLat: vLat,
        venueLng: vLng,
        labs: modalForm.labs,
        sessionId: modalForm.sessionId,
        sessionLabel: (sessions.find(s => s.id === modalForm.sessionId) || {}).label || modalForm.sessionId,
        deviceId: device?.deviceId || modalForm.deviceId || '',
        deviceName: device?.name || '',
        deviceType: modalForm.deviceType,
        allottedBy: user?.fullName || 'Unknown',
        allottedOn: new Date().toISOString(),
        present: true,
        faceImage,
      };

      if (typeof userLat !== 'undefined' && typeof userLng !== 'undefined') {
        record.checkinLat = userLat;
        record.checkinLng = userLng;
        record.checkinDistanceMeters = Math.round(distance || 0);
      }

      const updated = [record, ...attendanceRecords];
      setAttendanceRecords(updated);
      setFormData({ ...formData, attendanceRecords: updated });
      setShowModal(false);
    } catch (err) {
      alert('Unable to mark attendance: ' + (err && err.message));
    }
  };

  const handleMarkPresentInline = (u) => {
    // Open modal for user to complete required steps (face capture + geofence)
    openModalForUser(u);
  };

  const recordsBySession = useMemo(() => {
    const map = {};
    (attendanceRecords || []).forEach(r => {
      if (!map[r.sessionId]) map[r.sessionId] = [];
      map[r.sessionId].push(r);
    });
    return map;
  }, [attendanceRecords]);

  const presentUserIds = useMemo(() => new Set((attendanceRecords || []).filter(r => r.present).map(r => r.userId)), [attendanceRecords]);

  const handleConfirmDeallocate = () => {
    if (!deallocateSessionId) return;
    const now = new Date().toISOString();
    const updated = (attendanceRecords || []).map(r => {
      if (r.sessionId === deallocateSessionId && r.deviceId && selectedDeallocateIds.has(r.userId)) {
        const prev = { deviceId: r.deviceId, deviceName: r.deviceName, deviceType: r.deviceType };
        return {
          ...r,
          deviceId: '',
          deviceName: '',
          deviceType: '',
          deallocatedBy: user?.fullName || 'Unknown',
          deallocatedOn: now,
          deallocationPrev: prev,
        };
      }
      return r;
    });
    setAttendanceRecords(updated);
    setFormData({ ...formData, attendanceRecords: updated });
    setShowDeallocateModal(false);
    setDeallocateSessionId(null);
    setDeallocateList([]);
    setSelectedDeallocateIds(new Set());
    alert('Devices deallocated successfully. They are now available for fresh allocation.');
  };

  // Emergency Onboarding handlers
  const openEmergencyModal = () => {
    setEmergencyForm({ name: '', mobile: '', aadhar: '', role: '', partnerId: '' });
    setEmergencyFaceImage('');
    setEmergencyShowCamera(false);
    setShowEmergencyModal(true);
  };

  const startEmergencyCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      emergencyStreamRef.current = s;
      if (emergencyVideoRef.current) {
        emergencyVideoRef.current.muted = true;
        emergencyVideoRef.current.srcObject = s;
        try { await emergencyVideoRef.current.play(); } catch(e) { /* ignore play errors */ }
      }
      setEmergencyShowCamera(true);
    } catch (err) {
      alert('Unable to access camera: ' + (err && err.message));
    }
  };

  const captureEmergencyFace = () => {
    if (!emergencyVideoRef.current) return;
    const v = emergencyVideoRef.current;

    const ensureReady = () => new Promise((resolve) => {
      if ((v.videoWidth && v.videoHeight) || v.readyState >= 2) return resolve();
      const onMeta = () => { v.removeEventListener('loadedmetadata', onMeta); resolve(); };
      v.addEventListener('loadedmetadata', onMeta);
      setTimeout(resolve, 500);
    });

    ensureReady().then(() => {
      const width = v.videoWidth || v.clientWidth || 320;
      const height = v.videoHeight || v.clientHeight || 240;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      try {
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      } catch (err) {
        ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
      }
      const data = canvas.toDataURL('image/jpeg', 0.8);
      setEmergencyFaceImage(data);
      if (emergencyStreamRef.current) {
        emergencyStreamRef.current.getTracks().forEach(t => t.stop());
        emergencyStreamRef.current = null;
      }
      try { v.pause(); } catch(e) {}
      setEmergencyShowCamera(false);
    });
  };

  useEffect(() => {
    if (!emergencyShowCamera) {
      if (emergencyStreamRef.current) {
        emergencyStreamRef.current.getTracks().forEach(t => t.stop());
        emergencyStreamRef.current = null;
      }
      if (emergencyVideoRef.current) emergencyVideoRef.current.srcObject = null;
    }
  }, [emergencyShowCamera]);

  const handleEmergencySubmit = () => {
    // Validate form
    if (!emergencyForm.name.trim()) { alert('Please enter name'); return; }
    if (!emergencyForm.mobile.trim() || !/^[0-9]{10}$/.test(emergencyForm.mobile.trim())) { alert('Please enter valid 10-digit mobile number'); return; }
    if (!emergencyForm.aadhar.trim() || !/^[0-9]{12}$/.test(emergencyForm.aadhar.trim())) { alert('Please enter valid 12-digit Aadhar number'); return; }
    if (!emergencyForm.role) { alert('Please select role'); return; }
    if (!emergencyForm.partnerId) { alert('Please select partner organization'); return; }
    if (!emergencyFaceImage) { alert('Please capture face image'); return; }

    const partnerInfo = partnerOptions.find(p => p.id === emergencyForm.partnerId);
    const newUser = {
      id: `EMG-${Date.now()}`,
      name: emergencyForm.name.trim(),
      mobile: emergencyForm.mobile.trim(),
      aadhar: emergencyForm.aadhar.trim(),
      role: emergencyForm.role,
      partnerId: emergencyForm.partnerId,
      partnerName: partnerInfo?.name || emergencyForm.partnerId,
      faceImage: emergencyFaceImage,
      createdAt: new Date().toISOString(),
      createdBy: user?.fullName || 'Unknown',
      isEmergency: true,
    };

    const updated = [newUser, ...emergencyUsers];
    setEmergencyUsers(updated);
    setFormData({ ...formData, emergencyUsers: updated });
    setShowEmergencyModal(false);
    alert(`Emergency user "${newUser.name}" onboarded successfully. This registration is valid for 24 hours.`);
  };

  // Open Venue Checklist Modal with prefilled data
  const openChecklistModal = (session) => {
    const sessionRecords = recordsBySession[session.id] || [];
    const presentRecords = sessionRecords.filter(r => r.present);

    // Count users by role
    const countByRole = (role) => presentRecords.filter(r => (r.userRole || '').toLowerCase().includes(role.toLowerCase())).length;
    const getUsersByRole = (role) => presentRecords.filter(r => (r.userRole || '').toLowerCase().includes(role.toLowerCase()));

    // Get session date and time, calculate T-60 and T-30
    let sessionDate = '';
    let sessionTime = '';
    let checklist1Time = '';
    let checklist2Time = '';
    try {
      const startDt = session.startISO ? new Date(session.startISO) : null;
      const endDt = session.endISO ? new Date(session.endISO) : null;
      if (startDt && !isNaN(startDt.getTime())) {
        sessionDate = startDt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        sessionTime = `${startDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${endDt ? endDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`;
        
        // Calculate T-60 (60 minutes before session start)
        const t60Dt = new Date(startDt.getTime() - 60 * 60 * 1000);
        checklist1Time = `${String(t60Dt.getHours()).padStart(2, '0')}:${String(t60Dt.getMinutes()).padStart(2, '0')}`;
        
        // Calculate T-30 (30 minutes before session start)
        const t30Dt = new Date(startDt.getTime() - 30 * 60 * 1000);
        checklist2Time = `${String(t30Dt.getHours()).padStart(2, '0')}:${String(t30Dt.getMinutes()).padStart(2, '0')}`;
      }
    } catch (e) { /* ignore */ }

    // Get venue info from first record or formData
    const venueName = presentRecords[0]?.venueName || formData.venueName || 'Mumbai University Exam Centre';
    const venueState = formData.venueState || 'Maharashtra';
    const venueCity = formData.venueCity || 'Mumbai';
    const venueCode = formData.venueCode || 'MUM-001';

    // Security guards count
    const securityGuards = getUsersByRole('security');
    const maleGuards = Math.ceil(securityGuards.length / 2); // Dummy split
    const femaleGuards = securityGuards.length - maleGuards;

    // Other role counts
    const invigilators = getUsersByRole('invigilator');
    const serverManagers = getUsersByRole('server manager');
    const cctvTechnicians = getUsersByRole('cctv');
    const biometricOperators = getUsersByRole('biometric');
    const bodyCamOperators = getUsersByRole('body cam');

    // Count body cams issued (devices of type Body Cam)
    const bodyCamsIssued = presentRecords.filter(r => (r.deviceType || '').toLowerCase().includes('body cam')).length;

    setChecklistForm({
      // Centre Manager Info (prefilled from logged-in user)
      centreManagerName: user?.fullName || 'Rajesh Kumar',
      centreManagerEmail: user?.email || 'rajesh.kumar@exam.gov.in',
      centreManagerMobile: user?.mobile || user?.phone || '9876543210',

      // Examination Info
      examDate: sessionDate || '03/12/2025',
      examBatch: sessionTime || '09:00 AM to 12:00 PM',
      checklist1Time: checklist1Time || '08:00',
      checklist2Time: checklist2Time || '08:30',

      // Venue Info
      venueState: venueState,
      venueCity: venueCity,
      venueName: venueName,
      venueCode: venueCode,

      // Security Guards (prefilled)
      maleGuardsPresent: maleGuards || 2,
      femaleGuardsPresent: femaleGuards || 2,
      totalFriskingGuards: securityGuards.length || 4,

      // Editable fields
      hhmdDevices: '',
      femaleCanopy: '',
      computerPartitions: '',
      signagesDisplayed: '',
      seatingPlanDisplayed: '',
      invigilatorsPresent: '',

      // Invigilators (prefilled)
      invigilatorsCount: invigilators.length || 3,

      // Server Managers (prefilled)
      serverManagersCount: serverManagers.length || 2,
      serverManagersList: serverManagers.length > 0 ? serverManagers : [
        { name: 'Amit Sharma', mobile: '9876543211' },
        { name: 'Priya Singh', mobile: '9876543212' }
      ],

      // DG Set & Observer
      dgSetAvailable: '',
      venueObserverPresent: '',

      // CCTV Technicians (prefilled)
      cctvTechniciansList: cctvTechnicians.length > 0 ? cctvTechnicians : [
        { name: 'Ravi Verma', mobile: '9876543213' }
      ],

      // Biometric Operators (prefilled)
      biometricOperatorsCount: biometricOperators.length || 2,
      biometricOperatorsList: biometricOperators.length > 0 ? biometricOperators : [
        { name: 'Sunita Patel', mobile: '9876543214' },
        { name: 'Mohan Das', mobile: '9876543215' }
      ],

      // Body Cam Operators (prefilled)
      bodyCamOperatorsList: bodyCamOperators.length > 0 ? bodyCamOperators : [
        { name: 'Kiran Rao', mobile: '9876543216' }
      ],
      bodyCamsIssued: bodyCamsIssued || bodyCamOperators.length || 1,
    });

    setChecklistSessionId(session.id);
    setShowChecklistModal(true);
  };

  const handleChecklistSubmit = () => {
    // Validate required editable fields
    if (!checklistForm.hhmdDevices) { alert('Please enter number of HHMD devices'); return; }
    if (!checklistForm.femaleCanopy) { alert('Please select if female frisking canopy is available'); return; }
    if (!checklistForm.computerPartitions) { alert('Please select if computer partitions are present'); return; }
    if (!checklistForm.signagesDisplayed) { alert('Please select if signages are displayed'); return; }
    if (!checklistForm.seatingPlanDisplayed) { alert('Please select if seating plan is displayed'); return; }
    if (!checklistForm.invigilatorsPresent) { alert('Please select if invigilators are present'); return; }
    if (!checklistForm.dgSetAvailable) { alert('Please select if DG Set is available'); return; }
    if (!checklistForm.venueObserverPresent) { alert('Please select if venue observer is present'); return; }

    // Save checklist to formData
    const checklistType = activeChecklistTab || 'checklist1';
    const scheduledTime = checklistType === 'checklist1' ? checklistForm.checklist1Time : checklistForm.checklist2Time;
    const actualSubmitISO = new Date().toISOString();
    const actualDt = new Date(actualSubmitISO);
    const actualSubmitTime = `${String(actualDt.getHours()).padStart(2, '0')}:${String(actualDt.getMinutes()).padStart(2, '0')}`;

    const checklistData = {
      sessionId: checklistSessionId,
      checklistType,
      scheduledTime,
      actualSubmitISO,
      actualSubmitTime,
      submittedAt: actualSubmitISO,
      submittedBy: user?.fullName || 'Unknown',
      ...checklistForm
    };

    const existingChecklists = formData.venueChecklists || [];
    // Replace only the checklist for this session + type
    const updatedChecklists = [
      ...existingChecklists.filter(c => !(c.sessionId === checklistSessionId && c.checklistType === checklistType)),
      checklistData
    ];
    setFormData({ ...formData, venueChecklists: updatedChecklists });

    setShowChecklistModal(false);
    alert('Venue Checklist submitted successfully! (Saved actual submit time)');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>User Attendance & Device Issuance</h2>
        <button
          onClick={openEmergencyModal}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '2px solid #dc2626',
            background: 'white',
            color: '#dc2626',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14
          }}
        >
          <span style={{ fontSize: 18 }}>⚠</span> Emergency Onboarding
        </button>
      </div>

      {/* Section 1: Users */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Users</h3>
        <div style={{ color: '#6b7280' }}>
          {allUsers.length} user(s)
          {activeEmergencyUsers.length > 0 && (
            <span style={{ marginLeft: 8, color: '#dc2626', fontSize: 12 }}>({activeEmergencyUsers.length} emergency)</span>
          )}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table className="table" style={{ marginBottom: 0, width: '100%', borderCollapse: 'collapse' }}>
          <thead>
              <tr style={{ background: '#f9fafb' }}>
              <th style={{ padding: 8, textAlign: 'center' }}>Sr.</th>
              <th style={{ padding: 8, textAlign: 'left' }}>User Name</th>
              <th style={{ padding: 8, textAlign: 'left' }}>User Role</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Venue Name</th>
              <th style={{ padding: 8, textAlign: 'center' }}>Mark Attendance</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((u, idx) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6', background: u.isEmergency ? '#fef2f2' : 'transparent' }}>
                <td style={{ padding: 8, textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ padding: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {u.fullName}
                    {u.isEmergency && (
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#dc2626', color: 'white', fontWeight: 600 }}>EMERGENCY</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: 8 }}>{u.role}</td>
                <td style={{ padding: 8 }}>{u.venue || '-'}</td>
                
                <td style={{ padding: 8, textAlign: 'center' }}>
                  <button onClick={() => openModalForUser(u)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', cursor: 'pointer' }}>Mark</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 2: Sessions accordion */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Sessions</h3>
        <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 8, padding: 4 }}>
          <button
            onClick={() => setSessionFilter('live')}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: 'none',
              background: sessionFilter === 'live' ? 'white' : 'transparent',
              color: sessionFilter === 'live' ? '#111827' : '#6b7280',
              fontWeight: sessionFilter === 'live' ? 600 : 400,
              boxShadow: sessionFilter === 'live' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Live
          </button>
          <button
            onClick={() => setSessionFilter('all')}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: 'none',
              background: sessionFilter === 'all' ? 'white' : 'transparent',
              color: sessionFilter === 'all' ? '#111827' : '#6b7280',
              fontWeight: sessionFilter === 'all' ? 600 : 400,
              boxShadow: sessionFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            All
          </button>
        </div>
      </div>
      <div>
        {filteredSessions.length === 0 && (
          <div style={{ padding: 12, color: '#6b7280', background: 'white', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            {sessionFilter === 'live' ? 'No live sessions for today.' : 'No sessions found in project data.'}
          </div>
        )}
        {filteredSessions.map((s, sidx) => {
          const allocated = (recordsBySession[s.id] || []).filter(r => r.deviceId);
          const records = recordsBySession[s.id] || [];
          return (
            <details key={s.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 8, position: 'relative' }}>
              <summary style={{ fontWeight: 700, cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {(() => {
                    // derive date and times from session's ISO or raw values
                    let startDt = null;
                    let endDt = null;
                    try {
                      startDt = s.startISO ? new Date(s.startISO) : (s.raw && (s.raw.startISO || s.raw.start)) ? new Date(s.raw.startISO || s.raw.start) : null;
                      endDt = s.endISO ? new Date(s.endISO) : (s.raw && (s.raw.endISO || s.raw.end)) ? new Date(s.raw.endISO || s.raw.end) : null;
                    } catch (e) { startDt = null; endDt = null; }
                    if (!startDt || isNaN(startDt.getTime())) startDt = null;
                    if (!endDt || isNaN(endDt.getTime())) endDt = null;

                    const dateOnly = startDt ? startDt.toLocaleDateString() : (s.label || 'Session');
                    const timeRange = (startDt && endDt) ? `${startDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${endDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : (s.label || '');

                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{dateOnly}</div>
                        <div><span style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', padding: '4px 8px', borderRadius: 8, fontSize: 13 }}>{timeRange}</span></div>
                      </div>
                    );
                  })()}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {(() => {
                    // Get configured checklist times from config
                    const checklist1Config = checklistConfig?.checklist1 || { enableBeforeSessionHours: 1, disableAfterSessionHours: 2 };
                    const checklist2Config = checklistConfig?.checklist2 || { enableBeforeSessionHours: 0.5, disableAfterSessionHours: 1 };
                    
                    // Calculate configured times for this session
                    let checklist1EnableTime = '—', checklist1DisableTime = '—';
                    let checklist2EnableTime = '—', checklist2DisableTime = '—';
                    let checklist1Available = false, checklist2Available = false;
                    
                    try {
                      let startDt = null;
                      let endDt = null;
                      try {
                        startDt = s.startISO ? new Date(s.startISO) : (s.raw && (s.raw.startISO || s.raw.start)) ? new Date(s.raw.startISO || s.raw.start) : null;
                        endDt = s.endISO ? new Date(s.endISO) : (s.raw && (s.raw.endISO || s.raw.end)) ? new Date(s.raw.endISO || s.raw.end) : null;
                      } catch (e) { startDt = null; endDt = null; }
                      
                      if (startDt && !isNaN(startDt.getTime()) && endDt && !isNaN(endDt.getTime())) {
                        const now = Date.now();
                        
                        // Checklist 1 times
                        const c1EnableDt = new Date(startDt.getTime() - checklist1Config.enableBeforeSessionHours * 60 * 60 * 1000);
                        const c1DisableDt = new Date(endDt.getTime() + checklist1Config.disableAfterSessionHours * 60 * 60 * 1000);
                        checklist1EnableTime = `${String(c1EnableDt.getHours()).padStart(2, '0')}:${String(c1EnableDt.getMinutes()).padStart(2, '0')}`;
                        checklist1DisableTime = `${String(c1DisableDt.getHours()).padStart(2, '0')}:${String(c1DisableDt.getMinutes()).padStart(2, '0')}`;
                        checklist1Available = now >= c1EnableDt.getTime() && now <= c1DisableDt.getTime();
                        
                        // Checklist 2 times
                        const c2EnableDt = new Date(startDt.getTime() - checklist2Config.enableBeforeSessionHours * 60 * 60 * 1000);
                        const c2DisableDt = new Date(endDt.getTime() + checklist2Config.disableAfterSessionHours * 60 * 60 * 1000);
                        checklist2EnableTime = `${String(c2EnableDt.getHours()).padStart(2, '0')}:${String(c2EnableDt.getMinutes()).padStart(2, '0')}`;
                        checklist2DisableTime = `${String(c2DisableDt.getHours()).padStart(2, '0')}:${String(c2DisableDt.getMinutes()).padStart(2, '0')}`;
                        checklist2Available = now >= c2EnableDt.getTime() && now <= c2DisableDt.getTime();
                      }
                    } catch (e) { /* ignore */ }
                    
                    // Check if checklist already submitted for this session
                    const existingChecklists = formData.venueChecklists || [];
                    const existingChecklist1 = existingChecklists.find(c => c.sessionId === s.id && c.checklistType === 'checklist1');
                    const existingChecklist2 = existingChecklists.find(c => c.sessionId === s.id && c.checklistType === 'checklist2');

                    return (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); exportSessionAttendance(s.label || `Session-${sidx + 1}`, recordsBySession[s.id] || [], s.id); }} 
                          title="Export attendance data for this session as CSV"
                          style={{ padding: '6px 10px', borderRadius: 8, background: 'white', border: '1px solid #e5e7eb', color: '#374151', cursor: 'pointer', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          📥 Export
                        </button>
                        {existingChecklist1 ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); /* show details maybe */ setActiveChecklistTab('checklist1'); openChecklistModal(s); }}
                            title={`Submitted at ${existingChecklist1.actualSubmitTime || existingChecklist1.actualSubmitISO || '—'}`}
                            style={{ padding: '6px 10px', borderRadius: 8, background: '#065f46', color: 'white', border: 'none', cursor: 'default', fontWeight: 600, fontSize: 12 }}
                          >
                            Checklist-1 Submitted ({existingChecklist1.actualSubmitTime || existingChecklist1.actualSubmitISO || '—'})
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); if (checklist1Available) { setActiveChecklistTab('checklist1'); openChecklistModal(s); } }} 
                            disabled={!checklist1Available}
                            title={checklist1Available ? `Submit Checklist-1 (Available: ${checklist1EnableTime} - ${checklist1DisableTime})` : `Checklist-1 not available. Available from ${checklist1EnableTime} to ${checklist1DisableTime}`}
                            style={{ 
                              padding: '6px 10px', 
                              borderRadius: 8, 
                              background: checklist1Available ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : '#d1d5db', 
                              color: 'white', 
                              border: 'none', 
                              cursor: checklist1Available ? 'pointer' : 'not-allowed', 
                              fontWeight: 600, 
                              fontSize: 12,
                              opacity: checklist1Available ? 1 : 0.6
                            }}
                          >
                            Submit Checklist-1 ({checklist1EnableTime} - {checklist1DisableTime})
                          </button>
                        )}

                        {existingChecklist2 ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveChecklistTab('checklist2'); openChecklistModal(s); }}
                            title={`Submitted at ${existingChecklist2.actualSubmitTime || existingChecklist2.actualSubmitISO || '—'}`}
                            style={{ padding: '6px 10px', borderRadius: 8, background: '#075985', color: 'white', border: 'none', cursor: 'default', fontWeight: 600, fontSize: 12 }}
                          >
                            Checklist-2 Submitted ({existingChecklist2.actualSubmitTime || existingChecklist2.actualSubmitISO || '—'})
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); if (checklist2Available) { setActiveChecklistTab('checklist2'); openChecklistModal(s); } }} 
                            disabled={!checklist2Available}
                            title={checklist2Available ? `Submit Checklist-2 (Available: ${checklist2EnableTime} - ${checklist2DisableTime})` : `Checklist-2 not available. Available from ${checklist2EnableTime} to ${checklist2DisableTime}`}
                            style={{ 
                              padding: '6px 10px', 
                              borderRadius: 8, 
                              background: checklist2Available ? 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)' : '#d1d5db', 
                              color: 'white', 
                              border: 'none', 
                              cursor: checklist2Available ? 'pointer' : 'not-allowed', 
                              fontWeight: 600, 
                              fontSize: 12,
                              opacity: checklist2Available ? 1 : 0.6
                            }}
                          >
                            Submit Checklist-2 ({checklist2EnableTime} - {checklist2DisableTime})
                          </button>
                        )}
                      </>
                    );
                  })()}
                  {allocated.length > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); const list = allocated; setDeallocateList(list); setDeallocateSessionId(s.id); setSelectedDeallocateIds(new Set(list.map(d => d.userId))); setShowDeallocateModal(true); }} style={{ padding: '6px 10px', borderRadius: 8, background: 'white', border: '1px solid #e5e7eb', cursor: 'pointer' }}>Deallocate Device</button>
                  )}
                </div>
              </summary>

              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: 8, textAlign: 'center' }}>Sr.</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>User Name</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>User Role</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>Venue Name</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>Lab</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>Device ID</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>Device Type</th>
                      <th style={{ padding: 8, textAlign: 'center' }}>Status</th>
                      <th style={{ padding: 8, textAlign: 'left', width: 220 }}>Allotted By / On</th>
                      <th style={{ padding: 8, textAlign: 'left', width: 180 }}>Deallocated By / On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, idx) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: 8, textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ padding: 8 }}>{r.userName}</td>
                        <td style={{ padding: 8 }}>{r.userRole}</td>
                        <td style={{ padding: 8 }}>{r.venueName}</td>
                        <td style={{ padding: 8 }}>{Array.isArray(r.labs) ? r.labs.join(', ') : r.labs}</td>
                        <td style={{ padding: 8 }}>{r.deviceId}</td>
                        <td style={{ padding: 8 }}>{r.deviceType}</td>
                        <td style={{ padding: 8, textAlign: 'center' }}>{r.present ? (
                          <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 6, background: '#e6ffed', color: '#046c3b', fontWeight: 700 }}>Present</span>
                        ) : (
                          <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 6, background: '#fff4e6', color: '#7a4b00' }}>Not marked</span>
                        )}</td>
                        <td style={{ padding: 8 }}>{r.allottedBy ? `${r.allottedBy} on ${new Date(r.allottedOn).toLocaleString()}` : '-'}</td>
                        <td style={{ padding: 8 }}>{r.deallocatedBy ? `${r.deallocatedBy} on ${new Date(r.deallocatedOn).toLocaleString()}` : '-'}</td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr><td colSpan={9} style={{ padding: 12, color: '#6b7280' }}>No attendance/allotments for this session yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </details>
          );
        })}
      </div>

      {/* Attendance Modal */}
      {showModal && modalUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }} onClick={() => setShowModal(false)}>
          <div style={{ width: 680, maxWidth: '95%', background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Mark Attendance</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#6b7280', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>User Name</label>
                <input value={modalUser.fullName} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>User Role</label>
                <input value={modalUser.role} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Venue</label>
                <input value={modalUser.venue} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Session</label>
                {(() => {
                  const markedForModalUser = new Set((attendanceRecords || []).filter(r => modalUser && r.userId === modalUser.id && r.sessionId).map(r => r.sessionId));
                  return (
                    <select value={modalForm.sessionId} onChange={e => setModalForm({ ...modalForm, sessionId: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}>
                      <option value="">Select session</option>
                      {sessionsWithAvailability.length === 0 && <option value="" disabled>No sessions available</option>}
                      {sessionsWithAvailability.map(s => (
                        <option key={s.id} value={s.id} disabled={markedForModalUser.has(s.id)}>{s.label}{markedForModalUser.has(s.id) ? ' — Already marked' : ''}{!s.isAvailable ? ' (outside time window)' : ''}</option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Lab</label>
                {modalUser.role === 'Server Manager' ? (
                  <select multiple value={modalForm.labs} onChange={(e) => setModalForm({ ...modalForm, labs: Array.from(e.target.selectedOptions).map(o => o.value) })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', minHeight: 48 }}>
                    {LABS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                ) : (
                  <select value={modalForm.labs[0] || ''} onChange={(e) => setModalForm({ ...modalForm, labs: [e.target.value] })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}>
                    <option value="">Select lab</option>
                    {LABS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Device Type</label>
                <select value={modalForm.deviceType} onChange={e => setModalForm({ ...modalForm, deviceType: e.target.value, deviceId: '' })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}>
                  <option value="">Select device type</option>
                  {DEVICE_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Device ID / Name</label>
                <select value={modalForm.deviceId} onChange={e => setModalForm({ ...modalForm, deviceId: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}>
                  <option value="">Select device</option>
                  {deviceOptionsWithStatus.map(d => {
                    const disabled = d.isAllocated && d.allocatedTo !== modalUser.id;
                    const label = `${d.deviceId} — ${d.name}${disabled ? ' — Already allocated' : ''}`;
                    return <option key={d.deviceId} value={d.deviceId} disabled={disabled}>{label}</option>;
                  })}
                </select>

                {/* Show list of devices that are currently allocated to others (red text) */}
                {deviceOptionsWithStatus.filter(d => d.isAllocated && d.allocatedTo !== modalUser.id).length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    {deviceOptionsWithStatus.filter(d => d.isAllocated && d.allocatedTo !== modalUser.id).map(d => (
                      <div key={d.deviceId} style={{ color: '#c53030', fontSize: 12 }}>{d.deviceId} — {d.name} — Already allocated</div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Face Capture (required)</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
                  <div style={{ width: 280, height: 210, border: '1px dashed #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, overflow: 'hidden' }}>
                    {faceImage ? (
                      <img src={faceImage} alt="face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      showCamera ? (
                        <video ref={videoRef} autoPlay playsInline style={{ width: 280, height: 210, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ color: '#6b7280', padding: 12 }}>No image captured</div>
                      )
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {!showCamera && (
                      <button onClick={startCamera} style={{ padding: '8px 12px', borderRadius: 8, background: '#0b74de', color: 'white', border: 'none' }}>Start Camera</button>
                    )}
                    {showCamera && (
                      <button onClick={captureFace} style={{ padding: '8px 12px', borderRadius: 8, background: '#0b74de', color: 'white', border: 'none' }}>Capture</button>
                    )}
                    {faceImage && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setFaceImage(''); startCamera(); }} style={{ padding: '8px 12px', borderRadius: 8, background: '#f59e0b', color: 'white', border: 'none' }}>Retake</button>
                      </div>
                    )}

                    <div style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                      Geofence: you must be within 100 m of the venue to mark attendance. Location will be verified automatically.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Cancel</button>
              <button onClick={handleSubmitAttendance} style={{ padding: '8px 12px', borderRadius: 8, background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', border: 'none' }}>Mark Present</button>
            </div>
          </div>
        </div>
      )}

      {/* Deallocate Modal */}
      {showDeallocateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1250 }} onClick={() => setShowDeallocateModal(false)}>
          <div style={{ width: 520, maxWidth: '95%', background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Deallocate Devices for Session</div>
              <button onClick={() => setShowDeallocateModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#6b7280', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 8, color: '#374151' }}>The following devices are currently allotted in this session. Deallocating will remove device assignment from users and make them available for new allocations.</div>
              {deallocateList.length === 0 && <div style={{ padding: 12, color: '#6b7280' }}>No devices are currently allotted in this session.</div>}
              {deallocateList.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: 8, textAlign: 'left' }}>
                        <input type="checkbox" checked={deallocateList.length > 0 && selectedDeallocateIds.size === deallocateList.length} onChange={(e) => {
                          if (e.target.checked) setSelectedDeallocateIds(new Set(deallocateList.map(d => d.userId)));
                          else setSelectedDeallocateIds(new Set());
                        }} />
                      </th>
                      <th style={{ padding: 8, textAlign: 'left' }}>User</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>Device ID</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>Device Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deallocateList.map(d => (
                      <tr key={d.id}>
                        <td style={{ padding: 8 }}>
                          <input type="checkbox" checked={selectedDeallocateIds.has(d.userId)} onChange={(e) => {
                            const next = new Set(selectedDeallocateIds);
                            if (e.target.checked) next.add(d.userId); else next.delete(d.userId);
                            setSelectedDeallocateIds(next);
                          }} />
                        </td>
                        <td style={{ padding: 8 }}>{d.userName}</td>
                        <td style={{ padding: 8 }}>{d.deviceId}</td>
                        <td style={{ padding: 8 }}>{d.deviceName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowDeallocateModal(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Cancel</button>
              <button onClick={handleConfirmDeallocate} disabled={deallocateList.length === 0} style={{ padding: '8px 12px', borderRadius: 8, background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', border: 'none' }}>Deallocate</button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Onboarding Modal */}
      {showEmergencyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }} onClick={() => setShowEmergencyModal(false)}>
          <div style={{ width: 600, maxWidth: '95%', background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>⚠</span>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#dc2626' }}>Emergency Onboarding</span>
              </div>
              <button onClick={() => setShowEmergencyModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#6b7280', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#991b1b' }}>
                <strong>Note:</strong> Emergency onboarding is valid for <strong>24 hours only</strong>. After that, the user will be automatically deactivated and will need to go through regular onboarding process.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Full Name <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  value={emergencyForm.name}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, name: e.target.value })}
                  placeholder="Enter full name"
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Mobile No. <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  value={emergencyForm.mobile}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Aadhar No. <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  value={emergencyForm.aadhar}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, aadhar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                  placeholder="12-digit Aadhar number"
                  maxLength={12}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Role <span style={{ color: '#dc2626' }}>*</span></label>
                <select
                  value={emergencyForm.role}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, role: e.target.value })}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
                >
                  <option value="">Select role</option>
                  {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Partner Organization <span style={{ color: '#dc2626' }}>*</span></label>
                <select
                  value={emergencyForm.partnerId}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, partnerId: e.target.value })}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
                >
                  <option value="">Select partner organization</option>
                  {partnerOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {partnerOptions.length === 0 && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>No partners available. Please add partner mappings in Step 2.</div>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Face Capture <span style={{ color: '#dc2626' }}>*</span></label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
                  <div style={{ width: 200, height: 150, border: '1px dashed #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, overflow: 'hidden', background: '#f9fafb' }}>
                    {emergencyFaceImage ? (
                      <img src={emergencyFaceImage} alt="face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      emergencyShowCamera ? (
                        <video ref={emergencyVideoRef} autoPlay playsInline style={{ width: 200, height: 150, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ color: '#6b7280', padding: 12, textAlign: 'center', fontSize: 12 }}>No image captured</div>
                      )
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {!emergencyShowCamera && !emergencyFaceImage && (
                      <button onClick={startEmergencyCamera} style={{ padding: '8px 12px', borderRadius: 8, background: '#0b74de', color: 'white', border: 'none', cursor: 'pointer' }}>Start Camera</button>
                    )}
                    {emergencyShowCamera && (
                      <button onClick={captureEmergencyFace} style={{ padding: '8px 12px', borderRadius: 8, background: '#0b74de', color: 'white', border: 'none', cursor: 'pointer' }}>Capture</button>
                    )}
                    {emergencyFaceImage && (
                      <button onClick={() => { setEmergencyFaceImage(''); startEmergencyCamera(); }} style={{ padding: '8px 12px', borderRadius: 8, background: '#f59e0b', color: 'white', border: 'none', cursor: 'pointer' }}>Retake</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => setShowEmergencyModal(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleEmergencySubmit} style={{ padding: '8px 16px', borderRadius: 8, background: '#dc2626', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Register Emergency User</button>
            </div>
          </div>
        </div>
      )}

      {/* Venue Checklist Modal */}
      {showChecklistModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400 }} onClick={() => setShowChecklistModal(false)}>
          <div style={{ width: 900, maxWidth: '95%', maxHeight: '90vh', background: 'white', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            {/* Header with Tabs */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: '12px 12px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>📋</span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 18, color: 'white' }}>Venue Checklist</span>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => setActiveChecklistTab('checklist1')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: activeChecklistTab === 'checklist1' ? 'none' : '1px solid rgba(255,255,255,0.3)',
                        background: activeChecklistTab === 'checklist1' ? 'rgba(255,255,255,0.3)' : 'transparent',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      Checklist-1 (T-60 min: {checklistForm.checklist1Time || '—'})
                    </button>
                    <button
                      onClick={() => setActiveChecklistTab('checklist2')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: activeChecklistTab === 'checklist2' ? 'none' : '1px solid rgba(255,255,255,0.3)',
                        background: activeChecklistTab === 'checklist2' ? 'rgba(255,255,255,0.3)' : 'transparent',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      Checklist-2 (T-30 min: {checklistForm.checklist2Time || '—'})
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowChecklistModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', fontSize: 20, color: 'white', cursor: 'pointer', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {/* CHECKLIST-1: Infrastructure Sections (8:00 AM) */}
              {activeChecklistTab === 'checklist1' && (
                <>
              {/* Centre Manager Information */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Centre Manager Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Name of Centre Manager</label>
                    <input value={checklistForm.centreManagerName || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Email ID</label>
                    <input value={checklistForm.centreManagerEmail || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Mobile Number</label>
                    <input value={checklistForm.centreManagerMobile || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                </div>
              </div>

              {/* Examination Details */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Examination Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Date of Examination</label>
                    <input value={checklistForm.examDate || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Batch of Examination</label>
                    <input value={checklistForm.examBatch || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                </div>
              </div>

              {/* Venue Information */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Venue Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>State</label>
                    <input value={checklistForm.venueState || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>City</label>
                    <input value={checklistForm.venueCity || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Venue Name & Code</label>
                    <input value={`${checklistForm.venueName || ''} (${checklistForm.venueCode || ''})`} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                </div>
              </div>

              {/* Security & Frisking */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Security & Frisking</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Male Frisking Guards Present</label>
                    <input value={checklistForm.maleGuardsPresent || 0} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Female Frisking Guards Present</label>
                    <input value={checklistForm.femaleGuardsPresent || 0} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Total No. of Frisking Guards</label>
                    <input value={checklistForm.totalFriskingGuards || 0} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>No. of HHMD Devices <span style={{ color: '#dc2626' }}>*</span></label>
                    <input 
                      type="number" 
                      min="0"
                      value={checklistForm.hhmdDevices || ''} 
                      onChange={(e) => setChecklistForm({ ...checklistForm, hhmdDevices: e.target.value })}
                      placeholder="Enter number"
                      style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13 }} 
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Closed canopy for female frisking? <span style={{ color: '#dc2626' }}>*</span></label>
                    <select 
                      value={checklistForm.femaleCanopy || ''} 
                      onChange={(e) => setChecklistForm({ ...checklistForm, femaleCanopy: e.target.value })}
                      style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13 }}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Infrastructure */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Infrastructure</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Computer systems have partitions? <span style={{ color: '#dc2626' }}>*</span></label>
                    <select 
                      value={checklistForm.computerPartitions || ''} 
                      onChange={(e) => setChecklistForm({ ...checklistForm, computerPartitions: e.target.value })}
                      style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13 }}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Signages/Direction Boards displayed? <span style={{ color: '#dc2626' }}>*</span></label>
                    <select 
                      value={checklistForm.signagesDisplayed || ''} 
                      onChange={(e) => setChecklistForm({ ...checklistForm, signagesDisplayed: e.target.value })}
                      style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13 }}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Seating Plan displayed outside lab? <span style={{ color: '#dc2626' }}>*</span></label>
                    <select 
                      value={checklistForm.seatingPlanDisplayed || ''} 
                      onChange={(e) => setChecklistForm({ ...checklistForm, seatingPlanDisplayed: e.target.value })}
                      style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13 }}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>DG Set available at venue? <span style={{ color: '#dc2626' }}>*</span></label>
                    <select 
                      value={checklistForm.dgSetAvailable || ''} 
                      onChange={(e) => setChecklistForm({ ...checklistForm, dgSetAvailable: e.target.value })}
                      style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13 }}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Venue Observer (from CET) present? <span style={{ color: '#dc2626' }}>*</span></label>
                    <select 
                      value={checklistForm.venueObserverPresent || ''} 
                      onChange={(e) => setChecklistForm({ ...checklistForm, venueObserverPresent: e.target.value })}
                      style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13 }}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>
                </>
              )}

              {/* CHECKLIST-2: Personnel & Device Sections (8:30 AM) */}
              {activeChecklistTab === 'checklist2' && (
                <>
              {/* Centre Manager Information (repeated for Checklist-2) */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Centre Manager Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Name of Centre Manager</label>
                    <input value={checklistForm.centreManagerName || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Email ID</label>
                    <input value={checklistForm.centreManagerEmail || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Mobile Number</label>
                    <input value={checklistForm.centreManagerMobile || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                </div>
              </div>

              {/* Examination Details (repeated for Checklist-2) */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Examination Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Date of Examination</label>
                    <input value={checklistForm.examDate || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Batch of Examination</label>
                    <input value={checklistForm.examBatch || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                </div>
              </div>

              {/* Venue Information (repeated for Checklist-2) */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Venue Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>State</label>
                    <input value={checklistForm.venueState || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>City</label>
                    <input value={checklistForm.venueCity || ''} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Venue Name & Code</label>
                    <input value={`${checklistForm.venueName || ''} (${checklistForm.venueCode || ''})`} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                </div>
              </div>

              {/* Invigilators */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Invigilators</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Invigilators present in lab? <span style={{ color: '#dc2626' }}>*</span></label>
                    <select 
                      value={checklistForm.invigilatorsPresent || ''} 
                      onChange={(e) => setChecklistForm({ ...checklistForm, invigilatorsPresent: e.target.value })}
                      style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13 }}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>No. of Invigilators Present</label>
                    <input value={checklistForm.invigilatorsCount || 0} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                </div>
              </div>

              {/* Server Managers */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Server Managers</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>No. of Server Managers at Venue</label>
                    <input value={checklistForm.serverManagersCount || 0} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Name & Mobile No. of Server Manager(s)</label>
                  <div style={{ background: '#f9fafb', borderRadius: 6, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#e5e7eb' }}>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Sr.</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Name</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Mobile No.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(checklistForm.serverManagersList || []).map((sm, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: 8 }}>{idx + 1}</td>
                            <td style={{ padding: 8 }}>{sm.userName || sm.name}</td>
                            <td style={{ padding: 8 }}>{sm.userMobile || sm.mobile || '-'}</td>
                          </tr>
                        ))}
                        {(checklistForm.serverManagersList || []).length === 0 && (
                          <tr><td colSpan={3} style={{ padding: 8, color: '#6b7280' }}>No server managers present</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* CCTV Technicians */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CCTV Technicians</h4>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Name & Mobile No. of CCTV Technician(s)</label>
                  <div style={{ background: '#f9fafb', borderRadius: 6, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#e5e7eb' }}>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Sr.</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Name</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Mobile No.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(checklistForm.cctvTechniciansList || []).map((ct, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: 8 }}>{idx + 1}</td>
                            <td style={{ padding: 8 }}>{ct.userName || ct.name}</td>
                            <td style={{ padding: 8 }}>{ct.userMobile || ct.mobile || '-'}</td>
                          </tr>
                        ))}
                        {(checklistForm.cctvTechniciansList || []).length === 0 && (
                          <tr><td colSpan={3} style={{ padding: 8, color: '#6b7280' }}>No CCTV technicians present</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Biometric Operators */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Biometric Operators</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>No. of Biometric Operators at Venue</label>
                    <input value={checklistForm.biometricOperatorsCount || 0} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Name & Mobile No. of Biometric Operator(s)</label>
                  <div style={{ background: '#f9fafb', borderRadius: 6, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#e5e7eb' }}>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Sr.</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Name</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Mobile No.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(checklistForm.biometricOperatorsList || []).map((bo, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: 8 }}>{idx + 1}</td>
                            <td style={{ padding: 8 }}>{bo.userName || bo.name}</td>
                            <td style={{ padding: 8 }}>{bo.userMobile || bo.mobile || '-'}</td>
                          </tr>
                        ))}
                        {(checklistForm.biometricOperatorsList || []).length === 0 && (
                          <tr><td colSpan={3} style={{ padding: 8, color: '#6b7280' }}>No biometric operators present</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Body Cam Operators */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Body Cam Operators</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>No. of Body Cams Issued</label>
                    <input value={checklistForm.bodyCamsIssued || 0} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13 }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Name & Mobile No. of Body Cam Operator(s)</label>
                  <div style={{ background: '#f9fafb', borderRadius: 6, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#e5e7eb' }}>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Sr.</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Name</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Mobile No.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(checklistForm.bodyCamOperatorsList || []).map((bc, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: 8 }}>{idx + 1}</td>
                            <td style={{ padding: 8 }}>{bc.userName || bc.name}</td>
                            <td style={{ padding: 8 }}>{bc.userMobile || bc.mobile || '-'}</td>
                          </tr>
                        ))}
                        {(checklistForm.bodyCamOperatorsList || []).length === 0 && (
                          <tr><td colSpan={3} style={{ padding: 8, color: '#6b7280' }}>No body cam operators present</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#f9fafb', borderRadius: '0 0 12px 12px' }}>
              <button onClick={() => setShowChecklistModal(false)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Cancel</button>
              <button onClick={handleChecklistSubmit} style={{ padding: '10px 20px', borderRadius: 8, background: activeChecklistTab === 'checklist1' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                Submit {activeChecklistTab === 'checklist1' ? 'Checklist-1' : 'Checklist-2'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5_UserAttendance;
