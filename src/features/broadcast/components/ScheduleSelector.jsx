import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "./CustomDateInput";
import PlansModal from "../../dashboard/PlansModal";

const ScheduleSelector = ({
  formData,
  handleRadioChange,
  selectedDate,
  setSelectedDate,
  userPlan = '',
}) => {
  const [showPlansModal, setShowPlansModal] = useState(false);
  
  // Check if user is on Pro plan
  const isProUser = userPlan === 'Pro' || userPlan === 'pro';
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

  // Only block past times
  const filterPassedTime = (time) => {
    const now = new Date();
    return time.getTime() > now.getTime();
  };

  // Handle Yes/No change
  const handleScheduleChange = (e) => {
    const value = e.target.value;
    
    if (value === "Yes" && !isProUser) {
      e.preventDefault();
      setShowPlansModal(true);
      return;
    }
    
    handleRadioChange(e);
    if (value === "No") setSelectedDate(null);
  };

  // Handle date change
  const handleDateChange = (date) => {
    const now = new Date();
  
    if (date.toDateString() === now.toDateString() && date < now) {
      const minutes = Math.floor(now.getMinutes() / 10) * 10 + 10;
      const rounded = new Date(now);
      rounded.setMinutes(minutes, 0, 0);
  
      const endOfDay = new Date();
      endOfDay.setHours(23, 45, 0, 0);
  
      date.setHours(
        Math.min(rounded.getHours(), endOfDay.getHours()),
        Math.min(rounded.getMinutes(), endOfDay.getMinutes()),
        0,
        0
      );
    }
    setSelectedDate(date);
  };
  
  return (
    <div className="w-full">
      <label className="block text-sm mb-1 font-semibold text-black">
        Schedule Campaign
      </label>
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
            maxTime={new Date(new Date().setHours(23, 45))} 
            filterTime={filterPassedTime}
            className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none"
            popperClassName="custom-datepicker-popper"
            popperPlacement="bottom-start"
          />
        </div>
      )}
      <PlansModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        userPlan={userPlan}
      />
    </div>
  );
};


export default ScheduleSelector;
