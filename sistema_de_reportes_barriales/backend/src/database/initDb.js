const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const logger = require('../utils/logger');

function initDatabase() {
  logger.info('Iniciando verificación y migración de base de datos SQL...');

  // 1. Ejecutar esquema DDL
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
  logger.info('Esquema de tablas e índices SQL creado/verificado exitosamente.');

  // 2. Sembrar usuarios operadores iniciales si no existen
  const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const userCount = userCountStmt.get().count;

  if (userCount === 0) {
    logger.info('Sembrando usuarios administrativos y operadores comunales...');
    const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, area)
      VALUES (?, ?, ?, ?, ?)
    `);

    const saltRounds = 10;
    const adminHash = bcrypt.hashSync('Admin@Civic2024!', saltRounds);
    const opHash = bcrypt.hashSync('Operador@2024!', saltRounds);

    insertUser.run('admin', adminHash, 'Administrador Central de Comuna', 'admin', 'Mesa General');
    insertUser.run('lrossi', opHash, 'Ing. Lucas Rossi', 'operador', 'Servicios Públicos');
    insertUser.run('mgomez', opHash, 'Lic. Mariana Gómez', 'operador', 'Higiene y Arbolado');
    logger.info('Usuarios iniciales sembrados (admin, lrossi, mgomez).');
  }

  // 3. Sembrar reportes cívicos iniciales si la tabla está vacía
  const reportCountStmt = db.prepare('SELECT COUNT(*) as count FROM reports');
  const reportCount = reportCountStmt.get().count;

  if (reportCount === 0) {
    logger.info('Sembrando reportes iniciales realistas para pruebas y verificación...');

    const insertReport = db.prepare(`
      INSERT INTO reports (
        code, nombre_apellido, dni, contacto, tipo_incidente, direccion, coordenadas,
        comuna, descripcion, foto_url, foto_original_name, estado, prioridad,
        cuadrilla_asignada, tiempo_estimado, acta_numero, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertLog = db.prepare(`
      INSERT INTO report_logs (report_id, etapa, etiqueta_estado, descripcion, responsable, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertComment = db.prepare(`
      INSERT INTO comments (report_id, autor, es_iniciador, contenido, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Reporte 1: #REP-2024-8942
    insertReport.run(
      '#REP-2024-8942',
      'Carlos Méndez',
      '32894120',
      '+54 9 11 4892-3344',
      'alumbrado',
      'Av. Corrientes 3820, Almagro',
      '-34.6037, -58.4201',
      'Comuna 5',
      'La farola triple del cruce peatonal se encuentra apagada hace 3 noches consecutivas, dejando la esquina totalmente a oscuras en horario de salida escolar y generando riesgo vial para los peatones.',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC_nKgUWYodrysjc_rdWPpFg2I_yjtfIxZnelOjBYYmVjtOVAHANl350c2tHNwxuzOyMdLl10_XI6eVzSO4I3xKDX9veGdESdaCX-qIV3luRRoTj2hswQzP2JcNLGusgM47mHdsD59hXrYt6QrBc-4DnBrM-V9WijR_jR4ZF-zWJ63aIOuKIaD80Al73ZqeEzxGCXlD2oVxQN1o9sof3GQWbhWl6cnruyRYrTcB7Xx0P8PyyNz5KGA',
      'luminaria_rota_corrientes.jpg',
      'en_proceso',
      'alta',
      'Cuadrilla de Alumbrado N° 4',
      'Hoy 18:00 hs',
      null,
      '2024-10-14 09:15:00'
    );
    const rep1 = db.prepare('SELECT id FROM reports WHERE code = ?').get('#REP-2024-8942');

    insertLog.run(rep1.id, '1. Recibido', 'Registrado digital', 'Ingreso automático registrado mediante la aplicación web del Sistema de Gestión Vecinal. Geolocalización confirmada.', 'Sistema Automatizado', '2024-10-14 09:15:00');
    insertLog.run(rep1.id, '2. En revisión', 'Derivado', 'Reporte validado formalmente por mesa de entradas comunal y derivado con orden de trabajo N° 1884 a la empresa de mantenimiento.', 'Operador Comuna 5', '2024-10-14 11:30:00');
    insertLog.run(rep1.id, '3. En proceso', 'En Sitio', 'Cuadrilla de Alumbrado N° 4 arribó al lugar para reemplazo preventivo de balasto térmico y recambio de fotocélula dañada.', 'Ing. Lucas Rossi – Dir. de Servicios Públicos', '2024-10-15 08:20:00');

    insertComment.run(rep1.id, 'Carlos Méndez (Iniciador)', 1, 'Confirmo que al caer el sol volvió a quedar sin luz la vereda par del colegio. Gracias por el seguimiento rápido.', '2024-10-14 19:40:00');

    // Reporte 2: #REP-2024-8930
    insertReport.run(
      '#REP-2024-8930',
      'Mariana Toledo',
      '28123456',
      'mariana.toledo@vecina.com',
      'infraestructura',
      'Av. Rivadavia 4520, esq. Acoyte',
      '-34.6180, -58.4350',
      'Comuna 6',
      'Bache profundo en carril derecho sobre asfalto tras filtración de red pluvial. Riesgo de rotura de tren delantero para colectivos.',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDP_fAkzMdlPXcdSIIzYXZfHWZ8iliD4_0Bnl24Hi2QpBFVCpFJ-LjVGdJ1KM5ZCgubbveL7ljARmDjVN-BOhG7bj3RTLg9sWCdEuZJ4tIODzBuuxQb3EW3bdQ7VyuqLhLer33Luj30DAV04ARVGc9X1Eq3Nqu9BPNuDEteUU-1tlmjznT9UyuD6xG12X53cpNKDHhlhnjlDTb5x4TWlBTuzopeYwN_gECpz7hgojJuiefbzZhXnM4',
      'bache_rivadavia.jpg',
      'en_proceso',
      'alta',
      'Cuadrilla Vial N° 2',
      'Inspección hoy',
      null,
      '2024-10-14 16:40:00'
    );
    const rep2 = db.prepare('SELECT id FROM reports WHERE code = ?').get('#REP-2024-8930');
    insertLog.run(rep2.id, '1. Recibido', 'Registrado digital', 'Reporte registrado por ciudadana.', 'Sistema', '2024-10-14 16:40:00');
    insertLog.run(rep2.id, '2. En proceso', 'En Cuadrilla', 'Asignada cuadrilla vial de bacheo en frío.', 'Inspector Vial Comuna 6', '2024-10-15 08:00:00');

    // Reporte 3: #REP-2024-8915
    insertReport.run(
      '#REP-2024-8915',
      'Juan Carlos Balcarce',
      '18987220',
      '11 4455-8899',
      'limpieza',
      'Calle Balcarce 740, entre Alsina y Belgrano',
      '-34.6120, -58.3710',
      'Comuna 1',
      'Vaciado de contenedor colapsado y restos de poda de árboles sobre la acera peatonal.',
      null,
      null,
      'resuelto',
      'media',
      'Higiene Urbana Nocturna',
      'Finalizado',
      'Acta Comunal #9921',
      '2024-10-12 11:20:00'
    );
    const rep3 = db.prepare('SELECT id FROM reports WHERE code = ?').get('#REP-2024-8915');
    insertLog.run(rep3.id, '1. Recibido', 'Registrado', 'Reclamo vecinal ingresado.', 'Sistema', '2024-10-12 11:20:00');
    insertLog.run(rep3.id, '2. Resuelto', 'Completado', 'Contenedor desobstruido e higienizado con hidrolavado. Acta Comunal #9921 labrada.', 'Supervisor Higiene Comuna 1', '2024-10-12 15:32:00');

    // Reporte 4: #REP-2024-8902
    insertReport.run(
      '#REP-2024-8902',
      'Laura Vazquez',
      '33445678',
      'laura.v@correo.ar',
      'seguridad',
      'Plaza Almagro, sector calesita',
      '-34.6050, -58.4210',
      'Comuna 5',
      'Farola rota e intrusión de ramas que impiden visibilidad en sector infantil nocturno.',
      null,
      null,
      'pendiente',
      'media',
      null,
      '24 a 48 hs',
      null,
      '2024-10-15 10:10:00'
    );

    // Reporte 5: #REP-2024-8890
    insertReport.run(
      '#REP-2024-8890',
      'Esteban Peralta',
      '29876543',
      '11 5566-7788',
      'ruidos',
      'Av. San Martín 1420, Barrio Belgrano',
      '-34.5650, -58.4550',
      'Comuna 13',
      'Maquinaria pesada trabajando en demolición fuera del horario permitido (02:30 AM).',
      null,
      null,
      'pendiente',
      'alta',
      null,
      '< 3 horas',
      null,
      '2024-10-15 11:45:00'
    );

    logger.info('Sembrado de datos iniciales completado.');
  }

  // 4. Migración automática: asegurar una cuenta ciudadana por cada DNI
  // existente, incluso para reportes creados antes de esta versión.
  const citizenRows = db.prepare(`
    SELECT dni, nombre_apellido, contacto
    FROM reports
    WHERE dni IS NOT NULL AND TRIM(dni) <> ''
    GROUP BY dni
    ORDER BY MAX(id) DESC
  `).all();

  const upsertCitizen = db.prepare(`
    INSERT INTO citizen_users (dni, nombre_apellido, contacto)
    VALUES (?, ?, ?)
    ON CONFLICT(dni) DO UPDATE SET
      nombre_apellido = excluded.nombre_apellido,
      contacto = COALESCE(excluded.contacto, citizen_users.contacto),
      updated_at = CURRENT_TIMESTAMP
  `);

  // DatabaseSync no expone db.transaction(); usamos BEGIN/COMMIT nativos
  // para que la migración siga siendo atómica.
  db.exec('BEGIN');
  try {
    for (const citizen of citizenRows) {
      upsertCitizen.run(citizen.dni, citizen.nombre_apellido, citizen.contacto || null);
    }
    db.exec('COMMIT');
  } catch (migrationError) {
    db.exec('ROLLBACK');
    throw migrationError;
  }
  logger.info(`Cuentas ciudadanas sincronizadas por DNI: ${citizenRows.length}.`);
}

// Ejecución directa si se corre el script
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
