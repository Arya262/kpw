import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const CallToActionSection = ({
  urlCtas,
  setUrlCtas,
  phoneCta,
  setPhoneCta,
  selectedAction,
  phoneNumberError,
  setPhoneNumberError,
}) => {
  const [showPhoneCTA, setShowPhoneCTA] = useState(false);

  if (selectedAction !== "Call To Actions" && selectedAction !== "All")
    return null;

  return (
    <>
      {/* Call To Action 1 (URL) */}
      <div className="border border-gray-200 rounded p-6 mb-4">
        <div className="flex justify-between items-center mb-2 border-transparent pb-2">
          <div className="font-semibold">Call To Action 1 (URL)</div>
        </div>

        {urlCtas.map((cta, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end"
          >
            <input
              type="text"
              placeholder="Enter Button Title"
              className="border border-transparent bg-gray-100 rounded p-3 text-sm font-medium w-full focus:outline-none focus:border-teal-500"
              value={cta.title}
              onChange={(e) => {
                const updated = [...urlCtas];
                updated[index] = { ...cta, title: e.target.value };
                setUrlCtas(updated);
              }}
            />

            <select
              className="border rounded p-3 text-sm font-medium border-transparent bg-gray-100 focus:outline-none focus:border-teal-500 appearance-none cursor-not-allowed"
              value="Static"
              disabled
            >
              <option value="Static">Static</option>
            </select>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://www.foodchow.com"
                className="border rounded p-3 text-sm font-medium w-full border-transparent bg-gray-100 focus:outline-none focus:border-teal-500"
                value={cta.url}
                onChange={(e) => {
                  const updated = [...urlCtas];
                  updated[index] = { ...cta, url: e.target.value };
                  setUrlCtas(updated);
                }}
              />
              <button
                type="button"
                className="text-red-600 hover:bg-red-100 px-2 py-1 rounded hover:cursor-pointer"
                onClick={() => {
                  const updated = urlCtas.filter((_, i) => i !== index);
                  setUrlCtas(updated.length > 0 ? updated : [{ title: "", url: "" }]);
                }}
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        ))}
        
        {/* Add Phone CTA Button */}
        {!showPhoneCTA && (
          <div className="mt-4">
            <button
              type="button"
              className="bg-[#0AA89E] text-white px-3 py-1.5 rounded text-sm cursor-pointer hover:bg-[#088B84] transition-colors"
              onClick={() => setShowPhoneCTA(true)}
            >
              + Add Phone CTA
            </button>
          </div>
        )}
      </div>

      {/* Call To Action 2 (Phone Number) */}
      {showPhoneCTA && (
        <div className="border border-gray-200 rounded p-6 mb-4">
          <div className="font-semibold mb-4">
            Call To Action 2 (Phone Number)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Enter Button Title"
                className="border p-3 text-sm font-medium border-transparent bg-gray-100 rounded w-full focus:outline-none focus:border-teal-500"
                value={phoneCta.title}
                onChange={(e) =>
                  setPhoneCta({ ...phoneCta, title: e.target.value })
                }
              />
              <div className="min-h-[20px]"></div>
            </div>

            <div className="flex flex-col">
              <PhoneInput
                country={"in"}
                value={phoneCta.numberWithCode || phoneCta.country || "+91"}
                onChange={(value, data) =>
                  setPhoneCta({
                    ...phoneCta,
                    country: `+${data.dialCode}`,
                    numberWithCode: `+${data.dialCode}`,
                  })
                }
                enableSearch
                disableAreaCodes
                inputProps={{ readOnly: true }}
                inputStyle={{
                  width: "100%",
                  padding: "0.80rem 0.75rem 1rem 3.5rem",
                  fontSize: "0.875rem",
                  height: "3.0rem",
                  lineHeight: "3.5rem",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "0.375rem",
                  border: "1px solid transparent",
                  outline: "none",
                }}
                buttonStyle={{
                  border: "1px solid transparent",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "0.375rem",
                  padding: "0.75rem 0.5rem",
                }}
                containerStyle={{ width: "100%" }}
              />
              <div className="min-h-[20px]"></div>
            </div>

            <div className="flex flex-col">
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col">
                  <input
                    type="text"
                    placeholder="Enter mobile Number"
                    className={`border p-3 text-sm font-medium rounded w-full focus:outline-none ${
                      phoneNumberError
                        ? "border-red-500 bg-red-50"
                        : "border-transparent bg-gray-100 focus:border-teal-500"
                    }`}
                    value={phoneCta.number}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow digits
                      const numericValue = value.replace(/[^\d]/g, "");
                      
                      // Update the phone number with only digits
                      setPhoneCta({ ...phoneCta, number: numericValue });
                      
                      // Clear error if valid
                      if (numericValue === value) {
                        setPhoneNumberError?.("");
                      } else if (value.length > 0) {
                        // Show error if non-numeric characters were entered
                        setPhoneNumberError?.("Phone number must contain only digits");
                      } else {
                        setPhoneNumberError?.("");
                      }
                    }}
                    onBlur={() => {
                      // Validate on blur
                      if (phoneCta.number && !/^\d+$/.test(phoneCta.number)) {
                        setPhoneNumberError?.("Phone number must contain only digits");
                      }
                    }}
                  />
                  {phoneNumberError && (
                    <p className="text-red-500 text-xs mt-1 min-h-[20px]">
                      {phoneNumberError}
                    </p>
                  )}
                  {!phoneNumberError && <div className="min-h-[20px]"></div>}
                </div>
                <button
                  type="button"
                  className="text-red-600 hover:bg-red-100 px-2 py-1 rounded hover:cursor-pointer flex-shrink-0 self-start"
                  onClick={() => {
                    setPhoneCta({ title: "", country: "", number: "" });
                    setShowPhoneCTA(false);
                    setPhoneNumberError?.("");
                  }}
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CallToActionSection;
