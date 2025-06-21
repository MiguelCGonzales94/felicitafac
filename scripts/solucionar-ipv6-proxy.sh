#!/bin/bash

# FELICITAFAC - Solucionar Problema IPv6 del Proxy
# Resuelve: ECONNREFUSED ::1:8000

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

mostrar_mensaje() {
    echo -e "${BLUE}[FELICITAFAC]${NC} $1"
}

mostrar_exito() {
    echo -e "${GREEN}[ÉXITO]${NC} $1"
}

mostrar_fix() {
    echo -e "${PURPLE}[FIX]${NC} $1"
}

echo ""
echo "🔧 FELICITAFAC - Solucionador IPv6 Proxy"
echo "========================================"
echo ""

mostrar_mensaje "🔍 Problema identificado: IPv6 vs IPv4"
echo ""
echo "❌ Django en IPv4: 127.0.0.1:8000"
echo "❌ Vite proxy en IPv6: ::1:8000"
echo "✅ Solución: Forzar IPv4 en ambos"
echo ""

# 1. Detener servicios actuales
mostrar_fix "🛑 Deteniendo servicios actuales..."
pkill -f "manage.py runserver" 2>/dev/null || true
pkill -f "npm.*run.*dev" 2>/dev/null || true
sleep 2

# 2. Configurar Vite para IPv4
mostrar_fix "⚛️ Configurando Vite para IPv4..."

cat > frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',  // IPv4 específico
        changeOrigin: true,
        secure: false,
        ws: true,
        timeout: 10000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error:', err.message);
            console.log('🔍 Target:', req.url);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Request:', req.method, req.url, '→ 127.0.0.1:8000');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Response:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
EOF

mostrar_exito "✅ Vite configurado para IPv4"

# 3. Iniciar Django en IPv4
mostrar_fix "🐍 Iniciando Django en IPv4..."

cd backend

if [ -d "venv" ]; then
    source venv/bin/activate
fi

mkdir -p ../logs

# Iniciar Django específicamente en IPv4
nohup python manage.py runserver 127.0.0.1:8000 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid

mostrar_exito "✅ Django iniciado en 127.0.0.1:8000 (PID: $BACKEND_PID)"

cd ..

# 4. Esperar Django
mostrar_mensaje "⏳ Esperando Django..."
contador=0
while [ $contador -lt 15 ]; do
    if curl -s http://127.0.0.1:8000/api/ | grep -q "mensaje"; then
        mostrar_exito "✅ Django listo en IPv4"
        break
    fi
    echo -n "."
    sleep 2
    ((contador++))
done

if [ $contador -eq 15 ]; then
    echo ""
    mostrar_error "❌ Django no respondió en IPv4"
    exit 1
fi

# 5. Iniciar React con nueva configuración
mostrar_fix "⚛️ Iniciando React con configuración IPv4..."

cd frontend

# Limpiar caché
rm -rf .vite node_modules/.vite

export VITE_API_URL="http://127.0.0.1:8000"

nohup npm run dev -- --port 3000 --host 0.0.0.0 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid

mostrar_exito "✅ React iniciado (PID: $FRONTEND_PID)"

cd ..

# 6. Verificación final
mostrar_mensaje "⏳ Verificando conexión IPv4..."

contador=0
while [ $contador -lt 15 ]; do
    if curl -s http://localhost:3000/ > /dev/null 2>&1; then
        mostrar_exito "✅ React listo"
        break
    fi
    echo -n "."
    sleep 2
    ((contador++))
done

echo ""

# Probar proxy IPv4
if curl -s http://localhost:3000/api/ | grep -q "mensaje"; then
    mostrar_exito "🎉 ¡PROBLEMA IPv6 RESUELTO!"
    echo ""
    echo "✅ Django: 127.0.0.1:8000 ← IPv4"
    echo "✅ Proxy: localhost:3000/api → 127.0.0.1:8000 ← IPv4"
    echo "✅ Conexión exitosa"
    echo ""
    echo "🌐 Abre: http://localhost:3000"
    echo "📝 Logs: tail -f logs/frontend.log"
else
    echo ""
    echo "⚠️ Verificación manual necesaria"
    echo ""
    echo "🔍 Prueba estos comandos:"
    echo "curl http://127.0.0.1:8000/api/    # Django directo"
    echo "curl http://localhost:3000/api/    # Via proxy"
    echo ""
    echo "📝 Logs del frontend:"
    tail -10 logs/frontend.log
fi

echo ""
echo "📋 CONFIGURACIÓN FINAL:"
echo "======================"
echo "🐍 Django: 127.0.0.1:8000 (IPv4)"
echo "⚛️ React: localhost:3000"
echo "🔗 Proxy: /api → 127.0.0.1:8000 (IPv4)"
echo ""
echo "📝 Logs en tiempo real:"
echo "Backend: tail -f logs/backend.log"
echo "Frontend: tail -f logs/frontend.log"