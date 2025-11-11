import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPermissions } from "../../utils/getPermissions";
import { API_ENDPOINTS } from "../../config/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilterDialog from "../../components/FilterDialog";
import Pagination from "../shared/Pagination";

// Context
import { useContactContext } from "./context/ContactContext";

// Custom hooks
import { useContactData } from "./hooks/useContactData";

// Components
import ContactListHeader from "./components/ContactListHeader";
import ContactTable from "./components/ContactTable";
import ContactModals from "./components/ContactModals";

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

  // Get state and actions from context
  const {
    state,
    openAddContact,
    closeAddContact,
    openEditContact,
    closeEditContact,
    openDeleteContact,
    closeDeleteContact,
    openBulkDelete,
    closeBulkDelete,
    openGroupDialog,
    closeGroupDialog,
    openExportDialog,
    closeExportDialog,
    openFilterDialog,
    closeFilterDialog,
    openPlansModal,
    closePlansModal,
    setSearchTerm,
    setActiveFilter,
    updateFilterOptions,
    resetFilters,
    startLoading,
    stopLoading,
    setSubmitting,
    selectContact,
    selectAllPage,
    selectAllContacts,
    deselectAllPage,
    clearSelection,
    setExportFormat,
    setSelectedContactsForGroup,
    setError,
    clearError,
  } = useContactContext();

  // Destructure state for easier access
  const {
    ui: { modals, actionRequiringPlan },
    filters: { searchTerm, activeFilter, options: filterOptions },
    loading,
    selection,
    export: { format: exportFormat, selectedContacts: selectedContactsForGroup },
    error,
  } = state;

  // Custom hooks
  const {
    contacts,
    allContacts,
    loading: dataLoading,
    error: dataError,
    pagination,
    fetchContacts,
    fetchAllContacts,
    handlePageChange,
    handleItemsPerPageChange,
  } = useContactData(user, searchTerm, filterOptions);

  // Sync data loading state with context
  useEffect(() => {
    if (dataLoading.contacts) {
      startLoading('contacts');
    } else {
      stopLoading('contacts');
    }
  }, [dataLoading.contacts, startLoading, stopLoading]);

  // Sync data error with context
  useEffect(() => {
    if (dataError) {
      setError(dataError);
    }
  }, [dataError, setError]);

  // Filter contacts
  const filteredContacts = filterContacts(contacts, activeFilter, filterOptions);
  const displayedContacts = filteredContacts;

  // Filter counts
  const filterButtons = ["All", "Opted-in", "Opted-Out"];
  const filterCounts = {
    All: pagination.totalItems,
    "Opted-in": contacts.filter((c) => c.status === "Opted-in").length,
    "Opted-Out": contacts.filter((c) => c.status === "Opted-Out").length,
  };

  // Event handlers
  const handleOpenAddContact = useCallback(() => {
    if (!checkPermission("canAdd", "add contacts", permissions) || 
        !checkPermission("canAccessModals", "access modals", permissions)) {
      return;
    }
    openAddContact();
  }, [permissions, openAddContact]);

  const handleDeleteClick = useCallback(() => {
    if (!checkPermission("canDelete", "delete contacts", permissions)) return;
    const selectedCount = selection.mode === 'all'
      ? pagination.totalItems - Object.keys(selection.excluded).length
      : Object.keys(selection.selected).length;
    
    if (selectedCount === 0) {
      showToast("Please select at least one contact to delete.", "error");
      return;
    }
    openBulkDelete();
  }, [permissions, selection, pagination.totalItems, openBulkDelete]);

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
      openGroupDialog();
    } else {
      navigate("/broadcast", {
        state: {
          openForm: true,
          contacts: selectedContactList,
          directBroadcast: true,
        },
      });
    }
  }, [permissions, selection, fetchAllContacts, navigate, setSelectedContactsForGroup, openGroupDialog]);

  const handleCreateGroup = useCallback(async (groupName) => {
    if (!groupName || groupName.trim() === "") {
      showToast("Group name is required.", "error");
      return;
    }

    const { ids: selectedContactIds, list: selectedContactList } = selectedContactsForGroup;

    try {
      setSubmitting(true);
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
      closeGroupDialog();

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
      setSubmitting(false);
    }
  }, [selectedContactsForGroup, user?.customer_id, navigate, setSubmitting, closeGroupDialog]);

  const handleDeleteSelected = useCallback(async () => {
    if (!checkPermission("canDelete", "delete contacts", permissions)) return;

    let selectedIds = selection.mode === 'all'
      ? (await fetchAllContacts()).map((c) => c.contact_id).filter((id) => !selection.excluded[id])
      : Object.keys(selection.selected);

    try {
      startLoading('delete');
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
      stopLoading('delete');
    }
  }, [permissions, selection, fetchAllContacts, user?.customer_id, fetchContacts, clearSelection, pagination.totalItems, startLoading, stopLoading]);

  const confirmDelete = useCallback(async () => {
    if (!checkPermission("canDelete", "delete contacts", permissions)) return;
    await handleDeleteSelected();
    closeBulkDelete();
  }, [permissions, handleDeleteSelected, closeBulkDelete]);

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
      startLoading('export');
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
      stopLoading('export');
    }
  }, [getContactsToExport, startLoading, stopLoading]);

  const handleExportConfirm = useCallback(async () => {
    closeExportDialog();
    if (exportFormat === 'csv') {
      await exportContactsToCSVHandler();
    } else {
      showToast("Export format not supported yet.", "error");
    }
  }, [exportFormat, exportContactsToCSVHandler, closeExportDialog]);

  const handleSingleContactDelete = useCallback(async (contact_id) => {
    if (!checkPermission("canDelete", "delete contacts", permissions)) return;
    try {
      startLoading('delete');
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
      stopLoading('delete');
      closeDeleteContact();
    }
  }, [permissions, user?.customer_id, fetchContacts, startLoading, stopLoading, closeDeleteContact]);

  const handleContactEdit = useCallback(async () => {
    if (!checkPermission("canEdit", "edit contacts", permissions)) return;
    await fetchContacts();
    showToast("Contact updated successfully!");
  }, [permissions, fetchContacts]);

  const handleContactAdd = useCallback((message) => {
    if (!checkPermission("canAdd", "add contacts", permissions)) return;
    fetchContacts();
    showToast(message || "Contact added successfully!");
    closeAddContact();
  }, [permissions, fetchContacts, closeAddContact]);

  const checkPlanBeforeAction = useCallback((action) => {
    const plan = (user?.plan || '').toLowerCase();
    if (action === 'bulkImport' && plan !== 'pro') {
      openPlansModal(action);
      return false;
    }
    if (!user?.plan || user?.plan === 'null') {
      openPlansModal(action);
      return false;
    }
    return true;
  }, [user?.plan, openPlansModal]);

  const handleEditClick = useCallback((contact) => {
    if (checkPermission("canEdit", "edit contacts", permissions) && canEditContact(contact, user, permissions)) {
      openEditContact(contact);
    } else {
      showToast("You do not have permission to edit contacts.", "error");
    }
  }, [permissions, user, openEditContact]);

  const handleDeleteClickSingle = useCallback((contact) => {
    if (checkPermission("canDelete", "delete contacts", permissions) && canDeleteContact(contact, user, permissions)) {
      openDeleteContact(contact);
    } else {
      showToast("You do not have permission to delete contacts.", "error");
    }
  }, [permissions, user, openDeleteContact]);

  const handleSyncContacts = useCallback(async () => {
    if (!user?.customer_id) {
      showToast("Customer ID not found.", "error");
      return;
    }

    try {
      startLoading('sync');
      
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
      stopLoading('sync');
    }
  }, [user?.customer_id, fetchContacts, pagination.currentPage, pagination.itemsPerPage, searchTerm, startLoading, stopLoading]);

  const handleSelectAllChange = useCallback((event) => {
    const checked = event.target.checked;
    if (checked) {
      selectAllPage(displayedContacts);
    } else {
      deselectAllPage();
    }
  }, [displayedContacts, selectAllPage, deselectAllPage]);

  const handleCheckboxChange = useCallback((contactId, isChecked) => {
    selectContact(contactId, isChecked);
  }, [selectContact]);

  const getSelectedCount = useCallback(() => {
    return selection.mode === 'all'
      ? pagination.totalItems - Object.keys(selection.excluded).length
      : Object.keys(selection.selected).length;
  }, [selection, pagination.totalItems]);

  const hasSelectedContacts = selection.mode === 'all' || Object.keys(selection.selected).length > 0;

  const isContactSelected = useCallback((contactId) => {
    return selection.mode === 'all'
      ? !selection.excluded[contactId]
      : !!selection.selected[contactId];
  }, [selection]);

  return (
    <>
      <div className="flex-1 pt-2.5">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative">
            {error}
            <button
              onClick={clearError}
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
          filter={activeFilter}
          setFilter={setActiveFilter}
          filterButtons={filterButtons}
          filterCounts={filterCounts}
          onAddContact={handleOpenAddContact}
          onOpenFilterDialog={openFilterDialog}
          onSyncContacts={handleSyncContacts}
          isSyncing={loading.sync}
          permissions={permissions}
        />
      </div>

      <FilterDialog
        isOpen={modals.filter}
        onClose={closeFilterDialog}
        filterOptions={filterOptions}
        onFilterChange={updateFilterOptions}
        onReset={resetFilters}
        onApply={closeFilterDialog}
      />

      {selection.mode === 'page' && Object.keys(selection.selected).length === displayedContacts.length && (
        <div className="p-2 text-sm bg-yellow-100 rounded-md mb-2 text-gray-700">
          All {displayedContacts.length} contacts on this page are selected.{" "}
          <button
            className="underline ml-1 text-teal-600"
            onClick={selectAllContacts}
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
        onSelectAllChange={handleSelectAllChange}
        onCheckboxChange={handleCheckboxChange}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClickSingle}
        onSendBroadcast={handleAddbroadcast}
        onExport={openExportDialog}
        onDelete={handleDeleteClick}
        onSelectAllAcrossPages={selectAllContacts}
        user={user}
        permissions={permissions}
        isContactSelected={isContactSelected}
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
        isAddContactOpen={modals.addContact}
        onCloseAddContact={closeAddContact}
        onContactAdd={handleContactAdd}
        onPlanRequired={checkPlanBeforeAction}
        permissions={permissions}
        
        editContact={modals.editContact}
        onCloseEditContact={closeEditContact}
        onContactEdit={handleContactEdit}
        
        deleteContact={modals.deleteContact}
        onCloseDeleteContact={closeDeleteContact}
        onSingleContactDelete={handleSingleContactDelete}
        isDeleting={loading.delete}
        
        showDeleteDialog={modals.bulkDelete}
        selectedCount={getSelectedCount()}
        onCancelDelete={closeBulkDelete}
        onConfirmDelete={confirmDelete}
        isDeletingBulk={loading.delete}
        
        showGroupDialog={modals.group}
        onCloseGroupDialog={closeGroupDialog}
        onCreateGroup={handleCreateGroup}
        isSubmittingGroup={loading.submitting}
        
        showExportDialog={modals.export}
        onCloseExportDialog={closeExportDialog}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        onExportConfirm={handleExportConfirm}
        selectedCountForExport={selection.mode === 'all' ? 'all' : Object.keys(selection.selected).length}
        totalCount={pagination.totalItems}
        isExporting={loading.export}
        
        showExitDialog={modals.exitConfirmation}
        onCancelExit={() => {}}
        onConfirmExit={closeAddContact}
        
        showPlansModal={modals.plans}
        onClosePlansModal={closePlansModal}
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
    </>
  );
}
