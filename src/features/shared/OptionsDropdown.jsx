import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Trash2 } from 'lucide-react';

export default function OptionsDropdown({
  onEdit,
  onDelete,
  items = [
    { label: 'Edit', icon: <Edit2 className="w-4 h-4" />, onClick: onEdit, className: 'text-gray-700' },
    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: onDelete, className: 'text-red-600' },
  ],
  buttonClassName = 'p-2 rounded-full hover:bg-gray-100',
  dropdownClassName = 'w-44 bg-white border border-gray-200 rounded-md shadow-lg z-20',
  menuButton = (
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
  ),
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldFlipUp, setShouldFlipUp] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleDropdown = () => {
    const next = !isOpen;
    if (next && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setShouldFlipUp(spaceBelow < 160);
    }
    setIsOpen(next);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = shouldFlipUp 
        ? `${rect.top - 160}px` 
        : `${rect.bottom}px`;
      
      setPosition({
        top,
        left: `${rect.right - 176}px`, // 176px is the dropdown width
        width: '176px'
      });
    }
  }, [isOpen, shouldFlipUp]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={buttonClassName}
        aria-label="Options"
      >
        {menuButton}
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className={`fixed ${dropdownClassName}`}
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
            zIndex: 9999
          }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick?.(e);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${item.className || ''}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
