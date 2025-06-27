/**
 * Card Component - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente base de tarjeta con header, content y footer
 */

import React from 'react';
import { cn } from '../../utils/cn';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesCard extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  clickable?: boolean;
  loading?: boolean;
  seleccionada?: boolean;
}

export interface PropiedadesCardHeader extends React.HTMLAttributes<HTMLDivElement> {
  actions?: React.ReactNode;
}

export interface PropiedadesCardContent extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export interface PropiedadesCardFooter extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between';
}

export interface PropiedadesCardTitle extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface PropiedadesCardDescription extends React.HTMLAttributes<HTMLParagraphElement> {}

// =======================================================
// VARIANTES DE ESTILO
// =======================================================

const cardVariants = {
  variant: {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white border border-gray-200 shadow-md',
    outline: 'bg-white border-2 border-gray-300',
    ghost: 'bg-transparent',
  },
  padding: {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
};

// =======================================================
// COMPONENTE PRINCIPAL - CARD
// =======================================================

const Card = React.forwardRef<HTMLDivElement, PropiedadesCard>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      clickable = false,
      loading = false,
      seleccionada = false,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const clases = cn(
      'rounded-lg transition-all duration-200 relative overflow-hidden',
      cardVariants.variant[variant],
      cardVariants.padding[padding],
      clickable && [
        'cursor-pointer hover:shadow-md transform hover:-translate-y-0.5',
        'active:translate-y-0 active:shadow-sm',
      ],
      seleccionada && 'ring-2 ring-blue-500 border-blue-300',
      loading && 'pointer-events-none',
      className
    );

    return (
      <div
        ref={ref}
        className={clases}
        onClick={clickable ? onClick : undefined}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        )}
        
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// =======================================================
// COMPONENTE CARD HEADER
// =======================================================

const CardHeader = React.forwardRef<HTMLDivElement, PropiedadesCardHeader>(
  ({ className, actions, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between space-y-1.5 pb-4',
        !actions && 'flex-col items-start space-y-1.5',
        className
      )}
      {...props}
    >
      <div className="flex-1 space-y-1">
        {children}
      </div>
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

// =======================================================
// COMPONENTE CARD TITLE
// =======================================================

const CardTitle = React.forwardRef<HTMLHeadingElement, PropiedadesCardTitle>(
  ({ className, level = 3, children, ...props }, ref) => {
    const Component = `h${level}` as const;
    
    const clases = cn(
      'font-semibold leading-none tracking-tight',
      {
        1: 'text-3xl',
        2: 'text-2xl',
        3: 'text-xl',
        4: 'text-lg',
        5: 'text-base',
        6: 'text-sm',
      }[level],
      className
    );

    return (
      <Component ref={ref} className={clases} {...props}>
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// =======================================================
// COMPONENTE CARD DESCRIPTION
// =======================================================

const CardDescription = React.forwardRef<HTMLParagraphElement, PropiedadesCardDescription>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

// =======================================================
// COMPONENTE CARD CONTENT
// =======================================================

const CardContent = React.forwardRef<HTMLDivElement, PropiedadesCardContent>(
  ({ className, noPadding = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(!noPadding && 'pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

// =======================================================
// COMPONENTE CARD FOOTER
// =======================================================

const CardFooter = React.forwardRef<HTMLDivElement, PropiedadesCardFooter>(
  ({ className, justify = 'start', children, ...props }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center pt-4',
          justifyClasses[justify],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// =======================================================
// COMPONENTES ESPECIALIZADOS PARA POS
// =======================================================

/**
 * Card para productos en el catálogo
 */
export interface PropiedadesCardProducto extends PropiedadesCard {
  producto: {
    id: number;
    nombre: string;
    precio: number;
    stock?: number;
    imagen?: string;
  };
  onAgregarCarrito?: (productId: number) => void;
  onVerDetalle?: (productId: number) => void;
}

export const CardProducto = React.forwardRef<HTMLDivElement, PropiedadesCardProducto>(
  ({ producto, onAgregarCarrito, onVerDetalle, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant="default"
        padding="sm"
        clickable={!!onVerDetalle}
        className={cn('group hover:shadow-lg transition-all', className)}
        onClick={() => onVerDetalle?.(producto.id)}
        {...props}
      >
        {/* Imagen del producto */}
        {producto.imagen && (
          <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 mb-3">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform"
            />
          </div>
        )}

        {/* Información del producto */}
        <CardContent noPadding>
          <CardTitle level={4} className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
            {producto.nombre}
          </CardTitle>
          
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-blue-600">
              S/ {producto.precio.toFixed(2)}
            </p>
            
            {producto.stock !== undefined && (
              <span className={cn(
                'text-xs px-2 py-1 rounded-full',
                producto.stock > 10 
                  ? 'bg-green-100 text-green-800'
                  : producto.stock > 0
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              )}>
                Stock: {producto.stock}
              </span>
            )}
          </div>
        </CardContent>

        {/* Botón agregar */}
        {onAgregarCarrito && (
          <CardFooter className="pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAgregarCarrito(producto.id);
              }}
              className="w-full bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              disabled={producto.stock === 0}
            >
              {producto.stock === 0 ? 'Sin Stock' : 'Agregar'}
            </button>
          </CardFooter>
        )}
      </Card>
    );
  }
);

CardProducto.displayName = 'CardProducto';

/**
 * Card para clientes
 */
export interface PropiedadesCardCliente extends PropiedadesCard {
  cliente: {
    id: number;
    nombre: string;
    documento: string;
    tipo_documento: string;
    direccion?: string;
  };
  onSeleccionar?: (clienteId: number) => void;
}

export const CardCliente = React.forwardRef<HTMLDivElement, PropiedadesCardCliente>(
  ({ cliente, onSeleccionar, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant="outline"
        padding="md"
        clickable={!!onSeleccionar}
        className={cn('hover:border-blue-300', className)}
        onClick={() => onSeleccionar?.(cliente.id)}
        {...props}
      >
        <CardContent noPadding>
          <CardTitle level={4} className="text-base font-semibold mb-2">
            {cliente.nombre}
          </CardTitle>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">{cliente.tipo_documento}:</span> {cliente.documento}
            </p>
            {cliente.direccion && (
              <p className="line-clamp-2">{cliente.direccion}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

CardCliente.displayName = 'CardCliente';

/**
 * Card para estadísticas del dashboard
 */
export interface PropiedadesCardEstadistica extends PropiedadesCard {
  titulo: string;
  valor: string | number;
  cambio?: {
    valor: number;
    tipo: 'incremento' | 'decremento';
  };
  icono?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export const CardEstadistica = React.forwardRef<HTMLDivElement, PropiedadesCardEstadistica>(
  ({ titulo, valor, cambio, icono, color = 'blue', className, ...props }, ref) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      red: 'text-red-600 bg-red-50',
      yellow: 'text-yellow-600 bg-yellow-50',
      purple: 'text-purple-600 bg-purple-50',
    };

    return (
      <Card
        ref={ref}
        variant="default"
        padding="lg"
        className={cn('text-center', className)}
        {...props}
      >
        <CardContent noPadding>
          {icono && (
            <div className={cn(
              'inline-flex p-3 rounded-full mb-4',
              colorClasses[color]
            )}>
              {icono}
            </div>
          )}
          
          <CardTitle level={2} className="text-2xl font-bold mb-2">
            {valor}
          </CardTitle>
          
          <CardDescription className="text-gray-600 mb-2">
            {titulo}
          </CardDescription>
          
          {cambio && (
            <div className={cn(
              'inline-flex items-center text-sm font-medium',
              cambio.tipo === 'incremento' ? 'text-green-600' : 'text-red-600'
            )}>
              <span className="mr-1">
                {cambio.tipo === 'incremento' ? '↑' : '↓'}
              </span>
              {Math.abs(cambio.valor)}%
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

CardEstadistica.displayName = 'CardEstadistica';

// =======================================================
// EXPORTACIONES
// =======================================================

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};