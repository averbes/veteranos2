# Documentación de la API

## Autenticación

### Iniciar Sesión
- **URL**: `/api/auth/login`
- **Método**: `POST`
- **Descripción**: Autentica a un usuario y devuelve un token de acceso
- **Cuerpo de la solicitud**:
  ```json
  {
    "username": "usuario",
    "password": "contraseña"
  }
  ```
- **Respuesta exitosa (200)**:
  ```json
  {
    "token": "jwt.token.aqui",
    "isAdmin": true
  }
  ```
- **Errores**:
  - 401: Credenciales inválidas
  - 500: Error del servidor

## Equipos

### Obtener todos los equipos
- **URL**: `/api/teams`
- **Método**: `GET`
- **Descripción**: Devuelve la lista de todos los equipos con sus estadísticas
- **Respuesta exitosa (200)**:
  ```json
  [
    {
      "id": 1,
      "name": "Equipo A",
      "pj": 5,
      "pg": 3,
      "pe": 1,
      "pp": 1,
      "gf": 10,
      "gc": 5,
      "gd": 5,
      "pts": 10
    }
  ]
  ```

### Obtener un equipo específico
- **URL**: `/api/teams/:id`
- **Método**: `GET`
- **Parámetros de URL**:
  - `id`: ID del equipo
- **Respuesta exitosa (200)**:
  ```json
  {
    "id": 1,
    "name": "Equipo A",
    "pj": 5,
    "pg": 3,
    "pe": 1,
    "pp": 1,
    "gf": 10,
    "gc": 5,
    "gd": 5,
    "pts": 10,
    "players": [
      {
        "id": 1,
        "name": "Jugador 1",
        "goals": 5,
        "yellow_cards": 1,
        "red_cards": 0,
        "blue_cards": 0
      }
    ]
  }
  ```
- **Errores**:
  - 404: Equipo no encontrado

## Jugadores

### Obtener jugadores de un equipo
- **URL**: `/api/teams/:teamId/players`
- **Método**: `GET`
- **Parámetros de URL**:
  - `teamId`: ID del equipo
- **Respuesta exitosa (200)**:
  ```json
  [
    {
      "id": 1,
      "name": "Jugador 1",
      "team_id": 1,
      "goals": 5,
      "yellow_cards": 1,
      "red_cards": 0,
      "blue_cards": 0
    }
  ]
  ```

### Crear un jugador
- **URL**: `/api/players`
- **Método**: `POST`
- **Autenticación requerida**: Sí (Admin)
- **Cuerpo de la solicitud**:
  ```json
  {
    "name": "Nuevo Jugador",
    "teamId": 1
  }
  ```
- **Respuesta exitosa (201)**:
  ```json
  {
    "id": 2,
    "name": "Nuevo Jugador",
    "team_id": 1,
    "goals": 0,
    "yellow_cards": 0,
    "red_cards": 0,
    "blue_cards": 0
  }
  ```

### Actualizar un jugador
- **URL**: `/api/players/:id`
- **Método**: `PUT`
- **Autenticación requerida**: Sí (Admin)
- **Parámetros de URL**:
  - `id`: ID del jugador
- **Cuerpo de la solicitud**:
  ```json
  {
    "name": "Nombre Actualizado"
  }
  ```
- **Respuesta exitosa (200)**:
  ```json
  {
    "id": 1,
    "name": "Nombre Actualizado",
    "team_id": 1,
    "goals": 5,
    "yellow_cards": 1,
    "red_cards": 0,
    "blue_cards": 0
  }
  ```

### Eliminar un jugador
- **URL**: `/api/players/:id`
- **Método**: `DELETE`
- **Autenticación requerida**: Sí (Admin)
- **Parámetros de URL**:
  - `id`: ID del jugador
- **Respuesta exitosa (204)**: Sin contenido

## Partidos

### Obtener todos los partidos
- **URL**: `/api/matches`
- **Método**: `GET`
- **Parámetros de consulta opcionales**:
  - `phase`: Fase del torneo (ej. 'groups', 'knockout')
  - `group`: Nombre del grupo (ej. 'A', 'B')
  - `round`: Número de ronda
- **Respuesta exitosa (200)**:
  ```json
  [
    {
      "id": 1,
      "phase": "groups",
      "group_name": "A",
      "round": 1,
      "home_team_id": 1,
      "away_team_id": 2,
      "home_score": 2,
      "away_score": 1,
      "home_team": {
        "id": 1,
        "name": "Equipo A"
      },
      "away_team": {
        "id": 2,
        "name": "Equipo B"
      }
    }
  ]
  ```

### Actualizar resultado de un partido
- **URL**: `/api/matches/:id`
- **Método**: `PUT`
- **Autenticación requerida**: Sí (Admin)
- **Parámetros de URL**:
  - `id`: ID del partido
- **Cuerpo de la solicitud**:
  ```json
  {
    "homeScore": 2,
    "awayScore": 1,
    "goals": [
      { "playerId": 1, "teamId": 1, "count": 2 },
      { "playerId": 2, "teamId": 2, "count": 1 }
    ],
    "cards": [
      { "playerId": 1, "type": "yellow" },
      { "playerId": 2, "type": "red" }
    ]
  }
  ```
- **Respuesta exitosa (200)**:
  ```json
  {
    "message": "Partido actualizado correctamente"
  }
  ```

## Estadísticas

### Obtener goleadores
- **URL**: `/api/stats/top-scorers`
- **Método**: `GET`
- **Respuesta exitosa (200)**:
  ```json
  [
    {
      "player_id": 1,
      "player_name": "Máximo Goleador",
      "team_name": "Equipo A",
      "goals": 10
    }
  ]
  ```

### Obtener tarjetas
- **URL**: `/api/stats/cards`
- **Método**: `GET`
- **Respuesta exitosa (200)**:
  ```json
  {
    "yellow": [
      {
        "player_id": 1,
        "player_name": "Jugador 1",
        "team_name": "Equipo A",
        "count": 2
      }
    ],
    "red": [
      {
        "player_id": 2,
        "player_name": "Jugador 2",
        "team_name": "Equipo B",
        "count": 1
      }
    ],
    "blue": []
  }
  ```

## Manejo de Errores

Todas las respuestas de error siguen el siguiente formato:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje descriptivo del error",
    "details": "Detalles adicionales (opcional)"
  }
}
```

### Códigos de Error Comunes

- `400`: Solicitud incorrecta (datos inválidos)
- `401`: No autorizado
- `403**: Prohibido (permisos insuficientes)
- `404`: Recurso no encontrado
- `409`: Conflicto (ej. nombre de equipo duplicado)
- `500`: Error interno del servidor

## Paginación

Los endpoints que devuelven listas pueden soportar paginación mediante parámetros de consulta:

- `page`: Número de página (por defecto: 1)
- `limit`: Número de elementos por página (por defecto: 10)

**Ejemplo de respuesta paginada**:

```json
{
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## Ordenamiento

Algunos endpoints permiten ordenar los resultados usando el parámetro `sort`:

- `sort=field` para orden ascendente
- `sort=-field` para orden descendente

**Ejemplo**:
```
/api/teams?sort=-pts,gd
```

## Filtros

Los filtros se pueden aplicar como parámetros de consulta:

```
/api/teams?pg[gte]=3&gf[gt]=5
```

Operadores soportados:
- `eq`: igual a
- `ne`: no igual a
- `gt`: mayor que
- `gte`: mayor o igual que
- `lt`: menor que
- `lte`: menor o igual que
- `in`: en la lista
- `like`: coincidencia parcial (sensible a mayúsculas)
- `ilike`: coincidencia parcial (insensible a mayúsculas)
