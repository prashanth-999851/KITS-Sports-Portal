import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const ConvexStateContext = createContext(null);

export function ConvexStateProvider({ children }) {
  // --- Auth State (persisted in localStorage) ---
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kits_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('kits_admin_user');
      return null;
    }
  });
  const adminSessionToken = currentUser?.sessionToken;

  // Save currentUser to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kits_admin_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('kits_admin_user');
    }
  }, [currentUser]);

  // ========== CONVEX QUERIES (Real-time reactive) ==========
  const qSports = useQuery(api.sports.list);
  const qAchievements = useQuery(api.achievements.list);
  const qExecutiveBody = useQuery(api.executiveMembers.list);
  const qApplications = useQuery(api.registrations.list, adminSessionToken ? { sessionToken: adminSessionToken } : "skip");
  const qStudents = useQuery(api.students.list, adminSessionToken ? { sessionToken: adminSessionToken } : "skip");
  const qGallery = useQuery(api.gallery.list);
  const qNotifications = useQuery(api.notifications.list);
  const qUsers = useQuery(
    api.users.list,
    adminSessionToken && currentUser?.role === 'Super Admin' ? { sessionToken: adminSessionToken } : "skip"
  );
  const qSettings = useQuery(api.settings.getAll);
  const qAuditLogs = useQuery(api.auditLogs.list, adminSessionToken ? { sessionToken: adminSessionToken } : "skip");
  const qCoreValues = useQuery(api.coreValues.list);
  const qRules = useQuery(api.rules.list);
  const qJntukPlayers = useQuery(api.jntukPlayers.list);

  const isLoading = qSports === undefined || qExecutiveBody === undefined || qSettings === undefined || qAchievements === undefined;

  const rawSports = qSports ?? [];
  const rawAchievements = qAchievements ?? [];
  const rawExecutiveBody = qExecutiveBody ?? [];
  const rawApplications = qApplications ?? [];
  const rawStudents = qStudents ?? [];
  const rawGallery = qGallery ?? [];
  const rawNotifications = qNotifications ?? [];
  const rawUsers = qUsers ?? [];
  const rawSettings = qSettings ?? {};
  const rawAuditLogs = qAuditLogs ?? [];
  const rawCoreValues = qCoreValues ?? [];
  const rawRules = qRules ?? [];
  const rawJntukPlayers = qJntukPlayers ?? [];

  // ========== TRANSFORM DATA to match component expectations ==========

  // Sports: components expect { id, name, category, image, description, coordinator, assistantCoordinator, teamDetails: { menCaptain, womenCaptain, venue } }
  const sports = rawSports.map(s => ({
    id: s._id,
    name: s.name,
    category: s.category,
    image: s.imageUrl || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
    description: s.description,
    coordinator: s.coordinator,
    assistantCoordinator: s.assistantCoordinator,
    asstFacultyCoordinator: s.asstFacultyCoordinator || "M. Surya Prakash Rao",
    teamDetails: {
      menCaptain: s.menCaptain,
      womenCaptain: s.womenCaptain,
      venue: s.venue,
    },
  }));

  // Achievements: components expect { tallies: { gold, silver, bronze, trophies }, awards: [...] }
  const achievementAwards = rawAchievements.map(a => ({
    id: a._id,
    title: a.title,
    recipient: a.recipient,
    category: a.category,
    achievement: a.achievement,
    image: a.imageUrl || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
    year: a.year,
    medalType: a.medalType,
  }));

  const achievements = {
    tallies: {
      gold: rawSettings.tally_gold !== undefined ? Number(rawSettings.tally_gold) : 0,
      silver: rawSettings.tally_silver !== undefined ? Number(rawSettings.tally_silver) : 0,
      bronze: rawSettings.tally_bronze !== undefined ? Number(rawSettings.tally_bronze) : 0,
      trophies: rawSettings.tally_trophies !== undefined ? Number(rawSettings.tally_trophies) : 0,
      isLoaded: qSettings !== undefined,
    },
    awards: achievementAwards,
  };

  // Executive Body & Student Officers: components expect { id, name, position, department, photo, email, phone, memberType, displayOrder }
  const executiveBody = rawExecutiveBody
    .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1))
    .map(e => ({
      id: e._id,
      name: e.name,
      position: e.position,
      department: e.department,
      photo: e.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
      email: e.email || "",
      phone: e.phone || "",
      memberType: e.memberType || "Executive Body",
      displayOrder: e.displayOrder || 1,
    }));

  // Applications/Registrations: components expect { id, name, rollNumber, department, year, email, phone, preferredSports, status, appliedDate, remarks }
  const applications = rawApplications.map(a => ({
    id: a.trackingId,
    _convexId: a._id,
    name: a.studentName,
    rollNumber: a.rollNumber,
    department: a.department,
    year: a.year,
    section: a.section || '',
    gender: a.gender || 'Male',
    email: a.email,
    phone: a.phone,
    preferredSports: a.preferredSports,
    status: a.status,
    appliedDate: a.appliedDate,
    remarks: a.remarks,
  }));

  // Master Students Roster: components expect { id, name, rollNumber, department, year, section, email, phone, gender, sportId, status, createdAt }
  const students = rawStudents.map(s => ({
    id: s._id,
    name: s.name,
    rollNumber: s.rollNumber,
    department: s.department,
    year: s.year,
    section: s.section || 'A',
    email: s.email,
    phone: s.phone,
    gender: s.gender || 'Male',
    sportId: s.sportId || 'Cricket',
    status: s.status || 'Active',
    createdAt: s.createdAt,
  }));

  // Gallery: components expect { id, title, category, image, caption }
  const gallery = rawGallery.map(g => ({
    id: g._id,
    title: g.title,
    category: g.category,
    image: g.imageUrl || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000",
    caption: g.caption,
    mediaType: g.mediaType,
  }));

  // Notifications: components expect { id, title, message, type, time, isActive }
  const notifications = rawNotifications.map(n => ({
    id: n._id,
    title: n.title,
    message: n.message,
    type: n.type,
    time: getRelativeTime(n.createdAt),
    isActive: n.isActive,
  }));

  // Users
  const users = rawUsers.map(u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));

  // Settings: transform to object format components expect
  const settings = {
    instituteName: rawSettings.instituteName || 'KKR & KSR Institute of Technology & Sciences',
    campusAddress: rawSettings.campusAddress || 'Vinjanampadu, Vaddeswaram Post, Guntur - 522017, AP',
    contactEmail: rawSettings.contactEmail || '',
    contactPhone: rawSettings.contactPhone || '+91 91827 55664',
    enableNotifications: rawSettings.enableNotifications !== 'false',
    darkThemeDefault: rawSettings.darkThemeDefault === 'true',
  };

  // Audit Logs
  const auditLogs = rawAuditLogs.map(l => ({
    id: l._id,
    userId: l.userId,
    userEmail: l.userEmail,
    action: l.action,
    details: l.details,
    timestamp: l.timestamp,
  }));

  // Core Values: sorted by displayOrder
  const coreValues = rawCoreValues
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(cv => ({
      title: cv.title,
      icon: cv.icon,
      color: cv.color,
      description: cv.description,
    }));

  // Rules: sorted by displayOrder
  const rules = rawRules
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(r => ({
      chapter: r.chapter,
      title: r.title,
      content: r.content,
    }));

  // JNTUK Represented Players
  const jntukPlayers = rawJntukPlayers.map(p => ({
    id: p._id,
    studentName: p.studentName,
    rollNumber: p.rollNumber,
    department: p.department,
    sport: p.sport,
    academicYear: p.academicYear,
    tournamentName: p.tournamentName,
    venueHost: p.venueHost || '',
    photoUrl: p.photoUrl || '',
    achievementDetails: p.achievementDetails || '',
    createdAt: p.createdAt,
  }));

  // ========== CONVEX MUTATIONS ==========
  const loginMut = useMutation(api.users.login);
  const logoutMut = useMutation(api.users.logout);
  const createRegistration = useMutation(api.registrations.create);
  const updateRegStatus = useMutation(api.registrations.updateStatus);
  const updateRegistrationMut = useMutation(api.registrations.update);
  const removeRegistration = useMutation(api.registrations.remove);
  const createStudentMut = useMutation(api.students.create);
  const updateStudentMut = useMutation(api.students.update);
  const removeStudentMut = useMutation(api.students.remove);
  const createSport = useMutation(api.sports.create);
  const updateSportMut = useMutation(api.sports.update);
  const removeSport = useMutation(api.sports.remove);
  const createAchievement = useMutation(api.achievements.create);
  const removeAchievementMut = useMutation(api.achievements.remove);
  const broadcastNotif = useMutation(api.notifications.broadcast);
  const removeNotificationMut = useMutation(api.notifications.remove);
  const clearNotifAll = useMutation(api.notifications.clearAll);
  const createGalleryItem = useMutation(api.gallery.create);
  const updateGalleryItemMut = useMutation(api.gallery.update);
  const removeGalleryItemMut = useMutation(api.gallery.remove);
  const createUser = useMutation(api.users.create);
  const toggleUserActiveMut = useMutation(api.users.toggleActive);
  const createExecutiveMemberMut = useMutation(api.executiveMembers.create);
  const updateExecutiveMemberMut = useMutation(api.executiveMembers.update);
  const removeExecutiveMemberMut = useMutation(api.executiveMembers.remove);
  const createJntukPlayerMut = useMutation(api.jntukPlayers.create);
  const updateJntukPlayerMut = useMutation(api.jntukPlayers.update);
  const removeJntukPlayerMut = useMutation(api.jntukPlayers.remove);
  const updateSettingsBatch = useMutation(api.settings.updateBatch);
  const createAuditLog = useMutation(api.auditLogs.create);

  // ========== HELPER: Audit Log ==========
  const requireSessionToken = () => {
    if (!currentUser?.sessionToken) {
      throw new Error('Admin session expired. Please sign in again.');
    }
    return currentUser.sessionToken;
  };

  const withSession = (args = {}) => ({
    ...args,
    sessionToken: requireSessionToken(),
  });

  const logAction = async (action, details) => {
    if (!currentUser?.sessionToken) return;
    try {
      await createAuditLog({
        sessionToken: currentUser.sessionToken,
        userId: currentUser.id,
        userEmail: currentUser.email,
        action,
        details,
      });
    } catch (e) {
      console.error("Audit log error:", e);
    }
  };

  // ========== AUTH ACTIONS ==========
  const login = async (email, password) => {
    try {
      const user = await loginMut({ email, password });
      setCurrentUser(user);
      return user;
    } catch (err) {
      const rawMsg = err?.message || String(err || '');
      if (rawMsg.includes('suspended')) {
        throw new Error('Your Admin account is currently suspended.');
      }
      throw new Error(rawMsg || 'Invalid email address or password.');
    }
  };

  const logout = async () => {
    try {
      if (currentUser?.sessionToken) {
        await logoutMut({ sessionToken: currentUser.sessionToken });
      }
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setCurrentUser(null);
    }
  };

  // ========== PUBLIC ACTIONS ==========
  const addStudentApplication = async (appData) => {
    try {
      const trackingId = await createRegistration({
        studentName: appData.name,
        rollNumber: appData.rollNumber,
        department: appData.department,
        year: appData.year,
        section: appData.section || '',
        gender: appData.gender || 'Male',
        email: appData.email,
        phone: appData.phone,
        preferredSports: appData.preferredSports,
        status: appData.status || undefined,
        remarks: appData.remarks || undefined,
      });
      return trackingId;
    } catch (err) {
      console.error("Registration error:", err);
      return `KKR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  };

  // ========== ADMIN CRUD ACTIONS ==========
  const updateApplicationStatus = async (id, newStatus, remarks) => {
    const app = applications.find(a => a.id === id || a._convexId === id);
    const targetId = app ? app._convexId : id;
    if (targetId) {
      await updateRegStatus(withSession({ id: targetId, status: newStatus, remarks: remarks || undefined }));
      await logAction('UPDATE_APPLICATION_STATUS', `Application ${id} status updated to ${newStatus}.`);
    }
  };

  const updateApplication = async (id, appData) => {
    const app = applications.find(a => a.id === id || a._convexId === id);
    const targetId = app ? app._convexId : id;
    if (targetId) {
      await updateRegistrationMut(withSession({
        id: targetId,
        studentName: appData.name || appData.studentName,
        rollNumber: appData.rollNumber,
        department: appData.department,
        year: appData.year,
        section: appData.section,
        gender: appData.gender,
        email: appData.email,
        phone: appData.phone,
        preferredSports: appData.preferredSports,
        status: appData.status,
        remarks: appData.remarks,
      }));
      await logAction('UPDATE_APPLICATION', `Application ${id} updated.`);
    }
  };

  const deleteApplication = async (id) => {
    const app = applications.find(a => a.id === id || a._convexId === id);
    const targetId = app ? app._convexId : id;
    if (targetId) {
      await removeRegistration(withSession({ id: targetId }));
      await logAction('DELETE_APPLICATION', `Application ${id} deleted.`);
    }
  };

  // Master Student Directory CRUD
  const addStudentMaster = async (studentData) => {
    const newId = await createStudentMut(withSession({
      name: studentData.name,
      rollNumber: studentData.rollNumber,
      department: studentData.department,
      year: studentData.year,
      section: studentData.section || 'Section 1',
      email: studentData.email,
      phone: studentData.phone,
      gender: studentData.gender || 'Male',
      sportId: studentData.sportId || studentData.preferredSports?.[0] || 'Cricket',
      status: studentData.status || 'Active',
    }));
    await logAction('ADD_STUDENT_MASTER', `Added master student record: ${studentData.name} (${studentData.rollNumber})`);
    return newId;
  };

  const updateStudentMaster = async (id, studentData) => {
    await updateStudentMut(withSession({
      id,
      name: studentData.name,
      rollNumber: studentData.rollNumber,
      department: studentData.department,
      year: studentData.year,
      section: studentData.section,
      email: studentData.email,
      phone: studentData.phone,
      gender: studentData.gender,
      sportId: studentData.sportId || studentData.preferredSports?.[0],
      status: studentData.status,
    }));
    await logAction('UPDATE_STUDENT_MASTER', `Updated master student record ID: ${id}`);
  };

  const deleteStudentMaster = async (id) => {
    await removeStudentMut(withSession({ id }));
    await logAction('DELETE_STUDENT_MASTER', `Deleted master student record ID: ${id}`);
  };

  // Sports CRUD
  const addSport = async (sportData) => {
    await createSport(withSession({
      name: sportData.name,
      category: sportData.category,
      description: sportData.description,
      coordinator: sportData.coordinator,
      assistantCoordinator: sportData.assistantCoordinator,
      asstFacultyCoordinator: sportData.asstFacultyCoordinator || "M. Surya Prakash Rao",
      menCaptain: sportData.menCaptain || sportData.teamDetails?.menCaptain,
      womenCaptain: sportData.womenCaptain || sportData.teamDetails?.womenCaptain,
      venue: sportData.venue || sportData.teamDetails?.venue || "KKR and KSR Sports Ground",
      imageUrl: sportData.image || sportData.imageUrl,
    }));
    await logAction('ADD_SPORT', `Added new sport: ${sportData.name}`);
  };

  const updateSport = async (id, sportData) => {
    const updates = {};
    if (sportData.name !== undefined) updates.name = sportData.name;
    if (sportData.category !== undefined) updates.category = sportData.category;
    if (sportData.description !== undefined) updates.description = sportData.description;
    if (sportData.coordinator !== undefined) updates.coordinator = sportData.coordinator;
    if (sportData.assistantCoordinator !== undefined) updates.assistantCoordinator = sportData.assistantCoordinator;
    if (sportData.asstFacultyCoordinator !== undefined) updates.asstFacultyCoordinator = sportData.asstFacultyCoordinator;
    if (sportData.menCaptain !== undefined) updates.menCaptain = sportData.menCaptain;
    if (sportData.womenCaptain !== undefined) updates.womenCaptain = sportData.womenCaptain;
    if (sportData.venue !== undefined) updates.venue = sportData.venue;
    if (sportData.image !== undefined) updates.imageUrl = sportData.image;
    if (sportData.imageUrl !== undefined) updates.imageUrl = sportData.imageUrl;

    await updateSportMut(withSession({ id, ...updates }));
    await logAction('UPDATE_SPORT', `Updated sport ID: ${id}`);
  };

  const deleteSport = async (id) => {
    await removeSport(withSession({ id }));
    await logAction('DELETE_SPORT', `Deleted sport ID: ${id}`);
  };

  // Achievements
  const addAchievement = async (awardData) => {
    await createAchievement(withSession({
      title: awardData.title,
      recipient: awardData.recipient,
      category: awardData.category,
      achievement: awardData.achievement,
      imageUrl: awardData.image || awardData.imageUrl,
      year: awardData.year,
      medalType: awardData.medalType,
    }));
    await logAction('ADD_ACHIEVEMENT', `Added achievement: ${awardData.title}`);
  };

  const deleteAchievement = async (id) => {
    await removeAchievementMut(withSession({ id }));
    await logAction('DELETE_ACHIEVEMENT', `Deleted achievement ID: ${id}`);
  };

  // Notifications
  const broadcastNotification = async (text, type = 'Announcement') => {
    await broadcastNotif(withSession({
      message: text,
      title: type,
      type,
    }));
    await logAction('BROADCAST_NOTIFICATION', `Broadcast announcement: ${text}`);
  };

  const deleteNotification = async (id) => {
    await removeNotificationMut(withSession({ id }));
    await logAction('DELETE_NOTIFICATION', `Deleted announcement ID: ${id}`);
  };

  const clearNotifications = async () => {
    await clearNotifAll(withSession({}));
    await logAction('CLEAR_NOTIFICATIONS', 'Cleared all announcements');
  };

  // Gallery
  const addGalleryItem = async (itemData) => {
    await createGalleryItem(withSession({
      title: itemData.title,
      category: itemData.category,
      imageUrl: itemData.image || itemData.imageUrl,
      caption: itemData.caption || "",
      mediaType: itemData.mediaType || "Image",
    }));
    await logAction('ADD_GALLERY_ITEM', `Uploaded media to gallery: ${itemData.title}`);
  };

  const updateGalleryItem = async (id, itemData) => {
    await updateGalleryItemMut(withSession({
      id,
      title: itemData.title,
      category: itemData.category,
      imageUrl: itemData.image || itemData.imageUrl,
      caption: itemData.caption || "",
      mediaType: itemData.mediaType || "Image",
    }));
    await logAction('UPDATE_GALLERY_ITEM', `Updated gallery item: ${itemData.title}`);
  };

  const deleteGalleryItem = async (id) => {
    await removeGalleryItemMut(withSession({ id }));
    await logAction('DELETE_GALLERY_ITEM', `Deleted gallery item ID: ${id}`);
  };

  // Executive Members & Student Officers Management
  const addExecutiveMember = async (memberData) => {
    await createExecutiveMemberMut(withSession({
      name: memberData.name,
      position: memberData.position,
      department: memberData.department,
      email: memberData.email,
      phone: memberData.phone,
      photoUrl: memberData.photo || memberData.photoUrl,
      memberType: memberData.memberType || 'Executive Body',
      displayOrder: Number(memberData.displayOrder) || 1,
    }));
    await logAction('ADD_EXECUTIVE_MEMBER', `Added officer/member: ${memberData.name}`);
  };

  const updateExecutiveMember = async (id, memberData) => {
    await updateExecutiveMemberMut(withSession({
      id,
      name: memberData.name,
      position: memberData.position,
      department: memberData.department,
      email: memberData.email,
      phone: memberData.phone,
      photoUrl: memberData.photo || memberData.photoUrl,
      memberType: memberData.memberType,
      displayOrder: Number(memberData.displayOrder) || 1,
    }));
    await logAction('UPDATE_EXECUTIVE_MEMBER', `Updated member ID: ${id}`);
  };

  const deleteExecutiveMember = async (id) => {
    await removeExecutiveMemberMut(withSession({ id }));
    await logAction('DELETE_EXECUTIVE_MEMBER', `Deleted member ID: ${id}`);
  };

  // JNTUK Represented Players Management
  const addJntukPlayer = async (playerData) => {
    await createJntukPlayerMut(withSession({
      studentName: playerData.studentName,
      rollNumber: playerData.rollNumber,
      department: playerData.department,
      sport: playerData.sport,
      academicYear: playerData.academicYear,
      tournamentName: playerData.tournamentName,
      venueHost: playerData.venueHost || '',
      photoUrl: playerData.photo || playerData.photoUrl,
      achievementDetails: playerData.achievementDetails || '',
    }));
    await logAction('ADD_JNTUK_PLAYER', `Added JNTUK Athlete: ${playerData.studentName} (${playerData.academicYear})`);
  };

  const updateJntukPlayer = async (id, playerData) => {
    await updateJntukPlayerMut(withSession({
      id,
      studentName: playerData.studentName,
      rollNumber: playerData.rollNumber,
      department: playerData.department,
      sport: playerData.sport,
      academicYear: playerData.academicYear,
      tournamentName: playerData.tournamentName,
      venueHost: playerData.venueHost,
      photoUrl: playerData.photo || playerData.photoUrl,
      achievementDetails: playerData.achievementDetails,
    }));
    await logAction('UPDATE_JNTUK_PLAYER', `Updated JNTUK Athlete ID: ${id}`);
  };

  const deleteJntukPlayer = async (id) => {
    await removeJntukPlayerMut(withSession({ id }));
    await logAction('DELETE_JNTUK_PLAYER', `Deleted JNTUK Athlete ID: ${id}`);
  };

  // Admin & RBAC Management
  const addUser = async (userData) => {
    await createUser(withSession({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
    }));
    await logAction('ADD_USER', `Created admin user: ${userData.email} (${userData.role})`);
  };

  const toggleUserActive = async (id) => {
    await toggleUserActiveMut(withSession({ id }));
    await logAction('TOGGLE_USER_STATUS', `Toggled status for user ID: ${id}`);
  };

  // Settings
  const updateSettings = async (newSettings) => {
    const settingsArray = Object.entries(newSettings).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    await updateSettingsBatch(withSession({ settings: settingsArray }));
    await logAction('UPDATE_SETTINGS', 'System settings updated.');
  };

  return (
    <ConvexStateContext.Provider value={{
      isLoading,
      currentUser,
      users,
      sports,
      achievements,
      executiveBody,
      jntukPlayers,
      applications,
      students,
      gallery,
      notifications,
      settings,
      auditLogs,
      coreValues,
      rules,
      login,
      logout,
      addStudentApplication,
      updateApplicationStatus,
      updateApplication,
      deleteApplication,
      addStudentMaster,
      updateStudentMaster,
      deleteStudentMaster,
      addSport,
      updateSport,
      deleteSport,
      addAchievement,
      deleteAchievement,
      broadcastNotification,
      deleteNotification,
      clearNotifications,
      addGalleryItem,
      updateGalleryItem,
      deleteGalleryItem,
      addExecutiveMember,
      updateExecutiveMember,
      deleteExecutiveMember,
      addJntukPlayer,
      updateJntukPlayer,
      deleteJntukPlayer,
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

// Helper: Get relative time string
function getRelativeTime(isoString) {
  if (!isoString) return 'Just now';
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}
