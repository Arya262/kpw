import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Tag, ChevronDown } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

const TagSelector = ({ 
  selectedTags = [], 
  onTagsChange, 
  placeholder = "Select tags...",
  disabled = false,
  maxTags = null,
  allowCreate = true,
  className = ""
}) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.customer_id) {
      fetchTags();
    }
  }, [user?.customer_id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
      
      // TODO: Backend API - Uncomment when backend is ready
      // const response = await axios.get(API_ENDPOINTS.TAGS.GET_ALL, {
      //   params: { customer_id: user.customer_id },
      //   withCredentials: true,
      // });
      // setAvailableTags(response.data.tags || response.data.data || []);

      // MOCK DATA - Remove when backend is ready
      setTimeout(() => {
        setAvailableTags([
          { tag_id: 1, tag_name: "VIP", tag_color: "#FF6B6B" },
          { tag_id: 2, tag_name: "Regular", tag_color: "#4ECDC4" },
          { tag_id: 3, tag_name: "New Customer", tag_color: "#45B7D1" },
          { tag_id: 4, tag_name: "Premium", tag_color: "#9B59B6" },
          { tag_id: 5, tag_name: "Support", tag_color: "#F39C12" },
        ]);
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      setAvailableTags([]);
      setIsLoading(false);
    }
  };

  const filteredTags = availableTags.filter(tag => {
    const tagName = tag.tag_name || tag.name || "";
    const matchesSearch = tagName.toLowerCase().includes(searchTerm.toLowerCase());
    const notSelected = !selectedTags.some(selected => 
      (selected.tag_id || selected.id) === (tag.tag_id || tag.id)
    );
    return matchesSearch && notSelected;
  });

  const handleTagSelect = (tag) => {
    if (maxTags && selectedTags.length >= maxTags) return;
    
    const newSelectedTags = [...selectedTags, tag];
    onTagsChange(newSelectedTags);
    setSearchTerm("");
  };

  const handleTagRemove = (tagToRemove) => {
    const newSelectedTags = selectedTags.filter(tag => 
      (tag.tag_id || tag.id) !== (tagToRemove.tag_id || tagToRemove.id)
    );
    onTagsChange(newSelectedTags);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      // TODO: Backend API - Uncomment when backend is ready
      // const response = await axios.post(API_ENDPOINTS.TAGS.CREATE, {
      //   customer_id: user.customer_id,
      //   tag_name: newTagName.trim(),
      //   tag_color: "#0AA89E",
      // }, { withCredentials: true });
      
      // const createdTag = response.data.tag || response.data.data;
      // setAvailableTags(prev => [...prev, createdTag]);
      // handleTagSelect(createdTag);

      // MOCK CREATE - Remove when backend is ready
      const mockTag = {
        tag_id: Date.now(),
        tag_name: newTagName.trim(),
        tag_color: "#0AA89E",
      };
      setAvailableTags(prev => [...prev, mockTag]);
      handleTagSelect(mockTag);
      
      setNewTagName("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  const canCreateNewTag = allowCreate && searchTerm.trim() && 
    !availableTags.some(tag => 
      (tag.tag_name || tag.name || "").toLowerCase() === searchTerm.toLowerCase()
    );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Tags Display */}
      <div 
        className={`min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer transition-all ${
          disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500'
        } ${isOpen ? 'border-teal-500 ring-2 ring-teal-500' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 items-center">
          {selectedTags.length > 0 ? (
            selectedTags.map((tag) => (
              <span
                key={tag.tag_id || tag.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${tag.tag_color || tag.color || "#0AA89E"}20`, 
                  color: tag.tag_color || tag.color || "#0AA89E" 
                }}
              >
                {tag.tag_name || tag.name}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTagRemove(tag);
                    }}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          )}
          
          {!disabled && (
            <ChevronDown 
              size={16} 
              className={`ml-auto text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tags..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              autoFocus
            />
          </div>

          {/* Tags List */}
          <div className="max-h-40 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mx-auto mb-2"></div>
                Loading tags...
              </div>
            ) : filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <button
                  key={tag.tag_id || tag.id}
                  type="button"
                  onClick={() => handleTagSelect(tag)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                  disabled={maxTags && selectedTags.length >= maxTags}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.tag_color || tag.color || "#0AA89E" }}
                  />
                  {tag.tag_name || tag.name}
                </button>
              ))
            ) : searchTerm ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                No tags found matching "{searchTerm}"
              </div>
            ) : (
              <div className="p-3 text-center text-gray-500 text-sm">
                No tags available
              </div>
            )}
          </div>

          {/* Create New Tag */}
          {canCreateNewTag && (
            <div className="border-t border-gray-200">
              {showCreateForm ? (
                <div className="p-2 space-y-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Enter tag name"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateTag();
                      } else if (e.key === 'Escape') {
                        setShowCreateForm(false);
                        setNewTagName("");
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateTag}
                      className="flex-1 px-3 py-1.5 bg-teal-600 text-white text-xs rounded hover:bg-teal-700"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewTagName("");
                      }}
                      className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(true);
                    setNewTagName(searchTerm);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-teal-600"
                >
                  <Plus size={14} />
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