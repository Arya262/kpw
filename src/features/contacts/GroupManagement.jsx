import React, { useState, useEffect, useRef } from "react";
import {Users,Plus,Edit2,Trash2,UserCheck,CloudUpload,} from "lucide-react";
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
        {searchTerm ? `No groups match "${searchTerm}"` : "No groups found."}
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
            <h3 className="text-lg font-semibold text-gray-800">
              {group.name}
            </h3>
            <p className="text-sm text-gray-500">
              {group.contact_count || 0} contacts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(group)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            title="Edit group">
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(group)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            title="Delete group">
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
          <span>
            Updated: {new Date(group.updated_at).toLocaleDateString()}
          </span>
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
  }
  // Extract contact data from CSV row
  const extractContactData = (headers, rowData) => {
    // console.log('Processing row data:', rowData);
    const contact = {};
    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase().trim();
      const value = (rowData[index] || '').trim();
      // console.log(`Processing header: ${header}, value: ${value}`);
      
      // Match name fields
      if ((lowerHeader.includes('name') || lowerHeader.includes('fullname')) && !contact.name) {
        contact.name = value;
      } 
      // Match country code
      else if ((lowerHeader.includes('country') && lowerHeader.includes('code')) || lowerHeader === 'countrycode') {
        contact.countryCode = value.replace(/\D/g, ''); // Remove non-digits
      } 
      // Match mobile number
      else if (lowerHeader.includes('mobile') || lowerHeader.includes('phone') || lowerHeader.includes('number')) {
        contact.mobile = value.replace(/\D/g, ''); // Remove non-digits
      }
    });
    console.log('Extracted contact:', contact);
    return contact;
  };

  const validateCsvContent = (selectedFile) => {
    return new Promise((resolve) => {
      if (!selectedFile || !selectedFile.name.endsWith(".csv")) {
        resolve(true);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          let text = event.target.result;
          if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
          const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
          if (lines.length < 2) { 
            setFileError("CSV file is empty or has no data rows.");
            resolve(false);
            return;
          }
          
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const hasNameHeader = headers.some(h => h.includes('name'));
          const hasMobileHeader = headers.some(h => 
            h.includes('mobile') || h.includes('phone') || h.includes('number')
          );
          
          if (!hasNameHeader || !hasMobileHeader) {
            setFileError("CSV must contain 'Name' and 'Mobile' columns.");
            resolve(false);
            return;
          }
          
          const contacts = [];
          for (let i = 1; i < lines.length; i++) {
            const rowData = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
            const contact = extractContactData(headers, rowData);
            if (contact.name && contact.mobile && contact.countryCode) {
              const fullMobile = contact.countryCode + contact.mobile;
              
              contacts.push({
                name: contact.name,
                mobile: fullMobile, 
                countryCode: contact.countryCode,
                originalMobile: contact.mobile, 
                timestamp: new Date().toISOString()
              });
            } else if (contact.name && contact.mobile) {
              // console.log('Skipping contact - missing country code:', contact);
            }
          }
          
          if (contacts.length === 0) {
            setFileError("No valid contacts found in the CSV.");
            resolve(false);
            return;
          }
          
          // Store parsed contacts in the file object for later use
          selectedFile.parsedContacts = contacts;
          // console.log('Successfully parsed contacts:', contacts);
          // console.log('Total valid contacts:', contacts.length);
          resolve(true);
          
        } catch (error) {
          // console.error("Error processing CSV:", error);
          setFileError("Error processing the CSV file. Please check the format.");
          resolve(false);
        }
      };
      
      reader.onerror = () => {
        setFileError("Error reading the file.");
        setFile(null);
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
    if (
      !(
        selectedFile.name.endsWith(".csv") ||
        selectedFile.name.endsWith(".docx")
      )
    ) {
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
  const { user } = useAuth();
  
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
      const customer_id = user?.customer_id;
      
      if (!customer_id) {
        console.error('No customer_id found in user context');
        setError('User authentication error. Please log in again.');
        return;
      }

      // Prepare the data to match backend expectations
      const groupData = {
        customer_id: customer_id, 
        group_name: name.trim(),   
        description: description.trim(),
        contacts: (file.parsedContacts || []).map(contact => ({
          name: contact.name,
          mobile: contact.mobile 
        }))
      };
      // console.log('=== Sending to Backend ===');
      // console.log('Customer ID:', groupData.customer_id);
      // console.log('Group Name:', groupData.group_name);
      // console.log('Description:', groupData.description);
      // console.log('File:', file.name);
      // console.log('Parsed Contacts Count:', groupData.contacts.length);
      
     
      if (groupData.contacts.length > 0) {
        const sampleContacts = groupData.contacts.slice(0, 3).map(contact => ({
          name: contact.name,
          phoneNumber: `+${contact.mobile}`,
          originalMobile: contact.originalMobile,
          countryCode: contact.countryCode
        }));
        // console.log('Sample contacts:', sampleContacts);
      }
      
      // console.log('Full request payload:', groupData);
      // console.log('==========================');
      
      await onSave(groupData);
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
          onChange={(e) => {
            setName(e.target.value);
            setGroupNameError("");
          }}
          placeholder="Enter group name"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            groupNameError ? "border-red-500" : "border-gray-300"
          }`}
          required/>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"/>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload File (.csv or .docx)
        </label>
        <div
          className={`mb-2 border-2 rounded-md p-4 text-center transition-all duration-200 ${
            isDragging
              ? "border-[#0AA89E] bg-blue-50"
              : "border-dashed border-gray-300"
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
          }}>
          <input
            type="file"
            accept=".csv,.docx"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"/>
          <label
            htmlFor="fileUpload"
            className="cursor-pointer text-gray-500 flex flex-col items-center">
            <CloudUpload className="w-12 h-12 mb-2" />
            <p className="text-sm">Drag & drop a CSV or DOCX file here</p>
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
                className="text-red-600 text-sm underline hover:text-red-800">
                Remove
              </button>
            </div>
          )}
          {!file && group?.file_name && !fileRemoved && (
            <div className="mb-2 text-sm text-gray-500 flex items-center gap-2">
              <span>
                Current file: <b>{group.file_name}</b>
                {group.total_contacts !== undefined && (
                  <>
                    {" "}
                    | Contacts: <b>{group.total_contacts}</b>
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  setFileRemoved(true);
                  setFileError("");
                  setCsvHeaders([]); 
                }}
                className="text-red-600 underline">
                Remove
              </button>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            <a href="/sample.csv" download className="text-[#0AA89E] underline">
              Download sample CSV file
            </a>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md  hover:text-gray-800 cursor-pointer">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 cursor-pointer flex items-center justify-center">
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

  // In all handlers, check permissions.canManageGroups before proceeding
  const handleCreateGroup = async (groupData) => {
    if (!permissions.canManageGroups) return;
    try {
      const customerId = user?.customer_id;
      
      // Prepare the request body as JSON with contacts_json
      const requestBody = {
        customer_id: customerId,
        group_name: groupData.group_name || groupData.name || "",
        description: groupData.description || "",
        contacts_json: (groupData.contacts || []).map((contact, index) => ({
          // contact_id: index + 1, // Auto-incrementing ID, replace with actual ID if available
          name: contact.name || "",
          phone: `+${contact.mobile}`, // Add + prefix to mobile
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

      const requestBody = {
        group_id: editingGroup.id,
        customer_id: customerId,  // Added customer_id
        group_name: groupData.group_name || groupData.name || "",
        description: groupData.description || "",
        contacts_json: (groupData.contacts || []).map((contact, index) => ({
          name: contact.name || "",
          phone: `+${contact.mobile}`, 
        }))
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
  
  // Derived selection helpers (mirror ContactList.jsx)
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
          <table className="w-full text-sm text-center overflow-hidden table-auto">
            <thead className="bg-[#F4F4F4] border-b-2 shadow-sm border-gray-300">
              <tr>
                <th className="px-2 py-3 sm:px-6">
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
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">
                      LIST NAME
                    </th>
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">
                      DESCRIPTION
                    </th>
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">
                      CATEGORY
                    </th>
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">
                      NO. OF CONTACTS
                    </th>
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">
                      CREATED ON
                    </th>
                    <th className="px-2 py-3 sm:px-6 text-center font-semibold font-sans text-gray-700">
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
        <div className="border-t border-gray-200">
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
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Delete Confirmation
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedCount} selected group{selectedCount === 1 ? "" : "s"}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-3 py-2 w-[70px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="px-3 py-2 w-[70px] bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200  flex items-center justify-center cursor-pointer">
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
      {deletingGroup && (
        <div className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Delete Confirmation
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the group "{deletingGroup.name}"?
              This action cannot be undone.
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
