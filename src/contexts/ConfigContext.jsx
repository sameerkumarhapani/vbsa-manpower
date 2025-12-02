import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ConfigContext = createContext();

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

export const ConfigProvider = ({ children }) => {
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
    localStorage.setItem('config_manpower_roles', JSON.stringify(manpowerRoles));
  }, [manpowerRoles]);
  useEffect(() => {
    localStorage.setItem('config_asset_types', JSON.stringify(assetTypes));
  }, [assetTypes]);

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
