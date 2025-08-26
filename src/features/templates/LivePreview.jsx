import React from "react";
import {
  Paperclip,
  Camera,
  FileText,
  MessageSquare,
  ExternalLink,
  Phone,
  Copy,
  List
} from "lucide-react";

const chatBg = "/light.png";
const buttonClass =
  "w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50 border-t border-gray-200 first:border-t-0";

// ✅ Quick Replies (WhatsApp-style)
const QuickReplyList = ({ quickReplies = [] }) => {
  const validReplies = quickReplies.filter((q) => q.trim());
  if (!validReplies.length) return null;

  return (
    <div className="bg-white  border-t border-b border-gray-200">
      {validReplies.map((reply, idx) => (
        <button
          key={`${reply}-${idx}`}
          type="button"
          className={buttonClass}
          aria-label={`Quick reply: ${reply}`}
        >
          <MessageSquare className="w-4 h-4" />
          {reply}
        </button>
      ))}
    </div>
  );
};

// ✅ URL CTAs + Offer Code
const UrlCtaList = ({ urlCtas = [], offerCode }) => {
  const validCtas = urlCtas.filter((cta) => cta.title && cta.url);
  if (!validCtas.length && !offerCode) return null;

  return (
    <div className="bg-white border-t border-b border-gray-200">
      {offerCode && (
        <button
          type="button"
          className={buttonClass}
          aria-label={`Copy offer code: ${offerCode}`}
          onClick={() => navigator.clipboard.writeText(offerCode)}
        >
          <Copy className="w-4 h-4" />
          {offerCode}
        </button>
      )}
      {validCtas.map((cta, idx) => (
        <a
          key={`${cta.title}-${idx}`}
          href={cta.url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          aria-label={`Visit ${cta.title}`}
        >
          <ExternalLink className="w-4 h-4" />
          {cta.title}
        </a>
      ))}
      {/* Extra "See all options" if multiple CTAs */}
      {validCtas.length > 1 && (
        <button type="button" className={buttonClass}>
          <List className="w-4 h-4" />
          See all options
        </button>
      )}
    </div>
  );
};

// ✅ Phone CTA
const PhoneCta = ({ phoneCta = {} }) => {
  const { title, number } = phoneCta;
  if (!title || !number) return null;

  return (
    <div className="bg-white border-t border-b border-gray-200">
      <a
        href={`tel:${number}`}
        className={buttonClass}
        aria-label={`Call ${title}`}
      >
        <Phone className="w-4 h-4" />
        {title}
      </a>
    </div>
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
  const normalizedTemplateType = templateType ? templateType.trim() : "Text";

  const renderMediaPreview = () => {
    switch (normalizedTemplateType) {
      case "Image":
        return (
          <img
            src={livePreviewSampleText?.file?.url || "/placeholder-image.png"}
            alt="Image preview"
            className="max-w-full max-h-[300px] object-contain rounded-lg"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML =
                '<div class="text-red-500 text-sm">Failed to load image preview</div>';
            }}
          />
        );
      case "Video":
        return livePreviewSampleText?.file?.url ? (
          <video
            src={livePreviewSampleText.file.url}
            controls
            className="max-w-full max-h-[300px] object-contain rounded-lg"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML =
                '<div class="text-red-500 text-sm">Failed to load video preview</div>';
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <p className="text-gray-500 text-center">
            Upload a video to see preview
          </p>
        );
      case "Document":
        return livePreviewSampleText?.file?.url ? (
          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
            <a
              href={livePreviewSampleText.file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline text-sm"
              aria-label="View document"
            >
              {livePreviewSampleText.file.name || "View Document"}
            </a>
          </div>
        ) : (
            <FileText className="w-12 h-12 text-gray-400" />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center p-4 text-center">
          </div>
        );
    }
  };

  const showActions =
    selectedAction === "Call To Actions" || selectedAction === "All";
  const hasCtas =
    urlCtas.some((cta) => cta.title && cta.url) ||
    offerCode ||
    (phoneCta?.title && phoneCta?.number);

  return (
    <div className="w-full lg:w-[401px] rounded p-4 flex flex-col">
      <h4 className="text-lg font-semibold mb-3 text-gray-500">Live Preview</h4>
      <div className="rounded-[2rem] shadow-xl w-full max-w-[320px] h-[75vh] max-h-[650px] flex flex-col overflow-hidden border-[6px] border-gray-200">
        <div className="bg-[#075E54] h-12 flex items-center px-4 text-white font-semibold"></div>
        <div
          className="flex-1 p-3 overflow-auto scrollbar-hide"
          style={{
            backgroundImage: `url(${chatBg})`,
            backgroundSize: "cover",
          }}
        >
          <div className="bg-white rounded-lg p-3 text-sm shadow mb-2 max-w-[85%]">
            {header && <div className="font-bold mb-1">{header}</div>}

            {normalizedTemplateType !== "Text" && (
              <div className="mb-2">{renderMediaPreview()}</div>
            )}

            {(normalizedTemplateType === "Text" ||
              livePreviewSampleText?.text) && (
              <div className="whitespace-pre-wrap break-words mb-1">
                {livePreviewSampleText?.text || ""}
              </div>
            )}
            
            {footer && (
              <div className="text-xs text-gray-600 mb-2">{footer}</div>
            )}

            {/* ✅ Unified wrapper for all actions */}
            <div className="mt-2 flex flex-col ">
              <QuickReplyList quickReplies={quickReplies} />
              {showActions && hasCtas && (
                <>
                  <UrlCtaList urlCtas={urlCtas} offerCode={offerCode} />
                  <PhoneCta phoneCta={phoneCta} />
                </>
              )}
            </div>
          </div>
        </div>
        <div className="h-12 bg-gray-100 flex items-center px-3 gap-2 border-t border-gray-200">
          <span className="text-gray-500">😊</span>
          <input
            type="text"
            placeholder="Type a message"
            readOnly
            aria-disabled="true"
            className="flex-1 bg-white rounded-full px-3 py-1 text-sm outline-none border border-gray-300 cursor-default"
          />
          <Paperclip className="text-gray-500 w-5 h-5" />
          <Camera className="text-gray-500 w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
