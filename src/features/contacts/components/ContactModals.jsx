import { useRef, useEffect } from "react";
import AddContact from "../Addcontact";
import EditContact from "../EditContact";
import SingleDeleteDialog from "../SingleDeleteDialog";
import GroupNameDialog from "./GroupNameDialog";
import ExportDialog from "./ExportDialog";
import ConfirmationDialog from "../../shared/ExitConfirmationDialog";
import PlansModal from "../../dashboard/PlansModal";
import { useAuth } from "../../../context/AuthContext";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { usePayment } from "../../../hooks/usePayment";

const ContactModals = ({
  // Add Contact Modal
  isAddContactOpen,
  onCloseAddContact,
  onContactAdd,
  onPlanRequired,
  permissions,
  
  // Edit Contact Modal
  editContact,
  onCloseEditContact,
  onContactEdit,
  
  // Delete Contact Modal
  deleteContact,
  onCloseDeleteContact,
  onSingleContactDelete,
  isDeleting,
  
  // Bulk Delete Dialog
  showDeleteDialog,
  selectedCount,
  onCancelDelete,
  onConfirmDelete,
  isDeletingBulk,
  
  // Group Dialog
  showGroupDialog,
  onCloseGroupDialog,
  onCreateGroup,
  isSubmittingGroup,
  
  // Export Dialog
  showExportDialog,
  onCloseExportDialog,
  exportFormat,
  onExportFormatChange,
  onExportConfirm,
  selectedCountForExport,
  totalCount,
  isExporting,
  
  // Exit Confirmation
  showExitDialog,
  onCancelExit,
  onConfirmExit,
  
  // Plans Modal
  showPlansModal,
  onClosePlansModal,
}) => {
  const popupRef = useRef(null);
  const { handlePayment } = usePayment();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onCloseAddContact();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCloseAddContact]);

  const { user } = useAuth();

  return (
    <>
      {/* Add Contact Modal */}
      {isAddContactOpen && permissions.canAdd && permissions.canAccessModals && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onCloseAddContact();
            }
          }}
        >
          <div
            ref={popupRef}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl"
          >
            <button
              onClick={onCloseAddContact}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 z-10"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <AddContact
              closePopup={onCloseAddContact}
              onSuccess={onContactAdd}
              onPlanRequired={onPlanRequired}
            />
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editContact && permissions.canEdit && permissions.canAccessModals && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onCloseEditContact();
            }
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={onCloseEditContact}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 z-10"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <EditContact
              contact={editContact}
              closePopup={onCloseEditContact}
              onSuccess={onContactEdit}
            />
          </div>
        </div>
      )}

      {/* Single Delete Dialog */}
      {deleteContact && permissions.canDelete && permissions.canAccessModals && (
        <SingleDeleteDialog
          showDialog={!!deleteContact}
          contactName={deleteContact.fullName}
          onCancel={onCloseDeleteContact}
          onConfirm={() => onSingleContactDelete(deleteContact.contact_id)}
          isDeleting={isDeleting}
        />
      )}

      {/* Group Name Dialog */}
      <GroupNameDialog
        isOpen={showGroupDialog}
        onClose={onCloseGroupDialog}
        onConfirm={onCreateGroup}
        isSubmitting={isSubmittingGroup}
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={onCloseExportDialog}
        exportFormat={exportFormat}
        onFormatChange={onExportFormatChange}
        onConfirm={onExportConfirm}
        selectedCount={selectedCountForExport}
        totalCount={totalCount}
        isExporting={isExporting}
      />

      {/* Exit Confirmation Dialog */}
      <ConfirmationDialog
        open={showExitDialog && permissions.canAccessModals}
        hasUnsavedChanges={false}
        onCancel={onCancelExit}
        onConfirm={onConfirmExit}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        showDeleteDialog={showDeleteDialog && permissions.canDelete}
        selectedCount={selectedCount}
        cancelDelete={onCancelDelete}
        confirmDelete={onConfirmDelete}
        isProcessing={isDeletingBulk}
      />

      {/* Plans Modal */}
      {showPlansModal && (
        <PlansModal
          isOpen={showPlansModal}
          onClose={onClosePlansModal}
          onPay={handlePayment}
          userPlan={user?.plan}
          onStartTrial={null} 
        />
      )}
    </>
  );
};

export default ContactModals;
