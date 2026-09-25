# Backend Oficial - Sistema de Reportes Barriales Comunal

Servidor backend desarrollado en **JavaScript (Node.js con Express)**, con base de datos relacional **SQL** (utilizando el motor nativo `node:sqlite` con modo WAL y claves foráneas activadas) y arquitectura de **Ciberseguridad** de nivel corporativo.

---

## Inicio Rápido

### Requisitos
- **Node.js**: v22+ (v24.19.0 LTS instalado y verificado).

### Iniciar el sistema (modo simple — recomendado)
Desde la **raíz del proyecto** (un nivel arriba de `backend/`), hacer doble clic en:
- **Windows**: `iniciar_windows.bat`
- **Mac/Linux**: `iniciar_mac_linux.sh`

Eso instala dependencias la primera vez, arranca el servidor y abre el navegador solo. **Hay que dejar esa ventana abierta** mientras se usa el sistema — ahí vive el servidor que lee y escribe en la base de datos SQL. Cerrarla equivale a "apagar" el sistema.

### Iniciar el servidor a mano (alternativa)
Dentro de la carpeta `backend`:

```bash
npm start        # producción / estándar
npm run dev      # con recarga automática de desarrollo
```

El servidor quedará disponible en:
**`http://localhost:3000`**

### NO se puede abrir el HTML directamente con doble clic
Las 4 páginas (`frontend/index.html`, `reportes.html`, `seguimiento.html`, `administrador.html`) le piden datos a la base SQL a través de la API (`/api/reports`, `/api/auth/login`, etc.). Esas peticiones solo funcionan si el navegador las abre **a través del servidor** (`http://localhost:3000/...`). Si se abre el archivo `.html` con doble clic (protocolo `file://`), el navegador no tiene con quién hablar: no hay servidor, no hay base de datos, y por eso "no dejaba subir reportes". Los lanzadores de arriba resuelven esto sin que tengas que escribir comandos.

### Páginas del frontend (carpeta `frontend/`, cada una con su propio archivo)
- **`http://localhost:3000/`** → `frontend/index.html` — Formulario oficial de reporte de incidencias e inicio.
- **`http://localhost:3000/reportes.html`** → Centro de transparencia, buscador en vivo por DNI o código y filtros de estado/tipo.
- **`http://localhost:3000/seguimiento.html?code=REP-2024-8942`** → Seguimiento en tiempo real, bitácora de cuadrilla y testimonios vecinales.
- **`http://localhost:3000/administrador.html`** → Panel de gestión para operadores/admin (requiere login).
- **`http://localhost:3000/docs`** → Documentación interactiva de la API (Swagger UI).

> Los diseños originales de Stitch (capturas de pantalla y el HTML de origen) quedaron archivados como referencia en `backend/docs/design_stitch_original/`.

---

## Ejecutar con Docker

Desde la **raíz del proyecto** (un nivel arriba de `backend/`, donde también está la carpeta con las 4 vistas frontend):

```bash
docker compose up --build
```

Esto construye la imagen, instala dependencias, sirve el frontend y expone todo en `http://localhost:3000`. La base SQLite y las fotos subidas persisten en volúmenes Docker (`db_data`, `uploads_data`) entre reinicios.

Para producción, definir `JWT_SECRET` propio antes de levantar:
```bash
JWT_SECRET="$(openssl rand -hex 32)" docker compose up --build -d
```

---

## Documentación de la API (Swagger / Postman)

- **Swagger UI**: con el servidor corriendo, abrir `http://localhost:3000/docs`.
- **Especificación OpenAPI**: `backend/docs/openapi.yaml` (importable en Postman, Insomnia, etc.).
- **Colección Postman lista para usar**: `backend/docs/postman_collection.json` (incluye login automático que guarda el token JWT en una variable de colección).

---

## Documentación técnica adicional

- `backend/docs/DER.md` — Diagrama entidad-relación de la base de datos.
- `backend/docs/ARQUITECTURA.md` — Diagramas de arquitectura y de secuencia, y justificación de decisiones de diseño.

---

## Medidas de Ciberseguridad Implementadas

1. **Inmunidad contra Inyecciones SQL (SQLi Defense)**:
   - 100% de las consultas a la base de datos se ejecutan con **sentencias preparadas (`Prepared Statements`)** y parámetros enlazados (`?`).
   - Cero concatenación directa de cadenas de texto en SQL.

2. **Mitigación de Cross-Site Scripting (XSS)**:
   - Middleware de sanitización que analiza y neutraliza recursivamente etiquetas HTML sospechosas (`<script>`, `onerror`, etc.) en `body`, `query` y `params`.
   - Cabeceras HTTP seguras configuradas mediante **Helmet**, incluyendo `Content-Security-Policy (CSP)`.

3. **Protección contra Denegación de Servicio (DoS) y Spam**:
   - **Rate Limiting granular**:
     - Global: Máximo 200 peticiones cada 15 minutos por IP.
     - Creación de Reportes: Límite estricto de 15 reportes por hora por IP para prevenir spam masivo.
     - Testimonios Vecinales: 20 comentarios cada 15 minutos por IP.
     - Autenticación: 5 intentos cada 15 minutos (defensa contra fuerza bruta).
   - Límite de tamaño de payload HTTP (JSON y formularios urlencoded limitados a 100 KB).

4. **Hardening en Subida de Archivos Fotográficos**:
   - Validación estricta por extensión (`.jpg`, `.jpeg`, `.png`, `.webp`) y validación de cabecera MIME type.
   - Renombrado criptográfico con `crypto.randomUUID()` para evitar Directory Traversal (`../../`) o sobreescritura maliciosa.
   - Límite estricto de tamaño de 10 MB por archivo.
   - Carpeta `uploads/` servida con cabecera `X-Content-Type-Options: nosniff` para evitar ejecución de scripts en el navegador.

5. **Privacidad y Cumplimiento Legal (Ley 25.326 de Hábeas Data)**:
   - Enmascaramiento automático de DNI (`***.891`) y nombre en listados públicos.
   - Los datos de contacto (teléfono y correo electrónico) no se exponen al público general.

6. **Autenticación y Control de Acceso Basado en Roles (RBAC)**:
   - Contraseñas hasheadas con algoritmo `bcrypt` (10 rondas de salting).
   - Emisión de tokens firmados **JWT** con expiración de 8 horas.
   - Endpoints administrativos (`PATCH /api/reports/:code/status`) protegidos con verificación de token y roles (`admin`, `operador`).

---

## Base de Datos SQL

El motor SQL utiliza SQLite con `PRAGMA foreign_keys = ON;` y `PRAGMA journal_mode = WAL;` para máxima concurrencia y tolerancia a fallos.

### Tablas Principales:
- **`users`**: Operadores y administradores con roles y hash de contraseña.
- **`reports`**: Reportes de incidentes barriales con código `#REP-YYYY-XXXX`, ubicación, solicitante y estado.
- **`report_logs`**: Trazabilidad cronológica de las cuadrillas municipales.
- **`comments`**: Testimonios y aportes vecinales.
- **`audit_logs`**: Auditoría inmutable de eventos de seguridad y cambios de estado.

---

## Endpoints de la API REST

### Reportes
- `POST /api/reports`: Crear nuevo reporte (soporta `multipart/form-data` con foto).
- `GET /api/reports`: Listar reportes con filtros (`search`, `type`, `status`, `sort`, `page`, `limit`).
- `GET /api/reports/:code`: Obtener reporte específico con su bitácora y testimonios.
- `PATCH /api/reports/:code/status`: Actualizar estado operativo y asignar cuadrilla (Requiere JWT de operador/admin).
- `GET /api/reports/export/csv`: Descarga oficial de reportes en formato CSV.

### Comentarios y Testimonios
- `POST /api/reports/:code/comments`: Agregar testimonio o dato al expediente.

### Estadísticas Comunales
- `GET /api/stats`: Métricas en tiempo real (total, pendientes, en cuadrilla, efectividad).

### Autenticación
- `POST /api/auth/login`: Inicio de sesión de operador/admin.
- `GET /api/auth/me`: Perfil del usuario autenticado.

---

## Credenciales de Prueba (Operadores Comunales)

| Usuario | Contraseña | Rol | Área |
| :--- | :--- | :--- | :--- |
| `admin` | `Admin@Civic2024!` | `admin` | Mesa General Comunal |
| `lrossi` | `Operador@2024!` | `operador` | Servicios Públicos |
| `mgomez` | `Operador@2024!` | `operador` | Higiene y Arbolado |

---

## Pruebas Automatizadas

Para ejecutar la suite completa de 29 pruebas automatizadas (incluyendo verificación de neutralización de SQL Injection y XSS):

```bash
npm test
```
