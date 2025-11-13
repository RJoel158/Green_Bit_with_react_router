import db from '../config/DBConnect.js';

async function testNotificationCreation() {
  try {
    console.log('🧪 === TEST DE CREACIÓN DE NOTIFICACIÓN ===\n');
    
    // Primero obtener un appointmentId válido
    console.log('0️⃣  Obteniendo un appointmentId válido...');
    const [appointments] = await db.query(`
      SELECT id FROM appointmentconfirmation LIMIT 1
    `);
    
    if (!appointments || appointments.length === 0) {
      console.log('   ❌ No hay appointments en la BD');
      process.exit(1);
    }
    
    const validAppointmentId = appointments[0].id;
    console.log(`   ✅ Using appointmentId: ${validAppointmentId}\n`);
    
    console.log('1️⃣  Insertando notificación de prueba "appointment_completed"...');
    const [result] = await db.query(`
      INSERT INTO notifications (
        userId, 
        type, 
        title, 
        body, 
        appointmentId,
        \`read\`,
        createdAt
      ) VALUES (?, ?, ?, ?, ?, 0, NOW())
    `, [72, 'appointment_completed', 'TEST: Recolección completada', 'TEST notification body', validAppointmentId]);
    
    console.log('   ✅ Notificación insertada correctamente');
    console.log(`   ID de notificación creada: ${result.insertId}`);
    
    console.log('\n2️⃣  Verificando que se insertó correctamente...');
    const [verification] = await db.query(`
      SELECT id, userId, type, title, appointmentId, createdAt 
      FROM notifications 
      WHERE id = ?
    `, [result.insertId]);
    
    if (verification.length > 0) {
      console.log('   ✅ Notificación encontrada:');
      console.table(verification);
    } else {
      console.log('   ❌ No se encontró la notificación');
    }
    
    console.log('\n3️⃣  Conteo total de notificaciones:');
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM notifications`);
    console.log(`   Total: ${countResult[0].total}`);
    
    console.log('\n✅ Test completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testNotificationCreation();
