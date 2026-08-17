import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("jntukPlayers").collect();
  },
});

export const create = mutation({
  args: {
    sessionToken,
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
    await requireAdmin(ctx, args.sessionToken);
    const { sessionToken: _sessionToken, ...fields } = args;
    return await ctx.db.insert("jntukPlayers", {
      ...fields,
      createdAt: new Date().toISOString(),
    });
  },
});

export const update = mutation({
  args: {
    sessionToken,
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
    await requireAdmin(ctx, args.sessionToken);
    const { id, sessionToken: _sessionToken, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { sessionToken, id: v.id("jntukPlayers") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.delete(args.id);
  },
});
