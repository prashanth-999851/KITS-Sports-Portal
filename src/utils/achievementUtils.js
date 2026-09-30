import * as XLSX from 'xlsx';
import { normalizeSportName } from './jntukPlayerUtils';

export const VALID_ACHIEVEMENT_TYPES = ['Trophy', 'Gold', 'Silver', 'Bronze'];

/**
 * Normalizes user/excel input into canonical Achievement Type:
 * "Trophy" | "Gold" | "Silver" | "Bronze"
 */
export function normalizeAchievementType(val, defaultType = 'Trophy') {
  if (!val || typeof val !== 'string') {
    return defaultType;
  }

  const clean = val.trim().toLowerCase();

  // Gold / 1st place
  if (
    clean === 'gold' || 
    clean === 'gold medal' || 
    clean.includes('winner') || 
    clean === '1st' || 
    clean === '1st place' || 
    clean === 'first place'
  ) {
    return 'Gold';
  }

  // Silver / 2nd place
  if (
    clean === 'silver' || 
    clean === 'silver medal' || 
    clean.includes('runner') || 
    clean === '2nd' || 
    clean === '2nd place' || 
    clean === 'second place'
  ) {
    return 'Silver';
  }

  // Bronze / 3rd place
  if (
    clean === 'bronze' || 
    clean === 'bronze medal' || 
    clean.includes('3rd') || 
    clean.includes('third')
  ) {
    return 'Bronze';
  }

  // Trophy / Championship
  if (
    clean.includes('trophy') || 
    clean.includes('trophies') || 
    clean.includes('champion') ||
    clean.includes('cup')
  ) {
    return 'Trophy';
  }

  // Exact match checking
  const match = VALID_ACHIEVEMENT_TYPES.find(t => t.toLowerCase() === clean);
  if (match) return match;

  return defaultType;
}

/**
 * Normalizes Tournament / Competition Name
 */
export function normalizeTournamentName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Normalizes Year to string (e.g. 2025, 2024-2025, 2024-25)
 */
export function normalizeYear(val) {
  if (val === undefined || val === null || val === '') return '';
  const str = String(val).trim().replace(/\s+/g, '');
  return str;
}

/**
 * Generates composite unique identifier for duplicate detection
 */
export function getAchievementKey(tournament, sport, year, type) {
  const t = (tournament || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const s = (sport || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const y = (year || '').trim().toLowerCase().replace(/\s+/g, '');
  const a = (type || '').trim().toLowerCase();
  return `${t}___${s}___${y}___${a}`;
}

/**
 * Validates a single achievement row with comprehensive enterprise checks
 */
export function validateAchievementRow(row, rowIndex, existingKeySet = new Set(), pendingKeySet = new Set(), defaultType = 'Trophy') {
  const errors = [];

  const rawTourn = row.tournament || row.Tournament || row.Tornament || row.Competition || row['Tournament Name'] || '';
  const rawSport = row.sport || row.Sport || row.Game || row['Game / Sport'] || row['Name of the Event'] || '';
  const rawYear = row.year || row.Year || row['Academic Year'] || '';
  const rawType = row.achievementType || row['Achievement Type'] || row['Winner/Runner'] || row.Type || row.Result || row.Medal || '';
  const rawWinner = row.winner || row.Winner || row['Won By'] || '';
  const rawRunner = row.runnerUp || row.runner || row['Runner-up'] || row['Runner Up'] || row.Runner || '';
  const rawDetails = row.details || row.Details || row.Remarks || row.remarks || '';
  const rawOutcome = String(
    row.outcome || 
    row.result || 
    row.Result || 
    row['Winner/Runner'] || 
    row['winner/runner'] || 
    row.Position || 
    rawType || 
    ''
  ).toUpperCase().trim();

  const tournament = normalizeTournamentName(String(rawTourn));
  const year = normalizeYear(rawYear);
  const achievementType = normalizeAchievementType(String(rawType || defaultType), defaultType);
  let winner = String(rawWinner).trim();
  let runnerUp = String(rawRunner).trim();
  let details = String(rawDetails).trim();

  // If the cell value is simply the position/outcome keyword ("WINNER", "RUNNER", "3RD PLACE", etc.),
  // it was extracted from the result column. Clean it so we assign the real institution name!
  const isPositionKeyword = (val) => {
    if (!val) return false;
    const v = val.toUpperCase().trim();
    return v === 'WINNER' || v === 'RUNNER' || v === '3RD PLACE' || v === '3RD' || v === 'THIRD' || v === 'FIRST' || v === 'SECOND';
  };

  const outcomeType = String(
    rawOutcome || 
    (isPositionKeyword(winner) ? winner : '') || 
    (isPositionKeyword(runnerUp) ? runnerUp : '') || 
    defaultType
  ).toUpperCase().trim();

  if (isPositionKeyword(winner)) {
    winner = '';
  }
  if (isPositionKeyword(runnerUp)) {
    runnerUp = '';
  }

  // Assign the collegiate institution name based on tournament outcome
  if (outcomeType.includes('WINNER') || outcomeType.includes('CHAMPION') || outcomeType.includes('1ST') || outcomeType.includes('FIRST') || achievementType === 'Gold') {
    winner = winner || 'KKR & KSR Institute of Technology & Sciences (KITS)';
    runnerUp = runnerUp || '';
    if (!details) {
      details = 'Tournament Champions / 1st Place Trophy';
    }
  } else if (outcomeType.includes('RUNNER') || outcomeType.includes('2ND') || outcomeType.includes('SECOND') || achievementType === 'Silver') {
    winner = '';
    runnerUp = runnerUp || 'KKR & KSR Institute of Technology & Sciences (KITS)';
    if (!details) {
      details = 'Runner-up Trophy / 2nd Place';
    }
  } else if (outcomeType.includes('3RD') || outcomeType.includes('THIRD') || achievementType === 'Bronze') {
    winner = '';
    runnerUp = '';
    if (!details) {
      details = '3rd Place Finish - KKR & KSR Institute of Technology & Sciences (KITS)';
    }
  }

  // Normalize sport name with common Excel typos
  let sport = normalizeSportName(String(rawSport));
  const lowerSport = String(rawSport || '').trim().toLowerCase();
  if (lowerSport === 'ball badmantion' || lowerSport === 'boll badmintton') {
    sport = 'Ball Badminton';
  } else if (lowerSport === 'tenni koit') {
    sport = 'Tennikoit';
  } else if (lowerSport === 'volley ball') {
    sport = 'Volleyball';
  }

  // Validate Tournament
  if (!tournament) {
    errors.push('Tournament / Competition name is required.');
  }

  // Validate Sport
  if (!sport) {
    errors.push('Game / Sport name is required.');
  }

  // Validate Year
  if (!year) {
    errors.push('Year is required.');
  } else {
    // Year should look like 2026, 2024-2025, or 2024-25
    const yearPattern = /^(\d{4})(-(\d{2,4}))?$/;
    if (!yearPattern.test(year)) {
      errors.push(`Invalid year format "${year}". Expected e.g. 2026 or 2024-2025.`);
    }
  }

  // Validate Achievement Type
  if (!VALID_ACHIEVEMENT_TYPES.includes(achievementType)) {
    errors.push(`Achievement type "${achievementType}" is not supported. Must be Trophy, Gold, Silver, or Bronze.`);
  }

  // Duplicate Check
  const key = getAchievementKey(tournament, sport, year, achievementType);
  let isDuplicate = false;
  let duplicateReason = '';

  if (existingKeySet.has(key)) {
    isDuplicate = true;
    duplicateReason = 'Existing record in database';
  } else if (pendingKeySet.has(key)) {
    isDuplicate = true;
    duplicateReason = 'Duplicate row within this Excel file';
  }

  const isValid = errors.length === 0;

  return {
    rowIndex,
    isValid,
    isDuplicate,
    duplicateReason,
    errors,
    key,
    normalized: {
      tournament,
      sport,
      year,
      achievementType,
      winner,
      runnerUp,
      details,
    },
    raw: row,
  };
}

/**
 * Generates and triggers download of a standardized sample Excel template
 */
export function downloadAchievementExcelTemplate() {
  const sampleData = [
    {
      'Tournament': 'JNTUK Inter-Collegiate Tournaments',
      'Game / Sport': 'Cricket',
      'Year': '2026',
      'Achievement Type': 'Gold',
      'Winner': 'KKR & KSR Institute of Technology & Sciences (KITS)',
      'Runner-up': 'RVR & JC College of Engineering',
      'Details': 'Champions - D Zone Tournament'
    },
    {
      'Tournament': 'Vignan Mahotsav National Sports Fest',
      'Game / Sport': 'Kabaddi',
      'Year': '2025',
      'Achievement Type': 'Silver',
      'Winner': 'VR Siddhartha Engineering College',
      'Runner-up': 'KKR & KSR Institute of Technology & Sciences (KITS)',
      'Details': 'State Level Inter-College Tournament'
    },
    {
      'Tournament': 'KITS Yuva State Fest',
      'Game / Sport': 'Volleyball',
      'Year': '2026',
      'Achievement Type': 'Trophy',
      'Winner': 'KKR & KSR Institute of Technology & Sciences (KITS)',
      'Runner-up': 'Bapatla Engineering College',
      'Details': 'Annual Sports Fest Championship Trophy'
    },
    {
      'Tournament': 'RK College Inter-Collegiate Meet',
      'Game / Sport': 'Kho-Kho',
      'Year': '2024-2025',
      'Achievement Type': 'Bronze',
      'Winner': 'GMR Institute of Technology',
      'Runner-up': 'ANITS',
      'Details': '3rd Place Bronze Medal Playoff'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 36 }, // Tournament
    { wch: 18 }, // Game / Sport
    { wch: 12 }, // Year
    { wch: 18 }, // Achievement Type
    { wch: 42 }, // Winner
    { wch: 36 }, // Runner-up
    { wch: 38 }, // Details
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Achievements_Template');

  XLSX.writeFile(workbook, 'KITS_Achievements_Import_Template.xlsx');
}
