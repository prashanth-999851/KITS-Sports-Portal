import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rules").collect();
  },
});

export const create = mutation({
  args: {
    chapter: v.string(),
    title: v.string(),
    content: v.string(),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rules", args);
  },
});
