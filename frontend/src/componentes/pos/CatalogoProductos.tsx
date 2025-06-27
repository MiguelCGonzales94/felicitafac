/**
 * Catálogo de Productos - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente para mostrar y seleccionar productos en el POS
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Grid, List, Package, AlertTriangle, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Card, CardContent } from '../ui/card';
import { Input, InputBusqueda } from '../ui/input';
import { Button, ButtonIcono } from '../ui/button';
import { useApiGet, useApiBusqueda } from '../../hooks/useApi';
import { useProductosPOS } from '../../hooks/useFacturacion';
import type { ProductoListItem } from '../../types/producto';
import { API_ENDPOINTS, POS_CONFIG } from '../../utils/constantes';
import { formatearMoneda } from '../../utils/formatos';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesCatalogoProductos {
  className?: string;
  mostrarFiltros?: boolean;
  vistaCompacta?: boolean;
  onProductoSeleccionado?: (producto: ProductoListItem) => void;
}

interface FiltrosProductos {
  categoria?: string;
  soloConStock?: boolean;
  rango_precio?: {
    min: number;
    max: number;
  };
  tipo_producto?: 'producto' | 'servicio';
}

type VistaProductos = 'grid' | 'lista';

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const CatalogoProductos: React.FC<PropiedadesCatalogoProductos> = ({
  className,
  mostrarFiltros = true,
  vistaCompacta = false,
  onProductoSeleccionado,
}) => {
  // Estados locales
  const [vista, setVista] = useState<VistaProductos>('grid');
  const [filtros, setFiltros] = useState<FiltrosProductos>({});
  const [paginaActual, setPaginaActual] = useState(1);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');

  // Hooks personalizados
  const { 
    agregarProductoConValidacion, 
    mostrarModalAgregar,
    modalAgregarVisible,
    cerrarModalAgregar,
    agregarConCantidad,
    productoSeleccionado,
  } = useProductosPOS();

  // API para obtener productos
  const {
    data: productosData,
    loading: cargandoProductos,
    error: errorProductos,
    refrescar: refrescarProductos,
  } = useApiGet<{
    count: number;
    results: ProductoListItem[];
  }>(
    () => {
      const params = new URLSearchParams({
        page: paginaActual.toString(),
        page_size: POS_CONFIG.PRODUCTOS_POR_PAGINA.toString(),
        estado: 'activo',
        ...(filtros.categoria && { categoria: filtros.categoria }),
        ...(filtros.soloConStock && { con_stock: 'true' }),
        ...(filtros.tipo_producto && { tipo_producto: filtros.tipo_producto }),
        ...(filtros.rango_precio && {
          precio_desde: filtros.rango_precio.min.toString(),
          precio_hasta: filtros.rango_precio.max.toString(),
        }),
      });

      return `${API_ENDPOINTS.PRODUCTOS.LIST}?${params.toString()}`;
    },
    undefined,
    {
      dependencias: [paginaActual, filtros],
      cachear: true,
      tiempoCacheMs: 2 * 60 * 1000, // 2 minutos
    }
  );

  // API para búsqueda de productos
  const {
    data: productosBusqueda,
    loading: cargandoBusqueda,
    termino: terminoBusqueda,
    setTermino: setTerminoBusqueda,
  } = useApiBusqueda<{
    count: number;
    results: ProductoListItem[];
  }>(
    API_ENDPOINTS.PRODUCTOS.LIST,
    300, // 300ms debounce
    undefined,
    {
      cachear: true,
    }
  );

  // API para categorías
  const {
    data: categorias,
    loading: cargandoCategorias,
  } = useApiGet<Array<{ id: string; nombre: string; cantidad: number }>>(
    API_ENDPOINTS.PRODUCTOS.CATEGORIAS,
    undefined,
    {
      cachear: true,
      tiempoCacheMs: 10 * 60 * 1000, // 10 minutos
    }
  );

  // =======================================================
  // DATOS COMPUTADOS
  // =======================================================

  const productos = useMemo(() => {
    if (terminoBusqueda.trim()) {
      return productosBusqueda?.results || [];
    }
    return productosData?.results || [];
  }, [terminoBusqueda, productosBusqueda, productosData]);

  const totalProductos = useMemo(() => {
    if (terminoBusqueda.trim()) {
      return productosBusqueda?.count || 0;
    }
    return productosData?.count || 0;
  }, [terminoBusqueda, productosBusqueda, productosData]);

  const cargando = cargandoProductos || cargandoBusqueda;
  const totalPaginas = Math.ceil(totalProductos / POS_CONFIG.PRODUCTOS_POR_PAGINA);

  // =======================================================
  // MANEJADORES DE EVENTOS
  // =======================================================

  const manejarClickProducto = (producto: ProductoListItem) => {
    if (onProductoSeleccionado) {
      onProductoSeleccionado(producto);
    } else {
      mostrarModalAgregar(producto);
    }
  };

  const manejarAgregarRapido = (producto: ProductoListItem, event: React.MouseEvent) => {
    event.stopPropagation();
    const resultado = agregarProductoConValidacion(producto, 1);
    
    if (!resultado.exito && resultado.mensaje) {
      // TODO: Mostrar toast con error
      console.error(resultado.mensaje);
    }
  };

  const manejarCambioCategoria = (categoria: string) => {
    setCategoriaSeleccionada(categoria);
    setFiltros(prev => ({
      ...prev,
      categoria: categoria || undefined,
    }));
    setPaginaActual(1);
  };

  const manejarCambioFiltros = (nuevosFiltros: Partial<FiltrosProductos>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setFiltros({});
    setCategoriaSeleccionada('');
    setTerminoBusqueda('');
    setPaginaActual(1);
  };

  // =======================================================
  // COMPONENTE TARJETA DE PRODUCTO
  // =======================================================

  const TarjetaProducto: React.FC<{ producto: ProductoListItem }> = ({ producto }) => {
    const sinStock = producto.stock_actual !== undefined && producto.stock_actual <= 0;
    const stockBajo = producto.stock_actual !== undefined && producto.stock_actual <= 5 && producto.stock_actual > 0;

    return (
      <Card
        key={producto.id}
        className={cn(
          'group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1',
          sinStock && 'opacity-60',
          vista === 'lista' && 'flex-row items-center'
        )}
        onClick={() => manejarClickProducto(producto)}
      >
        <CardContent className={cn(
          'p-4',
          vista === 'lista' && 'flex items-center justify-between w-full'
        )}>
          {/* Vista Grid */}
          {vista === 'grid' && (
            <>
              {/* Imagen del producto */}
              <div className="aspect-square w-full bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                {producto.imagen_url ? (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <Package className="h-12 w-12 text-gray-400" />
                )}
              </div>

              {/* Información del producto */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm line-clamp-2 text-gray-900">
                  {producto.nombre}
                </h3>
                
                {producto.codigo && (
                  <p className="text-xs text-gray-500">
                    Código: {producto.codigo}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">
                    {formatearMoneda(producto.precio_venta || 0)}
                  </span>
                  
                  {producto.stock_actual !== undefined && (
                    <div className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      sinStock ? 'bg-red-100 text-red-800' :
                      stockBajo ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    )}>
                      Stock: {producto.stock_actual}
                    </div>
                  )}
                </div>

                {/* Alertas */}
                {(sinStock || stockBajo) && (
                  <div className="flex items-center gap-1 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    <span className={sinStock ? 'text-red-600' : 'text-yellow-600'}>
                      {sinStock ? 'Sin stock' : 'Stock bajo'}
                    </span>
                  </div>
                )}

                {/* Botón agregar */}
                <Button
                  size="sm"
                  className="w-full"
                  disabled={sinStock}
                  onClick={(e) => manejarAgregarRapido(producto, e)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </>
          )}

          {/* Vista Lista */}
          {vista === 'lista' && (
            <>
              <div className="flex items-center space-x-4 flex-1">
                {/* Imagen pequeña */}
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 truncate">
                    {producto.nombre}
                  </h3>
                  {producto.codigo && (
                    <p className="text-xs text-gray-500">
                      {producto.codigo}
                    </p>
                  )}
                  {producto.categoria && (
                    <p className="text-xs text-gray-500">
                      {producto.categoria.nombre}
                    </p>
                  )}
                </div>

                {/* Precio y stock */}
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-blue-600">
                    {formatearMoneda(producto.precio_venta || 0)}
                  </div>
                  {producto.stock_actual !== undefined && (
                    <div className={cn(
                      'text-xs',
                      sinStock ? 'text-red-600' :
                      stockBajo ? 'text-yellow-600' :
                      'text-green-600'
                    )}>
                      Stock: {producto.stock_actual}
                    </div>
                  )}
                </div>

                {/* Botón agregar */}
                <ButtonIcono
                  icono={<Plus className="h-4 w-4" />}
                  disabled={sinStock}
                  onClick={(e) => manejarAgregarRapido(producto, e)}
                  className="flex-shrink-0"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  // =======================================================
  // RENDERIZADO
  // =======================================================

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header con búsqueda y controles */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4 mb-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <InputBusqueda
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              placeholder="Buscar productos por nombre o código..."
              clearable
              onClear={() => setTerminoBusqueda('')}
            />
          </div>

          {/* Controles de vista */}
          <div className="flex items-center gap-2">
            <ButtonIcono
              icono={<Grid className="h-4 w-4" />}
              variant={vista === 'grid' ? 'default' : 'ghost'}
              onClick={() => setVista('grid')}
              title="Vista en grilla"
            />
            <ButtonIcono
              icono={<List className="h-4 w-4" />}
              variant={vista === 'lista' ? 'default' : 'ghost'}
              onClick={() => setVista('lista')}
              title="Vista en lista"
            />
            {mostrarFiltros && (
              <ButtonIcono
                icono={<Filter className="h-4 w-4" />}
                variant="ghost"
                title="Filtros"
              />
            )}
          </div>
        </div>

        {/* Filtros rápidos */}
        {mostrarFiltros && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Categorías */}
            <select
              value={categoriaSeleccionada}
              onChange={(e) => manejarCambioCategoria(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="">Todas las categorías</option>
              {categorias?.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre} ({categoria.cantidad})
                </option>
              ))}
            </select>

            {/* Solo con stock */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filtros.soloConStock || false}
                onChange={(e) => manejarCambioFiltros({ soloConStock: e.target.checked })}
                className="rounded"
              />
              Solo con stock
            </label>

            {/* Limpiar filtros */}
            {(categoriaSeleccionada || filtros.soloConStock || terminoBusqueda) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto p-4">
        {cargando ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Cargando productos...</p>
            </div>
          </div>
        ) : errorProductos ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 mb-2">Error al cargar productos</p>
              <Button variant="outline" onClick={refrescarProductos}>
                Reintentar
              </Button>
            </div>
          </div>
        ) : productos.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">
                {terminoBusqueda ? 'No se encontraron productos' : 'No hay productos disponibles'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Grid/Lista de productos */}
            <div className={cn(
              vista === 'grid' ? 
                'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' :
                'space-y-2'
            )}>
              {productos.map(producto => (
                <TarjetaProducto key={producto.id} producto={producto} />
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && !terminoBusqueda && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginaActual <= 1}
                  onClick={() => setPaginaActual(prev => prev - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginaActual >= totalPaginas}
                  onClick={() => setPaginaActual(prev => prev + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para agregar producto con cantidad */}
      {modalAgregarVisible && productoSeleccionado && (
        <ModalAgregarProducto
          producto={productoSeleccionado}
          onCerrar={cerrarModalAgregar}
          onAgregar={agregarConCantidad}
        />
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE MODAL AGREGAR PRODUCTO
// =======================================================

interface PropiedadesModalAgregarProducto {
  producto: ProductoListItem;
  onCerrar: () => void;
  onAgregar: (cantidad: number) => { exito: boolean; mensaje?: string };
}

const ModalAgregarProducto: React.FC<PropiedadesModalAgregarProducto> = ({
  producto,
  onCerrar,
  onAgregar,
}) => {
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(false);

  const manejarAgregar = async () => {
    setCargando(true);
    const resultado = onAgregar(cantidad);
    setCargando(false);
    
    if (resultado.exito) {
      onCerrar();
    } else if (resultado.mensaje) {
      // TODO: Mostrar toast con error
      alert(resultado.mensaje);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Agregar Producto</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{producto.nombre}</h4>
            <p className="text-sm text-gray-600">{producto.codigo}</p>
            <p className="text-lg font-bold text-blue-600">
              {formatearMoneda(producto.precio_venta || 0)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Cantidad
            </label>
            <Input
              type="number"
              min={1}
              max={producto.stock_actual || 999}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="w-full"
            />
            {producto.stock_actual !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                Stock disponible: {producto.stock_actual}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onCerrar}
            disabled={cargando}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={manejarAgregar}
            disabled={cargando || cantidad <= 0}
            loading={cargando}
            className="flex-1"
          >
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CatalogoProductos;