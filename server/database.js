const sqlite3 = require('sqlite3').verbose();

const initialTeams = [
    { id: 1, name: 'Transu 53 A', pj: 16, pg: 12, pe: 2, pp: 2, gf: 55, gc: 23, gd: 32, pts: 38 },
    { id: 2, name: 'Los Amigos', pj: 16, pg: 12, pe: 1, pp: 3, gf: 62, gc: 31, gd: 31, pts: 37 },
    { id: 3, name: 'Transu50', pj: 16, pg: 11, pe: 1, pp: 4, gf: 53, gc: 32, gd: 21, pts: 34 },
    { id: 4, name: 'Buenos Aires', pj: 16, pg: 10, pe: 2, pp: 4, gf: 59, gc: 37, gd: 22, pts: 32 },
    { id: 5, name: 'Ingenieros', pj: 16, pg: 9, pe: 1, pp: 6, gf: 55, gc: 48, gd: 7, pts: 28 },
    { id: 6, name: 'Maletones', pj: 16, pg: 5, pe: 2, pp: 9, gf: 39, gc: 49, gd: -10, pts: 17 },
    { id: 7, name: 'Machadofc', pj: 16, pg: 4, pe: 1, pp: 11, gf: 32, gc: 54, gd: -22, pts: 13 },
    { id: 8, name: 'Ozumar', pj: 16, pg: 2, pe: 1, pp: 13, gf: 29, gc: 72, gd: -43, pts: 7 },
    { id: 9, name: 'Dip', pj: 16, pg: 1, pe: 1, pp: 14, gf: 26, gc: 64, gd: -38, pts: 4 },
];

const initialPlayers = {
    'Transu 53 A': ['Andres Rojas', 'Bruno Diaz', 'Camilo Yanez', 'Dario Lema', 'Esteban Quito'],
    'Los Amigos': ['Fabian Rios', 'Gaston paez', 'Hugo Lino', 'Ignacio Pozo', 'Javier Mota'],
    'Transu50': ['Kevin Navas', 'Leon Osa', 'Marco Polo', 'Nestor Rivas', 'Oscar Pardo'],
    'Buenos Aires': ['Pedro Quinteros', 'Raul Salas', 'Saul Tovar', 'Tito Uribe', 'Victor Velez'],
    'Ingenieros': ['Walter Acuna', 'Abel Baros', 'Benito Cardenas', 'Ciro Davila', 'Elias Farias'],
    'Maletones': ['Felix Gaitan', 'Gael Haro', 'Isaac Jerez', 'Joel Lira', 'Lucas Marin'],
    'Machadofc': ['Matias Neira', 'Noel Orellana', 'Patricio Prieto', 'Rene Quiroga', 'Sergio Rubio'],
    'Ozumar': ['Teo Salazar', 'Uriel Torres', 'Valentin Vargas', 'Yeray Zapata', 'Aaron Abreu'],
    'Dip': ['Adan Blasco', 'Axel Crespo', 'Biel Duran', 'Caleb Exposito', 'Dilan Fuentes'],
};

// Crear hash de contraseña para el admin por defecto
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(8);
const adminPassword = bcrypt.hashSync('admin123', salt);

const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./torneo.db', (err) => {
            if (err) {
                console.error('Error opening database', err.message);
                return reject(err);
            }
            console.log('Connected to the SQLite database.');

            // Habilitar claves foráneas
            db.get("PRAGMA foreign_keys = ON");

            db.serialize(() => {
                // Force drop and recreate tables every time to ensure consistency
                // Eliminar tablas si existen
                db.run(`DROP TABLE IF EXISTS refresh_tokens`);
                db.run(`DROP TABLE IF EXISTS users`);
                db.run(`DROP TABLE IF EXISTS players`);
                db.run(`DROP TABLE IF EXISTS matches`);
                db.run(`DROP TABLE IF EXISTS teams`);

                // Crear tabla de usuarios
                db.run(`
                    CREATE TABLE users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT NOT NULL UNIQUE,
                        email TEXT UNIQUE,
                        password TEXT NOT NULL,
                        role TEXT NOT NULL DEFAULT 'user',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);


                // Crear tabla de tokens de actualización
                db.run(`
                    CREATE TABLE refresh_tokens (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        token TEXT NOT NULL,
                        expires_at DATETIME NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                    )
                `);


                // Crear tabla de equipos
                db.run(`
                    CREATE TABLE teams (
                        id INTEGER PRIMARY KEY, 
                        name TEXT NOT NULL UNIQUE, 
                        pj INTEGER DEFAULT 0, 
                        pg INTEGER DEFAULT 0, 
                        pe INTEGER DEFAULT 0, 
                        pp INTEGER DEFAULT 0, 
                        gf INTEGER DEFAULT 0, 
                        gc INTEGER DEFAULT 0, 
                        gd INTEGER DEFAULT 0, 
                        pts INTEGER DEFAULT 0
                    )
                `);
                db.run(`CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    team_id INTEGER,
    goals INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    blue_cards INTEGER DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);`);
                db.run(`CREATE TABLE matches (id INTEGER PRIMARY KEY AUTOINCREMENT, phase TEXT NOT NULL, group_name TEXT, round INTEGER, home_team_id INTEGER NOT NULL, away_team_id INTEGER NOT NULL, home_score INTEGER, away_score INTEGER, FOREIGN KEY (home_team_id) REFERENCES teams(id), FOREIGN KEY (away_team_id) REFERENCES teams(id))`);

                console.log('Populating database with initial data...');
                
                db.run('BEGIN TRANSACTION', (err) => {
                    if (err) return reject(new Error('Failed to begin transaction: ' + err.message));

                    // Insertar usuario administrador por defecto
                    db.run(
                        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                        ['admin', 'admin@torneo.com', adminPassword, 'admin'],
                        (err) => {
                            if (err) {
                                console.error('Error creating admin user:', err);
                            } else {
                                console.log('Admin user created successfully');
                            }
                        }
                    );

                    // Insert initial teams
                    const stmt = db.prepare('INSERT OR IGNORE INTO teams (id, name, pj, pg, pe, pp, gf, gc, gd, pts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                    initialTeams.forEach(team => {
                        stmt.run([team.id, team.name, team.pj, team.pg, team.pe, team.pp, team.gf, team.gc, team.gd, team.pts]);
                    });
                    stmt.finalize();

                    const playersStmt = db.prepare('INSERT INTO players (name, team_id) VALUES (?, ?)');
                    initialTeams.forEach(team => {
                        const players = initialPlayers[team.name] || [];
                        players.forEach(playerName => {
                            playersStmt.run(playerName, team.id);
                        });
                    });
                    playersStmt.finalize((err) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return reject(new Error('Failed to finalize players statement: ' + err.message));
                        }
                        
                        db.run('COMMIT', (err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                return reject(new Error('Failed to commit transaction: ' + err.message));
                            }
                            console.log('Database populated successfully.');
                            resolve(db);
                        });
                    });
                });
            });
        });
    });
};

module.exports = { initializeDatabase };
