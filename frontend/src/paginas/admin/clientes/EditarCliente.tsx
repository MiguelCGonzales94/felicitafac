/**
 * frontend/src/paginas/admin/clientes/EditarCliente.tsx
 * Página para editar cliente existente
 */
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import FormularioCliente from '../../../componentes/formularios/FormularioCliente';
import { useClientes } from '../../../hooks/useClientes';
import { useNotificaciones } from '../../../hooks/useNotificaciones';

export const EditarCliente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obtenerCliente, actualizarCliente, eliminarCliente, clienteActual, cargandoCliente } = useClientes();
  const { mostrarExito, mostrarError, mostrarConfirmacion } = useNotificaciones();

  useEffect(() => {
    if (id) {
      obtenerCliente(parseInt(id));
    }
  }, [id]);

  const manejarGuardar = async (datos: any) => {
    try {
      if (id) {
        await actualizarCliente(parseInt(id), datos);
        mostrarExito('Cliente actualizado correctamente');
        navigate(`/admin/clientes/${id}`);
      }
    } catch (error) {
      mostrarError('Error al actualizar el cliente');
    }
  };

  const manejarEliminar = async () => {
    if (!id) return;
    
    const confirmado = await mostrarConfirmacion(
      'Confirmar eliminación',
      `¿Está seguro de eliminar al cliente "${clienteActual?.nombre_completo}"?`
    );
    
    if (confirmado) {
      try {
        await eliminarCliente(parseInt(id));
        mostrarExito('Cliente eliminado correctamente');
        navigate('/admin/clientes');
      } catch (error) {
        mostrarError('Error al eliminar el cliente');
      }
    }
  };

  const manejarCancelar = () => {
    navigate(`/admin/clientes/${id}`);
  };

  if (cargandoCliente) {
    return (
      <LayoutAdmin title="Cargando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </LayoutAdmin>
    );
  }

  if (!clienteActual) {
    return (
      <LayoutAdmin title="Cliente no encontrado">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cliente no encontrado</h3>
        </div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin
      title={`Editar Cliente: ${clienteActual.nombre_completo}`}
      description="Modificar información del cliente"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Comercial', href: '/admin/comercial' },
        { label: 'Clientes', href: '/admin/clientes' },
        { label: clienteActual.nombre_completo, href: `/admin/clientes/${id}` },
        { label: 'Editar' }
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <FormularioCliente
          clienteInicial={clienteActual}
          modoEdicion={true}
          onGuardar={manejarGuardar}
          onCancelar={manejarCancelar}
          onEliminar={manejarEliminar}
        />
      </div>
    </LayoutAdmin>
  );
};

export default EditarCliente;

