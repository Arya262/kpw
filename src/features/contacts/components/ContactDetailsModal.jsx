import { useState, useEffect } from "react";
import { X, ChevronDown, Plus, Tag, Copy, Info } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import TagSelector from "../../tags/components/TagSelector";
import { getTagName, getTagColor } from "../../tags/utils/tagUtils";

export default function ContactDetailsModal({ contact, isOpen, onClose }) {
  const [showAllTags, setShowAllTags] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowAllTags(false);
      setShowTagSelector(false);
    }
  }, [isOpen]);

  if (!isOpen || !contact) return null;

  const fullName =
    contact.fullName ||
    `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
    "Unknown";
  const contactId = contact.contact_id || contact.id || "";
  const countryCode = contact.user_country_code || contact.country_code || "+91";
  const phoneNumber = contact.number || contact.mobile_no || "";
  const fullPhone = `${countryCode}${phoneNumber}`.replace(/[^\d]/g, "");
  const email = contact.email || "";
  const optStatus = contact.status || "Opted-in";
  const tags = contact.tags || [];

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayTags = showAllTags ? tags : tags.slice(0, 3);
  const remainingTags = tags.length - 3;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div
        className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
        style={{ animation: "slideInRight 0.2s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300 bg-white">
          <h2 className="text-base font-semibold text-gray-900">Contact details</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-5 space-y-5 scrollbar-hide">
          {/* Avatar Section */}
          <div className="flex flex-col items-center py-6 bg-white rounded-xl border-b border-gray-300">
            <div className="w-20 h-20 rounded-full bg-purple-200 flex items-center justify-center mb-3">
              <span className="text-3xl font-semibold text-purple-600">
                {getInitial(fullName)}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{fullName}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                {contactId}
              </span>
              <button
                onClick={() => handleCopy(contactId)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy ID"
              >
                <Copy size={14} className="text-gray-400" />
              </button>
              <button
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Info"
              >
                <Info size={14} className="text-gray-400" />
              </button>
            </div>
            {copied && (
              <span className="text-xs text-green-600 mt-1">Copied!</span>
            )}
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 tracking-wide mb-3">
              BASIC INFORMATION
            </h3>
            <div className="bg-white border-b border-gray-300 rounded-xl p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-500">
                  Contact name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1.5 px-3 py-2.5 border rounded-lg text-gray-900 text-sm bg-white">
                  {fullName}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Phone number</label>
                <div className="mt-1.5">
                  <PhoneInput
                    country="in"
                    value={fullPhone}
                    disabled
                    inputStyle={{
                      width: "100%",
                      height: "42px",
                      borderRadius: "0.5rem",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#fff",
                      fontSize: "14px",
                      color: "#111827",
                    }}
                    buttonStyle={{
                      borderRadius: "0.5rem 0 0 0.5rem",
                      border: "1px solid #e5e7eb",
                      borderRight: "none",
                      backgroundColor: "#f9fafb",
                    }}
                    containerStyle={{ width: "100%" }}
                  />
                </div>
              </div>

              <div
                className="bg-gray-50 rounded-lg p-4 -mx-4 mt-2"
                style={{ marginBottom: "-1rem" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-900">
                    Marketing Opt-In <span className="text-red-500">*</span>
                  </label>
                  <a
                    href="#"
                    className="text-sm text-blue-500 hover:underline flex items-center gap-0.5"
                  >
                    Learn more <span className="text-xs">↗</span>
                  </a>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Mark "YES" if consent for marketing messages has been
                  obtained from this contact.
                </p>
                <div className="flex items-center justify-between px-3 py-2.5 bg-white border rounded-lg">
                  <span className="text-sm text-gray-900">
                    {optStatus === "Opted-in" || optStatus === "Opted In"
                      ? "Yes"
                      : "No"}
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 tracking-wide mb-2">
              TAGS
            </h3>
            <label className="text-sm text-gray-500">Contact Tags</label>

            {showTagSelector ? (
              <div className="mt-2">
                <TagSelector
                  selectedTags={tags}
                  onTagsChange={() => {}}
                  placeholder="Search or create tags..."
                  allowCreate={true}
                />
                <button
                  onClick={() => setShowTagSelector(false)}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {displayTags.map((tag, index) => {
                  const tagName = getTagName(tag);
                  const tagColor = getTagColor(tag);
                  return (
                    <span
                      key={tag?.id || tag?.tag_id || index}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-sm"
                      style={{
                        backgroundColor: `${tagColor}15`,
                        color: tagColor,
                      }}
                    >
                      {tagName}
                      <button className="hover:opacity-70">
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}

                {remainingTags > 0 && !showAllTags && (
                  <button
                    onClick={() => setShowAllTags(true)}
                    className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
                  >
                    <Tag size={14} />
                    +{remainingTags}
                  </button>
                )}

                <button
                  onClick={() => setShowTagSelector(true)}
                  className="w-7 h-7 flex items-center justify-center border-2 border-dashed border-blue-300 rounded text-blue-500 hover:border-blue-400 hover:bg-blue-50"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
