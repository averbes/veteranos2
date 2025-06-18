import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import TeamPage from './pages/TeamPage';
import Phase2Page from './pages/Phase2Page';
import StatisticsPage from './pages/StatisticsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <Container className="flex-grow-1 py-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/equipo/:teamId" element={<TeamPage />} />
            <Route path="/fase2" element={<Phase2Page />} />
            <Route path="/clasificacion" element={<StatisticsPage />} />
            <Route path="/calendario" element={<Phase2Page />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Container>
        <footer className="bg-dark text-white py-3 mt-auto">
          <Container>
            <p className="text-center mb-0">
              {new Date().getFullYear()} Torneo de Microfútbol - Todos los derechos reservados
            </p>
          </Container>
        </footer>
      </div>
    </Router>
  );
}

export default App;
