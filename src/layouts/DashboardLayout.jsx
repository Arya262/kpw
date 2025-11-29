import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotAuthorized from "../components/NotAuthorized";

const DashboardLayout = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  // Routes that need overflow hidden (full-height canvas)
  const isChatRoute = location.pathname.startsWith("/chat");
  const isFlowRoute = location.pathname.startsWith("/flow");
  const needsOverflowHidden = isChatRoute || isFlowRoute;

  // Helper function to normalize routes for comparison
  const normalizeRoute = (route) => {
    // Remove leading slash if present, then add it back consistently
    return `/${route.replace(/^\//, '')}`;
  };

  // Check if current path is allowed
  const isRouteAllowed = () => {
    if (!user || !user.allowed_routes) return true;
    
    const normalizedCurrentPath = normalizeRoute(currentPath);
    return user.allowed_routes.some(allowedRoute => {
      const normalizedAllowedRoute = normalizeRoute(allowedRoute);
      return normalizedCurrentPath === normalizedAllowedRoute;
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        isMenuOpen={isMenuOpen}
        onToggleSidebar={() => setIsMenuOpen(!isMenuOpen)}
      />

      <div className="flex flex-1 overflow-hidden pt-[5px]">
        <Sidebar
          isOpen={isMenuOpen}
          setIsOpen={setIsMenuOpen}
          className="overflow-y-auto"
        />

  

        <main
          className={`flex-1 min-h-0 bg-white ${
            needsOverflowHidden 
              ? "overflow-hidden p-0" 
              : "overflow-y-auto custom-scroll px-2.5 pb-2.5"
          }`}
        >
          {!isRouteAllowed() ? <NotAuthorized /> : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
