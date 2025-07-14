import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NotAuthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user) {
      if (user.role === "admin" || user.role === "super_admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Not Authorized</h1>
      <p className="text-lg text-gray-700 mb-8">You do not have permission to view this page.</p>
      <button
        onClick={handleGoHome}
        className="px-6 py-2 bg-[#0aa89e] text-white rounded-lg hover:bg-[#088b81] transition"
      >
        Go Home
      </button>
    </div>
  );
};

export default NotAuthorized; 