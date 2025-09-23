import React, { useEffect, useState } from "react";
import ContactTabs from "./ContactTabs";
import SuccessErrorMessage from "./SuccessErrorMessage";
import SingleContactForm from "./SingleContactForm";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function EditContact({ contact, closePopup, onSuccess }) {
  const [phone, setPhone] = useState("");
  const [optStatus, setOptStatus] = useState("Opted In");
  const [name, setName] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (contact) {
      setName(contact.first_name || "");
      setPhone(`${contact.country_code || ""}${contact.mobile_no || ""}`);
      setOptStatus(contact.is_active ? "Opted In" : "Opted Out");
    }
  }, [contact]);

  const validatePhoneNumber = () => {
    // Basic validation - detailed validation is handled by PhoneInputField
    if (!phone || phone.trim().length < 10) {
      setPhoneError("Please enter a valid phone number.");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!user) {
      setErrorMessage("You must be logged in.");
      setLoading(false);
      return;
    }

    if (!validatePhoneNumber()) {
      setLoading(false);
      return;
    }

    // --- FIXED PHONE PARSING ---
    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
    const phoneDigits = formattedPhone.replace(/\D/g, "");

    // Prefer contact's country_code if available
    let countryCode = contact?.country_code || "";
    if (!countryCode && formattedPhone.startsWith("+")) {
      const match = formattedPhone.match(/^\+(\d{1,3})/);
      countryCode = match ? `+${match[1]}` : "+91"; // fallback to +91
    }

    // Mobile number = remaining digits after country code
    const mobileNumber = phoneDigits.slice(countryCode.replace("+", "").length);

    const requestBody = {
      contact_id: contact.contact_id,
      customer_id: user.customer_id,
      country_code: countryCode,
      first_name: name.trim(),
      mobile_no: mobileNumber,
    };

    try {
      const response = await fetch(API_ENDPOINTS.CONTACTS.UPDATE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || "Contact updated successfully!");
        setErrorMessage("");
        if (onSuccess) onSuccess();
        closePopup();
      } else {
        setErrorMessage(data.message || "Failed to update contact.");
        setSuccessMessage("");
      }
    } catch (err) {
      console.error("API error:", err);
      setErrorMessage("An error occurred while updating the contact.");
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

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
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`mt-4 px-4 py-2 rounded mx-auto block cursor-pointer ${
          loading
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-teal-600 text-white"
        }`}
      >
        {loading ? "Updating..." : "Update"}
      </button>
    </div>
  );
}
