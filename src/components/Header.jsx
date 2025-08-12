import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { FaSearch, FaKey, FaPowerOff } from "react-icons/fa";
import { Menu, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
export default function Header({ isMenuOpen, onToggleSidebar }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [onboardingData, setOnboardingData] = useState(null);
  const avatarSrc = user?.avatar || "/default-avatar.jpeg";

  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [appName, setAppName] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleClearSearch = () => setSearchTerm("");
  const notify = (type, message) => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const response = await axios.post(
        API_ENDPOINTS.AUTH.LOGOUT,
        {},
        { withCredentials: true }
      );

      if (response.data?.success) {
        setIsLoggingOut(true);

        // Set localStorage flag to show toast on login page
        localStorage.setItem("showLogoutSuccessToast", "true");

        setTimeout(() => {
          logout();
          navigate("/login", { replace: true });
        }, 1500);
      } else {
        notify("error", "Logout failed. Please try again.");
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      notify("info", "Logged out locally. Please re-login to sync.");

      setTimeout(() => {
        logout();
        navigate("/login", { replace: true });
      }, 1500);
    }
  }, [logout, navigate]);

  const handleClickOutside = useCallback((event) => {
    if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
      setShowUserMenu(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const memoizedWhatsAppData = useMemo(() => whatsAppData, [whatsAppData]);

  const handleOnboard = async (name) => {
    setIsOnboarding(true);
    try {
      const payload = {
        name,
        customer_id: user?.customer_id,
      };

      console.log("Sending to backend:", payload);

      const response = await axios.post(
        "http://localhost:3000/createGupshupApp",
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response from backend:", response.data);

      const { onboardingLink, success } = response.data;

      if (success && onboardingLink?.link) {
        notify("success", "Redirecting to onboarding...");
        setTimeout(() => {
          window.open(onboardingLink.link, "_blank");
        }, 1000);
      } else {
        notify("error", "Failed to fetch onboarding link.");
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      notify(
        "error",
        err.response?.data?.error || "Something went wrong during onboarding."
      );
    } finally {
      setIsOnboarding(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex justify-between items-center px-4 py-4 shadow-md bg-white relative gap-y-2 flex-wrap">
        {/* Left Side */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <img
            src="/logo.png"
            alt="Company Logo"
            className="h-10 hidden sm:block"
            loading="lazy"
          />
          <img
            src="/mobile_logo.webp"
            alt="Compact Logo"
            className="h-8 sm:hidden"
            loading="lazy"
          />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 flex-nowrap w-auto max-w-full">
          {/* Full Search Bar */}
          <div
            className="hidden sm:flex items-center gap-2 bg-[#f0f2f5] rounded-full px-4 py-2 w-auto min-w-[220px] relative cursor-pointer"
            onClick={() => setShowSearchPanel(true)}
          >
            <button
              type="button"
              aria-label="Search"
              className="text-gray-500 hover:text-gray-700"
            >
              <FaSearch />
            </button>
            <div className="text-sm text-gray-600 whitespace-nowrap hidden sm:block">
              WhatsApp Number:
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="+91 92743 34248"
              aria-label="WhatsApp number input"
              className="bg-white text-sm text-gray-800 placeholder-gray-500 placeholder:italic placeholder:font-medium outline-none flex-1 min-w-0 cursor-pointer rounded"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 transform -translate-y-1/2"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Mobile Search */}
          <div
            className="sm:hidden flex items-center justify-center bg-[#f0f2f5] rounded-full p-2 cursor-pointer"
            onClick={() => setShowSearchPanel(true)}
          >
            <FaSearch className="text-gray-500" />
          </div>

          {/* Notification */}
          <div className="relative z-50">
            <NotificationBell />
          </div>
{user?.status === "inactive" && (
  <button
    onClick={() => setShowOnboardModal(true)}
    className="bg-[#0AA89E] text-white text-sm px-4 py-2 rounded hover:bg-[#089086] transition cursor-pointer"
    disabled={isOnboarding}
  >
    {isOnboarding ? "Redirecting..." : "Onboarding"}
  </button>
)}
          {/* User Info & Dropdown */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end justify-center mr-1">
              <span className="font-semibold text-sm text-gray-900 truncate max-w-[160px]">
                {user?.name ?? "Unknown Name"}
              </span>
              <span className="text-xs text-gray-500">
                Merchant ID: {user?.customer_id ?? "-"}
              </span>
            </div>
            <div className="relative " ref={userMenuRef}>
              <button
                type="button"
                aria-label="User menu"
                aria-expanded={showUserMenu}
                aria-controls="user-menu"
                tabIndex={0}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300 focus:outline-none ml-2 cursor-pointer"
                onClick={() => setShowUserMenu((prev) => !prev)}
              >
                <img
                  src={avatarSrc}
                  alt="User Avatar"
                  className="w-9 h-9 rounded-full object-cover"
                  loading="lazy"
                />
              </button>
              {showUserMenu && (
                <div
                  id="user-menu"
                  className="absolute right-0 mt-2 w-72 max-w-[90vw] bg-white border border-gray-200 rounded shadow-lg  z-50 p-4 flex flex-col items-center transition-all duration-200 scale-100 opacity-100"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center mb-2 cursor-pointer">
                    <img
                      src={avatarSrc}
                      alt="User Avatar"
                      className="w-full h-full object-cover "
                      loading="lazy"
                    />
                  </div>
                  <div className="text-center w-full mb-4">
                    <div className="font-semibold text-base text-gray-800 truncate">
                      {user?.email ?? "Unknown Email"}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {user?.role ?? "Merchant"}
                    </div>
                  </div>
                  <div className="w-full flex flex-col gap-1">
                    <Link
                      to="/privacy-policy"
                      className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition cursor-pointer"
                    >
                      <span>Privacy Policy</span>
                      <span className="ml-2 microbial text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded font-bold">
                        UPDATE
                      </span>
                    </Link>
                    <Link
                      to="/ForgotPassword"
                      className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition cursor-pointer"
                    >
                      <span>Change Password</span>
                      <FaKey className="ml-2 text-lg text-gray-400" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition cursor-pointer"
                      disabled={isLoggingOut}
                    >
                      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                      <FaPowerOff className="ml-2 text-lg text-red-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {showOnboardModal && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
              <Dialog
                open={true}
                onClose={() => setShowOnboardModal(false)}
                PaperProps={{
                  sx: {
                    width: 500,
                    height: 250,
                    display: "flex",
                    flexDirection: "column",
                  },
                }}
              >
                <DialogTitle>Enter Brand Name</DialogTitle>

                <DialogContent sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Brand Name"
                    value={appName}
                    onChange={(e) => {
                      setAppName(e.target.value);
                      setValidationError("");
                    }}
                    helperText={
                      validationError
                        ? validationError
                        : "Brand Name must be at least 6 characters. No spaces or underscores."
                    }
                    error={Boolean(validationError)}
                    margin="normal"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "#0AA89E",
                        },
                      },
                      "& label.Mui-focused": {
                        color: "#0AA89E",
                      },
                    }}
                  />
                </DialogContent>

                <DialogActions>
                  <Button
                    onClick={() => {
                      setShowOnboardModal(false);
                      setValidationError("");
                      setAppName("");
                    }}
                    variant="contained"
                    color="inherit"
                    sx={{
                      minWidth: 100,
                      height: 40,
                      px: 3,
                      fontSize: "0.875rem",
                      backgroundColor: "#e0e0e0",
                      color: "#333",
                      "&:hover": {
                        backgroundColor: "#d5d5d5",
                      },
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    onClick={async () => {
                      const rawName = appName.trim();

                      if (rawName.length < 6) {
                        setValidationError(
                          "Brand name must be at least 6 characters."
                        );
                        return;
                      }

                      if (rawName.includes(" ")) {
                        setValidationError("Brand name cannot contain spaces.");
                        return;
                      }

                      if (rawName.includes("_")) {
                        setValidationError(
                          "Brand name cannot contain underscores."
                        );
                        return;
                      }

                      if (!/^[a-z0-9]+$/i.test(rawName)) {
                        setValidationError(
                          "Brand name can only contain letters and numbers."
                        );
                        return;
                      }

                      await handleOnboard(rawName);
                      setShowOnboardModal(false);
                      setAppName("");
                      setValidationError("");
                    }}
                    sx={{
                      minWidth: 100,
                      height: 40,
                      px: 3,
                      fontSize: "0.875rem",
                      backgroundColor: "#0AA89E",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#089086",
                      },
                    }}
                  >
                    Save
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
