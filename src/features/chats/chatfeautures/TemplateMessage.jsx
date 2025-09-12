import MessageStatusIcon from "./MessageStatusIcon";

const TemplateMessage = ({ msg, sent }) => {
  const meta = msg.container_meta;

  const bubbleBg = sent ? "rgba(220, 248, 198, 0.5)" : "rgba(240, 240, 240, 0.5)";
  const tailAlignment = sent ? "right-[-4px]" : "left-[-4px]";
  const tailPath = sent ? "M0 0 Q10 20 20 0" : "M20 0 Q10 20 0 0";

  const bodyComponent = msg?.template_data?.template?.components?.find(
    (component) => component.type === "body"
  );
  const parameters = bodyComponent?.parameters || [];

  const fillPlaceholders = (template, parameters = []) => {
    return template.replace(/\{\{(\d+)\}\}/g, (_, index) => {
      const paramIndex = parseInt(index, 10) - 1;
      return parameters[paramIndex]?.text || `{{${index}}}`;
    });
  };

  const headerComponent = msg?.template_data?.template?.components?.find(
    (component) => component.type === "header"
  );
  const templateParam = headerComponent?.parameters?.[0] || {};
  const imageUrl = templateParam.image?.link || meta?.mediaUrl || meta?.headerValue;
  const videoUrl = templateParam.video?.link || meta?.videoUrl;
  const docUrl = templateParam.document?.link || meta?.documentUrl;

  // File metadata
  const fileName = meta?.fileName || (docUrl ? docUrl.split("/").pop() : "");
  const fileSize = meta?.fileSize || "Unknown size";
  const fileType = meta?.fileType || "Document";

  return (
    <div className={`relative flex ${sent ? "justify-end" : "justify-start"} px-2 mb-2`}>
      {/* ✅ WhatsApp-style width container */}
      <div className="relative w-fit max-w-[75%] md:max-w-[35%]">
        {/* Tail */}
        <svg
          className={`absolute bottom-0 ${tailAlignment}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <path d={tailPath} fill={bubbleBg} />
        </svg>

        {/* Template Bubble */}
        <div
          className="w-full rounded-2xl overflow-hidden shadow-md text-sm flex flex-col justify-between"
          style={{ backgroundColor: bubbleBg }}
        >
          {meta ? (
            <>
              {/* Media */}
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-40 object-cover rounded"
                  onError={(e) => console.error("Video load error:", e.target.src)}
                />
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Banner"
                  className="w-full h-40 object-cover rounded"
                  onError={(e) => console.error("Image load error:", e.target.src)}
                />
              ) : docUrl ? (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-md overflow-hidden shadow-md"
                >
                  {/* Thumbnail preview (blurred page or fallback) */}
                  <div className="relative w-full h-40 bg-gray-200">
                    <img
                      src={meta?.docPreview}
                      alt="Document Preview"
                      className="w-full h-full object-cover"
                      // onError={(e) => {
                      //   e.target.src = "/fallback-doc-preview.png";
                      // }}
                    />
                    {/* Overlay with file details */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 px-3 py-2">
                      <p className="text-sm font-medium text-white truncate">
                        {fileName}
                      </p>
                      <p className="text-xs text-gray-300">
                        {fileSize}, {fileType}
                      </p>
                    </div>
                  </div>
                </a>
              ) : null}

              {/* Main Content */}
              <div className="flex flex-col justify-between h-full p-3 space-y-2">
                {/* Header */}
                {meta.header && (
                  <p className="text-base font-semibold text-red-600">{meta.header}</p>
                )}

                {/* Body */}
                {meta.data && (
                  <p className="text-sm text-gray-800 whitespace-pre-line break-words">
                    {fillPlaceholders(meta.data, parameters)}
                  </p>
                )}

                {/* Buttons */}
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

                {/* Footer */}
                {meta.footer && (
                  <p className="text-xs text-gray-400 pt-1 border-t border-gray-200">
                    {meta.footer}
                  </p>
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
          <div className="flex justify-end items-center gap-1 px-3 pb-2">
            <span className="text-[10px] text-gray-500">{msg.sent_at}</span>
            {sent && <MessageStatusIcon status={msg.status} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateMessage;
