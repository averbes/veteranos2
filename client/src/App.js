import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import TeamPage from './pages/TeamPage';
import Phase2Page from './pages/Phase2Page';
import SchedulePage from './pages/SchedulePage';
import StatisticsPage from './pages/StatisticsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Import the CSS for animations and custom styles
import 'animate.css/animate.min.css';

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 py-4">
          <Container className="animate__animated animate__fadeIn">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/equipo/:teamId" element={<TeamPage />} />
              <Route path="/equipos" element={<TeamPage />} />
              <Route path="/fase2" element={<Phase2Page />} />
              <Route path="/clasificacion" element={<StatisticsPage />} />
              <Route path="/calendario" element={<SchedulePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              {/* Add more routes as needed */}
              <Route path="*" element={
                <div className="text-center py-5">
                  <h1 className="display-1 fw-bold text-primary">404</h1>
                  <h2 className="mb-4">Página no encontrada</h2>
                  <p className="lead">Lo sentimos, la página que estás buscando no existe.</p>
                  <a href="/" className="btn btn-primary btn-lg mt-3">
                    Volver al Inicio
                  </a>
                </div>
              } />
            </Routes>
          </Container>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
