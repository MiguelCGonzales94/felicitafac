#!/bin/bash

# FELICITAFAC - Script para Detener Desarrollo
# Sistema de Facturación Electrónica para Perú

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Verificar directorio
if [ ! -f "README.md" ] || [ ! -d "backend" ]; then
    mostrar_error "Ejecutar desde la carpeta raíz de FELICITAFAC"
    exit 1
fi

LOG_DIR="logs"

mostrar_mensaje "🛑 Deteniendo servicios de desarrollo FELICITAFAC"

# Detener backend Django
if [ -f "$LOG_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        mostrar_exito "Backend Django detenido (PID: $BACKEND_PID)"
    else
        mostrar_advertencia "Backend ya estaba detenido"
    fi
    rm -f "$LOG_DIR/backend.pid"
else
    mostrar_advertencia "No se encontró PID del backend"
fi

# Detener frontend React
if [ -f "$LOG_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        mostrar_exito "Frontend React detenido (PID: $FRONTEND_PID)"
    else
        mostrar_advertencia "Frontend ya estaba detenido"
    fi
    rm -f "$LOG_DIR/frontend.pid"
else
    mostrar_advertencia "No se encontró PID del frontend"
fi

# Limpiar procesos huérfanos
pkill -f "python.*manage.py.*runserver" 2>/dev/null || true
pkill -f "npm.*run.*dev" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true

mostrar_exito "✅ Servicios de FELICITAFAC detenidos correctamente"
echo ""
mostrar_mensaje "💡 Para volver a iniciar: ./scripts/iniciar-desarrollo.sh"