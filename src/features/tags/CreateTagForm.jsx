import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { showSuccessToast, showErrorToast, showWarningToast } from "../../utils/toastConfig";

// mode: "create" | "edit" | "view"
// initialTag: optional object to prefill fields for edit/view
// readOnly: when true, disables inputs (used for view)
const CreateTagForm = ({ onSuccess, onCancel, showHeader = false, mode = "create", initialTag = null, readOnly = false }) => {
  const [tagName, setTagName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [customerJourney, setCustomerJourney] = useState(false);
  const [firstMessageEnabled, setFirstMessageEnabled] = useState(false);
  const [firstMessages, setFirstMessages] = useState([""]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const tagIdDisplay = initialTag?.tag_id || initialTag?.id || initialTag?._id || null;
  const createdAtRaw = initialTag?.created_at || initialTag?.createdAt || null;
  const formatDate = (val) => {
    try {
      if (!val) return null;
      const d = new Date(val);
      if (isNaN(d)) return null;
      return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
    } catch (_) { return null; }
  };
  const createdAtDisplay = formatDate(createdAtRaw);

  // Fetch categories on mount
  useEffect(() => {
    if (user?.customer_id) {
      fetchCategories();
    }
  }, [user?.customer_id]);

  // Prefill values in edit/view mode
  useEffect(() => {
    if (initialTag) {
      setTagName(initialTag.tag_name || initialTag.name || "");
      const catId = initialTag.category_id || "";
      const catName = initialTag.category_name || initialTag.category || "";
      setCategoryId(catId);
      setCategoryName(catName);
      setIsNewCategory(!catId && !!catName);
      setCustomerJourney(!!initialTag.customer_journey);
      setFirstMessageEnabled(!!initialTag.first_message_enabled);
    }
  }, [initialTag]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      // Categories feature may not be implemented yet
      // If you need categories, add GET_CATEGORIES to API_ENDPOINTS.TAGS
      // For now, set empty array
      setCategories([]);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (value) => {
    if (value === "new") {
      setIsNewCategory(true);
      setCategoryId("");
      setCategoryName("");
    } else {
      setIsNewCategory(false);
      setCategoryId(value);
      setCategoryName("");
    }
  };

  const handleAddFirstMessage = () => {
    setFirstMessages([...firstMessages,""]);
  };

  const handleRemoveFirstMessage = (index) => {
    if (firstMessages.length > 1) {
      setFirstMessages(firstMessages.filter((_, i) => i !== index));
    }
  };

  const handleFirstMessageChange = (index, value) => {
    const updated = [...firstMessages];
    updated[index] = value;
    setFirstMessages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tagName.trim()) {
      showWarningToast("Tag name is required");
      return;
    }

    if (firstMessageEnabled && firstMessages.every((msg) => !msg.trim())) {
      showWarningToast("At least one first message is required when First Message is enabled");
      return;
    }

    if (!user?.customer_id) {
      showErrorToast("User information is missing. Please refresh the page.");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Backend API - Uncomment when backend is ready
      // const payload = {
      //   customer_id: user.customer_id,
      //   tag_name: tagName.trim(),
      //   tag_color: "#0AA89E", // Default color
      //   category_id: isNewCategory ? null : categoryId || null,
      //   category_name: isNewCategory ? categoryName.trim() : null,
      //   customer_journey: customerJourney,
      //   first_message_enabled: firstMessageEnabled,
      //   first_message: firstMessageEnabled && firstMessages[0]?.trim() 
      //     ? firstMessages.filter(m => m.trim()).join("|") // Join multiple messages with |
      //     : null,
      // };

      // const response = await axios.post(
      //   API_ENDPOINTS.TAGS.CREATE,
      //   payload,
      //   { withCredentials: true }
      // );

      // if (response.data && response.data.success !== false) {
      //   if (onSuccess) {
      //     onSuccess(response.data.tag || response.data.data || { name: tagName.trim() });
      //   }
      //   // Reset form after successful submission
      //   setTagName("");
      //   setCategoryId("");
      //   setCategoryName("");
      //   setIsNewCategory(false);
      //   setCustomerJourney(false);
      //   setFirstMessageEnabled(false);
      //   setFirstMessages([""]);
      // } else {
      //   alert(response.data?.message || "Failed to create tag");
      // }

      // MOCK CREATE/EDIT - Remove when backend is ready
      setTimeout(() => {
        const mockTag = {
          tag_id: initialTag?.tag_id || initialTag?.id || initialTag?._id || Date.now(),
          tag_name: tagName.trim(),
          tag_color: "#0AA89E",
          category_id: isNewCategory ? null : categoryId || null,
          category_name: isNewCategory ? categoryName.trim() : (categoryName || null),
          customer_journey: customerJourney,
          first_message_enabled: firstMessageEnabled,
          usage_count: initialTag?.usage_count || 0,
          is_active: initialTag?.is_active ?? true,
        };
        
        // Reset form after successful submission
        setTagName("");
        setCategoryId("");
        setCategoryName("");
        setIsNewCategory(false);
        setCustomerJourney(false);
        setFirstMessageEnabled(false);
        setFirstMessages([""]);
        setIsSubmitting(false);
        
        // Show success message first
        showSuccessToast(mode === "edit" ? "Tag updated successfully" : "Tag created successfully");
        
        // Then call onSuccess to close modal and refresh list
        if (onSuccess) {
          onSuccess(mockTag);
        }
      }, 800); // Simulate API delay
    } catch (error) {
      console.error("Error creating tag:", error);
      showErrorToast(error.response?.data?.message || "Failed to create tag");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={showHeader ? "min-h-screen bg-gray-50 p-4 sm:p-6" : ""}>
      <div className={showHeader ? "max-w-2xl mx-auto bg-white rounded-lg shadow-sm" : ""}>
        {/* Header - Only show if showHeader is true */}
        {showHeader && (
            <div className="flex items-center gap-4 p-6 border-b border-gray-200">
            <button
              onClick={onCancel}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tags</h1>
              <p className="text-lg font-medium text-gray-700 mt-1">{mode === "view" ? "View" : mode === "edit" ? "Edit" : "Create New"}</p>
            </div>
          </div>
        )}

        {/* Meta rows for view/edit */}
        {mode !== "create" && (
          <div className={showHeader ? "px-6 pt-6 space-y-3 text-sm text-gray-700" : "space-y-3 text-sm text-gray-700"}>
            {tagIdDisplay && (
              <div className="flex items-center gap-3">
                <span className="w-32 text-gray-600 font-medium">TagID</span>
                <code className="px-2 py-1 bg-gray-100 rounded text-gray-800 break-all">{tagIdDisplay}</code>
              </div>
            )}
            {createdAtDisplay && (
              <div className="flex items-center gap-3">
                <span className="w-32 text-gray-600 font-medium">Created At</span>
                <span>{createdAtDisplay}</span>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={showHeader ? "p-6 space-y-6" : "space-y-6"}>
          {/* Tag Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Name
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Pick something that describes your contact.
            </p>
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Enter tag name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              required
              disabled={readOnly || mode === "view"}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <p className="text-xs text-gray-500 mb-2">
              You can select from existing category or can go with new.
            </p>
            {isNewCategory ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter new category name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  disabled={readOnly || mode === "view"}
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsNewCategory(false);
                    setCategoryName("");
                  }}
                  className="text-sm text-teal-600 hover:text-teal-700"
                  disabled={readOnly || mode === "view"}
                >
                  ← Select existing category
                </button>
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-white"
                disabled={readOnly || mode === "view"}
              >
                <option value="">Select one or create new</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
                <option value="new">+ Create New Category</option>
              </select>
            )}
          </div>

          {/* Customer Journey */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Customer Journey
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Enable to track this tag in your customers' journey
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCustomerJourney(!customerJourney)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  customerJourney ? "bg-teal-600" : "bg-gray-300"
                }`}
                disabled={readOnly || mode === "view"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    customerJourney ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* First Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Message
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Allows auto tagging if users' first message matches
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFirstMessageEnabled(!firstMessageEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  firstMessageEnabled ? "bg-teal-600" : "bg-gray-300"
                }`}
                disabled={readOnly || mode === "view"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    firstMessageEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {firstMessageEnabled && (
              <div className="mt-4 space-y-3">
                {firstMessages.map((message, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => handleFirstMessageChange(index, e.target.value)}
                      placeholder="Enter first Message"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                      disabled={readOnly || mode === "view"}
                    />
                    {firstMessages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFirstMessage(index)}
                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-600"
                        disabled={readOnly || mode === "view"}
                        aria-label="Remove message"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                    {index === firstMessages.length - 1 && (
                      <button
                        type="button"
                        onClick={handleAddFirstMessage}
                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-teal-600 hover:text-teal-700"
                        disabled={readOnly || mode === "view"}
                        aria-label="Add message"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          {mode !== "view" && (
            <div className={`pt-4 ${showHeader ? "border-t border-gray-200" : ""}`}>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {isSubmitting ? (mode === "edit" ? "Saving..." : "Submitting...") : (mode === "edit" ? "Save" : "Submit")}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateTagForm;

