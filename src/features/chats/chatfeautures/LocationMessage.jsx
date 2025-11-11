import { useState } from "react";
import { Check, CheckCheck } from "lucide-react";

const LocationMessage = ({ msg, sent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLocationClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Optional chaining + fallback in case location is missing
  const lat = msg?.location?.lat;
  const lng = msg?.location?.lng;
  const hasLocation = lat !== undefined && lng !== undefined;

  return (
    <div className={`relative flex ${sent ? "justify-end" : "justify-start"} mb-1`}>
      {hasLocation ? (
        <div
          className={`relative bg-white rounded-lg overflow-hidden shadow-sm max-w-[65%] cursor-pointer`}
          onClick={handleLocationClick}
        >
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${lat},${lng}`}
            className="w-full h-40"
            allowFullScreen
            title="Location"
          ></iframe>

          {/* Message Tail */}
          <div
            className={`absolute top-0 ${
              sent ? "right-[-8px]" : "left-[-8px]"
            } w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ${
              sent ? "border-l-[8px] border-l-[#d9fdd3]" : "border-r-[8px] border-r-white"
            }`}
          ></div>

          {/* Timestamp and Status */}
          <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-black/30 px-2 py-1 rounded-full">
            <span className="text-[10px] text-white">{msg.sent_at}</span>
            {sent && (
              <span className="text-white">
                {msg.status === "read" ? <CheckCheck size={12} /> : <Check size={12} />}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className={`relative bg-white rounded-lg p-4 max-w-[65%] shadow-sm`}>
          <p className="text-gray-500">Location not available.</p>
          
          {/* Message Tail */}
          <div
            className={`absolute top-0 ${
              sent ? "right-[-8px]" : "left-[-8px]"
            } w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ${
              sent ? "border-l-[8px] border-l-[#d9fdd3]" : "border-r-[8px] border-r-white"
            }`}
          ></div>

          {/* Timestamp and Status */}
          <div className="flex justify-end items-center space-x-1 mt-2">
            <span className="text-[10px] text-gray-600">{msg.sent_at}</span>
            {sent && (
              <span className="text-[#53bdeb]">
                {msg.status === "read" ? <CheckCheck size={12} /> : <Check size={12} />}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Location Modal */}
      {isModalOpen && hasLocation && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex justify-center items-center"
          onClick={handleCloseModal}
        >
          <div className="relative w-[90vw] h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${lat},${lng}`}
              className="w-full h-full"
              allowFullScreen
              title="Location"
            ></iframe>
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMessage;
