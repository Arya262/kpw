import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import ContactRow from "./ContactRow";
import AddContact from "./Addcontact";
import vendor from "../../assets/Vector.png";
import { API_ENDPOINTS } from "../../config/api";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  if (hasTime) {
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return (
      <div className="flex flex-col">
        <span>{formattedDate}</span>
        <span>{formattedTime}</span>
      </div>
    );
  }
  return <span>{formattedDate}</span>;
};


const ConfirmationDialog = ({
  showExitDialog,
  hasUnsavedChanges,
  cancelExit,
  confirmExit,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        cancelExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cancelExit]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  if (!showExitDialog) return null;

 return (
    <div
      className="fixed inset-0 bg-opacity-5 flex items-center justify-center z-50 transition-opacity duration-300"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg transform transition-all duration-300 scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        tabIndex="-1"
      >
        <div className="flex items-center gap-3 mb-4">
          <svg
            className="w-6 h-6 text-teal-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h3 id="dialog-title" className="text-lg font-semibold text-gray-800">
            Exit Confirmation
          </h3>
        </div>
        <p id="dialog-message" className="text-gray-600 mb-6">
          {hasUnsavedChanges
            ? "You have unsaved changes. Are you sure you want to exit?"
            : "Are you sure you want to exit?"}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={cancelExit}
            className="px-3 py-2 w-[70px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={confirmExit}
            className="px-3 py-2 w-[70px] bg-teal-500 text-white rounded-md hover:bg-teal-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Confirm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCrossHighlighted, setIsCrossHighlighted] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const popupRef = useRef(null);
  const { user } = useAuth();


 const fetchContacts = async () => {
  try {
    const response = await fetch(`${API_ENDPOINTS.CONTACTS.GET_ALL}?customer_id=${user?.customer_id}`, {
      method: "GET",
      credentials: "include", // 👈 Send cookies with the request
    });

    if (!response.ok) {
      throw new Error("Unauthorized or failed to fetch");
    }

    const data = await response.json();

    const transformed = data.map((item) => ({
      ...item,
      status: item.is_active ? "Opted-in" : "Opted-Out",
      customer_id: item.customer_id,
      date: formatDate(item.created_at),
      number: `${item.country_code || ""} ${item.mobile_no}`,
      fullName: `${item.first_name} ${item.last_name || ""}`.trim(),
    }));

    setContacts(transformed);
    setLoading(false);
  } catch (err) {
    console.error("Failed to fetch contacts:", err);
    setLoading(false);
  }
};

  useEffect(() => {
    fetchContacts();
  }, []);

  const filterCounts = {
    All: contacts.length,
    "Opted-in": contacts.filter((c) => c.status === "Opted-in").length,
    "Opted-Out": contacts.filter((c) => c.status === "Opted-Out").length,
  };

  const filteredContacts = contacts.filter((c) => {
    if (filter === "All") return true;
    return c.status === filter;
  });

  const filterButtons = ["All", "Opted-in", "Opted-Out"];

  // Handle Select All checkbox change
  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    const newSelected = {};
    if (checked) {
      filteredContacts.forEach((_, idx) => {
        newSelected[idx] = true;
      });
    }
    setSelectedRows(newSelected);
  };

  // Handle individual checkbox change
  const handleCheckboxChange = (idx, event) => {
    setSelectedRows((prev) => ({
      ...prev,
      [idx]: event.target.checked,
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setTimeout(() => setIsCrossHighlighted(true), 0);
      } else {
        setIsCrossHighlighted(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  useEffect(() => {
    const total = filteredContacts.length;
    const selected = Object.values(selectedRows).filter(Boolean).length;
    setSelectAll(selected === total && total > 0);
  }, [selectedRows, filteredContacts.length]);

  const handleCloseAndNavigate = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    setIsPopupOpen(false);
    setShowExitDialog(false);
    setIsCrossHighlighted(false);
  };

  const cancelExit = () => {
    setShowExitDialog(false);
    setIsCrossHighlighted(false);
  };

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-xl font-bold">Contacts</h2>
          <div className="flex gap-2 flex-wrap">
            {filterButtons.map((btn) => (
              <button
                key={btn}
                onClick={() => setFilter(btn)}
                className={`px-4 py-2 min-h-[40px] rounded-md text-sm font-medium transition 
                  ${
                    filter === btn
                      ? "bg-[#05a3a3] text-white"
                      : "text-gray-700 hover:text-[#05a3a3]"
                  }`}
              >
                {btn} ({filterCounts[btn]})
              </button>
            ))}
          </div>
        </div>

        {/* <button*/}
        <button
          className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-2 px-4 py-2 rounded cursor-pointer"
          onClick={openPopup}
        >
          <img src={vendor} alt="plus sign" className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px] bg-white rounded-2xl shadow-[0px_-0.91px_3.66px_0px_#00000042] overflow-hidden">
          <table className="w-full text-sm text-center overflow-hidden table-auto">
            <thead className="bg-[#F4F4F4] border-b-2 shadow-sm border-gray-300">
              <tr>
                <th className="px-2 py-3 sm:px-6">
                  <div className="flex items-center justify-center h-full">
                    <input
                      type="checkbox"
                      className="form-checkbox w-4 h-4"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                    />
                  </div>
                </th>
                <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                  Created Date
                </th>
                <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                  Status
                </th>
                <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                  Customer Name
                </th>
                <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                  WhatsApp Number
                </th>
                <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                  24 Hour Status
                </th>
                <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No contacts found.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact, idx) => (
                  <ContactRow
                    key={contact.id || idx}
                    contact={contact}
                    isChecked={!!selectedRows[idx]}
                    onCheckboxChange={(e) => handleCheckboxChange(idx, e)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isPopupOpen && (
        <div
          className="fixed inset-0 bg-white/40 flex items-center justify-center z-50 transition-all duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCrossHighlighted(true);
              setTimeout(() => setIsCrossHighlighted(false), 2000);
            }
          }}
        >
          <div
            ref={popupRef}
            className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative sm:animate-slideUp border ${
              isCrossHighlighted ? "border-teal-500" : "border-gray-300"
            } transition-all duration-300`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseAndNavigate}
              className={`absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors ${
                isCrossHighlighted
                  ? "bg-red-500 text-white hover:text-white"
                  : "bg-gray-100"
              }`}
            >
              ×
            </button>
            <AddContact closePopup={closePopup} />
          </div>
        </div>
      )}
      <ConfirmationDialog
        showExitDialog={showExitDialog}
        hasUnsavedChanges={false}
        cancelExit={cancelExit}
        confirmExit={confirmExit}
      />
    </div>
  );
}