import React, { useCallback } from "react";
import { useContactContext } from "./context/ContactContext";
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

export default function AddContact({ closePopup, onSuccess, onPlanRequired }) {
  const { user } = useAuth();
  const { state, updateFormField, resetForm, setFormLoading, dispatch } = useContactContext();
  
  const {
    form: {
      phone,
      name,
      selectedTags,
      file,
      fieldMapping,
      extractedContacts,
      phoneError,
      isTouched,
      successMessage,
      errorMessage,
      isLoading,
    }
  } = state;

  const [tab, setTab] = React.useState("single");
  const [groupNameErrorDialog, setGroupNameErrorDialog] = React.useState({
    isOpen: false,
    message: "",
  });

  const clearBulkData = useCallback(() => {
    updateFormField('file', null);
    updateFormField('fieldMapping', {});
    updateFormField('extractedContacts', []);
  }, [updateFormField]);

  const handleTabChange = useCallback((newTab) => {
    if (newTab === "bulk") {
      const canProceed = onPlanRequired ? onPlanRequired('bulkImport') : true;
      if (!canProceed) return;
    }
    
    if (newTab === "single" && tab === "bulk") {
      clearBulkData();
    }
    
    setTab(newTab);
  }, [tab, onPlanRequired, clearBulkData]);

  const handleDataExtracted = useCallback((contacts) => {
    updateFormField('extractedContacts', contacts);
  }, [updateFormField]);

  const handleSubmit = useCallback(async () => {
    if (tab === "single" && phoneError) return;
    if (tab === "bulk") {
      if (!file) {
        updateFormField('errorMessage', "Please provide a CSV file.");
        updateFormField('successMessage', "");
        return;
      }
      if (!extractedContacts || extractedContacts.length === 0) {
        updateFormField('errorMessage', "No valid contacts found to import. Please check your CSV file and try again.");
        return;
      }
    }

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    setFormLoading(true);

    try {
      if (tab === "single") {
        const digits = phone.replace(/\D/g, "");
        const countryCodeMatch = phone.match(/^\+?\d{1,4}/);
        const countryCode = countryCodeMatch ? countryCodeMatch[0] : "";
        const nationalNumber = digits.replace(countryCode, "");

        const response = await fetch(API_ENDPOINTS.CONTACTS.ADD_SINGLE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            country_code: countryCode,
            first_name: name.trim(),
            mobile_no: nationalNumber,
            customer_id: user.customer_id,
            tags: selectedTags.map(tag => ({
              tag_id: tag.tag_id || tag.id,
              tag_name: tag.tag_name || tag.name
            })),
          }),
        });

        const data = await response.json();
        if (data.success) {
          updateFormField('successMessage', data.message || "Contact added successfully!");
          updateFormField('errorMessage', "");
          resetForm();
          if (onSuccess) onSuccess(data.message);
        } else {
          updateFormField('errorMessage', data.message || "Failed to add contact.");
          updateFormField('successMessage', "");
        }
      } else {
        if (!extractedContacts || extractedContacts.length === 0) {
          throw new Error("No valid contacts found to import");
        }
  
        const requestBody = {
          customer_id: user.customer_id,
          contacts: extractedContacts,
          import_timestamp: new Date().toISOString(),
          default_tags: selectedTags.map(tag => ({
            tag_id: tag.tag_id || tag.id,
            tag_name: tag.tag_name || tag.name
          }))
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
  
        updateFormField('successMessage', result.message || "Contacts imported successfully!");
        updateFormField('errorMessage', "");
        resetForm();
        if (onSuccess) onSuccess(result.message);
      }
    } catch (error) {
      console.error("API error:", error);
      updateFormField('errorMessage', error.message || "An error occurred while importing contacts");
      updateFormField('successMessage', "");
    } finally {
      setFormLoading(false);
    }
  }, [tab, phone, name, selectedTags, file, extractedContacts, phoneError, user, onSuccess, updateFormField, resetForm, setFormLoading]);

  return (
    <>
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl text-gray-500 p-6">
        <h2 className="text-xl font-semibold mb-2 text-black">Add Contact</h2>

        <SuccessErrorMessage
          successMessage={successMessage}
          errorMessage={errorMessage}
        />

        <p className="text-sm text-gray-600 mb-4">
          {tab === "single" ? "Add one contact manually" : "Upload contacts in bulk"}
        </p>

        <ContactTabs tab={tab} setTab={handleTabChange} />

        {tab === "single" ? (
          <SingleContactForm
            phone={phone}
            setPhone={(value) => updateFormField('phone', value)}
            phoneError={phoneError}
            setPhoneError={(value) => dispatch({ type: 'SET_FORM_ERROR', payload: { field: 'phoneError', error: value } })}
            isTouched={isTouched}
            setIsTouched={(value) => dispatch({ type: 'SET_FORM_TOUCHED', payload: value })}
            optStatus="Opted In"
            setOptStatus={() => {}}
            name={name}
            setName={(value) => updateFormField('name', value)}
            selectedTags={selectedTags}
            setSelectedTags={(value) => updateFormField('selectedTags', value)}
          />
        ) : (
          <BulkContactForm
            file={file}
            setFile={(value) => updateFormField('file', value)}
            fieldMapping={fieldMapping}
            setFieldMapping={(value) => updateFormField('fieldMapping', value)}
            onDataExtracted={handleDataExtracted}
            selectedTags={selectedTags}
            setSelectedTags={(value) => updateFormField('selectedTags', value)}
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`mt-4 px-4 py-2 rounded mx-auto block cursor-pointer ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-teal-600 hover:bg-teal-700 text-white"
          }`}
        >
          {isLoading
            ? "Submitting..."
            : tab === "single"
            ? "Add Contact"
            : "Bulk Contact"}
        </button>
      </div>

      <GroupNameErrorDialog
        isOpen={groupNameErrorDialog.isOpen}
        message={groupNameErrorDialog.message}
        onClose={() => setGroupNameErrorDialog({ isOpen: false, message: "" })}
      />
    </>
  );
}
