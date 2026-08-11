import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  SPORTS_LIST, 
  EVENTS_DATA, 
  FIXTURES_DATA, 
  ACHIEVEMENTS_DATA, 
  EXECUTIVE_BODY, 
  RULES_CONSTITUTION, 
  INITIAL_STUDENT_APPLICATIONS, 
  DOWNLOADABLE_FORMS, 
  GALLERY_ITEMS 
} from '../data/mockData';

const ConvexStateContext = createContext(null);

export function ConvexStateProvider({ children }) {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('kits_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Default Users & RBAC Roles
  const [users, setUsers] = useState([
    { id: 'usr-1', name: 'Dr. M. Bharath Kumar', email: 'admin@kitsports.ac.in', role: 'Super Admin', isActive: true, createdAt: '2026-01-01' },
    { id: 'usr-2', name: 'K. Venkata Rao', email: 'physicaldirector@kkrksr.ac.in', role: 'Faculty Coordinator', isActive: true, createdAt: '2026-01-05' },
    { id: 'usr-3', name: 'M. Surya Prakash Rao', email: 'sportscoordinator@kkrksr.ac.in', role: 'Sports Coordinator', isActive: true, createdAt: '2026-01-10' },
    { id: 'usr-4', name: 'G. Ravi Kiran', email: 'events@kkrksr.ac.in', role: 'Event Manager', isActive: true, createdAt: '2026-01-15' },
    { id: 'usr-5', name: 'Sk. Jameer Bhasha', email: 'captain@kkrksr.ac.in', role: 'Sports Captain', isActive: true, createdAt: '2026-01-20' },
  ]);

  // --- Real-Time Modules State ---
  const [sports, setSports] = useState(SPORTS_LIST);
  const [events, setEvents] = useState(EVENTS_DATA);
  const [fixtures, setFixtures] = useState(FIXTURES_DATA);
  const [achievements, setAchievements] = useState(ACHIEVEMENTS_DATA);
  const [executiveBody, setExecutiveBody] = useState(EXECUTIVE_BODY);
  const [applications, setApplications] = useState(INITIAL_STUDENT_APPLICATIONS);
  const [documents, setDocuments] = useState(DOWNLOADABLE_FORMS);
  const [gallery, setGallery] = useState(GALLERY_ITEMS);
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Annual Sports Meet 2026', message: "Annual Sports Meet 2026 'KRIDA PRATIBHA' Registration is officially open!", type: 'Announcement', time: '10 mins ago', isActive: true },
    { id: 'n2', title: 'Live Cricket Match', message: "Inter-College Cricket Semi-Finals live match in progress on Turf Oval Ground.", type: 'Match Update', time: '1 hour ago', isActive: true },
    { id: 'n3', title: 'Chess Victory', message: "KKR & KSR Mind Champions bagged 1st rank in All India University Chess League.", type: 'Announcement', time: 'Yesterday', isActive: true }
  ]);
  const [settings, setSettings] = useState({
    instituteName: 'KKR & KSR Institute of Technology & Sciences',
    campusAddress: 'Vinjanampadu, Vaddeswaram Post, Guntur - 522017, AP',
    contactEmail: 'sports@kkrksr.ac.in',
    contactPhone: '+91 91827 55664',
    enableNotifications: true,
    darkThemeDefault: false
  });
  const [auditLogs, setAuditLogs] = useState([]);

  // Save currentUser to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kits_admin_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('kits_admin_user');
    }
  }, [currentUser]);

  // Helper log generator
  const logAction = (action, details) => {
    if (!currentUser) return;
    const newLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userEmail: currentUser.email,
      action,
      details,
      timestamp: new Date().toLocaleString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // --- Auth Actions ---
  const login = (email, password) => {
    // Default admin check or registered user check
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser && (password === 'Admin@123456' || password === 'admin' || password.length >= 5)) {
      if (!foundUser.isActive) {
        throw new Error('User account is currently suspended.');
      }
      setCurrentUser(foundUser);
      logAction('LOGIN', `User ${foundUser.email} logged into Admin Console.`);
      return foundUser;
    }
    throw new Error('Invalid email address or password.');
  };

  const logout = () => {
    if (currentUser) {
      logAction('LOGOUT', `User ${currentUser.email} logged out.`);
    }
    setCurrentUser(null);
  };

  // --- Public Real-time Actions ---
  const addStudentApplication = (appData) => {
    const randomId = `KKR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp = {
      id: randomId,
      ...appData,
      status: "Pending",
      appliedDate: new Date().toISOString().split('T')[0],
      remarks: "Application received. Physical trial date will be notified via SMS."
    };
    setApplications(prev => [newApp, ...prev]);
    return randomId;
  };

  // --- Admin CRUD Actions ---
  const updateApplicationStatus = (id, newStatus, remarks) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus, remarks: remarks || a.remarks } : a));
    logAction('UPDATE_APPLICATION_STATUS', `Application ${id} status updated to ${newStatus}.`);
  };

  const deleteApplication = (id) => {
    setApplications(prev => prev.filter(a => a.id !== id));
    logAction('DELETE_APPLICATION', `Application ${id} deleted.`);
  };

  // Sports CRUD
  const addSport = (sportData) => {
    setSports(prev => [...prev, { id: `sport-${Date.now()}`, ...sportData }]);
    logAction('ADD_SPORT', `Added new sport: ${sportData.name}`);
  };

  const updateSport = (id, sportData) => {
    setSports(prev => prev.map(s => s.id === id ? { ...s, ...sportData } : s));
    logAction('UPDATE_SPORT', `Updated sport ID: ${id}`);
  };

  const deleteSport = (id) => {
    setSports(prev => prev.filter(s => s.id !== id));
    logAction('DELETE_SPORT', `Deleted sport ID: ${id}`);
  };

  // Events CRUD
  const addEvent = (eventData) => {
    setEvents(prev => [{ id: `evt-${Date.now()}`, registeredCount: 0, isPublished: true, ...eventData }, ...prev]);
    logAction('ADD_EVENT', `Added new event: ${eventData.title}`);
  };

  const updateEvent = (id, eventData) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...eventData } : e));
    logAction('UPDATE_EVENT', `Updated event ID: ${id}`);
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    logAction('DELETE_EVENT', `Deleted event ID: ${id}`);
  };

  // Live Scores Management
  const updateFixtureScore = (id, score1, score2, status, overs, result) => {
    setFixtures(prev => prev.map(f => f.id === id ? {
      ...f,
      score1: score1 !== undefined ? score1 : f.score1,
      score2: score2 !== undefined ? score2 : f.score2,
      status: status || f.status,
      overs: overs || f.overs,
      result: result || f.result
    } : f));
    logAction('UPDATE_SCORE', `Updated live match scores for ID: ${id}`);
  };

  const addFixture = (fixtureData) => {
    setFixtures(prev => [{ id: `fix-${Date.now()}`, status: 'LIVE', ...fixtureData }, ...prev]);
    logAction('ADD_FIXTURE', `Created new match: ${fixtureData.team1} vs ${fixtureData.team2}`);
  };

  // Achievements CRUD
  const addAchievement = (awardData) => {
    setAchievements(prev => ({
      ...prev,
      awards: [awardData, ...prev.awards]
    }));
    logAction('ADD_ACHIEVEMENT', `Added achievement: ${awardData.title}`);
  };

  // Notifications Broadcaster
  const broadcastNotification = (text, type = 'Announcement') => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: type,
      message: text,
      type,
      time: 'Just now',
      isActive: true
    };
    setNotifications(prev => [newNotif, ...prev]);
    logAction('BROADCAST_NOTIFICATION', `Broadcast alert: ${text}`);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Documents Management
  const addDocument = (docData) => {
    setDocuments(prev => [...prev, { downloadCount: 0, version: '1.0', ...docData }]);
    logAction('ADD_DOCUMENT', `Uploaded document: ${docData.title}`);
  };

  // Gallery Management
  const addGalleryItem = (itemData) => {
    setGallery(prev => [{ id: `g-${Date.now()}`, ...itemData }, ...prev]);
    logAction('ADD_GALLERY_ITEM', `Uploaded media to gallery: ${itemData.title}`);
  };

  // User & RBAC Management
  const addUser = (userData) => {
    const newUser = { id: `usr-${Date.now()}`, isActive: true, createdAt: new Date().toISOString().split('T')[0], ...userData };
    setUsers(prev => [...prev, newUser]);
    logAction('ADD_USER', `Created admin user: ${userData.email} (${userData.role})`);
  };

  const toggleUserActive = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    logAction('TOGGLE_USER_STATUS', `Toggled status for user ID: ${id}`);
  };

  // Settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logAction('UPDATE_SETTINGS', 'System settings updated.');
  };

  return (
    <ConvexStateContext.Provider value={{
      currentUser,
      users,
      sports,
      events,
      fixtures,
      achievements,
      executiveBody,
      applications,
      documents,
      gallery,
      notifications,
      settings,
      auditLogs,
      login,
      logout,
      addStudentApplication,
      updateApplicationStatus,
      deleteApplication,
      addSport,
      updateSport,
      deleteSport,
      addEvent,
      updateEvent,
      deleteEvent,
      updateFixtureScore,
      addFixture,
      addAchievement,
      broadcastNotification,
      clearNotifications,
      addDocument,
      addGalleryItem,
      addUser,
      toggleUserActive,
      updateSettings
    }}>
      {children}
    </ConvexStateContext.Provider>
  );
}

export function useConvexState() {
  const context = useContext(ConvexStateContext);
  if (!context) {
    throw new Error('useConvexState must be used within a ConvexStateProvider');
  }
  return context;
}
