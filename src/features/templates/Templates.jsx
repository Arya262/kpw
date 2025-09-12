import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import Table from "./Table";
import ErrorBoundary from "../../components/ErrorBoundary";
import Modal from "./Modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getPermissions } from "../../utils/getPermissions";
import NotAuthorized from "../../components/NotAuthorized";
import Loader from "../../components/Loader";
import vendor from "../../assets/Vector.png";
import approvedIcon from "../../assets/Approve.png";
import pendingIcon from "../../assets/Pending.png";
import rejectedIcon from "../../assets/Rejected.png";
import { defaultToastConfig, createToastConfig } from "../../utils/toastConfig";
import { useTemplates } from "../../hooks/useTemplates";
import { AnimatePresence, motion } from "framer-motion";
import Pagination from "../shared/Pagination";

const Templates = () => {
  const { user } = useAuth();
  const permissions = getPermissions(user);

  const {
    templates,
    loading,
    addTemplate,
    deleteTemplate,
    updateTemplate,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange: handlePageChange,
    onItemsPerPageChange: handleItemsPerPageChange,
    searchTerm,
    setSearchTerm
  } = useTemplates(user?.customer_id);

  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Summary counts
  const summaryCounts = React.useMemo(() => {
    let approved = 0, pending = 0, failed = 0;
    
    // If we have the full list from the API, use it
    if (templates) {
      approved = templates.filter((t) => t.status?.toLowerCase() === "approved").length;
      pending = templates.filter((t) => t.status?.toLowerCase() === "pending").length;
      failed = templates.filter((t) => t.status?.toLowerCase() === "failed").length;
    }
    
    return { approved, pending, failed };
  }, [templates]);

  const summaryCards = [
    { label: "Approved Templates", count: summaryCounts.approved, image: approvedIcon, bgColor: "bg-[#D1FADF]" },
    { label: "Pending Templates", count: summaryCounts.pending, image: pendingIcon, bgColor: "bg-[#FEE4E2]" },
    { label: "Failed Templates", count: summaryCounts.failed, image: rejectedIcon, bgColor: "bg-[#FECDCA]" },
  ];

  // ✅ Add template
  const handleAddTemplate = async (newTemplate) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addTemplate(newTemplate);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to create template", createToastConfig(5000));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Delete templates
  const handleDelete = async (ids) => {
    if (!Array.isArray(ids)) ids = [ids];
    try {
      for (const id of ids) {
        const template = templates.find((t) => t.id === id);
        if (template) {
          const success = await deleteTemplate(template.element_name, id, user?.customer_id);
          if (!success) throw new Error(`Failed to delete template: ${template.element_name}`);
        }
      }
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to delete template(s)", defaultToastConfig);
      return false;
    }
  };

  // ✅ Edit template (update locally)
  const handleEdit = (template) => {
    setEditingTemplate(template);
  };

  // If not allowed to view templates
  if (!permissions.canViewTemplates) {
    return <NotAuthorized />;
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
     <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick draggable pauseOnHover theme="light" />


      {/* Summary cards */}
      <div className="hidden md:flex flex-col md:flex-row justify-start gap-4">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="w-full md:w-[350px] h-[124px] p-5 rounded-xl bg-white flex items-center gap-6 shadow-[0_4px_8px_0_rgba(0,0,0,0.1)]"
          >
            <div
              className={`w-[60px] h-[60px] rounded-full flex items-center justify-center ${card.bgColor}`}
            >
              <img
                src={card.image}
                alt={card.label}
                className="w-[32px] h-[32px] object-contain"
              />
            </div>
            <div className="text-left">
              <p className="text-[18px] text-[#555] font-medium font-poppins">
                {card.label}
              </p>
              <p className="text-[22px] font-bold font-poppins mt-1">
                {card.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Edit modal */}
      {editingTemplate && (
        <Modal
          isOpen={!!editingTemplate}
          mode="edit"
          initialValues={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSubmit={async (updatedTemplate) => {
            try {
              const success = await updateTemplate(updatedTemplate);
              if (success) {
                toast.success("Template updated successfully!", defaultToastConfig);
                setEditingTemplate(null);
              }
            } catch (error) {
              toast.error(
                error.message || "Failed to save template. Please try again.",
                createToastConfig(5000)
              );
            }
          }}
        />
      )}

      {/* ✅ Table */}
      <ErrorBoundary>
        {loading ? (
          <Loader />
        ) : (
          <Table
            templates={templates}
            onEdit={permissions.canEditTemplate ? handleEdit : undefined}
            onDelete={permissions.canDeleteTemplate ? handleDelete : undefined}
            canEdit={permissions.canEditTemplate}
            canDelete={permissions.canDeleteTemplate}
            onAddTemplate={
              permissions.canAddTemplate ? () => setIsModalOpen(true) : undefined
            }
            vendorIcon={vendor}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            pagination={
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            }
          />
        )}
      </ErrorBoundary>

      {/* Animated Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTemplate(null);
              }}
            />

            {/* Modal sliding in from right */}
            <motion.div
              key="modal"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <Modal
                isOpen={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setEditingTemplate(null);
                }}
                isSubmitting={isSubmitting}
                onSubmit={handleAddTemplate}
                mode="add"
                initialValues={{
                  elementName: "",
                  category: "",
                  templateType: "Text",
                  languageCode: "en",
                  content: "",
                  header: "",
                  footer: "",
                  buttons: [],
                  example: {
                    header: [],
                    body: [],
                    buttons: [],
                  },
                  exampleHeader: [],
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Templates;
