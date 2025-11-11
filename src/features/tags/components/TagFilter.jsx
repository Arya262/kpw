import React, { useState, useEffect, useRef } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import TagBadge from "./TagBadge";

const TagFilter = ({ 
  selectedTags = [], 
  onTagsChange, 
  className = "",
  placeholder = "Filter by tags...",
  showClearAll = true
}) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    return tagName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleTagToggle = (tag) => {
    const isSelected = selectedTags.some(selected => 
      (selected.tag_id || selected.id) === (tag.tag_id || tag.id)
    );
    
    if (isSelected) {
      const newSelectedTags = selectedTags.filter(selected => 
        (selected.tag_id || selected.id) !== (tag.tag_id || tag.id)
      );
      onTagsChange(newSelectedTags);
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tagToRemove) => {
    const newSelectedTags = selectedTags.filter(tag => 
      (tag.tag_id || tag.id) !== (tagToRemove.tag_id || tagToRemove.id)
    );
    onTagsChange(newSelectedTags);
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors ${
          selectedTags.length > 0 ? 'border-teal-500 bg-teal-50' : ''
        }`}
      >
        <Filter size={16} className={selectedTags.length > 0 ? 'text-teal-600' : 'text-gray-500'} />
        <span className={`text-sm ${selectedTags.length > 0 ? 'text-teal-600 font-medium' : 'text-gray-600'}`}>
          {selectedTags.length > 0 ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}` : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 items-center">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.tag_id || tag.id}
              tag={tag}
              size="xs"
              showRemove={true}
              onRemove={handleTagRemove}
            />
          ))}
          {showClearAll && selectedTags.length > 1 && (
            <button
              type="button"
              onClick={clearAllTags}
              className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
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
              filteredTags.map((tag) => {
                const isSelected = selectedTags.some(selected => 
                  (selected.tag_id || selected.id) === (tag.tag_id || tag.id)
                );
                
                return (
                  <button
                    key={tag.tag_id || tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm ${
                      isSelected ? 'bg-teal-50 text-teal-700' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by button click
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.tag_color || tag.color || "#0AA89E" }}
                    />
                    {tag.tag_name || tag.name}
                  </button>
                );
              })
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

          {/* Clear All Button */}
          {selectedTags.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              <button
                type="button"
                onClick={clearAllTags}
                className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagFilter;