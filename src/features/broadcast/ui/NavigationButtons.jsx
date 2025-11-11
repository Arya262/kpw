import React from "react";
import { Send } from "lucide-react";
import { isContactLimitExceeded, getMessageLimit } from "../utils/messageLimits";
import { hasSufficientBalance } from "../utils/costCalculation";

const NavigationButtons = ({
  step,
  handlePrevious,
  handleNext,
  handleSubmit,
  isSubmitting,
  getStepSequence,
  estimatedCost,
  availableWCC,
  totalSelectedContacts,
  wabaInfo
}) => {
  const messageLimit = getMessageLimit(wabaInfo);
  const isContactLimitExceededFlag = isContactLimitExceeded(totalSelectedContacts, wabaInfo);
  const isInsufficientBalance = !hasSufficientBalance(estimatedCost, availableWCC);
  const isSendDisabled = isSubmitting || isContactLimitExceededFlag || isInsufficientBalance;
  const sequence = getStepSequence();
  const isLastStep = step === sequence[sequence.length - 1];
  
  return (
    <div className="bg-white p-3 sm:p-4 rounded-b-xl">
      <div className="flex justify-between items-center gap-3">
        {step > sequence[0] && (
          <button
            type="button"
            onClick={handlePrevious}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer font-medium text-sm sm:text-base flex-shrink-0"
          >
            <span className="hidden sm:inline">← Previous</span>
            <span className="sm:hidden">← Back</span>
          </button>
        )}
        <div style={{ marginLeft: step === sequence[0] ? "auto" : "0" }} className="flex-shrink-0">
          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer font-medium text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Next →</span>
              <span className="sm:hidden">Next</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSendDisabled}
              className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg flex items-center justify-center transition-colors font-medium cursor-pointer text-sm sm:text-base ${
                isSendDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-teal-500 hover:bg-teal-600 text-white"
              }`}
              title={isContactLimitExceededFlag 
                ? `Audience size exceeds ${messageLimit.toLocaleString()} contacts. Please reduce the number of contacts.` 
                : isInsufficientBalance 
                  ? 'Insufficient balance. Please add more credits to your account.' 
                  : ''
              }
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4">
                    </circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="hidden sm:inline">Sending Campaign...</span>
                  <span className="sm:hidden">Sending...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline-flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Campaign
                  </span>

                  <span className="sm:hidden inline-flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationButtons;