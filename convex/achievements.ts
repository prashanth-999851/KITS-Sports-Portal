import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("achievements").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    recipient: v.string(),
    category: v.string(),
    achievement: v.string(),
    imageStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    year: v.optional(v.string()),
    medalType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("achievements", args);
  },
});

export const remove = mutation({
  args: { id: v.id("achievements") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
