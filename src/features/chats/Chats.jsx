import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import ChatSidebar from "./chatSiderbar";
import ChatHeader from "./ChatHeader";
import ChatMessageArea from "./ChatMessages";
import MessageInput from "./MessageInput";
import UserDetails from "./UserDetails";
import { MessageCircle } from "lucide-react";
import { useChatLogic } from "../../hooks/useChatLogic";
import { getPermissions } from "../../utils/getPermissions";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const MOBILE_BREAKPOINT = 768;

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [width, setWidth] = useState(() => parseInt(localStorage.getItem("sidebarWidth")) || 300);
  const isResizing = useRef(false);

  // ✅ Multiple select state
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    fetchContacts,
    fetchMessagesForContact,
    selectContact,
    sendMessage,
    deleteChat,
    setupSocketListener,
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
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, []);

  useEffect(() => {
    const cleanup = setupSocketListener?.();
    return cleanup;
  }, [setupSocketListener]);

  const toggleUserDetails = useCallback(() => setShowUserDetails(prev => !prev), []);

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
      if (newSet.has(contact.conversation_id)) {
        newSet.delete(contact.conversation_id);
      } else {
        newSet.add(contact.conversation_id);
      }
      return newSet;
    });
  }, []);

  // Sidebar resize handlers
  const startResizing = (e) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const stopResizing = () => {
    if (!isResizing.current) return;
    isResizing.current = false;
    localStorage.setItem("sidebarWidth", width);
    document.body.style.userSelect = "auto";
    document.body.style.cursor = "default";
  };

  const resize = (e) => {
    if (!isResizing.current) return;

    const minWidth = 200;
    const maxWidth = 450;
    let newWidth = e.clientX;
    newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    setWidth(newWidth);

    if (newWidth > minWidth && newWidth < maxWidth) {
      document.body.style.cursor = "col-resize";
    } else {
      document.body.style.cursor = "default";
    }
  };
  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [width]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  const handleSelectContact = useCallback((contact, e) => {
    if (isSelectMode) {

      e?.preventDefault();
      toggleContactSelection(contact);
    } else {
    
      const fullContact = contacts.find(c => 
        (c.conversation_id && c.conversation_id === contact.conversation_id) ||
        (c.phone_number && c.phone_number === contact.phone_number)
      );
      
      console.log('Selecting contact:', {
        selected: contact,
        found: fullContact,
        allContacts: contacts
      });
      
      selectContact(fullContact || contact);
      if (isMobile) setShowMobileChat(true);
    }
  }, [contacts, selectContact, isMobile, isSelectMode, toggleContactSelection]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedContacts.size === 0) return;
    
    try {
      const contactIds = Array.from(selectedContacts);
      const contactsToDelete = contacts.filter(c => contactIds.includes(c.conversation_id));
      
      for (const contact of contactsToDelete) {
        await deleteChat(contact);
      }
      
      setSelectedContacts(new Set());
      setIsSelectMode(false);
      
      if (selectedContact && contactIds.includes(selectedContact.conversation_id)) {
        setSelectedContact(null);
      }
      
      toast.success(`${contactIds.length} conversation${contactIds.length > 1 ? 's' : ''} deleted`);
    } catch (error) {
      console.error('Error deleting conversations:', error);
      toast.error('Failed to delete conversations');
    }
  }, [selectedContacts, deleteChat, selectedContact, contacts]);

  const handleSearchChange = useCallback((e) => setSearchQuery(e.target.value), []);

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode(prev => !prev);
    if (!isSelectMode) {
      setSelectedContacts(new Set());
    }
  }, [isSelectMode]);

  return (
    <div className="flex flex-col md:flex-row w-full flex-1 min-h-0 h-full border border-gray-300 rounded-2xl bg-white overflow-hidden">
      {/* Sidebar */}
      {loading ? (
        <div className="basis-full md:basis-1/4 flex items-center justify-center p-6 border-r border-gray-200">
          <Loader />
        </div>
      ) : (
        (!isMobile || (isMobile && !showMobileChat)) && (
          <div
            className="relative border-r border-gray-200 overflow-y-auto"
            style={{ width: isMobile ? "100%" : `${width}px` }}
          >
            <ChatSidebar
              contacts={filteredContacts}
              selectedContact={selectedContact}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSelectContact={handleSelectContact}
              isSelectMode={isSelectMode}
              selectedContacts={selectedContacts}
              onToggleSelectMode={toggleSelectMode}
              onDeleteSelected={handleDeleteSelected}
              onToggleContactSelection={toggleContactSelection}  
              fetchContacts={fetchContacts}  
            />

            {/* Drag handle */}
            <div
              className="absolute top-0 right-0 w-0.5 h-full cursor-col-resize bg-gray-200 hover:bg-gray-400"
              onMouseDown={startResizing}
            />
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
                onDeleteChat={permissions.canDeleteChats ? deleteChat : undefined}
                authCustomerId={user?.customer_id}
                canDeleteChat={permissions.canDeleteChats}
              />

              <div className="flex-1 flex flex-row min-h-0 h-full">
                {/* Message + Input */}
                <div className="flex-1 flex flex-col min-h-0 h-full">
                  <div className="flex-1 overflow-y-auto">
                    <ChatMessageArea
                      selectedContact={selectedContact}
                      messages={messages || []}
                      fetchMessagesForContact={fetchMessagesForContact}
                    />
                  </div>
                  <div className="bg-white">
                    <MessageInput
                      onSendMessage={
                        permissions.canSendMessages
                          ? handleSendMessageWithSessionUpdate
                          : () => toast.error("You do not have permission to send messages.")
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
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-lg px-4 text-center">
              <MessageCircle className="w-16 h-16 mb-4 text-blue-500" aria-hidden="true" />
              <p>Select a contact to start a conversation</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;