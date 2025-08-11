import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Table from "./Table";
import ErrorBoundary from "../../components/ErrorBoundary";
import { API_ENDPOINTS } from "../../config/api";
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
import { toastConfig, createToastConfig } from "../../utils/toastConfig";

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const permissions = getPermissions(user);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_ENDPOINTS.TEMPLATES.GET_ALL}?customer_id=${user?.customer_id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch templates: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data.templates)) {
          setTemplates(data.templates);
        } else {
          console.error("Unexpected response format from server.");
        }
      } catch (err) {
        console.error("Failed to load templates. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [user?.customer_id]);

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

  const handleEdit = (template) => {
    setEditingTemplate(template);
  };


  const handleAddTemplate = async (newTemplate) => {
    if (isSubmitting) return; 
    
    console.log("Received from Modal:", newTemplate);
    setIsSubmitting(true);
    
    const requestBody = {
      elementName: newTemplate.elementName,
      content: newTemplate.content,
      category: newTemplate.category,
      templateType: newTemplate.templateType,
      languageCode: newTemplate.languageCode,
      header: newTemplate.header,
      footer: newTemplate.footer,
      buttons: newTemplate.buttons || [],
      example: newTemplate.example,
      exampleHeader: newTemplate.exampleHeader,
      messageSendTTL: newTemplate.messageSendTTL,
      customer_id: user?.customer_id,
      container_meta: newTemplate.container_meta,
    };

    console.log("Sending to API:", requestBody);

    try {
      const response = await fetch(API_ENDPOINTS.TEMPLATES.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        setTemplates((prev) => [data.template || newTemplate, ...prev]);
        toast.success("Template created successfully!", toastConfig);
        setIsModalOpen(false);
      } else {
        throw new Error(
          data.message || data.error || "Failed to create template"
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to create template", createToastConfig(5000));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

const handleDelete = async (ids) => {
  const idArray = Array.isArray(ids) ? ids : [ids];

  try {
    for (const id of idArray) {
    
      const template = templates.find((t) => t.id === id);

      if (!template || !template.element_name) {
        throw new Error(`Template with ID ${id} not found or missing element_name`);
      }

      const response = await fetch(API_ENDPOINTS.TEMPLATES.DELETE(), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ templateName: template.element_name }), 
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete template ${template.element_name}: ${errorText}`);
      }
    }

    
    const newTemplates = templates.filter((template) => !idArray.includes(template.id));
    setTemplates(newTemplates);

    toast.success(
      idArray.length > 1
        ? "Templates deleted successfully!"
        : "Template deleted successfully!",
      toastConfig
    );
  } catch (error) {
    console.error("Delete error:", error.message);
    toast.error("Failed to delete template(s)", toastConfig);
  }
};


  // If not allowed to view templates, show NotAuthorized
  if (!permissions.canViewTemplates) {
    return <NotAuthorized />;
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
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
          mode={editingTemplate.id ? "edit" : "add"}
          initialValues={editingTemplate}
          onClose={() => {
            setEditingTemplate(null);
          }}
          onSubmit={async (updatedTemplate) => {
            try {
              const requestBody = {
                content: updatedTemplate.content,
                category: updatedTemplate.category,
                templateType: updatedTemplate.templateType,
                example: updatedTemplate.example,
                exampleHeader: updatedTemplate.exampleHeader,
                header: updatedTemplate.header,
                footer: updatedTemplate.footer,
                buttons: updatedTemplate.buttons || [],
              };
              const url = updatedTemplate.id
                ? API_ENDPOINTS.TEMPLATES.UPDATE(updatedTemplate.id)
                : API_ENDPOINTS.TEMPLATES.CREATE;
              const method = updatedTemplate.id ? "PUT" : "POST";
              const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(requestBody),
              });
              if (!response.ok) {
                throw new Error(
                  `HTTP ${response.status}: ${response.statusText}`
                );
              }
              const data = await response.json();
              if (data.success) {
                if (updatedTemplate.id) {
                  setTemplates((prev) =>
                    prev.map((t) =>
                      t.id === updatedTemplate.id
                        ? {
                            ...t,
                            ...updatedTemplate,
                            created_on: t.created_on,
                            id: t.id,
                            element_name: t.element_name,
                            status: t.status,
                          }
                        : t
                    )
                  );
                  toast.success("Template updated successfully!", toastConfig);
                } else {
                  setTemplates((prev) => [data.template, ...prev]);
                  toast.success("Template added successfully!", toastConfig);
                }
                setEditingTemplate(null);
              } else {
                toast.error(data.message || "Failed to save template", toastConfig);
              }
            } catch (error) {
              toast.error("Failed to save template. Please try again.", createToastConfig(5000));
            }
          }}
        />
      )}

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
                ? () => {
                    setIsModalOpen(true); 
                  }
                : undefined
            }
            vendorIcon={vendor}
          />
        )}
      </ErrorBoundary>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTemplate(null);
          }}
          isSubmitting={isSubmitting}
          onSubmit={async (templateData) => {
            try {
              await handleAddTemplate(templateData);
            } catch (error) {
              console.error("Error in form submission:", error);
              if (!error.message.includes('Failed to create template')) {
                toast.error(error.message || "Failed to create template", createToastConfig(5000));
              }
            }
          }}
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
      )}
    </div>
  );
};

export default Templates;
