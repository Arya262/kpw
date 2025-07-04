import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Modal from "./Modal";
import vendor from "../../assets/Vector.png";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExploreTemplates = () => {
  console.log('ExploreTemplates rendered');
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

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
          setTemplates(data.templates);
        } else {
          setError("Invalid response format");
        }
      } catch (err) {
        setError("Failed to fetch templates");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [user?.customer_id]);

  const handleAddTemplate = async (newTemplate) => {
    // Map camelCase JSON to backend snake_case format
    console.log("Received from Modal:", newTemplate);
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
    exampleHeader: newTemplate.exampleHeader,
    messageSendTTL: Number(newTemplate.messageSendTTL) || 259200,
    customer_id: user?.customer_id,
  };

    try {
      const response = await fetch(API_ENDPOINTS.TEMPLATES.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        setTemplates((prev) => [...prev, data.template || newTemplate]);
        toast.success('Template created successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Close modal after successful creation
        setIsModalOpen(false);
      } else {
        toast.error(data.message || data.error || 'Failed to create template', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Keep modal open on error so user can fix and retry
      }

    } catch (error) {
      toast.error('Failed to create template', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Keep modal open on network error so user can retry
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Explore Templates</h2>
        <button
          className="bg-teal-500 text-white flex items-center gap-2 px-4 py-2 rounded cursor-pointer"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          <img src={vendor} alt="plus sign" className="w-5 h-5" />
          Add New Templates
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : templates.length === 0 ? (
        <p>No templates available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id || template.element_name}
              className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col"
            >
              {template.image_url && (
                <img
                  src={template.image_url}
                  alt={template.element_name}
                  className="w-full h-48 object-cover p-2 rounded-2xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.jpg";
                  }}
                />
              )}
              <div className="p-4 flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  {template.element_name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {template.category}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line mb-2">
                  {template.container_meta?.sampleText ||
                    "No sample text available"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigate("/broadcast", {
                    state: {
                      selectedTemplate: template,
                      openForm: true,
                    },
                  });
                }}
                className="bg-teal-500 text-black px-6 py-3 font-medium rounded 
                  border border-teal-500 hover:bg-teal-400 hover:text-white hover:border-teal-400 transition duration-300 ease-in-out cursor-pointer"
              >
                Send Template
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSubmit={handleAddTemplate}
      />
    </div>
  );
};

export default ExploreTemplates;
