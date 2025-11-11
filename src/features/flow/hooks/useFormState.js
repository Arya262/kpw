import { useState } from "react";
import { DEFAULT_PERMISSIONS } from "../../../constants/permissionTemplates";

export const useFormState = (initialState = {}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobileNo: "",
    role: "user",
    allowedRoutes: [],
    permissions: DEFAULT_PERMISSIONS,
    ...initialState,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleRoute = (routeKey) => {
    setFormData((prev) => ({
      ...prev,
      allowedRoutes: prev.allowedRoutes.includes(routeKey)
        ? prev.allowedRoutes.filter((r) => r !== routeKey)
        : [...prev.allowedRoutes, routeKey],
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      mobileNo: "",
      role: "subuser",
      allowedRoutes: [],
      permissions: DEFAULT_PERMISSIONS,
    });
  };

  const loadUserData = (user) => {
    const [firstName, ...rest] = (user.name || "").split(" ");
    
    // Handle permissions - use provided permissions or default
    // If permissions is null, undefined, or empty object, use default (all false)
    // Otherwise merge provided permissions with defaults
    let userPermissions = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)); // Deep clone
    
    if (user.permissions && 
        typeof user.permissions === 'object' && 
        user.permissions !== null &&
        !Array.isArray(user.permissions)) {
      
      // Check if permissions object has any keys (not empty)
      const hasPermissions = Object.keys(user.permissions).length > 0;
      
      console.log('Loading permissions:', {
        hasPermissions,
        userPermissionsFromAPI: user.permissions,
        keys: Object.keys(user.permissions)
      });
      
      if (hasPermissions) {
        // Merge provided permissions with defaults to ensure all modules/actions are present
        Object.keys(DEFAULT_PERMISSIONS).forEach(module => {
          if (user.permissions[module] && typeof user.permissions[module] === 'object') {
            // Merge module permissions
            userPermissions[module] = {
              ...DEFAULT_PERMISSIONS[module],
              ...user.permissions[module],
            };
          } else {
            // Module not in user permissions, use default
            userPermissions[module] = DEFAULT_PERMISSIONS[module];
          }
        });
      }
      // If empty object, userPermissions stays as DEFAULT_PERMISSIONS
    } else {
      console.log('No permissions found, using defaults. user.permissions:', user.permissions);
    }
    
    console.log('Final loaded permissions:', userPermissions);
    
    setFormData({
      firstName: firstName || "",
      lastName: rest.join(" ") || "",
      email: user.email || "",
      password: "",
      mobileNo: user.mobile_no || "",
      role: user.role || "subuser",
      allowedRoutes: user.allowed_routes || [],
      permissions: userPermissions,
    });
  };

  const updatePermission = (module, action, value) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: value,
        },
      },
    }));
  };

  const getApiPayload = () => ({
    name: `${formData.firstName} ${formData.lastName}`.trim(),
    email: formData.email,
    mobile_no: formData.mobileNo,
    password: formData.password,
    role: formData.role,
    allowed_routes: formData.allowedRoutes,
    permissions: formData.permissions,
  });

  return {
    formData,
    updateField,
    toggleRoute,
    updatePermission,
    resetForm,
    loadUserData,
    getApiPayload,
  };
};
