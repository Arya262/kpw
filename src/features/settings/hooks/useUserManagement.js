import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../../config/api";

export const useUserManagement = (user) => {
  const [usersMatrix, setUsersMatrix] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users from backend
  const fetchUsers = async () => {
    if (!user?.customer_id) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.USERS.GET_SUBUSERS(user.customer_id), {
        credentials: "include",
      });
      const data = await res.json();
      setUsersMatrix(data.users || []);
    } catch (err) {
      setUsersMatrix([]);
    } finally {
      setIsLoading(false);
    }
  };

  // API error handler
  const handleApiError = async (response, defaultMessage) => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error?.error || defaultMessage;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Create user
  const createUser = async (userData) => {
    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.USERS.CREATE_SUBUSER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          customer_id: user.customer_id,
          ...userData,
        }),
      });

      await handleApiError(res, "Failed to add user");
      await fetchUsers();
      return { success: true, message: "User added successfully!" };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Update user
  const updateUser = async (userId, userData) => {
    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.USERS.UPDATE_SUBUSER(userId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      await handleApiError(res, "Failed to update user");
      await fetchUsers();
      return { success: true, message: "User updated successfully!" };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.USERS.DELETE_SUBUSER(userId), {
        method: "DELETE",
        credentials: "include",
      });

      await handleApiError(res, "Failed to delete user");
      await fetchUsers();
      return { success: true, message: "User deleted successfully!" };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Update role in local state
  const updateUserRole = (userId, newRole) => {
    setUsersMatrix((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  // Toggle permission in local state
  const toggleUserPermission = (userId, permKey) => {
    setUsersMatrix((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              allowed_routes: u.allowed_routes.includes(permKey)
                ? u.allowed_routes.filter((p) => p !== permKey)
                : [...u.allowed_routes, permKey],
            }
          : u
      )
    );
  };

  useEffect(() => {
    fetchUsers();
  }, [user?.customer_id]);

  return {
    usersMatrix,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    toggleUserPermission,
    fetchUsers,
  };
};
