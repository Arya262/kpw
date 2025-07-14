import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const PrivateRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#05a3a3]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle role-based redirects
  const isAdmin = user.role === "admin" || user.role === "super_admin";
  const isOnAdminRoute = location.pathname.startsWith("/admin");
  const isOnUserRoute = location.pathname === "/" || 
                       location.pathname.startsWith("/contact") ||
                       location.pathname.startsWith("/templates") ||
                       location.pathname.startsWith("/chats") ||
                       location.pathname.startsWith("/broadcast") ||
                       location.pathname.startsWith("/settings") ||
                       location.pathname.startsWith("/help");

  // If admin user is trying to access user routes, redirect to admin dashboard
  if (isAdmin && isOnUserRoute) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If regular user is trying to access admin routes, redirect to user dashboard
  if (!isAdmin && isOnAdminRoute) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
