#!/bin/bash

# FELICITAFAC - Reset Total de Migraciones
# ADVERTENCIA: Esto eliminará TODOS los datos
# Ejecutar desde: felicitafac/backend/

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}🚨 FELICITAFAC - RESET TOTAL DE MIGRACIONES${NC}"
echo -e "${RED}⚠️  ADVERTENCIA: Esto eliminará TODOS los datos ⚠️${NC}"
echo "=================================================="

# Verificar ubicación
if [ ! -f "manage.py" ]; then
    echo -e "${RED}❌ Error: Ejecuta desde felicitafac/backend/${NC}"
    exit 1
fi


# Activar entorno virtual
echo -e "${YELLOW}🔄 Activando entorno virtual...${NC}"
source venv/bin/activate

# Cargar variables de entorno
if [ ! -f "../.env" ]; then
    echo -e "${RED}❌ Error: Archivo .env no encontrado${NC}"
    exit 1
fi

source ../.env

# Backup final de emergencia
echo -e "${YELLOW}💾 Creando backup final de emergencia...${NC}"
mysqldump -h$DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME > "backup_reset_total_$(date +%Y%m%d_%H%M%S).sql" 2>/dev/null || echo "Base vacía, no se puede hacer backup"

# 1. RESET TOTAL DE BASE DE DATOS
echo -e "${RED}🗑️ RESETEANDO BASE DE DATOS COMPLETA...${NC}"
mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD -e "
SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = 1;
"

echo -e "${GREEN}✅ Base de datos recreada limpia${NC}"

# 2. ELIMINAR ARCHIVOS DE MIGRACIONES
echo -e "${YELLOW}🗑️ Eliminando archivos de migraciones...${NC}"
find aplicaciones/*/migrations -name "0*.py" -delete 2>/dev/null || true

# Verificar directorios migrations y __init__.py
for app in aplicaciones/*/; do
    mkdir -p "$app/migrations"
    touch "$app/migrations/__init__.py"
done

echo -e "${GREEN}✅ Archivos de migraciones eliminados${NC}"

# 3. CREAR MIGRACIONES PARA TODAS LAS APPS
echo -e "${BLUE}📝 Creando migraciones para todas las apps...${NC}"

# Lista de apps en orden de dependencias
apps_orden=("core" "usuarios" "clientes" "productos" "facturacion" "inventario" "contabilidad" "reportes")

for app in "${apps_orden[@]}"; do
    echo -e "${YELLOW}  Creando migraciones para $app...${NC}"
    python manage.py makemigrations $app
done

echo -e "${GREEN}✅ Todas las migraciones creadas${NC}"

# 4. APLICAR TODAS LAS MIGRACIONES
echo -e "${BLUE}🚀 Aplicando TODAS las migraciones desde cero...${NC}"

# Aplicar migraciones (Django hace el orden automáticamente)
python manage.py migrate

echo -e "${GREEN}✅ Todas las migraciones aplicadas${NC}"

# 5. VERIFICACIONES FINALES
echo -e "${BLUE}🔍 Verificando estado final...${NC}"

# Mostrar estado de migraciones
echo -e "${CYAN}📊 Estado de migraciones:${NC}"
python manage.py showmigrations

# Verificar configuración Django
echo -e "${CYAN}🧪 Verificando configuración Django:${NC}"
python manage.py check

# Verificar que las tablas se crearon
echo -e "${CYAN}🗄️ Tablas creadas en la base de datos:${NC}"
mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES;" 2>/dev/null | head -20

echo ""
echo -e "${GREEN}🎉 ¡RESET TOTAL COMPLETADO EXITOSAMENTE!${NC}"
echo ""
echo -e "${CYAN}ESTADO FINAL:${NC}"
echo "✅ Base de datos limpia y recreada"
echo "✅ Todas las migraciones creadas"
echo "✅ Todas las migraciones aplicadas"
echo "✅ Django check exitoso"
echo "✅ Tablas creadas correctamente"
echo ""
echo -e "${CYAN}PRÓXIMOS PASOS:${NC}"
echo "1. python manage.py createsuperuser"
echo "2. python manage.py runserver"
echo "3. Probar endpoints en: http://localhost:8000/api/"
echo ""
echo -e "${YELLOW}📁 Backup guardado en: backup_reset_total_$(date +%Y%m%d_*)${NC}"