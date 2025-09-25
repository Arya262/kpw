import React, { useMemo } from "react";
import { FileText, Users, Calendar, MessageSquare, CreditCard } from "lucide-react";
import { renderMedia } from "../../../utils/renderMedia";

const PreviewStep = ({
  formData,
  customerLists,
  selectedDate,
  estimatedCost,
  availableWCC,
  totalSelectedContacts
}) => {
  const selectedGroups = useMemo(() => {
    return customerLists.filter((c) => formData.group_id.includes(c.group_id));
  }, [customerLists, formData.group_id]);

  const renderTemplateContent = () => {
    if (!formData.selectedTemplate) {
      return (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 italic">No template selected</p>
        </div>
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
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {formData.selectedTemplate.template_type?.toUpperCase() !== 'TEXT' && (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100">
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
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-500" />
            <h4 className="font-semibold text-gray-800">
              {formData.selectedTemplate.element_name}
            </h4>
          </div>
          {formData.selectedTemplate.container_meta?.header?.trim() && (
            <p className="text-sm text-gray-600 font-medium">
              {formData.selectedTemplate.container_meta.header}
            </p>
          )}
          {content.trim() && (
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {content}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Campaign Overview */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-500" />
          Campaign Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Campaign Name</p>
                <p className="font-medium text-gray-800">{formData.broadcastName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Recipients</p>
                <p className="font-medium text-gray-800">
                  {formData.isDirectBroadcast 
                    ? `${formData.directContacts?.length || 0} contacts`
                    : `${totalSelectedContacts} contacts from ${selectedGroups.length} group${selectedGroups.length !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Schedule</p>
                <p className="font-medium text-gray-800">
                  {formData.schedule === "Yes"
                    ? selectedDate
                      ? new Date(selectedDate).toLocaleString()
                      : "Not set"
                    : "Send Now"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Cost</p>
                <p className="font-medium text-gray-800">₹{estimatedCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Preview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-500" />
          Message Preview
        </h3>
        {renderTemplateContent()}
      </div>

      {/* Cost Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-teal-500" />
          Cost Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Total Contacts</p>
            <p className="text-2xl font-bold text-gray-800">{totalSelectedContacts}</p>
          </div>
          <div className="text-center p-4 bg-teal-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
            <p className="text-2xl font-bold text-teal-600">₹{estimatedCost.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-blue-600">₹{availableWCC.toFixed(2)}</p>
          </div>
        </div>
        
        {totalSelectedContacts > 250 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-700 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Warning: Audience size exceeds 250 contacts. Please reduce the number of contacts.
            </p>
          </div>
        )}
        
        {estimatedCost > availableWCC && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Insufficient balance. Please add more credits to your account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewStep;