/**
 * Accesos Rápidos - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Panel de acciones rápidas para el dashboard administrativo
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Settings as SettingsIcon
} from 'lucide-react';
import { AccionRapida, GrupoAccionesRapidas } from '../../types/admin';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES
// =======================================================

interface PropiedadesAccesosRapidos {
  grupos: GrupoAccionesRapidas[];
  titulo?: string;
  mostrarTitulo?: boolean;
  disposicion?: 'vertical' | 'horizontal';
  tamañoBotones?: 'pequeño' | 'mediano' | 'grande';
  className?: string;
  onPersonalizar?: () => void;
}

interface PropiedadesBotonAccion {
  accion: AccionRapida;
  tamaño: 'pequeño' | 'mediano' | 'grande';
  onClick?: () => void;
}

interface PropiedadesGrupoAcciones {
  grupo: GrupoAccionesRapidas;
  tamañoBotones: 'pequeño' | 'mediano' | 'grande';
  onToggleExpansion: (grupoId: string) => void;
}

// =======================================================
// COMPONENTE BOTÓN ACCIÓN
// =======================================================

const BotonAccion: React.FC<PropiedadesBotonAccion> = ({ 
  accion, 
  tamaño,
  onClick 
}) => {
  // Verificar si la acción está activa
  if (!accion.activa) return null;

  const tamañoClases = {
    pequeño: {
      boton: 'p-3',
      icono: 'h-4 w-4',
      texto: 'text-sm',
      badge: 'text-xs px-1.5 py-0.5'
    },
    mediano: {
      boton: 'p-4',
      icono: 'h-5 w-5',
      texto: 'text-sm',
      badge: 'text-xs px-2 py-1'
    },
    grande: {
      boton: 'p-6',
      icono: 'h-6 w-6',
      texto: 'text-base',
      badge: 'text-sm px-2 py-1'
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (accion.funcion) {
      accion.funcion();
    }
  };

  const contenidoBoton = (
    <div className={cn(
      'w-full flex flex-col items-center justify-center space-y-2 rounded-lg border-2 border-transparent transition-all duration-200',
      'hover:border-gray-200 hover:shadow-md hover:scale-105',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      'group relative overflow-hidden',
      accion.color,
      tamañoClases[tamaño].boton
    )}>
      {/* Efecto de hover */}
      <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg"></div>
      
      {/* Icono */}
      <div className={cn(
        'relative z-10 text-white transition-transform duration-200 group-hover:scale-110',
        tamañoClases[tamaño].icono
      )}>
        {accion.icono}
      </div>
      
      {/* Texto */}
      <div className="relative z-10 text-center text-white">
        <p className={cn('font-medium', tamañoClases[tamaño].texto)}>
          {accion.titulo}
        </p>
        {accion.descripcion && tamaño !== 'pequeño' && (
          <p className="text-xs opacity-90 mt-1 line-clamp-2">
            {accion.descripcion}
          </p>
        )}
      </div>

      {/* Badge */}
      {accion.badge && (
        <div className={cn(
          'absolute top-2 right-2 bg-white bg-opacity-90 text-gray-800 rounded-full font-medium',
          tamañoClases[tamaño].badge
        )}>
          {accion.badge.texto}
        </div>
      )}

      {/* Indicador de enlace externo */}
      {accion.enlace && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ExternalLink className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );

  // Si tiene enlace, envolver en Link
  if (accion.enlace) {
    return (
      <Link to={accion.enlace} onClick={handleClick}>
        {contenidoBoton}
      </Link>
    );
  }

  // Si no tiene enlace, usar button
  return (
    <button onClick={handleClick}>
      {contenidoBoton}
    </button>
  );
};

// =======================================================
// COMPONENTE GRUPO DE ACCIONES
// =======================================================

const GrupoAcciones: React.FC<PropiedadesGrupoAcciones> = ({
  grupo,
  tamañoBotones,
  onToggleExpansion
}) => {
  const { usuario } = useAuth();

  // Filtrar acciones según permisos del usuario
  const accionesFiltradas = grupo.acciones.filter(accion => {
    if (!accion.rolesPermitidos || accion.rolesPermitidos.length === 0) return true;
    return accion.rolesPermitidos.includes(usuario?.rol_detalle?.codigo || '');
  });

  // No mostrar grupo si no hay acciones permitidas
  if (accionesFiltradas.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header del grupo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {grupo.icono && (
            <span className="text-gray-600">
              {grupo.icono}
            </span>
          )}
          <h4 className="font-medium text-gray-900">{grupo.titulo}</h4>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            {accionesFiltradas.length}
          </span>
        </div>
        
        <button
          onClick={() => onToggleExpansion(grupo.id)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title={grupo.expandido ? 'Contraer' : 'Expandir'}
        >
          {grupo.expandido ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Acciones del grupo */}
      {grupo.expandido && (
        <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-top-2 duration-200">
          {accionesFiltradas.map((accion) => (
            <BotonAccion
              key={accion.id}
              accion={accion}
              tamaño={tamañoBotones}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const AccesosRapidos: React.FC<PropiedadesAccesosRapidos> = ({
  grupos,
  titulo = 'Accesos Rápidos',
  mostrarTitulo = true,
  disposicion = 'vertical',
  tamañoBotones = 'mediano',
  className,
  onPersonalizar
}) => {
  // Estados locales
  const [gruposEstado, setGruposEstado] = useState(grupos);

  // =======================================================
  // FUNCIONES
  // =======================================================

  const toggleExpansionGrupo = (grupoId: string) => {
    setGruposEstado(prev =>
      prev.map(grupo =>
        grupo.id === grupoId
          ? { ...grupo, expandido: !grupo.expandido }
          : grupo
      )
    );
  };

  const obtenerAccionesVisibles = () => {
    return gruposEstado.reduce((total, grupo) => {
      return total + grupo.acciones.filter(accion => accion.activa).length;
    }, 0);
  };

  // =======================================================
  // DISPOSICIÓN HORIZONTAL
  // =======================================================

  if (disposicion === 'horizontal') {
    const todasLasAcciones = gruposEstado
      .flatMap(grupo => grupo.acciones)
      .filter(accion => accion.activa);

    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        {mostrarTitulo && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
            </div>
            {onPersonalizar && (
              <button
                onClick={onPersonalizar}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Personalizar accesos rápidos"
              >
                <SettingsIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {todasLasAcciones.map((accion) => (
            <BotonAccion
              key={accion.id}
              accion={accion}
              tamaño={tamañoBotones}
            />
          ))}
        </div>
      </div>
    );
  }

  // =======================================================
  // DISPOSICIÓN VERTICAL (Por defecto)
  // =======================================================

  return (
    <div className={cn('space-y-6', className)}>
      {gruposEstado.map((grupo) => (
        <div key={grupo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header solo para el primer grupo si mostrarTitulo está activado */}
          {mostrarTitulo && grupo === gruposEstado[0] && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {obtenerAccionesVisibles()}
                </span>
              </div>
              {onPersonalizar && (
                <button
                  onClick={onPersonalizar}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Personalizar accesos rápidos"
                >
                  <SettingsIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Grupo de acciones */}
          <GrupoAcciones
            grupo={grupo}
            tamañoBotones={tamañoBotones}
            onToggleExpansion={toggleExpansionGrupo}
          />
        </div>
      ))}

      {/* Mensaje si no hay acciones */}
      {obtenerAccionesVisibles() === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Plus className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-4">No hay accesos rápidos configurados</p>
          {onPersonalizar && (
            <button
              onClick={onPersonalizar}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              Configurar Accesos Rápidos
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE PERSONALIZADO PARA DASHBOARD
// =======================================================

interface PropiedadesAccesosRapidosDashboard {
  className?: string;
  compacto?: boolean;
}

export const AccesosRapidosDashboard: React.FC<PropiedadesAccesosRapidosDashboard> = ({
  className,
  compacto = false
}) => {
  // Datos mock de accesos rápidos específicos para el dashboard
  const accionesRapidas: GrupoAccionesRapidas[] = [
    {
      id: 'acciones-principales',
      titulo: 'Acciones Principales',
      expandido: true,
      acciones: [
        {
          id: 'nueva-factura',
          titulo: 'Nueva Factura',
          descripcion: 'Crear documento electrónico',
          icono: <Plus className="h-5 w-5" />,
          color: 'bg-blue-600 hover:bg-blue-700',
          funcion: () => console.log('Nueva factura'),
          enlace: '/admin/facturacion/pos',
          activa: true,
          rolesPermitidos: ['administrador', 'contador', 'vendedor']
        },
        {
          id: 'registrar-cliente',
          titulo: 'Registrar Cliente',
          descripcion: 'Agregar nuevo cliente',
          icono: <Plus className="h-5 w-5" />,
          color: 'bg-green-600 hover:bg-green-700',
          funcion: () => console.log('Registrar cliente'),
          enlace: '/admin/comercial/clientes/nuevo',
          activa: true,
          rolesPermitidos: ['administrador', 'contador', 'vendedor']
        },
        {
          id: 'agregar-producto',
          titulo: 'Agregar Producto',
          descripcion: 'Nuevo producto/servicio',
          icono: <Plus className="h-5 w-5" />,
          color: 'bg-purple-600 hover:bg-purple-700',
          funcion: () => console.log('Agregar producto'),
          enlace: '/admin/comercial/productos/nuevo',
          activa: true,
          rolesPermitidos: ['administrador', 'contador']
        },
        {
          id: 'ver-reportes',
          titulo: 'Ver Reportes',
          descripcion: 'Dashboard ejecutivo',
          icono: <Plus className="h-5 w-5" />,
          color: 'bg-orange-600 hover:bg-orange-700',
          funcion: () => console.log('Ver reportes'),
          enlace: '/admin/reportes/dashboard-ejecutivo',
          activa: true,
          rolesPermitidos: ['administrador', 'contador']
        }
      ]
    }
  ];

  return (
    <AccesosRapidos
      grupos={accionesRapidas}
      titulo="Acciones Rápidas"
      mostrarTitulo={!compacto}
      disposicion={compacto ? 'horizontal' : 'vertical'}
      tamañoBotones={compacto ? 'pequeño' : 'mediano'}
      className={className}
    />
  );
};

export default AccesosRapidos;