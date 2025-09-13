import React from 'react';

const FilterBar = ({ filters, activeFilter, setActiveFilter }) => {
  return (
    <div className="flex items-center gap-4">
      {filters.map((f, i) => (
        <button
          key={i}
          className={`px-4 py-2 min-h-[40px] rounded-md text-sm font-medium transition cursor-pointer ${
            activeFilter === f.label
              ? "bg-[#0AA89E] text-white"
              : "text-gray-700 hover:text-[#0AA89E]"
          }`}
          onClick={() => setActiveFilter(f.label === activeFilter ? null : f.label)}
        >
          {f.label} ({f.count})
        </button>
      ))}
    </div>
  );
};

export default FilterBar;