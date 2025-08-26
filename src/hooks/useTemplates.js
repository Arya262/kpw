import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../config/api";
import { toast } from "react-toastify";
import { defaultToastConfig } from "../utils/toastConfig";

export const useTemplates = (customerId) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ fetch templates
  useEffect(() => {
    if (!customerId) return;

    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_ENDPOINTS.TEMPLATES.GET_ALL}?customer_id=${customerId}`,
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await response.json();
        if (Array.isArray(data.templates)) {
          const normalized = data.templates.map((t) => ({
            ...t,
            container_meta: {
              ...t.container_meta,
              sampleText:
                t.container_meta?.sampleText || t.container_meta?.sample_text,
            },
          }));
          setTemplates(normalized);
        }
      } catch (err) {
        // console.error("Failed to fetch templates", err);
        // setError("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [customerId]);

  // ✅ add template
  const addTemplate = async (newTemplate) => {
    const isMedia = ["IMAGE", "VIDEO", "DOCUMENT"].includes(
      newTemplate.templateType?.toUpperCase()
    );
    const endpoint = isMedia
      ? API_ENDPOINTS.TEMPLATES.CREATE_MEDIA
      : API_ENDPOINTS.TEMPLATES.CREATE;

    const requestBody = {
      ...newTemplate,
      customer_id: customerId,
      header: newTemplate.header || null,
      footer: newTemplate.footer || null,
      buttons: newTemplate.buttons || [],
      exampleHeader: newTemplate.exampleHeader || null,
      exampleMedia: newTemplate.exampleMedia || null,
      messageSendTTL: Number(newTemplate.messageSendTTL) || 259200,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        setTemplates((prev) => [...prev, data.template || newTemplate]);
        toast.success("Template created successfully!", defaultToastConfig);
        return true;
      } else {
        toast.error(
          data.message || data.error || "Failed to create template",
          defaultToastConfig
        );
        return false;
      }
    } catch (err) {
      console.error("Add template error:", err);
      toast.error("Failed to create template", defaultToastConfig);
      return false;
    }
  };

  // ✅ delete template
const deleteTemplate = async (templateName, id, customer_id) => {
  try {
    const response = await fetch(API_ENDPOINTS.TEMPLATES.DELETE(), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ elementName: templateName, customer_id }),
    });

    const data = await response.json();

    if (data.success) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted successfully", defaultToastConfig);
      return true;
    } else {
      toast.error(data.error || "Failed to delete template", defaultToastConfig);
      return false;
    }
  } catch (err) {
    console.error("Delete template error:", err);
    toast.error("An error occurred while deleting", defaultToastConfig);
    return false;
  }
};


  return { templates, loading, error, addTemplate, deleteTemplate };
};
