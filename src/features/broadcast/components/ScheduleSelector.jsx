import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from './CustomDateInput';

const ScheduleSelector = ({ formData, handleRadioChange, selectedDate, setSelectedDate }) => {
  const getMinTime = () => {
    const now = new Date();
    const selected = selectedDate ? new Date(selectedDate) : null;
    
    if (selected && selected.toDateString() === now.toDateString()) {
    
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      
      if (currentMinute > 0) {
        return new Date(0, 0, 0, currentHour + 1, 0);
      }
      
      return new Date(0, 0, 0, currentHour, 0);
    }
   
    return new Date(0, 0, 0, 0, 0);
  };

  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    
   
    if (selectedDate.toDateString() === currentDate.toDateString()) {
  
      const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  
      const selectedMinutes = selectedDate.getHours() * 60 + selectedDate.getMinutes();
      
   
      return selectedMinutes > currentMinutes + 15;
    }
    
    return true;
  };

  const handleScheduleChange = (e) => {
    const value = e.target.value;
    console.log('Schedule changed to:', value);
    console.log('Current selected date:', selectedDate);
    
    handleRadioChange(e);
    

    if (value === "No") {
      console.log('Clearing selected date');
      setSelectedDate(null);
    }
  };

  const handleDateChange = (date) => {
    console.log('New date selected:', date);
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
          <span className="ml-2 text-[#717171]">
            Yes (Schedule for Later)
          </span>
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
          <span className="ml-2 text-[#717171]">
            No (Send Instantly)
          </span>
        </label>
      </div>

      {formData.schedule === "Yes" && (
        <div className="w-full sm:w-1/2 mt-2">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={new Date()}
            minTime={getMinTime()}
            maxTime={new Date(0, 0, 0, 23, 45)}
            filterTime={filterPassedTime}
            className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none"
            customInput={<CustomDateInput />}
            popperClassName="z-50"
            popperPlacement="bottom-start"
            popperModifiers={[
              {
                name: "preventOverflow",
                options: {
                  boundary: "viewport"
                }
              }
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default ScheduleSelector; 