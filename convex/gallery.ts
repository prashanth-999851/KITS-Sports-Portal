import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("gallery").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    mediaType: v.optional(v.string()),
    mediaStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    caption: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("gallery", {
      ...args,
      mediaType: args.mediaType || "Image",
      createdAt: new Date().toISOString(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("gallery") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
