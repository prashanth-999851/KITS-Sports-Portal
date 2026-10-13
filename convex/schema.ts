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

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    createdAt: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

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
    asstFacultyCoordinator: v.optional(v.string()),
    menCaptain: v.optional(v.string()),
    womenCaptain: v.optional(v.string()),
    venue: v.string(),
    schedule: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }),

  registrations: defineTable({
    trackingId: v.string(),
    studentName: v.string(),
    rollNumber: v.string(),
    department: v.string(),
    year: v.string(),
    section: v.optional(v.string()),
    gender: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    preferredSports: v.union(v.array(v.string()), v.string()),
    playingExperience: v.optional(v.string()),
    experienceCertificateFileId: v.optional(v.string()),
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

  achievements: defineTable({
    // Enterprise tournament achievement fields
    tournament: v.optional(v.string()),
    sport: v.optional(v.string()),
    year: v.optional(v.string()),
    achievementType: v.optional(v.string()), // "Trophy" | "Gold" | "Silver" | "Bronze"
    winner: v.optional(v.string()),
    runnerUp: v.optional(v.string()),
    details: v.optional(v.string()),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),

    // Legacy Wall of Fame award fields (backward compatibility)
    title: v.optional(v.string()),
    recipient: v.optional(v.string()),
    category: v.optional(v.string()),
    achievement: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    medalType: v.optional(v.string()),
  })
    .index("by_type", ["achievementType"])
    .index("by_year", ["year"])
    .index("by_sport", ["sport"]),

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
    level: v.optional(v.string()), // "JNTUK" | "District" (defaults to "JNTUK")
    displayOrder: v.optional(v.number()),
    createdAt: v.optional(v.string()),
  }),

  // ── Event Management System ──────────────────────────────────────────────
  events: defineTable({
    // Refactored fields
    eventType: v.optional(v.string()), // "intramural" | "inter_college"
    eventName: v.optional(v.string()),
    posterStorageId: v.optional(v.string()),
    posterUrl: v.optional(v.string()),
    registrationStartDate: v.optional(v.string()),
    registrationEndDate: v.optional(v.string()),
    venue: v.string(),
    sportsDisciplines: v.optional(v.array(v.string())),
    shortDescription: v.string(),
    description: v.optional(v.string()),
    registrationFee: v.optional(
      v.object({
        type: v.string(), // "free" | "paid"
        amount: v.optional(v.number()),
        basis: v.optional(v.string()), // "per_team" | "per_person"
      })
    ),

    // Legacy fields (optional for backward compatibility)
    title: v.optional(v.string()),
    fullDescription: v.optional(v.string()),
    category: v.optional(v.string()),
    eventDate: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    registrationType: v.optional(v.string()), // "individual" | "team"
    minTeamSize: v.optional(v.number()),
    maxTeamSize: v.optional(v.number()),
    capacity: v.optional(v.number()),
    registrationOpens: v.optional(v.string()),
    registrationCloses: v.optional(v.string()),
    registrationEnabled: v.optional(v.boolean()),
    status: v.optional(v.string()), // "draft" | "published" | "archived"
    imageUrl: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    imageStorageIds: v.optional(v.array(v.string())),
    createdBy: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_eventDate", ["eventDate"]),

  eventRegistrations: defineTable({
    eventId: v.id("events"),
    registrationType: v.string(), // "individual" | "team"
    // Individual fields
    fullName: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    gender: v.optional(v.string()),
    college: v.optional(v.string()),
    // Team fields
    teamName: v.optional(v.string()),
    teamSize: v.optional(v.number()),
    status: v.string(), // "confirmed" | "cancelled"
    createdAt: v.string(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_email_event", ["email", "eventId"]),

  eventTeamMembers: defineTable({
    registrationId: v.id("eventRegistrations"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()), // "captain" | "member"
  })
    .index("by_registrationId", ["registrationId"]),
});
