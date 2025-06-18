import React, { useState, useEffect } from 'react';
import './Phase2Page.css';

function Phase2Page() {
  const [groups, setGroups] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/api/phase2/groups').then(res => res.json()),
      fetch('http://localhost:3001/api/phase2/schedule').then(res => res.json()),
      fetch('http://localhost:3001/api/phase2/standings').then(res => res.json()),
    ])
    .then(([groupsData, scheduleData, standingsData]) => {
      setGroups(groupsData);
      setSchedule(scheduleData);
      setStandings(standingsData);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching Phase 2 data:', error);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Cargando Fase 2...</div>;
  }

  if (!groups || !schedule || !standings) {
    return <div>No se pudieron cargar los datos de la Fase 2.</div>;
  }

  // Nueva función para mostrar todos los equipos
  const renderAllTeams = () => {
    // Unir todos los equipos de ambos grupos y eliminar duplicados por id
    const allTeams = Object.values(groups).flat().filter((team, index, self) =>
      index === self.findIndex((t) => t.id === team.id)
    );
    return (
      <div className="all-teams-container">
        <h2>Equipos Participantes</h2>
        <ul className="all-teams-list">
          {allTeams.map(team => <li key={team.id}>{team.name}</li>)}
        </ul>
      </div>
    );
  };

  // Nueva función para renderizar solo la tabla de clasificación de un grupo
  const renderStandingsTable = (groupName, groupKey) => {
    const groupStandings = standings[groupKey] || [];
    return (
      <div className="phase2-standings-container">
        <h3>Tabla de Clasificación {groupName}</h3>
        <table className="phase2-standings-table">
          <thead>
            <tr>
              <th>Equipo</th>
              <th>PJ</th>
              <th>PG</th>
              <th>PE</th>
              <th>PP</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {groupStandings.sort((a, b) => b.pts - a.pts).map(team => (
              <tr key={team.id}>
                <td className="team-name">{team.name}</td>
                <td>{team.pj}</td>
                <td>{team.pg}</td>
                <td>{team.pe}</td>
                <td>{team.pp}</td>
                <td className="points">{team.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Modifico renderGroup para quitar la tabla de clasificación
  const renderGroup = (groupName, groupKey) => {
    const groupTeams = groups[groupKey] || [];
    const groupSchedule = schedule[groupKey] ? schedule[groupKey].flat() : [];
    return (
      <div className="group-container">
        <h2>{groupName}</h2>
        <div className="group-section">
          <h3>Equipos</h3>
          <ul className="team-list">
            {groupTeams.map(team => <li key={team.id}>{team.name}</li>)}
          </ul>
        </div>
        <div className="group-section">
          <h3>Calendario de Partidos</h3>
          <ul className="schedule-list">
            {groupSchedule.map(match => (
              <li key={match.id}>
                <span>{match.home_team}</span>
                <span>vs</span>
                <span>{match.away_team}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="phase2-page-container">
      <h1>Fase 2 - Grupos</h1>
      {renderAllTeams()}
      <div className="groups-wrapper">
        {renderGroup('Grupo A (Impares)', 'A')}
        {renderGroup('Grupo B (Pares)', 'B')}
      </div>
      <div className="phase2-standings-row">
        {renderStandingsTable('Grupo A (Impares)', 'A')}
        {renderStandingsTable('Grupo B (Pares)', 'B')}
      </div>
    </div>
  );
}

export default Phase2Page;
