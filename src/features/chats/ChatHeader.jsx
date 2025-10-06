import { forwardRef, useState, useEffect, useRef } from "react";
import { ChevronLeft, MoreVertical, Trash2, BellOff } from "lucide-react";
import SingleDeleteDialog from "../../features/contacts/SingleDeleteDialog";
import Avatar from "../../utils/Avatar";

const ChatHeader = forwardRef(
  (
    {
      selectedContact,
      onProfileClick,
      isMobile,
      onBack,
      onDeleteChat,
      authCustomerId,
    },
    profileButtonRef
  ) => {
    const [deleting, setDeleting] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!selectedContact) return null;

    const handleDelete = () => setShowDeleteDialog(true);

    const handleConfirmDelete = async () => {
      setDeleting(true);
      try {
        console.log(
          `Delete confirmed at: ${new Date().toISOString()} | Contact: ${
            selectedContact?.name
          } | Customer ID: ${authCustomerId}`
        );
        if (onDeleteChat) {
          await onDeleteChat(selectedContact, authCustomerId);
        }
      } catch (error) {
        console.error("Failed to delete chat", error);
      } finally {
        setDeleting(false);
        setShowDeleteDialog(false);
        setDropdownOpen(false);
      }
    };

    const handleCancelDelete = () => setShowDeleteDialog(false);

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
            <Avatar name={selectedContact.name} image={selectedContact.image} />
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
        <SingleDeleteDialog
          showDialog={showDeleteDialog}
          contactName={selectedContact?.name}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          isDeleting={deleting}
        />
      </div>
    );
  }
);

export default ChatHeader;
