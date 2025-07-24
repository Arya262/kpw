import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

const SendTemplate = ({ onSelect, onClose, returnFullTemplate = false }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
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
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data.templates)) {
          if (isMounted) {
            setTemplates(data.templates);
          }
        } else {
          console.error("Invalid template response:", data);
          if (isMounted) {
            setError("Unexpected response format from server.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            `Failed to load templates. Please try again. Error: ${err.message}`
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTemplates();

    return () => {
      isMounted = false;
    };
  }, [user?.customer_id]);

  const filteredTemplates = useMemo(() => {
    const lowerTerm = searchTerm.trim().toLowerCase();
    if (!lowerTerm) return templates;
    return templates.filter((template) =>
      template.element_name?.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm, templates]);

  const handleTemplateClick = (template) => {
    if (onSelect) {
      onSelect(returnFullTemplate ? template : template.element_name);
    }
  };

  return (
    <div
      className="w-full max-w-3xl p-4 bg-white relative"
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors cursor-pointer bg-gray-100"
        aria-label="Close template selection modal"
      >
        ×
      </button>
      <h2 className="text-lg font-semibold mb-4 text-center text-gray-800">
        Choose a Template
      </h2>

      {error && (
        <p className="text-red-500 text-sm text-center mb-4">{error}</p>
      )}

      <input
        type="text"
        placeholder="Search templates by name..."
        className="mb-4 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search templates"
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 h-10 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-white text-gray-700 sticky top-0 z-10 shadow">
                <tr>
                  <th className="px-4 py-3">Status / Created At</th>
                  <th className="px-4 py-3">Template Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-center">Preview</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-gray-400">
                      No templates found.
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((template, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`${
                            template.status?.toLowerCase() === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          } text-xs font-medium px-2 py-1 rounded`}
                        >
                          {template.status || "N/A"}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {template.created_on
                            ? new Date(Number(template.created_on)).toLocaleString(
                                "en-IN",
                                {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }
                              )
                            : "Unknown"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {template.element_name || "Unnamed"}
                      </td>
                      <td className="px-4 py-4">
                        {template.template_type || "Unknown"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleTemplateClick(template)}
                          className="bg-teal-500 hover:bg-teal-600 text-white text-xs px-3 py-1 rounded"
                          aria-label={`Select template ${template.element_name}`}
                        >
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendTemplate;
