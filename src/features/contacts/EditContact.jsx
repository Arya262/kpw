import { useEffect, useState } from "react";
import { Phone, User, Tag } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import SuccessErrorMessage from "./SuccessErrorMessage";
import TagSelector from "../tags/components/TagSelector";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { getTagId, getTagName } from "../tags/utils/tagUtils";

export default function EditContact({ contact, closePopup, onSuccess }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const { user } = useAuth();

  // Fetch available tags to map string tags to tag objects
  useEffect(() => {
    const fetchTags = async () => {
      if (!user?.customer_id) return;
      try {
        const response = await fetch(API_ENDPOINTS.TAGS.GET_ALL(user.customer_id), {
          credentials: "include",
        });
        const data = await response.json();
        const tags = data?.tags || data?.data || data || [];
        setAvailableTags(Array.isArray(tags) ? tags : []);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    };
    fetchTags();
  }, [user?.customer_id]);

  // Initialize contact data and convert string tags to tag objects
  useEffect(() => {
    if (contact) {
      setName(contact.first_name || contact.fullName || "");
      setPhone(`${contact.country_code || ""}${contact.mobile_no || ""}`);
    }
  }, [contact]);

  // Convert string tags to tag objects once availableTags are loaded
  useEffect(() => {
    if (contact?.tags && Array.isArray(contact.tags) && availableTags.length > 0) {
      const tagObjects = contact.tags.map((tag) => {
        // If already an object with id, use it
        if (typeof tag === "object" && tag?.id) return tag;
        // If string, find matching tag object
        if (typeof tag === "string") {
          const found = availableTags.find(
            (t) => getTagName(t).toLowerCase() === tag.toLowerCase()
          );
          return found || null;
        }
        return null;
      }).filter(Boolean);
      setSelectedTags(tagObjects);
    }
  }, [contact?.tags, availableTags]);

  // Clear error messages when user changes data
  const clearMessages = () => {
    if (errorMessage) setErrorMessage("");
  };

  const handlePhoneChange = (value) => {
    setPhone(value);
    setIsTouched(true);
    clearMessages();
    if (value.replace(/\D/g, "").length < 10) {
      setPhoneError("Please enter a valid phone number");
    } else {
      setPhoneError("");
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    clearMessages();
  };

  const handleTagsChange = (tags) => {
    setSelectedTags(tags);
    clearMessages();
  };

  const handleSubmit = async () => {
    if (phoneError) return;
    setLoading(true);

    if (!user) {
      setErrorMessage("You must be logged in.");
      setLoading(false);
      return;
    }

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
    };

    try {
      // Update contact details
      const response = await fetch(API_ENDPOINTS.CONTACTS.UPDATE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        // Get tag IDs from selected tags (handle both object and string tags)
        const tagIds = selectedTags
          .map((tag) => getTagId(tag))
          .filter(Boolean);

        // Assign tags to contact if any selected
        if (tagIds.length > 0) {
          for (const tagId of tagIds) {
            try {
              await fetch(API_ENDPOINTS.TAGS.ASSIGN, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  contact_id: contact.contact_id,
                  tag_id: tagId,
                }),
              });
            } catch (tagErr) {
              console.error("Error assigning tag:", tagErr);
            }
          }
        }

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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Update Contact</h2>
        <p className="text-sm text-gray-500 mt-1">
          Modify contact details, tags, and phone numbers as needed.
        </p>
      </div>

      <SuccessErrorMessage successMessage={successMessage} errorMessage={errorMessage} />

      <div className="space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone size={16} className="text-gray-400" />
            Phone Number
          </label>
          <PhoneInput
            country="in"
            value={phone}
            onChange={handlePhoneChange}
            inputStyle={{
              width: "100%",
              height: "44px",
              fontSize: "0.95rem",
              borderRadius: "0.5rem",
              border: phoneError && isTouched ? "1px solid #ef4444" : "1px solid #e5e7eb",
              paddingLeft: "52px",
            }}
            buttonStyle={{
              borderRadius: "0.5rem 0 0 0.5rem",
              borderTop: phoneError && isTouched ? "1px solid #ef4444" : "1px solid #e5e7eb",
              borderBottom: phoneError && isTouched ? "1px solid #ef4444" : "1px solid #e5e7eb",
              borderLeft: phoneError && isTouched ? "1px solid #ef4444" : "1px solid #e5e7eb",
              borderRight: "none",
            }}
            containerStyle={{ width: "100%" }}
            placeholder="Enter phone number"
          />
          {phoneError && isTouched && (
            <p className="mt-1 text-xs text-red-500">{phoneError}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="text-gray-400" />
            Contact Name
          </label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter contact name"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Tag size={16} className="text-gray-400" />
            Tags
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            placeholder="Select or create tags..."
            allowCreate={true}
          />
        </div>
      </div>

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
          disabled={loading}
          className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-teal-600 hover:bg-teal-700 text-white"
          }`}
        >
          {loading ? "Updating..." : "Update Contact"}
        </button>
      </div>
    </div>
  );
}
