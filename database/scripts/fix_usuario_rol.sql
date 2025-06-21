-- FELICITAFAC - Fix Usuario Rol Corregido
-- Completar configuración del campo rol_id

USE felicitafac_db;

-- El campo rol_id ya existe, ahora agregamos foreign key y índice
-- Primero verificar si la constraint ya existe y eliminarla si es necesario
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'felicitafac_db'
    AND TABLE_NAME = 'usuarios_usuario'
    AND CONSTRAINT_NAME LIKE '%rol%'
);

-- Eliminar constraint existente si hay una
DROP PROCEDURE IF EXISTS DropConstraintIfExists;

DELIMITER $$
CREATE PROCEDURE DropConstraintIfExists()
BEGIN
    DECLARE constraint_name VARCHAR(255);
    DECLARE done INT DEFAULT FALSE;
    DECLARE cur CURSOR FOR 
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'felicitafac_db'
        AND TABLE_NAME = 'usuarios_usuario'
        AND COLUMN_NAME = 'rol_id'
        AND CONSTRAINT_NAME != 'PRIMARY';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO constraint_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET @sql = CONCAT('ALTER TABLE usuarios_usuario DROP FOREIGN KEY ', constraint_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END LOOP;
    CLOSE cur;
END$$

DELIMITER ;

CALL DropConstraintIfExists();
DROP PROCEDURE DropConstraintIfExists;

-- Agregar foreign key constraint
ALTER TABLE usuarios_usuario 
ADD CONSTRAINT usuarios_usuario_rol_id_fk 
FOREIGN KEY (rol_id) REFERENCES usuarios_rol(id) ON DELETE RESTRICT;

-- Crear índice si no existe
DROP INDEX IF EXISTS idx_usuario_rol ON usuarios_usuario;
CREATE INDEX idx_usuario_rol ON usuarios_usuario(rol_id);

-- Actualizar usuarios sin rol asignado
UPDATE usuarios_usuario 
SET rol_id = (SELECT id FROM usuarios_rol WHERE codigo = 'administrador' LIMIT 1)
WHERE rol_id IS NULL;

-- Verificar estructura final
SELECT 'Campo rol_id configurado correctamente' as status;

-- Mostrar estadísticas
SELECT 
    'Usuarios totales' as tipo,
    COUNT(*) as cantidad
FROM usuarios_usuario
UNION ALL
SELECT 
    'Usuarios con rol asignado' as tipo,
    COUNT(*) as cantidad
FROM usuarios_usuario 
WHERE rol_id IS NOT NULL;