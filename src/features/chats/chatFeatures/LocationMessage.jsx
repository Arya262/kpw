import { useState } from "react";
import { MapPin } from "lucide-react";
import MessageBubble from "./MessageBubble";

const LocationMessage = ({ msg, sent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const lat = msg?.location?.lat;
  const lng = msg?.location?.lng;
  const hasLocation = lat !== undefined && lng !== undefined;

  const mapUrl = hasLocation 
    ? `https://www.google.com/maps?q=${lat},${lng}&output=embed`
    : null;

  return (
    <>
      <MessageBubble sent={sent} timestamp={msg.sent_at} status={msg.status} noPadding maxWidth="65%">
        {hasLocation ? (
          <div 
            className="cursor-pointer overflow-hidden rounded-lg"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="relative w-full h-[200px] bg-gray-200">
              <iframe
                src={mapUrl}
                className="w-full h-full"
                loading="lazy"
                title="Location"
              />
              <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
            </div>
            <div className="px-3 py-2 flex items-center gap-2">
              <MapPin size={16} className="text-gray-600" />
              <span className="text-[14.2px] text-gray-900">Location</span>
            </div>
          </div>
        ) : (
          <div className="px-3 py-2">
            <p className="text-[14.2px] text-gray-500">Location not available</p>
          </div>
        )}
      </MessageBubble>

      {/* Fullscreen Map Modal */}
      {isModalOpen && hasLocation && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
          >
            ×
          </button>
          <iframe
            src={mapUrl}
            className="w-[90vw] h-[90vh] rounded-lg"
            title="Location Full View"
          />
        </div>
      )}
    </>
  );
};

export default LocationMessage;
