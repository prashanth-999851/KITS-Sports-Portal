import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

/**
 * List achievements with optional filtering, search, and sorting.
 */
export const list = query({
  args: {
    type: v.optional(v.string()),
    year: v.optional(v.string()),
    sport: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let records = await ctx.db.query("achievements").collect();

    // Filter by achievementType (e.g. "Trophy", "Gold", "Silver", "Bronze")
    if (args.type && args.type !== "all" && args.type !== "All") {
      const targetType = args.type.toLowerCase();
      records = records.filter((r) => {
        const itemType = (r.achievementType || r.medalType || "").toLowerCase();
        return itemType === targetType;
      });
    }

    // Filter by year
    if (args.year && args.year !== "all" && args.year !== "All") {
      records = records.filter((r) => (r.year || "").trim() === args.year!.trim());
    }

    // Filter by sport
    if (args.sport && args.sport !== "all" && args.sport !== "All") {
      const targetSport = args.sport.toLowerCase();
      records = records.filter((r) => (r.sport || r.category || "").toLowerCase() === targetSport);
    }

    // Free text search across tournament, sport, winner, runner-up, recipient, title
    if (args.search && args.search.trim()) {
      const q = args.search.trim().toLowerCase();
      records = records.filter((r) => {
        const tournament = (r.tournament || r.title || "").toLowerCase();
        const sport = (r.sport || r.category || "").toLowerCase();
        const winner = (r.winner || r.recipient || "").toLowerCase();
        const runnerUp = (r.runnerUp || "").toLowerCase();
        const year = (r.year || "").toLowerCase();
        const details = (r.details || r.achievement || "").toLowerCase();
        return (
          tournament.includes(q) ||
          sport.includes(q) ||
          winner.includes(q) ||
          runnerUp.includes(q) ||
          year.includes(q) ||
          details.includes(q)
        );
      });
    }

    // Sort by year descending, then by creation/ID
    return records.sort((a, b) => {
      const yearA = parseInt(String(a.year || "0").replace(/\D/g, "")) || 0;
      const yearB = parseInt(String(b.year || "0").replace(/\D/g, "")) || 0;
      if (yearB !== yearA) return yearB - yearA;
      return (b._creationTime || 0) - (a._creationTime || 0);
    });
  },
});

/**
 * Get dynamic summary tallies computed directly from stored achievement records.
 */
export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("achievements").collect();
    let trophies = 0;
    let gold = 0;
    let silver = 0;
    let bronze = 0;
    const sportsSet = new Set<string>();
    const tournamentsSet = new Set<string>();

    for (const r of records) {
      const type = (r.achievementType || r.medalType || "").trim().toLowerCase();
      if (type === "trophy") trophies++;
      else if (type === "gold") gold++;
      else if (type === "silver") silver++;
      else if (type === "bronze") bronze++;

      if (r.sport) sportsSet.add(r.sport.toLowerCase());
      else if (r.category) sportsSet.add(r.category.toLowerCase());

      if (r.tournament) tournamentsSet.add(r.tournament.toLowerCase());
      else if (r.title) tournamentsSet.add(r.title.toLowerCase());
    }

    return {
      trophies,
      gold,
      silver,
      bronze,
      total: records.length,
      sportsCount: sportsSet.size,
      tournamentsCount: tournamentsSet.size,
    };
  },
});

/**
 * Create a new achievement record.
 */
export const create = mutation({
  args: {
    sessionToken,
    tournament: v.optional(v.string()),
    sport: v.optional(v.string()),
    year: v.optional(v.string()),
    achievementType: v.optional(v.string()), // "Trophy" | "Gold" | "Silver" | "Bronze"
    winner: v.optional(v.string()),
    runnerUp: v.optional(v.string()),
    details: v.optional(v.string()),
    // Legacy / Award fields (backward compatibility)
    title: v.optional(v.string()),
    recipient: v.optional(v.string()),
    category: v.optional(v.string()),
    achievement: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    medalType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.sessionToken);
    const { sessionToken: _token, ...fields } = args;

    const now = new Date().toISOString();
    const id = await ctx.db.insert("achievements", {
      ...fields,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      userId: admin._id,
      userEmail: admin.email,
      action: "CREATE_ACHIEVEMENT",
      details: `Created ${fields.achievementType || fields.medalType || "achievement"}: ${fields.tournament || fields.title || "Record"} (${fields.year || "Year N/A"})`,
      timestamp: now,
    });

    return id;
  },
});

/**
 * Update an existing achievement record.
 */
export const update = mutation({
  args: {
    sessionToken,
    id: v.id("achievements"),
    tournament: v.optional(v.string()),
    sport: v.optional(v.string()),
    year: v.optional(v.string()),
    achievementType: v.optional(v.string()),
    winner: v.optional(v.string()),
    runnerUp: v.optional(v.string()),
    details: v.optional(v.string()),
    title: v.optional(v.string()),
    recipient: v.optional(v.string()),
    category: v.optional(v.string()),
    achievement: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    medalType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.sessionToken);
    const { sessionToken: _token, id, ...fields } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Achievement record not found.");
    }

    const now = new Date().toISOString();
    await ctx.db.patch(id, {
      ...fields,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      userId: admin._id,
      userEmail: admin.email,
      action: "UPDATE_ACHIEVEMENT",
      details: `Updated achievement ID: ${id} (${fields.tournament || existing.tournament || existing.title || "Record"})`,
      timestamp: now,
    });

    return id;
  },
});

/**
 * Remove an achievement record.
 */
export const remove = mutation({
  args: { sessionToken, id: v.id("achievements") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.sessionToken);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Achievement record not found.");
    }

    await ctx.db.delete(args.id);

    await ctx.db.insert("auditLogs", {
      userId: admin._id,
      userEmail: admin.email,
      action: "DELETE_ACHIEVEMENT",
      details: `Deleted achievement: ${existing.tournament || existing.title || "Record"} (${existing.year || ""})`,
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Enterprise Batch Import with Server-Side Validation, Duplicate Detection & Audit Logging.
 */
export const batchImport = mutation({
  args: {
    sessionToken,
    records: v.array(
      v.object({
        tournament: v.string(),
        sport: v.string(),
        year: v.string(),
        achievementType: v.string(), // "Trophy" | "Gold" | "Silver" | "Bronze"
        winner: v.optional(v.string()),
        runnerUp: v.optional(v.string()),
        details: v.optional(v.string()),
      })
    ),
    updateExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.sessionToken);
    const existingRecords = await ctx.db.query("achievements").collect();

    // Key builder: tournament + sport + year + achievementType
    const buildKey = (tournament: string, sport: string, year: string, type: string) => {
      const cleanTourn = (tournament || "").trim().toLowerCase().replace(/\s+/g, " ");
      const cleanSport = (sport || "").trim().toLowerCase().replace(/\s+/g, " ");
      const cleanYear = (year || "").trim().toLowerCase().replace(/\s+/g, " ");
      const cleanType = (type || "").trim().toLowerCase();
      return `${cleanTourn}___${cleanSport}___${cleanYear}___${cleanType}`;
    };

    const existingMap = new Map<string, any>();
    for (const r of existingRecords) {
      const key = buildKey(
        r.tournament || r.title || "",
        r.sport || r.category || "",
        r.year || "",
        r.achievementType || r.medalType || ""
      );
      existingMap.set(key, r);
    }

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    for (const item of args.records) {
      const key = buildKey(item.tournament, item.sport, item.year, item.achievementType);
      const existing = existingMap.get(key);

      if (existing) {
        if (args.updateExisting) {
          await ctx.db.patch(existing._id, {
            winner: item.winner ?? existing.winner,
            runnerUp: item.runnerUp ?? existing.runnerUp,
            details: item.details ?? existing.details,
            updatedAt: now,
          });
          updated++;
        } else {
          skipped++;
        }
      } else {
        const newRecord = {
          tournament: item.tournament.trim(),
          sport: item.sport.trim(),
          year: item.year.trim(),
          achievementType: item.achievementType.trim(),
          winner: item.winner ? item.winner.trim() : undefined,
          runnerUp: item.runnerUp ? item.runnerUp.trim() : undefined,
          details: item.details ? item.details.trim() : undefined,
          createdAt: now,
          updatedAt: now,
        };
        const id = await ctx.db.insert("achievements", newRecord);
        existingMap.set(key, { ...newRecord, _id: id });
        imported++;
      }
    }

    // Log the batch import action
    await ctx.db.insert("auditLogs", {
      userId: admin._id,
      userEmail: admin.email,
      action: "BATCH_IMPORT_ACHIEVEMENTS",
      details: `Imported ${imported} new, updated ${updated}, skipped ${skipped} duplicate achievement records. Total processed: ${args.records.length}`,
      timestamp: now,
    });

    return {
      imported,
      updated,
      skipped,
      total: args.records.length,
    };
  },
});

/**
 * Bulk clear all achievements (Super Admin only).
 */
export const clearAll = mutation({
  args: { sessionToken },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.sessionToken, ["Super Admin"]);
    const all = await ctx.db.query("achievements").collect();
    for (const r of all) {
      await ctx.db.delete(r._id);
    }

    await ctx.db.insert("auditLogs", {
      userId: admin._id,
      userEmail: admin.email,
      action: "CLEAR_ALL_ACHIEVEMENTS",
      details: `Cleared all ${all.length} achievement records.`,
      timestamp: new Date().toISOString(),
    });

    return { deleted: all.length };
  },
});

/**
 * Bulk normalize existing achievement records to clean up raw position strings and standardize sport names.
 */
/**
 * Update achievements with accurate tournament outcomes (Winner, Runner-up, 3rd place).
 */
export const syncTrophyOutcomes = mutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("achievements"),
        winner: v.optional(v.string()),
        runnerUp: v.optional(v.string()),
        details: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let count = 0;
    const now = new Date().toISOString();
    for (const u of args.updates) {
      await ctx.db.patch(u.id, {
        winner: u.winner,
        runnerUp: u.runnerUp,
        details: u.details,
        updatedAt: now,
      });
      count++;
    }
    return { updated: count };
  },
});

