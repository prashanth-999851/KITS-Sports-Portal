import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("achievements").collect();
  },
});

export const create = mutation({
  args: {
    sessionToken,
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
    await requireAdmin(ctx, args.sessionToken);
    const { sessionToken: _sessionToken, ...fields } = args;
    return await ctx.db.insert("achievements", fields);
  },
});

export const remove = mutation({
  args: { sessionToken, id: v.id("achievements") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.delete(args.id);
  },
});
