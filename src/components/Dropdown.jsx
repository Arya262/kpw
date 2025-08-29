import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function Dropdown({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select option" 
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selected = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative " ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-3 rounded text-sm font-medium shadow-sm hover:bg-gray-50 border border-gray-200 bg-gray-100 focus:outline-none focus:border-teal-500"
      >
        {selected ? (
          <span className={`${selected.color || "text-gray-700"}`}>{selected.label}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute mt-1 w-full border border-gray-200 rounded bg-white shadow-lg z-10 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${
                opt.value === value ? "bg-teal-50 font-semibold" : ""
              } ${opt.color || "text-gray-700"}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
