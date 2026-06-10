import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { socket } from "../socket/socket";
import useAuth from "../hooks/useAuth";

const SocketContext = createContext();

export const SocketProvider = ({
  children,
}) => {
  const { user } = useAuth();

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  useEffect(() => {
    if (!user) return;

    socket.connect();

    socket.emit(
      "user_online",
      user._id
    );

    socket.on(
      "online_users",
      (users) => {
        setOnlineUsers(users);
      }
    );

    return () => {
      socket.off("online_users");
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};