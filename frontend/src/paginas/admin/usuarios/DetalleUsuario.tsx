/**
 * frontend/src/paginas/admin/usuarios/DetalleUsuario.tsx
 * Página de detalle completo de un usuario
 */
import React, { useState, useEffect } from 'react';
import { 
  Edit, Trash2, Mail, Phone, Calendar, 
  Shield, UserCheck, Activity, Key
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Badge } from '../../../componentes/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../componentes/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../componentes/ui/tabs';
import { useAuth } from '../../../hooks/useAuth';
import { formatearFecha } from '../../../utils/formatters';

export const DetalleUsuario: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obtenerUsuario, usuarioSeleccionado, cargandoUsuario } = useAuth();

  useEffect(() => {
    if (id) {
      obtenerUsuario(parseInt(id));
    }
  }, [id]);

  if (cargandoUsuario) {
    return (
      <LayoutAdmin title="Cargando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </LayoutAdmin>
    );
  }

  if (!usuarioSeleccionado) {
    return (
      <LayoutAdmin title="Usuario no encontrado">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Usuario no encontrado</h3>
          <Button onClick={() => navigate('/admin/usuarios')}>
            Volver a la Lista
          </Button>
        </div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin
      title={`${usuarioSeleccionado.nombres} ${usuarioSeleccionado.apellidos}`}
      description="Información completa del usuario"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Sistema', href: '/admin/sistema' },
        { label: 'Usuarios', href: '/admin/usuarios' },
        { label: `${usuarioSeleccionado.nombres} ${usuarioSeleccionado.apellidos}` }
      ]}
    >
      <div className="space-y-6">
        {/* Header del Usuario */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={usuarioSeleccionado.foto_perfil} />
                  <AvatarFallback className="text-xl">
                    {usuarioSeleccionado.nombres.charAt(0)}{usuarioSeleccionado.apellidos.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {usuarioSeleccionado.nombres} {usuarioSeleccionado.apellidos}
                  </h1>
                  <p className="text-gray-600">@{usuarioSeleccionado.username}</p>
                  <p className="text-sm text-gray-500">
                    Registrado el {formatearFecha(usuarioSeleccionado.fecha_creacion)}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={usuarioSeleccionado.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {usuarioSeleccionado.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      {usuarioSeleccionado.rol_detalle?.nombre}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button onClick={() => navigate(`/admin/usuarios/editar/${usuarioSeleccionado.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Restablecer Contraseña
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas del Usuario */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Último Acceso</p>
                  <p className="text-sm font-bold text-gray-900">
                    {usuarioSeleccionado.ultimo_acceso ? 
                      formatearFecha(usuarioSeleccionado.ultimo_acceso) : 
                      'Nunca'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Sesiones Activas</p>
                  <p className="text-xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Permisos</p>
                  <p className="text-xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Días Activo</p>
                  <p className="text-xl font-bold text-gray-900">
                    {Math.floor((Date.now() - new Date(usuarioSeleccionado.fecha_creacion).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Información */}
        <Tabs defaultValue="informacion" className="w-full">
          <TabsList>
            <TabsTrigger value="informacion">Información Personal</TabsTrigger>
            <TabsTrigger value="permisos">Permisos y Roles</TabsTrigger>
            <TabsTrigger value="actividad">Actividad</TabsTrigger>
            <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="informacion">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre Completo</p>
                    <p className="font-medium">{usuarioSeleccionado.nombres} {usuarioSeleccionado.apellidos}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nombre de Usuario</p>
                    <p className="font-medium">@{usuarioSeleccionado.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Documento de Identidad</p>
                    <p className="font-medium">{usuarioSeleccionado.numero_documento || 'No registrado'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{usuarioSeleccionado.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium">{usuarioSeleccionado.telefono || 'No registrado'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información del Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Registro</p>
                    <p className="font-medium">{formatearFecha(usuarioSeleccionado.fecha_creacion)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Último Acceso</p>
                    <p className="font-medium">
                      {usuarioSeleccionado.ultimo_acceso ? 
                        formatearFecha(usuarioSeleccionado.ultimo_acceso) : 
                        'Nunca ha ingresado'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <Badge className={usuarioSeleccionado.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {usuarioSeleccionado.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rol y Permisos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Rol Principal</p>
                    <Badge className="bg-blue-100 text-blue-800">
                      {usuarioSeleccionado.rol_detalle?.nombre}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Descripción del Rol</p>
                    <p className="text-sm text-gray-700">
                      {usuarioSeleccionado.rol_detalle?.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Permisos Especiales</p>
                    <p className="text-sm text-gray-500">Ninguno</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permisos">
            <Card>
              <CardHeader>
                <CardTitle>Permisos y Accesos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Gestión de permisos específicos</p>
                  <p className="text-sm text-gray-400">Los permisos se heredan del rol asignado</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actividad">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Actividad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Historial de actividad del usuario</p>
                  <p className="text-sm text-gray-400">Próximamente disponible</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracion">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Autenticación de Dos Factores</p>
                      <p className="text-sm text-gray-500">Seguridad adicional para la cuenta</p>
                    </div>
                    <Badge variant="secondary">Deshabilitado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificaciones por Email</p>
                      <p className="text-sm text-gray-500">Recibir notificaciones del sistema</p>
                    </div>
                    <Badge variant="default">Habilitado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sesiones Múltiples</p>
                      <p className="text-sm text-gray-500">Permitir múltiples sesiones activas</p>
                    </div>
                    <Badge variant="default">Habilitado</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutAdmin>
  );
};

export default DetalleUsuario;

