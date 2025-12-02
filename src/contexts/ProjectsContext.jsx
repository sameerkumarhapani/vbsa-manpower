import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ProjectsContext = createContext();

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    const stored = localStorage.getItem('vbsa_projects');
    return stored ? JSON.parse(stored) : [];
  });
  const [subprojects, setSubprojects] = useState(() => {
    const stored = localStorage.getItem('vbsa_subprojects');
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedSubprojectId, setSelectedSubprojectId] = useState(null);
  const [subprojectMode, setSubprojectMode] = useState('create'); // create | edit | view

  // Demo data definition (used for manual load)
  const demoProjects = [
        {
          id: 'proj_demo_1',
          name: 'CET 2026-27 Master',
          label: 'FY 2026-27',
          startDate: '2026-04-01',
          endDate: '2027-03-31',
          status: 'Planning',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'proj_demo_2',
          name: 'UPSC Civil Services 2026',
          label: 'Phase A',
          startDate: '2026-01-15',
          endDate: '2026-12-15',
          status: 'In Progress',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'proj_demo_3',
          name: 'University Admissions 2026',
          label: 'Intake 2026',
          startDate: '2026-05-01',
          endDate: '2026-10-01',
          status: 'Completed',
          createdAt: new Date().toISOString(),
        },
      ];

  const demoSubprojects = [
        {
          id: 'sub_demo_1',
          parentProjectId: 'proj_demo_1',
          name: 'MBA CET 2026',
          label: 'MBA',
          startDate: '2026-06-10',
            endDate: '2026-06-20',
          status: 'Planning',
          vendorMappings: [],
          userMappings: [],
          mappedDevices: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sub_demo_2',
          parentProjectId: 'proj_demo_1',
          name: 'BBA CET 2026',
          label: 'BBA',
          startDate: '2026-07-05',
          endDate: '2026-07-18',
          status: 'Planning',
          vendorMappings: [],
          userMappings: [],
          mappedDevices: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sub_demo_3',
          parentProjectId: 'proj_demo_2',
          name: 'Prelims 2026',
          label: 'Prelims',
          startDate: '2026-06-01',
          endDate: '2026-06-02',
          status: 'In Progress',
          vendorMappings: [],
          userMappings: [],
          mappedDevices: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sub_demo_4',
          parentProjectId: 'proj_demo_2',
          name: 'Mains 2026',
          label: 'Mains',
          startDate: '2026-09-01',
          endDate: '2026-09-15',
          status: 'Planning',
          vendorMappings: [],
          userMappings: [],
          mappedDevices: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sub_demo_5',
          parentProjectId: 'proj_demo_3',
          name: 'Engineering Intake',
          label: 'ENG',
          startDate: '2026-05-10',
          endDate: '2026-06-30',
          status: 'Completed',
          vendorMappings: [],
          userMappings: [],
          mappedDevices: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sub_demo_6',
          parentProjectId: 'proj_demo_3',
          name: 'Medical Intake',
          label: 'MED',
          startDate: '2026-06-15',
          endDate: '2026-08-15',
          status: 'Completed',
          vendorMappings: [],
          userMappings: [],
          mappedDevices: [],
          createdAt: new Date().toISOString(),
        },
      ];

  // Remove auto-seed; rely on manual trigger to avoid unintended data injection
  const loadSampleData = useCallback(() => {
    // Merge only missing demo entries
    setProjects(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const toAdd = demoProjects.filter(p => !existingIds.has(p.id));
      const merged = [...prev, ...toAdd];
      localStorage.setItem('vbsa_projects', JSON.stringify(merged));
      return merged;
    });

    setSubprojects(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const toAdd = demoSubprojects.filter(s => !existingIds.has(s.id));
      const merged = [...prev, ...toAdd];
      localStorage.setItem('vbsa_subprojects', JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Auto seed (append missing demo items) once if not already done
  useEffect(() => {
    const seededFlag = localStorage.getItem('vbsa_demo_seeded');
    if (!seededFlag) {
      // Append missing demo projects
      setProjects(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const toAdd = demoProjects.filter(p => !existingIds.has(p.id));
        const merged = [...prev, ...toAdd];
        localStorage.setItem('vbsa_projects', JSON.stringify(merged));
        return merged;
      });
      // Append missing demo subprojects
      setSubprojects(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const toAdd = demoSubprojects.filter(s => !existingIds.has(s.id));
        const merged = [...prev, ...toAdd];
        localStorage.setItem('vbsa_subprojects', JSON.stringify(merged));
        return merged;
      });
      localStorage.setItem('vbsa_demo_seeded', 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vbsa_projects', JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem('vbsa_subprojects', JSON.stringify(subprojects));
  }, [subprojects]);

  const addProject = useCallback((data) => {
    const id = `proj_${Date.now()}`;
    const proj = { id, name: data.name, label: data.label, startDate: data.startDate, endDate: data.endDate, status: data.status || 'Planning', createdAt: new Date().toISOString() };
    setProjects(prev => [proj, ...prev]);
    return id;
  }, []);

  const updateProject = useCallback((id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const addSubproject = useCallback((parentProjectId, data) => {
    const id = `sub_${Date.now()}`;
    const sp = { id, parentProjectId, ...data, createdAt: new Date().toISOString() };
    setSubprojects(prev => [sp, ...prev]);
    return id;
  }, []);

  const getSubprojectsOf = useCallback((parentProjectId) => {
    return subprojects.filter(s => s.parentProjectId === parentProjectId);
  }, [subprojects]);

  const updateSubproject = useCallback((id, updates) => {
    setSubprojects(prev => prev.map(sp => sp.id === id ? { ...sp, ...updates } : sp));
  }, []);

  const getSubprojectById = useCallback((id) => subprojects.find(sp => sp.id === id), [subprojects]);

  return (
    <ProjectsContext.Provider value={{
      projects,
      subprojects,
      selectedProjectId,
      setSelectedProjectId,
      selectedSubprojectId,
      setSelectedSubprojectId,
      subprojectMode,
      setSubprojectMode,
      addProject,
      updateProject,
      addSubproject,
      getSubprojectsOf,
      updateSubproject,
      getSubprojectById,
      loadSampleData,
    }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectsContext);
