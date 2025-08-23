/**
 * frontend/src/paginas/admin/Dashboard.tsx
 * Dashboard Principal Administrativo - CORREGIDO SIN DUPLICACIÓN
 * 
 * 🔧 PROBLEMA SOLUCIONADO: Eliminada duplicación de layouts
 * ✅ AHORA: Solo contenido interno sin LayoutAdmin wrapper
 */

import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Users, Package, FileText, TrendingUp, AlertTriangle,
  DollarSign, ShoppingCart, Calendar, Bell, Activity, Target,
  RefreshCw, Download, Filter, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/ui/card';
import { Button } from '../../componentes/ui/button';
import { Badge } from '../../componentes/ui/bagde';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../componentes/ui/tabs';
import { useAuth } from '../../hooks/useAuth';
import { useFacturacion } from '../../hooks/useFacturacion';
import { useClientes } from '../../hooks/useClientes';
import { useProductos } from '../../hooks/useProductos';
import { useInventario } from '../../hooks/useInventario';
import { formatearMoneda, formatearNumero } from '../../utils/formateo';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

// =======================================================
// INTERFACES
// =======================================================

interface MetricaDashboard {
  id: string;
  titulo: string;
  valor: string;
  cambio: string;
  tendencia: 'positiva' | 'negativa' | 'neutral';
  icono: React.ReactNode;
  color: string;
  enlace?: string;
}

interface AlertaDashboard {
  id: string;
  tipo: 'critica' | 'importante' | 'informativa';
  titulo: string;
  mensaje: string;
  fecha: string;
  accion?: string;
  enlace?: string;
}

interface DocumentoReciente {
  id: string;
  numero: string;
  tipo: string;
  cliente: string;
  monto: number;
  estado: string;
  fecha: string;
}

// =======================================================
// DATOS MOCK (temporal hasta API)
// =======================================================

const datosVentas = [
  { mes: 'Ene', ventas: 4500 },
  { mes: 'Feb', ventas: 5200 },
  { mes: 'Mar', ventas: 4800 },
  { mes: 'Abr', ventas: 6100 },
  { mes: 'May', ventas: 5900 },
  { mes: 'Jun', ventas: 6800 },
];

const datosDocumentos = [
  { tipo: 'Facturas', cantidad: 145, color: '#3B82F6' },
  { tipo: 'Boletas', cantidad: 89, color: '#10B981' },
  { tipo: 'Notas', cantidad: 23, color: '#F59E0B' },
];

// =======================================================
// COMPONENTES AUXILIARES
// =======================================================

const WidgetMetrica: React.FC<{ metrica: MetricaDashboard }> = ({ metrica }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{metrica.titulo}</p>
          <h3 className="text-2xl font-bold text-gray-900">{metrica.valor}</h3>
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${
              metrica.tendencia === 'positiva' ? 'text-green-600' :
              metrica.tendencia === 'negativa' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {metrica.cambio}
            </span>
            <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${metrica.color}`}>
          {metrica.icono}
        </div>
      </div>
    </CardContent>
  </Card>
);

const AlertaCard: React.FC<{ alerta: AlertaDashboard }> = ({ alerta }) => (
  <div className={`p-4 rounded-lg border-l-4 ${
    alerta.tipo === 'critica' ? 'border-red-500 bg-red-50' :
    alerta.tipo === 'importante' ? 'border-yellow-500 bg-yellow-50' :
    'border-blue-500 bg-blue-50'
  }`}>
    <div className="flex items-start justify-between">
      <div>
        <h4 className="font-medium text-gray-900">{alerta.titulo}</h4>
        <p className="text-sm text-gray-600 mt-1">{alerta.mensaje}</p>
      </div>
      {alerta.accion && (
        <Button variant="outline" size="sm">
          {alerta.accion}
        </Button>
      )}
    </div>
  </div>
);

const TablaDocumentosRecientes: React.FC<{ documentos: DocumentoReciente[] }> = ({ documentos }) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg font-medium">Documentos Recientes</CardTitle>
        <Button variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {documentos.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{doc.numero}</p>
                  <p className="text-sm text-gray-500">{doc.cliente}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatearMoneda(doc.monto)}</p>
              <Badge variant={doc.estado === 'Enviado' ? 'success' : doc.estado === 'Pendiente' ? 'warning' : 'destructive'}>
                {doc.estado}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// =======================================================
// COMPONENTE PRINCIPAL - SIN LAYOUT ADMIN
// =======================================================

const Dashboard: React.FC = () => {
  const { usuario } = useAuth();
  
  // Estados
  const [metricas, setMetricas] = useState<MetricaDashboard[]>([]);
  const [alertasDashboard, setAlertasDashboard] = useState<AlertaDashboard[]>([]);
  const [documentosRecientes, setDocumentosRecientes] = useState<DocumentoReciente[]>([]);
  const [cargandoDashboard, setCargandoDashboard] = useState(false);
  const [periodoActual, setPeriodoActual] = useState('hoy');

  // Hooks de datos (corregidos para usar solo funciones existentes)
  const { obtenerResumenVentas, cargando: cargandoFacturacion } = useFacturacion();
  const { listarClientes } = useClientes();
  const { productos, totalProductos } = useProductos();
  const { stockProductos } = useInventario();

  // =======================================================
  // EFECTOS
  // =======================================================

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      actualizarMetricas();
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // =======================================================
  // FUNCIONES
  // =======================================================

  const cargarDatosDashboard = async () => {
    setCargandoDashboard(true);
    try {
      await Promise.all([
        cargarMetricas(),
        cargarDocumentosRecientes(),
        cargarAlertas(),
      ]);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setCargandoDashboard(false);
    }
  };

  const cargarMetricas = async () => {
    // Datos mock - reemplazar con API real
    const metricasData: MetricaDashboard[] = [
      {
        id: 'ventas-hoy',
        titulo: 'Ventas de Hoy',
        valor: 'S/. 0.00',
        cambio: '+12.5%',
        tendencia: 'positiva',
        icono: <DollarSign className="h-6 w-6 text-white" />,
        color: 'bg-green-500',
      },
      {
        id: 'documentos-pendientes',
        titulo: 'Documentos Pendientes',
        valor: '0.00',
        cambio: '-8.2%',
        tendencia: 'negativa',
        icono: <FileText className="h-6 w-6 text-white" />,
        color: 'bg-blue-500',
      },
      {
        id: 'clientes-total',
        titulo: 'Total Clientes',
        valor: '0.00',
        cambio: '+15.3%',
        tendencia: 'positiva',
        icono: <Users className="h-6 w-6 text-white" />,
        color: 'bg-purple-500',
      },
      {
        id: 'productos-stock-bajo',
        titulo: 'Productos Stock Bajo',
        valor: '0',
        cambio: '+0 mes anterior',
        tendencia: 'neutral',
        icono: <Package className="h-6 w-6 text-white" />,
        color: 'bg-orange-500',
      },
    ];

    setMetricas(metricasData);
  };

  const cargarDocumentosRecientes = async () => {
    // Datos mock - reemplazar con API real
    const documentosData: DocumentoReciente[] = [
      {
        id: '1',
        numero: 'F001-00000001',
        tipo: 'Factura',
        cliente: 'Cliente Ejemplo',
        monto: 1250.00,
        estado: 'Enviado',
        fecha: '2024-01-15',
      },
    ];

    setDocumentosRecientes(documentosData);
  };

  const cargarAlertas = async () => {
    // Datos mock - reemplazar con API real
    const alertasData: AlertaDashboard[] = [
      {
        id: '1',
        tipo: 'informativa',
        titulo: 'Sistema funcionando correctamente',
        mensaje: 'Todas las funciones principales están operativas.',
        fecha: '2024-01-15',
      },
    ];

    setAlertasDashboard(alertasData);
  };

  const actualizarMetricas = async () => {
    try {
      await cargarMetricas();
    } catch (error) {
      console.error('Error actualizando métricas:', error);
    }
  };

  const handleCambiarPeriodo = (nuevoPeriodo: string) => {
    setPeriodoActual(nuevoPeriodo);
    cargarDatosDashboard();
  };

  // =======================================================
  // RENDER - SOLO CONTENIDO INTERNO
  // =======================================================

  if (cargandoDashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              ¡Bienvenido, {usuario?.nombres || 'Usuario'}!
            </h1>
            <p className="text-blue-100">
              Resumen de actividad de tu sistema de facturación
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Panel de Control</h2>
        <div className="flex items-center gap-2">
          {['hoy', 'semana', 'mes', 'trimestre'].map((periodo) => (
            <Button
              key={periodo}
              variant={periodoActual === periodo ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleCambiarPeriodo(periodo)}
              className="capitalize"
            >
              {periodo}
            </Button>
          ))}
        </div>
      </div>

      {/* Widgets de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricas.map((metrica) => (
          <WidgetMetrica key={metrica.id} metrica={metrica} />
        ))}
      </div>

      {/* Contenido Principal */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Columna Principal - Gráficos */}
        <div className="xl:col-span-2 space-y-6">
          {/* Gráfico de Ventas */}
          <Card>
            <CardHeader>
              <CardTitle>Ventas de los Últimos 6 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datosVentas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatearMoneda(Number(value)), 'Ventas']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ventas" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución de Documentos */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={datosDocumentos}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="cantidad"
                    label={({ tipo, cantidad }) => `${tipo}: ${cantidad}`}
                  >
                    {datosDocumentos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Columna Documentos */}
        <div className="space-y-6">
          <TablaDocumentosRecientes documentos={documentosRecientes} />
        </div>

        {/* Columna Accesos Rápidos */}
        <div className="space-y-6">
          {/* Accesos Rápidos */}
          <Card>
            <CardHeader>
              <CardTitle>Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="flex flex-col items-center py-4 h-auto">
                  <FileText className="h-5 w-5 mb-2" />
                  <span className="text-xs">Nueva Factura</span>
                </Button>
                <Button variant="outline" size="sm" className="flex flex-col items-center py-4 h-auto">
                  <Users className="h-5 w-5 mb-2" />
                  <span className="text-xs">Nuevo Cliente</span>
                </Button>
                <Button variant="outline" size="sm" className="flex flex-col items-center py-4 h-auto">
                  <Package className="h-5 w-5 mb-2" />
                  <span className="text-xs">Nuevo Producto</span>
                </Button>
                <Button variant="outline" size="sm" className="flex flex-col items-center py-4 h-auto">
                  <BarChart3 className="h-5 w-5 mb-2" />
                  <span className="text-xs">Ver Reportes</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alertas del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertas del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertasDashboard.length > 0 ? (
                  alertasDashboard.map((alerta) => (
                    <AlertaCard key={alerta.id} alerta={alerta} />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay alertas pendientes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;