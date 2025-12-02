import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Calendar, Users, Monitor, X, Building2, Filter, Camera, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectsContext';
import SubprojectDetailsStep from './steps/SubprojectDetailsStep';
import VendorVenueMappingStep from './steps/VendorVenueMappingStep';

const CreateProjectView = ({ onBack, parentProjectId, parentProject, editingSubproject, mode }) => {
  const { users, vendors } = useAuth();
  const { selectedProjectId, addSubproject, updateSubproject } = useProjects();
  const [currentStep, setCurrentStep] = useState(1);
  const isView = mode === 'view';
  
  // Project Details State
  const [projectDetails, setProjectDetails] = useState({
    name: '',
    startDate: '',
    endDate: '',
    label: '',
    description: '',
  });

  // Vendor Mapping State
  const [vendorMappings, setVendorMappings] = useState([]);
  const [showVendorMappingModal, setShowVendorMappingModal] = useState(false);
  const [selectedVendorForMapping, setSelectedVendorForMapping] = useState(null);
  const [currentVendorMapping, setCurrentVendorMapping] = useState({
    venue: '',
  });
  const [selectedVendorTypeFilter, setSelectedVendorTypeFilter] = useState('All');
  const [mappedVendorVenueFilter, setMappedVendorVenueFilter] = useState('All');
  const [mappedVendorTypeFilter, setMappedVendorTypeFilter] = useState('All');
  const [showMappedVendorFilterModal, setShowMappedVendorFilterModal] = useState(false);
  const [tempMappedVenueFilter, setTempMappedVenueFilter] = useState('All');
  const [tempMappedTypeFilter, setTempMappedTypeFilter] = useState('All');
  const [showRemoveVendorConfirmModal, setShowRemoveVendorConfirmModal] = useState(false);
  const [vendorToRemove, setVendorToRemove] = useState(null);

  // User Mapping State
  const [venues, setVenues] = useState([
    { id: 1, name: 'Mumbai Center', selected: false },
    { id: 2, name: 'Delhi Center', selected: false },
    { id: 3, name: 'Bangalore Center', selected: false },
    { id: 4, name: 'Kolkata Center', selected: false },
    { id: 5, name: 'Chennai Center', selected: false },
    { id: 6, name: 'Hyderabad Center', selected: false },
    { id: 7, name: 'Pune Center', selected: false },
    { id: 8, name: 'Ahmedabad Center', selected: false },
    { id: 9, name: 'Jaipur Center', selected: false },
    { id: 10, name: 'Lucknow Center', selected: false },
  ]);

  const [userMappings, setUserMappings] = useState([]);
  const [showUserMappingModal, setShowUserMappingModal] = useState(false);
  const [selectedUserForMapping, setSelectedUserForMapping] = useState(null);
  const [currentMapping, setCurrentMapping] = useState({
    venue: '',
    lab: '',
    slot: '',
  });
  const [selectedUserRoleFilter, setSelectedUserRoleFilter] = useState('All');
  const [mappedUserVenueFilter, setMappedUserVenueFilter] = useState('All');
  const [mappedUserRoleFilter, setMappedUserRoleFilter] = useState('All');
  const [mappedUserSlotFilter, setMappedUserSlotFilter] = useState('All');
  const [showMappedUserFilterModal, setShowMappedUserFilterModal] = useState(false);
  const [tempMappedUserVenueFilter, setTempMappedUserVenueFilter] = useState('All');
  const [tempMappedUserRoleFilter, setTempMappedUserRoleFilter] = useState('All');
  const [tempMappedUserSlotFilter, setTempMappedUserSlotFilter] = useState('All');
  const [showRemoveUserConfirmModal, setShowRemoveUserConfirmModal] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  
  // Available Users Filter State
  const [availableUserRoleFilter, setAvailableUserRoleFilter] = useState('All');
  const [availableUserVendorFilter, setAvailableUserVendorFilter] = useState('All');
  const [showAvailableUserFilterModal, setShowAvailableUserFilterModal] = useState(false);
  const [tempAvailableUserRoleFilter, setTempAvailableUserRoleFilter] = useState('All');
  const [tempAvailableUserVendorFilter, setTempAvailableUserVendorFilter] = useState('All');
  
  // Emergency Onboarding State
  const [showEmergencyOnboardingModal, setShowEmergencyOnboardingModal] = useState(false);
  const [emergencyUserDetails, setEmergencyUserDetails] = useState({
    fullName: '',
    contactNo: '',
    role: '',
    vendorName: '',
    venue: '',
    lab: '',
    slot: '',
  });
  const [emergencyFaceImage, setEmergencyFaceImage] = useState(null);
  const [showEmergencyCamera, setShowEmergencyCamera] = useState(false);
  
  // Attendance Capture State
  const [showAttendanceCamera, setShowAttendanceCamera] = useState(false);
  const [attendanceUserId, setAttendanceUserId] = useState(null);
  const [capturedFaceImage, setCapturedFaceImage] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Venue coordinates (mock data - replace with actual venue coordinates)
  const venueCoordinates = {
    'Mumbai Center': { lat: 19.0760, lng: 72.8777 },
    'Delhi Center': { lat: 28.7041, lng: 77.1025 },
    'Bangalore Center': { lat: 12.9716, lng: 77.5946 },
    'Kolkata Center': { lat: 22.5726, lng: 88.3639 },
    'Chennai Center': { lat: 13.0827, lng: 80.2707 },
    'Hyderabad Center': { lat: 17.3850, lng: 78.4867 },
    'Pune Center': { lat: 18.5204, lng: 73.8567 },
    'Ahmedabad Center': { lat: 23.0225, lng: 72.5714 },
    'Jaipur Center': { lat: 26.9124, lng: 75.7873 },
    'Lucknow Center': { lat: 26.8467, lng: 80.9462 },
  };

  // Device Mapping State (read-only)
  const [mappedDevices, setMappedDevices] = useState([
    { id: 1, name: 'CCTV Camera - MC-001', type: 'CCTV', venue: 'Mumbai Center', status: 'Active' },
    { id: 2, name: 'Biometric Device - MC-002', type: 'Biometric Device', venue: 'Mumbai Center', status: 'Active' },
    { id: 3, name: 'Server - DC-001', type: 'Server', venue: 'Delhi Center', status: 'Active' },
    { id: 4, name: 'Body Camera - BC-001', type: 'Body Camera', venue: 'Bangalore Center', status: 'Active' },
  ]);

  // Label is now fully free-form; academic year suggestions removed
  const academicYears = [];
  const labs = ['Lab-1', 'Lab-2', 'Lab-3', 'Lab-4', 'Lab-5'];
  const timeSlots = [
    '21-11-2025 10:00 AM - 12:00 PM',
    '21-11-2025 02:00 PM - 04:00 PM',
    '22-11-2025 10:00 AM - 12:00 PM',
    '22-11-2025 02:00 PM - 04:00 PM',
    '23-11-2025 10:00 AM - 12:00 PM',
    '23-11-2025 02:00 PM - 04:00 PM',
  ];

  const vendorTypeCategories = ['All', 'CCTV Partner', 'Biometric Partner', 'Body Cam Partner', 'Technology Partner', 'Venue Partner', 'Manpower Partner'];
  const userRoleCategories = ['All', 'Supervisor', 'Invigilator', 'Technician', 'Admin'];

  const steps = [
    { id: 1, name: 'Subproject Details', icon: Calendar },
    { id: 2, name: 'Vendor<>Venue Mapping', icon: Building2 },
    { id: 3, name: 'User<>Venue Mapping', icon: Users },
    { id: 4, name: 'Device Handling & Venue Mapping', icon: Monitor },
    { id: 5, name: 'User Attendance & Device Issuance', icon: Camera },
  ];

  // Prefill when editing/viewing an existing subproject
  useEffect(() => {
    if (editingSubproject && (mode === 'edit' || mode === 'view')) {
      setProjectDetails({
        name: editingSubproject.name || '',
        startDate: editingSubproject.startDate || '',
        endDate: editingSubproject.endDate || '',
        label: editingSubproject.label || '',
        description: editingSubproject.description || '',
      });
      setVendorMappings(editingSubproject.vendorMappings || []);
      setUserMappings(editingSubproject.userMappings || []);
      if (editingSubproject.mappedDevices) {
        setMappedDevices(editingSubproject.mappedDevices);
      }
    }
  }, [editingSubproject]);

  const handleAddUserMapping = (user) => {
    if (isView) return;
    setSelectedUserForMapping(user);
    setCurrentMapping({ venue: '', lab: '', slot: '' });
    setShowUserMappingModal(true);
  };

  const handleSaveUserMapping = () => {
    if (!currentMapping.venue) {
      alert('Please select a venue');
      return;
    }

    const newMapping = {
      userId: selectedUserForMapping.id,
      userName: selectedUserForMapping.fullName,
      userRole: selectedUserForMapping.role,
      contactNo: selectedUserForMapping.phone || selectedUserForMapping.contactNo || '-',
      venue: currentMapping.venue,
      lab: currentMapping.lab || '-',
      slot: currentMapping.slot || '-',
      attendance: null,
    };

    setUserMappings([...userMappings, newMapping]);
    setShowUserMappingModal(false);
    setSelectedUserForMapping(null);
    setCurrentMapping({ venue: '', lab: '', slot: '' });
  };

  const handleRemoveUserMapping = (userId) => {
    setUserMappings(userMappings.filter(m => m.userId !== userId));
    setShowRemoveUserConfirmModal(false);
    setUserToRemove(null);
  };

  const handleMarkAttendance = (userId) => {
    const userMapping = userMappings.find(m => m.userId === userId);
    if (!userMapping) return;
    
    setAttendanceUserId(userId);
    setShowAttendanceCamera(true);
    startCamera();
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      return canvas.toDataURL('image/jpeg');
    }
    return null;
  };

  const handleCaptureAttendance = () => {
    // Get current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Find user's venue
        const userMapping = userMappings.find(m => m.userId === attendanceUserId);
        const venueCoords = venueCoordinates[userMapping.venue];
        
        if (venueCoords) {
          const distance = calculateDistance(userLat, userLng, venueCoords.lat, venueCoords.lng);
          
          if (distance > 250) {
            alert(`You are ${Math.round(distance)} meters away from ${userMapping.venue}. You must be within 250 meters to mark attendance.`);
            return;
          }
        }
        
        // Capture face image
        const faceImage = captureImage();
        if (!faceImage) {
          alert('Failed to capture image. Please try again.');
          return;
        }
        
        // Mark attendance
        setUserMappings(userMappings.map(mapping => {
          if (mapping.userId === attendanceUserId) {
            return {
              ...mapping,
              attendance: {
                status: 'Present',
                timestamp: new Date().toLocaleString(),
                faceImage: faceImage,
                location: { lat: userLat, lng: userLng },
                distance: Math.round(distance),
              }
            };
          }
          return mapping;
        }));
        
        stopCamera();
        setShowAttendanceCamera(false);
        setAttendanceUserId(null);
        alert('Attendance marked successfully!');
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please enable location services.');
      },
      { enableHighAccuracy: true }
    );
  };

  const checkEmergencyOnboardingAllowed = () => {
    if (!projectDetails.startDate) {
      alert('Project start date is not set.');
      return false;
    }

    const now = new Date();
    const projectStartDate = new Date(projectDetails.startDate);
    
    // Check if today is within project dates
    const projectEndDate = new Date(projectDetails.endDate || projectDetails.startDate);
    if (now < projectStartDate || now > projectEndDate) {
      alert('Emergency onboarding is only allowed on project days.');
      return false;
    }

    // Get first slot start time (10:00 AM)
    const firstSlotTime = new Date(now);
    firstSlotTime.setHours(10, 0, 0, 0);
    
    // Calculate T-4 hours (6:00 AM)
    const allowedStartTime = new Date(firstSlotTime);
    allowedStartTime.setHours(firstSlotTime.getHours() - 4);
    
    if (now < allowedStartTime || now > firstSlotTime) {
      alert(`Emergency onboarding is only allowed between ${allowedStartTime.toLocaleTimeString()} and ${firstSlotTime.toLocaleTimeString()}`);
      return false;
    }

    return true;
  };

  const handleEmergencyOnboardingClick = () => {
    if (checkEmergencyOnboardingAllowed()) {
      setShowEmergencyOnboardingModal(true);
    }
  };

  const handleCaptureEmergencyFace = () => {
    const faceImage = captureImage();
    if (faceImage) {
      setEmergencyFaceImage(faceImage);
      stopCamera();
      setShowEmergencyCamera(false);
    } else {
      alert('Failed to capture image. Please try again.');
    }
  };

  const handleEmergencyOnboarding = () => {
    if (!emergencyUserDetails.fullName || !emergencyUserDetails.contactNo || !emergencyUserDetails.role || !emergencyUserDetails.venue) {
      alert('Please fill all required fields (Name, Contact, Role, and Venue)');
      return;
    }

    if (!emergencyFaceImage) {
      alert('Please capture face image');
      return;
    }

    const now = new Date();
    const expiryTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const newMapping = {
      userId: `emergency_${Date.now()}`,
      userName: emergencyUserDetails.fullName,
      userRole: emergencyUserDetails.role,
      contactNo: emergencyUserDetails.contactNo,
      vendorName: emergencyUserDetails.vendorName || '-',
      venue: emergencyUserDetails.venue,
      lab: emergencyUserDetails.lab || '-',
      slot: emergencyUserDetails.slot || '-',
      attendance: null,
      isEmergency: true,
      faceImage: emergencyFaceImage,
      createdAt: now.toISOString(),
      expiresAt: expiryTime.toISOString(),
      isActive: true,
    };

    setUserMappings([...userMappings, newMapping]);
    setShowEmergencyOnboardingModal(false);
    setEmergencyUserDetails({
      fullName: '',
      contactNo: '',
      role: '',
      vendorName: '',
      venue: '',
      lab: '',
      slot: '',
    });
    setEmergencyFaceImage(null);
    alert(`Emergency user added successfully! Account will expire at ${expiryTime.toLocaleString()}`);
  };

  // Check and deactivate expired emergency users
  useEffect(() => {
    const checkExpiredUsers = () => {
      const now = new Date();
      setUserMappings(prev => prev.map(mapping => {
        if (mapping.isEmergency && mapping.expiresAt) {
          const expiryDate = new Date(mapping.expiresAt);
          if (now > expiryDate && mapping.isActive) {
            return { ...mapping, isActive: false };
          }
        }
        return mapping;
      }));
    };

    const interval = setInterval(checkExpiredUsers, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Vendor Mapping Handlers
  const handleAddVendorMapping = (vendor) => {
    if (isView) return;
    setSelectedVendorForMapping(vendor);
    setCurrentVendorMapping({ venue: '' });
    setShowVendorMappingModal(true);
  };

  const handleSaveVendorMapping = () => {
    if (!currentVendorMapping.venue) {
      alert('Please select a venue');
      return;
    }

    const newMapping = {
      vendorId: selectedVendorForMapping.id,
      vendorName: selectedVendorForMapping.name,
      vendorTypes: selectedVendorForMapping.vendorTypes,
      venue: currentVendorMapping.venue,
      contactPerson: selectedVendorForMapping.contactPerson,
      contactPhone: selectedVendorForMapping.phone,
      contactEmail: selectedVendorForMapping.email,
    };

    setVendorMappings([...vendorMappings, newMapping]);
    setShowVendorMappingModal(false);
    setSelectedVendorForMapping(null);
    setCurrentVendorMapping({ venue: '' });
  };

  const handleRemoveVendorMapping = (vendorId) => {
    setVendorMappings(vendorMappings.filter(m => m.vendorId !== vendorId));
    setShowRemoveVendorConfirmModal(false);
    setVendorToRemove(null);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate project details
      if (!projectDetails.name || !projectDetails.startDate || !projectDetails.endDate || !projectDetails.label) {
        alert('Please fill all required fields in Project Details');
        return;
      }
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (isView) { // view mode just goes back
      onBack();
      return;
    }
    const parentId = parentProjectId || (parentProject ? selectedProjectId : null);
    if (!parentId) {
      alert('No parent project selected. Please go back to Projects and open a project to add subprojects.');
      return;
    }
    const data = {
      name: projectDetails.name,
      label: projectDetails.label,
      startDate: projectDetails.startDate,
      endDate: projectDetails.endDate,
      status: editingSubproject?.status || 'Planning',
      vendorMappings,
      userMappings,
      mappedDevices,
      description: projectDetails.description || '',
    };
    if (mode === 'edit' && editingSubproject) {
      updateSubproject(editingSubproject.id, data);
      alert('Subproject updated successfully!');
    } else {
      addSubproject(parentId, data);
      alert('Subproject created successfully!');
    }
    onBack();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <SubprojectDetailsStep
            projectDetails={projectDetails}
            setProjectDetails={setProjectDetails}
            vendors={vendors}
            vendorMappings={vendorMappings}
            vendorTypeCategories={vendorTypeCategories}
            selectedVendorTypeFilter={selectedVendorTypeFilter}
            setSelectedVendorTypeFilter={setSelectedVendorTypeFilter}
            handleAddVendorMapping={handleAddVendorMapping}
          />
        );

      case 2:
        return (
          <VendorVenueMappingStep
            vendors={vendors}
            vendorMappings={vendorMappings}
            vendorTypeCategories={vendorTypeCategories}
            selectedVendorTypeFilter={selectedVendorTypeFilter}
            setSelectedVendorTypeFilter={setSelectedVendorTypeFilter}
            mappedVendorVenueFilter={mappedVendorVenueFilter}
            mappedVendorTypeFilter={mappedVendorTypeFilter}
            setMappedVendorVenueFilter={setMappedVendorVenueFilter}
            setMappedVendorTypeFilter={setMappedVendorTypeFilter}
            showMappedVendorFilterModal={showMappedVendorFilterModal}
            setShowMappedVendorFilterModal={setShowMappedVendorFilterModal}
            tempMappedVenueFilter={tempMappedVenueFilter}
            setTempMappedVenueFilter={setTempMappedVenueFilter}
            tempMappedTypeFilter={tempMappedTypeFilter}
            setTempMappedTypeFilter={setTempMappedTypeFilter}
            showRemoveVendorConfirmModal={showRemoveVendorConfirmModal}
            setShowRemoveVendorConfirmModal={setShowRemoveVendorConfirmModal}
            vendorToRemove={vendorToRemove}
            setVendorToRemove={setVendorToRemove}
            handleAddVendorMapping={handleAddVendorMapping}
            handleRemoveVendorMapping={handleRemoveVendorMapping}
          />
        );

      case 3:
        return (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#1f2937' }}>
                User Mapping
              </h2>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {userMappings.length} user(s) mapped
              </div>
            </div>

            {/* User Mappings Table */}
            {userMappings.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#374151' }}>
                    Mapped Users
                    {(mappedUserVenueFilter !== 'All' || mappedUserRoleFilter !== 'All' || mappedUserSlotFilter !== 'All') && (
                      <span style={{
                        marginLeft: '8px',
                        padding: '4px 8px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        fontSize: '11px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                      }}>
                        Filtered
                      </span>
                    )}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleEmergencyOnboardingClick}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                      }}
                    >
                      <Users size={16} />
                      Emergency Onboarding
                    </button>
                    <button
                      onClick={() => {
                        setTempMappedUserVenueFilter(mappedUserVenueFilter);
                        setTempMappedUserRoleFilter(mappedUserRoleFilter);
                        setTempMappedUserSlotFilter(mappedUserSlotFilter);
                        setShowMappedUserFilterModal(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: (mappedUserVenueFilter !== 'All' || mappedUserRoleFilter !== 'All' || mappedUserSlotFilter !== 'All') ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)' : 'white',
                        color: (mappedUserVenueFilter !== 'All' || mappedUserRoleFilter !== 'All' || mappedUserSlotFilter !== 'All') ? 'white' : '#374151',
                        border: (mappedUserVenueFilter !== 'All' || mappedUserRoleFilter !== 'All' || mappedUserSlotFilter !== 'All') ? 'none' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        boxShadow: (mappedUserVenueFilter !== 'All' || mappedUserRoleFilter !== 'All' || mappedUserSlotFilter !== 'All') ? '0 4px 12px rgba(var(--color-primary-rgb), 0.18)' : 'none',
                      }}
                    >
                      <Filter size={16} />
                      Filter
                      {(() => {
                        const activeFilters = 
                          (mappedUserVenueFilter !== 'All' ? 1 : 0) + 
                          (mappedUserRoleFilter !== 'All' ? 1 : 0) +
                          (mappedUserSlotFilter !== 'All' ? 1 : 0);
                        return activeFilters > 0 ? (
                          <span style={{
                            marginLeft: '4px',
                            padding: '2px 6px',
                            background: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            fontSize: '11px',
                            borderRadius: '10px',
                            fontWeight: 700,
                          }}>
                            {activeFilters}
                          </span>
                        ) : null;
                      })()}
                    </button>
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <table className="table" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th>Sr.</th>
                        <th>User Name</th>
                        <th>Role</th>
                        <th>Contact No.</th>
                        <th>Venue</th>
                        <th>Lab</th>
                        <th>Slot</th>
                        <th>Attendance</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userMappings
                        .filter(mapping => {
                          const venueMatch = mappedUserVenueFilter === 'All' || mapping.venue === mappedUserVenueFilter;
                          const roleMatch = mappedUserRoleFilter === 'All' || mapping.userRole === mappedUserRoleFilter;
                          const slotMatch = mappedUserSlotFilter === 'All' || mapping.slot === mappedUserSlotFilter;
                          return venueMatch && roleMatch && slotMatch;
                        })
                        .map((mapping, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{mapping.userName}</strong>
                            {mapping.isEmergency && (
                              <span style={{
                                marginLeft: '6px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 600,
                                background: '#fef2f2',
                                color: '#dc2626',
                              }}>
                                EMERGENCY
                              </span>
                            )}
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: mapping.userRole === 'Emergency' ? '#fef2f2' : '#f0fdf4',
                              color: mapping.userRole === 'Emergency' ? '#dc2626' : '#16a34a',
                            }}>
                              {mapping.userRole}
                            </span>
                          </td>
                          <td style={{ fontSize: '13px', color: '#374151' }}>{mapping.contactNo || '-'}</td>
                          <td><strong>{mapping.venue}</strong></td>
                          <td>{mapping.lab || '-'}</td>
                          <td style={{ fontSize: '12px', color: '#6b7280' }}>{mapping.slot || '-'}</td>
                          <td>
                            {mapping.attendance ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  background: '#dcfce7',
                                  color: '#16a34a',
                                  display: 'inline-block',
                                }}>
                                  ✓ Present
                                </span>
                                <span style={{
                                  fontSize: '10px',
                                  color: '#6b7280',
                                }}>
                                  {mapping.attendance.timestamp}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleMarkAttendance(mapping.userId)}
                                style={{
                                  padding: '6px 12px',
                                  background: 'var(--color-primary)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Mark Present
                              </button>
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                setUserToRemove(mapping);
                                setShowRemoveUserConfirmModal(true);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#dc2626',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title="Remove mapping"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Available Users */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#374151' }}>
                  Available Users
                  {(availableUserRoleFilter !== 'All' || availableUserVendorFilter !== 'All') && (
                    <span style={{
                      marginLeft: '8px',
                      padding: '4px 8px',
                      background: 'var(--color-primary)',
                      color: 'white',
                      fontSize: '11px',
                      borderRadius: '12px',
                      fontWeight: 600,
                    }}>
                      Filtered
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => {
                    setTempAvailableUserRoleFilter(availableUserRoleFilter);
                    setTempAvailableUserVendorFilter(availableUserVendorFilter);
                    setShowAvailableUserFilterModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: (availableUserRoleFilter !== 'All' || availableUserVendorFilter !== 'All') ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)' : 'white',
                    color: (availableUserRoleFilter !== 'All' || availableUserVendorFilter !== 'All') ? 'white' : '#374151',
                    border: (availableUserRoleFilter !== 'All' || availableUserVendorFilter !== 'All') ? 'none' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    boxShadow: (availableUserRoleFilter !== 'All' || availableUserVendorFilter !== 'All') ? '0 4px 12px rgba(var(--color-primary-rgb), 0.18)' : 'none',
                  }}
                >
                  <Filter size={16} />
                  Filter
                  {(() => {
                    const activeFilters = 
                      (availableUserRoleFilter !== 'All' ? 1 : 0) + 
                      (availableUserVendorFilter !== 'All' ? 1 : 0);
                    return activeFilters > 0 ? (
                      <span style={{
                        marginLeft: '4px',
                        padding: '2px 6px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        fontSize: '11px',
                        borderRadius: '10px',
                        fontWeight: 700,
                      }}>
                        {activeFilters}
                      </span>
                    ) : null;
                  })()}
                </button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Role</th>
                    <th>Vendor</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(user => {
                      const notMapped = !userMappings.find(m => m.userId === user.id);
                      const roleMatch = availableUserRoleFilter === 'All' || user.role === availableUserRoleFilter;
                      const vendorMatch = availableUserVendorFilter === 'All' || user.vendorName === availableUserVendorFilter;
                      return notMapped && roleMatch && vendorMatch;
                    })
                    .map((user) => (
                    <tr key={user.id}>
                      <td><strong>{user.fullName}</strong></td>
                      <td>{user.role}</td>
                      <td>{user.vendorName || '-'}</td>
                      <td>
                        <button
                          onClick={() => handleAddUserMapping(user)}
                          style={{
                            padding: '6px 12px',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Map User
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* User Mapping Modal */}
            {showUserMappingModal && selectedUserForMapping && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 999,
                }}
                onClick={() => setShowUserMappingModal(false)}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    width: '90%',
                    maxWidth: '600px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    padding: '0',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                      Map User: {selectedUserForMapping.fullName}
                    </h3>
                  </div>

                  <div style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        Venue *
                      </label>
                      <select
                        value={currentMapping.venue}
                        onChange={(e) => setCurrentMapping({ ...currentMapping, venue: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="">Select Venue</option>
                        {venues.map(venue => (
                          <option key={venue.id} value={venue.name}>{venue.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        Lab (Optional)
                      </label>
                      <select
                        value={currentMapping.lab}
                        onChange={(e) => setCurrentMapping({ ...currentMapping, lab: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="">Select Lab</option>
                        {labs.map(lab => (
                          <option key={lab} value={lab}>{lab}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        Slot (Optional)
                      </label>
                      <select
                        value={currentMapping.slot}
                        onChange={(e) => setCurrentMapping({ ...currentMapping, slot: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="">Select Slot</option>
                        {timeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '12px',
                      padding: '16px 24px',
                      borderTop: '1px solid #e5e7eb',
                      background: '#f9fafb',
                    }}
                  >
                    <button
                      onClick={() => setShowUserMappingModal(false)}
                      style={{
                        padding: '10px 20px',
                        background: 'white',
                        color: '#374151',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveUserMapping}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Save Mapping
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mapped User Filter Modal */}
            {showMappedUserFilterModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 999,
                }}
                onClick={() => setShowMappedUserFilterModal(false)}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    width: '90%',
                    maxWidth: '500px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    padding: '0',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Filter size={20} color="white" />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                        Filter Mapped Users
                      </h3>
                    </div>
                  </div>

                  <div style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        Venue Name
                      </label>
                      <select
                        value={tempMappedUserVenueFilter}
                        onChange={(e) => setTempMappedUserVenueFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="All">All Venues</option>
                        {Array.from(new Set(userMappings.map(m => m.venue))).map(venue => (
                          <option key={venue} value={venue}>{venue}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        User Role
                      </label>
                      <select
                        value={tempMappedUserRoleFilter}
                        onChange={(e) => setTempMappedUserRoleFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="All">All Roles</option>
                        {Array.from(new Set(userMappings.map(m => m.userRole))).map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        Slot (Date & Time)
                      </label>
                      <select
                        value={tempMappedUserSlotFilter}
                        onChange={(e) => setTempMappedUserSlotFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="All">All Slots</option>
                        {Array.from(new Set(userMappings.map(m => m.slot).filter(s => s && s !== '-'))).map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '16px 24px',
                      borderTop: '1px solid #e5e7eb',
                      background: '#f9fafb',
                    }}
                  >
                    <button
                      onClick={() => {
                        setTempMappedUserVenueFilter('All');
                        setTempMappedUserRoleFilter('All');
                        setTempMappedUserSlotFilter('All');
                        setMappedUserVenueFilter('All');
                        setMappedUserRoleFilter('All');
                        setMappedUserSlotFilter('All');
                        setShowMappedUserFilterModal(false);
                      }}
                      style={{
                        padding: '10px 20px',
                        background: 'white',
                        color: '#dc2626',
                        border: '1px solid #dc2626',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Clear All
                    </button>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setShowMappedUserFilterModal(false)}
                        style={{
                          padding: '10px 20px',
                          background: 'white',
                          color: '#374151',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setMappedUserVenueFilter(tempMappedUserVenueFilter);
                          setMappedUserRoleFilter(tempMappedUserRoleFilter);
                          setMappedUserSlotFilter(tempMappedUserSlotFilter);
                          setShowMappedUserFilterModal(false);
                        }}
                        style={{
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Available User Filter Modal */}
            {showAvailableUserFilterModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 999,
                }}
                onClick={() => setShowAvailableUserFilterModal(false)}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    width: '90%',
                    maxWidth: '500px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    padding: '0',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Filter size={20} color="white" />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                        Filter Available Users
                      </h3>
                    </div>
                  </div>

                  <div style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        User Role
                      </label>
                      <select
                        value={tempAvailableUserRoleFilter}
                        onChange={(e) => setTempAvailableUserRoleFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="All">All Roles</option>
                        {userRoleCategories.filter(r => r !== 'All').map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        Vendor
                      </label>
                      <select
                        value={tempAvailableUserVendorFilter}
                        onChange={(e) => setTempAvailableUserVendorFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="All">All Vendors</option>
                        {Array.from(new Set(users.map(u => u.vendorName).filter(v => v))).map(vendor => (
                          <option key={vendor} value={vendor}>{vendor}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '16px 24px',
                      borderTop: '1px solid #e5e7eb',
                      background: '#f9fafb',
                    }}
                  >
                    <button
                      onClick={() => {
                        setTempAvailableUserRoleFilter('All');
                        setTempAvailableUserVendorFilter('All');
                        setAvailableUserRoleFilter('All');
                        setAvailableUserVendorFilter('All');
                        setShowAvailableUserFilterModal(false);
                      }}
                      style={{
                        padding: '10px 20px',
                        background: 'white',
                        color: '#dc2626',
                        border: '1px solid #dc2626',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Clear All
                    </button>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setShowAvailableUserFilterModal(false)}
                        style={{
                          padding: '10px 20px',
                          background: 'white',
                          color: '#374151',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setAvailableUserRoleFilter(tempAvailableUserRoleFilter);
                          setAvailableUserVendorFilter(tempAvailableUserVendorFilter);
                          setShowAvailableUserFilterModal(false);
                        }}
                        style={{
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Remove User Confirmation Modal */}
            {showRemoveUserConfirmModal && userToRemove && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
                onClick={() => setShowRemoveUserConfirmModal(false)}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    width: '90%',
                    maxWidth: '450px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    padding: '0',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}
                    >
                      <X size={28} color="#dc2626" />
                    </div>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
                      Remove User Mapping?
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                      Are you sure you want to remove <strong>{userToRemove.userName}</strong> from <strong>{userToRemove.venue}</strong>?
                      <br />This action cannot be undone.
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '16px 24px',
                      borderTop: '1px solid #e5e7eb',
                      background: '#f9fafb',
                    }}
                  >
                    <button
                      onClick={() => setShowRemoveUserConfirmModal(false)}
                      style={{
                        flex: 1,
                        padding: '10px 20px',
                        background: 'white',
                        color: '#374151',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRemoveUserMapping(userToRemove.userId)}
                      style={{
                        flex: 1,
                        padding: '10px 20px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Onboarding Modal */}
            {showEmergencyOnboardingModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
                onClick={() => setShowEmergencyOnboardingModal(false)}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    width: '90%',
                    maxWidth: '600px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    padding: '0',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#dc2626' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Users size={20} color="white" />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'white' }}>
                        Emergency User Onboarding
                      </h3>
                    </div>
                  </div>

                  <div style={{ padding: '24px' }}>
                    <div style={{ 
                      padding: '12px', 
                      background: '#fef2f2', 
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      marginBottom: '20px',
                    }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#dc2626' }}>
                        <strong>Note:</strong> Use this only for emergency situations. All fields marked with * are required.
                      </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={emergencyUserDetails.fullName}
                        onChange={(e) => setEmergencyUserDetails({ ...emergencyUserDetails, fullName: e.target.value })}
                        placeholder="Enter user's full name"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        value={emergencyUserDetails.contactNo}
                        onChange={(e) => setEmergencyUserDetails({ ...emergencyUserDetails, contactNo: e.target.value })}
                        placeholder="Enter contact number"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        User Role *
                      </label>
                      <select
                        value={emergencyUserDetails.role}
                        onChange={(e) => setEmergencyUserDetails({ ...emergencyUserDetails, role: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="">Select Role</option>
                        <option value="CCTV Technician">CCTV Technician</option>
                        <option value="Biometric Operator">Biometric Operator</option>
                        <option value="Body Cam Operator">Body Cam Operator</option>
                        <option value="Network Administrator">Network Administrator</option>
                        <option value="Server Manager">Server Manager</option>
                        <option value="Center Manager">Center Manager</option>
                        <option value="Centre Superintendent">Centre Superintendent</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Invigilators">Invigilators</option>
                        <option value="Security Guards">Security Guards</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        Vendor Organization
                      </label>
                      <select
                        value={emergencyUserDetails.vendorName}
                        onChange={(e) => setEmergencyUserDetails({ ...emergencyUserDetails, vendorName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="">Select Vendor (optional)</option>
                        {vendors.map(vendor => (
                          <option key={vendor.id} value={vendor.name}>{vendor.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        Venue *
                      </label>
                      <select
                        value={emergencyUserDetails.venue}
                        onChange={(e) => setEmergencyUserDetails({ ...emergencyUserDetails, venue: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="">Select Venue</option>
                        {venues.map(venue => (
                          <option key={venue.id} value={venue.name}>{venue.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        Lab
                      </label>
                      <select
                        value={emergencyUserDetails.lab}
                        onChange={(e) => setEmergencyUserDetails({ ...emergencyUserDetails, lab: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="">Select Lab (optional)</option>
                        {labs.map(lab => (
                          <option key={lab} value={lab}>{lab}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        Slot (Date & Time)
                      </label>
                      <select
                        value={emergencyUserDetails.slot}
                        onChange={(e) => setEmergencyUserDetails({ ...emergencyUserDetails, slot: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="">Select Slot (optional)</option>
                        {timeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                        Face Capture *
                      </label>
                      {emergencyFaceImage ? (
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={emergencyFaceImage} 
                            alt="Captured face" 
                            style={{ 
                              width: '100%', 
                              maxHeight: '300px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              border: '2px solid #10b981',
                            }} 
                          />
                          <button
                            onClick={() => {
                              setEmergencyFaceImage(null);
                              setShowEmergencyCamera(true);
                              setTimeout(() => startCamera(), 100);
                            }}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              padding: '8px 12px',
                              background: 'rgba(0, 0, 0, 0.7)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Recapture
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setShowEmergencyCamera(true);
                            setTimeout(() => startCamera(), 100);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <Camera size={18} />
                          Capture Face
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '12px',
                      padding: '16px 24px',
                      borderTop: '1px solid #e5e7eb',
                      background: '#f9fafb',
                    }}
                  >
                    <button
                      onClick={() => {
                        setShowEmergencyOnboardingModal(false);
                        setEmergencyUserDetails({
                          fullName: '',
                          contactNo: '',
                          vendorName: '',
                          venue: '',
                          lab: '',
                          slot: '',
                        });
                        setEmergencyFaceImage(null);
                        stopCamera();
                      }}
                      style={{
                        padding: '10px 20px',
                        background: 'white',
                        color: '#374151',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEmergencyOnboarding}
                      style={{
                        padding: '10px 20px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Add User
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Face Capture Modal */}
            {showAttendanceCamera && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  width: '90%',
                  maxWidth: '600px',
                  maxHeight: '90vh',
                  overflow: 'auto',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                    Capture Face for Attendance
                  </h3>
                  <button
                    onClick={() => {
                      setShowAttendanceCamera(false);
                      stopCamera();
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#6b7280',
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      background: '#000',
                      display: capturedFaceImage ? 'none' : 'block',
                    }}
                  />
                  {capturedFaceImage && (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={capturedFaceImage}
                        alt="Captured Face"
                        style={{
                          width: '100%',
                          borderRadius: '8px',
                          border: '3px solid #10b981',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <button
                          onClick={() => {
                            setCapturedFaceImage(null);
                            startCamera();
                          }}
                          style={{
                            padding: '10px 20px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            color: '#1f2937',
                            border: '2px solid #10b981',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                          }}
                        >
                          Recapture
                        </button>
                      </div>
                    </div>
                  )}
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

                {locationError && (
                  <div
                    style={{
                      padding: '12px',
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      marginBottom: '16px',
                      fontSize: '14px',
                      color: '#dc2626',
                    }}
                  >
                    {locationError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setShowAttendanceCamera(false);
                      setCapturedFaceImage(null);
                      setLocationError('');
                      stopCamera();
                    }}
                    style={{
                      padding: '10px 20px',
                      background: 'white',
                      color: '#6b7280',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCaptureAttendance}
                    disabled={!!capturedFaceImage}
                    style={{
                      padding: '10px 20px',
                      background: capturedFaceImage ? '#d1d5db' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: capturedFaceImage ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Camera size={18} />
                    Capture & Mark Attendance
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Onboarding Face Capture Modal */}
          {showEmergencyCamera && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
              }}
            >
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  width: '90%',
                  maxWidth: '600px',
                  maxHeight: '90vh',
                  overflow: 'auto',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                    Capture Face Photo
                  </h3>
                  <button
                    onClick={() => {
                      setShowEmergencyCamera(false);
                      stopCamera();
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#6b7280',
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      background: '#000',
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setShowEmergencyCamera(false);
                      stopCamera();
                    }}
                    style={{
                      padding: '10px 20px',
                      background: 'white',
                      color: '#6b7280',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCaptureEmergencyFace}
                    style={{
                      padding: '10px 20px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Camera size={18} />
                    Capture Photo
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        );

      case 4:
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#1f2937' }}>
              Device Mapping (Read-Only)
            </h2>

            <div
              style={{
                padding: '16px',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            >
              <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
                <strong>Note:</strong> Device mapping is managed separately. Below are the devices already mapped to this project.
              </p>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Device Name</th>
                  <th>Type</th>
                  <th>Venue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mappedDevices.map((device) => (
                  <tr key={device.id}>
                    <td><strong>{device.name}</strong></td>
                    <td>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: '#f0f4ff',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {device.type}
                      </span>
                    </td>
                    <td>{device.venue}</td>
                    <td>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: '#d1fae5',
                          color: '#059669',
                        }}
                      >
                        {device.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{mode === 'view' ? 'View Subproject' : mode === 'edit' ? 'Edit Subproject' : 'Create New Subproject'}</h1>
            <p className="page-subtitle">{mode === 'view' ? 'Read-only view of subproject details' : mode === 'edit' ? 'Update subproject details and mappings' : 'Set up a new subproject with user and device mappings'}</p>
          </div>
        </div>
      </div>

      <div className="content-section">
        {/* Stepper */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress Line */}
                <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '10%',
                right: '10%',
                height: '2px',
                    background: '#e5e7eb',
                zIndex: 0,
              }}
            >
              <div
                style={{
                  height: '100%',
                      background: 'var(--color-primary)',
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Steps */}
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div
                  key={step.id}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => setCurrentStep(step.id)}
                  title={step.name}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: isCompleted ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)' : isActive ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)' : 'white',
                      border: `2px solid ${isCompleted || isActive ? 'var(--color-primary)' : '#e5e7eb'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      boxShadow: (isCompleted || isActive) ? '0 6px 16px rgba(var(--color-primary-rgb), 0.22)' : 'none',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; if (!(isCompleted || isActive)) { e.currentTarget.style.boxShadow = '0 6px 16px rgba(var(--color-primary-rgb), 0.15)'; } }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; if (!(isCompleted || isActive)) { e.currentTarget.style.boxShadow = 'none'; } }}
                  >
                    {isCompleted ? (
                      <Check size={20} style={{ color: 'white' }} />
                    ) : (
                      <StepIcon size={20} style={{ color: isActive ? 'white' : 'var(--color-primary)' }} />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--color-primary)' : '#6b7280',
                      textAlign: 'center',
                      userSelect: 'none',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {step.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            minHeight: '400px',
            pointerEvents: isView ? 'none' : 'auto',
          }}
        >
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            style={{
              padding: '12px 24px',
              background: currentStep === 1 ? '#f3f4f6' : 'white',
              color: currentStep === 1 ? '#9ca3af' : '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              style={{
                padding: '12px 24px',
                background: isView
                  ? '#f3f4f6'
                  : mode === 'edit'
                  ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: isView ? '#374151' : 'white',
                border: isView ? '1px solid #e5e7eb' : 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={16} />
              {isView ? 'Back' : (mode === 'edit' ? 'Update Subproject' : 'Create Subproject')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProjectView;
