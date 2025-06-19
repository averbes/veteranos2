import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { CalendarEvent } from 'react-bootstrap-icons';
import '../components/Schedule.css'; // Reutilizamos los estilos

function SchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [scheduleRes, teamsRes] = await Promise.all([
          fetch('/api/schedule'),
          fetch('/api/standings') // Usamos standings para obtener los equipos y sus logos
        ]);

        if (!scheduleRes.ok || !teamsRes.ok) {
          throw new Error('Error al cargar los datos del calendario');
        }

        const scheduleData = await scheduleRes.json();
        const teamsData = await teamsRes.json();

        setSchedule(scheduleData);
        setTeams(teamsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const teamsMap = useMemo(() => {
    if (!teams) return {};
    return teams.reduce((acc, team) => {
      acc[team._id] = { name: team.name, logo: team.logo || `https://ui-avatars.com/api/?name=${team.name.substring(0, 2)}&background=random&color=FFFFFF&font-size=0.4` };
      return acc;
    }, {});
  }, [teams]);

  const groupedSchedule = useMemo(() => {
    return schedule.reduce((acc, match) => {
      const round = match.round || 'N/A';
      if (!acc[round]) {
        acc[round] = [];
      }
      acc[round].push(match);
      return acc;
    }, {});
  }, [schedule]);

  if (loading) return <div className="text-center"><Spinner animation="border" variant="primary" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container>
      <h1 className="mb-4 text-center"><CalendarEvent className="me-2" /> Calendario de Partidos</h1>
      {Object.keys(groupedSchedule).map(round => (
        <div key={round} className="mb-5">
          <h2 className="round-title">Jornada {round}</h2>
          <Row>
            {groupedSchedule[round].map(match => (
              <Col md={6} lg={4} key={match._id} className="mb-4">
                <Card className="match-card h-100">
                  <Card.Body>
                    <div className="match-card-teams">
                      <div className="team-info">
                        <img src={teamsMap[match.home_team?._id]?.logo} alt={match.home_team?.name} className="team-logo" />
                        <span>{match.home_team?.name}</span>
                      </div>
                      <div className="match-card-score">
                        {match.home_score !== null ? 
                          <Badge bg="primary" className="score-badge">{match.home_score} - {match.away_score}</Badge> : 
                          <Badge bg="secondary">VS</Badge>}
                      </div>
                      <div className="team-info">
                        <img src={teamsMap[match.away_team?._id]?.logo} alt={match.away_team?.name} className="team-logo" />
                        <span>{match.away_team?.name}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </Container>
  );
}

export default SchedulePage;
