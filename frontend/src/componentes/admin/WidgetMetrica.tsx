/**
 * Widget de Métrica - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente reutilizable para mostrar métricas del dashboard
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { Widget, TipoWidget } from '../../types/admin';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES
// =======================================================

interface PropiedadesWidgetMetrica {
  widget: Widget;
  tamaño?: 'pequeño' | 'mediano' | 'grande';
  mostrarTendencia?: boolean;
  clickeable?: boolean;
  className?: string;
  cargando?: boolean;
}

interface PropiedadesIconoTendencia {
  tipo: TipoWidget;
  cambio: string;
  size?: number;
}

// =======================================================
// COMPONENTE ICONO TENDENCIA
// =======================================================

const IconoTendencia: React.FC<PropiedadesIconoTendencia> = ({ 
  tipo, 
  cambio, 
  size = 16 
}) => {
  const esPositivo = tipo === 'positivo';
  const esNegativo = tipo === 'negativo';
  
  if (esPositivo) {
    return <TrendingUp className={`h-${size} w-${size} text-green-500`} />;
  }
  
  if (esNegativo) {
    return <TrendingDown className={`h-${size} w-${size} text-red-500`} />;
  }
  
  return <Minus className={`h-${size} w-${size} text-gray-400`} />;
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const WidgetMetrica: React.FC<PropiedadesWidgetMetrica> = ({
  widget,
  tamaño = 'mediano',
  mostrarTendencia = true,
  clickeable = true,
  className,
  cargando = false
}) => {
  // =======================================================
  // ESTILOS DINÁMICOS
  // =======================================================

  const tamañoClases = {
    pequeño: 'p-4',
    mediano: 'p-6',
    grande: 'p-8'
  };

  const iconoTamañoClases = {
    pequeño: 'w-8 h-8',
    mediano: 'w-12 h-12',
    grande: 'w-16 h-16'
  };

  const textoTamañoClases = {
    pequeño: {
      titulo: 'text-sm',
      valor: 'text-xl',
      cambio: 'text-xs'
    },
    mediano: {
      titulo: 'text-sm',
      valor: 'text-2xl',
      cambio: 'text-sm'
    },
    grande: {
      titulo: 'text-base',
      valor: 'text-3xl',
      cambio: 'text-base'
    }
  };

  const colorCambio = {
    positivo: 'text-green-600',
    negativo: 'text-red-600',
    neutro: 'text-gray-600'
  };

  // =======================================================
  // FUNCIONES
  // =======================================================

  const formatearValor = (valor: string): string => {
    if (widget.formatoValor === 'moneda') {
      const numero = parseFloat(valor.replace(/[^\d.-]/g, ''));
      if (!isNaN(numero)) {
        return new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN',
          minimumFractionDigits: 2
        }).format(numero);
      }
    }
    
    if (widget.formatoValor === 'numero') {
      const numero = parseFloat(valor.replace(/[^\d.-]/g, ''));
      if (!isNaN(numero)) {
        return new Intl.NumberFormat('es-PE').format(numero);
      }
    }
    
    if (widget.formatoValor === 'porcentaje') {
      const numero = parseFloat(valor.replace(/[^\d.-]/g, ''));
      if (!isNaN(numero)) {
        return `${numero.toFixed(1)}%`;
      }
    }
    
    return valor;
  };

  const obtenerIconoColor = (): string => {
    // Extraer color de la clase CSS del widget
    if (widget.color.includes('bg-green')) return 'text-green-600';
    if (widget.color.includes('bg-blue')) return 'text-blue-600';
    if (widget.color.includes('bg-red')) return 'text-red-600';
    if (widget.color.includes('bg-yellow')) return 'text-yellow-600';
    if (widget.color.includes('bg-purple')) return 'text-purple-600';
    if (widget.color.includes('bg-orange')) return 'text-orange-600';
    return 'text-gray-600';
  };

  // =======================================================
  // COMPONENTE LOADING
  // =======================================================

  if (cargando) {
    return (
      <div className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        tamañoClases[tamaño],
        className
      )}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className={cn(
              'bg-gray-200 rounded-full',
              iconoTamañoClases[tamaño]
            )}></div>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // CONTENIDO DEL WIDGET
  // =======================================================

  const contenidoWidget = (
    <div className="flex items-center justify-between h-full">
      {/* Información principal */}
      <div className="flex-1 min-w-0">
        {/* Título */}
        <p className={cn(
          'font-medium text-gray-600 mb-1',
          textoTamañoClases[tamaño].titulo
        )}>
          {widget.titulo}
        </p>
        
        {/* Valor principal */}
        <p className={cn(
          'font-bold text-gray-900 mb-1',
          textoTamañoClases[tamaño].valor
        )}>
          {formatearValor(widget.valor)}
        </p>
        
        {/* Cambio/Tendencia */}
        {mostrarTendencia && widget.cambio && (
          <div className={cn(
            'flex items-center space-x-1',
            textoTamañoClases[tamaño].cambio
          )}>
            <IconoTendencia 
              tipo={widget.tipo} 
              cambio={widget.cambio}
              size={tamaño === 'pequeño' ? 3 : 4}
            />
            <span className={colorCambio[widget.tipo]}>
              {widget.cambio}
            </span>
          </div>
        )}

        {/* Descripción adicional */}
        {widget.descripcion && tamaño !== 'pequeño' && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {widget.descripcion}
          </p>
        )}

        {/* Última actualización */}
        {widget.ultimaActualizacion && tamaño === 'grande' && (
          <p className="text-xs text-gray-400 mt-2">
            Actualizado: {widget.ultimaActualizacion.toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>

      {/* Icono */}
      <div className="flex-shrink-0 ml-4">
        <div className={cn(
          'rounded-full flex items-center justify-center',
          widget.color,
          iconoTamañoClases[tamaño]
        )}>
          <div className="text-white">
            {typeof widget.icono === 'string' ? (
              <span className={cn(
                tamaño === 'pequeño' ? 'text-lg' : 
                tamaño === 'mediano' ? 'text-xl' : 'text-2xl'
              )}>
                {widget.icono}
              </span>
            ) : (
              widget.icono
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // =======================================================
  // RENDER PRINCIPAL
  // =======================================================

  const clasesPrincipales = cn(
    'bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200',
    tamañoClases[tamaño],
    clickeable && widget.enlace && 'hover:shadow-md hover:border-gray-300 cursor-pointer',
    !clickeable && 'cursor-default',
    className
  );

  // Si es clickeable y tiene enlace, envolver en Link
  if (clickeable && widget.enlace) {
    return (
      <Link to={widget.enlace} className={clasesPrincipales}>
        <div className="relative">
          {contenidoWidget}
          
          {/* Indicador de enlace */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </Link>
    );
  }

  // Widget estático
  return (
    <div className={clasesPrincipales}>
      {contenidoWidget}
    </div>
  );
};

// =======================================================
// COMPONENTE GRID DE WIDGETS
// =======================================================

interface PropiedadesGridWidgets {
  widgets: Widget[];
  columnas?: 1 | 2 | 3 | 4;
  tamaño?: 'pequeño' | 'mediano' | 'grande';
  cargando?: boolean;
  className?: string;
}

export const GridWidgets: React.FC<PropiedadesGridWidgets> = ({
  widgets,
  columnas = 4,
  tamaño = 'mediano',
  cargando = false,
  className
}) => {
  const columnasClases = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(
      'grid gap-6',
      columnasClases[columnas],
      className
    )}>
      {cargando ? (
        // Mostrar skeletons mientras carga
        Array.from({ length: columnas }).map((_, index) => (
          <WidgetMetrica
            key={`skeleton-${index}`}
            widget={{
              id: `skeleton-${index}`,
              titulo: '',
              valor: '',
              cambio: '',
              tipo: 'neutro',
              icono: '',
              color: ''
            }}
            tamaño={tamaño}
            cargando={true}
          />
        ))
      ) : (
        // Mostrar widgets reales
        widgets.map((widget) => (
          <WidgetMetrica
            key={widget.id}
            widget={widget}
            tamaño={tamaño}
          />
        ))
      )}
    </div>
  );
};

export default WidgetMetrica;