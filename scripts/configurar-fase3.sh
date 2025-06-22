#!/bin/bash

# ================================================================
# SCRIPT CONFIGURACIÓN FASE 3 - FELICITAFAC
# Sistema de Facturación Electrónica para Perú
# Configuración específica para Fase 3: API Core y Nubefact
# ================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables del proyecto
PROJECT_NAME="FELICITAFAC"
PROJECT_DIR=$(pwd)
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Función para mostrar mensajes
mostrar_mensaje() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

mostrar_exito() {
    echo -e "${GREEN}[✓]${NC} $1"
}

mostrar_error() {
    echo -e "${RED}[✗]${NC} $1"
}

mostrar_advertencia() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

mostrar_seccion() {
    echo ""
    echo -e "${BLUE}===============================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}===============================================${NC}"
    echo ""
}

mostrar_banner() {
    clear
    echo -e "${CYAN}"
    echo "================================================================"
    echo "     _____ _____ _     ___ ____ ___ _____  _    _____ _    ____"
    echo "    |  ___| ____| |   |_ _/ ___|_ _|_   _|/ \  |  ___/ \  / ___|"
    echo "    | |_  |  _| | |    | | |    | |  | | / _ \ | |_ / _ \| |"
    echo "    |  _| | |___| |___ | | |___ | |  | |/ ___ \|  _/ ___ \ |___"
    echo "    |_|   |_____|_____|___\____|___| |_/_/   \_\_|/_/   \_\____|"
    echo ""
    echo "    CONFIGURACIÓN FASE 3: API CORE Y NUBEFACT"
    echo "    Sistema de Facturación Electrónica para Perú"
    echo "================================================================"
    echo -e "${NC}"
    echo ""
}

# Función para verificar prerrequisitos
verificar_prerrequisitos() {
    mostrar_seccion "Verificando Prerrequisitos Fase 3"
    
    # Verificar que estamos en el directorio correcto
    if [[ ! -f "README.md" ]] || [[ ! -d "backend" ]] || [[ ! -d "frontend" ]]; then
        mostrar_error "Este script debe ejecutarse desde el directorio raíz del proyecto FELICITAFAC"
        exit 1
    fi
    
    # Verificar que las fases anteriores existen
    if [[ ! -f "backend/manage.py" ]]; then
        mostrar_error "Fase 1 no detectada. Ejecuta primero la configuración de la Fase 1"
        exit 1
    fi
    
    if [[ ! -f "backend/aplicaciones/usuarios/models.py" ]]; then
        mostrar_error "Fase 2 no detectada. Ejecuta primero la configuración de la Fase 2"
        exit 1
    fi
    
    # Verificar que tenemos los archivos de la Fase 3
    if [[ ! -f "database/scripts/migracion_fase3.sql" ]]; then
        mostrar_error "Archivo migracion_fase3.sql no encontrado. Asegúrate de tener todos los archivos de la Fase 3"
        exit 1
    fi
    
    if [[ ! -f "database/scripts/datos_iniciales_fase3.sql" ]]; then
        mostrar_error "Archivo datos_iniciales_fase3.sql no encontrado. Asegúrate de tener todos los archivos de la Fase 3"
        exit 1
    fi
    
    mostrar_exito "Prerrequisitos verificados correctamente"
}

# Función para verificar entorno virtual
verificar_entorno_virtual() {
    mostrar_seccion "Verificando Entorno Virtual"
    
    cd "$BACKEND_DIR"
    
    if [[ ! -d "venv" ]]; then
        mostrar_error "Entorno virtual no encontrado. Ejecuta primero la configuración de las fases anteriores"
        exit 1
    fi
    
    # Activar entorno virtual
    source venv/bin/activate
    
    # Verificar que Django está instalado
    if ! python -c "import django" 2>/dev/null; then
        mostrar_error "Django no está instalado en el entorno virtual"
        exit 1
    fi
    
    mostrar_exito "Entorno virtual verificado y activado"
    cd "$PROJECT_DIR"
}

# Función para instalar nuevas dependencias
instalar_dependencias_fase3() {
    mostrar_seccion "Instalando Dependencias Fase 3"
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    # Verificar si existen nuevas dependencias
    if [[ -f "requirements-fase3.txt" ]]; then
        mostrar_mensaje "Instalando nuevas dependencias específicas de Fase 3..."
        pip install -r requirements-fase3.txt
        mostrar_exito "Dependencias Fase 3 instaladas"
    else
        mostrar_mensaje "Verificando dependencias existentes..."
        pip install -r requirements.txt
        mostrar_exito "Dependencias verificadas"
    fi
    
    cd "$PROJECT_DIR"
}

# Función para leer configuración de la base de datos
leer_configuracion_bd() {
    mostrar_seccion "Leyendo Configuración de Base de Datos"
    
    if [[ -f ".env" ]]; then
        # Leer configuración del archivo .env
        source .env
        DB_NAME=${DB_NAME:-"felicitafac_db"}
        DB_USER=${DB_USER:-"felicitafac_user"}
        DB_PASSWORD=${DB_PASSWORD:-""}
        DB_HOST=${DB_HOST:-"localhost"}
        DB_PORT=${DB_PORT:-"3306"}
        
        mostrar_exito "Configuración de BD leída desde .env"
    else
        mostrar_error "Archivo .env no encontrado. Ejecuta primero la configuración de las fases anteriores"
        exit 1
    fi
    
    # Verificar conexión a MySQL
    if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME;" 2>/dev/null; then
        mostrar_error "No se puede conectar a la base de datos. Verifica la configuración"
        exit 1
    fi
    
    mostrar_exito "Conexión a base de datos verificada"
}

# Función para ejecutar migración de la Fase 3
ejecutar_migracion_fase3() {
    mostrar_seccion "Ejecutando Migración Fase 3"
    
    mostrar_mensaje "Ejecutando migración de base de datos para Fase 3..."
    
    # Ejecutar el script SQL de migración
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/scripts/migracion_fase3.sql
    
    if [[ $? -eq 0 ]]; then
        mostrar_exito "Migración Fase 3 ejecutada exitosamente"
    else
        mostrar_error "Error al ejecutar migración Fase 3"
        exit 1
    fi
}

# Función para cargar datos iniciales de la Fase 3
cargar_datos_iniciales_fase3() {
    mostrar_seccion "Cargando Datos Iniciales Fase 3"
    
    mostrar_mensaje "Cargando datos iniciales para Fase 3..."
    
    # Ejecutar el script SQL de datos iniciales
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/scripts/datos_iniciales_fase3.sql
    
    if [[ $? -eq 0 ]]; then
        mostrar_exito "Datos iniciales Fase 3 cargados exitosamente"
    else
        mostrar_error "Error al cargar datos iniciales Fase 3"
        exit 1
    fi
}

# Función para ejecutar migraciones Django
ejecutar_migraciones_django() {
    mostrar_seccion "Ejecutando Migraciones Django"
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    # Crear migraciones para las nuevas apps
    mostrar_mensaje "Creando migraciones para nuevas aplicaciones..."
    python manage.py makemigrations clientes
    python manage.py makemigrations productos
    python manage.py makemigrations inventario
    python manage.py makemigrations facturacion
    python manage.py makemigrations integraciones
    python manage.py makemigrations contabilidad
    
    # Aplicar migraciones
    mostrar_mensaje "Aplicando migraciones Django..."
    python manage.py migrate
    
    if [[ $? -eq 0 ]]; then
        mostrar_exito "Migraciones Django aplicadas exitosamente"
    else
        mostrar_error "Error al aplicar migraciones Django"
        exit 1
    fi
    
    cd "$PROJECT_DIR"
}

# Función para verificar aplicaciones Django
verificar_aplicaciones_django() {
    mostrar_seccion "Verificando Aplicaciones Django"
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    # Verificar que las aplicaciones están instaladas
    mostrar_mensaje "Verificando aplicaciones Django..."
    
    python manage.py shell -c "
import django
django.setup()
from django.apps import apps

apps_fase3 = [
    'aplicaciones.clientes',
    'aplicaciones.productos', 
    'aplicaciones.inventario',
    'aplicaciones.facturacion',
    'aplicaciones.integraciones',
    'aplicaciones.contabilidad'
]

for app_name in apps_fase3:
    try:
        app = apps.get_app_config(app_name.split('.')[-1])
        print(f'✓ {app_name} - OK')
    except Exception as e:
        print(f'✗ {app_name} - ERROR: {e}')
        exit(1)

print('✓ Todas las aplicaciones de Fase 3 están correctamente configuradas')
"
    
    if [[ $? -eq 0 ]]; then
        mostrar_exito "Aplicaciones Django verificadas"
    else
        mostrar_error "Error en verificación de aplicaciones Django"
        exit 1
    fi
    
    cd "$PROJECT_DIR"
}

# Función para actualizar servicios frontend
actualizar_servicios_frontend() {
    mostrar_seccion "Verificando Servicios Frontend"
    
    cd "$FRONTEND_DIR"
    
    # Verificar que los servicios existen
    if [[ ! -f "src/servicios/clientes.ts" ]]; then
        mostrar_error "Servicio clientes.ts no encontrado. Asegúrate de tener todos los archivos de la Fase 3"
        exit 1
    fi
    
    if [[ ! -f "src/servicios/productos.ts" ]]; then
        mostrar_error "Servicio productos.ts no encontrado. Asegúrate de tener todos los archivos de la Fase 3"
        exit 1
    fi
    
    if [[ ! -f "src/servicios/facturas.ts" ]]; then
        mostrar_error "Servicio facturas.ts no encontrado. Asegúrate de tener todos los archivos de la Fase 3"
        exit 1
    fi
    
    if [[ ! -f "src/servicios/inventario.ts" ]]; then
        mostrar_error "Servicio inventario.ts no encontrado. Asegúrate de tener todos los archivos de la Fase 3"
        exit 1
    fi
    
    mostrar_exito "Servicios frontend verificados"
    cd "$PROJECT_DIR"
}

# Función para ejecutar tests de la Fase 3
ejecutar_tests_fase3() {
    mostrar_seccion "Ejecutando Tests Fase 3"
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    echo -e "${YELLOW}¿Desea ejecutar los tests de la Fase 3? (s/n):${NC}"
    read -r ejecutar_tests
    
    if [[ "$ejecutar_tests" =~ ^[Ss]$ ]]; then
        mostrar_mensaje "Ejecutando tests de aplicaciones Fase 3..."
        
        # Tests de clientes
        mostrar_mensaje "Tests de clientes..."
        python manage.py test aplicaciones.clientes.tests --verbosity=2
        
        # Tests de productos
        mostrar_mensaje "Tests de productos..."
        python manage.py test aplicaciones.productos.tests --verbosity=2
        
        # Tests de facturación
        mostrar_mensaje "Tests de facturación..."
        python manage.py test aplicaciones.facturacion.tests --verbosity=2
        
        mostrar_exito "Tests Fase 3 ejecutados exitosamente"
    else
        mostrar_mensaje "Tests omitidos. Puedes ejecutarlos después con:"
        echo "   cd backend && python manage.py test aplicaciones.clientes aplicaciones.productos aplicaciones.facturacion"
    fi
    
    cd "$PROJECT_DIR"
}

# Función para verificar configuración final
verificar_configuracion_final() {
    mostrar_seccion "Verificación Final Fase 3"
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    # Verificar que el servidor puede iniciar
    mostrar_mensaje "Verificando que el servidor Django puede iniciar..."
    
    python manage.py check --deploy
    
    if [[ $? -eq 0 ]]; then
        mostrar_exito "Verificación del sistema completada exitosamente"
    else
        mostrar_advertencia "Hay algunas advertencias en el sistema, pero debería funcionar"
    fi
    
    # Verificar endpoints de la API
    mostrar_mensaje "Verificando endpoints de la API..."
    
    python manage.py shell -c "
from django.urls import reverse
from django.test import Client

client = Client()

endpoints = [
    '/api/clientes/',
    '/api/productos/', 
    '/api/facturacion/facturas/',
    '/api/inventario/movimientos/'
]

for endpoint in endpoints:
    try:
        response = client.get(endpoint)
        status = 'OK' if response.status_code in [200, 401] else 'ERROR'
        print(f'✓ {endpoint} - {status} ({response.status_code})')
    except Exception as e:
        print(f'✗ {endpoint} - ERROR: {e}')
"
    
    cd "$PROJECT_DIR"
}

# Función para mostrar información final
mostrar_informacion_final() {
    mostrar_seccion "Configuración Fase 3 Completada"
    
    echo -e "${GREEN}¡FELICITAFAC Fase 3 configurada exitosamente!${NC}\n"
    
    echo -e "${CYAN}NUEVAS FUNCIONALIDADES DISPONIBLES:${NC}"
    echo "=================================================="
    echo -e "📋 Gestión de Clientes          ${GREEN}✓ Configurado${NC}"
    echo -e "📦 Gestión de Productos         ${GREEN}✓ Configurado${NC}"
    echo -e "📄 Facturación Electrónica      ${GREEN}✓ Configurado${NC}"
    echo -e "📊 Control de Inventario PEPS   ${GREEN}✓ Configurado${NC}"
    echo -e "🔗 Integración Nubefact         ${GREEN}✓ Configurado${NC}"
    echo -e "📈 Contabilidad Automática      ${GREEN}✓ Configurado${NC}"
    echo ""
    
    echo -e "${CYAN}ENDPOINTS API DISPONIBLES:${NC}"
    echo "=================================================="
    echo -e "🔗 Clientes:     ${BLUE}http://localhost:8000/api/clientes/${NC}"
    echo -e "🔗 Productos:    ${BLUE}http://localhost:8000/api/productos/${NC}"
    echo -e "🔗 Facturas:     ${BLUE}http://localhost:8000/api/facturacion/facturas/${NC}"
    echo -e "🔗 Inventario:   ${BLUE}http://localhost:8000/api/inventario/movimientos/${NC}"
    echo -e "🔗 API Docs:     ${BLUE}http://localhost:8000/api/docs/${NC}"
    echo ""
    
    echo -e "${CYAN}COMANDOS ÚTILES:${NC}"
    echo "=================================================="
    echo -e "🚀 Iniciar Backend:  ${BLUE}cd backend && python manage.py runserver${NC}"
    echo -e "🚀 Iniciar Frontend: ${BLUE}cd frontend && npm run dev${NC}"
    echo -e "🧪 Ejecutar Tests:   ${BLUE}cd backend && python manage.py test aplicaciones${NC}"
    echo -e "📊 Admin Panel:      ${BLUE}http://localhost:8000/admin/${NC}"
    echo ""
    
    echo -e "${YELLOW}PRÓXIMOS PASOS:${NC}"
    echo "=================================================="
    echo "1. Iniciar los servidores de desarrollo"
    echo "2. Configurar token de Nubefact en .env (para producción)"
    echo "3. Probar las nuevas funcionalidades"
    echo "4. Continuar con Fase 4 - Frontend React POS"
    echo ""
    
    echo -e "${GREEN}🎉 ¡Fase 3 lista para uso!${NC}"
}

# Función para manejo de errores
manejo_errores() {
    mostrar_error "Script interrumpido. Verificando estado..."
    
    cd "$PROJECT_DIR"
    
    echo -e "${RED}Configuración de Fase 3 incompleta.${NC}"
    echo -e "${YELLOW}Revisa los logs anteriores para identificar el problema.${NC}"
    exit 1
}

# Función principal
main() {
    # Configurar manejo de errores
    trap manejo_errores INT TERM ERR
    
    # Mostrar banner
    mostrar_banner
    
    # Confirmar ejecución
    echo -e "${YELLOW}Este script configurará la Fase 3 del sistema FELICITAFAC.${NC}"
    echo -e "${YELLOW}Asegúrate de tener las Fases 1 y 2 funcionando correctamente.${NC}"
    echo ""
    echo -e "${YELLOW}¿Desea continuar con la configuración de la Fase 3? (s/n):${NC}"
    read -r respuesta
    
    if [[ ! "$respuesta" =~ ^[Ss]$ ]]; then
        echo "Configuración cancelada."
        exit 0
    fi
    
    # Ejecutar pasos de configuración
    verificar_prerrequisitos
    verificar_entorno_virtual
    leer_configuracion_bd
    instalar_dependencias_fase3
    ejecutar_migracion_fase3
    cargar_datos_iniciales_fase3
    ejecutar_migraciones_django
    verificar_aplicaciones_django
    actualizar_servicios_frontend
    verificar_configuracion_final
    
    # Opción de ejecutar tests
    ejecutar_tests_fase3
    
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
   chmod +x scripts/configurar-fase3.sh

2. Ejecutar desde raíz del proyecto:
   ./scripts/configurar-fase3.sh

3. El script verificará que las Fases 1 y 2 estén configuradas

4. Seguir las instrucciones en pantalla

REQUISITOS:
- Fases 1 y 2 completamente configuradas
- MySQL funcionando
- Archivos de Fase 3 descargados y ubicados correctamente

NOTA: Este script solo configura la Fase 3, no afecta las configuraciones anteriores.
NOTAS