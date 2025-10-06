
import React from "react";

const ContactsLoader = () => {
  const skeletons = Array.from({ length: 10 });
  return (
    <div className="p-4 space-y-4">
      {skeletons.map((_, index) => (
        <div key={index} className="flex items-center space-x-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-gray-300" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactsLoader; 
