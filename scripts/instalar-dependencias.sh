#!/bin/bash

# FELICITAFAC - Script de Instalación de Dependencias
# Sistema de Facturación Electrónica para Perú
# Configurado para MySQL y hosting compartido

set -e  # Salir si algún comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Verificar si estamos en el directorio correcto
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    mostrar_error "Este script debe ejecutarse desde la carpeta raíz de FELICITAFAC"
    exit 1
fi

mostrar_mensaje "🚀 Iniciando instalación de dependencias para FELICITAFAC"
mostrar_mensaje "📊 Sistema de Facturación Electrónica para Perú"
echo ""

# Verificar distribución de Linux
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    DISTRO=$ID
    mostrar_mensaje "🐧 Sistema detectado: $OS"
else
    mostrar_error "No se pudo detectar la distribución de Linux"
    exit 1
fi

# Función para instalar MySQL según la distribución
instalar_mysql() {
    mostrar_mensaje "📊 Instalando MySQL Server..."
    
    case $DISTRO in
        "ubuntu"|"debian")
            sudo apt update
            sudo apt install -y mysql-server mysql-client libmysqlclient-dev
            ;;
        "centos"|"rhel"|"fedora")
            if command -v dnf &> /dev/null; then
                sudo dnf install -y mysql-server mysql-devel
            else
                sudo yum install -y mysql-server mysql-devel
            fi
            ;;
        "arch")
            sudo pacman -S --noconfirm mysql
            ;;
        *)
            mostrar_advertencia "Distribución no reconocida. Instala MySQL manualmente."
            ;;
    esac
}

# Función para instalar Python y dependencias
instalar_python() {
    mostrar_mensaje "🐍 Verificando instalación de Python..."
    
    # Verificar Python 3.8+
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        mostrar_exito "Python encontrado: $(python3 --version)"
        
        # Verificar versión mínima
        if python3 -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)"; then
            mostrar_exito "Python 3.8+ confirmado"
        else
            mostrar_error "Se requiere Python 3.8 o superior"
            exit 1
        fi
    else
        mostrar_mensaje "Instalando Python..."
        case $DISTRO in
            "ubuntu"|"debian")
                sudo apt install -y python3 python3-pip python3-venv python3-dev
                ;;
            "centos"|"rhel"|"fedora")
                if command -v dnf &> /dev/null; then
                    sudo dnf install -y python3 python3-pip python3-venv python3-devel
                else
                    sudo yum install -y python3 python3-pip python3-venv python3-devel
                fi
                ;;
            "arch")
                sudo pacman -S --noconfirm python python-pip
                ;;
        esac
    fi
    
    # Actualizar pip
    mostrar_mensaje "Actualizando pip..."
    python3 -m pip install --upgrade pip
}

# Función para instalar Node.js
instalar_nodejs() {
    mostrar_mensaje "📦 Verificando instalación de Node.js..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        mostrar_exito "Node.js encontrado: $NODE_VERSION"
        
        # Verificar versión mínima (16+)
        if node -pe "process.exit(parseInt(process.version.slice(1)) >= 16 ? 0 : 1)"; then
            mostrar_exito "Node.js 16+ confirmado"
        else
            mostrar_advertencia "Se recomienda Node.js 16 o superior"
        fi
    else
        mostrar_mensaje "Instalando Node.js..."
        
        # Instalar Node.js usando NodeSource
        case $DISTRO in
            "ubuntu"|"debian")
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                sudo apt-get install -y nodejs
                ;;
            "centos"|"rhel"|"fedora")
                curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
                if command -v dnf &> /dev/null; then
                    sudo dnf install -y nodejs npm
                else
                    sudo yum install -y nodejs npm
                fi
                ;;
            "arch")
                sudo pacman -S --noconfirm nodejs npm
                ;;
        esac
    fi
    
    # Verificar npm
    if command -v npm &> /dev/null; then
        mostrar_exito "npm encontrado: $(npm --version)"
    else
        mostrar_error "npm no encontrado"
        exit 1
    fi
}

# Verificar si MySQL está instalado
verificar_mysql() {
    if command -v mysql &> /dev/null; then
        mostrar_exito "MySQL Client encontrado: $(mysql --version)"
        MYSQL_INSTALADO=true
    else
        mostrar_advertencia "MySQL Client no encontrado"
        MYSQL_INSTALADO=false
    fi
    
    if systemctl is-active --quiet mysql || systemctl is-active --quiet mysqld; then
        mostrar_exito "Servicio MySQL está ejecutándose"
        MYSQL_CORRIENDO=true
    else
        mostrar_advertencia "Servicio MySQL no está ejecutándose"
        MYSQL_CORRIENDO=false
    fi
}

# Crear entorno virtual Python
crear_entorno_virtual() {
    mostrar_mensaje "🏗️ Configurando entorno virtual Python..."
    
    cd backend
    
    # Crear entorno virtual si no existe
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        mostrar_exito "Entorno virtual creado"
    else
        mostrar_advertencia "Entorno virtual ya existe"
    fi
    
    # Activar entorno virtual
    source venv/bin/activate
    mostrar_exito "Entorno virtual activado"
    
    # Actualizar pip en el entorno virtual
    pip install --upgrade pip
    
    # Instalar dependencias
    mostrar_mensaje "📦 Instalando dependencias Python..."
    pip install -r requirements.txt
    
    mostrar_exito "Dependencias Python instaladas"
    
    cd ..
}

# Instalar dependencias frontend
instalar_frontend() {
    mostrar_mensaje "⚛️ Instalando dependencias Frontend..."
    
    cd frontend
    
    # Instalar dependencias con npm
    npm install
    
    mostrar_exito "Dependencias Frontend instaladas"
    
    cd ..
}

# Crear directorios necesarios
crear_directorios() {
    mostrar_mensaje "📁 Creando directorios necesarios..."
    
    # Directorios backend
    mkdir -p backend/logs
    mkdir -p backend/media/avatars
    mkdir -p backend/media/logos
    mkdir -p backend/media/certificados
    mkdir -p backend/static
    mkdir -p backend/staticfiles
    
    # Directorios generales
    mkdir -p backups
    mkdir -p documentacion/capturas
    mkdir -p documentacion/manuales
    
    mostrar_exito "Directorios creados"
}

# Crear archivo .env si no existe
crear_archivo_env() {
    if [ ! -f ".env" ]; then
        mostrar_mensaje "📄 Creando archivo .env desde .env.example..."
        cp .env.example .env
        mostrar_advertencia "⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones"
        mostrar_advertencia "📝 Especialmente las credenciales de MySQL"
    else
        mostrar_advertencia "Archivo .env ya existe"
    fi
}

# Función principal
main() {
    mostrar_mensaje "=== INSTALACIÓN DE DEPENDENCIAS FELICITAFAC ==="
    echo ""
    
    # 1. Verificar MySQL
    verificar_mysql
    if [ "$MYSQL_INSTALADO" = false ]; then
        read -p "¿Deseas instalar MySQL? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            instalar_mysql
        else
            mostrar_advertencia "MySQL debe estar instalado para continuar"
        fi
    fi
    
    # 2. Instalar Python
    instalar_python
    
    # 3. Instalar Node.js
    instalar_nodejs
    
    # 4. Crear directorios
    crear_directorios
    
    # 5. Crear archivo .env
    crear_archivo_env
    
    # 6. Crear entorno virtual y instalar dependencias Python
    crear_entorno_virtual
    
    # 7. Instalar dependencias Frontend
    instalar_frontend
    
    echo ""
    mostrar_exito "✅ ¡Instalación completada exitosamente!"
    echo ""
    mostrar_mensaje "📋 PRÓXIMOS PASOS:"
    echo ""
    echo "1. 📝 Editar el archivo .env con tus configuraciones:"
    echo "   nano .env"
    echo ""
    echo "2. 🔧 Configurar MySQL (si no está configurado):"
    echo "   ./scripts/crear-base-datos.sh"
    echo ""
    echo "3. 🚀 Iniciar el desarrollo:"
    echo "   ./scripts/iniciar-desarrollo.sh"
    echo ""
    echo "4. 🌐 Acceder a la aplicación:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo ""
    
    # Verificar si MySQL está corriendo
    if [ "$MYSQL_CORRIENDO" = false ]; then
        mostrar_advertencia "⚠️  MySQL no está ejecutándose. Inicia el servicio:"
        echo "   sudo systemctl start mysql"
        echo "   sudo systemctl enable mysql"
    fi
    
    mostrar_mensaje "🎉 ¡FELICITAFAC está listo para el desarrollo!"
}

# Ejecutar función principal
main "$@"