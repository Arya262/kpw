import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight, MessageCircle, Send } from "lucide-react";
import { Lightbulb } from "lucide-react";

const FlowNameModal = ({ isOpen, onClose, onConfirm, initialName = "" }) => {
  const [flowName, setFlowName] = useState(initialName);
  const [flowType, setFlowType] = useState("inbound"); // "inbound" or "outbound"
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setFlowName(initialName || "");
      setFlowType("inbound");

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen, initialName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = flowName.trim();
    if (!trimmed) return;

    if (flowType === "outbound") {
      // Navigate to autocampaign page
      onClose();
      navigate("/autocampaign");
    } else {
      // Continue with inbound flow creation
      onConfirm(trimmed);
      setFlowName("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0AA89E] to-[#089086] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Create New Flow</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Flow Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Flow Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Inbound Option */}
                <button
                  type="button"
                  onClick={() => setFlowType("inbound")}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    flowType === "inbound"
                      ? "border-[#0AA89E] bg-[#E6F8F7]"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        flowType === "inbound"
                          ? "bg-[#0AA89E] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <MessageCircle size={20} />
                    </div>
                    <span
                      className={`font-medium ${
                        flowType === "inbound"
                          ? "text-[#0AA89E]"
                          : "text-gray-700"
                      }`}
                    >
                      Inbound
                    </span>
                    <span className="text-xs text-gray-500 text-center">
                      Customer-initiated flows
                    </span>
                  </div>
                  {flowType === "inbound" && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#0AA89E] rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </button>

                {/* Outbound Option */}
                <button
                  type="button"
                  onClick={() => setFlowType("outbound")}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    flowType === "outbound"
                      ? "border-[#0AA89E] bg-[#E6F8F7]"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        flowType === "outbound"
                          ? "bg-[#0AA89E] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Send size={20} />
                    </div>
                    <span
                      className={`font-medium ${
                        flowType === "outbound"
                          ? "text-[#0AA89E]"
                          : "text-gray-700"
                      }`}
                    >
                      Outbound
                    </span>
                    <span className="text-xs text-gray-500 text-center">
                      Automated sequences
                    </span>
                  </div>
                  {flowType === "outbound" && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#0AA89E] rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Flow Name Input */}
            <div>
              <label
                htmlFor="flowName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Flow Name <span className="text-red-500">*</span>
              </label>
              <input
                ref={inputRef}
                id="flowName"
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Welcome Flow, Order Confirmation"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0AA89E] transition-all"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {flowName.length}/100 characters
              </p>
            </div>

            {/* Tip */}
            <div className="bg-[#E6F8F7] border border-[#0AA89E]/30 rounded-lg p-3 flex items-start gap-2">
              <Lightbulb size={16} className="text-[#0AA89E] mt-[2px]" />
              <p className="text-xs text-[#0AA89E]">
                <strong>Tip:</strong> Choose a descriptive name that helps you identify the flow's purpose.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!flowName.trim()}
              className="flex-1 px-4 py-2.5 bg-[#0AA89E] text-white rounded-lg hover:bg-[#089086] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {flowType === "outbound" ? (
                <>
                  Continue
                  <ArrowRight size={16} />
                </>
              ) : (
                "Create Flow"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlowNameModal;
