import React from 'react';

const BroadcastHeader = ({ onClose, highlightClose }) => {
  return (
    <div className="flex justify-between items-center mb-4  pb-3 ">
      <button
        onClick={onClose}
        className={`absolute top-2 right-4 pb-2 text-3xl font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
          highlightClose
            ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
            : "bg-[#0AA89E] text-white hover:bg-[#08847C] "
        }`}
      >
        ×
      </button>
    </div>
  );
};

export default BroadcastHeader; 