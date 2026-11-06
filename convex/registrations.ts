import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

// Public query: returns only approved registrations with limited fields
export const listApprovedPublic = query({
  args: {},
  handler: async (ctx) => {
    try {
      const records = await ctx.db.query("registrations").collect();
      if (!records || !Array.isArray(records)) {
        return [];
      }
      return records
        .filter((r) => r && r.status === "Approved")
        .map((r) => ({
          _id: r._id,
          studentName: r.studentName || "Member",
          rollNumber: r.rollNumber || "—",
          department: r.department || "—",
          year: r.year || "—",
          gender: r.gender || "",
          preferredSports: Array.isArray(r.preferredSports)
            ? r.preferredSports
            : (r.preferredSports ? [r.preferredSports] : []),
        }));
    } catch (err) {
      console.warn("Failed to fetch approved registrations:", err);
      return [];
    }
  },
});

/** Check if final year registrations are globally enabled (public). */
export const isFinalYearEnabled = query({
  args: {},
  handler: async (ctx) => {
    const settingRow = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "finalYearRegistrationsEnabled"))
      .first();
    if (settingRow) return settingRow.value === "true";

    const row4th = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "registration_enabled_4th_year"))
      .first();
    return row4th ? row4th.value === "true" : true;
  },
});

/** Check registration status for each academic year (public). */
export const getYearRegistrationSettings = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("settings").collect();
    const settingsMap: Record<string, string> = {};
    for (const row of rows) {
      settingsMap[row.key] = row.value;
    }

    const year1 = settingsMap["registration_enabled_1st_year"] !== undefined
      ? settingsMap["registration_enabled_1st_year"] === "true"
      : true;
    const year2 = settingsMap["registration_enabled_2nd_year"] !== undefined
      ? settingsMap["registration_enabled_2nd_year"] === "true"
      : true;
    const year3 = settingsMap["registration_enabled_3rd_year"] !== undefined
      ? settingsMap["registration_enabled_3rd_year"] === "true"
      : true;
    const year4 = settingsMap["registration_enabled_4th_year"] !== undefined
      ? settingsMap["registration_enabled_4th_year"] === "true"
      : (settingsMap["finalYearRegistrationsEnabled"] !== undefined
          ? settingsMap["finalYearRegistrationsEnabled"] === "true"
          : true);

    return {
      "1st Year": year1,
      "2nd Year": year2,
      "3rd Year": year3,
      "4th Year": year4,
    };
  },
});

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
    const raw = args.trackingId?.trim() || "";
    if (!raw || raw.length < 3) return null;
    const upper = raw.toUpperCase();

    // 1. Exact match on trackingId index
    let reg = await ctx.db
      .query("registrations")
      .withIndex("by_trackingId", (q) => q.eq("trackingId", raw))
      .first();

    // 2. Uppercase match on trackingId index
    if (!reg && raw !== upper) {
      reg = await ctx.db
        .query("registrations")
        .withIndex("by_trackingId", (q) => q.eq("trackingId", upper))
        .first();
    }

    // 3. Match in registrations by rollNumber or fallback trackingId
    if (!reg) {
      const allRegs = await ctx.db.query("registrations").collect();
      reg = allRegs.find(
        (r) =>
          (r.trackingId && r.trackingId.trim().toUpperCase() === upper) ||
          (r.rollNumber && r.rollNumber.trim().toUpperCase() === upper)
      ) || null;
    }

    if (reg) {
      let certificateUrl: string | null = null;
      if (reg.experienceCertificateFileId && reg.experienceCertificateFileId.trim()) {
        try {
          certificateUrl = await ctx.storage.getUrl(reg.experienceCertificateFileId as any);
        } catch {
          certificateUrl = null;
        }
      }
      return {
        _id: reg._id,
        id: reg.trackingId,
        trackingId: reg.trackingId,
        name: reg.studentName,
        studentName: reg.studentName,
        rollNumber: reg.rollNumber,
        department: reg.department,
        year: reg.year,
        section: reg.section || "",
        gender: reg.gender || "Male",
        email: reg.email,
        phone: reg.phone,
        preferredSports: Array.isArray(reg.preferredSports)
          ? reg.preferredSports
          : (reg.preferredSports ? [reg.preferredSports] : []),
        playingExperience: reg.playingExperience || "",
        status: reg.status || "Under Review",
        remarks: reg.remarks || "",
        appliedDate: reg.appliedDate || "",
        experienceCertificateUrl: certificateUrl,
      };
    }

    // 4. Match in master students table by rollNumber
    const student = await ctx.db
      .query("students")
      .withIndex("by_rollNumber", (q) => q.eq("rollNumber", upper))
      .first();

    if (student) {
      return {
        _id: student._id,
        id: student.rollNumber,
        trackingId: student.rollNumber,
        name: student.name,
        studentName: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        year: student.year,
        section: student.section || "",
        gender: student.gender || "Male",
        email: student.email,
        phone: student.phone,
        preferredSports: [student.sportId || "Campus Sports"],
        playingExperience: "Varsity Player",
        status: student.status || "Active Member",
        remarks: "Official Registered Sports Directorate Member",
        appliedDate: student.createdAt ? student.createdAt.split("T")[0] : "",
        experienceCertificateUrl: null,
      };
    }

    return null;
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

    // 2. Strict validation of per-year registration status
    const keyMap: Record<string, string> = {
      "1st Year": "registration_enabled_1st_year",
      "2nd Year": "registration_enabled_2nd_year",
      "3rd Year": "registration_enabled_3rd_year",
      "4th Year": "registration_enabled_4th_year",
    };
    const settingKey = keyMap[args.year];
    if (settingKey) {
      const setting = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", settingKey))
        .first();
      
      let isYearOpen = true;
      if (setting) {
        isYearOpen = setting.value === "true";
      } else if (args.year === "4th Year") {
        // Fallback for 4th year legacy setting key
        const legacySetting = await ctx.db
          .query("settings")
          .withIndex("by_key", (q) => q.eq("key", "finalYearRegistrationsEnabled"))
          .first();
        if (legacySetting) {
          isYearOpen = legacySetting.value === "true";
        }
      }

      if (!isYearOpen) {
        throw new Error(`Registrations for ${args.year} are currently closed. Please contact the sports department.`);
      }
    }

    // 3. Conditional certificate enforcement
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

/**
 * Enterprise Batch Import of Student Memberships from Excel with validation,
 * duplicate detection, optional update-in-place, and audit logging.
 */
export const batchImport = mutation({
  args: {
    sessionToken,
    records: v.array(
      v.object({
        studentName: v.string(),
        rollNumber: v.string(),
        department: v.string(),
        year: v.string(),
        section: v.string(),
        gender: v.string(),
        email: v.string(),
        phone: v.string(),
        preferredSports: v.union(v.array(v.string()), v.string()),
        playingExperience: v.optional(v.string()),
        experienceCertificateFileId: v.optional(v.string()),
        status: v.optional(v.string()),
        remarks: v.optional(v.string()),
        trackingId: v.optional(v.string()),
      })
    ),
    updateExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.sessionToken);
    const existingRecords = await ctx.db.query("registrations").collect();

    const rollMap = new Map<string, any>();
    const trackingMap = new Map<string, any>();

    for (const r of existingRecords) {
      if (r.rollNumber) {
        rollMap.set(r.rollNumber.trim().toUpperCase(), r);
      }
      if (r.trackingId) {
        trackingMap.set(r.trackingId.trim().toUpperCase(), r);
      }
    }

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const now = new Date().toISOString().split("T")[0];

    // Helper to generate a unique trackingId
    const generateUniqueTrackingId = () => {
      let code = "";
      do {
        code = `KKR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      } while (trackingMap.has(code));
      return code;
    };

    for (const item of args.records) {
      const cleanRoll = item.rollNumber.trim().toUpperCase();
      const cleanTracking = item.trackingId?.trim().toUpperCase();

      const existing = (cleanTracking ? trackingMap.get(cleanTracking) : null) || rollMap.get(cleanRoll);

      if (existing) {
        if (args.updateExisting) {
          const patchData: Record<string, any> = {
            studentName: item.studentName.trim(),
            department: item.department.trim(),
            year: item.year.trim(),
            section: item.section.trim(),
            gender: item.gender.trim(),
            email: item.email.trim(),
            phone: item.phone.trim(),
            preferredSports: item.preferredSports,
          };
          if (item.status) {
            patchData.status = item.status;
          }
          if (item.remarks !== undefined) {
            patchData.remarks = item.remarks;
          }
          if (item.playingExperience !== undefined) {
            patchData.playingExperience = item.playingExperience;
          }
          await ctx.db.patch(existing._id, patchData);
          updated++;
        } else {
          skipped++;
        }
      } else {
        const trackingId = cleanTracking && !trackingMap.has(cleanTracking)
          ? cleanTracking
          : generateUniqueTrackingId();

        const newDoc = {
          trackingId,
          studentName: item.studentName.trim(),
          rollNumber: cleanRoll,
          department: item.department.trim(),
          year: item.year.trim(),
          section: item.section.trim(),
          gender: item.gender.trim() || "Male",
          email: item.email.trim(),
          phone: item.phone.trim(),
          preferredSports: item.preferredSports,
          playingExperience: item.playingExperience || "No Previous Experience",
          experienceCertificateFileId: item.experienceCertificateFileId || "",
          status: item.status || "Approved",
          remarks: item.remarks || "",
          appliedDate: now,
        };

        const insertedId = await ctx.db.insert("registrations", newDoc);
        trackingMap.set(trackingId, { ...newDoc, _id: insertedId });
        rollMap.set(cleanRoll, { ...newDoc, _id: insertedId });
        imported++;
      }
    }

    // Insert into auditLogs
    await ctx.db.insert("auditLogs", {
      userId: admin._id,
      userEmail: admin.email,
      action: "IMPORT_MEMBERSHIPS",
      details: `Imported ${imported} memberships, updated ${updated}, skipped ${skipped}`,
      timestamp: new Date().toISOString(),
    });

    return { imported, updated, skipped };
  },
});
