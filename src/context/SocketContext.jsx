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
        
      });

      newSocket.on("connect_error", (err) => {
       
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
      
      addAlert(data);
    });

    return () => socket.off("newMessageAlert");
  }, [socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
       
      }
    };
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
