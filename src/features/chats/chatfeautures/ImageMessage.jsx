import { useState, useEffect } from "react";
import MessageStatusIcon from "./MessageStatusIcon";

const ImageMessage = ({ msg, sent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsDownloading(false);
    };
  };

  const handleImageClick = () => {
    if (fullImageLoaded) setIsModalOpen(true);
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
          {/* Before Download: Blurred Actual Image + Download Button */}
          {!fullImageLoaded && (
            <div className="relative w-full h-[200px] flex justify-center items-center bg-black">
              <img
                src={msg.media_url}
                alt="Image blurred preview"
                className="w-full h-full object-cover filter blur-lg brightness-50"
                style={{ transition: "filter 0.3s ease, opacity 0.5s ease" }}
              />
              {/* Download Button */}
              <button
                onClick={handleDownloadClick}
                className="absolute bg-white rounded-full p-3 shadow"
                aria-label={isDownloading ? "Downloading image" : "Download image"}
              >
                {isDownloading ? (
                  <span className="text-sm font-semibold">...</span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="black">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0-8l-4 4m4-4l4 4" />
                  </svg>
                )}
              </button>
              {/* Optional: File size */}
              {msg.size && (
                <span className="absolute bottom-3 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                  {(msg.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          )}

          {/* Full Image After Download */}
          {fullImageLoaded && (
            <img
              src={msg.media_url}
              alt={msg.content || "Sent image"}
              className="w-full object-cover max-h-[300px] transition-opacity duration-500 opacity-100"
              loading="lazy"
            />
          )}

          {/* Timestamp & Status */}
          {fullImageLoaded && (
            <div className="absolute bottom-1 right-2 flex items-center gap-1 bg-black bg-opacity-50 px-1 py-[1px] rounded">
              <span className="text-[10px] text-white">{msg.sent_at}</span>
              {sent && <MessageStatusIcon status={msg.status} />}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal - WhatsApp Style */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col justify-between"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Bar */}
          <div className="flex justify-between items-center px-4 py-3">
            <button
              onClick={handleCloseModal}
              className="text-white text-3xl font-light"
              aria-label="Close image modal"
            >
              &times;
            </button>
            <div className="flex gap-4 text-white text-xl">
              <button title="Download">⬇️</button>
              <button title="More">⋮</button>
            </div>
          </div>

          {/* Image Viewer */}
          <div className="flex justify-center items-center flex-1">
            <img
              src={msg.media_url}
              alt={msg.content || "Sent image"}
              className="max-w-[95%] max-h-[85%] object-contain rounded transition-transform duration-300 ease-in-out transform hover:scale-105"
            />
          </div>

          {/* Bottom Bar */}
          <div className="flex justify-between items-center px-4 py-2 bg-black bg-opacity-50">
            <span className="text-white text-sm">{msg.content || ""}</span>
            <span className="text-white text-xs">{msg.sent_at}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageMessage;
