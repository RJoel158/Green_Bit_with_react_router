-- ============================================================================
-- SCRIPT: Usar datos REALES de usuario 72 para Reporte de Materiales
-- ============================================================================
-- Este script aprovecha los requests que YA existen en tu BD
-- ============================================================================

-- Paso 1: Verificar datos existentes
SELECT 
  m.id,
  m.name,
  COUNT(*) as cantidad,
  ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM request WHERE idUser = 72)), 0) as porcentaje
FROM request r
INNER JOIN material m ON r.materialId = m.id
WHERE r.idUser = 72
GROUP BY m.id, m.name
ORDER BY cantidad DESC;

-- Resultado esperado:
-- ID | Material | Cantidad | Porcentaje
-- 8  | Plástico | 10 | 40%
-- 6  | Cartón | 6 | 24%
-- 12 | Aluminio | 4 | 16%
-- 9  | Vidrio transparente | 2 | 8%
-- 13 | Acero | 1 | 4%
-- 19 | Baterías recargables | 1 | 4%
-- TOTAL: 25 requests

-- Paso 2: Ver TODAS tus requests
SELECT 
  r.id,
  r.idUser,
  r.description,
  m.name as material,
  r.state,
  r.registerDate
FROM request r
INNER JOIN material m ON r.materialId = m.id
WHERE r.idUser = 72
ORDER BY r.registerDate DESC;

-- Paso 3: Contar por estado
SELECT 
  state,
  CASE 
    WHEN state = 1 THEN 'open'
    WHEN state = 2 THEN 'accepted'
    WHEN state = 3 THEN 'confirmed'
    WHEN state = 4 THEN 'closed'
    ELSE 'otro'
  END as estado_descripcion,
  COUNT(*) as cantidad
FROM request
WHERE idUser = 72
GROUP BY state;

-- Paso 4: Detalles completos por material
SELECT 
  m.id,
  m.name,
  COUNT(*) as cantidad,
  GROUP_CONCAT(r.description SEPARATOR ' | ') as descripciones,
  GROUP_CONCAT(r.state SEPARATOR ',') as estados,
  MIN(r.registerDate) as primer_registro,
  MAX(r.registerDate) as ultimo_registro
FROM request r
INNER JOIN material m ON r.materialId = m.id
WHERE r.idUser = 72
GROUP BY m.id, m.name
ORDER BY cantidad DESC;
