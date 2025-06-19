import React, { useState, useEffect } from 'react';
import { Navbar as BSNavbar, Nav, Container, Button, Dropdown, Image } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import { BoxArrowRight, Gear } from 'react-bootstrap-icons';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const userProfileIcon = (
    <Image
      src={`https://ui-avatars.com/api/?name=${currentUser?.username?.charAt(0)}&background=0D6EFD&color=fff&size=30`}
      roundedCircle
      alt={currentUser?.username}
      className="me-2"
    />
  );

  return (
    <BSNavbar
      bg="dark"
      variant="dark"
      expand="lg"
      fixed="top"
      className={`main-navbar py-2 ${scrolled ? 'scrolled shadow' : ''}`}
      collapseOnSelect
    >
      <Container fluid="lg">
        <BSNavbar.Brand as={NavLink} to="/" className="fw-bold d-flex align-items-center">
          <img
            src="/logo192.png"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
            alt="Logo"
          />
          <span>Torneo Veteranos</span>
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="main-navbar-nav" />
        <BSNavbar.Collapse id="main-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link as={NavLink} to="/" end>Inicio</Nav.Link>
            <Nav.Link as={NavLink} to="/clasificacion">Clasificación</Nav.Link>
            <Nav.Link as={NavLink} to="/calendario">Calendario</Nav.Link>
          </Nav>
          <Nav>
            {currentUser ? (
              <Dropdown align="end">
                <Dropdown.Toggle as={Nav.Link} id="user-dropdown" className="d-flex align-items-center p-0">
                  {userProfileIcon}
                  <span className="d-none d-lg-inline">{currentUser.username}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu variant="dark" className="mt-2">
                  {currentUser && currentUser.role === 'admin' && (
                    <Dropdown.Item as={NavLink} to="/admin">
                      <Gear className="me-2" /> Administración
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <BoxArrowRight className="me-2" /> Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button as={NavLink} to="/login" variant="outline-light">
                Iniciar Sesión
              </Button>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

export default Navbar;
