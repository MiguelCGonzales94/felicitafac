/**
 * Carrito de Compras - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente para mostrar y editar items del carrito en el POS
 */

import React, { useState, useCallback } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Edit3, 
  ShoppingCart, 
  AlertCircle,
  Package,
  Save,
  X
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button, ButtonIcono } from '../ui/button';
import { Input, InputCantidad, InputMonto } from '../ui/input';
import { usePuntoDeVenta } from '../../hooks/useFacturacion';
import type { ItemFactura } from '../types/factura';
import { formatearMoneda } from '../../utils/formatos';
import { calcularTotalesItem } from '../../utils/calculos';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesCarritoCompras {
  className?: string;
  compacto?: boolean;
  editarInline?: boolean;
  mostrarDescuentos?: boolean;
  onItemEditado?: (index: number, item: Partial<ItemFactura>) => void;
}

interface EstadoEdicion {
  index: number;
  campo: 'cantidad' | 'precio' | 'descuento';
  valor: string;
}

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const CarritoCompras: React.FC<PropiedadesCarritoCompras> = ({
  className,
  compacto = false,
  editarInline = true,
  mostrarDescuentos = true,
  onItemEditado,
}) => {
  // Hook del punto de venta
  const {
    estado,
    actualizarItem,
    removerItem,
    limpiarCarrito,
    obtenerResumenCarrito,
  } = usePuntoDeVenta();

  // Estados locales
  const [editando, setEditando] = useState<EstadoEdicion | null>(null);
  const [confirmandoLimpiar, setConfirmandoLimpiar] = useState(false);

  // =======================================================
  // FUNCIONES DE EDICIÓN
  // =======================================================

  const iniciarEdicion = (index: number, campo: 'cantidad' | 'precio' | 'descuento') => {
    const item = estado.items[index];
    if (!item) return;

    let valor = '';
    switch (campo) {
      case 'cantidad':
        valor = item.cantidad.toString();
        break;
      case 'precio':
        valor = item.precio_unitario.toString();
        break;
      case 'descuento':
        valor = item.descuento.toString();
        break;
    }

    setEditando({ index, campo, valor });
  };

  const cancelarEdicion = () => {
    setEditando(null);
  };

  const guardarEdicion = useCallback(() => {
    if (!editando) return;

    const { index, campo, valor } = editando;
    const valorNumerico = parseFloat(valor) || 0;

    if (valorNumerico < 0) return;

    const actualizacion: Partial<ItemFactura> = {};
    
    switch (campo) {
      case 'cantidad':
        if (valorNumerico <= 0) return;
        actualizacion.cantidad = valorNumerico;
        break;
      case 'precio':
        actualizacion.precio_unitario = valorNumerico;
        break;
      case 'descuento':
        if (valorNumerico > 100) return;
        actualizacion.descuento = valorNumerico;
        break;
    }

    actualizarItem(index, actualizacion);
    onItemEditado?.(index, actualizacion);
    setEditando(null);
  }, [editando, actualizarItem, onItemEditado]);

  const incrementarCantidad = (index: number) => {
    const item = estado.items[index];
    if (!item) return;

    const nuevaCantidad = item.cantidad + 1;
    
    // Validar stock si está disponible
    if (item.stock_disponible !== undefined && nuevaCantidad > item.stock_disponible) {
      // TODO: Mostrar toast de error
      return;
    }

    actualizarItem(index, { cantidad: nuevaCantidad });
  };

  const decrementarCantidad = (index: number) => {
    const item = estado.items[index];
    if (!item) return;

    const nuevaCantidad = Math.max(1, item.cantidad - 1);
    actualizarItem(index, { cantidad: nuevaCantidad });
  };

  const confirmarLimpiarCarrito = () => {
    if (window.confirm('¿Está seguro de que desea limpiar todo el carrito?')) {
      limpiarCarrito();
    }
  };

  // =======================================================
  // MANEJADORES DE EVENTOS
  // =======================================================

  const manejarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      guardarEdicion();
    } else if (e.key === 'Escape') {
      cancelarEdicion();
    }
  };

  const manejarCambioValor = (nuevoValor: string) => {
    if (editando) {
      setEditando({ ...editando, valor: nuevoValor });
    }
  };

  // =======================================================
  // COMPONENTE ITEM DEL CARRITO
  // =======================================================

  const ItemCarrito: React.FC<{ 
    item: ItemFactura; 
    index: number; 
    esUltimo: boolean;
  }> = ({ item, index, esUltimo }) => {
    const estaEditando = editando?.index === index;
    const campoEditando = editando?.campo;

    // Alertas de stock
    const sinStock = item.stock_disponible !== undefined && item.cantidad > item.stock_disponible;
    const stockBajo = item.stock_disponible !== undefined && 
                      item.stock_disponible <= 5 && 
                      item.stock_disponible > 0;

    return (
      <div className={cn(
        'py-3',
        !esUltimo && 'border-b border-gray-100'
      )}>
        <div className="flex items-start gap-3">
          {/* Información del producto */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
              {item.descripcion}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Código: {item.codigo_producto}
            </p>
            
            {/* Alertas */}
            {sinStock && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-600">
                  Stock insuficiente (disponible: {item.stock_disponible})
                </span>
              </div>
            )}
            
            {stockBajo && !sinStock && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-yellow-600">
                  Stock bajo
                </span>
              </div>
            )}
          </div>

          {/* Botón eliminar */}
          <ButtonIcono
            icono={<Trash2 className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            onClick={() => removerItem(index)}
            className="text-red-500 hover:text-red-700 flex-shrink-0"
            title="Eliminar item"
          />
        </div>

        {/* Controles de cantidad, precio y descuento */}
        <div className="mt-3 space-y-2">
          {/* Cantidad */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Cantidad:</span>
            <div className="flex items-center gap-2">
              {estaEditando && campoEditando === 'cantidad' ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={editando.valor}
                    onChange={(e) => manejarCambioValor(e.target.value)}
                    onKeyDown={manejarKeyDown}
                    className="w-16 h-8 text-xs"
                    min={1}
                    max={item.stock_disponible}
                    autoFocus
                  />
                  <ButtonIcono
                    icono={<Save className="h-3 w-3" />}
                    size="sm"
                    onClick={guardarEdicion}
                    className="h-8 w-8"
                  />
                  <ButtonIcono
                    icono={<X className="h-3 w-3" />}
                    variant="ghost"
                    size="sm"
                    onClick={cancelarEdicion}
                    className="h-8 w-8"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <ButtonIcono
                    icono={<Minus className="h-3 w-3" />}
                    variant="outline"
                    size="sm"
                    onClick={() => decrementarCantidad(index)}
                    disabled={item.cantidad <= 1}
                    className="h-8 w-8"
                  />
                  <button
                    onClick={() => iniciarEdicion(index, 'cantidad')}
                    className="min-w-[2rem] h-8 px-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50"
                  >
                    {item.cantidad}
                  </button>
                  <ButtonIcono
                    icono={<Plus className="h-3 w-3" />}
                    variant="outline"
                    size="sm"
                    onClick={() => incrementarCantidad(index)}
                    disabled={sinStock}
                    className="h-8 w-8"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Precio unitario */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Precio unit.:</span>
            <div className="flex items-center gap-2">
              {estaEditando && campoEditando === 'precio' ? (
                <div className="flex items-center gap-1">
                  <InputMonto
                    value={editando.valor}
                    onChange={(e) => manejarCambioValor(e.target.value)}
                    onKeyDown={manejarKeyDown}
                    className="w-20 h-8 text-xs"
                    precision={2}
                    autoFocus
                  />
                  <ButtonIcono
                    icono={<Save className="h-3 w-3" />}
                    size="sm"
                    onClick={guardarEdicion}
                    className="h-8 w-8"
                  />
                  <ButtonIcono
                    icono={<X className="h-3 w-3" />}
                    variant="ghost"
                    size="sm"
                    onClick={cancelarEdicion}
                    className="h-8 w-8"
                  />
                </div>
              ) : (
                <button
                  onClick={() => iniciarEdicion(index, 'precio')}
                  className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                >
                  {formatearMoneda(item.precio_unitario)}
                </button>
              )}
            </div>
          </div>

          {/* Descuento */}
          {mostrarDescuentos && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Descuento:</span>
              <div className="flex items-center gap-2">
                {estaEditando && campoEditando === 'descuento' ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={editando.valor}
                      onChange={(e) => manejarCambioValor(e.target.value)}
                      onKeyDown={manejarKeyDown}
                      className="w-16 h-8 text-xs"
                      min={0}
                      max={100}
                      autoFocus
                    />
                    <span className="text-xs">%</span>
                    <ButtonIcono
                      icono={<Save className="h-3 w-3" />}
                      size="sm"
                      onClick={guardarEdicion}
                      className="h-8 w-8"
                    />
                    <ButtonIcono
                      icono={<X className="h-3 w-3" />}
                      variant="ghost"
                      size="sm"
                      onClick={cancelarEdicion}
                      className="h-8 w-8"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => iniciarEdicion(index, 'descuento')}
                    className="text-sm text-gray-600 hover:bg-gray-50 px-2 py-1 rounded"
                  >
                    {item.descuento > 0 ? `${item.descuento}%` : '0%'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Subtotal del item */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-600">Subtotal:</span>
            <span className="text-sm font-bold text-gray-900">
              {formatearMoneda(item.total)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // =======================================================
  // RENDERIZADO
  // =======================================================

  const resumen = obtenerResumenCarrito();

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito ({resumen.cantidadItems})
          </CardTitle>
          
          {estado.items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={confirmarLimpiarCarrito}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
        
        {estado.items.length > 0 && (
          <p className="text-sm text-gray-600">
            {resumen.totalUnidades} unidades
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-auto px-4 pb-4">
        {estado.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <Package className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-sm text-center">
              No hay productos en el carrito
            </p>
            <p className="text-xs text-center mt-1">
              Seleccione productos del catálogo para agregar
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {estado.items.map((item, index) => (
              <ItemCarrito
                key={item.id || index}
                item={item}
                index={index}
                esUltimo={index === estado.items.length - 1}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Totales del carrito */}
      {estado.items.length > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{resumen.subtotal}</span>
            </div>
            
            {estado.descuentoGlobal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Descuento global:</span>
                <span className="text-red-600">-{estado.descuentoGlobal}%</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IGV (18%):</span>
              <span className="font-medium">{resumen.igv}</span>
            </div>
            
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
              <span>Total:</span>
              <span className="text-blue-600">{resumen.total}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CarritoCompras;