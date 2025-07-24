import React from "react";

const QuickReplyList = ({ quickReplies }) => {
  const validReplies = quickReplies.filter((q) => q.trim());
  if (validReplies.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="font-semibold mb-1 text-sm">Quick Replies:</div>
      <div className="flex flex-wrap gap-2">
        {validReplies.map((reply, idx) => (
          <button
            key={`${reply}-${idx}`}
            type="button"
            className="block bg-blue-500 w-full text-white text-center px-3 py-1 rounded mb-2 hover:cursor-pointer"
            aria-label={`Quick reply: ${reply}`}
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
};

const UrlCtaList = ({ urlCtas = [], offerCode }) => {
  const validCtas = urlCtas.filter((cta) => cta.title && cta.url);
  if (validCtas.length === 0 && !offerCode) return null;

  return (
    <div className="mt-2">
      {validCtas.map((cta, idx) => (
        <a
          key={`${cta.title}-${idx}`}
          href={cta.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-blue-500 text-white text-center px-3 py-1 rounded mb-2"
        >
          {cta.title}
        </a>
      ))}
      {offerCode && (
        <div className="mt-2">
          <span className="block font-semibold">Offer Code:</span>
          <p className="block bg-blue-500 text-white text-center px-3 py-1 rounded mb-2">
            {offerCode}
          </p>
        </div>
      )}
    </div>
  );
};

const PhoneCta = ({ phoneCta }) => {
  const { title, number } = phoneCta || {};
  if (!title || !number) return null;

  return (
    <p className="block bg-blue-500 text-white text-center px-3 py-1 rounded mb-2 mt-2">
      {title}
    </p>
  );
};

const LivePreview = ({
  header,
  templateType,
  livePreviewSampleText,
  footer,
  quickReplies = [],
  selectedAction,
  urlCtas = [],
  offerCode,
  phoneCta = {},
}) => {
  const showActions =
    selectedAction === "Call To Actions" || selectedAction === "All";

  const hasCtas =
    urlCtas.some((cta) => cta.title && cta.url) ||
    offerCode ||
    (phoneCta?.title && phoneCta?.number);

  return (
    <div className="w-full lg:w-[401px] bg-green-100 border border-blue-300 rounded p-4 overflow-auto flex flex-col">
      <h4 className="text-lg font-semibold mb-3 text-gray-500 flex-shrink-0">
        Live Preview
      </h4>
      <div className="flex-1 space-y-4 overflow-auto">
        {header && <h2 className="text-2xl font-semibold mb-2">{header}</h2>}

        {templateType === "Text" ? (
          <p
            className="text-gray-800 mb-2 overflow-x-auto"
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
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

        <QuickReplyList quickReplies={quickReplies} />

        {showActions && hasCtas && (
          <>
            <span className="block font-semibold mt-4 mb-1">Call To Actions:</span>
            <UrlCtaList urlCtas={urlCtas} offerCode={offerCode} />
            <PhoneCta phoneCta={phoneCta} />
          </>
        )}
      </div>
    </div>
  );
};

export default LivePreview;
