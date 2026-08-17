import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("coreValues").collect();
  },
});

export const create = mutation({
  args: {
    sessionToken,
    title: v.string(),
    icon: v.string(),
    color: v.string(),
    description: v.string(),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const { sessionToken: _sessionToken, ...fields } = args;
    return await ctx.db.insert("coreValues", fields);
  },
});
