import React from "react";
import { Trash2 } from "lucide-react";

const OfferCodeSection = ({ offerCode, setOfferCode, selectedAction }) => {
  if (selectedAction !== "All") return null;
  return (
    <div className="border border-[#CACACA] rounded p-4 mb-4">
      <div className="font-semibold mb-2 border-[#CACACA] pb-2">
        Copy Offer Code
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="border border-[#CACACA] rounded p-2 w-full focus:outline-none focus:border-teal-500"
          placeholder="Enter Offer Code"
          value={offerCode}
          onChange={(e) => setOfferCode(e.target.value)}
        />
        <button
          type="button"
          className="text-red-600 hover:bg-red-100 px-2 py-1 rounded hover:cursor-pointer"
          onClick={() => setOfferCode("")}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default OfferCodeSection;