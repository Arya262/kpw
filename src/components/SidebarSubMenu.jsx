import { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FileText,
  List,
  Compass,
  ChevronRight,
} from "lucide-react";

const SidebarSubMenu = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const isTemplatesActive = location.pathname.startsWith("/templates");
  const [expanded, setExpanded] = useState(false);

  const isMobile = useMemo(() => typeof window !== "undefined" && window.innerWidth < 1024, []);

  const handleToggle = () => {
    if (isMobile) {
      setExpanded((prev) => !prev);
    }
  };

  const showSubmenu = isMobile ? expanded : true;

  return (
    <div className="group relative">
      {/* Main Menu Item */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={showSubmenu}
        aria-controls="template-submenu"
        className={`flex w-full items-center justify-between gap-4 px-4 py-3 rounded-xl font-medium text-base shadow-sm cursor-pointer transition-all duration-200
          ${
            isTemplatesActive
              ? "bg-teal-500 text-white"
              : "bg-white text-black hover:bg-gray-100"
          }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-5 h-5 flex items-center justify-center ${
              isTemplatesActive
                ? "text-white"
                : "text-gray-600 group-hover:text-teal-500"
            }`}
          >
            <FileText size={22} />
          </span>
          <span>Templates</span>
        </div>

        {/* ChevronRight with hover/click rotation */}
        <ChevronRight
          className={`transition-transform duration-300 ${
            isMobile
              ? expanded
                ? "rotate-90 text-gray-500"
                : "rotate-0 text-gray-500"
              : "group-hover:rotate-90 text-gray-500"
          } ${isTemplatesActive ? "text-white" : "group-hover:text-teal-500"}`}
        />
      </button>

      {/* Submenu */}
      <div
        id="template-submenu"
        className={`mt-2 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 delay-100
          ${
            isMobile
              ? expanded
                ? "max-h-screen opacity-100"
                : "max-h-0 opacity-0"
              : "opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-60 group-hover:overflow-y-auto"
          }`}
      >
        <NavLink
          to="/templates"
          end
          onClick={() => isMobile && setIsOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl hover:bg-gray-100 ${
              isActive ? "text-teal-500 font-semibold" : "text-black"
            }`
          }
        >
          <span className="w-5 h-5 flex items-center justify-center text-gray-600">
            <List size={22} />
          </span>
          Template List
        </NavLink>

        <NavLink
          to="/templates/explore"
          onClick={() => isMobile && setIsOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl hover:bg-gray-100 ${
              isActive ? "text-teal-500 font-semibold" : "text-black"
            }`
          }
        >
          <span className="w-5 h-5 flex items-center justify-center text-gray-600">
            <Compass size={22} />
          </span>
          Explore Templates
        </NavLink>
      </div>
    </div>
  );
};

export default SidebarSubMenu;
