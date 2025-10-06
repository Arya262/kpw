import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const FloatingSubmenu = ({
  children,
  position,
  visible,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [safePosition, setSafePosition] = useState(position);

  useEffect(() => {
    if (!position) return;

    const padding = 10; 
    const maxLeft = window.innerWidth - 224 - padding; // fixed width for desktop
    const maxTop = window.innerHeight - 300 - padding; // adjust if submenu taller

    setSafePosition({
      top: Math.min(position.top, maxTop),
      left: Math.min(position.left, maxLeft),
    });
  }, [position]);

  if (!visible || !position) return null;

  return createPortal(
    <div
      className={`absolute z-[9999] bg-white shadow-lg rounded-lg p-2 transition-all duration-200 ease-in-out transform
        lg:border lg:border-gray-300 lg:w-56 w-auto  // fixed width on desktop, auto on mobile
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      style={{
        top: `${safePosition.top}px`,
        left: `${safePosition.left}px`,
      }}
      role="menu"
      aria-hidden={!visible}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex flex-col w-full">{children}</div> 
    </div>,
    document.body
  );
};

export default FloatingSubmenu;
