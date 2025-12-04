import { useState, useEffect } from "react";
import { formatTime } from "../../utils/time";
import Avatar from "../../utils/Avatar";
import { FiUserX, FiUserCheck } from "react-icons/fi";
import { X, ChevronUp, ChevronDown, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTagsApi } from "../tags/hooks/useTagsApi";
import { toast } from "react-toastify";

const UserDetails = ({ isExpanded, setIsExpanded, selectedContact, updateBlockStatus, onContactUpdate }) => {
  const { user } = useAuth();
  const { tags: availableTags, fetchTags, createTag, assignTag, unassignTag } = useTagsApi(user?.customer_id);
  const [isBlocked, setIsBlocked] = useState(selectedContact?.block || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localTags, setLocalTags] = useState(selectedContact?.tags || []);
  const [isRemovingTag, setIsRemovingTag] = useState(null);

  const [generalDetailsExpanded, setGeneralDetailsExpanded] = useState(true);
  
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const [selectedTagId, setSelectedTagId] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    setIsBlocked(selectedContact?.block || false);
    setLocalTags(selectedContact?.tags || []);
  }, [selectedContact]);

  // Fetch tags on mount
  useEffect(() => {
    if (user?.customer_id) {
      fetchTags();
    }
  }, [user?.customer_id, fetchTags]);

  const contactId = selectedContact?.contact_id;


  const getTagId = (tag) => {
    if (typeof tag === 'string') {
      const found = availableTags.find(t => (t.tag || t.name) === tag);
      return found?.id || found?.tag_id;
    }
    return tag.id || tag.tag_id;
  };

  const getTagName = (tag) => {
    if (typeof tag === 'string') return tag;
    return tag.tag || tag.name || tag.tag_name || "Unknown";
  };

  const handleAddTag = async () => {
    if (!selectedTagId || !contactId) return;
    
    if (localTags.some(t => String(getTagId(t)) === String(selectedTagId))) {
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

  // Remove tag
  const handleRemoveTag = async (tag) => {
    const tagId = getTagId(tag);
    const tagName = getTagName(tag);
    
    if (!tagId || !contactId) return;
    
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
    const createResult = await createTag({ tag: newTagName.trim() });
    
    if (createResult.success && createResult.tag) {
      const assignResult = await assignTag(contactId, createResult.tag.id, { showToast: false });
      
      if (assignResult.success) {
        setLocalTags(prev => [...prev, createResult.tag]);
        toast.success("Tag created and added");
        setNewTagName("");
        if (onContactUpdate) onContactUpdate();
      }
    }
    setIsAddingTag(false);
  };

  if (!selectedContact) return null;

  // Check if 24 hours status is active
  const is24HoursActive = selectedContact?.updated_at 
    ? Date.now() - new Date(selectedContact.updated_at).getTime() < 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="w-full md:w-[300px] md:min-w-[300px] md:max-w-[300px] bg-white border-l border-gray-300 p-0">
      <div className="user-details h-full overflow-y-auto">
        {/* Profile Info */}
        <div className="profile mt-3 text-center">
          <div className="avatar mb-2 flex justify-center">
            <Avatar
              name={selectedContact?.name}
              image={selectedContact?.image}
            />
          </div>
          <h3 className="font-semibold text-lg break-all text-center px-2 max-w-[280px] mx-auto">
            {selectedContact.name || "Unnamed"}
          </h3>
          <p className="text-sm text-gray-600">
            {selectedContact?.country_code
              ? `${selectedContact.country_code.startsWith("+") ? "" : "+"}${
                  selectedContact.country_code
                } `
              : ""}
            {selectedContact?.mobile_no || "No number"}
          </p>
          <p className="opted-in text-green-600 text-sm">Opted-in</p>
          <button
            onClick={async () => {
              if (isUpdating) return;
              setIsUpdating(true);
              const newBlockedState = !isBlocked;
              const success = await updateBlockStatus(
                selectedContact.contact_id,
                newBlockedState
              );
              if (success) {
                setIsBlocked(newBlockedState);
              }
              setIsUpdating(false);
            }}
            disabled={isUpdating}
            className={`flex items-center justify-center mx-auto px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isBlocked
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            } ${isUpdating ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isUpdating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isBlocked ? "Unblocking..." : "Blocking..."}
              </>
            ) : isBlocked ? (
              <>
                <FiUserCheck className="mr-2" />
                Unblock User
              </>
            ) : (
              <>
                <FiUserX className="mr-2" />
                Block User
              </>
            )}
          </button>
        </div>

        <hr className="my-4 border-t-2 border-gray-300" />

        {/* Last Message */}
        <div className="flex justify-between items-center p-2">
          <p className="text-sm font-bold text-black">Last Message</p>
          <p className="text-sm text-black">
            {selectedContact?.lastMessageTime 
              ? formatTime(selectedContact.lastMessageTime)
              : "No messages"}
          </p>
        </div>

        {/* 24 Hours Status */}
        <div className="flex justify-between items-center px-2 mb-3">
          <p className="text-sm font-bold text-black">24 Hours Status</p>
          {selectedContact?.updated_at ? (
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                Date.now() - new Date(selectedContact.updated_at).getTime() < 24 * 60 * 60 * 1000
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {Date.now() - new Date(selectedContact.updated_at).getTime() < 24 * 60 * 60 * 1000
                ? "Active"
                : "Inactive"}
            </span>
          ) : (
            <span className="px-3 py-1 text-sm rounded-full bg-gray-300 text-gray-700">
              Unknown
            </span>
          )}
        </div>

        {/* Toggle for General Details */}
        <div
          className="details-toggle cursor-pointer flex items-center justify-between px-2 py-2 text-gray-600 hover:text-black"
          onClick={() => setGeneralDetailsExpanded(!generalDetailsExpanded)}
          aria-expanded={generalDetailsExpanded}
        >
          <span className="text-sm font-semibold tracking-wide">
            GENERAL DETAILS
          </span>
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${
              generalDetailsExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* General Details Section */}
        {generalDetailsExpanded && (
          <div className="space-y-3 p-2">
            {/* Tags Section */}
            <div>
              <button
                onClick={() => setTagsExpanded(!tagsExpanded)}
                className="w-full flex items-center justify-between py-2"
              >
                <span className="text-sm font-medium text-black">Tags</span>
                {tagsExpanded ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>

              {/* Content */}
              {tagsExpanded && (
                <div className="space-y-3 mt-2">
                  {/* Display added tags */}
                  {localTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {localTags.map((tag, index) => {
                        const tagName = getTagName(tag);
                        const tagId = getTagId(tag);
                        const removing = isRemovingTag === tagId;
                        const colors = [
                          { bg: "bg-purple-100", text: "text-purple-700" },
                          { bg: "bg-blue-100", text: "text-blue-700" },
                        ];
                        const colorIndex = index % colors.length;
                        return (
                          <div
                            key={tagId || tagName || index}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors[colorIndex].bg} ${colors[colorIndex].text} rounded-lg text-xs font-medium ${removing ? "opacity-50" : ""}`}
                          >
                            <span>{tagName}</span>
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              disabled={removing}
                              className="hover:opacity-70"
                            >
                              <X size={14} strokeWidth={2.5} />
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
                        className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select & add tag</option>
                        {availableTags.map((tag) => (
                          <option key={tag.id || tag.tag_id} value={tag.id || tag.tag_id}>
                            {tag.tag || tag.name || tag.tag_name}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-3">
                        {/* Add button */}
                        <button
                          onClick={handleAddTag}
                          disabled={!selectedTagId || isAddingTag}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-teal-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                        >
                          <Plus size={14} />
                          {isAddingTag ? "Adding..." : "Add"}
                        </button>

                        {/* Create & Add Tag link */}
                        <button
                          onClick={() => setShowCreateTag(true)}
                          className="text-teal-600 hover:text-teal-700 text-xs font-medium"
                        >
                          Create & Add Tag
                        </button>
                      </div>
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
                          className="flex-1 px-3 py-2 bg-gray-100 border-0 rounded-lg text-gray-700 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                          onKeyDown={(e) => e.key === "Enter" && handleCreateAndAddTag()}
                          autoFocus
                        />
                        <button
                          onClick={handleCreateAndAddTag}
                          disabled={!newTagName.trim() || isAddingTag}
                          className="inline-flex items-center gap-1 px-2 py-1.5 border border-gray-300 rounded-lg text-teal-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium whitespace-nowrap"
                        >
                          <Plus size={12} />
                          {isAddingTag ? "..." : "Create & Add"}
                        </button>
                      </div>

                      {/* Cancel button */}
                      <button
                        onClick={() => { setShowCreateTag(false); setNewTagName(""); }}
                        className="text-gray-500 hover:text-gray-700 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Incoming Status */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Incoming Status
              </label>
              {is24HoursActive ? (
                <div className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  Allowed
                </div>
              ) : (
                <div className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                  Not Allowed
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
