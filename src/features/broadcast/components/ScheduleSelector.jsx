import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "./CustomDateInput";

const ScheduleSelector = ({
  formData,
  handleRadioChange,
  selectedDate,
  setSelectedDate,
}) => {
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
    if (value === "No") setSelectedDate(null);
  };

  // Handle date change
  const handleDateChange = (date) => {
    const now = new Date();
  
    if (date.toDateString() === now.toDateString()) {
      // Snap directly to next 10-min interval from NOW
      const minutes = Math.ceil(now.getMinutes() / 10) * 10;
      const rounded = new Date(now);
      rounded.setMinutes(minutes, 0, 0);
  
      date.setHours(rounded.getHours(), rounded.getMinutes(), 0, 0);
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

      {/* Date Picker */}
      {formData.schedule === "Yes" && (
        <div className="w-full sm:w-1/2 mt-2">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={10}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={new Date()}
            minTime={new Date(getMinTime())}
            maxTime={new Date().setHours(23, 45)}
            filterTime={filterPassedTime}
            customInput={<CustomDateInput />}
            className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none"
            popperClassName="custom-datepicker-popper"
            popperPlacement="bottom"
            popperModifiers={[
              {
                name: "preventOverflow",
                options: { boundary: "viewport" },
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default ScheduleSelector;
