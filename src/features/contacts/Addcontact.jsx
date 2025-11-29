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
  const [optStatus, setOptStatus] = useState("Opted In");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [extractedContacts, setExtractedContacts] = useState([]);
  const [phoneError, setPhoneError] = useState("");
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

  const handleTabChange = (newTab) => {
    if (newTab === "bulk") {
      const canProceed = onPlanRequired ? onPlanRequired("bulkImport") : true;
      if (!canProceed) return;
    }
    if (newTab === "single" && tab === "bulk") {
      clearBulkData();
    }
    setTab(newTab);
  };

  const handleDataExtracted = (contacts) => {
    setExtractedContacts(contacts);
  };

  const handleSubmit = async () => {
    if (tab === "single" && phoneError) return;
    if (tab === "bulk") {
      if (!file) {
        setErrorMessage("Please provide a CSV file.");
        setSuccessMessage("");
        return;
      }
      if (!extractedContacts || extractedContacts.length === 0) {
        setErrorMessage("No valid contacts found. Please check your CSV file.");
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
        const tagIds = selectedTags.map(tag => getTagId(tag)).filter(Boolean);

        console.log("=== ADD CONTACT REQUEST ===");
        console.log("Selected tags:", selectedTags);
        console.log("Tag IDs being sent:", tagIds);

        const requestBody = {
          country_code: countryCode,
          first_name: name.trim(),
          mobile_no: nationalNumber,
          customer_id: user.customer_id,
          tag_ids: tagIds,
        };
        console.log("Full request body:", requestBody);
        console.log("=== END ADD CONTACT REQUEST ===");

        const response = await fetch(API_ENDPOINTS.CONTACTS.ADD_SINGLE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log("Add contact response:", data);
        if (data.success) {
          // Assign tags to the newly created contact
          const contactId = data.contact_id || data.data?.contact_id;
          if (contactId && tagIds.length > 0) {
            console.log("Assigning tags to contact:", contactId, tagIds);
            for (const tagId of tagIds) {
              try {
                await fetch(API_ENDPOINTS.TAGS.ASSIGN, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ contact_id: contactId, tag_id: tagId }),
                });
              } catch (err) {
                console.error("Failed to assign tag:", tagId, err);
              }
            }
          }
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
          tag_ids: tagIds,
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
            setPhone={setPhone}
            phoneError={phoneError}
            setPhoneError={setPhoneError}
            isTouched={isTouched}
            setIsTouched={setIsTouched}
            optStatus={optStatus}
            setOptStatus={setOptStatus}
            name={name}
            setName={setName}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
        ) : (
          <BulkContactForm
            file={file}
            setFile={setFile}
            fieldMapping={fieldMapping}
            setFieldMapping={setFieldMapping}
            onDataExtracted={handleDataExtracted}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
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
