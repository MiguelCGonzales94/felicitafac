// ================================================================
// 8. PÁGINAS DE INVENTARIO
// ================================================================

/**
 * frontend/src/paginas/admin/inventario/DashboardInventario.tsx
 * Dashboard del módulo de inventario
 */
import React, { useEffect, useState } from 'react';
import { 
  Package, TrendingUp, TrendingDown, AlertTriangle, 
  BarChart3, Calendar, DollarSign, Archive
} from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Badge } from '../../../componentes/ui/bagde';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../componentes/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useInventario } from '../../../hooks/useInventario';
import { formatearMoneda } from '../../../utils/formateo';

export const DashboardInventario: React.FC = () => {
  const navigate = useNavigate();
  const { 
    estadisticasInventario, 
    movimientosRecientes, 
    alertasStock,
    obtenerEstadisticasInventario,
    obtenerMovimientosRecientes,
    obtenerAlertasStock,
    cargandoDatos 
  } = useInventario();

  useEffect(() => {
    cargarDatosInventario();
  }, []);

  const cargarDatosInventario = async () => {
    try {
      await Promise.all([
        obtenerEstadisticasInventario(),
        obtenerMovimientosRecientes(),
        obtenerAlertasStock()
      ]);
    } catch (error) {
      console.error('Error cargando datos de inventario:', error);
    }
  };

  const MetricaInventario: React.FC<{
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

  return (
    <LayoutAdmin
      title="Dashboard de Inventario"
      description="Control y gestión de inventarios PEPS"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Inventario' }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
            <p className="text-gray-600">Control PEPS y movimientos de stock</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate('/admin/inventario/movimientos')}>
              <Package className="h-4 w-4 mr-2" />
              Ver Movimientos
            </Button>
            <Button onClick={() => navigate('/admin/inventario/nuevo-movimiento')}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Nuevo Movimiento
            </Button>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricaInventario
            titulo="Valor Total Inventario"
            valor={formatearMoneda(estadisticasInventario?.valorTotal || 0)}
            cambio="+5.2%"
            icono={<DollarSign className="h-5 w-5" />}
            color="text-green-600"
            onClick={() => navigate('/admin/inventario/reporte-valorizacion')}
          />
          <MetricaInventario
            titulo="Productos en Stock"
            valor={estadisticasInventario?.productosEnStock?.toString() || '0'}
            icono={<Package className="h-5 w-5" />}
            color="text-blue-600"
            onClick={() => navigate('/admin/productos')}
          />
          <MetricaInventario
            titulo="Stock Bajo"
            valor={alertasStock?.stockBajo?.length?.toString() || '0'}
            icono={<AlertTriangle className="h-5 w-5" />}
            color="text-orange-600"
            onClick={() => navigate('/admin/inventario/stock-minimo')}
          />
          <MetricaInventario
            titulo="Movimientos Hoy"
            valor={estadisticasInventario?.movimientosHoy?.toString() || '0'}
            icono={<TrendingUp className="h-5 w-5" />}
            color="text-purple-600"
            onClick={() => navigate('/admin/inventario/movimientos?fecha=hoy')}
          />
        </div>

        {/* Alertas de Stock */}
        {alertasStock?.stockBajo && alertasStock.stockBajo.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alertas de Stock Bajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alertasStock.stockBajo.slice(0, 3).map((producto) => (
                  <div key={producto.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div>
                      <p className="font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-sm text-gray-600">
                        Stock actual: {producto.stock_actual} | Mínimo: {producto.stock_minimo}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Reabastecer
                    </Button>
                  </div>
                ))}
                {alertasStock.stockBajo.length > 3 && (
                  <Button variant="outline" className="w-full" onClick={() => navigate('/admin/inventario/stock-minimo')}>
                    Ver todas las alertas ({alertasStock.stockBajo.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs de Información */}
        <Tabs defaultValue="movimientos" className="w-full">
          <TabsList>
            <TabsTrigger value="movimientos">Movimientos Recientes</TabsTrigger>
            <TabsTrigger value="valorizacion">Valorización</TabsTrigger>
            <TabsTrigger value="kardex">Kardex PEPS</TabsTrigger>
          </TabsList>

          <TabsContent value="movimientos">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Últimos Movimientos</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/inventario/movimientos')}>
                    Ver Todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {movimientosRecientes?.length > 0 ? (
                  <div className="space-y-3">
                    {movimientosRecientes.slice(0, 5).map((movimiento) => (
                      <div key={movimiento.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded ${
                            movimiento.tipo_movimiento === 'entrada' ? 'bg-green-100' : 
                            movimiento.tipo_movimiento === 'salida' ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            {movimiento.tipo_movimiento === 'entrada' ? 
                              <TrendingUp className="h-4 w-4 text-green-600" /> :
                              movimiento.tipo_movimiento === 'salida' ?
                              <TrendingDown className="h-4 w-4 text-red-600" /> :
                              <Package className="h-4 w-4 text-blue-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{movimiento.producto.nombre}</p>
                            <p className="text-sm text-gray-600">
                              {movimiento.tipo_movimiento} - {movimiento.cantidad} {movimiento.producto.unidad_medida}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{movimiento.fecha}</p>
                          <Badge variant="outline">{movimiento.motivo}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay movimientos recientes</p>
                    <Button className="mt-4" onClick={() => navigate('/admin/inventario/nuevo-movimiento')}>
                      Registrar Primer Movimiento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="valorizacion">
            <Card>
              <CardHeader>
                <CardTitle>Valorización de Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Reporte de valorización</p>
                  <Button className="mt-4">
                    Generar Reporte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kardex">
            <Card>
              <CardHeader>
                <CardTitle>Kardex PEPS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Kardex valorizado por producto</p>
                  <Button className="mt-4" onClick={() => navigate('/admin/inventario/kardex')}>
                    Ver Kardex
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutAdmin>
  );
};

export default DashboardInventario;