import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import TemplateModal from "../../templates/Modal";
import { useTemplates } from "../../../hooks/useTemplates";

import { useBroadcastForm } from "../hooks/useBroadcastForm";

import CampaignNameStep from "../steps/CampaignNameStep";
import GroupSelectionStep from "../steps/GroupSelectionStep";
import TemplateSelectionStep from "../steps/TemplateSelectionStep";
import ScheduleCampaignStep from "../steps/ScheduleCampaignStep";
import PreviewStep from "../steps/PreviewStep";

import StepIndicator from "../ui/StepIndicator";
import InformationCards from "../ui/InformationCards";
import NavigationButtons from "../ui/NavigationButtons";

const BroadcastForm = ({
  formData, setFormData, handleInputChange, handleRadioChange,handleMediaChange,selectedDate, setSelectedDate,loading, error, 
  customerLists, onSubmit, isSubmitting, onTemplateSelect, step, setStep, wabaInfo,
  }) => {
  const { user } = useAuth();
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const { actions: { addTemplate } } = useTemplates();

  const {
    templates, templatesLoading, templatesError, estimatedCost, availableWCC, pagination, validationErrors, templateSearchTerm, setTemplateSearchTerm,
    customerSearchTerm, setCustomerSearchTerm, showList, setShowList, filteredCustomerLists, warningMessage, setWarningMessage, selectedGroups,
    totalSelectedContacts, fetchTemplates, loadMoreTemplates, validateStep, validateForm, handleNext, handlePrevious, getStepSequence,
  } = useBroadcastForm(
    formData, setFormData, customerLists, onTemplateSelect, step, setStep, selectedDate, setSelectedDate, wabaInfo
  );

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) onSubmit(e);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates(1, false, templateSearchTerm || "");
    }, 500); 

    return () => clearTimeout(timer);
  }, [templateSearchTerm, fetchTemplates]);

  // Handle dynamic template parameter input
  const handleTemplateParameterChange = (index, value) => {
    setFormData((prev) => {
      const updatedParams = [...(prev.templateParameters || [])];
      updatedParams[index] = value;
      return { ...prev, templateParameters: updatedParams };
    });
  };

  return (
    <div className="space-y-5 sm:space-y-2 lg:space-y-2 xl:space-y-5">
      <StepIndicator step={step} getStepSequence={getStepSequence} />

      {step > 0 && step < getStepSequence().length && (
        <InformationCards
          formData={formData}
          wabaInfo={wabaInfo}
          totalSelectedContacts={totalSelectedContacts}
        />
      )}

      <div className="border border-gray-200 rounded-lg bg-gray-50/30">
        <div className="p-3 sm:p-4 md:p-6 lg:p-1 xl:p-6">
          {step === 1 && (
            <CampaignNameStep
              formData={formData}
              handleInputChange={handleInputChange}
              validationErrors={validationErrors}
              isSubmitting={isSubmitting}
            />
          )}

          {step === 2 && (
            <GroupSelectionStep
              formData={formData}
              setFormData={setFormData}
              customerLists={customerLists}
              user={user}
              wabaInfo={wabaInfo}
              validationErrors={validationErrors}
              isSubmitting={isSubmitting}
              loading={loading}
              customerSearchTerm={customerSearchTerm}
              setCustomerSearchTerm={setCustomerSearchTerm}
              filteredCustomerLists={filteredCustomerLists}
              warningMessage={warningMessage}
              setWarningMessage={setWarningMessage}
              showList={showList}
              setShowList={setShowList}
            />
          )}

          {step === 3 && (
            <>
              <TemplateSelectionStep
                templates={templates}
                templatesLoading={templatesLoading}
                templatesError={templatesError}
                onTemplateSelect={onTemplateSelect}
                validationErrors={validationErrors}
                setValidationErrors={(errors) =>
                  setFormData((prev) => ({ ...prev, errors }))
                }
                pagination={pagination}
                loadMoreTemplates={loadMoreTemplates}
                templateSearchTerm={templateSearchTerm}
                setTemplateSearchTerm={setTemplateSearchTerm}
                setIsTemplateModalOpen={setIsTemplateModalOpen}
                formData={formData}
                setFormData={setFormData} 
              />
            </>
          )}

          {step === 4 && (
            <ScheduleCampaignStep
              formData={formData}
              handleRadioChange={handleRadioChange}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              validationErrors={validationErrors}
              setValidationErrors={(errors) =>
                setFormData((prev) => ({ ...prev, errors }))
              }
              isSubmitting={isSubmitting}
            />
          )}

          {step === 5 && (
            <PreviewStep
              formData={formData}
              customerLists={customerLists}
              selectedDate={selectedDate}
              estimatedCost={estimatedCost}
              availableWCC={availableWCC}
              totalSelectedContacts={totalSelectedContacts}
              wabaInfo={wabaInfo}
            />
          )}
        </div>
      </div>

      <NavigationButtons
        step={step}
        handlePrevious={handlePrevious}
        handleNext={handleNext}
        handleSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        getStepSequence={getStepSequence}
        estimatedCost={estimatedCost}
        availableWCC={availableWCC}
        totalSelectedContacts={totalSelectedContacts}
        wabaInfo={wabaInfo}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSubmit={async (templateData) => {
          try {
            await addTemplate(templateData);
            setIsTemplateModalOpen(false);
            fetchTemplates(1, false);
          } catch (error) {
            console.error('Error creating template:', error);
          }
        }}
      />
    </div>
  );
};

export default BroadcastForm;