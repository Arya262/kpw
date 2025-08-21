import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { ROLE_PERMISSIONS } from "../../context/permissions";
import ContactRow from "./ContactRow";
import AddContact from "./Addcontact";
import vendor from "../../assets/Vector.png";
import { API_ENDPOINTS } from "../../config/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditContact from "./EditContact";
import SingleDeleteDialog from "./SingleDeleteDialog";
import { getPermissions } from "../../utils/getPermissions";
import Loader from "../../components/Loader"; // Import the Loader component

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  if (hasTime) {
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return (
      <div className="flex flex-col">
        <span>{formattedDate}</span>
        <span>{formattedTime}</span>
      </div>
    );
  }
  return <span>{formattedDate}</span>;
};

const ConfirmationDialog = ({
  showExitDialog,
  hasUnsavedChanges,
  cancelExit,
  confirmExit,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        cancelExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cancelExit]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  if (!showExitDialog) return null;

  return (
    <div
      className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 "
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg transform transition-all duration-300 scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        tabIndex="-1"
      >
        <div className="flex items-center gap-3 mb-4">
          <svg
            className="w-6 h-6 text-teal-500"
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
          <h3 id="dialog-title" className="text-lg font-semibold text-gray-800">
            Exit Confirmation
          </h3>
        </div>
        <p id="dialog-message" className="text-gray-600 mb-6">
          {hasUnsavedChanges
            ? "You have unsaved changes. Are you sure you want to exit?"
            : "Are you sure you want to exit?"}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={cancelExit}
            className="px-3 py-2 w-[70px] bg-gray-200 text-gray-700 rounded-md cursor-pointer"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={confirmExit}
            className="px-3 py-2 w-[70px] bg-[#0AA89E] text-white rounded-md cursor-pointer"
            aria-label="Confirm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState({});
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

  const fetchContacts = async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.CONTACTS.GET_ALL}?customer_id=${user?.customer_id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Unauthorized or failed to fetch");
      }

      const data = await response.json();

      const transformed = data.map((item) => ({
        ...item,
        status: "Opted-in", // Default status for all contacts
        contact_id: item.contact_id,
        customer_id: item.customer_id,
        date: formatDate(item.created_at),
        number: `${item.country_code || ""} ${item.mobile_no}`,
        fullName: `${item.first_name} ${item.last_name || ""}`.trim(),
      }));

      setContacts(transformed);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filterCounts = {
    All: contacts.length,
    "Opted-in": contacts.filter((c) => c.status === "Opted-in").length,
    "Opted-Out": contacts.filter((c) => c.status === "Opted-Out").length,
  };

  const filteredContacts = contacts.filter((c) => {
    if (filter === "All") return true;
    return c.status === filter;
  });

  // Filtered contacts based on search term
  const displayedContacts = filteredContacts.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // For 'User' role, only allow edit/delete for own contacts
  const canEditContact = (contact) => {
    if (!permissions.canEdit) return false;
    if (user?.role?.toLowerCase?.() === "user") {
      return contact.created_by === user?.id; // assuming contact.created_by is the user id
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

  // Handle Select All checkbox change
  const handleSelectAllChange = (event) => {
    if (!permissions.canDelete) return;
    const checked = event.target.checked;
    setSelectAll(checked);
    const newSelected = {};
    if (checked) {
      displayedContacts.forEach((contact, idx) => {
        if (canDeleteContact(contact)) {
          newSelected[idx] = true;
        }
      });
    }
    setSelectedRows(newSelected);
  };

  // Handle individual checkbox change
  const handleCheckboxChange = (idx, event) => {
    if (!canDeleteContact(displayedContacts[idx])) return;
    setSelectedRows((prev) => ({
      ...prev,
      [idx]: event.target.checked,
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
    const selected = Object.values(selectedRows).filter(Boolean).length;
    setSelectAll(selected === total && total > 0);
  }, [selectedRows, displayedContacts.length]);

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
    const selectedIds = Object.entries(selectedRows)
      .filter(([idx, isSelected]) => {
        const contact = displayedContacts[idx];
        return isSelected && canDeleteContact(contact);
      })
      .map(([idx]) => {
        const contact = displayedContacts[idx];
        return contact?.contact_id;
      });
    console.log("Final selected contact_ids:", selectedIds);

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

      // Refresh the contacts list
      await fetchContacts();
      // Reset selection
      setSelectedRows({});
      setSelectAll(false);

      // Show success toast
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

      // Show error toast
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
    <div className="flex-1">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-xl font-bold">Contacts</h2>
          {permissions.canSeeFilters && (
            <div className="flex gap-2 flex-wrap">
              {filterButtons.map((btn) => (
                <button
                  key={btn}
                  onClick={() => setFilter(btn)}
                  className={`px-4 py-2 min-h-[40px] rounded-md text-sm font-medium transition cursor-pointer 
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
        {permissions.canSeeFilters && (
          <div className="relative max-w-xs ml-auto">
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
        {/* Always show Add Contact button, enforce permission in handler */}
        <button
          className="bg-[#0AA89E] hover:bg-[#0AA89E] text-white flex items-center gap-2 px-4 py-2 rounded cursor-pointer"
          onClick={permissions.canAdd && permissions.canAccessModals ? openPopup : handleUnauthorizedAdd}
        >
          <img src={vendor} alt="plus sign" className="w-5 h-5" />
          Add Contact
        </button>
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
                {permissions.canDelete && Object.values(selectedRows).some(Boolean) && (
                  <th colSpan="6" className="px-2 py-3 sm:px-6">
                    <div className="flex justify-center">
                      <button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        Delete Selected
                      </button>
                    </div>
                  </th>
                )}
                {!Object.values(selectedRows).some(Boolean) && (
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
                  <td colSpan="7" className="text-center py-4 text-gray-500 font-medium">
                     <img
                        src="/no_data.14591486.svg"
                        alt="No data available"
                        className="w-full h-72 mb-4 opacity-80"
                      />
                    No contacts found.
                  </td>
                </tr>
              ) : (
                displayedContacts.map((contact, idx) => (
                  <ContactRow
                    key={contact.id || idx}
                    contact={contact}
                    isChecked={!!selectedRows[idx]}
                    onCheckboxChange={(e) => handleCheckboxChange(idx, e)}
                    onEditClick={permissions.canEdit && canEditContact(contact) ? setEditContact : handleUnauthorizedEdit}
                    onDeleteClick={permissions.canDelete && canDeleteContact(contact) ? setDeleteContact : handleUnauthorizedDelete}
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
        selectedCount={Object.values(selectedRows).filter(Boolean).length}
        cancelDelete={cancelDelete}
        confirmDelete={confirmDelete}
        isDeleting={isDeleting}
      />
      <ConfirmationDialog
        showExitDialog={showExitDialog && permissions.canAccessModals}
        hasUnsavedChanges={false}
        cancelExit={cancelExit}
        confirmExit={confirmExit}
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
      {deleteContact && permissions.canDelete && permissions.canAccessModals && (
        <SingleDeleteDialog
          showDialog={!!deleteContact}
          contactName={deleteContact.fullName}
          onCancel={() => setDeleteContact(null)}
          onConfirm={() => handleSingleContactDelete(deleteContact.contact_id)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}