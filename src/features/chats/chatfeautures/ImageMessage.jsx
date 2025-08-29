import { useState, useEffect } from "react";
import MessageStatusIcon from "./MessageStatusIcon";

const ImageMessage = ({ msg, sent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fullImageLoaded, setFullImageLoaded] = useState(false);

  const handleDownloadClick = () => {
    setIsDownloading(true);
    const img = new Image();
    img.src = msg.media_url;
    img.onload = () => {
      setFullImageLoaded(true);
      setIsDownloading(false);
    };
    img.onerror = () => {
      setHasImageError(true);
      setIsDownloading(false);
    };
  };

  const handleImageClick = () => {
    if (!hasImageError && fullImageLoaded) setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const bubbleBg = sent ? "#dcf8c6" : "#f0f0f0";
  const tailAlignment = sent ? "right-[-4px]" : "left-[-4px]";

  return (
    <div className={`relative flex ${sent ? "justify-end" : "justify-start"} px-2 mb-4`}>
      <div className="relative max-w-[60%] min-w-[150px]">
        {/* Tail */}
        <svg
          className={`absolute top-1 ${tailAlignment}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <path d="M0 0 Q10 20 20 0" fill={bubbleBg} />
        </svg>

        {/* Image Bubble */}
        <div
          className="relative rounded-2xl overflow-hidden shadow cursor-pointer"
          style={{ backgroundColor: bubbleBg }}
          onClick={handleImageClick}
        >
          {/* Placeholder / Blurred Preview / Download Button */}
          {!fullImageLoaded && !hasImageError && (
            <div className="w-full h-[200px] relative flex justify-center items-center">
              {/* Blurred Placeholder */}
              <img
                src={msg.preview_base64 || "https://placehold.co/50x50?text=Loading"}
                alt="Image preview"
                className="w-full h-full object-cover filter blur-md"
                style={{ transition: "filter 0.3s ease, opacity 0.5s ease" }}
              />
              {/* Download Button Overlay */}
              <button
                onClick={handleDownloadClick}
                className="absolute bg-white text-black px-3 py-1 rounded shadow"
                aria-label={isDownloading ? "Downloading image" : "Download image"}
              >
                {isDownloading ? "Downloading..." : "Download"}
              </button>
            </div>
          )}

          {/* Full Image */}
          {fullImageLoaded && !hasImageError && (
            <img
              src={msg.media_url}
              alt={msg.content || "Sent image"}
              className="w-full object-cover max-h-[300px] transition-opacity duration-500 opacity-100"
              loading="lazy"
            />
          )}

          {/* Error Fallback */}
          {hasImageError && (
            <img
              src="https://placehold.co/150?text=Image+Not+Found"
              alt="Image not found"
              className="w-full object-cover max-h-[300px]"
            />
          )}

          {/* Timestamp & Status */}
          {fullImageLoaded && !hasImageError && (
            <div className="absolute bottom-1 right-2 flex items-center gap-1 bg-black bg-opacity-50 px-1 py-[1px] rounded">
              <span className="text-[10px] text-white">{msg.sent_at}</span>
              {sent && <MessageStatusIcon status={msg.status} />}
            </div>
          )}
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
              src={hasImageError ? "https://placehold.co/150?text=Image+Not+Found" : msg.media_url}
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