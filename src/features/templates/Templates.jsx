import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Table from "./Table";
import ErrorBoundary from "../../components/ErrorBoundary";
import approvedIcon from "../../assets/Approve.png";
import pendingIcon from "../../assets/Pending.png";
import rejectedIcon from "../../assets/Rejected.png";
import { API_ENDPOINTS } from "../../config/api";
import SuccessErrorMessage from "../contacts/SuccessErrorMessage";
import Modal from "./Modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ROLE_PERMISSIONS } from "../../context/permissions";
import NotAuthorized from "../../components/NotAuthorized";

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Map user role to permissions
  const roleMap = {
    main: "Owner",
    owner: "Owner",
    admin: "Admin",
    manager: "Manager",
    user: "User",
    viewer: "Viewer",
  };
  const role = roleMap[user?.role?.toLowerCase?.()] || "Viewer";
  const permissions = ROLE_PERMISSIONS[role];

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
          //setError("Unexpected response format from server.");
        }
      } catch (err) {
        //setError("Failed to load templates. Please try again.");
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
    setEditForm({
      id: template.id,
      element_name: template.element_name,
      category: template.category || '',
      header: template.container_meta?.header || '',
      footer: template.container_meta?.footer || '',
      data: template.container_meta?.sampleText || '',
      template_type: template.template_type || '',
      status: template.status || '',
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFormSave = async (e) => {
    e.preventDefault();
    if (!editingTemplate) return;
    const updatedTemplate = {
      ...editingTemplate,
      ...editForm,
      container_meta: {
        ...editingTemplate.container_meta,
        header: editForm.header,
        footer: editForm.footer,
        sampleText: editForm.data,
      },
    };
    setTemplates((prev) =>
      prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
    );
    setSuccessMessage("Template updated successfully!");
    setTimeout(() => setSuccessMessage(""), 2000);
    setEditingTemplate(null);
    setEditForm(null);
  };

  const handleEditFormCancel = () => {
    setEditingTemplate(null);
    setEditForm(null);
  };

  const handleDelete = async (ids) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    try {
      for (const id of idArray) {
        const response = await fetch(API_ENDPOINTS.TEMPLATES.DELETE(id), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Failed to delete template ${id}`);
        }
      }
      const newTemplates = templates.filter((template) => !idArray.includes(template.id));
      setTemplates(newTemplates);
      toast.success(idArray.length > 1 ? 'Templates deleted successfully!' : 'Template deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('Failed to delete template(s)', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // If not allowed to view templates, show NotAuthorized
  if (!permissions.canViewTemplates) {
    return <NotAuthorized />;
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <SuccessErrorMessage successMessage={successMessage} errorMessage={errorMessage} />
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
          onClose={() => { setEditingTemplate(null); setEditForm(null); }}
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
              const response = await fetch(API_ENDPOINTS.TEMPLATES.UPDATE(updatedTemplate.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(requestBody),
              });
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
              const data = await response.json();
              if (data.success) {
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
                setSuccessMessage("Template updated successfully!");
                setTimeout(() => setSuccessMessage(""), 2000);
                setEditingTemplate(null);
                setEditForm(null);
              } else {
                toast.error(data.message || 'Failed to update template', {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
              }
            } catch (error) {
              toast.error('Failed to update template. Please try again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }
          }}
        />
      )}

      <ErrorBoundary>
        {loading ? (
          <p className="text-center">Loading templates...</p>
        ) : (
          <Table
            templates={templates}
            onEdit={permissions.canEditTemplate ? handleEdit : undefined}
            onDelete={permissions.canDeleteTemplate ? handleDelete : undefined}
            canEdit={permissions.canEditTemplate}
            canDelete={permissions.canDeleteTemplate}
          />
        )}
      </ErrorBoundary>
    </div>
  );
};

export default Templates;
