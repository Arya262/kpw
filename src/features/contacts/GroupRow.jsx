import React, { useState, useRef, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import ContactList from "./ContactList";

function PortalDropdown({ children, position, onClose }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        if (onClose) onClose();
      }
    };
    const handleScroll = () => {
      if (onClose) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 9999,
        minWidth: 176,
      }}
      className="bg-white border border-gray-200 rounded-md shadow-lg"
    >
      {children}
    </div>,
    document.body
  );
}

export default function GroupRow({
  group,
  isChecked,
  onCheckboxChange,
  onEditClick,
  onDeleteClick,
  isDeleting,
}) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [shouldFlipUp, setShouldFlipUp] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const dropdownBtnRef = useRef(null);
  const rowRef = useRef(null);

  const openDropdown = () => {
    setDropdownOpen(true);
    if (dropdownBtnRef.current) {
      const rect = dropdownBtnRef.current.getBoundingClientRect();
      setShouldFlipUp(window.innerHeight - rect.bottom < 220);
      setDropdownPos({
        top: window.scrollY + (window.innerHeight - rect.bottom < 220 ? rect.top - 120 : rect.bottom),
        left: window.scrollX + rect.right - 176,
      });
    }
  };

  useEffect(() => {
    if (!isDropdownOpen) setDropdownPos(null);
  }, [isDropdownOpen]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
    if (hasTime) {
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return (
        <div className="flex flex-col">
          <span>{formattedDate}</span>
          <span>{formattedTime}</span>
        </div>
      );
    }
    return <span>{formattedDate}</span>;
  };

  return (
    <tr ref={rowRef} className="border-t border-b border-b-[#C3C3C3] hover:bg-gray-50 text-md">
      <td className="px-2 py-4 sm:px-4">
        <div className="flex items-center justify-center h-full">
          <input
            type="checkbox"
            className="form-checkbox w-4 h-4"
            checked={isChecked}
            onChange={onCheckboxChange}
            aria-label={`Select group ${group.name}`}
          />
        </div>
      </td>
      <td className="px-2 py-4 sm:px-4 whitespace-nowrap text-[12px] sm:text-[16px] text-gray-700 font-semibold cursor-pointer" onClick={() => onEditClick(group)}>
        {group.name}
      </td>
      <td className="px-2 py-4 text-[12px] sm:text-[16px] text-gray-700">
        {group.description || "-"}
      </td>
      <td className="px-2 py-4 text-[12px] sm:text-[16px] text-gray-700">
        {group.category || "Imported Data"}
      </td>
      <td className="px-2 py-4 text-[12px] sm:text-[16px] text-center text-gray-700">
        {group.total_contacts || 0}
      </td>
      <td className="px-2 py-4 text-[12px] sm:text-[16px] text-center text-gray-700">
        {group.store_mapped || "All stores"}
      </td>
      <td className="px-2 py-4 text-[12px] sm:text-[16px] text-center text-gray-700">
        {group.created_at ? formatDate(group.created_at) : "-"}
      </td>
      <td className="relative py-4">
        <div className="flex justify-center">
          <button
            ref={dropdownBtnRef}
            onClick={openDropdown}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none cursor-pointer"
            aria-label="Group options"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 5v.01M12 12v.01M12 19v.01"
              />
            </svg>
          </button>
          {isDropdownOpen && dropdownPos && (
            <PortalDropdown position={dropdownPos} onClose={() => setDropdownOpen(false)}>
              <button
                onClick={() => { setDropdownOpen(false); onEditClick(group); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Edit Group
              </button>
              <button
                onClick={() => { setDropdownOpen(false); onDeleteClick(group); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </PortalDropdown>
          )}
        </div>
      </td>
    </tr>
  );
} 