import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

export const list = query({
  args: { sessionToken },
  handler: async (ctx, args) => {
    try {
      await requireAdmin(ctx, args.sessionToken);
      return await ctx.db.query("registrations").collect();
    } catch {
      return [];
    }
  },
});

export const getByTrackingId = query({
  args: { trackingId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("registrations")
      .withIndex("by_trackingId", (q) => q.eq("trackingId", args.trackingId))
      .first();
  },
});

export const create = mutation({
  args: {
    studentName: v.string(),
    rollNumber: v.string(),
    department: v.string(),
    year: v.string(),
    section: v.optional(v.string()),
    gender: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    preferredSports: v.union(v.array(v.string()), v.string()),
    status: v.optional(v.string()),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const trackingId = `KKR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    await ctx.db.insert("registrations", {
      trackingId,
      studentName: args.studentName,
      rollNumber: args.rollNumber,
      department: args.department,
      year: args.year,
      section: args.section || "",
      gender: args.gender || "Male",
      email: args.email,
      phone: args.phone,
      preferredSports: args.preferredSports,
      status: args.status || "Pending",
      remarks: args.remarks || "",
      appliedDate: new Date().toISOString().split("T")[0],
    });
    return trackingId;
  },
});

export const updateStatus = mutation({
  args: {
    sessionToken,
    id: v.string(),
    status: v.string(),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    let targetDocId: any = args.id;
    if (args.id.startsWith("KKR-")) {
      const doc = await ctx.db
        .query("registrations")
        .withIndex("by_trackingId", (q) => q.eq("trackingId", args.id))
        .first();
      if (doc) targetDocId = doc._id;
    }
    const updates: { status: string; remarks?: string } = { status: args.status };
    if (args.remarks !== undefined) {
      updates.remarks = args.remarks;
    }
    await ctx.db.patch(targetDocId, updates);
  },
});

export const update = mutation({
  args: {
    sessionToken,
    id: v.string(),
    studentName: v.optional(v.string()),
    rollNumber: v.optional(v.string()),
    department: v.optional(v.string()),
    year: v.optional(v.string()),
    section: v.optional(v.string()),
    gender: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    preferredSports: v.optional(v.union(v.array(v.string()), v.string())),
    status: v.optional(v.string()),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const { id, sessionToken: _, ...updates } = args;
    let targetDocId: any = id;
    if (id.startsWith("KKR-")) {
      const doc = await ctx.db
        .query("registrations")
        .withIndex("by_trackingId", (q) => q.eq("trackingId", id))
        .first();
      if (doc) targetDocId = doc._id;
    }
    const patchData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patchData[key] = value;
      }
    }
    await ctx.db.patch(targetDocId, patchData);
  },
});

export const remove = mutation({
  args: { sessionToken, id: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    let targetDocId: any = args.id;
    if (args.id.startsWith("KKR-")) {
      const doc = await ctx.db
        .query("registrations")
        .withIndex("by_trackingId", (q) => q.eq("trackingId", args.id))
        .first();
      if (doc) targetDocId = doc._id;
    }
    await ctx.db.delete(targetDocId);
  },
});
