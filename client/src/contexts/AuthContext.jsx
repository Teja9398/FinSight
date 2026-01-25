import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const AUTH_SERVER = import.meta.env.VITE_AUTH_SERVER_URL;
// console.log("AUTH_SERVER_URL:", AUTH_SERVER);

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// Helper to decode JWT and check expiry
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    // exp is in seconds
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    return true;
  }
}

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // On mount, check for token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && !isTokenExpired(token) && userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUser(userObj);
      } catch (e) {
        setUser(null);
        localStorage.removeItem("user");
      }
    } else if (token && isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } else {
      setUser(null);
      localStorage.removeItem("user");
    }
  }, []);

  // Mock login function
  const login = async (email, password) => {
    // Replace with real API call
    try {
      const response = await fetch(`${AUTH_SERVER}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log("Login response:", data);

      if (data.token && !isTokenExpired(data.token)) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user); // Set user data in state
        return true; // Indicate login success
      } else {
        throw new Error("Login failed or token expired");
      }
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await fetch(`${AUTH_SERVER}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        // setUser(data.user);
        return true; // Indicate signup success
      } else {
        throw new Error("Signup failed");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      return false; // Indicate signup failure
    }
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return !!token && !isTokenExpired(token);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // In your AuthContext, add a refreshUser method
  const refreshUser = async (newUser) => {
    try {
      const updatedUser = newUser;
      delete updatedUser.password;
      console.log("from refreshUser",updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return true;
    } catch (err) {
      console.error("Failed to refresh user:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isAuthenticated, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
