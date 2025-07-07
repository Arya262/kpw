import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user?.token) return;
    const API_BASE = import.meta.env.VITE_API_BASE;
    const newSocket = io(API_BASE, {
      transports: ["websocket"],
      withCredentials: true, // ✅ Send cookies (like auth_token)
      auth: {
        token: user.token, // ✅ Send the auth token
      },
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected!", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user?.token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);