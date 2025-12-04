import { Phone, User, Tag } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import TagSelector from "../tags/components/TagSelector";

export default function SingleContactForm({
  phone,
  setPhone,
  phoneError,
  setPhoneError,
  isTouched,
  setIsTouched,
  name,
  setName,
  nameError = "",
  selectedTags = [],
  setSelectedTags,
}) {
  const handlePhoneChange = (value, country) => {
    // Pass phone value and dial code to parent
    // country.dialCode contains the country code (e.g., "91" for India)
    setPhone(value, country?.dialCode || "");
    setIsTouched(true);
    
    // Clear error if phone looks valid (10+ digits)
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 10 && phoneError) {
      setPhoneError("");
    }
  };

  return (
    <div className="space-y-5">
      {/* Phone Number Field */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Phone size={16} className="text-gray-400" />
          Phone Number <span className="text-red-500">*</span>
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
            border: phoneError ? "1px solid #ef4444" : "1px solid #e5e7eb",
            paddingLeft: "52px",
          }}
          buttonStyle={{
            borderRadius: "0.5rem 0 0 0.5rem",
            borderTop: phoneError ? "1px solid #ef4444" : "1px solid #e5e7eb",
            borderBottom: phoneError ? "1px solid #ef4444" : "1px solid #e5e7eb",
            borderLeft: phoneError ? "1px solid #ef4444" : "1px solid #e5e7eb",
            borderRight: "none",
          }}
          containerStyle={{ width: "100%" }}
          placeholder="Enter phone number"
        />
        {phoneError && (
          <p className="mt-1 text-xs text-red-500">{phoneError}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Include country code for international numbers
        </p>
      </div>

      {/* Name Field */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <User size={16} className="text-gray-400" />
          Contact Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter contact name"
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
            nameError ? "border-red-500 bg-red-50" : "border-gray-200"
          }`}
        />
        {nameError && (
          <p className="mt-1 text-xs text-red-500">{nameError}</p>
        )}
      </div>

      {/* Tags Field */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Tag size={16} className="text-gray-400" />
          Tags
          <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <TagSelector
          selectedTags={selectedTags}
          onTagsChange={(tags) => setSelectedTags && setSelectedTags(tags)}
          placeholder="Select or create tags..."
          allowCreate={true}
        />
        <p className="mt-1 text-xs text-gray-400">
          Add tags to organize your contacts
        </p>
      </div>
    </div>
  );
}
