import React from 'react';
import { BsCalendar3 } from 'react-icons/bs';

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div
    className="flex items-center w-full border border-gray-300 rounded-md p-2 text-gray-700 cursor-pointer"
    onClick={onClick} 
  >
    <input
      type="text"
      readOnly
      value={value}
      ref={ref}
      className="w-full bg-transparent outline-none cursor-pointer text-base sm:text-lg"
      placeholder="Select date & time"
    />
    <BsCalendar3
      className="w-6 h-6 text-[#0AA89E] flex-shrink-0 cursor-pointer"
    />
  </div>
));

export default CustomDateInput;
