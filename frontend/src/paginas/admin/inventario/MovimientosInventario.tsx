/**
 * frontend/src/paginas/admin/inventario/MovimientosInventario.tsx
 * Lista de movimientos de inventario
 */
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, TrendingUp, TrendingDown, 
  Package, Calendar, Download, Eye
} from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Badge } from '../../../componentes/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useInventario } from '../../../hooks/useInventario';
import { formatearFecha } from '../../../utils/formatters';
import FiltrosAvanzados from '../../../componentes/comunes/FiltrosAvanzados';
import PaginacionPersonalizada from '../../../componentes/comunes/PaginacionPersonalizada';

export const MovimientosInventario: React.FC = () => {
  const navigate = useNavigate();
  const { 
    movimientos, 
    totalMovimientos, 
    paginaActual, 
    totalPaginas,
    obtenerMovimientos,
    cargandoMovimientos 
  } = useInventario();

  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo_movimiento: '',
    motivo: '',
    fecha_desde: '',
    fecha_hasta: '',
    producto: ''
  });

  useEffect(() => {
    cargarMovimientos();
  }, [paginaActual, filtros]);

  const cargarMovimientos = async () => {
    await obtenerMovimientos(filtros);
  };

  const manejarFiltrar = (nuevosFiltros: any) => {
    setFiltros({ ...filtros, ...nuevosFiltros });
  };

  const obtenerIconoMovimiento = (tipo: string) => {
    switch (tipo) {
      case 'entrada': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'salida': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4 text-blue-600" />;
    }
  };

  const obtenerColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'entrada': return 'bg-green-100 text-green-800';
      case 'salida': return 'bg-red-100 text-red-800';
      case 'ajuste': return 'bg-blue-100 text-blue-800';
      case 'transferencia': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <LayoutAdmin
      title="Movimientos de Inventario"
      description="Historial de movimientos de stock"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Inventario', href: '/admin/inventario' },
        { label: 'Movimientos' }
      ]}
    >
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Movimientos de Inventario</h1>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={() => navigate('/admin/inventario/nuevo-movimiento')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Movimiento
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FiltrosAvanzados 
              filtros={[
                {
                  nombre: 'busqueda',
                  tipo: 'texto',
                  placeholder: 'Buscar por producto, lote...',
                  valor: filtros.busqueda
                },
                {
                  nombre: 'tipo_movimiento',
                  tipo: 'select',
                  placeholder: 'Tipo de movimiento',
                  opciones: [
                    { valor: '', etiqueta: 'Todos' },
                    { valor: 'entrada', etiqueta: 'Entrada' },
                    { valor: 'salida', etiqueta: 'Salida' },
                    { valor: 'ajuste', etiqueta: 'Ajuste' },
                    { valor: 'transferencia', etiqueta: 'Transferencia' }
                  ],
                  valor: filtros.tipo_movimiento
                },
                {
                  nombre: 'motivo',
                  tipo: 'select',
                  placeholder: 'Motivo',
                  opciones: [
                    { valor: '', etiqueta: 'Todos' },
                    { valor: 'compra', etiqueta: 'Compra' },
                    { valor: 'venta', etiqueta: 'Venta' },
                    { valor: 'devolucion', etiqueta: 'Devolución' },
                    { valor: 'ajuste_inventario', etiqueta: 'Ajuste de Inventario' },
                    { valor: 'merma', etiqueta: 'Merma' }
                  ],
                  valor: filtros.motivo
                },
                {
                  nombre: 'fecha_desde',
                  tipo: 'fecha',
                  placeholder: 'Desde',
                  valor: filtros.fecha_desde
                },
                {
                  nombre: 'fecha_hasta',
                  tipo: 'fecha',
                  placeholder: 'Hasta',
                  valor: filtros.fecha_hasta
                }
              ]}
              onFiltrar={manejarFiltrar}
            />
          </CardContent>
        </Card>

        {/* Lista de Movimientos */}
        <Card>
          <CardContent className="p-0">
            {cargandoMovimientos ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando movimientos...</p>
              </div>
            ) : movimientos?.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay movimientos</h3>
                <p className="text-gray-500 mb-4">
                  No se encontraron movimientos con los filtros aplicados.
                </p>
                <Button onClick={() => navigate('/admin/inventario/nuevo-movimiento')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Movimiento
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Motivo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {movimientos?.map((movimiento) => (
                      <tr key={movimiento.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="h-8 w-8 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {movimiento.producto?.nombre}
                              </div>
                              <div className="text-sm text-gray-500">
                                Código: {movimiento.producto?.codigo}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {obtenerIconoMovimiento(movimiento.tipo_movimiento)}
                            <Badge className={`ml-2 ${obtenerColorTipo(movimiento.tipo_movimiento)}`}>
                              {movimiento.tipo_movimiento}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {movimiento.cantidad} {movimiento.producto?.unidad_medida}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {movimiento.motivo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatearFecha(movimiento.fecha_movimiento)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {movimiento.usuario?.nombres}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/inventario/movimiento/${movimiento.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <PaginacionPersonalizada
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            onCambioPagina={(pagina) => {
              // Implementar cambio de página
            }}
          />
        )}
      </div>
    </LayoutAdmin>
  );
};

export default MovimientosInventario;

