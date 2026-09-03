/**
 * Typography Design System
 * KiTS Sports Club Portal
 *
 * Single source of truth for typography tokens.
 */

/* ==========================================
   FONT SIZES
========================================== */
export const FONT_SIZES = {
  caption: "0.75rem",  // 12px
  helper: "0.75rem",   // 12px
  label: "0.75rem",    // 12px

  bodySm: "0.875rem",  // 14px
  body: "1rem",        // 16px
  bodyLg: "1.125rem",  // 18px

  h4: "1.25rem",       // 20px
  h3: "1.5rem",        // 24px
  h2: "2rem",          // 32px
};

/* ==========================================
   FLUID TYPOGRAPHY
========================================== */
export const FLUID_TYPOGRAPHY = {
  hero: "clamp(2.25rem, 5vw, 4.5rem)", // 36px → 72px
  h1: "clamp(1.75rem, 4vw, 3.5rem)",  // 28px → 56px
};

/* ==========================================
   LINE HEIGHTS
========================================== */
export const LINE_HEIGHTS = {
  caption: 1.6,
  helper: 1.6,
  label: 1,

  bodySm: 1.6,
  body: 1.6,
  bodyLg: 1.6,

  h4: 1.4,
  h3: 1.35,
  h2: 1.25,
};

/* ==========================================
   LETTER SPACING
========================================== */
export const LETTER_SPACING = {
  caption: "0",
  helper: "0",
  label: "0.05em",

  bodySm: "0",
  body: "0",
  bodyLg: "0",

  h4: "-0.025em",
  h3: "-0.025em",
  h2: "-0.025em",
};

/* ==========================================
   FONT WEIGHTS
========================================== */
export const FONT_WEIGHTS = {
  caption: 400,
  helper: 500,
  label: 600,

  bodySm: 400,
  body: 400,
  bodyLg: 400,

  h4: 700,
  h3: 700,
  h2: 700,
};

/* ==========================================
   SEMANTIC TYPOGRAPHY TOKENS
========================================== */
export const TYPOGRAPHY_TOKENS = {
  caption: {
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
    letterSpacing: LETTER_SPACING.caption,
    fontWeight: FONT_WEIGHTS.caption,
  },

  helper: {
    fontSize: FONT_SIZES.helper,
    lineHeight: LINE_HEIGHTS.helper,
    letterSpacing: LETTER_SPACING.helper,
    fontWeight: FONT_WEIGHTS.helper,
  },

  label: {
    fontSize: FONT_SIZES.label,
    lineHeight: LINE_HEIGHTS.label,
    letterSpacing: LETTER_SPACING.label,
    fontWeight: FONT_WEIGHTS.label,
    textTransform: "uppercase",
  },

  bodySm: {
    fontSize: FONT_SIZES.bodySm,
    lineHeight: LINE_HEIGHTS.bodySm,
    letterSpacing: LETTER_SPACING.bodySm,
    fontWeight: FONT_WEIGHTS.bodySm,
  },

  body: {
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
    letterSpacing: LETTER_SPACING.body,
    fontWeight: FONT_WEIGHTS.body,
  },

  bodyLg: {
    fontSize: FONT_SIZES.bodyLg,
    lineHeight: LINE_HEIGHTS.bodyLg,
    letterSpacing: LETTER_SPACING.bodyLg,
    fontWeight: FONT_WEIGHTS.bodyLg,
  },

  h4: {
    fontSize: FONT_SIZES.h4,
    lineHeight: LINE_HEIGHTS.h4,
    letterSpacing: LETTER_SPACING.h4,
    fontWeight: FONT_WEIGHTS.h4,
  },

  h3: {
    fontSize: FONT_SIZES.h3,
    lineHeight: LINE_HEIGHTS.h3,
    letterSpacing: LETTER_SPACING.h3,
    fontWeight: FONT_WEIGHTS.h3,
  },

  h2: {
    fontSize: FONT_SIZES.h2,
    lineHeight: LINE_HEIGHTS.h2,
    letterSpacing: LETTER_SPACING.h2,
    fontWeight: FONT_WEIGHTS.h2,
  },
};

/* ==========================================
   CSS VARIABLES
========================================== */
export const TYPOGRAPHY_VARIABLES = {
  "--text-hero": FLUID_TYPOGRAPHY.hero,
  "--text-h1": FLUID_TYPOGRAPHY.h1,
};

/**
 * Tagged template / function helper `tw` for typography classes
 * Example: tw`text-body` or tw('text-body') or tw`text-h2`
 */
export const tw = (stringsOrKey, ...values) => {
  let input = '';
  if (Array.isArray(stringsOrKey)) {
    input = stringsOrKey.reduce((acc, str, i) => acc + str + (values[i] || ''), '').trim();
  } else if (typeof stringsOrKey === 'string') {
    input = stringsOrKey.trim();
  }

  const aliasMap = {
    'xs': 'caption',
    'caption': 'caption',
    'helper': 'helper',
    'label': 'label',
    'sm': 'bodySm',
    'bodySm': 'bodySm',
    'body-sm': 'bodySm',
    'base': 'body',
    'body': 'body',
    'lg': 'bodyLg',
    'bodyLg': 'bodyLg',
    'body-lg': 'bodyLg',
    'xl': 'h4',
    'h4': 'h4',
    '2xl': 'h3',
    'h3': 'h3',
    '3xl': 'h2',
    'h2': 'h2',
    '4xl': 'h2',
    '5xl': 'h1',
    'h1': 'h1',
    '6xl': 'hero',
    'hero': 'hero',
  };

  const key = input.startsWith('text-') ? input.slice(5) : input;
  const tokenKey = aliasMap[key] || key;

  if (TYPOGRAPHY_TOKENS[tokenKey]) {
    const token = TYPOGRAPHY_TOKENS[tokenKey];
    const classes = [
      `text-[${token.fontSize}]`,
      `leading-[${token.lineHeight}]`,
      token.letterSpacing && token.letterSpacing !== '0' ? `tracking-[${token.letterSpacing}]` : '',
      token.fontWeight ? `font-[${token.fontWeight}]` : '',
      token.textTransform || ''
    ].filter(Boolean).join(' ');
    return classes;
  }

  if (FLUID_TYPOGRAPHY[tokenKey]) {
    return `text-[${FLUID_TYPOGRAPHY[tokenKey]}]`;
  }

  return input;
};

export const getTypographyStyle = (tokenKey) => {
  if (TYPOGRAPHY_TOKENS[tokenKey]) {
    const token = TYPOGRAPHY_TOKENS[tokenKey];
    return {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      letterSpacing: token.letterSpacing,
      fontWeight: token.fontWeight,
      ...(token.textTransform && { textTransform: token.textTransform }),
    };
  }
  if (FLUID_TYPOGRAPHY[tokenKey]) {
    return { fontSize: FLUID_TYPOGRAPHY[tokenKey] };
  }
  return {};
};

export default TYPOGRAPHY_TOKENS;