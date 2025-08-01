import React, { useState } from "react";
import ContactTabs from "./ContactTabs";
import SuccessErrorMessage from "./SuccessErrorMessage";
import SingleContactForm from "./SingleContactForm";
import BulkContactForm from "./BulkContactForm";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const GroupNameErrorDialog = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#4a4a4a]/90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Duplicate Group Name
        </h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0AA89E] text-white rounded-md hover:bg-[#0AA89E]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AddContact({ closePopup, onSuccess }) {
  const [tab, setTab] = useState("single");
  const [phone, setPhone] = useState("");
  const [optStatus, setOptStatus] = useState("Opted In");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [groupNameError, setGroupNameError] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [fieldMapping, setFieldMapping] = useState({});
  const [groupNameErrorDialog, setGroupNameErrorDialog] = useState({
    isOpen: false,
    message: "",
  });

  const validateGroupName = () => {
    if (tab === "bulk" && !groupName.trim()) {
      setGroupNameError("Group name is required for bulk upload.");
      return false;
    }
    if (groupName.trim().length < 2) {
      setGroupNameError("Group name must be at least 2 characters long.");
      return false;
    }
    if (groupName.trim().length > 50) {
      setGroupNameError("Group name must be less than 50 characters.");
      return false;
    }
    setGroupNameError("");
    return true;
  };

  const clearBulkData = () => {
    setFile(null);
    setGroupName("");
    setGroupNameError("");
  };

  const handleTabChange = (newTab) => {
    if (newTab === "single" && tab === "bulk") {
      clearBulkData();
    }
    setTab(newTab);
  };

  const handleSubmit = async () => {
    if (tab === "single" && phoneError) return;
    if (tab === "bulk") {
      if (!validateGroupName()) return;
      if (!file) {
        setErrorMessage("Please provide a CSV file.");
        setSuccessMessage("");
        return;
      }
    }

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (tab === "single") {
        const digits = phone.replace(/\D/g, "");
        const countryCodeMatch = phone.match(/^\+?\d{1,4}/);
        const countryCode = countryCodeMatch ? countryCodeMatch[0] : "";
        const nationalNumber = digits.replace(countryCode, "");

        const response = await fetch(API_ENDPOINTS.CONTACTS.ADD_SINGLE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            country_code: countryCode,
            first_name: name.trim(),
            mobile_no: nationalNumber,
            customer_id: user.customer_id,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setSuccessMessage(data.message || "Contact added successfully!");
          setErrorMessage("");
          if (onSuccess) onSuccess(data.message);
        } else {
          setErrorMessage(data.message || "Failed to add contact.");
          setSuccessMessage("");
        }
      } else {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("customer_id", user.customer_id);
        formData.append("group_name", groupName.trim());
        formData.append("field_mapping", JSON.stringify(fieldMapping));

        const response = await fetch(API_ENDPOINTS.CONTACTS.ADD_MULTIPLE, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          setSuccessMessage(data.message || "Contacts imported successfully!");
          setErrorMessage("");
          if (onSuccess) onSuccess(data.message);
        } else {
          if (
            data.message?.toLowerCase().includes("group") &&
            data.message?.toLowerCase().includes("already exists")
          ) {
            setGroupNameErrorDialog({
              isOpen: true,
              message: data.message,
            });
          } else {
            setErrorMessage(data.message || "Failed to import from file.");
          }
          setSuccessMessage("");
        }
      }
    } catch (error) {
      console.error("API error:", error);
      setErrorMessage("An error occurred.");
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl text-gray-500 p-6">
        <h2 className="text-xl font-semibold mb-2 text-black">Add Contact</h2>
        <SuccessErrorMessage
          successMessage={successMessage}
          errorMessage={errorMessage}
        />
        <p className="text-sm text-gray-600 mb-4">Add one contact</p>
        <ContactTabs tab={tab} setTab={handleTabChange} />

        {tab === "single" ? (
          <SingleContactForm
            phone={phone}
            setPhone={setPhone}
            phoneError={phoneError}
            setPhoneError={setPhoneError}
            isTouched={isTouched}
            setIsTouched={setIsTouched}
            optStatus={optStatus}
            setOptStatus={setOptStatus}
            name={name}
            setName={setName}
          />
        ) : (
          <BulkContactForm
            file={file}
            setFile={setFile}
            groupName={groupName}
            setGroupName={setGroupName}
            groupNameError={groupNameError}
            validateGroupName={validateGroupName}
            fieldMapping={fieldMapping}
            setFieldMapping={setFieldMapping}
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`mt-4 px-4 py-2 rounded mx-auto block ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-teal-600 text-white"
          }`}
        >
          {isSubmitting
            ? "Submitting..."
            : tab === "single"
            ? "Add Contact"
            : "Import Contacts"}
        </button>
      </div>

      <GroupNameErrorDialog
        isOpen={groupNameErrorDialog.isOpen}
        message={groupNameErrorDialog.message}
        onClose={() =>
          setGroupNameErrorDialog({ isOpen: false, message: "" })
        }
      />
    </>
  );
}
