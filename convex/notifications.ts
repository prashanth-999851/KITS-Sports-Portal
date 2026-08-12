import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
    title: v.string(),
    message: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
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
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("notifications").collect();
    for (const notif of all) {
      await ctx.db.delete(notif._id);
    }
  },
});
