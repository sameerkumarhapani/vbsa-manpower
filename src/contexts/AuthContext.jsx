import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Role hierarchy and sub-roles mapping
const ROLE_HIERARCHY = {
  'Super Admin': { canViewRoles: null }, // Can see all roles
  'Project Manager': { canViewRoles: null }, // Can see all roles
  'Server Manager': { canViewRoles: null }, // Can see all roles
  'CCTV Partner PM': { canViewRoles: ['CCTV Technician'] },
  'Biometric Partner PM': { canViewRoles: ['Biometric Operator'] },
  'Body Cam Partner PM': { canViewRoles: ['Body Cam Operator'] },
  'Technology Partner PM': { canViewRoles: ['Network Administrator', 'Server Manager'] },
  'Venue Partner PM': { canViewRoles: ['Center Manager', 'Centre Superintendent', 'Housekeeping', 'Electrician', 'Invigilators'] },
  'Manpower Partner PM': { canViewRoles: ['Security Guards', 'Invigilators', 'Housekeeping'] },
};

// Mock user data for different roles
const MOCK_USERS = {
  superadmin: {
    id: 'sa-001',
    username: 'superadmin',
    email: 'admin@vbsa.com',
    password: 'superadmin123',
    role: 'Super Admin',
    fullName: 'Rajesh Kumar',
  },
  projectmanager: {
    id: 'pm-001',
    username: 'projectmanager',
    email: 'pm.sharma@vbsa.com',
    password: 'pm123',
    role: 'Project Manager',
    fullName: 'Amit Sharma',
  },
  servermanager: {
    id: 'sm-001',
    username: 'servermanager',
    email: 'sm.patel@vbsa.com',
    password: 'sm123',
    role: 'Server Manager',
    fullName: 'Vikram Patel',
  },
  venuepm: {
    id: 'vpm-001',
    username: 'venuepm',
    email: 'venue.pm@vbsa.com',
    password: 'venuepm123',
    role: 'Venue Partner PM',
    fullName: 'Priya Singh',
  },
  cctvpm: {
    id: 'cpm-001',
    username: 'cctvpm',
    email: 'cctv.pm@vbsa.com',
    password: 'cctvpm123',
    role: 'CCTV Partner PM',
    fullName: 'Arun Nair',
  },
  biometricpm: {
    id: 'bpm-001',
    username: 'biometricpm',
    email: 'biometric.pm@vbsa.com',
    password: 'biometricpm123',
    role: 'Biometric Partner PM',
    fullName: 'Neha Gupta',
  },
  techpm: {
    id: 'tpm-001',
    username: 'techpm',
    email: 'tech.pm@vbsa.com',
    password: 'techpm123',
    role: 'Technology Partner PM',
    fullName: 'Sanjay Reddy',
  },
  bodycampm: {
    id: 'bcpm-001',
    username: 'bodycampm',
    email: 'bodycam.pm@vbsa.com',
    password: 'bodycampm123',
    role: 'Body Cam Partner PM',
    fullName: 'Kavya Iyer',
  },
  manpowerpm: {
    id: 'mppm-001',
    username: 'manpowerpm',
    email: 'manpower.pm@vbsa.com',
    password: 'manpowerpm123',
    role: 'Manpower Partner PM',
    fullName: 'Rohan Verma',
  },
};

// Mock users database - all users across different roles
const ALL_USERS = [
  // CCTV Team
  { id: 'cctv-001', userId: 'USR001', fullName: 'Deepak Singh', email: 'deepak.singh@vbsa.com', role: 'CCTV Technician', vendorName: 'SecureVision Systems', mobile: '9876543210', mobileVerified: true, faceRegistered: true },
  { id: 'cctv-002', userId: 'USR002', fullName: 'Manoj Kumar', email: 'manoj.kumar@vbsa.com', role: 'CCTV Technician', vendorName: 'CameraGuard India', mobile: '9876543211', mobileVerified: true, faceRegistered: false },
  
  // Biometric Team
  { id: 'bio-001', userId: 'USR003', fullName: 'Priya Mishra', email: 'priya.mishra@vbsa.com', role: 'Biometric Operator', vendorName: 'FingerPrint Tech', mobile: '9876543212', mobileVerified: true, faceRegistered: true },
  { id: 'bio-002', userId: 'USR004', fullName: 'Anita Desai', email: 'anita.desai@vbsa.com', role: 'Biometric Operator', vendorName: 'BioMetrics India', mobile: '9876543213', mobileVerified: false, faceRegistered: false },
  
  // Body Cam Team
  { id: 'bc-001', userId: 'USR005', fullName: 'Harsh Patel', email: 'harsh.patel@vbsa.com', role: 'Body Cam Operator', vendorName: 'ActionCam Pro', mobile: '9876543214', mobileVerified: false, faceRegistered: false },
  { id: 'bc-002', userId: 'USR006', fullName: 'Rahul Joshi', email: 'rahul.joshi@vbsa.com', role: 'Body Cam Operator', vendorName: 'BodyTrack Solutions', mobile: '9876543215', mobileVerified: true, faceRegistered: true },
  
  // Technology Team
  { id: 'tech-001', userId: 'USR007', fullName: 'Arjun Saxena', email: 'arjun.saxena@vbsa.com', role: 'Network Administrator', vendorName: 'Network Solutions Ltd', mobile: '9876543216', mobileVerified: true, faceRegistered: false },
  { id: 'tech-002', userId: 'USR008', fullName: 'Nikhil Bhat', email: 'nikhil.bhat@vbsa.com', role: 'Server Manager', vendorName: 'Cloud Infrastructure Inc', mobile: '9876543217', mobileVerified: true, faceRegistered: true },
  
  // Venue Team
  { id: 'venue-001', userId: 'USR009', fullName: 'Meera Nair', email: 'meera.nair@vbsa.com', role: 'Center Manager', vendorName: 'Premium Venues Corp', mobile: '9876543218', mobileVerified: false, faceRegistered: false },
  { id: 'venue-002', userId: 'USR010', fullName: 'Suresh Rao', email: 'suresh.rao@vbsa.com', role: 'Centre Superintendent', vendorName: 'EventSpace India', mobile: '9876543219', mobileVerified: true, faceRegistered: true },
  { id: 'venue-003', userId: 'USR011', fullName: 'Lakshmi Srinivasan', email: 'lakshmi.srinivasan@vbsa.com', role: 'Housekeeping', vendorName: 'Premium Venues Corp', mobile: '9876543220', mobileVerified: false, faceRegistered: false },
  { id: 'venue-004', userId: 'USR012', fullName: 'Ramesh Kumar', email: 'ramesh.kumar@vbsa.com', role: 'Electrician', vendorName: 'EventSpace India', mobile: '9876543221', mobileVerified: true, faceRegistered: false },
  { id: 'venue-005', userId: 'USR013', fullName: 'Divya Chakraborty', email: 'divya.chakraborty@vbsa.com', role: 'Invigilators', vendorName: 'Premium Venues Corp', mobile: '9876543222', mobileVerified: true, faceRegistered: true },
  
  // Manpower Team
  { id: 'mp-001', userId: 'USR014', fullName: 'Vikram Singh', email: 'vikram.singh@vbsa.com', role: 'Security Guards', vendorName: 'SecureForce Staffing', mobile: '9876543223', mobileVerified: true, faceRegistered: true },
  { id: 'mp-002', userId: 'USR015', fullName: 'Ajay Kumar', email: 'ajay.kumar@vbsa.com', role: 'Security Guards', vendorName: 'ManpowerHub Solutions', mobile: '9876543224', mobileVerified: false, faceRegistered: false },
  { id: 'mp-003', userId: 'USR016', fullName: 'Sneha Verma', email: 'sneha.verma@vbsa.com', role: 'Invigilators', vendorName: 'SecureForce Staffing', mobile: '9876543225', mobileVerified: true, faceRegistered: false },
  { id: 'mp-004', userId: 'USR017', fullName: 'Ravi Shankar', email: 'ravi.shankar@vbsa.com', role: 'Housekeeping', vendorName: 'ManpowerHub Solutions', mobile: '9876543226', mobileVerified: false, faceRegistered: true },
];

// Mock vendors database - all vendors across different categories
const ALL_VENDORS = [
  // CCTV Vendors
  { id: 'v-cctv-001', name: 'SecureVision Systems', vendorTypes: ['CCTV Partner'], contactPerson: 'Suresh Reddy', email: 'suresh@securevision.com', phone: '+91-9876543210', status: 'Active' },
  { id: 'v-cctv-002', name: 'CameraGuard India', vendorTypes: ['CCTV Partner'], contactPerson: 'Priya Singh', email: 'priya@cameraguard.com', phone: '+91-9876543211', status: 'Active' },
  
  // Biometric Vendors
  { id: 'v-bio-001', name: 'FingerPrint Tech', vendorTypes: ['Biometric Partner'], contactPerson: 'Anil Kumar', email: 'anil@fingerprinttech.com', phone: '+91-9876543212', status: 'Active' },
  { id: 'v-bio-002', name: 'BioMetrics India', vendorTypes: ['Biometric Partner'], contactPerson: 'Kavya Nair', email: 'kavya@biometricsindia.com', phone: '+91-9876543213', status: 'Inactive' },
  
  // Body Cam Vendors
  { id: 'v-bc-001', name: 'ActionCam Pro', vendorTypes: ['Body Cam Partner'], contactPerson: 'Rohit Sharma', email: 'rohit@actioncampro.com', phone: '+91-9876543214', status: 'Active' },
  { id: 'v-bc-002', name: 'BodyTrack Solutions', vendorTypes: ['Body Cam Partner'], contactPerson: 'Neha Desai', email: 'neha@bodytrack.com', phone: '+91-9876543215', status: 'Active' },
  
  // Technology Vendors
  { id: 'v-tech-001', name: 'Network Solutions Ltd', vendorTypes: ['Technology Partner'], contactPerson: 'Sanjay Patel', email: 'sanjay@netsolutions.com', phone: '+91-9876543216', status: 'Active' },
  { id: 'v-tech-002', name: 'Cloud Infrastructure Inc', vendorTypes: ['Technology Partner'], contactPerson: 'Vikas Gupta', email: 'vikas@cloudinfra.com', phone: '+91-9876543217', status: 'Active' },
  
  // Venue Vendors
  { id: 'v-venue-001', name: 'Premium Venues Corp', vendorTypes: ['Venue Partner'], contactPerson: 'Rajesh Kapoor', email: 'rajesh@premiumvenues.com', phone: '+91-9876543218', status: 'Active' },
  { id: 'v-venue-002', name: 'EventSpace India', vendorTypes: ['Venue Partner'], contactPerson: 'Anjali Verma', email: 'anjali@eventspace.com', phone: '+91-9876543219', status: 'Active' },
  
  // Manpower Vendors
  { id: 'v-mp-001', name: 'SecureForce Staffing', vendorTypes: ['Manpower Partner'], contactPerson: 'Rajesh Singh', email: 'rajesh@secureforce.com', phone: '+91-9876543220', status: 'Active' },
  { id: 'v-mp-002', name: 'ManpowerHub Solutions', vendorTypes: ['Manpower Partner'], contactPerson: 'Divya Sharma', email: 'divya@manpowerhub.com', phone: '+91-9876543221', status: 'Active' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Helper to generate userId if missing
  const ensureUserIds = (userList) => {
    return userList.map((u, index) => {
      if (!u.userId) {
        // Generate userId based on index: USR001, USR002, etc.
        const num = String(index + 1).padStart(3, '0');
        return { ...u, userId: `USR${num}` };
      }
      return u;
    });
  };

  // Initialize users from localStorage or use default ALL_USERS
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('vbsa_users');
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      // Ensure all users have userId (migration for old data)
      const withUserIds = ensureUserIds(parsed);
      // Save back if we added any userIds
      if (JSON.stringify(parsed) !== JSON.stringify(withUserIds)) {
        localStorage.setItem('vbsa_users', JSON.stringify(withUserIds));
      }
      return withUserIds;
    }
    return ALL_USERS;
  });

  // Initialize vendors from localStorage or use default ALL_VENDORS
  const [vendors, setVendors] = useState(() => {
    const savedVendors = localStorage.getItem('vbsa_vendors');
    return savedVendors ? JSON.parse(savedVendors) : ALL_VENDORS;
  });

  const login = (role, username, password) => {
    const selectedUser = MOCK_USERS[role];
    if (selectedUser && selectedUser.username === username && selectedUser.password === password) {
      setUser(selectedUser);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const getCredentials = (role) => {
    const selectedUser = MOCK_USERS[role];
    return {
      username: selectedUser?.username || '',
      password: selectedUser?.password || '',
    };
  };

  // Get users that the current logged-in user can view based on their role
  const getVisibleUsers = () => {
    if (!user) return [];

    const userRole = user.role;
    const roleConfig = ROLE_HIERARCHY[userRole];

    if (!roleConfig) return [];

    // Super Admin, Project Manager, Server Manager can see all users
    if (roleConfig.canViewRoles === null) {
      return users;
    }

    // Filter users based on role hierarchy
    return users.filter((u) => roleConfig.canViewRoles.includes(u.role));
  };

  // Get vendors - only visible to Super Admin
  const getVisibleVendors = () => {
    if (!user) return [];
    if (user.role === 'Super Admin') {
      return vendors;
    }
    return [];
  };

  // Get all existing mobile numbers from users and vendors for uniqueness validation
  const getAllExistingMobileNumbers = () => {
    const mobileNumbers = new Set();

    // Extract from MOCK_USERS (login accounts)
    Object.values(MOCK_USERS).forEach((user) => {
      // These are mock users without phone fields, so we'll skip them
    });

    // Extract from ALL_USERS
    users.forEach((user) => {
      if (user.phone) {
        // Extract only digits from phone number
        const phoneDigits = user.phone.replace(/\D/g, '');
        if (phoneDigits.length === 10) {
          mobileNumbers.add(phoneDigits);
        }
      }
    });

    // Extract from ALL_VENDORS
    vendors.forEach((vendor) => {
      if (vendor.phone) {
        // Extract only digits from phone number
        const phoneDigits = vendor.phone.replace(/\D/g, '');
        if (phoneDigits.length === 10) {
          mobileNumbers.add(phoneDigits);
        }
      }
    });

    return mobileNumbers;
  };

  // Deactivate all users associated with a vendor
  const deactivateUsersByVendor = (vendorName) => {
    // Update users state to trigger re-render in UsersView
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => 
        user.vendorName === vendorName 
          ? { ...user, status: 'Inactive' }
          : user
      );
      // Persist to localStorage
      localStorage.setItem('vbsa_users', JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  // Update vendor and persist to localStorage
  const updateVendor = (updatedVendor) => {
    setVendors(prevVendors => {
      const updatedVendors = prevVendors.map(v => 
        v.id === updatedVendor.id ? updatedVendor : v
      );
      localStorage.setItem('vbsa_vendors', JSON.stringify(updatedVendors));
      return updatedVendors;
    });
  };

  // Add new vendor and persist to localStorage
  const addVendor = (newVendor) => {
    setVendors(prevVendors => {
      const updatedVendors = [...prevVendors, newVendor];
      localStorage.setItem('vbsa_vendors', JSON.stringify(updatedVendors));
      return updatedVendors;
    });
  };

  // Add new user and persist to localStorage
  const addUser = (newUser) => {
    setUsers(prevUsers => {
      // Generate userId if not provided
      const maxNum = prevUsers.reduce((max, u) => {
        const match = u.userId?.match(/USR(\d+)/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      const userId = newUser.userId || `USR${String(maxNum + 1).padStart(3, '0')}`;
      const userWithId = { ...newUser, userId };
      const updatedUsers = [...prevUsers, userWithId];
      localStorage.setItem('vbsa_users', JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  // Add multiple users (for bulk upload)
  const addUsers = (newUsers) => {
    setUsers(prevUsers => {
      let maxNum = prevUsers.reduce((max, u) => {
        const match = u.userId?.match(/USR(\d+)/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      
      const usersWithIds = newUsers.map(newUser => {
        if (!newUser.userId) {
          maxNum++;
          return { ...newUser, userId: `USR${String(maxNum).padStart(3, '0')}` };
        }
        return newUser;
      });
      
      const updatedUsers = [...prevUsers, ...usersWithIds];
      localStorage.setItem('vbsa_users', JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  // Sync user statuses with their vendor statuses
  const syncUserStatusesWithVendors = () => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => {
        // Find the vendor for this user
        const userVendor = vendors.find(v => v.vendorName === user.vendorName);
        // If vendor is inactive, user should also be inactive
        if (userVendor && userVendor.status === 'Inactive' && user.status !== 'Inactive') {
          return { ...user, status: 'Inactive' };
        }
        return user;
      });
      // Persist to localStorage
      localStorage.setItem('vbsa_users', JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        getCredentials,
        getVisibleUsers,
        getVisibleVendors,
        getAllExistingMobileNumbers,
        deactivateUsersByVendor,
        updateVendor,
        addVendor,
        addUser,
        addUsers,
        syncUserStatusesWithVendors,
        roleHierarchy: ROLE_HIERARCHY,
        users,
        vendors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
