/**
 * frontend/src/paginas/admin/productos/GestionCategorias.tsx
 * Gestión de categorías de productos
 */
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Package } from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Input } from '../../../componentes/ui/input';
import { Label } from '../../../componentes/ui/label';
import { Badge } from '../../../componentes/ui/badge';
import { useProductos } from '../../../hooks/useProductos';
import { useNotificaciones } from '../../../hooks/useNotificaciones';

export const GestionCategorias: React.FC = () => {
  const { categorias, obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } = useProductos();
  const { mostrarExito, mostrarError, mostrarConfirmacion } = useNotificaciones();
  const [editando, setEditando] = useState<number | null>(null);
  const [nuevaCategoria, setNuevaCategoria] = useState(false);

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const manejarEliminar = async (id: number, nombre: string) => {
    const confirmado = await mostrarConfirmacion(
      'Confirmar eliminación',
      `¿Está seguro de eliminar la categoría "${nombre}"?`
    );
    
    if (confirmado) {
      try {
        await eliminarCategoria(id);
        mostrarExito('Categoría eliminada correctamente');
        obtenerCategorias();
      } catch (error) {
        mostrarError('Error al eliminar la categoría');
      }
    }
  };

  return (
    <LayoutAdmin
      title="Gestión de Categorías"
      description="Administración de categorías de productos"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Comercial', href: '/admin/comercial' },
        { label: 'Productos', href: '/admin/productos' },
        { label: 'Categorías' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Categorías de Productos</h1>
          <Button onClick={() => setNuevaCategoria(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias?.map((categoria) => (
            <Card key={categoria.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Tag className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{categoria.nombre}</h3>
                      <p className="text-sm text-gray-500">{categoria.descripcion}</p>
                      <Badge variant="outline" className="mt-1">
                        {categoria.productos_count || 0} productos
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => manejarEliminar(categoria.id, categoria.nombre)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Card para agregar nueva categoría */}
          {nuevaCategoria && (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Input placeholder="Nombre de la categoría" />
                  <Input placeholder="Descripción" />
                  <div className="flex space-x-2">
                    <Button size="sm">Guardar</Button>
                    <Button size="sm" variant="outline" onClick={() => setNuevaCategoria(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {categorias?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
              <p className="text-gray-500 mb-4">
                Crea tu primera categoría para organizar tus productos.
              </p>
              <Button onClick={() => setNuevaCategoria(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Primera Categoría
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default GestionCategorias;

