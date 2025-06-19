#!/bin/bash

# FELICITAFAC - Script de Configuración de Base de Datos MySQL
# Sistema de Facturación Electrónica para Perú
# Configuración optimizada para hosting compartido

set -e  # Salir si algún comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Función para mostrar mensajes
mostrar_mensaje() {
    echo -e "${BLUE}[FELICITAFAC]${NC} $1"
}

mostrar_exito() {
    echo -e "${GREEN}[ÉXITO]${NC} $1"
}

mostrar_advertencia() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

mostrar_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "README.md" ] || [ ! -d "backend" ]; then
    mostrar_error "Este script debe ejecutarse desde la carpeta raíz de FELICITAFAC"
    exit 1
fi

# Cargar variables de entorno
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
    mostrar_exito "Variables de entorno cargadas desde .env"
else
    mostrar_advertencia "Archivo .env no encontrado, usando valores por defecto"
fi

# Variables por defecto
DB_NAME=${DB_NAME:-"felicitafac_local"}
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-"root"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"3306"}

mostrar_mensaje "🚀 Configurando base de datos MySQL para FELICITAFAC"
echo ""

# Función para verificar conexión MySQL
verificar_conexion_mysql() {
    mostrar_mensaje "🔍 Verificando conexión a MySQL..."
    
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &>/dev/null; then
        mostrar_exito "Conexión a MySQL exitosa"
        return 0
    else
        mostrar_error "No se pudo conectar a MySQL"
        return 1
    fi
}

# Función para solicitar credenciales
solicitar_credenciales() {
    echo ""
    mostrar_mensaje "📝 Configuración de credenciales MySQL"
    echo ""
    
    read -p "Host MySQL [$DB_HOST]: " nuevo_host
    DB_HOST=${nuevo_host:-$DB_HOST}
    
    read -p "Puerto MySQL [$DB_PORT]: " nuevo_puerto
    DB_PORT=${nuevo_puerto:-$DB_PORT}
    
    read -p "Usuario MySQL [$DB_USER]: " nuevo_usuario
    DB_USER=${nuevo_usuario:-$DB_USER}
    
    echo -n "Contraseña MySQL: "
    read -s DB_PASSWORD
    echo ""
    
    read -p "Nombre de base de datos [$DB_NAME]: " nuevo_nombre
    DB_NAME=${nuevo_nombre:-$DB_NAME}
}

# Función para crear base de datos
crear_base_datos() {
    mostrar_mensaje "🏗️ Creando base de datos..."
    
    # Crear base de datos si no existe
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "
        CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci;
    "
    
    mostrar_exito "Base de datos '$DB_NAME' creada/verificada"
    
    # Verificar que la base de datos existe
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "USE \`$DB_NAME\`;" &>/dev/null; then
        mostrar_exito "Base de datos accesible"
    else
        mostrar_error "No se pudo acceder a la base de datos"
        exit 1
    fi
}

# Función para ejecutar migraciones Django
ejecutar_migraciones() {
    mostrar_mensaje "🔧 Ejecutando migraciones Django..."
    
    cd backend
    
    # Activar entorno virtual si existe
    if [ -d "venv" ]; then
        source venv/bin/activate
        mostrar_exito "Entorno virtual activado"
    else
        mostrar_advertencia "Entorno virtual no encontrado"
    fi
    
    # Verificar instalación de Django
    if ! python -c "import django" &>/dev/null; then
        mostrar_error "Django no está instalado. Ejecuta: ./scripts/instalar-dependencias.sh"
        exit 1
    fi
    
    # Crear migraciones iniciales
    mostrar_mensaje "📝 Creando migraciones iniciales..."
    
    # Crear migraciones para cada app
    python manage.py makemigrations core
    python manage.py makemigrations usuarios
    python manage.py makemigrations clientes
    python manage.py makemigrations productos
    python manage.py makemigrations facturacion
    python manage.py makemigrations inventario
    python manage.py makemigrations contabilidad
    python manage.py makemigrations reportes
    
    # Aplicar migraciones
    mostrar_mensaje "🚀 Aplicando migraciones..."
    python manage.py migrate
    
    mostrar_exito "Migraciones aplicadas exitosamente"
    
    cd ..
}

# Función para crear tabla de cache
crear_tabla_cache() {
    mostrar_mensaje "💾 Creando tabla de cache..."
    
    cd backend
    
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    python manage.py createcachetable felicitafac_cache_table
    
    mostrar_exito "Tabla de cache creada"
    
    cd ..
}

# Función para crear superusuario
crear_superusuario() {
    mostrar_mensaje "👤 Configurando superusuario..."
    
    echo ""
    read -p "¿Deseas crear un superusuario ahora? (s/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        cd backend
        
        if [ -d "venv" ]; then
            source venv/bin/activate
        fi
        
        echo ""
        mostrar_mensaje "📝 Ingresa los datos del superusuario:"
        python manage.py createsuperuser
        
        mostrar_exito "Superusuario creado"
        cd ..
    else
        mostrar_advertencia "Superusuario no creado. Puedes crearlo después con:"
        echo "   cd backend && python manage.py createsuperuser"
    fi
}

# Función para cargar datos iniciales
cargar_datos_iniciales() {
    mostrar_mensaje "📊 Cargando datos iniciales..."
    
    cd backend
    
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    # Verificar si hay fixtures
    if [ -f "../database/fixtures/datos_iniciales.json" ]; then
        python manage.py loaddata ../database/fixtures/datos_iniciales.json
        mostrar_exito "Datos iniciales cargados"
    else
        mostrar_advertencia "No se encontraron datos iniciales para cargar"
    fi
    
    cd ..
}

# Función para actualizar archivo .env
actualizar_archivo_env() {
    mostrar_mensaje "📄 Actualizando archivo .env..."
    
    # Crear backup del .env actual si existe
    if [ -f ".env" ]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Actualizar o crear .env
    cat > .env << EOF
# FELICITAFAC - Configuración de desarrollo
# Base de datos MySQL

DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT

# Django
SECRET_KEY=felicitafac-desarrollo-key-cambiar-en-produccion
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
CORS_ALLOW_ALL_ORIGINS=True

# Email (desarrollo)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=

# Nubefact (configurar para producción)
NUBEFACT_TOKEN=
NUBEFACT_URL_BASE=https://api.nubefact.com

# Empresa (configurar con datos reales)
EMPRESA_RAZON_SOCIAL=FELICITAFAC DESARROLLO SAC
EMPRESA_RUC=20123456789
EMPRESA_DIRECCION=Av. Desarrollo 123, Lima
EMPRESA_UBIGEO=150101
EMPRESA_TELEFONO=01-1234567
EMPRESA_EMAIL=desarrollo@felicitafac.com
EOF
    
    mostrar_exito "Archivo .env actualizado"
}

# Función para verificar configuración
verificar_configuracion() {
    mostrar_mensaje "✅ Verificando configuración final..."
    
    cd backend
    
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    # Verificar conexión Django a MySQL
    if python manage.py check --database default &>/dev/null; then
        mostrar_exito "Configuración Django-MySQL correcta"
    else
        mostrar_error "Error en configuración Django-MySQL"
        exit 1
    fi
    
    # Verificar que las tablas existen
    if python manage.py showmigrations | grep -q "\[X\]"; then
        mostrar_exito "Migraciones aplicadas correctamente"
    else
        mostrar_advertencia "Algunas migraciones pueden no estar aplicadas"
    fi
    
    cd ..
}

# Función principal
main() {
    mostrar_mensaje "=== CONFIGURACIÓN DE BASE DE DATOS MYSQL ==="
    echo ""
    
    # 1. Intentar conexión con credenciales actuales
    if ! verificar_conexion_mysql; then
        echo ""
        mostrar_advertencia "No se pudo conectar con las credenciales actuales"
        solicitar_credenciales
        
        # Verificar nuevamente
        if ! verificar_conexion_mysql; then
            mostrar_error "No se pudo establecer conexión a MySQL"
            echo ""
            mostrar_mensaje "💡 Verifica que:"
            echo "   - MySQL esté ejecutándose: sudo systemctl start mysql"
            echo "   - Las credenciales sean correctas"
            echo "   - El usuario tenga permisos para crear bases de datos"
            exit 1
        fi
    fi
    
    # 2. Crear base de datos
    crear_base_datos
    
    # 3. Actualizar archivo .env
    actualizar_archivo_env
    
    # 4. Ejecutar migraciones
    ejecutar_migraciones
    
    # 5. Crear tabla de cache
    crear_tabla_cache
    
    # 6. Crear superusuario
    crear_superusuario
    
    # 7. Cargar datos iniciales
    cargar_datos_iniciales
    
    # 8. Verificar configuración final
    verificar_configuracion
    
    echo ""
    mostrar_exito "✅ ¡Base de datos configurada exitosamente!"
    echo ""
    mostrar_mensaje "📋 INFORMACIÓN DE LA BASE DE DATOS:"
    echo "   🏠 Host: $DB_HOST:$DB_PORT"
    echo "   📊 Base de datos: $DB_NAME"
    echo "   👤 Usuario: $DB_USER"
    echo ""
    mostrar_mensaje "📋 PRÓXIMOS PASOS:"
    echo ""
    echo "1. 🚀 Iniciar el servidor de desarrollo:"
    echo "   ./scripts/iniciar-desarrollo.sh"
    echo ""
    echo "2. 🌐 Acceder a la aplicación:"
    echo "   Backend: http://localhost:8000"
    echo "   Admin: http://localhost:8000/admin"
    echo ""
    echo "3. 🔧 Panel de administración MySQL:"
    echo "   Accede usando las credenciales configuradas"
    echo ""
    
    mostrar_mensaje "🎉 ¡FELICITAFAC está listo para usar!"
}

# Ejecutar función principal
main "$@"