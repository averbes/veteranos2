import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Standings.css';

function Standings({ teams }) {
  return (
    <div className="standings-container">
      <h2>Tabla de Clasificación</h2>
      <table>
        <thead>
          <tr>
            <th>Pos</th>
            <th>Equipo</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>GF</th>
            <th>GC</th>
            <th>DG</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={team.id}>
              <td>{index + 1}</td>
              <td className="team-name"><Link to={`/equipos/${team.id}`}>{team.name}</Link></td>
              <td>{team.pj}</td>
              <td>{team.pg}</td>
              <td>{team.pe}</td>
              <td>{team.pp}</td>
              <td>{team.gf}</td>
              <td>{team.gc}</td>
              <td>{team.gd}</td>
              <td className="points">{team.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Standings;
