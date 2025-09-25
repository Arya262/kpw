import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "./CustomDateInput";

const ScheduleSelector = ({
  formData,
  handleRadioChange,
  selectedDate,
  setSelectedDate,
}) => {
  // Removed showTimePicker and tempDate states as we'll show both pickers together

  // Get the minimum allowed time for today
  const getMinTime = () => {
    const now = new Date();
    if (selectedDate && selectedDate.toDateString() === now.toDateString()) {
      return now; // allow changing freely after selection
    }
    const min = new Date();
    min.setHours(0, 0, 0, 0);
    return min;
  };
  
  // Only block past times (not past + 15 min)
  const filterPassedTime = (time) => {
    const now = new Date();
    return time.getTime() > now.getTime();
  };

  // Handle Yes/No change
  const handleScheduleChange = (e) => {
    const value = e.target.value;
    handleRadioChange(e);
    if (value === "No") {
      setSelectedDate(null);
      setShowTimePicker(false);
      setTempDate(null);
    }
  };

  // Handle date and time change
  const handleDateTimeChange = (date) => {
    const now = new Date();
    
    // If selected date is today, ensure time is in the future
    if (date.toDateString() === now.toDateString()) {
      // If the selected time is in the past, set it to now + 10 minutes
      if (date < now) {
        const minutes = Math.ceil(now.getMinutes() / 10) * 10;
        const rounded = new Date(now);
        rounded.setMinutes(minutes, 0, 0);
        date = new Date(rounded);
      }
    }
    
    setSelectedDate(date);
  };

  return (
    <div className="w-full">
      <label className="block text-sm mb-1 font-semibold text-black">
        Schedule Campaign
      </label>

      {/* Radio Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="schedule"
            value="Yes"
            checked={formData.schedule === "Yes"}
            onChange={handleScheduleChange}
            className="text-[#0AA89E]"
            style={{ accentColor: "#0AA89E" }}
            required
          />
          <span className="ml-2 text-[#717171]">Yes (Schedule for Later)</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="schedule"
            value="No"
            checked={formData.schedule === "No"}
            onChange={handleScheduleChange}
            className="text-[#0AA89E]"
            style={{ accentColor: "#0AA89E" }}
            required
          />
          <span className="ml-2 text-[#717171]">No (Send Instantly)</span>
        </label>
      </div>

      {/* Date and Time Selection */}
      {formData.schedule === "Yes" && (
        <div className="w-full sm:w-1/2 mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date and Time
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateTimeChange}
              showTimeSelect
              timeIntervals={10}
              timeFormat="h:mm aa"
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              minTime={selectedDate?.toDateString() === new Date().toDateString() ? new Date() : new Date().setHours(0, 0, 0, 0)}
              maxTime={new Date().setHours(23, 45)}
              filterTime={filterPassedTime}
              customInput={<CustomDateInput />}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none"
              popperClassName="custom-datepicker-popper z-[60]"
              popperPlacement="bottom-start"
              popperModifiers={[
                {
                  name: "preventOverflow",
                  options: { 
                    boundary: "viewport",
                    altBoundary: true,
                    padding: 8
                  },
                },
                {
                  name: "flip",
                  options: {
                    fallbackPlacements: ["top-start", "bottom-end", "top-end", "bottom-start"]
                  }
                },
                {
                  name: "offset",
                  options: {
                    offset: [0, 8]
                  }
                }
              ]}
              portalId="datepicker-portal"
            />
          </div>

          {/* Show selected date and time */}
          {selectedDate && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <p className="text-sm text-teal-800">
                <span className="font-medium">Scheduled for:</span> {selectedDate.toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleSelector;
