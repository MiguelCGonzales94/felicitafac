#!/bin/bash

# ================================================================
# FELICITAFAC - Guía de Inicio Rápido
# Script interactivo para nuevos usuarios
# ================================================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # Sin color

mostrar_banner() {
    clear
    echo -e "${CYAN}"
    echo "=================================================================="
    echo "  🚀 FELICITAFAC - GUÍA DE INICIO RÁPIDO"
    echo "  Sistema de Facturación Electrónica para Perú"
    echo "=================================================================="
    echo -e "${NC}"
}

mostrar_mensaje() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

mostrar_paso() {
    echo -e "${PURPLE}[PASO $1]${NC} $2"
}

# Función para pausar y esperar input
pausar() {
    echo -e "\n${YELLOW}Presiona ENTER para continuar...${NC}"
    read
}

# Verificar prerequisitos básicos
verificar_prerequisitos() {
    mostrar_paso "1" "Verificando prerequisitos..."
    echo ""
    
    local errores=0
    
    # Python
    if command -v python3 &> /dev/null; then
        mostrar_exito "Python 3: $(python3 --version)"
    else
        mostrar_error "Python 3 no está instalado"
        echo "  Instalar desde: https://www.python.org/"
        errores=$((errores + 1))
    fi
    
    # MySQL
    if command -v mysql &> /dev/null; then
        mostrar_exito "MySQL: $(mysql --version | head -1)"
    else
        mostrar_error "MySQL no está instalado"
        echo "  Instalar desde: https://dev.mysql.com/downloads/"
        errores=$((errores + 1))
    fi
    
    # Node.js
    if command -v node &> /dev/null; then
        mostrar_exito "Node.js: $(node --version)"
    else
        mostrar_error "Node.js no está instalado"
        echo "  Instalar desde: https://nodejs.org/"
        errores=$((errores + 1))
    fi
    
    # Git
    if command -v git &> /dev/null; then
        mostrar_exito "Git: $(git --version)"
    else
        mostrar_advertencia "Git no está instalado (recomendado para desarrollo)"
        echo "  Instalar desde: https://git-scm.com/"
    fi
    
    if [ $errores -gt 0 ]; then
        echo ""
        mostrar_error "Se encontraron $errores prerequisitos faltantes"
        mostrar_mensaje "Instala los prerequisitos faltantes y vuelve a ejecutar este script"
        exit 1
    fi
    
    mostrar_exito "Todos los prerequisitos están instalados"
    pausar
}

# Mostrar estructura del proyecto
mostrar_estructura() {
    mostrar_paso "2" "Revisando estructura del proyecto..."
    echo ""
    
    if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        mostrar_error "Estructura del proyecto incorrecta"
        mostrar_mensaje "Asegúrate de ejecutar desde la carpeta raíz de FELICITAFAC"
        exit 1
    fi
    
    echo -e "${CYAN}Estructura del proyecto:${NC}"
    echo ""
    echo "felicitafac/"
    echo "├── 📁 backend/          # Django + APIs REST"
    echo "│   ├── 📁 aplicaciones/ # 8 apps del sistema"
    echo "│   ├── 📁 configuracion/# Settings Django"
    echo "│   └── 📄 manage.py     # Comando Django"
    echo "├── 📁 frontend/         # React + TypeScript"
    echo "│   ├── 📁 src/          # Código fuente"
    echo "│   └── 📄 package.json  # Dependencias Node"
    echo "├── 📁 database/         # Scripts SQL"
    echo "│   └── 📁 scripts/      # Migraciones y datos"
    echo "├── 📁 scripts/          # Scripts de automatización"
    echo "└── 📄 README.md         # Documentación"
    echo ""
    
    mostrar_exito "Estructura del proyecto verificada"
    pausar
}

# Explicar las fases del proyecto
explicar_fases() {
    mostrar_paso "3" "Fases de desarrollo FELICITAFAC..."
    echo ""
    
    echo -e "${CYAN}El proyecto se desarrolla en fases incrementales:${NC}"
    echo ""
    echo -e "${GREEN}✅ FASE 1:${NC} Configuración MySQL y Arquitectura Base"
    echo "   - Django configurado con MySQL"
    echo "   - Estructura de 8 aplicaciones"
    echo "   - Configuración para hosting compartido"
    echo ""
    echo -e "${GREEN}✅ FASE 2:${NC} Autenticación y Seguridad"
    echo "   - JWT para autenticación"
    echo "   - 4 roles de usuario (Admin/Contador/Vendedor/Cliente)"
    echo "   - APIs de usuarios completas"
    echo ""
    echo -e "${GREEN}✅ FASE 3:${NC} API Core y Nubefact (ACTUAL)"
    echo "   - APIs REST completas (Clientes, Productos, Facturas)"
    echo "   - Integración con Nubefact para SUNAT"
    echo "   - Inventario PEPS y contabilidad automática"
    echo "   - Base de datos con datos de ejemplo"
    echo ""
    echo -e "${BLUE}🔄 FASE 4:${NC} Punto de Venta Frontend (SIGUIENTE)"
    echo "   - Dashboard principal"
    echo "   - Punto de venta (POS) completo"
    echo "   - Gestión de clientes y productos"
    echo "   - Reportes y configuraciones"
    echo ""
    
    mostrar_mensaje "Actualmente estás en la FASE 3 - Lista para usar"
    pausar
}

# Mostrar opciones disponibles
mostrar_opciones() {
    mostrar_paso "4" "¿Qué deseas hacer?"
    echo ""
    
    echo -e "${CYAN}Opciones disponibles:${NC}"
    echo ""
    echo "1️⃣  🚀 Levantar sistema completo (Recomendado)"
    echo "     - Configura y levanta todo automáticamente"
    echo "     - Backend Django + Frontend React + MySQL"
    echo ""
    echo "2️⃣  📊 Verificar estado actual del sistema"
    echo "     - Revisa qué componentes están funcionando"
    echo "     - Útil para diagnosticar problemas"
    echo ""
    echo "3️⃣  🛑 Detener servicios corriendo"
    echo "     - Detiene Django y React si están corriendo"
    echo "     - Libera puertos 8000 y 5173"
    echo ""
    echo "4️⃣  ⚙️  Solo configurar dependencias"
    echo "     - Instala Python/Node dependencies"
    echo "     - No levanta servicios"
    echo ""
    echo "5️⃣  📚 Ver documentación y ayuda"
    echo "     - Enlaces útiles y comandos"
    echo "     - Información de APIs"
    echo ""
    echo "6️⃣  🚪 Salir"
    echo ""
    
    echo -n "Selecciona una opción [1-6]: "
    read -r opcion
    
    case $opcion in
        1)
            opcion_levantar_sistema
            ;;
        2)
            opcion_verificar_estado
            ;;
        3)
            opcion_detener_servicios
            ;;
        4)
            opcion_configurar_dependencias
            ;;
        5)
            opcion_documentacion
            ;;
        6)
            mostrar_mensaje "¡Gracias por usar FELICITAFAC!"
            exit 0
            ;;
        *)
            mostrar_error "Opción inválida"
            mostrar_opciones
            ;;
    esac
}

# Opción 1: Levantar sistema completo
opcion_levantar_sistema() {
    clear
    mostrar_banner
    echo -e "${CYAN}🚀 LEVANTANDO SISTEMA COMPLETO${NC}"
    echo ""
    
    mostrar_mensaje "Esta opción va a:"
    echo "  ✅ Configurar la base de datos MySQL"
    echo "  ✅ Instalar todas las dependencias"
    echo "  ✅ Ejecutar migraciones"
    echo "  ✅ Cargar datos de ejemplo"
    echo "  ✅ Levantar Django (puerto 8000)"
    echo "  ✅ Levantar React (puerto 5173)"
    echo ""
    
    echo -n "¿Continuar? [S/n]: "
    read -r continuar
    
    if [[ ! "$continuar" =~ ^[Nn]$ ]]; then
        if [ -f "scripts/levantar-fase3.sh" ]; then
            chmod +x scripts/levantar-fase3.sh
            ./scripts/levantar-fase3.sh
        else
            mostrar_error "Script levantar-fase3.sh no encontrado"
            pausar
            mostrar_opciones
        fi
    else
        mostrar_opciones
    fi
}

# Opción 2: Verificar estado
opcion_verificar_estado() {
    clear
    mostrar_banner
    echo -e "${CYAN}📊 VERIFICANDO ESTADO DEL SISTEMA${NC}"
    echo ""
    
    if [ -f "scripts/verificar-estado.sh" ]; then
        chmod +x scripts/verificar-estado.sh
        ./scripts/verificar-estado.sh
        pausar
    else
        mostrar_error "Script verificar-estado.sh no encontrado"
        pausar
    fi
    
    mostrar_opciones
}

# Opción 3: Detener servicios
opcion_detener_servicios() {
    clear
    mostrar_banner
    echo -e "${CYAN}🛑 DETENIENDO SERVICIOS${NC}"
    echo ""
    
    if [ -f "scripts/detener-servicios.sh" ]; then
        chmod +x scripts/detener-servicios.sh
        ./scripts/detener-servicios.sh
        pausar
    else
        mostrar_error "Script detener-servicios.sh no encontrado"
        pausar
    fi
    
    mostrar_opciones
}

# Opción 4: Configurar dependencias
opcion_configurar_dependencias() {
    clear
    mostrar_banner
    echo -e "${CYAN}⚙️  CONFIGURANDO DEPENDENCIAS${NC}"
    echo ""
    
    mostrar_mensaje "Instalando dependencias Python..."
    if [ -d "backend" ]; then
        cd backend
        if [ ! -d "venv" ]; then
            python3 -m venv venv
            mostrar_exito "Entorno virtual creado"
        fi
        
        source venv/bin/activate
        pip install --upgrade pip
        
        if [ -f "requirements.txt" ]; then
            pip install -r requirements.txt
            mostrar_exito "Dependencias Python instaladas"
        else
            mostrar_error "requirements.txt no encontrado"
        fi
        cd ..
    fi
    
    mostrar_mensaje "Instalando dependencias Node.js..."
    if [ -d "frontend" ]; then
        cd frontend
        if [ -f "package.json" ]; then
            npm install
            mostrar_exito "Dependencias Node.js instaladas"
        else
            mostrar_error "package.json no encontrado"
        fi
        cd ..
    fi
    
    mostrar_exito "Configuración de dependencias completada"
    pausar
    mostrar_opciones
}

# Opción 5: Documentación
opcion_documentacion() {
    clear
    mostrar_banner
    echo -e "${CYAN}📚 DOCUMENTACIÓN Y AYUDA${NC}"
    echo ""
    
    echo -e "${CYAN}🔗 Enlaces Útiles:${NC}"
    echo "=================================="
    echo "🌐 Frontend local:      http://localhost:5173"
    echo "🔧 Backend API:         http://localhost:8000/api/"
    echo "⚙️  Admin Django:        http://localhost:8000/admin/"
    echo "📋 API Docs:            http://localhost:8000/api/docs/"
    echo ""
    
    echo -e "${CYAN}👤 Credenciales por Defecto:${NC}"
    echo "=================================="
    echo "Email:    admin@felicitafac.com"
    echo "Password: admin123"
    echo ""
    
    echo -e "${CYAN}🛠️ Comandos Útiles:${NC}"
    echo "=================================="
    echo "🚀 Levantar sistema:    ./scripts/levantar-fase3.sh"
    echo "🛑 Detener servicios:   ./scripts/detener-servicios.sh"
    echo "📊 Ver estado:          ./scripts/verificar-estado.sh"
    echo "🔄 Inicio rápido:       ./scripts/inicio-rapido.sh"
    echo ""
    echo "📄 Ver logs Django:     tail -f logs/django.log"
    echo "📄 Ver logs React:      tail -f logs/react.log"
    echo ""
    
    echo -e "${CYAN}🗄️ Base de Datos:${NC}"
    echo "=================================="
    echo "Motor:     MySQL 8.0+"
    echo "DB Name:   felicitafac_fase3"
    echo "Usuario:   root (por defecto)"
    echo "Puerto:    3306"
    echo "Tablas:    ~40 tablas del sistema"
    echo ""
    
    echo -e "${CYAN}📊 APIs Disponibles:${NC}"
    echo "=================================="
    echo "👥 Usuarios:        /api/usuarios/"
    echo "🏢 Clientes:        /api/clientes/"
    echo "📦 Productos:       /api/productos/"
    echo "📄 Facturas:        /api/facturacion/facturas/"
    echo "📊 Inventario:      /api/inventario/"
    echo "💼 Contabilidad:    /api/contabilidad/"
    echo "🔗 Integraciones:   /api/integraciones/"
    echo ""
    
    echo -e "${CYAN}🚨 Solución de Problemas:${NC}"
    echo "=================================="
    echo "❌ Error conexión BD:   Verificar MySQL corriendo"
    echo "❌ Puerto ocupado:      Detener servicios primero"
    echo "❌ Dependencias:        Ejecutar configurar dependencias"
    echo "❌ Permisos scripts:    chmod +x scripts/*.sh"
    echo ""
    
    echo -e "${CYAN}📞 Soporte:${NC}"
    echo "=================================="
    echo "📧 Email: soporte@felicitafac.com"
    echo "📞 Teléfono: +51 999 123 456"
    echo "🌐 Web: https://felicitafac.com"
    echo ""
    
    pausar
    mostrar_opciones
}

# Función principal
main() {
    mostrar_banner
    
    echo -e "${YELLOW}¡Bienvenido a FELICITAFAC!${NC}"
    echo ""
    echo -e "${CYAN}Sistema de Facturación Electrónica para Perú${NC}"
    echo "Desarrollado con Django, React y MySQL"
    echo "Compatible con normativa SUNAT y hosting compartido"
    echo ""
    
    pausar
    
    verificar_prerequisitos
    mostrar_estructura  
    explicar_fases
    mostrar_opciones
}

# Verificar directorio correcto
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    mostrar_error "Ejecuta este script desde la carpeta raíz de FELICITAFAC"
    mostrar_mensaje "Estructura requerida:"
    echo "  felicitafac/"
    echo "  ├── backend/"
    echo "  ├── frontend/"
    echo "  └── README.md"
    exit 1
fi

# Ejecutar función principal
main "$@"