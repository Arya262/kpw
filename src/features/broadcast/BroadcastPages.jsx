import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import SendTemplate from "../chats/chatfeautures/SendTemplate";
import BroadcastHeader from "./components/BroadcastHeader";
import BroadcastForm from "./components/BroadcastForm";
import AlertDialog from "./components/AlertDialog";
import ConfirmationDialog from "./components/ConfirmationDialog";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const BroadcastPages = ({ onClose, showCustomAlert, onBroadcastCreated }) => {
  const [step, setStep] = useState(1); // New state for managing steps
  const location = useLocation();
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const highlightRef = useRef({ close: false, border: false });
  const timeoutRef = useRef(null);
  const [forceUpdate, setForceUpdate] = useState(0);

const [formData, setFormData] = useState({
  broadcastName: "",
  group_id: [], 
  messageType: "Pre-approved template message",
  schedule: "No",
  scheduleDate: "",
  selectedTemplate: location.state?.selectedTemplate || null,
  directContacts: location.state?.contacts || null,
  isDirectBroadcast: location.state?.directBroadcast || false, 
});

  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [customerLists, setCustomerLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.selectedTemplate) {
      setFormData((prevData) => ({
        ...prevData,
        selectedTemplate: location.state.selectedTemplate,
      }));

      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const handleTemplateSelect = useCallback(
    (template) => {
      if (template === formData.selectedTemplate) return;

      setFormData((prevData) => ({
        ...prevData,
        selectedTemplate: template,
      }));
      setIsTemplateOpen(false);
    },
    [formData.selectedTemplate]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchCustomerLists = async () => {
      if (!isMounted) return;

      setLoading(true);
      try {
        const response = await fetch(
          `${API_ENDPOINTS.GROUPS.GET_ALL}?customer_id=${user?.customer_id}`,
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

        const result = await response.json();

        if (isMounted && result.success && Array.isArray(result.data)) {
          setCustomerLists(result.data);
          setError(null);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching customer lists:", err);
          setError("Unable to load customer lists. Please try again later.");
          setCustomerLists([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCustomerLists();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        highlightRef.current = { close: true, border: true };
        setForceUpdate((prev) => prev + 1);

        timeoutRef.current = setTimeout(() => {
          highlightRef.current = { close: false, border: false };
          setForceUpdate((prev) => prev + 1);
        }, 3000);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleMediaChange = (e, mediaType) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          [mediaType]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    try {
      const isDirectBroadcast = formData.isDirectBroadcast;
      console.log("📤 Preparing broadcast data...");
      console.log("Is direct broadcast:", isDirectBroadcast);
  
      const broadcastData = {
        customer_id: user?.customer_id,
        broadcastName: formData.broadcastName,
        messageType: formData.messageType,
        schedule: formData.schedule,
        scheduleDate: selectedDate ? selectedDate.toISOString() : "",
        date:
          formData.schedule === "Yes" && selectedDate
            ? selectedDate.toISOString()
            : new Date().toISOString(),
        status: formData.schedule === "No" ? "Live" : "Scheduled",
        type: isDirectBroadcast ? "Direct Broadcast" : "Manual Broadcast",
      };
  
      // 🟢 Direct broadcast → send contacts
      if (isDirectBroadcast && formData.directContacts) {
        broadcastData.contacts = formData.directContacts;
        broadcastData.total_contacts = formData.directContacts.length;
      } else {
        // 🟢 Group broadcast → send group_id
        broadcastData.group_id = Array.isArray(formData.group_id)
          ? formData.group_id[0]
          : formData.group_id;
      }
  
      // 🟢 Template data if available
      if (formData.selectedTemplate) {
        broadcastData.template_id = formData.selectedTemplate.id;
        broadcastData.template_name = formData.selectedTemplate.element_name;
      }
  
      // ✅ Single API endpoint
      const endpoint = API_ENDPOINTS.BROADCASTS.GET_CUSTOMERS;
  
      console.log("🌐 Sending request to:", endpoint);
      console.log("📤 Request payload:", JSON.stringify(broadcastData, null, 2));
  
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(broadcastData),
      });
  
      console.log("📥 Response status:", response.status, response.statusText);
  
      // ✅ Parse JSON only once
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Invalid JSON response from server");
      }
  
      console.log("📩 Response data:", result);
  
      if (!response.ok) {
        throw new Error(result.message || "Failed to create broadcast");
      }
  
      // ✅ Success
      const successMessage = isDirectBroadcast
        ? `Broadcast sent to ${broadcastData.total_contacts} contacts!`
        : "Broadcast created successfully!";
  
      toast.success(successMessage);
      onBroadcastCreated();
      onClose();
      navigate("/broadcast", { replace: true });
  
    } catch (err) {
      console.error("❌ Error saving broadcast:", err);
      setError("Unable to save broadcast. Please try again later.");
      setAlertMessage("Failed to save broadcast. Please try again.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTemplate = () => {
    setIsTemplateOpen(true);
  };

  const closeTemplate = () => {
    setIsTemplateOpen(false);
  };

  const handleCloseAndNavigate = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    highlightRef.current = { close: false, border: false };
    setForceUpdate((prev) => prev + 1);
    setShowExitDialog(true);
  };

  const hasUnsavedChanges = Object.values(formData).some(
    (value) =>
      value &&
      value !== "Select Customer List" &&
      value !== "Text Message" &&
      value !== "Pre-approved template message" &&
      value !== "No"
  );

  const confirmExit = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    highlightRef.current = { close: false, border: false };
    setForceUpdate((prev) => prev + 1);
    onClose();
    navigate("/broadcast");
    setShowExitDialog(false);
  };

  const cancelExit = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    highlightRef.current = { close: false, border: false };
    setForceUpdate((prev) => prev + 1);
    setShowExitDialog(false);
  };

  return (
    <>
      <div className="flex items-center justify-center font-poppins">
          <BroadcastForm
            formData={formData}
            setFormData={setFormData}
            handleInputChange={handleInputChange}
            step={step}
            setStep={setStep}
            handleRadioChange={handleRadioChange}
            handleMediaChange={handleMediaChange}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            isTemplateOpen={isTemplateOpen}
            openTemplate={openTemplate}
            closeTemplate={closeTemplate}
            SendTemplate={SendTemplate}
            loading={loading}
            error={error}
            customerLists={customerLists}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onTemplateSelect={handleTemplateSelect}
          />
      </div>
      <ConfirmationDialog
        showExitDialog={showExitDialog}
        hasUnsavedChanges={hasUnsavedChanges}
        cancelExit={cancelExit}
        confirmExit={confirmExit}
      />
    </>
  );
};

export default BroadcastPages;