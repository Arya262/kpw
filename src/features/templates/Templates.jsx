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

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
        console.log(data);
        if (Array.isArray(data.templates)) {
          setTemplates(data.templates);
        } else {
          console.error("Invalid response format:", data);
          //setError("Unexpected response format from server.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        //setError("Failed to load templates. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

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
      // Delete each template via API
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

      // Update local state after successful API calls
      const newTemplates = templates.filter((template) => !idArray.includes(template.id));
      setTemplates(newTemplates);
      
      // Show success notification
      toast.success(idArray.length > 1 ? 'Templates deleted successfully!' : 'Template deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error deleting template(s):', error);
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
              
              console.log('Updating template with id:', updatedTemplate.id);
              console.log('Update endpoint:', API_ENDPOINTS.TEMPLATES.UPDATE(updatedTemplate.id));
              
              const response = await fetch(API_ENDPOINTS.TEMPLATES.UPDATE(updatedTemplate.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(requestBody),
              });

              console.log('Response status:', response.status);
              console.log('Response headers:', Object.fromEntries(response.headers.entries()));
              
              if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response body:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
              
              const data = await response.json();
              console.log('Response data:', data);
              
              if (data.success) {
                // Update local state with the updated template from backend
                setTemplates((prev) =>
                  prev.map((t) =>
                    t.id === updatedTemplate.id
                      ? {
                          ...t,
                          ...updatedTemplate,
                          // Keep existing fields that might not be in the update
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
              console.error('Error updating template:', error);
              
              // If it's a 404 error, try updating locally as a fallback
              if (error.message.includes('HTTP 404')) {
                console.log('Backend update endpoint not available, updating locally...');
                
                // Update local state
                setTemplates((prev) =>
                  prev.map((t) =>
                    t.id === updatedTemplate.id
                      ? {
                          ...t,
                          ...updatedTemplate,
                          container_meta: {
                            ...t.container_meta,
                            header: updatedTemplate.header,
                            footer: updatedTemplate.footer,
                            sampleText: updatedTemplate.content,
                          },
                        }
                      : t
                  )
                );
                
                setSuccessMessage("Template updated successfully! (Local update - backend endpoint not available)");
                setTimeout(() => setSuccessMessage(""), 3000);
                setEditingTemplate(null);
                setEditForm(null);
                
                toast.warning('Template updated locally. Backend update endpoint not available.', {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
              } else {
                const errorMessage = 'Failed to update template. Please try again.';
                toast.error(errorMessage, {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
              }
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
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </ErrorBoundary>
    </div>
  );
};

export default Templates;
