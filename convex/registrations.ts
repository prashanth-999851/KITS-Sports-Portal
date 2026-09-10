import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

export const list = query({
  args: { sessionToken },
  handler: async (ctx, args) => {
    try {
      await requireAdmin(ctx, args.sessionToken);
      const records = await ctx.db.query("registrations").collect();
      return await Promise.all(
        records.map(async (reg) => {
          let certificateUrl: string | null = null;
          if (reg.experienceCertificateFileId && reg.experienceCertificateFileId.trim()) {
            try {
              certificateUrl = await ctx.storage.getUrl(reg.experienceCertificateFileId as any);
            } catch {
              certificateUrl = null;
            }
          }
          return {
            ...reg,
            experienceCertificateUrl: certificateUrl,
          };
        })
      );
    } catch {
      return [];
    }
  },
});

export const getByTrackingId = query({
  args: { trackingId: v.string() },
  handler: async (ctx, args) => {
    const reg = await ctx.db
      .query("registrations")
      .withIndex("by_trackingId", (q) => q.eq("trackingId", args.trackingId))
      .first();
    if (!reg) return null;
    let certificateUrl: string | null = null;
    if (reg.experienceCertificateFileId && reg.experienceCertificateFileId.trim()) {
      try {
        certificateUrl = await ctx.storage.getUrl(reg.experienceCertificateFileId as any);
      } catch {
        certificateUrl = null;
      }
    }
    return {
      ...reg,
      experienceCertificateUrl: certificateUrl,
    };
  },
});

export const create = mutation({
  args: {
    studentName: v.string(),
    rollNumber: v.string(),
    department: v.string(),
    year: v.string(),
    section: v.optional(v.string()),
    gender: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    preferredSports: v.union(v.array(v.string()), v.string()),
    playingExperience: v.optional(v.string()),
    experienceCertificateFileId: v.optional(v.string()),
    status: v.optional(v.string()),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Strict validation of playingExperience
    const experience = args.playingExperience?.trim() || "";
    if (
      experience !== "No Previous Experience" &&
      experience !== "Have Playing Experience"
    ) {
      throw new Error("Please select your playing experience.");
    }

    // 2. Conditional certificate enforcement
    let certFileId = "";
    if (experience === "Have Playing Experience") {
      const trimmedFileId = args.experienceCertificateFileId?.trim() || "";
      if (!trimmedFileId) {
        throw new Error("Please upload your playing experience certificate.");
      }
      certFileId = trimmedFileId;

      // Backend verification of file in Convex storage
      try {
        const metadata = await (ctx.storage as any).getMetadata(certFileId);
        if (metadata) {
          if (metadata.size && metadata.size > 2097152) {
            throw new Error("Certificate file size must be less than or equal to 2 MB.");
          }
          if (metadata.contentType && !metadata.contentType.toLowerCase().includes("pdf")) {
            throw new Error("Only PDF files are allowed.");
          }
        }
      } catch (err: any) {
        if (err.message && (err.message.includes("2 MB") || err.message.includes("PDF"))) {
          throw err;
        }
      }
    } else {
      // Clear/ignore any certificate reference for "No Previous Experience"
      certFileId = "";
    }

    const trackingId = `KKR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    await ctx.db.insert("registrations", {
      trackingId,
      studentName: args.studentName,
      rollNumber: args.rollNumber,
      department: args.department,
      year: args.year,
      section: args.section || "",
      gender: args.gender || "Male",
      email: args.email,
      phone: args.phone,
      preferredSports: args.preferredSports,
      playingExperience: experience,
      experienceCertificateFileId: certFileId || "",
      status: args.status || "Pending",
      remarks: args.remarks || "",
      appliedDate: new Date().toISOString().split("T")[0],
    });
    return trackingId;
  },
});

async function resolveRegistrationDoc(ctx: any, id: string) {
  if (!id) return null;
  const cleanId = String(id).trim();

  // 1. Try finding by trackingId index
  const docByTracking = await ctx.db
    .query("registrations")
    .withIndex("by_trackingId", (q: any) => q.eq("trackingId", cleanId))
    .first();
  if (docByTracking) return docByTracking;

  // 2. Try as direct Convex Id using normalizeId
  try {
    const normalized = ctx.db.normalizeId("registrations", cleanId);
    if (normalized) {
      const docById = await ctx.db.get(normalized);
      if (docById) return docById;
    }
  } catch {
    // ignore
  }

  // 3. Fallback scan by trackingId
  const docScan = await ctx.db
    .query("registrations")
    .filter((q: any) => q.or(
      q.eq(q.field("trackingId"), cleanId),
      q.eq(q.field("trackingId"), cleanId.toUpperCase())
    ))
    .first();
  return docScan;
}

export const updateStatus = mutation({
  args: {
    sessionToken,
    id: v.string(),
    status: v.string(),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const doc = await resolveRegistrationDoc(ctx, args.id);
    if (!doc) {
      throw new Error(`Registration record not found for identifier: ${args.id}`);
    }
    const updates: { status: string; remarks?: string } = { status: args.status };
    if (args.remarks !== undefined) {
      updates.remarks = args.remarks;
    }
    await ctx.db.patch(doc._id, updates);
  },
});

export const update = mutation({
  args: {
    sessionToken,
    id: v.string(),
    studentName: v.optional(v.string()),
    rollNumber: v.optional(v.string()),
    department: v.optional(v.string()),
    year: v.optional(v.string()),
    section: v.optional(v.string()),
    gender: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    preferredSports: v.optional(v.union(v.array(v.string()), v.string())),
    playingExperience: v.optional(v.string()),
    experienceCertificateFileId: v.optional(v.string()),
    status: v.optional(v.string()),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const { id, sessionToken: _, ...updates } = args;
    const existingDoc = await resolveRegistrationDoc(ctx, id);
    if (!existingDoc) {
      throw new Error(`Registration record not found for identifier: ${id}`);
    }

    const patchData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patchData[key] = value;
      }
    }

    if (updates.playingExperience !== undefined) {
      const exp = updates.playingExperience.trim();
      if (
        exp !== "No Previous Experience" &&
        exp !== "Have Playing Experience"
      ) {
        throw new Error("Please select your playing experience.");
      }

      if (exp === "No Previous Experience") {
        patchData.playingExperience = exp;
        patchData.experienceCertificateFileId = "";
      } else if (exp === "Have Playing Experience") {
        const certId = (updates.experienceCertificateFileId?.trim()) || existingDoc.experienceCertificateFileId;
        if (!certId) {
          throw new Error("Please upload your playing experience certificate.");
        }
        patchData.playingExperience = exp;
        patchData.experienceCertificateFileId = certId;
      }
    }

    await ctx.db.patch(existingDoc._id, patchData);
  },
});

export const remove = mutation({
  args: { sessionToken, id: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const doc = await resolveRegistrationDoc(ctx, args.id);
    if (!doc) {
      throw new Error(`Registration record not found for identifier: ${args.id}`);
    }
    await ctx.db.delete(doc._id);
  },
});
