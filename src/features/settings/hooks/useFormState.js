import { useState } from "react";

export const useFormState = (initialState = {}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobileNo: "",
    role: "user",
    allowedRoutes: [],
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
    });
  };

  const loadUserData = (user) => {
    const [firstName, ...rest] = (user.name || "").split(" ");
    setFormData({
      firstName: firstName || "",
      lastName: rest.join(" ") || "",
      email: user.email || "",
      password: "",
      mobileNo: user.mobile_no || "",
      role: user.role || "subuser",
      allowedRoutes: user.allowed_routes || [],
    });
  };


  const getApiPayload = () => ({
    name: `${formData.firstName} ${formData.lastName}`.trim(),
    email: formData.email,
    mobile_no: formData.mobileNo,
    password: formData.password,
    role: formData.role,
    allowed_routes: formData.allowedRoutes,
  });

  return {
    formData,
    updateField,
    toggleRoute,
    resetForm,
    loadUserData,
    getApiPayload,
  };
};
