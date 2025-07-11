import { useCallback } from "react";
import axios from "axios";
import { API_BASE, API_ENDPOINTS } from "../config/api";

export const useChatLogic = ({
  user,
  socket,
  selectedContact,
  setSelectedContact,
  setMessages,
  setContacts,
  contacts,
}) => {
  // ✅ Mark messages as read (server-side)
  const markAllAsRead = useCallback(async (conversationId) => {
    try {
      await axios.post(API_ENDPOINTS.CHAT.MARK_AS_READ, {
        conversation_id: conversationId,
      });
    } catch (err) {
      console.error("❌ Failed to mark messages as read:", err);
    }
  }, []);

  // ✅ Fetch contacts and enrich with last message
  const fetchContacts = useCallback(async () => {
    if (!user?.customer_id) return;

    try {
      const response = await axios.get(
        `${API_ENDPOINTS.CHAT.CONVERSATIONS}?customer_id=${user.customer_id}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const enriched = await Promise.all(
        response.data.map(async (c) => {
          let lastMessage = null;
          let lastMessageType = null;
          let lastMessageTime = c.updated_at;

          if (c.conversation_id) {
            try {
              const messagesResponse = await axios.get(
                `${API_ENDPOINTS.CHAT.MESSAGES}?conversation_id=${c.conversation_id}`,
                {
                  headers: { "Content-Type": "application/json" },
                  withCredentials: true,
                }
              );

              const messages = messagesResponse.data;
              if (messages?.length > 0) {
                const latest = messages[messages.length - 1];
                lastMessage = latest.content || latest.element_name;
                lastMessageType = latest.message_type;
                lastMessageTime = latest.sent_at;
              }
            } catch (err) {
              console.error("❌ Error fetching messages:", err);
            }
          }

          return {
            id: c.customer_id,
            conversation_id: c.conversation_id,
            name: `${c.first_name} ${c.last_name || ""}`.trim(),
            mobile_no: c.mobile_no,
            image: c.profile_image,
            updated_at: c.updated_at,
            active: false,
            lastMessage,
            lastMessageType,
            lastMessageTime,
            unreadCount: c.unread_count || 0,
          };
        })
      );

      const sorted = enriched.sort(
        (a, b) =>
          new Date(b.lastMessageTime || b.updated_at) -
          new Date(a.lastMessageTime || a.updated_at)
      );

      setContacts(sorted);
    } catch (error) {
      console.error("❌ Failed to fetch contacts:", error);
    }
  }, [user?.customer_id, setContacts]);

  // ✅ Fetch messages and reset unread count
  const fetchMessagesForContact = useCallback(
    async (conversationId) => {
      if (!conversationId) return;

      try {
        const response = await axios.get(
          `${API_ENDPOINTS.CHAT.MESSAGES}?conversation_id=${conversationId}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        const messages = response.data;
        setMessages(messages || []);

        // ✅ Mark as read on server
        markAllAsRead(conversationId);

        const latest = messages?.[messages.length - 1] || {};

        setContacts((prev) =>
          prev.map((c) =>
            c.conversation_id === conversationId
              ? {
                  ...c,
                  lastMessage: latest.content || latest.element_name || c.lastMessage,
                  lastMessageType: latest.message_type || c.lastMessageType,
                  lastMessageTime: latest.sent_at || c.lastMessageTime,
                  unreadCount: 0, // ✅ Always reset to 0
                }
              : c
          )
        );
      } catch (err) {
        console.error("❌ Failed to fetch messages:", err);
      }
    },
    [setMessages, setContacts, markAllAsRead]
  );

  // ✅ Select contact
  const selectContact = useCallback(
    (contact) => {
      if (!contact) return;

      setSelectedContact(contact);

      setContacts((prev) =>
        prev.map((c) =>
          c.conversation_id === contact.conversation_id
            ? { ...c, active: true, unreadCount: 0 }
            : { ...c, active: false }
        )
      );

      if (contact.conversation_id) {
        fetchMessagesForContact(contact.conversation_id);
        socket?.emit("join_conversation", String(contact.conversation_id));
      } else {
        setMessages([]);
      }
    },
    [socket, fetchMessagesForContact, setSelectedContact, setContacts, setMessages]
  );

  // ✅ Handle incoming message
  const handleIncomingMessage = useCallback(
    (msg) => {
      setContacts((prev) =>
        prev.map((c) => {
          if (c.conversation_id === msg.conversation_id) {
            const isActive = selectedContact?.conversation_id === c.conversation_id;

            return {
              ...c,
              lastMessage: msg.content || msg.element_name,
              lastMessageType: msg.message_type,
              lastMessageTime: msg.sent_at,
              unreadCount: isActive ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        })
      );

      if (selectedContact?.conversation_id === msg.conversation_id) {
        setMessages((prev) => [...prev, msg]);
      }
    },
    [setContacts, setMessages, selectedContact]
  );

  // ✅ Setup socket listener
  const setupSocketListener = useCallback(() => {
    if (!socket) return;
    socket.on("newMessage", handleIncomingMessage);
    return () => {
      socket.off("newMessage", handleIncomingMessage);
    };
  }, [socket, handleIncomingMessage]);

  // ✅ Send message
  const sendMessage = useCallback(
    async (input) => {
      if (!selectedContact?.conversation_id) return;

      const newMessage = { conversation_id: selectedContact.conversation_id };
      let messageType = "text";

      if (typeof input === "string") {
        newMessage.message = input;
      } else if (input.template_name) {
        newMessage.element_name = input.template_name;
        messageType = "template";
      } else {
        console.warn("Invalid message input");
        return;
      }

      try {
        await axios.post(`${API_BASE}/sendmessage`, newMessage);
        fetchMessagesForContact(selectedContact.conversation_id);

        setContacts((prev) =>
          prev
            .map((c) =>
              c.conversation_id === selectedContact.conversation_id
                ? {
                    ...c,
                    lastMessage:
                      typeof input === "string"
                        ? input
                        : input.template_name,
                    lastMessageType: messageType,
                    lastMessageTime: new Date().toISOString(),
                    unreadCount: 0,
                  }
                : c
            )
            .sort(
              (a, b) =>
                new Date(b.lastMessageTime || b.updated_at) -
                new Date(a.lastMessageTime || a.updated_at)
            )
        );
      } catch (err) {
        console.error("❌ Error sending message:", err);
      }
    },
    [selectedContact, setContacts, fetchMessagesForContact]
  );

  // ✅ Delete chat
  const deleteChat = useCallback(
    async (contact) => {
      const conversationId = contact.conversation_id;
      const customerId = user?.customer_id;

      if (!conversationId || !customerId) return;

      if (window.confirm(`Delete chat with ${contact.name}?`)) {
        try {
          const response = await axios.delete(
            API_ENDPOINTS.CHAT.DELETE_CONVERSATION,
            {
              data: {
                conversation_ids: [conversationId],
                customer_id: customerId,
              },
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );

          const result = response.data;
          if (response.status === 200 && result.success) {
            setContacts((prev) =>
              prev.filter((c) => c.conversation_id !== conversationId)
            );
            setSelectedContact(null);
            setMessages([]);
          } else {
            alert("Failed to delete chat: " + result.message);
          }
        } catch (err) {
          console.error("❌ Error deleting chat:", err);
          alert("Something went wrong while deleting the chat.");
        }
      }
    },
    [user?.customer_id, setContacts, setMessages, setSelectedContact]
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
