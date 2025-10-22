-- Script para actualizar la restricción de la tabla score
-- Permitir score = 0 para reclamos

USE reciclaje_proyecto2db;

-- Primero, necesitamos eliminar la restricción existente
-- El nombre exacto de la restricción es 'score.score'
ALTER TABLE score DROP CONSTRAINT `score`;

-- Crear una nueva restricción que permita valores de 0 a 5
-- 0 = reclamo, 1-5 = calificaciones normales
ALTER TABLE score 
ADD CONSTRAINT `score` CHECK (score >= 0 AND score <= 5);

-- Verificar la restricción
SHOW CREATE TABLE score;

SELECT 
    CONSTRAINT_NAME, 
    CHECK_CLAUSE 
FROM 
    INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
WHERE 
    TABLE_NAME = 'score' 
    AND TABLE_SCHEMA = 'reciclaje_proyecto2db';
