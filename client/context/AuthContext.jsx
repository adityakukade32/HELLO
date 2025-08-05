import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // ✅ Ensure axios always has latest token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  // ✅ Run once on mount
  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, []);

  // ✅ Check if token is valid and set user
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        logout();
      }
    } catch (error) {
      logout(); // remove invalid token
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // ✅ Login or Signup
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (data.success) {
        // Save and set token
        localStorage.setItem("token", data.token);
        setToken(data.token);
        axios.defaults.headers.common["token"] = data.token;

        setAuthUser(data.userData);
        connectSocket(data.userData);

        toast.success(data.message);
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // ✅ Logout user
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["token"];

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.success("Logged out successfully");
  };

  // ✅ Update user profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);

      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // ✅ Connect to socket
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (usersIds) => {
      setOnlineUsers(usersIds);
    });
  };

  const value = {
    axios,
    token,
    authUser,
    setAuthUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
