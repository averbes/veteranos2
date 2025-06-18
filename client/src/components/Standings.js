import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Standings.css';

function Standings({ teams }) {
  const [sortConfig, setSortConfig] = useState({ key: 'pts', direction: 'desc' });
  const [viewMode, setViewMode] = useState('table');

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTeams = React.useMemo(() => {
    if (!sortConfig.key) return teams;
    
    return [...teams].sort((a, b) => {
      if (sortConfig.direction === 'asc') {
        return a[sortConfig.key] - b[sortConfig.key];
      }
      return b[sortConfig.key] - a[sortConfig.key];
    });
  }, [teams, sortConfig]);

  const getPositionClass = (position) => {
    if (position <= 8) return 'clasificacion-directa';
    if (position >= 9 && position <= 12) return 'clasificacion-repechaje';
    if (position >= teams.length - 1) return 'descenso';
    return '';
  };

  const getPositionBadge = (position) => {
    if (position <= 8) return 'bg-success';
    if (position >= 9 && position <= 12) return 'bg-warning';
    if (position >= teams.length - 2) return 'bg-danger';
    return 'bg-secondary';
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <i className="bi bi-arrow-down-up text-muted"></i>;
    }
    return sortConfig.direction === 'desc' ? 
      <i className="bi bi-arrow-down text-primary"></i> : 
      <i className="bi bi-arrow-up text-primary"></i>;
  };

  return (
    <div className="container-fluid px-0">
      {/* Header con logos y título */}
      <div className="bg-primary text-white py-3 mb-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center">
                <img 
                  src="https://via.placeholder.com/60x60/FF6B35/FFFFFF?text=FCF" 
                  alt="FCF Logo" 
                  className="me-3 rounded"
                />
                <div>
                  <h1 className="h3 mb-0 fw-bold">LIGA BETPLAY DIMAYOR</h1>
                  <small className="opacity-75">Tabla de Posiciones 2024</small>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-end">
              <div className="btn-group" role="group">
                <button 
                  className={`btn ${viewMode === 'table' ? 'btn-light' : 'btn-outline-light'} btn-sm`}
                  onClick={() => setViewMode('table')}
                >
                  <i className="bi bi-table"></i> Tabla
                </button>
                <button 
                  className={`btn ${viewMode === 'cards' ? 'btn-light' : 'btn-outline-light'} btn-sm`}
                  onClick={() => setViewMode('cards')}
                >
                  <i className="bi bi-grid-3x3-gap"></i> Tarjetas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {viewMode === 'table' ? (
          <>
            {/* Leyenda */}
            <div className="row mb-3">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body py-2">
                    <div className="row text-center">
                      <div className="col-6 col-md-3 mb-2">
                        <span className="badge bg-success me-2">1-8</span>
                        <small>Clasificación Directa</small>
                      </div>
                      <div className="col-6 col-md-3 mb-2">
                        <span className="badge bg-warning text-dark me-2">9-12</span>
                        <small>Repechaje</small>
                      </div>
                      <div className="col-6 col-md-3 mb-2">
                        <span className="badge bg-danger me-2">{teams.length - 2}-{teams.length}</span>
                        <small>Descenso</small>
                      </div>
                      <div className="col-6 col-md-3 mb-2">
                        <small className="text-muted">
                          <i className="bi bi-info-circle"></i> Actualizado hoy
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla principal */}
            <div className="card border-0 shadow">
              <div className="table-responsive">
                <table className="table table-hover mb-0 betplay-table">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th scope="col" className="text-center fw-bold">POS</th>
                      <th scope="col" className="fw-bold">
                        <button 
                          className="btn btn-link text-white text-decoration-none p-0 fw-bold"
                          onClick={() => handleSort('name')}
                        >
                          EQUIPO {getSortIcon('name')}
                        </button>
                      </th>
                      <th scope="col" className="text-center d-none d-md-table-cell">
                        <button 
                          className="btn btn-link text-white text-decoration-none p-0 fw-bold"
                          onClick={() => handleSort('pj')}
                        >
                          PJ {getSortIcon('pj')}
                        </button>
                      </th>
                      <th scope="col" className="text-center d-none d-lg-table-cell">
                        <button 
                          className="btn btn-link text-white text-decoration-none p-0 fw-bold"
                          onClick={() => handleSort('pg')}
                        >
                          PG {getSortIcon('pg')}
                        </button>
                      </th>
                      <th scope="col" className="text-center d-none d-lg-table-cell">
                        <button 
                          className="btn btn-link text-white text-decoration-none p-0 fw-bold"
                          onClick={() => handleSort('pe')}
                        >
                          PE {getSortIcon('pe')}
                        </button>
                      </th>
                      <th scope="col" className="text-center d-none d-lg-table-cell">
                        <button 
                          className="btn btn-link text-white text-decoration-none p-0 fw-bold"
                          onClick={() => handleSort('pp')}
                        >
                          PP {getSortIcon('pp')}
                        </button>
                      </th>
                      <th scope="col" className="text-center d-none d-md-table-cell">
                        <button 
                          className="btn btn-link text-white text-decoration-none p-0 fw-bold"
                          onClick={() => handleSort('gf')}
                        >
                          GF {getSortIcon('gf')}
                        </button>
                      </th>
                      <th scope="col" className="text-center d-none d-md-table-cell">
                        <button 
                          className="btn btn-link text-white text-decoration-none p-0 fw-bold"
                          onClick={() => handleSort('gc')}
                        >
                          GC {getSortIcon('gc')}
                        </button>
                      </th>
                      <th scope="col" className="text-center">
                        <button 
                          className="btn btn-link text-white text-decoration-none p-0 fw-bold"
                          onClick={() => handleSort('gd')}
                        >
                          DIF {getSortIcon('gd')}
                        </button>
                      </th>
                      <th scope="col" className="text-center fw-bold">
                        <button 
                          className="btn btn-link text-white text-decoration-none p-0 fw-bold"
                          onClick={() => handleSort('pts')}
                        >
                          PTS {getSortIcon('pts')}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTeams.map((team, index) => (
                      <tr key={team.id} className={`position-row ${getPositionClass(index + 1)}`}>
                        <td className="text-center fw-bold">
                          <span className={`badge ${getPositionBadge(index + 1)} position-badge`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="team-cell">
                          <div className="d-flex align-items-center">
                            <img 
                              src={`https://via.placeholder.com/30x30/0066CC/FFFFFF?text=${team.name.substring(0, 2)}`}
                              alt={`${team.name} logo`}
                              className="team-logo me-2 rounded-circle"
                            />
                            <Link 
                              to={`/equipo/${team.id}`} 
                              className="text-decoration-none fw-semibold team-link"
                            >
                              <span className="d-none d-md-inline">{team.name}</span>
                              <span className="d-md-none">{team.name.length > 12 ? team.name.substring(0, 12) + '...' : team.name}</span>
                            </Link>
                          </div>
                        </td>
                        <td className="text-center d-none d-md-table-cell">{team.pj}</td>
                        <td className="text-center d-none d-lg-table-cell text-success fw-bold">{team.pg}</td>
                        <td className="text-center d-none d-lg-table-cell text-warning fw-bold">{team.pe}</td>
                        <td className="text-center d-none d-lg-table-cell text-danger fw-bold">{team.pp}</td>
                        <td className="text-center d-none d-md-table-cell text-success">{team.gf}</td>
                        <td className="text-center d-none d-md-table-cell text-danger">{team.gc}</td>
                        <td className={`text-center fw-bold ${team.gd >= 0 ? 'text-success' : 'text-danger'}`}>
                          {team.gd > 0 ? '+' : ''}{team.gd}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-primary fs-6 fw-bold px-3 py-2">
                            {team.pts}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Vista de tarjetas */
          <div className="row">
            {sortedTeams.map((team, index) => (
              <div key={team.id} className="col-12 col-md-6 col-xl-4 mb-3">
                <div className={`card h-100 shadow-sm border-start border-4 team-card-betplay ${getPositionClass(index + 1)}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        <span className={`badge ${getPositionBadge(index + 1)} me-2 fs-6`}>
                          {index + 1}
                        </span>
                        <img 
                          src={`https://via.placeholder.com/40x40/0066CC/FFFFFF?text=${team.name.substring(0, 2)}`}
                          alt={`${team.name} logo`}
                          className="team-logo me-2 rounded-circle"
                        />
                      </div>
                      <span className="badge bg-primary fs-6 fw-bold px-3 py-2">
                        {team.pts} pts
                      </span>
                    </div>
                    
                    <h5 className="card-title mb-3">
                      <Link to={`/equipo/${team.id}`} className="text-decoration-none">
                        {team.name}
                      </Link>
                    </h5>
                    
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="border-end">
                          <div className="fw-bold text-primary">{team.pj}</div>
                          <small className="text-muted">PJ</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="border-end">
                          <div className="fw-bold">{team.pg}-{team.pe}-{team.pp}</div>
                          <small className="text-muted">G-E-P</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className={`fw-bold ${team.gd >= 0 ? 'text-success' : 'text-danger'}`}>
                          {team.gd > 0 ? '+' : ''}{team.gd}
                        </div>
                        <small className="text-muted">DIF</small>
                      </div>
                    </div>
                    
                    <hr className="my-3" />
                    
                    <div className="row text-center">
                      <div className="col-6">
                        <span className="text-success fw-bold">{team.gf}</span>
                        <small className="text-muted d-block">Goles a favor</small>
                      </div>
                      <div className="col-6">
                        <span className="text-danger fw-bold">{team.gc}</span>
                        <small className="text-muted d-block">Goles en contra</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer informativo */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card bg-light border-0">
              <div className="card-body text-center py-3">
                <div className="row">
                  <div className="col-md-4 mb-2">
                    <small className="text-muted">
                      <i className="bi bi-calendar-event"></i> Fecha {Math.ceil(Math.random() * 19)}
                    </small>
                  </div>
                  <div className="col-md-4 mb-2">
                    <small className="text-muted">
                      <i className="bi bi-trophy"></i> Liga BetPlay DIMAYOR 2024
                    </small>
                  </div>
                  <div className="col-md-4 mb-2">
                    <small className="text-muted">
                      <i className="bi bi-clock"></i> Actualizado: {new Date().toLocaleDateString('es-CO')}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Standings;