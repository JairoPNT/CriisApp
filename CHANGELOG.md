# Changelog

All notable changes to CriisApp will be documented in this file.

## [2.1.0] - 2026-02-09

### Added
- Sistema de precálculo de disponibilidad para indicadores de calendario
- Consulta de disponibilidad real considerando ambos calendarios (primary + secondary)
- Botón flotante de cambio de tema unificado (Home + Dashboard)
- Endpoint de diagnóstico para Google Calendar (`/api/diag-google`)
- Logging detallado para depuración de slots disponibles

### Changed
- **BREAKING**: Actualización de credenciales Google Calendar a cuenta `kristhell0912@gmail.com`
- Lógica de indicadores de calendario mejorada:
  - 🔴 Rojo: Sin slots disponibles para la duración seleccionada
  - 🟢 Verde: Con eventos pero slots disponibles
  - ⚪ Sin color: Completamente libre
- Versión del panel actualizada a v2.1

### Fixed
- Corrección de error `invalid_client` en Google Calendar OAuth
- Indicadores de calendario ahora muestran disponibilidad real en lugar de estimación por horas
- Eliminación de filtro de zona horaria problemático en `getBusySlots`
- Validaciones defensivas en Dashboard para prevenir pantallas blancas

### Removed
- Botón "Cambiar Tema" del sidebar (reemplazado por botón flotante)
- Botón de tema del header móvil

## [2.0.0] - 2026-02-07

### Added
- Sistema completo de gestión de PQRs
- Integración con Google Calendar para capacitaciones
- Panel administrativo con roles (SUPERADMIN, GESTOR, ENTIDAD)
- Sistema de tickets con estados y seguimiento
- Gestión de usuarios y permisos
- Estadísticas y reportes en PDF
- Modo oscuro/claro
- Página pública de consulta de tickets
- Sistema de reserva de capacitaciones para entidades

### Technical
- Frontend: React + Vite + Tailwind CSS + Framer Motion
- Backend: Node.js + Express + Prisma + PostgreSQL
- Deployment: EasyPanel (Frontend + Backend separados)
- Authentication: JWT
- File uploads: Multer
- PDF generation: jsPDF
