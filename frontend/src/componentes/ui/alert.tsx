/**
 * Alert Component - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente de alerta para mensajes
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-gray-950',
  {
    variants: {
      variant: {
        default: 'bg-white text-gray-950 border-gray-200',
        destructive:
          'border-red-500/50 text-red-900 bg-red-50 [&>svg]:text-red-600',
        warning:
          'border-yellow-500/50 text-yellow-900 bg-yellow-50 [&>svg]:text-yellow-600',
        success:
          'border-green-500/50 text-green-900 bg-green-50 [&>svg]:text-green-600',
        info:
          'border-blue-500/50 text-blue-900 bg-blue-50 [&>svg]:text-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface PropiedadesAlert
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  children: React.ReactNode;
}

export interface PropiedadesAlertTitle extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export interface PropiedadesAlertDescription extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, PropiedadesAlert>(
  ({ className, variant, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, PropiedadesAlertTitle>(
  ({ className, children, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h5>
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, PropiedadesAlertDescription>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    >
      {children}
    </div>
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };