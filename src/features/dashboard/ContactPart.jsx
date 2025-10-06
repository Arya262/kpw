import React, { useEffect, useState } from "react";
import Avatar from  "../../utils/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useChatLogic } from "../../hooks/useChatLogic"; 

const ContactPart = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Use fetchContacts from your hook
  const { fetchContacts } = useChatLogic({ user, contacts, setContacts });

  useEffect(() => {
    const loadContacts = async () => {
      if (!user?.customer_id) return;
      setLoading(true);
      await fetchContacts(); 
      setLoading(false);
    };

    loadContacts();
  }, [user?.customer_id, fetchContacts]);

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
                key={contact.contact_id}
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
