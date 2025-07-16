import React, { useState, useEffect, useRef } from "react";
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

  const userDetailsRef = useRef(null);
  const profileButtonRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileChat, setShowMobileChat] = useState(false);

    useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    fetchContacts,
    fetchMessagesForContact,
    selectContact,
    sendMessage,
    deleteChat,
    setupSocketListener, // ✅ Socket listener logic from useChatLogic
  } = useChatLogic({
    user,
    socket,
    selectedContact,
    setSelectedContact,
    setMessages,
    setContacts,
    contacts,
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
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ Attach socket listener for incoming messages
  useEffect(() => {
    const cleanup = setupSocketListener?.();
    return cleanup;
  }, [setupSocketListener]);

  const toggleUserDetails = () => setShowUserDetails((prev) => !prev);

  return (
    <div className="flex flex-col md:flex-row w-full flex-1 min-h-0 h-full border border-gray-300 rounded-2xl bg-white mx-auto max-w-screen-2xl overflow-hidden">
      {/* Sidebar */}
      {loading ? (
        <div className="basis-full md:basis-1/4 flex items-center justify-center p-6 border-r border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        (!isMobile || (isMobile && !showMobileChat)) && (
          <div className="basis-full md:basis-1/4 border-r border-gray-200 overflow-y-auto">
            <ChatSidebar
              contacts={contacts}
              selectedContact={selectedContact}
              searchQuery={searchQuery}
              onSearchChange={(e) => setSearchQuery(e.target.value)}
              onSelectContact={(contact) => {
                const fullContact = contacts.find(
                  (c) => c.conversation_id === contact.conversation_id
                );
                selectContact(fullContact || contact);
                if (isMobile) setShowMobileChat(true);
              }}
            />
          </div>
        )
      )}

      {/* Main Chat Area */}
      {(!isMobile || (isMobile && showMobileChat)) && (
        <div className="w-full md:flex-1 flex flex-col min-h-0 h-full">
          {selectedContact ? (
            <>
              <ChatHeader
                selectedContact={selectedContact}
                onProfileClick={toggleUserDetails}
                ref={profileButtonRef}
                isMobile={isMobile}
                onBack={() => setShowMobileChat(false)}
                onDeleteChat={() => deleteChat(selectedContact)}
                authCustomerId={user?.customer_id}
              />

              <div className="flex-1 flex flex-row min-h-0 h-full">
                {/* Message + Input */}
                <div className="flex-1 flex flex-col min-h-0 h-full">
                  <div className="flex-1 overflow-y-auto">
                    <ChatMessageArea
                      selectedContact={selectedContact}
                      messages={messages || []}
                    />
                  </div>
                  <div className="bg-white">
                    <MessageInput
                      onSendMessage={sendMessage}
                      selectedContact={selectedContact}
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
              <MessageCircle className="w-16 h-16 mb-4 text-blue-500" />
              <p>Select a contact to start a conversation</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;