// --- Environment Setup ---
require('dotenv').config();

// --- Advanced Error Handling ---
process.on('uncaughtException', (err, origin) => {
  console.error(`Caught exception: ${err}\n` + `Exception origin: ${origin}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeDatabase } = require('./database.js');
const { signup, signin } = require('./controllers/auth.controller');
const authJwt = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Main Server Logic ---
async function startServer() {
    const db = await initializeDatabase();
    console.log('Database initialization complete.');

    let phase2Groups = {};
    let phase2Schedule = {};
    let phase2Standings = {};

    // --- Helper function to calculate standings ---
    function calculateStandings(teams, matches) {
        const standings = teams.map(team => ({ ...team, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, gd: 0, pts: 0 }));
        matches.forEach(match => {
            if (match.home_score === null || match.away_score === null) return;
            const homeTeam = standings.find(t => t.name === match.home_team);
            const awayTeam = standings.find(t => t.name === match.away_team);
            if (!homeTeam || !awayTeam) return;

            homeTeam.pj++; awayTeam.pj++;
            homeTeam.gf += match.home_score; awayTeam.gf += match.away_score;
            homeTeam.gc += match.away_score; awayTeam.gc += match.home_score;
            homeTeam.gd = homeTeam.gf - homeTeam.gc; awayTeam.gd = awayTeam.gf - awayTeam.gc;

            if (match.home_score > match.away_score) { homeTeam.pg++; awayTeam.pp++; homeTeam.pts += 3; }
            else if (match.home_score < match.away_score) { awayTeam.pg++; homeTeam.pp++; awayTeam.pts += 3; }
            else { homeTeam.pe++; awayTeam.pe++; homeTeam.pts += 1; awayTeam.pts += 1; }
        });
        return standings.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    }

    // --- Phase 2 Setup ---
    const setupPhase2 = () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM teams ORDER BY pts DESC, gd DESC, gf DESC`;
            db.all(sql, [], (err, teams) => {
                if (err) return reject(err);

                const top8Teams = teams.slice(0, 8);
                phase2Groups.A = top8Teams.filter((_, i) => i % 2 === 0).map(t => ({ id: t.id, name: t.name }));
                phase2Groups.B = top8Teams.filter((_, i) => i % 2 !== 0).map(t => ({ id: t.id, name: t.name }));

                let matchIdCounter = 1000;
                Object.keys(phase2Groups).forEach(groupName => {
                    const teamsInGroup = phase2Groups[groupName];
                    const schedule = [];
                    for (let i = 0; i < teamsInGroup.length; i++) {
                        for (let j = i + 1; j < teamsInGroup.length; j++) {
                            schedule.push({ id: matchIdCounter++, home_team: teamsInGroup[i].name, away_team: teamsInGroup[j].name, home_score: null, away_score: null });
                        }
                    }
                    phase2Schedule[groupName] = [schedule];
                    phase2Standings[groupName] = calculateStandings(teamsInGroup, []);
                });
                console.log('Phase 2 setup complete.');
                resolve();
            });
        });
    };

    await setupPhase2();

    // --- Auth Routes ---
    app.post('/api/auth/signup', signup);
    app.post('/api/auth/signin', signin);

    // --- Protected Routes ---
    app.use('/api', authJwt.verifyToken);

    // --- Admin Routes ---
    app.use('/api/admin', authJwt.isAdmin);
    
    // Test protected route
    app.get('/api/test/user', (req, res) => {
      res.status(200).send('User Content.');
    });
    
    app.get('/api/test/admin', authJwt.isAdmin, (req, res) => {
      res.status(200).send('Admin Content.');
    });

    app.get('/api/standings', (req, res) => {
        const sql = `SELECT * FROM teams ORDER BY pts DESC, gd DESC, gf DESC`;
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    app.get('/api/schedule', (req, res) => {
        const sql = `SELECT * FROM matches WHERE phase = 'regular' ORDER BY round, id`;
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // --- Estadísticas: Goleadores ---
    app.get('/api/stats/scorers', (req, res) => {
        db.all(`SELECT p.id, p.name, t.name as team, p.goals FROM players p JOIN teams t ON p.team_id = t.id WHERE p.goals > 0 ORDER BY p.goals DESC, p.name ASC`, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // --- Estadísticas: Tarjetas ---
    app.get('/api/stats/cards', (req, res) => {
        db.all(`SELECT p.id, p.name, t.name as team, p.yellow_cards, p.red_cards, p.blue_cards FROM players p JOIN teams t ON p.team_id = t.id WHERE p.yellow_cards > 0 OR p.red_cards > 0 OR p.blue_cards > 0 ORDER BY (p.yellow_cards + p.red_cards + p.blue_cards) DESC, p.name ASC`, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // --- Estadísticas: Mejor Ofensiva ---
    app.get('/api/stats/offense', (req, res) => {
        db.all(`SELECT id, name, gf FROM teams ORDER BY gf DESC, name ASC`, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // --- Estadísticas: Mejor Defensa ---
    app.get('/api/stats/defense', (req, res) => {
        db.all(`SELECT id, name, gc FROM teams ORDER BY gc ASC, name ASC`, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    app.get('/api/teams/:teamId', (req, res) => {
        const teamId = parseInt(req.params.teamId, 10);
        const teamSql = `SELECT * FROM teams WHERE id = ?`;
        const playersSql = `SELECT * FROM players WHERE team_id = ?`;
        db.get(teamSql, [teamId], (err, team) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!team) return res.status(404).json({ message: 'Team not found' });
            db.all(playersSql, [teamId], (err, players) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ...team, players });
            });
        });
    });

    // Obtener jugadores de un equipo
    app.get('/api/teams/:teamId/players', (req, res) => {
        const teamId = parseInt(req.params.teamId, 10);
        const sql = `SELECT id, name, goals, yellow_cards as yellowCards, red_cards as redCards, blue_cards as blueCards 
                    FROM players 
                    WHERE team_id = ?
                    ORDER BY name`;
        db.all(sql, [teamId], (err, players) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(players);
        });
    });

    // Crear un nuevo jugador
    app.post('/api/players', (req, res) => {
        const { name, teamId } = req.body;
        if (!name || !teamId) {
            return res.status(400).json({ error: 'Nombre y ID de equipo son requeridos' });
        }

        const sql = 'INSERT INTO players (name, team_id) VALUES (?, ?)';
        db.run(sql, [name, teamId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            // Devolver el jugador creado con su ID
            db.get('SELECT * FROM players WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json(row);
            });
        });
    });

    // Actualizar un jugador
    app.put('/api/players/:id', (req, res) => {
        const { id } = req.params;
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        const sql = 'UPDATE players SET name = ? WHERE id = ?';
        db.run(sql, [name, id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Jugador no encontrado' });
            }
            res.json({ id: Number(id), name, message: 'Jugador actualizado correctamente' });
        });
    });

    // Eliminar un jugador
    app.delete('/api/players/:id', (req, res) => {
        const { id } = req.params;
        
        // Primero verificamos si el jugador existe
        db.get('SELECT * FROM players WHERE id = ?', [id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ error: 'Jugador no encontrado' });
            }
            
            // Si existe, procedemos a eliminarlo
            db.run('DELETE FROM players WHERE id = ?', [id], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Jugador eliminado correctamente' });
            });
        });
    });

    app.get('/api/phase2/groups', (req, res) => res.json(phase2Groups));
    app.get('/api/phase2/schedule', (req, res) => res.json(phase2Schedule));
    app.get('/api/phase2/standings', (req, res) => res.json(phase2Standings));

    app.post('/api/matches/:matchId', (req, res) => {
        const matchId = parseInt(req.params.matchId, 10);
        const { home_score, away_score, playerStats = [] } = req.body;
        const groupName = Object.keys(phase2Schedule).find(group => 
            phase2Schedule[group].some(round => round.some(match => match.id === matchId))
        );
        
        if (!groupName) {
            return res.status(404).json({ success: false, message: 'Match not found in any group' });
        }

        // Iniciar transacción
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            try {
                // 1. Actualizar el partido en phase2Schedule
                let matchFound = false;
                phase2Schedule[groupName].forEach(round => {
                    round.forEach(match => {
                        if (match.id === matchId) {
                            match.home_score = home_score;
                            match.away_score = away_score;
                            matchFound = true;
                        }
                    });
                });

                if (!matchFound) {
                    throw new Error('Match not found');
                }

                // 2. Actualizar estadísticas de jugadores si se proporcionan
                const updatePlayerPromises = playerStats.map(stat => {
                    return new Promise((resolve, reject) => {
                        const { playerId, goals = 0, yellowCards = 0, redCards = 0, blueCards = 0 } = stat;
                        const updateSql = `
                            UPDATE players 
                            SET goals = goals + ?,
                                yellow_cards = yellow_cards + ?,
                                red_cards = red_cards + ?,
                                blue_cards = blue_cards + ?
                            WHERE id = ?`;
                        
                        db.run(updateSql, [goals, yellowCards, redCards, blueCards, playerId], function(err) {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                });

                // 3. Esperar a que todas las actualizaciones de jugadores terminen
                Promise.all(updatePlayerPromises)
                    .then(() => {
                        // 4. Recalcular clasificaciones
                        phase2Standings[groupName] = calculateStandings(
                            phase2Groups[groupName], 
                            phase2Schedule[groupName].flat()
                        );
                        
                        // 5. Confirmar transacción
                        db.run('COMMIT', (err) => {
                            if (err) throw err;
                            res.json({ 
                                success: true, 
                                message: 'Match updated, player stats saved, and standings recalculated' 
                            });
                        });
                    })
                    .catch(err => {
                        throw err;
                    });

            } catch (error) {
                // Si hay algún error, hacer rollback
                db.run('ROLLBACK', () => {
                    console.error('Error updating match:', error);
                    res.status(500).json({ 
                        success: false, 
                        message: 'Error updating match: ' + error.message 
                    });
                });
            }
        });
    });

    // --- Start Listening ---
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
}

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
