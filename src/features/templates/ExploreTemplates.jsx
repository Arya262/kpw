import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Modal from "./Modal";
import vendor from "../../assets/Vector.png";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getPermissions } from "../../utils/getPermissions";
import Loader from "../../components/Loader";
import { defaultToastConfig } from "../../utils/toastConfig";
import SingleDeleteDialog from "../contacts/SingleDeleteDialog";
import { Trash2 } from "lucide-react";

import { useTemplates } from "../../hooks/useTemplates";
import { AnimatePresence, motion } from "framer-motion";
const ExploreTemplates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const permissions = getPermissions(user);

  // ✅ useTemplates hook handles API logic
  const { templates, loading, error, addTemplate, deleteTemplate } =
    useTemplates(user?.customer_id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddTemplate = async (newTemplate) => {
    if (!permissions.canAddTemplate) {
      toast.error("You do not have permission to add templates.", toastConfig);
      return;
    }
    const success = await addTemplate(newTemplate);
    if (success) setIsModalOpen(false);
  };

  const handleDeleteClick = (template) => {
    if (!permissions.canDeleteTemplate) {
      toast.error(
        "You do not have permission to delete templates.",
        toastConfig
      );
      return;
    }
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;
    setIsDeleting(true);
    const success = await deleteTemplate(templateToDelete);
    if (success) {
      toast.success("Template deleted successfully", toastConfig);
    }
    setIsDeleting(false);
    setShowDeleteDialog(false);
    setTemplateToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setTemplateToDelete(null);
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Explore Templates</h2>
        <button
          className="bg-teal-500 text-white flex items-center gap-2 px-4 py-2 rounded cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <img src={vendor} alt="plus sign" className="w-5 h-5" />
          Add New Templates
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : templates.length === 0 ? (
        <p>No templates available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col"
            >
              {template.container_meta.mediaUrl && (
                <img
                  src={template.container_meta.mediaUrl}
                  alt={template.element_name}
                  className="w-full h-48 object-cover p-2 rounded-2xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.jpg";
                  }}
                />
              )}
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {template.element_name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {template.category}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteClick(template)}
                    className="p-1 rounded-full hover:bg-red-100 transition cursor-pointer"
                    title="Delete Template"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {template.container_meta?.sampleText ||
                    "No sample text available"}
                </p>
              </div>
              <button
                type="button"
                disabled={template?.status?.toLowerCase() !== "approved"}
                onClick={() => {
                  if (template?.status?.toLowerCase() === "approved") {
                    navigate("/broadcast", {
                      state: { selectedTemplate: template, openForm: true },
                    });
                  }
                }}
                className={`px-6 py-3 font-medium rounded border transition duration-300 ease-in-out cursor-pointer
                  ${
                    template?.status?.toLowerCase() === "approved"
                      ? "bg-teal-500 text-black border-teal-500 hover:bg-teal-400 hover:text-white hover:border-teal-400"
                      : "bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed"
                  }`}
              >
                Send Template
              </button>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="fixed inset-0 bg-black backdrop-blur-sm z-40"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.5,
              }}
              className="fixed inset-0 flex items-center justify-center z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddTemplate}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SingleDeleteDialog
        showDialog={showDeleteDialog}
        contactName={templateToDelete?.element_name || "this template"}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ExploreTemplates;
