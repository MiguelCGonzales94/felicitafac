#!/bin/bash

# FELICITAFAC - Script de Inicio de Desarrollo
# Sistema de Facturación Electrónica para Perú
# Inicia backend Django y frontend React simultáneamente

set -e  # Salir si algún comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

mostrar_backend() {
    echo -e "${PURPLE}[BACKEND]${NC} $1"
}

mostrar_frontend() {
    echo -e "${GREEN}[FRONTEND]${NC} $1"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    mostrar_error "Este script debe ejecutarse desde la carpeta raíz de FELICITAFAC"
    exit 1
fi

# Cargar variables de entorno
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
    mostrar_exito "Variables de entorno cargadas"
else
    mostrar_advertencia "Archivo .env no encontrado"
fi

# Variables
BACKEND_PORT=${BACKEND_PORT:-8000}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
LOG_DIR="logs"

# Crear directorio de logs si no existe
mkdir -p "$LOG_DIR"

mostrar_mensaje "🚀 Iniciando entorno de desarrollo FELICITAFAC"
echo ""

# Función para verificar dependencias
verificar_dependencias() {
    mostrar_mensaje "🔍 Verificando dependencias..."
    
    # Verificar Python
    if ! command -v python3 &> /dev/null; then
        mostrar_error "Python3 no encontrado"
        exit 1
    fi
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        mostrar_error "Node.js no encontrado"
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        mostrar_error "npm no encontrado"
        exit 1
    fi
    
    # Verificar MySQL
    if ! command -v mysql &> /dev/null; then
        mostrar_advertencia "MySQL client no encontrado"
    fi
    
    mostrar_exito "Dependencias verificadas"
}

# Función para verificar entorno virtual Python
verificar_entorno_virtual() {
    mostrar_mensaje "🐍 Verificando entorno virtual Python..."
    
    if [ ! -d "backend/venv" ]; then
        mostrar_error "Entorno virtual no encontrado en backend/venv"
        echo "Ejecuta: ./scripts/instalar-dependencias.sh"
        exit 1
    fi
    
    mostrar_exito "Entorno virtual encontrado"
}

# Función para verificar node_modules
verificar_node_modules() {
    mostrar_mensaje "📦 Verificando dependencias Node.js..."
    
    if [ ! -d "frontend/node_modules" ]; then
        mostrar_error "node_modules no encontrado en frontend/"
        echo "Ejecuta: ./scripts/instalar-dependencias.sh"
        exit 1
    fi
    
    mostrar_exito "Dependencias Node.js encontradas"
}

# Función para verificar MySQL
verificar_mysql() {
    mostrar_mensaje "📊 Verificando conexión a MySQL..."
    
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-3306}
    DB_USER=${DB_USER:-root}
    DB_PASSWORD=${DB_PASSWORD:-root}
    DB_NAME=${DB_NAME:-felicitafac_local}
    
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "USE \`$DB_NAME\`;" &>/dev/null; then
        mostrar_exito "Conexión a MySQL exitosa"
    else
        mostrar_advertencia "No se pudo conectar a MySQL"
        echo "Verifica la configuración en .env o ejecuta: ./scripts/crear-base-datos.sh"
    fi
}

# Función para verificar migraciones
verificar_migraciones() {
    mostrar_mensaje "🔧 Verificando migraciones Django..."
    
    cd backend
    source venv/bin/activate
    
    # Verificar si hay migraciones pendientes
    if python manage.py showmigrations --plan | grep -q "\[ \]"; then
        mostrar_advertencia "Hay migraciones pendientes"
        read -p "¿Deseas aplicar las migraciones ahora? (s/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            python manage.py migrate
            mostrar_exito "Migraciones aplicadas"
        fi
    else
        mostrar_exito "Migraciones actualizadas"
    fi
    
    cd ..
}

# Función para limpiar logs antiguos
limpiar_logs() {
    mostrar_mensaje "🧹 Limpiando logs antiguos..."
    
    # Limpiar logs más antiguos de 7 días
    find "$LOG_DIR" -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
    
    mostrar_exito "Logs limpiados"
}

# Función para iniciar backend Django
iniciar_backend() {
    mostrar_backend "🐍 Iniciando servidor Django en puerto $BACKEND_PORT..."
    
    cd backend
    source venv/bin/activate
    
    # Verificar que Django esté instalado
    if ! python -c "import django" &>/dev/null; then
        mostrar_error "Django no está instalado en el entorno virtual"
        exit 1
    fi
    
    # Iniciar servidor Django en segundo plano
    nohup python manage.py runserver 0.0.0.0:$BACKEND_PORT > "../$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    
    # Guardar PID del backend
    echo $BACKEND_PID > "../$LOG_DIR/backend.pid"
    
    mostrar_backend "Servidor Django iniciado (PID: $BACKEND_PID)"
    mostrar_backend "📝 Logs: $LOG_DIR/backend.log"
    
    cd ..
}

# Función para iniciar frontend React
iniciar_frontend() {
    mostrar_frontend "⚛️ Iniciando servidor React en puerto $FRONTEND_PORT..."
    
    cd frontend
    
    # Verificar que las dependencias estén instaladas
    if [ ! -d "node_modules" ]; then
        mostrar_error "Dependencias Node.js no instaladas"
        exit 1
    fi
    
    # Configurar variables de entorno para React
    export VITE_API_URL="http://localhost:$BACKEND_PORT"
    export VITE_ENVIRONMENT="development"
    
    # Iniciar servidor React en segundo plano
    nohup npm run dev -- --port $FRONTEND_PORT --host 0.0.0.0 > "../$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    
    # Guardar PID del frontend
    echo $FRONTEND_PID > "../$LOG_DIR/frontend.pid"
    
    mostrar_frontend "Servidor React iniciado (PID: $FRONTEND_PID)"
    mostrar_frontend "📝 Logs: $LOG_DIR/frontend.log"
    
    cd ..
}

# Función para esperar que los servidores estén listos
esperar_servidores() {
    mostrar_mensaje "⏳ Esperando que los servidores estén listos..."
    
    # Esperar backend Django
    local contador=0
    while [ $contador -lt 30 ]; do
        if curl -s "http://localhost:$BACKEND_PORT/" &>/dev/null; then
            mostrar_backend "✅ Backend listo en http://localhost:$BACKEND_PORT"
            break
        fi
        sleep 2
        ((contador++))
    done
    
    # Esperar frontend React
    contador=0
    while [ $contador -lt 30 ]; do
        if curl -s "http://localhost:$FRONTEND_PORT/" &>/dev/null; then
            mostrar_frontend "✅ Frontend listo en http://localhost:$FRONTEND_PORT"
            break
        fi
        sleep 2
        ((contador++))
    done
}

# Función para mostrar información del sistema
mostrar_informacion() {
    echo ""
    mostrar_mensaje "🎉 ¡FELICITAFAC está ejecutándose!"
    echo ""
    echo "📊 INFORMACIÓN DEL SISTEMA:"
    echo "   🏠 Proyecto: FELICITAFAC - Sistema de Facturación Electrónica"
    echo "   📍 Directorio: $(pwd)"
    echo "   🕒 Iniciado: $(date '+%d/%m/%Y %H:%M:%S')"
    echo ""
    echo "🌐 SERVICIOS DISPONIBLES:"
    echo "   🎯 Frontend React:     http://localhost:$FRONTEND_PORT"
    echo "   🐍 Backend Django:     http://localhost:$BACKEND_PORT"
    echo "   🔧 Admin Django:       http://localhost:$BACKEND_PORT/admin"
    echo "   📚 API Documentation: http://localhost:$BACKEND_PORT/api/docs"
    echo ""
    echo "📝 LOGS:"
    echo "   📄 Backend:  tail -f $LOG_DIR/backend.log"
    echo "   📄 Frontend: tail -f $LOG_DIR/frontend.log"
    echo ""
    echo "🛑 PARA DETENER:"
    echo "   ./scripts/detener-desarrollo.sh"
    echo "   o presiona Ctrl+C"
    echo ""
    
    # Mostrar información de base de datos si está disponible
    if [ -n "$DB_NAME" ]; then
        echo "📊 BASE DE DATOS:"
        echo "   🏠 Host: ${DB_HOST:-localhost}:${DB_PORT:-3306}"
        echo "   📊 Base de datos: $DB_NAME"
        echo "   👤 Usuario: ${DB_USER:-root}"
        echo ""
    fi
}

# Función para monitorear procesos
monitorear_procesos() {
    mostrar_mensaje "👀 Monitoreando procesos... (Ctrl+C para detener)"
    
    # Función de limpieza para cuando se termine el script
    cleanup() {
        echo ""
        mostrar_mensaje "🛑 Deteniendo servicios..."
        
        # Leer PIDs y terminar procesos
        if [ -f "$LOG_DIR/backend.pid" ]; then
            BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
            if kill -0 $BACKEND_PID 2>/dev/null; then
                kill $BACKEND_PID
                mostrar_backend "Backend detenido"
            fi
            rm -f "$LOG_DIR/backend.pid"
        fi
        
        if [ -f "$LOG_DIR/frontend.pid" ]; then
            FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
            if kill -0 $FRONTEND_PID 2>/dev/null; then
                kill $FRONTEND_PID
                mostrar_frontend "Frontend detenido"
            fi
            rm -f "$LOG_DIR/frontend.pid"
        fi
        
        mostrar_mensaje "✅ Servicios detenidos correctamente"
        exit 0
    }
    
    # Configurar trap para cleanup
    trap cleanup SIGINT SIGTERM
    
    # Monitorear procesos cada 5 segundos
    while true; do
        sleep 5
        
        # Verificar si los procesos siguen ejecutándose
        if [ -f "$LOG_DIR/backend.pid" ]; then
            BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
            if ! kill -0 $BACKEND_PID 2>/dev/null; then
                mostrar_error "Backend se detuvo inesperadamente"
                mostrar_mensaje "📝 Revisa los logs: tail -f $LOG_DIR/backend.log"
                break
            fi
        fi
        
        if [ -f "$LOG_DIR/frontend.pid" ]; then
            FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
            if ! kill -0 $FRONTEND_PID 2>/dev/null; then
                mostrar_error "Frontend se detuvo inesperadamente"
                mostrar_mensaje "📝 Revisa los logs: tail -f $LOG_DIR/frontend.log"
                break
            fi
        fi
    done
}

# Función principal
main() {
    mostrar_mensaje "=== INICIANDO DESARROLLO FELICITAFAC ==="
    echo ""
    
    # 1. Verificar dependencias
    verificar_dependencias
    
    # 2. Verificar entorno virtual
    verificar_entorno_virtual
    
    # 3. Verificar node_modules
    verificar_node_modules
    
    # 4. Verificar MySQL
    verificar_mysql
    
    # 5. Verificar migraciones
    verificar_migraciones
    
    # 6. Limpiar logs antiguos
    limpiar_logs
    
    # 7. Iniciar backend
    iniciar_backend
    
    # 8. Iniciar frontend
    iniciar_frontend
    
    # 9. Esperar que los servidores estén listos
    esperar_servidores
    
    # 10. Mostrar información
    mostrar_informacion
    
    # 11. Monitorear procesos
    monitorear_procesos
}

# Verificar argumentos de línea de comandos
case "${1:-}" in
    --help|-h)
        echo "FELICITAFAC - Script de inicio de desarrollo"
        echo ""
        echo "Uso: $0 [opciones]"
        echo ""
        echo "Opciones:"
        echo "  --help, -h     Mostrar esta ayuda"
        echo "  --backend-only Iniciar solo el backend Django"
        echo "  --frontend-only Iniciar solo el frontend React"
        echo ""
        echo "Variables de entorno:"
        echo "  BACKEND_PORT   Puerto para Django (default: 8000)"
        echo "  FRONTEND_PORT  Puerto para React (default: 3000)"
        echo ""
        exit 0
        ;;
    --backend-only)
        mostrar_mensaje "🐍 Iniciando solo el backend Django..."
        verificar_dependencias
        verificar_entorno_virtual
        verificar_mysql
        verificar_migraciones
        iniciar_backend
        mostrar_backend "✅ Backend ejecutándose en http://localhost:$BACKEND_PORT"
        mostrar_backend "📝 Logs: tail -f $LOG_DIR/backend.log"
        mostrar_backend "🛑 Detener: kill $(cat $LOG_DIR/backend.pid)"
        exit 0
        ;;
    --frontend-only)
        mostrar_mensaje "⚛️ Iniciando solo el frontend React..."
        verificar_dependencias
        verificar_node_modules
        iniciar_frontend
        mostrar_frontend "✅ Frontend ejecutándose en http://localhost:$FRONTEND_PORT"
        mostrar_frontend "📝 Logs: tail -f $LOG_DIR/frontend.log"
        mostrar_frontend "🛑 Detener: kill $(cat $LOG_DIR/frontend.pid)"
        exit 0
        ;;
esac

# Ejecutar función principal
main "$@"