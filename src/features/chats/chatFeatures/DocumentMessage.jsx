import { FileText, Download } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { formatFileSize } from "./messageUtils";

const DocumentMessage = ({ msg, sent }) => {
  const document = msg?.document || {};
  const name = document?.name || msg?.content || "Document";
  const url = document?.url || msg?.media_url || "#";
  const rawSize = document?.size || msg?.file_size;
  const size = formatFileSize(rawSize);

  return (
    <MessageBubble sent={sent} timestamp={msg.sent_at} status={msg.status} maxWidth="65%">
      <div className="flex items-start gap-3">
        {/* Document Icon */}
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <FileText size={20} className="text-gray-600" />
        </div>

        {/* Document Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14.2px] font-medium text-gray-900 truncate">{name}</p>
          <p className="text-[13px] text-gray-500">{size}</p>
        </div>

        {/* Download Button */}
        <a
          href={url}
          download={name}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors"
          aria-label="Download document"
        >
          <Download size={18} className="text-gray-600" />
        </a>
      </div>
    </MessageBubble>
  );
};

export default DocumentMessage;
