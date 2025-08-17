
import React from 'react';

interface AvatarProps {
  className?: string;
  children: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({ className = '', children }) => {
  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
      {children}
    </div>
  );
};

interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt = '', className = '' }) => {
  if (!src) return null;
  
  return (
    <img 
      src={src} 
      alt={alt}
      className={`aspect-square h-full w-full object-cover ${className}`}
      onError={(e) => {
        // Si la imagen falla al cargar, ocultarla
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

interface AvatarFallbackProps {
  className?: string;
  children: React.ReactNode;
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className = '', children }) => {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium text-sm ${className}`}>
      {children}
    </div>
  );
};