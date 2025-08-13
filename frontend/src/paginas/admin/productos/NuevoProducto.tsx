/**
 * frontend/src/paginas/admin/productos/NuevoProducto.tsx
 * Página para crear nuevo producto
 */
import React from 'react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import FormularioProducto from '../../../componentes/formularios/FormularioProducto';
import { useNavigate } from 'react-router-dom';
import { useProductos } from '../../../hooks/useProductos';
import { useNotificaciones } from '../../../hooks/useNotificaciones';

export const NuevoProducto: React.FC = () => {
  const navigate = useNavigate();
  const { crearProducto } = useProductos();
  const { mostrarExito, mostrarError } = useNotificaciones();

  const manejarGuardar = async (datos: any) => {
    try {
      const nuevoProducto = await crearProducto(datos);
      mostrarExito('Producto registrado correctamente');
      navigate(`/admin/productos/${nuevoProducto.id}`);
    } catch (error) {
      mostrarError('Error al registrar el producto');
    }
  };

  const manejarCancelar = () => {
    navigate('/admin/productos');
  };

  return (
    <LayoutAdmin
      title="Nuevo Producto"
      description="Registrar nuevo producto en el catálogo"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Comercial', href: '/admin/comercial' },
        { label: 'Productos', href: '/admin/productos' },
        { label: 'Nuevo Producto' }
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <FormularioProducto
          onGuardar={manejarGuardar}
          onCancelar={manejarCancelar}
        />
      </div>
    </LayoutAdmin>
  );
};

export default NuevoProducto;

