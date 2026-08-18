/**
 * Global Typography & Font Constants
 * Official font family used across the KKR & KSR Sports Club Portal.
 * Uses League Spartan from src/fonts/League_Spartan with system fallbacks.
 */

export const FONT_FAMILY_NAME = 'League Spartan';
export const FONT_FALLBACKS = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const FONT_FAMILY = `'${FONT_FAMILY_NAME}', ${FONT_FALLBACKS}`;

export const TYPOGRAPHY_CONSTANTS = {
  fontFamily: FONT_FAMILY,
  fontFamilyName: FONT_FAMILY_NAME,
  fallbacks: FONT_FALLBACKS,
};

export default FONT_FAMILY;
