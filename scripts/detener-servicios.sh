#!/bin/bash

# ================================================================
# FELICITAFAC - Script para Detener Servicios
# Detiene Django y React de manera segura
# ================================================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

PROJECT_DIR="$(pwd)"
LOGS_DIR="$PROJECT_DIR/logs"

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

echo ""
mostrar_mensaje "🛑 Deteniendo servicios FELICITAFAC..."
echo ""

# Detener Django
if [ -f "$LOGS_DIR/django.pid" ]; then
    DJANGO_PID=$(cat "$LOGS_DIR/django.pid")
    if kill -0 "$DJANGO_PID" 2>/dev/null; then
        kill "$DJANGO_PID"
        mostrar_exito "Django detenido (PID: $DJANGO_PID)"
    else
        mostrar_advertencia "Django ya no estaba corriendo"
    fi
    rm -f "$LOGS_DIR/django.pid"
else
    # Buscar proceso Django por puerto
    DJANGO_PID=$(lsof -t -i:8000 2>/dev/null)
    if [ ! -z "$DJANGO_PID" ]; then
        kill "$DJANGO_PID"
        mostrar_exito "Django detenido (Puerto 8000)"
    else
        mostrar_advertencia "Django no encontrado en puerto 8000"
    fi
fi

# Detener React
if [ -f "$LOGS_DIR/react.pid" ]; then
    REACT_PID=$(cat "$LOGS_DIR/react.pid")
    if kill -0 "$REACT_PID" 2>/dev/null; then
        kill "$REACT_PID"
        mostrar_exito "React detenido (PID: $REACT_PID)"
    else
        mostrar_advertencia "React ya no estaba corriendo"
    fi
    rm -f "$LOGS_DIR/react.pid"
else
    # Buscar proceso React por puerto
    REACT_PID=$(lsof -t -i:5173 2>/dev/null)
    if [ ! -z "$REACT_PID" ]; then
        kill "$REACT_PID"
        mostrar_exito "React detenido (Puerto 5173)"
    else
        mostrar_advertencia "React no encontrado en puerto 5173"
    fi
fi

# Detener cualquier proceso de desarrollo
pkill -f "python.*manage.py.*runserver" 2>/dev/null && mostrar_exito "Procesos Django adicionales detenidos"
pkill -f "npm.*run.*dev" 2>/dev/null && mostrar_exito "Procesos React adicionales detenidos"
pkill -f "node.*vite" 2>/dev/null && mostrar_exito "Procesos Vite adicionales detenidos"

echo ""
mostrar_mensaje "✅ Todos los servicios han sido detenidos"
mostrar_mensaje "Para reiniciar: ./scripts/levantar-fase3.sh"
echo ""