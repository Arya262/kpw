import { IoSearchOutline } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useMemo, useRef, useEffect, useCallback, useState } from "react";
import ContactsLoader from "./ContactsLoader";
import Avatar from "../../utils/Avatar";
import { formatLastMessageTime } from "../../utils/formatLastMessageTime";
import { getMessagePreview } from "../../utils/getMessagePreview";

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
  const navigate = useNavigate();
  
  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts || [];
    const query = searchQuery.toLowerCase().trim();
    return (contacts || []).filter((c) => {
      const nameMatch = c.name?.toLowerCase().includes(query);
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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Inbox</h2>
          <p className="text-sm text-gray-500">List of all Chats.</p>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Users"
          onClick={() => navigate('/contact')}>
            <FaUserPlus className="text-lg" />
          </button>
          
        </div>
      </div>
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
        {isLoading && <ContactsLoader />}
      </div>
    </div>
  );
};

export default ChatSidebar;