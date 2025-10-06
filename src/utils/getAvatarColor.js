// utils/getAvatarColor.js

/**
 * Generate a consistent HSL color from a given string (e.g., user name).
 * @param {string} name - The name or string to hash into a color.
 * @param {number} [saturation=65] - Saturation level (0-100).
 * @param {number} [lightness=55] - Lightness level (0-100).
 * @returns {string} - HSL color string.
 */
export const getAvatarColor = (name = "User", saturation = 65, lightness = 55) => {
  if (!name) return `hsl(200, ${saturation}%, ${lightness}%)`;

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360; // spread across full hue range
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
