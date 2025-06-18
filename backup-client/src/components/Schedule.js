import React, { useState, useEffect } from 'react';
import './Schedule.css';

function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/api/schedule').then(res => res.json()),
      fetch('http://localhost:3001/api/standings').then(res => res.json())
    ])
    .then(([scheduleData, teamsData]) => {
      setSchedule(scheduleData);
      setTeams(teamsData);
    })
    .catch(error => console.error('Error fetching data:', error));
  }, []);

  const teamsMap = teams.reduce((acc, team) => {
    acc[team.id] = team.name;
    return acc;
  }, {});

  const round1 = schedule.filter(match => match.round === 1);
  const round2 = schedule.filter(match => match.round === 2);

  if (schedule.length === 0 || teams.length === 0) {
    return <div>Cargando calendario...</div>;
  }

  return (
    <div className="schedule-container">
      <h2>Calendario de Partidos</h2>
      <div className="rounds-container">
        <div className="round">
          <h3>Primera Vuelta (Ida)</h3>
          <ul>
            {round1.map(match => (
              <li key={match.id}>
                <span>{teamsMap[match.home_team_id]}</span> vs <span>{teamsMap[match.away_team_id]}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="round">
          <h3>Segunda Vuelta (Vuelta)</h3>
          <ul>
            {round2.map(match => (
              <li key={match.id}>
                <span>{teamsMap[match.home_team_id]}</span> vs <span>{teamsMap[match.away_team_id]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Schedule;
