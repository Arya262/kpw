import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import SequenceInfoStep from "./SequenceInfoStep";
import TriggerConditionStep from "./TriggerConditionStep";
import DripMessageStep from "./DripMessageStep";
import WizardProgress from "./components/WizardProgress";
import WizardNavigation from "./components/WizardNavigation";
import { useSequenceWizard } from "./hooks/useSequenceWizard";
import { WIZARD_STEPS } from "./utils/sequenceValidation";
import Loader from "../../components/Loader";

const CreateDrip = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dripId = searchParams.get("id");
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const {
    step,
    error,
    fieldErrors,
    isSubmitting,
    isLoading,
    isEditMode,
    seqData,
    setSeqData,
    handleNext,
    handlePrev,
    handleFinish,
    handleSaveDraft,
    hasUnsavedChanges,
    isSavingDraft,
  } = useSequenceWizard(() => navigate("/autocampaign"), dripId);

 
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleBackClick = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingNavigation("/autocampaign");
      setShowExitDialog(true);
    } else {
      navigate("/autocampaign");
    }
  }, [hasUnsavedChanges, navigate]);

  const confirmExit = () => {
    setShowExitDialog(false);
   
    toast.dismiss();
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const cancelExit = () => {
    setShowExitDialog(false);
    setPendingNavigation(null);
  };


  const stepVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6">
     
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEditMode ? "Edit Drip Sequence" : "Create Drip Sequence"}
            </h1>
            <p className="text-sm text-gray-600">
              Step {step} of {WIZARD_STEPS.length}: {WIZARD_STEPS[step - 1]?.title}
            </p>
          </div>
        </div>

     
        <button
          onClick={handleSaveDraft}
          disabled={isSavingDraft || !seqData.drip_name}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSavingDraft ? "Saving..." : "Save Draft"}
        </button>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <WizardProgress currentStep={step} />
      </div>

      {/* Step Content with Animation */}
      <AnimatePresence mode="wait" custom={step}>
        <motion.div
          key={step}
          custom={step}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {step === 1 && (
            <SequenceInfoStep
              seqData={seqData}
              setSeqData={setSeqData}
              fieldErrors={fieldErrors}
            />
          )}
          {step === 2 && (
            <TriggerConditionStep
              seqData={seqData}
              setSeqData={setSeqData}
              fieldErrors={fieldErrors}
            />
          )}
          {step === 3 && (
            <DripMessageStep
              seqData={seqData}
              setSeqData={setSeqData}
              fieldErrors={fieldErrors}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium text-center">{error}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <WizardNavigation
        step={step}
        totalSteps={WIZARD_STEPS.length}
        onPrev={handlePrev}
        onNext={handleNext}
        onFinish={handleFinish}
        isSubmitting={isSubmitting}
        className="mt-8"
      />

      {/* Unsaved Changes Dialog */}
      <AnimatePresence>
        {showExitDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={cancelExit}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unsaved Changes</h3>
                <p className="text-gray-600 text-sm mb-6">
                  You have unsaved changes. Are you sure you want to leave? Your progress will be lost.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelExit}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Stay
                  </button>
                  <button
                    onClick={confirmExit}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Leave
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateDrip;
