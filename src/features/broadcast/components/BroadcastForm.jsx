import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import TemplateModal from "../../templates/Modal";
import {
  Box,
} from "@mui/material";

// Custom hook
import { useBroadcastForm } from "../hooks/useBroadcastForm";

// Step components
import CampaignNameStep from "../steps/CampaignNameStep";
import GroupSelectionStep from "../steps/GroupSelectionStep";
import TemplateSelectionStep from "../steps/TemplateSelectionStep";
import ScheduleCampaignStep from "../steps/ScheduleCampaignStep";
import PreviewStep from "../steps/PreviewStep";

// UI components
import StepIndicator from "../ui/StepIndicator";
import InformationCards from "../ui/InformationCards";
import CostInformation from "../ui/CostInformation";
import NavigationButtons from "../ui/NavigationButtons";

const BroadcastForm = ({
  formData,
  setFormData,
  handleInputChange,
  handleRadioChange,
  handleMediaChange,
  selectedDate,
  setSelectedDate,
  isTemplateOpen,
  openTemplate,
  closeTemplate,
  SendTemplate,
  loading,
  error,
  customerLists,
  onSubmit,
  isSubmitting,
  onTemplateSelect,
  step,
  setStep,
}) => {
  const { user } = useAuth();
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const {
    // States
    templates,
    templatesLoading,
    templatesError,
    estimatedCost,
    availableWCC,
    pagination,
    validationErrors,
    templateSearchTerm,
    setTemplateSearchTerm,
    customerSearchTerm,
    setCustomerSearchTerm,
    showList,
    setShowList,
    filteredCustomerLists,
    warningMessage,
    setWarningMessage,
    selectedGroups,
    totalSelectedContacts,

    // Functions
    fetchTemplates,
    loadMoreTemplates,
    validateStep,
    validateForm,
    handleNext,
    handlePrevious,
    getStepSequence,
    getCurrentStepIndex
  } = useBroadcastForm(
    formData,
    setFormData,
    customerLists,
    onTemplateSelect,
    step,
    setStep,
    selectedDate,
    setSelectedDate
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  return (
    <div className="space-y-4">
      <StepIndicator step={step} getStepSequence={getStepSequence} />
      <InformationCards formData={{ ...formData, customerLists }} />
      
      <div className="border border-gray-200 rounded-lg bg-gray-50/30">
        <div className="p-3 sm:p-4 md:p-6">
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
            <TemplateSelectionStep 
              templates={templates}
              templatesLoading={templatesLoading}
              templatesError={templatesError}
              onTemplateSelect={onTemplateSelect}
              validationErrors={validationErrors}
              setValidationErrors={(errors) => setFormData(prev => ({ ...prev, errors }))}
              pagination={pagination}
              loadMoreTemplates={loadMoreTemplates}
              templateSearchTerm={templateSearchTerm}
              setTemplateSearchTerm={setTemplateSearchTerm}
              setIsTemplateModalOpen={setIsTemplateModalOpen}
              formData={formData}
            />
          )}
          {step === 4 && (
            <ScheduleCampaignStep 
              formData={formData}
              handleRadioChange={handleRadioChange}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              validationErrors={validationErrors}
              setValidationErrors={(errors) => setFormData(prev => ({ ...prev, errors }))}
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
            />
          )}
        </div>
      </div>
      
      <NavigationButtons 
        step={step}
        handlePrevious={handlePrevious}
        handleNext={handleNext}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        getStepSequence={getStepSequence}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSubmit={() => {
          setIsTemplateModalOpen(false);
          fetchTemplates(1, false);
        }}
      />
    </div>
  );
};

export default BroadcastForm;