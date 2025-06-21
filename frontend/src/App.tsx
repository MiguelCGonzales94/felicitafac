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
