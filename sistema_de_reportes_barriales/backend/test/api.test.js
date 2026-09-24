/**
 * Suite de Pruebas de Integración y Verificación de Ciberseguridad
 * Ejecuta validaciones de endpoints, SQL Injection, XSS, Rate Limiting y Privacidad.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const initDb = require('../src/database/initDb');

// Inicializar base de datos limpia para pruebas
initDb();

const TEST_PORT = 3456;
let server;

function request(options, postData = null, isMultipart = false, boundary = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: TEST_PORT,
      ...options
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let parsed = body;
        try {
          parsed = JSON.parse(body);
        } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
          rawBody: body
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      if (typeof postData === 'object' && !isMultipart) {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(postData));
      } else {
        req.write(postData);
      }
    }

    req.end();
  });
}

async function runTests() {
  console.log('\n===============================================================');
  console.log(' INICIANDO VERIFICACIÓN DE BACKEND Y AUDITORÍA DE SEGURIDAD');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    server = app.listen(TEST_PORT);

    // 1. Prueba de Salud del Servidor
    console.log('--- 1. Diagnóstico de Salud y Configuración de Cabeceras Seguras ---');
    const healthRes = await request({ method: 'GET', path: '/api/health' });
    assert(healthRes.statusCode === 200, 'Endpoint /api/health responde 200 OK');
    assert(healthRes.headers['x-content-type-options'] === 'nosniff', 'Cabecera X-Content-Type-Options: nosniff presente (Helmet)');
    assert(healthRes.headers['x-frame-options'] === 'SAMEORIGIN', 'Cabecera X-Frame-Options: SAMEORIGIN presente (Anti-Clickjacking)');

    // 2. Consulta Pública de Reportes (Con Protección de Datos Ley 25.326)
    console.log('\n--- 2. Listado de Reportes y Enmascaramiento de Datos Personales ---');
    const listRes = await request({ method: 'GET', path: '/api/reports' });
    assert(listRes.statusCode === 200, 'Endpoint /api/reports responde 200 OK');
    assert(Array.isArray(listRes.body.reports), 'Devuelve un listado de reportes en array');
    assert(listRes.body.reports.length >= 3, 'Existen reportes sembrados en la base de datos SQL');

    // Verificar que los datos personales estén enmascarados
    const firstRep = listRes.body.reports[0];
    assert(firstRep.dni.startsWith('***.'), `El DNI vecinal está debidamente enmascarado (${firstRep.dni})`);
    assert(firstRep.contacto === undefined, 'El teléfono o email vecinal NO se expone en endpoints públicos');

    // 3. Creación de Nuevo Reporte Vecinal (POST /api/reports)
    console.log('\n--- 3. Creación de Nuevo Reporte Cívico con Inserción SQL Parametrizada ---');
    const newReportPayload = {
      nombre_apellido: 'Estela Domínguez',
      dni: '35889912',
      contacto: 'estela.d@vecina.com',
      tipo_incidente: 'infraestructura',
      direccion: 'Av. Corrientes 5200, Villa Crespo',
      coordenadas: '-34.5990, -58.4350',
      descripcion: 'Bache con hundimiento peligroso frente a parada de colectivo línea 19.'
    };

    const createRes = await request(
      { method: 'POST', path: '/api/reports' },
      newReportPayload
    );
    assert(createRes.statusCode === 201, 'Creación de reporte responde 201 Created');
    assert(createRes.body.data && createRes.body.data.code.startsWith('#REP-'), `Código de ticket único generado: ${createRes.body.data?.code}`);

    const createdCode = createRes.body.data.code;

    // 4. Detalle y Bitácora del Reporte Creado
    console.log('\n--- 4. Consulta de Detalle de Ticket y Bitácora Oficial ---');
    const detailRes = await request({ method: 'GET', path: `/api/reports/${encodeURIComponent(createdCode)}` });
    assert(detailRes.statusCode === 200, `Detalle de ${createdCode} obtenido correctamente`);
    assert(detailRes.body.data.estado === 'pendiente', 'Estado inicial del reporte es "pendiente"');
    assert(Array.isArray(detailRes.body.data.logs) && detailRes.body.data.logs.length >= 1, 'Hito inicial registrado en bitácora de cuadrilla');

    // 5. Agregar Comentario Vecinal (POST /api/reports/:code/comments)
    console.log('\n--- 5. Aporte Ciudadano y Testimonio en Expediente ---');
    const commentRes = await request(
      { method: 'POST', path: `/api/reports/${encodeURIComponent(createdCode)}/comments` },
      {
        autor: 'Vecino Línea 19',
        contenido: 'Confirmo que el bache dificulta el frenado de los colectivos.',
        es_iniciador: 0
      }
    );
    assert(commentRes.statusCode === 201, 'Comentario registrado con código 201');
    assert(commentRes.body.data.some(c => c.contenido.includes('dificulta el frenado')), 'Comentario persistido en base de datos SQL');

    // 6. Prueba de Seguridad: Neutralización de Inyección SQL
    console.log('\n--- 6. Auditoría de Ciberseguridad: Intento de Inyección SQL ---');
    const sqlInjectionPayload = {
      search: "' OR '1'='1' --"
    };
    const sqliRes = await request({
      method: 'GET',
      path: `/api/reports?search=${encodeURIComponent(sqlInjectionPayload.search)}`
    });
    assert(sqliRes.statusCode === 200, 'Búsqueda con caracteres maliciosos manejada con éxito sin excepción SQL');
    assert(sqliRes.body.reports.length === 0, 'La inyección SQL fue neutralizada como cadena literal (0 falsos positivos devueltos)');

    // 7. Prueba de Seguridad: Neutralización de Cross-Site Scripting (XSS)
    console.log('\n--- 7. Auditoría de Ciberseguridad: Intento de Inyección XSS ---');
    const xssPayload = {
      nombre_apellido: 'Atacante <script>alert("XSS")</script>',
      dni: '22334455',
      tipo_incidente: 'limpieza',
      direccion: '<img src=x onerror="alert(1)"> Calle Falsa 123',
      descripcion: 'Reporte con script malicioso <script>document.cookie</script> para probar sanitización.'
    };
    const xssRes = await request({ method: 'POST', path: '/api/reports' }, xssPayload);
    assert(xssRes.statusCode === 201, 'Reporte recibido y procesado por capa de sanitización');
    assert(!xssRes.body.data.descripcion.includes('<script>'), 'Etiquetas <script> neutralizadas y escapadas antes de la persistencia');

    // 8. Autenticación de Operador Comunal y Control de Acceso (RBAC)
    console.log('\n--- 8. Autenticación Segura con Contraseña Hashed (bcrypt) y Emisión JWT ---');
    // Intento con contraseña incorrecta
    const failLogin = await request(
      { method: 'POST', path: '/api/auth/login' },
      { username: 'admin', password: 'password_incorrecta' }
    );
    assert(failLogin.statusCode === 401, 'Acceso denegado con credenciales incorrectas (401 Unauthorized)');

    // Intento con credenciales correctas
    const okLogin = await request(
      { method: 'POST', path: '/api/auth/login' },
      { username: 'admin', password: 'Admin@Civic2024!' }
    );
    assert(okLogin.statusCode === 200, 'Inicio de sesión exitoso con credenciales correctas');
    assert(typeof okLogin.body.token === 'string', 'Token JWT generado y recibido');

    const adminToken = okLogin.body.token;

    // 9. Actualización Privilegiada de Estado por Operador
    console.log('\n--- 9. Transición de Estado Operativo con Token JWT ---');
    const updateRes = await request(
      {
        method: 'PATCH',
        path: `/api/reports/${encodeURIComponent(createdCode)}/status`,
        headers: { 'Authorization': `Bearer ${adminToken}` }
      },
      {
        estado: 'en_proceso',
        cuadrilla_asignada: 'Cuadrilla Vial N° 1',
        tiempo_estimado: '24 hs',
        etapa_log: '3. En proceso',
        descripcion_log: 'Cuadrilla despachada al lugar con asfalto en frío.'
      }
    );
    assert(updateRes.statusCode === 200, 'Estado actualizado exitosamente por operador autorizado');
    assert(updateRes.body.data.estado === 'en_proceso', 'El nuevo estado "en_proceso" quedó asentado en la BD');

    // 10. Exportación de Datos en Formato CSV
    console.log('\n--- 10. Exportación Oficial a Archivo CSV ---');
    const csvRes = await request({ method: 'GET', path: '/api/reports/export/csv' });
    assert(csvRes.statusCode === 200, 'Descarga de CSV responde 200 OK');
    assert(csvRes.headers['content-type'].includes('text/csv'), 'Content-Type es text/csv');
    assert(csvRes.rawBody.includes('Codigo,Solicitante,DNI_Protegido'), 'Cabeceras CSV generadas correctamente');

    // 11. Métricas Comunales
    console.log('\n--- 11. Métricas Comunales para Tarjetas de Impacto ---');
    const statsRes = await request({ method: 'GET', path: '/api/stats' });
    assert(statsRes.statusCode === 200, 'Endpoint /api/stats responde 200 OK');
    assert(typeof statsRes.body.data.total === 'number' && statsRes.body.data.total >= 4, 'Total de reportes calculado correctamente');

    // 12. Acceso y Ruta del Portal de Administración
    console.log('\n--- 12. Portal de Administración Comunal y Control de Acceso ---');
    const adminViewRes = await request({ method: 'GET', path: '/admin' });
    assert(adminViewRes.statusCode === 200, 'Ruta /admin responde 200 OK');
    assert(adminViewRes.rawBody.includes('Portal de Gestión Operativa Comunal'), 'Interfaz de administración servida correctamente');

    // Intento de borrado sin autorización (401)
    const unauthDeleteRes = await request({ method: 'DELETE', path: `/api/reports/${encodeURIComponent(createdCode)}` });
    assert(unauthDeleteRes.statusCode === 401, 'Borrado de reporte denegado sin autenticación (401 Unauthorized)');

    // Borrado exitoso con token de administrador (200)
    const authDeleteRes = await request({
      method: 'DELETE',
      path: `/api/reports/${encodeURIComponent(createdCode)}`,
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(authDeleteRes.statusCode === 200, 'Reporte de prueba eliminado con éxito por el administrador');

    console.log('\n===============================================================');
    console.log(` RESULTADOS: ${passed} pruebas exitosas, ${failed} fallidas.`);
    console.log('===============================================================\n');

  } catch (err) {
    console.error('Error fatal durante las pruebas:', err);
    failed++;
  } finally {
    if (server) server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
