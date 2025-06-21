#!/bin/bash

# FELICITAFAC - Script para Solucionar Proxy Vite
# Resuelve problemas de comunicación React ↔ Django

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

mostrar_fix() {
    echo -e "${PURPLE}[FIX]${NC} $1"
}

echo ""
echo "🔧 FELICITAFAC - Solucionador de Proxy Vite"
echo "============================================"
echo ""

# Verificar directorio
if [ ! -d "frontend" ] || [ ! -f "frontend/vite.config.ts" ]; then
    mostrar_error "Ejecutar desde la carpeta raíz de FELICITAFAC"
    exit 1
fi

mostrar_mensaje "🔍 Diagnosticando problema de proxy Vite..."
echo ""

# 1. Verificar que Django esté funcionando
mostrar_mensaje "✅ Verificando Django..."
if curl -s http://localhost:8000/api/ | grep -q "mensaje"; then
    mostrar_exito "✅ Django funcionando correctamente"
else
    mostrar_error "❌ Django no responde. Ejecuta primero: cd backend && python manage.py runserver"
    exit 1
fi

# 2. Crear backup de configuración actual
mostrar_fix "📋 Creando backup de configuración..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "backups/frontend_$TIMESTAMP"
cp frontend/vite.config.ts "backups/frontend_$TIMESTAMP/"
cp frontend/package.json "backups/frontend_$TIMESTAMP/"

# 3. Actualizar configuración de Vite
mostrar_fix "🔧 Actualizando configuración de Vite..."

cat > frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
EOF

mostrar_exito "✅ Configuración de Vite actualizada"

# 4. Actualizar App.tsx con mejor manejo de errores
mostrar_fix "⚛️ Actualizando App.tsx con mejor manejo de errores..."

cat > frontend/src/App.tsx << 'EOF'
import { useState, useEffect } from 'react'

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Verificando...')
  const [connectionDetails, setConnectionDetails] = useState<string>('')

  useEffect(() => {
    const verificarConexion = async () => {
      try {
        console.log('🔍 Intentando conectar a /api/...')
        
        const response = await fetch('/api/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })
        
        console.log('📡 Respuesta recibida:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text()
          throw new Error(`Respuesta no es JSON. Content-Type: ${contentType}. Contenido: ${text.substring(0, 100)}...`)
        }
        
        const data = await response.json()
        console.log('✅ Datos recibidos:', data)
        
        setBackendStatus(`✅ Backend conectado: ${data.mensaje}`)
        setConnectionDetails(`Versión: ${data.version} | Estado: ${data.estado}`)
        
      } catch (error) {
        console.error('❌ Error detallado:', error)
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setBackendStatus('❌ Error de red: No se puede conectar al backend')
          setConnectionDetails('Verifica que Django esté ejecutándose en puerto 8000')
        } else if (error instanceof SyntaxError) {
          setBackendStatus('❌ Error de JSON: Respuesta no válida del servidor')
          setConnectionDetails('El servidor no está devolviendo JSON válido')
        } else {
          setBackendStatus(`❌ Error: ${error.message}`)
          setConnectionDetails('Revisa la consola del navegador para más detalles')
        }
      }
    }
    
    verificarConexion()
    
    // Reintentar cada 30 segundos si hay error
    const interval = setInterval(() => {
      if (backendStatus.includes('❌')) {
        verificarConexion()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [backendStatus])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🧾 FELICITAFAC
          </h1>
          <p className="text-gray-600">
            Sistema de Facturación Electrónica para Perú
          </p>
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold text-gray-700 mb-2">Estado del Sistema</h2>
          <p className={`text-sm mb-2 ${backendStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {backendStatus}
          </p>
          {connectionDetails && (
            <p className="text-xs text-gray-500 mb-2">{connectionDetails}</p>
          )}
          <p className="text-sm text-green-600">✅ Frontend React funcionando</p>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Fase 1:</strong> Configuración MySQL y Arquitectura Base
            </p>
            <p className="text-xs text-blue-600 mt-1">
              ✅ Backend Django + MySQL configurado
            </p>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Próximas Fases:</strong>
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Fase 2: Autenticación • Fase 3: APIs • Fase 4: POS Frontend
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Acceso Admin: <a href="http://localhost:8000/admin" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">localhost:8000/admin</a>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            API Directa: <a href="http://localhost:8000/api/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">localhost:8000/api/</a>
          </p>
        </div>
        
        {/* Panel de debug */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-left">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">🔧 Debug Info</h3>
          <p className="text-xs text-gray-600">Puerto Frontend: 3000</p>
          <p className="text-xs text-gray-600">Proxy: /api → localhost:8000</p>
          <p className="text-xs text-gray-600">Timestamp: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

export default App
EOF

mostrar_exito "✅ App.tsx actualizado con mejor diagnóstico"

# 5. Crear archivo de variables de entorno para Vite
mostrar_fix "🌍 Configurando variables de entorno..."

cat > frontend/.env.local << 'EOF'
# FELICITAFAC - Variables de entorno para desarrollo
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_DEBUG=true
EOF

# 6. Reiniciar frontend React
mostrar_fix "🔄 Reiniciando frontend React..."

# Detener React si está ejecutándose
pkill -f "npm.*run.*dev" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true
sleep 2

cd frontend

# Verificar dependencias
if [ ! -d "node_modules" ]; then
    mostrar_error "Dependencias no instaladas. Ejecutando npm install..."
    npm install
fi

# Limpiar caché de Vite
rm -rf dist .vite node_modules/.vite

# Crear directorio de logs
mkdir -p ../logs

# Iniciar React con configuración actualizada
echo ""
mostrar_mensaje "🚀 Iniciando React con configuración corregida..."

export VITE_API_URL="http://localhost:8000"
export VITE_ENVIRONMENT="development"

nohup npm run dev -- --port 3000 --host 0.0.0.0 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

echo $FRONTEND_PID > ../logs/frontend.pid

cd ..

# 7. Esperar que React esté listo
mostrar_mensaje "⏳ Esperando que React esté listo..."

contador=0
while [ $contador -lt 20 ]; do
    if curl -s http://localhost:3000/ > /dev/null 2>&1; then
        mostrar_exito "✅ React iniciado exitosamente"
        break
    fi
    echo -n "."
    sleep 2
    ((contador++))
done

if [ $contador -eq 20 ]; then
    mostrar_error "❌ React no respondió en 40 segundos"
    echo "📝 Revisa logs: tail -f logs/frontend.log"
    exit 1
fi

echo ""

# 8. Verificación final del proxy
mostrar_mensaje "🔍 VERIFICACIÓN FINAL DEL PROXY"
echo ""

# Probar desde el proxy de Vite
echo "Probando proxy Vite → Django..."
PROXY_TEST=$(curl -s -w "%{http_code}" http://localhost:3000/api/ 2>/dev/null || echo "000")

if echo "$PROXY_TEST" | grep -q "200"; then
    mostrar_exito "✅ Proxy Vite → Django funcionando correctamente"
    echo ""
    echo "🎉 ¡PROBLEMA DEL PROXY RESUELTO!"
    echo ""
    echo "✅ Django: http://localhost:8000/api/ → 200 OK"
    echo "✅ Proxy: http://localhost:3000/api/ → 200 OK"
    echo "✅ React: http://localhost:3000 → Funcionando"
    echo ""
    echo "🌐 Abre en el navegador: http://localhost:3000"
    echo "   Deberías ver: ✅ Backend conectado: ¡Bienvenido a FELICITAFAC API!"
    
else
    mostrar_error "❌ El proxy todavía no funciona correctamente"
    echo ""
    echo "📋 DIAGNÓSTICO MANUAL:"
    echo ""
    echo "1. 🔍 Verifica logs del frontend:"
    echo "   tail -f logs/frontend.log"
    echo ""
    echo "2. 🌐 Prueba directamente:"
    echo "   curl http://localhost:8000/api/  # Debe funcionar"
    echo "   curl http://localhost:3000/api/  # Debe funcionar via proxy"
    echo ""
    echo "3. 🔧 Si persiste, reinicia ambos servicios:"
    echo "   ./scripts/detener-desarrollo.sh"
    echo "   ./scripts/iniciar-desarrollo.sh"
fi

echo ""
echo "📋 CONFIGURACIÓN ACTUALIZADA:"
echo "============================"
echo "✅ Vite proxy con logs detallados"
echo "✅ App.tsx con mejor manejo de errores"
echo "✅ Variables de entorno configuradas"
echo "✅ Logs de debug habilitados"
echo ""
echo "📝 LOGS ÚTILES:"
echo "==============="
echo "Frontend: tail -f logs/frontend.log"
echo "Backend: tail -f logs/backend.log"
echo ""
echo "🔧 BACKUPS EN: backups/frontend_$TIMESTAMP/"