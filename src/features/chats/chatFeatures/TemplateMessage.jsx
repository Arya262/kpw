import DOMPurify from "dompurify";
import MessageBubble from "./MessageBubble";
import { parseWhatsAppFormatting } from "./messageUtils";
import { API_ENDPOINTS } from "../../../config/api";

const TemplateMessage = ({ msg, sent }) => {
  const meta = msg.container_meta;

  const bodyComponent = msg?.template_data?.template?.components?.find(
    (component) => component.type === "body"
  );
  const parameters = bodyComponent?.parameters || [];

  const fillPlaceholders = (template, parameters = []) =>
    template.replace(/\{\{(\d+)\}\}/g, (_, index) => {
      const paramIndex = parseInt(index, 10) - 1;
      return parameters[paramIndex]?.text || `{{${index}}}`;
    });

  const getMediaUrl = (urlOrFile) => {
    if (!urlOrFile) return null;
    return urlOrFile.startsWith("http") ? urlOrFile : API_ENDPOINTS.TEMPLATES.GET_URL(urlOrFile);
  };

  const getVideoFromTemplate = () => {
    const templateComponents = msg?.template_data?.template?.components || [];
    for (let comp of templateComponents) {
      for (let param of comp.parameters || []) {
        if (param.video?.link) return param.video.link;
      }
    }
    return "";
  };

  const mediaFile =
    msg?.media_url ||
    msg?.mediaUrl ||
    meta?.mediaUrl ||
    meta?.media_url ||
    getVideoFromTemplate();

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaFile);
  const isVideo = /\.mp4$/i.test(mediaFile);

  return (
    <MessageBubble sent={sent} timestamp={msg.sent_at} status={msg.status} noPadding maxWidth="70%">
      {meta ? (
        <>
          {/* Media Header */}
          {mediaFile && (
            <div className="overflow-hidden">
              {isVideo ? (
                <video
                  src={getMediaUrl(mediaFile)}
                  controls
                  className="w-full max-h-[250px] object-cover"
                />
              ) : isImage ? (
                <img
                  src={getMediaUrl(mediaFile)}
                  alt="Template media"
                  className="w-full max-h-[250px] object-cover"
                />
              ) : null}
            </div>
          )}

          {/* Content */}
          <div className="px-3 py-2 space-y-2">
            {/* Header Text */}
            {meta.header && (
              <p className="text-[15px] font-semibold text-gray-900">{meta.header}</p>
            )}

            {/* Body Text */}
            {meta.data && (
              <div
                className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words text-gray-900"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(parseWhatsAppFormatting(fillPlaceholders(meta.data, parameters)))
                }}
              />
            )}

            {/* Footer */}
            {meta.footer && (
              <p className="text-[13px] text-gray-500">{meta.footer}</p>
            )}
          </div>

          {/* Buttons */}
          {Array.isArray(meta.buttons) && meta.buttons.length > 0 && (
            <div className="border-t border-gray-200">
              {meta.buttons.map((btn, i) => (
                <button
                  key={i}
                  className="w-full px-3 py-2.5 text-[14.2px] font-medium text-[#00a5f4] hover:bg-gray-50 transition-colors text-center border-b border-gray-200 last:border-b-0"
                >
                  {btn.text}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="px-3 py-2">
          <p className="text-[14.2px] text-gray-500 italic">Template not available</p>
        </div>
      )}
    </MessageBubble>
  );
};

export default TemplateMessage;
