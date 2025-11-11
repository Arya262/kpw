import React, { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Dropdown from "../../components/Dropdown";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";


const VERTICAL_OPTIONS = [
  "RESTAURANT", "RETAIL", "SERVICE", "OTHER", "AUTO", "BEAUTY",
  "APPAREL", "EDU", "ENTERTAIN", "EVENT_PLAN", "FINANCE", "GROCERY",
  "GOVT", "HOTEL", "HEALTH", "NONPROFIT", "PROF_SERVICES", "TRAVEL"
].map(v => ({ value: v, label: v }));


const websiteSchema = Yup.string()
  .url("Must be a valid URL (e.g., https://...)")
  .max(256, "URL must be max 256 characters.")
  .required("URL cannot be empty.");

const ProfileForm = ({ onClose }) => {
  const { user } = useAuth();
  const {
    profileData,
    loading,
    error,
    updateProfileDetails,
    updateProfileAbout,
    updateProfilePhoto,
    syncWabaInfo,
  } = useProfile();

  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [newWebsite, setNewWebsite] = useState("");
  const [websiteError, setWebsiteError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  const initialValues = useMemo(() => {
    let description = "";
    let address = "";
    let email = "";
    let vertical = "";
    let websiteList = [];

    const details = profileData?.details?.profile;
    if (details && Object.keys(details).length > 0) {
      description = details.desc || "";
      address = details.address || "";
      email = details.profileEmail || "";
      vertical = details.vertical || "";
      if (details.website1) websiteList.push(details.website1);
      if (details.website2) websiteList.push(details.website2);
    }

    const about = profileData?.about?.about?.message;
    if (about) description = about; 

    return { description, address, email, vertical, websites: websiteList };
  }, [profileData]);

 
  useEffect(() => {
    if (profileData?.photo) {
      const photoUrl = profileData.photo.message || profileData.photo;
      if (photoUrl) setProfilePic(photoUrl);
    }
  }, [profileData?.photo]);

 
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      description: Yup.string().trim().max(256, "Max 256 characters"),
      address: Yup.string().trim().max(256, "Max 256 characters"),
      email: Yup.string()
        .email("Invalid email format")
        .max(128, "Max 128 characters"),
      vertical: Yup.string(),
      websites: Yup.array()
        .of(
          Yup.string()
            .url("Must be a valid URL (e.g., https://...)")
            .max(256, "Max 256 characters")
        )
        .max(2, "Maximum 2 websites allowed"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const profileDetails = {
          addLine1: values.address,
          addLine2: "",
          city: "",
          state: "",
          pinCode: "",
          country: "",
          vertical: values.vertical,
          website1: values.websites[0] || "",
          website2: values.websites[1] || "",
          desc: values.description,
          profileEmail: values.email,
        };

        const updatePromises = [
          updateProfileDetails(profileDetails),
          updateProfileAbout(values.description),
        ];

        if (profilePicFile) updatePromises.push(updateProfilePhoto(profilePicFile));

        const results = await Promise.allSettled(updatePromises);
        const failures = results.filter((r) => r.status === "rejected");

        if (failures.length > 0) {
          toast.warn(
            `Saved ${updatePromises.length - failures.length}/${updatePromises.length} changes. Please retry failed ones.`
          );
        } else {
          toast.success("Profile updated successfully!");
          if (onClose) onClose();
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });


  const handleAddWebsite = async () => {
    const url = newWebsite.trim();
    setWebsiteError("");
    if (formik.values.websites.length >= 2) {
      setWebsiteError("Maximum 2 websites allowed.");
      return;
    }
    try {
      await websiteSchema.validate(url);
      formik.setFieldValue("websites", [...formik.values.websites, url]);
      formik.setFieldTouched("websites", true);
      setNewWebsite("");
    } catch (err) {
      if (err instanceof Yup.ValidationError) setWebsiteError(err.message);
    }
  };


  const handleRemoveWebsite = (i) => {
    formik.setFieldValue(
      "websites",
      formik.values.websites.filter((_, index) => index !== i)
    );
    formik.setFieldTouched("websites", true);
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB).");
      e.target.value = "";
      return;
    }
    setProfilePic(URL.createObjectURL(file));
    setProfilePicFile(file);
  };


  useEffect(() => {
    return () => {
      if (profilePic && profilePic.startsWith("blob:")) {
        URL.revokeObjectURL(profilePic);
      }
    };
  }, [profilePic]);


  if (loading && !profileData?.details) {
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

      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 relative">
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
          className="text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer bg-gray-100"
          aria-label="Close profile settings"
        >
          ×
        </button>
      </div>

      <div className="p-6 overflow-y-auto scrollbar-hide max-h-[80vh]">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}


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
              Max size 5MB. Recommended 640x640px. Images below 192px may fail.
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
                onClick={() => {
                  setProfilePic(null);
                  setProfilePicFile(null);
                }}
                disabled={!profilePic}
                className={`px-4 py-2 rounded-md border ${
                  profilePic
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


        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.description && formik.errors.description)}
                aria-describedby="desc-error"
                placeholder="Enter Description"
                className="border border-transparent bg-gray-100 rounded p-3 text-sm font-medium w-full focus:outline-none focus:border-teal-500"
              />
              {formik.touched.description && formik.errors.description && (
                <p id="desc-error" className="text-xs text-red-500 mt-1">
                  {formik.errors.description}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.address && formik.errors.address)}
                aria-describedby="address-error"
                placeholder="Enter Address"
                className="border border-transparent bg-gray-100 rounded p-3 text-sm font-medium w-full focus:outline-none focus:border-teal-500"
              />
              {formik.touched.address && formik.errors.address && (
                <p id="address-error" className="text-xs text-red-500 mt-1">
                  {formik.errors.address}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.email && formik.errors.email)}
                aria-describedby="email-error"
                placeholder="Enter Email"
                className="border border-transparent bg-gray-100 rounded p-3 text-sm font-medium w-full focus:outline-none focus:border-teal-500"
              />
              {formik.touched.email && formik.errors.email && (
                <p id="email-error" className="text-xs text-red-500 mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Vertical */}
            <div>
              <label htmlFor="vertical" className="block text-sm font-medium text-gray-700 mb-1">
                Vertical <span className="text-gray-500">(Optional)</span>
              </label>
              <Dropdown
                options={VERTICAL_OPTIONS}
                value={formik.values.vertical}
                onChange={(value) => formik.setFieldValue("vertical", value)}
                placeholder="Select a vertical"
              />
            </div>
          </div>

          {/* Websites */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Websites</label>
            <div className="space-y-2">
              {formik.values.websites.map((site, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border rounded-md px-3 py-2 bg-gray-50"
                >
                  <span className="text-sm text-gray-700 truncate">{site}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWebsite(i)}
                    className="text-gray-400 hover:text-red-500 text-lg leading-none"
                    aria-label={`Remove website ${i + 1}`}
                  >
                    &times;
                  </button>
                </div>
              ))}

              {formik.values.websites.length < 2 && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddWebsite())}
                    className="border border-transparent bg-gray-100 rounded p-3 text-sm font-medium w-full focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddWebsite}
                    title="Add website"
                    className="bg-[#0AA89E] text-white hover:bg-[#0a9189] px-4 py-2 rounded-lg cursor-pointer"
                  >
                    +
                  </button>
                </div>
              )}

              {websiteError && <p className="text-xs text-red-500 mt-1">{websiteError}</p>}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t border-gray-200 mt-6 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-transparent rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 border border-transparent bg-[#0AA89E] text-white rounded-lg hover:bg-[#0a9189] focus:outline-none ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
