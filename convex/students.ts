import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

export const list = query({
  args: { sessionToken },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.query("students").collect();
  },
});

export const getByRollNumber = query({
  args: { sessionToken, rollNumber: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db
      .query("students")
      .withIndex("by_rollNumber", (q) => q.eq("rollNumber", args.rollNumber))
      .first();
  },
});

export const create = mutation({
  args: {
    sessionToken,
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
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const existing = await ctx.db
      .query("students")
      .withIndex("by_rollNumber", (q) => q.eq("rollNumber", args.rollNumber))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        department: args.department,
        year: args.year,
        section: args.section,
        email: args.email,
        phone: args.phone,
        gender: args.gender,
        sportId: args.sportId,
        status: args.status,
      });
      return existing._id;
    }

    const newId = await ctx.db.insert("students", {
      name: args.name,
      rollNumber: args.rollNumber,
      department: args.department,
      year: args.year,
      section: args.section,
      email: args.email,
      phone: args.phone,
      gender: args.gender,
      sportId: args.sportId,
      photoStorageId: args.photoStorageId,
      status: args.status,
      createdAt: new Date().toISOString(),
    });
    return newId;
  },
});

export const update = mutation({
  args: {
    sessionToken,
    id: v.id("students"),
    name: v.optional(v.string()),
    rollNumber: v.optional(v.string()),
    department: v.optional(v.string()),
    year: v.optional(v.string()),
    section: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    gender: v.optional(v.string()),
    sportId: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const { id, sessionToken: _sessionToken, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { sessionToken, id: v.id("students") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.delete(args.id);
  },
});
