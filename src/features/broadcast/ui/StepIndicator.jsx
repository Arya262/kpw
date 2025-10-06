import React from "react";

const StepIndicator = ({ step, getStepSequence }) => {
  const sequence = getStepSequence();
  
  return (
    <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-4 px-2 sm:px-4">
      {sequence.map((stepNumber, index) => (
        <div key={stepNumber} className="flex items-center flex-1">
          <div className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm md:text-base lg:text-lg font-medium
            ${step >= stepNumber ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-600"}`}>
            {stepNumber}
          </div>
          {index < sequence.length - 1 && (
            <div className={`h-0.5 sm:h-0.5 md:h-1 flex-1 mx-0.5 sm:mx-1 ${step > stepNumber ? "bg-teal-500" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;