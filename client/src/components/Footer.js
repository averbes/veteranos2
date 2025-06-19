import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Envelope, Telephone, GeoAlt } from 'react-bootstrap-icons';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer bg-dark text-white mt-auto py-5">
      <Container>
        <Row className="gy-4">
          <Col lg={4} md={12} className="text-center text-lg-start">
            <h5 className="text-uppercase fw-bold mb-4">Torneo Veteranos</h5>
            <p className="footer-text">
              Competición, diversión y compañerismo en el mejor torneo de fútbol sala para veteranos.
            </p>
            <div className="social-icons mt-4">
              <a href="https://facebook.com" className="social-icon me-3" aria-label="Facebook"><Facebook size={22} /></a>
              <a href="https://twitter.com" className="social-icon me-3" aria-label="Twitter"><Twitter size={22} /></a>
              <a href="https://instagram.com" className="social-icon" aria-label="Instagram"><Instagram size={22} /></a>
            </div>
          </Col>

          <Col lg={2} md={6}>
            <h5 className="text-uppercase fw-bold mb-4">Navegación</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/clasificacion">Clasificación</Link></li>
              <li><Link to="/calendario">Calendario</Link></li>
              <li><Link to="/reglamento">Reglamento</Link></li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h5 className="text-uppercase fw-bold mb-4">Legal</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/terminos">Términos y Condiciones</Link></li>
              <li><Link to="/privacidad">Política de Privacidad</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </Col>

          <Col lg={3} md={12} className="text-center text-lg-start">
            <h5 className="text-uppercase fw-bold mb-4">Contacto</h5>
            <ul className="list-unstyled footer-contact">
              <li className="d-flex align-items-center mb-3">
                <GeoAlt className="me-3 flex-shrink-0" size={20} />
                <span>Av. Deportiva 123, Ciudad Deportiva</span>
              </li>
              <li className="d-flex align-items-center mb-3">
                <Envelope className="me-3 flex-shrink-0" />
                <a href="mailto:info@torneoveteranos.com">info@torneoveteranos.com</a>
              </li>
              <li className="d-flex align-items-center">
                <Telephone className="me-3 flex-shrink-0" />
                <a href="tel:+1234567890">+1 (234) 567-890</a>
              </li>
            </ul>
          </Col>
        </Row>

        <div className="footer-bottom text-center pt-4 mt-4">
          <p className="mb-0">&copy; {currentYear} Torneo Veteranos. Todos los derechos reservados.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
