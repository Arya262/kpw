import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../../config/api";

export const useUserManagementEnhanced = (user) => {
  const [usersMatrix, setUsersMatrix] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Retry mechanism
  const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }
  };

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    if (!user?.customer_id) return;
    
    if (!isOnline) {
      toast.error("You're offline. Please check your internet connection.");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await retryOperation(async () => {
        const response = await fetch(API_ENDPOINTS.USERS.GET_SUBUSERS(user.customer_id), {
          credentials: "include",
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return response;
      });
      
      const data = await res.json();
      setUsersMatrix(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsersMatrix([]);
      toast.error("Failed to fetch users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.customer_id, isOnline]);

  // API error handler
  const handleApiError = async (response, defaultMessage) => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error?.error || defaultMessage;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Create user with optimistic update
  const createUser = async (userData) => {
    if (!isOnline) {
      toast.error("You're offline. Please check your internet connection.");
      return { success: false, message: "No internet connection" };
    }

    setIsLoading(true);
    
    // Optimistic update - add user to UI immediately
    const tempId = `temp_${Date.now()}`;
    const optimisticUser = {
      id: tempId,
      user_id: tempId,
      first_name: userData.name.split(' ')[0] || '',
      last_name: userData.name.split(' ').slice(1).join(' ') || '',
      email: userData.email,
      mobile_no: userData.mobile_no,
      role: userData.role,
      allowed_routes: userData.allowed_routes,
      _isOptimistic: true
    };

    setUsersMatrix(prev => [...prev, optimisticUser]);

    try {
      const res = await retryOperation(async () => {
        const response = await fetch(API_ENDPOINTS.USERS.CREATE_SUBUSER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            customer_id: user.customer_id,
            ...userData,
          }),
        });
        
        if (!response.ok) {
          // Remove optimistic update on error
          setUsersMatrix(prev => prev.filter(u => u.id !== tempId));
          throw new Error('Failed to create user');
        }
        
        return response;
      });

      await handleApiError(res, "Failed to add user");
      
      // Replace optimistic update with real data
      await fetchUsers();
      
      return { success: true, message: "User added successfully!" };
    } catch (err) {
      // Remove optimistic update if still there
      setUsersMatrix(prev => prev.filter(u => u.id !== tempId));
      console.error(err);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Update user with optimistic update
  const updateUser = async (userId, userData) => {
    if (!isOnline) {
      toast.error("You're offline. Please check your internet connection.");
      return { success: false, message: "No internet connection" };
    }

    setIsLoading(true);
    
    // Store original user data for rollback
    const originalUser = usersMatrix.find(u => u.user_id === userId);
    
    // Optimistic update
    const updatedUser = {
      ...originalUser,
      first_name: userData.name.split(' ')[0] || '',
      last_name: userData.name.split(' ').slice(1).join(' ') || '',
      mobile_no: userData.mobile_no,
      role: userData.role,
      allowed_routes: userData.allowed_routes,
      _isOptimistic: true
    };

    setUsersMatrix(prev => 
      prev.map(u => u.user_id === userId ? updatedUser : u)
    );

    try {
      const res = await retryOperation(async () => {
        const response = await fetch(API_ENDPOINTS.USERS.UPDATE_SUBUSER(userId), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
          // Rollback optimistic update
          setUsersMatrix(prev => 
            prev.map(u => u.user_id === userId ? originalUser : u)
          );
          throw new Error('Failed to update user');
        }
        
        return response;
      });

      await handleApiError(res, "Failed to update user");
      
      // Refresh to get latest data
      await fetchUsers();
      
      return { success: true, message: "User updated successfully!" };
    } catch (err) {
      // Rollback if not already done
      setUsersMatrix(prev => 
        prev.map(u => u.user_id === userId ? originalUser : u)
      );
      console.error(err);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user with optimistic update
  const deleteUser = async (userId) => {
    if (!isOnline) {
      toast.error("You're offline. Please check your internet connection.");
      return { success: false, message: "No internet connection" };
    }

    setIsLoading(true);
    
    // Store original data for rollback
    const originalUsers = [...usersMatrix];
    
    // Optimistic update - remove user immediately
    setUsersMatrix(prev => prev.filter(u => u.user_id !== userId));

    try {
      const res = await retryOperation(async () => {
        const response = await fetch(API_ENDPOINTS.USERS.DELETE_SUBUSER(userId), {
          method: "DELETE",
          credentials: "include",
        });
        
        if (!response.ok) {
          // Rollback optimistic update
          setUsersMatrix(originalUsers);
          throw new Error('Failed to delete user');
        }
        
        return response;
      });

      await handleApiError(res, "Failed to delete user");
      return { success: true, message: "User deleted successfully!" };
    } catch (err) {
      // Rollback if not already done
      setUsersMatrix(originalUsers);
      console.error(err);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Update role in local state
  const updateUserRole = useCallback((userId, newRole) => {
    setUsersMatrix((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  }, []);

  // Toggle permission in local state
  const toggleUserPermission = useCallback((userId, permKey) => {
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
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    usersMatrix,
    isLoading,
    isOnline,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    toggleUserPermission,
    fetchUsers,
  };
};
