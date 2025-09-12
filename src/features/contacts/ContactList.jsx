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
import { Navigate, useNavigate } from "react-router-dom";
import BroadcastPages from "../broadcast/BroadcastPages";
import { Phone } from "lucide-react";

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
      if (e.key === "Escape") {
        cancelDelete();
      }
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
      onMouseDown={(e) => e.stopPropagation()}
    >
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
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCrossHighlighted, setIsCrossHighlighted] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const popupRef = useRef(null);
  const { user } = useAuth();
  const permissions = getPermissions(user);
  const [editContact, setEditContact] = useState(null);
  const [deleteContact, setDeleteContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [allContacts, setAllContacts] = useState([]);
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
      setError(null);

      console.log("📤 Fetching contacts with params:", {
        customer_id: user?.customer_id,
        page,
        limit,
        search,
      });

      const response = await axios.get(API_ENDPOINTS.CONTACTS.GET_ALL, {
        params: {
          customer_id: user?.customer_id,
          page,
          limit,
          ...(search ? { search } : {}),
        },
        withCredentials: true,
        validateStatus: (status) => status < 500,
      });

      console.log("✅ API Response Status:", response.status);
      console.log("📄 API Response Data:", response.data);

      if (response.status >= 400) {
        throw new Error(response.data?.message || "Failed to fetch contacts");
      }

      const result = response.data;
      const contacts = Array.isArray(result.data) ? result.data : [];

      console.log("📦 Contacts Data from API:", contacts);

      const transformedContacts = contacts.map((item) => ({
        ...item,
        status: "Opted-in",
        customer_id: user?.customer_id,
        date: formatDate(item.created_at),
        number: `${item.country_code || ""} ${item.mobile_no}`,
        fullName: `${item.first_name} ${item.last_name || ""}`.trim(),
      }));

      console.log("🔄 Transformed Contacts:", transformedContacts);

      // Update displayed contacts for current page
      setContacts(transformedContacts);

      // Merge into allContacts for multi-page selection
      setAllContacts((prev) => {
        const map = new Map(prev.map((c) => [c.contact_id, c]));
        transformedContacts.forEach((c) => map.set(c.contact_id, c));
        return Array.from(map.values());
      });

      // Update pagination
      setPagination((prev) => {
        const newPagination = {
          currentPage: result.pagination?.page || result.current_page || page,
          totalPages:
            result.pagination?.totalPages ||
            result.last_page ||
            (result.total ? Math.ceil(result.total / limit) : 1) ||
            1,
          totalItems:
            result.pagination?.totalRecords ||
            result.total ||
            contacts.length ||
            0,
          itemsPerPage: result.pagination?.limit || result.per_page || limit,
        };
        console.log("📊 Updated Pagination:", newPagination);
        return newPagination;
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch contacts";
      console.error("❌ Error fetching contacts:", {
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

  // Debounced search using setTimeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchContacts(1, pagination.itemsPerPage, searchTerm);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm, pagination.itemsPerPage]);

  const filterCounts = {
    All: pagination.totalItems,
    "Opted-in": contacts.filter((c) => c.status === "Opted-in").length,
    "Opted-Out": contacts.filter((c) => c.status === "Opted-Out").length,
  };

  const filteredContacts = contacts.filter((c) => {
    if (filter === "All") return true;
    return c.status === filter;
  });

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

  const displayedContacts = filteredContacts.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const filterButtons = ["All", "Opted-in", "Opted-Out"];

  const handleSelectAllChange = (event) => {
    if (!permissions.canDelete) return;
    const checked = event.target.checked;
    setSelectAll(checked);

    if (checked) {
      const newSelected = {};
      displayedContacts.forEach((contact) => {
        if (canDeleteContact(contact)) {
          newSelected[contact.contact_id] = true;
        }
      });
      setSelectedContacts(newSelected);
    } else {
      setSelectedContacts({});
    }
  };

  const handleCheckboxChange = (contactId, isChecked) => {
    const contact = displayedContacts.find((c) => c.contact_id === contactId);
    if (!contact || !canDeleteContact(contact)) return;

    setSelectedContacts((prev) => ({
      ...prev,
      [contactId]: isChecked,
    }));
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
    const total = displayedContacts.length;
    const selected = Object.keys(selectedContacts).length;
    setSelectAll(selected === total && total > 0);
  }, [selectedContacts, displayedContacts.length]);

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
    setShowDeleteDialog(true);
  };

  //brodcast button handler
  const handleAddbroadcast = async () => {
    const selectedContactIds = Object.entries(selectedContacts)
      .filter(([contactId, isSelected]) => isSelected)
      .map(([contactId]) => contactId);

    if (selectedContactIds.length === 0) {
      toast.error("Please select at least one contact.");
      return;
    }

    // Build selected contacts from ALL fetched contacts
    const selectedContactList = selectedContactIds
      .map((id) => allContacts.find((c) => c.contact_id == id))
      .filter(Boolean) // skip any missing contacts
      .map((contact) => ({
        contact_id: contact.contact_id,
        Name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim(),
        CountryCode: `${contact.country_code || ""}`.trim(),
        Phone: `${contact.mobile_no || ""}`.trim(),
      }));

    console.log("Selected contact IDs:", selectedContactIds);
    console.log("Selected Contacts:", selectedContactList);

    const groupName = prompt("Enter a name for the contact group:");
    if (!groupName || groupName.trim() === "") {
      toast.error("Group name is required.");
      return;
    }

    try {
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
    const selectedIds = Object.entries(selectedContacts)
      .filter(([contactId, isSelected]) => isSelected)
      .map(([contactId]) => contactId);

    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`${API_ENDPOINTS.CONTACTS.DELETE}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact_ids: selectedIds,
          customer_id: user?.customer_id,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete contacts");
      }

      await fetchContacts();
      setSelectedContacts({});
      setSelectAll(false);
      const deletedCount = selectedIds.length;
      toast.success(
        `${deletedCount} contact${
          deletedCount > 1 ? "s" : ""
        } deleted successfully!`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        }
      );
    } catch (error) {
      console.error("Error deleting contacts:", error);
      setError(error.message || "Failed to delete contacts. Please try again.");
      toast.error(
        error.message || "Failed to delete contacts. Please try again.",
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
      <div className="flex-1">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative">
            {error}
            <button
              onClick={() => setError(null)}
              className="absolute right-3 top-3 font-bold"
            >
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
                }`}
                  >
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
              className="bg-[#0AA89E] hover:bg-[#0AA89E]/90 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-md transition w-full sm:w-auto"
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
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                      />
                    </div>
                  </th>
                ) : (
                  <th className="px-2 py-3 sm:px-6"></th>
                )}
                {permissions.canDelete && 
                Object.values(selectedContacts).some(Boolean) ? (
                  <th colSpan="6" className="px-2 py-3 sm:px-6">
                    <div className="flex justify-end gap-6">
                      <button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        Delete
                      </button>
                      <button
                        onClick={handleAddbroadcast}
                        className="text-white border border-teal-500 bg-teal-500 px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Send
                      </button>
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
                displayedContacts.map((contact, idx) => (
                  <ContactRow
                    key={contact.id || idx}
                    contact={contact}
                    isChecked={!!selectedContacts[contact.contact_id]}
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
            className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative sm:animate-slideUp border ${
              isCrossHighlighted ? "border-teal-500" : "border-gray-300"
            } transition-all duration-300`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseAndNavigate}
              className={`absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors cursor-pointer ${
                isCrossHighlighted
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
        selectedCount={Object.keys(selectedContacts).length}
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
    </>
  );
}
