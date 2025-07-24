import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const SidebarSubMenu = ({ isOpen, setIsOpen, item }) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = item.submenuItems?.some((sub) =>
    location.pathname.startsWith(sub.path)
  );

  const handleToggle = () => {
    if (isMobile) {
      setExpanded((prev) => !prev);
    }
  };

  return (
    <div className="group relative">
      {/* Top-level menu item */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isMobile ? expanded : undefined}
        aria-controls={`${item.name.toLowerCase().replace(/\s/g, "-")}-submenu`}
        className={`flex w-full items-center justify-between gap-4 px-4 py-3 rounded-xl font-medium text-base shadow-sm transition-all duration-200 ${
          isActive
            ? "bg-teal-500 text-white"
            : "bg-white text-black hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 flex items-center justify-center">
            {item.icon}
          </span>
          <span>{item.name}</span>
        </div>
        <ChevronRight
          className={`transition-transform duration-300 ${
            isMobile
              ? expanded
                ? "rotate-90"
                : "rotate-0"
              : "group-hover:rotate-90"
          } ${isActive ? "text-white" : "text-gray-500 group-hover:text-teal-500"}`}
        />
      </button>

      {/* Submenu */}
      <div
        id={`${item.name.toLowerCase().replace(/\s/g, "-")}-submenu`}
        aria-hidden={isMobile ? !expanded : true}
        className={`
          mt-2 bg-white border border-gray-200 rounded-xl shadow-md
          transition-all duration-300 overflow-hidden
          ${
            isMobile
              ? expanded
                ? "max-h-screen opacity-100"
                : "max-h-0 opacity-0"
              : "max-h-0 opacity-0 group-hover:max-h-[200px] group-hover:opacity-100"
          }
        `}
      >
        {item.submenuItems?.map((sub) => (
          <NavLink
            key={sub.name}
            to={sub.path}
            end={sub.path === item.path}
            onClick={() => isMobile && setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl hover:bg-gray-100 ${
                isActive ? "text-teal-500 font-semibold" : "text-black"
              }`
            }
          >
            <span className="w-5 h-5 flex items-center justify-center text-gray-600">
              {sub.icon}
            </span>
            {sub.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default SidebarSubMenu;
