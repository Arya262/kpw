import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Modal from "./Modal";
import vendor from "../../assets/Vector.png";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getPermissions } from "../../utils/getPermissions";
import SingleDeleteDialog from "../contacts/SingleDeleteDialog";
import { Trash2, Eye, Send } from "lucide-react";
import { useTemplates } from "../../hooks/useTemplates";
import { AnimatePresence, motion } from "framer-motion";
import SkeletonCard from "../../components/SkeletonCard";
import TemplateDrawer from "../../components/TemplateDrawer";
import SearchInput from "../shared/SearchInput";
import { useInView } from "react-intersection-observer";
import { renderMedia } from "../../utils/renderMedia";
const ExploreTemplates = () => {

  const navigate = useNavigate();
  const { user } = useAuth();
  const permissions = getPermissions(user);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [allTemplates, setAllTemplates] = useState([]);

  const {
    data: { templates = [], loading, error },
    search: { searchTerm, setSearchTerm },
    actions: { addTemplate, deleteTemplate, fetchTemplates },
    pagination,
  } = useTemplates();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Infinite scroll intersection observer
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });


  useEffect(() => {
    if (templates.length > 0) {
      setAllTemplates((prev) => {
        const ids = new Set(prev.map((t) => t.id));
        const newTemplates = templates.filter((t) => !ids.has(t.id));
        return [...prev, ...newTemplates];
      });
    }
  }, [templates]);

  useEffect(() => {
    if (inView && pagination.currentPage < pagination.totalPages && !loading) {
      fetchTemplates(pagination.currentPage + 1, pagination.itemsPerPage, searchTerm);
      pagination.onPageChange(pagination.currentPage + 1);
    }
  }, [inView, pagination, loading, fetchTemplates, searchTerm]);


  const filteredTemplates = (allTemplates || []).filter(
    (template) =>
      template?.element_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template?.language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTemplate = async (newTemplate) => {
    if (!permissions.canAddTemplate) {
      toast.error("You do not have permission to add templates.", {
        autoClose: 3000,
      });
      return;
    }
    const success = await addTemplate(newTemplate);
    if (success) setIsModalOpen(false);
  };

  const handleDeleteClick = (template) => {
    if (!permissions.canDeleteTemplate) {
      toast.error("You do not have permission to delete templates.", {
        autoClose: 3000,
      });
      return;
    }
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;
    setIsDeleting(true);
    await deleteTemplate(templateToDelete.element_name, templateToDelete.id, user?.customer_id);
    setIsDeleting(false);
    setShowDeleteDialog(false);
    setTemplateToDelete(null);


    setAllTemplates((prev) => prev.filter((t) => t.id !== templateToDelete.id));
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setTemplateToDelete(null);
  };

  return (
    <div className="p-0 sm:p-6 min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 sticky top-0 bg-gray-50/90 backdrop-blur-md z-20 py-3 ">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 flex items-center gap-2">
          Explore <span className="text-[#0AA89E]">Templates</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl  transition-all"
            onClick={() => setIsModalOpen(true)}
          >
            <img src={vendor} alt="plus sign" className="w-5 h-5" />
            Add Template
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && allTemplates.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : !allTemplates.length || !filteredTemplates.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
          <img src="/illustrations/empty.svg" alt="No templates" className="w-40 mb-6" />
          <p className="text-lg">No templates available yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-6 py-2 bg-cyan-500 text-white rounded-lg shadow hover:scale-105 transition"
          >
            Create your first template
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="bg-white/90 backdrop-blur rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100 hover:border-cyan-300 transition-all duration-300 group"
              >

                {(() => {
                  const mediaTemplate = {
                    ...template,
                    ...template.container_meta,
                    media_url: template.media_url || template.container_meta?.media_url,
                    template_type: template.template_type || template.container_meta?.templateType,
                    element_name: template.element_name
                  };
                  return renderMedia(mediaTemplate) && (
                    <div className="relative">
                      {renderMedia(mediaTemplate)}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition" />
                    </div>
                  );
                })()}

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {template.element_name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium mt-1 ${template.category?.toLowerCase() === "marketing"
                          ? "bg-green-100 text-green-700"
                          : template.category?.toLowerCase() === "info"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {template.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsDrawerOpen(true);
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                        title="Preview Template"
                      >
                        <Eye className="w-5 h-5 text-gray-600 group-hover:scale-110 transition" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(template)}
                        className="p-2 rounded-full hover:bg-red-50 transition"
                        title="Delete Template"
                      >
                        <Trash2 className="w-5 h-5 text-red-500 group-hover:scale-110 transition" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                    {template.container_meta?.sampleText || "No sample text available"}
                  </p>
                </div>

                <div className="flex">
                  <button
                    disabled={template?.status?.toLowerCase() !== "approved"}
                    onClick={() =>
                      navigate("/broadcast", {
                        state: { selectedTemplate: template, openForm: true },
                      })
                    }
                    className={`flex-1 px-4 py-3 font-semibold rounded-b-2xl transition-all ${template?.status?.toLowerCase() === "approved"
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:brightness-110"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    {template?.status?.toLowerCase() === "approved" ? (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" /> Send
                      </span>
                    ) : (
                      "Pending Approval"
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div ref={loadMoreRef} className="h-10 mt-4" />
          {loading && templates.length > 0 && (
            <div className="flex justify-center mt-4 text-gray-500">Loading more templates...</div>
          )}
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              key="modal"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
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

      {/* Delete Dialog */}
      <SingleDeleteDialog
        showDialog={showDeleteDialog}
        contactName={templateToDelete?.element_name || "this template"}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Drawer */}
      <TemplateDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        template={selectedTemplate}
      />
    </div>
  );
};

export default ExploreTemplates;
