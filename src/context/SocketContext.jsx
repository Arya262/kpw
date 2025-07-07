import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      transports: ["websocket"],
      withCredentials: true, // ✅ Send cookies (like auth_token)
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

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);