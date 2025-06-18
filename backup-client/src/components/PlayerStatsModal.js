import React, { useState, useEffect } from 'react';
import './PlayerStatsModal.css';

function PlayerStatsModal({ isOpen, onClose, onSubmit, homeTeam, awayTeam, homePlayers = [], awayPlayers = [] }) {
  const [stats, setStats] = useState({});

  // Inicializar estadísticas para todos los jugadores
  useEffect(() => {
    const initialStats = {};
    
    [...homePlayers, ...awayPlayers].forEach(player => {
      initialStats[player.id] = {
        goals: 0,
        yellowCards: 0,
        redCards: 0,
        blueCards: 0
      };
    });
    
    setStats(initialStats);
  }, [homePlayers, awayTeam, awayPlayers]);

  if (!isOpen) return null;

  const handleInputChange = (playerId, field, value) => {
    setStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: Math.max(0, parseInt(value) || 0)
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filtrar solo jugadores con al menos una estadística registrada
    const playerStats = Object.entries(stats)
      .filter(([_, playerStats]) => 
        playerStats.goals > 0 || 
        playerStats.yellowCards > 0 || 
        playerStats.redCards > 0 || 
        playerStats.blueCards > 0
      )
      .map(([playerId, playerStats]) => ({
        playerId: parseInt(playerId),
        ...playerStats
      }));
    
    onSubmit(playerStats);
    onClose();
  };

  const renderPlayerRow = (player) => (
    <tr key={player.id}>
      <td>{player.name}</td>
      <td>
        <input
          type="number"
          min="0"
          value={stats[player.id]?.goals || 0}
          onChange={(e) => handleInputChange(player.id, 'goals', e.target.value)}
          className="stats-input"
        />
      </td>
      <td>
        <input
          type="number"
          min="0"
          value={stats[player.id]?.yellowCards || 0}
          onChange={(e) => handleInputChange(player.id, 'yellowCards', e.target.value)}
          className="stats-input"
        />
      </td>
      <td>
        <input
          type="number"
          min="0"
          value={stats[player.id]?.redCards || 0}
          onChange={(e) => handleInputChange(player.id, 'redCards', e.target.value)}
          className="stats-input"
        />
      </td>
      <td>
        <input
          type="number"
          min="0"
          value={stats[player.id]?.blueCards || 0}
          onChange={(e) => handleInputChange(player.id, 'blueCards', e.target.value)}
          className="stats-input"
        />
      </td>
    </tr>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Registrar Estadísticas de Jugadores</h2>
        <form onSubmit={handleSubmit}>
          <div className="teams-container">
            <div className="team-section">
              <h3>{homeTeam}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Jugador</th>
                    <th>Goles</th>
                    <th>Amarillas</th>
                    <th>Rojas</th>
                    <th>Azules</th>
                  </tr>
                </thead>
                <tbody>
                  {homePlayers.map(renderPlayerRow)}
                </tbody>
              </table>
            </div>
            
            <div className="team-section">
              <h3>{awayTeam}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Jugador</th>
                    <th>Goles</th>
                    <th>Amarillas</th>
                    <th>Rojas</th>
                    <th>Azules</th>
                  </tr>
                </thead>
                <tbody>
                  {awayPlayers.map(renderPlayerRow)}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" className="submit-button">
              Guardar Estadísticas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PlayerStatsModal;
