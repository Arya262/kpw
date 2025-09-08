import React from "react";

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  inputRef,
  "aria-label": ariaLabel = "Search",
}) => {
  return (
    <div className={`relative max-w-xs ${className}`}>
      <input
        type="text"
        ref={inputRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="pl-3 pr-10 py-2 border border-gray-300 text-sm rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
      />
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </div>
  );
};

export default SearchInput;
