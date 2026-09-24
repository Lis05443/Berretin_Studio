# Arquitectura del Sistema

## Vista general (Full-Stack)

```mermaid
flowchart LR
    subgraph Cliente
        V1[nuevo_reporte_e_inicio]
        V2[mis_reportes_y_consulta]
        V3[seguimiento_y_detalle_de_reporte]
        V4[administrador]
    end

    subgraph Backend["Backend Express (backend/src)"]
        MW1[Helmet + CORS]
        MW2[Rate Limiter global /api]
        MW3[Sanitize XSS]
        MW4[Validator]
        MW5[JWT verifyToken / requireRole]
        R1[reportRoutes]
        R2[commentRoutes]
        R3[authRoutes]
        R4[statsRoutes]
        SVC[reportService]
    end

    DB[(SQLite WAL\nreportes_barriales.sqlite)]
    UP[/uploads — fotos/]

    V1 -- POST /api/reports --> MW1 --> MW2 --> MW3 --> MW4 --> R1
    V2 -- GET /api/reports --> R1
    V3 -- GET /api/reports/:code --> R1
    V4 -- PATCH /status, DELETE (JWT) --> MW5 --> R1
    V3 -- POST /comments --> R2
    V4 -- POST /login --> R3

    R1 --> SVC
    R2 --> SVC
    R3 --> SVC
    R4 --> SVC
    SVC --> DB
    R1 --> UP
```

## Flujo de un reporte (caso de uso principal)

```mermaid
sequenceDiagram
    participant Vecino
    participant Frontend as nuevo_reporte_e_inicio
    participant API as Express API
    participant DB as SQLite

    Vecino->>Frontend: Completa formulario + foto
    Frontend->>API: POST /api/reports (multipart/form-data)
    API->>API: rate limit -> sanitize -> validate
    API->>DB: INSERT INTO reports (prepared statement)
    DB-->>API: code = REP-2024-XXXX
    API-->>Frontend: 201 Created {code}
    Frontend-->>Vecino: Muestra código de seguimiento

    Vecino->>Frontend: Consulta /seguimiento?code=REP-2024-XXXX
    Frontend->>API: GET /api/reports/:code
    API->>DB: SELECT reporte + logs + comments
    DB-->>API: filas
    API-->>Frontend: JSON con bitácora y testimonios

    Note over API,DB: Un operador autenticado (JWT) puede:<br/>PATCH /status para avanzar el ciclo<br/>pendiente → en_revision → en_proceso → resuelto
```

## Justificación de decisiones de diseño (para la defensa técnica)

| Decisión | Por qué |
|---|---|
| SQLite con WAL + `foreign_keys=ON` | Cero infraestructura extra para desarrollo/demo, concurrencia razonable, y toda la integridad referencial de un RDBMS real. Migrable a PostgreSQL cambiando solo `src/config/database.js`. |
| Sentencias preparadas en el 100% de las queries | Elimina inyección SQL por diseño (no por sanitización posterior). |
| JWT con expiración de 8h + roles (`admin`, `operador`, `tecnico`) | El ciudadano no necesita cuenta (reporta anónimamente); solo el personal municipal se autentica para cambiar estados. |
| Middleware de sanitización + Helmet (CSP) | Defensa en profundidad contra XSS, además de la sanitización de inputs. |
| Rate limiting por endpoint (créación, comentarios, login, global) | Evita spam de reportes falsos y fuerza bruta sobre login, sin bloquear el uso legítimo. |
| Enmascaramiento de DNI/contacto en listados públicos | Cumplimiento de la Ley 25.326 de Hábeas Data: el dato identificatorio solo se revela a personal autenticado. |
| Carpeta `uploads/` con `X-Content-Type-Options: nosniff` y nombre de archivo aleatorio (UUID) | Evita path traversal y ejecución de scripts subidos como "imagen". |
