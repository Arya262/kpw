import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      // User logged out => disconnect socket
      if (socket) {
        // console.log("[Socket] Disconnecting due to no user");
        socket.disconnect();
        setSocket(null);
        
      }
      return;
    }

    // User logged in => create socket if not already connected
    if (!socket) {
      const newSocket = io("http://localhost:60000", {
        transports: ["websocket"],
        withCredentials: true,
      });

      newSocket.on("connect", () => {
        // console.log("[Socket] Connected:", newSocket.id);
      });

      newSocket.on("connect_error", (err) => {
        // console.error("[Socket] Connect error:", err?.message || err);
      });

      setSocket(newSocket);
    }
  }, [user]);

  useEffect(() => {
    if (socket && user?.customer_id) {
      const roomId = String(user.customer_id);
      // console.log("[Socket] Joining customer room:", roomId);
      socket.emit("join_customer_room", roomId, (ack) => {
        // console.log("[Socket] join_customer_room ack:", ack);
      });
    }
  }, [socket, user?.customer_id]);

  useEffect(() => {
    return () => {
      if (socket) {
        // console.log("[Socket] Disconnecting on unmount");
        socket.disconnect();
       
      }
    };
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
