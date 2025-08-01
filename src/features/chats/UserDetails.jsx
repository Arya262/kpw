import { formatTime } from "../../utils/time";

// HSL-based dynamic avatar color generator
const getAvatarColor = (name = "User") => {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const UserDetails = ({ isExpanded, setIsExpanded, selectedContact }) => {
  console.log("Selected Contact:", selectedContact);
  if (!selectedContact) return null;

const renderAvatar = (contact) => {
  const name = contact?.name || "User";
  const parts = name.trim().split(/\s+/);
  let initials = "U";

  if (parts.length === 1) {
    initials = parts[0][0]?.toUpperCase() || "U";
  } else if (parts.length > 1) {
    initials =
      (parts[0][0]?.toUpperCase() || "") +
      (parts[parts.length - 1][0]?.toUpperCase() || "");
  }

  const bgColor = getAvatarColor(name);

  if (contact.image) {
    return (
      <img
        src={contact.image}
        alt="User Avatar"
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div
      className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold text-2xl"
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
};

  return (
    <div className="w-full md:w-auto md:min-w-[300px] bg-white border-l border-gray-300 p-0">
      <div className="user-details h-full">
        {/* Profile Info */}
        <div className="profile mt-3 text-center">
          <div className="avatar mx-auto mb-2 w-16 h-16 rounded-full overflow-hidden">
            {renderAvatar(selectedContact)}
          </div>
          <h3 className="font-semibold text-lg">
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
        </div>

        <hr className="my-4" />

        {/* Last Message */}
        <div className="flex justify-between items-center p-2">
          <p className="text-sm font-bold text-black">Last Message</p>
          <p className="text-sm text-black">
            {formatTime(selectedContact.updated_at)}
          </p>
        </div>

        {/* 24 Hours Status */}
        <div className="flex justify-between items-center px-2 mb-3">
          <p className="text-sm font-bold text-black">24 Hours Status</p>
          <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full">
            Inactive
          </span>
        </div>

        {/* Toggle for General Details */}
        <div
          className="details-toggle cursor-pointer flex items-center justify-between px-2 py-2 text-gray-600 hover:text-black"
          onClick={() => setIsExpanded(!isExpanded)}
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
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Status
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm">
                <option>Open</option>
                <option>Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Tags
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-500">
                <option>+ Add Tags</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Incoming Status
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm">
                <option>Allowed</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
