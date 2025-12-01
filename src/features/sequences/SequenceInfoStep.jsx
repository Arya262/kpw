import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTagsApi } from "../tags/hooks/useTagsApi";
import { z } from "zod";

const MAX_NAME_LENGTH = 50;
const MAX_DESC_LENGTH = 200;

// Zod schema for sequence validation
export const sequenceInfoSchema = z.object({
  drip_name: z
    .string()
    .min(1, "Drip name is required")
    .min(3, "Drip name must be at least 3 characters")
    .max(MAX_NAME_LENGTH, `Drip name must be ${MAX_NAME_LENGTH} characters or less`),
  drip_description: z
    .string()
    .max(MAX_DESC_LENGTH, `Description must be ${MAX_DESC_LENGTH} characters or less`)
    .optional(),
  target_type: z.string().min(1, "Please select a trigger type"),
});

const SequenceInfoStep = ({ seqData, setSeqData, fieldErrors = {} }) => {
  const { user } = useAuth();
  const {
    tags,
    isLoading,
    fetchTags,
  } = useTagsApi(user?.customer_id);

  useEffect(() => {
    if (user?.customer_id) {
      fetchTags();
    }
  }, [user?.customer_id]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_NAME_LENGTH) {
      setSeqData({ ...seqData, drip_name: value });
    }
  };

  const handleDescChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_DESC_LENGTH) {
      setSeqData({ ...seqData, drip_description: value });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h4 className="text-lg font-semibold text-gray-900">
          Sequence Information
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Basic details about your drip sequence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drip Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Drip Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors placeholder-gray-400 ${
                fieldErrors.drip_name
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Enter a descriptive Drip name"
              value={seqData.drip_name}
              onChange={handleNameChange}
              maxLength={MAX_NAME_LENGTH}
            />
            <div className="flex justify-between items-center mt-1">
              {fieldErrors.drip_name ? (
                <p className="text-xs text-red-500">{fieldErrors.drip_name}</p>
              ) : (
                <p className="text-xs text-gray-500">
                  This will help you identify the drip later
                </p>
              )}
              <span
                className={`text-xs ${
                  seqData.drip_name.length >= MAX_NAME_LENGTH
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {seqData.drip_name.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
          </div>

          {/* Drip Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Drip Description
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors placeholder-gray-400 resize-none"
              placeholder="Enter a description for your sequence..."
              value={seqData.drip_description}
              onChange={handleDescChange}
              maxLength={MAX_DESC_LENGTH}
              rows={4}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Describe what this sequence does
              </p>
              <span
                className={`text-xs ${
                  seqData.drip_description?.length >= MAX_DESC_LENGTH
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {seqData.drip_description?.length || 0}/{MAX_DESC_LENGTH}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-6">
                Drip Based On <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
                value={seqData.target_type}
                onChange={(e) =>
                  setSeqData({ ...seqData, target_type: e.target.value })
                }
              >
                <option value="">Select a trigger type</option>
                {isLoading ? (
                  <option value="" disabled>
                    Loading tags...
                  </option>
                ) : tags && tags.length > 0 ? (
                  tags.map((t) => {
                    return (
                      <option key={t.id} value={t.tag || "contacts"}>
                        {t.tag || "contacts"}
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>
                    No tags available
                  </option>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose what will trigger this drip
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Preview Card */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center text-white text-lg">
                📧
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {seqData.drip_name || "Untitled Sequence"}
                </h4>
                <p className="text-xs text-gray-500">Draft</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {seqData.drip_description || "No description provided"}
            </p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Steps</p>
                <p className="text-sm font-semibold text-gray-900">
                  {seqData.steps?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Draft
                </span>
              </div>
               <div>
                <p className="text-xs text-gray-500">Target</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {seqData.target_type}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            This is how your sequence will appear in the list
          </p>
        </div>
      </div>
    </div>
  );
};

export default SequenceInfoStep;