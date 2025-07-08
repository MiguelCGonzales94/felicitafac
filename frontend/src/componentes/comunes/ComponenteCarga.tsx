/**
 * Componente de Carga - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componentes para mostrar estados de carga
 */

import React from 'react';
import { Loader2, FileText, Zap, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES
// =======================================================

interface PropiedadesComponenteCarga {
  mensaje?: string;
  tamaño?: 'pequeño' | 'mediano' | 'grande';
  tipo?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  mostrarMensaje?: boolean;
  className?: string;
  centrado?: boolean;
}

interface PropiedadesCargaInline {
  texto?: string;
  tamaño?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

interface PropiedadesCargaPagina {
  titulo?: string;
  mensaje?: string;
  progreso?: number;
  mostrarProgreso?: boolean;
}

interface PropiedadesSkeleton {
  filas?: number;
  altura?: string;
  ancho?: string;
  mostrarAvatar?: boolean;
  className?: string;
}

// =======================================================
// COMPONENTE PRINCIPAL DE CARGA
// =======================================================

const ComponenteCarga: React.FC<PropiedadesComponenteCarga> = ({
  mensaje = 'Cargando...',
  tamaño = 'mediano',
  tipo = 'spinner',
  mostrarMensaje = true,
  className,
  centrado = true
}) => {
  const tamañosSpinner = {
    pequeño: 'w-4 h-4',
    mediano: 'w-8 h-8',
    grande: 'w-12 h-12'
  };

  const tamañosTexto = {
    pequeño: 'text-sm',
    mediano: 'text-base',
    grande: 'text-lg'
  };

  const renderSpinner = () => (
    <Loader2 className={cn(
      'animate-spin text-blue-600',
      tamañosSpinner[tamaño]
    )} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            'bg-blue-600 rounded-full animate-pulse',
            tamaño === 'pequeño' ? 'w-2 h-2' : 
            tamaño === 'mediano' ? 'w-3 h-3' : 'w-4 h-4'
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={cn(
      'bg-blue-600 rounded-full animate-pulse',
      tamaño === 'pequeño' ? 'w-8 h-8' : 
      tamaño === 'mediano' ? 'w-12 h-12' : 'w-16 h-16'
    )} />
  );

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-300 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded" />
        <div className="h-4 bg-gray-300 rounded w-5/6" />
      </div>
    </div>
  );

  const renderLoader = () => {
    switch (tipo) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-3',
      centrado && 'min-h-[200px]',
      className
    )}>
      {renderLoader()}
      {mostrarMensaje && tipo !== 'skeleton' && (
        <p className={cn(
          'text-gray-600 font-medium',
          tamañosTexto[tamaño]
        )}>
          {mensaje}
        </p>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE DE CARGA INLINE
// =======================================================

export const CargaInline: React.FC<PropiedadesCargaInline> = ({
  texto = 'Cargando',
  tamaño = 'sm',
  className
}) => {
  const tamañosClases = {
    xs: { spinner: 'w-3 h-3', texto: 'text-xs' },
    sm: { spinner: 'w-4 h-4', texto: 'text-sm' },
    md: { spinner: 'w-5 h-5', texto: 'text-base' },
    lg: { spinner: 'w-6 h-6', texto: 'text-lg' }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Loader2 className={cn(
        'animate-spin text-blue-600',
        tamañosClases[tamaño].spinner
      )} />
      <span className={cn(
        'text-gray-600',
        tamañosClases[tamaño].texto
      )}>
        {texto}
      </span>
    </div>
  );
};

// =======================================================
// COMPONENTE DE CARGA DE PÁGINA COMPLETA
// =======================================================

export const CargaPagina: React.FC<PropiedadesCargaPagina> = ({
  titulo = 'FELICITAFAC',
  mensaje = 'Cargando aplicación...',
  progreso,
  mostrarProgreso = false
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md w-full px-4">
        {/* Logo */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
          <FileText className="h-8 w-8 text-white" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{titulo}</h1>
        
        {/* Mensaje */}
        <p className="text-gray-600 mb-8">{mensaje}</p>

        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>

        {/* Barra de progreso */}
        {mostrarProgreso && typeof progreso === 'number' && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progreso))}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">{Math.round(progreso)}%</p>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-8 text-xs text-gray-400">
          <p>Sistema de Facturación Electrónica para Perú</p>
        </div>
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE SKELETON
// =======================================================

export const Skeleton: React.FC<PropiedadesSkeleton> = ({
  filas = 3,
  altura = 'h-4',
  ancho = 'w-full',
  mostrarAvatar = false,
  className
}) => {
  return (
    <div className={cn('animate-pulse', className)}>
      {mostrarAvatar && (
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/4" />
            <div className="h-3 bg-gray-300 rounded w-1/6" />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: filas }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'bg-gray-300 rounded',
              altura,
              index === filas - 1 ? 'w-5/6' : ancho
            )}
          />
        ))}
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE DE CARGA PARA TABLAS
// =======================================================

export const CargaTabla: React.FC<{
  columnas: number;
  filas?: number;
  mostrarHeader?: boolean;
}> = ({
  columnas,
  filas = 5,
  mostrarHeader = true
}) => {
  return (
    <div className="animate-pulse">
      {/* Header de tabla */}
      {mostrarHeader && (
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}>
          {Array.from({ length: columnas }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-300 rounded" />
          ))}
        </div>
      )}
      
      {/* Filas de tabla */}
      <div className="space-y-3">
        {Array.from({ length: filas }).map((_, filaIndex) => (
          <div key={filaIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}>
            {Array.from({ length: columnas }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-300 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE DE CARGA PARA BOTONES
// =======================================================

export const CargaBoton: React.FC<{
  texto?: string;
  tamaño?: 'sm' | 'md' | 'lg';
}> = ({
  texto = 'Cargando...',
  tamaño = 'md'
}) => {
  const tamañosSpinner = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex items-center space-x-2">
      <Loader2 className={cn('animate-spin', tamañosSpinner[tamaño])} />
      <span>{texto}</span>
    </div>
  );
};

// =======================================================
// COMPONENTE DE CARGA CON TEMPORIZADOR
// =======================================================

export const CargaConTemporizador: React.FC<{
  mensaje?: string;
  tiempoEstimado?: number; // en segundos
}> = ({
  mensaje = 'Procesando...',
  tiempoEstimado = 10
}) => {
  const [tiempoTranscurrido, setTiempoTranscurrido] = React.useState(0);

  React.useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempoTranscurrido(prev => prev + 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const progreso = Math.min(100, (tiempoTranscurrido / tiempoEstimado) * 100);

  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-800" />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-gray-700 font-medium">{mensaje}</p>
        <p className="text-sm text-gray-500">
          {tiempoTranscurrido}s / {tiempoEstimado}s estimados
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ComponenteCarga;