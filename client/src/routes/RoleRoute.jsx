import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const roleRoutes = {
  admin: '/admin',
  doctor: '/doctor',
  nurse: '/nurse',
  receptionist: '/reception',
  lab_technician: '/lab',
  pharmacist: '/pharmacy',
  billing: '/billing',
  patient: '/patient',
};

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    const redirect = roleRoutes[user.role] || '/login';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
