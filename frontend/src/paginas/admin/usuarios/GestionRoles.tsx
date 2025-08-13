/**
 * frontend/src/paginas/admin/usuarios/GestionRoles.tsx
 * Gestión de roles y permisos del sistema
 */
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, Users, Settings } from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Badge } from '../../../componentes/ui/badge';
import { useAuth } from '../../../hooks/useAuth';
import { useNotificaciones } from '../../../hooks/useNotificaciones';

export const GestionRoles: React.FC = () => {
  const { roles, obtenerRoles, crearRol, actualizarRol, eliminarRol } = useAuth();
  const { mostrarExito, mostrarError, mostrarConfirmacion } = useNotificaciones();

  useEffect(() => {
    obtenerRoles();
  }, []);

  const manejarEliminar = async (id: number, nombre: string) => {
    const confirmado = await mostrarConfirmacion(
      'Confirmar eliminación',
      `¿Está seguro de eliminar el rol "${nombre}"?`
    );
    
    if (confirmado) {
      try {
        await eliminarRol(id);
        mostrarExito('Rol eliminado correctamente');
        obtenerRoles();
      } catch (error) {
        mostrarError('Error al eliminar el rol');
      }
    }
  };

  const obtenerColorRol = (codigo: string) => {
    switch (codigo) {
      case 'administrador': return 'bg-red-100 text-red-800';
      case 'contador': return 'bg-blue-100 text-blue-800';
      case 'vendedor': return 'bg-green-100 text-green-800';
      case 'cliente': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <LayoutAdmin
      title="Gestión de Roles"
      description="Administración de roles y permisos del sistema"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Sistema', href: '/admin/sistema' },
        { label: 'Usuarios', href: '/admin/usuarios' },
        { label: 'Roles' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Roles del Sistema</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Rol
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles?.map((rol) => (
            <Card key={rol.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{rol.nombre}</h3>
                        <Badge className={obtenerColorRol(rol.codigo)}>
                          {rol.codigo}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{rol.descripcion}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-3 w-3 mr-1" />
                          {rol.usuarios_count || 0} usuarios
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Settings className="h-3 w-3 mr-1" />
                          {rol.permisos_count || 0} permisos
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {rol.codigo !== 'administrador' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => manejarEliminar(rol.id, rol.nombre)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {roles?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay roles configurados</h3>
              <p className="text-gray-500 mb-4">
                Los roles permiten organizar los permisos y accesos del sistema.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Rol
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default GestionRoles;

