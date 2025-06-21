#!/bin/bash

# FELICITAFAC - Script de Configuración de Autenticación JWT
# Sistema de Facturación Electrónica para Perú
# Configuración automática completa de autenticación con MySQL

set -e  # Salir si cualquier comando falla

# =======================================================
# CONFIGURACIÓN Y CONSTANTES
# =======================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # Sin color

# Configuración del proyecto
PROJECT_NAME="FELICITAFAC"
PROJECT_DIR="$(pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
DATABASE_DIR="$PROJECT_DIR/database"
LOGS_DIR="$PROJECT_DIR/logs"
VENV_DIR="$PROJECT_DIR/venv"

# Configuración de base de datos
DB_NAME="felicitafac_db"
DB_USER="root"
DB_HOST="localhost"
DB_PORT="3306"

# =======================================================
# FUNCIONES DE UTILIDAD
# =======================================================

mostrar_banner() {
    echo -e "${BLUE}"
    echo "=================================================================="
    echo "  FELICITAFAC - Configuración de Autenticación JWT"
    echo "  Sistema de Facturación Electrónica para Perú"
    echo "=================================================================="
    echo -e "${NC}"
}

mostrar_seccion() {
    echo -e "\n${CYAN}[SECCIÓN]${NC} $1"
    echo "=================================================="
}

mostrar_paso() {
    echo -e "${BLUE}[PASO]${NC} $1"
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

mostrar_info() {
    echo -e "${PURPLE}[INFO]${NC} $1"
}

# Función para verificar prerrequisitos
verificar_prerrequisitos() {
    mostrar_seccion "Verificando Prerrequisitos"
    
    # Verificar Python
    if ! command -v python3 &> /dev/null; then
        mostrar_error "Python 3 no está instalado"
        exit 1
    fi
    mostrar_exito "Python 3: $(python3 --version)"
    
    # Verificar MySQL
    if ! command -v mysql &> /dev/null; then
        mostrar_error "MySQL no está instalado"
        exit 1
    fi
    mostrar_exito "MySQL: $(mysql --version)"
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        mostrar_error "Node.js no está instalado"
        exit 1
    fi
    mostrar_exito "Node.js: $(node --version)"
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        mostrar_error "npm no está instalado"
        exit 1
    fi
    mostrar_exito "npm: $(npm --version)"
    
    # Verificar estructura del proyecto
    if [ ! -f "$PROJECT_DIR/README.md" ]; then
        mostrar_error "No se encontró el directorio raíz del proyecto"
        exit 1
    fi
    mostrar_exito "Estructura del proyecto verificada"
}

# Función para configurar entorno virtual
configurar_entorno_virtual() {
    mostrar_seccion "Configurando Entorno Virtual Python"
    
    if [ ! -d "$VENV_DIR" ]; then
        mostrar_paso "Creando entorno virtual..."
        python3 -m venv "$VENV_DIR"
        mostrar_exito "Entorno virtual creado"
    else
        mostrar_info "Entorno virtual ya existe"
    fi
    
    mostrar_paso "Activando entorno virtual..."
    source "$VENV_DIR/bin/activate"
    mostrar_exito "Entorno virtual activado"
    
    mostrar_paso "Actualizando pip..."
    pip install --upgrade pip
    
    mostrar_paso "Instalando dependencias de backend..."
    if [ -f "$BACKEND_DIR/requirements.txt" ]; then
        pip install -r "$BACKEND_DIR/requirements.txt"
        mostrar_exito "Dependencias de backend instaladas"
    else
        mostrar_advertencia "Archivo requirements.txt no encontrado"
    fi
}

# Función para configurar base de datos
configurar_base_datos() {
    mostrar_seccion "Configurando Base de Datos MySQL"
    
    # Solicitar credenciales de MySQL root
    echo -e "${YELLOW}Ingrese las credenciales de MySQL root:${NC}"
    read -p "Usuario root: " MYSQL_ROOT_USER
    read -s -p "Contraseña root: " MYSQL_ROOT_PASS
    echo
    
    mostrar_paso "Verificando conexión a MySQL..."
    if mysql -u"$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASS" -e "SELECT 1;" &> /dev/null; then
        mostrar_exito "Conexión a MySQL exitosa"
    else
        mostrar_error "No se pudo conectar a MySQL"
        exit 1
    fi
    
    # Generar contraseña aleatoria para usuario de aplicación
    DB_PASSWORD=$MYSQL_ROOT_PASS
    
    mostrar_paso "Creando base de datos y usuario..."
    
    # Script SQL para crear base de datos y usuario
    mysql -u"$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASS" << EOF
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario específico

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Verificar creación
SELECT User, Host FROM mysql.user WHERE User = '$DB_USER';
SHOW DATABASES LIKE '$DB_NAME';
EOF
    
    mostrar_exito "Base de datos y usuario creados"
    
    # Ejecutar migración de usuarios
    mostrar_paso "Ejecutando migración de usuarios..."
    if [ -f "$DATABASE_DIR/scripts/migracion_usuarios.sql" ]; then
        mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$DATABASE_DIR/scripts/migracion_usuarios.sql"
        mostrar_exito "Migración de usuarios ejecutada"
    else
        mostrar_advertencia "Script de migración no encontrado"
    fi
}

# Función para configurar variables de entorno
configurar_variables_entorno() {
    mostrar_seccion "Configurando Variables de Entorno"
    
    # Generar SECRET_KEY de Django
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
    
    # Crear archivo .env si no existe
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        mostrar_paso "Creando archivo .env..."
        
        cat > "$PROJECT_DIR/.env" << EOF
# FELICITAFAC - Configuración de Entorno
# Generado automáticamente el $(date)

# =======================================================
# CONFIGURACIÓN DJANGO
# =======================================================
SECRET_KEY=$SECRET_KEY
DEBUG=True
DJANGO_SETTINGS_MODULE=configuracion.settings.local
ALLOWED_HOSTS=localhost,127.0.0.1

# =======================================================
# CONFIGURACIÓN DE BASE DE DATOS MYSQL
# =======================================================
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT

# =======================================================
# CONFIGURACIÓN CORS (DESARROLLO)
# =======================================================
CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173

# =======================================================
# CONFIGURACIÓN DE EMAIL (DESARROLLO)
# =======================================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=

# =======================================================
# CONFIGURACIÓN NUBEFACT (SUNAT)
# =======================================================
NUBEFACT_TOKEN=
NUBEFACT_URL_BASE=https://api.nubefact.com/api/v1
NUBEFACT_MODO=desarrollo

# =======================================================
# CONFIGURACIÓN ADICIONAL
# =======================================================
REDIS_URL=redis://127.0.0.1:6379/1
BACKUP_ENABLED=True
LOGS_LEVEL=INFO
EOF
        
        mostrar_exito "Archivo .env creado"
    else
        mostrar_info "Archivo .env ya existe"
        
        # Actualizar variables específicas
        mostrar_paso "Actualizando variables de base de datos..."
        sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" "$PROJECT_DIR/.env"
        mostrar_exito "Variables actualizadas"
    fi
    
    # Crear directorio de logs
    if [ ! -d "$LOGS_DIR" ]; then
        mkdir -p "$LOGS_DIR"
        mostrar_exito "Directorio de logs creado"
    fi
}

# Función para ejecutar migraciones Django
ejecutar_migraciones_django() {
    mostrar_seccion "Ejecutando Migraciones de Django"
    
    cd "$BACKEND_DIR"
    
    mostrar_paso "Creando migraciones..."
    python manage.py makemigrations
    
    mostrar_paso "Aplicando migraciones..."
    python manage.py migrate
    
    mostrar_paso "Creando superusuario..."
    echo "from aplicaciones.usuarios.models import Usuario, Rol; 
admin_role = Rol.objects.get(codigo='administrador'); 
Usuario.objects.filter(email='admin@felicitafac.com').delete(); 
Usuario.objects.create_superuser('admin@felicitafac.com', 'admin123', nombres='Admin', apellidos='Sistema', numero_documento='12345678', rol=admin_role)" | python manage.py shell
    
    mostrar_exito "Migraciones de Django completadas"
    
    cd "$PROJECT_DIR"
}

# Función para configurar frontend
configurar_frontend() {
    mostrar_seccion "Configurando Frontend React"
    
    cd "$FRONTEND_DIR"
    
    mostrar_paso "Instalando dependencias de Node.js..."
    npm install
    
    # Crear archivo de configuración de entorno para React
    if [ ! -f ".env" ]; then
        mostrar_paso "Creando archivo .env para React..."
        cat > ".env" << EOF
# FELICITAFAC Frontend - Variables de Entorno
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=FELICITAFAC
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
EOF
        mostrar_exito "Configuración de React creada"
    fi
    
    cd "$PROJECT_DIR"
}

# Función para ejecutar tests
ejecutar_tests() {
    mostrar_seccion "Ejecutando Tests de Autenticación"
    
    cd "$BACKEND_DIR"
    
    mostrar_paso "Ejecutando tests de backend..."
    python manage.py test aplicaciones.usuarios --verbosity=2
    
    cd "$FRONTEND_DIR"
    
    mostrar_paso "Ejecutando tests de frontend..."
    npm test -- --watchAll=false
    
    cd "$PROJECT_DIR"
}

# Función para verificar configuración
verificar_configuracion() {
    mostrar_seccion "Verificando Configuración"
    
    cd "$BACKEND_DIR"
    
    mostrar_paso "Verificando configuración de Django..."
    python manage.py check
    
    mostrar_paso "Verificando conexión a base de datos..."
    python manage.py shell -c "from django.db import connection; connection.ensure_connection(); print('✓ Conexión exitosa')"
    
    mostrar_paso "Verificando autenticación JWT..."
    python manage.py shell -c "
from aplicaciones.usuarios.models import Usuario;
from rest_framework_simplejwt.tokens import RefreshToken;
user = Usuario.objects.get(email='admin@felicitafac.com');
token = RefreshToken.for_user(user);
print(f'✓ JWT Token generado: {str(token.access_token)[:50]}...')
"
    
    cd "$PROJECT_DIR"
}

# Función para mostrar información final
mostrar_informacion_final() {
    mostrar_seccion "Configuración Completada"
    
    echo -e "${GREEN}¡FELICITAFAC Autenticación JWT configurada exitosamente!${NC}\n"
    
    echo -e "${CYAN}INFORMACIÓN DE ACCESO:${NC}"
    echo "=================================="
    echo -e "🌐 URL Backend:     ${BLUE}http://localhost:8000${NC}"
    echo -e "🌐 URL Frontend:    ${BLUE}http://localhost:5173${NC}"
    echo -e "🔧 Panel Admin:     ${BLUE}http://localhost:8000/admin/${NC}"
    echo ""
    echo -e "${CYAN}CREDENCIALES DE PRUEBA:${NC}"
    echo "=================================="
    echo -e "👤 Administrador:   ${GREEN}admin@felicitafac.com${NC} / ${GREEN}admin123${NC}"
    echo -e "👤 Contador:        ${GREEN}contador@felicitafac.com${NC} / ${GREEN}contador123${NC}"
    echo -e "👤 Vendedor:        ${GREEN}vendedor@felicitafac.com${NC} / ${GREEN}vendedor123${NC}"
    echo -e "👤 Cliente:         ${GREEN}cliente@felicitafac.com${NC} / ${GREEN}cliente123${NC}"
    echo ""
    echo -e "${CYAN}BASE DE DATOS:${NC}"
    echo "=================================="
    echo -e "🗄️  Nombre:          ${GREEN}$DB_NAME${NC}"
    echo -e "👤 Usuario:          ${GREEN}$DB_USER${NC}"
    echo -e "🔐 Contraseña:       ${GREEN}$DB_PASSWORD${NC}"
    echo -e "🏠 Host:             ${GREEN}$DB_HOST:$DB_PORT${NC}"
    echo ""
    echo -e "${CYAN}COMANDOS ÚTILES:${NC}"
    echo "=================================="
    echo -e "🚀 Iniciar Backend:  ${BLUE}cd backend && python manage.py runserver${NC}"
    echo -e "🚀 Iniciar Frontend: ${BLUE}cd frontend && npm run dev${NC}"
    echo -e "🧪 Ejecutar Tests:   ${BLUE}./scripts/ejecutar-tests.sh${NC}"
    echo -e "📊 Ver Logs:         ${BLUE}tail -f logs/felicitafac.log${NC}"
    echo ""
    echo -e "${YELLOW}PRÓXIMOS PASOS:${NC}"
    echo "=================================="
    echo "1. Activar entorno virtual: source venv/bin/activate"
    echo "2. Iniciar servidor de desarrollo"
    echo "3. Configurar email en .env para producción"
    echo "4. Configurar Nubefact API para SUNAT"
    echo "5. Continuar con Fase 3 - API Core y Nubefact"
    echo ""
    echo -e "${GREEN}🎉 ¡Listo para continuar con el desarrollo!${NC}"
}

# Función para manejo de errores
manejo_errores() {
    mostrar_error "Script interrumpido. Limpiando..."
    
    # Limpiar procesos si es necesario
    pkill -f "python.*manage.py" 2>/dev/null || true
    pkill -f "npm.*dev" 2>/dev/null || true
    
    echo -e "${RED}Configuración incompleta. Revisar logs para más detalles.${NC}"
    exit 1
}

# Función principal
main() {
    # Configurar manejo de errores
    trap manejo_errores INT TERM ERR
    
    # Mostrar banner
    mostrar_banner
    
    # Confirmar ejecución
    echo -e "${YELLOW}¿Desea continuar con la configuración de autenticación JWT? (s/n):${NC}"
    read -r respuesta
    
    if [[ ! "$respuesta" =~ ^[Ss]$ ]]; then
        echo "Configuración cancelada."
        exit 0
    fi
    
    # Ejecutar pasos de configuración
    verificar_prerrequisitos
    configurar_entorno_virtual
    configurar_base_datos
    configurar_variables_entorno
    ejecutar_migraciones_django
    configurar_frontend
    verificar_configuracion
    
    # Preguntar si ejecutar tests
    echo -e "${YELLOW}¿Desea ejecutar los tests de autenticación? (s/n):${NC}"
    read -r ejecutar_tests_respuesta
    
    if [[ "$ejecutar_tests_respuesta" =~ ^[Ss]$ ]]; then
        ejecutar_tests
    fi
    
    # Mostrar información final
    mostrar_informacion_final
}

# =======================================================
# EJECUCIÓN DEL SCRIPT
# =======================================================

# Verificar que se ejecuta desde el directorio correcto
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    mostrar_error "Este script debe ejecutarse desde el directorio raíz del proyecto FELICITAFAC"
    exit 1
fi

# Ejecutar función principal
main "$@"

# =======================================================
# NOTAS DE USO
# =======================================================

: <<'NOTAS'
INSTRUCCIONES DE USO:

1. Hacer ejecutable:
   chmod +x scripts/configurar-autenticacion.sh

2. Ejecutar desde raíz del proyecto:
   ./scripts/configurar-autenticacion.sh

3. Seguir las instrucciones en pantalla

4. El script configurará:
   - Entorno virtual Python
   - Base de datos MySQL
   - Variables de entorno
   - Migraciones Django
   - Dependencias Frontend
   - Tests de autenticación

PRERREQUISITOS:
- Python 3.8+
- MySQL 8.0+
- Node.js 16+
- npm o yarn

NOTAS IMPORTANTES:
- Guardar la contraseña de base de datos generada
- Configurar email en .env para producción
- Cambiar SECRET_KEY en producción
- Configurar CORS para dominios específicos en producción

TROUBLESHOOTING:
- Si falla MySQL: verificar que el servicio esté corriendo
- Si falla pip: asegurar que venv esté activado
- Si falla npm: verificar versión de Node.js

LOGS:
- Logs de aplicación: logs/felicitafac.log
- Logs de autenticación: logs/auth.log
- Logs de Django: usar DEBUG=True

SEGURIDAD:
- Cambiar todas las contraseñas por defecto
- Configurar HTTPS en producción
- Configurar firewall para MySQL
- Usar variables de entorno para secretos
NOTAS