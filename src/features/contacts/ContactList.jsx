import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPermissions } from "../../utils/getPermissions";
import { API_ENDPOINTS } from "../../config/api";
import { toast } from "react-toastify";
import FilterDialog from "../../components/FilterDialog";
import Pagination from "../shared/Pagination";

// Custom hooks
import { useContactData } from "./hooks/useContactData";
import { useContactSelection } from "./hooks/useContactSelection";

// Components
import ContactListHeader from "./components/ContactListHeader";
import ContactTable from "./components/ContactTable";
import ContactModals from "./components/ContactModals";
import ContactDetailsModal from "./components/ContactDetailsModal";

// Utils
import { 
  showToast, 
  checkPermission, 
  filterContacts, 
  exportContactsToCSV,
  canEditContact,
  canDeleteContact 
} from "./utils/contactUtils";

export default function ContactListRefactored() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const permissions = getPermissions(user);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    name: '',
    phone: '',
    email: '',
    status: '',
    date: '',
    group: '',
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
    attributeValue: '',
    selectedTags: []
  });

  // Modal states
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [deleteContact, setDeleteContact] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [actionRequiringPlan, setActionRequiringPlan] = useState(null);
  const [selectedContactsForGroup, setSelectedContactsForGroup] = useState({
    ids: [],
    list: []
  });
  const [viewContact, setViewContact] = useState(null);

  // Custom hooks
  const {
    contacts,
    allContacts,
    loading,
    error,
    pagination,
    setError,
    setLoading,
    fetchContacts,
    fetchAllContacts,
    handlePageChange,
    handleItemsPerPageChange,
  } = useContactData(user, searchTerm, filterOptions);

  // Local loading state for group submission
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  const {
    selection,
    hasSelectedContacts,
    handleCheckboxChange,
    handleSelectAllChange,
    handleSelectAllAcrossPages,
    clearSelection,
    getSelectedCount,
    isContactSelected,
  } = useContactSelection();

  // Filter contacts
  const filteredContacts = filterContacts(contacts, filter, filterOptions);
  const displayedContacts = filteredContacts;

  // Filter counts
  const filterButtons = ["All", "Opted-in", "Opted-Out"];
  const filterCounts = {
    All: pagination.totalItems,
    "Opted-in": contacts.filter((c) => c.status === "Opted-in").length,
    "Opted-Out": contacts.filter((c) => c.status === "Opted-Out").length,
  };

  // Event handlers
  const openPopup = useCallback(() => {
    if (!checkPermission("canAdd", "add contacts", permissions) || !checkPermission("canAccessModals", "access modals", permissions)) {
      return;
    }
    setIsPopupOpen(true);
  }, [permissions]);

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
  }, []);

  const confirmExit = useCallback(() => {
    setIsPopupOpen(false);
    setShowExitDialog(false);
  }, []);

  const cancelExit = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  const handleDeleteClick = useCallback(() => {
    if (!checkPermission("canDelete", "delete contacts", permissions)) return;
    const selectedCount = getSelectedCount(pagination.totalItems);
    if (selectedCount === 0) {
      showToast("Please select at least one contact to delete.", "error");
      return;
    }
    setShowDeleteDialog(true);
  }, [permissions, getSelectedCount, pagination.totalItems]);

  const handleAddbroadcast = useCallback(async (createGroup = true) => {
    if (!checkPermission("canAdd", "add broadcasts", permissions)) return;

    let selectedContacts = [];
    let selectedContactList = [];

    if (selection.mode === 'all') {
      try {
        const allFetchedContacts = await fetchAllContacts();
        selectedContacts = allFetchedContacts
          .filter((contact) => !selection.excluded[contact.contact_id])
          .map((contact) => contact.contact_id);

        selectedContactList = allFetchedContacts
          .filter((contact) => !selection.excluded[contact.contact_id])
          .map((contact) => ({
            contact_id: contact.contact_id,
            Name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim(),
            CountryCode: `${contact.country_code || ""}`.trim(),
            Phone: `${contact.mobile_no || ""}`.trim(),
          }));
      } catch (error) {
        showToast("Failed to fetch all contacts.", "error");
        return;
      }
    } else if (selection.mode === 'page') {
      const allContacts = await fetchAllContacts();
      selectedContacts = allContacts
        .filter(contact => selection.selected[contact.contact_id])
        .map(contact => contact.contact_id);

      selectedContactList = allContacts
        .filter(contact => selection.selected[contact.contact_id])
        .map((contact) => ({
          contact_id: contact.contact_id,
          Name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim(),
          CountryCode: `${contact.country_code || ""}`.trim(),
          Phone: `${contact.mobile_no || ""}`.trim(),
        }));
    } else {
      selectedContacts = Object.keys(selection.selected);
      const allContacts = await fetchAllContacts();
      selectedContactList = allContacts
        .filter(contact => selection.selected[contact.contact_id])
        .map((contact) => ({
          contact_id: contact.contact_id,
          Name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim(),
          CountryCode: `${contact.country_code || ""}`.trim(),
          Phone: `${contact.mobile_no || ""}`.trim(),
        }));
    }

    if (selectedContactList.length === 0) {
      showToast("Please select at least one contact.", "error");
      return;
    }

    if (createGroup) {
      setSelectedContactsForGroup({
        ids: selectedContacts,
        list: selectedContactList,
      });
      showToast(`Selected ${selectedContactList.length} contact${selectedContactList.length !== 1 ? 's' : ''} for broadcast`);
      setShowGroupDialog(true);
    } else {
      navigate("/broadcast", {
        state: {
          openForm: true,
          contacts: selectedContactList,
          directBroadcast: true,
        },
      });
    }
  }, [permissions, selection, fetchAllContacts, navigate]);

  const handleCreateGroup = useCallback(async (groupName) => {
    if (!groupName || groupName.trim() === "") {
      showToast("Group name is required.", "error");
      return;
    }

    const { ids: selectedContactIds, list: selectedContactList } = selectedContactsForGroup;

    try {
      setIsSubmittingGroup(true);
      const formData = new FormData();
      formData.append("customer_id", user?.customer_id);
      formData.append("group_name", groupName.trim());

      let csvContent = "Name,CountryCode,Phone\n";
      selectedContactList.forEach((contact) => {
        csvContent += `${contact.Name.replace(/"/g, '""')},${contact.CountryCode.replace(/"/g, '""')},${contact.Phone.replace(/"/g, '""')}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv" });
      formData.append("file", blob, "contactlist.csv");

      const res = await fetch(`${API_ENDPOINTS.GROUPS.CREATE}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create group");
      }

      showToast("Group created successfully!");
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
      showToast(err.message || "Could not create group.", "error");
    } finally {
      setIsSubmittingGroup(false);
    }
  }, [selectedContactsForGroup, user?.customer_id, navigate]);

  const cancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (!checkPermission("canDelete", "delete contacts", permissions)) return;

    let selectedIds = selection.mode === 'all'
      ? (await fetchAllContacts()).map((c) => c.contact_id).filter((id) => !selection.excluded[id])
      : Object.keys(selection.selected);

    try {
      setLoading((prev) => ({ ...prev, delete: true }));
      const payload = {
        contact_ids: selectedIds,
        customer_id: user?.customer_id,
      };

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
      clearSelection();
      showToast(
        selection.mode === 'all'
          ? `All ${pagination.totalItems - Object.keys(selection.excluded).length} contacts deleted successfully!`
          : `${selectedIds.length} contact${selectedIds.length > 1 ? "s" : ""} deleted successfully!`
      );
    } catch (error) {
      showToast(error.message || "Failed to delete contacts.", "error");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  }, [permissions, selection, fetchAllContacts, user?.customer_id, fetchContacts, clearSelection, pagination.totalItems, setLoading]);

  const confirmDelete = useCallback(async () => {
    if (!checkPermission("canDelete", "delete contacts", permissions)) return;
    await handleDeleteSelected();
    setShowDeleteDialog(false);
  }, [permissions, handleDeleteSelected]);

  const getContactsToExport = useCallback(async () => {
    if (selection.mode === 'all') {
      return (await fetchAllContacts()).filter((contact) => !selection.excluded[contact.contact_id]);
    } else if (Object.keys(selection.selected).length > 0) {
      return allContacts.filter((contact) => selection.selected[contact.contact_id]);
    }
    return [...displayedContacts];
  }, [selection, fetchAllContacts, allContacts, displayedContacts]);

  const exportContactsToCSVHandler = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, export: true }));
      const contactsToExport = await getContactsToExport();
      if (contactsToExport.length === 0) {
        showToast("No contacts to export", "warning");
        return;
      }

      exportContactsToCSV(contactsToExport, 'contacts');
      showToast(`Exported ${contactsToExport.length} contacts to CSV`);
    } catch (error) {
      showToast("Failed to export contacts.", "error");
    } finally {
      setLoading((prev) => ({ ...prev, export: false }));
    }
  }, [getContactsToExport, setLoading]);

  const handleExportConfirm = useCallback(async () => {
    setShowExportDialog(false);
    if (exportFormat === 'csv') {
      await exportContactsToCSVHandler();
    } else {
      showToast("Export format not supported yet.", "error");
    }
  }, [exportFormat, exportContactsToCSVHandler]);

  const handleSingleContactDelete = useCallback(async (contact_id) => {
    if (!checkPermission("canDelete", "delete contacts", permissions)) return;
    try {
      setLoading((prev) => ({ ...prev, delete: true }));
      const payload = {
        contact_ids: [contact_id],
        customer_id: user?.customer_id,
      };
      const response = await fetch(`${API_ENDPOINTS.CONTACTS.DELETE}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete contact");
      }

      await fetchContacts();
      showToast("Contact deleted successfully!");
    } catch (error) {
      showToast(error.message || "Failed to delete contact.", "error");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
      setDeleteContact(null);
    }
  }, [permissions, user?.customer_id, fetchContacts, setLoading]);

  const handleContactEdit = useCallback(async () => {
    if (!checkPermission("canEdit", "edit contacts", permissions)) return;
    await fetchContacts();
    showToast("Contact updated successfully!");
  }, [permissions, fetchContacts]);

  const handleContactAdd = useCallback((message) => {
    if (!checkPermission("canAdd", "add contacts", permissions)) return;
    fetchContacts();
    showToast(message || "Contact added successfully!");
    setIsPopupOpen(false);
  }, [permissions, fetchContacts]);

  const checkPlanBeforeAction = useCallback((action) => {
    const plan = (user?.plan || '').toLowerCase();
    if (action === 'bulkImport' && plan !== 'pro') {
      setActionRequiringPlan(action);
      setShowPlansModal(true);
      return false;
    }
    if (!user?.plan || user?.plan === 'null') {
      setActionRequiringPlan(action);
      setShowPlansModal(true);
      return false;
    }
    return true;
  }, [user?.plan]);

  const handleEditClick = useCallback((contact) => {
    if (checkPermission("canEdit", "edit contacts", permissions) && canEditContact(contact, user, permissions)) {
      setEditContact(contact);
    } else {
      showToast("You do not have permission to edit contacts.", "error");
    }
  }, [permissions, user]);

  const handleDeleteClickSingle = useCallback((contact) => {
    if (checkPermission("canDelete", "delete contacts", permissions) && canDeleteContact(contact, user, permissions)) {
      setDeleteContact(contact);
    } else {
      showToast("You do not have permission to delete contacts.", "error");
    }
  }, [permissions, user]);
  const handleSyncContacts = useCallback(async () => {
    if (!user?.customer_id) {
      showToast("Customer ID not found.", "error");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, sync: true }));
      
      const response = await fetch(API_ENDPOINTS.CONTACTS.SYNC(user.customer_id), {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sync contacts");
      }

      await fetchContacts(pagination.currentPage, pagination.itemsPerPage, searchTerm);
      showToast("Contacts synced successfully!");
    } catch (error) {
      showToast(error.message || "Failed to sync contacts.", "error");
    } finally {
      setLoading((prev) => ({ ...prev, sync: false }));
    }
  }, [user?.customer_id, fetchContacts, pagination.currentPage, pagination.itemsPerPage, searchTerm, setLoading]);

  return (
    <>
      <div className="flex-1 pt-2.5">
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
        
        <ContactListHeader
          user={user}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filter={filter}
          setFilter={setFilter}
          filterButtons={filterButtons}
          filterCounts={filterCounts}
          onAddContact={openPopup}
          onOpenFilterDialog={() => setFilterDialogOpen(true)}
          onSyncContacts={handleSyncContacts}
          isSyncing={loading.sync}
          permissions={permissions}
        />
      </div>

      <FilterDialog
        isOpen={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        filterOptions={filterOptions}
        onFilterChange={(newOptions) => setFilterOptions(newOptions)}
        onReset={() =>
          setFilterOptions({
            name: '',
            phone: '',
            email: '',
            status: '',
            date: '',
            group: '',
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
            attributeValue: '',
            selectedTags: []
          })
        }
        onApply={() => setFilterDialogOpen(false)}
      />

      {selection.mode === 'page' && Object.keys(selection.selected).length === displayedContacts.length && (
        <div className="p-2 text-sm bg-yellow-100 rounded-md mb-2 text-gray-700">
          All {displayedContacts.length} contacts on this page are selected.{" "}
          <button
            className="underline ml-1 text-teal-600"
            onClick={handleSelectAllAcrossPages}
          >
            Select all {pagination.totalItems} contacts
          </button>
        </div>
      )}

      <ContactTable
        displayedContacts={displayedContacts}
        loading={loading}
        hasSelectedContacts={hasSelectedContacts}
        selection={selection}
        pagination={pagination}
        onSelectAllChange={(e) => handleSelectAllChange(e, displayedContacts)}
        onCheckboxChange={handleCheckboxChange}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClickSingle}
        onRowClick={(contact) => setViewContact(contact)}
        onSendBroadcast={handleAddbroadcast}
        onExport={() => setShowExportDialog(true)}
        onDelete={handleDeleteClick}
        onSelectAllAcrossPages={handleSelectAllAcrossPages}
        user={user}
        permissions={permissions}
      />

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

      <ContactModals
        // Add Contact Modal
        isAddContactOpen={isPopupOpen}
        onCloseAddContact={closePopup}
        onContactAdd={handleContactAdd}
        onPlanRequired={checkPlanBeforeAction}
        permissions={permissions}
        
        // Edit Contact Modal
        editContact={editContact}
        onCloseEditContact={() => setEditContact(null)}
        onContactEdit={handleContactEdit}
        
        // Delete Contact Modal
        deleteContact={deleteContact}
        onCloseDeleteContact={() => setDeleteContact(null)}
        onSingleContactDelete={handleSingleContactDelete}
        isDeleting={loading.delete}
        
        // Bulk Delete Dialog
        showDeleteDialog={showDeleteDialog}
        selectedCount={getSelectedCount(pagination.totalItems)}
        onCancelDelete={cancelDelete}
        onConfirmDelete={confirmDelete}
        isDeletingBulk={loading.delete}
        
        // Group Dialog
        showGroupDialog={showGroupDialog}
        onCloseGroupDialog={() => setShowGroupDialog(false)}
        onCreateGroup={handleCreateGroup}
        isSubmittingGroup={isSubmittingGroup}
        
        // Export Dialog
        showExportDialog={showExportDialog}
        onCloseExportDialog={() => setShowExportDialog(false)}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        onExportConfirm={handleExportConfirm}
        selectedCountForExport={selection.mode === 'all' ? 'all' : Object.keys(selection.selected).length}
        totalCount={pagination.totalItems}
        isExporting={loading.export}
        
        // Exit Confirmation
        showExitDialog={showExitDialog}
        onCancelExit={cancelExit}
        onConfirmExit={confirmExit}
        
        // Plans Modal
        showPlansModal={showPlansModal}
        onClosePlansModal={() => {
          setShowPlansModal(false);
          setActionRequiringPlan(null);
        }}
      />

      {/* Contact Details Modal */}
      <ContactDetailsModal
        contact={viewContact}
        isOpen={!!viewContact}
        onClose={() => setViewContact(null)}
        onContactUpdate={() => fetchContacts(pagination.currentPage, pagination.itemsPerPage, searchTerm)}
      />
    </>
  );
}
