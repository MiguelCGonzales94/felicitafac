// ================================================================
// 5. PÁGINAS DE FACTURACIÓN
// ================================================================

/**
 * frontend/src/paginas/admin/facturacion/DashboardFacturacion.tsx
 * Dashboard específico del módulo de facturación
 */
import React, { useEffect, useState } from 'react';
import { 
  FileText, PlusCircle, Clock, CheckCircle, XCircle, 
  TrendingUp, DollarSign, Calendar, AlertCircle
} from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Badge } from '../../../componentes/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../componentes/ui/tabs';
import { useFacturacion } from '../../../hooks/useFacturacion';
import { useNavigate } from 'react-router-dom';
import { formatearMoneda, formatearNumero, formatearFecha } from '../../../utils/formatters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const DashboardFacturacion: React.FC = () => {
  const navigate = useNavigate();
  const { 
    estadisticasVentas, 
    documentosRecientes, 
    estadosSunat,
    obtenerEstadisticasVentas,
    obtenerDocumentosRecientes,
    obtenerEstadosSunat,
    cargandoDatos 
  } = useFacturacion();

  const [datosGrafico, setDatosGrafico] = useState<any[]>([]);

  useEffect(() => {
    cargarDatosFacturacion();
  }, []);

  const cargarDatosFacturacion = async () => {
    try {
      await Promise.all([
        obtenerEstadisticasVentas(),
        obtenerDocumentosRecientes(),
        obtenerEstadosSunat()
      ]);
      generarDatosGrafico();
    } catch (error) {
      console.error('Error cargando datos de facturación:', error);
    }
  };

  const generarDatosGrafico = () => {
    // Datos de ejemplo para el gráfico
    const datos = [
      { nombre: 'Facturas', cantidad: estadisticasVentas?.totalFacturas || 0, color: '#3B82F6' },
      { nombre: 'Boletas', cantidad: estadisticasVentas?.totalBoletas || 0, color: '#10B981' },
      { nombre: 'N. Crédito', cantidad: estadisticasVentas?.totalNotasCredito || 0, color: '#F59E0B' },
      { nombre: 'N. Débito', cantidad: estadisticasVentas?.totalNotasDebito || 0, color: '#EF4444' }
    ];
    setDatosGrafico(datos);
  };

  const MetricaFacturacion: React.FC<{
    titulo: string;
    valor: string;
    cambio?: string;
    icono: React.ReactNode;
    color: string;
    onClick?: () => void;
  }> = ({ titulo, valor, cambio, icono, color, onClick }) => (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'hover:bg-gray-50' : ''}`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{titulo}</p>
            <p className="text-2xl font-bold text-gray-900">{valor}</p>
            {cambio && (
              <p className="text-sm text-green-600">{cambio}</p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-gray-100 ${color}`}>
            {icono}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DocumentoReciente: React.FC<{ documento: any }> = ({ documento }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-white rounded">
          <FileText className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{documento.numero_completo}</p>
          <p className="text-sm text-gray-600">{documento.cliente?.nombre_o_razon_social}</p>
          <p className="text-xs text-gray-500">{formatearFecha(documento.fecha_emision)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">{formatearMoneda(documento.total)}</p>
        <Badge 
          variant={documento.estado === 'emitida' ? 'default' : 'secondary'}
          className="text-xs"
        >
          {documento.estado}
        </Badge>
      </div>
    </div>
  );

  return (
    <LayoutAdmin
      title="Dashboard de Facturación"
      description="Control y estadísticas de facturación electrónica"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Facturación' }
      ]}
    >
      <div className="space-y-6">
        {/* Acciones Rápidas */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Facturación Electrónica</h1>
          <div className="flex space-x-3">
            <Button onClick={() => navigate('/admin/facturacion/nueva-factura')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/facturacion/pos')}>
              <FileText className="h-4 w-4 mr-2" />
              Punto de Venta
            </Button>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricaFacturacion
            titulo="Ventas de Hoy"
            valor={formatearMoneda(estadisticasVentas?.ventasHoy || 0)}
            cambio="+12.5%"
            icono={<DollarSign className="h-5 w-5" />}
            color="text-green-600"
            onClick={() => navigate('/admin/facturacion/documentos?fecha=hoy')}
          />
          <MetricaFacturacion
            titulo="Documentos Emitidos"
            valor={formatearNumero(estadisticasVentas?.documentosHoy || 0)}
            cambio="+8"
            icono={<FileText className="h-5 w-5" />}
            color="text-blue-600"
            onClick={() => navigate('/admin/facturacion/documentos')}
          />
          <MetricaFacturacion
            titulo="Pendientes SUNAT"
            valor={formatearNumero(estadosSunat?.pendientes || 0)}
            icono={<Clock className="h-5 w-5" />}
            color="text-orange-600"
            onClick={() => navigate('/admin/facturacion/estados-sunat')}
          />
          <MetricaFacturacion
            titulo="Errores SUNAT"
            valor={formatearNumero(estadosSunat?.errores || 0)}
            icono={<XCircle className="h-5 w-5" />}
            color="text-red-600"
            onClick={() => navigate('/admin/facturacion/estados-sunat?estado=error')}
          />
        </div>

        {/* Gráficos y Documentos Recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Tipos de Documento */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos por Tipo (Este Mes)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosGrafico}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cantidad"
                      label={({ nombre, cantidad }) => `${nombre}: ${cantidad}`}
                    >
                      {datosGrafico.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Documentos Recientes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Documentos Recientes</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/facturacion/documentos')}>
                  Ver Todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documentosRecientes?.length > 0 ? (
                  documentosRecientes.slice(0, 5).map((documento) => (
                    <DocumentoReciente key={documento.id} documento={documento} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay documentos recientes</p>
                    <Button className="mt-4" onClick={() => navigate('/admin/facturacion/nueva-factura')}>
                      Crear Primera Factura
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado SUNAT y Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estado de Conexión SUNAT */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Estado SUNAT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conexión</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Activa
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Último Envío</span>
                  <span className="text-sm text-gray-900">10:30 AM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Documentos Pendientes</span>
                  <span className="text-sm text-gray-900">{estadosSunat?.pendientes || 0}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/facturacion/estados-sunat')}>
                  Ver Estado Completo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Series de Documentos */}
          <Card>
            <CardHeader>
              <CardTitle>Series de Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">F001 - Facturas</span>
                  <span className="text-sm text-gray-900">Núm: 1250</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">B001 - Boletas</span>
                  <span className="text-sm text-gray-900">Núm: 875</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">BC01 - Notas Crédito</span>
                  <span className="text-sm text-gray-900">Núm: 45</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/facturacion/configuracion-series')}>
                  Gestionar Series
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/facturacion/nueva-factura')}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nueva Factura
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/facturacion/nueva-boleta')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Nueva Boleta
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/reportes/ventas')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Reportes de Ventas
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/facturacion/configuracion')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerta de Configuración */}
        {!estadisticasVentas && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-500 mr-3" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-800">Configuración Inicial Requerida</h4>
                  <p className="text-sm text-orange-700">
                    Para comenzar a facturar, necesitas configurar tu empresa y series de documentos.
                  </p>
                </div>
                <Button onClick={() => navigate('/admin/facturacion/configuracion')}>
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default DashboardFacturacion;

