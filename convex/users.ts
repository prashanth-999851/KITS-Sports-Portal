import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  createSession,
  hashPassword,
  isLegacyPlaintextPassword,
  requireAdmin,
  sessionToken,
  verifyPassword,
} from "./auth";

export const list = query({
  args: { sessionToken },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken, ["Super Admin"]);
    return await ctx.db.query("users").collect();
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (!user) {
      const users = await ctx.db.query("users").collect();
      user = users.find((candidate) => candidate.email.trim().toLowerCase() === normalizedEmail) ?? null;
    }

    if (!user) {
      throw new Error("Invalid email address or password.");
    }

    if (!user.isActive) {
      throw new Error("User account is currently suspended.");
    }

    const passwordMatches = await verifyPassword(args.password, user.passwordHash);
    if (!passwordMatches) {
      throw new Error("Invalid email address or password.");
    }

    if (isLegacyPlaintextPassword(user.passwordHash)) {
      try {
        await ctx.db.patch(user._id, {
          email: normalizedEmail,
          passwordHash: await hashPassword(args.password),
        });
      } catch (error) {
        console.warn("Legacy password migration failed:", error);
      }
    }

    const token = await createSession(ctx, user._id);
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      userEmail: user.email,
      action: "LOGIN",
      details: `User ${user.email} logged into Admin Console.`,
      timestamp: new Date().toISOString(),
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      sessionToken: token,
    };
  },
});

export const create = mutation({
  args: {
    sessionToken,
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken, ["Super Admin"]);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("An admin with this email already exists.");
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email.toLowerCase(),
      passwordHash: await hashPassword(args.password),
      role: args.role,
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
    });
  },
});

export const toggleActive = mutation({
  args: { sessionToken, id: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken, ["Super Admin"]);
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("Admin not found.");
    await ctx.db.patch(args.id, { isActive: !user.isActive });
  },
});

export const deleteUser = mutation({
  args: { sessionToken, id: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken, ["Super Admin"]);
    await ctx.db.delete(args.id);
  },
});

export const logout = mutation({
  args: { sessionToken },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx, args.sessionToken);
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    await ctx.db.insert("auditLogs", {
      userId: user._id,
      userEmail: user.email,
      action: "LOGOUT",
      details: `User ${user.email} logged out.`,
      timestamp: new Date().toISOString(),
    });
  },
});
