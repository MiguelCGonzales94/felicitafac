// ================================================================
// 9. PÁGINAS DE USUARIOS
// ================================================================

/**
 * frontend/src/paginas/admin/usuarios/ListaUsuarios.tsx
 * Lista completa de usuarios del sistema
 */
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Edit, Eye, Trash2, 
  Users, Shield, Mail, Phone, UserCheck
} from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Badge } from '../../../componentes/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../componentes/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useNotificaciones } from '../../../hooks/useNotificaciones';
import { formatearFecha } from '../../../utils/formatters';
import FiltrosAvanzados from '../../../componentes/comunes/FiltrosAvanzados';

export const ListaUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const { usuarios, obtenerUsuarios, eliminarUsuario, cargandoUsuarios } = useAuth();
  const { mostrarConfirmacion } = useNotificaciones();

  const [filtros, setFiltros] = useState({
    busqueda: '',
    rol: '',
    estado: '',
    activo: ''
  });

  useEffect(() => {
    cargarUsuarios();
  }, [filtros]);

  const cargarUsuarios = async () => {
    await obtenerUsuarios(filtros);
  };

  const manejarFiltrar = (nuevosFiltros: any) => {
    setFiltros({ ...filtros, ...nuevosFiltros });
  };

  const manejarEliminar = async (id: number, nombre: string) => {
    const confirmado = await mostrarConfirmacion(
      'Confirmar eliminación',
      `¿Está seguro de eliminar al usuario "${nombre}"?`
    );
    
    if (confirmado) {
      await eliminarUsuario(id);
      cargarUsuarios();
    }
  };

  const obtenerIniciales = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`;
  };

  const obtenerColorRol = (rol: string) => {
    switch (rol) {
      case 'administrador': return 'bg-red-100 text-red-800';
      case 'contador': return 'bg-blue-100 text-blue-800';
      case 'vendedor': return 'bg-green-100 text-green-800';
      case 'cliente': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const obtenerColorEstado = (activo: boolean) => {
    return activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <LayoutAdmin
      title="Gestión de Usuarios"
      description="Administración de usuarios y permisos del sistema"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Sistema', href: '/admin/sistema' },
        { label: 'Usuarios' }
      ]}
    >
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h1>
            <p className="text-gray-600">
              Gestiona usuarios, roles y permisos
            </p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => navigate('/admin/usuarios/roles')}>
              <Shield className="h-4 w-4 mr-2" />
              Gestionar Roles
            </Button>
            <Button onClick={() => navigate('/admin/usuarios/nuevo')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
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
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{usuarios?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usuarios?.filter(u => u.activo).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usuarios?.filter(u => u.rol_detalle?.codigo === 'administrador').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Online Hoy</p>
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
                  placeholder: 'Buscar por nombre, email, usuario...',
                  valor: filtros.busqueda
                },
                {
                  nombre: 'rol',
                  tipo: 'select',
                  placeholder: 'Rol',
                  opciones: [
                    { valor: '', etiqueta: 'Todos los roles' },
                    { valor: 'administrador', etiqueta: 'Administrador' },
                    { valor: 'contador', etiqueta: 'Contador' },
                    { valor: 'vendedor', etiqueta: 'Vendedor' },
                    { valor: 'cliente', etiqueta: 'Cliente' }
                  ],
                  valor: filtros.rol
                },
                {
                  nombre: 'activo',
                  tipo: 'select',
                  placeholder: 'Estado',
                  opciones: [
                    { valor: '', etiqueta: 'Todos' },
                    { valor: 'true', etiqueta: 'Activos' },
                    { valor: 'false', etiqueta: 'Inactivos' }
                  ],
                  valor: filtros.activo
                }
              ]}
              onFiltrar={manejarFiltrar}
            />
          </CardContent>
        </Card>

        {/* Lista de Usuarios */}
        <Card>
          <CardContent className="p-0">
            {cargandoUsuarios ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando usuarios...</p>
              </div>
            ) : usuarios?.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
                <p className="text-gray-500 mb-4">
                  No se encontraron usuarios con los filtros aplicados.
                </p>
                <Button onClick={() => navigate('/admin/usuarios/nuevo')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Usuario
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Último Acceso
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usuarios?.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={usuario.foto_perfil} />
                              <AvatarFallback>
                                {obtenerIniciales(usuario.nombres, usuario.apellidos)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {usuario.nombres} {usuario.apellidos}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{usuario.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3 w-3 mr-1" />
                              {usuario.email}
                            </div>
                            {usuario.telefono && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-3 w-3 mr-1" />
                                {usuario.telefono}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={obtenerColorRol(usuario.rol_detalle?.codigo || '')}>
                            {usuario.rol_detalle?.nombre}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={obtenerColorEstado(usuario.activo)}>
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {usuario.ultimo_acceso ? formatearFecha(usuario.ultimo_acceso) : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/usuarios/${usuario.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/usuarios/editar/${usuario.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => manejarEliminar(usuario.id, `${usuario.nombres} ${usuario.apellidos}`)}
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
      </div>
    </LayoutAdmin>
  );
};

export default ListaUsuarios;

