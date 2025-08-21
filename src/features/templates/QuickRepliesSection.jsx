import React from "react";
import { Trash2 } from "lucide-react";

const QuickRepliesSection = ({ quickReplies, setQuickReplies }) => (
  <div className="border border-gray-200 rounded p-6 mb-4">
    <div className="flex justify-between items-center mb-2  border-transparent pb-2">
      <div className="font-semibold">Quick Replies</div>
      <button
        type="button"
        className="bg-[#0AA89E] text-white px-3 py-1.5 rounded text-sm cursor-pointer"
        onClick={() => setQuickReplies([...quickReplies, ""])}
      >
        + Add Quick Replies
      </button>
    </div>
    {quickReplies.map((reply, index) => (
      <div key={index} className="flex gap-2 mb-3">
        <input
          type="text"
          className="border border-transparent bg-gray-100 rounded p-3 text-sm font-medium w-full focus:outline-none focus:border-teal-500"
          placeholder="Enter Quick Replies"
          value={reply}
          onChange={(e) => {
            const updated = [...quickReplies];
            updated[index] = e.target.value;
            setQuickReplies(updated);
          }}
        />
        <button
          type="button"
          className="text-red-600 hover:bg-red-100 px-3 py-1 rounded hover:cursor-pointer"
          onClick={() => {
            const updated = quickReplies.filter((_, i) => i !== index);
            setQuickReplies(updated);
          }}
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </div>
    ))}
  </div>
);

export default QuickRepliesSection;
