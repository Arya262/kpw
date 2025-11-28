const WizardNavigation = ({
  step,
  totalSteps = 3,
  onPrev,
  onNext,
  onFinish,
  isSubmitting,
  className = "",
}) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div>
        {step !== 1 && (
          <button
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium rounded-lg py-3 px-6 border border-gray-300 transition-colors"
            onClick={onPrev}
          >
            ← Previous
          </button>
        )}
      </div>
      <div>
        {step === totalSteps ? (
          <button
            onClick={onFinish}
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg py-3 px-6 transition-colors shadow-sm"
          >
            {isSubmitting ? "Creating..." : "Finish & Create"}
          </button>
        ) : (
          <button
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg py-3 px-6 transition-colors shadow-sm"
            onClick={onNext}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default WizardNavigation;
