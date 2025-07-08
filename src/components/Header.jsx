import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { toast } from "react-toastify"; // No need to import ToastContainer here
import "react-toastify/dist/ReactToastify.css";
import WhatsAppSearchPanel from "../components/WhatsAppSearchPanel";
import NotificationBell from "./NotificationBell";

export default function Header({ isMenuOpen, onToggleSidebar }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState([]);
  const navigate = useNavigate();

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
        notify("success", "Successfully logged out!");
        navigate("/login");
      } else {
        notify("error", "Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      notify("error", "Something went wrong. Please try again later.");
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
          <button
            type="button"
            aria-label="Upgrade account"
            className="bg-[#05a3a3] hover:bg-[#048080] text-white text-sm px-4 h-10 flex items-center justify-center rounded whitespace-nowrap cursor-pointer transition-colors"
          >
            Upgrade
          </button>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="bg-[#05a3a3] hover:bg-[#048080] text-white text-sm px-4 h-10 flex items-center justify-center rounded whitespace-nowrap cursor-pointer transition-colors"
          >
            Logout
          </button>
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
