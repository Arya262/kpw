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
import { getPermissions } from "../../utils/getPermissions";
import { toast } from "react-toastify";
import Loader from "../../components/Loader"; // Adjust the import based on your project structure

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
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ Attach socket listener for incoming messages
  useEffect(() => {
    const cleanup = setupSocketListener?.();
    return cleanup;
  }, [setupSocketListener]);

  const toggleUserDetails = () => setShowUserDetails((prev) => !prev);

  const handleSendMessageWithSessionUpdate = async (message) => {
    // Call the original sendMessage
    await sendMessage(message);
    // If a template was sent, update lastMessageTime locally
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

  return (
    <div className="flex flex-col md:flex-row w-full flex-1 min-h-0 h-full border border-gray-300 rounded-2xl bg-white overflow-hidden">
      {/* Sidebar */}
      {loading ? (
        <div className="basis-full md:basis-1/4 flex items-center justify-center p-6 border-r border-gray-200">
          <Loader />
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