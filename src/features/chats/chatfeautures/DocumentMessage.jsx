import { useState } from "react";
import {
  Check,
  CheckCheck,
  FileText,
  FileAudio,
  FileImage,
  FileVideo,
  FileArchive,
  File
} from "lucide-react";
import { formatFileSize } from "../../../utils/format";
import MessageStatusIcon from "./MessageStatusIcon";

// Determine icon based on file type
const getFileIcon = (fileName = "") => {
  const ext = fileName.split(".").pop().toLowerCase();
  if (["pdf", "doc", "docx", "txt"].includes(ext)) return <FileText size={20} className="text-gray-500" />;
  if (["mp3", "wav", "ogg"].includes(ext)) return <FileAudio size={20} className="text-gray-500" />;
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return <FileImage size={20} className="text-gray-500" />;
  if (["mp4", "mov", "avi"].includes(ext)) return <FileVideo size={20} className="text-gray-500" />;
  if (["zip", "rar", "7z"].includes(ext)) return <FileArchive size={20} className="text-gray-500" />;
  return <File size={20} className="text-gray-500" />;
};

const DocumentMessage = ({ msg, sent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const document = msg?.document || {};
  const name = document?.name || msg?.content || "Unnamed document";
  const url = document?.url || msg?.media_url || "#";
  const rawSize = document?.size || msg?.file_size;
  const size = formatFileSize(rawSize);

  const handleImageClick = () => {
    if (url) setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const bubbleBg = sent ? "#dcf8c6" : "#f0f0f0";
  const tailAlignment = sent ? "right-[-4px]" : "left-[-4px]";
  const tailPath = sent
    ? "M0 0 Q10 20 20 0" // Tail for right-side
    : "M20 0 Q10 20 0 0"; // Tail for left-side

  return (
    <div className={`relative flex ${sent ? "justify-end" : "justify-start"} px-2 mb-4`}>
      <div className="relative max-w-[60%]">
        {/* Tail */}
        <svg
          className={`absolute top-1 ${tailAlignment}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <path d={tailPath} fill={bubbleBg} />
        </svg>

        {/* Document Bubble */}
        <div className="rounded-2xl overflow-hidden shadow" style={{ backgroundColor: bubbleBg }}>
          <div className="p-3 flex items-start gap-3">
            {/* Icon */}
            <div className="pt-1">{getFileIcon(name)}</div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-sm font-semibold break-all">{name}</p>
              <p className="text-xs text-gray-600">{size}</p>
              <a
                href={url}
                download={name}
                className="text-blue-500 text-xs mt-1 block"
              >
                Download
              </a>

              {/* Preview button if image */}
              {url && url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                <button
                  onClick={handleImageClick}
                  className="text-blue-500 text-xs mt-1 block"
                >
                  Preview
                </button>
              )}
            </div>
          </div>

          {/* Time & Status inside bubble */}
          <div className="flex justify-end items-center space-x-1 px-3 pb-2">
            <span className="text-[10px] text-gray-500">{msg.sent_at}</span>
            {sent && <MessageStatusIcon status={msg.status} />}
          </div>
        </div>
      </div>

      {/* Modal Preview for images */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCloseModal}
        >
          <div className="bg-white p-4 rounded" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <button onClick={handleCloseModal} className="text-gray-500 font-bold">
                Close
              </button>
            </div>
            <img src={url} alt="Preview" className="max-w-[80vw] max-h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentMessage;
