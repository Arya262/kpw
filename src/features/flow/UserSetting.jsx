import React, { useState, useMemo, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ROLE_PERMISSIONS } from "../../context/permissions";
import { User, Shield, Star, Crown, Pencil, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactDOM from "react-dom";
import PlansModal from "../dashboard/PlansModal";
import ClickToUpgrade from "../../components/ClickToUpgrade";
import { usePlanPermissions } from "../../hooks/usePlanPermissions";
// Import new components and hooks
import DeleteConfirmationDialog from "../shared/DeleteConfirmationDialog";
import UserFormModal from "./components/UserFormModal";
import { useUserManagement } from "./hooks/useUserManagement";
import { useFormState } from "./hooks/useFormState";
import vendor from "../../assets/Vector.png";
// PopoverPortal component for rendering popover in a portal
function PopoverPortal({ anchorRect, children, onClose, position = "bottom" }) {
  const popoverRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!anchorRect) return null;
  const style = {
    position: "absolute",
    left: anchorRect.left,
    top: position === "bottom" ? anchorRect.bottom + 6 : anchorRect.top - 206, 
    zIndex: 9999,
    minWidth: 180,
    maxWidth: 320,
    maxHeight: 200,
    background: "white",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    padding: 8,
    overflowY: "auto",
    textAlign: "left",
    animation: "fadeIn 0.2s",
  };
  return ReactDOM.createPortal(
    <div ref={popoverRef} style={style}>
      {children}
    </div>,
    document.body
  );
}

const UserSetting = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user?.role) return {};

    if (user.role === "main") {
      return ROLE_PERMISSIONS.main;
    }

    if (user.role === "subuser") {
      return ROLE_PERMISSIONS.sub_user;
    }

    return {};
  }, [user?.role]);

  // Use custom hooks
  const {
    usersMatrix = [],
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
  } = useUserManagement(user);

  const { checkPermission, requireUpgrade } = usePlanPermissions(usersMatrix);
  const addUserForm = useFormState();
  const editUserForm = useFormState();

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
    // { key: "/flow", label: "Flow" },
    { key: "/help", label: "Help" },
  ];

const roleOptions = [
  {
    value: "subuser",
    label: "Sub User",
    color: "bg-yellow-100 text-yellow-700",
    icon: <User size={14} className="inline mr-1" />,
  },
];

  // Modal states
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Popover states
  const [openPopover, setOpenPopover] = useState({ userId: null, type: null });
  const popoverRefs = useRef({});
  const [popoverPosition, setPopoverPosition] = useState("bottom");
  const [popoverAnchorRect, setPopoverAnchorRect] = useState(null);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [actionRequiringPlan, setActionRequiringPlan] = useState(null);
  const checkPlanBeforeAction = (action) => {
    // Check if plan is null, undefined, or the string 'null'
    if (!user?.plan || user?.plan === 'null') {
      setActionRequiringPlan(action);
      setShowPlansModal(true);
      return false;
    }
    return true;
  };

  const handleActionRequiringPlan = (action) => {
    if (!user?.plan) {
      setShowPlansModal(true);
      setActionRequiringPlan(action);
      return false;
    }
    return true;
  };

  // Handle add user
  const handleAddUser = async () => {
    if (!permissions.canManageUsers) {
      toast.error("You do not have permission to add users.");
      return;
    }

    if (
      !addUserForm.formData.firstName.trim() ||
      !addUserForm.formData.email.trim() ||
      !addUserForm.formData.password.trim()
    ) {
      toast.error("First Name, Email, and Password are required");
      return;
    }

    const result = await createUser(addUserForm.getApiPayload());
    if (result.success) {
      toast.success(result.message);
      addUserForm.resetForm();
      setShowAddUser(false);
    } else {
      toast.error(result.message);
    }
  };

  // Handle edit user
  const handleEditUser = (userData) => {
    setEditUser(userData);
    editUserForm.loadUserData(userData);
  };

  const handleSaveEditUser = async () => {
    if (!permissions.canManageUsers) {
      toast.error("You do not have permission to edit users.");
      return;
    }

    const result = await updateUser(
      editUser.user_id,
      editUserForm.getApiPayload()
    );
    if (result.success) {
      toast.success(result.message);
      editUserForm.resetForm();
      setEditUser(null);
    } else {
      toast.error(result.message);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!permissions.canManageUsers) {
      toast.error("You do not have permission to delete users.");
      return;
    }

    setIsDeleting(true);
    const result = await deleteUser(userId);
    if (result.success) {
      toast.success(result.message);
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } else {
      toast.error(result.message);
    }
    setIsDeleting(false);
  };

  // Handle role change
  const handleRoleChange = (userId, newRole) => {
    updateUserRole(userId, newRole);
  };

  // Popover positioning effect
  useEffect(() => {
    if (openPopover.userId && openPopover.type) {
      const badgeEl =
        popoverRefs.current[`${openPopover.userId}_${openPopover.type}`];
      if (badgeEl) {
        const rect = badgeEl.getBoundingClientRect();
        const popoverHeight = 200;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < popoverHeight && spaceAbove > popoverHeight) {
          setPopoverPosition("top");
        } else {
          setPopoverPosition("bottom");
        }
      }
    }
  }, [openPopover]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="pt-2.5">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-xl font-bold">Users</h2>
            {/* You can add filter buttons here if needed */}
          </div>
          <div >
             <ClickToUpgrade 
              permission="canAddSubUser"
              usersMatrix={usersMatrix}
            >
            <button
                className="bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl  transition-all cursor-pointer"
                  onClick={() => {
                    if (checkPermission('canAddSubUser') && permissions.canManageUsers) {
                      setShowAddUser(true);
                    } else {
                      toast.error("You do not have permission to add users.");
                    }
                  }}
                  type="button">
              <img src={vendor} alt="plus sign" className="w-5 h-5" />
              Add User
            </button>
            </ClickToUpgrade>
          </div>
        </div>
        {/* Add User Modal */}
        <UserFormModal
          isOpen={showAddUser}
          onClose={() => {
            setShowAddUser(false);
            addUserForm.resetForm();
          }}
          onSubmit={handleAddUser}
          formData={addUserForm.formData}
          onUpdateField={addUserForm.updateField}
          onToggleRoute={addUserForm.toggleRoute}
          roleOptions={roleOptions}
          allRoutes={allRoutes}
          isEdit={false}
          title="Add User"
          isLoading={isLoading}
        />
        {/* Edit User Modal */}
        <UserFormModal
          isOpen={!!editUser && permissions.canManageUsers}
          onClose={() => {
            setEditUser(null);
            editUserForm.resetForm();
          }}
          onSubmit={handleSaveEditUser}
          formData={editUserForm.formData}
          onUpdateField={editUserForm.updateField}
          onToggleRoute={editUserForm.toggleRoute}
          roleOptions={roleOptions}
          allRoutes={allRoutes}
          isEdit={true}
          title="Edit User"
          isLoading={isLoading}
        />
        <div className="overflow-x-auto">
          <div className="min-w-[900px] bg-white rounded-2xl shadow-[0px_-0.91px_3.66px_0px_#00000042] overflow-hidden">
            <table className="w-full text-sm text-center overflow-hidden table-auto">
              <thead className="bg-[#F4F4F4] border-b-2 shadow-sm border-gray-300">
                <tr>
                  <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    User
                  </th>
                  <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Role
                  </th>
                  <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Permissions
                  </th>
                  <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
                {Array.isArray(usersMatrix) && usersMatrix.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
                {Array.isArray(usersMatrix) &&
                  usersMatrix.map((u, idx) => (
                    <tr
                      key={u.id || u.user_id || idx}
                      className="border-t border-b border-b-[#C3C3C3] hover:bg-gray-50 text-md"
                    >
                      <td className="px-2 py-4 sm:px-4 sm:py-4 whitespace-nowrap text-[12px] sm:text-[16px] text-gray-700 text-center">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[12px] sm:text-[16px] text-gray-700">
                            {u.first_name} {u.last_name}
                          </span>
                          <span className="text-[12px] sm:text-[16px] text-gray-500">
                            {u.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-4 sm:px-4 text-[12px] sm:text-[16px] text-gray-700 text-center">
                        {u.role === "owner" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[12px] sm:text-[16px] font-medium bg-blue-100 text-blue-700">
                            <Crown size={14} className="inline mr-1" /> Owner
                          </span>
                        ) : (
                          <div className="inline-flex items-center text-center gap-2">
                            <select
                              value={u.role || "subuser"}
                              onChange={(e) =>
                                handleRoleChange(u.id, e.target.value)
                              }
                              className={`appearance-none pr-8 pl-3 py-1 rounded-full text-xs font-medium border-none 
                              focus:outline-none focus:ring-2 focus:ring-teal-400
                              flex items-center justify-center text-center leading-tight
                              ${
                                u.role === "subuser"
                                  ? "bg-yellow-100 text-yellow-700" 
                                  : "bg-gray-100 text-gray-700"
                              }`}
                              style={{ minWidth: 120 }}
                            >
                              {roleOptions
                                .filter(
                                  (r) =>
                                   r.value !== "main"
                                )
                                .map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                            </select>
                            <span className="ml-2">
                              {
                                roleOptions.find((r) => r.value === u.role)
                                  ?.icon
                              }
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-4 sm:px-4 text-[12px] sm:text-[16px] text-gray-700 text-center relative">
                        <div className="mb-1">
                          <span className="font-semibold text-xs text-gray-600 mr-2">
                            Routes:
                          </span>
                          {u.allowed_routes && u.allowed_routes.length > 0 && (
                            <>
                              {u.allowed_routes
                                .slice(0, 3)
                                .map((routeKey, idx) => {
                                  const route = allRoutes.find(
                                    (r) => r.key === routeKey
                                  );
                                  return (
                                    <span
                                      key={`${u.id}_route_${routeKey}_${idx}`}
                                      className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1"
                                    >
                                      {route ? route.label : routeKey}
                                    </span>
                                  );
                                })}
                              {u.allowed_routes.length > 3 && (
                                <span
                                  className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1 cursor-pointer hover:bg-gray-300 relative"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenPopover({
                                      userId: u.id,
                                      type: "routes",
                                    });
                                    const rect =
                                      e.currentTarget.getBoundingClientRect();
                                    setPopoverAnchorRect(rect);
                                  }}
                                  ref={(el) =>
                                    (popoverRefs.current[`${u.id}_routes`] = el)
                                  }
                                >
                                  +{u.allowed_routes.length - 3} more
                                </span>
                              )}
                              {openPopover.userId === u.id &&
                                openPopover.type === "routes" &&
                                popoverAnchorRect && (
                                  <PopoverPortal
                                    anchorRect={popoverAnchorRect}
                                    onClose={() => {
                                      setOpenPopover({
                                        userId: null,
                                        type: null,
                                      });
                                      setPopoverAnchorRect(null);
                                    }}
                                    position={popoverPosition}
                                  >
                                    <div className="font-semibold text-xs text-gray-600 mb-1">
                                      All Routes
                                    </div>
                                    {u.allowed_routes.map((routeKey, idx) => {
                                      const route = allRoutes.find(
                                        (r) => r.key === routeKey
                                      );
                                      return (
                                        <div
                                          key={`${u.id}_popover_route_${routeKey}_${idx}`}
                                          className="mb-1"
                                        >
                                          <span className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1">
                                            {route ? route.label : routeKey}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </PopoverPortal>
                                )}
                            </>
                          )}
                        </div>
                        {/* Features section removed */}
                      </td>
                      <td className="px-2 py-4 sm:px-4 text-[12px] sm:text-[16px] text-gray-700 text-center">
                        {u.role !== "owner" && (
                          <>
                            <button
                              className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-teal-600 transition cursor-pointer"
                              onClick={() => {
                                if (permissions.canManageUsers) {
                                  handleEditUser(u);
                                } else {
                                  toast.error(
                                    "You do not have permission to edit users."
                                  );
                                }
                              }}
                              aria-label="Edit user"
                              type="button"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition ml-2 cursor-pointer"
                              onClick={() => {
                                if (permissions.canManageUsers) {
                                  setUserToDelete(u);
                                  setShowDeleteDialog(true);
                                } else {
                                  toast.error(
                                    "You do not have permission to delete users."
                                  );
                                }
                              }}
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
        onCancel={() => {
          setShowDeleteDialog(false);
          setUserToDelete(null);
        }}
        onConfirm={() => userToDelete && handleDeleteUser(userToDelete.user_id)}
        isDeleting={isDeleting}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
                  {showPlansModal && (
        <PlansModal
          isOpen={showPlansModal}
          onClose={() => {
            setShowPlansModal(false);
            setActionRequiringPlan(null);
          }}
        />
      )}
    </>
  );
};

export default UserSetting;
