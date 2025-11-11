import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { showSuccessToast, showErrorToast } from "../utils/toastConfig";
import { API_ENDPOINTS } from "../config/api";

// ✅ Axios instance
const apiClient = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ✅ Centralized error handler
const handleApiError = (error, defaultMessage = "Something went wrong") => {
  console.error(error);
  const message =
    error?.response?.data?.message || error?.message || defaultMessage;
  showErrorToast(message);
  throw new Error(message);
};

export const useProfile = () => {
  const { user, fetchWabaInfo } = useAuth();
  const [profileData, setProfileData] = useState({
    details: null,
    about: null,
    photo: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 API functions inside the hook
  const getProfileDetails = async (customerId) => {
    const res = await apiClient.get(API_ENDPOINTS.PROFILE.GET_DETAILS(customerId));
    return res.data;
  };

  const getProfileAbout = async (customerId) => {
    const res = await apiClient.get(API_ENDPOINTS.PROFILE.GET_ABOUT(customerId));
    return res.data;
  };

  const getProfilePhoto = async (customerId) => {
    const res = await apiClient.get(API_ENDPOINTS.PROFILE.GET_PHOTO(customerId));
    return res.data;
  };

  const updateProfileDetailsApi = async (customerId, profileData) => {
    const res = await apiClient.put(
      API_ENDPOINTS.PROFILE.UPDATE_DETAILS(customerId),
      profileData
    );
    return res.data;
  };

  const updateProfileAboutApi = async (customerId, about) => {
    const res = await apiClient.put(API_ENDPOINTS.PROFILE.UPDATE_ABOUT(customerId), { about });
    return res.data;
  };

  const updateProfilePhotoApi = async (customerId, imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    const res = await apiClient.put(
      API_ENDPOINTS.PROFILE.UPDATE_PHOTO(customerId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  };

  const syncWabaInfoApi = async (customerId) => {
    const res = await apiClient.get(API_ENDPOINTS.PROFILE.SYNC_WABA(customerId));
    return res.data;
  };

  // 🔹 Load full profile data
  const loadProfileData = useCallback(async () => {
    if (!user?.customer_id) return;
    setLoading(true);
    setError(null);

    try {
      const [details, about, photo] = await Promise.all([
        getProfileDetails(user.customer_id),
        getProfileAbout(user.customer_id),
        getProfilePhoto(user.customer_id),
      ]);
      setProfileData({ details, about, photo });
    } catch (err) {
      const msg = err.message || "Failed to load profile data";
      setError(msg);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  }, [user?.customer_id]);

  // 🔹 Update profile details
  const updateProfileDetails = useCallback(
    async (details) => {
      if (!user?.customer_id) return;
      setLoading(true);
      setError(null);

      try {
        const res = await updateProfileDetailsApi(user.customer_id, details);
        setProfileData((prev) => ({ ...prev, details: res }));
        await fetchWabaInfo(user.customer_id);
        showSuccessToast("Profile details updated successfully");
        return res;
      } catch (err) {
        handleApiError(err, "Failed to update profile details");
      } finally {
        setLoading(false);
      }
    },
    [user?.customer_id, fetchWabaInfo]
  );

  // 🔹 Update profile about
  const updateProfileAbout = useCallback(
    async (about) => {
      if (!user?.customer_id) return;
      setLoading(true);
      setError(null);

      try {
        const res = await updateProfileAboutApi(user.customer_id, about);
        setProfileData((prev) => ({ ...prev, about: res }));
        await fetchWabaInfo(user.customer_id);
        showSuccessToast("Profile about updated successfully");
        return res;
      } catch (err) {
        handleApiError(err, "Failed to update profile about");
      } finally {
        setLoading(false);
      }
    },
    [user?.customer_id, fetchWabaInfo]
  );

  // 🔹 Update profile photo
  const updateProfilePhoto = useCallback(
    async (imageFile) => {
      if (!user?.customer_id || !imageFile) return;
      setLoading(true);
      setError(null);

      try {
        const res = await updateProfilePhotoApi(user.customer_id, imageFile);
        setProfileData((prev) => ({ ...prev, photo: res }));
        await fetchWabaInfo(user.customer_id);
        showSuccessToast("Profile photo updated successfully");
        return res;
      } catch (err) {
        handleApiError(err, "Failed to update profile photo");
      } finally {
        setLoading(false);
      }
    },
    [user?.customer_id, fetchWabaInfo]
  );

  // 🔹 Sync WABA info
  const syncWabaInfo = useCallback(
    async () => {
      if (!user?.customer_id) return;
      setLoading(true);
      setError(null);

      try {
        const res = await syncWabaInfoApi(user.customer_id);
        await fetchWabaInfo(user.customer_id);
        await loadProfileData();
        showSuccessToast("WABA info synced successfully");
        return res;
      } catch (err) {
        handleApiError(err, "Failed to sync WABA info");
      } finally {
        setLoading(false);
      }
    },
    [user?.customer_id, fetchWabaInfo, loadProfileData]
  );

  // 🔹 Auto-load on mount
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  return {
    profileData,
    loading,
    error,
    loadProfileData,
    updateProfileDetails,
    updateProfileAbout,
    updateProfilePhoto,
    syncWabaInfo,
  };
};
