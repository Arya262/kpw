import { useCallback, useRef, useEffect } from "react";
import axios from "axios";
import { API_BASE, API_ENDPOINTS } from "../config/api";
import { useNotifications } from "../context/NotificationContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  normalizeMessageData, 
  updateContactFromMessage as updateContactFromMessageUtil,
  isMessageFromSelectedChat 
} from "../utils/chatUtils";

export const useChatLogic = ({
  user,
  socket,
  selectedContact,
  setSelectedContact, 
  setMessages,
  setContacts,
  contacts,
  permissions,
}) => {
  const { markConversationAsRead, setSelectedConversationId } = useNotifications();
  const selectedContactRef = useRef(selectedContact);

  // Block/Unblock contact
  const updateBlockStatus = useCallback(async (contactId, isBlocked) => {
    try {
      const endpoint = isBlocked 
        ? API_ENDPOINTS.CHAT.BLOCK(user?.customer_id)
        : API_ENDPOINTS.CHAT.UNBLOCK(user?.customer_id);
        
      const response = await axios.post(
        endpoint,
        { contact_ids: [contactId] },
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true 
        }
      );

      if (response.data.success) {
        // Update the contact in the contacts list
        setContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.contact_id === contactId 
              ? { ...contact, isBlocked } 
              : contact
          )
        );
        
        // If the blocked contact is currently selected, update its state
        if (selectedContactRef.current?.contact_id === contactId) {
          setSelectedContact(prev => ({ ...prev, isBlocked }));
        }
        
        toast.success(response.data.message || `Contact ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to update block status');
      }
    } catch (error) {
      console.error('Error updating block status:', error);
      toast.error(error.response?.data?.message || `Failed to ${isBlocked ? 'block' : 'unblock'} contact`);
      return false;
    }
  }, [setContacts, setSelectedContact, user?.customer_id]);

  const fetchedConversations = useRef(new Set());
  // Deduplicate recently seen message ids to prevent late toasts after navigation
  const recentMessageIds = useRef(new Set());
  const addRecentMessageId = (id) => {
    if (!id) return;
    recentMessageIds.current.add(id);
    // Auto-expire after 20s
    setTimeout(() => recentMessageIds.current.delete(id), 20000);
  };
  
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  // WebSocket cleanup
  useEffect(() => {
    if (!socket) return;
    // Do not disconnect the global socket here; SocketContext should manage lifecycle
    return () => {
      // no-op cleanup; listeners are handled where they are attached
    };
  }, [socket]);

  const markAllAsRead = useCallback(async (contact_id) => {
    try {
      await axios.post(API_ENDPOINTS.CHAT.MARK_AS_READ, {
        contact_id: contact_id,
      });
    } catch (err) {
      console.error("❌ Failed to mark messages as read:", err);
      toast.error("Failed to mark messages as read.");
    }
  }, []);

// ===== Fetch Contacts with Cursor Pagination =====
  const fetchContacts = useCallback(
    async ({ cursor = null, limit = 10, search = ""  } = {}) => {
      if (!user?.customer_id) return;

      try {
        const url = new URL(`${API_BASE}/conversations`);
        url.searchParams.append("customer_id", user.customer_id);
        url.searchParams.append("limit", limit);
        if (cursor) url.searchParams.append("cursor", cursor);
        if (search.trim()) url.searchParams.append("search", search.trim());

        const response = await axios.get(url.toString(), {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });

        const { data = [], nextCursor, hasMore } = response.data;

        const enriched = data.map((c) => ({
          contact_id: c.contact_id,
          name: `${c.first_name} ${c.last_name || ""}`.trim(),
          country_code: c.country_code,
          mobile_no: c.mobile_no,
          image: c.profile_image,
          updated_at: c.updated_at,
          active: false,
          lastMessage: c.last_message,
          lastMessageType: c.last_message_type,
          lastMessageTime: c.last_message_time,
          unreadCount: c.unread_count || 0,
          block: c.block === 1,
          tags: c.tags || [],
        }));

        setContacts((prev) =>
          cursor
            ? [
                ...prev,
                ...enriched.filter(
                  (newC) => !prev.some((p) => p.contact_id === newC.contact_id)
                ),
              ]
            : enriched
        );

        return { nextCursor, hasMore };
      } catch (error) {
        console.error("❌ Failed to fetch contacts:", error);
        return { nextCursor: null, hasMore: false };
      }
    },
    [user?.customer_id, setContacts]
  );

  const fetchMessagesForContact = useCallback(
    async (contact_id, { limit = 10, cursor = null } = {}) => {
      if (!contact_id) return;

      try {
        const response = await axios.get(
          `${
            API_ENDPOINTS.CHAT.MESSAGES
          }?contact_id=${contact_id}&limit=${limit}${
            cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""
          }&includeTemplate=true`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        const { messages = [], pagination } = response.data;
        // console.log(messages);

        if (!cursor) {
          setMessages(messages);
          await markAllAsRead(contact_id);
          markConversationAsRead(contact_id);

          const latest = messages?.[messages.length - 1] || {};
          setContacts((prev) =>
            prev.map((c) =>
              c.contact_id === contact_id
                ? {
                    ...c,
                    lastMessage:
                      latest.content || latest.element_name || c.lastMessage,
                    lastMessageType: latest.message_type || c.lastMessageType,
                    lastMessageTime: latest.sent_at || c.lastMessageTime,
                    unreadCount: 0,
                  }
                : c
            )
          );
        } else {
          // 🔹 Pagination (scroll up) → prepend older messages
          setMessages((prev) => [...messages, ...prev]);
        }

        return pagination; // return cursor info for next fetch
      } catch (err) {
        console.error("❌ Failed to fetch messages:", err);
      }
    },
    [setMessages, setContacts, markAllAsRead, markConversationAsRead]
  );

  const selectContact = useCallback(
    (contact) => {
      if (!contact) {
        console.error("No contact provided to selectContact");
        return;
      }

      // console.log("Selecting contact:", {
      //   name: contact.name,
      //   contact_id: contact.contact_id,
      //   mobile_no: contact.mobile_no,
      //   currentContact: selectedContactRef.current,
      // });

      if (!contact.contact_id) {
        // console.log(`👆 New chat selected with ${contact.name}`);
        setSelectedContact(contact);
        setMessages([]);
        return;
      }

      const currentContact = selectedContactRef.current;

      // Check if the same contact is being selected again
      const isSameContact =
        currentContact &&
        ((currentContact.contact_id &&
          currentContact.contact_id === contact.contact_id) ||
          (currentContact.mobile_no &&
            contact.mobile_no &&
            currentContact.mobile_no === contact.mobile_no));

      if (isSameContact) {
        // console.log(
        //   `⚠️ Contact ${contact.name} already selected, no new fetch.`
        // );
        return;
      }

      setSelectedContact(contact);

      if (setSelectedConversationId && contact.contact_id) {
        // console.log("Setting selected conversation ID:", contact.contact_id);
        setSelectedConversationId(contact.contact_id);
      } else if (!contact.contact_id) {
        // console.log("No contact_id, new chat started");
      }

      // Update contacts active state
      setContacts((prev) =>
        prev.map((c) => ({
          ...c,
          active:
            (c.contact_id && c.contact_id === contact.contact_id) ||
            (c.mobile_no &&
              contact.mobile_no &&
              c.mobile_no === contact.mobile_no),
          unreadCount:
            (c.contact_id && c.contact_id === contact.contact_id) ||
            (c.mobile_no &&
              contact.mobile_no &&
              c.mobile_no === contact.mobile_no)
              ? 0
              : c.unreadCount || 0,
        }))
      );

      if (contact.contact_id) {
        // console.log("Fetching messages for conversation:", contact.contact_id);
        fetchMessagesForContact(contact.contact_id);
        socket?.emit("join_conversation", String(contact.contact_id));
      }
    },
    [
      socket,
      fetchMessagesForContact,
      setSelectedContact,
      setContacts,
      setMessages,
    ]
  );

  // Shared contact update logic using utility function
  const updateContactFromMessage = useCallback((msg, isFromSelectedChat) => {
    setContacts((prev) => updateContactFromMessageUtil(prev, msg, isFromSelectedChat));
  }, [setContacts]);

  // Handle incoming messages from custom events (dispatched by NotificationContext)
  const handleChatMessage = useCallback((event) => {
    const data = event.detail;
    const msg = normalizeMessageData(data);
    if (!msg) return;

    // Skip duplicate toasts for messages we've just seen
    if (recentMessageIds.current.has(msg.message_id)) {
      return;
    }

    const isFromSelectedChat = isMessageFromSelectedChat(selectedContactRef.current, msg);

    // Show toast for non-selected chats only while on chats page
    const isOnChatsPage = typeof window !== 'undefined' && window.location?.pathname?.startsWith('/chats');
    if (!isFromSelectedChat && isOnChatsPage) {
      const contact = contacts.find((c) => c.contact_id === msg.contact_id);
      const fromName = contact?.name || msg?.sender_name || "New message";
      addRecentMessageId(msg.message_id);
    }

    // Update contact list using shared utility
    updateContactFromMessage(msg, isFromSelectedChat);

    // Add message to current chat if it's from selected contact
    if (isFromSelectedChat) {
      setMessages((prev) => [...prev, msg]);
      fetchedConversations.current.delete(msg.conversation_id);
      addRecentMessageId(msg.message_id);
    }
  }, [contacts, updateContactFromMessage, setMessages]);

  // Setup custom event listener for chat messages
  const setupChatEventListener = useCallback(() => {
    window.addEventListener('chatMessage', handleChatMessage);
    return () => {
      window.removeEventListener('chatMessage', handleChatMessage);
    };
  }, [handleChatMessage]);
  // ===== Send Message (text or template) =====
const sendMessage = useCallback(
  async (input) => {
    if (permissions && !permissions.canSendMessages) return;
    if (!selectedContact) return;

    let contact_id = selectedContact.contact_id;
    let customer_id = user.customer_id;
    let phoneNumber = `${selectedContact.country_code}${selectedContact.mobile_no}`;

    const newMessage = {
      contact_id,
      customer_id,
      phoneNumber,
      category: input.category,
    };
    let messageType = "text";

    if (typeof input === "string") {
      // Free-form text
      newMessage.message = input;
    } else if (input.template_name) {
      // Template message
      messageType = "template";
      newMessage.element_name = input.template_name;

      // Add parameters
      if (Array.isArray(input.parameters) && input.parameters.length > 0) {
        newMessage.parameters = input.parameters;
      }

      // Handle header (image, video, document, or text)
      if (input.headerType && input.headerValue) {
        newMessage.headerType = input.headerType;
        newMessage.headerValue = input.headerValue;
        newMessage.headerIsId = input.headerIsId;
      } else {
        // Try to auto-detect from parameters if no header is set
        const mediaUrl = input.parameters?.find((url) =>
          url.match(/\.(jpeg|png|mp4|pdf|docx?)$/i)
        );

        if (mediaUrl) {
          if (/\.(jpeg|png)$/i.test(mediaUrl)) {
            newMessage.headerType = "image";
          } else if (/\.(mp4)$/i.test(mediaUrl)) {
            newMessage.headerType = "video";
          } else if (/\.(pdf|docx?)$/i.test(mediaUrl)) {
            newMessage.headerType = "document";
          }
          newMessage.headerValue = mediaUrl;
          newMessage.headerIsId = input.headerIsId;
          newMessage.parameters = input.parameters.filter(
            (p) => p !== mediaUrl
          );
        }
      }

      // Add fileName and media_url if present
      if (input.fileName) {
        newMessage.fileName = input.fileName;
        // Use fileName as media_url if media_url is not explicitly provided
        if (!newMessage.media_url) {
          newMessage.media_url = input.fileName;
        }
      }

      if (input.language_code) {
        newMessage.language_code = input.language_code;
      }
    } else {
      console.warn("Invalid message input");
      return;
    }

    try {
      // console.log("🚀 Sending message payload:", newMessage);
      const response = await axios.post(`${API_BASE}/sendmessage`, {
        ...newMessage,
        message_type: messageType,
      });

      fetchMessagesForContact(selectedContact.contact_id);
      setContacts((prev) =>
        prev
          .map((c) =>
            c.contact_id === selectedContact.contact_id
              ? {
                  ...c,
                  lastMessage:
                    typeof input === "string"
                      ? input
                      : input.fileName
                      ? `${input.template_name} (${input.fileName})` 
                      : input.template_name,
                  lastMessageType: messageType,
                  lastMessageTime: new Date().toISOString(),
                  unreadCount: 0,
                }
              : c
          )
          .sort(
            (a, b) =>
              new Date(b.lastMessageTime || b.updated_at || 0) -
              new Date(a.lastMessageTime || a.updated_at || 0)
          )
      );

      // toast.success("Message sent successfully");
    } catch (err) {
      console.error("❌ Error sending message:", err.response?.data || err);
      toast.error("Failed to send message");
    }
  },
  [selectedContact, setContacts, fetchMessagesForContact, permissions, user]
);

 const deleteChat = useCallback(
  async (contact) => {
    if (!permissions?.canDeleteChats) {
      toast.error("You do not have permission to delete chats.");
      return;
    }

    const contactId = contact.contact_id;
    const customerId = user?.customer_id;

    if (!contactId || !customerId) {
      toast.error("Invalid contact or user data.");
      return;
    }

    if (selectedContact?.contact_id === contactId) {
      setSelectedConversationId(null);
    }

    try {
      const response = await axios.delete(
        API_ENDPOINTS.CHAT.DELETE_CONVERSATION,
        {
          data: {
            contact_ids: [contactId],   
            customer_id: customerId,
          },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200 && response.data.success) {
        fetchedConversations.current.delete(contactId);
        setContacts((prev) =>
          prev.filter((c) => c.contact_id !== contactId)
        );
        setSelectedContact(null);
        setMessages([]);
        fetchContacts();
        toast.success("Chat deleted successfully");
      } else {
        toast.error("Failed to delete chat: " + response.data.message);
      }
    } catch (err) {
      console.error("❌ Error deleting chat:", err);
      toast.error("Something went wrong while deleting the chat.");
    }
  },
  [
    user?.customer_id,
    setContacts,
    setMessages,
    setSelectedContact,
    permissions,
    fetchContacts,
  ]
);


  return {
    fetchContacts,
    fetchMessagesForContact,
    selectContact,
    sendMessage,
    deleteChat,
    setupChatEventListener,
    updateBlockStatus,
  };
};