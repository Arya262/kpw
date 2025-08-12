import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h1 className="text-6xl font-bold text-red-500 mb-4">404 </h1>
        <p className="text-xl text-gray-700 mb-6">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 bg-[#05a3a3] text-white rounded hover:bg-[#048080] transition cursor-pointer"
        >
          Go Home
        </button>
      </motion.div>
    </div>
  );
};

export default NotFound;
