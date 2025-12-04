import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SequenceInfoStep from "./SequenceInfoStep";
import TriggerConditionStep from "./TriggerConditionStep";
import DripMessageStep from "./DripMessageStep";
import WizardProgress from "./components/WizardProgress";
import WizardNavigation from "./components/WizardNavigation";
import { useSequenceWizard } from "./hooks/useSequenceWizard";
import { WIZARD_STEPS } from "./utils/sequenceValidation";

const SeqModal = ({ onClose, isOpen }) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [direction, setDirection] = useState(1);

  const {
    step,
    error,
    fieldErrors,
    isSubmitting,
    seqData,
    setSeqData,
    handleNext,
    handlePrev,
    handleFinish,
    hasUnsavedChanges,
  } = useSequenceWizard(onClose);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasUnsavedChanges]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowExitConfirm(false);
    onClose();
  };

  const handleNextWithDirection = () => {
    setDirection(1);
    handleNext();
  };

  const handlePrevWithDirection = () => {
    setDirection(-1);
    handlePrev();
  };

  // Step transition variants
  const stepVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir < 0 ? 30 : -30,
      opacity: 0,
    }),
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-xl relative shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Create Drip Sequence</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Step {step} of {WIZARD_STEPS.length}: {WIZARD_STEPS[step - 1]?.title}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                title="Close (Esc)"
              >
                <span className="text-xl font-semibold">×</span>
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mt-4">
              <WizardProgress currentStep={step} showLabels={false} />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
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

            {/* Navigation */}
            <WizardNavigation
              step={step}
              totalSteps={WIZARD_STEPS.length}
              onPrev={handlePrevWithDirection}
              onNext={handleNextWithDirection}
              onFinish={handleFinish}
              isSubmitting={isSubmitting}
              className="mt-6 pt-4 border-t border-gray-200"
            />
          </div>
        </motion.div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AnimatePresence>
        {showExitConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setShowExitConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-[60] p-4"
            >
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Discard Changes?</h3>
                <p className="text-gray-600 text-sm mb-6">
                  You have unsaved changes. Are you sure you want to close? Your progress will be lost.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={confirmClose}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SeqModal;
