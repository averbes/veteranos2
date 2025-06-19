import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Alert, Container, Card, Spinner } from 'react-bootstrap';
import { Lock, Person, ExclamationTriangle } from 'react-bootstrap-icons';
import authService from '../services/auth.service';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir si ya está autenticado
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const from = location.state?.from?.pathname || '/admin';
    
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validación básica
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingrese usuario y contraseña');
      return;
    }

    setLoading(true);
    
    try {
      const userData = await authService.login(username, password);
      if (userData && userData.role === 'admin') {
        // If user is admin, navigate to the admin page
        navigate('/admin', { replace: true });
      } else {
        // For any other user, navigate to the homepage
        navigate('/', { replace: true });
      }
    } catch (error) {
      let errorMessage = 'Error al iniciar sesión. Por favor intente nuevamente.';
      
      if (error.response) {
        // Error de respuesta del servidor
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // La solicitud fue hecha pero no hubo respuesta
        errorMessage = 'No se pudo conectar al servidor. Verifique su conexión a internet.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow" style={{ width: '100%', maxWidth: '450px' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <img 
              src="/logo.png" 
              alt="Logo del Torneo" 
              className="mb-3" 
              style={{ maxHeight: '80px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <h2 className="h3 mb-2 fw-bold">Acceso al Panel de Control</h2>
            <p className="text-muted">Ingrese sus credenciales para continuar</p>
          </div>
          
          {error && (
            <Alert variant="danger" className="d-flex align-items-center" onClose={() => setError('')} dismissible>
              <ExclamationTriangle className="me-2" />
              <div>{error}</div>
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className="mt-4">
            <Form.Group className="mb-3" controlId="username">
              <Form.Label className="fw-medium">Usuario</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <Person className="text-muted" />
                </span>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  disabled={loading}
                  autoComplete="username"
                  className="py-2"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <div className="d-flex justify-content-between">
                <Form.Label className="fw-medium">Contraseña</Form.Label>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 text-decoration-none"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <small>{showPassword ? 'Ocultar' : 'Mostrar'}</small>
                </Button>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <Lock className="text-muted" />
                </span>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  disabled={loading}
                  autoComplete="current-password"
                  className="py-2"
                />
              </div>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 py-2 mb-3 fw-medium"
              disabled={loading || !username.trim() || !password.trim()}
            >
              {loading ? (
                <>
                  <Spinner as="span" size="sm" animation="border" role="status" className="me-2" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-muted small mb-2">
                ¿Problemas para acceder? Contacte al administrador
              </p>
              <div className="bg-light p-2 rounded small">
                <div className="text-muted">Credenciales de prueba:</div>
                <div className="fw-medium">Usuario: <span className="text-primary">admin</span></div>
                <div className="fw-medium">Contraseña: <span className="text-primary">admin123</span></div>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginPage;
