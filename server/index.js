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

// --- Imports ---
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const connectDB = require('./database.js');
const { User, Team, Player, Match } = require('./models');
const { signup, signin } = require('./controllers/auth.controller');
const authJwt = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/build')));

// --- Initial Data ---
const initialTeams = [
    { name: 'Transu 53 A', pj: 16, pg: 12, pe: 2, pp: 2, gf: 55, gc: 23, gd: 32, pts: 38 },
    { name: 'Los Amigos', pj: 16, pg: 12, pe: 1, pp: 3, gf: 62, gc: 31, gd: 31, pts: 37 },
    { name: 'Transu50', pj: 16, pg: 11, pe: 1, pp: 4, gf: 53, gc: 32, gd: 21, pts: 34 },
];

// --- Database Initialization ---
const initializeDatabase = async () => {
    try {
        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Team.deleteMany({}),
            Player.deleteMany({}),
            Match.deleteMany({}),
        ]);
        console.log('Previous data cleared.');

        // Create admin user
        const adminPassword = bcrypt.hashSync('admin123', 8);
        await User.create({
            username: 'admin',
            email: 'admin@torneo.com',
            password: adminPassword,
            role: 'admin',
        });
        console.log('Admin user created.');

        // Create teams
        const createdTeams = await Team.insertMany(initialTeams);
        console.log('Teams created.');

        // Create players
        const teamMap = createdTeams.reduce((map, team) => {
            map[team.name] = team._id;
            return map;
        }, {});
        console.log('DEBUG: Team map:', JSON.stringify(teamMap, null, 2));

        const initialPlayers = [
            { name: 'Andres Rojas', team: teamMap['Transu 53 A'] },
            { name: 'Bruno Diaz', team: teamMap['Transu 53 A'] },
            { name: 'Fabian Rios', team: teamMap['Los Amigos'] },
            { name: 'Gaston paez', team: teamMap['Los Amigos'] },
            { name: 'Kevin Navas', team: teamMap['Transu50'] },
            { name: 'Leon Osa', team: teamMap['Transu50'] },
        ];
        console.log('DEBUG: Initial players:', JSON.stringify(initialPlayers, null, 2));
        await Player.insertMany(initialPlayers);
        console.log('Players created.');

        console.log('Database populated successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error; // Propagate error to stop server startup
    }
};

// --- Main Server Logic ---
async function startServer() {
    await connectDB();
    await initializeDatabase();

    let phase2Groups = {};
    let phase2Schedule = {};
    let phase2Standings = {};

    // --- Helper function to calculate standings ---
    function calculateStandings(teams, matches) {
        const standings = teams.map(team => ({
            ...team,
            pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, gd: 0, pts: 0
        }));

        matches.forEach(match => {
            if (match.home_score === null || match.away_score === null) return;
            const homeTeam = standings.find(t => t.id.toString() === match.home_team.toString());
            const awayTeam = standings.find(t => t.id.toString() === match.away_team.toString());
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
    const setupPhase2 = async () => {
        try {
            const teams = await Team.find().sort({ pts: -1, gd: -1, gf: -1 }).lean();
            const top8Teams = teams.slice(0, 8);

            phase2Groups.A = top8Teams.filter((_, i) => i % 2 === 0).map(t => ({ id: t._id, name: t.name }));
            phase2Groups.B = top8Teams.filter((_, i) => i % 2 !== 0).map(t => ({ id: t._id, name: t.name }));

            Object.keys(phase2Groups).forEach(groupName => {
                const teamsInGroup = phase2Groups[groupName];
                const schedule = [];
                for (let i = 0; i < teamsInGroup.length; i++) {
                    for (let j = i + 1; j < teamsInGroup.length; j++) {
                        schedule.push({ 
                            home_team: teamsInGroup[i].id, 
                            away_team: teamsInGroup[j].id, 
                            home_score: null, 
                            away_score: null 
                        });
                    }
                }
                phase2Schedule[groupName] = schedule;
                phase2Standings[groupName] = calculateStandings(teamsInGroup.map(t => ({...t, ...initialTeams.find(it => it.name === t.name)})), []);
            });
            console.log('Phase 2 setup complete.');
        } catch (error) {
            console.error('Error setting up Phase 2:', error);
        }
    };

    await setupPhase2();

    // --- Auth Routes ---
    app.post('/api/auth/signup', signup);
    app.post('/api/auth/signin', signin);

    // --- Public API Routes ---
    app.get('/api/standings', async (req, res) => {
        try {
            const standings = await Team.find().sort({ pts: -1, gd: -1, gf: -1 });
            res.json(standings);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/schedule', async (req, res) => {
        try {
            const schedule = await Match.find({ phase: 'regular' })
                .populate('home_team', 'name')
                .populate('away_team', 'name')
                .sort({ round: 1, id: 1 });
            res.json(schedule);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/stats/scorers', async (req, res) => {
        try {
            const scorers = await Player.find({ goals: { $gt: 0 } })
                .populate('team', 'name')
                .sort({ goals: -1, name: 1 });
            res.json(scorers);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/stats/cards', async (req, res) => {
        try {
            const players = await Player.find({ $or: [{ yellow_cards: { $gt: 0 } }, { red_cards: { $gt: 0 } }, { blue_cards: { $gt: 0 } }] })
                .populate('team', 'name')
                .sort({ red_cards: -1, yellow_cards: -1, name: 1 });
            res.json(players);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/stats/offense', async (req, res) => {
        try {
            const teams = await Team.find().sort({ gf: -1, name: 1 }).select('name gf');
            res.json(teams);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/stats/defense', async (req, res) => {
        try {
            const teams = await Team.find().sort({ gc: 1, name: 1 }).select('name gc');
            res.json(teams);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/teams/:teamId', async (req, res) => {
        try {
            const team = await Team.findById(req.params.teamId).lean();
            if (!team) return res.status(404).json({ message: 'Team not found' });
            const players = await Player.find({ team: team._id });
            res.json({ ...team, players });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/teams/:teamId/players', async (req, res) => {
        try {
            const players = await Player.find({ team: req.params.teamId });
            res.json(players);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- Admin-Only Routes ---
    const adminRoutes = express.Router();
    adminRoutes.use(authJwt.verifyToken, authJwt.isAdmin);

    // --- Admin Team CRUD ---
    adminRoutes.get('/teams', async (req, res) => {
        try {
            const teams = await Team.find({});
            res.json(teams);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    adminRoutes.post('/teams', async (req, res) => {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ error: 'El nombre del equipo es requerido' });
            
            const existingTeam = await Team.findOne({ name });
            if (existingTeam) {
                return res.status(409).json({ error: 'Ya existe un equipo con este nombre' });
            }

            const team = new Team({ name });
            await team.save();
            res.status(201).json(team);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    adminRoutes.put('/teams/:id', async (req, res) => {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ error: 'El nombre del equipo es requerido' });
            const team = await Team.findByIdAndUpdate(req.params.id, { name }, { new: true });
            if (!team) return res.status(404).json({ error: 'Equipo no encontrado' });
            res.json(team);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    adminRoutes.delete('/teams/:id', async (req, res) => {
        try {
            const teamId = req.params.id;
            const playersInTeam = await Player.countDocuments({ team: teamId });

            if (playersInTeam > 0) {
                return res.status(400).json({ error: 'No se puede eliminar el equipo porque tiene jugadores asignados.' });
            }

            const team = await Team.findByIdAndDelete(teamId);
            if (!team) return res.status(404).json({ error: 'Equipo no encontrado' });

            res.json({ message: 'Equipo eliminado exitosamente' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    adminRoutes.post('/players', async (req, res) => {
        try {
            const { name, teamId } = req.body;
            if (!name || !teamId) return res.status(400).json({ error: 'Name and team ID are required' });
            const player = await Player.create({ name, team: teamId });
            res.status(201).json(player);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    adminRoutes.put('/players/:id', async (req, res) => {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ error: 'Name is required' });
            const player = await Player.findByIdAndUpdate(req.params.id, { name }, { new: true });
            if (!player) return res.status(404).json({ error: 'Player not found' });
            res.json(player);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    adminRoutes.delete('/players/:id', async (req, res) => {
        try {
            const player = await Player.findByIdAndDelete(req.params.id);
            if (!player) return res.status(404).json({ error: 'Player not found' });
            res.json({ message: 'Player deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    adminRoutes.get('/phase2/groups', (req, res) => res.json(phase2Groups));
    // --- Admin Calendar CRUD ---
    adminRoutes.get('/matches', async (req, res) => {
        try {
            const matches = await Match.find({}).populate('home_team away_team');
            res.json(matches);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    adminRoutes.post('/matches', async (req, res) => {
        try {
            const { home_team, away_team, date, group, round, phase } = req.body;

            if (home_team === away_team) {
                return res.status(400).json({ error: 'El equipo local y el visitante no pueden ser el mismo.' });
            }

            const newMatch = new Match({ home_team, away_team, date, group, round, phase });
            await newMatch.save();
            res.status(201).json(newMatch);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    adminRoutes.put('/matches/:id', async (req, res) => {
        try {
            const { home_team, away_team, date, group, round, home_score, away_score, phase } = req.body;
            const updatedMatch = await Match.findByIdAndUpdate(req.params.id, 
                { home_team, away_team, date, group, round, home_score, away_score, phase }, 
                { new: true });
            if (!updatedMatch) return res.status(404).json({ error: 'Partido no encontrado' });
            res.json(updatedMatch);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    adminRoutes.delete('/matches/:id', async (req, res) => {
        try {
            const deletedMatch = await Match.findByIdAndDelete(req.params.id);
            if (!deletedMatch) return res.status(404).json({ error: 'Partido no encontrado' });
            res.json({ message: 'Partido eliminado exitosamente' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    adminRoutes.get('/phase2/schedule', (req, res) => res.json(phase2Schedule));
    adminRoutes.get('/phase2/standings', (req, res) => res.json(phase2Standings));

    adminRoutes.post('/matches/:matchId', async (req, res) => {
        const { matchId } = req.params;
        const { home_score, away_score, playerStats = [] } = req.body;

        try {
            const match = await Match.findByIdAndUpdate(matchId, { home_score, away_score }, { new: true });
            if (!match) return res.status(404).json({ message: 'Match not found' });

            if (playerStats.length > 0) {
                const playerUpdates = playerStats.map(stat => {
                    return Player.findByIdAndUpdate(stat.playerId, {
                        $inc: {
                            goals: stat.goals || 0,
                            yellow_cards: stat.yellowCards || 0,
                            red_cards: stat.redCards || 0,
                            blue_cards: stat.blueCards || 0,
                        }
                    });
                });
                await Promise.all(playerUpdates);
            }
            
            // Note: Standings recalculation logic for phase 2 might need to be updated
            // For now, just confirming the match update.
            res.json({ success: true, message: 'Match updated successfully' });

        } catch (error) {
            console.error('Error updating match:', error);
            res.status(500).json({ success: false, message: 'Error updating match: ' + error.message });
        }
    });

    app.use('/api/admin', adminRoutes);

    // The "catchall" handler
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });

}

startServer()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to start server:", err);
        process.exit(1);
    });
