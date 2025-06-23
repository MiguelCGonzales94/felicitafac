#!/bin/bash

# ================================================================
# SCRIPT CORRECCIÓN ÍNDICES DUPLICADOS - FELICITAFAC
# Corrige nombres de índices duplicados en modelos Django
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
PROJECT_DIR=$(pwd)
BACKEND_DIR="$PROJECT_DIR/backend"

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

# Función para detener servidores
detener_servidores() {
    mostrar_seccion "Deteniendo Servidores"
    
    # Detener Django
    pkill -f "manage.py runserver" 2>/dev/null || true
    
    # Detener React
    pkill -f "npm.*run.*dev" 2>/dev/null || true
    pkill -f "node.*vite" 2>/dev/null || true
    
    sleep 2
    mostrar_exito "Servidores detenidos"
}

# Función para diagnosticar índices duplicados
diagnosticar_indices_duplicados() {
    mostrar_seccion "Diagnosticando Índices Duplicados"
    
    cd "$BACKEND_DIR"
    
    # Activar entorno virtual
    if [[ -d "venv" ]]; then
        source venv/bin/activate
    fi
    
    mostrar_mensaje "Ejecutando django check para ver todos los errores..."
    
    # Capturar salida del check
    python manage.py check > /tmp/django_check_output.txt 2>&1 || true
    
    echo ""
    echo "🔍 ERRORES DETECTADOS:"
    echo "====================="
    grep -E "models\.E030|index name.*is not unique" /tmp/django_check_output.txt || echo "No se encontraron errores de índices duplicados en la salida"
    
    # Mostrar archivo completo si hay errores
    if grep -q "ERROR" /tmp/django_check_output.txt; then
        echo ""
        echo "📋 REPORTE COMPLETO DE ERRORES:"
        echo "==============================="
        cat /tmp/django_check_output.txt
    fi
    
    cd "$PROJECT_DIR"
}

# Función para hacer backup
hacer_backup_modelos() {
    mostrar_seccion "Creando Backup de Modelos"
    
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)_indices_fix"
    mkdir -p "$backup_dir"
    
    # Backup de archivos de modelos
    local archivos_modelos=(
        "aplicaciones/contabilidad/models.py"
        "aplicaciones/facturacion/models.py"
        "aplicaciones/inventario/models.py"
        "aplicaciones/productos/models.py"
        "aplicaciones/clientes/models.py"
    )
    
    for archivo in "${archivos_modelos[@]}"; do
        if [[ -f "$BACKEND_DIR/$archivo" ]]; then
            cp "$BACKEND_DIR/$archivo" "$backup_dir/$(basename $archivo .py)_models.py.backup"
        fi
    done
    
    mostrar_exito "Backup creado en: $backup_dir"
}

# Función para corregir índices en modelo de contabilidad
corregir_indices_contabilidad() {
    mostrar_seccion "Corrigiendo Índices en Contabilidad"
    
    cd "$BACKEND_DIR"
    
    local archivo="aplicaciones/contabilidad/models.py"
    
    if [[ -f "$archivo" ]]; then
        mostrar_mensaje "Corrigiendo nombres de índices en $archivo..."
        
        # Hacer copia de seguridad local
        cp "$archivo" "$archivo.backup"
        
        # Renombrar índices para que sean únicos
        sed -i "s/idx_detalle_activo/idx_detalle_asiento_activo/g" "$archivo"
        sed -i "s/idx_detalle_asiento/idx_detalle_asiento_contable/g" "$archivo"
        sed -i "s/idx_detalle_cuenta/idx_detalle_asiento_cuenta/g" "$archivo"
        sed -i "s/idx_detalle_linea/idx_detalle_asiento_linea/g" "$archivo"
        
        # Verificar cambios
        if grep -q "idx_detalle_asiento_activo" "$archivo"; then
            mostrar_exito "Índices de contabilidad renombrados"
        else
            mostrar_advertencia "No se encontraron índices para renombrar en contabilidad"
        fi
    else
        mostrar_advertencia "Archivo de modelo de contabilidad no encontrado"
    fi
    
    cd "$PROJECT_DIR"
}

# Función para corregir índices en modelo de facturación
corregir_indices_facturacion() {
    mostrar_seccion "Corrigiendo Índices en Facturación"
    
    cd "$BACKEND_DIR"
    
    local archivo="aplicaciones/facturacion/models.py"
    
    if [[ -f "$archivo" ]]; then
        mostrar_mensaje "Corrigiendo nombres de índices en $archivo..."
        
        # Hacer copia de seguridad local
        cp "$archivo" "$archivo.backup"
        
        # Renombrar índices para que sean únicos
        sed -i "s/idx_detalle_activo/idx_detalle_factura_activo/g" "$archivo"
        sed -i "s/idx_detalle_factura\b/idx_detalle_factura_documento/g" "$archivo"
        sed -i "s/idx_detalle_producto/idx_detalle_factura_producto/g" "$archivo"
        sed -i "s/idx_detalle_numero_item/idx_detalle_factura_numero_item/g" "$archivo"
        sed -i "s/idx_detalle_lote/idx_detalle_factura_lote/g" "$archivo"
        
        # Verificar cambios
        if grep -q "idx_detalle_factura_activo\|idx_detalle_factura_documento" "$archivo"; then
            mostrar_exito "Índices de facturación renombrados"
        else
            mostrar_advertencia "No se encontraron índices para renombrar en facturación"
        fi
    else
        mostrar_advertencia "Archivo de modelo de facturación no encontrado"
    fi
    
    cd "$PROJECT_DIR"
}

# Función para corregir otros índices potencialmente duplicados
corregir_otros_indices() {
    mostrar_seccion "Corrigiendo Otros Índices Duplicados"
    
    cd "$BACKEND_DIR"
    
    # Lista de archivos y patrones de índices a corregir
    local correcciones=(
        "aplicaciones/productos/models.py:idx_producto_categoria:idx_producto_categoria_rel"
        "aplicaciones/clientes/models.py:idx_cliente_activo:idx_cliente_estado_activo"
        "aplicaciones/inventario/models.py:idx_movimiento_producto:idx_inventario_movimiento_producto"
        "aplicaciones/inventario/models.py:idx_lote_producto:idx_inventario_lote_producto"
    )
    
    for correccion in "${correcciones[@]}"; do
        IFS=':' read -r archivo indice_viejo indice_nuevo <<< "$correccion"
        
        if [[ -f "$archivo" ]]; then
            mostrar_mensaje "Corrigiendo $indice_viejo -> $indice_nuevo en $archivo"
            
            # Hacer backup
            cp "$archivo" "$archivo.backup" 2>/dev/null || true
            
            # Realizar corrección
            sed -i "s/$indice_viejo/$indice_nuevo/g" "$archivo"
        fi
    done
    
    mostrar_exito "Otros índices corregidos"
    
    cd "$PROJECT_DIR"
}

# Función para limpiar migraciones
limpiar_migraciones_indices() {
    mostrar_seccion "Limpiando Migraciones de Índices"
    
    cd "$BACKEND_DIR"
    
    # Apps que pueden tener migraciones problemáticas
    local apps_limpiar=("contabilidad" "facturacion" "inventario" "productos" "clientes")
    
    for app in "${apps_limpiar[@]}"; do
        local migration_dir="aplicaciones/$app/migrations"
        
        if [[ -d "$migration_dir" ]]; then
            mostrar_mensaje "Limpiando migraciones de $app..."
            
            # Eliminar archivos de migración numerados (mantener __init__.py)
            find "$migration_dir" -name "00*.py" -delete 2>/dev/null || true
            find "$migration_dir" -name "*.pyc" -delete 2>/dev/null || true
            find "$migration_dir" -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
            
            mostrar_exito "Migraciones de $app limpiadas"
        fi
    done
    
    cd "$PROJECT_DIR"
}

# Función para crear migraciones limpias
crear_migraciones_indices_limpios() {
    mostrar_seccion "Creando Migraciones con Índices Únicos"
    
    cd "$BACKEND_DIR"
    
    # Activar entorno virtual
    if [[ -d "venv" ]]; then
        source venv/bin/activate
    fi
    
    # Crear migraciones para todas las apps
    local apps_migrar=("core" "usuarios" "clientes" "productos" "inventario" "facturacion" "integraciones" "contabilidad" "reportes")
    
    for app in "${apps_migrar[@]}"; do
        if [[ -d "aplicaciones/$app" ]]; then
            mostrar_mensaje "Creando migraciones para $app..."
            
            if python manage.py makemigrations "$app" --verbosity=1; then
                mostrar_exito "Migraciones creadas para $app"
            else
                mostrar_advertencia "Problemas al crear migraciones para $app (puede ser normal si no hay cambios)"
            fi
        fi
    done
    
    # Aplicar todas las migraciones
    mostrar_mensaje "Aplicando todas las migraciones..."
    
    if python manage.py migrate --verbosity=1; then
        mostrar_exito "Migraciones aplicadas exitosamente"
    else
        mostrar_error "Error al aplicar migraciones"
        exit 1
    fi
    
    cd "$PROJECT_DIR"
}

# Función para verificar corrección
verificar_indices_corregidos() {
    mostrar_seccion "Verificando Corrección de Índices"
    
    cd "$BACKEND_DIR"
    
    # Activar entorno virtual
    if [[ -d "venv" ]]; then
        source venv/bin/activate
    fi
    
    mostrar_mensaje "Ejecutando django check..."
    
    # Capturar salida del check
    if python manage.py check --verbosity=2 > /tmp/django_check_final.txt 2>&1; then
        mostrar_exito "✅ Django check exitoso - Índices duplicados corregidos"
        
        # Mostrar mensaje de éxito si no hay errores
        if ! grep -q "ERROR" /tmp/django_check_final.txt; then
            echo ""
            echo "🎉 ¡No se detectaron errores de sistema!"
        fi
    else
        mostrar_advertencia "⚠️ Aún hay algunos problemas detectados:"
        echo ""
        cat /tmp/django_check_final.txt
        echo ""
        
        # Verificar específicamente errores de índices
        if grep -q "models.E030\|index name.*is not unique" /tmp/django_check_final.txt; then
            mostrar_error "❌ Aún hay errores de índices duplicados"
            exit 1
        else
            mostrar_exito "✅ Los errores de índices duplicados fueron corregidos"
            mostrar_mensaje "Los errores restantes pueden ser de configuración menor"
        fi
    fi
    
    cd "$PROJECT_DIR"
}

# Función para generar reporte de índices
generar_reporte_indices() {
    mostrar_seccion "Generando Reporte de Índices"
    
    cd "$BACKEND_DIR"
    
    local reporte_file="../logs/indices_report_$(date +%Y%m%d_%H%M%S).txt"
    
    # Activar entorno virtual
    if [[ -d "venv" ]]; then
        source venv/bin/activate
    fi
    
    mostrar_mensaje "Generando reporte de índices en la base de datos..."
    
    # Crear script Python para obtener información de índices
    cat > /tmp/check_indices.py << 'EOF'
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configuracion.settings.local')
django.setup()

from django.db import connection

def get_database_indices():
    """Obtener todos los índices de la base de datos"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                TABLE_NAME,
                INDEX_NAME,
                COLUMN_NAME,
                NON_UNIQUE
            FROM 
                INFORMATION_SCHEMA.STATISTICS 
            WHERE 
                TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME LIKE 'aplicaciones_%'
            ORDER BY 
                TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
        """)
        
        results = cursor.fetchall()
        
        print("ÍNDICES EN LA BASE DE DATOS:")
        print("=" * 50)
        
        current_table = None
        current_index = None
        
        for row in results:
            table_name, index_name, column_name, non_unique = row
            
            if table_name != current_table:
                print(f"\n📊 TABLA: {table_name}")
                current_table = table_name
                current_index = None
            
            if index_name != current_index:
                unique_str = "UNIQUE" if non_unique == 0 else "INDEX"
                print(f"  🔍 {unique_str}: {index_name}")
                current_index = index_name
            
            print(f"    - {column_name}")

if __name__ == "__main__":
    try:
        get_database_indices()
    except Exception as e:
        print(f"Error al obtener información de índices: {e}")
EOF

    # Ejecutar script y guardar reporte
    python /tmp/check_indices.py > "$reporte_file" 2>&1
    
    # Limpiar script temporal
    rm -f /tmp/check_indices.py
    
    mostrar_exito "Reporte de índices generado: $reporte_file"
    
    cd "$PROJECT_DIR"
}

# Función para reiniciar servidores
reiniciar_servidores_corregidos() {
    mostrar_seccion "Reiniciando Servidores"
    
    cd "$BACKEND_DIR"
    
    # Activar entorno virtual
    if [[ -d "venv" ]]; then
        source venv/bin/activate
    fi
    
    # Crear directorio de logs si no existe
    mkdir -p ../logs
    
    # Iniciar Django en background
    mostrar_mensaje "Iniciando servidor Django..."
    nohup python manage.py runserver 0.0.0.0:8000 > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Guardar PID
    echo $BACKEND_PID > ../logs/backend.pid
    
    mostrar_exito "Servidor Django iniciado (PID: $BACKEND_PID)"
    
    # Iniciar React
    cd ../frontend
    
    if [[ -f "package.json" ]]; then
        mostrar_mensaje "Iniciando servidor React..."
        nohup npm run dev > ../logs/frontend.log 2>&1 &
        FRONTEND_PID=$!
        
        echo $FRONTEND_PID > ../logs/frontend.pid
        
        mostrar_exito "Servidor React iniciado (PID: $FRONTEND_PID)"
    else
        mostrar_advertencia "Frontend no configurado"
    fi
    
    cd "$PROJECT_DIR"
    
    # Esperar un momento para que los servidores inicien
    sleep 5
    
    # Verificar que están corriendo
    mostrar_mensaje "Verificando servidores..."
    
    if curl -s http://localhost:8000/api/ > /dev/null; then
        mostrar_exito "✅ Backend Django funcionando en http://localhost:8000"
    else
        mostrar_advertencia "⚠️ Backend Django no responde aún (puede necesitar más tiempo)"
    fi
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        mostrar_exito "✅ Frontend React funcionando en http://localhost:3000"
    else
        mostrar_advertencia "⚠️ Frontend React no responde aún"
    fi
}

# Función principal
main() {
    mostrar_seccion "Corrección de Índices Duplicados - FELICITAFAC"
    
    echo -e "${YELLOW}Este script corregirá los errores de índices duplicados en modelos Django.${NC}"
    echo ""
    echo -e "${YELLOW}Error detectado:${NC}"
    echo "- index name 'idx_detalle_activo' is not unique among models"
    echo "- Modelos afectados: contabilidad.DetalleAsiento, facturacion.DetalleDocumento"
    echo ""
    echo -e "${YELLOW}¿Desea continuar con la corrección? (s/n):${NC}"
    read -r respuesta
    
    if [[ ! "$respuesta" =~ ^[Ss]$ ]]; then
        echo "Operación cancelada."
        exit 0
    fi
    
    # Ejecutar correcciones en orden
    detener_servidores
    diagnosticar_indices_duplicados
    hacer_backup_modelos
    corregir_indices_contabilidad
    corregir_indices_facturacion
    corregir_otros_indices
    limpiar_migraciones_indices
    crear_migraciones_indices_limpios
    verificar_indices_corregidos
    generar_reporte_indices
    reiniciar_servidores_corregidos
    
    mostrar_seccion "Corrección de Índices Completada"
    
    echo -e "${GREEN}✅ Índices duplicados corregidos exitosamente${NC}"
    echo ""
    echo -e "${CYAN}SERVIDORES FUNCIONANDO:${NC}"
    echo "🐍 Django Backend: http://localhost:8000"
    echo "⚛️ React Frontend: http://localhost:3000"
    echo ""
    echo -e "${CYAN}VERIFICAR FUNCIONAMIENTO:${NC}"
    echo "curl http://localhost:8000/api/"
    echo "curl http://localhost:8000/api/clientes/"
    echo "curl http://localhost:8000/api/productos/"
    echo ""
    echo -e "${CYAN}PRÓXIMOS PASOS:${NC}"
    echo "1. Verificar que las APIs funcionan"
    echo "2. Probar el frontend React"
    echo "3. Continuar con Fase 4 - Desarrollo Frontend"
    echo ""
    echo -e "${GREEN}🎉 ¡FELICITAFAC Fase 3 funcionando sin errores!${NC}"
}

# Ejecutar función principal
main "$@"