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
    const maxLeft = window.innerWidth - 200 - padding;
    const maxTop = window.innerHeight - 200 - padding;

    setSafePosition({
      top: Math.min(position.top, maxTop),
      left: Math.min(position.left, maxLeft),
    });
  }, [position]);

  if (!visible || !position) return null;

  return createPortal(
    <div
      className={`absolute z-[9999] bg-white shadow-lg rounded-lg min-w-[180px] p-2 transition-all duration-200 ease-in-out transform 
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
      {children}
    </div>,
    document.body
  );
};

export default FloatingSubmenu;
