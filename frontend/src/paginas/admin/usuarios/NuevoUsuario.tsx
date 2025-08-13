/**
 * frontend/src/paginas/admin/usuarios/NuevoUsuario.tsx
 * Página para crear nuevo usuario
 */
import React from 'react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import FormularioUsuario from '../../../componentes/formularios/FormularioUsuario';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useNotificaciones } from '../../../hooks/useNotificaciones';

export const NuevoUsuario: React.FC = () => {
  const navigate = useNavigate();
  const { crearUsuario } = useAuth();
  const { mostrarExito, mostrarError } = useNotificaciones();

  const manejarGuardar = async (datos: any) => {
    try {
      const nuevoUsuario = await crearUsuario(datos);
      mostrarExito('Usuario creado correctamente');
      navigate(`/admin/usuarios/${nuevoUsuario.id}`);
    } catch (error) {
      mostrarError('Error al crear el usuario');
    }
  };

  const manejarCancelar = () => {
    navigate('/admin/usuarios');
  };

  return (
    <LayoutAdmin
      title="Nuevo Usuario"
      description="Crear nuevo usuario del sistema"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Sistema', href: '/admin/sistema' },
        { label: 'Usuarios', href: '/admin/usuarios' },
        { label: 'Nuevo Usuario' }
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <FormularioUsuario
          onGuardar={manejarGuardar}
          onCancelar={manejarCancelar}
        />
      </div>
    </LayoutAdmin>
  );
};

export default NuevoUsuario;

