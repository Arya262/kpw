import React, { useState } from "react";

const TriggerConditionStep = ({ seqData, setSeqData }) => {
  // Ensure delivery_preferences always exists
  const deliveryPrefs = seqData.delivery_preferences || [
    {
      allow_once: true,
      continue_after_delivery: false,
      days: [],
      time_from: "",
      time_to: "",
      time_type: "Any Time",
    },
  ];

  const handleDayClick = (day) => {
    setSeqData((prev) => {
      const updatedSchedule = [...prev.delivery_preferences];
      let updatedDays = [...(updatedSchedule[0]?.days || [])];

      if (day === "All Days") {
        const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        updatedDays = updatedDays.length === allDays.length ? [] : [...allDays];
      } else {
        if (updatedDays.includes(day)) {
          updatedDays = updatedDays.filter((d) => d !== day);
        } else {
          updatedDays.push(day);
        }
      }

      updatedSchedule[0] = { ...updatedSchedule[0], days: updatedDays };
      return { ...prev, delivery_preferences: updatedSchedule };
    });
  };

  const handleTimeTypeChange = (e) => {
    const value = e.target.value;
    setSeqData((prev) => {
      const updatedSchedule = [...prev.delivery_preferences];
      updatedSchedule[0] = {
        ...updatedSchedule[0],
        time_type: value,
        time_from: value === "Any Time" ? "" : updatedSchedule[0].time_from,
        time_to: value === "Any Time" ? "" : updatedSchedule[0].time_to,
      };
      return { ...prev, delivery_preferences: updatedSchedule };
    });
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setSeqData((prev) => {
      const updatedSchedule = [...prev.delivery_preferences];
      updatedSchedule[0] = { ...updatedSchedule[0], [name]: value };
      return { ...prev, delivery_preferences: updatedSchedule };
    });
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const triggerOptions = [
    "On Created",
    "On Updated",
    "On Both (Created & Updated)",
  ];

  const selectedPref = deliveryPrefs[0];
  const showTimeRange = selectedPref.time_type === "Time Range";
  const allDaysSelected = (selectedPref.days || []).length === 7;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-2">
        <h4 className="text-lg font-semibold text-gray-900">
          Trigger & Schedule
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Configure when and how your sequence triggers
        </p>
      </div>

      {/* Trigger Condition */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
          Trigger Condition
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {triggerOptions.map((opt) => (
            <label
              key={opt}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                seqData.trigger_type === opt
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="trigger_type"
                required
                value={opt}
                checked={seqData.trigger_type === opt}
                onChange={(e) =>
                  setSeqData({ ...seqData, trigger_type: e.target.value })
                }
                className="text-teal-600 focus:ring-teal-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">
                {opt}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Delivery Preference */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
          Delivery Schedule
        </h4>

        {/* Days Selection */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700 sm:w-32 flex-shrink-0">
              Delivery Days <span className="text-red-500">*</span>
            </label>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {/* All Days Button */}
                <button
                  onClick={() => handleDayClick("All Days")}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    allDaysSelected
                      ? "bg-teal-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Days
                </button>

                {/* Individual Days */}
                {days.map((day) => {
                  const selectedDays = selectedPref.days || [];
                  const isActive = selectedDays.includes(day);

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-teal-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedPref.days?.length || 0} day(s) selected
              </p>
            </div>
          </div>
        </div>

        {/* Time Selection */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-sm font-medium text-gray-700 sm:w-32 flex-shrink-0">
              Delivery Time
            </label>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <select
                  value={selectedPref.time_type}
                  onChange={handleTimeTypeChange}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                >
                  <option value="Any Time">Any Time</option>
                  <option value="Time Range">Specific Time Range</option>
                </select>

                {/* Time Range Inputs */}
                {showTimeRange && (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="time"
                        name="time_from"
                        value={selectedPref.time_from || ""}
                        onChange={handleTimeChange}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      />
                      <span className="text-gray-500 text-sm">to</span>
                      <input
                        type="time"
                        name="time_to"
                        value={selectedPref.time_to || ""}
                        onChange={handleTimeChange}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {showTimeRange
                  ? "Messages will only be sent during the specified time range"
                  : "Messages can be sent at any time of day"}
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="border-t pt-6">
          <h5 className="font-medium text-gray-900 mb-4">Advanced Options</h5>

          <div className="space-y-4">
            {/* Allow Once */}
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                name="allow_once"
                checked={seqData.delivery_preferences[0]?.allow_once || false}
                onChange={(e) => {
                  const updated = [...seqData.delivery_preferences];
                  updated[0] = {
                    ...updated[0],
                    allow_once: e.target.checked,
                  };
                  setSeqData({ ...seqData, delivery_preferences: updated });
                }}
                className="mt-1 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Allow contacts to enter this sequence only once
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Prevents contacts from re-entering this sequence if they've
                  already completed it
                </p>
              </div>
            </label>

            {/* Continue After Delivery */}
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                name="continue_after_delivery"
                checked={
                  seqData.delivery_preferences[0]?.continue_after_delivery ||
                  false
                }
                onChange={(e) => {
                  const updated = [...seqData.delivery_preferences];
                  updated[0] = {
                    ...updated[0],
                    continue_after_delivery: e.target.checked,
                  };
                  setSeqData({ ...seqData, delivery_preferences: updated });
                }}
                className="mt-1 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Continue sequence after delivery window
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  If you want to continue sequence after delivery window
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriggerConditionStep;
