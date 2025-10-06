import React from "react";

const EmptyState = ({ searchTerm }) => (
  <tr>
    <td colSpan="8" className="text-center py-8">
      <div className="text-gray-500">
        {searchTerm ? `No groups match "${searchTerm}"` : "No groups found."}
      </div>
    </td>
  </tr>
);

export default EmptyState;