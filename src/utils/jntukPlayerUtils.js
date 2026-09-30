/**
 * Utility functions for JNTUK Represented Players identity resolution,
 * multi-year consolidation, and enterprise filtering.
 */

// Dictionary mapping for canonical sports names to eliminate variations
const CANONICAL_SPORTS_MAP = {
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

/**
 * Normalizes sport name to canonical form.
 * e.g. "CRICKET" -> "Cricket", "kHO-KHO" -> "Kho-Kho", "kho-kho" -> "Kho-Kho", "KHO KHO" -> "Kho-Kho"
 */
export function normalizeSportName(sport) {
  if (!sport || typeof sport !== 'string') return '';
  const trimmed = sport.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  if (CANONICAL_SPORTS_MAP[lower]) {
    return CANONICAL_SPORTS_MAP[lower];
  }

  // Handle hyphen/space variations: "kho-kho" / "kho kho"
  const cleanKey = lower.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (CANONICAL_SPORTS_MAP[cleanKey]) {
    return CANONICAL_SPORTS_MAP[cleanKey];
  }

  const cleanDashKey = lower.replace(/\s+/g, '-').trim();
  if (CANONICAL_SPORTS_MAP[cleanDashKey]) {
    return CANONICAL_SPORTS_MAP[cleanDashKey];
  }

  // Fallback: title case while preserving hyphens
  return trimmed
    .split(/([ -])/)
    .map(part => {
      if (part === ' ' || part === '-') return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Normalizes department code.
 * e.g. " cse " -> "CSE", "ece" -> "ECE"
 */
export function normalizeDepartment(dept) {
  if (!dept || typeof dept !== 'string') return '';
  return dept.trim().toUpperCase();
}

/**
 * Normalizes academic year to canonical "YYYY-YYYY" format.
 * e.g. "2024-25" -> "2024-2025", " 2024-2025 " -> "2024-2025"
 */
export function normalizeAcademicYear(year) {
  if (!year || typeof year !== 'string') return '';
  const trimmed = year.trim();
  const shortMatch = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (shortMatch) {
    const century = shortMatch[1].slice(0, 2);
    return `${shortMatch[1]}-${century}${shortMatch[2]}`;
  }
  return trimmed;
}

/**
 * Normalizes roll number for consistent matching.
 * e.g., " 21jr1a05xx " -> "21JR1A05XX"
 */
export function normalizeRollNumber(rollNumber) {
  if (!rollNumber || typeof rollNumber !== 'string') return '';
  return rollNumber.trim().toUpperCase();
}

/**
 * Generates a unique identity key for a student-athlete.
 * Primary key is university registration/roll number.
 * Fallback to normalized student name + department if roll number is unavailable.
 */
export function getPlayerKey(player) {
  if (!player) return '';
  const roll = normalizeRollNumber(player.rollNumber);
  if (roll) return `ROLL:${roll}`;

  const name = (player.studentName || '').trim().replace(/\s+/g, ' ').toUpperCase();
  const dept = normalizeDepartment(player.department);
  return `NAME_DEPT:${name}_${dept}`;
}

/**
 * Formats academic years into concise string representation.
 * e.g., ['2024-2025', '2023-2024'] -> "AY 2023-24 & 2024-25"
 * e.g., ['2024-2025'] -> "AY 2024-2025"
 */
export function formatAcademicYears(years = []) {
  if (!years || years.length === 0) return '';
  if (years.length === 1) return `AY ${years[0]}`;

  // Sort ascending for display chronological sequence
  const sorted = [...years].sort((a, b) => a.localeCompare(b));
  
  // Compact notation: "2023-2024" -> "23-24" if multiple
  const shortYears = sorted.map(y => {
    const parts = y.split('-');
    if (parts.length === 2 && parts[0].length === 4 && parts[1].length === 4) {
      return `${parts[0].slice(-2)}-${parts[1].slice(-2)}`;
    }
    return y;
  });

  if (shortYears.length === 2) {
    return `AY ${shortYears[0]} & ${shortYears[1]}`;
  }
  return `AY ${shortYears.join(', ')}`;
}

/**
 * Consolidates individual representation records into unique athlete profiles.
 * 
 * @param {Array} rawPlayers - List of player representation records from database
 * @param {string} activeYear - 'All' or a specific academic year (e.g., '2024-2025')
 * @param {string} activeLevel - 'All', 'JNTUK', or 'District'
 * @returns {Array} Consolidated unique athlete profiles
 */
export function consolidateJntukPlayers(rawPlayers = [], activeYear = 'All', activeLevel = 'All') {
  if (!Array.isArray(rawPlayers) || rawPlayers.length === 0) {
    return [];
  }

  // Pre-filter by level/category if requested
  const filteredByLevel = activeLevel === 'All'
    ? rawPlayers
    : rawPlayers.filter(p => (p.level === 'District' ? 'District' : 'JNTUK') === activeLevel);

  if (filteredByLevel.length === 0) {
    return [];
  }

  // 1. Group records by athlete identity
  const athleteGroups = new Map();

  for (const player of filteredByLevel) {
    const key = getPlayerKey(player);
    if (!athleteGroups.has(key)) {
      athleteGroups.set(key, []);
    }
    athleteGroups.get(key).push(player);
  }

  const consolidatedList = [];

  for (const [, records] of athleteGroups.entries()) {
    // Sort representations chronologically descending (newest year first)
    const sortedRecords = [...records].sort((a, b) => {
      const yearComp = (b.academicYear || '').localeCompare(a.academicYear || '');
      if (yearComp !== 0) return yearComp;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    // Check if athlete represented in the requested activeYear
    const isMatchingActiveYear = 
      activeYear === 'All' || 
      sortedRecords.some(r => normalizeAcademicYear(r.academicYear) === activeYear);

    if (!isMatchingActiveYear) {
      continue;
    }

    // Determine the active representation for primary display
    // If a specific year is active, prioritize that year's record; otherwise use the newest record
    const primaryRecord = (activeYear !== 'All'
      ? sortedRecords.find(r => normalizeAcademicYear(r.academicYear) === activeYear)
      : sortedRecords[0]) || sortedRecords[0];

    // Find the best photo across all years (prefer primary, then any available)
    const bestPhotoUrl = primaryRecord.photoUrl || 
      sortedRecords.find(r => Boolean(r.photoUrl))?.photoUrl || '';

    // Collect distinct academic years
    const distinctYears = Array.from(
      new Set(sortedRecords.map(r => normalizeAcademicYear(r.academicYear)).filter(Boolean))
    ).sort().reverse();

    // Collect distinct sports played (NORMALIZED)
    const distinctSports = Array.from(
      new Set(sortedRecords.map(r => normalizeSportName(r.sport)).filter(Boolean))
    );

    // Collect distinct departments (NORMALIZED)
    const distinctDepts = Array.from(
      new Set(sortedRecords.map(r => normalizeDepartment(r.department)).filter(Boolean))
    );

    const isMultiYear = distinctYears.length > 1;
    const representationCount = sortedRecords.length;
    const playerLevel = primaryRecord.level === 'District' ? 'District' : 'JNTUK';

    consolidatedList.push({
      // Base attributes from primary record with normalized sport & department
      ...primaryRecord,
      level: playerLevel,
      sport: normalizeSportName(primaryRecord.sport),
      department: normalizeDepartment(primaryRecord.department),
      academicYear: normalizeAcademicYear(primaryRecord.academicYear),
      rollNumber: normalizeRollNumber(primaryRecord.rollNumber),
      id: primaryRecord.id || primaryRecord._id || getPlayerKey(primaryRecord),
      photoUrl: bestPhotoUrl,

      // Consolidated multi-year attributes
      athleteKey: getPlayerKey(primaryRecord),
      isConsolidated: true,
      isMultiYear,
      representationCount,
      academicYears: distinctYears,
      sports: distinctSports,
      departments: distinctDepts,
      yearsLabel: formatAcademicYears(distinctYears),
      
      // All participation history for modal timeline
      allRepresentations: sortedRecords.map(r => ({
        ...r,
        level: r.level === 'District' ? 'District' : 'JNTUK',
        sport: normalizeSportName(r.sport),
        department: normalizeDepartment(r.department),
        academicYear: normalizeAcademicYear(r.academicYear),
        rollNumber: normalizeRollNumber(r.rollNumber),
      })),
    });
  }

  // Sort overall list: multi-year athletes first, then alphabetically by name
  return consolidatedList.sort((a, b) => {
    // Primary: newest academic year
    const yrA = a.academicYears[0] || '';
    const yrB = b.academicYears[0] || '';
    const yrDiff = yrB.localeCompare(yrA);
    if (yrDiff !== 0) return yrDiff;

    // Secondary: multi-year representation count descending
    if (b.representationCount !== a.representationCount) {
      return b.representationCount - a.representationCount;
    }

    // Tertiary: student name
    return (a.studentName || '').localeCompare(b.studentName || '');
  });
}

/**
 * Filters consolidated athletes by search term, sport, and department.
 */
export function filterConsolidatedAthletes(athletes = [], { searchQuery = '', selectedSport = 'All', selectedDept = 'All' } = {}) {
  const query = searchQuery.toLowerCase().trim();
  const filterSport = selectedSport === 'All' ? 'All' : normalizeSportName(selectedSport);
  const filterDept = selectedDept === 'All' ? 'All' : normalizeDepartment(selectedDept);

  return athletes.filter(athlete => {
    // 1. Text Search matching
    if (query) {
      const matchesName = athlete.studentName && athlete.studentName.toLowerCase().includes(query);
      const matchesRoll = athlete.rollNumber && athlete.rollNumber.toLowerCase().includes(query);
      const matchesDept = athlete.departments && athlete.departments.some(d => d.toLowerCase().includes(query));
      const matchesSport = athlete.sports && athlete.sports.some(s => s.toLowerCase().includes(query));
      const matchesHistory = athlete.allRepresentations && athlete.allRepresentations.some(rep => 
        (rep.tournamentName && rep.tournamentName.toLowerCase().includes(query)) ||
        (rep.venueHost && rep.venueHost.toLowerCase().includes(query)) ||
        (rep.achievementDetails && rep.achievementDetails.toLowerCase().includes(query)) ||
        (rep.academicYear && rep.academicYear.toLowerCase().includes(query)) ||
        (rep.sport && rep.sport.toLowerCase().includes(query))
      );

      if (!matchesName && !matchesRoll && !matchesDept && !matchesSport && !matchesHistory) {
        return false;
      }
    }

    // 2. Sport Filter matching (matches if athlete participated in this sport in any year)
    if (filterSport !== 'All') {
      const hasSport = athlete.sports && athlete.sports.some(s => normalizeSportName(s) === filterSport);
      if (!hasSport) return false;
    }

    // 3. Department Filter matching
    if (filterDept !== 'All') {
      const hasDept = athlete.departments && athlete.departments.some(d => normalizeDepartment(d) === filterDept);
      if (!hasDept) return false;
    }

    return true;
  });
}

/**
 * Computes unique athlete counts per academic year, per level, and overall.
 */
export function computeJntukPlayerCounts(rawPlayers = [], activeLevel = 'All') {
  const levelFiltered = activeLevel === 'All'
    ? rawPlayers
    : rawPlayers.filter(p => (p.level === 'District' ? 'District' : 'JNTUK') === activeLevel);

  const totalRepresentations = levelFiltered.length;
  
  // Overall unique athletes
  const uniqueKeys = new Set(levelFiltered.map(p => getPlayerKey(p)).filter(Boolean));
  const uniqueAthletesCount = uniqueKeys.size;

  // JNTUK vs District unique athlete counts
  const jntukAthletes = new Set(rawPlayers.filter(p => (p.level || 'JNTUK') !== 'District').map(p => getPlayerKey(p)).filter(Boolean));
  const districtAthletes = new Set(rawPlayers.filter(p => (p.level || 'JNTUK') === 'District').map(p => getPlayerKey(p)).filter(Boolean));

  // Counts per academic year for current active level
  const yearCounts = {};
  for (const player of levelFiltered) {
    const yr = normalizeAcademicYear(player.academicYear);
    if (yr) {
      if (!yearCounts[yr]) {
        yearCounts[yr] = new Set();
      }
      yearCounts[yr].add(getPlayerKey(player));
    }
  }

  const yearUniqueCounts = {};
  for (const [yr, keySet] of Object.entries(yearCounts)) {
    yearUniqueCounts[yr] = keySet.size;
  }

  return {
    totalRepresentations,
    uniqueAthletesCount,
    yearUniqueCounts,
    jntukCount: jntukAthletes.size,
    districtCount: districtAthletes.size,
    jntukTotalRecords: rawPlayers.filter(p => (p.level || 'JNTUK') !== 'District').length,
    districtTotalRecords: rawPlayers.filter(p => (p.level || 'JNTUK') === 'District').length,
  };
}

// Aliases for unified Elite Players terminology
export const consolidateElitePlayers = consolidateJntukPlayers;
export const filterEliteAthletes = filterConsolidatedAthletes;
export const computeElitePlayerCounts = computeJntukPlayerCounts;

