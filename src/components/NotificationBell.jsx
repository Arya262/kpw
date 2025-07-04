// import React, { useState, useRef, useEffect } from "react";
// import {
//   Bell,
//   BellOff,
//   X,
//   MessageCircle,
//   AlertTriangle,
//   CalendarCheck,
// } from "lucide-react";
// import { useNotifications } from "../context/NotificationContext";
// import { useNavigate } from "react-router-dom";
// import { format, isToday, isYesterday } from "date-fns";

// const NotificationBell = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();
//   const {
//     unreadCount,
//     notifications,
//     isNotificationEnabled,
//     markNotificationAsRead,
//     markAllNotificationsAsRead,
//     clearAllNotifications,
//     toggleNotifications,
//   } = useNotifications();

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     const handleEscape = (e) => {
//       if (e.key === "Escape") setIsOpen(false);
//     };
//     if (isOpen) document.addEventListener("keydown", handleEscape);
//     return () => document.removeEventListener("keydown", handleEscape);
//   }, [isOpen]);

//   const handleNotificationClick = (notification) => {
//     markNotificationAsRead(notification.id);
//     if (notification.type === "new_message" && notification.conversationId) {
//       navigate(`/chats?conversation=${notification.conversationId}`);
//     }
//     setIsOpen(false);
//   };

//   const getIconByType = (type) => {
//     switch (type) {
//       case "new_message":
//         return <MessageCircle className="text-blue-500 w-5 h-5" />;
//       case "alert":
//         return <AlertTriangle className="text-yellow-500 w-5 h-5" />;
//       case "event":
//         return <CalendarCheck className="text-green-500 w-5 h-5" />;
//       default:
//         return <Bell className="text-gray-400 w-5 h-5" />;
//     }
//   };

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffMins = Math.floor((now - date) / (1000 * 60));
//     if (diffMins < 1) return "Just now";
//     if (diffMins < 60) return `${diffMins}m ago`;
//     if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
//     return format(date, "MMM d");
//   };

//   const groupByDate = (notifications) => {
//     const groups = { Today: [], Yesterday: [], Earlier: [] };
//     notifications.forEach((n) => {
//       const date = new Date(n.timestamp);
//       if (isToday(date)) groups.Today.push(n);
//       else if (isYesterday(date)) groups.Yesterday.push(n);
//       else groups.Earlier.push(n);
//     });
//     return groups;
//   };

//   const grouped = groupByDate(notifications);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       {/* Bell Button */}
//       <button
//         onClick={() => setIsOpen((prev) => !prev)}
//         className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
//         aria-label="Notifications"
//       >
//         {isNotificationEnabled ? (
//           <Bell className="w-5 h-5" />
//         ) : (
//           <BellOff className="w-5 h-5" />
//         )}
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
//             {unreadCount > 99 ? "99+" : unreadCount}
//           </span>
//         )}
//       </button>

//       {/* Dropdown */}
//       <div
//         className={`absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-200 ease-out ${
//           isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
//         }`}
//       >
//         <div className="flex items-center justify-between p-4 border-b">
//           <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={toggleNotifications}
//               title={isNotificationEnabled ? "Disable notifications" : "Enable notifications"}
//               className="p-1 text-gray-500 hover:text-gray-700"
//             >
//               {isNotificationEnabled ? (
//                 <Bell className="w-4 h-4" />
//               ) : (
//                 <BellOff className="w-4 h-4" />
//               )}
//             </button>
//             <button
//               onClick={() => setIsOpen(false)}
//               className="p-1 text-gray-500 hover:text-gray-700"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         {notifications.length > 0 ? (
//           <>
//             <div className="flex justify-between px-4 py-2 text-sm text-gray-600 border-b">
//               {notifications.some((n) => !n.read) && (
//                 <button onClick={markAllNotificationsAsRead} className="text-blue-600 hover:underline">
//                   Mark all as read
//                 </button>
//               )}
//               <button onClick={clearAllNotifications} className="text-red-600 hover:underline ml-auto">
//                 Clear all
//               </button>
//             </div>

//             <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
//               {Object.entries(grouped).map(([label, items]) => (
//                 <div key={label}>
//                   {items.length > 0 && (
//                     <p className="text-xs text-gray-500 px-4 pt-2">{label}</p>
//                   )}
//                   {items.map((n) => (
//                     <div
//                       key={n.id}
//                       onClick={() => handleNotificationClick(n)}
//                       className={`p-3 hover:bg-gray-50 cursor-pointer transition ${
//                         !n.read ? "bg-blue-50" : ""
//                       }`}
//                     >
//                       <div className="flex gap-3 items-start">
//                         <div className="pt-1">{getIconByType(n.type)}</div>
//                         <div className="flex-1 min-w-0">
//                           <div className="flex justify-between">
//                             <p className="text-sm font-medium text-gray-900">{n.title}</p>
//                             <span className="text-xs text-gray-500">{formatTime(n.timestamp)}</span>
//                           </div>
//                           <p className="text-sm text-gray-600 truncate">{n.message}</p>
//                           {n.contactName && (
//                             <p className="text-xs text-gray-500 mt-0.5">From: {n.contactName}</p>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>

//             <div className="p-3 border-t bg-gray-50">
//               <button
//                 onClick={() => navigate("/chats")}
//                 className="w-full text-sm text-blue-600 hover:underline text-center"
//               >
//                 View all messages
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="p-6 text-center text-gray-500">
//             <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 animate-bounce" />
//             <p className="text-sm font-semibold">You're all caught up!</p>
//             <p className="text-xs text-gray-400">Check back later for new alerts</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NotificationBell;
