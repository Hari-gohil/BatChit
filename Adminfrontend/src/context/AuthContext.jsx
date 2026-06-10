import {
  createContext,
  useEffect,
  useState,
} from "react";

import { socket } from "../socket/socket";
import { getMe } from "../services/authService";

export const AuthContext =
  createContext();

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const login = (
    userData,
    token
  ) => {
    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          setLoading(false);
          return;
        }

        const userData =
          await getMe();

        setUser(userData);
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
  if (!user?._id) return;

  if (!socket.connected) {
    socket.connect();
  }

  socket.emit("user_online", user._id);

  return () => {
    socket.disconnect();
  };
}, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};