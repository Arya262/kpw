import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Modal from "./Modal";
import vendor from "../../assets/Vector.png";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getPermissions } from "../../utils/getPermissions";
import Loader from "../../components/Loader";
import { toastConfig } from "../../utils/toastConfig";
import SingleDeleteDialog from "../contacts/SingleDeleteDialog";
import { Trash2 } from "lucide-react";
const ExploreTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const permissions = getPermissions(user);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_ENDPOINTS.TEMPLATES.GET_ALL}?customer_id=${user?.customer_id}`,
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await response.json();
        if (Array.isArray(data.templates)) {
          const normalizedTemplates = data.templates.map((t) => ({
            ...t,
            container_meta: {
              ...t.container_meta,
              sampleText:
                t.container_meta?.sampleText || t.container_meta?.sample_text,
            },
          }));
          setTemplates(normalizedTemplates);
        } else {
          console.error("Invalid response format", err);
        }
      } catch (err) {
        console.error("Failed to fetch templates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [user?.customer_id]);

  const handleAddTemplate = async (newTemplate) => {
    const requestBody = {
      elementName: newTemplate.elementName,
      content: newTemplate.content,
      category: newTemplate.category,
      templateType: newTemplate.templateType,
      languageCode: newTemplate.languageCode,
      header: newTemplate.header || null,
      footer: newTemplate.footer || null,
      buttons: newTemplate.buttons || [],
      example: newTemplate.example,
      exampleHeader: newTemplate.exampleHeader || null,
      exampleMedia: newTemplate.exampleMedia || null,
      messageSendTTL: Number(newTemplate.messageSendTTL) || 259200,
      customer_id: user?.customer_id,
    };

    try {
      const response = await fetch(
        API_ENDPOINTS.TEMPLATES.CREATE_MEDIA,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      if (data.success) {
        setTemplates((prev) => [...prev, data.template || newTemplate]);
        toast.success("Template created successfully!", toastConfig);
        setIsModalOpen(false);
      } else {
        console.error("Template creation error:", data);
        toast.error(
          data.message || data.error || "Failed to create template",
          toastConfig
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to create template", toastConfig);
    }
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
    try {
      const response = await fetch(API_ENDPOINTS.TEMPLATES.DELETE(), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ templateName: templateToDelete.element_name }),
      });

      const data = await response.json();
      if (data.success) {
        setTemplates((prev) =>
          prev.filter((t) => t.id !== templateToDelete.id)
        );
        toast.success("Template deleted successfully", toastConfig);
      } else {
        toast.error(data.message || "Failed to delete template", toastConfig);
      }
    } catch (error) {
      toast.error("An error occurred while deleting", toastConfig);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setTemplateToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setTemplateToDelete(null);
  };

  return (
    <div className="p-6">
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Explore Templates</h2>
        <button
          className="bg-teal-500 text-white flex items-center gap-2 px-4 py-2 rounded cursor-pointer"
          onClick={() => {
            if (!permissions.canAddTemplate) {
              toast.error(
                "You do not have permission to add templates.",
                toastConfig
              );
              return;
            }
            setIsModalOpen(true);
          }}
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
        <div className="text-center font-medium">
          <img
            src="/no_data.14591486.svg"
            alt="No data available"
            className="w-full h-70 mb-4 opacity-80"
          />
          <p>No templates available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => {
            // console.log("Template full data:", template);

            return (
              <div
                key={template.id || template.element_name}
                className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col"
              >
                {template.container_meta?.mediaUrl && (
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
                        state: {
                          selectedTemplate: template,
                          openForm: true,
                        },
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
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSubmit={handleAddTemplate}
      />

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
