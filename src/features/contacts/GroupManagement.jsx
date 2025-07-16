import React, { useState, useEffect, useRef } from "react";
import { Users, Plus, Edit2, Trash2, UserCheck } from "lucide-react";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../components/Loader";
import GroupRow from "./GroupRow";

// Empty State Component (matches ContactListImproved)
const EmptyState = ({ searchTerm }) => (
  <tr>
    <td colSpan="8" className="text-center py-8">
      <div className="text-gray-500">
        {searchTerm
          ? `No groups match "${searchTerm}"`
          : "No groups found."}
      </div>
    </td>
  </tr>
);

// Error Display Component (matches ContactListImproved)
const ErrorDisplay = ({ error, setError }) => {
  if (!error) return null;
  return (
    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {error}
      <button
        onClick={() => setError(null)}
        className="float-right font-bold hover:text-red-900"
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  );
};

const GroupCard = ({ group, onEdit, onDelete, onViewContacts }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
            <p className="text-sm text-gray-500">
              {group.contact_count || 0} contacts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewContacts(group)}
            className="p-2 text-teal-600 hover:bg-teal-50 rounded-full"
            title="View contacts"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(group)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            title="Edit group"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(group)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            title="Delete group"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {group.description && (
        <p className="text-sm text-gray-600 mb-4">{group.description}</p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Created: {new Date(group.created_at).toLocaleDateString()}</span>
        {group.updated_at && (
          <span>Updated: {new Date(group.updated_at).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

const GroupForm = ({ group, onSave, onCancel }) => {
  const [name, setName] = useState(group?.name || "");
  const [description, setDescription] = useState(group?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({ name: name.trim(), description: description.trim(), file });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {group ? "Edit Group" : "Create New Group"}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File (.csv or .docx)
            </label>
            <input
              type="file"
              accept=".csv,.docx"
              onChange={e => setFile(e.target.files[0])}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function GroupManagement() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const searchInputRef = useRef(null);
  const [deletingGroup, setDeletingGroup] = useState(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_ENDPOINTS.GROUPS.GET_ALL}?customer_id=${user?.customer_id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

      const data = await response.json();
      const groupsData = data.data || data || [];
      // Transform backend format (group_id, group_name) to frontend format (id, name)
      const transformedGroups = groupsData.map(group => ({
        id: group.group_id,
        name: group.group_name,
        total_contacts: group.total_contacts || 0,
        description: group.description || '',
        category: group.category || '',
        store_mapped: group.store_mapped || '',
        created_at: group.created_at,
        updated_at: group.updated_at,
      }));
      setGroups(transformedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user?.customer_id]);

  const handleCreateGroup = async (groupData) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.GROUPS.CREATE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...groupData,
          customer_id: user?.customer_id,
        }),
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
      toast.error(error.message || "Failed to create group");
    }
  };

  const handleUpdateGroup = async (groupData) => {
    try {
      const formData = new FormData();
      formData.append('group_id', editingGroup.id);
      formData.append('customer_id', user?.customer_id);
      formData.append('group_name', groupData.name);
      formData.append('description', groupData.description || '');
      if (groupData.file) {
        formData.append('file', groupData.file);
      }

      const response = await fetch(`${API_ENDPOINTS.GROUPS.UPDATE}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
        // Do NOT set Content-Type header; browser will set it automatically
      });

      if (response.ok) {
        toast.success("Group updated successfully!");
        setEditingGroup(null);
        fetchGroups();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update group");
      }
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error(error.message || "Failed to update group");
    }
  };

  const handleDeleteGroup = async (group) => {
    // No window.confirm here; confirmation handled by dialog
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

  const handleSave = (groupData) => {
    if (editingGroup) {
      handleUpdateGroup(groupData);
    } else {
      handleCreateGroup(groupData);
    }
  };

  // Filtered groups based on search term
  const displayedGroups = groups.filter(
    (g) =>
      g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Select All checkbox change
  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    const newSelected = {};
    if (checked) {
      displayedGroups.forEach((_, idx) => {
        newSelected[idx] = true;
      });
    }
    setSelectedRows(newSelected);
  };

  // Handle individual checkbox change
  const handleCheckboxChange = (idx, event) => {
    setSelectedRows((prev) => ({
      ...prev,
      [idx]: event.target.checked,
    }));
  };

  useEffect(() => {
    const total = displayedGroups.length;
    const selected = Object.values(selectedRows).filter(Boolean).length;
    setSelectAll(selected === total && total > 0);
  }, [selectedRows, displayedGroups.length]);

  // Bulk delete handler
  const handleDeleteSelected = async () => {
    const selectedIds = Object.entries(selectedRows)
      .filter(([_, isSelected]) => isSelected)
      .map(([idx]) => displayedGroups[idx]?.id)
      .filter(Boolean);
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      for (const groupId of selectedIds) {
        await fetch(`${API_ENDPOINTS.GROUPS.DELETE}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ group_id: groupId, customer_id: user?.customer_id }),
        });
      }
      toast.success(`${selectedIds.length} group${selectedIds.length > 1 ? "s" : ""} deleted successfully!`);
      setSelectedRows({});
      setSelectAll(false);
      fetchGroups();
    } catch (error) {
      toast.error("Failed to delete selected groups");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="flex-1">
      <ErrorDisplay error={error} setError={setError} />
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-xl font-bold">Groups</h2>
        </div>
        <div className="relative max-w-xs ml-auto">
          <input
            type="text"
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by group name or description..."
            aria-label="Search groups"
            className="pl-3 pr-10 py-2 border border-gray-300 text-sm rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
          />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[900px] bg-white rounded-2xl shadow-[0px_-0.91px_3.66px_0px_#00000042] overflow-hidden">
          <table className="w-full text-sm text-center overflow-hidden table-auto">
            <thead className="bg-[#F4F4F4] border-b-2 shadow-sm border-gray-300">
              <tr>
                <th className="px-2 py-3 sm:px-6">
                  <div className="flex items-center justify-center h-full">
                    <input
                      type="checkbox"
                      className="form-checkbox w-4 h-4"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                      aria-label="Select all groups"
                    />
                  </div>
                </th>
                {Object.values(selectedRows).some(Boolean) && (
                  <th colSpan="7" className="px-2 py-3 sm:px-6">
                    <div className="flex justify-center">
                      <button
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                        aria-label={`Delete ${Object.values(selectedRows).filter(Boolean).length} selected groups`}
                      >
                        Delete Selected
                      </button>
                    </div>
                  </th>
                )}
                {!Object.values(selectedRows).some(Boolean) && (
                  <>
                    <th className="px-2 py-3 sm:px-6 text-left font-semibold font-sans text-gray-700">LIST NAME</th>
                    <th className="px-2 py-3 sm:px-6 text-left font-semibold font-sans text-gray-700">DESCRIPTION</th>
                    <th className="px-2 py-3 sm:px-6 text-left font-semibold font-sans text-gray-700">CATEGORY</th>
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">NO. OF CONTACTS</th>
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">STORE MAPPED</th>
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">CREATED ON</th>
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">ACTIONS</th>
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
                <EmptyState searchTerm={searchTerm} />
              ) : (
                displayedGroups.map((group, idx) => (
                  <GroupRow
                    key={group.id}
                    group={group}
                    isChecked={!!selectedRows[idx]}
                    onCheckboxChange={(e) => handleCheckboxChange(idx, e)}
                    onEditClick={setEditingGroup}
                    onDeleteClick={setDeletingGroup}
                    isDeleting={isDeleting}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Bulk Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Confirmation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {Object.values(selectedRows).filter(Boolean).length} selected group{Object.values(selectedRows).filter(Boolean).length > 1 ? "s" : ""}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-3 py-2 w-[70px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="px-3 py-2 w-[70px] bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Group Form Modal */}
      {(showForm || editingGroup) && (
        <GroupForm
          group={editingGroup}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingGroup(null);
          }}
        />
      )}
      {/* Group Delete Confirmation Dialog */}
      {deletingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Confirmation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the group "{deletingGroup.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingGroup(null)}
                disabled={isDeleting}
                className="px-3 py-2 w-[70px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleDeleteGroup(deletingGroup);
                  setDeletingGroup(null);
                }}
                disabled={isDeleting}
                className="px-3 py-2 w-[70px] bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
} 