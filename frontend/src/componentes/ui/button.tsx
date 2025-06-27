/**
 * Button Component - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente base de botón con variantes y estados
 */

import React from 'react';
import { cn } from '../../utils/cn.ts';

// =======================================================
// TIPOS Y VARIANTES
// =======================================================

export interface PropiedadesButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  loading?: boolean;
  icono?: React.ReactNode;
  iconoPosicion?: 'left' | 'right';
}

// =======================================================
// VARIANTES DE ESTILO
// =======================================================

const buttonVariants = {
  variant: {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    link: 'text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500',
  },
  size: {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 py-1 text-xs',
    lg: 'h-12 px-6 py-3 text-base',
    icon: 'h-10 w-10 p-0',
  },
};

// =======================================================
// ESTILOS BASE
// =======================================================

const baseClasses = [
  'inline-flex items-center justify-center gap-2',
  'rounded-md font-medium transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
  'relative overflow-hidden',
].join(' ');

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const Button = React.forwardRef<HTMLButtonElement, PropiedadesButton>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      loading = false,
      icono,
      iconoPosicion = 'left',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Combinar clases
    const clases = cn(
      baseClasses,
      buttonVariants.variant[variant],
      buttonVariants.size[size],
      loading && 'cursor-not-allowed',
      className
    );

    // Estado de disabled
    const estaDeshabilitado = disabled || loading;

    // Contenido del botón
    const contenido = (
      <>
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        
        {/* Contenido normal */}
        <div className={cn('flex items-center gap-2', loading && 'opacity-0')}>
          {/* Ícono izquierdo */}
          {icono && iconoPosicion === 'left' && (
            <span className="flex-shrink-0">{icono}</span>
          )}
          
          {/* Texto del botón */}
          {children && <span>{children}</span>}
          
          {/* Ícono derecho */}
          {icono && iconoPosicion === 'right' && (
            <span className="flex-shrink-0">{icono}</span>
          )}
        </div>
      </>
    );

    return (
      <button
        className={clases}
        ref={ref}
        disabled={estaDeshabilitado}
        {...props}
      >
        {contenido}
      </button>
    );
  }
);

Button.displayName = 'Button';

// =======================================================
// COMPONENTES ESPECIALIZADOS
// =======================================================

/**
 * Botón de acción primaria para POS
 */
export const ButtonPrimario = React.forwardRef<HTMLButtonElement, PropiedadesButton>(
  (props, ref) => (
    <Button
      variant="default"
      size="lg"
      ref={ref}
      {...props}
    />
  )
);

ButtonPrimario.displayName = 'ButtonPrimario';

/**
 * Botón de acción secundaria para POS
 */
export const ButtonSecundario = React.forwardRef<HTMLButtonElement, PropiedadesButton>(
  (props, ref) => (
    <Button
      variant="outline"
      size="lg"
      ref={ref}
      {...props}
    />
  )
);

ButtonSecundario.displayName = 'ButtonSecundario';

/**
 * Botón de peligro para acciones destructivas
 */
export const ButtonPeligro = React.forwardRef<HTMLButtonElement, PropiedadesButton>(
  (props, ref) => (
    <Button
      variant="destructive"
      ref={ref}
      {...props}
    />
  )
);

ButtonPeligro.displayName = 'ButtonPeligro';

/**
 * Botón de ícono para acciones rápidas
 */
export const ButtonIcono = React.forwardRef<HTMLButtonElement, PropiedadesButton>(
  ({ icono, ...props }, ref) => (
    <Button
      variant="ghost"
      size="icon"
      ref={ref}
      {...props}
    >
      {icono}
    </Button>
  )
);

ButtonIcono.displayName = 'ButtonIcono';

/**
 * Botón flotante para POS
 */
export const ButtonFlotante = React.forwardRef<HTMLButtonElement, PropiedadesButton>(
  ({ className, ...props }, ref) => (
    <Button
      className={cn(
        'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg',
        'hover:shadow-xl transition-shadow duration-200',
        className
      )}
      size="icon"
      ref={ref}
      {...props}
    />
  )
);

ButtonFlotante.displayName = 'ButtonFlotante';

/**
 * Grupo de botones
 */
export interface PropiedadesButtonGroup {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const ButtonGroup: React.FC<PropiedadesButtonGroup> = ({
  children,
  className,
  orientation = 'horizontal',
}) => {
  const clases = cn(
    'flex',
    orientation === 'horizontal' ? 'flex-row' : 'flex-col',
    '[&>button]:rounded-none',
    '[&>button:first-child]:rounded-l-md',
    '[&>button:last-child]:rounded-r-md',
    orientation === 'vertical' && [
      '[&>button:first-child]:rounded-t-md [&>button:first-child]:rounded-l-none',
      '[&>button:last-child]:rounded-b-md [&>button:last-child]:rounded-r-none',
    ],
    '[&>button:not(:first-child)]:border-l-0',
    orientation === 'vertical' && '[&>button:not(:first-child)]:border-l [&>button:not(:first-child)]:border-t-0',
    className
  );

  return (
    <div className={clases} role="group">
      {children}
    </div>
  );
};



// =======================================================
// HOOKS PERSONALIZADOS
// =======================================================

/**
 * Hook para manejar estado de carga en botones
 */
export const useButtonCarga = (accionAsincrona?: () => Promise<any>) => {
  const [cargando, setCargando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const ejecutar = React.useCallback(async () => {
    if (!accionAsincrona) return;

    setCargando(true);
    setError(null);

    try {
      await accionAsincrona();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  }, [accionAsincrona]);

  return {
    cargando,
    error,
    ejecutar,
    limpiarError: () => setError(null),
  };
};

/**
 * Hook para confirmación de acciones
 */
export const useButtonConfirmacion = () => {
  const [mostrandoConfirmacion, setMostrandoConfirmacion] = React.useState(false);

  const confirmar = React.useCallback((mensaje: string, accion: () => void) => {
    if (window.confirm(mensaje)) {
      accion();
    }
  }, []);

  return {
    mostrandoConfirmacion,
    confirmar,
    setMostrandoConfirmacion,
  };
};

// =======================================================
// EJEMPLOS DE USO
// =======================================================

/**
 * Ejemplo de botón con carga
 */
export const EjemploButtonCarga: React.FC = () => {
  const { cargando, ejecutar } = useButtonCarga(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  return (
    <Button loading={cargando} onClick={ejecutar}>
      Procesar Factura
    </Button>
  );
};

/**
 * Ejemplo de botón con confirmación
 */
export const EjemploButtonConfirmacion: React.FC = () => {
  const { confirmar } = useButtonConfirmacion();

  return (
    <ButtonPeligro
      onClick={() => confirmar(
        '¿Está seguro de eliminar este producto?',
        () => console.log('Producto eliminado')
      )}
    >
      Eliminar Producto
    </ButtonPeligro>
  );
};

export { Button };
export default Button;