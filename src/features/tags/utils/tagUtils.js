// Tag utility functions

// Extract tag ID from different possible field names (backend uses 'id')
export const getTagId = (tag) => tag?.id || tag?.tag_id || tag?._id || null;

// Extract tag name from different possible field names (backend uses 'tag')
// Also handles string tags (when backend returns tags as array of strings)
export const getTagName = (tag) => {
  if (typeof tag === "string") return tag;
  return tag?.tag || tag?.tag_name || tag?.name || "Untitled";
};

// Predefined color palette for tags
const TAG_COLORS = [
  "#0AA89E", // teal
  "#6366F1", // indigo
  "#EC4899", // pink
  "#F59E0B", // amber
  "#10B981", // emerald
  "#8B5CF6", // violet
  "#EF4444", // red
  "#3B82F6", // blue
  "#14B8A6", // cyan
  "#F97316", // orange
  "#84CC16", // lime
  "#A855F7", // purple
];

// Generate consistent color based on tag name
const getColorFromName = (name) => {
  if (!name) return TAG_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
};

// Extract tag color with default fallback
// Generates consistent color for string tags based on name
export const getTagColor = (tag, defaultColor = "#0AA89E") => {
  // If tag has explicit color, use it
  if (typeof tag === "object" && (tag?.tag_color || tag?.color)) {
    return tag.tag_color || tag.color;
  }
  // Generate color from tag name for consistency
  const tagName = getTagName(tag);
  return getColorFromName(tagName);
};

// Extract category name from different possible field names
export const getCategoryName = (tag) => 
  tag?.category_name || tag?.category || "Uncategorized";

// Check if tag is active
export const isTagActive = (tag) => 
  tag?.is_active !== undefined ? tag.is_active : tag?.status !== "inactive";

// Format date for display
export const formatTagDate = (dateValue) => {
  try {
    if (!dateValue) return null;
    const d = new Date(dateValue);
    if (isNaN(d)) return null;
    return d.toLocaleDateString(undefined, { 
      day: "2-digit", 
      month: "short", 
      year: "numeric" 
    });
  } catch {
    return null;
  }
};

// Filter tags by search term
export const filterTags = (tags, searchTerm) => {
  if (!searchTerm) return tags;
  const searchLower = searchTerm.toLowerCase();
  return tags.filter((tag) => {
    const tagName = getTagName(tag);
    const categoryName = getCategoryName(tag);
    return (
      tagName.toLowerCase().includes(searchLower) ||
      categoryName.toLowerCase().includes(searchLower)
    );
  });
};

// Normalize tag data to consistent format
export const normalizeTag = (tag) => ({
  id: getTagId(tag),
  name: getTagName(tag),
  color: getTagColor(tag),
  category: getCategoryName(tag),
  isActive: isTagActive(tag),
  firstMessageEnabled: !!tag?.first_message_enabled,
  customerJourney: !!tag?.customer_journey,
  createdAt: tag?.created_at || tag?.createdAt || null,
  raw: tag,
});
