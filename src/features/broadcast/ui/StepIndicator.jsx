import React from "react";

const StepIndicator = ({ step, getStepSequence }) => {
  const sequence = getStepSequence();
  
  return (
    <div className="flex items-center justify-center mb-8 px-4">
      {sequence.map((stepNumber, index) => (
        <div key={stepNumber} className="flex items-center flex-1">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm sm:text-base md:text-lg font-medium
            ${step >= stepNumber ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-600"}`}>
            {index + 1}
          </div>
          {index < sequence.length - 1 && (
            <div className={`h-0.5 sm:h-0.5 md:h-1 flex-1 mx-1 ${step > stepNumber ? "bg-teal-500" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;