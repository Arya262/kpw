import React, { useCallback } from "react";
import FormInput from "./FormInput";
import RoutePermissionsSection from "./RoutePermissionsSection";

const UserFormModal = React.memo(({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onUpdateField,
  onToggleRoute,
  roleOptions,
  allRoutes,
  isEdit = false,
  title,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent multiple submissions
    
    if (!formData.firstName.trim() || !formData.email.trim()) {
      return;
    }
    
    if (!isEdit && !formData.password.trim()) {
      return;
    }

    await onSubmit();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 transition-all duration-300"
      onClick={handleBackdropClick}
    >
      <div
        className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl text-gray-500 p-6 w-full relative border border-gray-300 animate-slideUp max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors bg-gray-100 cursor-pointer"
          aria-label="Close modal"
        >
          ×
        </button>
        
        <h2 className="text-xl font-semibold mb-4 text-black">
          {title}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col" autoComplete="off">
          {/* Name Fields */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full md:w-1/2">
              <FormInput
                label="First Name"
                value={formData.firstName}
                onChange={(e) => onUpdateField("firstName", e.target.value)}
                placeholder="Enter first name"
                required
                name="firstName"
              />
            </div>
            <div className="w-full md:w-1/2">
              <FormInput
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => onUpdateField("lastName", e.target.value)}
                placeholder="Enter last name"
                name="lastName"
              />
            </div>
          </div>

          {/* Email and Password */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full md:w-1/2">
              <FormInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => onUpdateField("email", e.target.value)}
                placeholder="Enter email"
                required={!isEdit}
                disabled={isEdit}
                name="email"
                autoComplete={isEdit ? "off" : "new-email"}
              />
            </div>
            <div className="w-full md:w-1/2">
              <FormInput
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => onUpdateField("password", e.target.value)}
                placeholder={isEdit ? "Enter new password (leave blank to keep unchanged)" : "Enter password"}
                required={!isEdit}
                name="password"
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Mobile and Role */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full md:w-1/2">
              <FormInput
                label="Mobile No"
                value={formData.mobileNo}
                onChange={(e) => onUpdateField("mobileNo", e.target.value)}
                placeholder="Enter mobile number"
                name="mobileNo"
              />
            </div>
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => onUpdateField("role", e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md text-gray-700 h-[38px] focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] transition-all duration-150 ease-in-out bg-white"
                required
                disabled={isEdit && formData.role === "owner"}
              >
                {roleOptions
                  .filter((r) => r.value !== "owner")
                  .map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Route Permissions */}
          <RoutePermissionsSection
            allowedRoutes={formData.allowedRoutes}
            onToggleRoute={onToggleRoute}
            allRoutes={allRoutes}
          />

          {/* Form Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 rounded-md transition font-medium shadow-sm ${
                isLoading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-[#0AA89E] text-white cursor-pointer hover:bg-[#0998a8]"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isEdit ? "Saving..." : "Adding..."}
                </div>
              ) : (
                isEdit ? "Save" : "Add User"
              )}
            </button>
            <button
              type="button"
              disabled={isLoading}
              className={`px-6 py-2 rounded-md transition font-medium shadow-sm ${
                isLoading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400 cursor-pointer"
              }`}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default UserFormModal;
