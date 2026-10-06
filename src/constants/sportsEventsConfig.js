/**
 * Sports Events Configuration
 * Defines sport-specific rules, participation modes (team/individual),
 * and official regulation team sizes for sports events and tournaments.
 */

export const SPORTS_REGISTRATION_CONFIG = {
  Cricket: {
    name: 'Cricket',
    supportedTypes: ['team'],
    defaultType: 'team',
    minTeamSize: 11,
    maxTeamSize: 16,
    description: '11 players on field + reserves (11–16 players)',
    tag: 'Team Sport',
    icon: 'Trophy',
  },
  Football: {
    name: 'Football',
    supportedTypes: ['team'],
    defaultType: 'team',
    minTeamSize: 11,
    maxTeamSize: 18,
    description: '11 on pitch + substitutes (11–18 players)',
    tag: 'Team Sport',
    icon: 'Trophy',
  },
  Volleyball: {
    name: 'Volleyball',
    supportedTypes: ['team'],
    defaultType: 'team',
    minTeamSize: 6,
    maxTeamSize: 12,
    description: '6 on court + substitutes (6–12 players)',
    tag: 'Team Sport',
    icon: 'Trophy',
  },
  Basketball: {
    name: 'Basketball',
    supportedTypes: ['team'],
    defaultType: 'team',
    minTeamSize: 5,
    maxTeamSize: 12,
    description: '5 on court + substitutes (5–12 players)',
    tag: 'Team Sport',
    icon: 'Trophy',
  },
  Kabaddi: {
    name: 'Kabaddi',
    supportedTypes: ['team'],
    defaultType: 'team',
    minTeamSize: 7,
    maxTeamSize: 12,
    description: '7 on mat + 5 substitutes (7–12 players)',
    tag: 'Team Sport',
    icon: 'Trophy',
  },
  'Kho-Kho': {
    name: 'Kho-Kho',
    supportedTypes: ['team'],
    defaultType: 'team',
    minTeamSize: 9,
    maxTeamSize: 12,
    description: '9 on field + 3 substitutes (9–12 players)',
    tag: 'Team Sport',
    icon: 'Trophy',
  },
  Throwball: {
    name: 'Throwball',
    supportedTypes: ['team'],
    defaultType: 'team',
    minTeamSize: 7,
    maxTeamSize: 12,
    description: '7 on court + 5 substitutes (7–12 players)',
    tag: 'Team Sport',
    icon: 'Trophy',
  },
  Netball: {
    name: 'Netball',
    supportedTypes: ['team'],
    defaultType: 'team',
    minTeamSize: 7,
    maxTeamSize: 12,
    description: '7 on court + 5 substitutes (7–12 players)',
    tag: 'Team Sport',
    icon: 'Trophy',
  },
  'Ball-Badminton': {
    name: 'Ball-Badminton',
    supportedTypes: ['team'],
    defaultType: 'team',
    minTeamSize: 5,
    maxTeamSize: 10,
    description: '5 on court + 5 substitutes (5–10 players)',
    tag: 'Team Sport',
    icon: 'Trophy',
  },
  Chess: {
    name: 'Chess',
    supportedTypes: ['individual'],
    defaultType: 'individual',
    minTeamSize: 1,
    maxTeamSize: 1,
    description: 'Individual board play (1 player)',
    tag: 'Individual',
    icon: 'Award',
  },
  'Other / Custom': {
    name: 'Other / Custom',
    supportedTypes: ['individual', 'team'],
    defaultType: 'team',
    minTeamSize: 2,
    maxTeamSize: 10,
    description: 'Custom team size according to event rules',
    tag: 'Custom',
    icon: 'Trophy',
  },
};

export const SPORTS_LIST = Object.keys(SPORTS_REGISTRATION_CONFIG);

/**
 * Get sport configuration with optional admin custom rules override
 */
export function getSportConfig(sportName, customRules = null) {
  const base = (!sportName || !SPORTS_REGISTRATION_CONFIG[sportName])
    ? SPORTS_REGISTRATION_CONFIG['Other / Custom']
    : SPORTS_REGISTRATION_CONFIG[sportName];

  if (customRules && typeof customRules === 'object') {
    const custom = customRules[sportName];
    if (custom) {
      return {
        ...base,
        minTeamSize: custom.minTeamSize !== undefined ? Number(custom.minTeamSize) : base.minTeamSize,
        maxTeamSize: custom.maxTeamSize !== undefined ? Number(custom.maxTeamSize) : base.maxTeamSize,
        supportedTypes: custom.supportedTypes || base.supportedTypes,
        defaultType: custom.defaultType || base.defaultType,
        description: custom.description || `${custom.minTeamSize}–${custom.maxTeamSize} players (Admin customized)`,
      };
    }
  }

  return base;
}

/**
 * Parse custom sport rules from Convex settings
 */
export function parseCustomSportRules(settings) {
  if (!settings) return {};
  const raw = settings.sport_sizing_rules;
  if (!raw) return {};
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}
