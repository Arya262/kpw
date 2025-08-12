import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useRef, useEffect, useCallback } from "react";
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
    const updatedFormData = {
      customer_id: user?.customer_id,
      ...formData,
      // Convert group_id array to single value if needed
      group_id: Array.isArray(formData.group_id) ? formData.group_id[0] : formData.group_id,
      // Convert selectedDate to ISO string, or empty string
      scheduleDate: selectedDate ? selectedDate.toISOString() : "",
      // Convert date to ISO string for backend consistency
      date:
        formData.schedule === "Yes" && selectedDate
          ? selectedDate.toISOString()
          : new Date().toISOString(),
      status: formData.schedule === "No" ? "Live" : "Scheduled",
      type: "Manual Broadcast",
    };

    console.log("Submitting form data with template:", updatedFormData);
    console.log("Using API endpoint:", API_ENDPOINTS.BROADCASTS.GET_CUSTOMERS);

    const response = await fetch(API_ENDPOINTS.BROADCASTS.GET_CUSTOMERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(updatedFormData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      setAlertMessage("Broadcast saved successfully!");
      setShowAlert(true);

      if (onBroadcastCreated) {
        onBroadcastCreated();
      }

      setTimeout(() => {
        setShowAlert(false);
        onClose();
        navigate("/broadcast", {
          state: { formData: updatedFormData },
          replace: true,
        });
      }, 2000);
    } else {
      throw new Error(result.message || "Failed to save broadcast");
    }
  } catch (err) {
    console.error("Error saving broadcast:", err);
    setError("Unable to save broadcast. Please try again later.");
    setAlertMessage("Failed to save broadcast. Please try again.");
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 2000);
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
        <div
          ref={modalRef}
          className={`w-full max-w-[900px] p-4 bg-white rounded-lg shadow-lg border ${
            highlightRef.current.border
              ? "border-teal-500"
              : "border-transparent"
          } transition-all duration-300`}
        >
          <BroadcastHeader
            onClose={handleCloseAndNavigate}
            highlightClose={highlightRef.current.close}
          />
          <AlertDialog showAlert={showAlert} message={alertMessage} />
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