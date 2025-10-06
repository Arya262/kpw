import React from "react";
import { Users, Edit2, Trash2, UserCheck } from "lucide-react";

const GroupCard = ({ group, onEdit, onDelete, onViewContacts }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {group.name}
            </h3>
            <p className="text-sm text-gray-500">
              {group.contact_count || 0} contacts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewContacts(group)}
            className="p-2 text-teal-600 hover:bg-teal-50 rounded-full"
            title="View contacts"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(group)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            title="Edit group"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(group)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            title="Delete group"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {group.description && (
        <p className="text-sm text-gray-600 mb-4">{group.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Created: {new Date(group.created_at).toLocaleDateString()}</span>
        {group.updated_at && (
          <span>
            Updated: {new Date(group.updated_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default GroupCard;