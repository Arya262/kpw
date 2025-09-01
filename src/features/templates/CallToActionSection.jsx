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
          {/* Add Phone CTA Button */}
          {urlCtas.length > 0 && !showPhoneCTA && (
            <div className="mt-4">
              <button
                type="button"
                className="bg-[#0AA89E] text-white px-2 py-1.5 rounded text-sm cursor-pointer"
                onClick={() => setShowPhoneCTA(true)}
              >
                 Add More
              </button>
            </div>
          )}
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
                setUrlCtas([{ ...cta, title: e.target.value }]);
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
                  setUrlCtas([{ ...cta, url: e.target.value }]);
                }}
              />
              <button
                type="button"
                className="text-red-600 hover:bg-red-100 px-2 py-1 rounded hover:cursor-pointer"
                onClick={() => {
                  setUrlCtas([]);
                }}
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Call To Action 2 (Phone Number) */}
      {showPhoneCTA && (
        <div className="border border-gray-200 rounded p-6 mb-4">
          <div className="font-semibold mb-4">
            Call To Action 2 (Phone Number)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <input
              type="text"
              placeholder="Enter Button Title"
              className="border p-3 text-sm font-medium border-transparent bg-gray-100 rounded w-full focus:outline-none focus:border-teal-500"
              value={phoneCta.title}
              onChange={(e) =>
                setPhoneCta({ ...phoneCta, title: e.target.value })
              }
            />

            <div className="w-full">
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
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter mobile Number"
                className="border p-3 text-sm font-medium border-transparent bg-gray-100 rounded w-full focus:outline-none focus:border-teal-500"
                value={phoneCta.number}
                onChange={(e) =>
                  setPhoneCta({ ...phoneCta, number: e.target.value })
                }
              />
              <button
                type="button"
                className="text-red-600 hover:bg-red-100 px-2 py-1 rounded hover:cursor-pointer"
                onClick={() => {
                  setPhoneCta({ title: "", country: "", number: "" });
                  setShowPhoneCTA(false);
                }}
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CallToActionSection;
