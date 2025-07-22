import React from "react";

const LivePreview = ({
  header,
  templateType,
  livePreviewSampleText,
  footer,
  quickReplies,
  selectedAction,
  urlCtas,
  offerCode,
  phoneCta,
}) => (
  <div className="w-full lg:w-[401px] bg-green-100 border border-blue-300 rounded p-4 overflow-auto flex flex-col">
    <h4 className="text-lg font-semibold mb-3 text-gray-500 flex-shrink-0">
      Live Preview
    </h4>
    <div className="flex-1 space-y-4 overflow-auto">
      {header && (
        <h2 className="text-2xl font-semibold mb-2">{header}</h2>
      )}
      {templateType === "Text" ? (
        <p
          className="text-gray-800 mb-2 overflow-x-auto"
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {livePreviewSampleText}
        </p>
      ) : (
        <p className="italic text-gray-500">
          [{templateType} Preview Placeholder]
        </p>
      )}
      {footer && (
        <p className="text-sm text-gray-700 mt-2">{footer}</p>
      )}
      {quickReplies.filter((q) => q.trim()).length > 0 && (
        <div className="mt-4">
          <div className="font-semibold mb-1 text-sm">
            Quick Replies:
          </div>
          <div className="flex flex-wrap gap-2">
            {quickReplies
              .filter((q) => q.trim())
              .map((reply, idx) => (
                <span
                  key={idx}
                  className="block bg-blue-500 w-full text-white text-center px-3 py-1 rounded mb-2 hover:cursor-pointer"
                >
                  {reply}
                </span>
              ))}
          </div>
        </div>
      )}
      {(selectedAction === "Call To Actions" ||
        selectedAction === "All") &&
        urlCtas.filter((cta) => cta.title && cta.url).length > 0 && (
          <div className="mt-4">
            <span>Call To Actions:</span>
            {urlCtas
              .filter((cta) => cta.title && cta.url)
              .map((cta, idx) => (
                <a
                  key={idx}
                  href={cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-blue-500 text-white text-center px-3 py-1 rounded mb-2"
                >
                  {cta.title}
                </a>
              ))}
            {offerCode && (
              <>
                <span>Offer Code:</span>
                <p className="block bg-blue-500 text-white text-center px-3 py-1 rounded mb-2">
                  {offerCode}
                </p>
              </>
            )}
          </div>
        )}
      {(selectedAction === "Call To Actions" ||
        selectedAction === "All") &&
        phoneCta.title &&
        phoneCta.number && (
          <>
            <span>Call To Actions :</span>
            <p className="block bg-blue-500 text-white text-center px-3 py-1 rounded mb-2">
              {phoneCta.title}
            </p>
          </>
        )}
    </div>
  </div>
);

export default LivePreview;