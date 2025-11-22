import { User, Phone } from "lucide-react";
import MessageBubble from "./MessageBubble";

const ContactMessage = ({ msg, sent }) => {
  const contact = msg?.contact;
  const name = contact?.name || "Unknown Contact";
  const phone = contact?.phone || "N/A";

  return (
    <MessageBubble sent={sent} timestamp={msg.sent_at} status={msg.status} maxWidth="65%">
      <div className="flex items-start gap-3">
        {/* Contact Avatar */}
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={20} className="text-gray-600" />
        </div>

        {/* Contact Info */}
        <div className="flex-1">
          <p className="text-[14.2px] font-medium text-gray-900">{name}</p>
          {phone !== "N/A" ? (
            <a
              href={`tel:${phone}`}
              className="text-[13px] text-[#00a5f4] hover:underline flex items-center gap-1 mt-0.5"
            >
              <Phone size={12} />
              {phone}
            </a>
          ) : (
            <p className="text-[13px] text-gray-500 mt-0.5">Phone not available</p>
          )}
        </div>
      </div>
    </MessageBubble>
  );
};

export default ContactMessage;
