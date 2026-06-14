import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let userRole = null;
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userRole = user.role;
    } catch (e) {
      console.error("Failed to parse user from localStorage");
    }
  }

  if (!token || !userRole) {
    // If not logged in or invalid user data, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // If logged in but role doesn't match
    if (userRole === 'ALUMNI') {
      return <Navigate to="/dashboard" replace />;
    }
    // Otherwise redirect to admin
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
