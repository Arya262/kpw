import React from "react";

const RoutePermissionsSection = ({ 
  allowedRoutes, 
  onToggleRoute, 
  allRoutes 
}) => {
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        Allowed Routes
      </label>
      <div className="flex flex-wrap gap-4">
        {allRoutes.map((route) => (
          <label
            key={route.key}
            className="flex items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              checked={allowedRoutes.includes(route.key)}
              onChange={() => onToggleRoute(route.key)}
            />
            {route.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default RoutePermissionsSection;
