import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PuntoDeVenta from './paginas/PuntoDeVenta'

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
    
    const interval = setInterval(() => {
      if (backendStatus.includes('❌')) {
        verificarConexion()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [backendStatus])

  // Componente de Dashboard/Home
  const Dashboard = () => (
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
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>✅ Fase 4:</strong> Punto de Venta Frontend
            </p>
            <p className="text-xs text-green-600 mt-1">
              POS completo con facturación SUNAT
            </p>
            <div className="mt-3">
              <a 
                href="/pos" 
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                🏪 Abrir Punto de Venta
              </a>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Fases Completadas:</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              ✅ Fase 1: MySQL + Django • ✅ Fase 2: Auth • ✅ Fase 3: APIs • ✅ Fase 4: POS
            </p>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Próximas Fases:</strong>
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Fase 5: Dashboard • Fase 6: Admin • Fase 7: Deploy
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a href="http://localhost:8000/admin" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              🔧 Admin Django
            </a>
            <a href="http://localhost:8000/api/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              📡 API REST
            </a>
            <a href="/pos" className="text-green-600 hover:underline">
              🏪 Punto de Venta
            </a>
            <span className="text-gray-500">📊 Dashboard (Próximo)</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-left">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">🔧 Debug Info</h3>
          <p className="text-xs text-gray-600">Puerto Frontend: 3000</p>
          <p className="text-xs text-gray-600">Proxy: /api → localhost:8000</p>
          <p className="text-xs text-gray-600">Timestamp: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  )

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pos" element={<PuntoDeVenta />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App