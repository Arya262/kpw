import { IoSearchOutline } from "react-icons/io5";
import { useMemo, useRef, useEffect, useCallback, useState } from "react";

// Utility: Generate avatar background color based on name
const getAvatarColor = (name = "User") => {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

// Utility: Format timestamp into readable string
const formatLastMessageTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return date
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  }

  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Utility: Return last message preview based on type
const getMessagePreview = (message, type) => {
  if (!message && !type) return null;

  if (message && type === "text") return message;

  switch (type) {
    case "image": return "📷 Photo";
    case "video": return "🎥 Video";
    case "document": return "📄 Document";
    case "audio": return "🎵 Audio";
    case "location": return "📍 Location";
    case "contact": return "👤 Contact";
    case "template": return "📋 Template";
    default: return message || "";
  }
};

// ✅ Reusable Avatar component (exported)
export const Avatar = ({ name = "User", image }) => {
  // Extract first letter of first and last name
  let initials = "U";
  if (name && typeof name === "string") {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      initials = parts[0][0]?.toUpperCase() || "U";
    } else if (parts.length > 1) {
      initials =
        (parts[0][0] || "").toUpperCase() +
        (parts[parts.length - 1][0] || "").toUpperCase();
    }
  }
  const bgColor = getAvatarColor(name);

  if (image) {
    return (
      <img
        src={image}
        alt="User Avatar"
        className="w-10 h-10 rounded-full object-cover mr-4"
      />
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-full mr-4 flex items-center justify-center text-white font-semibold"
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
};

const ChatSidebar = ({
  contacts,
  selectedContact,
  searchQuery,
  onSearchChange,
  onSelectContact,
  fetchContacts, 
}) => {
  const listRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts || [];
    const query = searchQuery.toLowerCase().trim();
    return (contacts || []).filter((c) => {
      // Check if name includes the query (case insensitive)
      const nameMatch = c.name?.toLowerCase().includes(query);
      // Check mobile number field
      const phoneMatch = c.mobile_no?.includes(query);
      return nameMatch || phoneMatch;
    });
  }, [contacts, searchQuery]);

  const handleScroll = useCallback(async () => {
    const container = listRef.current;
    if (!container || isLoading || !hasMore) return;

    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
      setIsLoading(true);

      const { nextCursor: newCursor, hasMore: more } =
        await fetchContacts({ cursor: nextCursor, limit: 10 });
      setNextCursor(newCursor);
      setHasMore(more);
      setIsLoading(false);
    }
  }, [isLoading, hasMore, nextCursor, fetchContacts]);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-gray-200 p-4">
      {/* Title */}
      <h2 className="text-2xl font-semibold mb-4 text-black">Inbox</h2>

      {/* Search Input */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search Contact"
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full p-3 pl-4 pr-12 text-base rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0AA89E] shadow-sm"
        />
        <IoSearchOutline className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl text-gray-500" />
      </div>

      {/* Contacts List with infinite scroll */}
      <div
        ref={listRef}
        className="space-y-2 overflow-y-auto flex-1 scrollbar-hide"
      >
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact, index) => {
            const isSelected =
              selectedContact?.contact_id === contact.contact_id;

            return (
              <div
                key={contact.contact_id ?? `contact-${index}`}
                role="listitem"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => onSelectContact(contact)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectContact(contact);
                  }
                }}
                className={`flex items-center px-2 py-1 w-full max-w-full rounded-xl transition focus:outline-none cursor-pointer
                  border ${
                    isSelected
                      ? "border-[#0AA89E] bg-gray-100"
                      : "border border-[#E0E0E0] hover:bg-gray-100"
                  }`}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  <Avatar name={contact.name} image={contact.image} />
                </div>

                {/* Contact Details */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex justify-between items-start space-x-2">
                    <p className="font-semibold text-black truncate max-w-[160px]">
                      {contact.name || "Unnamed"}
                    </p>
                    <div className="flex flex-col items-end min-w-[50px] text-right">
                      <p className="text-xs text-gray-500 select-none">
                        {formatLastMessageTime(contact.lastMessageTime)}
                      </p>
                      {contact.unreadCount > 0 && (
                        <span className="mt-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-[#24AEAE] rounded-full">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {getMessagePreview(
                      contact.lastMessage,
                      contact.lastMessageType
                    ) || (
                      <span className="italic text-gray-400">
                        No messages yet
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-400 text-sm mt-4">
            No contacts found.
          </p>
        )}

        {/* Loader indicator */}
        {isLoading && (
          <div className="flex justify-center py-3 text-gray-400 text-sm">
            Loading more contacts...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;