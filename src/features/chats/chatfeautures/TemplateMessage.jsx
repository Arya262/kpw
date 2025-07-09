import MessageStatusIcon from "./MessageStatusIcon";

const TemplateMessage = ({ msg, sent }) => {
  const meta = msg.container_meta;

  const bubbleBg = sent ? "#dcf8c6" : "#f0f0f0";
  const tailAlignment = sent ? "right-[-4px]" : "left-[-4px]";
  const tailPath = sent
    ? "M0 0 Q10 20 20 0"
    : "M20 0 Q10 20 0 0";

  return (
    <div className={`relative flex ${sent ? "justify-end" : "justify-start"} px-2 mb-2`}>
      <div className="relative max-w-[80%]">
        {/* Tail */}
        <svg className={`absolute top-1 ${tailAlignment}`} width="20" height="20" viewBox="0 0 20 20">
          <path d={tailPath} fill={bubbleBg} />
        </svg>

        {/* Template Bubble */}
        <div
          className="rounded-2xl overflow-hidden shadow-md text-sm"
          style={{ backgroundColor: bubbleBg }}
        >
          {/* Conditional Meta */}
          {meta ? (
            <>
              {/* Banner */}
              {meta.banner_url?.trim() && (
                <img src={meta.banner_url} alt="Banner" className="w-full h-40 object-cover" />
              )}

              <div className="p-3">
                {/* Header */}
                {meta.header && <p className="text-base font-semibold text-red-600">{meta.header}</p>}

                {/* Data */}
                {meta.data && (
                  <p className="text-sm text-gray-800 whitespace-pre-line mt-1 break-words">
                    {meta.data}
                  </p>
                )}

                {/* Buttons */}
                {Array.isArray(meta.buttons) && meta.buttons.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {meta.buttons.map((btn, i) => (
                      <button
                        key={i}
                        className="w-full bg-[#0080ff] hover:bg-[#0066cc] text-white py-2 rounded text-sm font-medium transition"
                      >
                        {btn.text}
                      </button>
                    ))}
                  </div>
                )}

                {/* Footer */}
                {meta.footer && <p className="text-xs text-gray-400 mt-3">{meta.footer}</p>}
              </div>
            </>
          ) : (
            // Fallback View
            <div className="p-3">
              <p className="text-gray-500 italic">No template available.</p>
              {msg.data && (
                <pre className="text-xs text-gray-700 whitespace-pre-wrap mt-2 bg-white p-2 rounded">
                  {msg.data}
                </pre>
              )}
            </div>
          )}

          {/* Footer Time & Status */}
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
