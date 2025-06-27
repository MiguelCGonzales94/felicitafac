/**
 * Punto de Venta - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Página principal del sistema de punto de venta
 */

import React, { useEffect, useState, useCallback } from 'react';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  Calculator,
  Settings,
  Maximize,
  Minimize,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '../utils/cn.ts';
import { Button, ButtonIcono } from '../componentes/ui/button';
import { Card, CardContent } from '../componentes/ui/card';

// Componentes POS
import CatalogoProductos from '../componentes/pos/CatalogoProductos';
import CarritoCompras from '../componentes/pos/CarritoCompras';
import SelectorCliente from '../componentes/pos/SelectorCliente';
import BotonesAccion from '../componentes/pos/BotonesAccion';
import CalculadoraTotales from '../componentes/pos/CalculadoraTotales';

// Hooks y contextos
import { ProviderFacturacion, useFacturacion } from '../contextos/FacturacionContext';
import { usePuntoDeVenta } from '../hooks/useFacturacion';
import { useApiGet } from '../hooks/useApi';

// Tipos y constantes
import type { Factura } from '../types/factura';
import type { ProductoListItem } from '../types/producto';
import { API_ENDPOINTS, POS_CONFIG } from '../utils/constantes';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesPuntoDeVenta {
  className?: string;
  modoKiosco?: boolean;
  layoutCompacto?: boolean;
}

interface EstadoConexion {
  online: boolean;
  ultimaVerificacion: Date;
  latencia?: number;
}

interface NotificacionToast {
  id: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titulo: string;
  mensaje: string;
  duracion?: number;
}

// =======================================================
// COMPONENTE PRINCIPAL SIN PROVIDER
// =======================================================

const PuntoDeVentaInterno: React.FC<PropiedadesPuntoDeVenta> = ({
  className,
  modoKiosco = false,
  layoutCompacto = false,
}) => {
  // Estados locales
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [layoutActual, setLayoutActual] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [estadoConexion, setEstadoConexion] = useState<EstadoConexion>({
    online: navigator.onLine,
    ultimaVerificacion: new Date(),
  });
  const [notificaciones, setNotificaciones] = useState<NotificacionToast[]>([]);
  const [ultimaVenta, setUltimaVenta] = useState<Factura | null>(null);

  // Hook del punto de venta
  const {
    estado,
    configurarShortcuts,
    manejarShortcut,
    cargarEstadisticas,
    estadisticas,
    historialVentas,
  } = usePuntoDeVenta();

  // API para verificar conexión
  const {
    loading: verificandoConexion,
    refrescar: verificarConexion,
  } = useApiGet(
    API_ENDPOINTS.PRODUCTOS.LIST + '?page=1&page_size=1',
    undefined,
    {
      ejecutarInmediatamente: false,
      onSuccess: () => {
        setEstadoConexion(prev => ({
          ...prev,
          online: true,
          ultimaVerificacion: new Date(),
        }));
      },
      onError: () => {
        setEstadoConexion(prev => ({
          ...prev,
          online: false,
          ultimaVerificacion: new Date(),
        }));
      },
    }
  );

  // =======================================================
  // EFECTOS Y CONFIGURACIÓN
  // =======================================================

  // Configurar shortcuts de teclado
  useEffect(() => {
    configurarShortcuts();
    
    const manejarKeyDown = (e: KeyboardEvent) => {
      manejarShortcut(e);
    };

    document.addEventListener('keydown', manejarKeyDown);
    return () => document.removeEventListener('keydown', manejarKeyDown);
  }, [configurarShortcuts, manejarShortcut]);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const detectarLayout = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setLayoutActual('mobile');
      } else if (width < 1024) {
        setLayoutActual('tablet');
      } else {
        setLayoutActual('desktop');
      }
    };

    detectarLayout();
    window.addEventListener('resize', detectarLayout);
    return () => window.removeEventListener('resize', detectarLayout);
  }, []);

  // Monitorear conexión a internet
  useEffect(() => {
    const manejarOnline = () => {
      setEstadoConexion(prev => ({ ...prev, online: true }));
      agregarNotificacion('success', 'Conexión', 'Conexión restaurada');
    };

    const manejarOffline = () => {
      setEstadoConexion(prev => ({ ...prev, online: false }));
      agregarNotificacion('warning', 'Sin conexión', 'Trabajando en modo offline');
    };

    window.addEventListener('online', manejarOnline);
    window.addEventListener('offline', manejarOffline);

    return () => {
      window.removeEventListener('online', manejarOnline);
      window.removeEventListener('offline', manejarOffline);
    };
  }, []);

  // Verificar conexión periódicamente
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (estadoConexion.online) {
        verificarConexion();
      }
    }, 30000); // Cada 30 segundos

    return () => clearInterval(intervalo);
  }, [estadoConexion.online, verificarConexion]);

  // Cargar estadísticas al montar
  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  // =======================================================
  // FUNCIONES AUXILIARES
  // =======================================================

  const agregarNotificacion = useCallback((
    tipo: NotificacionToast['tipo'],
    titulo: string,
    mensaje: string,
    duracion = 5000
  ) => {
    const id = Date.now().toString();
    const notificacion: NotificacionToast = {
      id,
      tipo,
      titulo,
      mensaje,
      duracion,
    };

    setNotificaciones(prev => [...prev, notificacion]);

    // Auto-remover después de la duración especificada
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    }, duracion);
  }, []);

  const alternarPantallaCompleta = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setPantallaCompleta(true);
    } else {
      document.exitFullscreen();
      setPantallaCompleta(false);
    }
  };

  const manejarFacturaEmitida = (factura: Factura) => {
    setUltimaVenta(factura);
    agregarNotificacion(
      'success',
      'Documento emitido',
      `${factura.tipo_documento} ${factura.numero_completo} emitida exitosamente`
    );
  };

  // =======================================================
  // COMPONENTES DE UI
  // =======================================================

  const BarraEstado: React.FC = () => (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo/Título */}
          <h1 className="font-bold text-xl text-blue-600">FELICITAFAC</h1>
          
          {/* Estadísticas rápidas */}
          {estadisticas && (
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
              <span>Ventas hoy: {estadisticas.ventasHoy.cantidad}</span>
              <span>Monto: {estadisticas.ventasHoy.monto.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Estado de conexión */}
          <div className="flex items-center gap-1">
            {estadoConexion.online ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className={cn(
              'text-xs',
              estadoConexion.online ? 'text-green-600' : 'text-red-600'
            )}>
              {estadoConexion.online ? 'Conectado' : 'Sin conexión'}
            </span>
          </div>

          {/* Botón refrescar */}
          <ButtonIcono
            icono={<RefreshCw className={cn('h-4 w-4', verificandoConexion && 'animate-spin')} />}
            variant="ghost"
            size="sm"
            onClick={verificarConexion}
            disabled={verificandoConexion}
            title="Verificar conexión"
          />

          {/* Pantalla completa */}
          <ButtonIcono
            icono={pantallaCompleta ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            onClick={alternarPantallaCompleta}
            title={pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
          />

          {/* Configuración */}
          <ButtonIcono
            icono={<Settings className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            title="Configuración"
          />
        </div>
      </div>
    </div>
  );

  const NotificacionesToast: React.FC = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notificaciones.map(notificacion => (
        <div
          key={notificacion.id}
          className={cn(
            'p-4 rounded-lg shadow-lg border-l-4 bg-white max-w-sm',
            {
              'border-green-500': notificacion.tipo === 'success',
              'border-red-500': notificacion.tipo === 'error',
              'border-yellow-500': notificacion.tipo === 'warning',
              'border-blue-500': notificacion.tipo === 'info',
            }
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {notificacion.tipo === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {notificacion.tipo === 'error' && <AlertTriangle className="h-5 w-5 text-red-600" />}
              {notificacion.tipo === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
              {notificacion.tipo === 'info' && <AlertTriangle className="h-5 w-5 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900">{notificacion.titulo}</h4>
              <p className="text-sm text-gray-600">{notificacion.mensaje}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // =======================================================
  // LAYOUTS RESPONSIVOS
  // =======================================================

  const LayoutDesktop: React.FC = () => (
    <div className="grid grid-cols-12 gap-4 h-full">
      {/* Catálogo de productos - 8 columnas */}
      <div className="col-span-8 flex flex-col">
        <CatalogoProductos className="flex-1" />
      </div>

      {/* Panel lateral derecho - 4 columnas */}
      <div className="col-span-4 flex flex-col gap-4">
        {/* Selector de cliente */}
        <Card>
          <CardContent className="p-4">
            <SelectorCliente />
          </CardContent>
        </Card>

        {/* Carrito de compras */}
        <CarritoCompras className="flex-1" />

        {/* Calculadora de totales */}
        <CalculadoraTotales />

        {/* Botones de acción */}
        <BotonesAccion onFacturaEmitida={manejarFacturaEmitida} />
      </div>
    </div>
  );

  const LayoutTablet: React.FC = () => (
    <div className="grid grid-cols-8 gap-4 h-full">
      {/* Catálogo de productos - 5 columnas */}
      <div className="col-span-5 flex flex-col">
        <CatalogoProductos className="flex-1" />
      </div>

      {/* Panel lateral - 3 columnas */}
      <div className="col-span-3 flex flex-col gap-3">
        <SelectorCliente />
        <CarritoCompras className="flex-1" compacto />
        <div className="grid grid-cols-2 gap-2">
          <CalculadoraTotales compacta />
          <BotonesAccion 
            layout="horizontal" 
            onFacturaEmitida={manejarFacturaEmitida}
          />
        </div>
      </div>
    </div>
  );

  const LayoutMobile: React.FC = () => {
    const [pestañaActiva, setPestañaActiva] = useState<'productos' | 'carrito' | 'facturar'>('productos');

    const pestañas = [
      { key: 'productos', label: 'Productos', icono: <Package className="h-4 w-4" /> },
      { key: 'carrito', label: 'Carrito', icono: <ShoppingCart className="h-4 w-4" /> },
      { key: 'facturar', label: 'Facturar', icono: <Calculator className="h-4 w-4" /> },
    ];

    return (
      <div className="flex flex-col h-full">
        {/* Selector de cliente siempre visible */}
        <div className="flex-shrink-0 p-4 bg-white border-b">
          <SelectorCliente />
        </div>

        {/* Contenido según pestaña activa */}
        <div className="flex-1 overflow-hidden">
          {pestañaActiva === 'productos' && (
            <CatalogoProductos className="h-full" vistaCompacta />
          )}
          
          {pestañaActiva === 'carrito' && (
            <div className="h-full flex flex-col">
              <CarritoCompras className="flex-1" compacto />
              <div className="flex-shrink-0 p-4 border-t">
                <CalculadoraTotales compacta />
              </div>
            </div>
          )}
          
          {pestañaActiva === 'facturar' && (
            <div className="h-full p-4">
              <BotonesAccion 
                mostrarConfiguracion={false}
                onFacturaEmitida={manejarFacturaEmitida}
              />
            </div>
          )}
        </div>

        {/* Navegación inferior */}
        <div className="flex-shrink-0 bg-white border-t">
          <div className="grid grid-cols-3">
            {pestañas.map(pestaña => (
              <button
                key={pestaña.key}
                onClick={() => setPestañaActiva(pestaña.key as any)}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 text-xs transition-colors',
                  pestañaActiva === pestaña.key
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {pestaña.icono}
                <span>{pestaña.label}</span>
                {pestaña.key === 'carrito' && estado.items.length > 0 && (
                  <span className="absolute top-1 right-1/3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {estado.items.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // =======================================================
  // RENDERIZADO PRINCIPAL
  // =======================================================

  return (
    <div className={cn('h-screen flex flex-col bg-gray-100', className)}>
      {/* Barra de estado */}
      {!modoKiosco && <BarraEstado />}

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden p-4">
        {layoutActual === 'desktop' && <LayoutDesktop />}
        {layoutActual === 'tablet' && <LayoutTablet />}
        {layoutActual === 'mobile' && <LayoutMobile />}
      </div>

      {/* Notificaciones toast */}
      <NotificacionesToast />

      {/* Información de última venta */}
      {ultimaVenta && (
        <div className="fixed bottom-4 left-4 bg-green-100 border border-green-300 rounded-lg p-3 max-w-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Última venta</p>
              <p className="text-sm text-green-700">
                {ultimaVenta.numero_completo} - {ultimaVenta.total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL CON PROVIDER
// =======================================================

const PuntoDeVenta: React.FC<PropiedadesPuntoDeVenta> = (props) => {
  return (
    <ProviderFacturacion>
      <PuntoDeVentaInterno {...props} />
    </ProviderFacturacion>
  );
};

export default PuntoDeVenta;