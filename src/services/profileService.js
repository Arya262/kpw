import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { showErrorToast } from "../utils/toastConfig";

// ✅ Create a preconfigured axios instance
const apiClient = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ✅ Centralized error handler
const handleApiError = (error, defaultMessage = "Something went wrong") => {
  console.error(error);

  const message =
    error?.response?.data?.message ||
    error?.message ||
    defaultMessage;

  showErrorToast(message);
  throw new Error(message);
};


const ProfileService = {
  // --- Get profile details ---
  async getProfileDetails(customerId) {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PROFILE.GET_DETAILS(customerId));
      return res.data;
    } catch (err) {
      handleApiError(err, "Error fetching profile details");
    }
  },

  // --- Get profile about ---
  async getProfileAbout(customerId) {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PROFILE.GET_ABOUT(customerId));
      return res.data;
    } catch (err) {
      handleApiError(err, "Error fetching profile about");
    }
  },

  // --- Get profile photo ---
  async getProfilePhoto(customerId) {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PROFILE.GET_PHOTO(customerId));
      return res.data;
    } catch (err) {
      handleApiError(err, "Error fetching profile photo");
    }
  },

  // --- Update profile details ---
  async updateProfileDetails(customerId, profileData) {
    try {
      const res = await apiClient.put(
        API_ENDPOINTS.PROFILE.UPDATE_DETAILS(customerId),
        profileData
      );
      return res.data;
    } catch (err) {
      handleApiError(err, "Error updating profile details");
    }
  },

  // --- Update profile about ---
  async updateProfileAbout(customerId, about) {
    try {
      const res = await apiClient.put(
        API_ENDPOINTS.PROFILE.UPDATE_ABOUT(customerId),
        { about }
      );
      return res.data;
    } catch (err) {
      handleApiError(err, "Error updating profile about");
    }
  },

  // --- Update profile photo ---
  async updateProfilePhoto(customerId, imageFile) {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await apiClient.put(
        API_ENDPOINTS.PROFILE.UPDATE_PHOTO(customerId),
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data;
    } catch (err) {
      handleApiError(err, "Error updating profile photo");
    }
  },

  // --- Sync WABA info ---
  async syncWabaInfo(customerId) {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PROFILE.SYNC_WABA(customerId));
      return res.data;
    } catch (err) {
      handleApiError(err, "Error syncing WABA info");
    }
  },

  // --- Fetch all profile data together ---
  async getCompleteProfile(customerId) {
    try {
      const [details, about, photo] = await Promise.all([
        this.getProfileDetails(customerId),
        this.getProfileAbout(customerId),
        this.getProfilePhoto(customerId),
      ]);
      return { details, about, photo };
    } catch (err) {
      handleApiError(err, "Error fetching complete profile");
    }
  },
};

export default ProfileService;
