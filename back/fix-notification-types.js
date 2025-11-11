import db from './config/DBConnect.js';

async function fixNotificationTypes() {
  try {
    console.log('🔧 === ACTUALIZANDO TIPOS DE NOTIFICACIÓN ===\n');
    
    console.log('1️⃣  Modificando columna type del enum...');
    await db.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN type ENUM(
        'request_received',
        'appointment_accepted',
        'appointment_rejected',
        'appointment_canceled',
        'appointment_completed'
      ) NOT NULL
    `);
    console.log('   ✅ Tipo actualizado correctamente');
    
    console.log('\n2️⃣  Verificando estructura actualizada:');
    const [columns] = await db.query(`DESCRIBE notifications`);
    const typeColumn = columns.find(col => col.Field === 'type');
    console.log('   Columna type:');
    console.table([typeColumn]);
    
    console.log('\n✅ Actualización completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixNotificationTypes();
