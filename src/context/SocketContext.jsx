import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { addAlert } = useNotifications();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      // User logged out => disconnect socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
        console.log("🛑 Socket disconnected due to logout");
      }
      return;
    }

    // User logged in => create socket if not already connected
    if (!socket) {
      const newSocket = io("https://marketing-uoxu.onrender.com", {
        transports: ["websocket"],
        withCredentials: true,
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected!", newSocket.id);
      });

      newSocket.on("connect_error", (err) => {
        console.error("❌ Socket connect error:", err.message);
      });

      setSocket(newSocket);
    }
  }, [user]);

  useEffect(() => {
    if (socket && user?.customer_id) {
      socket.emit("join_customer_room", user.customer_id);
    }
  }, [socket, user?.customer_id]);

  useEffect(() => {
    if (!socket) return;

    socket.off("newMessageAlert");

    socket.on("newMessageAlert", (data) => {
      console.log("📥 Global alert received:", data);
      addAlert(data);
    });

    return () => socket.off("newMessageAlert");
  }, [socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
        console.log("🛑 Socket disconnected on context unmount");
      }
    };
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
