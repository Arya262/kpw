import { Fragment } from "react";
import { WIZARD_STEPS } from "../utils/sequenceValidation";

const WizardProgress = ({ currentStep, showLabels = true }) => {
  return (
    <div className="flex justify-center">
      <div className="flex items-center space-x-4">
        {WIZARD_STEPS.map((stepItem, index) => (
          <Fragment key={stepItem.number}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep >= stepItem.number
                    ? "bg-teal-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > stepItem.number ? "✓" : stepItem.number}
              </div>
              {showLabels && (
                <span
                  className={`text-xs mt-1 ${
                    currentStep >= stepItem.number
                      ? "text-teal-600 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {stepItem.title}
                </span>
              )}
            </div>
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={`w-12 h-1 rounded ${
                  currentStep > stepItem.number ? "bg-teal-500" : "bg-gray-200"
                }`}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default WizardProgress;
