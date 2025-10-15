import { useState, useEffect } from "react";
import MessageStatusIcon from "./MessageStatusIcon";

const ImageMessage = ({ msg, sent, allMedia = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fullImageLoaded, setFullImageLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    if (fullImageLoaded) {
      const index = allMedia.findIndex((m) => m.id === msg.id);
      setCurrentIndex(index >= 0 ? index : 0);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0));
  };

  const currentMedia = allMedia[currentIndex] || msg;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
      if (e.key === "ArrowLeft") handlePrev(e);
      if (e.key === "ArrowRight") handleNext(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allMedia]);

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
          {/* Before Download: Blurred Preview + Download Button */}
          {!fullImageLoaded && (
            <div className="relative w-full h-[200px] flex justify-center items-center bg-black">
              <img
                src={msg.media_url}
                alt="Image blurred preview"
                className="w-full h-full object-cover filter blur-lg brightness-50"
              />
              <button
                onClick={handleDownloadClick}
                className="absolute bg-white rounded-full p-3 shadow"
                aria-label={isDownloading ? "Downloading image" : "Download image"}
              >
                {isDownloading ? (
                  <span className="text-sm font-semibold">...</span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="black"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0-8l-4 4m4-4l4 4"
                    />
                  </svg>
                )}
              </button>
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
              className="w-full object-cover max-h-[300px] transition-opacity duration-500"
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

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col"
          onClick={handleCloseModal}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 text-white">
            <div>
              <h2 className="text-base font-medium">{msg.sender_name || "Contact"}</h2>
              <p className="text-xs text-gray-300">{currentMedia.sent_at}</p>
            </div>
            <button
              onClick={handleCloseModal}
              className="text-white text-2xl leading-none hover:text-gray-400"
            >
              ✕
            </button>
          </div>

          {/* Image Display */}
          <div className="flex-1 flex justify-center items-center relative select-none">
            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-4 text-white text-4xl opacity-70 hover:opacity-100"
            >
              ❮
            </button>

            <img
              src={currentMedia.media_url}
              alt={currentMedia.content || "Full view"}
              className="max-w-[95%] max-h-[85vh] object-contain rounded-md"
            />

            <button
              onClick={handleNext}
              className="absolute right-4 text-white text-4xl opacity-70 hover:opacity-100"
            >
              ❯
            </button>
          </div>

          {/* Thumbnail Bar */}
          <div
            className="flex justify-center gap-2 py-2 bg-black bg-opacity-70 overflow-x-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {allMedia.map((m, i) => (
              <img
                key={m.id}
                src={m.media_url}
                alt="thumb"
                onClick={() => setCurrentIndex(i)}
                className={`w-14 h-14 object-cover rounded cursor-pointer ${
                  i === currentIndex ? "border-2 border-white" : "opacity-70"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageMessage;
