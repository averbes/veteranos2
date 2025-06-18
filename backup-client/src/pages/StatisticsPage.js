import React, { useEffect, useState } from 'react';
import './StatisticsPage.css';

function StatisticsPage() {
  const [scorers, setScorers] = useState([]);
  const [cards, setCards] = useState([]);
  const [offense, setOffense] = useState([]);
  const [defense, setDefense] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/api/stats/scorers').then(res => res.json()),
      fetch('http://localhost:3001/api/stats/cards').then(res => res.json()),
      fetch('http://localhost:3001/api/stats/offense').then(res => res.json()),
      fetch('http://localhost:3001/api/stats/defense').then(res => res.json()),
    ]).then(([scorersData, cardsData, offenseData, defenseData]) => {
      setScorers(scorersData);
      setCards(cardsData);
      setOffense(offenseData);
      setDefense(defenseData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="statistics-page-container">Cargando estadísticas...</div>;

  return (
    <div className="statistics-page-container">
      <h1>Estadísticas del Torneo</h1>

      <section>
        <h2>Tabla de Goleadores</h2>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Equipo</th>
              <th>Goles</th>
            </tr>
          </thead>
          <tbody>
            {scorers.length === 0 ? <tr><td colSpan="3">Sin datos</td></tr> :
              scorers.map((p, i) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.team}</td>
                  <td>{p.goals}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Tabla de Tarjetas</h2>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Equipo</th>
              <th>Amarillas</th>
              <th>Rojas</th>
              <th>Azules</th>
            </tr>
          </thead>
          <tbody>
            {cards.length === 0 ? <tr><td colSpan="5">Sin datos</td></tr> :
              cards.map((p, i) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.team}</td>
                  <td>{p.yellow_cards}</td>
                  <td>{p.red_cards}</td>
                  <td>{p.blue_cards}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <section className="offense-defense-section">
        <div>
          <h2>Mejor Ofensiva</h2>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Goles a Favor</th>
              </tr>
            </thead>
            <tbody>
              {offense.length === 0 ? <tr><td colSpan="2">Sin datos</td></tr> :
                offense.map((t, i) => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>{t.gf}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2>Mejor Defensa</h2>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Goles en Contra</th>
              </tr>
            </thead>
            <tbody>
              {defense.length === 0 ? <tr><td colSpan="2">Sin datos</td></tr> :
                defense.map((t, i) => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>{t.gc}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default StatisticsPage;
