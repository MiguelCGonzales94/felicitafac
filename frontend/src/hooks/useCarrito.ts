/**
 * Hook useCarrito - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Hook para manejo del carrito POS con persistencia
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNotificaciones } from '../componentes/comunes/Notificaciones';
import { 
  ItemVentaPOS, 
  VentaPOS, 
  TipoDocumentoPOS, 
  MetodoPagoPOS,
  ConfiguracionPOS
} from '../types/pos';
import { Cliente } from '../types/cliente';
import { Producto } from '../types/producto';
import { calcularIgv, calcularTotal } from '../utils/moneyUtils';
import { formatearMoneda } from '../utils/formatters';
import { validarRuc, validarDni } from '../utils/validaciones';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

export interface EstadoCarrito {
  items: ItemVentaPOS[];
  cliente: Cliente | null;
  tipoDocumento: TipoDocumentoPOS;
  observaciones: string;
  descuentoGlobal: number;
  descuentoPorcentaje: number;
  metodoPago: MetodoPagoPOS;
  montoPagado: number;
  vuelto: number;
  serie: string;
  correlativo?: number;
  // Calculados
  cantidadItems: number;
  subtotal: number;
  totalDescuentos: number;
  totalIgv: number;
  totalGeneral: number;
  // Estados
  valido: boolean;
  errors: string[];
  guardado: boolean;
  modificado: boolean;
}

export interface ConfiguracionCarrito {
  persistirEnLocalStorage: boolean;
  claveLocalStorage: string;
  validarStockAutomatico: boolean;
  calcularIgvAutomatico: boolean;
  permitirClienteOpcional: boolean;
  permitirStockNegativo: boolean;
  redondearTotales: boolean;
  decimalesMoneda: number;
  descuentoMaximoPorcentaje: number;
  mostrarAlertas: boolean;
  autocompletarSerie: boolean;
}

export interface ResultadoValidacion {
  valido: boolean;
  errores: string[];
  warnings: string[];
}

export interface AccionCarrito {
  tipo: 'agregar' | 'actualizar' | 'eliminar' | 'limpiar' | 'cliente' | 'descuento' | 'observaciones';
  timestamp: number;
  descripcion: string;
  datos?: any;
}

// =======================================================
// CONFIGURACIÓN POR DEFECTO
// =======================================================

const CONFIGURACION_DEFAULT: ConfiguracionCarrito = {
  persistirEnLocalStorage: true,
  claveLocalStorage: 'felicitafac_carrito_pos',
  validarStockAutomatico: true,
  calcularIgvAutomatico: true,
  permitirClienteOpcional: true,
  permitirStockNegativo: false,
  redondearTotales: true,
  decimalesMoneda: 2,
  descuentoMaximoPorcentaje: 50,
  mostrarAlertas: true,
  autocompletarSerie: true,
};

const ESTADO_INICIAL: EstadoCarrito = {
  items: [],
  cliente: null,
  tipoDocumento: '03', // Boleta por defecto
  observaciones: '',
  descuentoGlobal: 0,
  descuentoPorcentaje: 0,
  metodoPago: 'efectivo',
  montoPagado: 0,
  vuelto: 0,
  serie: 'B001',
  // Calculados
  cantidadItems: 0,
  subtotal: 0,
  totalDescuentos: 0,
  totalIgv: 0,
  totalGeneral: 0,
  // Estados
  valido: true,
  errors: [],
  guardado: true,
  modificado: false,
};

// =======================================================
// HOOK PRINCIPAL
// =======================================================

export const useCarrito = (configuracion?: Partial<ConfiguracionCarrito>) => {
  // =======================================================
  // CONFIGURACIÓN
  // =======================================================

  const config = useMemo(() => ({
    ...CONFIGURACION_DEFAULT,
    ...configuracion,
  }), [configuracion]);

  // =======================================================
  // ESTADO LOCAL
  // =======================================================

  const [estado, setEstado] = useState<EstadoCarrito>(ESTADO_INICIAL);
  const [historialAcciones, setHistorialAcciones] = useState<AccionCarrito[]>([]);

  // =======================================================
  // REFS
  // =======================================================

  const timeoutGuardado = useRef<NodeJS.Timeout | null>(null);
  const estadoInicialRef = useRef<EstadoCarrito>(ESTADO_INICIAL);

  // =======================================================
  // HOOKS EXTERNOS
  // =======================================================

  const { mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useNotificaciones();

  // =======================================================
  // EFECTOS
  // =======================================================

  // Cargar desde localStorage al inicializar
  useEffect(() => {
    if (config.persistirEnLocalStorage) {
      cargarDesdeLocalStorage();
    }
  }, [config.persistirEnLocalStorage]);

  // Guardar en localStorage cuando cambie el estado
  useEffect(() => {
    if (config.persistirEnLocalStorage && estado.modificado) {
      guardarEnLocalStorage();
    }
  }, [estado, config.persistirEnLocalStorage]);

  // Recalcular totales cuando cambien los items o descuentos
  useEffect(() => {
    recalcularTotales();
  }, [estado.items, estado.descuentoGlobal, estado.descuentoPorcentaje]);

  // =======================================================
  // FUNCIONES AUXILIARES
  // =======================================================

  const cargarDesdeLocalStorage = useCallback(() => {
    try {
      const carritoGuardado = localStorage.getItem(config.claveLocalStorage);
      if (carritoGuardado) {
        const estadoGuardado = JSON.parse(carritoGuardado);
        
        // Validar que la estructura sea correcta
        if (estadoGuardado && typeof estadoGuardado === 'object') {
          setEstado(prev => ({
            ...prev,
            ...estadoGuardado,
            guardado: true,
            modificado: false,
          }));
          
          if (config.mostrarAlertas && estadoGuardado.items?.length > 0) {
            mostrarInfo('Carrito restaurado', `Se restauraron ${estadoGuardado.items.length} productos`);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar carrito desde localStorage:', error);
      if (config.mostrarAlertas) {
        mostrarAdvertencia('Error al cargar', 'No se pudo restaurar el carrito guardado');
      }
    }
  }, [config.claveLocalStorage, config.mostrarAlertas, mostrarInfo, mostrarAdvertencia]);

  const guardarEnLocalStorage = useCallback(() => {
    if (timeoutGuardado.current) {
      clearTimeout(timeoutGuardado.current);
    }

    timeoutGuardado.current = setTimeout(() => {
      try {
        const estadoParaGuardar = {
          ...estado,
          guardado: true,
          modificado: false,
        };
        
        localStorage.setItem(config.claveLocalStorage, JSON.stringify(estadoParaGuardar));
        
        setEstado(prev => ({
          ...prev,
          guardado: true,
          modificado: false,
        }));
      } catch (error) {
        console.error('Error al guardar carrito en localStorage:', error);
        if (config.mostrarAlertas) {
          mostrarError('Error al guardar', 'No se pudo guardar el carrito');
        }
      }
    }, 500); // Debounce de 500ms
  }, [estado, config.claveLocalStorage, config.mostrarAlertas, mostrarError]);

  const agregarAccion = useCallback((accion: Omit<AccionCarrito, 'timestamp'>) => {
    const nuevaAccion: AccionCarrito = {
      ...accion,
      timestamp: Date.now(),
    };

    setHistorialAcciones(prev => [nuevaAccion, ...prev.slice(0, 49)]); // Mantener últimas 50 acciones
  }, []);

  const redondearMonto = useCallback((monto: number): number => {
    if (!config.redondearTotales) return monto;
    
    const factor = Math.pow(10, config.decimalesMoneda);
    return Math.round(monto * factor) / factor;
  }, [config.redondearTotales, config.decimalesMoneda]);

  const recalcularTotales = useCallback(() => {
    const subtotal = estado.items.reduce((total, item) => {
      const subtotalItem = item.cantidad * item.precio_unitario;
      const descuentoItem = subtotalItem * (item.descuento / 100);
      return total + subtotalItem - descuentoItem;
    }, 0);

    const totalDescuentos = subtotal * (estado.descuentoPorcentaje / 100) + estado.descuentoGlobal;
    const baseImponible = subtotal - totalDescuentos;
    const totalIgv = config.calcularIgvAutomatico ? calcularIgv(baseImponible) : 0;
    const totalGeneral = baseImponible + totalIgv;

    setEstado(prev => ({
      ...prev,
      cantidadItems: prev.items.reduce((total, item) => total + item.cantidad, 0),
      subtotal: redondearMonto(subtotal),
      totalDescuentos: redondearMonto(totalDescuentos),
      totalIgv: redondearMonto(totalIgv),
      totalGeneral: redondearMonto(totalGeneral),
      vuelto: Math.max(0, redondearMonto(prev.montoPagado - totalGeneral)),
    }));
  }, [estado.items, estado.descuentoPorcentaje, estado.descuentoGlobal, config.calcularIgvAutomatico, redondearMonto]);

  // =======================================================
  // FUNCIONES DE VALIDACIÓN
  // =======================================================

  const validarItem = useCallback((item: ItemVentaPOS): ResultadoValidacion => {
    const errores: string[] = [];
    const warnings: string[] = [];

    // Validar cantidad
    if (item.cantidad <= 0) {
      errores.push('La cantidad debe ser mayor a 0');
    }

    // Validar precio
    if (item.precio_unitario < 0) {
      errores.push('El precio no puede ser negativo');
    }

    // Validar descuento
    if (item.descuento < 0 || item.descuento > 100) {
      errores.push('El descuento debe estar entre 0% y 100%');
    }

    // Validar stock si está habilitado
    if (config.validarStockAutomatico && !config.permitirStockNegativo) {
      if (item.stock_disponible !== undefined && item.cantidad > item.stock_disponible) {
        errores.push(`Stock insuficiente. Disponible: ${item.stock_disponible}`);
      } else if (item.stock_disponible !== undefined && item.cantidad === item.stock_disponible) {
        warnings.push('Usando todo el stock disponible');
      }
    }

    return {
      valido: errores.length === 0,
      errores,
      warnings,
    };
  }, [config.validarStockAutomatico, config.permitirStockNegativo]);

  const validarCarrito = useCallback(): ResultadoValidacion => {
    const errores: string[] = [];
    const warnings: string[] = [];

    // Validar que hay items
    if (estado.items.length === 0) {
      errores.push('El carrito está vacío');
    }

    // Validar cliente según tipo de documento
    if (estado.tipoDocumento === '01' && !estado.cliente) {
      errores.push('Se requiere cliente para facturas');
    }

    if (estado.cliente) {
      // Validar documento del cliente
      if (estado.tipoDocumento === '01') {
        const validacionRuc = validarRuc(estado.cliente.numero_documento);
        if (!validacionRuc.valido) {
          errores.push('RUC del cliente inválido para factura');
        }
      }
    }

    // Validar descuentos
    if (estado.descuentoPorcentaje > config.descuentoMaximoPorcentaje) {
      errores.push(`El descuento no puede exceder ${config.descuentoMaximoPorcentaje}%`);
    }

    // Validar pago
    if (estado.montoPagado < estado.totalGeneral && estado.metodoPago !== 'credito') {
      errores.push('El monto pagado es insuficiente');
    }

    // Validar items individualmente
    estado.items.forEach((item, index) => {
      const validacionItem = validarItem(item);
      if (!validacionItem.valido) {
        errores.push(`Item ${index + 1}: ${validacionItem.errores.join(', ')}`);
      }
      warnings.push(...validacionItem.warnings);
    });

    // Warnings adicionales
    if (estado.totalGeneral > 10000 && estado.metodoPago === 'efectivo') {
      warnings.push('Venta alta en efectivo. Considere otro método de pago.');
    }

    return {
      valido: errores.length === 0,
      errores,
      warnings,
    };
  }, [estado, config.descuentoMaximoPorcentaje, validarItem]);

  // =======================================================
  // FUNCIONES PRINCIPALES
  // =======================================================

  const agregarProducto = useCallback((producto: Producto, cantidad: number = 1): boolean => {
    try {
      // Buscar si el producto ya existe en el carrito
      const itemExistente = estado.items.find(item => item.producto_id === producto.id);

      if (itemExistente) {
        // Actualizar cantidad del item existente
        return actualizarItem(itemExistente.id!, {
          cantidad: itemExistente.cantidad + cantidad
        });
      }

      // Crear nuevo item
      const nuevoItem: ItemVentaPOS = {
        id: Date.now(), // ID temporal
        producto_id: producto.id,
        producto_codigo: producto.codigo,
        producto_nombre: producto.nombre,
        producto_descripcion: producto.descripcion,
        cantidad,
        precio_unitario: producto.precio_venta,
        precio_original: producto.precio_venta,
        descuento: 0,
        tipo_afectacion_igv: producto.tipo_afectacion_igv || '10',
        unidad_medida: producto.unidad_medida || 'NIU',
        stock_disponible: producto.stock_actual,
        subtotal: cantidad * producto.precio_venta,
        igv: config.calcularIgvAutomatico ? calcularIgv(cantidad * producto.precio_venta) : 0,
        total: cantidad * producto.precio_venta,
        imagen_url: producto.imagen_url,
      };

      // Validar el nuevo item
      const validacion = validarItem(nuevoItem);
      if (!validacion.valido) {
        if (config.mostrarAlertas) {
          mostrarError('Error al agregar producto', validacion.errores.join(', '));
        }
        return false;
      }

      // Mostrar warnings si existen
      if (validacion.warnings.length > 0 && config.mostrarAlertas) {
        mostrarAdvertencia('Advertencia', validacion.warnings.join(', '));
      }

      setEstado(prev => ({
        ...prev,
        items: [...prev.items, nuevoItem],
        modificado: true,
        guardado: false,
      }));

      agregarAccion({
        tipo: 'agregar',
        descripcion: `Agregado: ${producto.nombre} (${cantidad})`,
        datos: { producto_id: producto.id, cantidad },
      });

      if (config.mostrarAlertas) {
        mostrarExito('Producto agregado', `${producto.nombre} agregado al carrito`);
      }

      return true;
    } catch (error: any) {
      console.error('Error al agregar producto:', error);
      if (config.mostrarAlertas) {
        mostrarError('Error', 'No se pudo agregar el producto al carrito');
      }
      return false;
    }
  }, [estado.items, config.calcularIgvAutomatico, config.mostrarAlertas, validarItem, agregarAccion, mostrarExito, mostrarError, mostrarAdvertencia]);

  const actualizarItem = useCallback((itemId: number, cambios: Partial<ItemVentaPOS>): boolean => {
    try {
      const itemIndex = estado.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        if (config.mostrarAlertas) {
          mostrarError('Error', 'Item no encontrado en el carrito');
        }
        return false;
      }

      const itemActualizado = {
        ...estado.items[itemIndex],
        ...cambios,
      };

      // Recalcular totales del item
      const subtotalItem = itemActualizado.cantidad * itemActualizado.precio_unitario;
      const descuentoItem = subtotalItem * (itemActualizado.descuento / 100);
      const baseImponibleItem = subtotalItem - descuentoItem;
      
      itemActualizado.subtotal = redondearMonto(baseImponibleItem);
      itemActualizado.igv = config.calcularIgvAutomatico ? redondearMonto(calcularIgv(baseImponibleItem)) : 0;
      itemActualizado.total = redondearMonto(baseImponibleItem + itemActualizado.igv);

      // Validar el item actualizado
      const validacion = validarItem(itemActualizado);
      if (!validacion.valido) {
        if (config.mostrarAlertas) {
          mostrarError('Error al actualizar', validacion.errores.join(', '));
        }
        return false;
      }

      const nuevosItems = [...estado.items];
      nuevosItems[itemIndex] = itemActualizado;

      setEstado(prev => ({
        ...prev,
        items: nuevosItems,
        modificado: true,
        guardado: false,
      }));

      agregarAccion({
        tipo: 'actualizar',
        descripcion: `Actualizado: ${itemActualizado.producto_nombre}`,
        datos: { item_id: itemId, cambios },
      });

      return true;
    } catch (error: any) {
      console.error('Error al actualizar item:', error);
      if (config.mostrarAlertas) {
        mostrarError('Error', 'No se pudo actualizar el item');
      }
      return false;
    }
  }, [estado.items, config.calcularIgvAutomatico, config.mostrarAlertas, validarItem, redondearMonto, agregarAccion, mostrarError]);

  const eliminarItem = useCallback((itemId: number): boolean => {
    try {
      const itemAEliminar = estado.items.find(item => item.id === itemId);
      if (!itemAEliminar) {
        if (config.mostrarAlertas) {
          mostrarError('Error', 'Item no encontrado en el carrito');
        }
        return false;
      }

      setEstado(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId),
        modificado: true,
        guardado: false,
      }));

      agregarAccion({
        tipo: 'eliminar',
        descripcion: `Eliminado: ${itemAEliminar.producto_nombre}`,
        datos: { item_id: itemId },
      });

      if (config.mostrarAlertas) {
        mostrarInfo('Item eliminado', `${itemAEliminar.producto_nombre} eliminado del carrito`);
      }

      return true;
    } catch (error: any) {
      console.error('Error al eliminar item:', error);
      if (config.mostrarAlertas) {
        mostrarError('Error', 'No se pudo eliminar el item');
      }
      return false;
    }
  }, [estado.items, config.mostrarAlertas, agregarAccion, mostrarInfo, mostrarError]);

  const limpiarCarrito = useCallback(() => {
    setEstado(prev => ({
      ...ESTADO_INICIAL,
      serie: prev.serie, // Mantener la serie actual
      guardado: false,
      modificado: true,
    }));

    agregarAccion({
      tipo: 'limpiar',
      descripcion: 'Carrito vaciado',
    });

    if (config.mostrarAlertas) {
      mostrarInfo('Carrito vaciado', 'Todos los productos fueron eliminados');
    }
  }, [config.mostrarAlertas, agregarAccion, mostrarInfo]);

  const establecerCliente = useCallback((cliente: Cliente | null) => {
    setEstado(prev => ({
      ...prev,
      cliente,
      tipoDocumento: cliente && validarRuc(cliente.numero_documento).valido ? '01' : '03',
      modificado: true,
      guardado: false,
    }));

    agregarAccion({
      tipo: 'cliente',
      descripcion: cliente ? `Cliente: ${cliente.nombre_completo}` : 'Cliente removido',
      datos: { cliente_id: cliente?.id },
    });
  }, [agregarAccion]);

  const establecerTipoDocumento = useCallback((tipoDocumento: TipoDocumentoPOS) => {
    setEstado(prev => {
      let nuevaSerie = prev.serie;
      
      // Auto-completar serie si está habilitado
      if (config.autocompletarSerie) {
        switch (tipoDocumento) {
          case '01':
            nuevaSerie = 'F001';
            break;
          case '03':
            nuevaSerie = 'B001';
            break;
          case '07':
            nuevaSerie = 'NC01';
            break;
          case '08':
            nuevaSerie = 'ND01';
            break;
        }
      }

      return {
        ...prev,
        tipoDocumento,
        serie: nuevaSerie,
        modificado: true,
        guardado: false,
      };
    });
  }, [config.autocompletarSerie]);

  const aplicarDescuentoGlobal = useCallback((porcentaje: number, monto: number = 0) => {
    if (porcentaje > config.descuentoMaximoPorcentaje) {
      if (config.mostrarAlertas) {
        mostrarError('Descuento excesivo', `El descuento máximo permitido es ${config.descuentoMaximoPorcentaje}%`);
      }
      return false;
    }

    setEstado(prev => ({
      ...prev,
      descuentoPorcentaje: porcentaje,
      descuentoGlobal: monto,
      modificado: true,
      guardado: false,
    }));

    agregarAccion({
      tipo: 'descuento',
      descripcion: `Descuento aplicado: ${porcentaje}% + S/ ${monto}`,
      datos: { porcentaje, monto },
    });

    return true;
  }, [config.descuentoMaximoPorcentaje, config.mostrarAlertas, agregarAccion, mostrarError]);

  const establecerPago = useCallback((metodo: MetodoPagoPOS, monto: number) => {
    setEstado(prev => ({
      ...prev,
      metodoPago: metodo,
      montoPagado: monto,
      vuelto: Math.max(0, redondearMonto(monto - prev.totalGeneral)),
      modificado: true,
      guardado: false,
    }));
  }, [redondearMonto]);

  // =======================================================
  // FUNCIONES DE UTILIDADES
  // =======================================================

  const obtenerResumenVenta = useCallback((): VentaPOS => {
    return {
      numero_venta: `TEMP-${Date.now()}`,
      fecha_venta: new Date().toISOString().split('T')[0],
      hora_venta: new Date().toLocaleTimeString(),
      cliente: estado.cliente,
      cliente_ocasional: !estado.cliente,
      tipo_documento: estado.tipoDocumento,
      serie: estado.serie,
      items: estado.items,
      total_items: estado.cantidadItems,
      subtotal: estado.subtotal,
      descuento_global: estado.descuentoGlobal,
      descuento_porcentaje: estado.descuentoPorcentaje,
      total_igv: estado.totalIgv,
      total_sin_igv: estado.subtotal - estado.totalIgv,
      total_gravado: estado.subtotal,
      total_exonerado: 0,
      total_inafecto: 0,
      total_gratuito: 0,
      total_descuentos: estado.totalDescuentos,
      total_general: estado.totalGeneral,
      redondeo: 0,
      metodos_pago: [estado.metodoPago],
      total_pagado: estado.montoPagado,
      vuelto: estado.vuelto,
      estado: 'activa',
      observaciones: estado.observaciones,
      impreso: false,
      enviado_sunat: false,
      usuario_id: 1, // TODO: Obtener del contexto de usuario
      usuario_nombre: 'Usuario', // TODO: Obtener del contexto de usuario
      caja_id: 1,
      turno_caja_id: 1,
      fecha_creacion: new Date().toISOString(),
    };
  }, [estado]);

  const exportarDatos = useCallback(() => {
    return {
      estado,
      historialAcciones: historialAcciones.slice(0, 10), // Últimas 10 acciones
      resumenVenta: obtenerResumenVenta(),
      validacion: validarCarrito(),
    };
  }, [estado, historialAcciones, obtenerResumenVenta, validarCarrito]);

  const importarDatos = useCallback((datos: any) => {
    try {
      if (datos.estado) {
        setEstado(prev => ({
          ...datos.estado,
          guardado: false,
          modificado: true,
        }));
        
        if (config.mostrarAlertas) {
          mostrarExito('Datos importados', 'El carrito fue restaurado correctamente');
        }
      }
    } catch (error) {
      console.error('Error al importar datos:', error);
      if (config.mostrarAlertas) {
        mostrarError('Error al importar', 'No se pudieron importar los datos');
      }
    }
  }, [config.mostrarAlertas, mostrarExito, mostrarError]);

  // =======================================================
  // VALORES COMPUTADOS
  // =======================================================

  const validacion = useMemo(() => validarCarrito(), [validarCarrito]);

  const estadisticas = useMemo(() => ({
    totalProductosUnicos: estado.items.length,
    totalUnidades: estado.cantidadItems,
    promedioProducto: estado.items.length > 0 ? estado.subtotal / estado.items.length : 0,
    porcentajeDescuento: estado.subtotal > 0 ? (estado.totalDescuentos / estado.subtotal) * 100 : 0,
    porcentajeIgv: estado.subtotal > 0 ? (estado.totalIgv / estado.subtotal) * 100 : 0,
  }), [estado]);

  const puedeFacturar = useMemo(() => {
    return validacion.valido && estado.items.length > 0 && estado.totalGeneral > 0;
  }, [validacion.valido, estado.items.length, estado.totalGeneral]);

  // =======================================================
  // CLEANUP
  // =======================================================

  useEffect(() => {
    return () => {
      if (timeoutGuardado.current) {
        clearTimeout(timeoutGuardado.current);
      }
    };
  }, []);

  // =======================================================
  // RETURN DEL HOOK
  // =======================================================

  return {
    // Estado del carrito
    estado,
    validacion,
    estadisticas,
    historialAcciones,
    puedeFacturar,

    // Funciones principales
    agregarProducto,
    actualizarItem,
    eliminarItem,
    limpiarCarrito,
    establecerCliente,
    establecerTipoDocumento,
    aplicarDescuentoGlobal,
    establecerPago,

    // Utilidades
    obtenerResumenVenta,
    exportarDatos,
    importarDatos,
    validarCarrito,

    // Configuración
    configuracion: config,

    // Formatters
    formatearMoneda: (monto: number) => formatearMoneda(monto),
  };
};

export default useCarrito;