import { useEffect, useRef, useCallback, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Contact2,
  FileText,
  MessageCircle,
  Megaphone,
  Settings,
  HelpCircle,
  List,
  Compass,
  Users,
  ChevronDown,
  UserRound,
  Contact,
  FolderKanban,
  Workflow,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import FloatingSubmenu from "./FloatingSubmenu";

const Sidebar = ({ isOpen, setIsOpen, className = "" }) => {
  const sidebarRef = useRef(null);
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const [submenuPosition, setSubmenuPosition] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [submenuHovered, setSubmenuHovered] = useState(false);
  const closeTimeoutRef = useRef(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={22} />,
      path: "/dashboard",
    },
    { name: "Campaign", icon: <Megaphone size={22} />, path: "/broadcast" },
    { name: "LiveChat", icon: <MessageCircle size={22} />, path: "/chats" },
    {
      name: "My Contact",
      icon: <UserRound size={22} />,
      submenu: true,
      submenuItems: [
        { name: "Contact List", path: "/contact", icon: <Contact size={20} /> },
        { name: "Group", path: "/contact/group", icon: <Users size={20} /> },
      ],
    },
    {
      name: "Templates",
      icon: <FolderKanban size={22} />,
      submenu: true,
      submenuItems: [
        { name: "Template List", path: "/templates", icon: <List size={20} /> },
        {
          name: "Explore Templates",
          path: "/templates/explore",
          icon: <Compass size={20} />,
        },
      ],
    },
    { name: "Flow", icon: <Workflow size={22} />, path: "/flow" },
    { name: "Setting", icon: <Settings size={22} />, path: "/settings" },
    { name: "Help", icon: <HelpCircle size={22} />, path: "/help" },
  ];

  const handleClickOutside = useCallback(
    (event) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth < 1024
      ) {
        setIsOpen(false);
      }
    },
    [isOpen, setIsOpen]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    setActiveSubmenu(null);
  }, [location.pathname]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleNavClick = () => {
    const isDesktop = window.innerWidth >= 1024;
    const shouldCloseOnDesktop = submenuHovered || activeSubmenu;

    if (!isDesktop || shouldCloseOnDesktop) {
      setIsOpen(false);
    }

    setSubmenuHovered(false);
    setActiveSubmenu(null);
    setSubmenuPosition(null);
  };

  const handleMouseEnter = (e, itemName) => {
    if (window.innerWidth >= 1024) {
      // Clear any pending close timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      setActiveSubmenu(itemName);
      setSubmenuPosition({
        top: rect.top,
        left: 260,
      });
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) {
      // Set a timeout to close the submenu
      closeTimeoutRef.current = setTimeout(() => {
        if (!submenuHovered) {
          setActiveSubmenu(null);
          setSubmenuPosition(null);
        }
        closeTimeoutRef.current = null;
      }, 150);
    }
  };

  const handleSubmenuMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSubmenuHovered(true);
  };

  const handleSubmenuMouseLeave = () => {
    setSubmenuHovered(false);
    setActiveSubmenu(null);
    setSubmenuPosition(null);
  };

  const toggleMobileSubmenu = (itemName) => {
    if (window.innerWidth < 1024) {
      setActiveSubmenu(activeSubmenu === itemName ? null : itemName);
    }
  };

  useEffect(() => {
    if (submenuHovered || activeSubmenu) {
      const timeout = setTimeout(() => setIsSidebarExpanded(true), 300);
      return () => clearTimeout(timeout);
    } else {
      setIsSidebarExpanded(false);
    }
  }, [submenuHovered, activeSubmenu]);

  return (
    <div
      ref={sidebarRef}
      role="navigation"
      className={`
        fixed top-0 left-0 z-50 lg:z-auto h-screen
        bg-white text-black flex flex-col
        transition-all duration-300 ease-in-out
        group
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:top-0 lg:h-auto
        lg:w-22 lg:hover:w-64
        shadow-2xl lg:shadow-2xl
        ${submenuHovered ? "lg:w-64" : "lg:w-20 lg:hover:w-64"}
        ${className}
      `}
    >
      <div className="px-4 py-5 border-b border-gray-200 lg:hidden shrink-0">
        <NavLink to="/" onClick={handleNavClick}>
          <img src="/logo.png" alt="Logo" className="h-8" />
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative scrollbar-hide">
        {menuItems.map((item) => {
          const isParentActive =
            item.submenu &&
            item.submenuItems?.some((sub) => location.pathname === sub.path);

          return item.submenu ? (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={(e) => handleMouseEnter(e, item.name)}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-base shadow-sm cursor-pointer transition-all duration-200
                  ${
                    isParentActive
                      ? "bg-teal-500 text-white"
                      : "bg-white hover:bg-gray-100 text-black"
                  }
                `}
                onClick={() => toggleMobileSubmenu(item.name)}
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  {item.icon}
                </span>
                <span
                  className={`
    whitespace-nowrap overflow-hidden 
    transition-all duration-300 
    ml-0 
    opacity-100
    group-hover:ml-1 group-hover:opacity-100
    ${submenuHovered ? "lg:opacity-100 lg:ml-1" : ""}
  `}
                >
                  {item.name}
                </span>
                <span className="lg:hidden">
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${
                      activeSubmenu === item.name ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </div>

              {activeSubmenu === item.name && (
                <div className="lg:hidden mt-1 flex flex-col gap-2">
                  {item.submenuItems.map((sub) => (
                    <NavLink
                      key={sub.name}
                      to={sub.path}
                      end
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-base shadow-sm transition-all duration-200 ${
                          isActive
                            ? "bg-teal-500 text-white"
                            : "bg-white text-black hover:bg-gray-100"
                        }`
                      }
                    >
                      <span className="w-5 h-5 flex items-center justify-center">
                        {sub.icon}
                      </span>
                      <span>{sub.name}</span>
                    </NavLink>
                  ))}
                </div>
              )}

              {activeSubmenu === item.name && (
                <div className="hidden lg:block">
                  <FloatingSubmenu
                    position={submenuPosition}
                    visible={true}
                    onMouseEnter={handleSubmenuMouseEnter}
                    onMouseLeave={handleSubmenuMouseLeave}
                  >
                    {item.submenuItems.map((sub) => (
                      <NavLink
                        key={sub.name}
                        to={sub.path}
                        end
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `flex items-center gap-4 px-3 py-3 my-2 rounded-xl font-large text-base shadow-sm transition-all duration-200 ${
                            isActive
                              ? "bg-teal-500 text-white"
                              : "bg-white text-black hover:bg-gray-100"
                          }`
                        }
                      >
                        <span className="w-5 h-5 flex items-center justify-center">
                          {sub.icon}
                        </span>
                        <span>{sub.name}</span>
                      </NavLink>
                    ))}
                  </FloatingSubmenu>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={item.name}
              to={item.path}
              end
              onClick={handleNavClick}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-base shadow-sm transition-all duration-200 ${
                  isActive
                    ? "bg-teal-500 text-white"
                    : "bg-white text-black hover:bg-gray-100"
                }`
              }
            >
              <span className="w-5 h-5 flex items-center justify-center relative">
                {item.icon}
                {item.name === "LiveChat" && unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-3 inline-flex items-center justify-center min-w-[20px] h-5 px-2 text-xs font-bold leading-none text-white rounded-full shadow"
                    style={{ backgroundColor: "#0AA89E" }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </span>
              <span
                className={`
    whitespace-nowrap overflow-hidden 
    transition-all duration-300 
    ml-0 opacity-100
    group-hover:ml-1 group-hover:opacity-100
    ${submenuHovered ? "lg:opacity-100 lg:ml-1" : ""}
  `}
              >
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
