import { Check, CheckCheck } from "lucide-react";

const ContactMessage = ({ msg, sent }) => {
  const contact = msg?.contact;
  const name = contact?.name ?? "Unknown";
  const phone = contact?.phone ?? "N/A";

  return (
    <div className={`relative flex ${sent ? "justify-end" : "justify-start"}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow max-w-[80%] sm:max-w-[40%]">
        <div className="p-3">
          {/* Contact Name */}
          <p className="text-sm font-semibold">{name}</p>

          {/* Contact Phone */}
          <p className="text-xs text-gray-600">
            {phone !== "N/A" ? (
              <a
                href={`tel:${phone}`}
                className="text-blue-500 hover:underline"
              >
                {phone}
              </a>
            ) : (
              "Phone not available"
            )}
          </p>
        </div>
      </div>

      {/* Sent Timestamp & Status */}
      <div className="flex justify-end items-center gap-1 px-2 py-1 mt-1">
        <span className="text-[10px] text-gray-600">{msg?.sent_at}</span>
        {sent && (
          <span className="text-blue-500">
            {msg?.status === "read" ? (
              <CheckCheck size={12} />
            ) : (
              <Check size={12} />
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default ContactMessage;