import React, { useState, useEffect, useRef } from "react";
import { Users, Plus, Edit2, Trash2, UserCheck, CloudUpload } from "lucide-react";
import { API_ENDPOINTS } from "../../config/api";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../components/Loader";
import GroupRow from "./GroupRow";
import vectorIcon from "../../assets/Vector.png";
import { getPermissions } from "../../utils/getPermissions";
import Pagination from "../shared/Pagination";
import ConfirmationDialog from "../shared/ExitConfirmationDialog";

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

// Refactor GroupForm to only render the form content, not modal wrappers
const GroupForm = ({ group, onSave, onCancel }) => {
  const [name, setName] = useState(group?.name || "");
  const [description, setDescription] = useState(group?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [fileRemoved, setFileRemoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [groupNameError, setGroupNameError] = useState("");
  const [fileError, setFileError] = useState("");
  const [csvHeaders, setCsvHeaders] = useState([]);

  // Group name validation
  const validateGroupName = () => {
    if (!name.trim()) {
      setGroupNameError("Group name is required.");
      return false;
    }
    if (name.trim().length < 2) {
      setGroupNameError("Group name must be at least 2 characters long.");
      return false;
    }
    if (name.trim().length > 50) {
      setGroupNameError("Group name must be less than 50 characters.");
      return false;
    }
    setGroupNameError("");
    return true;
  };

  // File validation
  const validateFile = () => {
    if (!file && !group?.file_name) {
      setFileError("Please upload a file.");
      return false;
    }
    if (file && !(file.name.endsWith(".csv") || file.name.endsWith(".docx"))) {
      setFileError("Only .csv or .docx files are allowed.");
      return false;
    }
    setFileError("");
    return true;
  };

  // CSV content validation (only for .csv)
  const validateCsvContent = (selectedFile) => {
    return new Promise((resolve) => {
      if (!selectedFile || !selectedFile.name.endsWith(".csv")) {
        resolve(true); // skip for non-csv
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        let text = event.target.result;
        if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
        const lines = text.split(/\r?\n/);
        const headersLine = lines[0];
        if (!headersLine || headersLine.trim() === "") {
          setFileError("CSV file appears to be empty or malformed.");
          resolve(false);
          return;
        }
        const headers = headersLine
          .split(",")
          .map((header) => header.trim().toLowerCase())
          .filter((header) => header.length > 0);
        if (headers.length === 0) {
          setFileError("No headers found in CSV.");
          resolve(false);
          return;
        }

        // Check for phone number column
        const phoneColumns = [
          'phone', 'mobile', 'phone_number', 'mobile_number',
          'phone number', 'mobile number', 'contact', 'contact_number',
          'tel', 'telephone', 'cell', 'cellphone', 'number'
        ];

        const phoneColumnIndex = headers.findIndex(header =>
          phoneColumns.some(phoneCol => header.includes(phoneCol))
        );

        if (phoneColumnIndex === -1) {
          setFileError("CSV file must contain a phone number column. Accepted column names include: phone, mobile, phone_number, mobile_number, contact, telephone, etc.");
          resolve(false);
          return;
        }


        const phoneColumnHasData = lines.slice(1)
          .filter(line => line.trim())
          .some(line => {
            const columns = line.split(',');
            const phoneValue = columns[phoneColumnIndex]?.trim().replace(/["\']/g, '');
            if (!phoneValue) return false;
            const cleanPhone = phoneValue.replace(/[\s\-\(\)\+\.]/g, '');
            const digitCount = (cleanPhone.match(/\d/g) || []).length;
            return digitCount >= 7;
          });

        if (!phoneColumnHasData) {
          setFileError("The phone number column exists but appears to be empty or contains invalid phone numbers. Please ensure the phone column has valid phone numbers.");
          resolve(false);
          return;
        }

        setCsvHeaders(headers);
        resolve(true);
      };
      reader.onerror = () => {
        setFileError("Failed to read CSV file.");
        resolve(false);
      };
      reader.readAsText(selectedFile);
    });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFileError("");
    setCsvHeaders([]);
    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (!(selectedFile.name.endsWith(".csv") || selectedFile.name.endsWith(".docx"))) {
      setFileError("Only .csv or .docx files are allowed.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setFileRemoved(false);
    if (selectedFile.name.endsWith(".csv")) {
      await validateCsvContent(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validName = validateGroupName();
    const validFile = validateFile();
    let validCsv = true;
    if (file && file.name.endsWith(".csv")) {
      validCsv = await validateCsvContent(file);
    }
    if (!validName || !validFile || !validCsv) return;
    setIsSubmitting(true);
    try {
      await onSave({ name: name.trim(), description: description.trim(), file, fileRemoved });
    } finally {
      setIsSubmitting(false);
    }
  };


  const confirmExit = () => {
    setIsPopupOpen(false);
    setShowExitDialog(false);
    setIsCrossHighlighted(false);
  };

  const cancelExit = () => {
    setShowExitDialog(false);
    setShowForm(false);
    setEditingGroup(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Group Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setGroupNameError(""); }}
          placeholder="Enter group name"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${groupNameError ? "border-red-500" : "border-gray-300"}`}
          required
        />
        {groupNameError && (
          <p className="text-red-500 text-sm mt-1">{groupNameError}</p>
        )}
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
        <div
          className={`mb-2 border-2 rounded-md p-4 text-center transition-all duration-200 ${isDragging ? "border-[#0AA89E] bg-blue-50" : "border-dashed border-gray-300"
            }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={async (e) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) {
              const fakeEvent = { target: { files: [droppedFile] } };
              await handleFileChange(fakeEvent);
            }
          }}
        >
          <input
            type="file"
            accept=".csv,.docx"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
          />
          <label
            htmlFor="fileUpload"
            className="cursor-pointer text-gray-500 flex flex-col items-center"
          >
            <CloudUpload className="w-12 h-12 mb-2" />
            <p className="text-sm">
              Drag & drop a CSV or DOCX file here
            </p>
            <p className="text-xs mt-1">Max 50MB and 200K contacts allowed.</p>
          </label>
          {fileError && (
            <p className="text-red-500 text-sm mt-1">{fileError}</p>
          )}
          {file && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <span className="text-sm text-green-700">{file.name}</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setFileError("");
                  setCsvHeaders([]);
                }}
                className="text-red-600 text-sm underline hover:text-red-800"
              >
                Remove
              </button>
            </div>
          )}
          {!file && group?.file_name && !fileRemoved && (
            <div className="mb-2 text-sm text-gray-500 flex items-center gap-2">
              <span>
                Current file: <b>{group.file_name}</b>
                {group.total_contacts !== undefined && (
                  <> | Contacts: <b>{group.total_contacts}</b></>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  setFileRemoved(true);
                  setFileError(""); // Clear file error when removing existing file
                  setCsvHeaders([]); // Clear CSV headers
                }}
                className="text-red-600 underline"
              >
                Remove
              </button>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            <a href="/sample.csv" download className="text-[#0AA89E] underline">Download sample CSV file</a>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md  hover:text-gray-800 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 cursor-pointer flex items-center justify-center"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </form>
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

      console.log("📤 Fetching groups with params:", {
        customer_id: user?.customer_id,
        page,
        limit,
        search,
      });

      const response = await axios.get(API_ENDPOINTS.GROUPS.GET_ALL, {
        params: {
          customer_id: user?.customer_id,
          page,
          limit,
          ...(search ? { search } : {}),
        },
        withCredentials: true,
        validateStatus: (status) => status < 500, // Don't throw for 4xx errors
      });

      console.log("✅ API Response Status:", response.status);
      console.log("📄 API Response Data:", response.data);

      if (response.status >= 400) {
        throw new Error(response.data?.message || 'Failed to fetch groups');
      }

      const result = response.data;
      const groupsData = Array.isArray(result.data) ? result.data : [];

      console.log("📦 Groups Data from API:", groupsData);

      if (groupsData.length === 0) {
        console.log("ℹ️ No groups found for the current customer");
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

      console.log("🔄 Transformed Groups:", transformedGroups);

      setGroups(transformedGroups);

      setPagination((prev) => {
        const newPagination = {
          currentPage: result.current_page || result.page || page,
          totalPages:
            result.last_page ||
            result.totalPages ||
            (result.total ? Math.ceil(result.total / limit) : 1) ||
            1,
          totalItems: result.total || groupsData.length || 0,
          itemsPerPage: result.per_page || result.limit || limit,
        };
        console.log("📊 Updated Pagination:", newPagination);
        return newPagination;
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch groups';
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
  // In all handlers, check permissions.canManageGroups before proceeding
  const handleCreateGroup = async (groupData) => {
    if (!permissions.canManageGroups) return;
    try {
      const formData = new FormData();
      const customerId = user?.customer_id;
      const groupName = groupData.name;
      const file = groupData.file;
      const fileRemoved = groupData.fileRemoved;
      formData.append('customer_id', customerId);
      formData.append('group_name', groupName);
      formData.append('description', groupData.description || '');
      if (file) {
        formData.append('file', file);
      }
      if (fileRemoved) {
        formData.append('remove_file', 'true');
      }

      const response = await fetch(`${API_ENDPOINTS.GROUPS.CREATE}`, {
        method: "POST",
        credentials: "include",
        body: formData,
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
    if (!permissions.canManageGroups) return;
    try {
      const formData = new FormData();
      formData.append('group_id', editingGroup.id);
      formData.append('customer_id', user?.customer_id);
      formData.append('group_name', groupData.name);
      formData.append('description', groupData.description || '');
      if (groupData.file) {
        formData.append('file', groupData.file);
      }
      if (groupData.fileRemoved) {
        formData.append('remove_file', 'true');
      }

      const response = await fetch(`${API_ENDPOINTS.GROUPS.UPDATE}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
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

  const handleSave = (groupData) => {
    if (editingGroup) {
      handleUpdateGroup(groupData);
    } else {
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
              aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          {/* Add Group Button */}
          <button
            className={`bg-[#0AA89E] hover:bg-[#0AA89E]/90 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-md transition w-full sm:w-auto`}
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
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                        aria-label={`Delete ${Object.values(selectedRows).filter(Boolean).length} selected groups`}
                      >
                        Delete Selected
                      </button>
                    </div>
                  </th>
                )}
                {!Object.values(selectedRows).some(Boolean) && (
                  <>
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">LIST NAME</th>
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">DESCRIPTION</th>
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">CATEGORY</th>
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">NO. OF CONTACTS</th>
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
                <tr>
                  <td colSpan="8">
                    <EmptyState searchTerm={searchTerm} />
                  </td>
                </tr>
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
                    permissions={permissions}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!loading && pagination.totalItems > 0 && (
        <div className="border-t border-gray-200">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            itemsPerPage={pagination.itemsPerPage}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
      {/* Bulk Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Confirmation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {Object.values(selectedRows).filter(Boolean).length} selected group{Object.values(selectedRows).filter(Boolean).length > 1 ? "s" : ""}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-3 py-2 w-[70px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="px-3 py-2 w-[70px] bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200  flex items-center justify-center cursor-pointer"
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
        <div
          className="fixed inset-0 bg-[#000]/40 flex items-center justify-center z-50 transition-all duration-300"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setIsCrossHighlighted(true);
              setTimeout(() => setIsCrossHighlighted(false), 2000);
            }
          }}
        >
        <div ref={modalRef}
              className={` bg-white rounded-lg  w-[95%] sm:w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto relative sm:animate-slideUp border transition-all duration-300 
                ${isCrossHighlighted ? 'border-teal-500' : 'border-gray-300'}`}
                onClick={e => e.stopPropagation()}
                tabIndex="-1">
              <button onClick={() => setShowExitDialog(true)} className={` absolute top-2 right-2 sm:right-4 text-gray-600 hover:text-black text-2xl sm:text-3xl font-bold w-8 h-8 flex items-center justify-center pb-1 sm:pb-2 
                  rounded-full transition-colors cursor-pointer ${isCrossHighlighted ? "bg-red-500 text-white hover:text-white" : "bg-gray-100"}`}>
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
      {deletingGroup && (
        <div className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Confirmation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the group "{deletingGroup.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingGroup(null)}
                disabled={isDeleting}
                className="px-3 py-2 w-[70px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleDeleteGroup(deletingGroup);
                  setDeletingGroup(null);
                }}
                disabled={isDeleting}
                className="px-3 py-2 w-[70px] bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200  flex items-center justify-center cursor-pointer"
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