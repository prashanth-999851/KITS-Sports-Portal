import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("executiveMembers").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    position: v.string(),
    department: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    photoStorageId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    memberType: v.optional(v.string()),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("executiveMembers", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("executiveMembers"),
    name: v.optional(v.string()),
    position: v.optional(v.string()),
    department: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    photoStorageId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    memberType: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("executiveMembers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
