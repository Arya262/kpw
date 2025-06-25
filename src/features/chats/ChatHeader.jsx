import { forwardRef, useState, useEffect, useRef } from "react";
import { ChevronLeft, MoreVertical, Trash2, BellOff } from "lucide-react";

const getAvatarColor = (name = "User") => {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const ChatHeader = forwardRef(
  ({ selectedContact, onProfileClick, isMobile, onBack }, profileButtonRef) => {
    const [deleting, setDeleting] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!selectedContact) return null;
    const handleDelete = async () => {
      if (
        confirm(`Are you sure you want to delete the chat with ${selectedContact.name}?`)
      ) {
        try {
          setDeleting(true);
          console.log("Deleted:", selectedContact.id);
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } catch (error) {
          console.error("Failed to delete chat", error);
        } finally {
          setDeleting(false);
          setDropdownOpen(false);
        }
      }
    };

    const renderAvatar = (contact) => {
      if (contact.image) {
        return (
          <img
            src={contact.image}
            alt="User Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        );
      }

      const name = contact.name || "User";
      const firstLetter = name.charAt(0).toUpperCase();
      const bgColor = getAvatarColor(name);

      return (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor: bgColor }}
        >
          {firstLetter}
        </div>
      );
    };

    return (
      <div className="chat-header relative flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-white">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button onClick={onBack} className="text-gray-600 mr-1">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={onProfileClick}
            ref={profileButtonRef}
          >
            {renderAvatar(selectedContact)}
            {!isMobile && (
              <h3 className="font-semibold text-lg text-black">
                {selectedContact.name}
              </h3>
            )}
          </div>
        </div>

        {/* Centered Name (mobile only) */}
        {isMobile && (
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <h3 className="font-semibold text-base text-black pointer-events-auto">
              {selectedContact.name}
            </h3>
          </div>
        )}

        {/* Right Actions */}
        <div className="relative flex items-center space-x-2" ref={dropdownRef}>
          {!isMobile ? (
            <>
              <button className="text-sm text-gray-600 hover:text-blue-600 flex items-center space-x-1">
                <BellOff className="w-4 h-4" />
                <span>Hide Notification</span>
              </button>
              <button
                className="p-1 rounded hover:bg-red-100"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin w-5 h-5 text-red-500"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span className="text-red-500 text-sm">Deleting...</span>
                  </div>
                ) : (
                  <Trash2 className="w-5 h-5 text-red-500" />
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded shadow z-20">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left">
                    <BellOff className="w-4 h-4 mr-2" />
                    Hide Notification
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100 text-left"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting ? "Deleting..." : "Delete Chat"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
);

export default ChatHeader;
