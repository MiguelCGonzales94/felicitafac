/**
 * frontend/src/paginas/admin/clientes/NuevoCliente.tsx
 * Página para crear nuevo cliente
 */
import React from 'react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import FormularioCliente from '../../../componentes/formularios/FormularioCliente';
import { useNavigate } from 'react-router-dom';
import { useClientes } from '../../../hooks/useClientes';
import { useNotificaciones } from '../../../hooks/useNotificaciones';

export const NuevoCliente: React.FC = () => {
  const navigate = useNavigate();
  const { crearCliente } = useClientes();
  const { mostrarExito, mostrarError } = useNotificaciones();

  const manejarGuardar = async (datos: any) => {
    try {
      const nuevoCliente = await crearCliente(datos);
      mostrarExito('Cliente registrado correctamente');
      navigate(`/admin/clientes/${nuevoCliente.id}`);
    } catch (error) {
      mostrarError('Error al registrar el cliente');
    }
  };

  const manejarCancelar = () => {
    navigate('/admin/clientes');
  };

  return (
    <LayoutAdmin
      title="Nuevo Cliente"
      description="Registrar nuevo cliente en el sistema"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Comercial', href: '/admin/comercial' },
        { label: 'Clientes', href: '/admin/clientes' },
        { label: 'Nuevo Cliente' }
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <FormularioCliente
          onGuardar={manejarGuardar}
          onCancelar={manejarCancelar}
        />
      </div>
    </LayoutAdmin>
  );
};

export default NuevoCliente;

