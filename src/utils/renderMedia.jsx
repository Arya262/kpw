import React from "react";
import { API_ENDPOINTS } from "../config/api";
import { FileText, AlertCircle } from "lucide-react";

export const renderMedia = (template) => {
  if (!template) return null;
  
  // Skip rendering preview for TEXT template type
  const type = template.template_type?.toUpperCase();
  if (type === 'TEXT') return null;

  const fullUrl =
    template.mediaUrl ||
    (template.media_url ? API_ENDPOINTS.TEMPLATES.GET_URL(template.media_url) : null);
  // console.log("🖼️ renderMedia → fullUrl:", fullUrl, "template:", template);

  if (!fullUrl) return null;
  const containerClass = "w-full rounded-lg overflow-hidden mb-2";
  const altText = template.element_name || "Template media";

  try {
    switch (type) {
      case "IMAGE":
        return (
          <img
            src={fullUrl}
            alt={altText}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = "/fallbacks/default.jpg";
              e.target.onerror = null;
            }}
            loading="lazy"
          />
        );

      case "VIDEO":
      case "VIDEO_TEMPLATE":
        return (
          <div className={`${containerClass} h-48`}>
            <video
              src={fullUrl}
              className="w-full h-full object-contain bg-black"
              controls
              controlsList="nodownload"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case "DOCUMENT":
      case "DOCUMENT_TEMPLATE":
        const isPdf = fullUrl.toLowerCase().endsWith(".pdf");

        return (
          <div className={`${containerClass} flex flex-col p-4 text-center`}>
            <FileText className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 truncate max-w-full">{altText}</p>
            <p className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm">
              {isPdf ? "PDF Document" : "Document"}
            </p>
          </div>
        );

      default:
        // ✅ Detect extension
        const extension = fullUrl.split(".").pop()?.toLowerCase();
        const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
        const videoExtensions = ["mp4", "webm", "ogg"];

        if (imageExtensions.includes(extension)) {
          return (
            <img
              src={fullUrl}
              alt={altText}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = "/fallbacks/default.jpg";
                e.target.onerror = null;
              }}
              loading="lazy"
            />
          );
        } else if (videoExtensions.includes(extension)) {
          return (
            <div className={`${containerClass} h-48`}>
              <video
                src={fullUrl}
                className="w-full h-full object-contain bg-black"
                controls
                controlsList="nodownload"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          );
        }

        // ✅ No fallback UI if not supported → return nothing
        return null;
    }
  } catch (error) {
    console.error("Error rendering media:", error);
    return (
      <div className={`${containerClass} flex flex-col text-center p-4`}>
        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-sm text-red-600">Failed to load media</p>
      </div>
    );
  }
};
