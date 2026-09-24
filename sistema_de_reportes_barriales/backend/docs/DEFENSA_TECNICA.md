# Guía para la Defensa Técnica (Fase 3 — 30 min)

Preparada según la rúbrica oficial del PDF de la Olimpíada.

## 1. Guion sugerido de exposición (≈10 min)

1. **Problema y alcance** (1 min): plataforma ciudadana para reportar incidencias urbanas a la comuna.
2. **Arquitectura** (3 min): mostrar `docs/ARQUITECTURA.md` — frontend estático servido por Express, API REST, SQLite. Explicar por qué se eligió SQLite (ver tabla de justificaciones).
3. **Modelo de datos** (2 min): mostrar `docs/DER.md`, explicar la integridad referencial (`ON DELETE CASCADE`) y los `CHECK` constraints.
4. **Seguridad** (3 min): recorrer, en vivo, `src/middleware/` — sanitización, rate limiting, JWT, hashing de contraseñas con bcrypt.
5. **Demo en vivo** (1 min de transición a la Sección 2).

## 2. Casos de uso a demostrar en vivo

- Crear un reporte desde `nuevo_reporte_e_inicio` con foto → mostrar el código `#REP-YYYY-XXXX` generado.
- Consultarlo desde `mis_reportes_y_consulta` (DNI enmascarado por no estar logueado).
- Iniciar sesión como `admin` (`admin` / `Admin@Civic2024!`) y cambiar el estado desde `/administrador`.
- Volver a `seguimiento_y_detalle_de_reporte` y mostrar la bitácora actualizada.
- Abrir `/docs/index.html` (Swagger) y ejecutar un endpoint desde ahí.

## 3. Preguntas frecuentes del jurado (con respuesta corta)

| Pregunta probable | Respuesta clave |
|---|---|
| ¿Cómo evitan la inyección SQL? | Sentencias preparadas (`?`) en el 100% de las queries; nunca concatenación de strings. |
| ¿Cómo evitan XSS? | Middleware `sanitize.js` neutraliza etiquetas/atributos peligrosos + cabeceras CSP de Helmet. |
| ¿Qué pasa si alguien sube un archivo malicioso como "foto"? | Se valida extensión y MIME type, se renombra con UUID, y `/uploads` se sirve con `X-Content-Type-Options: nosniff` y CSP `default-src 'none'`. |
| ¿Cómo protegen contra fuerza bruta en el login? | `authLimiter`: 5 intentos cada 15 minutos por IP. |
| ¿Por qué SQLite y no PostgreSQL/MySQL? | Cero dependencias externas para la demo, con WAL + foreign keys se obtiene concurrencia e integridad reales; el cambio de motor solo toca `src/config/database.js`. |
| ¿Cómo garantizan la privacidad de los vecinos? | `src/utils/privacy.js` enmascara DNI y oculta contacto en endpoints públicos (Ley 25.326). |
| ¿Qué prueban los tests automatizados? | `test/api.test.js`: creación de reportes, filtros, autenticación, y neutralización de payloads de SQLi/XSS. Correr con `npm test`. |
| ¿Cómo se despliega? | `docker compose up --build` desde la raíz del proyecto (ver `docker-compose.yml`); persiste la base y las fotos en volúmenes. |
| ¿Qué rol cumple cada carpeta del backend? | `controllers` (orquestan petición/respuesta), `services` (lógica de negocio + acceso a datos), `routes` (definen endpoints y middlewares), `middleware` (seguridad/validación transversal). |

## 4. Checklist de "no romper nada" antes de la demo

- [ ] `npm install` corrido dentro de `backend/` (o `docker compose build`).
- [ ] `npm run init-db` ejecutado al menos una vez (o dejar que `server.js` lo haga automáticamente al iniciar).
- [ ] `.env` copiado desde `.env.example` con un `JWT_SECRET` propio.
- [ ] `npm test` en verde (29 pruebas).
- [ ] Puerto `3000` libre en la máquina del laboratorio.
