import { useCallback, useRef, useEffect } from "react";
import axios from "axios";
import { API_BASE, API_ENDPOINTS } from "../config/api";
import { useNotifications } from "../context/NotificationContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const { markConversationAsRead, setSelectedConversationId } =
    useNotifications();
  const selectedContactRef = useRef(selectedContact);
  const fetchedConversations = useRef(new Set());

  
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  // WebSocket cleanup
  useEffect(() => {
    if (!socket) return;
    return () => {
      socket.disconnect();
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
    async ({ cursor = null, limit = 10 } = {}) => {
      if (!user?.customer_id) return;

      try {
        const url = new URL(`${API_BASE}/conversations`);
        url.searchParams.append("customer_id", user.customer_id);
        url.searchParams.append("limit", limit);
        if (cursor) url.searchParams.append("cursor", cursor);

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
        console.log(messages);

        if (!cursor) {
          // 🔹 First load → replace messages
          setMessages(messages);
          await markAllAsRead(contact_id);
          markConversationAsRead(contact_id);

          // Update contact last message preview
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

    console.log("Selecting contact:", {
      name: contact.name,
      contact_id: contact.contact_id,
      mobile_no: contact.mobile_no,
      currentContact: selectedContactRef.current,
    });

    if (!contact.contact_id) {
      console.log(`👆 New chat started with ${contact.name}`);
      setSelectedContact(contact);
      setMessages([]);
      return;
    }

    const currentContact = selectedContactRef.current;

    // Prevent re-selecting the same contact
    const isSameContact =
      currentContact &&
      ((currentContact.contact_id &&
        currentContact.contact_id === contact.contact_id) ||
        (currentContact.mobile_no &&
          contact.mobile_no &&
          currentContact.mobile_no === contact.mobile_no));

    if (isSameContact) {
      console.log(
        `⚠️ Contact ${contact.name} already selected, no new fetch.`
      );
      return;
    }

    console.log(
      `👆 New contact selected: ${contact.name} (ID: ${
        contact.contact_id || "new"
      }, Phone: ${contact.mobile_no || "none"})`
    );

    setSelectedContact(contact);

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
      console.log("Fetching messages for contact:", contact.contact_id);
      fetchMessagesForContact(contact.contact_id);
      socket?.emit("join_contact", String(contact.contact_id)); // renamed for clarity
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

const handleIncomingMessage = useCallback(
  (msg) => {
    const isFromSelectedChat =
      selectedContact?.contact_id === msg.contact_id;

    if (!isFromSelectedChat) {
      const contact = contacts.find((c) => c.contact_id === msg.contact_id);
      if (contact) {
        toast.info(`New message from ${contact.name}`);
      }
    }

    setContacts((prev) =>
      prev.map((c) => {
        if (c.contact_id === msg.contact_id) {
          return {
            ...c,
            lastMessage: msg.content || msg.element_name,
            lastMessageType: msg.message_type,
            lastMessageTime: msg.sent_at,
            unreadCount: isFromSelectedChat ? 0 : (c.unreadCount || 0) + 1,
          };
        }
        return c;
      })
    );

    if (isFromSelectedChat) {
      setMessages((prev) => [...prev, msg]);
      fetchedConversations.current.delete(msg.contact_id);
    }
  },
  [setContacts, setMessages, selectedContact, contacts]
);

  const setupSocketListener = useCallback(() => {
    if (!socket) return;
    socket.on("newMessage", handleIncomingMessage);
    return () => {
      socket.off("newMessage", handleIncomingMessage);
    };
  }, [socket, handleIncomingMessage]);



  

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
        if (input.language_code) {
          newMessage.language_code = input.language_code;
        }
      } else {
        console.warn("Invalid message input");
        return;
      }

      try {
        console.log("🚀 Sending message payload:", newMessage);
        const response = await axios.post(`${API_BASE}/sendmessage`, {
          ...newMessage,
          message_type: messageType,
        });

        // Update contact list preview
        fetchMessagesForContact(selectedContact.contact_id);
        setContacts((prev) =>
          prev
            .map((c) =>
                 c.contact_id === selectedContact.contact_id
                ? {
                    ...c,
                    lastMessage:
                      typeof input === "string" ? input : input.template_name,
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
    [selectedContact, setContacts, fetchMessagesForContact, permissions]
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
            contact_ids: [contactId],   // ✅ correct field
            customer_id: customerId,
          },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200 && response.data.success) {
        fetchedConversations.current.delete(contactId);
        setContacts((prev) =>
          prev.filter((c) => c.contact_id !== contactId)  // ✅ use contact_id
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
    setupSocketListener,
  };
};