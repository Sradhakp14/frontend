import axios from "axios";

// ✅ Create Axios instance for backend API
const API = axios.create({
  baseURL: "http://localhost:5000/api", // Adjust if backend runs on different port
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Automatically attach JWT token (if user logged in)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle expired tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
