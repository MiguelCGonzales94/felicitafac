// ================================================================
// 6. PÁGINAS DE CLIENTES
// ================================================================

/**
 * frontend/src/paginas/admin/clientes/ListaClientes.tsx
 * Lista completa de clientes
 */
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Edit, Eye, Trash2, Download,
  Users, Phone, Mail, MapPin, CreditCard
} from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Input } from '../../../componentes/ui/input';
import { Badge } from '../../../componentes/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../componentes/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useClientes } from '../../../hooks/useClientes';
import { useNotificaciones } from '../../../hooks/useNotificaciones';
import { formatearMoneda, formatearFecha } from '../../../utils/formatters';
import FiltrosAvanzados from '../../../componentes/comunes/FiltrosAvanzados';
import PaginacionPersonalizada from '../../../componentes/comunes/PaginacionPersonalizada';

export const ListaClientes: React.FC = () => {
  const navigate = useNavigate();
  const { 
    clientes, 
    totalClientes, 
    paginaActual, 
    totalPaginas,
    obtenerClientes, 
    eliminarCliente,
    cargandoClientes 
  } = useClientes();
  const { mostrarConfirmacion } = useNotificaciones();

  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo_cliente: '',
    estado: '',
    departamento: '',
    tiene_email: '',
    fecha_desde: '',
    fecha_hasta: ''
  });

  useEffect(() => {
    cargarClientes();
  }, [paginaActual, filtros]);

  const cargarClientes = async () => {
    await obtenerClientes(filtros);
  };

  const manejarFiltrar = (nuevosFiltros: any) => {
    setFiltros({ ...filtros, ...nuevosFiltros });
  };

  const manejarEliminar = async (id: number, nombre: string) => {
    const confirmado = await mostrarConfirmacion(
      'Confirmar eliminación',
      `¿Está seguro de eliminar al cliente "${nombre}"?`
    );
    
    if (confirmado) {
      await eliminarCliente(id);
      cargarClientes();
    }
  };

  const obtenerIniciales = (nombre: string) => {
    return nombre.split(' ').map(n => n.charAt(0)).slice(0, 2).join('');
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-gray-100 text-gray-800';
      case 'suspendido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <LayoutAdmin
      title="Gestión de Clientes"
      description="Administración completa de clientes"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Comercial', href: '/admin/comercial' },
        { label: 'Clientes' }
      ]}
    >
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600">
              Gestiona tu base de datos de clientes
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={() => navigate('/admin/clientes/nuevo')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{totalClientes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Con Email</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Phone className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Con Teléfono</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FiltrosAvanzados 
              filtros={[
                {
                  nombre: 'busqueda',
                  tipo: 'texto',
                  placeholder: 'Buscar por nombre, documento, email...',
                  valor: filtros.busqueda
                },
                {
                  nombre: 'tipo_cliente',
                  tipo: 'select',
                  placeholder: 'Tipo de cliente',
                  opciones: [
                    { valor: '', etiqueta: 'Todos' },
                    { valor: 'natural', etiqueta: 'Persona Natural' },
                    { valor: 'juridica', etiqueta: 'Persona Jurídica' }
                  ],
                  valor: filtros.tipo_cliente
                },
                {
                  nombre: 'estado',
                  tipo: 'select',
                  placeholder: 'Estado',
                  opciones: [
                    { valor: '', etiqueta: 'Todos' },
                    { valor: 'activo', etiqueta: 'Activo' },
                    { valor: 'inactivo', etiqueta: 'Inactivo' },
                    { valor: 'suspendido', etiqueta: 'Suspendido' }
                  ],
                  valor: filtros.estado
                },
                {
                  nombre: 'tiene_email',
                  tipo: 'select',
                  placeholder: 'Con email',
                  opciones: [
                    { valor: '', etiqueta: 'Todos' },
                    { valor: 'si', etiqueta: 'Con Email' },
                    { valor: 'no', etiqueta: 'Sin Email' }
                  ],
                  valor: filtros.tiene_email
                }
              ]}
              onFiltrar={manejarFiltrar}
            />
          </CardContent>
        </Card>

        {/* Lista de Clientes */}
        <Card>
          <CardContent className="p-0">
            {cargandoClientes ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando clientes...</p>
              </div>
            ) : clientes.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes</h3>
                <p className="text-gray-500 mb-4">
                  No se encontraron clientes con los filtros aplicados.
                </p>
                <Button onClick={() => navigate('/admin/clientes/nuevo')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Cliente
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ubicación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Facturado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={cliente.foto_perfil} />
                              <AvatarFallback>
                                {obtenerIniciales(cliente.nombre_completo)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {cliente.nombre_completo}
                              </div>
                              <div className="text-sm text-gray-500">
                                Código: {cliente.codigo}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {cliente.tipo_documento === '1' ? 'DNI' : 'RUC'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cliente.numero_documento}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {cliente.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-3 w-3 mr-1" />
                                {cliente.email}
                              </div>
                            )}
                            {cliente.telefono && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-3 w-3 mr-1" />
                                {cliente.telefono}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-32">{cliente.direccion}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={obtenerColorEstado(cliente.estado)}>
                            {cliente.estado}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatearMoneda(cliente.total_facturado || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/clientes/${cliente.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/clientes/editar/${cliente.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => manejarEliminar(cliente.id, cliente.nombre_completo)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <PaginacionPersonalizada
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            onCambioPagina={(pagina) => {
              // Implementar cambio de página
            }}
          />
        )}
      </div>
    </LayoutAdmin>
  );
};

export default ListaClientes;

