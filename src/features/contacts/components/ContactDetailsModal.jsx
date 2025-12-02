import { useState, useEffect } from "react";
import { X, ChevronDown, Plus, Tag, Copy, Info } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import TagSelector from "../../tags/components/TagSelector";
import { getTagName, getTagColor, getTagId } from "../../tags/utils/tagUtils";
import { API_ENDPOINTS } from "../../../config/api";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";

export default function ContactDetailsModal({ contact, isOpen, onClose, onContactUpdate }) {
  const { user } = useAuth();
  const [showAllTags, setShowAllTags] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localTags, setLocalTags] = useState([]);
  const [isRemovingTag, setIsRemovingTag] = useState(null);
  
  // Editable fields
  const [editedName, setEditedName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && contact) {
      const name = contact.first_name || contact.fullName || "";
      const phone = `${contact.country_code || ""}${contact.mobile_no || ""}`;
      
      setShowAllTags(false);
      setShowTagSelector(false);
      setLocalTags(contact?.tags || []);
      setEditedName(name);
      setEditedPhone(phone);
      setOriginalName(name);
      setOriginalPhone(phone);
    }
  }, [isOpen, contact]);

  if (!isOpen || !contact) return null;

  const contactId = contact.contact_id || contact.id || "";
  const countryCode = contact.user_country_code || contact.country_code || "+91";
  const phoneNumber = contact.number || contact.mobile_no || "";
  const fullPhone = `${countryCode}${phoneNumber}`.replace(/[^\d]/g, "");
  const optStatus = contact.status || "Opted-in";

  // Check if there are unsaved changes
  const hasChanges = editedName !== originalName || editedPhone !== originalPhone;

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    const phoneDigits = editedPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setIsSaving(true);
    try {
      const formattedPhone = editedPhone.startsWith("+") ? editedPhone : `+${editedPhone}`;
      let extractedCountryCode = contact?.country_code || "";
      if (!extractedCountryCode && formattedPhone.startsWith("+")) {
        const match = formattedPhone.match(/^\+(\d{1,3})/);
        extractedCountryCode = match ? `+${match[1]}` : "+91";
      }
      const mobileNumber = phoneDigits.slice(extractedCountryCode.replace("+", "").length);

      const requestBody = {
        contact_id: contactId,
        customer_id: user?.customer_id,
        country_code: extractedCountryCode,
        first_name: editedName.trim(),
        mobile_no: mobileNumber,
      };

      const response = await fetch(API_ENDPOINTS.CONTACTS.UPDATE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Contact updated successfully");
        setOriginalName(editedName);
        setOriginalPhone(editedPhone);
        if (onContactUpdate) onContactUpdate();
      } else {
        toast.error(data.message || "Failed to update contact");
      }
    } catch (error) {
      console.error("Failed to update contact:", error);
      toast.error("Failed to update contact");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedName(originalName);
    setEditedPhone(originalPhone);
  };

  const handleRemoveTag = async (tagToRemove) => {
    const tagId = getTagId(tagToRemove);
    if (!tagId || !contactId) return;
    
    setIsRemovingTag(tagId);
    try {
      const response = await fetch(API_ENDPOINTS.TAGS.UNASSIGN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contact_id: contactId, tag_id: tagId }),
      });
      
      if (response.ok) {
        setLocalTags(prev => prev.filter(t => getTagId(t) !== tagId));
        if (onContactUpdate) onContactUpdate();
        toast.success("Tag removed");
      } else {
        toast.error("Failed to remove tag");
      }
    } catch (error) {
      console.error("Failed to remove tag:", error);
      toast.error("Failed to remove tag");
    } finally {
      setIsRemovingTag(null);
    }
  };

  const displayTags = showAllTags ? localTags : localTags.slice(0, 3);
  const remainingTags = localTags.length - 3;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div
        className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
        style={{ animation: "slideInRight 0.2s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
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
          <div className="flex flex-col items-center py-6 bg-white rounded-xl border border-gray-200">
            <div className="w-20 h-20 rounded-full bg-purple-200 flex items-center justify-center mb-3">
              <span className="text-3xl font-semibold text-purple-600">
                {getInitial(editedName)}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {editedName || "Unnamed"}
            </h3>
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
              <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Info">
                <Info size={14} className="text-gray-400" />
              </button>
            </div>
            {copied && <span className="text-xs text-green-600 mt-1">Copied!</span>}
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 tracking-wide mb-3">BASIC INFORMATION</h3>
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
              {/* Contact Name - Always editable */}
              <div>
                <label className="text-sm text-gray-500">
                  Contact name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2.5 border rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter contact name"
                />
              </div>

              {/* Phone Number - Always editable */}
              <div>
                <label className="text-sm text-gray-500">Phone number</label>
                <div className="mt-1.5">
                  <PhoneInput
                    country="in"
                    value={editedPhone || fullPhone}
                    onChange={(value) => setEditedPhone(value)}
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

              {/* Marketing Opt-In */}
              <div className="bg-gray-50 rounded-lg p-4 -mx-4 mt-2" style={{ marginBottom: "-1rem" }}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-900">
                    Marketing Opt-In <span className="text-red-500">*</span>
                  </label>
                  <a href="#" className="text-sm text-blue-500 hover:underline flex items-center gap-0.5">
                    Learn more <span className="text-xs">↗</span>
                  </a>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Mark "YES" if consent for marketing messages has been obtained from this contact.
                </p>
                <div className="flex items-center justify-between px-3 py-2.5 bg-white border rounded-lg">
                  <span className="text-sm text-gray-900">
                    {optStatus === "Opted-in" || optStatus === "Opted In" ? "Yes" : "No"}
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Save/Cancel buttons - Only show when there are changes */}
            {hasChanges && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          {/* Tags */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 tracking-wide mb-2">TAGS</h3>
            <label className="text-sm text-gray-500">Contact Tags</label>

            {showTagSelector ? (
              <div className="mt-2">
                <TagSelector
                  selectedTags={localTags}
                  onTagsChange={async (newTags) => {
                    const oldTagIds = localTags.map(t => getTagId(t));
                    const newTagIds = newTags.map(t => getTagId(t));
                    
                    // Find added tags
                    const addedTagIds = newTagIds.filter(id => !oldTagIds.includes(id));
                    // Find removed tags
                    const removedTagIds = oldTagIds.filter(id => !newTagIds.includes(id));
                    
                    // Assign new tags
                    for (const tagId of addedTagIds) {
                      try {
                        await fetch(API_ENDPOINTS.TAGS.ASSIGN, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ contact_id: contactId, tag_id: tagId }),
                        });
                      } catch (error) {
                        console.error("Failed to assign tag:", error);
                      }
                    }
                    
                    // Unassign removed tags
                    for (const tagId of removedTagIds) {
                      try {
                        await fetch(API_ENDPOINTS.TAGS.UNASSIGN, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ contact_id: contactId, tag_id: tagId }),
                        });
                      } catch (error) {
                        console.error("Failed to unassign tag:", error);
                      }
                    }
                    
                    setLocalTags(newTags);
                    if (onContactUpdate) onContactUpdate();
                  }}
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
                  const tagId = getTagId(tag);
                  const isRemoving = isRemovingTag === tagId;
                  return (
                    <span
                      key={tagId || index}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-sm ${isRemoving ? "opacity-50" : ""}`}
                      style={{ backgroundColor: `${tagColor}15`, color: tagColor }}
                    >
                      {tagName}
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        disabled={isRemoving}
                        className="hover:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isRemoving ? <span className="animate-spin text-xs">⏳</span> : <X size={12} />}
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

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
