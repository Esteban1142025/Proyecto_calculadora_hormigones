# Calculadora de Diseño de Mezclas de Hormigón - ACI 211.1

Sistema web para calcular diseños de mezclas de hormigón según la norma ACI 211.1, con autenticación de usuarios y almacenamiento de consultas.

## Características

- Cálculo de diseño de mezclas de hormigón según ACI 211.1
- Autenticación de usuarios (registro y login)
- Almacenamiento y recuperación de consultas guardadas
- Validación de campos de entrada con prevención de valores negativos
- Interfaz responsiva con diseño estilo calculadora
- Soporte para aditivos (reductor de agua y puzolanas)

## Tecnologías

### Frontend
- React 19 con TypeScript
- Vite
- TailwindCSS
- React Router
- Lucide React (iconos)

### Backend
- Node.js
- Express
- PostgreSQL
- JWT para autenticación

## Requisitos Previos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- Git

## Instalación con Docker (Recomendado)

### Para Desarrollo Local

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd Proyecto_calculadora_hormigones
```

2. Crear archivo `.env` en la raíz del proyecto:
```bash
cp .env.example .env
```

3. Iniciar los servicios con Docker Compose:
```bash
docker-compose up --build
```

4. Acceder a la aplicación:
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Base de datos PostgreSQL: localhost:5432

### Para Producción

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd Proyecto_calculadora_hormigones
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con valores específicos de producción
```

**Variables importantes para producción:**
- `JWT_SECRET`: Ya viene con un valor seguro generado automáticamente. No cambiarlo a menos que sea necesario.
- `FRONTEND_URL`: Cambiar a tu dominio real (ej: `https://tu-dominio.com`)
- `DB_PASSWORD`: Cambiar a una contraseña segura para la base de datos

3. Opcional: Cambiar contraseñas de base de datos en `.env`:
```env
DB_PASSWORD=tu_contraseña_segura_aqui
```

4. Iniciar los servicios:
```bash
docker-compose up -d --build
```

5. Verificar que los servicios estén corriendo:
```bash
docker-compose ps
```

6. Ver logs si hay problemas:
```bash
docker-compose logs -f
```

## Instalación para Desarrollo Local

### Backend

1. Instalar dependencias:
```bash
cd backend
npm install
```

2. Configurar variables de entorno (crear archivo `.env`):
```env
PORT=3000
JWT_SECRET=tu_secreto_jwt_aqui
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hormigoncalc
DB_USER=postgres
DB_PASSWORD=postgres
```

3. Iniciar base de datos PostgreSQL:
```bash
docker-compose up db
```

4. Ejecutar migraciones/inicialización:
```bash
# La base de datos se inicializa automáticamente con el archivo database/init.sql
```

5. Iniciar el servidor:
```bash
npm run dev
```

### Frontend

1. Instalar dependencias:
```bash
cd frontend
npm install
```

2. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

3. Acceder a http://localhost:5173

## Estructura del Proyecto

```
Proyecto_calculadora_hormigones/
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── controllers/  # Controladores de la API
│   │   ├── middleware/   # Middleware de autenticación
│   │   ├── routes/       # Rutas de la API
│   │   └── db.js         # Configuración de base de datos
│   ├── package.json
│   └── Dockerfile
├── frontend/             # Aplicación React
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── context/      # Contextos de React
│   │   ├── api/          # Cliente API
│   │   └── utils/        # Utilidades (calculadora)
│   ├── package.json
│   └── Dockerfile
├── database/             # Scripts de base de datos
│   └── init.sql
├── docker-compose.yml    # Configuración Docker Compose
└── README.md
```

## Uso de la Aplicación

1. **Registro**: Crear una cuenta de usuario
2. **Login**: Iniciar sesión con las credenciales
3. **Calculadora**: 
   - Completar los parámetros de entrada en las diferentes pestañas (Hormigón, Cemento, Árido Fino, Árido Grueso, Aditivos)
   - Los campos numéricos tienen validación para prevenir valores negativos
   - Los botones de incremento/decremento usan enteros, pero se pueden ingresar decimales manualmente
4. **Resultados**: Ver los resultados del cálculo en tiempo real
5. **Consultas**: Guardar, cargar y eliminar consultas para uso futuro

## Validaciones Implementadas

- **Prevención de números negativos**: Todos los campos numéricos tienen validación para evitar valores negativos
- **Botones de incremento enteros**: Los botones +/- incrementan en enteros (step=1)
- **Entrada manual de decimales**: Los usuarios pueden ingresar decimales manualmente cuando es necesario
- **Validación de campos requeridos**: La calculadora muestra errores cuando faltan campos obligatorios

## Variables de Entorno

### Para Docker Compose (archivo .env en la raíz)
- `JWT_SECRET`: Secreto para firmar tokens JWT (ya viene con valor seguro generado)
- `FRONTEND_URL`: URL del frontend para CORS (ej: http://localhost o https://tu-dominio.com)
- `DB_NAME`: Nombre de la base de datos (default: hormigoncalc)
- `DB_USER`: Usuario de la base de datos (default: postgres)
- `DB_PASSWORD`: Contraseña de la base de datos (default: postgres)

### Backend (archivo backend/.env para desarrollo local)
- `PORT`: Puerto del servidor (default: 3000)
- `JWT_SECRET`: Secreto para firmar tokens JWT
- `FRONTEND_URL`: URL del frontend para CORS
- `DB_HOST`: Host de la base de datos
- `DB_PORT`: Puerto de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos

## Construcción para Producción

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm run build
```

## Docker

Construir y ejecutar todos los servicios:
```bash
docker-compose up --build
```

Detener servicios:
```bash
docker-compose down
```

## Licencia

Este proyecto es para uso educativo y académico.
