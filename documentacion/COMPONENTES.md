# Documentación de Componentes

## Estructura de Carpetas

```
client/src/
├── components/         # Componentes reutilizables
│   ├── Layout/         # Componentes de diseño general
│   ├── UI/             # Componentes de interfaz de usuario
│   └── Shared/         # Componentes compartidos
├── pages/              # Componentes de página
├── context/            # Contextos de React
├── hooks/              # Hooks personalizados
├── services/           # Servicios API
└── utils/              # Utilidades
```

## Componentes Principales

### 1. App
**Ruta**: `/client/src/App.js`
**Descripción**: Componente raíz de la aplicación. Maneja el enrutamiento y la autenticación.

### 2. Layout
**Ruta**: `/client/src/components/Layout/`
**Componentes**:
- `Header`: Barra de navegación superior
- `Footer`: Pie de página
- `Sidebar`: Menú lateral (opcional)

### 3. Páginas

#### 3.1. Inicio (`HomePage`)
**Ruta**: `/client/src/pages/HomePage.js`
**Descripción**: Página principal con información general del torneo.

#### 3.2. Equipos (`TeamPage`)
**Ruta**: `/client/src/pages/TeamPage.js`
**Funcionalidades**:
- Muestra información detallada de un equipo
- Lista de jugadores con estadísticas
- CRUD de jugadores (solo administradores)

#### 3.3. Panel de Administración (`AdminPage`)
**Ruta**: `/client/src/pages/AdminPage.js`
**Funcionalidades**:
- Gestión de partidos
- Actualización de resultados
- Estadísticas en tiempo real

### 4. Componentes de UI

#### 4.1. PlayerStatsModal
**Ruta**: `/client/src/components/PlayerStatsModal.js`
**Propósito**: Modal para editar estadísticas de jugadores
**Props**:
- `isOpen`: Booleano para controlar la visibilidad
- `onClose`: Función para cerrar el modal
- `player`: Datos del jugador a editar
- `onSave`: Función para guardar cambios

#### 4.2. MatchCard
**Ruta**: `/client/src/components/MatchCard.js`
**Propósito**: Muestra la información de un partido
**Props**:
- `match`: Datos del partido
- `onScoreUpdate`: Función para actualizar marcador

## Hooks Personalizados

### useAuth
**Ruta**: `/client/src/hooks/useAuth.js`
**Propósito**: Manejar la autenticación del usuario
**Métodos**:
- `login`: Iniciar sesión
- `logout`: Cerrar sesión
- `isAuthenticated`: Verificar autenticación
- `isAdmin`: Verificar rol de administrador

### useTeam
**Ruta**: `/client/src/hooks/useTeam.js`
**Propósito**: Gestionar el estado de los equipos
**Métodos**:
- `getTeam`: Obtener datos de un equipo
- `updateTeam`: Actualizar datos del equipo
- `getPlayers`: Obtener jugadores del equipo

## Contextos

### AuthContext
**Ruta**: `/client/src/context/AuthContext.js`
**Propósito**: Proveer el estado de autenticación a toda la aplicación
**Valores**:
- `user`: Datos del usuario actual
- `loading`: Estado de carga
- `error`: Mensajes de error

## Servicios API

### api.js
**Ruta**: `/client/src/services/api.js`
**Métodos**:
- `getTeams`: Obtener lista de equipos
- `getTeam`: Obtener equipo por ID
- `updateMatch`: Actualizar resultado de partido
- `getPlayers`: Obtener jugadores de un equipo

## Estructura de Datos

### Equipo (Team)
```typescript
{
  id: number;
  name: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  gd: number;
  pts: number;
  players?: Player[];
}
```

### Jugador (Player)
```typescript
{
  id: number;
  name: string;
  team_id: number;
  goals: number;
  yellow_cards: number;
  red_cards: number;
  blue_cards: number;
}
```

## Flujo de Datos

1. **Carga Inicial**:
   - La aplicación carga los datos iniciales desde la API
   - Se establece el contexto de autenticación

2. **Navegación**:
   - El usuario navega entre páginas usando React Router
   - Cada página carga sus datos necesarios mediante hooks personalizados

3. **Actualizaciones**:
   - Las acciones del usuario disparan llamadas a la API
   - El estado global se actualiza mediante el contexto
   - Los componentes se re-renderizan con los nuevos datos

## Convenciones de Código

- Nombres de componentes en PascalCase
- Hooks personalizados con prefijo 'use'
- Archivos de estilos con el mismo nombre que el componente
- Comentarios JSDoc para documentar props y métodos

## Pruebas

Cada componente debe incluir pruebas unitarias en un archivo `Componente.test.js` adyacente.

## Mejoras Futuras

1. Implementar carga perezosa (lazy loading) para las rutas
2. Añadir más pruebas unitarias y de integración
3. Mejorar el manejo de errores
4. Implementar caché para las peticiones a la API
