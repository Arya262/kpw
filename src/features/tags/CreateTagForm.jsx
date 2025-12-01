import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { showSuccessToast, showErrorToast, showWarningToast } from "../../utils/toastConfig";
import { getTagId, getTagName, getTagColor, formatTagDate } from "./utils/tagUtils";
import { tagSchema, validateField } from "../../utils/validationSchemas";

const CreateTagForm = ({ 
  onSuccess, 
  onCancel, 
  showHeader = false, 
  mode = "create", 
  initialTag = null, 
  readOnly = false 
}) => {
  const [tagName, setTagName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const tagIdDisplay = getTagId(initialTag);
  const createdAtDisplay = formatTagDate(initialTag?.created_at || initialTag?.createdAt);

  useEffect(() => {
    if (initialTag) {
      setTagName(getTagName(initialTag));
    }
  }, [initialTag]);

  const resetForm = () => {
    setTagName("");
  };

  // Auto-generate color based on tag name
  const getAutoColor = (name) => {
    return getTagColor(name || "tag");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate using Zod schema
    const validation = validateField(tagSchema.shape.name, tagName.trim());
    if (!validation.isValid) {
      showWarningToast(validation.error);
      return;
    }

    if (!user?.customer_id) {
      showErrorToast("User information is missing. Please refresh the page.");
      return;
    }

    setIsSubmitting(true);

    try {
      const autoColor = getAutoColor(tagName.trim());
      const payload = {
        customer_id: user.customer_id,
        tag: tagName.trim(),
        tag_color: autoColor,
      };

      let response;
      if (mode === "edit" && initialTag) {
        response = await axios.put(API_ENDPOINTS.TAGS.UPDATE(getTagId(initialTag)), payload, { withCredentials: true });
      } else {
        response = await axios.post(API_ENDPOINTS.TAGS.ADD, payload, { withCredentials: true });
      }

      if (response.data && response.data.success !== false) {
        resetForm();
        showSuccessToast(mode === "edit" ? "Tag updated successfully" : "Tag created successfully");
        
        const newTag = {
          id: response.data.tag_id,
          customer_id: user.customer_id,
          tag: tagName.trim(),
          tag_color: autoColor,
          created_at: new Date().toISOString(),
        };
        onSuccess?.(newTag);
      } else {
        showErrorToast(response.data?.message || `Failed to ${mode === "edit" ? "update" : "create"} tag`);
      }
    } catch (error) {
      console.error("Error saving tag:", error);
      showErrorToast(error.response?.data?.message || "Failed to save tag");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = readOnly || mode === "view";
  const previewColor = getAutoColor(tagName);

  return (
    <div className={showHeader ? "min-h-screen bg-gray-50 p-4 sm:p-6" : ""}>
      <div className={showHeader ? "max-w-2xl mx-auto bg-white rounded-lg shadow-sm" : ""}>
        {showHeader && (
          <div className="flex items-center gap-4 p-6 border-b border-gray-200">
            <button onClick={onCancel} className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100" aria-label="Go back">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tags</h1>
              <p className="text-lg font-medium text-gray-700 mt-1">
                {mode === "view" ? "View" : mode === "edit" ? "Edit" : "Create New"}
              </p>
            </div>
          </div>
        )}

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

        <form onSubmit={handleSubmit} className={showHeader ? "p-6 space-y-6" : "space-y-6"}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag Name</label>
            <p className="text-xs text-gray-500 mb-2">Pick something that describes your contact.</p>
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Enter tag name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              required
              disabled={isDisabled}
            />
          </div>

          {/* Preview */}
          {tagName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium"
                style={{
                  backgroundColor: `${previewColor}18`,
                  color: previewColor,
                  border: `1px solid ${previewColor}35`,
                }}
              >
                {tagName}
              </span>
            </div>
          )}

          {mode !== "view" && (
            <div className={`pt-4 ${showHeader ? "border-t border-gray-200" : ""}`}>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"}`}
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
