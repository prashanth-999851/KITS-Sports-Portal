import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  roles: defineTable({
    name: v.string(),
    permissions: v.array(v.string()),
  }),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.string(),
    isActive: v.boolean(),
    refreshToken: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_email", ["email"]),

  students: defineTable({
    name: v.string(),
    rollNumber: v.string(),
    department: v.string(),
    year: v.string(),
    section: v.string(),
    email: v.string(),
    phone: v.string(),
    gender: v.string(),
    sportId: v.string(),
    photoStorageId: v.optional(v.string()),
    status: v.string(),
    createdAt: v.string(),
  }).index("by_rollNumber", ["rollNumber"]),

  sports: defineTable({
    name: v.string(),
    category: v.string(),
    description: v.string(),
    coordinator: v.string(),
    assistantCoordinator: v.optional(v.string()),
    menCaptain: v.optional(v.string()),
    womenCaptain: v.optional(v.string()),
    venue: v.string(),
    schedule: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }),

  events: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.string(),
    venue: v.string(),
    sport: v.optional(v.string()),
    category: v.optional(v.string()),
    posterStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    registrationLimit: v.optional(v.number()),
    registeredCount: v.optional(v.number()),
    status: v.string(),
    isPublished: v.optional(v.boolean()),
    createdAt: v.string(),
  }),

  registrations: defineTable({
    trackingId: v.string(),
    studentName: v.string(),
    rollNumber: v.string(),
    department: v.string(),
    year: v.string(),
    email: v.string(),
    phone: v.string(),
    preferredSports: v.array(v.string()),
    status: v.string(),
    remarks: v.string(),
    appliedDate: v.string(),
  }).index("by_trackingId", ["trackingId"]),

  memberships: defineTable({
    studentId: v.string(),
    trackingId: v.string(),
    status: v.string(),
    appliedDate: v.string(),
    remarks: v.string(),
  }),

  matches: defineTable({
    tournament: v.string(),
    team1: v.string(),
    team2: v.string(),
    score1: v.string(),
    score2: v.string(),
    result: v.string(),
    date: v.string(),
    status: v.string(),
    overs: v.optional(v.string()),
    venue: v.optional(v.string()),
  }),

  achievements: defineTable({
    title: v.string(),
    recipient: v.string(),
    category: v.string(),
    achievement: v.string(),
    imageStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    year: v.optional(v.string()),
    medalType: v.optional(v.string()),
  }),

  executiveMembers: defineTable({
    name: v.string(),
    position: v.string(),
    department: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    photoStorageId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    memberType: v.optional(v.string()),
    displayOrder: v.number(),
  }),

  documents: defineTable({
    title: v.string(),
    category: v.string(),
    fileStorageId: v.optional(v.string()),
    fileSize: v.string(),
    fileType: v.string(),
    downloadCount: v.optional(v.number()),
    version: v.optional(v.string()),
    createdAt: v.optional(v.string()),
  }),

  gallery: defineTable({
    title: v.string(),
    category: v.string(),
    mediaType: v.optional(v.string()),
    mediaStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    caption: v.string(),
    createdAt: v.optional(v.string()),
  }),

  notifications: defineTable({
    title: v.string(),
    message: v.string(),
    type: v.string(),
    isActive: v.boolean(),
    createdAt: v.string(),
  }),

  coreValues: defineTable({
    title: v.string(),
    icon: v.string(),
    color: v.string(),
    description: v.string(),
    displayOrder: v.number(),
  }),

  rules: defineTable({
    chapter: v.string(),
    title: v.string(),
    content: v.string(),
    displayOrder: v.number(),
  }),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  auditLogs: defineTable({
    userId: v.string(),
    userEmail: v.string(),
    action: v.string(),
    details: v.string(),
    timestamp: v.string(),
  }),

  jntukPlayers: defineTable({
    studentName: v.string(),
    rollNumber: v.string(),
    department: v.string(),
    sport: v.string(),
    academicYear: v.string(),
    tournamentName: v.string(),
    venueHost: v.optional(v.string()),
    photoStorageId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    achievementDetails: v.optional(v.string()),
    createdAt: v.optional(v.string()),
  }),
});
