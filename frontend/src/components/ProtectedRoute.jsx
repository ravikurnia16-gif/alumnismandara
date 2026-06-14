import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // If logged in but role doesn't match (e.g. ALUMNI trying to access Admin dashboard)
    if (userRole === 'ALUMNI') {
      return <Navigate to="/dashboard" replace />;
    }
    // If admin trying to access alumni dashboard, we can let them or redirect to admin
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
