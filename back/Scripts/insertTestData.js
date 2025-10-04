// Scripts/insertTestData.js
import db from "../Config/DBConnect.js";

async function insertTestData() {
  try {
    console.log('Insertando datos de prueba...');
    
    // Verificar materiales existentes
    const [materials] = await db.query('SELECT id, name FROM material ORDER BY id');
    console.log('Materiales disponibles:', materials);
    
    // Crear requests de prueba con diferentes materiales
    const testRequests = [
      {
        description: "Botellas de plástico PET",
        materialId: 1, // Plástico
        latitude: -17.393,
        longitude: -66.157
      },
      {
        description: "Cajas de cartón limpio",
        materialId: 2, // Cartón
        latitude: -17.395,
        longitude: -66.159
      },
      {
        description: "Latas de aluminio",
        materialId: 5, // Metal/Aluminio
        latitude: -17.391,
        longitude: -66.155
      }
    ];
    
    for (let i = 0; i < testRequests.length; i++) {
      const testReq = testRequests[i];
      
      // Verificar si ya existe
      const [existing] = await db.query(
        'SELECT id FROM request WHERE description = ? LIMIT 1',
        [testReq.description]
      );
      
      let requestId;
      
      if (existing.length > 0) {
        requestId = existing[0].id;
        console.log(`Request "${testReq.description}" ya existe con ID: ${requestId}`);
      } else {
        // Insertar nuevo request
        const [result] = await db.query(`
          INSERT INTO request (idUser, description, state, registerDate, materialId, latitude, longitude, modificationDate)
          VALUES (1, ?, "open", NOW(), ?, ?, ?, NOW())
        `, [testReq.description, testReq.materialId, testReq.latitude, testReq.longitude]);
        
        requestId = result.insertId;
        console.log(`Request "${testReq.description}" insertado con ID: ${requestId}`);
        
        // Insertar schedule para el request
        await db.query(`
          INSERT INTO schedule (requestId, startHour, endHour, monday, tuesday, wednesday, thursday, friday, saturday, sunday)
          VALUES (?, "08:00:00", "18:00:00", 1, 1, 1, 1, 1, 0, 0)
        `, [requestId]);
        console.log(`Schedule insertado para request ${requestId}`);
      }
      
      // Verificar imágenes existentes
      const [existingImages] = await db.query(
        'SELECT COUNT(*) as count FROM image WHERE idRequest = ?',
        [requestId]
      );
      
      if (existingImages[0].count === 0) {
        // Insertar imágenes de prueba
        const testImages = [
          'request-1759269936613-500057246.png',
          'request-1759450449231-595104733.png',
          'request-1759469742670-886594371.png'
        ];
        
        for (const imageName of testImages) {
          await db.query(`
            INSERT INTO image (idRequest, image, uploadedDate)
            VALUES (?, ?, NOW())
          `, [requestId, imageName]);
          console.log(`Imagen ${imageName} insertada para request ${requestId}`);
        }
      } else {
        console.log(`Request ${requestId} ya tiene ${existingImages[0].count} imágenes`);
      }
    }
    
    // Insertar schedule para el request
    const [existingSchedule] = await db.query(
      'SELECT id FROM schedule WHERE requestId = ? LIMIT 1',
      [requestId]
    );
    
    if (existingSchedule.length === 0) {
      await db.query(`
        INSERT INTO schedule (requestId, startHour, endHour, monday, tuesday, wednesday, thursday, friday, saturday, sunday)
        VALUES (?, "08:00:00", "18:00:00", 1, 1, 1, 1, 1, 0, 0)
      `, [requestId]);
      console.log(`Schedule insertado para request ${requestId}`);
    }
    
    // Verificar si ya existen imágenes para este request
    const [existingImages] = await db.query(
      'SELECT COUNT(*) as count FROM image WHERE idRequest = ?',
      [requestId]
    );
    
    if (existingImages[0].count === 0) {
      // Insertar imágenes de prueba
      const testImages = [
        'request-1759269936613-500057246.png',
        'request-1759450449231-595104733.png',
        'request-1759469742670-886594371.png'
      ];
      
      for (const imageName of testImages) {
        await db.query(`
          INSERT INTO image (idRequest, image, uploadedDate)
          VALUES (?, ?, NOW())
        `, [requestId, imageName]);
        console.log(`Imagen insertada: ${imageName}`);
      }
    } else {
      console.log(`Request ${requestId} ya tiene ${existingImages[0].count} imágenes`);
    }
    
    console.log('✅ Datos de prueba insertados correctamente');
    console.log(`Request ID para pruebas: ${requestId}`);
    
  } catch (error) {
    console.error('❌ Error insertando datos de prueba:', error);
  } finally {
    process.exit(0);
  }
}

insertTestData();