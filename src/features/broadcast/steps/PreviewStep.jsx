import React, { useMemo } from "react";
import { FileText } from "lucide-react";
import { renderMedia } from "../../../utils/renderMedia";

const PreviewStep = ({
  formData,
  customerLists,
  selectedDate
}) => {
  const selectedGroups = useMemo(() => {
    return customerLists.filter((c) => formData.group_id.includes(c.group_id));
  }, [customerLists, formData.group_id]);

  const renderTemplateContent = () => {
    if (!formData.selectedTemplate) {
      return (
        <p className="text-sm text-gray-500 italic">
          No template selected
        </p>
      );
    }

    let content = formData.selectedTemplate.container_meta.sampleText || '';
    
    if (formData.selectedTemplate.container_meta.dynamicFields) {
      formData.selectedTemplate.container_meta.dynamicFields.forEach((field) => {
        const regex = new RegExp(`\\{\\{${field.index}\\}}`, "g");
        content = content.replace(regex, field.value);
      });
    }

    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
        {formData.selectedTemplate.template_type?.toUpperCase() !== 'TEXT' && (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
            {renderMedia({
              ...formData.selectedTemplate,
              mediaUrl: formData.selectedTemplate.container_meta?.mediaUrl,
              template_type: formData.selectedTemplate.container_meta?.type,
              element_name: formData.selectedTemplate.element_name
            }) || (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <FileText className="w-12 h-12 mb-2" />
                <span className="text-sm">No Media Preview</span>
              </div>
            )}
          </div>
        )}
        <p className="font-semibold text-gray-800">
          {formData.selectedTemplate.element_name}
        </p>
        {formData.selectedTemplate.container_meta?.header?.trim() && (
          <p className="text-sm text-gray-600">
            {formData.selectedTemplate.container_meta.header}
          </p>
        )}
        {content.trim() && (
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {content}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-2">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6 max-w-xl mx-auto">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl">
              <p>
                <span className="font-medium text-gray-600">Name:</span>{" "}
                {formData.broadcastName}
              </p>
              {formData.isDirectBroadcast ? (
                <p>
                  <span className="font-medium text-gray-600">Recipients:</span>{" "}
                  {formData.directContacts?.length || 0} contacts selected
                </p>
              ) : (
                <p>
                  <span className="font-medium text-gray-600">Groups:</span>{" "}
                  {selectedGroups.map(g => g.group_name).join(", ") || "None selected"}
                </p>
              )}
              <p>
                <span className="font-medium text-gray-600">
                  Schedule:
                </span>{" "}
                {formData.schedule === "Yes"
                  ? selectedDate
                    ? new Date(selectedDate).toLocaleString()
                    : "Not set"
                  : "Send Now"}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {renderTemplateContent()}
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;