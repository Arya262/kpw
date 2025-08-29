import React, { useEffect, useState } from "react";
import { Avatar } from "../chats/chatSiderbar";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

const ContactPart = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user?.customer_id) return;

      try {
        const response = await axios.get(
          `${API_ENDPOINTS.CHAT.CONVERSATIONS}?customer_id=${user.customer_id}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        const enriched = response.data.map((c) => ({
          id: c.customer_id,
          conversation_id: c.conversation_id,
          name: `${c.first_name} ${c.last_name || ""}`.trim(),
          country_code: c.country_code,
          mobile_no: c.mobile_no,
          image: c.profile_image,
          updated_at: c.updated_at,
          active: false,
          lastMessageTime: c.updated_at,
        }));
        const topUsers = enriched
          .sort(
            (a, b) =>
              new Date(b.lastMessageTime || b.updated_at || 0) -
              new Date(a.lastMessageTime || a.updated_at || 0)
          )
          .slice(0, 5);

        setContacts(topUsers);
      } catch (error) {
        console.error("❌ Failed to fetch contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [user?.customer_id]);

  return (
    <div className="col-span-1 rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:scale-105 transition-transform duration-200 h-80">
      <h1 className="font-semibold text-xl px-3 pb-2 border-b border-gray-200">
        Top Users
      </h1>
      <div className="w-full h-full flex flex-col py-4">
        <div className="space-y-1 overflow-y-auto flex-1 scrollbar-hide mb-3 border p-2 border-gray-200 rounded-lg shadow-sm">
          {loading ? (
            <p className="text-center text-gray-400 text-sm mt-4">Loading...</p>
          ) : contacts.length > 0 ? (
            contacts.map((contact) => (
              <div
                key={contact.conversation_id}
                role="listitem"
                tabIndex={0}
                className="flex items-center px-2 py-1 w-full max-w-full border-b border-gray-200"
              >
                <div className="shrink-0">
                  <Avatar name={contact.name} image={contact.image} />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex justify-between items-start space-x-2">
                    <p className="font-semibold text-sm text-gray-700 truncate">
                      {contact.name || "Unnamed"}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {contact.mobile_no}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 text-sm mt-4">
              No contacts found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPart;
