#!/bin/bash
# cargar_datos_completos_felicitafac.sh

echo "🚀 Cargando TODOS los datos de FELICITAFAC..."

source ../.env

# 1. Cargar roles de usuarios
echo "📋 Cargando roles y usuarios..."
mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME < database/scripts/migracion_usuarios.sql

# 2. Cargar estructura Fase 3 (si no existe)
echo "🏗️ Verificando estructura Fase 3..."
mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME < database/scripts/migracion_fase3.sql

# 3. Cargar datos iniciales generales
echo "📦 Cargando datos iniciales generales..."
mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME < database/scripts/datos_iniciales.sql

# 4. Cargar datos iniciales Fase 3
echo "🎯 Cargando datos maestros Fase 3..."
mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME < database/scripts/datos_iniciales_fase3.sql

# Verificar carga completa
echo ""
echo "📊 VERIFICACIÓN DE CARGA:"
mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME -e "
SELECT 'RESUMEN DE DATOS CARGADOS' as titulo;
SELECT 
    'usuarios_rol' as tabla, COUNT(*) as registros FROM usuarios_rol
UNION ALL
SELECT 
    'core_configuracion_sistema' as tabla, COUNT(*) as registros 
    FROM aplicaciones_core_configuracion
UNION ALL  
SELECT 
    'clientes_tipo_documento' as tabla, COUNT(*) as registros 
    FROM aplicaciones_clientes_tipodocumento
UNION ALL
SELECT 
    'productos_categoria' as tabla, COUNT(*) as registros 
    FROM aplicaciones_productos_categoria;
"

echo ""
echo "🎉 ¡FELICITAFAC con datos completos cargado exitosamente!"
echo "✅ Ahora puedes crear superusuario y usar el sistema"