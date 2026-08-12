import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sports").collect();
  },
});

export const getById = query({
  args: { id: v.id("sports") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    description: v.string(),
    coordinator: v.string(),
    assistantCoordinator: v.optional(v.string()),
    menCaptain: v.optional(v.string()),
    womenCaptain: v.optional(v.string()),
    venue: v.string(),
    schedule: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sports", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("sports"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    coordinator: v.optional(v.string()),
    assistantCoordinator: v.optional(v.string()),
    menCaptain: v.optional(v.string()),
    womenCaptain: v.optional(v.string()),
    venue: v.optional(v.string()),
    schedule: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("sports") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
