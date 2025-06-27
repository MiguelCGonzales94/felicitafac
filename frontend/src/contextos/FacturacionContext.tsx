/**
 * Contexto de Facturación - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Contexto global para manejo del estado del punto de venta
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { 
  ItemFactura, 
  TipoDocumento, 
  TipoPago, 
  ClienteFactura,
  CrearFacturaRequest 
} from '../types/factura';
import type { ProductoListItem } from '../types/producto';
import { calcularTotalesFactura, calcularTotalesItem } from '../utils/calculos';
import { STORAGE_KEYS, POS_CONFIG } from '../utils/constantes';

// =======================================================
// TIPOS DEL CONTEXTO
// =======================================================

export interface EstadoFacturacion {
  // Estado del carrito
  items: ItemFactura[];
  cliente: ClienteFactura | null;
  
  // Configuración del documento
  tipoDocumento: TipoDocumento;
  tipoPago: TipoPago;
  diasCredito: number;
  descuentoGlobal: number;
  observaciones: string;
  
  // Totales calculados
  subtotal: number;
  igv: number;
  total: number;
  
  // Estados de UI
  cargando: boolean;
  error: string | null;
  guardadoTemporal: boolean;
  
  // Configuración POS
  configuracion: {
    mostrarStock: boolean;
    permitirStockNegativo: boolean;
    calcularIgvAutomatico: boolean;
    autoguardar: boolean;
    serieFacturaPorDefecto: string;
    serieBoletaPorDefecto: string;
  };
}

export type AccionFacturacion =
  | { type: 'AGREGAR_ITEM'; payload: { producto: ProductoListItem; cantidad?: number } }
  | { type: 'ACTUALIZAR_ITEM'; payload: { index: number; item: Partial<ItemFactura> } }
  | { type: 'REMOVER_ITEM'; payload: { index: number } }
  | { type: 'LIMPIAR_CARRITO' }
  | { type: 'SELECCIONAR_CLIENTE'; payload: ClienteFactura }
  | { type: 'CAMBIAR_TIPO_DOCUMENTO'; payload: TipoDocumento }
  | { type: 'CAMBIAR_TIPO_PAGO'; payload: TipoPago }
  | { type: 'CAMBIAR_DIAS_CREDITO'; payload: number }
  | { type: 'CAMBIAR_DESCUENTO_GLOBAL'; payload: number }
  | { type: 'CAMBIAR_OBSERVACIONES'; payload: string }
  | { type: 'RECALCULAR_TOTALES' }
  | { type: 'ESTABLECER_CARGANDO'; payload: boolean }
  | { type: 'ESTABLECER_ERROR'; payload: string | null }
  | { type: 'CARGAR_DESDE_STORAGE'; payload: Partial<EstadoFacturacion> }
  | { type: 'ACTUALIZAR_CONFIGURACION'; payload: Partial<EstadoFacturacion['configuracion']> }
  | { type: 'MARCAR_GUARDADO_TEMPORAL'; payload: boolean };

export interface ContextoFacturacion {
  estado: EstadoFacturacion;
  
  // Acciones del carrito
  agregarProducto: (producto: ProductoListItem, cantidad?: number) => void;
  actualizarItem: (index: number, item: Partial<ItemFactura>) => void;
  removerItem: (index: number) => void;
  limpiarCarrito: () => void;
  
  // Acciones del cliente
  seleccionarCliente: (cliente: ClienteFactura) => void;
  limpiarCliente: () => void;
  
  // Acciones de configuración
  cambiarTipoDocumento: (tipo: TipoDocumento) => void;
  cambiarTipoPago: (tipo: TipoPago) => void;
  cambiarDiasCredito: (dias: number) => void;
  cambiarDescuentoGlobal: (descuento: number) => void;
  cambiarObservaciones: (observaciones: string) => void;
  
  // Utilidades
  obtenerResumenFactura: () => CrearFacturaRequest;
  validarFactura: () => { valido: boolean; errores: string[] };
  guardarTemporal: () => void;
  cargarTemporal: () => void;
  limpiarTemporal: () => void;
  
  // Estados computados
  tieneItems: boolean;
  tieneCliente: boolean;
  puedeFacturar: boolean;
  totalItems: number;
}

// =======================================================
// ESTADO INICIAL
// =======================================================

const estadoInicial: EstadoFacturacion = {
  items: [],
  cliente: null,
  tipoDocumento: 'factura',
  tipoPago: 'contado',
  diasCredito: 0,
  descuentoGlobal: 0,
  observaciones: '',
  subtotal: 0,
  igv: 0,
  total: 0,
  cargando: false,
  error: null,
  guardadoTemporal: false,
  configuracion: {
    mostrarStock: true,
    permitirStockNegativo: false,
    calcularIgvAutomatico: true,
    autoguardar: true,
    serieFacturaPorDefecto: 'F001',
    serieBoletaPorDefecto: 'B001',
  },
};

// =======================================================
// REDUCER
// =======================================================

function facturacionReducer(estado: EstadoFacturacion, accion: AccionFacturacion): EstadoFacturacion {
  switch (accion.type) {
    case 'AGREGAR_ITEM': {
      const { producto, cantidad = 1 } = accion.payload;
      
      // Verificar si el producto ya existe en el carrito
      const indexExistente = estado.items.findIndex(item => item.producto_id === producto.id);
      
      if (indexExistente >= 0) {
        // Si existe, actualizar cantidad
        const nuevosItems = [...estado.items];
        const itemExistente = nuevosItems[indexExistente];
        const nuevaCantidad = itemExistente.cantidad + cantidad;
        
        const calculosActualizados = calcularTotalesItem(
          nuevaCantidad,
          itemExistente.precio_unitario,
          itemExistente.descuento,
          itemExistente.tipo_afectacion_igv
        );
        
        nuevosItems[indexExistente] = {
          ...itemExistente,
          cantidad: nuevaCantidad,
          ...calculosActualizados,
        };
        
        const totales = calcularTotalesFactura(nuevosItems, estado.descuentoGlobal);
        
        return {
          ...estado,
          items: nuevosItems,
          ...totales,
          guardadoTemporal: false,
        };
      } else {
        // Si no existe, agregar nuevo item
        const nuevoItem: ItemFactura = {
          id: Date.now(), // ID temporal
          producto_id: producto.id,
          codigo_producto: producto.codigo || `PROD-${producto.id}`,
          descripcion: producto.nombre,
          cantidad,
          precio_unitario: producto.precio_venta || 0,
          descuento: 0,
          tipo_afectacion_igv: producto.tipo_afectacion_igv || '10',
          unidad_medida: producto.unidad_medida || 'NIU',
          stock_disponible: producto.stock_actual,
          categoria: producto.categoria?.nombre,
          subtotal: 0,
          igv: 0,
          total: 0,
        };
        
        const calculosItem = calcularTotalesItem(
          nuevoItem.cantidad,
          nuevoItem.precio_unitario,
          nuevoItem.descuento,
          nuevoItem.tipo_afectacion_igv
        );
        
        const itemCompleto = {
          ...nuevoItem,
          ...calculosItem,
        };
        
        const nuevosItems = [...estado.items, itemCompleto];
        const totales = calcularTotalesFactura(nuevosItems, estado.descuentoGlobal);
        
        return {
          ...estado,
          items: nuevosItems,
          ...totales,
          guardadoTemporal: false,
        };
      }
    }

    case 'ACTUALIZAR_ITEM': {
      const { index, item } = accion.payload;
      const nuevosItems = [...estado.items];
      const itemActual = nuevosItems[index];
      
      if (!itemActual) return estado;
      
      const itemActualizado = { ...itemActual, ...item };
      
      // Recalcular totales del item
      const calculos = calcularTotalesItem(
        itemActualizado.cantidad,
        itemActualizado.precio_unitario,
        itemActualizado.descuento,
        itemActualizado.tipo_afectacion_igv
      );
      
      nuevosItems[index] = {
        ...itemActualizado,
        ...calculos,
      };
      
      const totales = calcularTotalesFactura(nuevosItems, estado.descuentoGlobal);
      
      return {
        ...estado,
        items: nuevosItems,
        ...totales,
        guardadoTemporal: false,
      };
    }

    case 'REMOVER_ITEM': {
      const nuevosItems = estado.items.filter((_, i) => i !== accion.payload.index);
      const totales = calcularTotalesFactura(nuevosItems, estado.descuentoGlobal);
      
      return {
        ...estado,
        items: nuevosItems,
        ...totales,
        guardadoTemporal: false,
      };
    }

    case 'LIMPIAR_CARRITO': {
      return {
        ...estado,
        items: [],
        cliente: null,
        observaciones: '',
        descuentoGlobal: 0,
        subtotal: 0,
        igv: 0,
        total: 0,
        error: null,
        guardadoTemporal: false,
      };
    }

    case 'SELECCIONAR_CLIENTE': {
      return {
        ...estado,
        cliente: accion.payload,
        guardadoTemporal: false,
      };
    }

    case 'CAMBIAR_TIPO_DOCUMENTO': {
      return {
        ...estado,
        tipoDocumento: accion.payload,
        guardadoTemporal: false,
      };
    }

    case 'CAMBIAR_TIPO_PAGO': {
      return {
        ...estado,
        tipoPago: accion.payload,
        guardadoTemporal: false,
      };
    }

    case 'CAMBIAR_DIAS_CREDITO': {
      return {
        ...estado,
        diasCredito: accion.payload,
        guardadoTemporal: false,
      };
    }

    case 'CAMBIAR_DESCUENTO_GLOBAL': {
      const totales = calcularTotalesFactura(estado.items, accion.payload);
      
      return {
        ...estado,
        descuentoGlobal: accion.payload,
        ...totales,
        guardadoTemporal: false,
      };
    }

    case 'CAMBIAR_OBSERVACIONES': {
      return {
        ...estado,
        observaciones: accion.payload,
        guardadoTemporal: false,
      };
    }

    case 'RECALCULAR_TOTALES': {
      const totales = calcularTotalesFactura(estado.items, estado.descuentoGlobal);
      
      return {
        ...estado,
        ...totales,
      };
    }

    case 'ESTABLECER_CARGANDO': {
      return {
        ...estado,
        cargando: accion.payload,
      };
    }

    case 'ESTABLECER_ERROR': {
      return {
        ...estado,
        error: accion.payload,
        cargando: false,
      };
    }

    case 'CARGAR_DESDE_STORAGE': {
      return {
        ...estado,
        ...accion.payload,
      };
    }

    case 'ACTUALIZAR_CONFIGURACION': {
      return {
        ...estado,
        configuracion: {
          ...estado.configuracion,
          ...accion.payload,
        },
      };
    }

    case 'MARCAR_GUARDADO_TEMPORAL': {
      return {
        ...estado,
        guardadoTemporal: accion.payload,
      };
    }

    default:
      return estado;
  }
}

// =======================================================
// CONTEXTO
// =======================================================

const ContextoFacturacion = createContext<ContextoFacturacion | null>(null);

// =======================================================
// PROVIDER
// =======================================================

export interface PropiedadesProviderFacturacion {
  children: React.ReactNode;
}

export const ProviderFacturacion: React.FC<PropiedadesProviderFacturacion> = ({ children }) => {
  const [estado, dispatch] = useReducer(facturacionReducer, estadoInicial);

  // =======================================================
  // FUNCIONES DE ACCIÓN
  // =======================================================

  const agregarProducto = useCallback((producto: ProductoListItem, cantidad = 1) => {
    dispatch({ type: 'AGREGAR_ITEM', payload: { producto, cantidad } });
  }, []);

  const actualizarItem = useCallback((index: number, item: Partial<ItemFactura>) => {
    dispatch({ type: 'ACTUALIZAR_ITEM', payload: { index, item } });
  }, []);

  const removerItem = useCallback((index: number) => {
    dispatch({ type: 'REMOVER_ITEM', payload: { index } });
  }, []);

  const limpiarCarrito = useCallback(() => {
    dispatch({ type: 'LIMPIAR_CARRITO' });
  }, []);

  const seleccionarCliente = useCallback((cliente: ClienteFactura) => {
    dispatch({ type: 'SELECCIONAR_CLIENTE', payload: cliente });
  }, []);

  const limpiarCliente = useCallback(() => {
    dispatch({ type: 'SELECCIONAR_CLIENTE', payload: null as any });
  }, []);

  const cambiarTipoDocumento = useCallback((tipo: TipoDocumento) => {
    dispatch({ type: 'CAMBIAR_TIPO_DOCUMENTO', payload: tipo });
  }, []);

  const cambiarTipoPago = useCallback((tipo: TipoPago) => {
    dispatch({ type: 'CAMBIAR_TIPO_PAGO', payload: tipo });
  }, []);

  const cambiarDiasCredito = useCallback((dias: number) => {
    dispatch({ type: 'CAMBIAR_DIAS_CREDITO', payload: dias });
  }, []);

  const cambiarDescuentoGlobal = useCallback((descuento: number) => {
    dispatch({ type: 'CAMBIAR_DESCUENTO_GLOBAL', payload: descuento });
  }, []);

  const cambiarObservaciones = useCallback((observaciones: string) => {
    dispatch({ type: 'CAMBIAR_OBSERVACIONES', payload: observaciones });
  }, []);

  // =======================================================
  // FUNCIONES UTILITARIAS
  // =======================================================

  const obtenerResumenFactura = useCallback((): CrearFacturaRequest => {
    return {
      tipo_documento: estado.tipoDocumento,
      cliente_id: estado.cliente?.id || 0,
      tipo_pago: estado.tipoPago,
      dias_credito: estado.tipoPago === 'credito' ? estado.diasCredito : undefined,
      descuento_global: estado.descuentoGlobal,
      observaciones: estado.observaciones,
      items: estado.items.map(item => ({
        producto_id: item.producto_id,
        codigo_producto: item.codigo_producto,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        descuento: item.descuento,
        tipo_afectacion_igv: item.tipo_afectacion_igv,
        unidad_medida: item.unidad_medida,
      })),
    };
  }, [estado]);

  const validarFactura = useCallback((): { valido: boolean; errores: string[] } => {
    const errores: string[] = [];

    // Validar items
    if (estado.items.length === 0) {
      errores.push('Debe agregar al menos un producto');
    }

    // Validar cliente para facturas
    if (estado.tipoDocumento === 'factura' && !estado.cliente) {
      errores.push('Debe seleccionar un cliente para emitir factura');
    }

    // Validar cliente con RUC para facturas
    if (estado.tipoDocumento === 'factura' && estado.cliente?.tipo_documento !== '6') {
      errores.push('Para emitir factura el cliente debe tener RUC');
    }

    // Validar stock si está habilitado
    if (!estado.configuracion.permitirStockNegativo) {
      estado.items.forEach((item, index) => {
        if (item.stock_disponible !== undefined && item.cantidad > item.stock_disponible) {
          errores.push(`Item ${index + 1}: Stock insuficiente (disponible: ${item.stock_disponible})`);
        }
      });
    }

    // Validar días de crédito
    if (estado.tipoPago === 'credito' && estado.diasCredito <= 0) {
      errores.push('Debe especificar los días de crédito');
    }

    // Validar que haya un total mayor a cero
    if (estado.total <= 0) {
      errores.push('El total de la factura debe ser mayor a cero');
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }, [estado]);

  const guardarTemporal = useCallback(() => {
    try {
      const datosParaGuardar = {
        items: estado.items,
        cliente: estado.cliente,
        tipoDocumento: estado.tipoDocumento,
        tipoPago: estado.tipoPago,
        diasCredito: estado.diasCredito,
        descuentoGlobal: estado.descuentoGlobal,
        observaciones: estado.observaciones,
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEYS.CARRITO_TEMPORAL, JSON.stringify(datosParaGuardar));
      dispatch({ type: 'MARCAR_GUARDADO_TEMPORAL', payload: true });
    } catch (error) {
      console.error('Error al guardar datos temporales:', error);
    }
  }, [estado]);

  const cargarTemporal = useCallback(() => {
    try {
      const datosGuardados = localStorage.getItem(STORAGE_KEYS.CARRITO_TEMPORAL);
      if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);
        
        // Verificar que los datos no sean muy antiguos (24 horas)
        const ahora = Date.now();
        const tiempoLimite = 24 * 60 * 60 * 1000; // 24 horas
        
        if (datos.timestamp && (ahora - datos.timestamp) < tiempoLimite) {
          dispatch({ type: 'CARGAR_DESDE_STORAGE', payload: datos });
          dispatch({ type: 'RECALCULAR_TOTALES' });
        } else {
          // Datos muy antiguos, limpiar
          limpiarTemporal();
        }
      }
    } catch (error) {
      console.error('Error al cargar datos temporales:', error);
      limpiarTemporal();
    }
  }, []);

  const limpiarTemporal = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CARRITO_TEMPORAL);
      dispatch({ type: 'MARCAR_GUARDADO_TEMPORAL', payload: false });
    } catch (error) {
      console.error('Error al limpiar datos temporales:', error);
    }
  }, []);

  // =======================================================
  // ESTADOS COMPUTADOS
  // =======================================================

  const tieneItems = estado.items.length > 0;
  const tieneCliente = estado.cliente !== null;
  const puedeFacturar = validarFactura().valido;
  const totalItems = estado.items.reduce((total, item) => total + item.cantidad, 0);

  // =======================================================
  // EFECTOS
  // =======================================================

  // Autoguardado temporal
  useEffect(() => {
    if (estado.configuracion.autoguardar && !estado.guardadoTemporal && tieneItems) {
      const timeout = setTimeout(() => {
        guardarTemporal();
      }, POS_CONFIG.AUTOGUARDADO_INTERVALO);

      return () => clearTimeout(timeout);
    }
  }, [estado, guardarTemporal, tieneItems]);

  // Cargar datos temporales al inicializar
  useEffect(() => {
    cargarTemporal();
  }, []); // Solo una vez al montar el componente

  // =======================================================
  // VALOR DEL CONTEXTO
  // =======================================================

  const valorContexto: ContextoFacturacion = {
    estado,
    
    // Acciones del carrito
    agregarProducto,
    actualizarItem,
    removerItem,
    limpiarCarrito,
    
    // Acciones del cliente
    seleccionarCliente,
    limpiarCliente,
    
    // Acciones de configuración
    cambiarTipoDocumento,
    cambiarTipoPago,
    cambiarDiasCredito,
    cambiarDescuentoGlobal,
    cambiarObservaciones,
    
    // Utilidades
    obtenerResumenFactura,
    validarFactura,
    guardarTemporal,
    cargarTemporal,
    limpiarTemporal,
    
    // Estados computados
    tieneItems,
    tieneCliente,
    puedeFacturar,
    totalItems,
  };

  return (
    <ContextoFacturacion.Provider value={valorContexto}>
      {children}
    </ContextoFacturacion.Provider>
  );
};

// =======================================================
// HOOK PARA USAR EL CONTEXTO
// =======================================================

export const useFacturacion = (): ContextoFacturacion => {
  const contexto = useContext(ContextoFacturacion);
  
  if (!contexto) {
    throw new Error('useFacturacion debe ser usado dentro de un ProviderFacturacion');
  }
  
  return contexto;
};

export default ContextoFacturacion;