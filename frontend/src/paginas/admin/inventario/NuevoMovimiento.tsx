/**
 * frontend/src/paginas/admin/inventario/NuevoMovimiento.tsx
 * Página para registrar nuevo movimiento de inventario
 */
import React, { useState } from 'react';
import { Save, Package, Plus, Minus } from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Input } from '../../../componentes/ui/input';
import { Label } from '../../../componentes/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../componentes/ui/select';
import { Textarea } from '../../../componentes/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useInventario } from '../../../hooks/useInventario';
import { useProductos } from '../../../hooks/useProductos';
import { useNotificaciones } from '../../../hooks/useNotificaciones';
import BuscadorGeneral from '../../../componentes/comunes/BuscadorGeneral';

export const NuevoMovimiento: React.FC = () => {
  const navigate = useNavigate();
  const { crearMovimiento } = useInventario();
  const { buscarProductos } = useProductos();
  const { mostrarExito, mostrarError } = useNotificaciones();

  const [movimientoData, setMovimientoData] = useState({
    producto_id: null,
    tipo_movimiento: '',
    cantidad: 0,
    motivo: '',
    observaciones: '',
    documento_referencia: ''
  });

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const manejarGuardar = async () => {
    try {
      await crearMovimiento(movimientoData);
      mostrarExito('Movimiento registrado correctamente');
      navigate('/admin/inventario/movimientos');
    } catch (error) {
      mostrarError('Error al registrar el movimiento');
    }
  };

  return (
    <LayoutAdmin
      title="Nuevo Movimiento de Inventario"
      description="Registrar entrada, salida o ajuste de stock"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Inventario', href: '/admin/inventario' },
        { label: 'Movimientos', href: '/admin/inventario/movimientos' },
        { label: 'Nuevo Movimiento' }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Movimiento de Inventario</h1>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate('/admin/inventario/movimientos')}>
              Cancelar
            </Button>
            <Button onClick={manejarGuardar}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Movimiento
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Movimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selección de Producto */}
            <div>
              <Label htmlFor="producto">Producto</Label>
              <BuscadorGeneral
                placeholder="Buscar producto por nombre o código..."
                onSeleccionar={(producto) => {
                  setProductoSeleccionado(producto);
                  setMovimientoData({
                    ...movimientoData,
                    producto_id: producto.id
                  });
                }}
                categorias={['producto']}
                funcionBusqueda={buscarProductos}
              />
              {productoSeleccionado && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{productoSeleccionado.nombre}</p>
                      <p className="text-sm text-gray-600">
                        Stock actual: {productoSeleccionado.stock_actual} {productoSeleccionado.unidad_medida}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Movimiento */}
              <div>
                <Label htmlFor="tipo_movimiento">Tipo de Movimiento</Label>
                <Select 
                  value={movimientoData.tipo_movimiento}
                  onValueChange={(value) => setMovimientoData({
                    ...movimientoData,
                    tipo_movimiento: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">
                      <div className="flex items-center">
                        <Plus className="h-4 w-4 mr-2 text-green-600" />
                        Entrada
                      </div>
                    </SelectItem>
                    <SelectItem value="salida">
                      <div className="flex items-center">
                        <Minus className="h-4 w-4 mr-2 text-red-600" />
                        Salida
                      </div>
                    </SelectItem>
                    <SelectItem value="ajuste">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-blue-600" />
                        Ajuste
                      </div>
                    </SelectItem>
                    <SelectItem value="transferencia">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-purple-600" />
                        Transferencia
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cantidad */}
              <div>
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  value={movimientoData.cantidad}
                  onChange={(e) => setMovimientoData({
                    ...movimientoData,
                    cantidad: parseFloat(e.target.value) || 0
                  })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Motivo */}
            <div>
              <Label htmlFor="motivo">Motivo</Label>
              <Select 
                value={movimientoData.motivo}
                onValueChange={(value) => setMovimientoData({
                  ...movimientoData,
                  motivo: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="devolucion_cliente">Devolución de Cliente</SelectItem>
                  <SelectItem value="devolucion_proveedor">Devolución a Proveedor</SelectItem>
                  <SelectItem value="ajuste_inventario">Ajuste de Inventario</SelectItem>
                  <SelectItem value="merma">Merma</SelectItem>
                  <SelectItem value="deterioro">Deterioro</SelectItem>
                  <SelectItem value="robo">Robo/Pérdida</SelectItem>
                  <SelectItem value="transferencia_almacen">Transferencia entre Almacenes</SelectItem>
                  <SelectItem value="produccion">Producción</SelectItem>
                  <SelectItem value="consumo_interno">Consumo Interno</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Documento de Referencia */}
            <div>
              <Label htmlFor="documento_referencia">Documento de Referencia (Opcional)</Label>
              <Input
                id="documento_referencia"
                value={movimientoData.documento_referencia}
                onChange={(e) => setMovimientoData({
                  ...movimientoData,
                  documento_referencia: e.target.value
                })}
                placeholder="Ej: FAC001-00001234, GR001-00000567"
              />
            </div>

            {/* Observaciones */}
            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={movimientoData.observaciones}
                onChange={(e) => setMovimientoData({
                  ...movimientoData,
                  observaciones: e.target.value
                })}
                placeholder="Observaciones adicionales sobre el movimiento..."
                rows={3}
              />
            </div>

            {/* Resumen del Movimiento */}
            {productoSeleccionado && movimientoData.tipo_movimiento && movimientoData.cantidad > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Resumen del Movimiento</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>Producto: <span className="font-medium">{productoSeleccionado.nombre}</span></p>
                  <p>Stock actual: <span className="font-medium">{productoSeleccionado.stock_actual} {productoSeleccionado.unidad_medida}</span></p>
                  <p>Movimiento: <span className="font-medium">{movimientoData.tipo_movimiento} de {movimientoData.cantidad} {productoSeleccionado.unidad_medida}</span></p>
                  <p>Stock resultante: <span className="font-medium">
                    {movimientoData.tipo_movimiento === 'entrada' ? 
                      productoSeleccionado.stock_actual + movimientoData.cantidad :
                      movimientoData.tipo_movimiento === 'salida' ?
                      productoSeleccionado.stock_actual - movimientoData.cantidad :
                      'Depende del ajuste'
                    } {productoSeleccionado.unidad_medida}
                  </span></p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutAdmin>
  );
};

export default NuevoMovimiento;

