import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Return most recent first, limit to 200
    const logs = await ctx.db.query("auditLogs").order("desc").take(200);
    return logs;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    userEmail: v.string(),
    action: v.string(),
    details: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      ...args,
      timestamp: new Date().toLocaleString(),
    });
  },
});
