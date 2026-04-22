import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isAdminUser } from "../lib/adminAccess";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="auth-page auth-page-loading">
        <div className="auth-loading-card">Checking admin access...</div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location, openAuth: true }} />;
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
