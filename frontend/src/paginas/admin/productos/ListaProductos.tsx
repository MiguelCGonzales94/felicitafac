// ================================================================
// 7. PÁGINAS DE PRODUCTOS
// ================================================================

/**
 * frontend/src/paginas/admin/productos/ListaProductos.tsx
 * Lista completa de productos
 */
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Edit, Eye, Trash2, Download,
  Package, Tag, DollarSign, AlertTriangle, TrendingUp
} from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Badge } from '../../../componentes/ui/bagde';
import { useNavigate } from 'react-router-dom';
import { useProductos } from '../../../hooks/useProductos';
import { useNotificaciones } from '../../../hooks/useNotificaciones';
import { formatearMoneda } from '../../../utils/formateo';
import FiltrosAvanzados from '../../../componentes/comunes/FiltrosAvanzados';
import PaginacionPersonalizada from '../../../componentes/comunes/PaginacionPersonalizada';

export const ListaProductos: React.FC = () => {
  const navigate = useNavigate();
  const { 
    productos, 
    totalProductos, 
    paginaActual, 
    totalPaginas,
    obtenerProductos, 
    eliminarProducto,
    cargandoProductos 
  } = useProductos();
  const { mostrarConfirmacion } = useNotificaciones();

  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    tipo_producto: '',
    estado: '',
    stock_bajo: '',
    precio_desde: '',
    precio_hasta: ''
  });

  useEffect(() => {
    cargarProductos();
  }, [paginaActual, filtros]);

  const cargarProductos = async () => {
    await obtenerProductos(filtros);
  };

  const manejarFiltrar = (nuevosFiltros: any) => {
    setFiltros({ ...filtros, ...nuevosFiltros });
  };

  const manejarEliminar = async (id: number, nombre: string) => {
    const confirmado = await mostrarConfirmacion(
      'Confirmar eliminación',
      `¿Está seguro de eliminar el producto "${nombre}"?`
    );
    
    if (confirmado) {
      await eliminarProducto(id);
      cargarProductos();
    }
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-gray-100 text-gray-800';
      case 'descontinuado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const obtenerColorStock = (stock: number, minimo: number) => {
    if (stock <= 0) return 'text-red-600';
    if (stock <= minimo) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <LayoutAdmin
      title="Gestión de Productos"
      description="Administración del catálogo de productos y servicios"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Comercial', href: '/admin/comercial' },
        { label: 'Productos' }
      ]}
    >
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h1>
            <p className="text-gray-600">
              Gestiona tu inventario de productos y servicios
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={() => navigate('/admin/productos/categorias')}>
              <Tag className="h-4 w-4 mr-2" />
              Categorías
            </Button>
            <Button onClick={() => navigate('/admin/productos/nuevo')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProductos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
                  <p className="text-2xl font-bold text-gray-900">{formatearMoneda(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Más Vendidos</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  placeholder: 'Buscar por nombre, código, descripción...',
                  valor: filtros.busqueda
                },
                {
                  nombre: 'categoria',
                  tipo: 'select',
                  placeholder: 'Categoría',
                  opciones: [
                    { valor: '', etiqueta: 'Todas las categorías' },
                    { valor: 'productos', etiqueta: 'Productos' },
                    { valor: 'servicios', etiqueta: 'Servicios' }
                  ],
                  valor: filtros.categoria
                },
                {
                  nombre: 'tipo_producto',
                  tipo: 'select',
                  placeholder: 'Tipo',
                  opciones: [
                    { valor: '', etiqueta: 'Todos' },
                    { valor: 'producto', etiqueta: 'Producto' },
                    { valor: 'servicio', etiqueta: 'Servicio' }
                  ],
                  valor: filtros.tipo_producto
                },
                {
                  nombre: 'estado',
                  tipo: 'select',
                  placeholder: 'Estado',
                  opciones: [
                    { valor: '', etiqueta: 'Todos' },
                    { valor: 'activo', etiqueta: 'Activo' },
                    { valor: 'inactivo', etiqueta: 'Inactivo' },
                    { valor: 'descontinuado', etiqueta: 'Descontinuado' }
                  ],
                  valor: filtros.estado
                },
                {
                  nombre: 'stock_bajo',
                  tipo: 'select',
                  placeholder: 'Stock',
                  opciones: [
                    { valor: '', etiqueta: 'Todos' },
                    { valor: 'si', etiqueta: 'Stock bajo' },
                    { valor: 'agotado', etiqueta: 'Agotado' }
                  ],
                  valor: filtros.stock_bajo
                }
              ]}
              onFiltrar={manejarFiltrar}
            />
          </CardContent>
        </Card>

        {/* Lista de Productos */}
        <Card>
          <CardContent className="p-0">
            {cargandoProductos ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando productos...</p>
              </div>
            ) : productos.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
                <p className="text-gray-500 mb-4">
                  No se encontraron productos con los filtros aplicados.
                </p>
                <Button onClick={() => navigate('/admin/productos/nuevo')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Producto
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
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productos.map((producto) => (
                      <tr key={producto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {producto.imagen_url ? (
                                <img 
                                  className="h-10 w-10 rounded-lg object-cover" 
                                  src={producto.imagen_url} 
                                  alt={producto.nombre}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {producto.nombre}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-48">
                                {producto.descripcion}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {producto.codigo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">
                            {producto.categoria?.nombre || 'Sin categoría'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${obtenerColorStock(producto.stock_actual, producto.stock_minimo)}`}>
                            {producto.stock_actual} {producto.unidad_medida}
                          </span>
                          {producto.stock_actual <= producto.stock_minimo && (
                            <div className="text-xs text-red-500">Stock bajo</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatearMoneda(producto.precio_venta)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Costo: {formatearMoneda(producto.precio_compra)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={obtenerColorEstado(producto.estado)}>
                            {producto.estado}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/productos/${producto.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/productos/editar/${producto.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => manejarEliminar(producto.id, producto.nombre)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

export default ListaProductos;

