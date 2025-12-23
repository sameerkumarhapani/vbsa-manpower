import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ConfigContext = createContext();

// Master list of available user role types
const MASTER_USER_ROLE_TYPES = [
  'Security Guards (1 Male & 1 Female)',
  'Invigilators',
  'Electrician',
  'House Keeping',
  'Network Administrator',
  'Server Manager',
  'Center Manager',
  'CCTV Technician',
  'Biometric Operator',
  'Body Cam Operator',
  'Centre Superintend',
  'Supervisor',
  'Data Entry Operator',
  'IT Support',
  'HR Manager',
  'Accountant',
  'Security Officer',
  'Admin Executive',
];

const DEFAULT_USER_ROLES = [
  { id: 1, roleName: 'Security Guards (1 Male & 1 Female)', ratioType: 'candidate', ratioValue: 100 },
  { id: 2, roleName: 'Invigilators', ratioType: 'candidate', ratioValue: 24 },
  { id: 3, roleName: 'Electrician', ratioType: 'venue', ratioValue: 1 },
  { id: 4, roleName: 'House Keeping', ratioType: 'venue', ratioValue: 1 },
  { id: 5, roleName: 'Network Administrator', ratioType: 'venue', ratioValue: 1 },
  { id: 6, roleName: 'Server Manager', ratioType: 'candidate', ratioValue: 100 },
  { id: 7, roleName: 'Center Manager', ratioType: 'venue', ratioValue: 1 },
  { id: 8, roleName: 'CCTV Technician', ratioType: 'venue', ratioValue: 1 },
  { id: 9, roleName: 'Biometric Operator', ratioType: 'candidate', ratioValue: 50 },
  { id: 10, roleName: 'Body Cam Operator', ratioType: 'venue', ratioValue: 1 },
  { id: 11, roleName: 'Centre Superintend', ratioType: 'venue', ratioValue: 1 },
];

const DEFAULT_MANPOWER_ROLES = [
  { id: 'mr-1', name: 'Security Guards (1 Male & 1 Female)', ratio: '1 per 100 Candidates at a venue' },
  { id: 'mr-2', name: 'Invigilators', ratio: '1 per 24 Candidates at a venue' },
  { id: 'mr-3', name: 'Electrician', ratio: '1 per venue' },
  { id: 'mr-4', name: 'House Keeping', ratio: '1 per venue' },
  { id: 'mr-5', name: 'Network Administrator', ratio: '1 per venue' },
  { id: 'mr-6', name: 'Server Manager', ratio: '1 per 100 Candidates at a venue' },
  { id: 'mr-7', name: 'Center Manager', ratio: '1 per venue' },
  { id: 'mr-8', name: 'CCTV Technician', ratio: '1 per venue' },
  { id: 'mr-9', name: 'Biometric Operator', ratio: '1 per 50 Candidates at a venue' },
  { id: 'mr-10', name: 'Body Cam Operator', ratio: '1 per venue' },
  { id: 'mr-11', name: 'Centre Superintendent', ratio: '1 per venue' },
];

const DEFAULT_ASSET_TYPES = [
  { id: 'at-1', name: 'HHMD (Handheld Metal Detectors)', ratio: '2 per 100 Candidates at a venue' },
  { id: 'at-2', name: 'Body Cams', ratio: '1 per 24 Candidates at a venue' },
  { id: 'at-3', name: 'Servers', ratio: '2 per 100 Candidates at a venue' },
  { id: 'at-4', name: 'CCTV Kit', ratio: '1 per 24 Candidates at a venue + 5' },
  { id: 'at-5', name: 'Biometric Tabs + Fingerprint Reader Kit', ratio: '1 per 50 Candidates at a venue' },
];

// Master list of available device types
const MASTER_DEVICE_TYPES = [
  'HHMD (Handheld Metal Detectors)',
  'Body Cams',
  'Servers',
  'CCTV Kit',
  'Biometric Tabs + Fingerprint Reader Kit',
];

const DEFAULT_DEVICE_RATIOS = [
  { id: 1, deviceName: 'HHMD (Handheld Metal Detectors)', deviceCount: 2, candidateCount: 100 },
  { id: 2, deviceName: 'Body Cams', deviceCount: 1, candidateCount: 24 },
  { id: 3, deviceName: 'Servers', deviceCount: 2, candidateCount: 100 },
  { id: 4, deviceName: 'CCTV Kit', deviceCount: 1, candidateCount: 24 },
  { id: 5, deviceName: 'Biometric Tabs + Fingerprint Reader Kit', deviceCount: 1, candidateCount: 50 },
];

const DEFAULT_EMERGENCY_ONBOARDING_CONFIG = {
  enableBeforeSessionHours: 4, // Enable button T-x hours before session start
  accountValidityHours: 24, // Emergency accounts valid for y hours
  attendanceCaptureBeforeSessionHours: 2, // Attendance can be captured T-z hours before session start
};

const DEFAULT_CHECKLIST_CONFIG = {
  checklist1: {
    enableBeforeSessionHours: 1, // T-A hours before session start
    disableAfterSessionHours: 2, // T+B hours after session end
  },
  checklist2: {
    enableBeforeSessionHours: 0.5, // T-A hours before session start
    disableAfterSessionHours: 1, // T+B hours after session end
  },
};

export const ConfigProvider = ({ children }) => {
  const [userRoles, setUserRoles] = useState(() => {
    const stored = localStorage.getItem('config_user_roles');
    return stored ? JSON.parse(stored) : DEFAULT_USER_ROLES;
  });
  
  const [deviceRatios, setDeviceRatios] = useState(() => {
    const stored = localStorage.getItem('config_device_ratios');
    return stored ? JSON.parse(stored) : DEFAULT_DEVICE_RATIOS;
  });
  
  const [emergencyOnboardingConfig, setEmergencyOnboardingConfig] = useState(() => {
    const stored = localStorage.getItem('config_emergency_onboarding');
    return stored ? JSON.parse(stored) : DEFAULT_EMERGENCY_ONBOARDING_CONFIG;
  });

  const [checklistConfig, setChecklistConfig] = useState(() => {
    const stored = localStorage.getItem('config_checklist');
    return stored ? JSON.parse(stored) : DEFAULT_CHECKLIST_CONFIG;
  });
  
  const [manpowerRoles, setManpowerRoles] = useState(() => {
    const stored = localStorage.getItem('config_manpower_roles');
    return stored ? JSON.parse(stored) : DEFAULT_MANPOWER_ROLES;
  });
  const [assetTypes, setAssetTypes] = useState(() => {
    const stored = localStorage.getItem('config_asset_types');
    return stored ? JSON.parse(stored) : DEFAULT_ASSET_TYPES;
  });

  // Persist
  useEffect(() => {
    localStorage.setItem('config_user_roles', JSON.stringify(userRoles));
  }, [userRoles]);
  
  useEffect(() => {
    localStorage.setItem('config_device_ratios', JSON.stringify(deviceRatios));
  }, [deviceRatios]);
  
  useEffect(() => {
    localStorage.setItem('config_emergency_onboarding', JSON.stringify(emergencyOnboardingConfig));
  }, [emergencyOnboardingConfig]);

  useEffect(() => {
    localStorage.setItem('config_checklist', JSON.stringify(checklistConfig));
  }, [checklistConfig]);
  
  useEffect(() => {
    localStorage.setItem('config_manpower_roles', JSON.stringify(manpowerRoles));
  }, [manpowerRoles]);
  useEffect(() => {
    localStorage.setItem('config_asset_types', JSON.stringify(assetTypes));
  }, [assetTypes]);

  // CRUD helpers for user roles
  const addUserRole = useCallback((roleName, ratioType, ratioValue) => {
    if (!roleName) return;
    setUserRoles(prev => [...prev, { 
      id: Date.now(), 
      roleName, 
      ratioType: ratioType || 'candidate', 
      ratioValue: ratioValue || 1 
    }]);
  }, []);
  
  const updateUserRole = useCallback((id, updates) => {
    setUserRoles(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);
  
  const deleteUserRole = useCallback((id) => {
    setUserRoles(prev => prev.filter(r => r.id !== id));
  }, []);
  
  // CRUD helpers for device ratios
  const addDeviceRatio = useCallback((deviceName, deviceCount, candidateCount) => {
    if (!deviceName) return;
    setDeviceRatios(prev => [...prev, { 
      id: Date.now(), 
      deviceName, 
      deviceCount: deviceCount || 1, 
      candidateCount: candidateCount || 1
    }]);
  }, []);
  
  const updateDeviceRatio = useCallback((id, updates) => {
    setDeviceRatios(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);
  
  const deleteDeviceRatio = useCallback((id) => {
    setDeviceRatios(prev => prev.filter(d => d.id !== id));
  }, []);
  
  // Emergency Onboarding Config
  const updateEmergencyOnboardingConfig = useCallback((updates) => {
    setEmergencyOnboardingConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Checklist Config
  const updateChecklistConfig = useCallback((updates) => {
    setChecklistConfig(prev => ({ ...prev, ...updates }));
  }, []);
  
  // CRUD helpers
  const addManpowerRole = useCallback((name, ratio) => {
    if (!name) return;
    setManpowerRoles(prev => [...prev, { id: `mr-${Date.now()}`, name, ratio: ratio || '' }]);
  }, []);
  const updateManpowerRole = useCallback((id, updates) => {
    setManpowerRoles(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);
  const addAssetType = useCallback((name, ratio) => {
    if (!name) return;
    setAssetTypes(prev => [...prev, { id: `at-${Date.now()}`, name, ratio: ratio || '' }]);
  }, []);
  const updateAssetType = useCallback((id, updates) => {
    setAssetTypes(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  return (
    <ConfigContext.Provider value={{
      masterUserRoleTypes: MASTER_USER_ROLE_TYPES,
      userRoles,
      setUserRoles,
      addUserRole,
      updateUserRole,
      deleteUserRole,
      masterDeviceTypes: MASTER_DEVICE_TYPES,
      deviceRatios,
      setDeviceRatios,
      addDeviceRatio,
      updateDeviceRatio,
      deleteDeviceRatio,
      emergencyOnboardingConfig,
      updateEmergencyOnboardingConfig,
      checklistConfig,
      updateChecklistConfig,
      manpowerRoles,
      assetTypes,
      addManpowerRole,
      updateManpowerRole,
      addAssetType,
      updateAssetType,
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
