/**
 * Paginación Personalizada - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente de paginación avanzado integrado con tabla y filtros
 */

import React, { useMemo, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  MoreHorizontal, Info, Download, RefreshCw
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Badge } from '../ui/bagde';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { formatearNumero } from '../../utils/formateo';
import { MetadatasPaginacion, TamañoPagina } from '../../types/common';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesPaginacion {
  // Datos de paginación
  metadatos: MetadatasPaginacion;
  
  // Callbacks
  onPaginaCambio: (pagina: number) => void;
  onTamañoPaginaCambio: (tamaño: TamañoPagina) => void;
  onActualizar?: () => void;
  onExportar?: () => void;
  
  // Configuración visual
  mostrarInformacion?: boolean;
  mostrarSelectorTamaño?: boolean;
  mostrarNavegacionRapida?: boolean;
  mostrarBotones?: boolean;
  mostrarEstadisticas?: boolean;
  mostrarAcciones?: boolean;
  compacto?: boolean;
  
  // Personalización
  tamañosDisponibles?: TamañoPagina[];
  maxPaginasVisibles?: number;
  className?: string;
  
  // Estados
  cargando?: boolean;
  deshabilitado?: boolean;
  
  // Información adicional
  tipoElemento?: string;
  elementosSeleccionados?: number;
  totalFiltrado?: number;
}

// =======================================================
// CONFIGURACIÓN
// =======================================================

const TAMAÑOS_PAGINA_DEFECTO: TamañoPagina[] = [10, 20, 50, 100];

const ETIQUETAS_TAMAÑO: Record<TamañoPagina, string> = {
  10: '10 por página',
  20: '20 por página',
  50: '50 por página',
  100: '100 por página'
};

// =======================================================
// HOOKS AUXILIARES
// =======================================================

const usePaginasVisibles = (
  paginaActual: number,
  totalPaginas: number,
  maxVisibles: number
) => {
  return useMemo(() => {
    if (totalPaginas <= maxVisibles) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }

    const mitad = Math.floor(maxVisibles / 2);
    let inicio = Math.max(1, paginaActual - mitad);
    let fin = Math.min(totalPaginas, inicio + maxVisibles - 1);

    if (fin - inicio < maxVisibles - 1) {
      inicio = Math.max(1, fin - maxVisibles + 1);
    }

    const paginas: (number | 'ellipsis')[] = [];

    // Primera página
    if (inicio > 1) {
      paginas.push(1);
      if (inicio > 2) {
        paginas.push('ellipsis');
      }
    }

    // Páginas del medio
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    // Última página
    if (fin < totalPaginas) {
      if (fin < totalPaginas - 1) {
        paginas.push('ellipsis');
      }
      paginas.push(totalPaginas);
    }

    return paginas;
  }, [paginaActual, totalPaginas, maxVisibles]);
};

// =======================================================
// COMPONENTE INFORMACIÓN
// =======================================================

const InformacionPaginacion: React.FC<{
  metadatos: MetadatasPaginacion;
  tipoElemento: string;
  elementosSeleccionados?: number;
  totalFiltrado?: number;
  compacto?: boolean;
}> = ({ metadatos, tipoElemento, elementosSeleccionados, totalFiltrado, compacto }) => {
  const inicio = (metadatos.pagina_actual - 1) * metadatos.elementos_por_pagina + 1;
  const fin = Math.min(metadatos.pagina_actual * metadatos.elementos_por_pagina, metadatos.total_elementos);

  if (compacto) {
    return (
      <div className="text-sm text-gray-600">
        {inicio}-{fin} de {formatearNumero(metadatos.total_elementos)}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-600">
        Mostrando <span className="font-medium">{formatearNumero(inicio)}</span> a{' '}
        <span className="font-medium">{formatearNumero(fin)}</span> de{' '}
        <span className="font-medium">{formatearNumero(metadatos.total_elementos)}</span> {tipoElemento}
        {totalFiltrado && totalFiltrado !== metadatos.total_elementos && (
          <span> (filtrado de {formatearNumero(totalFiltrado)} total)</span>
        )}
      </div>
      
      {elementosSeleccionados && elementosSeleccionados > 0 && (
        <div className="text-xs text-blue-600">
          {formatearNumero(elementosSeleccionados)} {tipoElemento} seleccionado{elementosSeleccionados !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE ESTADÍSTICAS
// =======================================================

const EstadisticasPaginacion: React.FC<{
  metadatos: MetadatasPaginacion;
  tipoElemento: string;
}> = ({ metadatos, tipoElemento }) => {
  const porcentajeProgreso = (metadatos.pagina_actual / metadatos.total_paginas) * 100;
  
  return (
    <div className="flex items-center space-x-4 text-xs text-gray-500">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-1">
              <Info className="h-3 w-3" />
              <span>Página {metadatos.pagina_actual} de {metadatos.total_paginas}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div>Progreso: {porcentajeProgreso.toFixed(1)}%</div>
              <div>Elementos por página: {metadatos.elementos_por_pagina}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${porcentajeProgreso}%` }}
        />
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE NAVEGACIÓN RÁPIDA
// =======================================================

const NavegacionRapida: React.FC<{
  paginaActual: number;
  totalPaginas: number;
  onPaginaCambio: (pagina: number) => void;
  deshabilitado?: boolean;
}> = ({ paginaActual, totalPaginas, onPaginaCambio, deshabilitado }) => {
  const [paginaInput, setPaginaInput] = React.useState('');

  const manejarNavegacion = () => {
    const pagina = parseInt(paginaInput);
    if (pagina >= 1 && pagina <= totalPaginas) {
      onPaginaCambio(pagina);
      setPaginaInput('');
    }
  };

  const manejarKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      manejarNavegacion();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Ir a:</span>
      <Input
        type="number"
        min={1}
        max={totalPaginas}
        value={paginaInput}
        onChange={(e) => setPaginaInput(e.target.value)}
        onKeyPress={manejarKeyPress}
        placeholder={String(paginaActual)}
        className="w-16 h-8 text-center text-sm"
        disabled={deshabilitado}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={manejarNavegacion}
        disabled={deshabilitado || !paginaInput}
        className="h-8 px-2"
      >
        Ir
      </Button>
    </div>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const PaginacionPersonalizada: React.FC<PropiedadesPaginacion> = ({
  metadatos,
  onPaginaCambio,
  onTamañoPaginaCambio,
  onActualizar,
  onExportar,
  mostrarInformacion = true,
  mostrarSelectorTamaño = true,
  mostrarNavegacionRapida = false,
  mostrarBotones = true,
  mostrarEstadisticas = false,
  mostrarAcciones = false,
  compacto = false,
  tamañosDisponibles = TAMAÑOS_PAGINA_DEFECTO,
  maxPaginasVisibles = 7,
  className,
  cargando = false,
  deshabilitado = false,
  tipoElemento = 'elementos',
  elementosSeleccionados,
  totalFiltrado
}) => {
  // Estado para páginas visibles
  const paginasVisibles = usePaginasVisibles(
    metadatos.pagina_actual,
    metadatos.total_paginas,
    maxPaginasVisibles
  );

  // Callbacks memoizados
  const irAPagina = useCallback((pagina: number) => {
    if (pagina >= 1 && pagina <= metadatos.total_paginas && !cargando && !deshabilitado) {
      onPaginaCambio(pagina);
    }
  }, [metadatos.total_paginas, onPaginaCambio, cargando, deshabilitado]);

  const cambiarTamañoPagina = useCallback((tamaño: string) => {
    const nuevoTamaño = parseInt(tamaño) as TamañoPagina;
    if (tamañosDisponibles.includes(nuevoTamaño)) {
      onTamañoPaginaCambio(nuevoTamaño);
    }
  }, [onTamañoPaginaCambio, tamañosDisponibles]);

  // Si no hay elementos, no mostrar paginación
  if (metadatos.total_elementos === 0) {
    return null;
  }

  // Versión compacta
  if (compacto) {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <InformacionPaginacion
          metadatos={metadatos}
          tipoElemento={tipoElemento}
          elementosSeleccionados={elementosSeleccionados}
          totalFiltrado={totalFiltrado}
          compacto
        />
        
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => irAPagina(metadatos.pagina_actual - 1)}
            disabled={!metadatos.tiene_pagina_anterior || cargando || deshabilitado}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-600 px-2">
            {metadatos.pagina_actual} / {metadatos.total_paginas}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => irAPagina(metadatos.pagina_actual + 1)}
            disabled={!metadatos.tiene_pagina_siguiente || cargando || deshabilitado}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Información y estadísticas */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          {mostrarInformacion && (
            <InformacionPaginacion
              metadatos={metadatos}
              tipoElemento={tipoElemento}
              elementosSeleccionados={elementosSeleccionados}
              totalFiltrado={totalFiltrado}
            />
          )}
          
          {mostrarEstadisticas && (
            <EstadisticasPaginacion
              metadatos={metadatos}
              tipoElemento={tipoElemento}
            />
          )}
        </div>

        {/* Acciones */}
        {mostrarAcciones && (
          <div className="flex items-center space-x-2">
            {onActualizar && (
              <Button
                variant="outline"
                size="sm"
                onClick={onActualizar}
                disabled={cargando || deshabilitado}
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", cargando && "animate-spin")} />
                Actualizar
              </Button>
            )}
            
            {onExportar && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportar}
                disabled={cargando || deshabilitado}
              >
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center justify-between">
        {/* Selector de tamaño de página */}
        {mostrarSelectorTamaño && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <Select
              value={String(metadatos.elementos_por_pagina)}
              onValueChange={cambiarTamañoPagina}
              disabled={cargando || deshabilitado}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tamañosDisponibles.map(tamaño => (
                  <SelectItem key={tamaño} value={String(tamaño)}>
                    {ETIQUETAS_TAMAÑO[tamaño]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navegación de páginas */}
        {mostrarBotones && metadatos.total_paginas > 1 && (
          <div className="flex items-center space-x-1">
            {/* Primera página */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => irAPagina(1)}
              disabled={metadatos.pagina_actual === 1 || cargando || deshabilitado}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Página anterior */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => irAPagina(metadatos.pagina_actual - 1)}
              disabled={!metadatos.tiene_pagina_anterior || cargando || deshabilitado}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Páginas numeradas */}
            {paginasVisibles.map((pagina, index) => (
              pagina === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </span>
              ) : (
                <Button
                  key={pagina}
                  variant={pagina === metadatos.pagina_actual ? "default" : "outline"}
                  size="sm"
                  onClick={() => irAPagina(pagina)}
                  disabled={cargando || deshabilitado}
                  className="min-w-[2.5rem]"
                >
                  {pagina}
                </Button>
              )
            ))}

            {/* Página siguiente */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => irAPagina(metadatos.pagina_actual + 1)}
              disabled={!metadatos.tiene_pagina_siguiente || cargando || deshabilitado}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Última página */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => irAPagina(metadatos.total_paginas)}
              disabled={metadatos.pagina_actual === metadatos.total_paginas || cargando || deshabilitado}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Navegación rápida */}
        {mostrarNavegacionRapida && metadatos.total_paginas > 10 && (
          <NavegacionRapida
            paginaActual={metadatos.pagina_actual}
            totalPaginas={metadatos.total_paginas}
            onPaginaCambio={irAPagina}
            deshabilitado={cargando || deshabilitado}
          />
        )}
      </div>
    </div>
  );
};

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default PaginacionPersonalizada;