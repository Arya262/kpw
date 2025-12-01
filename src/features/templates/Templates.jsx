import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import Table from "./Table";
import ErrorBoundary from "../../components/ErrorBoundary";
import Modal from "./Modal";
import { toast } from "react-toastify";
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
    data: { templates = [], loading, error },
    pagination: {
      currentPage = 1,
      totalPages = 1,
      totalItems = 0,
      totalRecords = 0,
      itemsPerPage = 10,
      onPageChange,
      onItemsPerPageChange,
    },
    search: { searchTerm = "", setSearchTerm } = {},
    actions: {
      addTemplate,
      deleteTemplate,
      fetchTemplates,
      fetchAllTemplates,
    } = {},
  } = useTemplates();

  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approvedCount = templates.filter(
    (t) => t.status?.toLowerCase() === "approved"
  ).length;
  const pendingCount = templates.filter(
    (t) => t.status?.toLowerCase() === "pending"
  ).length;
  const failedCount = templates.filter(
    (t) => t.status?.toLowerCase() === "failed"
  ).length;

  const summaryCards = [
    {
      label: "Approved Templates",
      count: approvedCount,
      image: approvedIcon,
      bgColor: "bg-[#D1FADF]",
    },
    {
      label: "Pending Templates",
      count: pendingCount,
      image: pendingIcon,
      bgColor: "bg-[#FEE4E2]",
    },
    {
      label: "Failed Templates",
      count: failedCount,
      image: rejectedIcon,
      bgColor: "bg-[#FECDCA]",
    },
  ];

  const handleAddTemplate = async (newTemplate) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addTemplate(newTemplate);
      setIsModalOpen(false);
      await fetchTemplates(1, itemsPerPage, searchTerm);
    } catch (error) {
      toast.error(
        error?.message || "Failed to create template",
        createToastConfig(5000)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (templatesToDelete) => {
    try {
      const templatesArray = Array.isArray(templatesToDelete) ? templatesToDelete : [templatesToDelete];
      
      const deletePromises = templatesArray.map(template => 
        deleteTemplate(template.element_name || template.elementName, template.id)
      );
      
      const results = await Promise.all(deletePromises);
      const success = results.every(Boolean);
      
      if (success) {
        await fetchTemplates(currentPage, itemsPerPage, searchTerm);
      }
      return success;
    } catch (error) {
      console.error('Error in handleDelete:', error);
      return false;
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
  };

  if (!permissions.canViewTemplates) {
    return <NotAuthorized />;
  }

  return (
    <div className="flex flex-col gap-4 pt-2">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl pt-0 font-semibold">Templates List</h2>

        {permissions.canAddTemplate && (
          <button
            className="bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
            title="Add a new template"
          >
            <img src={vendor} alt="plus sign" className="w-5 h-5" />
            Add Template
          </button>
        )}
      </div>
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

      {editingTemplate && (
        <Modal
          isOpen={!!editingTemplate}
          mode="edit"
          initialValues={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSubmit={async (updatedTemplate) => {
            try {
              if (typeof updateTemplate === "function") {
                await updateTemplate(updatedTemplate);
              } else {
                await fetchTemplates(currentPage, itemsPerPage, searchTerm);
              }
              toast.success(
                "Template updated successfully!",
                defaultToastConfig
              );
              setEditingTemplate(null);
            } catch (err) {
              toast.error(
                "Failed to save template. Please try again.",
                createToastConfig(5000)
              );
            }
          }}
        />
      )}

      {/* Table */}
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
              permissions.canAddTemplate
                ? () => setIsModalOpen(true)
                : undefined
            }
            vendorIcon={vendor}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            fetchAllTemplates={fetchAllTemplates}
            pagination={
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalRecords}
                  itemsPerPage={itemsPerPage}
                  onPageChange={onPageChange}
                  onItemsPerPageChange={onItemsPerPageChange}
                />
              </div>
            }
            totalRecords={totalRecords}
          />
        )}
      </ErrorBoundary>
      {/* Animated Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
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
                  example: { header: [], body: [], buttons: [] },
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
