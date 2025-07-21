import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaKey, FaPowerOff } from "react-icons/fa";
import { Menu, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { toast } from "react-toastify"; // No need to import ToastContainer here
import "react-toastify/dist/ReactToastify.css";
import WhatsAppSearchPanel from "../components/WhatsAppSearchPanel";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AuthContext";

export default function Header({ isMenuOpen, onToggleSidebar }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

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

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.AUTH.LOGOUT,
        {},
        {
          withCredentials: true,
        }
      );

      const data = response.data;

      if (data.success) {
        // Clear user state and localStorage
        logout();
        notify("success", "Successfully logged out!");
        navigate("/login", { replace: true });
      } else {
        notify("error", "Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, clear local state
      logout();
      notify("success", "Successfully logged out!");
      navigate("/login", { replace: true });
    }
  };

  const fetchWhatsAppNumbers = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.WHATSAPP.NUMBERS, {
        withCredentials: true,
      });
      setWhatsAppData(response.data?.numbers || []);
      setShowSearchPanel(true);
    } catch (error) {
      console.error("Failed to fetch WhatsApp numbers:", error);
      toast.error("Unable to load WhatsApp numbers.");
    }
  };

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <>
      <header className="sticky top-0 z-50 flex flex-wrap justify-between items-center px-4 py-4 shadow-md bg-white relative gap-y-2">
        {/* Left Side */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Logos */}
          <img
            src="/logo.png"
            alt="Company Logo"
            className="h-10 hidden sm:block"
          />
          <img
            src="/mobile_logo.webp"
            alt="Compact Company Logo"
            className="h-8 sm:hidden"
          />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 flex-nowrap w-auto max-w-full">
          {/* Full Search Bar */}
          <div
            className="hidden sm:flex items-center gap-2 bg-[#f0f2f5] rounded-full px-4 py-2 w-auto min-w-[220px] relative cursor-pointer"
            aria-label="Search WhatsApp number"
            onClick={fetchWhatsAppNumbers}
          >
            <button
              type="button"
              aria-label="Search"
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FaSearch />
            </button>

            <div className="text-sm text-gray-600 whitespace-nowrap hidden sm:block">
              WhatsApp Number:
            </div>

            <input
              type="text"
              placeholder="+91 92743 34248"
              aria-label="WhatsApp number input"
              value={searchTerm}
              onChange={handleSearchChange}
              readOnly
              className="bg-white text-sm text-gray-800 
                placeholder-transparent sm:placeholder-gray-500 
                placeholder:italic placeholder:font-medium 
                outline-none flex-1 min-w-0 cursor-pointer rounded"
            />

            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 transform -translate-y-1/2"
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Mobile Icon Only */}
          <div
            className="sm:hidden flex items-center justify-center bg-[#f0f2f5] rounded-full p-2 cursor-pointer"
            onClick={fetchWhatsAppNumbers}
          >
            <FaSearch className="text-gray-500" />
          </div>

          {/* Notification Bell */}
          <div className="relative z-50">
            <NotificationBell />
          </div>

          {/* Buttons */}
          {/* <button
            type="button"
            aria-label="Upgrade account"
            className="bg-[#0AA89E] hover:bg-[#0AA89E] text-white text-sm px-4 h-10 flex items-center justify-center rounded whitespace-nowrap cursor-pointer transition-colors"
          >
            Upgrade
          </button> */}

          {/* User Info + Avatar & Dropdown */}
          <div className="flex items-center gap-2">
            {/* User Info */}
            <div className="hidden sm:flex flex-col items-end justify-center mr-1">
              <span className="font-semibold text-sm text-gray-900 truncate max-w-[160px]">{user?.email || "Username"}</span>
              <span className="text-xs text-gray-500">Merchant ID: {user?.customer_id || "-"}</span>
            </div>
            {/* User Avatar & Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                aria-label="User menu"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300 focus:outline-none ml-2"
                onClick={() => setShowUserMenu((prev) => !prev)}
              >
                <img
                  src="/default-avatar.jpeg"
                  alt="User Avatar"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-teal-400 border-2 border-white rounded-full"></span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[220px] p-4 flex flex-col items-center">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center mb-2">
                    <img
                      src="/default-avatar.jpeg"
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 w-3 h-3 bg-teal-400 border-2 border-white rounded-full"></span>
                  </div>
                  {/* Username and Role */}
                  <div className="text-center w-full mb-4">
                    <div className="font-semibold text-base text-gray-800 truncate">{user?.email || "Username"}</div>
                    <div className="text-sm text-gray-500 mt-1">{user?.role || "-"}</div>
                  </div>
                  {/* Menu Options */}
                  <div className="w-full flex flex-col gap-1">
                    <Link to="/privacy-policy" className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition">
                      <span>Privacy Policy</span>
                      <span className="ml-2 text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded font-bold">UPDATE</span>
                    </Link>
                    <Link to="/forgot-password" className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition">
                      <span>Change Password</span>
                      <FaKey className="ml-2 text-lg text-gray-400" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
                    >
                      <span>Logout</span>
                      <FaPowerOff className="ml-2 text-lg text-red-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* WhatsApp Search Panel */}
      <WhatsAppSearchPanel
        isOpen={showSearchPanel}
        onClose={() => setShowSearchPanel(false)}
        data={whatsAppData}
      />
    </>
  );
}
