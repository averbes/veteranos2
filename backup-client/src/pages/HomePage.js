import React, { useState, useEffect } from 'react';
import Standings from '../components/Standings';
import Schedule from '../components/Schedule';

function HomePage() {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/standings')
      .then(response => response.json())
      .then(data => setStandings(data))
      .catch(error => console.error('Error fetching standings:', error));
  }, []);

  return (
    <>
      <Standings teams={standings} />
      <Schedule />
    </>
  );
}

export default HomePage;
