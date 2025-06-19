import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/auth.service';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // First, check if the user is authenticated at all.
  if (!authService.isAuthenticated()) {
    // If not, redirect them to the login page.
    // We're saving the location they were trying to go to, so we can send
    // them there after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If they are authenticated, check if they are an admin.
  if (!authService.isAdmin()) {
    // If they are not an admin, redirect them to the homepage.
    return <Navigate to="/" replace />;
  }

  // If they are an authenticated admin, render the protected component.
  return children;
};

export default ProtectedRoute;
