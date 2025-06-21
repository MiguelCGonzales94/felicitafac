#!/bin/bash

# FELICITAFAC - Script para Diagnosticar Error 500
# Identifica y resuelve errores internos del servidor Django

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

mostrar_mensaje() {
    echo -e "${BLUE}[FELICITAFAC]${NC} $1"
}

mostrar_exito() {
    echo -e "${GREEN}[ÉXITO]${NC} $1"
}

mostrar_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

mostrar_advertencia() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

mostrar_diagnostico() {
    echo -e "${PURPLE}[DIAGNÓSTICO]${NC} $1"
}

echo ""
echo "🔍 FELICITAFAC - Diagnóstico Error 500"
echo "====================================="
echo ""

# Verificar directorio
if [ ! -f "README.md" ] || [ ! -d "backend" ]; then
    mostrar_error "Ejecutar desde la carpeta raíz de FELICITAFAC"
    exit 1
fi

mostrar_mensaje "🔍 Analizando error 500 en backend Django..."
echo ""

# 1. Verificar logs del backend
mostrar_diagnostico "📋 Revisando logs del backend..."

if [ -f "logs/backend.log" ]; then
    echo ""
    echo "🔍 ÚLTIMAS LÍNEAS DEL LOG:"
    echo "=========================="
    tail -20 logs/backend.log
    echo ""
    
    # Buscar errores específicos
    if grep -q "ImportError\|ModuleNotFoundError\|SyntaxError" logs/backend.log; then
        mostrar_error "❌ Errores de importación detectados en logs"
        echo ""
        echo "Errores encontrados:"
        grep -n "ImportError\|ModuleNotFoundError\|SyntaxError" logs/backend.log | tail -5
    fi
    
    if grep -q "django.db.utils" logs/backend.log; then
        mostrar_error "❌ Errores de base de datos detectados"
        echo ""
        echo "Errores de BD encontrados:"
        grep -n "django.db.utils" logs/backend.log | tail -3
    fi
else
    mostrar_advertencia "No se encontró archivo de log del backend"
fi

echo ""

# 2. Verificar estado del proceso Django
mostrar_diagnostico "🔍 Verificando proceso Django..."

if pgrep -f "manage.py runserver" > /dev/null; then
    PID=$(pgrep -f "manage.py runserver")
    mostrar_exito "✅ Proceso Django ejecutándose (PID: $PID)"
else
    mostrar_error "❌ Proceso Django no encontrado"
    echo ""
    echo "💡 SOLUCIÓN RÁPIDA:"
    echo "   cd backend && python manage.py runserver"
    exit 1
fi

# 3. Probar endpoint directamente
mostrar_diagnostico "🌐 Probando endpoint /api/ directamente..."

echo ""
echo "Respuesta del servidor:"
echo "======================="

# Probar con curl verbose para ver headers
HTTP_RESPONSE=$(curl -s -w "%{http_code}" -o response.tmp http://localhost:8000/api/ 2>/dev/null || echo "000")

if [ "$HTTP_RESPONSE" = "200" ]; then
    mostrar_exito "✅ Endpoint /api/ responde correctamente (200)"
    echo "Contenido de la respuesta:"
    cat response.tmp | jq . 2>/dev/null || cat response.tmp
elif [ "$HTTP_RESPONSE" = "500" ]; then
    mostrar_error "❌ Error 500 confirmado en /api/"
    echo ""
    echo "Respuesta del servidor:"
    cat response.tmp
    echo ""
    
    # Probar endpoint de health check
    echo "Probando endpoint alternativo /health/..."
    HTTP_HEALTH=$(curl -s -w "%{http_code}" -o health.tmp http://localhost:8000/health/ 2>/dev/null || echo "000")
    
    if [ "$HTTP_HEALTH" = "200" ]; then
        mostrar_exito "✅ Endpoint /health/ funciona correctamente"
        cat health.tmp | jq . 2>/dev/null || cat health.tmp
    else
        mostrar_error "❌ Endpoint /health/ también falla ($HTTP_HEALTH)"
    fi
elif [ "$HTTP_RESPONSE" = "000" ]; then
    mostrar_error "❌ No se pudo conectar al servidor Django"
    echo "Verifica que Django esté ejecutándose en puerto 8000"
else
    mostrar_advertencia "⚠️ Respuesta inesperada: $HTTP_RESPONSE"
    cat response.tmp
fi

# Limpiar archivos temporales
rm -f response.tmp health.tmp

echo ""

# 4. Verificar configuración Django
mostrar_diagnostico "🔧 Verificando configuración Django..."

cd backend

# Activar entorno virtual
if [ -d "venv" ]; then
    source venv/bin/activate
fi

echo ""
echo "🔍 VERIFICACIÓN DE CONFIGURACIÓN:"
echo "================================="

# Check básico de Django
if python manage.py check --quiet 2>/dev/null; then
    mostrar_exito "✅ Configuración Django básica correcta"
else
    mostrar_error "❌ Problemas en configuración Django"
    echo ""
    echo "Detalles del problema:"
    python manage.py check
    cd ..
    exit 1
fi

# Verificar conexión a base de datos
echo ""
echo "Probando conexión a MySQL..."
if python -c "
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configuracion.settings.local')
django.setup()
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT 1')
print('✅ Conexión MySQL exitosa')
" 2>/dev/null; then
    mostrar_exito "✅ Conexión a MySQL funcionando"
else
    mostrar_error "❌ Error de conexión a MySQL"
    echo ""
    echo "💡 Verifica configuración de base de datos en .env"
fi

# Verificar migraciones
echo ""
echo "Verificando migraciones..."
PENDING_MIGRATIONS=$(python manage.py showmigrations --plan | grep "\[ \]" | wc -l)

if [ "$PENDING_MIGRATIONS" -gt 0 ]; then
    mostrar_advertencia "⚠️ Hay $PENDING_MIGRATIONS migraciones pendientes"
    echo ""
    echo "💡 Ejecuta: python manage.py migrate"
else
    mostrar_exito "✅ Migraciones actualizadas"
fi

cd ..

echo ""

# 5. Soluciones automáticas
mostrar_mensaje "🔧 APLICANDO SOLUCIONES AUTOMÁTICAS..."
echo ""

# Solución 1: Reiniciar servidor Django
mostrar_diagnostico "🔄 Reiniciando servidor Django..."

# Detener proceso Django
pkill -f "manage.py runserver" 2>/dev/null || true
sleep 2

# Iniciar Django nuevamente
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
fi

echo ""
echo "Iniciando Django con logs visibles..."
echo "Presiona Ctrl+C para detener los logs y continuar"
echo ""

# Iniciar Django en primer plano temporalmente para ver errores
timeout 10 python manage.py runserver 0.0.0.0:8000 2>&1 || true

echo ""
echo "Iniciando Django en segundo plano..."

# Crear directorio de logs
mkdir -p ../logs

# Iniciar en background
nohup python manage.py runserver 0.0.0.0:8000 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

echo $BACKEND_PID > ../logs/backend.pid

cd ..

# Esperar a que Django esté listo
echo ""
mostrar_diagnostico "⏳ Esperando que Django esté listo..."

contador=0
while [ $contador -lt 15 ]; do
    if curl -s http://localhost:8000/api/ > /dev/null 2>&1; then
        mostrar_exito "✅ Django reiniciado exitosamente"
        break
    fi
    echo -n "."
    sleep 2
    ((contador++))
done

if [ $contador -eq 15 ]; then
    mostrar_error "❌ Django no respondió después del reinicio"
    echo ""
    echo "📋 Logs del servidor:"
    tail -20 logs/backend.log
    exit 1
fi

echo ""

# 6. Verificación final
mostrar_mensaje "✅ VERIFICACIÓN FINAL"
echo ""

# Probar endpoint final
FINAL_TEST=$(curl -s -w "%{http_code}" http://localhost:8000/api/ 2>/dev/null)

if echo "$FINAL_TEST" | grep -q "200"; then
    mostrar_exito "🎉 ¡Error 500 RESUELTO!"
    echo ""
    echo "✅ Backend Django funcionando correctamente"
    echo "✅ Endpoint /api/ respondiendo JSON válido"
    echo ""
    echo "🌐 Prueba ahora en el navegador: http://localhost:3000"
    echo ""
    echo "📋 Deberías ver:"
    echo "   ✅ Backend conectado: ¡Bienvenido a FELICITAFAC API!"
    echo "   ✅ Sin errores en la consola"
    
else
    mostrar_error "❌ El error 500 persiste"
    echo ""
    echo "📋 PASOS MANUALES:"
    echo ""
    echo "1. 📝 Revisar logs detallados:"
    echo "   tail -f logs/backend.log"
    echo ""
    echo "2. 🔧 Probar configuración:"
    echo "   cd backend && python manage.py shell"
    echo ""
    echo "3. 🗄️ Verificar MySQL:"
    echo "   mysql -u root -p felicitafac_local"
    echo ""
    echo "4. 🆘 Si persiste, contactar soporte técnico"
fi

echo ""
echo "📋 URLs DE VERIFICACIÓN:"
echo "========================"
echo "🏠 Frontend: http://localhost:3000"
echo "🔧 API: http://localhost:8000/api/"
echo "💓 Health: http://localhost:8000/health/"
echo "👨‍💼 Admin: http://localhost:8000/admin/"
echo ""

echo "📝 LOGS EN TIEMPO REAL:"
echo "======================="
echo "Backend: tail -f logs/backend.log"
echo "Frontend: tail -f logs/frontend.log"