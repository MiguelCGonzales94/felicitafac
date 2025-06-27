/**
 * useFacturacion Hook - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Hook específico para funcionalidades del punto de venta
 */

import { useState, useCallback, useRef } from 'react';
import { useFacturacion as useContextoFacturacion } from '../contextos/FacturacionContext';
import { useApiPost } from './useApi';
import type { 
  Factura, 
  CrearFacturaRequest, 
  ValidacionFactura,
  ItemFactura 
} from '../types/factura';
import type { ProductoListItem } from '../types/producto';
import type { ClienteFactura } from '../types/cliente';
import { API_ENDPOINTS, MENSAJES, POS_CONFIG } from '../utils/constantes';
import { formatearMoneda } from '../utils/formatos';

// =======================================================
// TIPOS ESPECÍFICOS DEL HOOK
// =======================================================

export interface ResultadoEmisionFactura {
  exito: boolean;
  factura?: Factura;
  mensaje: string;
  errores?: string[];
}

export interface ValidacionStockItem {
  producto_id: number;
  descripcion: string;
  cantidad_solicitada: number;
  stock_disponible: number;
  diferencia: number;
}

export interface ResultadoValidacionStock {
  valido: boolean;
  errores: ValidacionStockItem[];
  advertencias: string[];
}

export interface OpcionesEmision {
  validarStock?: boolean;
  mostrarConfirmacion?: boolean;
  limpiarDespuesEmision?: boolean;
  imprimirAutomatico?: boolean;
}

export interface EstadisticasPOS {
  ventasHoy: {
    cantidad: number;
    monto: number;
  };
  productosVendidos: number;
  promedioVenta: number;
  ticketPromedio: number;
}

// =======================================================
// HOOK PRINCIPAL
// =======================================================

export const usePuntoDeVenta = () => {
  const contexto = useContextoFacturacion();
  const [estadisticas, setEstadisticas] = useState<EstadisticasPOS | null>(null);
  const [historialVentas, setHistorialVentas] = useState<Factura[]>([]);
  
  // Referencias para shortcuts
  const shortcutsRef = useRef<{ [key: string]: () => void }>({});

  // APIs para emisión de documentos
  const {
    ejecutar: emitirFactura,
    loading: emitiendoFactura,
    error: errorEmision,
  } = useApiPost<Factura, CrearFacturaRequest>(API_ENDPOINTS.FACTURACION.CREAR);

  const {
    ejecutar: validarStock,
    loading: validandoStock,
  } = useApiPost<ResultadoValidacionStock, { items: ItemFactura[] }>(
    API_ENDPOINTS.FACTURACION.VALIDAR_STOCK
  );

  // =======================================================
  // FUNCIONES DE VALIDACIÓN
  // =======================================================

  /**
   * Validar stock antes de emitir
   */
  const validarStockItems = useCallback(async (): Promise<ResultadoValidacionStock> => {
    if (!contexto.estado.configuracion.mostrarStock) {
      return { valido: true, errores: [], advertencias: [] };
    }

    try {
      const resultado = await validarStock({ items: contexto.estado.items });
      return resultado || { valido: true, errores: [], advertencias: [] };
    } catch (error) {
      console.error('Error validando stock:', error);
      return {
        valido: false,
        errores: [],
        advertencias: ['Error al validar stock. Verifique manualmente.'],
      };
    }
  }, [contexto.estado.items, contexto.estado.configuracion.mostrarStock, validarStock]);

  /**
   * Validación completa antes de emisión
   */
  const validarParaEmision = useCallback(async (opciones: OpcionesEmision = {}) => {
    const { validarStock: debeValidarStock = true } = opciones;
    
    // Validación básica del contexto
    const validacionBasica = contexto.validarFactura();
    
    if (!validacionBasica.valido) {
      return {
        valido: false,
        errores: validacionBasica.errores,
        advertencias: [],
      };
    }

    // Validación de stock si está habilitada
    let resultadoStock: ResultadoValidacionStock = {
      valido: true,
      errores: [],
      advertencias: [],
    };

    if (debeValidarStock) {
      resultadoStock = await validarStockItems();
    }

    return {
      valido: validacionBasica.valido && resultadoStock.valido,
      errores: [...validacionBasica.errores, ...resultadoStock.errores.map(e => 
        `${e.descripcion}: Stock insuficiente (disponible: ${e.stock_disponible}, solicitado: ${e.cantidad_solicitada})`
      )],
      advertencias: resultadoStock.advertencias,
    };
  }, [contexto, validarStockItems]);

  // =======================================================
  // FUNCIONES DE EMISIÓN
  // =======================================================

  /**
   * Emitir documento (factura o boleta)
   */
  const emitirDocumento = useCallback(async (
    opciones: OpcionesEmision = {}
  ): Promise<ResultadoEmisionFactura> => {
    const {
      validarStock: debeValidarStock = true,
      mostrarConfirmacion = true,
      limpiarDespuesEmision = true,
      imprimirAutomatico = false,
    } = opciones;

    try {
      // Validación previa
      const validacion = await validarParaEmision({ validarStock: debeValidarStock });
      
      if (!validacion.valido) {
        return {
          exito: false,
          mensaje: 'Error de validación',
          errores: validacion.errores,
        };
      }

      // Mostrar advertencias si las hay
      if (validacion.advertencias.length > 0 && mostrarConfirmacion) {
        const confirmar = window.confirm(
          `Se encontraron las siguientes advertencias:\n\n${validacion.advertencias.join('\n')}\n\n¿Desea continuar?`
        );
        
        if (!confirmar) {
          return {
            exito: false,
            mensaje: 'Emisión cancelada por el usuario',
          };
        }
      }

      // Obtener datos de la factura
      const datosFactura = contexto.obtenerResumenFactura();

      // Emitir documento
      const facturaEmitida = await emitirFactura(datosFactura);

      if (facturaEmitida) {
        // Agregar al historial
        setHistorialVentas(prev => [facturaEmitida, ...prev.slice(0, 49)]); // Mantener últimas 50

        // Limpiar carrito si está configurado
        if (limpiarDespuesEmision) {
          contexto.limpiarCarrito();
          contexto.limpiarTemporal();
        }

        // Imprimir automáticamente si está configurado
        if (imprimirAutomatico) {
          // TODO: Implementar impresión automática
          console.log('Imprimiendo documento automáticamente...');
        }

        return {
          exito: true,
          factura: facturaEmitida,
          mensaje: `${contexto.estado.tipoDocumento === 'factura' ? 'Factura' : 'Boleta'} emitida correctamente`,
        };
      }

      return {
        exito: false,
        mensaje: 'Error al emitir el documento',
      };

    } catch (error) {
      console.error('Error emitiendo documento:', error);
      return {
        exito: false,
        mensaje: 'Error interno al emitir el documento',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }, [contexto, validarParaEmision, emitirFactura]);

  // =======================================================
  // FUNCIONES DE PRODUCTOS
  // =======================================================

  /**
   * Agregar producto con validaciones
   */
  const agregarProductoConValidacion = useCallback((
    producto: ProductoListItem,
    cantidad = 1
  ): { exito: boolean; mensaje?: string } => {
    // Validar stock si está habilitado
    if (contexto.estado.configuracion.mostrarStock && !contexto.estado.configuracion.permitirStockNegativo) {
      if (producto.stock_actual !== undefined && cantidad > producto.stock_actual) {
        return {
          exito: false,
          mensaje: `Stock insuficiente. Disponible: ${producto.stock_actual}`,
        };
      }
    }

    // Validar límite de items en carrito
    if (contexto.estado.items.length >= POS_CONFIG.MAX_ITEMS_CARRITO) {
      return {
        exito: false,
        mensaje: `Máximo ${POS_CONFIG.MAX_ITEMS_CARRITO} items por factura`,
      };
    }

    // Validar precio del producto
    if (!producto.precio_venta || producto.precio_venta <= 0) {
      return {
        exito: false,
        mensaje: 'El producto no tiene precio configurado',
      };
    }

    contexto.agregarProducto(producto, cantidad);
    
    return {
      exito: true,
      mensaje: `${producto.nombre} agregado al carrito`,
    };
  }, [contexto]);

  /**
   * Buscar y agregar producto por código
   */
  const buscarYAgregarPorCodigo = useCallback(async (codigo: string): Promise<{
    exito: boolean;
    mensaje: string;
    producto?: ProductoListItem;
  }> => {
    try {
      // TODO: Implementar búsqueda por código
      // const producto = await buscarProductoPorCodigo(codigo);
      
      // Por ahora, simulamos la búsqueda
      const productoSimulado: ProductoListItem = {
        id: Math.random(),
        nombre: `Producto ${codigo}`,
        codigo,
        precio_venta: 10.00,
        stock_actual: 100,
        tipo_afectacion_igv: '10',
        unidad_medida: 'NIU',
        estado: 'activo',
        categoria: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const resultado = agregarProductoConValidacion(productoSimulado);
      
      return {
        exito: resultado.exito,
        mensaje: resultado.mensaje || '',
        producto: resultado.exito ? productoSimulado : undefined,
      };

    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error al buscar el producto',
      };
    }
  }, [agregarProductoConValidacion]);

  // =======================================================
  // FUNCIONES DE CLIENTE
  // =======================================================

  /**
   * Seleccionar cliente con validaciones
   */
  const seleccionarClienteConValidacion = useCallback((cliente: ClienteFactura): {
    exito: boolean;
    mensaje?: string;
  } => {
    // Validar tipo de documento según el tipo de comprobante
    if (contexto.estado.tipoDocumento === 'factura' && cliente.tipo_documento !== '6') {
      return {
        exito: false,
        mensaje: 'Para emitir factura el cliente debe tener RUC',
      };
    }

    contexto.seleccionarCliente(cliente);
    
    return {
      exito: true,
      mensaje: `Cliente ${cliente.nombre_o_razon_social} seleccionado`,
    };
  }, [contexto]);

  // =======================================================
  // FUNCIONES DE SHORTCUTS
  // =======================================================

  /**
   * Configurar shortcuts de teclado
   */
  const configurarShortcuts = useCallback(() => {
    shortcutsRef.current = {
      [POS_CONFIG.SHORTCUTS.NUEVA_FACTURA]: () => {
        contexto.cambiarTipoDocumento('factura');
      },
      [POS_CONFIG.SHORTCUTS.NUEVA_BOLETA]: () => {
        contexto.cambiarTipoDocumento('boleta');
      },
      [POS_CONFIG.SHORTCUTS.LIMPIAR_CARRITO]: () => {
        if (window.confirm('¿Está seguro de limpiar el carrito?')) {
          contexto.limpiarCarrito();
        }
      },
    };
  }, [contexto]);

  /**
   * Manejar eventos de teclado
   */
  const manejarShortcut = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, altKey } = event;
    
    let shortcut = key.toUpperCase();
    if (ctrlKey) shortcut = `CTRL+${shortcut}`;
    if (altKey) shortcut = `ALT+${shortcut}`;

    const accion = shortcutsRef.current[shortcut];
    if (accion) {
      event.preventDefault();
      accion();
    }
  }, []);

  // =======================================================
  // FUNCIONES UTILITARIAS
  // =======================================================

  /**
   * Obtener resumen del carrito
   */
  const obtenerResumenCarrito = useCallback(() => {
    const { estado } = contexto;
    
    return {
      cantidadItems: estado.items.length,
      totalUnidades: estado.items.reduce((total, item) => total + item.cantidad, 0),
      subtotal: formatearMoneda(estado.subtotal),
      igv: formatearMoneda(estado.igv),
      total: formatearMoneda(estado.total),
      descuentoGlobal: estado.descuentoGlobal,
      tipoDocumento: estado.tipoDocumento,
      cliente: estado.cliente?.nombre_o_razon_social || 'Cliente genérico',
    };
  }, [contexto]);

  /**
   * Obtener estadísticas del día
   */
  const cargarEstadisticas = useCallback(async () => {
    try {
      // TODO: Implementar carga de estadísticas reales
      setEstadisticas({
        ventasHoy: {
          cantidad: historialVentas.length,
          monto: historialVentas.reduce((total, venta) => total + venta.total, 0),
        },
        productosVendidos: historialVentas.reduce((total, venta) => 
          total + venta.items.reduce((subtotal, item) => subtotal + item.cantidad, 0), 0
        ),
        promedioVenta: historialVentas.length > 0 ? 
          historialVentas.reduce((total, venta) => total + venta.total, 0) / historialVentas.length : 0,
        ticketPromedio: historialVentas.length > 0 ? 
          historialVentas.reduce((total, venta) => total + venta.items.length, 0) / historialVentas.length : 0,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, [historialVentas]);

  // =======================================================
  // VALOR DE RETORNO
  // =======================================================

  return {
    // Estado del contexto
    ...contexto,
    
    // Estados específicos del hook
    estadisticas,
    historialVentas,
    validandoStock,
    emitiendoFactura,
    errorEmision,
    
    // Funciones de emisión
    emitirDocumento,
    validarParaEmision,
    validarStockItems,
    
    // Funciones de productos
    agregarProductoConValidacion,
    buscarYAgregarPorCodigo,
    
    // Funciones de cliente
    seleccionarClienteConValidacion,
    
    // Funciones de shortcuts
    configurarShortcuts,
    manejarShortcut,
    
    // Funciones utilitarias
    obtenerResumenCarrito,
    cargarEstadisticas,
    
    // Estados computados adicionales
    puedeEmitir: contexto.puedeFacturar && !emitiendoFactura,
    tieneErrores: !!errorEmision,
    carritoPendiente: contexto.tieneItems && !contexto.estado.guardadoTemporal,
  };
};

// =======================================================
// HOOKS AUXILIARES
// =======================================================

/**
 * Hook para manejo de productos en el POS
 */
export const useProductosPOS = () => {
  const { agregarProductoConValidacion, buscarYAgregarPorCodigo } = usePuntoDeVenta();
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoListItem | null>(null);
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);

  const mostrarModalAgregar = useCallback((producto: ProductoListItem) => {
    setProductoSeleccionado(producto);
    setModalAgregarVisible(true);
  }, []);

  const cerrarModalAgregar = useCallback(() => {
    setProductoSeleccionado(null);
    setModalAgregarVisible(false);
  }, []);

  const agregarConCantidad = useCallback((cantidad: number) => {
    if (productoSeleccionado) {
      const resultado = agregarProductoConValidacion(productoSeleccionado, cantidad);
      if (resultado.exito) {
        cerrarModalAgregar();
      }
      return resultado;
    }
    return { exito: false, mensaje: 'No hay producto seleccionado' };
  }, [productoSeleccionado, agregarProductoConValidacion, cerrarModalAgregar]);

  return {
    productoSeleccionado,
    modalAgregarVisible,
    mostrarModalAgregar,
    cerrarModalAgregar,
    agregarConCantidad,
    agregarProductoConValidacion,
    buscarYAgregarPorCodigo,
  };
};

/**
 * Hook para manejo de clientes en el POS
 */
export const useClientesPOS = () => {
  const { seleccionarClienteConValidacion, estado } = usePuntoDeVenta();
  const [modalClienteVisible, setModalClienteVisible] = useState(false);
  const [clienteBuscado, setClienteBuscado] = useState<string>('');

  const mostrarModalCliente = useCallback(() => {
    setModalClienteVisible(true);
  }, []);

  const cerrarModalCliente = useCallback(() => {
    setModalClienteVisible(false);
    setClienteBuscado('');
  }, []);

  const seleccionarYCerrar = useCallback((cliente: ClienteFactura) => {
    const resultado = seleccionarClienteConValidacion(cliente);
    if (resultado.exito) {
      cerrarModalCliente();
    }
    return resultado;
  }, [seleccionarClienteConValidacion, cerrarModalCliente]);

  return {
    clienteActual: estado.cliente,
    modalClienteVisible,
    clienteBuscado,
    setClienteBuscado,
    mostrarModalCliente,
    cerrarModalCliente,
    seleccionarYCerrar,
    seleccionarClienteConValidacion,
  };
};

export default usePuntoDeVenta;