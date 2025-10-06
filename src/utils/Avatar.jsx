import React from "react";
import { getAvatarColor } from "./getAvatarColor";

const Avatar = ({ name = "User", image }) => {
  
  let initials = "U";
  if (name && typeof name === "string") {
    const parts = name.trim().split(/\s+/);
    initials = parts.length === 1
      ? parts[0][0]?.toUpperCase() || "U"
      : (parts[0][0] || "").toUpperCase() + (parts[parts.length - 1][0] || "").toUpperCase();
  }

  const bgColor = getAvatarColor(name);

  if (image) {
    return <img src={image} alt="User Avatar" className="w-10 h-10 rounded-full object-cover mr-4" />;
  }

  return (
    <div
      className="w-10 h-10 rounded-full mr-4 flex items-center justify-center text-white font-semibold"
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
