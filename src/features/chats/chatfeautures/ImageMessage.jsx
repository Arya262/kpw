import { useState, useEffect } from "react";
import MessageStatusIcon from "./MessageStatusIcon";

const ImageMessage = ({ msg, sent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  const handleImageClick = () => {
    if (!hasImageError) setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const bubbleBg = sent ? "#dcf8c6" : "#f0f0f0";
  const tailAlignment = sent ? "right-[-4px]" : "left-[-4px]";
  const tailPath = sent
    ? "M0 0 Q10 20 20 0" // Tail on right
    : "M20 0 Q10 20 0 0"; // Tail on left

  return (
    <div className={`relative flex ${sent ? "justify-end" : "justify-start"} px-2 mb-4`}>
      <div className="relative max-w-[60%]">
        {/* Tail SVG */}
        <svg
          className={`absolute top-1 ${tailAlignment}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <path d={tailPath} fill={bubbleBg} />
        </svg>

        {/* Image Bubble */}
        <div
          className="relative rounded-2xl overflow-hidden shadow cursor-pointer"
          style={{ backgroundColor: bubbleBg }}
          onClick={handleImageClick}
        >
          <img
            src={hasImageError ? "https://placehold.co/150?text=Image+Not+Found" : msg.media_url}
            alt={msg.content || "Sent image"}
            className="w-full object-cover max-h-[300px]"
            onError={() => setHasImageError(true)}
          />

          {/* Timestamp & Status Icon */}
          <div className="absolute bottom-1 right-2 flex items-center gap-1 bg-black bg-opacity-50 px-1 py-[1px] rounded">
            <span className="text-[10px] text-white">{msg.sent_at}</span>
            {sent && <MessageStatusIcon status={msg.status} />}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center"
          role="dialog"
          aria-modal="true"
          onClick={handleCloseModal}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={msg.media_url}
              alt={msg.content || "Sent image"}
              className="max-w-[90%] max-h-[90%] object-contain rounded transition duration-300 ease-in-out transform hover:scale-105"
            />
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white text-xl"
              aria-label="Close image modal"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageMessage;
