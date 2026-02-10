# CriisApp v2.1.0

Sistema de gestión de PQRs (Peticiones, Quejas y Reclamos) con integración de Google Calendar para capacitaciones.

## 🚀 Características Principales

- **Gestión de Tickets PQR**: Sistema completo de seguimiento de casos
- **Capacitaciones**: Reserva de espacios con Google Calendar (2 calendarios)
- **Roles y Permisos**: SUPERADMIN, GESTOR, ENTIDAD
- **Estadísticas**: Dashboard con métricas en tiempo real
- **Reportes PDF**: Generación automática de informes
- **Consulta Pública**: Los pacientes pueden consultar el estado de sus tickets
- **Modo Oscuro**: Tema claro/oscuro con botón flotante

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+
- Cuenta Google con Calendar API habilitada

## 🛠️ Instalación

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno en .env
npx prisma db push
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Variables de Entorno

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
PORT=3000
JWT_SECRET="your-secret-key"

# Google Calendar OAuth2
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REFRESH_TOKEN="your-refresh-token"
GOOGLE_CALENDAR_ID="primary"
GOOGLE_SECONDARY_CALENDAR_ID="calendar-id@group.calendar.google.com"
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

## 📦 Deployment (EasyPanel)

### Backend
1. Crear servicio Node.js
2. Configurar variables de entorno
3. Build command: `npm install && npx prisma db push`
4. Start command: `node server.js`

### Frontend
1. Crear servicio estático
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`

## 🎯 Uso

### Roles

- **SUPERADMIN**: Acceso total al sistema
- **GESTOR**: Gestión de tickets y capacitaciones
- **ENTIDAD**: Reserva de capacitaciones

### Credenciales por defecto

```
Usuario: admin
Contraseña: admin123
```

## 📚 Documentación

- [CHANGELOG.md](./CHANGELOG.md) - Historial de versiones
- [Walkthrough](../.gemini/antigravity/brain/fc61ed8a-2eb0-4e88-a22a-c26659d97fbc/walkthrough.md) - Guía detallada de implementación

## 🔐 Google Calendar Setup

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear proyecto y habilitar Calendar API
3. Crear credenciales OAuth 2.0
4. Usar [OAuth Playground](https://developers.google.com/oauthplayground) para obtener refresh token
5. Configurar variables de entorno

## 🐛 Troubleshooting

### Error "invalid_client"
- Verificar que CLIENT_ID y CLIENT_SECRET sean correctos
- Asegurarse de usar el refresh token de la cuenta correcta

### Calendario no muestra disponibilidad
- Verificar que ambos CALENDAR_ID estén configurados
- Revisar logs del backend con `/api/diag-google`

### Pantalla blanca en Dashboard
- Verificar que la API esté respondiendo
- Revisar console del navegador para errores

## 👨‍💻 Desarrollo

```bash
# Frontend (desarrollo)
cd frontend && npm run dev

# Backend (desarrollo con hot reload)
cd backend && node --watch server.js
```

## 📄 Licencia

Desarrollado por [Maeva Studio](https://maeva.studio)

## 🔖 Versión Actual

**v2.1.0** - Base estable para desarrollo futuro

### Últimos cambios
- ✅ Indicadores de calendario con disponibilidad real
- ✅ Integración Google Calendar corregida
- ✅ UI/UX mejorada con tema flotante
- ✅ Código defensivo contra errores de API
