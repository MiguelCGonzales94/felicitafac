// ================================================================
// 10. PÁGINAS DE REPORTES
// ================================================================

/**
 * frontend/src/paginas/admin/reportes/DashboardReportes.tsx
 * Dashboard principal de reportes
 */
import React, { useEffect, useState } from 'react';
import { 
  BarChart3, TrendingUp, FileText, Download, 
  Calendar, DollarSign, Package, Users
} from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../componentes/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { formatearMoneda } from '../../../utils/formatters';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

export const DashboardReportes: React.FC = () => {
  const navigate = useNavigate();
  const [datosGraficos, setDatosGraficos] = useState<any[]>([]);

  useEffect(() => {
    generarDatosEjemplo();
  }, []);

  const generarDatosEjemplo = () => {
    const datos = [
      { mes: 'Ene', ventas: 45000, facturas: 120, clientes: 15 },
      { mes: 'Feb', ventas: 52000, facturas: 140, clientes: 22 },
      { mes: 'Mar', ventas: 48000, facturas: 135, clientes: 18 },
      { mes: 'Abr', ventas: 61000, facturas: 165, clientes: 28 },
      { mes: 'May', ventas: 55000, facturas: 150, clientes: 25 },
      { mes: 'Jun', ventas: 67000, facturas: 180, clientes: 32 }
    ];
    setDatosGraficos(datos);
  };

  const ReporteCard: React.FC<{
    titulo: string;
    descripcion: string;
    icono: React.ReactNode;
    color: string;
    enlace: string;
  }> = ({ titulo, descripcion, icono, color, enlace }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(enlace)}>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full bg-gray-100 ${color}`}>
            {icono}
          </div>
          <div className="ml-4">
            <h3 className="font-medium text-gray-900">{titulo}</h3>
            <p className="text-sm text-gray-600">{descripcion}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <LayoutAdmin
      title="Dashboard de Reportes"
      description="Centro de reportes y analytics del sistema"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Reportes' }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Centro de Reportes</h1>
            <p className="text-gray-600">Analytics y reportes del sistema</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Programar Reporte
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exportar Datos
            </Button>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ventas del Mes</p>
                  <p className="text-2xl font-bold text-gray-900">{formatearMoneda(67000)}</p>
                  <p className="text-sm text-green-600">+12.5% vs mes anterior</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documentos Emitidos</p>
                  <p className="text-2xl font-bold text-gray-900">180</p>
                  <p className="text-sm text-green-600">+8.2% vs mes anterior</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clientes Nuevos</p>
                  <p className="text-2xl font-bold text-gray-900">32</p>
                  <p className="text-sm text-green-600">+28% vs mes anterior</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Productos Vendidos</p>
                  <p className="text-2xl font-bold text-gray-900">1,245</p>
                  <p className="text-sm text-green-600">+15.3% vs mes anterior</p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosGraficos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatearMoneda(Number(value))} />
                    <Line 
                      type="monotone" 
                      dataKey="ventas" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosGraficos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="facturas" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reportes Disponibles */}
        <Tabs defaultValue="ventas" className="w-full">
          <TabsList>
            <TabsTrigger value="ventas">Reportes de Ventas</TabsTrigger>
            <TabsTrigger value="sunat">Reportes SUNAT</TabsTrigger>
            <TabsTrigger value="inventario">Reportes de Inventario</TabsTrigger>
            <TabsTrigger value="financieros">Reportes Financieros</TabsTrigger>
          </TabsList>

          <TabsContent value="ventas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ReporteCard
                titulo="Reporte de Ventas"
                descripcion="Ventas por período, producto y cliente"
                icono={<TrendingUp className="h-6 w-6" />}
                color="text-green-600"
                enlace="/admin/reportes/ventas"
              />
              <ReporteCard
                titulo="Ranking de Productos"
                descripcion="Productos más vendidos"
                icono={<BarChart3 className="h-6 w-6" />}
                color="text-blue-600"
                enlace="/admin/reportes/productos"
              />
              <ReporteCard
                titulo="Análisis de Clientes"
                descripcion="Comportamiento y estadísticas"
                icono={<Users className="h-6 w-6" />}
                color="text-purple-600"
                enlace="/admin/reportes/clientes"
              />
            </div>
          </TabsContent>

          <TabsContent value="sunat">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ReporteCard
                titulo="PLE - Ventas"
                descripcion="Programa de Libros Electrónicos"
                icono={<FileText className="h-6 w-6" />}
                color="text-red-600"
                enlace="/admin/reportes/ple-ventas"
              />
              <ReporteCard
                titulo="Registro de Ventas"
                descripcion="Libro de ventas detallado"
                icono={<FileText className="h-6 w-6" />}
                color="text-orange-600"
                enlace="/admin/reportes/registro-ventas"
              />
              <ReporteCard
                titulo="Resumen SUNAT"
                descripcion="Estado de documentos electrónicos"
                icono={<BarChart3 className="h-6 w-6" />}
                color="text-blue-600"
                enlace="/admin/reportes/sunat"
              />
            </div>
          </TabsContent>

          <TabsContent value="inventario">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ReporteCard
                titulo="Valorización de Inventario"
                descripcion="Valor actual del stock"
                icono={<Package className="h-6 w-6" />}
                color="text-green-600"
                enlace="/admin/reportes/valorizacion"
              />
              <ReporteCard
                titulo="Kardex PEPS"
                descripción="Movimientos valorizados"
                icono={<BarChart3 className="h-6 w-6" />}
                color="text-blue-600"
                enlace="/admin/reportes/kardex"
              />
              <ReporteCard
                titulo="Stock Crítico"
                descripcion="Productos con stock bajo"
                icono={<Package className="h-6 w-6" />}
                color="text-orange-600"
                enlace="/admin/reportes/stock-critico"
              />
            </div>
          </TabsContent>

          <TabsContent value="financieros">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ReporteCard
                titulo="Estado de Resultados"
                descripcion="Ingresos y gastos del período"
                icono={<DollarSign className="h-6 w-6" />}
                color="text-green-600"
                enlace="/admin/reportes/estado-resultados"
              />
              <ReporteCard
                titulo="Flujo de Caja"
                descripcion="Entradas y salidas de efectivo"
                icono={<TrendingUp className="h-6 w-6" />}
                color="text-blue-600"
                enlace="/admin/reportes/flujo-caja"
              />
              <ReporteCard
                titulo="Cuentas por Cobrar"
                descripcion="Pendientes de cobro"
                icono={<FileText className="h-6 w-6" />}
                color="text-orange-600"
                enlace="/admin/reportes/cuentas-cobrar"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutAdmin>
  );
};

export default DashboardReportes;

