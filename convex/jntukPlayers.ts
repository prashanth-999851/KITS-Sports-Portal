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

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("jntukPlayers").collect();
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
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const { sessionToken: _sessionToken, ...fields } = args;
    return await ctx.db.insert("jntukPlayers", {
      ...fields,
      studentName: fields.studentName.trim().replace(/\s+/g, ' '),
      rollNumber: cleanRollNumber(fields.rollNumber),
      department: cleanDepartment(fields.department),
      sport: cleanSport(fields.sport),
      academicYear: cleanAcademicYear(fields.academicYear),
      level: cleanLevel(fields.level),
      createdAt: new Date().toISOString(),
    });
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
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const { id, sessionToken: _sessionToken, ...updates } = args;
    const cleanUpdates = { ...updates };
    if (cleanUpdates.studentName) cleanUpdates.studentName = cleanUpdates.studentName.trim().replace(/\s+/g, ' ');
    if (cleanUpdates.rollNumber) cleanUpdates.rollNumber = cleanRollNumber(cleanUpdates.rollNumber);
    if (cleanUpdates.department) cleanUpdates.department = cleanDepartment(cleanUpdates.department);
    if (cleanUpdates.sport) cleanUpdates.sport = cleanSport(cleanUpdates.sport);
    if (cleanUpdates.academicYear) cleanUpdates.academicYear = cleanAcademicYear(cleanUpdates.academicYear);
    if (cleanUpdates.level !== undefined) cleanUpdates.level = cleanLevel(cleanUpdates.level);

    await ctx.db.patch(id, cleanUpdates);
  },
});

export const remove = mutation({
  args: { sessionToken, id: v.id("jntukPlayers") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.delete(args.id);
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

    return { total: records.length, updated: updatedCount };
  },
});
