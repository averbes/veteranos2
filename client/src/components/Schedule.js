import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, ListGroup, Badge } from 'react-bootstrap';
import { CalendarWeek, ShieldShaded } from 'react-bootstrap-icons';
import './Schedule.css';

function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleRes, teamsRes] = await Promise.all([
          fetch('/api/schedule'),
          fetch('/api/standings')
        ]);

        if (!scheduleRes.ok || !teamsRes.ok) {
          throw new Error('Failed to fetch data');
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
    return teams.reduce((acc, team) => {
      acc[team.id] = { name: team.name, logo: `https://ui-avatars.com/api/?name=${team.name.substring(0, 2)}&background=random&color=FFFFFF&font-size=0.4` };
      return acc;
    }, {});
  }, [teams]);

  const groupedSchedule = useMemo(() => {
    const grouped = schedule.reduce((acc, match) => {
        const date = new Date(match.match_date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[match.round]) {
            acc[match.round] = {};
        }
        if (!acc[match.round][date]) {
            acc[match.round][date] = [];
        }
        acc[match.round][date].push(match);
        return acc;
    }, {});
    return grouped;
  }, [schedule]);

  const renderRound = (roundNumber) => {
    const roundData = groupedSchedule[roundNumber];
    if (!roundData) return <p>No hay partidos para esta vuelta.</p>;

    return Object.entries(roundData).map(([date, matches]) => (
      <Card key={date} className="mb-4 shadow-sm">
        <Card.Header as="h6" className="fw-bold text-muted bg-light">
          <CalendarWeek className="me-2" /> {date}
        </Card.Header>
        <ListGroup variant="flush">
          {matches.map(match => (
            <ListGroup.Item key={match.id} className="match-item">
              <Row className="align-items-center text-center">
                <Col xs={5} className="team-info">
                  <img src={teamsMap[match.home_team_id]?.logo} alt="" className="team-logo-schedule me-2" />
                  <span className="team-name-schedule fw-bold">{teamsMap[match.home_team_id]?.name}</span>
                </Col>
                <Col xs={2} className="match-separator">
                  <Badge pill bg="secondary" className="px-2 py-1">VS</Badge>
                </Col>
                <Col xs={5} className="team-info">
                  <span className="team-name-schedule fw-bold">{teamsMap[match.away_team_id]?.name}</span>
                  <img src={teamsMap[match.away_team_id]?.logo} alt="" className="team-logo-schedule ms-2" />
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
    ));
  };

  if (loading) {
    return <Container className="text-center py-5"><Spinner animation="border" variant="primary" /> <span className="ms-2">Cargando Calendario...</span></Container>;
  }

  if (error) {
    return <Container><Alert variant="danger">Error: {error}</Alert></Container>;
  }

  return (
    <Container className="schedule-container my-4">
        <Card className="shadow-sm mb-4 standings-header-card">
            <Card.Header as="div" className="p-3 bg-dark text-white">
                <div className="d-flex align-items-center">
                    <ShieldShaded size={40} className="me-3"/>
                    <div>
                        <h1 className="h5 mb-0 fw-bold">CALENDARIO DE PARTIDOS</h1>
                        <small className="opacity-75">Liga BetPlay 2024</small>
                    </div>
                </div>
            </Card.Header>
        </Card>

      <Row>
        <Col md={6}>
          <h4 className="mb-3 text-center round-title">Primera Vuelta (Ida)</h4>
          {renderRound(1)}
        </Col>
        <Col md={6}>
          <h4 className="mb-3 text-center round-title">Segunda Vuelta (Vuelta)</h4>
          {renderRound(2)}
        </Col>
      </Row>
    </Container>
  );
}

export default Schedule;
