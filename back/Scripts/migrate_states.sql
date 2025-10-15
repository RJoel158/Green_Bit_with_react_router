-- ============================================================================
-- MIGRACIÓN DE ESTADOS - GREEN BIT
-- ============================================================================
-- Script para migrar datos existentes al nuevo sistema de estados
-- 
-- IMPORTANTE: Hacer backup de la base de datos antes de ejecutar
-- 
-- Fecha: 2025-01-14
-- Versión: 2.0.0
-- ============================================================================

-- 1. Verificar estructura de tablas
-- ============================================================================
DESCRIBE request;
DESCRIBE appointmentconfirmation;

-- 2. Ver distribución actual de estados
-- ============================================================================
SELECT 
    'REQUEST' as tabla,
    state,
    COUNT(*) as cantidad
FROM request
GROUP BY state
ORDER BY state;

SELECT 
    'APPOINTMENT' as tabla,
    state,
    COUNT(*) as cantidad
FROM appointmentconfirmation
GROUP BY state
ORDER BY state;

-- 3. BACKUP DE SEGURIDAD (Crear tablas temporales)
-- ============================================================================
CREATE TABLE IF NOT EXISTS request_backup_20250114 AS SELECT * FROM request;
CREATE TABLE IF NOT EXISTS appointmentconfirmation_backup_20250114 AS SELECT * FROM appointmentconfirmation;

-- Verificar backup
SELECT COUNT(*) as request_backup_count FROM request_backup_20250114;
SELECT COUNT(*) as appointment_backup_count FROM appointmentconfirmation_backup_20250114;

-- 4. MIGRACIÓN DE ESTADOS - REQUEST
-- ============================================================================

-- SISTEMA ANTIGUO → SISTEMA NUEVO
-- Ajusta estos mapeos según tu sistema anterior:

-- Si tu sistema anterior usaba:
-- 0 = disponible/open → ahora es 1 (OPEN)
-- 1 = en proceso → ahora es 2 (ACCEPTED)
-- 2 = completado → ahora es 4 (CLOSED)
-- 3 = cancelado → ahora es 5 (CANCELLED)

-- IMPORTANTE: Revisa tus datos antes de ejecutar
-- SELECT DISTINCT state FROM request;

START TRANSACTION;

-- Ejemplo de migración (ajusta según tu sistema):
-- UPDATE request SET state = 1 WHERE state = 0;  -- disponible → OPEN
-- UPDATE request SET state = 2 WHERE state = 1;  -- en proceso → ACCEPTED
-- UPDATE request SET state = 4 WHERE state = 2;  -- completado → CLOSED
-- UPDATE request SET state = 5 WHERE state = 3;  -- cancelado → CANCELLED

-- Si todos tus requests estaban en estado 0 (disponible):
UPDATE request 
SET state = 1 
WHERE state = 0;

COMMIT;

-- Verificar migración de requests
SELECT 
    state,
    CASE 
        WHEN state = 0 THEN 'REQUESTED'
        WHEN state = 1 THEN 'OPEN'
        WHEN state = 2 THEN 'ACCEPTED'
        WHEN state = 3 THEN 'REJECTED'
        WHEN state = 4 THEN 'CLOSED'
        WHEN state = 5 THEN 'CANCELLED'
        ELSE 'DESCONOCIDO'
    END as estado_nombre,
    COUNT(*) as cantidad
FROM request
GROUP BY state
ORDER BY state;

-- 5. MIGRACIÓN DE ESTADOS - APPOINTMENT
-- ============================================================================

-- SISTEMA ANTIGUO → SISTEMA NUEVO
-- Si tu sistema anterior usaba:
-- 0 = pendiente → mantiene 0 (PENDING)
-- 1 = confirmada → mantiene 1 (ACCEPTED)
-- 2 = en progreso → mantiene 2 (IN_PROGRESS)
-- 3 = cancelada → ahora es 5 (CANCELLED)
-- 4 = completada → mantiene 4 (COMPLETED)

START TRANSACTION;

-- Ejemplo de migración (ajusta según tu sistema):
-- Si tenías estado 3 = cancelada, ahora debe ser 5
UPDATE appointmentconfirmation 
SET state = 5 
WHERE state = 3;

COMMIT;

-- Verificar migración de appointments
SELECT 
    state,
    CASE 
        WHEN state = 0 THEN 'PENDING'
        WHEN state = 1 THEN 'ACCEPTED'
        WHEN state = 2 THEN 'IN_PROGRESS'
        WHEN state = 3 THEN 'REJECTED'
        WHEN state = 4 THEN 'COMPLETED'
        WHEN state = 5 THEN 'CANCELLED'
        ELSE 'DESCONOCIDO'
    END as estado_nombre,
    COUNT(*) as cantidad
FROM appointmentconfirmation
GROUP BY state
ORDER BY state;

-- 6. VERIFICACIÓN DE INTEGRIDAD
-- ============================================================================

-- Verificar que no hay estados inválidos en REQUEST
SELECT 
    id,
    state,
    description,
    registerDate
FROM request
WHERE state NOT IN (0, 1, 2, 3, 4, 5)
ORDER BY registerDate DESC;

-- Verificar que no hay estados inválidos en APPOINTMENT
SELECT 
    id,
    idRequest,
    state,
    acceptedDate
FROM appointmentconfirmation
WHERE state NOT IN (0, 1, 2, 3, 4, 5)
ORDER BY acceptedDate DESC;

-- 7. VERIFICAR CONSISTENCIA REQUEST-APPOINTMENT
-- ============================================================================

-- Appointments pendientes deben tener requests en REQUESTED
SELECT 
    r.id as request_id,
    r.state as request_state,
    ac.id as appointment_id,
    ac.state as appointment_state,
    'INCONSISTENCIA' as alerta
FROM request r
JOIN appointmentconfirmation ac ON ac.idRequest = r.id
WHERE ac.state = 0 AND r.state != 0;

-- Appointments aceptados deben tener requests en ACCEPTED
SELECT 
    r.id as request_id,
    r.state as request_state,
    ac.id as appointment_id,
    ac.state as appointment_state,
    'INCONSISTENCIA' as alerta
FROM request r
JOIN appointmentconfirmation ac ON ac.idRequest = r.id
WHERE ac.state = 1 AND r.state != 2;

-- 8. LIMPIAR REQUESTS HUÉRFANAS (OPCIONAL)
-- ============================================================================
-- Requests muy antiguas sin appointments que podrían estar obsoletas
-- ADVERTENCIA: Revisar antes de ejecutar

-- Ver requests antiguas sin appointment
SELECT 
    r.id,
    r.description,
    r.state,
    r.registerDate,
    DATEDIFF(NOW(), r.registerDate) as dias_antiguedad
FROM request r
LEFT JOIN appointmentconfirmation ac ON ac.idRequest = r.id
WHERE ac.id IS NULL
AND DATEDIFF(NOW(), r.registerDate) > 30
ORDER BY r.registerDate DESC;

-- Si quieres marcarlas como CANCELLED:
-- UPDATE request 
-- SET state = 5
-- WHERE id IN (
--     SELECT r.id
--     FROM request r
--     LEFT JOIN appointmentconfirmation ac ON ac.idRequest = r.id
--     WHERE ac.id IS NULL
--     AND DATEDIFF(NOW(), r.registerDate) > 30
-- );

-- 9. ESTADÍSTICAS FINALES
-- ============================================================================

SELECT '=== RESUMEN MIGRACIÓN ===' as info;

SELECT 
    'REQUESTS' as tabla,
    SUM(CASE WHEN state = 0 THEN 1 ELSE 0 END) as REQUESTED,
    SUM(CASE WHEN state = 1 THEN 1 ELSE 0 END) as OPEN,
    SUM(CASE WHEN state = 2 THEN 1 ELSE 0 END) as ACCEPTED,
    SUM(CASE WHEN state = 3 THEN 1 ELSE 0 END) as REJECTED,
    SUM(CASE WHEN state = 4 THEN 1 ELSE 0 END) as CLOSED,
    SUM(CASE WHEN state = 5 THEN 1 ELSE 0 END) as CANCELLED,
    COUNT(*) as TOTAL
FROM request;

SELECT 
    'APPOINTMENTS' as tabla,
    SUM(CASE WHEN state = 0 THEN 1 ELSE 0 END) as PENDING,
    SUM(CASE WHEN state = 1 THEN 1 ELSE 0 END) as ACCEPTED,
    SUM(CASE WHEN state = 2 THEN 1 ELSE 0 END) as IN_PROGRESS,
    SUM(CASE WHEN state = 3 THEN 1 ELSE 0 END) as REJECTED,
    SUM(CASE WHEN state = 4 THEN 1 ELSE 0 END) as COMPLETED,
    SUM(CASE WHEN state = 5 THEN 1 ELSE 0 END) as CANCELLED,
    COUNT(*) as TOTAL
FROM appointmentconfirmation;

-- 10. ROLLBACK (SI ALGO SALE MAL)
-- ============================================================================
-- Si necesitas revertir los cambios:

-- ROLLBACK; -- Descomentar solo si estás dentro de una transacción

-- O restaurar desde backup:
/*
TRUNCATE TABLE request;
INSERT INTO request SELECT * FROM request_backup_20250114;

TRUNCATE TABLE appointmentconfirmation;
INSERT INTO appointmentconfirmation SELECT * FROM appointmentconfirmation_backup_20250114;
*/

-- 11. LIMPIAR BACKUPS (DESPUÉS DE VERIFICAR)
-- ============================================================================
-- Solo ejecutar cuando estés 100% seguro que todo funciona
-- DROP TABLE IF EXISTS request_backup_20250114;
-- DROP TABLE IF EXISTS appointmentconfirmation_backup_20250114;

-- ============================================================================
-- FIN DEL SCRIPT DE MIGRACIÓN
-- ============================================================================
