import db from '../Config/DBConnect.js';

async function checkUserData() {
  try {
    console.log('\n=== VERIFICANDO DATOS DE USUARIOS ===\n');
    
    // 1. Ver todos los usuarios con su información de person
    const [users] = await db.query(`
      SELECT 
        u.id,
        u.email,
        u.phone,
        u.role,
        p.firstname,
        p.lastname,
        COALESCE(CONCAT(p.firstname, ' ', p.lastname), u.email) as displayName
      FROM users u
      LEFT JOIN person p ON p.userId = u.id
      ORDER BY u.id
    `);
    
    console.log('USUARIOS EN LA BASE DE DATOS:');
    console.table(users);
    
    // 2. Ver appointmentconfirmation con nombres completos
    const [appointments] = await db.query(`
      SELECT 
        ac.id,
        ac.collectorId,
        COALESCE(CONCAT(pc.firstname, ' ', pc.lastname), uc.email) as collectorName,
        uc.phone as collectorPhone,
        r.idUser as recyclerId,
        COALESCE(CONCAT(pr.firstname, ' ', pr.lastname), ur.email) as recyclerName,
        ur.phone as recyclerPhone,
        ac.state
      FROM appointmentconfirmation ac
      JOIN request r ON ac.idRequest = r.id
      JOIN users uc ON ac.collectorId = uc.id
      JOIN users ur ON r.idUser = ur.id
      LEFT JOIN person pc ON pc.userId = uc.id
      LEFT JOIN person pr ON pr.userId = ur.id
      LIMIT 10
    `);
    
    console.log('\nCITAS (APPOINTMENTS) CON NOMBRES:');
    console.table(appointments);
    
    // 3. Buscar "prueba datos" literalmente
    const [pruebaSearch] = await db.query(`
      SELECT 'En users.email' as ubicacion, id, email as valor
      FROM users 
      WHERE email LIKE '%prueba%' OR email LIKE '%datos%'
      UNION ALL
      SELECT 'En person.firstname', p.id, p.firstname
      FROM person p
      WHERE p.firstname LIKE '%prueba%' OR p.firstname LIKE '%datos%'
      UNION ALL
      SELECT 'En person.lastname', p.id, p.lastname
      FROM person p
      WHERE p.lastname LIKE '%prueba%' OR p.lastname LIKE '%datos%'
    `);
    
    console.log('\nBÚSQUEDA DE "PRUEBA DATOS":');
    if (pruebaSearch.length > 0) {
      console.table(pruebaSearch);
      console.log('\n⚠️  ENCONTRADO! La cadena "prueba datos" existe en la base de datos');
    } else {
      console.log('✅ No se encontró "prueba datos" en la base de datos');
    }
    
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  }
}

checkUserData();
