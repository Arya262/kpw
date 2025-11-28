import { useState } from "react";
import { Zap, Calendar, Clock, Settings, RefreshCw, ChevronDown, ChevronUp, Info } from "lucide-react";
import ClockTimePicker from "./components/ClockTimePicker";
import Tooltip from "../../components/Tooltip";

// Extended timezone list
const TIMEZONES = [
  { value: "", label: "Select Timezone" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "America/New_York (EST)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
  { value: "America/Chicago", label: "America/Chicago (CST)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
];

const TriggerConditionStep = ({ seqData, setSeqData, fieldErrors = {} }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const deliveryPrefs = seqData.delivery_preferences || [
    {
      allow_once: true,
      continue_after_delivery: false,
      days: [],
      time_from: "",
      time_to: "",
      timezone: "",
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

  const handleQuickSelect = (type) => {
    setSeqData((prev) => {
      const updatedSchedule = [...prev.delivery_preferences];
      let updatedDays = [];

      if (type === "weekdays") {
        updatedDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      } else if (type === "weekends") {
        updatedDays = ["Sat", "Sun"];
      }

      updatedSchedule[0] = { ...updatedSchedule[0], days: updatedDays };
      return { ...prev, delivery_preferences: updatedSchedule };
    });
  };

  const handleTimeTypeChange = (value) => {
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

  const handleTimeZoneChange = (e) => {
    const value = e.target.value;
    setSeqData((prev) => {
      const updatedSchedule = [...prev.delivery_preferences];
      updatedSchedule[0] = { ...updatedSchedule[0], timezone: value };
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

  const handleRetrySettingChange = (key, value) => {
    setSeqData((prev) => ({
      ...prev,
      retry_settings: { ...prev.retry_settings, [key]: value },
    }));
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const selectedPref = deliveryPrefs[0];
  const showTimeRange = selectedPref.time_type === "Time Range";
  const allDaysSelected = (selectedPref.days || []).length === 7;
  const weekdaysSelected = ["Mon", "Tue", "Wed", "Thu", "Fri"].every((d) => selectedPref.days?.includes(d)) && selectedPref.days?.length === 5;
  const weekendsSelected = ["Sat", "Sun"].every((d) => selectedPref.days?.includes(d)) && selectedPref.days?.length === 2;

  const triggerOptions = [
    { value: "On Created", label: "On Created", desc: "When a new contact is added" },
    { value: "On Updated", label: "On Updated", desc: "When contact info changes" },
    { value: "On Both (Created & Updated)", label: "Both", desc: "Created or updated" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-gray-900">Trigger & Schedule</h4>
        <p className="text-sm text-gray-600 mt-1">Configure when and how your drip triggers</p>
      </div>

      {/* Trigger Condition */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-teal-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Trigger Condition</h4>
          <Tooltip text="Choose when contacts should enter this sequence" position="right">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {triggerOptions.map((opt) => (
            <label
              key={opt.value}
              className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                seqData.trigger_type === opt.value
                  ? "border-teal-500 bg-teal-50/50"
                  : fieldErrors.trigger_type
                  ? "border-red-300 hover:border-red-400"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="trigger_type"
                value={opt.value}
                checked={seqData.trigger_type === opt.value}
                onChange={(e) => setSeqData({ ...seqData, trigger_type: e.target.value })}
                className="sr-only"
              />
              <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
              <span className="text-xs text-gray-500 mt-1">{opt.desc}</span>
              {seqData.trigger_type === opt.value && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>
        {fieldErrors.trigger_type && (
          <p className="text-xs text-red-500 mt-2">{fieldErrors.trigger_type}</p>
        )}
      </div>

      {/* Delivery Schedule */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Delivery Schedule</h4>
          <Tooltip text="Set which days and times messages can be sent" position="right">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </Tooltip>
        </div>

        {/* Days Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Delivery Days <span className="text-red-500">*</span>
            </label>
            {/* Quick Select Options */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect("weekdays")}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  weekdaysSelected ? "bg-teal-100 text-teal-700" : "text-teal-600 hover:bg-teal-50"
                }`}
              >
                Weekdays
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect("weekends")}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  weekendsSelected ? "bg-teal-100 text-teal-700" : "text-teal-600 hover:bg-teal-50"
                }`}
              >
                Weekends
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleDayClick("All Days")}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                allDaysSelected
                  ? "bg-teal-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Days
            </button>
            {days.map((day) => {
              const isActive = (selectedPref.days || []).includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-teal-500 text-white shadow-sm"
                      : fieldErrors.days
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Visual Calendar Preview */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Weekly Schedule Preview</p>
            <div className="flex gap-1">
              {days.map((day) => {
                const isActive = (selectedPref.days || []).includes(day);
                return (
                  <div
                    key={day}
                    className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-medium ${
                      isActive ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {day.charAt(0)}
                  </div>
                );
              })}
            </div>
          </div>

          {fieldErrors.days ? (
            <p className="text-xs text-red-500 mt-2">{fieldErrors.days}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-2">{selectedPref.days?.length || 0} day(s) selected</p>
          )}
        </div>

        {/* Timezone & Time in a grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Timezone */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-700">Timezone</label>
              <Tooltip text="Messages will be sent based on this timezone" position="top">
                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <select
              value={selectedPref.timezone || ""}
              onChange={handleTimeZoneChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-sm"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Time */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-700">Delivery Time</label>
              <Tooltip text="Choose when during the day messages can be sent" position="top">
                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTimeTypeChange("Any Time")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  selectedPref.time_type === "Any Time"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Any Time
              </button>
              <button
                type="button"
                onClick={() => handleTimeTypeChange("Time Range")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  selectedPref.time_type === "Time Range"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Time Range
              </button>
            </div>
          </div>
        </div>

        {/* Time Range Inputs */}
        {showTimeRange && (
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <ClockTimePicker
                  value={selectedPref.time_from || ""}
                  onChange={(val) => handleTimeChange({ target: { name: "time_from", value: val } })}
                  label="From"
                />
              </div>
              <span className="text-gray-500 text-sm">to</span>
              <div className="flex-1">
                <ClockTimePicker
                  value={selectedPref.time_to || ""}
                  onChange={(val) => handleTimeChange({ target: { name: "time_to", value: val } })}
                  label="To"
                />
              </div>
            </div>
            {fieldErrors.time_range && (
              <p className="text-xs text-red-500 mt-2">{fieldErrors.time_range}</p>
            )}
          </div>
        )}
      </div>

      {/* Advanced Options - Collapsible */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Advanced Options</h4>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <div className="space-y-3 pt-4">
              {/* Allow Once */}
              <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={seqData.delivery_preferences[0]?.allow_once || false}
                  onChange={(e) => {
                    const updated = [...seqData.delivery_preferences];
                    updated[0] = { ...updated[0], allow_once: e.target.checked };
                    setSeqData({ ...seqData, delivery_preferences: updated });
                  }}
                  className="mt-0.5 w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">Allow contacts to enter only once</span>
                    <Tooltip text="If enabled, contacts who have already completed this sequence won't enter again" position="top">
                      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Prevents re-entering if already completed</p>
                </div>
              </label>

              {/* Continue After Delivery */}
              <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={seqData.delivery_preferences[0]?.continue_after_delivery || false}
                  onChange={(e) => {
                    const updated = [...seqData.delivery_preferences];
                    updated[0] = { ...updated[0], continue_after_delivery: e.target.checked };
                    setSeqData({ ...seqData, delivery_preferences: updated });
                  }}
                  className="mt-0.5 w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">Continue only after successful delivery</span>
                    <Tooltip text="The next step will only trigger after the current message is successfully delivered" position="top">
                      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Next step will only trigger after successful delivery</p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Retry Settings */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-orange-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Retry Settings</h4>
          <Tooltip text="Configure how failed messages should be retried" position="right">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Max Attempts */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-700">Max Retry Attempts</label>
              <Tooltip text="Number of times to retry sending a failed message" position="top">
                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <select
              value={seqData.retry_settings?.max_attempts || 3}
              onChange={(e) => handleRetrySettingChange("max_attempts", Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 bg-white text-sm"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? "attempt" : "attempts"}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">How many times to retry failed messages</p>
          </div>

          {/* Retry Delay */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-700">Retry Delay</label>
              <Tooltip text="Time to wait before retrying a failed message" position="top">
                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={seqData.retry_settings?.retry_delay_minutes || 10}
                onChange={(e) => handleRetrySettingChange("retry_delay_minutes", Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 text-sm pr-20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">minutes</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Wait time between retry attempts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriggerConditionStep;
