import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, sessionToken } from "./auth";

const CANONICAL_SPORTS_MAP: Record<string, string> = {
  'cricket': 'Cricket',
  'kho kho': 'Kho-Kho',
  'kho-kho': 'Kho-Kho',
  'khokho': 'Kho-Kho',
  'netball': 'Netball',
  'fencing': 'Fencing',
  'shooting': 'Shooting',
  'volleyball': 'Volleyball',
  'volley ball': 'Volleyball',
  'basketball': 'Basketball',
  'basket ball': 'Basketball',
  'badminton': 'Badminton',
  'ball badminton': 'Ball-Badminton',
  'ball-badminton': 'Ball-Badminton',
  'ballbadminton': 'Ball-Badminton',
  'kabaddi': 'Kabaddi',
  'athletics': 'Athletics',
  'athletic': 'Athletics',
  'football': 'Football',
  'foot ball': 'Football',
  'soccer': 'Football',
  'chess': 'Chess',
  'table tennis': 'Table Tennis',
  'table-tennis': 'Table Tennis',
  'tabletennis': 'Table Tennis',
  'tennis': 'Tennis',
  'lawn tennis': 'Lawn Tennis',
  'handball': 'Handball',
  'hand ball': 'Handball',
  'softball': 'Softball',
  'soft ball': 'Softball',
  'swimming': 'Swimming',
  'judo': 'Judo',
  'taekwondo': 'Taekwondo',
  'yoga': 'Yoga',
  'weightlifting': 'Weightlifting',
  'weight lifting': 'Weightlifting',
  'powerlifting': 'Powerlifting',
  'power lifting': 'Powerlifting',
  'archery': 'Archery',
  'cross country': 'Cross Country',
  'cross-country': 'Cross Country',
  'hockey': 'Hockey',
  'boxing': 'Boxing',
  'wrestling': 'Wrestling',
};

function cleanSport(sport?: string): string {
  if (!sport) return "";
  const trimmed = sport.trim();
  const lower = trimmed.toLowerCase();
  if (CANONICAL_SPORTS_MAP[lower]) return CANONICAL_SPORTS_MAP[lower];

  const cleanKey = lower.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (CANONICAL_SPORTS_MAP[cleanKey]) return CANONICAL_SPORTS_MAP[cleanKey];

  const cleanDashKey = lower.replace(/\s+/g, '-').trim();
  if (CANONICAL_SPORTS_MAP[cleanDashKey]) return CANONICAL_SPORTS_MAP[cleanDashKey];

  return trimmed
    .split(/([ -])/)
    .map(p => (p === ' ' || p === '-') ? p : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join('');
}

function cleanDepartment(dept?: string): string {
  if (!dept) return "";
  return dept.trim().toUpperCase();
}

function cleanAcademicYear(yr?: string): string {
  if (!yr) return "";
  const trimmed = yr.trim();
  const shortMatch = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (shortMatch) {
    const century = shortMatch[1].slice(0, 2);
    return `${shortMatch[1]}-${century}${shortMatch[2]}`;
  }
  return trimmed;
}

function cleanRollNumber(roll?: string): string {
  if (!roll) return "";
  return roll.trim().toUpperCase();
}

function cleanLevel(level?: string): string {
  if (!level) return "JNTUK";
  const trimmed = level.trim().toLowerCase();
  return trimmed.includes("district") ? "District" : "JNTUK";
}

function sortGroupPlayers(a: any, b: any) {
  const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999999;
  const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999999;
  if (orderA !== orderB) return orderA - orderB;
  return (a.createdAt || '').localeCompare(b.createdAt || '');
}

async function getGroupRecords(ctx: any, level?: string, academicYear?: string) {
  const all = await ctx.db.query("jntukPlayers").collect();
  const targetLevel = cleanLevel(level);
  const targetYear = cleanAcademicYear(academicYear);
  return all
    .filter(
      (r: any) =>
        cleanLevel(r.level) === targetLevel &&
        cleanAcademicYear(r.academicYear) === targetYear
    )
    .sort(sortGroupPlayers);
}

async function applyGroupOrdering(ctx: any, orderedItems: any[]) {
  for (let i = 0; i < orderedItems.length; i++) {
    const item = orderedItems[i];
    const newOrder = i + 1;
    if (item.displayOrder !== newOrder) {
      await ctx.db.patch(item._id, { displayOrder: newOrder });
    }
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("jntukPlayers").collect();
    return records.sort((a, b) => {
      // Primary: academic year descending
      const yrA = cleanAcademicYear(a.academicYear);
      const yrB = cleanAcademicYear(b.academicYear);
      const yrDiff = yrB.localeCompare(yrA);
      if (yrDiff !== 0) return yrDiff;

      // Secondary: category / level
      const lvlA = cleanLevel(a.level);
      const lvlB = cleanLevel(b.level);
      const lvlDiff = lvlA.localeCompare(lvlB);
      if (lvlDiff !== 0) return lvlDiff;

      // Tertiary: display order ascending (nulls last)
      const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999999;
      const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999999;
      if (orderA !== orderB) return orderA - orderB;

      // Fallback: alphabetical name
      return (a.studentName || '').localeCompare(b.studentName || '');
    });
  },
});

export const create = mutation({
  args: {
    sessionToken,
    studentName: v.string(),
    rollNumber: v.string(),
    department: v.string(),
    sport: v.string(),
    academicYear: v.string(),
    tournamentName: v.string(),
    venueHost: v.optional(v.string()),
    photoStorageId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    achievementDetails: v.optional(v.string()),
    level: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const { sessionToken: _sessionToken, displayOrder, ...fields } = args;

    if (displayOrder !== undefined && (!Number.isFinite(displayOrder) || displayOrder < 1)) {
      throw new Error("Display Order must be a positive integer greater than or equal to 1");
    }

    const targetLevel = cleanLevel(fields.level);
    const targetYear = cleanAcademicYear(fields.academicYear);

    // Fetch existing records for this specific Category + Academic Year scope
    const groupRecords = await getGroupRecords(ctx, targetLevel, targetYear);
    const targetOrder = displayOrder !== undefined
      ? Math.max(1, Math.min(Math.floor(displayOrder), groupRecords.length + 1))
      : groupRecords.length + 1;

    const newId = await ctx.db.insert("jntukPlayers", {
      ...fields,
      studentName: fields.studentName.trim().replace(/\s+/g, ' '),
      rollNumber: cleanRollNumber(fields.rollNumber),
      department: cleanDepartment(fields.department),
      sport: cleanSport(fields.sport),
      academicYear: targetYear,
      level: targetLevel,
      displayOrder: targetOrder,
      createdAt: new Date().toISOString(),
    });

    const newDoc = await ctx.db.get(newId);
    groupRecords.splice(targetOrder - 1, 0, newDoc);
    await applyGroupOrdering(ctx, groupRecords);

    return newId;
  },
});

export const update = mutation({
  args: {
    sessionToken,
    id: v.id("jntukPlayers"),
    studentName: v.optional(v.string()),
    rollNumber: v.optional(v.string()),
    department: v.optional(v.string()),
    sport: v.optional(v.string()),
    academicYear: v.optional(v.string()),
    tournamentName: v.optional(v.string()),
    venueHost: v.optional(v.string()),
    photoStorageId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    achievementDetails: v.optional(v.string()),
    level: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const { id, sessionToken: _sessionToken, ...updates } = args;

    if (updates.displayOrder !== undefined && (!Number.isFinite(updates.displayOrder) || updates.displayOrder < 1)) {
      throw new Error("Display Order must be a positive integer greater than or equal to 1");
    }

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Athlete record not found");
    }

    const cleanUpdates: any = { ...updates };
    if (cleanUpdates.studentName) cleanUpdates.studentName = cleanUpdates.studentName.trim().replace(/\s+/g, ' ');
    if (cleanUpdates.rollNumber) cleanUpdates.rollNumber = cleanRollNumber(cleanUpdates.rollNumber);
    if (cleanUpdates.department) cleanUpdates.department = cleanDepartment(cleanUpdates.department);
    if (cleanUpdates.sport) cleanUpdates.sport = cleanSport(cleanUpdates.sport);
    if (cleanUpdates.academicYear) cleanUpdates.academicYear = cleanAcademicYear(cleanUpdates.academicYear);
    if (cleanUpdates.level !== undefined) cleanUpdates.level = cleanLevel(cleanUpdates.level);

    const oldLevel = cleanLevel(existing.level);
    const oldYear = cleanAcademicYear(existing.academicYear);
    const newLevel = cleanLevel(cleanUpdates.level ?? existing.level);
    const newYear = cleanAcademicYear(cleanUpdates.academicYear ?? existing.academicYear);

    const isGroupChanging = oldLevel !== newLevel || oldYear !== newYear;

    if (!isGroupChanging) {
      // Reordering / updating within the same (Category + Academic Year) group
      if (cleanUpdates.displayOrder !== undefined) {
        const group = await getGroupRecords(ctx, oldLevel, oldYear);
        const others = group.filter((r: any) => r._id !== id);
        const target = Math.max(1, Math.min(Math.floor(cleanUpdates.displayOrder), others.length + 1));
        
        others.splice(target - 1, 0, { ...existing, ...cleanUpdates, displayOrder: target });
        await applyGroupOrdering(ctx, others);
      }
      await ctx.db.patch(id, cleanUpdates);
    } else {
      // Moving player across Category or Academic Year boundaries
      // 1. Normalize the old group
      const oldGroup = (await getGroupRecords(ctx, oldLevel, oldYear)).filter((r: any) => r._id !== id);
      await applyGroupOrdering(ctx, oldGroup);

      // 2. Insert into the destination group
      const newGroup = await getGroupRecords(ctx, newLevel, newYear);
      const target = cleanUpdates.displayOrder !== undefined
        ? Math.max(1, Math.min(Math.floor(cleanUpdates.displayOrder), newGroup.length + 1))
        : newGroup.length + 1;

      await ctx.db.patch(id, {
        ...cleanUpdates,
        level: newLevel,
        academicYear: newYear,
        displayOrder: target,
      });

      const updatedRecord = await ctx.db.get(id);
      newGroup.splice(target - 1, 0, updatedRecord);
      await applyGroupOrdering(ctx, newGroup);
    }
  },
});

export const remove = mutation({
  args: { sessionToken, id: v.id("jntukPlayers") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const existing = await ctx.db.get(args.id);
    if (!existing) return;

    const level = cleanLevel(existing.level);
    const year = cleanAcademicYear(existing.academicYear);

    await ctx.db.delete(args.id);

    // Normalize remaining records in that specific category and year scope
    const remaining = await getGroupRecords(ctx, level, year);
    await applyGroupOrdering(ctx, remaining);
  },
});

export const reorder = mutation({
  args: {
    sessionToken,
    id: v.id("jntukPlayers"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    if (!Number.isFinite(args.newOrder) || args.newOrder < 1) {
      throw new Error("Display Order must be a positive integer greater than or equal to 1");
    }

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Athlete record not found");
    }

    const level = cleanLevel(existing.level);
    const year = cleanAcademicYear(existing.academicYear);

    const group = await getGroupRecords(ctx, level, year);
    const others = group.filter((r: any) => r._id !== args.id);
    const target = Math.max(1, Math.min(Math.floor(args.newOrder), others.length + 1));

    others.splice(target - 1, 0, existing);
    await applyGroupOrdering(ctx, others);
  },
});

export const migrateDisplayOrders = mutation({
  args: { sessionToken },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const records = await ctx.db.query("jntukPlayers").collect();
    
    // Group records by (level, academicYear)
    const groups = new Map<string, any[]>();
    for (const record of records) {
      const key = `${cleanLevel(record.level)}___${cleanAcademicYear(record.academicYear)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(record);
    }

    let updatedCount = 0;
    for (const [, group] of groups.entries()) {
      group.sort(sortGroupPlayers);
      for (let i = 0; i < group.length; i++) {
        const item = group[i];
        const seqOrder = i + 1;
        if (item.displayOrder !== seqOrder) {
          await ctx.db.patch(item._id, { displayOrder: seqOrder });
          updatedCount++;
        }
      }
    }

    return { total: records.length, updated: updatedCount };
  },
});

export const normalizeAllRecords = mutation({
  args: { sessionToken },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const records = await ctx.db.query("jntukPlayers").collect();
    let updatedCount = 0;

    for (const record of records) {
      const s = cleanSport(record.sport);
      const d = cleanDepartment(record.department);
      const y = cleanAcademicYear(record.academicYear);
      const r = cleanRollNumber(record.rollNumber);
      const l = cleanLevel(record.level);
      const n = record.studentName ? record.studentName.trim().replace(/\s+/g, ' ') : record.studentName;

      if (
        s !== record.sport ||
        d !== record.department ||
        y !== record.academicYear ||
        r !== record.rollNumber ||
        l !== record.level ||
        n !== record.studentName
      ) {
        await ctx.db.patch(record._id, {
          sport: s,
          department: d,
          academicYear: y,
          rollNumber: r,
          level: l,
          studentName: n,
        });
        updatedCount++;
      }
    }

    // Also guarantee display order normalization
    const groups = new Map<string, any[]>();
    const refreshed = await ctx.db.query("jntukPlayers").collect();
    for (const record of refreshed) {
      const key = `${cleanLevel(record.level)}___${cleanAcademicYear(record.academicYear)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(record);
    }

    for (const [, group] of groups.entries()) {
      group.sort(sortGroupPlayers);
      for (let i = 0; i < group.length; i++) {
        const item = group[i];
        const seqOrder = i + 1;
        if (item.displayOrder !== seqOrder) {
          await ctx.db.patch(item._id, { displayOrder: seqOrder });
          updatedCount++;
        }
      }
    }

    return { total: records.length, updated: updatedCount };
  },
});
