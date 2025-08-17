/**
 * Hook para Navegación Administrativa - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Gestión de la navegación del sidebar y módulos
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface ModuloMenu {
  id: string;
  nombre: string;
  icono: string; // Nombre del icono como string
  orden: number;
  activo: boolean;
  rolesPermitidos?: string[];
  descripcion: string;
  expandido: boolean;
  notificaciones?: number;
  submodulos: SubModulo[];
}

export interface SubModulo {
  id: string;
  nombre: string;
  ruta: string;
  icono: string; // Nombre del icono como string
  descripcion: string;
  notificaciones?: number;
}

export interface AccionRapida {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string; // Nombre del icono como string
  color: string;
  funcion: () => void;
  enlace: string;
  activa: boolean;
  rolesPermitidos?: string[];
}

export interface GrupoAccionesRapidas {
  id: string;
  titulo: string;
  expandido: boolean;
  acciones: AccionRapida[];
}

export interface BreadcrumbItem {
  texto: string;
  enlace: string;
}

// =======================================================
// CONFIGURACIÓN DE MÓDULOS
// =======================================================

const configuracionModulosBase: Omit<ModuloMenu, 'expandido' | 'notificaciones'>[] = [
  {
    id: 'facturacion',
    nombre: 'Facturación Electrónica',
    icono: 'FileText',
    orden: 1,
    activo: true,
    rolesPermitidos: ['administrador', 'contador', 'vendedor'],
    descripcion: 'Gestión completa de documentos electrónicos SUNAT',
    submodulos: [
      {
        id: 'dashboard-facturacion',
        nombre: 'Dashboard Facturación',
        ruta: '/admin/facturacion/dashboard',
        icono: 'BarChart3',
        descripcion: 'Métricas y estadísticas de facturación'
      },
      {
        id: 'punto-venta',
        nombre: 'Punto de Venta (POS)',
        ruta: '/admin/facturacion/pos',
        icono: 'ShoppingCart',
        descripcion: 'Sistema de punto de venta integrado'
      },
      {
        id: 'gestion-documentos',
        nombre: 'Gestión Documentos',
        ruta: '/admin/facturacion/documentos',
        icono: 'FileText',
        descripcion: 'Crear y gestionar facturas, boletas y notas'
      },
      {
        id: 'estados-sunat',
        nombre: 'Estados SUNAT',
        ruta: '/admin/facturacion/estados-sunat',
        icono: 'CheckCircle',
        descripcion: 'Seguimiento de documentos enviados a SUNAT'
      },
      {
        id: 'configuracion-facturacion',
        nombre: 'Configuraciones',
        ruta: '/admin/facturacion/configuracion',
        icono: 'Settings',
        descripcion: 'Configurar datos empresa y numeración'
      }
    ]
  },
  {
    id: 'comercial',
    nombre: 'Gestión Comercial',
    icono: 'Users',
    orden: 2,
    activo: true,
    rolesPermitidos: ['administrador', 'contador', 'vendedor'],
    descripcion: 'Administración de clientes y productos',
    submodulos: [
      {
        id: 'clientes',
        nombre: 'Clientes',
        ruta: '/admin/comercial/clientes',
        icono: 'Users',
        descripcion: 'Gestión completa de clientes'
      },
      {
        id: 'productos-servicios',
        nombre: 'Productos/Servicios',
        ruta: '/admin/comercial/productos',
        icono: 'Package',
        descripcion: 'Catálogo de productos y servicios'
      },
      {
        id: 'lista-precios',
        nombre: 'Lista de Precios',
        ruta: '/admin/comercial/precios',
        icono: 'DollarSign',
        descripcion: 'Gestión de precios y descuentos'
      },
      {
        id: 'configuracion-comercial',
        nombre: 'Configuraciones',
        ruta: '/admin/comercial/configuracion',
        icono: 'Settings',
        descripcion: 'Configurar parámetros comerciales'
      }
    ]
  },
  {
    id: 'inventario',
    nombre: 'Inventario y Almacenes',
    icono: 'Warehouse',
    orden: 3,
    activo: true,
    rolesPermitidos: ['administrador', 'contador'],
    descripcion: 'Control de stock y movimientos PEPS',
    submodulos: [
      {
        id: 'dashboard-inventario',
        nombre: 'Dashboard Stock',
        ruta: '/admin/inventario/dashboard',
        icono: 'BarChart3',
        descripcion: 'Resumen de inventario y stock'
      },
      {
        id: 'gestion-almacenes',
        nombre: 'Gestión Almacenes',
        ruta: '/admin/inventario/almacenes',
        icono: 'Warehouse',
        descripcion: 'Administración de almacenes'
      },
      {
        id: 'movimientos-inventario',
        nombre: 'Movimientos',
        ruta: '/admin/inventario/movimientos',
        icono: 'TrendingUp',
        descripcion: 'Entradas, salidas y ajustes'
      },
      {
        id: 'kardex-peps',
        nombre: 'Kardex PEPS',
        ruta: '/admin/inventario/kardex',
        icono: 'FileBarChart',
        descripcion: 'Kardex valorizado método PEPS'
      },
      {
        id: 'stock-minimo',
        nombre: 'Stock Mínimo',
        ruta: '/admin/inventario/stock-minimo',
        icono: 'AlertTriangle',
        descripcion: 'Productos con stock bajo'
      }
    ]
  },
  {
    id: 'contabilidad',
    nombre: 'Contabilidad',
    icono: 'Calculator',
    orden: 4,
    activo: true,
    rolesPermitidos: ['administrador', 'contador'],
    descripcion: 'Gestión contable y reportes PLE',
    submodulos: [
      {
        id: 'dashboard-contable',
        nombre: 'Dashboard Contable',
        ruta: '/admin/contabilidad/dashboard',
        icono: 'BarChart3',
        descripcion: 'Resumen contable y financiero'
      },
      {
        id: 'plan-cuentas',
        nombre: 'Plan de Cuentas PCGE',
        ruta: '/admin/contabilidad/plan-cuentas',
        icono: 'FileBarChart',
        descripcion: 'Plan de cuentas según PCGE'
      },
      {
        id: 'libro-diario',
        nombre: 'Libro Diario',
        ruta: '/admin/contabilidad/libro-diario',
        icono: 'FileText',
        descripcion: 'Asientos contables y libro diario'
      },
      {
        id: 'reportes-contables',
        nombre: 'Reportes Contables',
        ruta: '/admin/contabilidad/reportes',
        icono: 'PieChart',
        descripcion: 'Estados financieros y balances'
      },
      {
        id: 'reportes-ple',
        nombre: 'Reportes PLE SUNAT',
        ruta: '/admin/contabilidad/ple',
        icono: 'Download',
        descripcion: 'Programas de libros electrónicos'
      }
    ]
  },
  {
    id: 'reportes',
    nombre: 'Reportes y Analytics',
    icono: 'PieChart',
    orden: 5,
    activo: true,
    rolesPermitidos: ['administrador', 'contador'],
    descripcion: 'Análisis de datos y reportes ejecutivos',
    submodulos: [
      {
        id: 'dashboard-ejecutivo',
        nombre: 'Dashboard Ejecutivo',
        ruta: '/admin/reportes/dashboard-ejecutivo',
        icono: 'BarChart3',
        descripcion: 'Métricas ejecutivas y KPIs'
      },
      {
        id: 'reportes-financieros',
        nombre: 'Reportes Financieros',
        ruta: '/admin/reportes/financieros',
        icono: 'TrendingUp',
        descripcion: 'Análisis financiero y rentabilidad'
      },
      {
        id: 'reportes-sunat',
        nombre: 'Reportes SUNAT',
        ruta: '/admin/reportes/sunat',
        icono: 'FileText',
        descripcion: 'Reportes para declaraciones SUNAT'
      },
      {
        id: 'analytics-avanzados',
        nombre: 'Analytics Avanzados',
        ruta: '/admin/reportes/analytics',
        icono: 'PieChart',
        descripcion: 'Análisis predictivo y tendencias'
      }
    ]
  },
  {
    id: 'administracion',
    nombre: 'Administración Sistema',
    icono: 'Settings',
    orden: 6,
    activo: true,
    rolesPermitidos: ['administrador'],
    descripcion: 'Configuración del sistema y usuarios',
    submodulos: [
      {
        id: 'gestion-usuarios',
        nombre: 'Gestión de Usuarios',
        ruta: '/admin/sistema/usuarios',
        icono: 'Users',
        descripcion: 'Administración de usuarios y roles'
      },
      {
        id: 'configuracion-empresa',
        nombre: 'Configuración Empresa',
        ruta: '/admin/sistema/empresa',
        icono: 'Settings',
        descripcion: 'Datos de la empresa y sucursales'
      },
      {
        id: 'configuracion-sistema',
        nombre: 'Configuraciones Sistema',
        ruta: '/admin/sistema/configuracion',
        icono: 'Settings',
        descripcion: 'Parámetros generales del sistema'
      },
      {
        id: 'mantenimiento',
        nombre: 'Mantenimiento',
        ruta: '/admin/sistema/mantenimiento',
        icono: 'Settings',
        descripcion: 'Respaldos, logs y mantenimiento'
      }
    ]
  }
];

// =======================================================
// ACCIONES RÁPIDAS
// =======================================================

const accionesRapidasBase: GrupoAccionesRapidas[] = [
  {
    id: 'acciones-principales',
    titulo: 'Acciones Principales',
    expandido: true,
    acciones: [
      {
        id: 'nueva-factura',
        titulo: 'Nueva Factura',
        descripcion: 'Crear documento electrónico',
        icono: 'Plus',
        color: 'bg-blue-600 hover:bg-blue-700',
        funcion: () => console.log('Nueva factura'),
        enlace: '/admin/facturacion/pos',
        activa: true,
        rolesPermitidos: ['administrador', 'contador', 'vendedor']
      },
      {
        id: 'registrar-cliente',
        titulo: 'Registrar Cliente',
        descripcion: 'Agregar nuevo cliente',
        icono: 'Users',
        color: 'bg-green-600 hover:bg-green-700',
        funcion: () => console.log('Registrar cliente'),
        enlace: '/admin/comercial/clientes/nuevo',
        activa: true,
        rolesPermitidos: ['administrador', 'contador', 'vendedor']
      },
      {
        id: 'agregar-producto',
        titulo: 'Agregar Producto',
        descripcion: 'Nuevo producto/servicio',
        icono: 'Package',
        color: 'bg-purple-600 hover:bg-purple-700',
        funcion: () => console.log('Agregar producto'),
        enlace: '/admin/comercial/productos/nuevo',
        activa: true,
        rolesPermitidos: ['administrador', 'contador']
      },
      {
        id: 'ver-reportes',
        titulo: 'Ver Reportes',
        descripcion: 'Dashboard ejecutivo',
        icono: 'FileBarChart',
        color: 'bg-orange-600 hover:bg-orange-700',
        funcion: () => console.log('Ver reportes'),
        enlace: '/admin/reportes/dashboard-ejecutivo',
        activa: true,
        rolesPermitidos: ['administrador', 'contador']
      }
    ]
  }
];

// =======================================================
// HOOK PRINCIPAL
// =======================================================

export const useNavegacionAdmin = () => {
  // Hooks externos
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, tienePermiso } = useAuth();

  // Estados locales
  const [modulosMenu, setModulosMenu] = useState<ModuloMenu[]>([]);
  const [moduloActivo, setModuloActivo] = useState<string | null>(null);
  const [submoduloActivo, setSubmoduloActivo] = useState<string | null>(null);
  const [historialNavegacion, setHistorialNavegacion] = useState<string[]>([]);

  // =======================================================
  // FUNCIONES DE INICIALIZACIÓN
  // =======================================================

  /**
   * Inicializar módulos según permisos del usuario
   */
  const inicializarModulos = useCallback(() => {
    if (!usuario) return;

    const modulosPermitidos = configuracionModulosBase
      .filter(modulo => {
        // Verificar si el usuario tiene permisos para este módulo
        if (!modulo.rolesPermitidos) return true;
        return modulo.rolesPermitidos.includes(usuario.rol_detalle?.codigo || '');
      })
      .map(modulo => ({
        ...modulo,
        expandido: modulo.id === 'facturacion', // Facturación expandido por defecto
        notificaciones: 0, // Inicializar en 0
        submodulos: modulo.submodulos.filter(sub => {
          // Filtrar submódulos según permisos específicos si es necesario
          return true; // Por ahora permitir todos los submódulos del módulo permitido
        }).map(sub => ({
          ...sub,
          notificaciones: undefined // Inicializar sin notificaciones
        }))
      }))
      .sort((a, b) => a.orden - b.orden);

    setModulosMenu(modulosPermitidos);
  }, [usuario]);

  /**
   * Detectar módulo activo según la ruta actual
   */
  const detectarModuloActivo = useCallback(() => {
    const pathname = location.pathname;

    // Buscar módulo que coincida con la ruta
    for (const modulo of modulosMenu) {
      for (const submodulo of modulo.submodulos) {
        if (pathname.startsWith(submodulo.ruta)) {
          setModuloActivo(modulo.id);
          setSubmoduloActivo(submodulo.id);
          return;
        }
      }
    }

    // Si no hay coincidencia exacta, verificar rutas parciales
    if (pathname.startsWith('/admin/facturacion')) {
      setModuloActivo('facturacion');
    } else if (pathname.startsWith('/admin/comercial')) {
      setModuloActivo('comercial');
    } else if (pathname.startsWith('/admin/inventario')) {
      setModuloActivo('inventario');
    } else if (pathname.startsWith('/admin/contabilidad')) {
      setModuloActivo('contabilidad');
    } else if (pathname.startsWith('/admin/reportes')) {
      setModuloActivo('reportes');
    } else if (pathname.startsWith('/admin/sistema')) {
      setModuloActivo('administracion');
    }
  }, [location.pathname, modulosMenu]);

  // =======================================================
  // FUNCIONES DE NAVEGACIÓN
  // =======================================================

  /**
   * Navegar a una ruta específica
   */
  const navegarA = useCallback((ruta: string, moduloId?: string, submoduloId?: string) => {
    // Agregar al historial
    setHistorialNavegacion(prev => [location.pathname, ...prev.slice(0, 9)]);

    // Actualizar estados activos
    if (moduloId) setModuloActivo(moduloId);
    if (submoduloId) setSubmoduloActivo(submoduloId);

    // Navegar
    navigate(ruta);
  }, [navigate, location.pathname]);

  /**
   * Toggle expansión de módulo
   */
  const toggleModulo = useCallback((moduloId: string) => {
    setModulosMenu(prev =>
      prev.map(modulo =>
        modulo.id === moduloId
          ? { ...modulo, expandido: !modulo.expandido }
          : modulo
      )
    );

    // Guardar estado en localStorage
    const estadoModulos = modulosMenu.reduce((acc, modulo) => {
      acc[modulo.id] = modulo.id === moduloId ? !modulo.expandido : modulo.expandido;
      return acc;
    }, {} as Record<string, boolean>);

    localStorage.setItem('felicitafac_modulos_expandidos', JSON.stringify(estadoModulos));
  }, [modulosMenu]);

  /**
   * Navegar a submódulo
   */
  const navegarASubmodulo = useCallback((moduloId: string, submoduloId: string) => {
    const modulo = modulosMenu.find(m => m.id === moduloId);
    const submodulo = modulo?.submodulos.find(s => s.id === submoduloId);

    if (submodulo) {
      navegarA(submodulo.ruta, moduloId, submoduloId);
    }
  }, [modulosMenu, navegarA]);

  /**
   * Volver atrás en el historial
   */
  const volverAtras = useCallback(() => {
    if (historialNavegacion.length > 0) {
      const [ultimaRuta, ...restoHistorial] = historialNavegacion;
      setHistorialNavegacion(restoHistorial);
      navigate(ultimaRuta);
    }
  }, [historialNavegacion, navigate]);

  // =======================================================
  // FUNCIONES DE UTILIDAD
  // =======================================================

  /**
   * Obtener breadcrumbs de la navegación actual
   */
  const obtenerBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    if (!moduloActivo) return [];

    const modulo = modulosMenu.find(m => m.id === moduloActivo);
    if (!modulo) return [];

    const breadcrumbs: BreadcrumbItem[] = [
      { texto: 'Dashboard', enlace: '/admin' },
      { texto: modulo.nombre, enlace: '' }
    ];

    if (submoduloActivo) {
      const submodulo = modulo.submodulos.find(s => s.id === submoduloActivo);
      if (submodulo) {
        breadcrumbs.push({ texto: submodulo.nombre, enlace: submodulo.ruta });
      }
    }

    return breadcrumbs;
  }, [moduloActivo, submoduloActivo, modulosMenu]);

  /**
   * Obtener notificaciones por módulo
   */
  const obtenerNotificacionesModulo = useCallback((moduloId: string): number => {
    // TODO: Implementar lógica real de notificaciones
    const notificacionesSimuladas: Record<string, number> = {
      facturacion: 3,
      inventario: 5,
      comercial: 0,
      contabilidad: 1,
      reportes: 0,
      administracion: 0
    };

    return notificacionesSimuladas[moduloId] || 0;
  }, []);

  // =======================================================
  // VALORES COMPUTADOS
  // =======================================================

  const accionesRapidasPermitidas = useMemo(() => {
    if (!usuario) return [];

    return accionesRapidasBase.map(grupo => ({
      ...grupo,
      acciones: grupo.acciones.filter(accion => {
        if (!accion.rolesPermitidos) return true;
        return accion.rolesPermitidos.includes(usuario.rol_detalle?.codigo || '');
      })
    })).filter(grupo => grupo.acciones.length > 0);
  }, [usuario]);

  const modulosConNotificaciones = useMemo(() => {
    return modulosMenu.map(modulo => ({
      ...modulo,
      notificaciones: obtenerNotificacionesModulo(modulo.id),
      submodulos: modulo.submodulos.map(sub => ({
        ...sub,
        notificaciones: sub.id === 'estados-sunat' ? 2 : sub.id === 'stock-minimo' ? 5 : undefined
      }))
    }));
  }, [modulosMenu, obtenerNotificacionesModulo]);

  const puedeAcceder = useCallback((moduloId: string): boolean => {
    const modulo = configuracionModulosBase.find(m => m.id === moduloId);
    if (!modulo || !usuario) return false;

    if (!modulo.rolesPermitidos) return true;
    return modulo.rolesPermitidos.includes(usuario.rol_detalle?.codigo || '');
  }, [usuario]);

  // =======================================================
  // EFECTOS
  // =======================================================

  /**
   * Inicializar módulos cuando cambia el usuario
   */
  useEffect(() => {
    inicializarModulos();
  }, [inicializarModulos]);

  /**
   * Detectar módulo activo cuando cambia la ruta
   */
  useEffect(() => {
    detectarModuloActivo();
  }, [detectarModuloActivo]);

  /**
   * Cargar estado de módulos expandidos
   */
  useEffect(() => {
    const estadoGuardado = localStorage.getItem('felicitafac_modulos_expandidos');
    if (estadoGuardado && modulosMenu.length > 0) {
      try {
        const estado = JSON.parse(estadoGuardado);
        setModulosMenu(prev =>
          prev.map(modulo => ({
            ...modulo,
            expandido: estado[modulo.id] ?? modulo.expandido
          }))
        );
      } catch (error) {
        console.error('Error cargando estado de módulos:', error);
      }
    }
  }, [modulosMenu.length]);

  // =======================================================
  // LISTA DE ICONOS DISPONIBLES
  // =======================================================

  const iconosDisponibles = [
    'FileText', 'Users', 'Package', 'Warehouse', 'Calculator', 
    'PieChart', 'Settings', 'BarChart3', 'ShoppingCart', 'CheckCircle',
    'DollarSign', 'TrendingUp', 'FileBarChart', 'Download', 'AlertTriangle',
    'Plus', 'Edit', 'Eye'
  ];

  // =======================================================
  // RETORNO DEL HOOK
  // =======================================================

  return {
    // Datos de navegación
    modulosMenu: modulosConNotificaciones,
    accionesRapidas: accionesRapidasPermitidas,
    breadcrumbs: obtenerBreadcrumbs(),
    
    // Estados activos
    moduloActivo,
    submoduloActivo,
    historialNavegacion,
    
    // Funciones de navegación
    navegarA,
    navegarASubmodulo,
    toggleModulo,
    volverAtras,
    
    // Funciones de utilidad
    puedeAcceder,
    obtenerNotificacionesModulo,
    
    // Estado de la ruta actual
    rutaActual: location.pathname,
    
    // Información del usuario
    usuarioRol: usuario?.rol_detalle?.codigo || null,
    
    // Lista de iconos disponibles
    iconosDisponibles
  };
};

export default useNavegacionAdmin;