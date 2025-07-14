import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useBackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handlePopState = (event) => {
      if (user) {
        const isAdmin = user.role === "admin" || user.role === "super_admin";
        const isOnAdminRoute = location.pathname.startsWith("/admin");
        const isOnUserRoute = location.pathname === "/" || 
                             location.pathname.startsWith("/contact") ||
                             location.pathname.startsWith("/templates") ||
                             location.pathname.startsWith("/chats") ||
                             location.pathname.startsWith("/broadcast") ||
                             location.pathname.startsWith("/settings") ||
                             location.pathname.startsWith("/help");

        // If admin user is on user route, redirect to admin dashboard
        if (isAdmin && isOnUserRoute) {
          navigate("/admin/dashboard", { replace: true });
        }
        // If regular user is on admin route, redirect to user dashboard
        else if (!isAdmin && isOnAdminRoute) {
          navigate("/", { replace: true });
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, location, navigate]);
}; 