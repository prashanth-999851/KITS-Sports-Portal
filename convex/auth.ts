import { v } from "convex/values";

export const sessionToken = v.string();

const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const PASSWORD_HASH_PREFIX = "sha256";

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function createSessionToken() {
  const first = new Uint8Array(24);
  const second = new Uint8Array(24);
  crypto.getRandomValues(first);
  crypto.getRandomValues(second);
  return `${bytesToHex(first)}.${bytesToHex(second)}`;
}

export function getSessionExpiry() {
  return Date.now() + SESSION_TTL_MS;
}

export async function requireAdmin(ctx: any, token: string, allowedRoles?: string[]) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();

  if (!session || session.expiresAt <= Date.now()) {
    if (session && typeof ctx.db.delete === "function") {
      await ctx.db.delete(session._id);
    }
    throw new Error("Admin session expired. Please sign in again.");
  }

  const user = await ctx.db.get(session.userId);

  if (!user || !user.isActive) {
    throw new Error("Admin session is no longer valid.");
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role) && user.role !== "Super Admin") {
    throw new Error("You do not have permission to perform this action.");
  }

  return user;
}

export async function createSession(ctx: any, userId: any) {
  const token = createSessionToken();
  await ctx.db.insert("sessions", {
    userId,
    token,
    createdAt: new Date().toISOString(),
    expiresAt: getSessionExpiry(),
  });
  return token;
}

async function digestPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(digest));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

export async function hashPassword(password: string) {
  if (password.length < 8) {
    throw new Error("Admin password must be at least 8 characters long.");
  }

  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = bytesToHex(saltBytes);
  const digest = await digestPassword(password, salt);
  return `${PASSWORD_HASH_PREFIX}:${salt}:${digest}`;
}

export function isLegacyPlaintextPassword(storedPassword: string) {
  return !storedPassword.startsWith(`${PASSWORD_HASH_PREFIX}:`);
}

export async function verifyPassword(password: string, storedPassword: string) {
  if (isLegacyPlaintextPassword(storedPassword)) {
    return storedPassword === password;
  }

  const [prefix, salt, expectedDigest] = storedPassword.split(":");
  if (prefix !== PASSWORD_HASH_PREFIX || !salt || !expectedDigest) {
    return false;
  }

  const actualDigest = await digestPassword(password, salt);
  return timingSafeEqual(actualDigest, expectedDigest);
}
