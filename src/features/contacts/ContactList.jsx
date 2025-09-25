import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ContactRow from "./ContactRow";
import AddContact from "./Addcontact";
import vendor from "../../assets/Vector.png";
import { API_ENDPOINTS } from "../../config/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditContact from "./EditContact";
import SingleDeleteDialog from "./SingleDeleteDialog";
import { getPermissions } from "../../utils/getPermissions";
import Loader from "../../components/Loader";
import Pagination from "../shared/Pagination";
import { formatDate } from "../../utils/formatters";
import ConfirmationDialog from "../shared/ExitConfirmationDialog";
import { useNavigate } from "react-router-dom";
import GroupNameDialog from "./components/GroupNameDialog";
import ExportDialog from "./components/ExportDialog";
import { Send, Users, Download } from "lucide-react";
import FilterDialog from "../../components/FilterDialog";

const DeleteConfirmationDialog = ({
  showDeleteDialog,
  selectedCount,
  cancelDelete,
  confirmDelete,
  isDeleting,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") cancelDelete();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cancelDelete]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  if (!showDeleteDialog) return null;

  return (
    <div
      className="fixed inset-0 bg-[#000]/50  flex items-center justify-center z-50"
      onMouseDown={(e) => e.stopPropagation()}>
      <div
        ref={dialogRef}
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg transform transition-all duration-300 scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-message"
        tabIndex="-1"
      >
        <div className="flex items-center gap-3 mb-4">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h3
            id="delete-dialog-title"
            className="text-lg font-semibold text-gray-800"
          >
            Delete Confirmation
          </h3>
        </div>
        <p id="delete-dialog-message" className="text-gray-600 mb-6">
          Are you sure you want to delete {selectedCount} selected contact
          {selectedCount > 1 ? "s" : ""}? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={cancelDelete}
            disabled={isDeleting}
            className="px-3 py-2 w-[70px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="px-3 py-2 w-[70px] bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center"
            aria-label="Delete"
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
  );
};


export default function ContactList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const permissions = getPermissions(user);

  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [advancedFilter, setAdvancedFilter] = useState({
    field: 'none',
    value: ''
  });
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    // Basic filters
    name: '',
    phone: '',
    email: '',
    status: '',
    date: '',
    group: '',

    // Advanced filters
    lastSeenQuick: '',
    lastSeenFrom: '',
    lastSeenTo: '',
    createdAtQuick: '',
    createdAtFrom: '',
    createdAtTo: '',
    optedIn: 'All',
    incomingBlocked: 'All',
    readStatus: 'All',
    attribute: '',
    operator: 'is',
    attributeValue: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [deleteContact, setDeleteContact] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  const [selectAll, setSelectAll] = useState(false);
  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState({});

  const popupRef = useRef(null);
  const [isCrossHighlighted, setIsCrossHighlighted] = useState(false);

  const handleApiError = (err, fallbackMessage) => {
    console.error(err);
    const msg = err?.message || fallbackMessage;
    setError(msg);
    showErrorToast(msg);
  };

  // Fetch contacts with server-side search & pagination
  const fetchContacts = async (page = 1, limit = 10, search = "") => {
    if (!user?.customer_id) return;

    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.CONTACTS.GET_ALL, {
        params: {
          customer_id: user?.customer_id,
          page,
          limit,
          ...(search ? { search } : {}),
        },
        withCredentials: true,
      });

      // console.log("✅ API Response Status:", response.status);
      // console.log("📄 API Response Data:", response.data);

      if (response.status >= 400) {
        throw new Error(response.data?.message || "Failed to fetch contacts");
      }

      const result = response.data;
      const contacts = Array.isArray(result.data) ? result.data : [];

      // console.log("📦 Contacts Data from API:", contacts);

      const transformedContacts = contacts.map((item) => ({
        ...item,
        status: "Opted-in",
        customer_id: user?.customer_id,
        date: formatDate(item.created_at),
        number: `${item.country_code || ""} ${item.mobile_no}`,
        fullName: `${item.first_name} ${item.last_name || ""}`.trim(),
      }));
      // Update displayed contacts for current page
      setContacts(transformedContacts);

      // Merge into allContacts for multi-page selection
      setAllContacts((prev) => {
        const map = new Map(prev.map((c) => [c.contact_id, c]));
        transformedContacts.forEach((c) => map.set(c.contact_id, c));
        return Array.from(map.values());
      });

      // Update pagination from API response
      const paginationData = response.data.pagination || {};
      const newPagination = {
        currentPage: paginationData.page || page,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.total || 0,
        itemsPerPage: paginationData.limit || limit,
      };
      // console.log("📊 Updated Pagination:", newPagination);
      setPagination(newPagination);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch contacts";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search using setTimeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchContacts(1, pagination.itemsPerPage, searchTerm);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm, pagination.itemsPerPage]);

  const filterByDateRange = (date, quickFilter, fromDate, toDate) => {
    if (!quickFilter && !fromDate && !toDate) return true;

    const contactDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Apply quick filters if set
    if (quickFilter) {
      const startDate = new Date(today);

      switch (quickFilter) {
        case 'In 24hr':
          startDate.setDate(today.getDate() - 1);
          return contactDate >= startDate;
        case 'This Week':
          const day = today.getDay();
          const diff = today.getDate() - day + (day === 0 ? -6 : 1);
          startDate.setDate(diff);
          return contactDate >= startDate;
        case 'This Month':
          startDate.setDate(1);
          return contactDate >= startDate;
        case 'Today':
          return contactDate >= today;
        default:
          return true;
      }
    }

    // Apply custom date range if set
    if (fromDate || toDate) {
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      if (from && to) {
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        return contactDate >= from && contactDate <= to;
      } else if (from) {
        from.setHours(0, 0, 0, 0);
        return contactDate >= from;
      } else if (to) {
        to.setHours(23, 59, 59, 999);
        return contactDate <= to;
      }
    }

    return true;
  };

  const filteredContacts = contacts.filter((contact) => {
    // Apply status filter
    const statusMatch = filter === "All" || contact.status === filter;

    // Apply basic filters
    const nameMatch = !filterOptions.name ||
      (contact.first_name + ' ' + (contact.last_name || '')).toLowerCase().includes(filterOptions.name.toLowerCase());

    const phoneMatch = !filterOptions.phone ||
      (contact.mobile_no || '').includes(filterOptions.phone);

    const emailMatch = !filterOptions.email ||
      (contact.email || '').toLowerCase().includes(filterOptions.email.toLowerCase());

    const groupMatch = !filterOptions.group ||
      (contact.group_name || '').toLowerCase() === filterOptions.group.toLowerCase();

    // Apply advanced filters
    const lastSeenMatch = filterByDateRange(
      contact.last_seen_at || contact.updated_at,
      filterOptions.lastSeenQuick,
      filterOptions.lastSeenFrom,
      filterOptions.lastSeenTo
    );

    const createdAtMatch = filterByDateRange(
      contact.created_at,
      filterOptions.createdAtQuick,
      filterOptions.createdAtFrom,
      filterOptions.createdAtTo
    );

    const optedInMatch = filterOptions.optedIn === 'All' ||
      (filterOptions.optedIn === 'Yes' && contact.opted_in === true) ||
      (filterOptions.optedIn === 'No' && contact.opted_in !== true);

    const blockedMatch = filterOptions.incomingBlocked === 'All' ||
      (filterOptions.incomingBlocked === 'Yes' && contact.is_blocked === true) ||
      (filterOptions.incomingBlocked === 'No' && contact.is_blocked !== true);

    const readStatusMatch = filterOptions.readStatus === 'All' ||
      (filterOptions.readStatus === 'Read' && contact.is_read === true) ||
      (filterOptions.readStatus === 'Unread' && contact.is_read !== true);

    // Apply attribute filter if set
    let attributeMatch = true;
    if (filterOptions.attribute && filterOptions.attributeValue) {
      const attributeValue = contact.attributes?.[filterOptions.attribute] || '';
      const searchValue = filterOptions.attributeValue.toLowerCase();

      switch (filterOptions.operator) {
        case 'is':
          attributeMatch = attributeValue.toLowerCase() === searchValue;
          break;
        case 'isNot':
          attributeMatch = attributeValue.toLowerCase() !== searchValue;
          break;
        case 'contains':
          attributeMatch = attributeValue.toLowerCase().includes(searchValue);
          break;
        default:
          attributeMatch = true;
      }
    }

    // Combine all filters
    return statusMatch && nameMatch && phoneMatch && emailMatch && groupMatch &&
      lastSeenMatch && createdAtMatch && optedInMatch && blockedMatch &&
      readStatusMatch && attributeMatch;
  });

  // Use filteredContacts directly since search is handled by the API
  const displayedContacts = filteredContacts;

  const filterButtons = ["All", "Opted-in", "Opted-Out"];
  const filterCounts = {
    All: pagination.totalItems,
    "Opted-in": contacts.filter((c) => c.status === "Opted-in").length,
    "Opted-Out": contacts.filter((c) => c.status === "Opted-Out").length,
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      fetchContacts(newPage, pagination.itemsPerPage);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1,
    }));
    fetchContacts(1, newItemsPerPage);
  };

  const canEditContact = (contact) => {
    if (!permissions.canEdit) return false;
    if (user?.role?.toLowerCase?.() === "user") {
      return contact.created_by === user?.id;
    }
    return true;
  };
  const canDeleteContact = (contact) => {
    if (!permissions.canDelete) return false;
    if (user?.role?.toLowerCase?.() === "user") {
      return contact.created_by === user?.id;
    }
    return true;
  };

  const handleCheckboxChange = (contactId, isChecked) => {
    setSelectedContacts((prev) => {
      const updated = { ...prev };
      if (selectAllAcrossPages) {
        if (!isChecked) updated[contactId] = false;
        else delete updated[contactId];
      } else {
        if (isChecked) updated[contactId] = true;
        else delete updated[contactId];
      }
      return updated;
    });
  };

  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    setSelectAllAcrossPages(checked);
    setSelectedContacts({});
  };



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setTimeout(() => setIsCrossHighlighted(true), 0);
      } else {
        setIsCrossHighlighted(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openPopup = () => {
    if (!permissions.canAdd || !permissions.canAccessModals) {
      toast.error("You do not have permission to add contacts.");
      return;
    }
    setIsPopupOpen(true);
  };
  const closePopup = () => setIsPopupOpen(false);

  useEffect(() => {
    if (allContacts.length === 0) {
      setSelectAll(false);
      setSelectAllAcrossPages(false);
      return;
    }
    const allSelected = allContacts.every((c) =>
      selectAllAcrossPages ? selectedContacts[c.contact_id] !== false : selectedContacts[c.contact_id]
    );
    setSelectAll(allSelected && !selectAllAcrossPages);
  }, [selectedContacts, allContacts, selectAllAcrossPages]);

  const handleCloseAndNavigate = () => {
    if (!permissions.canAccessModals) return;
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    setIsPopupOpen(false);
    setShowExitDialog(false);
    setIsCrossHighlighted(false);
  };

  const cancelExit = () => {
    setShowExitDialog(false);
    setIsCrossHighlighted(false);
  };

  const handleDeleteClick = () => {
    if (!permissions.canDelete) {
      toast.error("You do not have permission to delete contacts.");
      return;
    }

    // Calculate the actual number of selected contacts
    const selectedCount = selectAllAcrossPages
      ? pagination.totalItems - Object.values(selectedContacts).filter(val => val === false).length
      : Object.values(selectedContacts).filter(Boolean).length;

    if (selectedCount === 0) {
      toast.error("Please select at least one contact to delete.");
      return;
    }

    setShowDeleteDialog(true);
  };

  // Store selected contacts for group creation
  const [selectedContactsForGroup, setSelectedContactsForGroup] = useState({
    ids: [],
    list: []
  });

  // Check if any contacts are selected
  const hasSelectedContacts = selectAllAcrossPages
    ? true // If selectAllAcrossPages is true, we're selecting all contacts
    : Object.values(selectedContacts).some(Boolean);

  // Broadcast button handler
  const handleAddbroadcast = async (createGroup = true) => {
    let selectedContactIds = [];
    let allFetchedContacts = [];

    if (selectAllAcrossPages) {
      try {
        setLoading(true);
        // Fetch all contacts without pagination
        const response = await axios.get(API_ENDPOINTS.CONTACTS.GET_ALL, {
          params: {
            customer_id: user?.customer_id,
            limit: 1000,
          },
          withCredentials: true,
        });

        if (response.data && Array.isArray(response.data.data)) {
          allFetchedContacts = response.data.data.map(item => ({
            ...item,
            contact_id: item.contact_id || item.id,
          }));
          selectedContactIds = allFetchedContacts
            .filter(contact => selectedContacts[contact.contact_id] !== false)
            .map(contact => contact.contact_id);
        }
      } catch (error) {
        console.error('Error fetching all contacts:', error);
        toast.error('Failed to fetch all contacts. Please try again.');
        return;
      } finally {
        setLoading(false);
      }
    } else {
      // Normal selection mode
      selectedContactIds = Object.entries(selectedContacts)
        .filter(([contactId, isSelected]) => isSelected)
        .map(([contactId]) => contactId);
      allFetchedContacts = contacts; // Use current page contacts for normal selection
    }

    if (selectedContactIds.length === 0) {
      toast.error("Please select at least one contact.");
      return;
    }

    // Build selected contacts list
    const selectedContactList = (selectAllAcrossPages
      ? allFetchedContacts.filter(contact => selectedContactIds.includes(contact.contact_id))
      : selectedContactIds
        .map((id) => contacts.find((c) => c.contact_id == id))
        .filter(Boolean))
      .map((contact) => ({
        contact_id: contact.contact_id,
        Name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim(),
        CountryCode: `${contact.country_code || ""}`.trim(),
        Phone: `${contact.mobile_no || ""}`.trim(),
      }));

    // console.log("Selected contact IDs:", selectedContactIds);
    // console.log("Selected Contacts:", selectedContactList);

    if (createGroup) {
      // Original flow: Create a group first
      setSelectedContactsForGroup({
        ids: selectedContactIds,
        list: selectedContactList,
      });
      toast.success(`Selected ${selectedContactIds.length} contact${selectedContactIds.length !== 1 ? 's' : ''} for broadcast`);
      setShowGroupDialog(true);
    } else {
      // New flow: Go directly to broadcast with selected contacts
      navigate("/broadcast", {
        state: {
          openForm: true,
          contacts: selectedContactList,
          directBroadcast: true
        },
      });
    }
  };

  // Handle group creation after group name is confirmed
  const handleCreateGroup = async (groupName) => {
    if (!groupName || groupName.trim() === "") {
      toast.error("Group name is required.");
      return;
    }

    const { ids: selectedContactIds, list: selectedContactList } = selectedContactsForGroup;

    try {
      setIsDeleting(true);
      const formData = new FormData();
      formData.append("customer_id", user?.customer_id);
      formData.append("group_name", groupName.trim());

      let csvContent = "Name,CountryCode,Phone\n";
      selectedContactList.forEach((contact) => {
        csvContent += `${contact.Name},${contact.CountryCode},${contact.Phone}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv" });
      formData.append("file", blob, "contactlist.csv");

      const res = await fetch(`${API_ENDPOINTS.GROUPS.CREATE}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      console.log("Group response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to create group");
      }

      toast.success("Group created successfully!");
      setShowGroupDialog(false);

      navigate("/broadcast", {
        state: {
          openForm: true,
          newGroup: {
            id: data.id,
            name: data.name,
            total_contacts: data.total_contacts,
          },
          contacts: selectedContactList,
        },
      });
    } catch (err) {
      console.error("Error creating group:", err);
      toast.error(err.message || "Could not create group.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const confirmDelete = async () => {
    if (!permissions.canDelete) {
      toast.error("You do not have permission to delete contacts.");
      return;
    }
    await handleDeleteSelected();
    setShowDeleteDialog(false);
  };

  const handleDeleteSelected = async () => {
    if (!permissions.canDelete) {
      toast.error("You do not have permission to delete contacts.");
      return;
    }

    const selectedIds = Object.keys(selectedContacts).filter((id) =>
      selectAllAcrossPages ? selectedContacts[id] !== false : selectedContacts[id]
    );

    let payload;
    if (selectAllAcrossPages) {
      // When selecting all, we need to get all contact IDs from the server
      try {
        const response = await axios.get(API_ENDPOINTS.CONTACTS.GET_ALL, {
          params: {
            customer_id: user?.customer_id,
            limit: 1000, // Set a high limit to get all contacts
          },
          withCredentials: true,
        });

        if (response.data && Array.isArray(response.data.data)) {
          const allContactIds = response.data.data
            .map(contact => contact.contact_id || contact.id)
            .filter(id => selectedContacts[id] !== false); // Exclude explicitly unchecked

          payload = {
            contact_ids: allContactIds,
            customer_id: user?.customer_id
          };
        } else {
          throw new Error('Failed to fetch contacts for deletion');
        }
      } catch (error) {
        console.error('Error fetching contacts for deletion:', error);
        toast.error('Failed to fetch contacts for deletion');
        return;
      }
    } else {
      // Normal selection mode
      payload = {
        contact_ids: selectedIds,
        customer_id: user?.customer_id
      };
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`${API_ENDPOINTS.CONTACTS.DELETE}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete contacts");
      }

      await fetchContacts();
      setSelectedContacts({});
      setSelectAll(false);
      setSelectAllAcrossPages(false);

      toast.success(
        selectAllAcrossPages
          ? `All ${pagination.totalItems} contacts deleted successfully!`
          : `${selectedIds.length} contact${selectedIds.length > 1 ? "s" : ""
          } deleted successfully!`
      );
    } catch (error) {
      console.error("Error deleting contacts:", error);
      setError(error.message || "Failed to delete contacts. Please try again.");
      toast.error(error.message || "Failed to delete contacts. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };


  // Function to handle export confirmation
  const handleExportConfirm = async () => {
    setShowExportDialog(false);
    try {
      if (exportFormat === 'csv') {
        await exportContactsToCSV();
      } else if (exportFormat === 'excel') {
        await exportContactsToExcel();
      } else if (exportFormat === 'pdf') {
        await exportContactsToPDF();
      }
    } catch (error) {
      console.error('Error during export:', error);
      toast.error('Failed to export contacts');
    }
  };

  // Function to fetch all contacts for export (handles pagination)
  const fetchAllContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.CONTACTS.GET_ALL, {
        params: {
          customer_id: user?.customer_id,
          limit: 1000, // Fetch all contacts in a single request
        },
        withCredentials: true,
      });

      if (response.status >= 400) {
        throw new Error(response.data?.message || "Failed to fetch contacts");
      }

      const result = response.data;
      const allContacts = Array.isArray(result.data) ? result.data : [];

      return allContacts.map((item) => ({
        ...item,
        status: "Opted-in",
        customer_id: user?.customer_id,
        date: formatDate(item.created_at),
        number: `${item.country_code || ""} ${item.mobile_no}`,
        fullName: `${item.first_name} ${item.last_name || ""}`.trim(),
      }));
    } catch (error) {
      console.error('Error fetching all contacts:', error);
      toast.error('Failed to fetch contacts for export');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to get contacts to export
  const getContactsToExport = async () => {
    if (selectAllAcrossPages) {
      // If "Select all" is checked, fetch all contacts from the server
      const allContacts = await fetchAllContacts();
      return allContacts;
    } else if (Object.keys(selectedContacts).length > 0) {
      // If specific contacts are selected on the current page
      return contacts.filter(contact => selectedContacts[contact.contact_id]);
    } else {
      // If no selection, export all visible contacts on the current page
      return [...displayedContacts];
    }
  };

  // Function to export contacts to CSV
  const exportContactsToCSV = async () => {
    try {
      const contactsToExport = await getContactsToExport();
      if (contactsToExport.length === 0) {
        toast.warning("No contacts to export");
        return;
      }

      // Create CSV header
      const headers = [
        'First Name',
        'Last Name',
        'Country Code',
        'Mobile No',
        // 'Status',
        // 'Created At',
        
      ];

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...contactsToExport.map(contact => {
          return [
            `"${contact.first_name || ''}"`,
            `"${contact.last_name || ''}"`,
            `"${contact.country_code || ''}"`,
            `"${contact.mobile_no || ''}"`
            // `"${contact.status || ''}"`,
            // `"${contact.created_at || ''}"`,
            
          ].join(',');
        })
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contacts_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${contactsToExport.length} contacts to CSV`);
    } catch (error) {
      console.error('Error exporting contacts:', error);
      toast.error('Failed to export contacts. Please try again.');
    }
  };

  const handleSingleContactDelete = async (contact_id) => {
    if (!permissions.canDelete) {
      toast.error("You do not have permission to delete contacts.");
      return;
    }
    try {
      setIsDeleting(true);
      setError(null);
      const payload = {
        contact_ids: [contact_id],
        customer_id: user?.customer_id,
      };
      const response = await fetch(`${API_ENDPOINTS.CONTACTS.DELETE}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete contact");
      }
      await fetchContacts();
      toast.success("Contact deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } catch (error) {
      setError(error.message || "Failed to delete contact. Please try again.");
      toast.error(
        error.message || "Failed to delete contact. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        }
      );
    } finally {
      setIsDeleting(false);
      setDeleteContact(null);
    }
  };

  const handleContactEdit = async () => {
    if (!permissions.canEdit) {
      toast.error("You do not have permission to edit contacts.");
      return;
    }
    // Refresh the contacts list after a successful edit
    await fetchContacts();
    toast.success("Contact updated successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };

  const handleContactAdd = (message) => {
    if (!permissions.canAdd) {
      toast.error("You do not have permission to add contacts.");
      return;
    }
    fetchContacts();
    toast.success(message || "Contact added successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
    setIsPopupOpen(false);
  };

  const handleUnauthorizedEdit = () => {
    toast.error("You do not have permission to edit contacts.");
  };
  const handleUnauthorizedDelete = () => {
    toast.error("You do not have permission to delete contacts.");
  };
  const handleUnauthorizedAdd = () => {
    toast.error("You do not have permission to add contacts.");
  };

  return (
    <>
      <div className="flex-1 pt-2.5">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative">
            {error}
            <button
              onClick={() => setError(null)}
              className="absolute right-3 top-3 font-bold">
              ×
            </button>
          </div>
        )}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          {/* Left Section: Title + Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold">Contacts</h2>

            {permissions.canSeeFilters && (
              <div className="flex gap-2 flex-wrap">
                {filterButtons.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => setFilter(btn)}
                    className={`px-3 sm:px-4 py-2 min-h-[38px] rounded-md text-sm font-medium transition cursor-pointer 
                ${
                  filter === btn
                    ? "bg-[#0AA89E] text-white"
                    : "text-gray-700 hover:text-[#0AA89E]"
                }`}>
                    {btn} ({filterCounts[btn]})
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {permissions.canSeeFilters && (
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or number..."
                  aria-label="Search"
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
            )}

            <button
              className="bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl  transition-all cursor-pointer"
              onClick={
                permissions.canAdd && permissions.canAccessModals
                  ? openPopup
                  : handleUnauthorizedAdd
              }
            >
              <img src={vendor} alt="plus sign" className="w-5 h-5" />
              Add Contact
            </button>
          </div>
        </div>
      </div>

      <FilterDialog
        isOpen={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        filterOptions={filterOptions}
        onFilterChange={(newOptions) => setFilterOptions(newOptions)}
        onReset={() => {
          setFilterOptions({
            name: '',
            phone: '',
            email: '',
            status: '',
            date: '',
            group: ''
          });
        }}
        onApply={() => setFilterDialogOpen(false)}
      />
      <div className="overflow-x-auto">
        <div className="min-w-[900px] bg-white rounded-2xl shadow-[0px_-0.91px_3.66px_0px_#00000042] overflow-hidden ">
          <table className="w-full text-sm text-center overflow-hidden table-auto">
            <thead className="bg-[#F4F4F4] border-b-2 shadow-sm border-gray-300">
              <tr>
                {permissions.canDelete ? (
                  <th className="px-2 py-3 sm:px-6">
                    <div className="flex items-center justify-center h-full">
                      <input
                        type="checkbox"
                        className="form-checkbox w-4 h-4"
                        onChange={handleSelectAllChange}
                        ref={(el) => {
                          if (el) {
                            const someUnchecked =
                              selectAllAcrossPages &&
                              Object.values(selectedContacts).some((val) => val === false);
                            el.indeterminate = !selectAllAcrossPages && !selectAll && someUnchecked;
                          }
                        }}
                      />
                    </div>
                  </th>
                ) : (
                  <th className="px-2 py-3 sm:px-6"></th>
                )}
                {permissions.canDelete &&
                  (selectAllAcrossPages || Object.values(selectedContacts).some(Boolean)) ? (
                  <th colSpan="6" className="px-2 py-3 sm:px-6">
                    <div className="flex justify-end gap-6">
                      {/* Selected count shown once outside buttons */}
                      <div className="flex items-center text-sm text-gray-700">
                        {selectAllAcrossPages ? (
                          <span>
                            Selected All ({pagination.totalItems - Object.values(selectedContacts).filter((val) => val === false).length})
                          </span>
                        ) : (
                          <span>Selected ({Object.values(selectedContacts).filter(Boolean).length})</span>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddbroadcast(false)}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!hasSelectedContacts || !permissions.canAdd}
                            title="Send broadcast to selected contacts directly"
                          >
                            <Send className="w-4 h-4 text-white" />
                            Send Broadcast
                          </button>
                          <button
                            onClick={() => handleAddbroadcast(true)}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!hasSelectedContacts || !permissions.canAdd}
                            title="Create a group first, then broadcast"
                          >
                            <Users className="w-4 h-4 text-white" />
                            Create Group & Broadcast
                          </button>
                        </div>
                        <button
                          onClick={() => setShowExportDialog(true)}
                          disabled={isDeleting || (!selectAllAcrossPages && Object.values(selectedContacts).filter(Boolean).length === 0)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                          title="Export selected contacts"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                        <button
                          onClick={handleDeleteClick}
                          disabled={isDeleting}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                          Delete
                        </button>
                      </div>
                    </div>
                  </th>
                ) : (
                  <>
                    <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                      Created Date
                    </th>
                    <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                      Status
                    </th>
                    <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                      Customer Name
                    </th>
                    <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                      WhatsApp Number
                    </th>
                    <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                      24 Hour Status
                    </th>
                    <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                      Action
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <Loader />
                  </td>
                </tr>
              ) : displayedContacts.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-4 text-gray-500 font-medium"
                  >
                    {/* <img
                        src="/no_data.14591486.svg"
                        alt="No data available"
                        className="w-full h-72 mb-4 opacity-80"
                      /> */}
                    No contacts found.
                  </td>
                </tr>
              ) : (
                displayedContacts.map((contact) => (
                  <ContactRow
                    key={contact.contact_id}
                    contact={contact}
                    isChecked={
                      selectAllAcrossPages
                        ? selectedContacts[contact.contact_id] !== false
                        : !!selectedContacts[contact.contact_id]
                    }
                    onCheckboxChange={handleCheckboxChange}
                    onEditClick={
                      permissions.canEdit && canEditContact(contact)
                        ? setEditContact
                        : handleUnauthorizedEdit
                    }
                    onDeleteClick={
                      permissions.canDelete && canDeleteContact(contact)
                        ? setDeleteContact
                        : handleUnauthorizedDelete
                    }
                    canEdit={true}
                    canDelete={true}
                    userId={user?.id}
                    userRole={user?.role?.toLowerCase?.()}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Select all across pages prompt */}
      {selectAll && !selectAllAcrossPages && (
        <div className="p-2 text-sm bg-yellow-100 rounded-md mt-2 text-gray-700">
          All {displayedContacts.length} contacts on this page are selected.{" "}
          <button
            className="underline ml-1 text-teal-600"
            onClick={() => setSelectAllAcrossPages(true)}
          >
            Select all {pagination.totalItems} contacts
          </button>
        </div>
      )}


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
      {isPopupOpen && permissions.canAdd && permissions.canAccessModals && (
        <div
          className="fixed inset-0 bg-[#000]/50  flex items-center justify-center z-50 transition-all duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCrossHighlighted(true);
              setTimeout(() => setIsCrossHighlighted(false), 2000);
            }
          }}
        >
          <div
            ref={popupRef}
            className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative sm:animate-slideUp border ${isCrossHighlighted ? "border-teal-500" : "border-gray-300"
              } transition-all duration-300`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseAndNavigate}
              className={`absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors cursor-pointer ${isCrossHighlighted
                  ? "bg-red-500 text-white hover:text-white"
                  : "bg-gray-100"
                }`}
            >
              ×
            </button>
            <AddContact closePopup={closePopup} onSuccess={handleContactAdd} />
          </div>
        </div>
      )}
      <DeleteConfirmationDialog
        showDeleteDialog={showDeleteDialog && permissions.canDelete}
        selectedCount={selectAllAcrossPages
          ? pagination.totalItems - Object.values(selectedContacts).filter(val => val === false).length
          : Object.values(selectedContacts).filter(Boolean).length
        }
        cancelDelete={cancelDelete}
        confirmDelete={confirmDelete}
        isDeleting={isDeleting}
      />
      <ConfirmationDialog
        open={showExitDialog && permissions.canAccessModals}
        hasUnsavedChanges={false}
        onCancel={cancelExit}
        onConfirm={confirmExit}
      />
      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        exportFormat={exportFormat}
        onFormatChange={setExportFormat}
        onConfirm={handleExportConfirm}
        selectedCount={selectAllAcrossPages ? 'all' : Object.values(selectedContacts).filter(Boolean).length}
        totalCount={pagination.totalItems}
        isExporting={isDeleting}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {editContact && permissions.canEdit && permissions.canAccessModals && (
        <div className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative sm:animate-slideUp border border-gray-300 transition-all duration-300">
            <button
              onClick={() => setEditContact(null)}
              className="absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors bg-gray-100"
            >
              ×
            </button>
            <EditContact
              contact={editContact}
              closePopup={() => setEditContact(null)}
              onSuccess={handleContactEdit}
            />
          </div>
        </div>
      )}
      {deleteContact &&
        permissions.canDelete &&
        permissions.canAccessModals && (
          <SingleDeleteDialog
            showDialog={!!deleteContact}
            contactName={deleteContact.fullName}
            onCancel={() => setDeleteContact(null)}
            onConfirm={() =>
              handleSingleContactDelete(deleteContact.contact_id)
            }
            isDeleting={isDeleting}
          />
        )}

      <GroupNameDialog
        isOpen={showGroupDialog}
        onClose={() => setShowGroupDialog(false)}
        onConfirm={handleCreateGroup}
        isSubmitting={isDeleting}
      />
    </>
  );
}
