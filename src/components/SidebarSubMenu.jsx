import { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FileText,
  List,
  Compass,
  Contact2,
  Users,
  ChevronRight,
} from "lucide-react";

const SidebarSubMenu = ({ isOpen, setIsOpen, item }) => {
  const location = useLocation();
  // Determine if the submenu is active based on the item
  const isTemplates = item.name === "Templates";
  const isMyContact = item.name === "My Contact";
  const isActive = isTemplates
    ? location.pathname.startsWith("/templates")
    : isMyContact
    ? location.pathname.startsWith("/contact")
    : false;

  const [expanded, setExpanded] = useState(false);
  const isMobile = useMemo(() => typeof window !== "undefined" && window.innerWidth < 1024, []);

  const handleToggle = () => {
    if (isMobile) {
      setExpanded((prev) => !prev);
    }
  };

  const showSubmenu = isMobile ? expanded : true;

  // Choose icon and label
  const icon = isTemplates ? <FileText size={22} /> : isMyContact ? <Contact2 size={22} /> : null;
  const label = item.name;

  return (
    <div className="group relative">
      {/* Main Menu Item */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={showSubmenu}
        aria-controls={`${item.name.toLowerCase().replace(/\s/g, '-')}-submenu`}
        className={`flex w-full items-center justify-between gap-4 px-4 py-3 rounded-xl font-medium text-base shadow-sm cursor-pointer transition-all duration-200
          ${
            isActive
              ? "bg-teal-500 text-white"
              : "bg-white text-black hover:bg-gray-100"
          }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-5 h-5 flex items-center justify-center ${
              isActive
                ? "text-white"
                : "text-gray-600 group-hover:text-teal-500"
            }`}
          >
            {icon}
          </span>
          <span>{label}</span>
        </div>
        {/* ChevronRight with hover/click rotation */}
        <ChevronRight
          className={`transition-transform duration-300 ${
            isMobile
              ? expanded
                ? "rotate-90 text-gray-500"
                : "rotate-0 text-gray-500"
              : "group-hover:rotate-90 text-gray-500"
          } ${isActive ? "text-white" : "group-hover:text-teal-500"}`}
        />
      </button>
      {/* Submenu */}
      <div
        id={`${item.name.toLowerCase().replace(/\s/g, '-')}-submenu`}
        className={`mt-2 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 delay-100
          ${
            isMobile
              ? expanded
                ? "max-h-screen opacity-100"
                : "max-h-0 opacity-0"
              : "opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-60 group-hover:overflow-y-auto"
          }`}
      >
        {isTemplates && (
          <>
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
          </>
        )}
        {isMyContact && (
          <>
            <NavLink
              to="/contact"
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
              Contact List
            </NavLink>
            <NavLink
              to="/contact/group"
              onClick={() => isMobile && setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl hover:bg-gray-100 ${
                  isActive ? "text-teal-500 font-semibold" : "text-black"
                }`
              }
            >
              <span className="w-5 h-5 flex items-center justify-center text-gray-600">
                <Users size={22} />
              </span>
              Group
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default SidebarSubMenu;
