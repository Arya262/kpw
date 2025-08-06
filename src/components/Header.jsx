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
import WhatsAppSearchPanel from "../components/WhatsAppSearchPanel";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AuthContext";

export default function Header({ isMenuOpen, onToggleSidebar }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    whatsapp: "",
    email: "",
  });

  const avatarSrc = user?.avatar || "/default-avatar.jpeg";

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleClearSearch = () => setSearchTerm("");
  const [isLoading, setIsLoading] = useState(false);
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
        notify("success", "Successfully logged out!");

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

  const fetchWhatsAppNumbers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.WHATSAPP.NUMBERS, {
        withCredentials: true,
      });
      setWhatsAppData(response.data?.numbers || []);
      setShowSearchPanel(true);
    } catch (error) {
      console.error("Failed to fetch WhatsApp numbers:", error);
      notify("error", "Unable to load WhatsApp numbers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
            onClick={() => {
              if (!showSearchPanel && !isLoading) fetchWhatsAppNumbers();
            }}
          >
            <button
              type="button"
              aria-label="Search"
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : <FaSearch />}
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
            onClick={() => {
              if (!showSearchPanel && !isLoading) fetchWhatsAppNumbers();
            }}
          >
            {isLoading ? <Spinner /> : <FaSearch className="text-gray-500" />}
          </div>

          {/* Notification */}
          <div className="relative z-50">
            <NotificationBell />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#0AA89E] text-white text-sm px-4 py-2 rounded hover:bg-[#089086] transition cursor-pointer"
          >
            WhatsApp Number
          </button>
          {/* User Info & Dropdown */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end justify-center mr-1">
              <span className="font-semibold text-sm text-gray-900 truncate max-w-[160px]">
                {user?.email ?? "Unknown Email"}
              </span>
              <span className="text-xs text-gray-500">
                Merchant ID: {user?.customer_id ?? "-"}
              </span>
            </div>
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                aria-label="User menu"
                aria-expanded={showUserMenu}
                aria-controls="user-menu"
                tabIndex={0}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300 focus:outline-none ml-2"
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
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center mb-2">
                    <img
                      src={avatarSrc}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
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
                      className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
                    >
                      <span>Privacy Policy</span>
                      <span className="ml-2 microbial text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded font-bold">
                        UPDATE
                      </span>
                    </Link>
                    <Link
                      to="/ForgotPassword"
                      className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
                    >
                      <span>Change Password</span>
                      <FaKey className="ml-2 text-lg text-gray-400" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
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
          {showAddModal && (
            <div className="fixed inset-0 bg-[#000]/50 backdrop-blur-sm flex justify-center items-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-96 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Add WhatsApp Contact
                </h2>

                <input
                  type="text"
                  placeholder="Name"
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-[#0AA89E]"
                />

                <input
                  type="text"
                  placeholder="Merchant ID"
                  value={newContact.whatsapp}
                  onChange={(e) =>
                    setNewContact({ ...newContact, whatsapp: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-[#0AA89E]"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={async () => {
                      if (!newContact.name || !newContact.whatsapp) {
                        notify("error", "Please fill in both fields.");
                        return;
                      }

                      try {
                        const response = await axios.post(
                          "http://localhost:3000/createGupshupApp",
                          {
                            name: newContact.name,
                            user: newContact.whatsapp,
                            customer_id: user?.customer_id,
                          },
                          { withCredentials: true }
                        );

                        const result = response.data;

                        if (result.success && result.onboardingLink?.link) {
                          notify("success", "Redirecting to onboarding...");

                          // Open onboarding link in new tab
                          setTimeout(() => {
                            window.location.href = result.onboardingLink.link;
                          }, 1000);
                        } else {
                          notify("error", "Failed to add contact.");
                        }
                      } catch (err) {
                        console.error("API error:", err);
                        notify(
                          "error",
                          err.response?.data?.error || "Something went wrong."
                        );
                      }

                      // Close modal and reset form
                      setShowAddModal(false);
                      setNewContact({ name: "", whatsapp: "" });
                    }}
                    className="px-4 py-2 rounded bg-[#0AA89E] text-white hover:bg-[#089086] cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* WhatsApp Search Panel */}
      <WhatsAppSearchPanel
        isOpen={showSearchPanel}
        onClose={() => setShowSearchPanel(false)}
        data={memoizedWhatsAppData}
      />
    </>
  );
}
