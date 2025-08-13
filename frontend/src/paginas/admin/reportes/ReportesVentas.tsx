/**
 * frontend/src/paginas/admin/reportes/ReportesVentas.tsx
 * Reportes específicos de ventas
 */
import React, { useState, useEffect } from 'react';
import { Download, Filter, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Input } from '../../../componentes/ui/input';
import { Label } from '../../../componentes/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../componentes/ui/select';
import { formatearMoneda } from '../../../utils/formatters';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const ReportesVentas: React.FC = () => {
  const [filtros, setFiltros] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    periodo: 'mes_actual',
    agrupacion: 'dia'
  });

  const [datosReporte, setDatosReporte] = useState([]);
  const [cargando, setCargando] = useState(false);

  const generarReporte = async () => {
    setCargando(true);
    // Simular carga de datos
    setTimeout(() => {
      const datos = [
        { fecha: '01/06', ventas: 12500, documentos: 25 },
        { fecha: '02/06', ventas: 15300, documentos: 32 },
        { fecha: '03/06', ventas: 18200, documentos: 28 },
        { fecha: '04/06', ventas: 14800, documentos: 30 },
        { fecha: '05/06', ventas: 16900, documentos: 35 }
      ];
      setDatosReporte(datos);
      setCargando(false);
    }, 1000);
  };

  useEffect(() => {
    generarReporte();
  }, [filtros]);

  return (
    <LayoutAdmin
      title="Reportes de Ventas"
      description="Análisis detallado de ventas y documentos"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Reportes', href: '/admin/reportes' },
        { label: 'Ventas' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Reportes de Ventas</h1>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros del Reporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="periodo">Período</Label>
                <Select value={filtros.periodo} onValueChange={(value) => setFiltros({...filtros, periodo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoy">Hoy</SelectItem>
                    <SelectItem value="ayer">Ayer</SelectItem>
                    <SelectItem value="semana_actual">Esta Semana</SelectItem>
                    <SelectItem value="mes_actual">Este Mes</SelectItem>
                    <SelectItem value="trimestre_actual">Este Trimestre</SelectItem>
                    <SelectItem value="año_actual">Este Año</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {filtros.periodo === 'personalizado' && (
                <>
                  <div>
                    <Label htmlFor="fecha_desde">Desde</Label>
                    <Input
                      type="date"
                      value={filtros.fecha_desde}
                      onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_hasta">Hasta</Label>
                    <Input
                      type="date"
                      value={filtros.fecha_hasta}
                      onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="agrupacion">Agrupar por</Label>
                <Select value={filtros.agrupacion} onValueChange={(value) => setFiltros({...filtros, agrupacion: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Agrupación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dia">Día</SelectItem>
                    <SelectItem value="semana">Semana</SelectItem>
                    <SelectItem value="mes">Mes</SelectItem>
                    <SelectItem value="trimestre">Trimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                  <p className="text-2xl font-bold text-gray-900">{formatearMoneda(77700)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Documentos</p>
                  <p className="text-2xl font-bold text-gray-900">150</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Promedio Diario</p>
                  <p className="text-2xl font-bold text-gray-900">{formatearMoneda(15540)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosReporte}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
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
            )}
          </CardContent>
        </Card>

        {/* Tabla Detallada */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle por Período</CardTitle>
          </CardHeader>
          <CardContent>
            {datosReporte.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ventas</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Documentos</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Promedio</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {datosReporte.map((fila: any, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {fila.fecha}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatearMoneda(fila.ventas)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {fila.documentos}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatearMoneda(fila.ventas / fila.documentos)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay datos para mostrar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutAdmin>
  );
};

export default ReportesVentas;

