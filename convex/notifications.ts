import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("notifications")
      .collect();
  },
});

export const broadcast = mutation({
  args: {
    sessionToken,
    title: v.string(),
    message: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.insert("notifications", {
      title: args.title,
      message: args.message,
      type: args.type,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  },
});

export const clearAll = mutation({
  args: { sessionToken },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const all = await ctx.db.query("notifications").collect();
    for (const notif of all) {
      await ctx.db.delete(notif._id);
    }
  },
});
