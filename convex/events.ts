import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

// ── PUBLIC QUERIES ───────────────────────────────────────────────────────────

/** List published events (public). Respects the global "eventsEnabled" setting. */
export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    // Check global toggle
    const settingRow = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eventsEnabled"))
      .first();
    if (settingRow && settingRow.value === "false") {
      return [];
    }

    const events = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    return events.map((e) => ({
      _id: e._id,
      title: e.title,
      shortDescription: e.shortDescription,
      fullDescription: e.fullDescription,
      category: e.category,
      venue: e.venue,
      eventDate: e.eventDate,
      startTime: e.startTime,
      endTime: e.endTime,
      registrationType: e.registrationType,
      minTeamSize: e.minTeamSize,
      maxTeamSize: e.maxTeamSize,
      capacity: e.capacity,
      registrationOpens: e.registrationOpens,
      registrationCloses: e.registrationCloses,
      registrationEnabled: e.registrationEnabled,
      imageUrl: e.imageUrl,
      status: e.status,
    }));
  },
});

/** Get a single published event by ID (public). */
export const getPublished = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event || event.status !== "published") return null;

    // Check global toggle
    const settingRow = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eventsEnabled"))
      .first();
    if (settingRow && settingRow.value === "false") return null;

    // Get registration count
    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.id))
      .collect();
    const confirmedCount = registrations.filter((r) => r.status === "confirmed").length;

    return {
      ...event,
      registrationCount: confirmedCount,
    };
  },
});

/** Check if events are globally enabled (public). */
export const isEventsEnabled = query({
  args: {},
  handler: async (ctx) => {
    const settingRow = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eventsEnabled"))
      .first();
    // Default to false (disabled) if setting doesn't exist
    return settingRow ? settingRow.value === "true" : false;
  },
});

// ── ADMIN QUERIES ───────────────────────────────────────────────────────────

/** List all events (admin). */
export const list = query({
  args: { sessionToken },
  handler: async (ctx, args) => {
    try {
      await requireAdmin(ctx, args.sessionToken);

      const events = await ctx.db.query("events").collect();

      // Batch-fetch registration counts
      const result = await Promise.all(
        events.map(async (e) => {
          const regs = await ctx.db
            .query("eventRegistrations")
            .withIndex("by_eventId", (q) => q.eq("eventId", e._id))
            .collect();
          return {
            ...e,
            registrationCount: regs.filter((r) => r.status === "confirmed").length,
          };
        })
      );

      return result;
    } catch {
      return [];
    }
  },
});

/** Get a single event with details (admin). */
export const get = query({
  args: { sessionToken, id: v.id("events") },
  handler: async (ctx, args) => {
    try {
      await requireAdmin(ctx, args.sessionToken);
      const event = await ctx.db.get(args.id);
      if (!event) return null;

      const regs = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.id))
        .collect();

      return {
        ...event,
        registrationCount: regs.filter((r) => r.status === "confirmed").length,
      };
    } catch {
      return null;
    }
  },
});

/** List registrations for a specific event (admin). */
export const listRegistrations = query({
  args: { sessionToken, eventId: v.id("events") },
  handler: async (ctx, args) => {
    try {
      await requireAdmin(ctx, args.sessionToken);

      const registrations = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .collect();

      // For team registrations, also fetch team members
      const result = await Promise.all(
        registrations.map(async (reg) => {
          if (reg.registrationType === "team") {
            const members = await ctx.db
              .query("eventTeamMembers")
              .withIndex("by_registrationId", (q) =>
                q.eq("registrationId", reg._id)
              )
              .collect();
            return { ...reg, teamMembers: members };
          }
          return { ...reg, teamMembers: [] };
        })
      );

      return result;
    } catch {
      return [];
    }
  },
});

// ── ADMIN MUTATIONS ─────────────────────────────────────────────────────────

/** Create a new event. */
export const create = mutation({
  args: {
    sessionToken,
    title: v.string(),
    shortDescription: v.string(),
    fullDescription: v.optional(v.string()),
    category: v.optional(v.string()),
    venue: v.optional(v.string()),
    eventDate: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    registrationType: v.string(),
    minTeamSize: v.optional(v.number()),
    maxTeamSize: v.optional(v.number()),
    capacity: v.optional(v.number()),
    registrationOpens: v.optional(v.string()),
    registrationCloses: v.optional(v.string()),
    registrationEnabled: v.optional(v.boolean()),
    status: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.sessionToken);

    // Validate registration type
    if (!["individual", "team"].includes(args.registrationType)) {
      throw new Error("Registration type must be 'individual' or 'team'.");
    }

    // Validate team size for team events
    if (args.registrationType === "team") {
      const min = args.minTeamSize ?? 2;
      const max = args.maxTeamSize ?? 10;
      if (min < 1) throw new Error("Minimum team size must be at least 1.");
      if (max < min) throw new Error("Maximum team size must be greater than or equal to minimum.");
    }

    // Validate dates
    if (args.registrationOpens && args.registrationCloses) {
      if (new Date(args.registrationCloses) <= new Date(args.registrationOpens)) {
        throw new Error("Registration closing date must be after opening date.");
      }
    }

    const now = new Date().toISOString();
    const eventId = await ctx.db.insert("events", {
      title: args.title.trim(),
      shortDescription: args.shortDescription.trim(),
      fullDescription: args.fullDescription?.trim() || "",
      category: args.category?.trim() || "",
      venue: args.venue?.trim() || "",
      eventDate: args.eventDate,
      startTime: args.startTime || "",
      endTime: args.endTime || "",
      registrationType: args.registrationType,
      minTeamSize: args.registrationType === "team" ? (args.minTeamSize ?? 2) : undefined,
      maxTeamSize: args.registrationType === "team" ? (args.maxTeamSize ?? 10) : undefined,
      capacity: args.capacity || undefined,
      registrationOpens: args.registrationOpens || "",
      registrationCloses: args.registrationCloses || "",
      registrationEnabled: args.registrationEnabled ?? true,
      status: args.status || "draft",
      imageUrl: args.imageUrl || "",
      createdBy: admin.email,
      createdAt: now,
      updatedAt: now,
    });

    return eventId;
  },
});

/** Update an existing event. */
export const update = mutation({
  args: {
    sessionToken,
    id: v.id("events"),
    title: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    fullDescription: v.optional(v.string()),
    category: v.optional(v.string()),
    venue: v.optional(v.string()),
    eventDate: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    registrationType: v.optional(v.string()),
    minTeamSize: v.optional(v.number()),
    maxTeamSize: v.optional(v.number()),
    capacity: v.optional(v.number()),
    registrationOpens: v.optional(v.string()),
    registrationCloses: v.optional(v.string()),
    registrationEnabled: v.optional(v.boolean()),
    status: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Event not found.");

    // Build patch
    const { sessionToken: _, id: _id, ...updates } = args;
    const patch: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patch[key] = typeof value === "string" ? value.trim() : value;
      }
    }

    // Validate registration type change
    if (patch.registrationType && patch.registrationType !== existing.registrationType) {
      if (!["individual", "team"].includes(patch.registrationType)) {
        throw new Error("Registration type must be 'individual' or 'team'.");
      }
    }

    // Validate team sizes
    const regType = patch.registrationType || existing.registrationType;
    if (regType === "team") {
      const min = patch.minTeamSize ?? existing.minTeamSize ?? 2;
      const max = patch.maxTeamSize ?? existing.maxTeamSize ?? 10;
      if (min < 1) throw new Error("Minimum team size must be at least 1.");
      if (max < min) throw new Error("Maximum team size must be >= minimum.");
    }

    patch.updatedAt = new Date().toISOString();
    await ctx.db.patch(args.id, patch);
  },
});

/** Publish an event. */
export const publish = mutation({
  args: { sessionToken, id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found.");
    if (!event.title.trim()) throw new Error("Cannot publish an event without a title.");
    if (!event.eventDate) throw new Error("Cannot publish an event without a date.");
    await ctx.db.patch(args.id, { status: "published", updatedAt: new Date().toISOString() });
  },
});

/** Unpublish an event (back to draft). */
export const unpublish = mutation({
  args: { sessionToken, id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found.");
    await ctx.db.patch(args.id, { status: "draft", updatedAt: new Date().toISOString() });
  },
});

/** Archive an event. */
export const archive = mutation({
  args: { sessionToken, id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found.");
    await ctx.db.patch(args.id, { status: "archived", updatedAt: new Date().toISOString() });
  },
});

/** Delete an event and all associated registrations. */
export const remove = mutation({
  args: { sessionToken, id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found.");

    // Delete all associated registrations and team members
    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.id))
      .collect();

    for (const reg of registrations) {
      // Delete team members
      const members = await ctx.db
        .query("eventTeamMembers")
        .withIndex("by_registrationId", (q) => q.eq("registrationId", reg._id))
        .collect();
      for (const m of members) {
        await ctx.db.delete(m._id);
      }
      await ctx.db.delete(reg._id);
    }

    await ctx.db.delete(args.id);
  },
});

/** Toggle registration enabled/disabled for an event. */
export const toggleRegistration = mutation({
  args: { sessionToken, id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found.");
    await ctx.db.patch(args.id, {
      registrationEnabled: !event.registrationEnabled,
      updatedAt: new Date().toISOString(),
    });
  },
});

// ── PUBLIC REGISTRATION MUTATIONS ───────────────────────────────────────────

/** Register for an individual event (public). */
export const registerIndividual = mutation({
  args: {
    eventId: v.id("events"),
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    gender: v.optional(v.string()),
    college: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found.");
    if (event.status !== "published") throw new Error("This event is not currently available.");
    if (!event.registrationEnabled) throw new Error("Registration is currently closed for this event.");
    if (event.registrationType !== "individual") throw new Error("This event requires team registration.");

    // Check global toggle
    const settingRow = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eventsEnabled"))
      .first();
    if (settingRow && settingRow.value === "false") {
      throw new Error("Event registrations are currently disabled.");
    }

    // Registration period check
    const now = new Date();
    if (event.registrationOpens && new Date(event.registrationOpens) > now) {
      throw new Error("Registration has not opened yet.");
    }
    if (event.registrationCloses && new Date(event.registrationCloses) < now) {
      throw new Error("Registration period has ended.");
    }

    // Capacity check
    if (event.capacity) {
      const existing = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .collect();
      const confirmedCount = existing.filter((r) => r.status === "confirmed").length;
      if (confirmedCount >= event.capacity) {
        throw new Error("This event has reached maximum capacity.");
      }
    }

    // Duplicate check
    const duplicate = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_email_event", (q) =>
        q.eq("email", args.email.trim().toLowerCase()).eq("eventId", args.eventId)
      )
      .first();
    if (duplicate && duplicate.status === "confirmed") {
      throw new Error("You have already registered for this event.");
    }

    // Validate required fields
    if (!args.fullName.trim()) throw new Error("Full name is required.");
    if (!args.email.trim()) throw new Error("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email.trim())) {
      throw new Error("Please provide a valid email address.");
    }
    if (!args.phone.trim()) throw new Error("Phone number is required.");
    if (!/^[\d\s+\-()]{7,15}$/.test(args.phone.trim())) {
      throw new Error("Please provide a valid phone number.");
    }

    const regId = await ctx.db.insert("eventRegistrations", {
      eventId: args.eventId,
      registrationType: "individual",
      fullName: args.fullName.trim(),
      email: args.email.trim().toLowerCase(),
      phone: args.phone.trim(),
      gender: args.gender || "",
      college: args.college?.trim() || "",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    });

    return regId;
  },
});

/** Register for a team event (public). */
export const registerTeam = mutation({
  args: {
    eventId: v.id("events"),
    teamName: v.string(),
    captainName: v.string(),
    email: v.string(),
    phone: v.string(),
    college: v.optional(v.string()),
    members: v.array(
      v.object({
        name: v.string(),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found.");
    if (event.status !== "published") throw new Error("This event is not currently available.");
    if (!event.registrationEnabled) throw new Error("Registration is currently closed for this event.");
    if (event.registrationType !== "team") throw new Error("This event requires individual registration.");

    // Check global toggle
    const settingRow = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eventsEnabled"))
      .first();
    if (settingRow && settingRow.value === "false") {
      throw new Error("Event registrations are currently disabled.");
    }

    // Registration period check
    const now = new Date();
    if (event.registrationOpens && new Date(event.registrationOpens) > now) {
      throw new Error("Registration has not opened yet.");
    }
    if (event.registrationCloses && new Date(event.registrationCloses) < now) {
      throw new Error("Registration period has ended.");
    }

    // Capacity check
    if (event.capacity) {
      const existing = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .collect();
      const confirmedCount = existing.filter((r) => r.status === "confirmed").length;
      if (confirmedCount >= event.capacity) {
        throw new Error("This event has reached maximum capacity.");
      }
    }

    // Validate team size (members array includes captain)
    const totalMembers = args.members.length;
    const minSize = event.minTeamSize ?? 2;
    const maxSize = event.maxTeamSize ?? 10;
    if (totalMembers < minSize) {
      throw new Error(`Team must have at least ${minSize} members (including captain).`);
    }
    if (totalMembers > maxSize) {
      throw new Error(`Team cannot have more than ${maxSize} members (including captain).`);
    }

    // Validate fields
    if (!args.teamName.trim()) throw new Error("Team name is required.");
    if (!args.captainName.trim()) throw new Error("Captain name is required.");
    if (!args.email.trim()) throw new Error("Captain email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email.trim())) {
      throw new Error("Please provide a valid email address.");
    }
    if (!args.phone.trim()) throw new Error("Captain phone number is required.");

    // Validate each member has a name
    for (const member of args.members) {
      if (!member.name.trim()) throw new Error("All team members must have a name.");
    }

    // Duplicate check by email
    const duplicate = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_email_event", (q) =>
        q.eq("email", args.email.trim().toLowerCase()).eq("eventId", args.eventId)
      )
      .first();
    if (duplicate && duplicate.status === "confirmed") {
      throw new Error("A team with this email has already registered for this event.");
    }

    // Insert team registration
    const regId = await ctx.db.insert("eventRegistrations", {
      eventId: args.eventId,
      registrationType: "team",
      fullName: args.captainName.trim(),
      email: args.email.trim().toLowerCase(),
      phone: args.phone.trim(),
      college: args.college?.trim() || "",
      teamName: args.teamName.trim(),
      teamSize: totalMembers,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    });

    // Insert team members
    for (const member of args.members) {
      await ctx.db.insert("eventTeamMembers", {
        registrationId: regId,
        name: member.name.trim(),
        email: member.email?.trim().toLowerCase() || "",
        phone: member.phone?.trim() || "",
        role: member.name.trim() === args.captainName.trim() ? "captain" : "member",
      });
    }

    return regId;
  },
});

/** Cancel a registration (admin). */
export const cancelRegistration = mutation({
  args: {
    sessionToken,
    registrationId: v.id("eventRegistrations"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const reg = await ctx.db.get(args.registrationId);
    if (!reg) throw new Error("Registration not found.");
    await ctx.db.patch(args.registrationId, { status: "cancelled" });
  },
});

/** Restore a cancelled registration (admin). */
export const restoreRegistration = mutation({
  args: {
    sessionToken,
    registrationId: v.id("eventRegistrations"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const reg = await ctx.db.get(args.registrationId);
    if (!reg) throw new Error("Registration not found.");
    await ctx.db.patch(args.registrationId, { status: "confirmed" });
  },
});

/** Delete a registration permanently (admin). */
export const deleteRegistration = mutation({
  args: {
    sessionToken,
    registrationId: v.id("eventRegistrations"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const reg = await ctx.db.get(args.registrationId);
    if (!reg) throw new Error("Registration not found.");

    // Delete team members first
    if (reg.registrationType === "team") {
      const members = await ctx.db
        .query("eventTeamMembers")
        .withIndex("by_registrationId", (q) =>
          q.eq("registrationId", args.registrationId)
        )
        .collect();
      for (const m of members) {
        await ctx.db.delete(m._id);
      }
    }

    await ctx.db.delete(args.registrationId);
  },
});
