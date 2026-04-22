import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="auth-page auth-page-loading">
        <div className="auth-loading-card">Checking your account access...</div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location, openAuth: true }} />;
  }

  return children;
};

export default ProtectedRoute;
