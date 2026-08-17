import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("gallery").collect();
  },
});

export const create = mutation({
  args: {
    sessionToken,
    title: v.string(),
    category: v.string(),
    mediaType: v.optional(v.string()),
    mediaStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    caption: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const { sessionToken: _sessionToken, ...fields } = args;
    return await ctx.db.insert("gallery", {
      ...fields,
      mediaType: args.mediaType || "Image",
      createdAt: new Date().toISOString(),
    });
  },
});

export const update = mutation({
  args: {
    sessionToken,
    id: v.id("gallery"),
    title: v.string(),
    category: v.string(),
    mediaType: v.optional(v.string()),
    mediaStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    caption: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const { id, sessionToken: _sessionToken, ...fields } = args;
    await ctx.db.patch(id, {
      ...fields,
      mediaType: fields.mediaType || "Image",
    });
  },
});

export const remove = mutation({
  args: { sessionToken, id: v.id("gallery") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.delete(args.id);
  },
});
