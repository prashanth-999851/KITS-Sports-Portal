import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

// ── HELPER: Normalize Event ──────────────────────────────────────────────────
function normalizeEvent(e: any) {
  const posterUrl =
    e.posterUrl ||
    e.imageUrl ||
    (e.images && e.images.length > 0 ? e.images[0] : "") ||
    "";
  const posterStorageId =
    e.posterStorageId ||
    (e.imageStorageIds && e.imageStorageIds.length > 0 ? e.imageStorageIds[0] : "");
  const eventName = e.eventName || e.title || "";
  const shortDescription = e.shortDescription || "";
  const description = e.description || e.fullDescription || "";
  const eventType = e.eventType || "intramural";
  const venue = e.venue || "";
  const registrationStartDate =
    e.registrationStartDate || e.registrationOpens || e.eventDate || "";
  const registrationEndDate =
    e.registrationEndDate || e.registrationCloses || e.eventDate || "";
  const sportsDisciplines =
    Array.isArray(e.sportsDisciplines) && e.sportsDisciplines.length > 0
      ? e.sportsDisciplines
      : (e.category ? [e.category] : []);
  const registrationFee = e.registrationFee || { type: "free", amount: 0 };

  return {
    ...e,
    _id: e._id,
    eventName,
    title: eventName,
    eventType,
    posterUrl,
    posterStorageId,
    imageUrl: posterUrl,
    images: posterUrl ? [posterUrl] : [],
    imageStorageIds: posterStorageId ? [posterStorageId] : [],
    registrationStartDate,
    registrationEndDate,
    registrationOpens: registrationStartDate,
    registrationCloses: registrationEndDate,
    eventDate: registrationStartDate,
    venue,
    sportsDisciplines,
    category: e.category || (sportsDisciplines.length > 0 ? sportsDisciplines[0] : ""),
    shortDescription,
    description,
    fullDescription: description,
    registrationFee,
    status: e.status || "published",
    registrationEnabled: e.registrationEnabled ?? true,
    registrationType: e.registrationType || "team",
  };
}

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

    return events.map(normalizeEvent);
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
      ...normalizeEvent(event),
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

      const result = await Promise.all(
        events.map(async (e) => {
          const regs = await ctx.db
            .query("eventRegistrations")
            .withIndex("by_eventId", (q) => q.eq("eventId", e._id))
            .collect();

          return {
            ...normalizeEvent(e),
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
        ...normalizeEvent(event),
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
    eventType: v.string(), // "intramural" | "inter_college"
    eventName: v.string(),
    posterStorageId: v.optional(v.string()),
    posterUrl: v.optional(v.string()),
    registrationStartDate: v.string(),
    registrationEndDate: v.string(),
    venue: v.string(),
    sportsDisciplines: v.array(v.string()),
    shortDescription: v.string(),
    description: v.string(),
    registrationFee: v.object({
      type: v.string(), // "free" | "paid"
      amount: v.optional(v.number()),
      basis: v.optional(v.string()), // "per_team" | "per_person"
    }),
    status: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.sessionToken);

    const eventType = args.eventType?.trim();
    if (!eventType || !["intramural", "inter_college"].includes(eventType)) {
      throw new Error("Event Type must be either Intramural or Inter-College.");
    }

    const eventName = (args.eventName || args.title || "").trim();
    if (!eventName) {
      throw new Error("Event Name is required.");
    }

    const venue = args.venue?.trim();
    if (!venue) {
      throw new Error("Venue is required.");
    }

    const shortDescription = args.shortDescription?.trim();
    if (!shortDescription) {
      throw new Error("Short Description is required.");
    }

    const description = args.description?.trim();
    if (!description) {
      throw new Error("Description is required.");
    }

    if (!args.registrationStartDate?.trim()) {
      throw new Error("Registration Start Date is required.");
    }

    if (!args.registrationEndDate?.trim()) {
      throw new Error("Registration End Date is required.");
    }

    if (new Date(args.registrationEndDate) < new Date(args.registrationStartDate)) {
      throw new Error("Registration End Date cannot be before Registration Start Date.");
    }

    if (!Array.isArray(args.sportsDisciplines) || args.sportsDisciplines.length === 0) {
      throw new Error("At least one sports discipline must be selected.");
    }

    if (!args.registrationFee || !["free", "paid"].includes(args.registrationFee.type)) {
      throw new Error("Registration Fee must be either Free or Paid.");
    }

    if (args.registrationFee.type === "paid") {
      if (
        args.registrationFee.amount === undefined ||
        args.registrationFee.amount === null ||
        isNaN(args.registrationFee.amount) ||
        args.registrationFee.amount < 0
      ) {
        throw new Error("Paid registration fee amount must be a non-negative number.");
      }
      if (!args.registrationFee.basis || !["per_team", "per_person"].includes(args.registrationFee.basis)) {
        throw new Error("Paid registration fee basis must be either Per Team or Per Person.");
      }
    }

    const now = new Date().toISOString();
    const posterUrl = args.posterUrl?.trim() || "";
    const posterStorageId = args.posterStorageId?.trim() || "";

    const eventId = await ctx.db.insert("events", {
      eventType,
      eventName,
      title: eventName,
      posterStorageId: posterStorageId || undefined,
      posterUrl: posterUrl || undefined,
      imageUrl: posterUrl || "",
      images: posterUrl ? [posterUrl] : [],
      imageStorageIds: posterStorageId ? [posterStorageId] : [],
      registrationStartDate: args.registrationStartDate,
      registrationEndDate: args.registrationEndDate,
      registrationOpens: args.registrationStartDate,
      registrationCloses: args.registrationEndDate,
      eventDate: args.registrationStartDate,
      venue,
      sportsDisciplines: args.sportsDisciplines,
      shortDescription,
      description,
      fullDescription: description,
      registrationFee: {
        type: args.registrationFee.type,
        amount: args.registrationFee.type === "paid" ? Number(args.registrationFee.amount) : 0,
        basis: args.registrationFee.type === "paid" ? args.registrationFee.basis : undefined,
      },
      status: args.status || "published",
      registrationEnabled: true,
      registrationType: "team",
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
    eventType: v.optional(v.string()),
    eventName: v.optional(v.string()),
    posterStorageId: v.optional(v.string()),
    posterUrl: v.optional(v.string()),
    registrationStartDate: v.optional(v.string()),
    registrationEndDate: v.optional(v.string()),
    venue: v.optional(v.string()),
    sportsDisciplines: v.optional(v.array(v.string())),
    shortDescription: v.optional(v.string()),
    description: v.optional(v.string()),
    registrationFee: v.optional(
      v.object({
        type: v.string(),
        amount: v.optional(v.number()),
        basis: v.optional(v.string()),
      })
    ),
    status: v.optional(v.string()),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Event not found.");

    const patch: Record<string, any> = {};

    if (args.eventType !== undefined) {
      const type = args.eventType.trim();
      if (!["intramural", "inter_college"].includes(type)) {
        throw new Error("Event Type must be either Intramural or Inter-College.");
      }
      patch.eventType = type;
    }

    if (args.eventName !== undefined || args.title !== undefined) {
      const name = (args.eventName ?? args.title ?? "").trim();
      if (!name) throw new Error("Event Name cannot be empty.");
      patch.eventName = name;
      patch.title = name;
    }

    if (args.venue !== undefined) {
      const venue = args.venue.trim();
      if (!venue) throw new Error("Venue cannot be empty.");
      patch.venue = venue;
    }

    if (args.shortDescription !== undefined) {
      const shortDesc = args.shortDescription.trim();
      if (!shortDesc) throw new Error("Short Description cannot be empty.");
      patch.shortDescription = shortDesc;
    }

    if (args.description !== undefined) {
      const desc = args.description.trim();
      if (!desc) throw new Error("Description cannot be empty.");
      patch.description = desc;
      patch.fullDescription = desc;
    }

    const start = args.registrationStartDate || existing.registrationStartDate || existing.registrationOpens;
    const end = args.registrationEndDate || existing.registrationEndDate || existing.registrationCloses;

    if (args.registrationStartDate !== undefined) {
      patch.registrationStartDate = args.registrationStartDate;
      patch.registrationOpens = args.registrationStartDate;
      patch.eventDate = args.registrationStartDate;
    }

    if (args.registrationEndDate !== undefined) {
      patch.registrationEndDate = args.registrationEndDate;
      patch.registrationCloses = args.registrationEndDate;
    }

    if (start && end && new Date(end) < new Date(start)) {
      throw new Error("Registration End Date cannot be before Registration Start Date.");
    }

    if (args.sportsDisciplines !== undefined) {
      if (!Array.isArray(args.sportsDisciplines) || args.sportsDisciplines.length === 0) {
        throw new Error("At least one sports discipline must be selected.");
      }
      patch.sportsDisciplines = args.sportsDisciplines;
    }

    if (args.registrationFee !== undefined) {
      if (!["free", "paid"].includes(args.registrationFee.type)) {
        throw new Error("Registration Fee must be either Free or Paid.");
      }
      if (args.registrationFee.type === "paid") {
        if (
          args.registrationFee.amount === undefined ||
          args.registrationFee.amount === null ||
          isNaN(args.registrationFee.amount) ||
          args.registrationFee.amount < 0
        ) {
          throw new Error("Paid registration fee amount must be a non-negative number.");
        }
        if (!args.registrationFee.basis || !["per_team", "per_person"].includes(args.registrationFee.basis)) {
          throw new Error("Paid registration fee basis must be either Per Team or Per Person.");
        }
      }
      patch.registrationFee = {
        type: args.registrationFee.type,
        amount: args.registrationFee.type === "paid" ? Number(args.registrationFee.amount) : 0,
        basis: args.registrationFee.type === "paid" ? args.registrationFee.basis : undefined,
      };
    }

    // Poster replacement cleanup
    if (args.posterStorageId !== undefined || args.posterUrl !== undefined) {
      const newStorageId = args.posterStorageId?.trim() || "";
      const newUrl = args.posterUrl?.trim() || "";

      if (existing.posterStorageId && existing.posterStorageId !== newStorageId) {
        try {
          await ctx.storage.delete(existing.posterStorageId as any);
        } catch (e) {
          console.warn("Could not delete old poster storage file:", e);
        }
      }

      patch.posterStorageId = newStorageId || undefined;
      patch.posterUrl = newUrl || undefined;
      patch.imageUrl = newUrl || "";
      patch.images = newUrl ? [newUrl] : [];
      patch.imageStorageIds = newStorageId ? [newStorageId] : [];
    }

    if (args.status !== undefined) {
      patch.status = args.status;
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

    // Clean up stored poster
    if (event.posterStorageId) {
      try {
        await ctx.storage.delete(event.posterStorageId as any);
      } catch (e) {
        console.warn("Failed to delete poster from storage:", e);
      }
    }
    if (Array.isArray(event.imageStorageIds)) {
      for (const sid of event.imageStorageIds) {
        if (sid && sid !== event.posterStorageId) {
          try {
            await ctx.storage.delete(sid as any);
          } catch {
            // ignore
          }
        }
      }
    }

    // Delete all associated registrations and team members
    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.id))
      .collect();

    for (const reg of registrations) {
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
