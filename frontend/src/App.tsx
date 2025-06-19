import { useState, useEffect } from 'react'

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Verificando...')

  useEffect(() => {
    // Verificar conexión con backend
    fetch('/api/')
      .then(response => response.json())
      .then(data => {
        setBackendStatus(`✅ Backend conectado: ${data.mensaje}`)
      })
      .catch(() => {
        setBackendStatus('❌ Backend no disponible')
      })
  }, [])

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
          <p className="text-sm text-gray-600 mb-2">{backendStatus}</p>
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
            Acceso Admin: <a href="/admin" className="text-blue-600 hover:underline">localhost:8000/admin</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App