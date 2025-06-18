import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';
import PlayerStatsModal from '../components/PlayerStatsModal';
import PlayerEditor from '../components/PlayerEditor';

function AdminPage() {
  const [schedule, setSchedule] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showPlayerEditor, setShowPlayerEditor] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const navigate = useNavigate();

  const fetchPhase2Schedule = () => {
    setLoading(true);
    fetch('http://localhost:3001/api/phase2/schedule')
      .then(response => response.json())
      .then(data => {
        setSchedule(data);
        const initialResults = {};
        Object.values(data).flat(2).forEach(match => {
          initialResults[match.id] = {
            home_score: match.home_score !== null ? match.home_score : '',
            away_score: match.away_score !== null ? match.away_score : '',
          };
        });
        setResults(initialResults);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching phase 2 schedule:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPhase2Schedule();
  }, []);

  const handleResultChange = (matchId, team, value) => {
    const score = value === '' ? '' : parseInt(value, 10);
    setResults(prevResults => ({
      ...prevResults,
      [matchId]: {
        ...prevResults[matchId],
        [team]: isNaN(score) ? '' : score,
      },
    }));
  };

  const fetchTeamPlayers = async (teamName) => {
    try {
      const response = await fetch(`http://localhost:3001/api/teams`);
      const teams = await response.json();
      const team = teams.find(t => t.name === teamName);
      
      if (team) {
        const playersResponse = await fetch(`http://localhost:3001/api/teams/${team.id}/players`);
        const players = await playersResponse.json();
        return players.map(p => ({
          id: p.id,
          name: p.name
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching team players:', error);
      return [];
    }
  };

  const handleShowStatsModal = async (match) => {
    setSaving(true);
    try {
      const [homePlayersData, awayPlayersData] = await Promise.all([
        fetchTeamPlayers(match.home_team),
        fetchTeamPlayers(match.away_team)
      ]);
      
      setHomePlayers(homePlayersData);
      setAwayPlayers(awayPlayersData);
      setCurrentMatch(match);
      setShowStatsModal(true);
    } catch (error) {
      console.error('Error preparing stats modal:', error);
      alert('Error al cargar los jugadores. Por favor, intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveResult = async (matchId, playerStats = []) => {
    const result = results[matchId];
    if (result.home_score === '' || result.away_score === '') {
      alert('Por favor, introduce un resultado para ambos equipos.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/matches/${matchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          home_score: parseInt(result.home_score),
          away_score: parseInt(result.away_score),
          playerStats: playerStats
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Resultado y estadísticas guardados exitosamente.');
        fetchPhase2Schedule(); // Refresh data to show updates
      } else {
        throw new Error(data.message || 'Error al guardar el resultado');
      }
    } catch (error) {
      console.error('Error updating match:', error);
      alert(`Error al guardar el resultado: ${error.message}`);
    }
  };

  const handleSaveStats = (playerStats) => {
    if (currentMatch) {
      setShowStatsModal(false);
      handleSaveResult(currentMatch.id, playerStats);
    }
  };

  const handleEditPlayers = (teamId, teamName) => {
    setSelectedTeamId(teamId);
    setSelectedTeamName(teamName);
    setShowPlayerEditor(true);
  };

  const handlePlayerEditorClose = () => {
    setShowPlayerEditor(false);
    setSelectedTeamId(null);
    setSelectedTeamName('');
  };

  const handleSaveSuccess = () => {
    // Recargar la página para reflejar los cambios
    navigate(0);
  };

  const renderGroupMatches = (groupName, groupKey, groupSchedule) => (
    <div className="group-matches-container">
      <h3>{groupName}</h3>
      <div className="matches-grid">
        {groupSchedule.flat().map(match => (
            <div key={match.id} className="match-card">
              <div className="team">
                <div className="team-name-container">
                  <span>{match.home_team}</span>
                  <button 
                    className="edit-players-btn"
                    onClick={() => handleEditPlayers(match.home_team_id, match.home_team)}
                    title="Editar jugadores"
                  >
                    👥
                  </button>
                </div>
              </div>
              <div className="team">
                <div className="team-name-container">
                  <span>{match.away_team}</span>
                  <button 
                    className="edit-players-btn"
                    onClick={() => handleEditPlayers(match.away_team_id, match.away_team)}
                    title="Editar jugadores"
                  >
                    👥
                  </button>
                </div>
              </div>
              <div className="result-input">
                <input
                  type="number"
                  min="0"
                  value={results[match.id]?.home_score ?? ''}
                  onChange={(e) => handleResultChange(match.id, 'home_score', e.target.value)}
                  aria-label={`Goles de ${match.home_team}`}
                />
                <span>-</span>
                <input
                  type="number"
                  min="0"
                  value={results[match.id]?.away_score ?? ''}
                  onChange={(e) => handleResultChange(match.id, 'away_score', e.target.value)}
                  aria-label={`Goles de ${match.away_team}`}
                />
              </div>
              <button 
                onClick={() => handleShowStatsModal(match)}
                disabled={saving}
              >
                {saving ? 'Cargando...' : 'Guardar Resultado'}
              </button>
            </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <div>Cargando panel de administración...</div>;
  }

  if (!schedule) {
    return <div>No se pudieron cargar los datos para la Fase 2.</div>;
  }

  return (
    <div className="admin-page-container">
      <h2>Administrar Resultados - Fase 2</h2>
      {showPlayerEditor && selectedTeamId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <PlayerEditor 
              teamId={selectedTeamId}
              onClose={handlePlayerEditorClose}
              onSave={handleSaveSuccess}
            />
          </div>
        </div>
      )}
      <div className="phase2-admin-wrapper">
        {schedule.A && renderGroupMatches('Grupo A (Impares)', 'A', schedule.A)}
        {schedule.B && renderGroupMatches('Grupo B (Pares)', 'B', schedule.B)}
      </div>
      
      {showStatsModal && currentMatch && (
        <PlayerStatsModal
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          onSubmit={handleSaveStats}
          homeTeam={currentMatch.home_team}
          awayTeam={currentMatch.away_team}
          homePlayers={homePlayers}
          awayPlayers={awayPlayers}
        />
      )}
    </div>
  );
}

export default AdminPage;
