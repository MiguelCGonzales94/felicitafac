/**
 * frontend/src/paginas/admin/productos/EditarProducto.tsx
 * Página para editar producto existente
 */
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import FormularioProducto from '../../../componentes/formularios/FormularioProducto';
import { useProductos } from '../../../hooks/useProductos';
import { useNotificaciones } from '../../../hooks/useNotificaciones';

export const EditarProducto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obtenerProducto, actualizarProducto, eliminarProducto, productoActual, cargandoProducto } = useProductos();
  const { mostrarExito, mostrarError, mostrarConfirmacion } = useNotificaciones();

  useEffect(() => {
    if (id) {
      obtenerProducto(parseInt(id));
    }
  }, [id]);

  const manejarGuardar = async (datos: any) => {
    try {
      if (id) {
        await actualizarProducto(parseInt(id), datos);
        mostrarExito('Producto actualizado correctamente');
        navigate(`/admin/productos/${id}`);
      }
    } catch (error) {
      mostrarError('Error al actualizar el producto');
    }
  };

  const manejarEliminar = async () => {
    if (!id) return;
    
    const confirmado = await mostrarConfirmacion(
      'Confirmar eliminación',
      `¿Está seguro de eliminar el producto "${productoActual?.nombre}"?`
    );
    
    if (confirmado) {
      try {
        await eliminarProducto(parseInt(id));
        mostrarExito('Producto eliminado correctamente');
        navigate('/admin/productos');
      } catch (error) {
        mostrarError('Error al eliminar el producto');
      }
    }
  };

  const manejarCancelar = () => {
    navigate(`/admin/productos/${id}`);
  };

  if (cargandoProducto) {
    return (
      <LayoutAdmin title="Cargando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </LayoutAdmin>
    );
  }

  if (!productoActual) {
    return (
      <LayoutAdmin title="Producto no encontrado">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Producto no encontrado</h3>
        </div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin
      title={`Editar Producto: ${productoActual.nombre}`}
      description="Modificar información del producto"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Comercial', href: '/admin/comercial' },
        { label: 'Productos', href: '/admin/productos' },
        { label: productoActual.nombre, href: `/admin/productos/${id}` },
        { label: 'Editar' }
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <FormularioProducto
          productoInicial={productoActual}
          modoEdicion={true}
          onGuardar={manejarGuardar}
          onCancelar={manejarCancelar}
          onEliminar={manejarEliminar}
        />
      </div>
    </LayoutAdmin>
  );
};

export default EditarProducto;

