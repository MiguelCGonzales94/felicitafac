#!/bin/bash

# ================================================================
# FELICITAFAC - Script para Verificar Estado del Sistema
# Verifica que todos los componentes estén funcionando
# ================================================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # Sin color

PROJECT_DIR="$(pwd)"
LOGS_DIR="$PROJECT_DIR/logs"

mostrar_titulo() {
    echo -e "${CYAN}$1${NC}"
    echo "=================================================="
}

mostrar_ok() {
    echo -e "${GREEN}✅ $1${NC}"
}

mostrar_error() {
    echo -e "${RED}❌ $1${NC}"
}

mostrar_advertencia() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

mostrar_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

clear
echo -e "${BLUE}"
echo "=================================================================="
echo "  📊 FELICITAFAC - VERIFICACIÓN DE ESTADO"
echo "  Sistema de Facturación Electrónica para Perú"
echo "=================================================================="
echo -e "${NC}"
echo ""

# Verificar estructura del proyecto
mostrar_titulo "🏗️ Estructura del Proyecto"
if [ -f "README.md" ] && [ -d "backend" ] && [ -d "frontend" ]; then
    mostrar_ok "Estructura del proyecto correcta"
else
    mostrar_error "Estructura del proyecto incorrecta"
fi

if [ -f "backend/manage.py" ]; then
    mostrar_ok "Django manage.py encontrado"
else
    mostrar_error "Django manage.py no encontrado"
fi

if [ -f "frontend/package.json" ]; then
    mostrar_ok "Frontend package.json encontrado"
else
    mostrar_error "Frontend package.json no encontrado"
fi

echo ""

# Verificar servicios corriendo
mostrar_titulo "🚀 Estado de Servicios"

# Django
if curl -s http://localhost:8000/api/ &>/dev/null; then
    mostrar_ok "Django corriendo en puerto 8000"
    
    # Verificar API específicas
    if curl -s http://localhost:8000/api/usuarios/ &>/dev/null; then
        mostrar_ok "API de usuarios accesible"
    else
        mostrar_advertencia "API de usuarios no accesible"
    fi
    
    if curl -s http://localhost:8000/api/clientes/ &>/dev/null; then
        mostrar_ok "API de clientes accesible"
    else
        mostrar_advertencia "API de clientes no accesible"
    fi
    
    if curl -s http://localhost:8000/api/productos/ &>/dev/null; then
        mostrar_ok "API de productos accesible"
    else
        mostrar_advertencia "API de productos no accesible"
    fi
    
    if curl -s http://localhost:8000/api/facturacion/facturas/ &>/dev/null; then
        mostrar_ok "API de facturación accesible"
    else
        mostrar_advertencia "API de facturación no accesible"
    fi
    
else
    mostrar_error "Django no está corriendo en puerto 8000"
fi

# React
if curl -s http://localhost:5173 &>/dev/null; then
    mostrar_ok "React corriendo en puerto 5173"
else
    mostrar_error "React no está corriendo en puerto 5173"
fi

echo ""

# Verificar base de datos
mostrar_titulo "🗄️ Estado de Base de Datos"

# Cargar variables de entorno
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
    DB_NAME=${DB_NAME:-"felicitafac_fase3"}
    DB_USER=${DB_USER:-"root"}
    DB_HOST=${DB_HOST:-"localhost"}
    DB_PORT=${DB_PORT:-"3306"}
else
    DB_NAME="felicitafac_fase3"
    DB_USER="root"
    DB_HOST="localhost"
    DB_PORT="3306"
fi

# Verificar conexión MySQL
if mysqladmin -h"$DB_HOST" -P"$DB_PORT" ping &>/dev/null; then
    mostrar_ok "MySQL servidor corriendo"
    
    # Verificar base de datos específica
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -e "USE \`$DB_NAME\`;" &>/dev/null; then
        mostrar_ok "Base de datos '$DB_NAME' accesible"
        
        # Contar tablas
        table_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | wc -l)
        if [ $table_count -gt 20 ]; then
            mostrar_ok "Tablas de la aplicación: $(($table_count - 1))"
        else
            mostrar_advertencia "Pocas tablas detectadas: $(($table_count - 1))"
        fi
        
        # Verificar usuarios
        user_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" "$DB_NAME" -e "SELECT COUNT(*) FROM aplicaciones_usuarios_usuario;" 2>/dev/null | tail -1)
        if [ "$user_count" -gt 0 ]; then
            mostrar_ok "Usuarios en sistema: $user_count"
        else
            mostrar_advertencia "No hay usuarios en el sistema"
        fi
        
    else
        mostrar_error "No se puede acceder a la base de datos '$DB_NAME'"
    fi
else
    mostrar_error "MySQL no está corriendo"
fi

echo ""

# Verificar archivos de configuración
mostrar_titulo "⚙️ Archivos de Configuración"

if [ -f ".env" ]; then
    mostrar_ok "Archivo .env principal encontrado"
else
    mostrar_advertencia "Archivo .env principal no encontrado"
fi

if [ -f "backend/.env" ]; then
    mostrar_ok "Archivo .env de backend encontrado"
else
    mostrar_advertencia "Archivo .env de backend no encontrado"
fi

if [ -f "frontend/.env.local" ]; then
    mostrar_ok "Archivo .env.local de frontend encontrado"
else
    mostrar_advertencia "Archivo .env.local de frontend no encontrado"
fi

echo ""

# Verificar dependencias
mostrar_titulo "📦 Dependencias"

# Python virtual environment
if [ -d "backend/venv" ]; then
    mostrar_ok "Entorno virtual Python existe"
    
    cd backend
    source venv/bin/activate
    
    if pip show django &>/dev/null; then
        django_version=$(pip show django | grep Version | cut -d' ' -f2)
        mostrar_ok "Django instalado: v$django_version"
    else
        mostrar_error "Django no instalado"
    fi
    
    if pip show djangorestframework &>/dev/null; then
        mostrar_ok "Django REST Framework instalado"
    else
        mostrar_error "Django REST Framework no instalado"
    fi
    
    if pip show mysqlclient &>/dev/null; then
        mostrar_ok "MySQL client instalado"
    else
        mostrar_error "MySQL client no instalado"
    fi
    
    cd ..
else
    mostrar_error "Entorno virtual Python no existe"
fi

# Node.js dependencies
if [ -d "frontend/node_modules" ]; then
    mostrar_ok "Dependencias Node.js instaladas"
    
    cd frontend
    
    if [ -f "node_modules/react/package.json" ]; then
        react_version=$(grep '"version"' node_modules/react/package.json | cut -d'"' -f4)
        mostrar_ok "React instalado: v$react_version"
    else
        mostrar_error "React no instalado"
    fi
    
    if [ -f "node_modules/vite/package.json" ]; then
        mostrar_ok "Vite instalado"
    else
        mostrar_error "Vite no instalado"
    fi
    
    cd ..
else
    mostrar_error "Dependencias Node.js no instaladas"
fi

echo ""

# Verificar logs
mostrar_titulo "📄 Logs y Procesos"

if [ -d "$LOGS_DIR" ]; then
    mostrar_ok "Directorio de logs existe"
    
    if [ -f "$LOGS_DIR/django.log" ]; then
        log_size=$(wc -l < "$LOGS_DIR/django.log")
        mostrar_info "Log Django: $log_size líneas"
    fi
    
    if [ -f "$LOGS_DIR/react.log" ]; then
        log_size=$(wc -l < "$LOGS_DIR/react.log")
        mostrar_info "Log React: $log_size líneas"
    fi
    
    if [ -f "$LOGS_DIR/django.pid" ]; then
        pid=$(cat "$LOGS_DIR/django.pid")
        if kill -0 "$pid" 2>/dev/null; then
            mostrar_ok "Proceso Django activo (PID: $pid)"
        else
            mostrar_advertencia "PID Django almacenado pero proceso no activo"
        fi
    fi
    
    if [ -f "$LOGS_DIR/react.pid" ]; then
        pid=$(cat "$LOGS_DIR/react.pid")
        if kill -0 "$pid" 2>/dev/null; then
            mostrar_ok "Proceso React activo (PID: $pid)"
        else
            mostrar_advertencia "PID React almacenado pero proceso no activo"
        fi
    fi
else
    mostrar_advertencia "Directorio de logs no existe"
fi

echo ""

# Verificar puertos
mostrar_titulo "🌐 Puertos y Conectividad"

if lsof -i :8000 &>/dev/null; then
    proceso=$(lsof -i :8000 | tail -1 | awk '{print $1}')
    mostrar_ok "Puerto 8000 en uso por: $proceso"
else
    mostrar_advertencia "Puerto 8000 libre"
fi

if lsof -i :5173 &>/dev/null; then
    proceso=$(lsof -i :5173 | tail -1 | awk '{print $1}')
    mostrar_ok "Puerto 5173 en uso por: $proceso"
else
    mostrar_advertencia "Puerto 5173 libre"
fi

if lsof -i :3306 &>/dev/null; then
    mostrar_ok "Puerto 3306 (MySQL) en uso"
else
    mostrar_error "Puerto 3306 (MySQL) libre - MySQL no corriendo"
fi

echo ""

# Resumen final
mostrar_titulo "📊 Resumen del Estado"

# Calcular estado general
servicios_ok=0
servicios_total=4

# Verificar Django
if curl -s http://localhost:8000/api/ &>/dev/null; then
    servicios_ok=$((servicios_ok + 1))
fi

# Verificar React
if curl -s http://localhost:5173 &>/dev/null; then
    servicios_ok=$((servicios_ok + 1))
fi

# Verificar MySQL
if mysqladmin -h"$DB_HOST" -P"$DB_PORT" ping &>/dev/null; then
    servicios_ok=$((servicios_ok + 1))
fi

# Verificar base de datos
if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -e "USE \`$DB_NAME\`;" &>/dev/null; then
    servicios_ok=$((servicios_ok + 1))
fi

porcentaje=$((servicios_ok * 100 / servicios_total))

if [ $porcentaje -eq 100 ]; then
    echo -e "${GREEN}🎉 SISTEMA FUNCIONANDO PERFECTAMENTE${NC}"
    echo -e "${GREEN}Todos los servicios están operativos ($servicios_ok/$servicios_total)${NC}"
elif [ $porcentaje -ge 75 ]; then
    echo -e "${YELLOW}⚠️  SISTEMA FUNCIONANDO CON ADVERTENCIAS${NC}"
    echo -e "${YELLOW}Servicios operativos: $servicios_ok/$servicios_total ($porcentaje%)${NC}"
    echo -e "${YELLOW}Revisar advertencias arriba${NC}"
else
    echo -e "${RED}❌ SISTEMA CON PROBLEMAS CRÍTICOS${NC}"
    echo -e "${RED}Servicios operativos: $servicios_ok/$servicios_total ($porcentaje%)${NC}"
    echo -e "${RED}Revisar errores arriba${NC}"
fi

echo ""
echo -e "${CYAN}🔧 COMANDOS ÚTILES:${NC}"
echo "=================================="
echo -e "🚀 Levantar sistema:   ${BLUE}./scripts/levantar-fase3.sh${NC}"
echo -e "🛑 Detener servicios:  ${BLUE}./scripts/detener-servicios.sh${NC}"
echo -e "📊 Ver logs Django:    ${BLUE}tail -f logs/django.log${NC}"
echo -e "📊 Ver logs React:     ${BLUE}tail -f logs/react.log${NC}"
echo -e "🔄 Verificar estado:   ${BLUE}./scripts/verificar-estado.sh${NC}"
echo ""

if [ $porcentaje -eq 100 ]; then
    echo -e "${GREEN}✅ FELICITAFAC Fase 3 funcionando correctamente${NC}"
    echo -e "${CYAN}🌐 Frontend: http://localhost:5173${NC}"
    echo -e "${CYAN}🔧 Backend:  http://localhost:8000${NC}"
else
    echo -e "${YELLOW}💡 Para solucionar problemas, ejecuta: ./scripts/levantar-fase3.sh${NC}"
fi

echo ""