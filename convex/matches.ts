import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("matches").collect();
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("matches", {
      ...args,
      status: args.status || "LIVE",
    });
  },
});

export const updateScore = mutation({
  args: {
    id: v.id("matches"),
    score1: v.optional(v.string()),
    score2: v.optional(v.string()),
    status: v.optional(v.string()),
    overs: v.optional(v.string()),
    result: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Remove undefined values
    const cleanUpdates: Record<string, string> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    await ctx.db.patch(id, cleanUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("matches") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
