import React, { useState, useEffect } from "react";
import { formatTime } from "../../utils/time";
import Avatar from "../../utils/Avatar";
import Dropdown from "../../components/Dropdown";
import { FiUserX, FiUserCheck } from "react-icons/fi";

const UserDetails = ({ isExpanded, setIsExpanded, selectedContact, updateBlockStatus }) => {
  const [status, setStatus] = useState("");
  const [tag, setTag] = useState("");
  const [incomingStatus, setIncomingStatus] = useState("");
  const [isBlocked, setIsBlocked] = useState(selectedContact?.block || false);
  const [isUpdating, setIsUpdating] = useState(false);
    useEffect(() => {
    setIsBlocked(selectedContact?.block || false);
  }, [selectedContact]);
  if (!selectedContact) return null;
  if (!selectedContact) return null;

  const isActive =
    selectedContact.updated_at &&
    Date.now() - new Date(selectedContact.updated_at).getTime() <
      24 * 60 * 60 * 1000;

  return (
    <div className="w-full md:w-auto md:min-w-[300px] bg-white border-l border-gray-300 p-0">
      <div className="user-details h-full">
        {/* Profile Info */}
        <div className="profile mt-3 text-center">
          <div className="avatar mb-2 flex justify-center">
            <Avatar
              name={selectedContact?.name}
              image={selectedContact?.image}
            />
          </div>
          <h3 className="font-semibold text-lg break-all text-center px-2 max-w-[280px] mx-auto">
            {selectedContact.name || "Unnamed"}
          </h3>
          <p className="text-sm text-gray-600">
            {selectedContact?.country_code
              ? `${selectedContact.country_code.startsWith("+") ? "" : "+"}${
                  selectedContact.country_code
                } `
              : ""}
            {selectedContact?.mobile_no || "No number"}
          </p>
          <p className="opted-in text-green-600 text-sm">Opted-in</p>
          <button
            onClick={async () => {
              if (isUpdating) return;
              setIsUpdating(true);
              const newBlockedState = !isBlocked;
              const success = await updateBlockStatus(
                selectedContact.contact_id,
                newBlockedState
              );
              if (success) {
                setIsBlocked(newBlockedState);
              }
              setIsUpdating(false);
            }}
            disabled={isUpdating}
            className={`flex items-center justify-center mx-auto px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isBlocked
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            } ${isUpdating ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isUpdating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isBlocked ? "Unblocking..." : "Blocking..."}
              </>
            ) : isBlocked ? (
              <>
                <FiUserCheck className="mr-2" />
                Unblock User
              </>
            ) : (
              <>
                <FiUserX className="mr-2" />
                Block User
              </>
            )}
          </button>
        </div>

        <hr className="my-4 border-t-2 border-gray-300" />

        {/* Last Message */}
        <div className="flex justify-between items-center p-2">
          <p className="text-sm font-bold text-black">Last Message</p>
          <p className="text-sm text-black">
            {selectedContact.updated_at
              ? formatTime(selectedContact.updated_at)
              : "No activity"}
          </p>
        </div>

        {/* 24 Hours Status */}
        <div className="flex justify-between items-center px-2 mb-3">
          <p className="text-sm font-bold text-black">24 Hours Status</p>
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              isActive ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Toggle for General Details */}
        <div
          className="details-toggle cursor-pointer flex items-center justify-between px-2 py-2 text-gray-600 hover:text-black"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span className="text-sm font-semibold tracking-wide">
            GENERAL DETAILS
          </span>
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* General Details Section */}
        {isExpanded && (
          <div className="space-y-3 p-2">
            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Status
              </label>
              <Dropdown
                options={[
                  { value: "open", label: "Open" },
                  { value: "closed", label: "Closed" },
                ]}
                value={status}
                onChange={setStatus}
                placeholder="Select Status"
              />
            </div>

            {/* Tags Dropdown */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Tags
              </label>
              <Dropdown
                options={[{ value: "add-tags", label: "+ Add Tags" }]}
                value={tag}
                onChange={setTag}
                placeholder="Tags"
              />
            </div>

            {/* Incoming Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Incoming Status
              </label>
              <Dropdown
                options={[{ value: "allowed", label: "Allowed" }]}
                value={incomingStatus}
                onChange={setIncomingStatus}
                placeholder="Incoming Status"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
