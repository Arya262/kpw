import React, { useMemo } from "react";
import { TextField, } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import FolderOffIcon from "@mui/icons-material/FolderOff";
import { FileText } from "lucide-react";
import { renderMedia } from "../../../utils/renderMedia";
import { Plus } from "lucide-react";

const TemplateSelectionStep = ({
  templates,
  templatesLoading,
  templatesError,
  onTemplateSelect,
  validationErrors,
  setValidationErrors,
  pagination,
  loadMoreTemplates,
  templateSearchTerm,
  setTemplateSearchTerm,
  setIsTemplateModalOpen,
  formData
}) => {
  const approvedTemplates = useMemo(() => {
    return templates.filter((t) => {
      const isApproved = t.status?.toUpperCase() === "APPROVED";
      const isText = t.template_type?.toUpperCase() === 'TEXT';
      const matchesSearch = templateSearchTerm === '' ||
        t.element_name?.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
        t.container_meta?.sampleText?.toLowerCase().includes(templateSearchTerm.toLowerCase());
      return isApproved && isText && matchesSearch;
    });
  }, [templates, templateSearchTerm]);

  const handleTemplateSelect = (template) => {
    onTemplateSelect(template);
    setValidationErrors((prev) => ({ ...prev, template: "" }));
  };

  if (templatesLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        <span className="ml-2 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  if (templatesError) {
    return <p className="text-red-500 text-center py-8">{templatesError}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Select Template
        </h3>
        <div className="w-full sm:w-64">
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Search templates..."
            value={templateSearchTerm}
            onChange={(e) => setTemplateSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon className="text-gray-400 mr-2" />
              ),
            }}
          />
        </div>
      </div>

      {approvedTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FolderOffIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {templateSearchTerm
              ? `No templates match "${templateSearchTerm}"`
              : 'No approved templates available.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Create New Template
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedTemplates.map((template) => (
              <div
                key={template.id || template.element_name}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTemplateSelect(template);
                  }
                }}
                className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                  formData.selectedTemplate?.id === template.id ||
                  formData.selectedTemplate?.element_name === template.element_name
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 hover:border-teal-300 hover:shadow-lg"
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                {template.template_type?.toUpperCase() !== 'TEXT' && (
                  <div className="w-full h-32 flex items-center justify-center bg-gray-50">
                    {renderMedia({
                      ...template,
                      mediaUrl: template.container_meta?.mediaUrl,
                      template_type: template.container_meta?.type,
                      element_name: template.element_name
                    }) || (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FileText className="w-8 h-8 mb-1" />
                        <span className="text-xs">No Preview</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm text-gray-800 truncate">
                      {template.element_name}
                    </h4>
                    {(formData.selectedTemplate?.id === template.id ||
                      formData.selectedTemplate?.element_name === template.element_name) && (
                      <div className="flex-shrink-0 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {template.category}
                  </p>
                  <p className="text-xs text-gray-700 line-clamp-3">
                    {template.container_meta?.sampleText || "No sample text available"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {pagination.hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={loadMoreTemplates}
                disabled={pagination.isLoadingMore}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 flex items-center"
              >
                {pagination.isLoadingMore ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : 'Load More Templates'}
              </button>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
};

export default TemplateSelectionStep;