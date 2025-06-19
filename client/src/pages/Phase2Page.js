import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import './Phase2Page.css';

function Phase2Page() {
  const [phase2Data, setPhase2Data] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPhase2Data = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/phase2');
        if (!response.ok) {
          throw new Error('La Fase 2 aún no ha comenzado o no se pudo cargar.');
        }
        const data = await response.json();
        setPhase2Data(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPhase2Data();
  }, []);

  const renderGroup = (groupName, groupData) => {
    if (!groupData || !groupData.standings || !groupData.schedule) {
        return (
            <Col md={6} className="mb-4">
                <Card className="shadow-sm h-100">
                    <Card.Header as="h2" className="text-center group-header">{groupName}</Card.Header>
                    <Card.Body>
                        <Alert variant="warning">Datos del grupo no disponibles o el grupo aún no ha comenzado.</Alert>
                    </Card.Body>
                </Card>
            </Col>
        );
    }

    const { standings, schedule } = groupData;

    return (
      <Col md={6} className="mb-4">
        <Card className="shadow-sm h-100">
          <Card.Header as="h2" className="text-center group-header">{groupName}</Card.Header>
          <Card.Body>
            <h3 className="mt-2 mb-3 text-center">Clasificación</h3>
            <Table responsive striped bordered hover size="sm" className="standings-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Equipo</th>
                  <th>Pts</th>
                  <th>PJ</th>
                  <th>PG</th>
                  <th>PE</th>
                  <th>PP</th>
                  <th>GF</th>
                  <th>GC</th>
                  <th>GD</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, index) => (
                  <tr key={team._id}>
                    <td>{index + 1}</td>
                    <td>{team.name}</td>
                    <td><strong>{team.pts}</strong></td>
                    <td>{team.pj}</td>
                    <td>{team.pg}</td>
                    <td>{team.pe}</td>
                    <td>{team.pp}</td>
                    <td>{team.gf}</td>
                    <td>{team.gc}</td>
                    <td>{team.gd}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <h3 className="mt-4 mb-3 text-center">Calendario de Partidos</h3>
            {schedule.length > 0 ? schedule.map((match, index) => (
              <div key={index} className="match-item p-2 mb-2 rounded bg-light">
                <Row className="align-items-center text-center">
                  <Col xs={5} className="team-name fw-bold">{match.home.name}</Col>
                  <Col xs={2}><Badge bg="dark">VS</Badge></Col>
                  <Col xs={5} className="team-name fw-bold">{match.away.name}</Col>
                </Row>
              </div>
            )) : (
                <Alert variant="info">No hay partidos programados para este grupo.</Alert>
            )}
          </Card.Body>
        </Card>
      </Col>
    );
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando datos de la Fase Final...</p>
      </Container>
    );
  }

  if (error) {
    return <Container><Alert variant="danger" className="mt-4">{error}</Alert></Container>;
  }

  return (
    <Container className="phase2-page-container mt-4">
      <Row>
        <Col>
          <h1 className="text-center mb-4">Fase Final del Torneo</h1>
        </Col>
      </Row>
      {phase2Data ? (
        <Row>
          {renderGroup('Grupo A (Impares)', phase2Data.oddGroup)}
          {renderGroup('Grupo B (Pares)', phase2Data.evenGroup)}
        </Row>
      ) : (
        <Row>
            <Col>
                <Alert variant="info">No hay datos disponibles para la fase final.</Alert>
            </Col>
        </Row>
      )}
    </Container>
  );
}

export default Phase2Page;
