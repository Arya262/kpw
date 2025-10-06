import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; 
import { getPermissions } from "../utils/getPermissions"; 
import { API_ENDPOINTS } from "../config/api";
import { toast } from "react-toastify";

const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const permissions = getPermissions(user);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Memoized fetchGroups to avoid infinite loops
  const fetchGroups = useCallback(async (page = 1, limit = 10, search = "") => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        customer_id: user?.customer_id,
        page,
        limit,
        ...(search && { search }),
      };
      const response = await axios.get(API_ENDPOINTS.GROUPS.GET_ALL, {
        params,
        withCredentials: true,
      });
      const result = response.data;
      const groupsData = Array.isArray(result.data) ? result.data : [];
      const transformedGroups = groupsData.map((group) => ({
        id: group.group_id,
        name: group.group_name,
        total_contacts: group.total_contacts || 0,
        description: group.description || "",
        category: group.category || "",
        store_mapped: group.store_mapped || "",
        created_at: group.created_at,
        updated_at: group.updated_at,
        file_name: group.file_name,
      }));
      setGroups(transformedGroups);
      const paginationData = result.pagination || {};
      setPagination({
        currentPage: paginationData.page || page,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.totalRecords || 0,
        itemsPerPage: paginationData.limit || limit,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch groups";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.customer_id]);

  // Fetch groups only when user.customer_id changes
  useEffect(() => {
    if (user?.customer_id) fetchGroups();
  }, [user?.customer_id, fetchGroups]);

  const handleCreateGroup = async (groupData) => {
    if (!permissions.canManageGroups) return;
    try {
      const requestBody = {
        customer_id: user?.customer_id,
        group_name: groupData.group_name || groupData.name || "",
        description: groupData.description || "",
        contacts_json: (groupData.contacts || []).map((contact) => ({
          name: contact.name || "",
          phone: `+${contact.mobile}`,
        })),
      };
      const response = await fetch(API_ENDPOINTS.GROUPS.CREATE, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        toast.success("Group created successfully!");
        fetchGroups();
      } else {
        const errorRes = await response.json();
        throw new Error(errorRes.message || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.message || "Failed to create group");
    }
  };

  const handleUpdateGroup = async (groupData) => {
    if (!permissions.canManageGroups) return;
    try {
      const requestBody = {
        group_id: groupData.id,
        customer_id: user?.customer_id,
        group_name: groupData.group_name || groupData.name || "",
        description: groupData.description || "",
        contacts_json: (groupData.contacts || []).map((contact) => ({
          name: contact.name || "",
          phone: `+${contact.mobile}`,
        })),
      };
      const response = await fetch(API_ENDPOINTS.GROUPS.UPDATE, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        toast.success("Group updated successfully!");
        fetchGroups();
      } else {
        const errorRes = await response.json();
        throw new Error(errorRes.message || "Failed to update group");
      }
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error(error.message || "Failed to update group");
    }
  };

  const handleDeleteGroup = async (group) => {
    if (!permissions.canManageGroups) return;
    try {
      setIsDeleting(true);
      const response = await fetch(API_ENDPOINTS.GROUPS.DELETE, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: group.id,
          customer_id: user?.customer_id,
        }),
      });
      if (response.ok) {
        toast.success("Group deleted successfully!");
        fetchGroups();
      } else {
        const errorRes = await response.json();
        throw new Error(errorRes.message || "Failed to delete group");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error(error.message || "Failed to delete group");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelected = async ({
    selectAllAcrossPages,
    selectedGroups,
    pagination,
    user,
    fetchGroups,
    setSelectedGroups,
    setSelectAll,
    setSelectAllAcrossPages,
    setIsDeleting,
    setShowDeleteDialog
  }) => {
    let selectedIds = [];
    if (selectAllAcrossPages) {
      try {
        setIsDeleting(true);
        const response = await axios.get(API_ENDPOINTS.GROUPS.GET_ALL, {
          params: {
            customer_id: user?.customer_id,
            limit: 1000,
          },
          withCredentials: true,
        });
        const result = response.data;
        const groupsData = Array.isArray(result.data) ? result.data : [];
        selectedIds = groupsData
          .map((g) => g.group_id)
          .filter((id) => selectedGroups[id] !== false);
      } catch (err) {
        console.error('Error fetching all groups for deletion:', err);
        toast.error('Failed to fetch groups for deletion');
        setIsDeleting(false);
        return;
      }
    } else {
      selectedIds = Object.keys(selectedGroups).filter((id) => selectedGroups[id]);
    }

    if (selectedIds.length === 0) return;
    try {
      for (const groupId of selectedIds) {
        await fetch(API_ENDPOINTS.GROUPS.DELETE, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            group_id: groupId,
            customer_id: user?.customer_id,
          }),
        });
      }
      toast.success(`${selectedIds.length} group${selectedIds.length > 1 ? "s" : ""} deleted successfully!`);
      setSelectedGroups({});
      setSelectAll(false);
      setSelectAllAcrossPages(false);
      fetchGroups();
    } catch (error) {
      toast.error("Failed to delete selected groups");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return {
    groups,
    loading,
    error,
    setError,
    fetchGroups,
    permissions,
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleDeleteSelected,
    isDeleting,
    setIsDeleting,
    pagination,
    setPagination,
  };
};

export default useGroups;
