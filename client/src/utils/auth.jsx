import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Login user and store in localStorage
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    const userData = response.data;

    // Store user data in localStorage
    localStorage.setItem("user", JSON.stringify(userData));

    return userData;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Register user
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error getting user from localStorage:", error);
    return null;
  }
};

// Update user profile in localStorage
export const updateUserProfile = (userData) => {
  try {
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error("Error updating user profile in localStorage:", error);
    throw error;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem("user");
  // Redirect to login page
  window.location.href = "/";
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getCurrentUser();
};

// Redirect based on user role
export const redirectBasedOnRole = (user) => {
  if (!user) return;

  switch (user.role) {
    case "admin":
      window.location.href = "/admin-dashboard";
      break;
    case "teacher":
      window.location.href = "/teacher-dashboard";
      break;
    case "student":
      window.location.href = "/student-dashboard";
      break;
    default:
      window.location.href = "/";
  }
};

// Add a function to validate user data
export const validateUserData = (user) => {
  if (!user) return false;

  // Check for required fields based on role
  if (user.role === "student") {
    return !!user.year && !!user.department && !!user.division;
  } else if (user.role === "teacher") {
    return !!user.department;
  }

  return true;
};
