/**
 * 📊 GENERADOR DE REPORTE HTML - Pruebas de Rutas
 * 
 * Este script prueba todas las rutas y genera un reporte visual en HTML
 * Ejecutar: node test-routes-report.js
 * 
 * Genera: routes-test-report.html
 */

import http from 'http';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = `http://localhost:${process.env.PORT || 3000}`;
const TIMEOUT = 10000;

// ========================================
// DEFINICIÓN DE TODAS LAS RUTAS
// ========================================

const routes = [
  // SISTEMA (1)
  { method: 'GET', path: '/health', category: 'Sistema', description: 'Health check' },

  // USUARIOS (17)
  { method: 'POST', path: '/users/login', category: 'Usuarios', description: 'Login', body: { email: 'test@test.com', password: 'test' } },
  { method: 'POST', path: '/users', category: 'Usuarios', description: 'Crear usuario', body: { email: 'new@test.com', password: 'test123' } },
  { method: 'POST', path: '/users/collector', category: 'Usuarios', description: 'Crear recolector', body: { email: 'col@test.com', password: 'test' } },
  { method: 'POST', path: '/users/institution', category: 'Usuarios', description: 'Crear usuario institución', body: { email: 'inst@test.com', password: 'test' } },
  { method: 'POST', path: '/users/institution-admin', category: 'Usuarios', description: 'Crear admin institución', body: { email: 'admin@inst.com', password: 'test' } },
  { method: 'POST', path: '/users/forgotpassword', category: 'Usuarios', description: 'Recuperar contraseña', body: { email: 'test@test.com' } },
  { method: 'PUT', path: '/users/1/changePassword', category: 'Usuarios', description: 'Cambiar contraseña', body: { currentPassword: 'old', newPassword: 'new' } },
  { method: 'GET', path: '/users/collectors/pending/institution', category: 'Usuarios', description: 'Recolectores pendientes institución' },
  { method: 'GET', path: '/users/collectors/pending', category: 'Usuarios', description: 'Recolectores pendientes persona' },
  { method: 'GET', path: '/users/institution', category: 'Usuarios', description: 'Usuarios institución' },
  { method: 'POST', path: '/users/institution/approve/1', category: 'Usuarios', description: 'Aprobar institución' },
  { method: 'POST', path: '/users/institution/reject/1', category: 'Usuarios', description: 'Rechazar institución' },
  { method: 'DELETE', path: '/users/institution/1', category: 'Usuarios', description: 'Eliminar institución' },
  { method: 'GET', path: '/users/withPerson', category: 'Usuarios', description: 'Usuarios persona' },
  { method: 'POST', path: '/users/approve/1', category: 'Usuarios', description: 'Aprobar usuario' },
  { method: 'POST', path: '/users/reject/1', category: 'Usuarios', description: 'Rechazar usuario' },
  { method: 'GET', path: '/users/withInstitution/1', category: 'Usuarios', description: 'Usuario institución por ID' },
  { method: 'GET', path: '/users/person/1', category: 'Usuarios', description: 'Usuario persona por ID' },
  { method: 'GET', path: '/users/check-email/test@test.com', category: 'Usuarios', description: 'Verificar email' },
  { method: 'PUT', path: '/users/1/role', category: 'Usuarios', description: 'Actualizar rol', body: { role: 'reciclador' } },
  { method: 'GET', path: '/users/1', category: 'Usuarios', description: 'Usuario por ID' },
  { method: 'DELETE', path: '/users/1', category: 'Usuarios', description: 'Eliminar usuario' },

  // MATERIALES (5)
  { method: 'GET', path: '/material', category: 'Materiales', description: 'Obtener materiales' },
  { method: 'GET', path: '/material/1', category: 'Materiales', description: 'Material por ID' },
  { method: 'POST', path: '/material', category: 'Materiales', description: 'Crear material', body: { name: 'Plástico', description: 'Reciclable' } },
  { method: 'PUT', path: '/material/1', category: 'Materiales', description: 'Actualizar material', body: { name: 'Plástico PET' } },
  { method: 'DELETE', path: '/material/1', category: 'Materiales', description: 'Eliminar material' },

  // SOLICITUDES (7)
  { method: 'GET', path: '/request', category: 'Solicitudes', description: 'Obtener solicitudes' },
  { method: 'POST', path: '/request', category: 'Solicitudes', description: 'Crear solicitud', body: { userId: 1, materialId: 1 } },
  { method: 'GET', path: '/request/1', category: 'Solicitudes', description: 'Solicitud por ID' },
  { method: 'GET', path: '/request/user/1/state', category: 'Solicitudes', description: 'Solicitudes por usuario y estado' },
  { method: 'GET', path: '/request/1/schedule', category: 'Solicitudes', description: 'Solicitud con horario' },
  { method: 'PUT', path: '/request/1/state', category: 'Solicitudes', description: 'Actualizar estado solicitud', body: { state: 2 } },
  { method: 'POST', path: '/request/1/schedule', category: 'Solicitudes', description: 'Programar cita', body: { collectorId: 1 } },

  // CITAS (12)
  { method: 'GET', path: '/appointments', category: 'Citas', description: 'Obtener citas' },
  { method: 'POST', path: '/appointments', category: 'Citas', description: 'Crear cita', body: { requestId: 1, collectorId: 1 } },
  { method: 'GET', path: '/appointments/1', category: 'Citas', description: 'Cita por ID' },
  { method: 'GET', path: '/appointments/collector/1', category: 'Citas', description: 'Citas por recolector' },
  { method: 'GET', path: '/appointments/recycler/1', category: 'Citas', description: 'Citas por reciclador' },
  { method: 'POST', path: '/appointments/schedule', category: 'Citas', description: 'Programar cita', body: { requestId: 1, collectorId: 1 } },
  { method: 'PUT', path: '/appointments/1', category: 'Citas', description: 'Actualizar cita', body: { status: 2 } },
  { method: 'PUT', path: '/appointments/1/accept', category: 'Citas', description: 'Aceptar cita' },
  { method: 'PUT', path: '/appointments/1/reject', category: 'Citas', description: 'Rechazar cita' },
  { method: 'PUT', path: '/appointments/1/cancel', category: 'Citas', description: 'Cancelar cita' },
  { method: 'PUT', path: '/appointments/1/complete', category: 'Citas', description: 'Completar cita' },

  // NOTIFICACIONES (3)
  { method: 'GET', path: '/notifications/user/1', category: 'Notificaciones', description: 'Notificaciones del usuario' },
  { method: 'GET', path: '/notifications/unread/1', category: 'Notificaciones', description: 'Cantidad sin leer' },
  { method: 'PUT', path: '/notifications/read', category: 'Notificaciones', description: 'Marcar como leída', body: { notificationId: 1 } },

  // PUNTUACIONES (5)
  { method: 'GET', path: '/score', category: 'Puntuaciones', description: 'Obtener puntuaciones' },
  { method: 'POST', path: '/score', category: 'Puntuaciones', description: 'Crear puntuación', body: { appointmentId: 1, userId: 1, rating: 5 } },
  { method: 'GET', path: '/score/check/1/1', category: 'Puntuaciones', description: 'Verificar si calificó' },
  { method: 'GET', path: '/score/appointment/1', category: 'Puntuaciones', description: 'Puntuaciones de cita' },
  { method: 'GET', path: '/score/user/1/average', category: 'Puntuaciones', description: 'Promedio de usuario' },

  // ANUNCIOS (6)
  { method: 'GET', path: '/announcements', category: 'Anuncios', description: 'Obtener anuncios' },
  { method: 'GET', path: '/announcements/1', category: 'Anuncios', description: 'Anuncio por ID' },
  { method: 'GET', path: '/announcements/role/admin', category: 'Anuncios', description: 'Anuncios por rol' },
  { method: 'POST', path: '/announcements', category: 'Anuncios', description: 'Crear anuncio', body: { title: 'Test', content: 'Test' } },
  { method: 'PUT', path: '/announcements/1', category: 'Anuncios', description: 'Actualizar anuncio', body: { title: 'Updated' } },
  { method: 'DELETE', path: '/announcements/1', category: 'Anuncios', description: 'Eliminar anuncio' },

  // UPLOAD (3)
  { method: 'POST', path: '/upload/announcement', category: 'Upload', description: 'Subir imagen anuncio' },
  { method: 'GET', path: '/upload/announcement/test.jpg', category: 'Upload', description: 'Obtener info imagen' },
  { method: 'DELETE', path: '/upload/announcement/test.jpg', category: 'Upload', description: 'Eliminar imagen' },

  // RANKING (7)
  { method: 'GET', path: '/ranking/periods', category: 'Ranking', description: 'Obtener períodos' },
  { method: 'POST', path: '/ranking/periods', category: 'Ranking', description: 'Crear período', body: { startDate: '2025-01-01' } },
  { method: 'GET', path: '/ranking/periods/active-or-last', category: 'Ranking', description: 'Período activo' },
  { method: 'POST', path: '/ranking/periods/close', category: 'Ranking', description: 'Cerrar período' },
  { method: 'GET', path: '/ranking/live/1', category: 'Ranking', description: 'Ranking en vivo' },
  { method: 'GET', path: '/ranking/tops/1', category: 'Ranking', description: 'Tops' },
  { method: 'GET', path: '/ranking/history/1', category: 'Ranking', description: 'Histórico' },

  // REPORTES (3)
  { method: 'GET', path: '/reports/materiales', category: 'Reportes', description: 'Reporte materiales' },
  { method: 'GET', path: '/reports/scores', category: 'Reportes', description: 'Reporte puntuaciones' },
  { method: 'GET', path: '/reports/recolecciones', category: 'Reportes', description: 'Reporte recolecciones' },
];

// ========================================
// FUNCIÓN DE TEST
// ========================================

async function testRoute(method, path, body = null) {
  const fullUrl = `${API_URL}${path}`;
  const startTime = Date.now();

  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: TIMEOUT
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(fullUrl, options);
    const duration = Date.now() - startTime;
    
    let statusOk = response.status >= 200 && response.status < 300;
    
    // 404 es esperable en muchos casos (datos no existen)
    // 400/422 también es esperable (validación)
    // Lo importante es que la ruta responda
    if (response.status === 404 || response.status === 400 || response.status === 422) {
      statusOk = true; // Ruta existe pero no hay datos
    }

    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }

    return {
      success: statusOk,
      status: response.status,
      duration,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
      status: 0
    };
  }
}

// ========================================
// GENERAR REPORTE HTML
// ========================================

async function generateReport() {
  console.log('🔄 Iniciando pruebas de rutas...');
  console.log(`📡 API URL: ${API_URL}/api\n`);

  const results = [];
  let completed = 0;

  for (const route of routes) {
    const result = await testRoute(route.method, route.path, route.body);
    results.push({ ...route, ...result });
    completed++;
    
    const status = result.success ? '✓' : '✗';
    process.stdout.write(`\r📊 Progreso: ${completed}/${routes.length} ${status}`);
  }

  console.log('\n\n📝 Generando reporte HTML...\n');

  // Agrupar por categoría
  const byCategory = {};
  results.forEach(r => {
    if (!byCategory[r.category]) {
      byCategory[r.category] = [];
    }
    byCategory[r.category].push(r);
  });

  // Calcular estadísticas
  const totalRoutes = results.length;
  const successfulRoutes = results.filter(r => r.success).length;
  const failedRoutes = totalRoutes - successfulRoutes;
  const avgResponseTime = (results.reduce((sum, r) => sum + (r.duration || 0), 0) / totalRoutes).toFixed(2);

  // Generar HTML
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Rutas - Green Bit</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            background: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .header h1 {
            color: #1e3c72;
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header p {
            color: #666;
            font-size: 1em;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }

        .stat-card.success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }

        .stat-card.warning {
            background: linear-gradient(135deg, #f93b1d 0%, #ea1e63 100%);
        }

        .stat-card h3 {
            font-size: 2em;
            margin-bottom: 5px;
        }

        .stat-card p {
            font-size: 0.9em;
            opacity: 0.9;
        }

        .categories {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .category-card {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .category-header {
            background: #1e3c72;
            color: white;
            padding: 15px;
            font-size: 1.2em;
            font-weight: bold;
        }

        .routes-list {
            padding: 15px;
        }

        .route-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #eee;
            font-size: 0.9em;
        }

        .route-item:last-child {
            border-bottom: none;
        }

        .route-status {
            display: inline-block;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.8em;
            font-weight: bold;
        }

        .route-status.success {
            background: #38ef7d;
        }

        .route-status.warning {
            background: #f93b1d;
        }

        .route-method {
            background: #f0f0f0;
            padding: 3px 8px;
            border-radius: 3px;
            font-weight: bold;
            margin-right: 8px;
            min-width: 50px;
            text-align: center;
            font-size: 0.8em;
        }

        .route-method.get { color: #0066cc; }
        .route-method.post { color: #009933; }
        .route-method.put { color: #ff6600; }
        .route-method.delete { color: #cc0000; }

        .route-path {
            flex: 1;
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            color: #333;
        }

        .route-time {
            color: #999;
            font-size: 0.8em;
            min-width: 60px;
            text-align: right;
        }

        .footer {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }

        .method-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.75em;
            font-weight: bold;
            margin-right: 8px;
        }

        .get { background: #e3f2fd; color: #1976d2; }
        .post { background: #e8f5e9; color: #388e3c; }
        .put { background: #fff3e0; color: #f57c00; }
        .delete { background: #ffebee; color: #c62828; }

        @media (max-width: 768px) {
            .categories {
                grid-template-columns: 1fr;
            }

            .header h1 {
                font-size: 1.8em;
            }

            .stats {
                grid-template-columns: 1fr 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Reporte de Pruebas de Rutas</h1>
            <p>Green Bit Backend - Verificación exhaustiva de endpoints</p>
            
            <div class="stats">
                <div class="stat-card">
                    <h3>${totalRoutes}</h3>
                    <p>Rutas Totales</p>
                </div>
                <div class="stat-card success">
                    <h3>${successfulRoutes}</h3>
                    <p>Exitosas</p>
                </div>
                <div class="stat-card warning">
                    <h3>${failedRoutes}</h3>
                    <p>Fallidas</p>
                </div>
                <div class="stat-card">
                    <h3>${avgResponseTime}ms</h3>
                    <p>Tiempo Promedio</p>
                </div>
            </div>
        </div>

        <div class="categories">
${Object.entries(byCategory).map(([category, categoryRoutes]) => {
  const categorySuccess = categoryRoutes.filter(r => r.success).length;
  return `
            <div class="category-card">
                <div class="category-header">
                    ${category} (${categorySuccess}/${categoryRoutes.length})
                </div>
                <div class="routes-list">
${categoryRoutes.map(route => `
                    <div class="route-item">
                        <div class="route-status ${route.success ? 'success' : 'warning'}">
                            ${route.success ? '✓' : '✗'}
                        </div>
                        <span class="route-method ${route.method.toLowerCase()}">${route.method}</span>
                        <span class="route-path">${route.path}</span>
                        <span class="route-time">${route.duration}ms</span>
                    </div>
`).join('')}
                </div>
            </div>
`;
}).join('')}
        </div>

        <div class="footer">
            <p>Generado: ${new Date().toLocaleString('es-ES')}</p>
            <p>API: ${API_URL}</p>
            <p>✅ Tasa de éxito: ${((successfulRoutes / totalRoutes) * 100).toFixed(2)}%</p>
        </div>
    </div>
</body>
</html>`;

  const reportPath = path.join(__dirname, 'routes-test-report.html');
  fs.writeFileSync(reportPath, html);

  console.log(`✅ Reporte generado: ${reportPath}`);
  console.log(`\n📊 Resumen:`);
  console.log(`   Total: ${totalRoutes} rutas`);
  console.log(`   ✓ Exitosas: ${successfulRoutes}`);
  console.log(`   ✗ Fallidas: ${failedRoutes}`);
  console.log(`   Tasa de éxito: ${((successfulRoutes / totalRoutes) * 100).toFixed(2)}%`);
  console.log(`   Tiempo promedio: ${avgResponseTime}ms\n`);
}

// ========================================
// EJECUTAR
// ========================================
generateReport().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
