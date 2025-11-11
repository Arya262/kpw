import React, { useState, useEffect, useRef } from "react";
import {Plus} from "lucide-react";
import { API_ENDPOINTS } from "../../config/api";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../components/Loader";
import GroupRow from "./GroupRow";
import EmptyState from "./EmptyState";
import ErrorDisplay from "./ErrorDisplay";
import GroupForm from "./GroupForm";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import vectorIcon from "../../assets/Vector.png";
import { getPermissions } from "../../utils/getPermissions";
import Pagination from "../shared/Pagination";
import ConfirmationDialog from "../shared/ExitConfirmationDialog";

export default function GroupManagement() {
  // Update page title and meta for SEO
  useEffect(() => {
    document.title = "Group Management - Foodchow";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Manage your contact groups efficiently. Create, edit, and organize groups for better communication management.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Manage your contact groups efficiently. Create, edit, and organize groups for better communication management.';
      document.head.appendChild(meta);
    }
  }, []);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const permissions = getPermissions(user);
  const searchInputRef = useRef(null);
  const [deletingGroup, setDeletingGroup] = useState(null);
  const modalRef = useRef(null);
  const [isCrossHighlighted, setIsCrossHighlighted] = useState(false);
  const [isModalGlow, setIsModalGlow] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const cancelExit = () => {
    setShowExitDialog(false);
    setShowForm(false);
    setEditingGroup(null);
  };

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const fetchGroups = async (page = 1, limit = 10, search = "") => {
    try {
      setLoading(true);
      setError(null);

      // console.log("📤 Fetching groups with params:", {
      //   customer_id: user?.customer_id,
      //   page,
      //   limit,
      //   search,
      // });
      
      // Debug: Log the full API endpoint and params
      const params = new URLSearchParams({
        customer_id: user?.customer_id,
        page,
        limit,
        ...(search ? { search } : {}),
      });
      // console.log("🌐 Full API URL:", `${API_ENDPOINTS.GROUPS.GET_ALL}?${params.toString()}`);

      const response = await axios.get(API_ENDPOINTS.GROUPS.GET_ALL, {
        params: {
          customer_id: user?.customer_id,
          page,
          limit,
          ...(search ? { search } : {}),
        },
        withCredentials: true,
        validateStatus: (status) => status < 500, 
      });

      // console.log("✅ API Response Status:", response.status);
      // console.log("📄 API Response Data:", response.data);

      if (response.status >= 400) {
        throw new Error(response.data?.message || "Failed to fetch groups");
      }

      const result = response.data;
      // console.log("🔍 Full API Response:", result);
      
      const groupsData = Array.isArray(result.data) ? result.data : [];
      // console.log("📦 Groups Data from API:", groupsData);
      
      // Debug: Check if search term is being used in the response
      if (search) {
        // console.log(`🔎 Checking search results for "${search}":`);
        const searchLower = search.toLowerCase();
        const matchingGroups = groupsData.filter(g => 
          g.group_name?.toLowerCase().includes(searchLower) || 
          g.description?.toLowerCase().includes(searchLower)
        );
        // console.log(`   Found ${matchingGroups.length} matching groups in response`);
      }

      if (groupsData.length === 0) {
        // console.log("ℹ️ No groups found for the current customer");
      }

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

      // console.log("🔄 Transformed Groups:", transformedGroups);

      setGroups(transformedGroups);

      // The API response has pagination data at response.data.pagination
      const paginationData = response.data.pagination || {};
      const newPagination = {
        currentPage: paginationData.page || page,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.totalRecords || 0,
        itemsPerPage: paginationData.limit || limit,
      };
      // console.log("📊 Updated Pagination:", newPagination);
      setPagination(newPagination);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch groups";
      console.error("❌ Error fetching groups:", {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user?.customer_id]);

  // Add debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        fetchGroups(1, pagination.itemsPerPage, searchTerm);
      } else {
        fetchGroups(1, pagination.itemsPerPage);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, user?.customer_id]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      fetchGroups(newPage, pagination.itemsPerPage);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1,
    }));
    fetchGroups(1, newItemsPerPage);
  };

  
 const handleCreateGroup = async (groupData) => {
    if (!permissions.canManageGroups) return;
    try {
      const customerId = user?.customer_id;
      
      // Check if contacts are provided (from file upload)
      if (!groupData.contacts || groupData.contacts.length === 0) {
        throw new Error('Please upload a file with contacts to create a new group');
      }
      
      // Prepare the request body as JSON with contacts_json
      const requestBody = {
        customer_id: customerId,
        group_name: groupData.group_name || groupData.name || "",
        description: groupData.description || "",
        contacts_json: groupData.contacts.map(contact => ({
          name: contact.name || "",
          phone: contact.mobile ? `+${contact.mobile.replace(/^\+/, '')}` : "",
        }))
      };


      const response = await fetch(`${API_ENDPOINTS.GROUPS.CREATE}`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success("Group created successfully!");
        setShowForm(false);
        fetchGroups();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleUpdateGroup = async (groupData) => {
    if (!permissions.canManageGroups) return;
    try {
      const customerId = user?.customer_id;
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      // Prepare contacts data - use existing contacts if no new ones are provided
      const contactsToUpdate = groupData.contacts || [];
      
      const requestBody = {
        group_id: editingGroup.id,
        customer_id: customerId,
        group_name: groupData.group_name || groupData.name || "",
        description: groupData.description || "",
        // Only include contacts_json if we have contacts to update
        ...(contactsToUpdate.length > 0 && {
          contacts_json: contactsToUpdate.map(contact => ({
            name: contact.name || "",
            phone: contact.mobile ? `+${contact.mobile.replace(/^\+/, '')}` : "",
            ...(contact.contact_id && { contact_id: contact.contact_id })
          }))
        })
      };

      const response = await fetch(API_ENDPOINTS.GROUPS.UPDATE, {
        method: "PUT",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success("Group updated successfully!");
        fetchGroups();
        setEditingGroup(null);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update group");
      }
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error(error.response?.data?.message || 'Failed to update group');
    }
  };

  const handleEditGroup = async (group) => {
    if (!permissions.canManageGroups) return;
    try {
      setLoading(true);
      // Fetch the group with its contacts using proper query parameters
      const response = await axios.get(API_ENDPOINTS.GROUPS.GET_ALL, {
        params: {
          customer_id: user?.customer_id,
          group_id: group.id,
          include_contacts: true
        },
        withCredentials: true
      });

      if (response.data && response.data.data && response.data.data.length > 0) {
        // Update the editing group with the fetched data including contacts
        const groupData = response.data.data[0];
        setEditingGroup({
          ...group,
          contacts: groupData.contacts || [],
          contact_count: groupData.total_contacts || 0
        });
      } else {
        // If no data returned, just set the group without contacts
        setEditingGroup(group);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
      toast.error(error.response?.data?.message || "Failed to load group details");
      // Still set the group to allow editing basic info even if contacts fail to load
      setEditingGroup(group);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (group) => {
    if (!permissions.canManageGroups) return;
    try {
      setIsDeleting(true);
      const response = await fetch(`${API_ENDPOINTS.GROUPS.DELETE}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          group_id: group.id,
          customer_id: user?.customer_id,
        }),
      });

      if (response.ok) {
        toast.success("Group deleted successfully!");
        fetchGroups();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete group");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error(error.message || "Failed to delete group");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewContacts = (group) => {
    setSelectedGroup(group);
  };

  const handleSave = async (groupData) => {
    if (editingGroup) {
      // When editing, include existing contacts if no new file is uploaded
      const updateData = {
        ...groupData,
        // Only include file/contacts if a new file was uploaded, otherwise keep existing contacts
        ...(groupData.file ? {} : { 
          file: undefined,
          // Use existing contacts if available, otherwise use empty array
          contacts: editingGroup.contacts || []
        })
      };
      handleUpdateGroup(updateData);
    } else {
      // For new groups, require the file/contacts
      handleCreateGroup(groupData);
    }
  };

  const confirmExit = () => {
    setShowForm(false);
    setShowExitDialog(false);
    setEditingGroup(null);
  };

  const displayedGroups = groups.filter(
    (g) =>
      g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  
  const explicitlyUnselectedCount = Object.values(selectedGroups).filter((v) => v === false).length;
  const explicitlySelectedCount = Object.values(selectedGroups).filter(Boolean).length;
  const selectedCount = selectAllAcrossPages
    ? Math.max(0, (pagination.totalItems || 0) - explicitlyUnselectedCount)
    : explicitlySelectedCount;
  const hasSelection = selectAllAcrossPages ? true : selectedCount > 0;
  
  // Selection handling (mirrors ContactList.jsx)
  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    setSelectAllAcrossPages(checked);
    // Clear explicit selections; across-pages selection is implicit
    setSelectedGroups({});
  };

  const handleCheckboxChange = (groupId, isChecked) => {
    setSelectedGroups((prev) => {
      const updated = { ...prev };
      if (selectAllAcrossPages) {
        if (!isChecked) updated[groupId] = false;
        else delete updated[groupId];
      } else {
        if (isChecked) updated[groupId] = true;
        else delete updated[groupId];
      }
      return updated;
    });
  };

  useEffect(() => {
    if (groups.length === 0) {
      setSelectAll(false);
      setSelectAllAcrossPages(false);
      return;
    }
    const allSelected = groups.every((g) =>
      selectAllAcrossPages ? selectedGroups[g.id] !== false : selectedGroups[g.id]
    );
    setSelectAll(allSelected && !selectAllAcrossPages);
  }, [selectedGroups, groups, selectAllAcrossPages]);

  const allDisplayedSelected = displayedGroups.every((g) =>
    selectAllAcrossPages
     ? selectedGroups[g.id] !== false
     : !!selectedGroups[g.id]
   );

  const handleDeleteSelected = async () => {
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
          validateStatus: (status) => status < 500,
        });
        const result = response.data;
        const groupsData = Array.isArray(result.data) ? result.data : [];
        selectedIds = groupsData
          .map((g) => g.group_id)
          .filter((id) => selectedGroups[id] !== false);
      } catch (err) {
        // console.error('Error fetching all groups for deletion:', err);
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
        await fetch(`${API_ENDPOINTS.GROUPS.DELETE}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            group_id: groupId,
            customer_id: user?.customer_id,
          }),
        });
      }
      toast.success(
        `${selectedIds.length} group${selectedIds.length > 1 ? "s" : ""} deleted successfully!`
      );
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

  return (
    <div className="flex-1 pt-2.5">
      <ErrorDisplay error={error} setError={setError} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        {/* Title */}
        <h2 className="text-xl font-bold">Groups</h2>

        {/* Search + Add Button */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 max-w-full sm:max-w-xs">
            <input
              type="text"
              ref={searchInputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by group name or description..."
              aria-label="Search groups"
              className="pl-3 pr-10 py-2 border border-gray-300 text-sm rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            />
            {/* Magnifying glass icon */}
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          {/* Add Group Button */}
          <button
            className={`bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl  transition-all cursor-pointer`}
            onClick={() => {
              if (!permissions.canManageGroups) {
                toast.error("You do not have permission to add groups.");
                return;
              }
              setShowForm(true);
            }}
            aria-disabled={!permissions.canManageGroups}
          >
            {/* You can replace img with a Lucide Plus icon if preferred */}
            <img src={vectorIcon} alt="plus sign" className="w-5 h-5" />
            Add Group
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[900px] bg-white rounded-2xl shadow-[0px_-0.91px_3.66px_0px_#00000042] overflow-hidden">
          <table className="w-full text-sm text-center">
            <colgroup>
              <col className="w-12" />
              <col className="w-[15%]" />
              <col />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[15%]" />
              <col />
            </colgroup>
            <thead className="bg-[#F4F4F4] border-b-2 shadow-sm border-gray-300">
              <tr>
                <th className="px-2 py-4 sm:px-6 sm:py-4">
                  <div className="flex items-center justify-center h-full">
                    <input
                      type="checkbox"
                      className="form-checkbox w-4 h-4"
                      // checked={selectAll}
                      onChange={handleSelectAllChange}
                      aria-label="Select all groups"
                      checked={allDisplayedSelected}
                    />
                  </div>
                </th>
                {hasSelection && (
                  <th colSpan="6" className="px-4 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {selectedCount} group{selectedCount === 1 ? "" : "s"} selected
                        </span>
                        <button
                          onClick={handleDeleteSelected}
                          disabled={isDeleting}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? (
                            <>
                              <svg
                                className="animate-spin h-3 w-3 text-white"
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
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Deleting...
                            </>
                          ) : (
                            "Delete Selected"
                          )}
                        </button>
                      </div>
                    </th>
                )}
                {!hasSelection && (
                  <>
                    <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                      CREATED ON
                    </th>
                    <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                      Group Name
                    </th>
                    <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                      DESCRIPTION
                    </th>
                    <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                      CATEGORY
                    </th>
                    <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    NO. OF CONTACTS
                    </th>
                    <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                      ACTIONS
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
              {loading ? (
                <tr>
                  <td colSpan="8">
                    <div className="flex justify-center items-center py-8">
                      <Loader text="Loading your groups, please wait..." />
                    </div>
                  </td>
                </tr>
              ) : displayedGroups.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <EmptyState searchTerm={searchTerm} />
                  </td>
                </tr>
              ) : (
                displayedGroups.map((group) => (
                  <GroupRow
                    key={group.id}
                    group={group}
                    isChecked={selectAllAcrossPages ? selectedGroups[group.id] !== false : !!selectedGroups[group.id]}
                    onCheckboxChange={(e) => handleCheckboxChange(group.id, e.target.checked)}
                    onEditClick={setEditingGroup}
                    onDeleteClick={setDeletingGroup}
                    isDeleting={isDeleting}
                    permissions={permissions}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {pagination.totalItems > 0 && (
        <div className="border-t border-gray-200" style={{ minHeight: '72px' }}>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
      {/* Bulk Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        show={showDeleteDialog}
        title="Delete Confirmation"
        message={`Are you sure you want to delete ${selectedCount} selected group${selectedCount === 1 ? "" : "s"}? This action cannot be undone.`}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteSelected}
        isDeleting={isDeleting}
      />
      {/* Group Form Modal */}
      {(showForm || editingGroup) && (
        <div
          className="fixed inset-0 bg-[#000]/40 flex items-center justify-center z-50 transition-all duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCrossHighlighted(true);
              setTimeout(() => setIsCrossHighlighted(false), 2000);
            }
          }}>
          <div
            ref={modalRef}
            className={` bg-white rounded-lg  w-[95%] sm:w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto relative sm:animate-slideUp border transition-all duration-300 
                ${isCrossHighlighted ? "border-teal-500" : "border-gray-300"}`}
            onClick={(e) => e.stopPropagation()}
            tabIndex="-1">
            <button
              onClick={() => setShowExitDialog(true)}
              className={` absolute top-2 right-2 sm:right-4 text-gray-600 hover:text-black text-2xl sm:text-3xl font-bold w-8 h-8 flex items-center justify-center pb-1 sm:pb-2 
                  rounded-full transition-colors cursor-pointer ${
                    isCrossHighlighted
                      ? "bg-red-500 text-white hover:text-white"
                      : "bg-gray-100"
                  }`}>
              ×
            </button>

            <div className="mx-auto bg-white shadow-lg rounded-xl text-gray-500 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 text-black">
                {editingGroup ? "Edit Group" : "Create New Group"}
              </h2>

              <GroupForm
                group={editingGroup}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingGroup(null);
                }}
              />
            </div>
          </div>
          <ConfirmationDialog
            open={showExitDialog && permissions.canAccessModals}
            hasUnsavedChanges={false}
            onCancel={cancelExit}
            onConfirm={confirmExit}
          />
        </div>
      )}
      {/* Group Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        show={!!deletingGroup}
        title="Delete Confirmation"
        message={deletingGroup ? `Are you sure you want to delete the group "${deletingGroup.name}"? This action cannot be undone.` : ""}
        onCancel={() => setDeletingGroup(null)}
        onConfirm={async () => {
          if (deletingGroup) {
            await handleDeleteGroup(deletingGroup);
            setDeletingGroup(null);
          }
        }}
        isDeleting={isDeleting}
      />
      <ToastContainer />
    </div>
  );
}
