import React from "react";
import { PERMISSION_TEMPLATES } from "../../../constants/permissionTemplates";

const PermissionSelection = ({ permissions, onUpdatePermission, onSelectTemplate }) => {
  // Debug: Log permissions being received
  React.useEffect(() => {
    console.log('PermissionSelection received permissions:', permissions);
  }, [permissions]);

  const modules = [
    {
      key: "contacts",
      label: "Contacts",
      actions: [
        { key: "view", label: "View" },
        { key: "add", label: "Add" },
        { key: "edit", label: "Edit" },
        { key: "delete", label: "Delete" },
        { key: "export", label: "Export" },
      ],
    },
    {
      key: "broadcasts",
      label: "Broadcasts",
      actions: [
        { key: "view", label: "View" },
        { key: "create", label: "Create" },
        { key: "edit", label: "Edit" },
        { key: "delete", label: "Delete" },
      ],
    },
    {
      key: "templates",
      label: "Templates",
      actions: [
        { key: "view", label: "View" },
        { key: "create", label: "Create" },
        { key: "edit", label: "Edit" },
        { key: "delete", label: "Delete" },
      ],
    },
    {
      key: "chats",
      label: "Chats",
      actions: [
        { key: "view", label: "View" },
        { key: "send", label: "Send Messages" },
        { key: "delete", label: "Delete" },
      ],
    },
    {
      key: "analytics",
      label: "Analytics",
      actions: [
        { key: "view", label: "View" },
        { key: "export", label: "Export" },
      ],
    },
    {
      key: "settings",
      label: "Settings",
      actions: [
        { key: "view", label: "View" },
        { key: "edit", label: "Edit" },
      ],
    },
    {
      key: "users",
      label: "Users",
      actions: [
        { key: "view", label: "View" },
        { key: "manage", label: "Manage" },
      ],
    },
  ];

  const handleTemplateSelect = (templateName) => {
    if (templateName && PERMISSION_TEMPLATES[templateName]) {
      onSelectTemplate(PERMISSION_TEMPLATES[templateName]);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Permissions
        </label>
        <div className="flex gap-2">
          <span className="text-xs text-gray-500">Quick Templates:</span>
          <select
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#05A3A3]"
            defaultValue=""
          >
            <option value="">Select Template</option>
            <option value="manager">Manager</option>
            <option value="agent">Agent</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-4">
          {modules.map((module) => (
            <div key={module.key} className="border-b border-gray-100 pb-3 last:border-b-0">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                {module.label}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {module.actions.map((action) => {
                  // Check if permission is explicitly true (not just truthy)
                  const isChecked = Boolean(
                    permissions?.[module.key]?.[action.key] === true
                  );
                  return (
                    <label
                      key={action.key}
                      className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          onUpdatePermission(
                            module.key,
                            action.key,
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-[#05A3A3] border-gray-300 rounded focus:ring-[#05A3A3]"
                      />
                      <span className="text-gray-600">{action.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PermissionSelection;

