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
    message: v.string(),
    title: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.insert("notifications", {
      title: args.title || "Announcement",
      message: args.message,
      type: args.type || "Announcement",
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  },
});

export const remove = mutation({
  args: {
    sessionToken,
    id: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.delete(args.id);
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
