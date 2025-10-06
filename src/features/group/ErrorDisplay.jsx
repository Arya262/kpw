import React from "react";

const ErrorDisplay = ({ error, setError }) => {
  if (!error) return null;
  return (
    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {error}
      <button
        onClick={() => setError(null)}
        className="float-right font-bold hover:text-red-900"
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  );
};

export default ErrorDisplay;