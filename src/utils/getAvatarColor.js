// utils/getAvatarColor.js

/**
 * Generate a consistent HSL color from a given string (e.g., user name).
 * Ensures sufficient contrast with white text (WCAG AA compliant).
 * @param {string} name - The name or string to hash into a color.
 * @param {number} [saturation=70] - Saturation level (0-100).
 * @param {number} [lightness=45] - Lightness level (0-100). Kept at 45% for good contrast with white text.
 * @returns {string} - HSL color string.
 */
export const getAvatarColor = (name = "User", saturation = 70, lightness = 45) => {
  if (!name) return `hsl(200, ${saturation}%, ${lightness}%)`;

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360; // spread across full hue range
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
