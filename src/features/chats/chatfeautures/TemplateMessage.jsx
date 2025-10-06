import MessageStatusIcon from "./MessageStatusIcon";
import { API_ENDPOINTS } from "../../../config/api";

const TemplateMessage = ({ msg, sent }) => {
//  console.log("📩 Full message payload from backend:", msg);
  const meta = msg.container_meta;

  const bubbleBg = sent ? "rgba(220, 248, 198, 0.5)" : "rgba(240, 240, 240, 0.5)";
  const tailAlignment = sent ? "right-[-4px]" : "left-[-4px]";
  const tailPath = sent ? "M0 0 Q10 20 20 0" : "M20 0 Q10 20 0 0";

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
  // Get the main media file from msg or meta
  const mediaFile =
  msg?.media_url ||
  msg?.mediaUrl ||
  meta?.mediaUrl ||
  meta?.media_url ||
  getVideoFromTemplate();

  // Detect media type by file extension
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaFile);
  const isVideo = /\.mp4$/i.test(mediaFile);
  const isDocument = mediaFile && !isImage && !isVideo;

  // File metadata
  const fileName = meta?.fileName || (mediaFile ? mediaFile.split("/").pop() : "");
  const fileSize = meta?.fileSize || "Unknown size";
  const fileType = meta?.fileType || "Document";

  const renderMediaFile = () => {
    if (isVideo) {
      return (
        <video
          src={getMediaUrl(mediaFile)}
          controls
          className="w-full max-h-[250px] object-cover rounded"
          onError={(e) => console.error("Video load error:", e.target.src)}
        />
      );
    }
    if (isImage) {
      return (
        <img
  src={getMediaUrl(mediaFile)}
  alt="Banner"
  className="w-full max-h-[250px] object-cover rounded"
  onError={(e) => console.error("Image load error:", e.target.src)}
/>
      );
    }
    if (isDocument) {
      return (
        <div className="w-full h-40 rounded overflow-hidden relative bg-gray-200 flex items-center justify-center">
          {meta?.docPreview ? (
            <img
              src={meta.docPreview}
              alt={fileName}
              className="w-full max-h-[250px] object-cover rounded"
            />
          ) : (
            <span className="text-gray-600">{fileName}</span>
          )}
          <a
            href={getMediaUrl(mediaFile)}
            rel="noopener noreferrer"
            className="absolute inset-0"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative flex ${sent ? "justify-end" : "justify-start"} px-2 mb-2`}>
      <div className="relative w-full max-w-[85%] sm:max-w-[70%] md:max-w-[55%] lg:max-w-[40%]">
        {/* Tail */}
        <svg className={`absolute bottom-0 ${tailAlignment}`} width="20" height="20" viewBox="0 0 20 20">
          <path d={tailPath} fill={bubbleBg} />
        </svg>

        {/* Bubble */}
        <div
           className="w-full rounded-2xl overflow-hidden shadow-md text-sm flex flex-col"
          style={{ backgroundColor: bubbleBg }}
        >
          {meta ? (
            <>
              {/* Media */}
              {renderMediaFile()}

              {/* Main Content */}
              <div className="flex flex-col justify-between h-full p-3 space-y-2">
                {meta.header && (
                  <p className="text-base font-semibold text-red-600">{meta.header}</p>
                )}

                {meta.data && (
                  <p className="text-sm text-gray-800 whitespace-pre-line break-words">
                    {fillPlaceholders(meta.data, parameters)}
                  </p>
                )}

                {Array.isArray(meta.buttons) && meta.buttons.length > 0 && (
                  <div className="flex flex-col space-y-1">
                    {meta.buttons.map((btn, i) => (
                      <button
                        key={i}
                        className="w-full bg-[#0AA89E] text-white py-1.5 rounded text-sm font-medium transition cursor-pointer"
                      >
                        {btn.text}
                      </button>
                    ))}
                  </div>
                )}

                {meta.footer && (
                  <p className="text-xs text-gray-400 pt-1 border-t border-gray-200">{meta.footer}</p>
                )}
              </div>
            </>
          ) : (
            <div className="p-3">
              <p className="text-gray-500 italic">No template available.</p>
              {msg.data && (
                <pre className="text-xs text-gray-700 whitespace-pre-wrap mt-2 bg-white p-2 rounded">
                  {msg.data}
                </pre>
              )}
            </div>
          )}

          {/* Time & Status */}
          <div className={`flex items-center gap-1 px-3 pb-2 ${sent ? "justify-end" : "justify-start"}`}>
            <span className="text-[10px] text-gray-500">{msg.sent_at}</span>
            {sent && <MessageStatusIcon status={msg.status} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateMessage;
