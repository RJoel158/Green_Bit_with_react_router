// verify-complete-flow.js
import db from '../config/DBConnect.js';
import { APPOINTMENT_STATE, REQUEST_STATE } from '../shared/constants.js';

async function verifyCompletionFlow() {
  console.log('\n🔍 Verificando flujo de completación de citas...\n');

  try {
    // 1. Ver últimas citas completadas
    console.log('📋 Últimas 5 citas completadas:');
    const [completedAppts] = await db.query(`
      SELECT ac.id, ac.idRequest, ac.state, ac.collectorId, u.email as collectorEmail, 
             r.idUser as recyclerId, ru.email as recyclerEmail
      FROM appointmentconfirmation ac
      JOIN users u ON u.id = ac.collectorId
      JOIN request r ON r.id = ac.idRequest
      JOIN users ru ON ru.id = r.idUser
      WHERE ac.state = ${APPOINTMENT_STATE.COMPLETED}
      ORDER BY ac.id DESC
      LIMIT 5
    `);
    console.log(JSON.stringify(completedAppts, null, 2));

    // 2. Ver notificaciones relacionadas a esas citas
    console.log('\n📬 Notificaciones para esas citas completadas:');
    if (completedAppts.length > 0) {
      const appointmentIds = completedAppts.map(a => a.id);
      const [notifications] = await db.query(`
        SELECT id, userId, type, title, appointmentId, \`read\`, createdAt
        FROM notifications
        WHERE appointmentId IN (${appointmentIds.join(',')})
        ORDER BY createdAt DESC
      `);
      console.log(JSON.stringify(notifications, null, 2));

      if (notifications.length === 0) {
        console.log('⚠️  NO hay notificaciones para estas citas completadas!');
      }
    }

    // 3. Ver últimas notificaciones creadas (sin importar tipo)
    console.log('\n📬 Últimas 10 notificaciones en el sistema:');
    const [allNotifs] = await db.query(`
      SELECT id, userId, type, title, appointmentId, requestId, \`read\`, createdAt
      FROM notifications
      ORDER BY createdAt DESC
      LIMIT 10
    `);
    console.log(JSON.stringify(allNotifs, null, 2));

    // 4. Verificar si hay citas en ACCEPTED o IN_PROGRESS que se puedan completar
    console.log('\n🎟️  Citas en estado ACCEPTED o IN_PROGRESS (completables):');
    const [completableAppts] = await db.query(`
      SELECT ac.id, ac.idRequest, ac.state, ac.collectorId, ac.acceptedHour,
             u.email as collectorEmail, r.idUser as recyclerId
      FROM appointmentconfirmation ac
      JOIN users u ON u.id = ac.collectorId
      JOIN request r ON r.id = ac.idRequest
      WHERE ac.state IN (${APPOINTMENT_STATE.ACCEPTED}, ${APPOINTMENT_STATE.IN_PROGRESS})
      ORDER BY ac.id DESC
      LIMIT 5
    `);
    console.log(JSON.stringify(completableAppts, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

verifyCompletionFlow();
