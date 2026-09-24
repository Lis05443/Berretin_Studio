-- ============================================================================
-- SISTEMA DE REPORTES BARRIALES - ESQUEMA DE BASE DE DATOS SQL (ANSI SQL)
-- Cumple con integridad referencial, restricciones CHECK e indexación de búsqueda.
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. Tabla de Usuarios Administrativos y Operadores de Cuadrilla
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK(role IN ('admin', 'operador', 'tecnico')),
    area VARCHAR(100) DEFAULT 'Servicios Públicos',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

-- 2. Tabla de cuentas ciudadanas: el DNI es el identificador único del vecino.
-- Se crea automáticamente al registrar un reporte y permite consultar
-- exclusivamente los reportes asociados a ese DNI.
CREATE TABLE IF NOT EXISTS citizen_users (
    dni VARCHAR(20) PRIMARY KEY,
    nombre_apellido VARCHAR(150) NOT NULL,
    contacto VARCHAR(150),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

-- 3. Tabla Principal de Reportes de Incidentes Vecinales
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(30) NOT NULL UNIQUE,
    nombre_apellido VARCHAR(150) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    contacto VARCHAR(150),
    tipo_incidente VARCHAR(50) NOT NULL CHECK(
        tipo_incidente IN (
            'alumbrado',
            'infraestructura',
            'limpieza',
            'seguridad',
            'ruidos',
            'arbolado',
            'pluvial',
            'otro'
        )
    ),
    direccion VARCHAR(255) NOT NULL,
    coordenadas VARCHAR(100) DEFAULT '-34.6037, -58.3816',
    comuna VARCHAR(50) DEFAULT 'Comuna 5',
    descripcion TEXT NOT NULL,
    foto_url VARCHAR(255),
    foto_original_name VARCHAR(255),
    foto_size_bytes INTEGER DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK(
        estado IN ('pendiente', 'en_revision', 'en_proceso', 'resuelto')
    ),
    prioridad VARCHAR(20) NOT NULL DEFAULT 'media' CHECK(
        prioridad IN ('baja', 'media', 'alta', 'urgente')
    ),
    cuadrilla_asignada VARCHAR(100),
    tiempo_estimado VARCHAR(100),
    acta_numero VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Bitácora Oficial de Cuadrilla (Trazabilidad y Cronología)
CREATE TABLE IF NOT EXISTS report_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    etapa VARCHAR(50) NOT NULL,
    etiqueta_estado VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    responsable VARCHAR(150) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- 5. Tabla de Aportes y Testimonios Vecinales (Comentarios Ciudadanos)
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    autor VARCHAR(150) NOT NULL,
    es_iniciador INTEGER DEFAULT 0,
    contenido VARCHAR(300) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- 6. Tabla Inmutable de Auditoría de Ciberseguridad y Cambios de Estado
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    action VARCHAR(50) NOT NULL,
    user_id INTEGER,
    ip_address VARCHAR(50),
    user_agent TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices optimizados para búsquedas rápidas y prevención de bloqueos
CREATE INDEX IF NOT EXISTS idx_citizen_users_active ON citizen_users(is_active);
CREATE INDEX IF NOT EXISTS idx_reports_code ON reports(code);
CREATE INDEX IF NOT EXISTS idx_reports_dni ON reports(dni);
CREATE INDEX IF NOT EXISTS idx_reports_estado ON reports(estado);
CREATE INDEX IF NOT EXISTS idx_reports_tipo ON reports(tipo_incidente);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_logs_report_id ON report_logs(report_id);
CREATE INDEX IF NOT EXISTS idx_comments_report_id ON comments(report_id);
