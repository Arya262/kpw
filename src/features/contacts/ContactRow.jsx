import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import OptionsDropdown from "../shared/OptionsDropdown";

export default function ContactRow({
  contact,
  isChecked, // parent decides if this row is checked
  onCheckboxChange,
  onEditClick,
  onDeleteClick,
}) {
  const rowRef = useRef(null);
  const navigate = useNavigate();

  const handleChat = () => {
    const contactForChat = {
      id: contact.customer_id,
      contact_id: contact.contact_id || contact.id,
      conversation_id: null,
      name: contact.fullName,
      mobile_no: contact.number,
      updated_at: new Date().toISOString(),
      image: null,
      active: contact.is_active === 1,
      lastMessage: null,
      lastMessageType: null,
      lastMessageTime: contact.updated_at,
      isWithin24Hours: contact.is_within_24h,
      isNewChat: true,
    };

    navigate("/chats", {
      state: { contact: contactForChat },
    });
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onCheckboxChange(contact.contact_id, e.target.checked);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDeleteClick(contact);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEditClick(contact);
  };

  return (
    <tr
      ref={rowRef}
      className="border-t border-b border-b-[#C3C3C3] hover:bg-gray-50 text-md"
    >
      <td className="px-2 py-4 sm:px-4">
        <div className="flex items-center justify-center h-full">
          <input
            type="checkbox"
            className="form-checkbox w-4 h-4"
            checked={isChecked || false}
            onChange={handleCheckboxChange}
          />
        </div>
      </td>
      <td className="px-2 py-4 sm:px-4 sm:py-4 whitespace-nowrap text-[12px] sm:text-[16px] text-gray-700 font-medium">
        {contact.date}
      </td>
      <td className="px-2 py-4 text-[12px] sm:text-[16px] text-green-600 font-medium">
        {contact.status}
      </td>
      <td
        onClick={handleChat}
        className="px-2 py-4 text-[12px] sm:text-[16px] text-gray-700 cursor-pointer hover:text-[#0AA89E] font-medium max-w-[180px] truncate"
        title={contact.fullName}
      >
        {contact.fullName}
      </td>
      <td className="px-2 py-4 text-[12px] sm:text-[16px] text-gray-700 font-medium">
        {contact.user_country_code}
        {contact.number}
      </td>
      <td className="px-2 py-4 text-[12px] sm:text-[16px]">
        <span
          className={`inline-block px-3 py-1 rounded-full text-white text-sm  min-w-[80px] text-center font-medium
            ${contact.is_active === 1 ? "bg-green-500" : "bg-red-400"}`}
        >
          {contact.is_active === 1 ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="relative py-4">
        <div className="flex justify-center">
          <button
            onClick={handleChat}
            className="flex items-center gap-2 bg-[#0AA89E] hover:bg-[#0AA89E] text-white px-3 py-2 rounded-full whitespace-nowrap mr-2 cursor-pointer font-medium"
            aria-label={`Send message to ${contact.fullName}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 transform rotate-45"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-medium">Send Message</span>
          </button>

          <OptionsDropdown onEdit={handleEditClick} onDelete={handleDeleteClick} />
        </div>
      </td>
    </tr>
  );
}
