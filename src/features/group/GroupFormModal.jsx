import React, { useState, useRef } from "react";
import ConfirmationDialog from "../shared/ExitConfirmationDialog"; // Assuming this path
import GroupForm from "./GroupForm";

const GroupFormModal = ({ show, editingGroup, onClose, onSave, permissions }) => {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isCrossHighlighted, setIsCrossHighlighted] = useState(false);
  const modalRef = useRef(null);

  if (!show) return null;

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsCrossHighlighted(true);
      setTimeout(() => setIsCrossHighlighted(false), 2000);
    }
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    onClose();
  };

  const cancelExit = () => {
    setShowExitDialog(false);
  };

  return (
    <div
      className="fixed inset-0 bg-[#000]/40 flex items-center justify-center z-50 transition-all duration-300"
      onClick={handleModalClick}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg w-[95%] sm:w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto relative sm:animate-slideUp border transition-all duration-300 
          ${isCrossHighlighted ? "border-teal-500" : "border-gray-300"}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex="-1"
      >
        <button
          onClick={() => setShowExitDialog(true)}
          className={`absolute top-2 right-2 sm:right-4 text-gray-600 hover:text-black text-2xl sm:text-3xl font-bold w-8 h-8 flex items-center justify-center pb-1 sm:pb-2 
            rounded-full transition-colors cursor-pointer ${isCrossHighlighted ? "bg-red-500 text-white hover:text-white" : "bg-gray-100"}`}
        >
          ×
        </button>
        <div className="mx-auto bg-white shadow-lg rounded-xl text-gray-500 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-black">
            {editingGroup ? "Edit Group" : "Create New Group"}
          </h2>
          <GroupForm
            group={editingGroup}
            onSave={onSave}
            onCancel={() => setShowExitDialog(true)}
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
  );
};

export default GroupFormModal;