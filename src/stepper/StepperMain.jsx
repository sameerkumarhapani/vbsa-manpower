import React, { useState } from 'react';
import Step1_ProjectDetails from './Step1_ProjectDetails';
import Step2_PartnerVenue from './Step2_PartnerVenue';
import Step3_UserVenue from './Step3_UserVenue';
import Step4_DeviceVenue from './Step4_DeviceVenue';
import Step5_UserAttendance from './Step5_UserAttendance';
import { useProjects } from '../contexts/ProjectsContext';
import { FileText, Handshake, Users, Smartphone, ClipboardCheck } from 'lucide-react';

const StepperMain = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const { addSubproject, selectedProjectId, projects } = useProjects();
  
  // Get parent project to access its partner mappings
  const parentProject = projects.find(p => p.id === selectedProjectId);
  const parentPartnerMappings = parentProject?.partnerMappings || [];

  const [formData, setFormData] = useState({
    name: '',
    label: '',
    selectedDates: [],
    status: 'Planning',
    vendorMappings: [],
    userMappings: [],
    mappedDevices: [],
    attendanceDevices: [],
    sessions: [
      { id: 1, startTime: '', endTime: '' },
      { id: 2, startTime: '', endTime: '' },
      { id: 3, startTime: '', endTime: '' },
    ],
  });

  const next = () => setStep(s => Math.min(5, s + 1));
  const prev = () => setStep(s => Math.max(1, s - 1));

  const handleFinish = () => {
    if (!selectedProjectId) {
      alert('No parent project selected. Open a project first.');
      return;
    }
    // Basic validation
    if (!formData.name || !formData.label || !formData.selectedDates || formData.selectedDates.length === 0) {
      alert('Please fill required fields in Project Details: name, label and at least one date');
      setStep(1);
      return;
    }
    const hasSessionTimes = (formData.sessions || []).some(s => s.startTime && s.endTime);
    if (!hasSessionTimes) {
      alert('Please provide at least one session with start and end time');
      setStep(1);
      return;
    }
    addSubproject(selectedProjectId, formData);
    alert('Subproject created');
    onBack?.();
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Create Subproject</h1>
        <div>
          <button onClick={onBack} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Cancel</button>
        </div>
      </div>

      {/* Horizontal stepper bar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
        {[1,2,3,4,5].map(i => {
          const titles = [
            'Project details',
            'Partner <> Venue mapping',
            'User <> Venue Mapping',
            'Device Handling & Venue mapping',
            'User Attendance & Device Issuance',
          ];

          const icons = [
            <FileText size={16} key="i1" />,
            <Handshake size={16} key="i2" />,
            <Users size={16} key="i3" />,
            <Smartphone size={16} key="i4" />,
            <ClipboardCheck size={16} key="i5" />,
          ];

          const isActive = step === i;
          const isCompleted = step > i;

          return (
            <button
              key={i}
              onClick={() => setStep(i)}
              type="button"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                background: isActive ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)' : '#fff',
                color: isActive ? 'white' : '#374151',
                border: isActive ? 'none' : '1px solid #eef2ff',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? 'white' : (isCompleted ? 'rgba(34,197,94,0.12)' : '#eef2ff'),
                color: isActive ? 'var(--color-primary)' : (isCompleted ? '#16a34a' : 'var(--color-primary)'),
                fontWeight: 800
              }}>{icons[i-1]}</div>

              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{titles[i-1]}</div>
                <div style={{ fontSize: 12, color: isActive ? 'rgba(255,255,255,0.85)' : '#6b7280' }}>{isActive ? 'Current' : (isCompleted ? 'Completed' : '')}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: 20 }}>
          {step === 1 && <Step1_ProjectDetails formData={formData} setFormData={setFormData} />}
          {step === 2 && <Step2_PartnerVenue formData={formData} setFormData={setFormData} parentPartnerIds={parentPartnerMappings} />}
          {step === 3 && <Step3_UserVenue formData={formData} setFormData={setFormData} />}
          {step === 4 && <Step4_DeviceVenue formData={formData} setFormData={setFormData} />}
          {step === 5 && <Step5_UserAttendance formData={formData} setFormData={setFormData} />}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '14px 20px', borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
          <div>
            {step > 1 && <button onClick={prev} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', background: 'white', borderRadius: 8, marginRight: 8 }}>Previous</button>}
          </div>
          <div>
            {step < 5 && <button onClick={next} style={{ padding: '8px 12px', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', border: 'none', borderRadius: 8 }}>Next</button>}
            {step === 5 && <button onClick={handleFinish} style={{ padding: '8px 12px', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)', color: 'white', border: 'none', borderRadius: 8 }}>Create Subproject</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepperMain;
