import React from "react";

const NavigationButtons = ({
  step,
  handlePrevious,
  handleNext,
  handleSubmit,
  isSubmitting,
  getStepSequence
}) => {
  const sequence = getStepSequence();
  const isLastStep = step === sequence[sequence.length - 1];
  
  return (
    <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
      <div className="flex justify-between">
        {step > sequence[0] && (
          <button
            type="button"
            onClick={handlePrevious}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
          >
            Previous
          </button>
        )}
        <div style={{ marginLeft: step === sequence[0] ? "auto" : "0" }}>
          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg flex items-center justify-center transition-colors font-medium cursor-pointer ${
                isSubmitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-teal-500 hover:bg-teal-600 text-white"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Now"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationButtons;