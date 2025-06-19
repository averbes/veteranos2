import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Accordion, Modal, Table, InputGroup, ListGroup, Tabs, Tab } from 'react-bootstrap';
import { FaUsers, FaTrophy, FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaSave, FaChartBar } from 'react-icons/fa';
import api from '../services/api'; // Use the configured api service
import './AdminPage.css';

// Main Admin Page Component
function AdminPage() {
  const [schedule, setSchedule] = useState({});
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // State for Player Stats Modal
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [stats, setStats] = useState({});

  // State for Player Editor Modal
  const [showPlayerEditor, setShowPlayerEditor] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState({ id: null, name: '' });

  const fetchPhase2Schedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/phase2/schedule'); // Use api.get
      const data = response.data;
      setSchedule(data);
      const initialResults = {};
      Object.values(data).flat(2).forEach(match => {
        initialResults[match._id] = {
          home_score: match.home_score !== null ? match.home_score : '',
          away_score: match.away_score !== null ? match.away_score : '',
        };
      });
      setResults(initialResults);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar el calendario.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhase2Schedule();
  }, [fetchPhase2Schedule]);

  const handleResultChange = (matchId, team, value) => {
    const score = value === '' ? '' : parseInt(value, 10);
    setResults(prev => ({ ...prev, [matchId]: { ...prev[matchId], [team]: isNaN(score) ? '' : score } }));
  };

  const handleSaveResult = async (matchId, playerStats = []) => {
    const result = results[matchId];
    if (result.home_score === '' || result.away_score === '') {
      return alert('Por favor, introduce un resultado para ambos equipos.');
    }
    setSaving(true);
    try {
      const response = await api.post(`/admin/matches/${matchId}`, { // Use api.post
        home_score: parseInt(result.home_score),
        away_score: parseInt(result.away_score),
        playerStats: playerStats
      });
      const data = response.data;
      if (!data.success) throw new Error(data.message || 'Error al guardar el resultado');
      alert('Resultado y estadísticas guardados exitosamente.');
      fetchPhase2Schedule();
    } catch (err) {
      console.error('Error updating match:', err);
      alert(`Error al guardar: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenStatsModal = async (match) => {
    setCurrentMatch(match);
    const fetchPlayers = async (teamId) => {
      const res = await api.get(`/teams/${teamId}/players`); // Use api.get
      return res.data;
    };
    const [home, away] = await Promise.all([
      fetchPlayers(match.home_team._id),
      fetchPlayers(match.away_team._id)
    ]);
    const initialStats = {};
    [...home, ...away].forEach(p => {
      initialStats[p._id] = { goals: 0, yellowCards: 0, redCards: 0, blueCards: 0 };
    });
    setStats({ home, away, stats: initialStats });
    setShowStatsModal(true);
  };

  const handleSaveStats = () => {
    const playerStats = Object.entries(stats.stats)
      .filter(([, s]) => s.goals > 0 || s.yellowCards > 0 || s.redCards > 0 || s.blueCards > 0)
      .map(([playerId, s]) => ({ playerId, ...s }));
    handleSaveResult(currentMatch._id, playerStats);
    setShowStatsModal(false);
  };

  const handleOpenPlayerEditor = (id, name) => {
    setSelectedTeam({ id, name });
    setShowPlayerEditor(true);
  };

  const renderGroup = (name, matches) => {
    if (!Array.isArray(matches) || matches.length === 0) {
      return <Alert variant="info">No hay partidos para mostrar en este grupo.</Alert>;
    }

    return (
      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white">{name}</Card.Header>
        <ListGroup variant="flush">
          {matches.map(match => (
            <ListGroup.Item key={match._id} className="p-3">
              <Row className="align-items-center">
                <Col xs={12} md={5} className="text-center text-md-start mb-2 mb-md-0">
                  <Button variant="info" onClick={() => handleOpenPlayerEditor(match.home_team._id, match.home_team.name)}><FaUsers className="me-2" />{match.home_team.name}</Button>
                </Col>
                <Col xs={12} md={2}>
                  <InputGroup>
                    <Form.Control type="number" value={results[match._id]?.home_score ?? ''} onChange={e => handleResultChange(match._id, 'home_score', e.target.value)} className="text-center fw-bold" />
                    <Form.Control type="number" value={results[match._id]?.away_score ?? ''} onChange={e => handleResultChange(match._id, 'away_score', e.target.value)} className="text-center fw-bold" />
                  </InputGroup>
                </Col>
                <Col xs={12} md={5} className="text-center text-md-end mt-2 mt-md-0">
                  <Button variant="info" onClick={() => handleOpenPlayerEditor(match.away_team._id, match.away_team.name)}>{match.away_team.name}<FaUsers className="ms-2" /></Button>
                </Col>
              </Row>
              <div className="d-flex justify-content-center mt-2">
                <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleOpenStatsModal(match)}><FaChartBar className="me-1" />Estadísticas</Button>
                <Button variant="success" size="sm" onClick={() => handleSaveResult(match._id)} disabled={saving}><FaSave className="me-1" />Guardar</Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
    );
  };

  if (loading) return <div className="text-center"><Spinner animation="border" /> <span className="ms-2">Cargando Panel de Admin...</span></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!schedule) return <Alert variant="info">No hay calendario para la Fase 2.</Alert>;

  return (
    <Container fluid className="mt-4">
      <h1 className="mb-4 text-center">Panel de Administración</h1>
      <Tabs defaultActiveKey="teams" id="admin-tabs" className="mb-3" fill>
        <Tab eventKey="teams" title={<><FaUsers className="me-2" /> Gestionar Equipos</>}>
          <TeamManager />
        </Tab>
        <Tab eventKey="matches" title={<><FaTrophy className="me-2" /> Gestionar Resultados</>}>
          <Container fluid>
            <Accordion defaultActiveKey={Object.keys(schedule)[0] || '0'}>
              {Object.entries(schedule).map(([groupName, rounds]) => (
                <Accordion.Item eventKey={groupName} key={groupName}>
                  <Accordion.Header>{groupName}</Accordion.Header>
                  <Accordion.Body>
                    {Object.entries(rounds).map(([roundName, matches]) => (
                      <div key={roundName}>
                        <h4 className="mt-3">{roundName}</h4>
                        {renderGroup(roundName, matches)}
                      </div>
                    ))}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
            <PlayerStatsModal show={showStatsModal} onHide={() => setShowStatsModal(false)} onSave={handleSaveStats} match={currentMatch} statsData={stats} setStatsData={setStats} />
            <PlayerEditorModal show={showPlayerEditor} onHide={() => setShowPlayerEditor(false)} team={selectedTeam} onSaveSuccess={fetchPhase2Schedule} />
          </Container>
        </Tab>
        <Tab eventKey="calendar" title={<><FaCalendarAlt className="me-2" /> Gestionar Calendario</>}>
          <CalendarManager />
        </Tab>
      </Tabs>
    </Container>
  );
}

// Modal for Player Stats
function PlayerStatsModal({ show, onHide, onSave, match, statsData, setStatsData }) {
  const handleStatChange = (playerId, field, value) => {
    const intValue = Math.max(0, parseInt(value) || 0);
    setStatsData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [playerId]: { ...prev.stats[playerId], [field]: intValue }
      }
    }));
  };

  const renderPlayerRows = (players) => players.map(player => (
    <tr key={player._id}>
      <td>{player.name}</td>
      <td><Form.Control type="number" size="sm" value={statsData.stats[player._id]?.goals ?? ''} onChange={e => handleStatChange(player._id, 'goals', e.target.value)} /></td>
      <td><Form.Control type="number" size="sm" value={statsData.stats[player._id]?.yellowCards ?? ''} onChange={e => handleStatChange(player._id, 'yellowCards', e.target.value)} /></td>
      <td><Form.Control type="number" size="sm" value={statsData.stats[player._id]?.redCards ?? ''} onChange={e => handleStatChange(player._id, 'redCards', e.target.value)} /></td>
      <td><Form.Control type="number" size="sm" value={statsData.stats[player._id]?.blueCards ?? ''} onChange={e => handleStatChange(player._id, 'blueCards', e.target.value)} /></td>
    </tr>
  ));

  if (!match || !statsData.home || !statsData.away) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Estadísticas del Partido: {match.home_team.name} vs {match.away_team.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <h5>{match.home_team.name}</h5>
            <Table striped bordered hover responsive size="sm">
              <thead><tr><th>Jugador</th><th>G</th><th>A</th><th>R</th><th>AZ</th></tr></thead>
              <tbody>{renderPlayerRows(statsData.home)}</tbody>
            </Table>
          </Col>
          <Col md={6}>
            <h5>{match.away_team.name}</h5>
            <Table striped bordered hover responsive size="sm">
              <thead><tr><th>Jugador</th><th>G</th><th>A</th><th>R</th><th>AZ</th></tr></thead>
              <tbody>{renderPlayerRows(statsData.away)}</tbody>
            </Table>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={onSave}><FaSave className="me-2" />Guardar Estadísticas</Button>
      </Modal.Footer>
    </Modal>
  );
}

// Modal for Player Editor
function PlayerEditorModal({ show, onHide, team, onSaveSuccess }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');

  useEffect(() => {
    if (team.id) {
      setLoading(true);
      api.get(`/teams/${team.id}/players`) // Use api.get
        .then(res => setPlayers(res.data))
        .catch(err => console.error('Error fetching players:', err))
        .finally(() => setLoading(false));
    }
  }, [team.id]);

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    try {
      const response = await api.post('/admin/players', { // Use api.post
        name: newPlayerName,
        teamId: team.id
      });
      setPlayers(prev => [...prev, response.data]);
      setNewPlayerName('');
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      alert('Error al añadir jugador: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('¿Seguro que quieres eliminar este jugador?')) return;
    try {
      const response = await api.delete(`/admin/players/${playerId}`); // Use api.delete
      if (response.status === 200) {
        setPlayers(prev => prev.filter(p => p._id !== playerId));
        if (onSaveSuccess) onSaveSuccess();
      }
    } catch (error) {
      alert('Error al eliminar jugador: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editando Jugadores de: {team.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? <Spinner animation="border" /> : (
          <>
            <ListGroup>
              {players.map(p => (
                <ListGroup.Item key={p._id} className="d-flex justify-content-between align-items-center">
                  {p.name}
                  <div>
                    {/* Edit button can be added here if needed */}
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeletePlayer(p._id)}><FaTrash /> Eliminar</Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <hr />
            <Form onSubmit={handleAddPlayer}>
              <InputGroup>
                <Form.Control placeholder="Nombre del nuevo jugador" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} />
                <Button type="submit" variant="outline-secondary"><FaPlus /></Button>
              </InputGroup>
            </Form>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}

function TeamManager() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/teams');
      setTeams(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar equipos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    try {
      const response = await api.post('/admin/teams', { name: newTeamName });
      setTeams([...teams, response.data]);
      setNewTeamName('');
    } catch (err) {
      alert('Error al crear equipo: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam || !editingTeam.name.trim()) return;
    try {
      const response = await api.put(`/admin/teams/${editingTeam._id}`, { name: editingTeam.name });
      setTeams(teams.map(t => (t._id === editingTeam._id ? response.data : t)));
      setShowModal(false);
      setEditingTeam(null);
    } catch (err) {
      alert('Error al actualizar equipo: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('¿Seguro que quieres eliminar este equipo?')) return;
    try {
      await api.delete(`/admin/teams/${teamId}`);
      setTeams(teams.filter(t => t._id !== teamId));
    } catch (err) {
      alert('Error al eliminar equipo: ' + (err.response?.data?.error || err.message));
    }
  };

  const openEditModal = (team) => {
    setEditingTeam({ ...team });
    setShowModal(true);
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid>
      <h2 className="mb-4 text-center">Gestionar Equipos</h2>
      <Row>
        <Col md={6} className="mx-auto">
          <Card>
            <Card.Header as="h5">Equipos Actuales</Card.Header>
            <ListGroup variant="flush">
              {teams.map(team => (
                <ListGroup.Item key={team._id} className="d-flex justify-content-between align-items-center">
                  {team.name}
                  <div>
                    <Button variant="outline-primary" size="sm" onClick={() => openEditModal(team)}><FaEdit /></Button>
                    <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleDeleteTeam(team._id)}><FaTrash /></Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
          <Card className="mt-4">
            <Card.Header as="h5">Añadir Nuevo Equipo</Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateTeam}>
                <InputGroup>
                  <Form.Control
                    placeholder="Nombre del nuevo equipo"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                  <Button type="submit" variant="primary"><FaPlus /></Button>
                </InputGroup>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {editingTeam && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Editar Equipo</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              value={editingTeam.name}
              onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleUpdateTeam}>Guardar Cambios</Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}

function CalendarManager() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);

  const fetchMatches = async () => {
    try {
      const [matchesRes, teamsRes] = await Promise.all([
        api.get('/admin/matches'),
        api.get('/admin/teams')
      ]);
      setMatches(matchesRes.data);
      setTeams(teamsRes.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleShowModal = (match = null) => {
    setIsEditing(!!match);
    setCurrentMatch(match || { date: '', group: '', round: '', home_team: '', away_team: '', phase: 'regular' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentMatch(null);
  };

  const handleSaveMatch = async (e) => {
    e.preventDefault();

    if (currentMatch.home_team === currentMatch.away_team) {
      setError('El equipo local y el visitante no pueden ser el mismo.');
      return;
    }

    const matchData = {
      ...currentMatch,
      date: currentMatch.date ? new Date(currentMatch.date).toISOString() : null
    };

    try {
      setError(''); // Clear previous errors
      if (isEditing) {
        await api.put(`/admin/matches/${currentMatch._id}`, matchData);
      } else {
        await api.post('/admin/matches', matchData);
      }
      fetchMatches();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el partido.');
    }
  };

  const handleDeleteMatch = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este partido?')) {
      try {
        await api.delete(`/admin/matches/${id}`);
        fetchMatches();
      } catch (err) {
        setError('Error al eliminar el partido.');
      }
    }
  };

  if (loading) return <div className="text-center"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid>
      <Button variant="primary" onClick={() => handleShowModal()} className="mb-3">
        <FaPlus className="me-2" /> Crear Partido
      </Button>

      <div className="list-group">
        {matches.map(match => (
          <div key={match._id} className="list-group-item calendar-list-item d-flex justify-content-between align-items-center flex-wrap">
            <div><strong>{match.group} - {match.round}</strong></div>
            <div>{match.home_team?.name} vs {match.away_team?.name}</div>
            <div>{new Date(match.date).toLocaleString()}</div>
            <div className="mt-2">
              <Button variant="outline-primary" size="sm" onClick={() => handleShowModal(match)} className="me-2"><FaEdit /> Editar</Button>
              <Button variant="outline-danger" size="sm" onClick={() => handleDeleteMatch(match._id)}><FaTrash /> Eliminar</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal show={showModal} onHide={handleCloseModal} contentClassName="bg-dark text-light">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Editar Partido' : 'Crear Partido'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveMatch}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha y Hora</Form.Label>
              <Form.Control type="datetime-local" value={currentMatch?.date ? new Date(currentMatch.date).toISOString().substring(0, 16) : ''} onChange={e => setCurrentMatch({...currentMatch, date: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Grupo</Form.Label>
              <Form.Control type="text" value={currentMatch?.group || ''} onChange={e => setCurrentMatch({...currentMatch, group: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Jornada</Form.Label>
              <Form.Control type="text" value={currentMatch?.round || ''} onChange={e => setCurrentMatch({...currentMatch, round: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fase</Form.Label>
              <Form.Select value={currentMatch?.phase || 'regular'} onChange={e => setCurrentMatch({...currentMatch, phase: e.target.value})} required>
                <option value="regular">Regular</option>
                <option value="phase2">Fase 2</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Equipo Local</Form.Label>
              <Form.Select value={currentMatch?.home_team?._id || currentMatch?.home_team || ''} onChange={e => setCurrentMatch({...currentMatch, home_team: e.target.value})} required>
                <option value="">Seleccionar equipo</option>
                {teams.map(team => <option key={team._id} value={team._id}>{team.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Equipo Visitante</Form.Label>
              <Form.Select value={currentMatch?.away_team?._id || currentMatch?.away_team || ''} onChange={e => setCurrentMatch({...currentMatch, away_team: e.target.value})} required>
                <option value="">Seleccionar equipo</option>
                {teams.map(team => <option key={team._id} value={team._id}>{team.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit"><FaSave className="me-2" /> Guardar</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default AdminPage;
