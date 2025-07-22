// ActionSelector.jsx
import React from "react";

const ActionSelector = ({
  selectedAction,
  setSelectedAction,
  quickReplies,
  setQuickReplies,
  urlCtas,
  setUrlCtas,
  phoneCta,
  setPhoneCta,
  offerCode,
  setOfferCode,
  setHasUnsavedChanges,
}) => {
  const handleActionChange = (e) => {
    setSelectedAction(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleQuickReplyChange = (index, value) => {
    const updatedReplies = [...quickReplies];
    updatedReplies[index] = value;
    setQuickReplies(updatedReplies);
    setHasUnsavedChanges(true);
  };

  const handleCtaChange = (index, key, value) => {
    const updatedCtas = [...urlCtas];
    updatedCtas[index][key] = value;
    setUrlCtas(updatedCtas);
    setHasUnsavedChanges(true);
  };

  const handlePhoneCtaChange = (key, value) => {
    setPhoneCta((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-4">
      {/* Action Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Action</label>
        <select
          value={selectedAction}
          onChange={handleActionChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="None">None</option>
          <option value="Quick Replies">Quick Replies</option>
          <option value="Call To Actions">Call To Actions</option>
          <option value="All">All</option>
        </select>
      </div>

      {/* Quick Replies */}
      {(selectedAction === "Quick Replies" || selectedAction === "All") && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Quick Replies</label>
          {[0, 1, 2].map((idx) => (
            <input
              key={idx}
              type="text"
              value={quickReplies[idx] || ""}
              onChange={(e) => handleQuickReplyChange(idx, e.target.value)}
              placeholder={`Reply ${idx + 1}`}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm mb-2 focus:border-blue-500 focus:ring-blue-500"
            />
          ))}
        </div>
      )}

      {/* URL Call To Actions */}
      {(selectedAction === "Call To Actions" || selectedAction === "All") && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">URL Call To Actions</label>
            {[0, 1].map((idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={urlCtas[idx]?.title || ""}
                  onChange={(e) => handleCtaChange(idx, "title", e.target.value)}
                  placeholder={`Title ${idx + 1}`}
                  className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={urlCtas[idx]?.url || ""}
                  onChange={(e) => handleCtaChange(idx, "url", e.target.value)}
                  placeholder={`URL ${idx + 1}`}
                  className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          {/* Phone CTA */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Call To Action</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={phoneCta.title}
                onChange={(e) => handlePhoneCtaChange("title", e.target.value)}
                placeholder="Button Title"
                className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="tel"
                value={phoneCta.number}
                onChange={(e) => handlePhoneCtaChange("number", e.target.value)}
                placeholder="Phone Number"
                className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ActionSelector;
