import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // ✅ import useAuth

const PrivateRoute = () => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
