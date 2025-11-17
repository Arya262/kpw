import React, { useRef, useEffect, useState } from "react";
import AddContact from "../Addcontact";
import EditContact from "../EditContact";
import SingleDeleteDialog from "../SingleDeleteDialog";
import GroupNameDialog from "./GroupNameDialog";
import ExportDialog from "./ExportDialog";
import ConfirmationDialog from "../../shared/ExitConfirmationDialog";
import PlansModal from "../../dashboard/PlansModal";
import { useAuth } from "../../../context/AuthContext";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { checkPermission } from "../utils/contactUtils";
import { usePayment } from "../../../hooks/usePayment";

// Reusable CloseButton component
const CloseButton = ({ onClick, highlighted }) => (
  <button
    onClick={onClick}
    className={`absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors ${
      highlighted ? "bg-red-500 text-white hover:text-white" : "bg-gray-100"
    }`}
    aria-label="Close dialog"
  >
    ×
  </button>
);

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
  const [isCrossHighlighted, setIsCrossHighlighted] = useState(false);
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
          className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 transition-all duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onCloseAddContact();
            }
          }}
        >
          <div
            ref={popupRef}
            className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative sm:animate-slideUp border ${
              isCrossHighlighted ? "border-teal-500" : "border-gray-300"
            } transition-all duration-300`}
          >
            <CloseButton onClick={onCloseAddContact} highlighted={isCrossHighlighted} />
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
        <div className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative sm:animate-slideUp border border-gray-300 transition-all duration-300">
            <CloseButton onClick={onCloseEditContact} highlighted={false} />
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
