import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("registrations").collect();
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
    email: v.string(),
    phone: v.string(),
    preferredSports: v.array(v.string()),
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
      email: args.email,
      phone: args.phone,
      preferredSports: args.preferredSports,
      status: args.status || "Pending",
      remarks: args.remarks || "Application received. Physical trial date will be notified via SMS.",
      appliedDate: new Date().toISOString().split("T")[0],
    });
    return trackingId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("registrations"),
    status: v.string(),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: { status: string; remarks?: string } = { status: args.status };
    if (args.remarks !== undefined) {
      updates.remarks = args.remarks;
    }
    await ctx.db.patch(args.id, updates);

    // If status is Approved, auto-sync to master students table
    if (args.status === 'Approved') {
      const reg = await ctx.db.get(args.id);
      if (reg) {
        const existingStudent = await ctx.db
          .query("students")
          .withIndex("by_rollNumber", (q) => q.eq("rollNumber", reg.rollNumber))
          .first();

        const sportName = Array.isArray(reg.preferredSports) && reg.preferredSports.length > 0
          ? reg.preferredSports[0]
          : "General Athletics";

        if (existingStudent) {
          await ctx.db.patch(existingStudent._id, {
            name: reg.studentName,
            department: reg.department,
            year: reg.year,
            email: reg.email,
            phone: reg.phone,
            sportId: sportName,
            status: "Active",
          });
        } else {
          await ctx.db.insert("students", {
            name: reg.studentName,
            rollNumber: reg.rollNumber,
            department: reg.department,
            year: reg.year,
            section: "A",
            email: reg.email,
            phone: reg.phone,
            gender: "Not Specified",
            sportId: sportName,
            status: "Active",
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  },
});

export const remove = mutation({
  args: { id: v.id("registrations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
