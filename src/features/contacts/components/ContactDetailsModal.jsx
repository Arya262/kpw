import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Copy, Info, Plus } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { API_ENDPOINTS } from "../../../config/api";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import { useTagsApi } from "../../tags/hooks/useTagsApi";

export default function ContactDetailsModal({ contact, isOpen, onClose, onContactUpdate }) {
  const { user } = useAuth();
  const { tags: availableTags, fetchTags, createTag, assignTag, unassignTag } = useTagsApi(user?.customer_id);
  const [copied, setCopied] = useState(false);
  
  // Tags state
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const [localTags, setLocalTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isRemovingTag, setIsRemovingTag] = useState(null);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  
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
      
      setEditedName(name);
      setEditedPhone(phone);
      setOriginalName(name);
      setOriginalPhone(phone);
      setSelectedTagId("");
      setShowCreateTag(false);
      setNewTagName("");
      setLocalTags(contact?.tags || []);
    }
  }, [isOpen, contact]);

  // Fetch available tags when modal opens
  useEffect(() => {
    if (isOpen && user?.customer_id) {
      fetchTags();
    }
  }, [isOpen, user?.customer_id, fetchTags]);

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

  // Add tag to contact (from dropdown)
  const handleAddTag = async () => {
    if (!selectedTagId || !contactId) return;
    
    // Check if already added
    if (localTags.some(t => String(t.id || t.tag_id) === String(selectedTagId))) {
      toast.info("Tag already added");
      setSelectedTagId("");
      return;
    }
    
    setIsAddingTag(true);
    const result = await assignTag(contactId, selectedTagId, { showToast: true });
    
    if (result.success) {
      const addedTag = availableTags.find(t => String(t.id || t.tag_id) === String(selectedTagId));
      if (addedTag) setLocalTags(prev => [...prev, addedTag]);
      setSelectedTagId("");
      if (onContactUpdate) onContactUpdate();
    }
    setIsAddingTag(false);
  };

  // Helper to get tag ID (handles both string tags and object tags)
  const getTagId = (tag) => {
    if (typeof tag === 'string') {
      // Find the tag in availableTags by name
      const found = availableTags.find(t => (t.tag || t.name) === tag);
      return found?.id || found?.tag_id;
    }
    return tag.id || tag.tag_id;
  };

  // Helper to get tag name
  const getTagName = (tag) => {
    if (typeof tag === 'string') return tag;
    return tag.tag || tag.name || tag.tag_name || "Unknown";
  };

  // Remove tag from contact
  const handleRemoveTag = async (tag) => {
    const tagId = getTagId(tag);
    const tagName = getTagName(tag);
    
    if (!tagId || !contactId) {
      console.log("Missing tagId or contactId", { tagId, contactId, tag });
      return;
    }
    
    setIsRemovingTag(tagId);
    const result = await unassignTag(contactId, tagId, { showToast: true });
    
    if (result.success) {
      setLocalTags(prev => prev.filter(t => getTagName(t) !== tagName));
      if (onContactUpdate) onContactUpdate();
    }
    setIsRemovingTag(null);
  };

  // Create and add new tag
  const handleCreateAndAddTag = async () => {
    if (!newTagName.trim() || !contactId) return;
    
    setIsAddingTag(true);
    
    // First create the tag using the hook
    const createResult = await createTag({ tag: newTagName.trim() });
    
    if (createResult.success && createResult.tag) {
      // Then assign it to contact
      const assignResult = await assignTag(contactId, createResult.tag.id, { showToast: false });
      
      if (assignResult.success) {
        setLocalTags(prev => [...prev, createResult.tag]);
        toast.success("Tag created and added successfully");
        setNewTagName("");
        if (onContactUpdate) onContactUpdate();
      }
    }
    setIsAddingTag(false);
  };

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

          {/* Tags Section */}
          <div className="bg-white border border-gray-200 rounded-xl">
            {/* Header */}
            <button
              onClick={() => setTagsExpanded(!tagsExpanded)}
              className="w-full flex items-center justify-between p-4"
            >
              <span className="text-lg font-medium text-gray-900">Tags</span>
              {tagsExpanded ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>

            {/* Content */}
            {tagsExpanded && (
              <div className="px-4 pb-4 space-y-4">
                {/* Display added tags */}
                {localTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {localTags.map((tag, index) => {
                      const tagName = getTagName(tag);
                      const tagId = getTagId(tag);
                      const removing = isRemovingTag === tagId;
                      // Alternate colors for tags
                      const colors = [
                        { bg: "bg-purple-100", text: "text-purple-700" },
                        { bg: "bg-blue-100", text: "text-blue-700" },
                      ];
                      const colorIndex = index % colors.length;
                      return (
                        <div
                          key={tagId || tagName || index}
                          className={`inline-flex items-center gap-2 px-4 py-2 ${colors[colorIndex].bg} ${colors[colorIndex].text} rounded-lg text-sm font-medium ${removing ? "opacity-50" : ""}`}
                        >
                          <span>{tagName}</span>
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            disabled={removing}
                            className="hover:opacity-70"
                          >
                            <X size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!showCreateTag ? (
                  <>
                    {/* Select dropdown */}
                    <select
                      value={selectedTagId}
                      onChange={(e) => setSelectedTagId(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select & add tag</option>
                      {availableTags.map((tag) => (
                        <option key={tag.id || tag.tag_id} value={tag.id || tag.tag_id}>
                          {tag.tag || tag.name || tag.tag_name}
                        </option>
                      ))}
                    </select>

                    {/* Add button */}
                    <button
                      onClick={handleAddTag}
                      disabled={!selectedTagId || isAddingTag}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-teal-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <Plus size={16} />
                      {isAddingTag ? "Adding..." : "Add"}
                    </button>

                    {/* Create & Add Tag link */}
                    <button
                      onClick={() => setShowCreateTag(true)}
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                    >
                      Create & Add Tag
                    </button>
                  </>
                ) : (
                  <>
                    {/* Input and Create & Add button */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Enter tag name"
                        className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateAndAddTag()}
                        autoFocus
                      />
                      <button
                        onClick={handleCreateAndAddTag}
                        disabled={!newTagName.trim() || isAddingTag}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-teal-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
                      >
                        <Plus size={16} />
                        {isAddingTag ? "Creating..." : "Create & Add"}
                      </button>
                    </div>

                    {/* Cancel button */}
                    <button
                      onClick={() => { setShowCreateTag(false); setNewTagName(""); }}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </>
                )}
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
