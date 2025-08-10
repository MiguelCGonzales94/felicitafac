/**
 * Componente Badge - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente para mostrar etiquetas, estados y badges informativos
 */

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

export interface PropiedadesBadge {
  // Contenido
  children: React.ReactNode;
  
  // Variantes de estilo
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  
  // Tamaños
  size?: 'xs' | 'sm' | 'md' | 'lg';
  
  // Configuración
  removable?: boolean;
  onRemove?: () => void;
  
  // Apariencia
  rounded?: boolean;
  dot?: boolean;
  pulse?: boolean;
  
  // Clases CSS
  className?: string;
  
  // Props HTML
  onClick?: () => void;
  
  // Props adicionales
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  
  // Icono
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

// =======================================================
// CONFIGURACIÓN DE VARIANTES
// =======================================================

const badgeVariants = {
  variant: {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    success: 'bg-green-500 text-white hover:bg-green-600',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
    error: 'bg-red-500 text-white hover:bg-red-600',
    info: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  },
  size: {
    xs: 'text-xs px-1.5 py-0.5 h-4',
    sm: 'text-xs px-2 py-0.5 h-5',
    md: 'text-sm px-2.5 py-0.5 h-6',
    lg: 'text-sm px-3 py-1 h-7',
  },
};

// =======================================================
// COMPONENTE BADGE PRINCIPAL
// =======================================================

export const Badge = React.forwardRef<HTMLDivElement, PropiedadesBadge>(
  (
    {
      children,
      variant = 'default',
      size = 'sm',
      removable = false,
      onRemove,
      rounded = true,
      dot = false,
      pulse = false,
      className,
      onClick,
      count,
      maxCount = 99,
      showZero = false,
      icon,
      iconPosition = 'left',
      ...props
    },
    ref
  ) => {
    // =======================================================
    // LÓGICA DE CONTEO
    // =======================================================
    
    const displayCount = React.useMemo(() => {
      if (count === undefined) return null;
      if (count === 0 && !showZero) return null;
      if (count > maxCount) return `${maxCount}+`;
      return count.toString();
    }, [count, maxCount, showZero]);
    
    // =======================================================
    // MANEJADORES DE EVENTOS
    // =======================================================
    
    const handleClick = () => {
      onClick?.();
    };
    
    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };
    
    // =======================================================
    // CLASES CSS
    // =======================================================
    
    const badgeClasses = cn(
      // Estilos base
      'inline-flex items-center gap-1 font-medium transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      
      // Variantes
      badgeVariants.variant[variant],
      badgeVariants.size[size],
      
      // Forma
      rounded ? 'rounded-full' : 'rounded-md',
      
      // Interactividad
      onClick && 'cursor-pointer',
      
      // Animaciones
      pulse && 'animate-pulse',
      
      // Clases personalizadas
      className
    );
    
    // =======================================================
    // RENDER
    // =======================================================
    
    if (dot) {
      return (
        <div
          ref={ref}
          className={cn(
            'w-2 h-2 rounded-full',
            badgeVariants.variant[variant].split(' ')[0], // Solo el color de fondo
            pulse && 'animate-pulse',
            className
          )}
          {...props}
        />
      );
    }
    
    return (
      <div
        ref={ref}
        className={badgeClasses}
        onClick={onClick ? handleClick : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        {...props}
      >
        {/* Icono izquierdo */}
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">
            {icon}
          </span>
        )}
        
        {/* Contenido principal */}
        <span className="truncate">
          {displayCount !== null ? displayCount : children}
        </span>
        
        {/* Icono derecho */}
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">
            {icon}
          </span>
        )}
        
        {/* Botón de eliminar */}
        {removable && (
          <button
            type="button"
            onClick={handleRemove}
            className="flex-shrink-0 ml-1 p-0.5 rounded-full hover:bg-black hover:bg-opacity-20 transition-colors"
            aria-label="Eliminar"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

// =======================================================
// COMPONENTES ESPECIALIZADOS
// =======================================================

/**
 * Badge de estado para documentos SUNAT
 */
export interface PropiedadesBadgeSUNAT {
  estado: 'borrador' | 'emitido' | 'enviado' | 'aceptado' | 'rechazado' | 'anulado';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const BadgeSUNAT: React.FC<PropiedadesBadgeSUNAT> = ({
  estado,
  size = 'sm',
  className,
}) => {
  const configuracionEstados = {
    borrador: {
      variant: 'outline' as const,
      label: 'Borrador',
      color: 'text-gray-600 border-gray-300',
    },
    emitido: {
      variant: 'info' as const,
      label: 'Emitido',
      color: 'bg-blue-500 text-white',
    },
    enviado: {
      variant: 'warning' as const,
      label: 'Enviado',
      color: 'bg-yellow-500 text-white',
    },
    aceptado: {
      variant: 'success' as const,
      label: 'Aceptado',
      color: 'bg-green-500 text-white',
    },
    rechazado: {
      variant: 'error' as const,
      label: 'Rechazado',
      color: 'bg-red-500 text-white',
    },
    anulado: {
      variant: 'secondary' as const,
      label: 'Anulado',
      color: 'bg-gray-400 text-white',
    },
  };
  
  const config = configuracionEstados[estado];
  
  return (
    <Badge
      variant={config.variant}
      size={size}
      className={cn(config.color, className)}
    >
      {config.label}
    </Badge>
  );
};

/**
 * Badge para roles de usuario
 */
export interface PropiedadesBadgeRol {
  rol: 'administrador' | 'contador' | 'vendedor' | 'cliente';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const BadgeRol: React.FC<PropiedadesBadgeRol> = ({
  rol,
  size = 'sm',
  className,
}) => {
  const configuracionRoles = {
    administrador: {
      label: 'Administrador',
      color: 'bg-purple-500 text-white',
    },
    contador: {
      label: 'Contador',
      color: 'bg-green-500 text-white',
    },
    vendedor: {
      label: 'Vendedor',
      color: 'bg-blue-500 text-white',
    },
    cliente: {
      label: 'Cliente',
      color: 'bg-gray-500 text-white',
    },
  };
  
  const config = configuracionRoles[rol];
  
  return (
    <Badge
      size={size}
      className={cn(config.color, className)}
    >
      {config.label}
    </Badge>
  );
};

/**
 * Badge para estados de pago
 */
export interface PropiedadesBadgePago {
  estado: 'pendiente' | 'pagado' | 'vencido' | 'parcial';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const BadgePago: React.FC<PropiedadesBadgePago> = ({
  estado,
  size = 'sm',
  className,
}) => {
  const configuracionPagos = {
    pendiente: {
      variant: 'warning' as const,
      label: 'Pendiente',
    },
    pagado: {
      variant: 'success' as const,
      label: 'Pagado',
    },
    vencido: {
      variant: 'error' as const,
      label: 'Vencido',
    },
    parcial: {
      variant: 'info' as const,
      label: 'Parcial',
    },
  };
  
  const config = configuracionPagos[estado];
  
  return (
    <Badge
      variant={config.variant}
      size={size}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

/**
 * Badge de notificación con contador
 */
export interface PropiedadesBadgeNotificacion {
  count: number;
  maxCount?: number;
  showZero?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'warning' | 'info';
  className?: string;
  pulse?: boolean;
}

export const BadgeNotificacion: React.FC<PropiedadesBadgeNotificacion> = ({
  count,
  maxCount = 99,
  showZero = false,
  size = 'xs',
  variant = 'error',
  className,
  pulse = false,
}) => {
  if (count === 0 && !showZero) return null;
  
  return (
    <Badge
      variant={variant}
      size={size}
      count={count}
      maxCount={maxCount}
      showZero={showZero}
      pulse={pulse}
      className={cn('absolute -top-1 -right-1', className)}
    />
  );
};

/**
 * Badge con punto indicador
 */
export interface PropiedadesBadgePunto {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  pulse?: boolean;
  className?: string;
}

export const BadgePunto: React.FC<PropiedadesBadgePunto> = ({
  variant = 'default',
  pulse = false,
  className,
}) => (
  <Badge
    variant={variant}
    dot
    pulse={pulse}
    className={className}
  />
);

/**
 * Badge para tipos de documento
 */
export interface PropiedadesBadgeDocumento {
  tipo: 'factura' | 'boleta' | 'nota_credito' | 'nota_debito';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const BadgeDocumento: React.FC<PropiedadesBadgeDocumento> = ({
  tipo,
  size = 'sm',
  className,
}) => {
  const configuracionDocumentos = {
    factura: {
      label: 'Factura',
      color: 'bg-blue-500 text-white',
    },
    boleta: {
      label: 'Boleta',
      color: 'bg-green-500 text-white',
    },
    nota_credito: {
      label: 'N. Crédito',
      color: 'bg-orange-500 text-white',
    },
    nota_debito: {
      label: 'N. Débito',
      color: 'bg-red-500 text-white',
    },
  };
  
  const config = configuracionDocumentos[tipo];
  
  return (
    <Badge
      size={size}
      className={cn(config.color, className)}
    >
      {config.label}
    </Badge>
  );
};

/**
 * Badge para nivel de stock
 */
export interface PropiedadesBadgeStock {
  nivel: 'alto' | 'medio' | 'bajo' | 'critico' | 'agotado';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const BadgeStock: React.FC<PropiedadesBadgeStock> = ({
  nivel,
  size = 'sm',
  className,
}) => {
  const configuracionStock = {
    alto: {
      variant: 'success' as const,
      label: 'Stock Alto',
    },
    medio: {
      variant: 'info' as const,
      label: 'Stock Medio',
    },
    bajo: {
      variant: 'warning' as const,
      label: 'Stock Bajo',
    },
    critico: {
      variant: 'error' as const,
      label: 'Stock Crítico',
      pulse: true,
    },
    agotado: {
      variant: 'secondary' as const,
      label: 'Agotado',
    },
  };
  
  const config = configuracionStock[nivel];
  
  return (
    <Badge
      variant={config.variant}
      size={size}
      pulse={config.pulse}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

// =======================================================
// GRUPO DE BADGES
// =======================================================

/**
 * Contenedor para agrupar múltiples badges
 */
export interface PropiedadesGrupoBadges {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
}

export const GrupoBadges: React.FC<PropiedadesGrupoBadges> = ({
  children,
  className,
  spacing = 'sm',
  wrap = true,
}) => {
  const spacingClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3',
  };
  
  return (
    <div
      className={cn(
        'flex items-center',
        spacingClasses[spacing],
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default Badge;