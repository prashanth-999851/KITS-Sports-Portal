/**
 * ============================================================================
 * THEME CONFIGURATION — KKR & KSR Sports Club Portal
 * ============================================================================
 *
 * Single source of truth for all brand colors, semantic tokens, and
 * derived palette values used across the application.
 *
 * HOW TO USE:
 *   import { COLORS, THEME } from '@/constants/theme';
 *
 *   // In Tailwind arbitrary values:  bg-[${COLORS.brand.primary}]
 *   // In inline styles:              style={{ backgroundColor: COLORS.brand.primary }}
 *   // CSS custom properties are defined in index.css and referenced via var(--*)
 *
 * COLOR SYSTEM:
 *   brand.primary   — #0b2e5b  (deep navy)       → main brand, sidebars, hero overlays
 *   brand.secondary — #0d3a73  (mid navy)         → buttons, active states, badges, CTAs
 *   brand.hover     — #104a8e  (bright navy)      → hover states for buttons
 *   brand.light     — #1a5cad  (lighter accent)   → dark-mode accent text, links
 *   brand.muted     — #0b2e5b26 (15% opacity)     → subtle tinted backgrounds
 *   surface.white   — #FFFFFF                     → light-mode backgrounds, cards
 *   surface.light   — #F8FAFC                     → light-mode page background
 *   surface.dark    — #061a36                      → dark-mode deep background
 *   surface.darkCard— #0c2a52                      → dark-mode card surfaces
 * ============================================================================
 */

// ─── Brand Palette ──────────────────────────────────────────────────────────────
export const COLORS = Object.freeze({
  brand: Object.freeze({
    primary:   '#0b2e5b',   // Deep navy — core brand color
    secondary: '#0d3a73',   // Mid navy — buttons, active states
    hover:     '#104a8e',   // Brighter navy — hover states
    light:     '#1a5cad',   // Lighter accent — dark-mode text highlight
    muted:     '#0b2e5b26', // 15% opacity — subtle tinted backgrounds
    gradient: {
      from: '#061a36',      // Gradient start (deepest)
      via:  '#0b2e5b',      // Gradient midpoint
      to:   '#0d3a73',      // Gradient end
    },
  }),

  surface: Object.freeze({
    white:     '#FFFFFF',
    light:     '#F8FAFC',
    lightAlt:  '#F1F5F9',
    dark:      '#061a36',   // Dark-mode page background
    darkCard:  '#0c2a52',   // Dark-mode card
    darkCardAlt: '#163a66', // Dark-mode card subtle / elevated
    footer:    '#041428',   // Footer background
  }),

  text: Object.freeze({
    primary:     '#0b2e5b', // Light-mode primary text
    secondary:   '#3d5a80', // Light-mode secondary text
    muted:       '#7a99be', // Light-mode muted text
    darkPrimary: '#F8FAFC', // Dark-mode primary text
    darkSecondary: '#a3c4e8', // Dark-mode secondary text
    darkMuted:   '#5a7fa8', // Dark-mode muted text
  }),

  border: Object.freeze({
    light:      '#d4e2f4', // Light-mode border
    lightHover: '#b0cae6', // Light-mode border hover
    dark:       '#163a66', // Dark-mode border
    darkHover:  '#1f5090', // Dark-mode border hover
  }),

  accent: Object.freeze({
    gold:      '#F59E0B',
    goldHover: '#D97706',
    goldDark:  '#FBBF24',
  }),

  // Chart / data-visualization palette derived from the navy brand
  chart: Object.freeze([
    '#0b2e5b', '#0d3a73', '#1a5cad', '#3b82f6', '#60a5fa',
    '#93c5fd', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6',
  ]),

  // Semantic status colors (unchanged — universal UX convention)
  status: Object.freeze({
    success:  '#10B981',
    warning:  '#F59E0B',
    error:    '#EF4444',
    info:     '#3B82F6',
  }),
});


// ─── Semantic Theme Tokens ──────────────────────────────────────────────────────
// Pre-composed tokens for common UI roles, matching CSS custom properties.
export const THEME = Object.freeze({
  light: Object.freeze({
    primary:      COLORS.brand.primary,
    secondary:    COLORS.brand.secondary,
    accent:       COLORS.accent.gold,
    accentHover:  COLORS.accent.goldHover,
    bgMain:       COLORS.surface.light,
    bgCard:       COLORS.surface.white,
    bgCardSubtle: COLORS.surface.lightAlt,
    textPrimary:  COLORS.text.primary,
    textSecondary: COLORS.text.secondary,
    textMuted:    COLORS.text.muted,
    border:       COLORS.border.light,
    borderHover:  COLORS.border.lightHover,
  }),
  dark: Object.freeze({
    primary:      COLORS.brand.primary,
    secondary:    COLORS.brand.secondary,
    accent:       COLORS.accent.gold,
    accentHover:  COLORS.accent.goldDark,
    bgMain:       COLORS.surface.dark,
    bgCard:       COLORS.surface.darkCard,
    bgCardSubtle: COLORS.surface.darkCardAlt,
    textPrimary:  COLORS.text.darkPrimary,
    textSecondary: COLORS.text.darkSecondary,
    textMuted:    COLORS.text.darkMuted,
    border:       COLORS.border.dark,
    borderHover:  COLORS.border.darkHover,
  }),
});


// ─── Tailwind Arbitrary-Value Helpers ───────────────────────────────────────────
// Use these in className strings:  `bg-[${TW.brandPrimary}]`
export const TW = Object.freeze({
  brandPrimary:   COLORS.brand.primary,
  brandSecondary: COLORS.brand.secondary,
  brandHover:     COLORS.brand.hover,
  brandLight:     COLORS.brand.light,
});

export default COLORS;
