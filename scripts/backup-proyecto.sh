#!/bin/bash

# FELICITAFAC - Script de Backup Completo
# Sistema de Facturación Electrónica para Perú
# Backup de código, base de datos y archivos multimedia

set -e  # Salir si algún comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Función para mostrar mensajes
mostrar_mensaje() {
    echo -e "${BLUE}[BACKUP]${NC} $1"
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
    mostrar_exito "Variables de entorno cargadas"
else
    mostrar_advertencia "Archivo .env no encontrado"
fi

# Variables
FECHA=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-./backups}"
PROYECTO_NOMBRE="felicitafac"
BACKUP_NOMBRE="${PROYECTO_NOMBRE}_backup_${FECHA}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NOMBRE}"

# Variables de base de datos
DB_NAME=${DB_NAME:-"felicitafac_local"}
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-"root"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"3306"}

# Configuración de retención (días)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

mostrar_mensaje "🗄️ Iniciando backup completo de FELICITAFAC"
echo ""

# Función para crear directorio de backup
crear_directorio_backup() {
    mostrar_mensaje "📁 Creando directorio de backup..."
    
    mkdir -p "$BACKUP_PATH"
    mkdir -p "$BACKUP_PATH/codigo"
    mkdir -p "$BACKUP_PATH/base_datos"
    mkdir -p "$BACKUP_PATH/archivos"
    mkdir -p "$BACKUP_PATH/configuracion"
    
    mostrar_exito "Directorio de backup creado: $BACKUP_PATH"
}

# Función para backup del código fuente
backup_codigo() {
    mostrar_mensaje "💾 Creando backup del código fuente..."
    
    # Archivos y directorios a incluir
    INCLUIR=(
        "backend/"
        "frontend/"
        "scripts/"
        "database/"
        "documentacion/"
        "README.md"
        "package.json"
        ".gitignore"
    )
    
    # Archivos y directorios a excluir
    EXCLUIR=(
        "backend/venv/"
        "backend/__pycache__/"
        "backend/*.pyc"
        "backend/logs/"
        "backend/media/temp/"
        "frontend/node_modules/"
        "frontend/dist/"
        "frontend/build/"
        ".git/"
        "backups/"
        "*.log"
        "*.tmp"
    )
    
    # Crear archivo tar con exclusiones
    tar_command="tar -czf '$BACKUP_PATH/codigo/codigo_fuente.tar.gz'"
    
    # Agregar exclusiones
    for excluir in "${EXCLUIR[@]}"; do
        tar_command="$tar_command --exclude='$excluir'"
    done
    
    # Agregar archivos a incluir
    for incluir in "${INCLUIR[@]}"; do
        if [ -e "$incluir" ]; then
            tar_command="$tar_command '$incluir'"
        fi
    done
    
    # Ejecutar comando tar
    eval $tar_command
    
    # Verificar que el archivo se creó
    if [ -f "$BACKUP_PATH/codigo/codigo_fuente.tar.gz" ]; then
        TAMANO_CODIGO=$(du -h "$BACKUP_PATH/codigo/codigo_fuente.tar.gz" | cut -f1)
        mostrar_exito "Backup del código completado ($TAMANO_CODIGO)"
    else
        mostrar_error "Error al crear backup del código"
        return 1
    fi
}

# Función para backup de la base de datos
backup_base_datos() {
    mostrar_mensaje "📊 Creando backup de la base de datos MySQL..."
    
    # Verificar conexión a MySQL
    if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &>/dev/null; then
        mostrar_error "No se pudo conectar a MySQL"
        return 1
    fi
    
    # Crear dump de la base de datos
    mysqldump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --user="$DB_USER" \
        --password="$DB_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --add-drop-database \
        --add-drop-table \
        --create-options \
        --disable-keys \
        --extended-insert \
        --quick \
        --lock-tables=false \
        --set-charset \
        --default-character-set=utf8mb4 \
        "$DB_NAME" > "$BACKUP_PATH/base_datos/database_dump.sql"
    
    # Comprimir el dump
    gzip "$BACKUP_PATH/base_datos/database_dump.sql"
    
    # Verificar que el archivo se creó
    if [ -f "$BACKUP_PATH/base_datos/database_dump.sql.gz" ]; then
        TAMANO_DB=$(du -h "$BACKUP_PATH/base_datos/database_dump.sql.gz" | cut -f1)
        mostrar_exito "Backup de base de datos completado ($TAMANO_DB)"
    else
        mostrar_error "Error al crear backup de base de datos"
        return 1
    fi
    
    # Crear script de restauración
    cat > "$BACKUP_PATH/base_datos/restaurar_db.sh" << EOF
#!/bin/bash
# Script de restauración de base de datos FELICITAFAC
# Generado el: $(date)

echo "Restaurando base de datos $DB_NAME..."

# Descomprimir dump
gunzip -c database_dump.sql.gz > database_dump.sql

# Restaurar base de datos
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" < database_dump.sql

echo "Base de datos restaurada exitosamente"
EOF
    
    chmod +x "$BACKUP_PATH/base_datos/restaurar_db.sh"
}

# Función para backup de archivos multimedia
backup_archivos() {
    mostrar_mensaje "🖼️ Creando backup de archivos multimedia..."
    
    DIRECTORIOS_MEDIA=(
        "backend/media/"
        "backend/static/"
        "frontend/public/assets/"
    )
    
    for directorio in "${DIRECTORIOS_MEDIA[@]}"; do
        if [ -d "$directorio" ]; then
            NOMBRE_DIR=$(basename "$directorio")
            DIRECTORIO_PADRE=$(dirname "$directorio")
            
            tar -czf "$BACKUP_PATH/archivos/${NOMBRE_DIR}.tar.gz" -C "$DIRECTORIO_PADRE" "$NOMBRE_DIR"
            
            if [ -f "$BACKUP_PATH/archivos/${NOMBRE_DIR}.tar.gz" ]; then
                TAMANO=$(du -h "$BACKUP_PATH/archivos/${NOMBRE_DIR}.tar.gz" | cut -f1)
                mostrar_exito "Backup de $directorio completado ($TAMANO)"
            fi
        else
            mostrar_advertencia "Directorio no encontrado: $directorio"
        fi
    done
}

# Función para backup de configuración
backup_configuracion() {
    mostrar_mensaje "⚙️ Creando backup de configuración..."
    
    # Copiar archivos de configuración importantes
    ARCHIVOS_CONFIG=(
        ".env.example"
        "requirements.txt"
        "package.json"
        "package-lock.json"
    )
    
    for archivo in "${ARCHIVOS_CONFIG[@]}"; do
        if [ -f "$archivo" ]; then
            cp "$archivo" "$BACKUP_PATH/configuracion/"
            mostrar_exito "Copiado: $archivo"
        fi
    done
    
    # Crear copia sanitizada del .env (sin passwords)
    if [ -f ".env" ]; then
        sed 's/PASSWORD=.*/PASSWORD=***REMOVED***/g' .env > "$BACKUP_PATH/configuracion/env_sanitized.txt"
        mostrar_exito "Archivo .env sanitizado incluido"
    fi
    
    # Información del sistema
    cat > "$BACKUP_PATH/configuracion/system_info.txt" << EOF
FELICITAFAC - Información del Sistema
Fecha del backup: $(date)
Sistema operativo: $(uname -a)
Python version: $(python3 --version 2>/dev/null || echo "No disponible")
Node.js version: $(node --version 2>/dev/null || echo "No disponible")
MySQL version: $(mysql --version 2>/dev/null || echo "No disponible")
Directorio del proyecto: $(pwd)
Usuario: $(whoami)
EOF
}

# Función para crear resumen del backup
crear_resumen() {
    mostrar_mensaje "📋 Creando resumen del backup..."
    
    cat > "$BACKUP_PATH/BACKUP_INFO.txt" << EOF
===============================================
FELICITAFAC - INFORMACIÓN DEL BACKUP
===============================================

Fecha y hora: $(date)
Nombre del backup: $BACKUP_NOMBRE
Ubicación: $BACKUP_PATH

CONTENIDO DEL BACKUP:
- ✅ Código fuente (backend y frontend)
- ✅ Base de datos MySQL ($DB_NAME)
- ✅ Archivos multimedia y estáticos
- ✅ Configuración del sistema

BASE DE DATOS:
- Host: $DB_HOST:$DB_PORT
- Nombre: $DB_NAME
- Usuario: $DB_USER

ARCHIVOS INCLUIDOS:
EOF
    
    # Listar contenido del backup
    find "$BACKUP_PATH" -type f -exec ls -lh {} \; >> "$BACKUP_PATH/BACKUP_INFO.txt"
    
    echo "" >> "$BACKUP_PATH/BACKUP_INFO.txt"
    echo "TAMAÑO TOTAL DEL BACKUP:" >> "$BACKUP_PATH/BACKUP_INFO.txt"
    du -sh "$BACKUP_PATH" >> "$BACKUP_PATH/BACKUP_INFO.txt"
    
    mostrar_exito "Resumen del backup creado"
}

# Función para comprimir backup completo
comprimir_backup() {
    mostrar_mensaje "🗜️ Comprimiendo backup completo..."
    
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NOMBRE}.tar.gz" "$BACKUP_NOMBRE"
    
    if [ -f "${BACKUP_NOMBRE}.tar.gz" ]; then
        TAMANO_TOTAL=$(du -h "${BACKUP_NOMBRE}.tar.gz" | cut -f1)
        mostrar_exito "Backup comprimido: ${BACKUP_NOMBRE}.tar.gz ($TAMANO_TOTAL)"
        
        # Eliminar directorio temporal
        rm -rf "$BACKUP_NOMBRE"
        mostrar_exito "Directorio temporal eliminado"
    else
        mostrar_error "Error al comprimir backup"
        return 1
    fi
    
    cd - > /dev/null
}

# Función para limpiar backups antiguos
limpiar_backups_antiguos() {
    mostrar_mensaje "🧹 Limpiando backups antiguos (más de $RETENTION_DAYS días)..."
    
    ELIMINADOS=0
    
    # Buscar y eliminar backups antiguos
    find "$BACKUP_DIR" -name "${PROYECTO_NOMBRE}_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -print0 | \
    while IFS= read -r -d '' archivo; do
        rm -f "$archivo"
        mostrar_advertencia "Eliminado: $(basename "$archivo")"
        ((ELIMINADOS++))
    done
    
    if [ $ELIMINADOS -eq 0 ]; then
        mostrar_exito "No hay backups antiguos para eliminar"
    else
        mostrar_exito "Eliminados $ELIMINADOS backups antiguos"
    fi
}

# Función para verificar espacio en disco
verificar_espacio() {
    mostrar_mensaje "💽 Verificando espacio en disco..."
    
    ESPACIO_DISPONIBLE=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    ESPACIO_GB=$((ESPACIO_DISPONIBLE / 1024 / 1024))
    
    if [ $ESPACIO_GB -lt 1 ]; then
        mostrar_error "Espacio insuficiente en disco (menos de 1GB disponible)"
        return 1
    else
        mostrar_exito "Espacio disponible: ${ESPACIO_GB}GB"
    fi
}

# Función para enviar notificación por email (opcional)
enviar_notificacion() {
    if [ -n "$EMAIL_HOST_USER" ] && [ -n "$BACKUP_NOTIFICATION_EMAIL" ]; then
        mostrar_mensaje "📧 Enviando notificación por email..."
        
        # Aquí se podría implementar envío de email
        # Por ahora solo creamos un archivo de notificación
        cat > "$BACKUP_DIR/notificacion_${FECHA}.txt" << EOF
Backup de FELICITAFAC completado exitosamente

Fecha: $(date)
Archivo: ${BACKUP_NOMBRE}.tar.gz
Ubicación: $BACKUP_DIR
Tamaño: $(du -h "$BACKUP_DIR/${BACKUP_NOMBRE}.tar.gz" | cut -f1)
EOF
        
        mostrar_exito "Notificación preparada"
    fi
}

# Función principal
main() {
    mostrar_mensaje "=== BACKUP COMPLETO FELICITAFAC ==="
    echo ""
    
    # 1. Verificar espacio en disco
    verificar_espacio
    
    # 2. Crear directorio de backup
    crear_directorio_backup
    
    # 3. Backup del código fuente
    backup_codigo
    
    # 4. Backup de la base de datos
    backup_base_datos
    
    # 5. Backup de archivos multimedia
    backup_archivos
    
    # 6. Backup de configuración
    backup_configuracion
    
    # 7. Crear resumen
    crear_resumen
    
    # 8. Comprimir backup completo
    comprimir_backup
    
    # 9. Limpiar backups antiguos
    limpiar_backups_antiguos
    
    # 10. Enviar notificación
    enviar_notificacion
    
    echo ""
    mostrar_exito "✅ ¡Backup completado exitosamente!"
    echo ""
    mostrar_mensaje "📋 RESUMEN DEL BACKUP:"
    echo "   📁 Archivo: ${BACKUP_NOMBRE}.tar.gz"
    echo "   📍 Ubicación: $BACKUP_DIR"
    echo "   📊 Tamaño: $(du -h "$BACKUP_DIR/${BACKUP_NOMBRE}.tar.gz" | cut -f1)"
    echo "   🕒 Fecha: $(date)"
    echo ""
    mostrar_mensaje "🔄 RESTAURACIÓN:"
    echo "   1. Extraer: tar -xzf ${BACKUP_NOMBRE}.tar.gz"
    echo "   2. Restaurar DB: cd ${BACKUP_NOMBRE}/base_datos && ./restaurar_db.sh"
    echo "   3. Copiar archivos según necesidad"
    echo ""
    
    mostrar_mensaje "🎉 ¡FELICITAFAC respaldado exitosamente!"
}

# Verificar argumentos de línea de comandos
case "${1:-}" in
    --help|-h)
        echo "FELICITAFAC - Script de backup completo"
        echo ""
        echo "Uso: $0 [opciones]"
        echo ""
        echo "Opciones:"
        echo "  --help, -h         Mostrar esta ayuda"
        echo "  --codigo-only      Backup solo del código fuente"
        echo "  --db-only          Backup solo de la base de datos"
        echo "  --archivos-only    Backup solo de archivos multimedia"
        echo ""
        echo "Variables de entorno:"
        echo "  BACKUP_DIR              Directorio de backups (default: ./backups)"
        echo "  BACKUP_RETENTION_DAYS   Días de retención (default: 7)"
        echo "  BACKUP_NOTIFICATION_EMAIL Email para notificaciones"
        echo ""
        exit 0
        ;;
    --codigo-only)
        mostrar_mensaje "💾 Backup solo del código fuente..."
        verificar_espacio
        crear_directorio_backup
        backup_codigo
        mostrar_exito "Backup del código completado"
        exit 0
        ;;
    --db-only)
        mostrar_mensaje "📊 Backup solo de la base de datos..."
        verificar_espacio
        crear_directorio_backup
        backup_base_datos
        mostrar_exito "Backup de la base de datos completado"
        exit 0
        ;;
    --archivos-only)
        mostrar_mensaje "🖼️ Backup solo de archivos multimedia..."
        verificar_espacio
        crear_directorio_backup
        backup_archivos
        mostrar_exito "Backup de archivos completado"
        exit 0
        ;;
esac

# Ejecutar función principal
main "$@"