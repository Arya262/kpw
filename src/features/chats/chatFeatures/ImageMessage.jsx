import { useState } from "react";
import DOMPurify from "dompurify";
import MessageBubble from "./MessageBubble";
import { parseWhatsAppFormatting } from "./messageUtils";

const ImageMessage = ({ msg, sent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <>
      <MessageBubble sent={sent} timestamp={msg.sent_at} status={msg.status} noPadding maxWidth="65%">
        <div 
          className="cursor-pointer overflow-hidden rounded-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <img
            src={msg.media_url}
            alt={msg.content || "Image"}
            className="w-full max-h-[300px] object-cover"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          {msg.content && (
            <div className="px-3 py-2">
              <div
                className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words text-gray-900"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(parseWhatsAppFormatting(msg.content))
                }}
              />
            </div>
          )}
        </div>
      </MessageBubble>

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
          >
            ×
          </button>
          <img
            src={msg.media_url}
            alt={msg.content || "Full view"}
            className="max-w-[95%] max-h-[95vh] object-contain"
          />
        </div>
      )}
    </>
  );
};

export default ImageMessage;
