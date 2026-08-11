import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  roles: defineTable({
    name: v.string(), // "Super Admin", "Faculty Coordinator", "Sports Coordinator", "Event Manager", "Content Manager", "Sports Captain"
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
    status: v.string(), // "Approved", "Pending", "Rejected", "Suspended"
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
    schedule: v.string(),
    imageStorageId: v.optional(v.string()),
  }),

  events: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.string(),
    venue: v.string(),
    sportId: v.string(),
    posterStorageId: v.optional(v.string()),
    registrationLimit: v.number(),
    registeredCount: v.number(),
    status: v.string(), // "Upcoming", "Ongoing", "Completed"
    isPublished: v.boolean(),
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
    status: v.string(), // "Pending", "Approved", "Rejected"
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
    status: v.string(), // "LIVE", "PAUSED", "FINAL"
    overs: v.optional(v.string()),
    venue: v.string(),
  }),

  achievements: defineTable({
    title: v.string(),
    recipient: v.string(),
    category: v.string(),
    achievement: v.string(),
    imageStorageId: v.optional(v.string()),
    year: v.string(),
    medalType: v.string(), // "Gold", "Silver", "Bronze", "Trophy"
  }),

  executiveMembers: defineTable({
    name: v.string(),
    position: v.string(),
    department: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    photoStorageId: v.optional(v.string()),
    displayOrder: v.number(),
  }),

  documents: defineTable({
    title: v.string(),
    category: v.string(),
    fileStorageId: v.optional(v.string()),
    fileSize: v.string(),
    fileType: v.string(),
    downloadCount: v.number(),
    version: v.string(),
    createdAt: v.string(),
  }),

  gallery: defineTable({
    title: v.string(),
    category: v.string(),
    mediaType: v.string(), // "Image" or "Video"
    mediaStorageId: v.optional(v.string()),
    caption: v.string(),
    createdAt: v.string(),
  }),

  notifications: defineTable({
    title: v.string(),
    message: v.string(),
    type: v.string(), // "Announcement", "Emergency", "Match Update", "Event Reminder"
    isActive: v.boolean(),
    createdAt: v.string(),
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
});
