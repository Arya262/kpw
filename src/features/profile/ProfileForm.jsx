import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Dropdown from "../../components/Dropdown";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";

const ProfileForm = ({ onClose }) => {
  const { user } = useAuth();
  const { 
    profileData, 
    loading, 
    error, 
    updateProfileDetails, 
    updateProfileAbout, 
    updateProfilePhoto,
    syncWabaInfo 
  } = useProfile();
  
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [newWebsite, setNewWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract initial values from profile data
  const getInitialValues = () => {
    let description = "";
    let address = "";
    let email = "";
    let vertical = "RESTAURANT";
    let websiteList = [];

    console.log("Profile Data:", profileData); // Debug log

    if (profileData.details && profileData.details.profile) {
      const details = profileData.details.profile;
      console.log("Details:", details); // Debug log
      
      // Check if profile object has actual data (not just empty object)
      if (Object.keys(details).length > 0) {
        description = details.desc || "";
        address = details.address || "";
        email = details.profileEmail || "";
        vertical = details.vertical || "RESTAURANT";
        
        // Set websites
        if (details.website1) websiteList.push(details.website1);
        if (details.website2) websiteList.push(details.website2);
      }
    }
    
    if (profileData.about && profileData.about.about) {
      const about = profileData.about.about.message || "";
      console.log("About:", about); // Debug log
      if (about) description = about;
    }

    const result = { description, address, email, vertical, websiteList };
    console.log("Initial Values:", result); // Debug log
    return result;
  };

  const initialValues = getInitialValues();

  // Update websites and profile picture when data loads
  useEffect(() => {
    if (initialValues.websiteList.length > 0) {
      setWebsites(initialValues.websiteList);
    }
    
    if (profileData.photo) {
      const photoUrl = profileData.photo.message || profileData.photo;
      if (photoUrl) {
        setProfilePic(photoUrl);
      }
    }
  }, [profileData, initialValues.websiteList]);

  const formik = useFormik({
    enableReinitialize: true, // This allows formik to reinitialize when initialValues change
    initialValues: {
      description: initialValues.description,
      address: initialValues.address,
      email: initialValues.email,
      vertical: initialValues.vertical,
    },
    validationSchema: Yup.object({
      description: Yup.string()
        .max(256, "Max 256 characters"),
      address: Yup.string()
        .max(256, "Max 256 characters"),
      email: Yup.string()
        .email("Invalid email format")
        .max(128, "Max 128 characters"),
      vertical: Yup.string(),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Update profile details
        const profileDetails = {
          addLine1: values.address,
          addLine2: "",
          city: "",
          state: "",
          pinCode: "",
          country: "",
          vertical: values.vertical,
          website1: websites[0] || "",
          website2: websites[1] || "",
          desc: values.description,
          profileEmail: values.email,
        };

        await updateProfileDetails(profileDetails);

        // Update profile about (description)
        await updateProfileAbout(values.description);

        // Update profile photo if changed
        if (profilePicFile) {
          await updateProfilePhoto(profilePicFile);
        }

        if (onClose) onClose();
      } catch (error) {
        console.error("Error updating profile:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleAddWebsite = () => {
    if (newWebsite && websites.length < 2) {
      setWebsites([...websites, newWebsite]);
      setNewWebsite("");
    }
  };

  const handleRemoveWebsite = (i) =>
    setWebsites(websites.filter((_, index) => index !== i));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
      setProfilePicFile(file);
    }
  };

  // Show loading state
  if (loading && !profileData.details) {
    return (
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-center p-8">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
          <button
            type="button"
            onClick={syncWabaInfo}
            disabled={loading}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
          >
            {loading ? "Syncing..." : "Sync WABA"}
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-7 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 pt-2 rounded-full transition-colors cursor-pointer bg-gray-100"
          >
            ×
          </button>
      </div>

      <div className="p-6 overflow-y-auto scrollbar-hide max-h-[80vh]">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Profile Setup Notice */}
        {profileData.details && profileData.details.profile && Object.keys(profileData.details.profile).length === 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Set Up Your Business Profile
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Your business profile hasn't been set up yet. Fill out the form below to create your WhatsApp Business profile with Gupshup.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Profile Picture */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-yellow-200 flex items-center justify-center overflow-hidden">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="text-3xl">👤</div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Max size 5MB allowed, Image size of 640x640 recommended.Image with a height or width of less than 192px may cause issues.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => document.getElementById("fileInput").click()}
                className="bg-[#0AA89E] text-white hover:bg-[#0a9189] px-4 py-2 rounded-lg cursor-pointer"
              >
                Add New
              </button>
              <button
                type="button"
                onClick={() => setProfilePic(null)}
                disabled={!profilePic}
                className={`px-4 py-2 rounded-md border ${profilePic
                    ? "text-gray-700 border-gray-300 hover:bg-gray-100"
                    : "text-gray-400 border-gray-200 cursor-not-allowed"
                  }`}
              >
                Remove
              </button>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        {/* Formik Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-500">(Optional)</span>
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Description of the business. Maximum of 256 characters.
              </p>
              <textarea
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Description"
                className="border border-transparent bg-gray-100 rounded p-3 text-sm font-medium w-full focus:outline-none focus:border-teal-500"
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.description}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-gray-500">(Optional)</span>
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Address of the business. Maximum of 256 characters.
              </p>
              <textarea
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Address"
                className="border border-transparent bg-gray-100 rounded p-3 text-sm font-medium w-full focus:outline-none focus:border-teal-500"
              />
              {formik.touched.address && formik.errors.address && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.address}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-500">(Optional)</span>
              </label>
              <p className="text-sm text-gray-600 mb-2 min-h-[3rem]">
                Email address (in valid email format) to contact the business. Maximum of 128 characters.
              </p>
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Email"
                className="border border-transparent bg-gray-100 rounded p-3 text-sm font-medium w-full focus:outline-none focus:border-teal-500"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.email}</p>
              )}
            </div>

            {/* Vertical */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vertical <span className="text-gray-500">(Optional)</span>
              </label>
              <p className="text-sm text-gray-600 mb-2 min-h-[3rem]">
                Industry of the business.
              </p>
              <Dropdown
                options={[
                  { value: 'RESTAURANT', label: 'RESTAURANT' },
                  { value: 'RETAIL', label: 'RETAIL' },
                  { value: 'SERVICE', label: 'SERVICE' },
                  { value: 'OTHER', label: 'OTHER' },
                  { value: 'AUTO', label: 'AUTO' },
                  { value: 'BEAUTY', label: 'BEAUTY' },
                  { value: 'APPAREL', label: 'APPAREL' },
                  { value: 'EDU', label: 'EDU' },
                  { value: 'ENTERTAIN', label: 'ENTERTAIN' },
                  { value: 'EVENT_PLAN', label: 'EVENT_PLAN' },
                  { value: 'FINANCE', label: 'FINANCE' },
                  { value: 'GROCERY', label: 'GROCERY' },
                  { value: 'GOVT', label: 'GOVT' },
                  { value: 'HOTEL', label: 'HOTEL' },
                  { value: 'HEALTH', label: 'HEALTH' },
                  { value: 'NONPROFIT', label: 'NONPROFIT' },
                  { value: 'PROF_SERVICES', label: 'PROF_SERVICES' },
                  { value: 'TRAVEL', label: 'TRAVEL' },
                ]}
                value={formik.values.vertical}
                onChange={(value) => formik.setFieldValue('vertical', value)}
                placeholder="Select a vertical"
              />
            </div>
          </div>

          {/* Websites */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Websites
            </label>
            <p className="text-sm text-gray-600 mb-2">
              URLs (including http:// or https://)  associated with the business (e.g, website, Facebook Page, Instagram). Maximum of 2 website with a maximum of 256 characters each.
            </p>
            <div className="space-y-2">
              {websites.map((site, i) => (
                <div key={i} className="flex items-center justify-between border border-transparent rounded-md px-3 py-2 bg-gray-50">
                  <span className="text-sm text-gray-700 truncate">{site}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWebsite(i)}
                    className="text-gray-400 hover:text-red-500 text-lg leading-none"
                  >
                    &times;
                  </button>
                </div>
              ))}

              {websites.length < 2 && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    className="border border-transparent bg-gray-100 rounded p-3 text-sm font-medium w-full focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddWebsite}
                    className="bg-[#0AA89E] text-white hover:bg-[#0a9189]  px-4 py-2 rounded-lg cursor-pointer"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-transparent rounded-md text-gray-700 bg-gray-100 hover:bg-gray-100 focus:outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 border border-transparent bg-[#0AA89E] text-white rounded-lg hover:bg-[#0a9189] focus:outline-none ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
