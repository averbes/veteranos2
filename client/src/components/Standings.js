import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, ButtonGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Table as TableIcon, Grid3x3Gap, ArrowUp, ArrowDown, ArrowsVertical } from 'react-bootstrap-icons';
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

  const sortedTeams = useMemo(() => {
    let sortableTeams = [...teams];
    if (sortConfig.key !== null) {
      sortableTeams.sort((a, b) => {
        if (sortConfig.key === 'name') {
            if (a.name < b.name) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a.name > b.name) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        if (sortConfig.key !== 'pts') {
            return b.pts - a.pts;
        }
        return 0;
      });
    }
    return sortableTeams;
  }, [teams, sortConfig]);

  const getPositionClass = (position) => {
    if (position <= 8) return 'position-direct';
    if (position >= 9 && position <= 12) return 'position-playoff';
    if (position >= teams.length - 2 && teams.length > 12) return 'position-relegation';
    return '';
  };

  const getPositionBadge = (position) => {
    if (position <= 8) return 'success';
    if (position >= 9 && position <= 12) return 'warning';
    if (position >= teams.length - 2 && teams.length > 12) return 'danger';
    return 'secondary';
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowsVertical className="ms-1 text-muted" size={14} />;
    }
    return sortConfig.direction === 'desc' ? 
      <ArrowDown className="ms-1" size={14} /> : 
      <ArrowUp className="ms-1" size={14} />;
  };

  const renderTooltip = (props, text) => (
    <Tooltip id="button-tooltip" {...props}>
      {text}
    </Tooltip>
  );

  return (
    <Container fluid="lg" className="standings-component my-4">
      <Card className="shadow-sm mb-4 standings-header-card">
        <Card.Header as="div" className="p-3 bg-dark text-white">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center">
                <img
                  src={`https://ui-avatars.com/api/?name=LIGA&background=0D6EFD&color=FFFFFF&font-size=0.5`}
                  alt="League Logo"
                  className="me-3 rounded-circle shadow-sm"
                  width="50"
                  height="50"
                />
                <div>
                  <h1 className="h5 mb-0 fw-bold">TABLA DE POSICIONES</h1>
                  <small className="opacity-75">Liga BetPlay 2024</small>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <ButtonGroup>
                <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, 'Vista de Tabla')}>
                  <Button variant={viewMode === 'table' ? 'primary' : 'outline-light'} size="sm" onClick={() => setViewMode('table')}>
                    <TableIcon />
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, 'Vista de Tarjetas')}>
                  <Button variant={viewMode === 'cards' ? 'primary' : 'outline-light'} size="sm" onClick={() => setViewMode('cards')}>
                    <Grid3x3Gap />
                  </Button>
                </OverlayTrigger>
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Header>
      </Card>

      <div className="d-flex flex-wrap justify-content-center gap-3 mb-3 small text-muted">
          <span className="d-flex align-items-center"><Badge pill bg="success" className="me-2 legend-badge">&nbsp;</Badge> Clasificación</span>
          <span className="d-flex align-items-center"><Badge pill bg="warning" className="me-2 legend-badge">&nbsp;</Badge> Repechaje</span>
          <span className="d-flex align-items-center"><Badge pill bg="danger" className="me-2 legend-badge">&nbsp;</Badge> Descenso</span>
      </div>

      {viewMode === 'table' ? (
        <Card className="shadow-sm">
          <Table hover responsive className="betplay-table mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col" className="text-center fw-bold">#</th>
                <th scope="col" className="sortable" onClick={() => handleSort('name')}>
                  Equipo <SortIcon columnKey="name" />
                </th>
                <th scope="col" className="text-center sortable d-none d-md-table-cell" onClick={() => handleSort('pj')}>
                  PJ <SortIcon columnKey="pj" />
                </th>
                <th scope="col" className="text-center sortable d-none d-lg-table-cell" onClick={() => handleSort('pg')}>
                  PG <SortIcon columnKey="pg" />
                </th>
                <th scope="col" className="text-center sortable d-none d-lg-table-cell" onClick={() => handleSort('pe')}>
                  PE <SortIcon columnKey="pe" />
                </th>
                <th scope="col" className="text-center sortable d-none d-lg-table-cell" onClick={() => handleSort('pp')}>
                  PP <SortIcon columnKey="pp" />
                </th>
                <th scope="col" className="text-center sortable d-none d-md-table-cell" onClick={() => handleSort('gf')}>
                  GF <SortIcon columnKey="gf" />
                </th>
                <th scope="col" className="text-center sortable d-none d-md-table-cell" onClick={() => handleSort('gc')}>
                  GC <SortIcon columnKey="gc" />
                </th>
                <th scope="col" className="text-center sortable" onClick={() => handleSort('gd')}>
                  DIF <SortIcon columnKey="gd" />
                </th>
                <th scope="col" className="text-center sortable fw-bold" onClick={() => handleSort('pts')}>
                  PTS <SortIcon columnKey="pts" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => (
                <tr key={team.id} className={getPositionClass(index + 1)}>
                  <td className="text-center fw-bold">
                    <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, getPositionClass(index + 1).replace('position-','').replace('-',' '))}>
                        <Badge bg={getPositionBadge(index + 1)}>{index + 1}</Badge>
                    </OverlayTrigger>
                  </td>
                  <td>
                    <Link to={`/equipo/${team.id}`} className="team-link">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${team.name.substring(0, 2)}&background=random&color=FFFFFF&font-size=0.4`}
                        alt={`${team.name} logo`}
                        className="team-logo me-2"
                      />
                      <span className="team-name">{team.name}</span>
                    </Link>
                  </td>
                  <td className="text-center d-none d-md-table-cell">{team.pj}</td>
                  <td className="text-center d-none d-lg-table-cell text-success">{team.pg}</td>
                  <td className="text-center d-none d-lg-table-cell text-warning">{team.pe}</td>
                  <td className="text-center d-none d-lg-table-cell text-danger">{team.pp}</td>
                  <td className="text-center d-none d-md-table-cell">{team.gf}</td>
                  <td className="text-center d-none d-md-table-cell">{team.gc}</td>
                  <td className={`text-center fw-bold ${team.gd >= 0 ? 'text-success' : 'text-danger'}`}>
                    {team.gd > 0 ? '+' : ''}{team.gd}
                  </td>
                  <td className="text-center fw-bold">
                    <Badge bg="dark" text="white" className="points-badge">{team.pts}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        <Row>
          {sortedTeams.map((team, index) => (
            <Col key={team.id} xs={12} md={6} xl={4} className="mb-3">
              <Card className={`h-100 shadow-sm team-card ${getPositionClass(index + 1)}`}>
                <Card.Body>
                  <Row className="align-items-center mb-3">
                    <Col xs={2}>
                      <Badge bg={getPositionBadge(index + 1)} className="position-badge-card">{index + 1}</Badge>
                    </Col>
                    <Col xs={7}>
                      <Link to={`/equipo/${team.id}`} className="team-link">
                        <h5 className="card-title mb-0 team-name">{team.name}</h5>
                      </Link>
                    </Col>
                    <Col xs={3} className="text-end">
                      <span className="fw-bold">{team.pts} PTS</span>
                    </Col>
                  </Row>
                  <Row className="text-center small">
                    <Col><strong>{team.pj}</strong><div className="text-muted">PJ</div></Col>
                    <Col><strong>{team.pg}</strong><div className="text-muted">PG</div></Col>
                    <Col><strong>{team.pe}</strong><div className="text-muted">PE</div></Col>
                    <Col><strong>{team.pp}</strong><div className="text-muted">PP</div></Col>
                    <Col><strong>{team.gd}</strong><div className="text-muted">DIF</div></Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default Standings;