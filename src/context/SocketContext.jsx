// context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const { addAlert } = useNotifications();

  useEffect(() => {
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

    return () => newSocket.disconnect();
  }, []);

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
      addAlert(data); // ✅ no sound logic here anymore
    });

    return () => socket.off("newMessageAlert");
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
