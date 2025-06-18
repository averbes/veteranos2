import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/auth.service';

const ProtectedRoute = ({ requiredRole = null }) => {
  const currentUser = authService.getCurrentUser();

  // Si no hay usuario autenticado, redirigir al login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene, redirigir al inicio
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Si todo está bien, renderizar las rutas hijas
  return <Outlet />;
};

export default ProtectedRoute;
