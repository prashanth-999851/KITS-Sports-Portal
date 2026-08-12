import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("jntukPlayers").collect();
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jntukPlayers", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("jntukPlayers"),
    studentName: v.optional(v.string()),
    rollNumber: v.optional(v.string()),
    department: v.optional(v.string()),
    sport: v.optional(v.string()),
    academicYear: v.optional(v.string()),
    tournamentName: v.optional(v.string()),
    venueHost: v.optional(v.string()),
    photoStorageId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    achievementDetails: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("jntukPlayers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
