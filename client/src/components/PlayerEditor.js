import React, { useState, useEffect } from 'react';
import './PlayerEditor.css';

function PlayerEditor({ teamId, onClose, onSave }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Cargar jugadores del equipo
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/teams/${teamId}/players`);
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [teamId]);

  const handleEditClick = (player) => {
    setEditingPlayer(player);
    setPlayerName(player.name);
    setIsAdding(false);
  };

  const handleAddClick = () => {
    setEditingPlayer(null);
    setPlayerName('');
    setIsAdding(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    try {
      if (isAdding) {
        // Agregar nuevo jugador
        const response = await fetch('http://localhost:3001/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: playerName,
            team_id: teamId
          }),
        });
        
        if (response.ok) {
          const newPlayer = await response.json();
          setPlayers([...players, newPlayer]);
          setPlayerName('');
          if (onSave) onSave();
        }
      } else if (editingPlayer) {
        // Actualizar jugador existente
        const response = await fetch(`http://localhost:3001/api/players/${editingPlayer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: playerName }),
        });
        
        if (response.ok) {
          const updatedPlayers = players.map(p => 
            p.id === editingPlayer.id ? { ...p, name: playerName } : p
          );
          setPlayers(updatedPlayers);
          setEditingPlayer(null);
          setPlayerName('');
          if (onSave) onSave();
        }
      }
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  const handleDelete = async (playerId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este jugador?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/players/${playerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPlayers(players.filter(p => p.id !== playerId));
        if (onSave) onSave();
      }
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  if (loading) {
    return <div>Cargando jugadores...</div>;
  }

  return (
    <div className="player-editor">
      <div className="player-editor-header">
        <h3>Gestión de Jugadores</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      
      <div className="players-list">
        <h4>Jugadores del Equipo</h4>
        <ul>
          {players.map(player => (
            <li key={player.id}>
              {player.name}
              <div className="player-actions">
                <button onClick={() => handleEditClick(player)} className="edit-btn">✏️</button>
                <button onClick={() => handleDelete(player.id)} className="delete-btn">🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="player-form">
        <h4>{isAdding ? 'Agregar Nuevo Jugador' : 'Editar Jugador'}</h4>
        <form onSubmit={handleSave}>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Nombre del jugador"
            required
          />
          <div className="form-actions">
            <button type="submit" className="save-btn">
              {isAdding ? 'Agregar' : 'Guardar'}
            </button>
            {!isAdding && (
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setEditingPlayer(null);
                  setPlayerName('');
                  setIsAdding(false);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="add-player-section">
        {!isAdding && !editingPlayer && (
          <button onClick={handleAddClick} className="add-btn">
            + Agregar Jugador
          </button>
        )}
      </div>
    </div>
  );
}

export default PlayerEditor;
