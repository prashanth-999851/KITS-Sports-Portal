import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

export const list = query({
  args: { sessionToken },
  handler: async (ctx, args) => {
    try {
      await requireAdmin(ctx, args.sessionToken);
      // Return most recent first, limit to 200
      const logs = await ctx.db.query("auditLogs").order("desc").take(200);
      return logs;
    } catch {
      return [];
    }
  },
});

export const create = mutation({
  args: {
    sessionToken,
    userId: v.string(),
    userEmail: v.string(),
    action: v.string(),
    details: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const { sessionToken: _sessionToken, ...fields } = args;
    return await ctx.db.insert("auditLogs", {
      ...fields,
      timestamp: new Date().toISOString(),
    });
  },
});
