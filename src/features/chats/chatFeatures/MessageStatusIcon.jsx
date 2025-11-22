import { Check, CheckCheck } from "lucide-react";

const MessageStatusIcon = ({ status }) => {
  if (!status) return null;

  let Icon = Check;
  let iconColor = "text-gray-400";
  let title = "Sent";

  if (status === "read") {
    Icon = CheckCheck;
    iconColor = "text-blue-500";
    title = "Read";
  } else if (status === "delivered") {
    Icon = CheckCheck;
    iconColor = "text-gray-400";
    title = "Delivered";
  }

  return (
    <span
      className={`ml-1 leading-none transition-colors duration-300 ease-in-out ${iconColor}`}
      title={title}
    >
      <Icon size={12} />
    </span>
  );
};

export default MessageStatusIcon;
