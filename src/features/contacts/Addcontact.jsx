import { useState } from "react";
import { User, Users } from "lucide-react";
import SuccessErrorMessage from "./SuccessErrorMessage";
import SingleContactForm from "./SingleContactForm";
import BulkContactForm from "./BulkContactForm";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { getTagId } from "../tags/utils/tagUtils";

export default function AddContact({ closePopup, onSuccess, onPlanRequired }) {
  const [tab, setTab] = useState("single");
  const [phone, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("");
  const [optStatus, setOptStatus] = useState("Opted In");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [extractedContacts, setExtractedContacts] = useState([]);
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [fileError, setFileError] = useState("");
  const [contactsError, setContactsError] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const { user } = useAuth();

  const clearBulkData = () => {
    setFile(null);
    setFieldMapping({});
    setExtractedContacts([]);
    setSelectedTags([]);
  };

  const clearMessages = () => {
    if (errorMessage) setErrorMessage("");
  };

  const handleTabChange = (newTab) => {
    if (newTab === "bulk") {
      const canProceed = onPlanRequired ? onPlanRequired("bulkImport") : true;
      if (!canProceed) return;
    }
    if (newTab === "single" && tab === "bulk") {
      clearBulkData();
    }
    setTab(newTab);
    clearMessages();
  };

  const handlePhoneChange = (value, countryDialCode = "") => {
    setPhone(value);
    if (countryDialCode) {
      setDialCode(countryDialCode);
    }
    clearMessages();

    const digits = value.replace(/\D/g, "");
    if (digits.length >= 10) {
      setPhoneError("");
    }
  };

  const handleNameChange = (value) => {
    setName(value);
    clearMessages();
    if (value.trim()) {
      setNameError("");
    }
  };

  const handleFileChange = (file) => {
    setFile(file);
    clearMessages();
    if (file) {
      setFileError("");
      setContactsError("");
    }
  };

  const handleTagsChange = (tags) => {
    setSelectedTags(tags);
    clearMessages();
  };

  const handleDataExtracted = (contacts) => {
    setExtractedContacts(contacts);
    if (contacts && contacts.length > 0) {
      setContactsError("");
    }
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (tab === "single") {
      let hasErrors = false;
      
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 10) {
        setPhoneError("Please enter a valid phone number");
        hasErrors = true;
      } else {
        setPhoneError("");
      }
      
      if (!name.trim()) {
        setNameError("Contact name is required");
        hasErrors = true;
      } else {
        setNameError("");
      }
      
      if (hasErrors) {
        return;
      }
    }
    
    if (tab === "bulk") {
      let hasErrors = false;
      
      if (!file) {
        setFileError("Please upload a CSV file");
        hasErrors = true;
      } else {
        setFileError("");
      }
      
      if (!extractedContacts || extractedContacts.length === 0) {
        setContactsError("No valid contacts found in the file");
        hasErrors = true;
      } else {
        setContactsError("");
      }
      
      if (hasErrors) {
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
        // Use the dialCode from react-phone-input-2 to properly extract the national number
        const countryCode = dialCode || "";
        // Remove the dial code from the beginning of the full number to get the national number
        const nationalNumber = countryCode && digits.startsWith(countryCode) 
          ? digits.slice(countryCode.length) 
          : digits;
        const tagIds = selectedTags.map(tag => getTagId(tag)).filter(Boolean);

        const requestBody = {
          country_code: countryCode,
          first_name: name.trim(),
          mobile_no: nationalNumber,
          customer_id: user.customer_id,
          tags: tagIds,
        };

        const response = await fetch(API_ENDPOINTS.CONTACTS.ADD_SINGLE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        if (data.success) {
          setSuccessMessage(data.message || "Contact added successfully!");
          setErrorMessage("");
          setSelectedTags([]);
          if (onSuccess) onSuccess(data.message);
        } else {
          setErrorMessage(data.message || "Failed to add contact.");
          setSuccessMessage("");
        }
      } else {
        const tagIds = selectedTags.map(tag => getTagId(tag)).filter(Boolean);
        const requestBody = {
          customer_id: user.customer_id,
          contacts: extractedContacts,
          import_timestamp: new Date().toISOString(),
          tags: tagIds,
        };

        const response = await fetch(API_ENDPOINTS.CONTACTS.BULK_IMPORT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || "Failed to import contacts");
        }

        setSuccessMessage(result.message || "Contacts imported successfully!");
        setErrorMessage("");
        setSelectedTags([]);
        if (onSuccess) onSuccess(result.message);
      }
    } catch (error) {
      console.error("API error:", error);
      setErrorMessage(error.message || "An error occurred");
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Add Contact</h2>
        <p className="text-sm text-gray-500 mt-1">
          {tab === "single" ? "Add a single contact manually" : "Import multiple contacts from CSV"}
        </p>
      </div>

      <SuccessErrorMessage successMessage={successMessage} errorMessage={errorMessage} />

      {/* Tab Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleTabChange("single")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
            tab === "single"
              ? "border-teal-500 bg-teal-50 text-teal-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          <User size={18} />
          <span className="font-medium">Single Contact</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("bulk")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
            tab === "bulk"
              ? "border-teal-500 bg-teal-50 text-teal-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}>
          <Users size={18} />
          <span className="font-medium">Bulk Import</span>
        </button>
      </div>

      {/* Form Content */}
      <div className="space-y-4">
        {tab === "single" ? (
          <SingleContactForm
            phone={phone}
            setPhone={handlePhoneChange}
            phoneError={phoneError}
            setPhoneError={setPhoneError}
            isTouched={isTouched}
            setIsTouched={setIsTouched}
            optStatus={optStatus}
            setOptStatus={setOptStatus}
            name={name}
            setName={handleNameChange}
            nameError={nameError}
            selectedTags={selectedTags}
            setSelectedTags={handleTagsChange}
          />
        ) : (
          <BulkContactForm
            file={file}
            setFile={handleFileChange}
            fieldMapping={fieldMapping}
            setFieldMapping={setFieldMapping}
            onDataExtracted={handleDataExtracted}
            selectedTags={selectedTags}
            setSelectedTags={handleTagsChange}
            fileError={fileError}
            contactsError={contactsError}
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={closePopup}
          className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-teal-600 hover:bg-teal-700 text-white"
          }`}
        >
          {isSubmitting ? "Saving..." : tab === "single" ? "Add Contact" : "Import Contacts"}
        </button>
      </div>
    </div>
  );
}
