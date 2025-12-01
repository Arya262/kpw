import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Users, Tag, Bell, ChevronRight } from "lucide-react";

const settingsMenu = [
  { name: "Users", path: "/settings", icon: Users, exact: true },
  { name: "Tags", path: "/settings/tags", icon: Tag },
  { name: "Notifications", path: "/settings/notifications", icon: Bell },
];

const SettingsLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-full min-h-[calc(100vh-120px)]">
      {/* Settings Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:block">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Settings</h2>
        </div>
        <nav className="p-2">
          {settingsMenu.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive: navActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    navActive || isActive
                      ? "bg-teal-50 text-teal-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
                {(location.pathname === item.path ||
                  (!item.exact && location.pathname.startsWith(item.path))) && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Mobile Settings Menu */}
      <div className="md:hidden w-full bg-white border-b border-gray-200 p-2 flex gap-2 overflow-x-auto">
        {settingsMenu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 md:p-6 overflow-auto bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsLayout;
