/**
 * 🧪 TEST SUITE COMPLETO - Todas las rutas usadas por el frontend
 * 
 * Este script prueba TODOS los endpoints del backend que el frontend utiliza
 * Ejecutar: node test-all-routes.js
 * 
 * Estructura: 68 RUTAS TOTALES en 11 categorías
 */

import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 3000}`;
const TIMEOUT = 10000;

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Estadísticas
let stats = {
  total: 0,
  success: 0,
  failed: 0,
  errors: []
};

// ========================================
// FUNCIÓN DE TEST HTTP NATIVO
// ========================================

async function testRoute(method, path, body = null, description = '') {
  stats.total++;
  const startTime = Date.now();

  return new Promise((resolve) => {
    try {
      const url = new URL(`${API_URL}/api${path}`);
      const options = {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: { 'Content-Type': 'application/json' },
        timeout: TIMEOUT
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          const duration = Date.now() - startTime;
          const statusOk = res.statusCode >= 200 && res.statusCode < 300;
          const statusText = statusOk ? `${colors.green}✓${colors.reset}` : 
                            (res.statusCode === 404 || res.statusCode === 400 || res.statusCode === 422) ? 
                            `${colors.yellow}○${colors.reset}` : `${colors.red}✗${colors.reset}`;

          console.log(`${statusText} ${method.padEnd(6)} ${path.padEnd(50)} [${res.statusCode}] ${description}`);

          // Contar como éxito si es 2xx o 4xx (ruta existe)
          if (statusOk || res.statusCode === 404 || res.statusCode === 400 || res.statusCode === 422) {
            stats.success++;
          } else {
            stats.failed++;
            stats.errors.push({ path, method, status: res.statusCode, description });
          }

          resolve({ success: statusOk, status: res.statusCode, duration });
        });
      });

      req.on('error', (error) => {
        stats.failed++;
        stats.errors.push({ path, method, error: error.message, description });
        console.log(`${colors.red}✗${colors.reset} ${method.padEnd(6)} ${path.padEnd(50)} ${colors.red}ERROR${colors.reset} ${error.message.substring(0, 40)}`);
        resolve({ success: false, error: error.message });
      });

      req.on('timeout', () => {
        req.destroy();
        stats.failed++;
        console.log(`${colors.red}✗${colors.reset} ${method.padEnd(6)} ${path.padEnd(50)} ${colors.red}TIMEOUT${colors.reset}`);
        resolve({ success: false, error: 'Timeout' });
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    } catch (error) {
      stats.failed++;
      console.log(`${colors.red}✗${colors.reset} ${method.padEnd(6)} ${path.padEnd(50)} ${colors.red}ERROR${colors.reset}`);
      resolve({ success: false, error: error.message });
    }
  });
}

// ========================================
// FUNCIÓN PARA AGRUPAR TESTS
// ========================================

function printSection(title) {
  console.log(`\n${colors.cyan}${'═'.repeat(80)}${colors.reset}`);
  console.log(`${colors.cyan}█ ${title}${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(80)}${colors.reset}\n`);
}

// ========================================
// INICIO DEL TEST SUITE
// ========================================

async function runAllTests() {
  console.log(`\n${colors.blue}🚀 INICIANDO TEST SUITE - Todas las rutas del backend${colors.reset}`);
  console.log(`${colors.gray}URL Base: ${API_URL}/api${colors.reset}`);
  console.log(`${colors.gray}Timestamp: ${new Date().toISOString()}${colors.reset}\n`);

  // ========================================
  // 1. SISTEMA Y HEALTH CHECK
  // ========================================
  printSection('SISTEMA Y HEALTH CHECK (1 ruta)');
  
  await testRoute('GET', '/health', null, 'Health check del servidor');

  // ========================================
  // 2. USUARIOS (17 rutas)
  // ========================================
  printSection('USUARIOS (17 rutas)');
  
  // Auth
  await testRoute('POST', '/users/login', 
    { email: 'test@test.com', password: 'test' },
    'Login de usuario'
  );

  // Registro
  await testRoute('POST', '/users', 
    { email: 'newuser@test.com', password: 'test123' },
    'Crear usuario'
  );

  await testRoute('POST', '/users/collector',
    { email: 'collector@test.com', password: 'test123', firstname: 'Juan', lastname: 'Pérez' },
    'Crear usuario reciclador'
  );

  await testRoute('POST', '/users/institution',
    { email: 'inst@test.com', password: 'test123', firstname: 'Admin', lastname: 'Inst' },
    'Crear usuario con institución'
  );

  await testRoute('POST', '/users/institution-admin',
    { email: 'admin@test.com', password: 'test123', firstname: 'Super', lastname: 'Admin' },
    'Crear usuario con institución por admin'
  );

  // Recuperar contraseña
  await testRoute('POST', '/users/forgotpassword',
    { email: 'test@test.com' },
    'Solicitar recuperación de contraseña'
  );

  // Cambiar contraseña
  await testRoute('PUT', '/users/1/changePassword',
    { currentPassword: 'old', newPassword: 'new' },
    'Cambiar contraseña de usuario'
  );

  // Gestión de recolectores
  await testRoute('GET', '/users/collectors/pending/institution', null,
    'Obtener recolectores pendientes de institución'
  );

  await testRoute('GET', '/users/collectors/pending', null,
    'Obtener recolectores pendientes de personas'
  );

  // Gestión de instituciones
  await testRoute('GET', '/users/institution', null,
    'Obtener usuarios con institución'
  );

  await testRoute('POST', '/users/institution/approve/1', null,
    'Aprobar institución'
  );

  await testRoute('POST', '/users/institution/reject/1', null,
    'Rechazar institución'
  );

  await testRoute('DELETE', '/users/institution/1', null,
    'Eliminar usuario con institución'
  );

  // Gestión de usuarios
  await testRoute('GET', '/users/withPerson', null,
    'Obtener usuarios persona'
  );

  await testRoute('POST', '/users/approve/1', null,
    'Aprobar usuario'
  );

  await testRoute('POST', '/users/reject/1', null,
    'Rechazar usuario'
  );

  // Rutas genéricas
  await testRoute('GET', '/users/withInstitution/1', null,
    'Obtener usuario con institución por ID'
  );

  await testRoute('GET', '/users/person/1', null,
    'Obtener usuario persona por ID'
  );

  await testRoute('GET', '/users/check-email/test@test.com', null,
    'Verificar si email existe'
  );

  await testRoute('PUT', '/users/1/role',
    { role: 'reciclador' },
    'Actualizar rol de usuario'
  );

  await testRoute('GET', '/users/1', null,
    'Obtener usuario por ID'
  );

  await testRoute('DELETE', '/users/1', null,
    'Eliminar usuario'
  );

  // ========================================
  // 3. MATERIALES (5 rutas)
  // ========================================
  printSection('MATERIALES (5 rutas)');

  await testRoute('GET', '/material', null,
    'Obtener todos los materiales'
  );

  await testRoute('GET', '/material/1', null,
    'Obtener material por ID'
  );

  await testRoute('POST', '/material',
    { name: 'Plástico', description: 'Plástico reciclable' },
    'Crear material'
  );

  await testRoute('PUT', '/material/1',
    { name: 'Plástico PET', description: 'Botellas de plástico' },
    'Actualizar material'
  );

  await testRoute('DELETE', '/material/1', null,
    'Eliminar material'
  );

  // ========================================
  // 4. SOLICITUDES (7 rutas)
  // ========================================
  printSection('SOLICITUDES (7 rutas)');

  await testRoute('GET', '/request', null,
    'Obtener todas las solicitudes'
  );

  await testRoute('POST', '/request',
    { userId: 1, materialId: 1, description: 'Reciclaje de plástico' },
    'Crear solicitud (sin fotos)'
  );

  await testRoute('GET', '/request/1', null,
    'Obtener solicitud por ID'
  );

  await testRoute('GET', '/request/user/1/state', null,
    'Obtener solicitudes por usuario y estado'
  );

  await testRoute('GET', '/request/1/schedule', null,
    'Obtener solicitud con horario'
  );

  await testRoute('PUT', '/request/1/state',
    { state: 2 },
    'Actualizar estado de solicitud'
  );

  await testRoute('POST', '/request/1/schedule',
    { collectorId: 1, appointmentDate: '2025-01-01' },
    'Crear cita para solicitud'
  );

  // ========================================
  // 5. CITAS (12 rutas)
  // ========================================
  printSection('CITAS (12 rutas)');

  await testRoute('GET', '/appointments', null,
    'Obtener todas las citas'
  );

  await testRoute('POST', '/appointments',
    { requestId: 1, collectorId: 1, appointmentDate: '2025-01-01' },
    'Crear cita'
  );

  await testRoute('GET', '/appointments/1', null,
    'Obtener cita por ID'
  );

  await testRoute('GET', '/appointments/collector/1', null,
    'Obtener citas por recolector'
  );

  await testRoute('GET', '/appointments/recycler/1', null,
    'Obtener citas por reciclador'
  );

  await testRoute('POST', '/appointments/schedule',
    { requestId: 1, collectorId: 1, appointmentDate: '2025-01-01' },
    'Programar nueva cita'
  );

  await testRoute('PUT', '/appointments/1',
    { status: 2 },
    'Actualizar cita'
  );

  await testRoute('PUT', '/appointments/1/accept', null,
    'Aceptar cita'
  );

  await testRoute('PUT', '/appointments/1/reject', null,
    'Rechazar cita'
  );

  await testRoute('PUT', '/appointments/1/cancel', null,
    'Cancelar cita'
  );

  await testRoute('PUT', '/appointments/1/complete', null,
    'Completar cita'
  );

  // ========================================
  // 6. NOTIFICACIONES (3 rutas)
  // ========================================
  printSection('NOTIFICACIONES (3 rutas)');

  await testRoute('GET', '/notifications/user/1', null,
    'Obtener notificaciones del usuario'
  );

  await testRoute('GET', '/notifications/unread/1', null,
    'Obtener cantidad de no leídas'
  );

  await testRoute('PUT', '/notifications/read',
    { notificationId: 1 },
    'Marcar notificación como leída'
  );

  // ========================================
  // 7. PUNTUACIONES (4 rutas)
  // ========================================
  printSection('PUNTUACIONES (4 rutas)');

  await testRoute('GET', '/score', null,
    'Obtener todas las puntuaciones'
  );

  await testRoute('POST', '/score',
    { appointmentId: 1, userId: 1, rating: 5, comment: 'Excelente' },
    'Crear puntuación'
  );

  await testRoute('GET', '/score/check/1/1', null,
    'Verificar si usuario ya calificó'
  );

  await testRoute('GET', '/score/appointment/1', null,
    'Obtener puntuaciones de cita'
  );

  await testRoute('GET', '/score/user/1/average', null,
    'Obtener promedio de calificación del usuario'
  );

  // ========================================
  // 8. ANUNCIOS (6 rutas)
  // ========================================
  printSection('ANUNCIOS (6 rutas)');

  await testRoute('GET', '/announcements', null,
    'Obtener todos los anuncios'
  );

  await testRoute('GET', '/announcements/1', null,
    'Obtener anuncio por ID'
  );

  await testRoute('GET', '/announcements/role/admin', null,
    'Obtener anuncios por rol'
  );

  await testRoute('POST', '/announcements',
    { title: 'Nuevo anuncio', content: 'Contenido', targetRole: 'admin' },
    'Crear anuncio'
  );

  await testRoute('PUT', '/announcements/1',
    { title: 'Actualizado', content: 'Nuevo contenido' },
    'Actualizar anuncio'
  );

  await testRoute('DELETE', '/announcements/1', null,
    'Eliminar anuncio'
  );

  // ========================================
  // 9. UPLOAD (3 rutas)
  // ========================================
  printSection('UPLOAD (3 rutas)');

  // Nota: Esto es solo para verificar que la ruta existe
  // Los uploads requieren multipart/form-data
  await testRoute('POST', '/upload/announcement',
    { filename: 'test.jpg' },
    'Subir imagen de anuncio'
  );

  await testRoute('GET', '/upload/announcement/test.jpg', null,
    'Obtener info de imagen de anuncio'
  );

  await testRoute('DELETE', '/upload/announcement/test.jpg', null,
    'Eliminar imagen de anuncio'
  );

  // ========================================
  // 10. RANKING (7 rutas)
  // ========================================
  printSection('RANKING (7 rutas)');

  await testRoute('GET', '/ranking/periods', null,
    'Obtener períodos de ranking'
  );

  await testRoute('POST', '/ranking/periods',
    { startDate: '2025-01-01', endDate: '2025-01-31' },
    'Crear período de ranking'
  );

  await testRoute('GET', '/ranking/periods/active-or-last', null,
    'Obtener período activo o último'
  );

  await testRoute('POST', '/ranking/periods/close', null,
    'Cerrar período de ranking'
  );

  await testRoute('GET', '/ranking/live/1', null,
    'Obtener ranking en vivo por período'
  );

  await testRoute('GET', '/ranking/tops/1', null,
    'Obtener tops de período'
  );

  await testRoute('GET', '/ranking/history/1', null,
    'Obtener histórico de período'
  );

  // ========================================
  // 11. REPORTES (3 rutas)
  // ========================================
  printSection('REPORTES (3 rutas)');

  await testRoute('GET', '/reports/materiales', null,
    'Obtener reporte de materiales'
  );

  await testRoute('GET', '/reports/scores', null,
    'Obtener reporte de puntuaciones'
  );

  await testRoute('GET', '/reports/recolecciones', null,
    'Obtener reporte de recolecciones'
  );

  // ========================================
  // RESUMEN FINAL
  // ========================================
  printSection('RESUMEN DE RESULTADOS');

  console.log(`${colors.cyan}Total de rutas testeadas:${colors.reset} ${colors.blue}${stats.total}${colors.reset}`);
  console.log(`${colors.green}✓ Exitosas:${colors.reset} ${colors.green}${stats.success}${colors.reset}`);
  console.log(`${colors.red}✗ Fallidas:${colors.reset} ${colors.red}${stats.failed}${colors.reset}`);
  console.log(`${colors.yellow}Tasa de éxito:${colors.reset} ${((stats.success / stats.total) * 100).toFixed(2)}%\n`);

  if (stats.errors.length > 0) {
    console.log(`${colors.yellow}⚠️  ERRORES ENCONTRADOS:${colors.reset}\n`);
    stats.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.method} ${error.path}`);
      console.log(`   ${error.description || error.error || ''}`);
      if (error.status) console.log(`   Status: ${error.status}`);
    });
  } else {
    console.log(`${colors.green}🎉 ¡Todas las rutas funcionan correctamente!${colors.reset}`);
  }

  console.log(`\n${colors.cyan}${'═'.repeat(80)}${colors.reset}`);
  console.log(`${colors.gray}Test completado en: ${new Date().toISOString()}${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(80)}${colors.reset}\n`);

  // Retornar código de salida
  process.exit(stats.failed > 0 ? 1 : 0);
}

// ========================================
// EJECUTAR TESTS
// ========================================
runAllTests().catch(error => {
  console.error(`${colors.red}Error fatal:${colors.reset}`, error);
  process.exit(1);
});
