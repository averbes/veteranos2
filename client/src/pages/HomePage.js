import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Trophy, CalendarEvent, People, GraphUp, ArrowRight } from 'react-bootstrap-icons';
import Standings from '../components/Standings';
import './HomePage.css';
import '../components/Schedule.css'; // Re-using styles for match cards

function HomePage() {
  const [standings, setStandings] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [standingsRes, scheduleRes] = await Promise.all([
          fetch('/api/standings'),
          fetch('/api/schedule')
        ]);

        if (!standingsRes.ok || !scheduleRes.ok) {
          throw new Error('Error al cargar los datos');
        }

        const standingsData = await standingsRes.json();
        const scheduleData = await scheduleRes.json();

        setStandings(standingsData);
        setSchedule(scheduleData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('No se pudieron cargar los datos. Por favor, intente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const teamsMap = useMemo(() => {
    return standings.reduce((acc, team) => {
      acc[team.id] = { name: team.name, logo: `https://ui-avatars.com/api/?name=${team.name.substring(0, 2)}&background=random&color=FFFFFF&font-size=0.4` };
      return acc;
    }, {});
  }, [standings]);

  const upcomingMatches = useMemo(() => {
    const now = new Date();
    return schedule
      .filter(match => new Date(match.match_date) > now)
      .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
      .slice(0, 3);
  }, [schedule]);

  const features = [
    {
      icon: <Trophy size={40} className="text-primary mb-3" />,
      title: 'Clasificación',
      description: 'Sigue la tabla de posiciones en tiempo real y conoce a los líderes del torneo.',
      link: '/clasificacion',
      linkText: 'Ver Clasificación'
    },
    {
      icon: <CalendarEvent size={40} className="text-primary mb-3" />,
      title: 'Calendario',
      description: 'Consulta las fechas, horarios y resultados de todos los partidos programados.',
      link: '/calendario',
      linkText: 'Ver Calendario'
    },
    {
      icon: <People size={40} className="text-primary mb-3" />,
      title: 'Equipos',
      description: 'Conoce a todos los equipos participantes y sus estadísticas detalladas.',
      link: '/equipos',
      linkText: 'Ver Equipos'
    },
    {
      icon: <GraphUp size={40} className="text-primary mb-3" />,
      title: 'Estadísticas',
      description: 'Analiza las estadísticas detalladas de jugadores y equipos del torneo.',
      link: '/estadisticas',
      linkText: 'Ver Estadísticas'
    }
  ];

  const formatDate = (dateString) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <span className="ms-3 fs-5">Cargando...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section bg-dark text-white py-5">
        <Container>
          <Row className="align-items-center gy-4">
            <Col lg={6}>
              <Badge bg="primary" pill className="mb-3 px-3 py-2 fw-bold">Temporada 2024</Badge>
              <h1 className="display-4 fw-bold mb-3">Torneo Veteranos</h1>
              <p className="lead mb-4 opacity-75">
                Disfruta de la mejor competencia de fútbol sala. Sigue a tu equipo favorito, conoce los resultados y mantente al día con todas las novedades.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Button as={Link} to="/calendario" variant="primary" size="lg" className="px-4">
                  Ver Calendario <ArrowRight className="ms-2" />
                </Button>
                <Button as={Link} to="/clasificacion" variant="outline-light" size="lg" className="px-4">
                  Ver Clasificación
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image-container">
                <img
                  src="/seleccion.png"
                  alt="Jugadores de fútbol sala"
                  className="img-fluid rounded-3 shadow-lg"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">Todo lo que necesitas saber</h2>
            <p className="text-muted lead fs-5">Sigue cada detalle del torneo en un solo lugar.</p>
          </div>
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col key={index} md={6} lg={3}>
                <Card as={Link} to={feature.link} className="h-100 border-0 shadow-sm text-decoration-none hover-lift feature-card">
                  <Card.Body className="text-center p-4">
                    {feature.icon}
                    <h5 className="mb-2 fw-bold">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </Card.Body>
                  <Card.Footer className="bg-transparent border-0 text-center pb-3">
                    <span className="fw-bold text-primary">{feature.linkText} <ArrowRight className="ms-1" /></span>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Standings Preview */}
      <section className="py-5 bg-light">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-0">Clasificación</h2>
              <p className="text-muted mb-0">Los 5 mejores equipos del torneo.</p>
            </div>
            <Button as={Link} to="/clasificacion" variant="outline-primary">Ver completa</Button>
          </div>
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              <Standings teams={standings.slice(0, 5)} />
            </Card.Body>
          </Card>
        </Container>
      </section>

      {/* Upcoming Matches */}
      <section className="py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-0">Próximos Partidos</h2>
              <p className="text-muted mb-0">No te pierdas la próxima jornada.</p>
            </div>
            <Button as={Link} to="/calendario" variant="outline-primary">Ver calendario</Button>
          </div>
          {upcomingMatches.length > 0 ? (
            <Row className="g-4">
              {upcomingMatches.map((match) => (
                <Col key={match.id} md={6} lg={4}>
                  <Card className="h-100 border-0 shadow-sm match-card">
                    <Card.Body className="p-4">
                      <div className="text-center text-muted small mb-3">{formatDate(match.match_date)}</div>
                      <Row className="align-items-center text-center">
                        <Col>
                          <img src={teamsMap[match.home_team_id]?.logo} alt="" className="team-logo-schedule mb-2" />
                          <div className="fw-bold">{teamsMap[match.home_team_id]?.name}</div>
                        </Col>
                        <Col xs={2} className="fw-bold fs-4 text-muted">vs</Col>
                        <Col>
                          <img src={teamsMap[match.away_team_id]?.logo} alt="" className="team-logo-schedule mb-2" />
                          <div className="fw-bold">{teamsMap[match.away_team_id]?.name}</div>
                        </Col>
                      </Row>
                    </Card.Body>
                    <Card.Footer className="bg-transparent border-top-0 text-center py-3">
                      <small className="text-muted">{match.venue || 'Estadio Principal'}</small>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">No hay próximos partidos programados en este momento.</Alert>
          )}
        </Container>
      </section>

      {/* Call to Action */}
      <section className="py-5 bg-primary text-white">
        <Container className="text-center py-4">
          <h2 className="fw-bold mb-3">¿Listo para seguir la acción?</h2>
          <p className="lead mb-4">No te pierdas ni un solo momento del torneo.</p>
          <Button as={Link} to="/clasificacion" variant="light" size="lg" className="px-5 py-3">
            Explorar Equipos
          </Button>
        </Container>
      </section>
    </div>
  );
}

export default HomePage;
