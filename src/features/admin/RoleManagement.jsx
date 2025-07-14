import React, { useState } from "react";
import { 
  Shield, 
  UserPlus, 
  Edit, 
  Trash2, 
  CheckSquare,
  Square,
  Users
} from "lucide-react";
import { toast } from "react-toastify";

const RoleManagement = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "User",
      value: "user",
      description: "Can view and manage contacts.",
      permissions: ["manage_contacts"],
      userCount: 850,
      color: "bg-blue-100 text-blue-800"
    },
    {
      id: 2,
      name: "Premium User",
      value: "premium_user",
      description: "Can view and manage contacts (premium).",
      permissions: ["manage_contacts"],
      userCount: 320,
      color: "bg-green-100 text-green-800"
    },
    {
      id: 3,
      name: "Admin",
      value: "admin",
      description: "Administrative access to all contact management.",
      permissions: ["manage_contacts"],
      userCount: 15,
      color: "bg-purple-100 text-purple-800"
    },
    {
      id: 4,
      name: "Super Admin",
      value: "super_admin",
      description: "Full system access to contact management.",
      permissions: ["manage_contacts"],
      userCount: 3,
      color: "bg-red-100 text-red-800"
    }
  ]);

  const [editingRole, setEditingRole] = useState(null);
  const [showAddRole, setShowAddRole] = useState(false);

  const allPermissions = [
    { key: "manage_contacts", label: "Manage Contacts", icon: <Users size={16} /> }
  ];

  const handlePermissionToggle = (roleId, permission) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const hasPermission = role.permissions.includes(permission);
        const newPermissions = hasPermission
          ? role.permissions.filter(p => p !== permission)
          : [...role.permissions, permission];
        return { ...role, permissions: newPermissions };
      }
      return role;
    }));
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      setRoles(prev => prev.filter(role => role.id !== roleId));
      toast.success("Role deleted successfully");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">Configure user roles for contact management</p>
        </div>
        <button
          onClick={() => setShowAddRole(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <UserPlus size={20} />
          <span>Add Role</span>
        </button>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Role Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${role.color}`}>
                    {role.name}
                  </div>
                  <span className="text-sm text-gray-500">{role.userCount} users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingRole(role)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <Edit size={16} />
                  </button>
                  {role.value !== "user" && (
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{role.description}</p>
            </div>

            {/* Permissions */}
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Permissions</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePermissionToggle(role.id, "manage_contacts")}
                  className={`p-1 rounded ${
                    role.permissions.includes("manage_contacts")
                      ? "text-green-600 hover:text-green-700"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {role.permissions.includes("manage_contacts") ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <span className="text-sm text-gray-700">Manage Contacts</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Permission</h3>
        <div className="text-sm text-gray-600">• Manage Contacts: Add, edit, delete, and view contacts.</div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">
                {roles.reduce((sum, role) => sum + role.userCount, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Roles with Contact Management</p>
              <p className="text-2xl font-bold text-green-600">
                {roles.filter(role => role.permissions.includes("manage_contacts")).length}
              </p>
            </div>
            <CheckSquare className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement; 