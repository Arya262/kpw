import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const PortalDropdown = ({ children, position, onClose }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleScroll = (e) => {
      if (e.target === document || e.target === window) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll);
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
};

export default PortalDropdown;