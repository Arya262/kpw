import { useState, useEffect, useRef } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { getTagId, getTagName, getTagColor } from "../utils/tagUtils";

const TagSelector = ({
  selectedTags = [],
  onTagsChange,
  placeholder = "Select tags...",
  disabled = false,
  maxTags = null,
  allowCreate = true,
  className = "",
}) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.customer_id) fetchTags();
  }, [user?.customer_id]);

  // Check if dropdown should open upward
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 250; // approximate dropdown height
      
      // If not enough space below but enough above, open upward
      setDropUp(spaceBelow < dropdownHeight && spaceAbove > dropdownHeight);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCreateForm(false);
        setNewTagName("");
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_ENDPOINTS.TAGS.GET_ALL(user.customer_id), { withCredentials: true });
      const tags = response.data?.tags || response.data?.data || response.data || [];
      setAvailableTags(Array.isArray(tags) ? tags : []);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      setAvailableTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTags = availableTags.filter((tag) => {
    const name = getTagName(tag);
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const notSelected = !selectedTags.some((s) => getTagId(s) === getTagId(tag));
    return matchesSearch && notSelected;
  });

  const handleTagSelect = (tag) => {
    if (maxTags && selectedTags.length >= maxTags) return;
    const newTags = [...selectedTags, tag];
    if (onTagsChange) {
      onTagsChange(newTags);
    }
    setSearchTerm("");
  };

  const handleTagRemove = (e, tagToRemove) => {
    e.stopPropagation();
    const newTags = selectedTags.filter((tag) => getTagId(tag) !== getTagId(tagToRemove));
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const response = await axios.post(
        API_ENDPOINTS.TAGS.ADD,
        { customer_id: user.customer_id, tag: newTagName.trim(), tag_color: "#0AA89E" },
        { withCredentials: true }
      );
      
      const createdTag = {
        id: response.data.tag_id,
        customer_id: user.customer_id,
        tag: newTagName.trim(),
        created_at: new Date().toISOString(),
      };
      
      setAvailableTags((prev) => [...prev, createdTag]);
      handleTagSelect(createdTag);
      setNewTagName("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const canCreateNewTag = allowCreate && searchTerm.trim() && 
    !availableTags.some((tag) => getTagName(tag).toLowerCase() === searchTerm.toLowerCase());

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        className={`min-h-[44px] w-full px-3 py-2 border rounded-lg bg-white cursor-pointer transition-all ${
          disabled ? "bg-gray-50 cursor-not-allowed border-gray-200" : "hover:border-teal-400 border-gray-300"
        } ${isOpen ? "border-teal-500 ring-2 ring-teal-100" : ""}`}
        onClick={toggleDropdown}
      >
        <div className="flex flex-wrap gap-1.5 items-center min-h-[28px]">
          {selectedTags.length > 0 ? (
            selectedTags.map((tag) => (
              <span
                key={getTagId(tag)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${getTagColor(tag)}20`, color: getTagColor(tag) }}
              >
                {getTagName(tag)}
                {!disabled && (
                  <button 
                    type="button" 
                    onClick={(e) => handleTagRemove(e, tag)} 
                    className="ml-0.5 hover:bg-black/10 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}
          {!disabled && (
            <ChevronDown 
              size={18} 
              className={`ml-auto text-gray-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} 
            />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div 
          className={`absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search or type to create..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          {/* Tag List */}
          <div className="max-h-[180px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600 mx-auto mb-2"></div>
                Loading...
              </div>
            ) : filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <button
                  key={getTagId(tag)}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTagSelect(tag);
                  }}
                  className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2.5 text-sm transition-colors"
                >
                  <span 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: getTagColor(tag) }} 
                  />
                  <span className="text-gray-700">{getTagName(tag)}</span>
                </button>
              ))
            ) : searchTerm && !canCreateNewTag ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No tags found
              </div>
            ) : !searchTerm && filteredTags.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {availableTags.length === 0 ? "No tags created yet" : "All tags selected"}
              </div>
            ) : null}
          </div>

          {/* Create New Tag */}
          {canCreateNewTag && (
            <div className="border-t border-gray-100">
              {showCreateForm ? (
                <div className="p-2 space-y-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tag name"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleCreateTag(); }
                      if (e.key === "Escape") { setShowCreateForm(false); setNewTagName(""); }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); handleCreateTag(); }}
                      className="flex-1 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-md hover:bg-teal-700"
                    >
                      Create
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setShowCreateForm(false); setNewTagName(""); }}
                      className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setShowCreateForm(true); setNewTagName(searchTerm); }}
                  className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-teal-600 font-medium"
                >
                  <Plus size={16} />
                  Create "{searchTerm}"
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
