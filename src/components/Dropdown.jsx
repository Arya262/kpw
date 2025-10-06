import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function Dropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("bottom"); // top or bottom
  const dropdownRef = useRef(null);
  const selected = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
        setSearch(""); // reset search when closed
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine dropdown position based on available space
  useEffect(() => {
    if (open && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
  }, [open]);

  // Filter options based on search
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Determine input text color: gray for placeholder/default, black for user selection
  const inputTextColor = selected ? "text-black" : "text-gray-400";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown button */}
      <div
        className="flex items-center justify-between w-full p-1 rounded text-sm font-medium shadow-sm border border-gray-200 bg-gray-100 focus-within:ring-2 focus-within:ring-teal-500"
      >
        <input
          type="text"
          value={search || (selected ? selected.label : "")}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`flex-1 p-2 bg-transparent outline-none ${inputTextColor}`}
        />
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* Dropdown list */}
      {open && (
        <div
          className={`absolute w-full border border-gray-200 rounded bg-white shadow-lg z-10 max-h-60 overflow-y-auto transition-all duration-150 ${
            position === "bottom" ? "mt-1 top-full" : "mb-1 bottom-full"
          }`}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setSearch(""); 
                }}
                className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${
                  opt.value === value
                    ? "bg-teal-50 font-semibold text-teal-700"
                    : opt.color || "text-gray-700"
                }`}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-400">No options found</div>
          )}
        </div>
      )}
    </div>
  );
}
