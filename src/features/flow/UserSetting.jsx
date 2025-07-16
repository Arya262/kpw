import React, { useState, useMemo, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Shield, Star, Crown, Pencil, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Import DeleteConfirmationDialog
import DeleteConfirmationDialog from "../shared/DeleteConfirmationDialog";
import { API_ENDPOINTS } from "../../config/api";

const UserSetting = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isOwner = true; // Always show Add User for demo/testing

  // Define all possible routes for permissions
  const allRoutes = [
    { key: "/login", label: "Login" },
    { key: "/register", label: "Register" },
    { key: "/forgot-password", label: "Forgot Password" },
    { key: "/", label: "Dashboard" },
    { key: "/contact", label: "Contact" },
    { key: "/contact/group", label: "Contact Group" },
    { key: "/templates", label: "Templates" },
    { key: "/templates/explore", label: "Explore Templates" },
    { key: "/chats", label: "Chats" },
    { key: "/broadcast", label: "Broadcast" },
    { key: "/settings", label: "Settings" },
    { key: "/flow", label: "Flow" },
    { key: "/help", label: "Help" },
  ];

  // Local state for permissions
  const [permissions, setPermissions] = useState(user?.allowed_routes || []);

  // State for add user form
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPerms, setNewUserPerms] = useState([]);
  // Add new state for role selection in Add User modal
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserPassword, setNewUserPassword] = useState("");
  // Add state for first and last name for add/edit
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [editUserFirstName, setEditUserFirstName] = useState("");
  const [editUserLastName, setEditUserLastName] = useState("");
  // Add state for mobile_no for add/edit
  const [newUserMobileNo, setNewUserMobileNo] = useState("");
  const [editUserMobileNo, setEditUserMobileNo] = useState("");

  // State for editing user
  const [editUser, setEditUser] = useState(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserRole, setEditUserRole] = useState("user");
  const [editUserPerms, setEditUserPerms] = useState([]);
  // Add state for editUserPassword
  const [editUserPassword, setEditUserPassword] = useState("");

  // Role options for editing
  const roleOptions = [
    { value: "user", label: "User", color: "bg-gray-100 text-gray-700", icon: <User size={14} className="inline mr-1" /> },
    { value: "premium_user", label: "Premium User", color: "bg-green-100 text-green-700", icon: <Star size={14} className="inline mr-1" /> },
    { value: "admin", label: "Admin", color: "bg-purple-100 text-purple-700", icon: <Shield size={14} className="inline mr-1" /> },
    { value: "super_admin", label: "Super Admin", color: "bg-red-100 text-red-700", icon: <Crown size={14} className="inline mr-1" /> },
  ];

  // --- MOCK USERS DATA FOR DEMO ---
  // Remove mockUsers and set initial usersMatrix to []
  const [usersMatrix, setUsersMatrix] = useState([]);

  // Fetch users from backend on mount
  useEffect(() => {
    if (!user?.customer_id) return;
    fetch(API_ENDPOINTS.USERS.GET_SUBUSERS(user.customer_id), { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setUsersMatrix(data.users || []);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setUsersMatrix([]);
      });
  }, [user?.customer_id]);

  const handlePermissionToggle = (permKey) => {
    setPermissions((prev) =>
      prev.includes(permKey)
        ? prev.filter((p) => p !== permKey)
        : [...prev, permKey]
    );
  };

  // Toggle permission for a user in the matrix
  const handleMatrixPermissionToggle = (userId, permKey) => {
    setUsersMatrix((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              allowed_routes: u.allowed_routes.includes(permKey)
                ? u.allowed_routes.filter((p) => p !== permKey)
                : [...u.allowed_routes, permKey],
            }
          : u
      )
    );
  };

  const handleNewUserPermToggle = (permKey) => {
    setNewUserPerms((prev) =>
      prev.includes(permKey)
        ? prev.filter((p) => p !== permKey)
        : [...prev, permKey]
    );
  };

  // Restore permissionGroups for feature-based permissions
  // const permissionGroups = useMemo(() => [
  //   {
  //     label: "Basic Features",
  //     permissions: [
  //       { key: "view_dashboard", label: "View Dashboard" },
  //       { key: "manage_contacts", label: "Manage Contacts" },
  //       { key: "send_messages", label: "Send Messages" },
  //       { key: "view_templates", label: "View Templates" },
  //     ],
  //   },
  //   {
  //     label: "Advanced Features",
  //     permissions: [
  //       { key: "manage_broadcasts", label: "Manage Broadcasts" },
  //       { key: "export_data", label: "Export Data" },
  //       { key: "advanced_analytics", label: "Advanced Analytics" },
  //       { key: "priority_support", label: "Priority Support" },
  //     ],
  //   },
  //   {
  //     label: "Administrative",
  //     permissions: [
  //       { key: "manage_users", label: "Manage Users" },
  //       { key: "view_reports", label: "View Reports" },
  //       { key: "system_settings", label: "System Settings" },
  //       { key: "manage_roles", label: "Manage Roles" },
  //       { key: "system_configuration", label: "System Configuration" },
  //       { key: "security_settings", label: "Security Settings" },
  //       { key: "billing_management", label: "Billing Management" },
  //     ],
  //   },
  // ], []);
  // const allPermissions = useMemo(() => permissionGroups.flatMap(g => g.permissions), [permissionGroups]);

  // Add state for feature-based permissions
  const [newUserFeatures, setNewUserFeatures] = useState([]);
  const [editUserFeatures, setEditUserFeatures] = useState([]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserFirstName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      toast.error("First Name, Email, and Password are required");
      return;
    }
    try {
      console.log({
        name: `${newUserFirstName} ${newUserLastName}`.trim(),
        email: newUserEmail,
        mobile_no: newUserMobileNo || "",
        password: newUserPassword,
        allowed_routes: newUserPerms,
      });
      const res = await fetch(API_ENDPOINTS.USERS.CREATE_SUBUSER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customer_id: user.customer_id, // <-- add this line
          name: `${newUserFirstName} ${newUserLastName}`.trim(),
          email: newUserEmail,
          mobile_no: newUserMobileNo || "",
          password: newUserPassword,
          allowed_routes: newUserPerms,
        }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        console.error('Backend error:', error);
        toast.error(error?.error || 'Failed to add user');
        throw new Error('Failed to add user');
      }
      // Fetch users again
      const usersRes = await fetch(API_ENDPOINTS.USERS.GET_SUBUSERS(user.customer_id), { credentials: 'include' });
      const usersData = await usersRes.json();
      setUsersMatrix(usersData.users || []);
      setShowAddUser(false);
      setNewUserFirstName("");
      setNewUserLastName("");
      setNewUserEmail("");
      setNewUserMobileNo("");
      setNewUserPerms([]);
      setNewUserFeatures([]);
      setNewUserRole('user');
      setNewUserPassword("");
      toast.success("User added successfully!");
    } catch (err) {
      // toast.error already shown above
      console.error(err);
    }
  };

  // Handle role change
  const handleRoleChange = (userId, newRole) => {
    setUsersMatrix((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, role: newRole } : u
      )
    );
  };

  // Open edit modal with user data
  const handleEditUser = (user) => {
    setEditUser(user);
    // Split the name into first and last name
    const [firstName, ...rest] = (user.name || "").split(" ");
    setEditUserFirstName(firstName || "");
    setEditUserLastName(rest.join(" ") || "");
    setEditUserMobileNo(user.mobile_no || "");
    setEditUserRole(user.role);
    setEditUserPerms(user.allowed_routes);
    setEditUserFeatures(user.allowed_features || []);
    setEditUserPassword(""); // Always blank for security
  };

  // Save edited user
  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_ENDPOINTS.USERS.UPDATE_SUBUSER(editUser.user_id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: `${editUserFirstName} ${editUserLastName}`.trim(),
          email: editUser.email,
          mobile_no: editUserMobileNo || "",
          password: editUserPassword, // Always send password (may be empty)
          allowed_routes: editUserPerms,
        }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        toast.error(error?.error || 'Failed to update user');
        throw new Error('Failed to update user');
      }
      // Fetch users again
      const usersRes = await fetch(API_ENDPOINTS.USERS.GET_SUBUSERS(user.customer_id), { credentials: 'include' });
      const usersData = await usersRes.json();
      setUsersMatrix(usersData.users || []);
      setEditUser(null);
      setEditUserFirstName("");
      setEditUserLastName("");
      setEditUserMobileNo("");
      setEditUserRole("user");
      setEditUserPerms([]);
      setEditUserFeatures([]);
      setEditUserPassword("");
      toast.success("User updated successfully!");
    } catch (err) {
      // toast.error already shown above
      console.error(err);
    }
  };

  // Add this function to handle user deletion
  const handleDeleteUser = async (user_id) => {
    setIsDeleting(true);
    try {
      const res = await fetch(API_ENDPOINTS.USERS.DELETE_SUBUSER(user_id), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        toast.error(error?.error || 'Failed to delete user');
        throw new Error('Failed to delete user');
      }
      // Refresh user list
      const usersRes = await fetch(API_ENDPOINTS.USERS.GET_SUBUSERS(user.customer_id), { credentials: 'include' });
      const usersData = await usersRes.json();
      setUsersMatrix(usersData.users || []);
      toast.success("User deleted successfully!");
    } catch (err) {
      // toast.error already shown above
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: Add update logic here
    alert("Settings saved (not functional in demo)");
  };

  // Add these at the top level of the component, after other useState/useRef
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});

  // Add this useEffect at the top level (not inside map)
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (
        openDropdownId !== null &&
        dropdownRefs.current[openDropdownId] &&
        !dropdownRefs.current[openDropdownId].contains(event.target)
      ) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  // Add state for delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      {/* --- PERMISSIONS MATRIX TABLE --- */}
      <div className="mb-8">
        <div className="flex justify-end items-center mb-4">
          {isOwner && (
            <button
              className="px-4 py-2 bg-[#24AEAE] text-white rounded hover:bg-#24AEAE[] transition cursor-pointer"
              onClick={() => setShowAddUser(true)}
              type="button"
            >
              + Add User
            </button>
          )}
        </div>
        {/* Add User Modal */}
        {showAddUser && (
          <div
            className="fixed inset-0 bg-white/40 flex items-center justify-center z-50 transition-all duration-300"
            onClick={e => {
              if (e.target === e.currentTarget) {
                setShowAddUser(false);
                setNewUserName("");
                setNewUserEmail("");
                setNewUserPerms([]);
                setNewUserFeatures([]);
                setNewUserRole('user'); // Reset role
                setNewUserPassword(""); // Reset password
                setNewUserMobileNo(""); // Reset mobile no
              }
            }}
          >
            <div
              className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl text-gray-500 p-6 w-full relative border border-gray-300 animate-slideUp max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowAddUser(false);
                  setNewUserName("");
                  setNewUserEmail("");
                  setNewUserPerms([]);
                  setNewUserFeatures([]);
                  setNewUserRole('user'); 
                  setNewUserPassword(""); 
                  setNewUserMobileNo(""); // Reset mobile no
                }}
                className="absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors bg-gray-100 cursor-pointer"
                aria-label="Close modal"
              >
                ×
              </button>
              <h2 className="text-xl font-semibold mb-4 text-black">Add User</h2>
              <form onSubmit={handleAddUser} className="flex flex-col" autoComplete="off">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">First Name</label>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      value={newUserFirstName}
                      onChange={e => setNewUserFirstName(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-md text-gray-700 h-[38px] focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] transition-all duration-150 ease-in-out"
                      required
                      name="newUserFirstName"
                      autoComplete="off"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Last Name</label>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      value={newUserLastName}
                      onChange={e => setNewUserLastName(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-md text-gray-700 h-[38px] focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] transition-all duration-150 ease-in-out"
                      name="newUserLastName"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={newUserEmail}
                      onChange={e => setNewUserEmail(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-md text-gray-700 h-[38px] focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] transition-all duration-150 ease-in-out"
                      required
                      name="newUserEmail"
                      autoComplete="new-email"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={newUserPassword}
                      onChange={e => setNewUserPassword(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-md text-gray-700 h-[38px] focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] transition-all duration-150 ease-in-out"
                      required
                      name="newUserPassword"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Mobile No</label>
                    <input
                      type="text"
                      placeholder="Enter mobile number"
                      value={newUserMobileNo}
                      onChange={e => setNewUserMobileNo(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-md text-gray-700 h-[38px] focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] transition-all duration-150 ease-in-out"
                      name="newUserMobileNo"
                      autoComplete="off"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Role</label>
                    <select
                      value={newUserRole}
                      onChange={e => setNewUserRole(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-md text-gray-700 h-[38px] focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] transition-all duration-150 ease-in-out bg-white"
                      required
                    >
                      {roleOptions.filter(r => r.value !== 'super_admin').map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Allowed Routes</label>
                  <div className="flex flex-wrap gap-4">
                    {allRoutes.map(route => (
                      <label key={route.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={newUserPerms.includes(route.key)}
                          onChange={() => {
                            setNewUserPerms(prev =>
                              prev.includes(route.key)
                                ? prev.filter(r => r !== route.key)
                                : [...prev, route.key]
                            );
                          }}
                        />
                        {route.label}
                      </label>
                    ))}
                  </div>
                </div>
                {/* <div className="mb-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Allowed Features</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2">
                    {permissionGroups.map((group) => (
                      <div key={group.label} className="mb-2">
                        <div className="font-semibold text-xs text-gray-600 mb-1">{group.label}</div>
                        <div className="flex flex-col gap-1">
                          {group.permissions.map((perm) => (
                            <label key={perm.key} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={newUserFeatures.includes(perm.key)}
                                onChange={() => {
                                  setNewUserFeatures(prev =>
                                    prev.includes(perm.key)
                                      ? prev.filter(f => f !== perm.key)
                                      : [...prev, perm.key]
                                  );
                                }}
                              />
                              {perm.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div> */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0AA89E] text-white rounded-md hover:bg-teal-700 transition font-medium shadow-sm cursor-pointer"
                  >
                    Add User
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition font-medium shadow-sm"
                    onClick={() => {
                      setShowAddUser(false);
                      setNewUserName("");
                      setNewUserEmail("");
                      setNewUserPerms([]);
                      setNewUserFeatures([]);
                      setNewUserRole('user'); // Reset role
                      setNewUserPassword(""); // Reset password
                      setNewUserMobileNo(""); // Reset mobile no
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Edit User Modal */}
        {editUser && (
          <div
            className="fixed inset-0 bg-white/40 flex items-center justify-center z-50 transition-all duration-300"
            onClick={e => {
              if (e.target === e.currentTarget) {
                setEditUser(null);
                setEditUserName("");
                setEditUserRole("user");
                setEditUserPerms([]);
                setEditUserFeatures([]);
                setEditUserMobileNo(""); // Reset mobile no
                setEditUserPassword(""); // Reset password field
              }
            }}
          >
            <div
              className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl text-gray-500 p-6 w-full relative border border-gray-300 animate-slideUp max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setEditUser(null);
                  setEditUserName("");
                  setEditUserRole("user");
                  setEditUserPerms([]);
                  setEditUserFeatures([]);
                  setEditUserMobileNo(""); // Reset mobile no
                  setEditUserPassword(""); // Reset password field
                }}
                className="absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors bg-gray-100 cursor-pointer"
                aria-label="Close modal"
              >
                ×
              </button>
              <h2 className="text-xl font-semibold mb-4 text-black">Edit User</h2>
              <form onSubmit={handleSaveEditUser} className="flex flex-col">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">First Name</label>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      value={editUserFirstName}
                      onChange={e => setEditUserFirstName(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-md text-gray-700 h-[38px] focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] transition-all duration-150 ease-in-out"
                      required
                      name="editUserFirstName"
                      autoComplete="off"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Last Name</label>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      value={editUserLastName}
                      onChange={e => setEditUserLastName(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-md text-gray-700 h-[38px] focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] transition-all duration-150 ease-in-out"
                      name="editUserLastName"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editUser.email}
                      disabled
                      className="w-full border border-gray-200 p-2 rounded-md text-gray-400 h-[38px] bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password (leave blank to keep unchanged)"
                      value={editUserPassword}
                      onChange={e => setEditUserPassword(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-md text-gray-700 h-[38px] focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] transition-all duration-150 ease-in-out"
                      name="editUserPassword"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Mobile No</label>
                    <input
                      type="text"
                      placeholder="Enter mobile number"
                      value={editUserMobileNo}
                      onChange={e => setEditUserMobileNo(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-md text-gray-700 h-[38px] focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] transition-all duration-150 ease-in-out"
                      name="editUserMobileNo"
                      autoComplete="off"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Role</label>
                    <select
                      value={editUserRole}
                      onChange={e => setEditUserRole(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-md text-gray-700 h-[38px] focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] transition-all duration-150 ease-in-out bg-white"
                      required
                    >
                      {roleOptions.filter(r => r.value !== 'super_admin').map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Allowed Routes</label>
                  <div className="flex flex-wrap gap-4">
                    {allRoutes.map(route => (
                      <label key={route.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editUserPerms.includes(route.key)}
                          onChange={() => {
                            setEditUserPerms(prev =>
                              prev.includes(route.key)
                                ? prev.filter(r => r !== route.key)
                                : [...prev, route.key]
                            );
                          }}
                        />
                        {route.label}
                      </label>
                    ))}
                  </div>
                </div>
                {/* <div className="mb-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Allowed Features</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2">
                    {permissionGroups.map((group) => (
                      <div key={group.label} className="mb-2">
                        <div className="font-semibold text-xs text-gray-600 mb-1">{group.label}</div>
                        <div className="flex flex-col gap-1">
                          {group.permissions.map((perm) => (
                            <label key={perm.key} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={editUserFeatures.includes(perm.key)}
                                onChange={() => {
                                  setEditUserFeatures(prev =>
                                    prev.includes(perm.key)
                                      ? prev.filter(f => f !== perm.key)
                                      : [...prev, perm.key]
                                  );
                                }}
                              />
                              {perm.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div> */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition font-medium shadow-sm cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition font-medium shadow-sm"
                    onClick={() => {
                      setEditUser(null);
                      setEditUserName("");
                      setEditUserRole("user");
                      setEditUserPerms([]);
                      setEditUserFeatures([]);
                      setEditUserMobileNo(""); // Reset mobile no
                      setEditUserPassword(""); // Reset password field
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <div className="min-w-[600px] bg-white rounded-2xl shadow-[0px_-0.91px_3.66px_0px_#00000042] overflow-hidden">
            <table className="w-full text-sm text-center overflow-hidden table-auto">
              <thead>
                <tr className="bg-[#F4F4F4] border-b-2 shadow-sm border-gray-300">
                  <th className="px-2 py-3 sm:px-6 text-left text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">User</th>
                  <th className="px-2 py-3 sm:px-6 text-left text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">Role</th>
                  <th className="px-2 py-3 sm:px-6 text-left text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">Permissions</th>
                  <th className="px-2 py-3 sm:px-6 text-left text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
                {Array.isArray(usersMatrix) && usersMatrix.map((u) => (
                  <tr key={u.id} className="border-t border-b border-b-[#C3C3C3] hover:bg-gray-50 text-md">
                    <td className="px-2 py-4 sm:px-4 whitespace-nowrap text-left">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[14px] sm:text-[16px] text-gray-700">{u.first_name} {u.last_name}</span>
                        <span className="text-gray-500 text-xs">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-2 py-4 sm:px-4 text-left">
                      {u.role === 'super_admin' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <Crown size={14} className="inline mr-1" /> Super Admin
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <select
                            value={u.role || 'user'}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            className={
                              `appearance-none px-2 py-1 rounded-full text-xs font-medium border-none focus:ring-2 focus:ring-teal-400 ` +
                              (u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                               u.role === 'premium_user' ? 'bg-green-100 text-green-700' :
                               'bg-gray-100 text-gray-700')
                            }
                            style={{ minWidth: 120 }}
                          >
                            {roleOptions.filter(r => r.value !== 'super_admin').map(opt => (
                              <option key={opt.value} value={opt.value} className={opt.color}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <span className="ml-2">
                            {roleOptions.find(r => r.value === u.role)?.icon}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-4 sm:px-4 text-left relative">
                      <div className="mb-1">
                        <span className="font-semibold text-xs text-gray-600 mr-2">Routes:</span>
                        {(!u.allowed_routes || u.allowed_routes.length === 0) && (
                          <span className="text-gray-400 text-xs">None</span>
                        )}
                        {u.allowed_routes && u.allowed_routes.length > 0 && (
                          <>
                            {u.allowed_routes.slice(0, 3).map((routeKey, idx) => {
                              const route = allRoutes.find(r => r.key === routeKey);
                              return route ? (
                                <span key={route.key} className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1">
                                  {route.label}
                                </span>
                              ) : (
                                <span key={routeKey} className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1">
                                  {routeKey}
                                </span>
                              );
                            })}
                            {u.allowed_routes.length > 3 && (
                              <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1">
                                +{u.allowed_routes.length - 3} more
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-gray-600 mr-2">Features:</span>
                        {(!u.allowed_features || u.allowed_features.length === 0) && (
                          <span className="text-gray-400 text-xs">None</span>
                        )}
                        {u.allowed_features && u.allowed_features.length > 0 && (
                          <>
                            {u.allowed_features.slice(0, 3).map((featureKey, idx) => {
                              const perm = allPermissions.find(p => p.key === featureKey);
                              return perm ? (
                                <span key={perm.key} className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1">
                                  {perm.label}
                                </span>
                              ) : (
                                <span key={featureKey} className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1">
                                  {featureKey}
                                </span>
                              );
                            })}
                            {u.allowed_features.length > 3 && (
                              <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1">
                                +{u.allowed_features.length - 3} more
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-4 sm:px-4 text-left">
                      {u.role !== 'super_admin' && (
                        <>
                          <button
                            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-teal-600 transition cursor-pointer"
                            onClick={() => handleEditUser(u)}
                            aria-label="Edit user"
                            type="button"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition ml-2 cursor-pointer"
                            onClick={() => { setUserToDelete(u); setShowDeleteDialog(true); }}
                            aria-label="Delete user"
                            type="button"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <DeleteConfirmationDialog
        showDialog={showDeleteDialog}
        onCancel={() => { setShowDeleteDialog(false); setUserToDelete(null); }}
        onConfirm={() => userToDelete && handleDeleteUser(userToDelete.user_id)}
        isDeleting={isDeleting}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </>
  );
};

export default UserSetting; 