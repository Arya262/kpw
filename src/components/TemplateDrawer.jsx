import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Paperclip,
  Camera,
  FileText,
  MessageSquare,
  ExternalLink,
  Phone,
  Copy,
  List,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { renderMedia } from "../utils/renderMedia";
const chatBg = "/light.png";
const buttonClass =
  "w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50 border-t border-gray-200 first:border-t-0";

// ✅ Quick Replies
const QuickReplyList = ({ quickReplies = [] }) => {
  const validReplies = quickReplies.filter((q) => q.trim());
  if (!validReplies.length) return null;

  return (
    <div className="bg-white border-t border-b border-gray-200">
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

const TemplateDrawer = ({ isOpen, onClose, template }) => {
  const navigate = useNavigate();
  if (!template || !template.container_meta) return null;

  const meta = template.container_meta || {};
  const normalizedTemplateType = meta.templateType
    ? meta.templateType.trim()
    : template.template_type || "Text";

  // Map buttons to quickReplies, urlCtas, offerCode, and phoneCta
  const quickReplies = (meta.buttons || [])
    .filter((button) => button.type === "QUICK_REPLY")
    .map((button) => button.text);
  const urlCtas = (meta.buttons || [])
    .filter((button) => button.type === "URL")
    .map((button) => ({ title: button.text, url: button.url }));
  const offerCode =
    (meta.buttons || []).find(
      (button) => button.type === "OTP" && button.otp_type === "COPY_CODE"
    )?.text || null;
  const phoneCta =
    (meta.buttons || []).find((button) => button.type === "PHONE_NUMBER") || {};

const renderMediaPreview = () => {

  const mediaTemplate = {
    ...template,
    ...meta,     
    template_type: normalizedTemplateType,
    media_url: meta.media_url || template.media_url, 
    element_name: template.element_name
  };
  return renderMedia(mediaTemplate);
};
  const hasCtas =
    urlCtas.some((cta) => cta.title && cta.url) ||
    offerCode ||
    (phoneCta?.title && phoneCta?.number);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 w-full sm:w-96 h-full bg-white z-50 shadow-xl p-6 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 sm:hidden">
              <button
                onClick={onClose}
                className={`absolute top-2 right-3 text-gray-600 hover:text-black text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer `}
              >
                ×
              </button>
            </div>
            {/* Template Name & Status */}
            <div className="mb-4 px-2">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  {template.element_name || "Unnamed Template"}
                </h2>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${template.status?.toLowerCase() === "approved"
                      ? "bg-green-100 text-green-800"
                      : template.status?.toLowerCase() === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {template.status || "Unknown"}
                </span>
              </div>
            </div>
            {/* Phone Mock-Up */}
            <div className="flex-1 overflow-y-auto flex justify-center">
              <div className="rounded-[2rem] shadow-xl w-full max-w-[320px] h-[75vh] max-h-[650px] flex flex-col overflow-hidden border-[6px] border-gray-200">
                {/* Top bar */}
                <div className="bg-[#075E54] h-12 flex items-center px-4 text-white font-semibold"></div>

                {/* Chat area */}
                <div
                  className="flex-1 p-3 overflow-auto scrollbar-hide"
                  style={{
                    backgroundImage: `url(${chatBg})`,
                    backgroundSize: "cover",
                  }}
                >
                  <div className="bg-white rounded-lg p-3 text-sm shadow mb-2 max-w-[85%]">
                    {meta.header && (
                      <div className="font-bold mb-1">{meta.header}</div>
                    )}
                    {normalizedTemplateType !== "Text" && (
                      <div className="mb-2">{renderMediaPreview()}</div>
                    )}
                    {(normalizedTemplateType === "Text" || meta.sampleText) && (
                      <div className="whitespace-pre-wrap break-words mb-1">
                        {meta.sampleText || ""}
                      </div>
                    )}
                    {meta.footer && (
                      <div className="text-xs text-gray-600 mb-2">
                        {meta.footer}
                      </div>
                    )}
                    {/* Actions */}
                    <div className="mt-2 flex flex-col">
                      <QuickReplyList quickReplies={quickReplies} />
                      {hasCtas && (
                        <>
                          <UrlCtaList urlCtas={urlCtas} offerCode={offerCode} />
                          <PhoneCta phoneCta={phoneCta} />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom mock input */}
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

            {/* Action Button */}
            <div className="mt-4">
              <button
                disabled={template.status?.toLowerCase() !== "approved"}
                onClick={() => {
                  if (template.status?.toLowerCase() === "approved") {
                    navigate("/broadcast", {
                      state: { selectedTemplate: template, openForm: true },
                    });
                  }
                }}
                className={`w-full py-2 rounded-lg font-medium transition ${template.status?.toLowerCase() === "approved"
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:opacity-90"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Use This Template
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TemplateDrawer;
