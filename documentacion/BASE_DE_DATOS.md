# Documentación de la Base de Datos

## Esquema de la Base de Datos

La aplicación utiliza SQLite3 como sistema de gestión de bases de datos. A continuación se detalla el esquema de la base de datos:

### Tabla: `teams`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria |
| `name` | TEXT | Nombre del equipo |
| `pj` | INTEGER | Partidos jugados |
| `pg` | INTEGER | Partidos ganados |
| `pe` | INTEGER | Partidos empatados |
| `pp` | INTEGER | Partidos perdidos |
| `gf` | INTEGER | Goles a favor |
| `gc` | INTEGER | Goles en contra |
| `gd` | INTEGER | Diferencia de goles |
| `pts` | INTEGER | Puntos |

### Tabla: `players`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria |
| `name` | TEXT | Nombre del jugador |
| `team_id` | INTEGER | ID del equipo al que pertenece |
| `goals` | INTEGER | Goles anotados |
| `yellow_cards` | INTEGER | Tarjetas amarillas |
| `red_cards` | INTEGER | Tarjetas rojas |
| `blue_cards` | INTEGER | Tarjetas azules |

### Tabla: `matches`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria |
| `phase` | TEXT | Fase del torneo |
| `group_name` | TEXT | Nombre del grupo |
| `round` | INTEGER | Número de ronda |
| `home_team_id` | INTEGER | ID del equipo local |
| `away_team_id` | INTEGER | ID del equipo visitante |
| `home_score` | INTEGER | Goles del equipo local |
| `away_score` | INTEGER | Goles del equipo visitante |

## Relaciones

- Un equipo (`teams`) tiene muchos jugadores (`players`)
- Un equipo puede ser local o visitante en múltiples partidos (`matches`)
- Los jugadores están asociados a un solo equipo

## Inicialización

La base de datos se inicializa automáticamente al iniciar el servidor por primera vez. El script de inicialización:

1. Crea las tablas si no existen
2. Inserta los equipos iniciales
3. Crea los jugadores predeterminados

## Consultas Comunes

### Obtener jugadores de un equipo
```sql
SELECT * FROM players WHERE team_id = ? ORDER BY name;
```

### Obtener partidos de un equipo
```sql
SELECT * FROM matches 
WHERE home_team_id = ? OR away_team_id = ?
ORDER BY phase, group_name, round;
```

### Actualizar estadísticas de un jugador
```sql
UPDATE players 
SET goals = goals + ?, 
    yellow_cards = yellow_cards + ?,
    red_cards = red_cards + ?,
    blue_cards = blue_cards + ?
WHERE id = ?;
```

## Mantenimiento

### Realizar copia de seguridad
```bash
sqlite3 torneo.db ".backup 'backup_$(date +%Y%m%d).db'"
```

### Optimizar la base de datos
```sql
VACUUM;
ANALYZE;
```

## Notas de Migración

Para futuras actualizaciones que requieran cambios en el esquema, se recomienda:

1. Crear un script de migración
2. Realizar copia de seguridad antes de aplicar cambios
3. Documentar los cambios en este archivo

## Índices

Se recomiendan los siguientes índices para mejorar el rendimiento:

```sql
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_phase ON matches(phase, group_name, round);
```
