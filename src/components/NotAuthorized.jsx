// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const NotAuthorized = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const handleGoHome = () => {
//     if (user) {
//       if (user.role === "admin" || user.role === "super_admin") {
//         navigate("/admin/dashboard", { replace: true });
//       } else {
//         navigate("/", { replace: true });
//       }
//     } else {
//       navigate("/login", { replace: true });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0aa89e] via-[#f9fafb] to-[#ff6b6b] animate-fadeIn">
//       <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full scale-95 animate-popIn">
//         {/* Animated Lock Icon */}
//         <svg className="w-20 h-20 mb-6 text-[#ff6b6b] animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//           <rect x="5" y="11" width="14" height="8" rx="3" fill="#ffeaea" />
//           <path d="M7 11V7a5 5 0 0110 0v4" stroke="#ff6b6b" strokeWidth="2.5" strokeLinecap="round" />
//           <circle cx="12" cy="15" r="1.5" fill="#ff6b6b" />
//         </svg>
//         <h1 className="text-4xl font-extrabold text-[#ff6b6b] mb-2 tracking-tight drop-shadow">403 - Not Authorized</h1>
//         <p className="text-lg text-gray-700 mb-8 text-center">You do not have permission to view this page.</p>
//         <button
//           onClick={handleGoHome}
//           className="px-8 py-3 bg-[#0aa89e] text-white rounded-lg shadow-lg hover:bg-[#088b81] transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#0aa89e]/30 animate-pulse"
//         >
//           Go Home
//         </button>
//       </div>
//       {/* Animations */}
//       <style>{`
//         @keyframes popIn {
//           0% { transform: scale(0.7); opacity: 0; }
//           80% { transform: scale(1.05); opacity: 1; }
//           100% { transform: scale(1); opacity: 1; }
//         }
//         .animate-popIn {
//           animation: popIn 0.7s cubic-bezier(0.23, 1.02, 0.32, 1) both;
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 1s ease both;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ; 

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0aa89e] via-[#f9fafb] to-[#ff6b6b] animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full scale-95 animate-popIn">
        {/* Animated Hourglass Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-20 h-20 mb-6 text-[#ff6b6b] animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 4h8M8 20h8M8 4v5a4 4 0 004 4 4 4 0 004-4V4m-8 16v-5a4 4 0 014-4 4 4 0 014 4v5"
          />
        </svg>

        <h1 className="text-4xl font-extrabold text-[#ff6b6b] mb-2 tracking-tight drop-shadow">
          🚧 Coming Soon 🚧
        </h1>
        <p className="text-lg text-gray-700 mb-8 text-center">
          This feature is under development. Stay tuned!
        </p>

        <button
          onClick={handleGoHome}
          className="px-8 py-3 bg-[#0aa89e] text-white rounded-lg shadow-lg hover:bg-[#088b81] transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#0aa89e]/30 animate-pulse"
        >
          Go Home
        </button>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.7); opacity: 0; }
          80% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-popIn {
          animation: popIn 0.7s cubic-bezier(0.23, 1.02, 0.32, 1) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease both;
        }
      `}</style>
    </div>
  );
};

export default NotAuthorized;
