/**
 * frontend/src/paginas/admin/productos/DetalleProducto.tsx
 * Página de detalle completo de un producto
 */
import React, { useState, useEffect } from 'react';
import { 
  Edit, Trash2, Package, Tag, DollarSign, 
  TrendingUp, Calendar, AlertTriangle, BarChart3
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Badge } from '../../../componentes/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../componentes/ui/tabs';
import { useProductos } from '../../../hooks/useProductos';
import { formatearMoneda, formatearFecha } from '../../../utils/formatters';

export const DetalleProducto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obtenerProducto, productoActual, cargandoProducto } = useProductos();

  useEffect(() => {
    if (id) {
      obtenerProducto(parseInt(id));
    }
  }, [id]);

  if (cargandoProducto) {
    return (
      <LayoutAdmin title="Cargando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </LayoutAdmin>
    );
  }

  if (!productoActual) {
    return (
      <LayoutAdmin title="Producto no encontrado">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Producto no encontrado</h3>
          <Button onClick={() => navigate('/admin/productos')}>
            Volver a la Lista
          </Button>
        </div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin
      title={productoActual.nombre}
      description="Información completa del producto"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Comercial', href: '/admin/comercial' },
        { label: 'Productos', href: '/admin/productos' },
        { label: productoActual.nombre }
      ]}
    >
      <div className="space-y-6">
        {/* Header del Producto */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                <div className="h-24 w-24 flex-shrink-0">
                  {productoActual.imagen_url ? (
                    <img 
                      className="h-24 w-24 rounded-lg object-cover" 
                      src={productoActual.imagen_url} 
                      alt={productoActual.nombre}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {productoActual.nombre}
                  </h1>
                  <p className="text-gray-600 mt-1">{productoActual.descripcion}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <p className="text-sm text-gray-500">
                      Código: <span className="font-medium">{productoActual.codigo}</span>
                    </p>
                    <Badge className={
                      productoActual.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }>
                      {productoActual.estado}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button onClick={() => navigate(`/admin/productos/editar/${productoActual.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Ajustar Stock
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas del Producto */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Stock Actual</p>
                  <p className="text-xl font-bold text-gray-900">
                    {productoActual.stock_actual} {productoActual.unidad_medida}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Precio Venta</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatearMoneda(productoActual.precio_venta)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Margen</p>
                  <p className="text-xl font-bold text-gray-900">
                    {Math.round(((productoActual.precio_venta - productoActual.precio_compra) / productoActual.precio_venta) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Vendido (Mes)</p>
                  <p className="text-xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Información */}
        <Tabs defaultValue="informacion" className="w-full">
          <TabsList>
            <TabsTrigger value="informacion">Información General</TabsTrigger>
            <TabsTrigger value="inventario">Inventario</TabsTrigger>
            <TabsTrigger value="precios">Precios y Costos</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="informacion">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-medium">{productoActual.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Código</p>
                    <p className="font-medium">{productoActual.codigo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Descripción</p>
                    <p className="text-sm text-gray-700">{productoActual.descripcion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo</p>
                    <p className="font-medium">{productoActual.tipo_producto}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Clasificación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Categoría</p>
                    <Badge variant="outline">
                      {productoActual.categoria?.nombre || 'Sin categoría'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unidad de Medida</p>
                    <p className="font-medium">{productoActual.unidad_medida}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Código de Barras</p>
                    <p className="font-medium">{productoActual.codigo_barras || 'No asignado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <Badge className={
                      productoActual.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }>
                      {productoActual.estado}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventario">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Actual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Cantidad Disponible</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {productoActual.stock_actual} {productoActual.unidad_medida}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Stock Mínimo</p>
                    <p className="font-medium">{productoActual.stock_minimo} {productoActual.unidad_medida}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Stock Máximo</p>
                    <p className="font-medium">{productoActual.stock_maximo} {productoActual.unidad_medida}</p>
                  </div>
                  {productoActual.stock_actual <= productoActual.stock_minimo && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                        <p className="text-sm text-yellow-800">Stock por debajo del mínimo</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ubicación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Almacén</p>
                    <p className="font-medium">{productoActual.almacen?.nombre || 'Principal'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pasillo</p>
                    <p className="font-medium">{productoActual.ubicacion_pasillo || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estante</p>
                    <p className="font-medium">{productoActual.ubicacion_estante || 'No especificado'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="precios">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estructura de Precios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Precio de Compra</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatearMoneda(productoActual.precio_compra)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Precio de Venta</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatearMoneda(productoActual.precio_venta)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Margen de Ganancia</p>
                    <p className="text-lg font-bold text-purple-600">
                      {Math.round(((productoActual.precio_venta - productoActual.precio_compra) / productoActual.precio_venta) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ganancia por Unidad</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatearMoneda(productoActual.precio_venta - productoActual.precio_compra)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración Fiscal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Afectación IGV</p>
                    <p className="font-medium">
                      {productoActual.tipo_afectacion_igv === '10' ? 'Gravado' : 'Exonerado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Incluye IGV</p>
                    <Badge variant={productoActual.incluye_igv ? 'default' : 'secondary'}>
                      {productoActual.incluye_igv ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Código SUNAT</p>
                    <p className="font-medium">{productoActual.codigo_sunat || 'No asignado'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="estadisticas">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Estadísticas no disponibles</p>
                  <p className="text-sm text-gray-400">Las estadísticas se mostrarán cuando haya ventas registradas</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutAdmin>
  );
};

export default DetalleProducto;

