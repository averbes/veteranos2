import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Spinner, Alert, ListGroup, Badge } from 'react-bootstrap';
import { PersonPlus, PencilSquare, Trash3, ShieldShaded } from 'react-bootstrap-icons';
import './TeamPage.css';

function TeamPage() {
  // State for single team view
  const [teamDetails, setTeamDetails] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // State for all teams list view
  const [teamsList, setTeamsList] = useState([]);

  // Common state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { teamId } = useParams();

  // Fetch single team details
  const fetchTeamDetails = useCallback(async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/teams/${teamId}`);
      if (!response.ok) throw new Error('No se pudo cargar la información del equipo.');
      const data = await response.json();
      setTeamDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  // Fetch all teams
  const fetchAllTeams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/standings');
      if (!response.ok) throw new Error('No se pudo cargar la lista de equipos.');
      const data = await response.json();
      setTeamsList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    if (teamId) {
      setTeamDetails(null); // Reset details when switching to a single team view
      fetchTeamDetails();
    } else {
      setTeamsList([]); // Reset list when switching to all teams view
      fetchAllTeams();
    }
  }, [teamId, fetchTeamDetails, fetchAllTeams]);

  // Modal and player handling functions
  const handleShowModal = (player = null) => {
    setEditingPlayer(player);
    setPlayerName(player ? player.name : '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlayer(null);
    setPlayerName('');
  };

  const handleSavePlayer = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const url = editingPlayer
      ? `/api/admin/players/${editingPlayer._id}`
      : '/api/admin/players';
    const method = editingPlayer ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('token'),
        },
        body: JSON.stringify({ name: playerName, teamId: teamId }),
      });

      if (response.ok) {
        fetchTeamDetails();
        handleCloseModal();
      } else {
        const errData = await response.json();
        alert(`Error al guardar el jugador: ${errData.message}`);
      }
    } catch (err) {
      console.error('Error saving player:', err);
      alert('Error de conexión al guardar el jugador.');
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este jugador?')) {
      try {
        const response = await fetch(`/api/admin/players/${playerId}`, {
          method: 'DELETE',
          headers: { 'x-access-token': localStorage.getItem('token') },
        });
        if (response.ok) {
          fetchTeamDetails();
        } else {
          const errData = await response.json();
          alert(`Error al eliminar el jugador: ${errData.message}`);
        }
      } catch (err) {
        console.error('Error deleting player:', err);
        alert('Error de conexión al eliminar el jugador.');
      }
    }
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando...</p>
      </Container>
    );
  }

  if (error) {
    return <Container><Alert variant="danger" className="mt-4">{error}</Alert></Container>;
  }

  // --- Render All Teams List ---
  if (!teamId) {
    return (
      <Container className="py-4">
        <h1 className="mb-4 text-center">Todos los Equipos</h1>
        <Row>
          {teamsList.map(team => (
            <Col md={6} lg={4} key={team._id} className="mb-4">
              <Card className="h-100 team-card-list shadow-sm">
                <Card.Body className="d-flex flex-column text-center">
                  <img 
                    src={team.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name.substring(0, 2))}&background=random&color=FFFFFF&font-size=0.4`}
                    alt={`${team.name} logo`} 
                    className="team-logo-list mb-3 mx-auto" 
                  />
                  <Card.Title as="h4" className="flex-grow-1">{team.name}</Card.Title>
                  <Button as={Link} to={`/equipo/${team._id}`} variant="primary" className="mt-3 w-100">
                    Ver Plantilla y Estadísticas
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  // --- Render Single Team Details ---
  if (!teamDetails) return <Container><Alert variant="warning" className="mt-4">No se encontraron datos para este equipo.</Alert></Container>;

  const { name, players, ...stats } = teamDetails;

  return (
    <div className="team-page-container">
      <Container className="py-4">
        <Row className="align-items-center mb-4">
          <Col>
            <h1 className="team-name-header"><ShieldShaded className="me-3"/>{name}</h1>
          </Col>
          {isAdmin && (
            <Col xs="auto">
              <Button variant="primary" onClick={() => handleShowModal()}>
                <PersonPlus size={20} className="me-2" />
                Agregar Jugador
              </Button>
            </Col>
          )}
        </Row>

        <Row>
          <Col lg={8} className="mb-4 mb-lg-0">
            <Card className="shadow-sm h-100">
              <Card.Header as="h5">Plantilla de Jugadores</Card.Header>
              <Card.Body>
                <Table responsive hover className="players-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Goles</th>
                      <th>Amarillas</th>
                      <th>Rojas</th>
                      <th>Azules</th>
                      {isAdmin && <th className="text-center">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {players && players.length > 0 ? players.map((player) => (
                      <tr key={player._id}>
                        <td>{player.name}</td>
                        <td>{player.goals || 0}</td>
                        <td>{player.yellow_cards || 0}</td>
                        <td>{player.red_cards || 0}</td>
                        <td>{player.blue_cards || 0}</td>
                        {isAdmin && (
                          <td className="text-center">
                            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleShowModal(player)}>
                              <PencilSquare />
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeletePlayer(player._id)}>
                              <Trash3 />
                            </Button>
                          </td>
                        )}
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="text-center text-muted py-4">No hay jugadores registrados.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Header as="h5">Estadísticas del Equipo</Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">Puntos <Badge bg="primary" pill>{stats.pts}</Badge></ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">Partidos Jugados <Badge bg="secondary" pill>{stats.pj}</Badge></ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">Victorias <Badge bg="success" pill>{stats.pg}</Badge></ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">Empates <Badge bg="warning" text="dark" pill>{stats.pe}</Badge></ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">Derrotas <Badge bg="danger" pill>{stats.pp}</Badge></ListGroup.Item>
                <ListGroup.Item>Goles a Favor: {stats.gf}</ListGroup.Item>
                <ListGroup.Item>Goles en Contra: {stats.gc}</ListGroup.Item>
                <ListGroup.Item>Diferencia de Goles: {stats.gd}</ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>

        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editingPlayer ? 'Editar Jugador' : 'Agregar Nuevo Jugador'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSavePlayer}>
              <Form.Group controlId="playerName">
                <Form.Label>Nombre del Jugador</Form.Label>
                <Form.Control
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ingrese el nombre completo"
                  required
                  autoFocus
                />
              </Form.Group>
              <div className="d-flex justify-content-end mt-4">
                <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  {editingPlayer ? 'Guardar Cambios' : 'Agregar Jugador'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}

export default TeamPage;
