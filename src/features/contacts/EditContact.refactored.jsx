import React, { useEffect, useCallback } from "react";
import { useContactContext } from "./context/ContactContext";
import SuccessErrorMessage from "./SuccessErrorMessage";
import SingleContactForm from "./SingleContactForm";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function EditContact({ contact, closePopup, onSuccess }) {
  const { user } = useAuth();
  const { state, updateFormField, setFormLoading, dispatch } = useContactContext();
  
  const {
    form: {
      phone,
      name,
      selectedTags,
      phoneError,
      isTouched,
      successMessage,
      errorMessage,
      isLoading,
    }
  } = state;

  useEffect(() => {
    if (contact) {
      updateFormField('name', contact.first_name || "");
      updateFormField('phone', `${contact.country_code || ""}${contact.mobile_no || ""}`);
      updateFormField('selectedTags', contact.tags || []);
    }
  }, [contact, updateFormField]);

  const validatePhoneNumber = useCallback(() => {
    if (!phone || phone.trim().length < 10) {
      dispatch({ type: 'SET_FORM_ERROR', payload: { field: 'phoneError', error: "Please enter a valid phone number." } });
      return false;
    }
    dispatch({ type: 'CLEAR_FORM_ERROR', payload: 'phoneError' });
    return true;
  }, [phone, dispatch]);

  const handleSubmit = useCallback(async () => {
    if (!user) {
      updateFormField('errorMessage', "You must be logged in.");
      return;
    }

    if (!validatePhoneNumber()) {
      return;
    }

    setFormLoading(true);

    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
    const phoneDigits = formattedPhone.replace(/\D/g, "");

    let countryCode = contact?.country_code || "";
    if (!countryCode && formattedPhone.startsWith("+")) {
      const match = formattedPhone.match(/^\+(\d{1,3})/);
      countryCode = match ? `+${match[1]}` : "+91";
    }

    const mobileNumber = phoneDigits.slice(countryCode.replace("+", "").length);

    const requestBody = {
      contact_id: contact.contact_id,
      customer_id: user.customer_id,
      country_code: countryCode,
      first_name: name.trim(),
      mobile_no: mobileNumber,
      tags: selectedTags.map(tag => ({
        tag_id: tag.tag_id || tag.id,
        tag_name: tag.tag_name || tag.name
      })),
    };

    try {
      const response = await fetch(API_ENDPOINTS.CONTACTS.UPDATE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        updateFormField('successMessage', data.message || "Contact updated successfully!");
        updateFormField('errorMessage', "");
        if (onSuccess) onSuccess();
        closePopup();
      } else {
        updateFormField('errorMessage', data.message || "Failed to update contact.");
        updateFormField('successMessage', "");
      }
    } catch (err) {
      console.error("API error:", err);
      updateFormField('errorMessage', "An error occurred while updating the contact.");
      updateFormField('successMessage', "");
    } finally {
      setFormLoading(false);
    }
  }, [user, contact, phone, name, selectedTags, validatePhoneNumber, updateFormField, setFormLoading, onSuccess, closePopup]);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl text-gray-500 p-6">
      <h2 className="text-xl font-semibold mb-2 text-black text-left">
        Update Contact
      </h2>
      <SuccessErrorMessage
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
      <p className="text-sm text-gray-600 mb-4 text-left">
        Keep your contact records up to date by modifying details, tags, and
        phone numbers as needed.
      </p>
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
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`mt-4 px-4 py-2 rounded mx-auto block cursor-pointer ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-teal-600 text-white"
        }`}
      >
        {isLoading ? "Updating..." : "Update"}
      </button>
    </div>
  );
}
