import db from '../config/DBConnect.js';

async function verifyNotificationTable() {
  try {
    console.log('📋 === VERIFICANDO TABLA DE NOTIFICACIONES ===\n');
    
    // 1. Verificar estructura de la tabla
    console.log('1️⃣  Estructura de la tabla notifications:');
    const [columns] = await db.query(`DESCRIBE notifications`);
    console.table(columns);
    
    // 2. Contar notificaciones de prueba
    console.log('\n2️⃣  Total de notificaciones en la tabla:');
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM notifications`);
    console.log(`   Total: ${countResult[0].total}`);
    
    // 3. Últimas 10 notificaciones
    console.log('\n3️⃣  Últimas 10 notificaciones:');
    const [recent] = await db.query(`
      SELECT id, userId, type, title, requestId, appointmentId, createdAt 
      FROM notifications 
      ORDER BY createdAt DESC 
      LIMIT 10
    `);
    console.table(recent);
    
    // 4. Verificar notificaciones de tipo appointment_completed
    console.log('\n4️⃣  Notificaciones de tipo "appointment_completed":');
    const [completed] = await db.query(`
      SELECT id, userId, title, appointmentId, createdAt 
      FROM notifications 
      WHERE type = 'appointment_completed'
    `);
    console.log(`   Total: ${completed.length}`);
    if (completed.length > 0) {
      console.table(completed);
    } else {
      console.log('   ❌ NO ENCONTRADAS');
    }
    
    // 5. Verificar si hay citas en estado COMPLETED
    console.log('\n5️⃣  Citas en estado COMPLETED (state=4):');
    const [completedAppts] = await db.query(`
      SELECT id, idCollector, idRequest, state 
      FROM appointmentconfirmation 
      WHERE state = 4 
      LIMIT 5
    `);
    console.log(`   Total: ${completedAppts.length}`);
    if (completedAppts.length > 0) {
      console.table(completedAppts);
    }
    
    console.log('\n✅ Verificación completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyNotificationTable();
