import api from './api';

class AuthService {
  // Iniciar sesión
  async login(username, password) {
    try {
      const response = await api.post('/auth/signin', { username, password });
      if (response.data.accessToken) {
        this._setSession(response.data);
      }
      return response.data;
    } catch (error) {
      this._handleAuthError(error);
      throw error;
    }
  }

  // Cerrar sesión
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  }

  // Obtener usuario actual
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  // Verificar si el usuario es administrador
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  // Obtener token de acceso
  getAccessToken() {
    const user = this.getCurrentUser();
    return user?.accessToken;
  }

  // Obtener token de actualización
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  // Configurar la sesión del usuario
  _setSession(authResult) {
    localStorage.setItem('user', JSON.stringify({
      id: authResult.id,
      username: authResult.username,
      email: authResult.email,
      role: authResult.role,
      accessToken: authResult.accessToken
    }));
    
    if (authResult.refreshToken) {
      localStorage.setItem('refreshToken', authResult.refreshToken);
    }
  }

  // Manejar errores de autenticación
  _handleAuthError(error) {
    if (error.response?.status === 401) {
      this.logout();
      window.location.href = '/login';
    }
    throw error;
  }
}

export default new AuthService();
