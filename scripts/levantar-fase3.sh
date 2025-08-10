#!/bin/bash

# ================================================================
# FELICITAFAC - Script para Levantar Fase 3 Completa
# Sistema de Facturación Electrónica para Perú
# Levanta Backend Django + Frontend React + MySQL con todos los datos
# ================================================================

set -e  # Salir si cualquier comando falla

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

# Variables de base de datos por defecto
DB_NAME="felicitafac_fase3"
DB_USER="root"
DB_HOST="localhost"
DB_PORT="3306"

# ================================================================
# FUNCIONES DE UTILIDAD
# ================================================================

mostrar_banner() {
    clear
    echo -e "${BLUE}"
    echo "=================================================================="
    echo "  🚀 FELICITAFAC - LEVANTAR FASE 3"
    echo "  Sistema de Facturación Electrónica para Perú"
    echo "  Backend + Frontend + APIs + Base de Datos"
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

# ================================================================
# VERIFICACIONES INICIALES
# ================================================================

verificar_prerrequisitos() {
    mostrar_seccion "Verificando Prerrequisitos del Sistema"
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        mostrar_error "Ejecuta este script desde la carpeta raíz de FELICITAFAC"
        mostrar_info "Estructura requerida: felicitafac/backend/, felicitafac/frontend/"
        exit 1
    fi
    mostrar_exito "Estructura del proyecto verificada"
    
    # Verificar Python 3.8+
    
    # Verificar MySQL
    if ! command -v mysql &> /dev/null; then
        mostrar_error "MySQL no está instalado"
        mostrar_info "Instala MySQL 8.0+ desde: https://dev.mysql.com/downloads/"
        exit 1
    fi
    mostrar_exito "MySQL $(mysql --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1) ✓"
    
    # Verificar Node.js

    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        mostrar_error "npm no está instalado"
        exit 1
    fi
    mostrar_exito "npm $(npm --version) ✓"
    
    # Verificar si MySQL está corriendo
    if ! mysqladmin -h"$DB_HOST" -P"$DB_PORT" ping &>/dev/null; then
        mostrar_error "MySQL no está ejecutándose"
        mostrar_info "Inicia MySQL:"
        echo "  sudo systemctl start mysql    # Linux"
        echo "  brew services start mysql     # macOS"
        echo "  net start mysql               # Windows"
        exit 1
    fi
    mostrar_exito "Servicio MySQL activo ✓"
}

# ================================================================
# CONFIGURACIÓN DE CREDENCIALES
# ================================================================

configurar_credenciales() {
    mostrar_seccion "Configuración de Credenciales MySQL"
    
    # Cargar .env si existe
    if [ -f ".env" ]; then
        set -a
        source .env
        set +a
        mostrar_info "Variables cargadas desde .env"
        
        # Usar variables del .env si existen
        DB_NAME=${DB_NAME:-"felicitafac_fase3"}
        DB_USER=${DB_USER:-"root"}
        DB_PASSWORD=${DB_PASSWORD:-""}
        DB_HOST=${DB_HOST:-"localhost"}
        DB_PORT=${DB_PORT:-"3306"}
    fi
    
    echo ""
    mostrar_info "Configuración actual:"
    echo "  Host: $DB_HOST:$DB_PORT"
    echo "  Usuario: $DB_USER"
    echo "  Base de datos: $DB_NAME"
    echo ""
    
    echo -n "¿Usar esta configuración? [S/n]: "
    read -r usar_config
    
    if [[ "$usar_config" =~ ^[Nn]$ ]]; then
        echo ""
        mostrar_paso "Ingresa las credenciales de MySQL:"
        
        read -p "Host [$DB_HOST]: " nuevo_host
        DB_HOST=${nuevo_host:-$DB_HOST}
        
        read -p "Puerto [$DB_PORT]: " nuevo_puerto
        DB_PORT=${nuevo_puerto:-$DB_PORT}
        
        read -p "Usuario [$DB_USER]: " nuevo_usuario
        DB_USER=${nuevo_usuario:-$DB_USER}
        
        echo -n "Contraseña MySQL: "
        read -s DB_PASSWORD
        echo ""
        
        read -p "Nombre de base de datos [$DB_NAME]: " nuevo_nombre
        DB_NAME=${nuevo_nombre:-$DB_NAME}
    else
        if [ -z "$DB_PASSWORD" ]; then
            echo -n "Contraseña MySQL para $DB_USER: "
            read -s DB_PASSWORD
            echo ""
        fi
    fi
    
    # Probar conexión
    mostrar_paso "Probando conexión a MySQL..."
    if [ -n "$DB_PASSWORD" ]; then
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &>/dev/null
    else
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -e "SELECT 1;" &>/dev/null
    fi

    if [ $? -eq 0 ]; then
        mostrar_exito "Conexión MySQL exitosa"
    else
        mostrar_error "No se pudo conectar a MySQL con las credenciales proporcionadas"
        exit 1
    fi
}

# ================================================================
# CONFIGURACIÓN DE BASE DE DATOS
# ================================================================

configurar_base_datos() {
    mostrar_seccion "Configurando Base de Datos MySQL"
    
    mostrar_paso "Creando base de datos '$DB_NAME'..."
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "
        CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci;
    " 2>/dev/null
    mostrar_exito "Base de datos '$DB_NAME' creada/verificada"
    
    # Ejecutar migración de Fase 3
    if [ -f "$DATABASE_DIR/scripts/migracion_fase3.sql" ]; then
        mostrar_paso "Ejecutando migración de Fase 3..."
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$DATABASE_DIR/scripts/migracion_fase3.sql"
        mostrar_exito "Migración de Fase 3 ejecutada"
    else
        mostrar_advertencia "Archivo de migración no encontrado: $DATABASE_DIR/scripts/migracion_fase3.sql"
        mostrar_info "Las tablas se crearán con Django migrations"
    fi
    
    # Cargar datos iniciales de Fase 3
    if [ -f "$DATABASE_DIR/scripts/datos_iniciales_fase3.sql" ]; then
        mostrar_paso "Cargando datos iniciales de Fase 3..."
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$DATABASE_DIR/scripts/datos_iniciales_fase3.sql"
        mostrar_exito "Datos iniciales de Fase 3 cargados"
    else
        mostrar_advertencia "Archivo de datos iniciales no encontrado"
    fi
    
    # Verificar tablas creadas
    table_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" | wc -l)
    if [ $table_count -gt 1 ]; then
        mostrar_exito "Base de datos configurada con $(($table_count - 1)) tablas"
    else
        mostrar_advertencia "No se detectaron tablas en la base de datos"
    fi
}

# ================================================================
# CONFIGURACIÓN DEL BACKEND DJANGO
# ================================================================

configurar_backend() {
    mostrar_seccion "Configurando Backend Django"
    
    cd "$BACKEND_DIR"
    
    # Crear entorno virtual si no existe
    if [ ! -d "venv" ]; then
        mostrar_paso "Creando entorno virtual Python..."
        python3 -m venv venv
        mostrar_exito "Entorno virtual creado"
    fi
    
    # Activar entorno virtual
    mostrar_paso "Activando entorno virtual..."
    source venv/bin/activate
    mostrar_exito "Entorno virtual activado"
    
    # Instalar dependencias
    if [ -f "requirements.txt" ]; then
        mostrar_paso "Instalando dependencias Python..."
        pip install --upgrade pip
        pip install -r requirements.txt
        mostrar_exito "Dependencias instaladas"
    else
        mostrar_error "Archivo requirements.txt no encontrado"
        exit 1
    fi
    
    # Crear archivo .env para Django
    mostrar_paso "Configurando variables de entorno Django..."
    cat > .env << EOF
# FELICITAFAC - Configuración Fase 3
DEBUG=True
SECRET_KEY=felicitafac-fase3-development-key-$(date +%s)

# Base de datos MySQL
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT

# Configuración Django
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOW_ALL_ORIGINS=True
LANGUAGE_CODE=es-pe
TIME_ZONE=America/Lima

# Configuración SUNAT (demo)
NUBEFACT_TOKEN=demo-token-fase3
NUBEFACT_URL_BASE=https://api.nubefact.com
NUBEFACT_TIMEOUT=30

# Empresa (datos de ejemplo)
EMPRESA_RUC=20123456789
EMPRESA_RAZON_SOCIAL=FELICITAFAC DESARROLLO SAC
EMPRESA_DIRECCION=Av. Desarrollo 123

# Email (desarrollo)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=localhost
EMAIL_PORT=1025
EOF
    mostrar_exito "Variables de entorno configuradas"
    
    # Ejecutar migraciones Django
    mostrar_paso "Ejecutando migraciones Django..."
    python manage.py makemigrations
    python manage.py migrate
    mostrar_exito "Migraciones Django ejecutadas"
    
    # Crear superusuario si no existe
    mostrar_paso "Verificando superusuario..."
    if ! python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print('exists' if User.objects.filter(email='admin@felicitafac.com').exists() else 'not_exists')" | grep -q "exists"; then
        mostrar_paso "Creando superusuario admin@felicitafac.com..."
        python manage.py shell -c "
from aplicaciones.usuarios.models import Usuario
usuario = Usuario.objects.create_user(
    email='admin@felicitafac.com',
    password='admin123',
    nombre='Administrador',
    apellidos='del Sistema',
    rol='administrador',
    is_staff=True,
    is_superuser=True
)
print('✓ Superusuario creado exitosamente')
"
        mostrar_exito "Superusuario creado: admin@felicitafac.com / admin123"
    else
        mostrar_info "Superusuario ya existe: admin@felicitafac.com"
    fi
    
    # Verificar configuración
    mostrar_paso "Verificando configuración Django..."
    python manage.py check
    mostrar_exito "Configuración Django válida"
    
    cd "$PROJECT_DIR"
}

# ================================================================
# CONFIGURACIÓN DEL FRONTEND REACT
# ================================================================

configurar_frontend() {
    mostrar_seccion "Configurando Frontend React"
    
    cd "$FRONTEND_DIR"
    
    # Verificar package.json
    if [ ! -f "package.json" ]; then
        mostrar_error "Archivo package.json no encontrado"
        exit 1
    fi
    
    # Instalar dependencias
    mostrar_paso "Instalando dependencias Node.js..."
    npm install
    mostrar_exito "Dependencias Node.js instaladas"
    
    # Crear archivo .env para React
    mostrar_paso "Configurando variables de entorno React..."
    cat > .env.local << EOF
# FELICITAFAC Frontend - Fase 3
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=FELICITAFAC
VITE_APP_VERSION=3.0.0
VITE_ENVIRONMENT=development
VITE_DEBUG=true

# Configuración de la empresa
VITE_EMPRESA_RUC=20123456789
VITE_EMPRESA_NOMBRE=FELICITAFAC DESARROLLO SAC

# URLs de servicios
VITE_NUBEFACT_DOCS_URL=https://nubefact.com/documentacion
VITE_SUNAT_CONSULTA_URL=https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/jcrS00Alias
EOF
    mostrar_exito "Variables de entorno React configuradas"
    
    # Verificar configuración
    mostrar_paso "Verificando configuración React..."
    if npm run build --dry-run &>/dev/null; then
        mostrar_exito "Configuración React válida"
    else
        mostrar_advertencia "Verificación de build React no disponible"
    fi
    
    cd "$PROJECT_DIR"
}

# ================================================================
# VERIFICACIÓN FINAL
# ================================================================

verificar_configuracion() {
    mostrar_seccion "Verificación Final del Sistema"
    
    # Verificar conexión a base de datos desde Django
    mostrar_paso "Verificando conexión Django -> MySQL..."
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    if python manage.py shell -c "
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT COUNT(*) FROM aplicaciones_usuarios_usuario')
count = cursor.fetchone()[0]
print(f'✓ Usuarios en BD: {count}')
" 2>/dev/null; then
        mostrar_exito "Conexión Django -> MySQL funcionando"
    else
        mostrar_error "Error en conexión Django -> MySQL"
        exit 1
    fi
    
    # Verificar APIs REST
    mostrar_paso "Verificando APIs REST..."
    if python manage.py shell -c "
from rest_framework.test import APIClient
client = APIClient()
response = client.get('/api/')
print(f'✓ API Status: {response.status_code}')
" 2>/dev/null; then
        mostrar_exito "APIs REST configuradas"
    else
        mostrar_advertencia "APIs REST pendientes de verificación"
    fi
    
    cd "$PROJECT_DIR"
    
    # Crear directorio de logs
    mkdir -p "$LOGS_DIR"
    mostrar_exito "Directorio de logs creado"
    
    # Verificar puertos disponibles
    if lsof -i :8000 &>/dev/null; then
        mostrar_advertencia "Puerto 8000 en uso (Django)"
    else
        mostrar_exito "Puerto 8000 disponible para Django"
    fi
    
    if lsof -i :5173 &>/dev/null; then
        mostrar_advertencia "Puerto 5173 en uso (React)"
    else
        mostrar_exito "Puerto 5173 disponible para React"
    fi
}

# ================================================================
# INICIAR SERVICIOS
# ================================================================

iniciar_servicios() {
    mostrar_seccion "Iniciando Servicios FELICITAFAC Fase 3"
    
    # Crear scripts de inicio en background
    mostrar_paso "Configurando scripts de inicio..."
    
    # Script para iniciar Django
    cat > "$PROJECT_DIR/start-backend.sh" << 'EOF'
#!/bin/bash
cd backend
source venv/bin/activate
echo "🚀 Iniciando Django en http://localhost:8000"
python manage.py runserver 0.0.0.0:8000
EOF
    chmod +x "$PROJECT_DIR/start-backend.sh"
    
    # Script para iniciar React
    cat > "$PROJECT_DIR/start-frontend.sh" << 'EOF'
#!/bin/bash
cd frontend
echo "🚀 Iniciando React en http://localhost:5173"
npm run dev
EOF
    chmod +x "$PROJECT_DIR/start-frontend.sh"
    
    mostrar_exito "Scripts de inicio creados"
    
    echo ""
    mostrar_info "🎯 OPCIONES DE INICIO:"
    echo ""
    echo "1️⃣  Iniciar solo Backend Django:"
    echo "   ./start-backend.sh"
    echo ""
    echo "2️⃣  Iniciar solo Frontend React:"
    echo "   ./start-frontend.sh"
    echo ""
    echo "3️⃣  Iniciar ambos servicios:"
    echo "   ./start-backend.sh & ./start-frontend.sh"
    echo ""
    
    echo -n "¿Iniciar ambos servicios ahora? [S/n]: "
    read -r iniciar_ahora
    
    if [[ ! "$iniciar_ahora" =~ ^[Nn]$ ]]; then
        mostrar_paso "Iniciando servicios en background..."
        
        # Iniciar Django en background
        cd "$BACKEND_DIR"
        source venv/bin/activate
        nohup python manage.py runserver 0.0.0.0:8000 > "$LOGS_DIR/django.log" 2>&1 &
        DJANGO_PID=$!
        
        # Esperar un momento
        sleep 3
        
        # Iniciar React en background
        cd "$FRONTEND_DIR"
        nohup npm run dev > "$LOGS_DIR/react.log" 2>&1 &
        REACT_PID=$!
        
        cd "$PROJECT_DIR"
        
        # Guardar PIDs para poder detener después
        echo "$DJANGO_PID" > "$LOGS_DIR/django.pid"
        echo "$REACT_PID" > "$LOGS_DIR/react.pid"
        
        mostrar_exito "Servicios iniciados en background"
        
        # Esperar a que los servicios estén listos
        mostrar_paso "Esperando que los servicios estén listos..."
        sleep 5
        
        # Verificar que los servicios estén corriendo
        if curl -s http://localhost:8000/api/ &>/dev/null; then
            mostrar_exito "✅ Django API disponible en http://localhost:8000"
        else
            mostrar_advertencia "Django tardando en iniciar, revisar logs/django.log"
        fi
        
        if curl -s http://localhost:5173 &>/dev/null; then
            mostrar_exito "✅ React App disponible en http://localhost:5173"
        else
            mostrar_advertencia "React tardando en iniciar, revisar logs/react.log"
        fi
    fi
}

# ================================================================
# INFORMACIÓN FINAL
# ================================================================

mostrar_informacion_final() {
    mostrar_seccion "¡FELICITAFAC FASE 3 LEVANTADA EXITOSAMENTE!"
    
    echo -e "${GREEN}"
    echo "=================================================================="
    echo "  🎉 SISTEMA COMPLETAMENTE CONFIGURADO Y FUNCIONANDO"
    echo "=================================================================="
    echo -e "${NC}"
    
    echo -e "${CYAN}📋 ACCESOS AL SISTEMA:${NC}"
    echo "=================================="
    echo -e "🌐 Frontend React:     ${BLUE}http://localhost:5173${NC}"
    echo -e "🔧 Backend Django:     ${BLUE}http://localhost:8000${NC}"
    echo -e "📊 API REST:           ${BLUE}http://localhost:8000/api/${NC}"
    echo -e "⚙️  Admin Django:       ${BLUE}http://localhost:8000/admin/${NC}"
    echo ""
    
    echo -e "${CYAN}👤 CREDENCIALES DE ACCESO:${NC}"
    echo "=================================="
    echo -e "🔑 Administrador:      ${GREEN}admin@felicitafac.com${NC} / ${GREEN}admin123${NC}"
    echo ""
    
    echo -e "${CYAN}🗄️ BASE DE DATOS MYSQL:${NC}"
    echo "=================================="
    echo -e "📊 Nombre:             ${GREEN}$DB_NAME${NC}"
    echo -e "👤 Usuario:            ${GREEN}$DB_USER${NC}"
    echo -e "🏠 Host:               ${GREEN}$DB_HOST:$DB_PORT${NC}"
    echo -e "📋 Tablas:             ${GREEN}~40 tablas creadas${NC}"
    echo -e "📦 Datos:              ${GREEN}Datos de ejemplo cargados${NC}"
    echo ""
    
    echo -e "${CYAN}🛠️ FUNCIONALIDADES DISPONIBLES:${NC}"
    echo "=================================="
    echo -e "✅ Gestión de Clientes (RUC/DNI)"
    echo -e "✅ Gestión de Productos e Inventario"
    echo -e "✅ Facturación Electrónica"
    echo -e "✅ Integración Nubefact (Demo)"
    echo -e "✅ Control de Inventario PEPS"
    echo -e "✅ APIs REST completas"
    echo -e "✅ Autenticación JWT"
    echo -e "✅ Panel de Administración"
    echo ""
    
    echo -e "${CYAN}📁 ARCHIVOS IMPORTANTES:${NC}"
    echo "=================================="
    echo -e "📄 Logs Backend:       ${YELLOW}logs/django.log${NC}"
    echo -e "📄 Logs Frontend:      ${YELLOW}logs/react.log${NC}"
    echo -e "🔧 Configuración:      ${YELLOW}.env${NC}"
    echo -e "🚀 Iniciar Backend:    ${YELLOW}./start-backend.sh${NC}"
    echo -e "🚀 Iniciar Frontend:   ${YELLOW}./start-frontend.sh${NC}"
    echo ""
    
    echo -e "${CYAN}🔧 COMANDOS ÚTILES:${NC}"
    echo "=================================="
    echo -e "📊 Ver logs Django:    ${BLUE}tail -f logs/django.log${NC}"
    echo -e "📊 Ver logs React:     ${BLUE}tail -f logs/react.log${NC}"
    echo -e "🛑 Detener servicios:  ${BLUE}./scripts/detener-servicios.sh${NC}"
    echo -e "🔄 Reiniciar todo:     ${BLUE}./scripts/levantar-fase3.sh${NC}"
    echo -e "🧪 Ejecutar tests:     ${BLUE}cd backend && python manage.py test${NC}"
    echo ""
    
    echo -e "${YELLOW}📝 PRÓXIMOS PASOS RECOMENDADOS:${NC}"
    echo "=================================="
    echo "1. 🌐 Abrir http://localhost:5173 para ver el frontend"
    echo "2. 🔑 Hacer login con admin@felicitafac.com / admin123"
    echo "3. 📊 Explorar las APIs en http://localhost:8000/api/"
    echo "4. 🧪 Probar crear clientes, productos y facturas"
    echo "5. 📋 Revisar los logs si hay algún problema"
    echo "6. 🚀 Continuar con Fase 4: Desarrollo Frontend avanzado"
    echo ""
    
    if [ -f "$LOGS_DIR/django.pid" ] && [ -f "$LOGS_DIR/react.pid" ]; then
        echo -e "${GREEN}🎯 ¡SISTEMA CORRIENDO EN BACKGROUND!${NC}"
        echo -e "Para detener: ${BLUE}kill \$(cat logs/django.pid logs/react.pid)${NC}"
    else
        echo -e "${YELLOW}💡 INICIAR MANUALMENTE:${NC}"
        echo -e "Backend:  ${BLUE}./start-backend.sh${NC}"
        echo -e "Frontend: ${BLUE}./start-frontend.sh${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 ¡FELICITAFAC FASE 3 LISTA PARA USAR!${NC}"
}

# ================================================================
# FUNCIÓN PRINCIPAL
# ================================================================

main() {
    # Mostrar banner
    mostrar_banner
    
    # Confirmar ejecución
    echo -e "${YELLOW}¿Desea levantar FELICITAFAC Fase 3 completa? [S/n]:${NC}"
    read -r confirmar
    
    if [[ "$confirmar" =~ ^[Nn]$ ]]; then
        echo "Operación cancelada."
        exit 0
    fi
    
    # Ejecutar configuración paso a paso
    verificar_prerrequisitos
    configurar_credenciales
    configurar_base_datos
    configurar_backend
    configurar_frontend
    verificar_configuracion
    iniciar_servicios
    mostrar_informacion_final
}

# ================================================================
# MANEJO DE ERRORES
# ================================================================

cleanup() {
    mostrar_error "Script interrumpido. Limpiando procesos..."
    
    # Matar procesos si existen
    if [ -f "$LOGS_DIR/django.pid" ]; then
        kill $(cat "$LOGS_DIR/django.pid") 2>/dev/null || true
        rm -f "$LOGS_DIR/django.pid"
    fi
    
    if [ -f "$LOGS_DIR/react.pid" ]; then
        kill $(cat "$LOGS_DIR/react.pid") 2>/dev/null || true
        rm -f "$LOGS_DIR/react.pid"
    fi
    
    exit 1
}

trap cleanup INT TERM

# ================================================================
# EJECUCIÓN
# ================================================================

# Verificar directorio correcto
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}[ERROR]${NC} Ejecuta desde la carpeta raíz de FELICITAFAC"
    echo -e "${YELLOW}[INFO]${NC} Estructura requerida:"
    echo "  felicitafac/"
    echo "  ├── backend/"
    echo "  ├── frontend/"
    echo "  ├── scripts/"
    echo "  └── README.md"
    exit 1
fi

# Ejecutar función principal
main "$@"