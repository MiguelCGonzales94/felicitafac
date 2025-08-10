import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Package, 
  Calculator, 
  ShoppingCart, 
  TrendingUp, 
  AlertCircle,
  DollarSign,
  Box,
  UserCheck,
  Settings,
  FileSpreadsheet,
  Building,
  PieChart,
  Calendar,
  Bell,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Edit3,
  Trash2,
  Plus,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

interface MetricaWidget {
  id: string;
  titulo: string;
  valor: string | number;
  cambio?: string;
  porcentajeCambio?: number;
  tipo: 'positivo' | 'negativo' | 'neutro';
  icono: React.ReactNode;
  color: string;
  enlace?: string;
}

interface ModuloSistema {
  id: string;
  nombre: string;
  descripcion: string;
  icono: React.ReactNode;
  color: string;
  enlace: string;
  rolesPermitidos: string[];
  submodulos?: ModuloSistema[];
  activo: boolean;
  badge?: {
    texto: string;
    color: string;
  };
}

interface DocumentoReciente {
  id: string;
  tipo: 'factura' | 'boleta' | 'nota_credito' | 'nota_debito';
  numero: string;
  cliente: string;
  fecha: string;
  monto: number;
  estado: 'emitido' | 'anulado' | 'enviado' | 'aceptado';
  estadoPago: 'pagado' | 'pendiente' | 'vencido';
}

interface NotificacionAdmin {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  fecha: string;
  leida: boolean;
  enlace?: string;
}

interface UsuarioActual {
  id: string;
  nombre: string;
  email: string;
  rol: {
    codigo: 'administrador' | 'contador' | 'vendedor' | 'cliente';
    nombre: string;
    nivelAcceso: number;
  };
  avatar?: string;
}

// =======================================================
// DATOS MOCK (En producción vendrían de APIs)
// =======================================================

const usuarioMock: UsuarioActual = {
  id: '1',
  nombre: 'Juan Carlos Admin',
  email: 'admin@felicitafac.com',
  rol: {
    codigo: 'administrador',
    nombre: 'Administrador',
    nivelAcceso: 4
  }
};

const metricasMock: MetricaWidget[] = [
  {
    id: 'ventas-hoy',
    titulo: 'Ventas Hoy',
    valor: 'S/ 15,420.50',
    cambio: '+12.5%',
    porcentajeCambio: 12.5,
    tipo: 'positivo',
    icono: <DollarSign className="w-6 h-6" />,
    color: 'bg-green-500',
    enlace: '/admin/facturacion'
  },
  {
    id: 'documentos-pendientes',
    titulo: 'Documentos Pendientes',
    valor: 8,
    cambio: '2 críticos',
    tipo: 'negativo',
    icono: <FileText className="w-6 h-6" />,
    color: 'bg-red-500',
    enlace: '/admin/documentos-pendientes'
  },
  {
    id: 'productos-stock-bajo',
    titulo: 'Stock Bajo',
    valor: 15,
    cambio: '5 críticos',
    tipo: 'negativo',
    icono: <AlertCircle className="w-6 h-6" />,
    color: 'bg-orange-500',
    enlace: '/admin/inventario'
  },
  {
    id: 'clientes-nuevos',
    titulo: 'Clientes Nuevos',
    valor: 24,
    cambio: '+6 esta semana',
    porcentajeCambio: 8.3,
    tipo: 'positivo',
    icono: <Users className="w-6 h-6" />,
    color: 'bg-blue-500',
    enlace: '/admin/clientes'
  }
];

const modulosSistema: ModuloSistema[] = [
  {
    id: 'facturacion',
    nombre: 'Facturación Electrónica',
    descripcion: 'Gestión completa de documentos SUNAT',
    icono: <FileText className="w-8 h-8" />,
    color: 'bg-blue-500',
    enlace: '/admin/facturacion',
    rolesPermitidos: ['administrador', 'contador', 'vendedor'],
    activo: true,
    badge: { texto: '8 pendientes', color: 'bg-red-500' },
    submodulos: [
      {
        id: 'nueva-factura',
        nombre: 'Nueva Factura',
        descripcion: 'Crear nueva factura',
        icono: <Plus className="w-5 h-5" />,
        color: 'bg-green-500',
        enlace: '/admin/facturacion/nueva',
        rolesPermitidos: ['administrador', 'contador', 'vendedor'],
        activo: true
      },
      {
        id: 'documentos',
        nombre: 'Documentos',
        descripcion: 'Ver todos los documentos',
        icono: <Eye className="w-5 h-5" />,
        color: 'bg-blue-500',
        enlace: '/admin/facturacion/documentos',
        rolesPermitidos: ['administrador', 'contador', 'vendedor'],
        activo: true
      }
    ]
  },
  {
    id: 'inventario',
    nombre: 'Control de Inventarios',
    descripcion: 'Gestión de stock y productos PEPS',
    icono: <Package className="w-8 h-8" />,
    color: 'bg-purple-500',
    enlace: '/admin/inventario',
    rolesPermitidos: ['administrador', 'contador', 'vendedor'],
    activo: true,
    badge: { texto: '15 stock bajo', color: 'bg-orange-500' }
  },
  {
    id: 'contabilidad',
    nombre: 'Contabilidad PCGE',
    descripcion: 'Asientos automáticos y reportes contables',
    icono: <Calculator className="w-8 h-8" />,
    color: 'bg-green-500',
    enlace: '/admin/contabilidad',
    rolesPermitidos: ['administrador', 'contador'],
    activo: true
  },
  {
    id: 'clientes',
    nombre: 'Gestión de Clientes',
    descripcion: 'Base de datos de clientes y contactos',
    icono: <Users className="w-8 h-8" />,
    color: 'bg-indigo-500',
    enlace: '/admin/clientes',
    rolesPermitidos: ['administrador', 'contador', 'vendedor'],
    activo: true,
    badge: { texto: '24 nuevos', color: 'bg-blue-500' }
  },
  {
    id: 'productos',
    nombre: 'Catálogo de Productos',
    descripcion: 'Gestión de productos y servicios',
    icono: <Box className="w-8 h-8" />,
    color: 'bg-teal-500',
    enlace: '/admin/productos',
    rolesPermitidos: ['administrador', 'contador', 'vendedor'],
    activo: true
  },
  {
    id: 'reportes',
    nombre: 'Reportes PLE',
    descripcion: 'Libros electrónicos SUNAT',
    icono: <FileSpreadsheet className="w-8 h-8" />,
    color: 'bg-red-500',
    enlace: '/admin/reportes',
    rolesPermitidos: ['administrador', 'contador'],
    activo: true
  },
  {
    id: 'usuarios',
    nombre: 'Gestión de Usuarios',
    descripcion: 'Usuarios, roles y permisos',
    icono: <UserCheck className="w-8 h-8" />,
    color: 'bg-gray-500',
    enlace: '/admin/usuarios',
    rolesPermitidos: ['administrador'],
    activo: true
  },
  {
    id: 'configuracion',
    nombre: 'Configuración',
    descripcion: 'Configuración general del sistema',
    icono: <Settings className="w-8 h-8" />,
    color: 'bg-slate-500',
    enlace: '/admin/configuracion',
    rolesPermitidos: ['administrador'],
    activo: true
  }
];

const documentosRecientes: DocumentoReciente[] = [
  {
    id: '1',
    tipo: 'factura',
    numero: 'F001-00001234',
    cliente: 'Empresa ABC SAC',
    fecha: '2025-08-10',
    monto: 1250.00,
    estado: 'aceptado',
    estadoPago: 'pagado'
  },
  {
    id: '2',
    tipo: 'boleta',
    numero: 'B001-00005678',
    cliente: 'Juan Pérez',
    fecha: '2025-08-10',
    monto: 85.50,
    estado: 'emitido',
    estadoPago: 'pendiente'
  },
  {
    id: '3',
    tipo: 'factura',
    numero: 'F001-00001235',
    cliente: 'Distribuidora XYZ EIRL',
    fecha: '2025-08-09',
    monto: 3250.00,
    estado: 'enviado',
    estadoPago: 'vencido'
  }
];

const notificaciones: NotificacionAdmin[] = [
  {
    id: '1',
    titulo: 'Stock crítico',
    mensaje: '5 productos tienen stock crítico',
    tipo: 'warning',
    fecha: '2025-08-10 14:30',
    leida: false,
    enlace: '/admin/inventario'
  },
  {
    id: '2',
    titulo: 'Facturas vencidas',
    mensaje: '3 facturas están vencidas sin pagar',
    tipo: 'error',
    fecha: '2025-08-10 10:15',
    leida: false,
    enlace: '/admin/facturacion/vencidas'
  },
  {
    id: '3',
    titulo: 'Backup completado',
    mensaje: 'Backup automático completado exitosamente',
    tipo: 'success',
    fecha: '2025-08-10 03:00',
    leida: true
  }
];

// =======================================================
// COMPONENTES
// =======================================================

const WidgetMetrica: React.FC<{ metrica: MetricaWidget }> = ({ metrica }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`${metrica.color} text-white p-3 rounded-lg`}>
            {metrica.icono}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{metrica.titulo}</p>
            <p className="text-2xl font-bold text-gray-900">{metrica.valor}</p>
          </div>
        </div>
        
        {metrica.cambio && (
          <div className="text-right">
            <div className={`flex items-center space-x-1 ${
              metrica.tipo === 'positivo' ? 'text-green-600' : 
              metrica.tipo === 'negativo' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {metrica.tipo === 'positivo' && <ArrowUpRight className="w-4 h-4" />}
              {metrica.tipo === 'negativo' && <ArrowDownRight className="w-4 h-4" />}
              {metrica.tipo === 'neutro' && <Minus className="w-4 h-4" />}
              <span className="text-sm font-medium">{metrica.cambio}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TarjetaModulo: React.FC<{ 
  modulo: ModuloSistema; 
  usuario: UsuarioActual;
  onClickModulo: (modulo: ModuloSistema) => void;
}> = ({ modulo, usuario, onClickModulo }) => {
  const [expandido, setExpandido] = useState(false);
  
  const puedeAcceder = modulo.rolesPermitidos.includes(usuario.rol.codigo);
  
  if (!puedeAcceder) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
      <div 
        className="p-6 cursor-pointer"
        onClick={() => onClickModulo(modulo)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`${modulo.color} text-white p-3 rounded-lg`}>
              {modulo.icono}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{modulo.nombre}</h3>
              <p className="text-sm text-gray-600">{modulo.descripcion}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {modulo.badge && (
              <span className={`${modulo.badge.color} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                {modulo.badge.texto}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        {modulo.submodulos && modulo.submodulos.length > 0 && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="grid grid-cols-2 gap-2">
              {modulo.submodulos.slice(0, 4).map((submodulo) => (
                <div 
                  key={submodulo.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className={`${submodulo.color} text-white p-1 rounded`}>
                    {submodulo.icono}
                  </div>
                  <span className="text-sm text-gray-700">{submodulo.nombre}</span>
                </div>
              ))}
            </div>
            {modulo.submodulos.length > 4 && (
              <p className="text-xs text-gray-500 mt-2">
                +{modulo.submodulos.length - 4} módulos más
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TablaDocumentosRecientes: React.FC<{
  documentos: DocumentoReciente[];
  onVerDocumento: (documento: DocumentoReciente) => void;
}> = ({ documentos, onVerDocumento }) => {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aceptado': return 'bg-green-100 text-green-800';
      case 'emitido': return 'bg-blue-100 text-blue-800';
      case 'enviado': return 'bg-yellow-100 text-yellow-800';
      case 'anulado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoPagoColor = (estadoPago: string) => {
    switch (estadoPago) {
      case 'pagado': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoDocumento = (tipo: string) => {
    switch (tipo) {
      case 'factura': return 'Factura';
      case 'boleta': return 'Boleta';
      case 'nota_credito': return 'N. Crédito';
      case 'nota_debito': return 'N. Débito';
      default: return tipo;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Documentos Recientes</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ver todos
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pago
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documentos.map((documento) => (
              <tr key={documento.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {getTipoDocumento(documento.tipo)}
                    </div>
                    <div className="text-sm text-gray-500">{documento.numero}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{documento.cliente}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(documento.fecha).toLocaleDateString('es-PE')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  S/ {documento.monto.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(documento.estado)}`}>
                    {documento.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoPagoColor(documento.estadoPago)}`}>
                    {documento.estadoPago}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => onVerDocumento(documento)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900 mr-3">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PanelNotificaciones: React.FC<{
  notificaciones: NotificacionAdmin[];
  onMarcarLeida: (id: string) => void;
}> = ({ notificaciones, onMarcarLeida }) => {
  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success': return <AlertCircle className="w-5 h-5 text-green-500" />;
      case 'info': 
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const noLeidas = notificaciones.filter(n => !n.leida);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Notificaciones
            {noLeidas.length > 0 && (
              <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                {noLeidas.length}
              </span>
            )}
          </h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ver todas
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notificaciones.slice(0, 5).map((notificacion) => (
          <div 
            key={notificacion.id}
            className={`px-6 py-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
              !notificacion.leida ? 'bg-blue-50' : ''
            }`}
            onClick={() => onMarcarLeida(notificacion.id)}
          >
            <div className="flex items-start space-x-3">
              {getIconoTipo(notificacion.tipo)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${!notificacion.leida ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notificacion.titulo}
                  </p>
                  {!notificacion.leida && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{notificacion.mensaje}</p>
                <p className="text-xs text-gray-400 mt-1">{notificacion.fecha}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const DashboardAdminFelicitafac: React.FC = () => {
  const [usuario] = useState<UsuarioActual>(usuarioMock);
  const [busqueda, setBusqueda] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('todos');
  const [actualizando, setActualizando] = useState(false);

  // Filtrar módulos según rol y búsqueda
  const modulosFiltrados = modulosSistema.filter(modulo => {
    const puedeAcceder = modulo.rolesPermitidos.includes(usuario.rol.codigo);
    const coincideBusqueda = modulo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                           modulo.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    
    return puedeAcceder && coincideBusqueda;
  });

  const handleClickModulo = (modulo: ModuloSistema) => {
    console.log(`Navegando a: ${modulo.enlace}`);
    // Aquí implementarías la navegación real
  };

  const handleActualizar = async () => {
    setActualizando(true);
    // Simular actualización de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    setActualizando(false);
  };

  const handleVerDocumento = (documento: DocumentoReciente) => {
    console.log(`Ver documento: ${documento.id}`);
    // Implementar navegación al documento
  };

  const handleMarcarNotificacionLeida = (id: string) => {
    console.log(`Marcar notificación leída: ${id}`);
    // Implementar marcado de notificación
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-600 mt-1">
                Panel de control FELICITAFAC - Bienvenido, {usuario.nombre}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  usuario.rol.codigo === 'administrador' ? 'bg-purple-100 text-purple-800' :
                  usuario.rol.codigo === 'contador' ? 'bg-green-100 text-green-800' :
                  usuario.rol.codigo === 'vendedor' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {usuario.rol.nombre}
                </span>
              </div>
              
              <button
                onClick={handleActualizar}
                disabled={actualizando}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${actualizando ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Widgets de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricasMock.map((metrica) => (
            <WidgetMetrica key={metrica.id} metrica={metrica} />
          ))}
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar módulos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filtroModulo}
                  onChange={(e) => setFiltroModulo(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos los módulos</option>
                  <option value="facturacion">Facturación</option>
                  <option value="inventario">Inventario</option>
                  <option value="contabilidad">Contabilidad</option>
                  <option value="reportes">Reportes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Módulos del Sistema */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Módulos del Sistema</h2>
            <div className="text-sm text-gray-600">
              {modulosFiltrados.length} de {modulosSistema.length} módulos disponibles
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modulosFiltrados.map((modulo) => (
              <TarjetaModulo
                key={modulo.id}
                modulo={modulo}
                usuario={usuario}
                onClickModulo={handleClickModulo}
              />
            ))}
          </div>
          
          {modulosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron módulos</h3>
              <p className="text-gray-500">
                No hay módulos que coincidan con tu búsqueda o no tienes permisos para acceder.
              </p>
            </div>
          )}
        </div>

        {/* Grid de Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal - Documentos */}
          <div className="lg:col-span-2">
            <TablaDocumentosRecientes
              documentos={documentosRecientes}
              onVerDocumento={handleVerDocumento}
            />
          </div>
          
          {/* Columna Lateral - Notificaciones */}
          <div className="lg:col-span-1">
            <PanelNotificaciones
              notificaciones={notificaciones}
              onMarcarLeida={handleMarcarNotificacionLeida}
            />
          </div>
        </div>

        {/* Sección de Accesos Rápidos */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Accesos Rápidos</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Accesos rápidos basados en el rol */}
            {usuario.rol.codigo === 'administrador' && (
              <>
                <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
                  <Plus className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Nueva Factura</div>
                </button>
                
                <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all">
                  <UserCheck className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Nuevo Usuario</div>
                </button>
                
                <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all">
                  <FileSpreadsheet className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Generar PLE</div>
                </button>
                
                <button className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">
                  <Settings className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Configuración</div>
                </button>
              </>
            )}
            
            {usuario.rol.codigo === 'contador' && (
              <>
                <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
                  <Plus className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Nueva Factura</div>
                </button>
                
                <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all">
                  <Calculator className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Asientos Contables</div>
                </button>
                
                <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all">
                  <FileSpreadsheet className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Generar PLE</div>
                </button>
                
                <button className="p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all">
                  <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Reportes</div>
                </button>
              </>
            )}
            
            {usuario.rol.codigo === 'vendedor' && (
              <>
                <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
                  <Plus className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Nueva Venta</div>
                </button>
                
                <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all">
                  <Users className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Nuevo Cliente</div>
                </button>
                
                <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all">
                  <Package className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Consultar Stock</div>
                </button>
                
                <button className="p-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Mis Ventas</div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer del Dashboard */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Estadísticas del Sistema */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime del Sistema</span>
                  <span className="text-sm font-medium text-green-600">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Documentos Procesados Hoy</span>
                  <span className="text-sm font-medium text-gray-900">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Usuarios Conectados</span>
                  <span className="text-sm font-medium text-gray-900">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Último Backup</span>
                  <span className="text-sm font-medium text-gray-900">Hace 6 horas</span>
                </div>
              </div>
            </div>

            {/* Enlaces Útiles */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enlaces Útiles</h3>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">
                  📚 Manual de Usuario
                </a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">
                  🆘 Centro de Soporte
                </a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">
                  📋 Normativa SUNAT
                </a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">
                  🔧 Configuración API
                </a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">
                  📊 Estado de Servicios
                </a>
              </div>
            </div>

            {/* Información de la Empresa */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Versión del Sistema</p>
                  <p className="text-sm font-medium text-gray-900">FELICITAFAC v2.1.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ambiente</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                    Producción
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Soporte Técnico</p>
                  <p className="text-sm font-medium text-gray-900">soporte@felicitafac.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última Actualización</p>
                  <p className="text-sm font-medium text-gray-900">10 Ago 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdminFelicitafac