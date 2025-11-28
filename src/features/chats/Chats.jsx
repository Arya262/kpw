import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import ChatSidebar from "./chatSidebar";
import ChatHeader from "./ChatHeader";
import ChatMessageArea from "./ChatMessages";
import MessageInput from "./MessageInput";
import UserDetails from "./UserDetails";
import { MessageCircle } from "lucide-react";
import { useChatLogic } from "../../hooks/useChatLogic";
import { getPermissions } from "../../utils/getPermissions";
import { GripVertical } from "lucide-react";
import Loader from "../../components/Loader";
import ContactsLoader from "./ContactsLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmptyState from "./chatFeatures/EmptyState";
import { CHAT_CONFIG, ERROR_MESSAGES } from "./chatConstants";

const { MOBILE_BREAKPOINT, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH, SIDEBAR_DEFAULT_WIDTH } = CHAT_CONFIG;

const Chat = () => {
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const socket = useSocket();
  const { user } = useAuth();
  const permissions = getPermissions(user);
  const userDetailsRef = useRef(null);
  const profileButtonRef = useRef(null);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= MOBILE_BREAKPOINT
  );
  const [showMobileChat, setShowMobileChat] = useState(false);
  const isResizing = useRef(false);
  const [isResizingState, setIsResizingState] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("sidebarWidth");
    return saved ? parseInt(saved, 10) : SIDEBAR_DEFAULT_WIDTH;
  });

  useEffect(() => {
    const handleResize = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    fetchContacts,
    fetchMessagesForContact,
    selectContact,
    sendMessage,
    deleteChat,
    setupChatEventListener,
    updateBlockStatus,
  } = useChatLogic({
    user,
    socket,
    selectedContact,
    setSelectedContact,
    setMessages,
    setContacts,
    contacts,
    permissions,
  });

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      await fetchContacts();
      setLoading(false);
    };
    loadContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (location.state?.contact) {
      selectContact(location.state.contact);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        userDetailsRef.current &&
        !userDetailsRef.current.contains(e.target) &&
        !profileButtonRef.current.contains(e.target)
      ) {
        setShowUserDetails(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () =>
      document.removeEventListener("click", handleClickOutside, true);
  }, []);

  useEffect(() => {
    const cleanup = setupChatEventListener?.();
    return cleanup;
  }, [setupChatEventListener]);

  const toggleUserDetails = useCallback(
    () => setShowUserDetails((prev) => !prev),
    []
  );

  const handleSendMessageWithSessionUpdate = async (message) => {
    await sendMessage(message);

    if (typeof message === "object" && message.template_name) {
      setSelectedContact((prev) =>
        prev
          ? {
              ...prev,
              lastMessageTime: new Date().toISOString(),
            }
          : prev
      );
    }
  };

  // ✅ Toggle selection handler
  const toggleContactSelection = useCallback((contact) => {
    setSelectedContacts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contact.contact_id)) {
        newSet.delete(contact.contact_id);
      } else {
        newSet.add(contact.contact_id);
      }
      return newSet;
    });
  }, []);

  // Sidebar resize handlers
  const startResizing = useCallback((e) => {
    if (isMobile) return;
    
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    setIsResizingState(true);
  }, [isMobile]);

  const stopResizing = useCallback(() => {
    if (!isResizing.current) return;
    isResizing.current = false;
    setIsResizingState(false);
    localStorage.setItem("sidebarWidth", sidebarWidth);
  }, [sidebarWidth]);

  const resize = useCallback((e) => {
    if (!isResizing.current) return;

    let newWidth = e.clientX;
    newWidth = Math.min(Math.max(newWidth, SIDEBAR_MIN_WIDTH), SIDEBAR_MAX_WIDTH);
    setSidebarWidth(newWidth);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing, isMobile]);

  const handleSelectContact = useCallback(
    (contact, e) => {
      if (isSelectMode) {
        e?.preventDefault();
        toggleContactSelection(contact);
      } else {
        const fullContact = contacts.find(
          (c) =>
            (c.contact_id && c.contact_id === contact.contact_id) ||
            (c.mobile_no && c.mobile_no === contact.mobile_no)
        );

        selectContact(fullContact || contact);
        if (isMobile) setShowMobileChat(true);
      }
    },
    [contacts, selectContact, isMobile, isSelectMode, toggleContactSelection]
  );

  const handleDeleteSelected = useCallback(async () => {
    if (selectedContacts.size === 0) return;

    try {
      const contactIds = Array.from(selectedContacts);
      const contactsToDelete = contacts.filter((c) =>
        contactIds.includes(c.contact_id)
      );

      for (const contact of contactsToDelete) {
        await deleteChat(contact);
      }

      setSelectedContacts(new Set());
      setIsSelectMode(false);

      if (selectedContact && contactIds.includes(selectedContact.contact_id)) {
        setSelectedContact(null);
      }

      toast.success(
        `${contactIds.length} conversation${
          contactIds.length > 1 ? "s" : ""
        } deleted`
      );
    } catch (error) {
      console.error("Error deleting conversations:", error);
      toast.error("Failed to delete conversations");
    }
  }, [selectedContacts, deleteChat, selectedContact, contacts]);

const handleSearchChange = useCallback(
  (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Fetch contacts for the new search query, resetting previous results
    fetchContacts({ search: query, cursor: null, limit: 20 });
  },
  [fetchContacts]
);

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode((prev) => !prev);
    if (!isSelectMode) {
      setSelectedContacts(new Set());
    }
  }, [isSelectMode]);

  return (
    <div className="flex flex-col md:flex-row w-full flex-1 min-h-0 h-full md:border md:rounded-2xl border-gray-300 bg-white overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      {isResizingState && !isMobile && (
        <div 
          className="fixed inset-0 z-[9999] cursor-col-resize"
          style={{ userSelect: 'none' }}
        />
      )}
      {/* Sidebar */}
      {loading ? (
        <div className="basis-full md:basis-1/4 border-r border-gray-200 overflow-y-auto">
          <ContactsLoader />
        </div>
      ) : (
        (!isMobile || !showMobileChat) && (
          <div
            className="relative overflow-y-auto"
            style={{ width: isMobile ? "100%" : `${sidebarWidth}px` }}
          >
            <ChatSidebar
              contacts={contacts}
              selectedContact={selectedContact}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSelectContact={handleSelectContact}
              fetchContacts={fetchContacts}
            />
            {/* Drag handle */}
            <div
              className={`absolute top-0 right-0 h-full w-[12px] cursor-col-resize group transition-colors z-10 hidden md:flex items-center justify-center ${
                isResizingState 
                  ? 'bg-[#0AA89E]/10' 
                  : 'hover:bg-gray-100'
              }`}
              onMouseDown={startResizing}
              title="Drag to resize sidebar"
            >
              <GripVertical 
                className={`w-4 h-4 transition-colors ${
                  isResizingState 
                    ? 'text-[#0AA89E]' 
                    : 'text-gray-400 group-hover:text-[#0AA89E]'
                }`} 
              />
            </div>
          </div>
        )
      )}

      {/* Main Chat Area */}
      {(!isMobile || (isMobile && showMobileChat)) && (
        <div className="flex-1 flex flex-col min-h-0 h-full">
          {selectedContact ? (
            <>
              <ChatHeader
                selectedContact={selectedContact}
                onProfileClick={toggleUserDetails}
                ref={profileButtonRef}
                isMobile={isMobile}
                onBack={() => setShowMobileChat(false)}
                onDeleteChat={
                  permissions.canDeleteChats ? deleteChat : undefined
                }
                authCustomerId={user?.customer_id}
                canDeleteChat={permissions.canDeleteChats}
              />

              <div className="flex-1 flex flex-row min-h-0 h-full">
                {/* Message + Input */}
                <div className="flex-1 flex flex-col min-h-0 h-full">
                  <div className="flex-1 min-h-0">
                    <ChatMessageArea
                      selectedContact={selectedContact}
                      messages={messages || []}
                      fetchMessagesForContact={fetchMessagesForContact}
                    />
                  </div>
                  <div className="bg-white flex-shrink-0">
                    <MessageInput
                      onSendMessage={
                        permissions.canSendMessages
                          ? handleSendMessageWithSessionUpdate
                          : () =>
                              toast.error(
                                "You do not have permission to send messages."
                              )
                      }
                      selectedContact={selectedContact}
                      canSendMessage={permissions.canSendMessages}
                    />
                  </div>
                </div>

                {/* User Details Panel */}
                {!isMobile && showUserDetails && (
                  <div ref={userDetailsRef}>
                    <UserDetails
                      selectedContact={selectedContact}
                      isExpanded={true}
                      setIsExpanded={() => setShowUserDetails(false)}
                      updateBlockStatus={updateBlockStatus}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;
