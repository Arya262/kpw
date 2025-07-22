import React from "react";
import { Trash2 } from "lucide-react";

const CallToActionSection = ({
  urlCtas,
  setUrlCtas,
  phoneCta,
  setPhoneCta,
  selectedAction,
}) => {
  if (selectedAction !== "Call To Actions" && selectedAction !== "All") return null;
  return (
    <>
      {/* Call To Action 1 (URL) */}
      <div className="border border-[#CACACA] rounded p-4 mb-4">
        <div className="flex justify-between items-center mb-2 border-b border-[#CACACA] pb-2">
          <div className="font-semibold">Call To Action 1 (URL)</div>
          <button
            type="button"
            className="bg-teal-500 text-white px-3 py-1 rounded text-sm"
            onClick={() => setUrlCtas([...urlCtas, { title: "", url: "" }])}
          >
            + Add URL
          </button>
        </div>
        {urlCtas.map((cta, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end"
          >
            <input
              type="text"
              placeholder="Enter Button Title"
              className="border rounded p-2 border-[#606060]"
              value={cta.title}
              onChange={(e) => {
                const updated = [...urlCtas];
                updated[index].title = e.target.value;
                setUrlCtas(updated);
              }}
            />
            <select className="border rounded p-2 border-[#606060]">
              <option value={"Static"}>Static</option>
              <option value={"Dynamic"}>Dynamic</option>
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Static URL"
                className="border rounded p-2 w-full border-[#606060]"
                value={cta.url}
                onChange={(e) => {
                  const updated = [...urlCtas];
                  updated[index].url = e.target.value;
                  setUrlCtas(updated);
                }}
              />
              <button
                type="button"
                className="bg-red-500 text-white px-2 py-1 rounded hover:cursor-pointer"
                onClick={() => {
                  const updated = urlCtas.filter((_, i) => i !== index);
                  setUrlCtas(updated);
                }}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Call To Action 2 (Phone Number) */}
      <div className="border border-[#CACACA] rounded p-4 mb-4">
        <div className="font-semibold mb-1">Call To Action 2 (Phone Number)</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <input
            type="text"
            placeholder="Enter Button Title"
            className="border rounded p-2 border-[#606060]"
            value={phoneCta.title}
            onChange={(e) =>
              setPhoneCta({ ...phoneCta, title: e.target.value })
            }
          />
          <select
            className="border rounded p-2 border-[#606060]"
            value={phoneCta.country}
            onChange={(e) =>
              setPhoneCta({
                ...phoneCta,
                country: e.target.value,
              })
            }
          >
            <option>Select Country</option>
            <option value="+91">India (+91)</option>
            <option value="+1">USA (+1)</option>
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter mobile Number"
              className="border rounded p-2 w-full border-[#606060]"
              value={phoneCta.number}
              onChange={(e) =>
                setPhoneCta({
                  ...phoneCta,
                  number: e.target.value,
                })
              }
            />
            <button
              type="button"
              className="bg-red-500 text-white px-2 py-1 rounded hover:cursor-pointer"
              onClick={() =>
                setPhoneCta({
                  title: "",
                  country: "",
                  number: "",
                })
              }
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CallToActionSection;