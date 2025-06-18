import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TeamPage.css';

function TeamPage() {
  const [teamDetails, setTeamDetails] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { teamId } = useParams();
  const navigate = useNavigate();

  // Verificar si el usuario es administrador
  useEffect(() => {
    const checkAdmin = () => {
      const isAdminUser = localStorage.getItem('isAdmin') === 'true';
      setIsAdmin(isAdminUser);
    };
    checkAdmin();
  }, []);

  // Cargar detalles del equipo y jugadores
  const fetchTeamDetails = () => {
    fetch(`http://localhost:3001/api/teams/${teamId}`)
      .then(response => response.json())
      .then(data => setTeamDetails(data))
      .catch(error => console.error('Error fetching team details:', error));
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  const handleEditClick = (player) => {
    setEditingPlayer(player);
    setNewPlayerName(player.name);
    setShowAddForm(false);
  };

  const handleAddClick = () => {
    setEditingPlayer(null);
    setNewPlayerName('');
    setShowAddForm(true);
  };

  const handleSavePlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    try {
      if (editingPlayer) {
        // Actualizar jugador existente
        const response = await fetch(`http://localhost:3001/api/players/${editingPlayer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newPlayerName }),
        });

        if (response.ok) {
          fetchTeamDetails(); // Recargar datos
          setEditingPlayer(null);
          setNewPlayerName('');
        }
      } else {
        // Agregar nuevo jugador
        const response = await fetch('http://localhost:3001/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: newPlayerName,
            teamId: teamId
          }),
        });

        if (response.ok) {
          fetchTeamDetails(); // Recargar datos
          setNewPlayerName('');
          setShowAddForm(false);
        }
      }
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este jugador?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/players/${playerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTeamDetails(); // Recargar datos
      }
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  if (!teamDetails) {
    return <div className="loading">Cargando...</div>;
  }

  const { name, players, pj, pg, pe, pp, gf, gc, gd, pts } = teamDetails;

  return (
    <div className="team-page-container">
      <div className="team-header">
        <h2>{name}</h2>
        {isAdmin && (
          <button 
            onClick={handleAddClick} 
            className="add-player-btn"
            disabled={showAddForm}
          >
            + Agregar Jugador
          </button>
        )}
      </div>

      {/* Formulario para agregar/editar jugador */}
      {(showAddForm || editingPlayer) && isAdmin && (
        <div className="player-form-container">
          <h3>{editingPlayer ? 'Editar Jugador' : 'Agregar Nuevo Jugador'}</h3>
          <form onSubmit={handleSavePlayer} className="player-form">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Nombre del jugador"
              required
              className="player-input"
            />
            <div className="form-actions">
              <button type="submit" className="save-btn">
                {editingPlayer ? 'Guardar Cambios' : 'Agregar'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setEditingPlayer(null);
                  setShowAddForm(false);
                  setNewPlayerName('');
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="team-info-grid">
        <div className="team-card stats-card">
          <h3>Estadísticas</h3>
          <ul>
            <li><strong>Puntos:</strong> {pts}</li>
            <li><strong>Partidos Jugados:</strong> {pj}</li>
            <li><strong>Victorias:</strong> {pg}</li>
            <li><strong>Empates:</strong> {pe}</li>
            <li><strong>Derrotas:</strong> {pp}</li>
            <li><strong>Goles a Favor:</strong> {gf}</li>
            <li><strong>Goles en Contra:</strong> {gc}</li>
            <li><strong>Diferencia de Goles:</strong> {gd}</li>
          </ul>
        </div>

        <div className="team-card players-card">
          <h3>Jugadores</h3>
          <table className="players-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Goles</th>
                <th>Amarillas</th>
                <th>Rojas</th>
                <th>Azules</th>
              {isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {players && players.map((player) => (
                <tr key={player.id}>
                  <td data-label="Nombre">{player.name}</td>
                  <td data-label="Goles">{player.goals || 0}</td>
                  <td data-label="Amarillas">{player.yellow_cards || 0}</td>
                  <td data-label="Rojas">{player.red_cards || 0}</td>
                  <td data-label="Azules">{player.blue_cards || 0}</td>
                  {isAdmin && (
                    <td data-label="Acciones" className="actions-cell">
                      <button 
                        onClick={() => handleEditClick(player)}
                        className="action-btn edit-btn"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeletePlayer(player.id)}
                        className="action-btn delete-btn"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TeamPage;
