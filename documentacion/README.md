# Documentación del Proyecto - Torneo de Microfútbol

Bienvenido a la documentación del sistema de gestión para el Torneo de Microfútbol. Este documento proporciona una visión general del proyecto, su arquitectura, componentes y guías de instalación.

## Índice

1. [Visión General](#visión-general)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Guía de Instalación](#guía-de-instalación)
5. [Configuración](#configuración)
6. [Despliegue](#despliegue)
7. [Mantenimiento](#mantenimiento)
8. [Soporte](#soporte)

## Visión General

El sistema de gestión para el Torneo de Microfútbol es una aplicación web diseñada para administrar y seguir un torneo deportivo. Permite la gestión de equipos, jugadores, partidos y estadísticas en tiempo real.

### Características Principales

- Gestión de equipos y jugadores
- Programación de partidos
- Seguimiento de estadísticas en tiempo real
- Panel de administración
- Interfaz responsiva
- Autenticación de usuarios

## Requisitos del Sistema

### Backend

- Node.js (v14 o superior)
- SQLite3
- npm (v6 o superior)

### Frontend

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a Internet (para recursos externos)

## Estructura del Proyecto

```
torneo-veteranos/
├── client/                 # Frontend React
│   ├── public/            # Archivos estáticos
│   └── src/               # Código fuente del frontend
│       ├── components/    # Componentes reutilizables
│       ├── pages/         # Componentes de página
│       ├── App.js         # Componente principal
│       └── index.js       # Punto de entrada
├── server/                # Backend Node.js
│   ├── database.js        # Configuración de la base de datos
│   └── index.js           # Punto de entrada del servidor
└── documentacion/         # Documentación del proyecto
```

## Guía de Instalación

Sigue estos pasos para configurar el entorno de desarrollo:

1. Clonar el repositorio
2. Instalar dependencias del servidor
3. Instalar dependencias del cliente
4. Iniciar el servidor de desarrollo

### Pasos Detallados

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd torneo-veteranos
   ```

2. **Configurar el backend**
   ```bash
   cd server
   npm install
   ```

3. **Configurar el frontend**
   ```bash
   cd ../client
   npm install
   ```

4. **Iniciar la aplicación**
   - En una terminal, inicia el servidor:
     ```bash
     cd server
     node index.js
     ```
   - En otra terminal, inicia el cliente:
     ```bash
     cd client
     npm start
     ```

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del servidor con las siguientes variables:

```env
PORT=3001
NODE_ENV=development
DATABASE=./torneo.db
```

### Base de Datos

La aplicación utiliza SQLite3. La base de datos se crea automáticamente al iniciar el servidor por primera vez.

## Despliegue

### Requisitos de Producción

- Servidor Node.js
- Base de datos SQLite3
- Servidor web (Nginx, Apache)
- Certificado SSL (recomendado)

### Pasos de Despliegue

1. Construir el frontend para producción:
   ```bash
   cd client
   npm run build
   ```

2. Configurar el servidor web para servir los archivos estáticos de la carpeta `client/build`

3. Iniciar el servidor en producción:
   ```bash
   NODE_ENV=production node server/index.js
   ```

## Mantenimiento

### Actualizaciones

1. Hacer pull de los últimos cambios
2. Reinstalar dependencias si es necesario
3. Reiniciar el servidor

### Copias de Seguridad

Se recomienda realizar copias de seguridad periódicas del archivo de base de datos SQLite ubicado en `server/torneo.db`.

## Soporte

Para reportar problemas o solicitar ayuda, por favor:

1. Revisar la documentación
2. Verificar si el problema ya ha sido reportado
3. Si es un problema nuevo, proporcionar:
   - Pasos para reproducir el error
   - Mensajes de error
   - Versión del sistema operativo
   - Versión de Node.js
   - Navegador utilizado

---

© 2025 Torneo de Microfútbol - Todos los derechos reservados
