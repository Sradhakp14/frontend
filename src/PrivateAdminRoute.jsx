import React from "react";
import { Navigate } from "react-router-dom";

const PrivateAdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const adminToken = localStorage.getItem("adminToken");

  if (!isAdmin || !adminToken) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default PrivateAdminRoute;
