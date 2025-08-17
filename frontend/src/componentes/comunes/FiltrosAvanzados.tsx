/**
 * Filtros Avanzados - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Sistema completo de filtros dinámicos para tablas y listas
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Filter, X, Plus, Calendar, DollarSign, Hash, Type, 
  ToggleLeft, ToggleRight, ChevronDown, Search, Save, 
  RotateCcw, Download, Upload
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/bagde';
import { Separator } from '../ui/separator';
import { formatearFecha, formatearMoneda } from '../../utils/formateo';
import { debounce } from '../../utils/helpers';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export type TipoFiltro = 
  | 'texto' 
  | 'numero' 
  | 'fecha' 
  | 'rango-fecha' 
  | 'select' 
  | 'multi-select' 
  | 'boolean' 
  | 'rango-numero'
  | 'busqueda';

export type OperadorFiltro = 
  | 'igual' 
  | 'diferente' 
  | 'contiene' 
  | 'no-contiene' 
  | 'empieza-con' 
  | 'termina-con'
  | 'mayor-que' 
  | 'menor-que' 
  | 'mayor-igual' 
  | 'menor-igual'
  | 'entre' 
  | 'no-entre'
  | 'es-nulo' 
  | 'no-es-nulo';

export interface OpcionSelect {
  value: string | number;
  label: string;
  color?: string;
  descripcion?: string;
}

export interface ConfiguracionFiltro {
  id: string;
  campo: string;
  label: string;
  tipo: TipoFiltro;
  operadores?: OperadorFiltro[];
  opciones?: OpcionSelect[];
  placeholder?: string;
  valorDefecto?: any;
  requerido?: boolean;
  habilitado?: boolean;
  visible?: boolean;
  orden?: number;
  categoria?: string;
  dependeDe?: string;
  validacion?: (valor: any) => string | null;
  formateo?: (valor: any) => string;
}

export interface FiltroActivo {
  id: string;
  campo: string;
  operador: OperadorFiltro;
  valor: any;
  valorSecundario?: any; // Para rangos
  label: string;
}

export interface ConfiguracionGuardada {
  id: string;
  nombre: string;
  descripcion?: string;
  filtros: FiltroActivo[];
  esGlobal: boolean;
  fechaCreacion: Date;
  usuarioCreacion?: string;
}

export interface PropiedadesFiltrosAvanzados {
  configuraciones: ConfiguracionFiltro[];
  filtrosActivos: FiltroActivo[];
  onFiltrosChange: (filtros: FiltroActivo[]) => void;
  onConfiguracionGuardada?: (config: ConfiguracionGuardada) => void;
  configuracionesGuardadas?: ConfiguracionGuardada[];
  onConfiguracionCargada?: (config: ConfiguracionGuardada) => void;
  mostrarContadores?: boolean;
  mostrarGuardar?: boolean;
  mostrarCargar?: boolean;
  className?: string;
  compacto?: boolean;
}

// =======================================================
// OPERADORES POR TIPO
// =======================================================

const OPERADORES_POR_TIPO: Record<TipoFiltro, OperadorFiltro[]> = {
  'texto': ['igual', 'diferente', 'contiene', 'no-contiene', 'empieza-con', 'termina-con', 'es-nulo', 'no-es-nulo'],
  'numero': ['igual', 'diferente', 'mayor-que', 'menor-que', 'mayor-igual', 'menor-igual', 'entre', 'es-nulo', 'no-es-nulo'],
  'fecha': ['igual', 'diferente', 'mayor-que', 'menor-que', 'mayor-igual', 'menor-igual', 'entre'],
  'rango-fecha': ['entre'],
  'select': ['igual', 'diferente', 'es-nulo', 'no-es-nulo'],
  'multi-select': ['contiene', 'no-contiene'],
  'boolean': ['igual'],
  'rango-numero': ['entre'],
  'busqueda': ['contiene', 'no-contiene', 'empieza-con', 'termina-con']
};

const LABELS_OPERADORES: Record<OperadorFiltro, string> = {
  'igual': 'Es igual a',
  'diferente': 'Es diferente de',
  'contiene': 'Contiene',
  'no-contiene': 'No contiene',
  'empieza-con': 'Empieza con',
  'termina-con': 'Termina con',
  'mayor-que': 'Mayor que',
  'menor-que': 'Menor que',
  'mayor-igual': 'Mayor o igual a',
  'menor-igual': 'Menor o igual a',
  'entre': 'Entre',
  'no-entre': 'No está entre',
  'es-nulo': 'Está vacío',
  'no-es-nulo': 'No está vacío'
};

// =======================================================
// COMPONENTE PARA EDITAR UN FILTRO
// =======================================================

const EditorFiltro: React.FC<{
  configuracion: ConfiguracionFiltro;
  filtro?: FiltroActivo;
  onGuardar: (filtro: FiltroActivo) => void;
  onCancelar: () => void;
}> = ({ configuracion, filtro, onGuardar, onCancelar }) => {
  const [operador, setOperador] = useState<OperadorFiltro>(
    filtro?.operador || OPERADORES_POR_TIPO[configuracion.tipo][0]
  );
  const [valor, setValor] = useState(filtro?.valor || '');
  const [valorSecundario, setValorSecundario] = useState(filtro?.valorSecundario || '');

  const operadoresDisponibles = configuracion.operadores || OPERADORES_POR_TIPO[configuracion.tipo];
  const requiereValorSecundario = ['entre', 'no-entre'].includes(operador);
  const requiereValor = !['es-nulo', 'no-es-nulo'].includes(operador);

  const manejarGuardar = () => {
    if (requiereValor && !valor) return;
    if (requiereValorSecundario && !valorSecundario) return;

    const nuevoFiltro: FiltroActivo = {
      id: filtro?.id || `${configuracion.id}-${Date.now()}`,
      campo: configuracion.campo,
      operador,
      valor: requiereValor ? valor : null,
      valorSecundario: requiereValorSecundario ? valorSecundario : undefined,
      label: configuracion.label
    };

    onGuardar(nuevoFiltro);
  };

  const renderizarCampoValor = () => {
    if (!requiereValor) return null;

    switch (configuracion.tipo) {
      case 'select':
        return (
          <Select value={valor} onValueChange={setValor}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {configuracion.opciones?.map(opcion => (
                <SelectItem key={opcion.value} value={String(opcion.value)}>
                  <div className="flex items-center space-x-2">
                    {opcion.color && (
                      <div className={`w-3 h-3 rounded-full ${opcion.color}`} />
                    )}
                    <span>{opcion.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multi-select':
        return (
          <div className="space-y-2">
            {configuracion.opciones?.map(opcion => (
              <div key={opcion.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${opcion.value}`}
                  checked={Array.isArray(valor) ? valor.includes(String(opcion.value)) : false}
                  onCheckedChange={(checked) => {
                    const valoresActuales = Array.isArray(valor) ? valor : [];
                    if (checked) {
                      setValor([...valoresActuales, String(opcion.value)]);
                    } else {
                      setValor(valoresActuales.filter(v => v !== String(opcion.value)));
                    }
                  }}
                />
                <Label htmlFor={`option-${opcion.value}`} className="text-sm">
                  {opcion.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <Select value={valor} onValueChange={setValor}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'fecha':
        return (
          <Input
            type="date"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        );

      case 'numero':
        return (
          <Input
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder={configuracion.placeholder}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder={configuracion.placeholder}
          />
        );
    }
  };

  const renderizarCampoValorSecundario = () => {
    if (!requiereValorSecundario) return null;

    switch (configuracion.tipo) {
      case 'fecha':
        return (
          <Input
            type="date"
            value={valorSecundario}
            onChange={(e) => setValorSecundario(e.target.value)}
          />
        );

      case 'numero':
        return (
          <Input
            type="number"
            value={valorSecundario}
            onChange={(e) => setValorSecundario(e.target.value)}
            placeholder="Valor máximo"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={valorSecundario}
            onChange={(e) => setValorSecundario(e.target.value)}
            placeholder="Valor máximo"
          />
        );
    }
  };

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Filtrar por {configuracion.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Operador */}
        <div>
          <Label className="text-xs font-medium text-gray-600">Operador</Label>
          <Select value={operador} onValueChange={(value) => setOperador(value as OperadorFiltro)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {operadoresDisponibles.map(op => (
                <SelectItem key={op} value={op}>
                  {LABELS_OPERADORES[op]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Valor principal */}
        {requiereValor && (
          <div>
            <Label className="text-xs font-medium text-gray-600">Valor</Label>
            <div className="mt-1">
              {renderizarCampoValor()}
            </div>
          </div>
        )}

        {/* Valor secundario (para rangos) */}
        {requiereValorSecundario && (
          <div>
            <Label className="text-xs font-medium text-gray-600">Hasta</Label>
            <div className="mt-1">
              {renderizarCampoValorSecundario()}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" size="sm" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button size="sm" onClick={manejarGuardar}>
            Aplicar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const FiltrosAvanzados: React.FC<PropiedadesFiltrosAvanzados> = ({
  configuraciones,
  filtrosActivos,
  onFiltrosChange,
  onConfiguracionGuardada,
  configuracionesGuardadas = [],
  onConfiguracionCargada,
  mostrarContadores = true,
  mostrarGuardar = true,
  mostrarCargar = true,
  className,
  compacto = false
}) => {
  // Estados
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [editandoFiltro, setEditandoFiltro] = useState<ConfiguracionFiltro | null>(null);
  const [filtroEnEdicion, setFiltroEnEdicion] = useState<FiltroActivo | null>(null);
  const [nombreConfiguracion, setNombreConfiguracion] = useState('');
  const [mostrarGuardarDialog, setMostrarGuardarDialog] = useState(false);

  // Filtros agrupados por categoría
  const configuracionesAgrupadas = useMemo(() => {
    const grupos: Record<string, ConfiguracionFiltro[]> = {};
    configuraciones.forEach(config => {
      const categoria = config.categoria || 'General';
      if (!grupos[categoria]) grupos[categoria] = [];
      grupos[categoria].push(config);
    });
    return grupos;
  }, [configuraciones]);

  // Función para agregar un filtro
  const agregarFiltro = useCallback((filtro: FiltroActivo) => {
    const nuevos = filtrosActivos.filter(f => f.id !== filtro.id);
    nuevos.push(filtro);
    onFiltrosChange(nuevos);
    setEditandoFiltro(null);
    setFiltroEnEdicion(null);
  }, [filtrosActivos, onFiltrosChange]);

  // Función para eliminar un filtro
  const eliminarFiltro = useCallback((id: string) => {
    const nuevos = filtrosActivos.filter(f => f.id !== id);
    onFiltrosChange(nuevos);
  }, [filtrosActivos, onFiltrosChange]);

  // Función para limpiar todos los filtros
  const limpiarFiltros = useCallback(() => {
    onFiltrosChange([]);
  }, [onFiltrosChange]);

  // Función para guardar configuración
  const guardarConfiguracion = useCallback(() => {
    if (!nombreConfiguracion.trim() || filtrosActivos.length === 0) return;

    const nuevaConfiguracion: ConfiguracionGuardada = {
      id: `config-${Date.now()}`,
      nombre: nombreConfiguracion,
      filtros: [...filtrosActivos],
      esGlobal: false,
      fechaCreacion: new Date()
    };

    onConfiguracionGuardada?.(nuevaConfiguracion);
    setNombreConfiguracion('');
    setMostrarGuardarDialog(false);
  }, [nombreConfiguracion, filtrosActivos, onConfiguracionGuardada]);

  // Función para cargar configuración
  const cargarConfiguracion = useCallback((config: ConfiguracionGuardada) => {
    onFiltrosChange(config.filtros);
    onConfiguracionCargada?.(config);
  }, [onFiltrosChange, onConfiguracionCargada]);

  // Renderizar filtro activo como badge
  const renderizarFiltroActivo = (filtro: FiltroActivo) => {
    let textoValor = '';
    
    if (filtro.operador === 'es-nulo') {
      textoValor = 'está vacío';
    } else if (filtro.operador === 'no-es-nulo') {
      textoValor = 'no está vacío';
    } else if (filtro.operador === 'entre' && filtro.valorSecundario) {
      textoValor = `entre ${filtro.valor} y ${filtro.valorSecundario}`;
    } else if (filtro.valor !== null && filtro.valor !== undefined) {
      if (Array.isArray(filtro.valor)) {
        textoValor = filtro.valor.join(', ');
      } else {
        textoValor = String(filtro.valor);
      }
    }

    return (
      <Badge
        key={filtro.id}
        variant="secondary"
        className="flex items-center space-x-1 max-w-xs"
      >
        <span className="truncate">
          {filtro.label}: {textoValor}
        </span>
        <button
          onClick={() => eliminarFiltro(filtro.id)}
          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Barra de control */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Popover open={mostrarPanel} onOpenChange={setMostrarPanel}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {filtrosActivos.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filtrosActivos.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <div className="p-4 border-b">
                <h3 className="font-medium text-sm">Agregar Filtros</h3>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {Object.entries(configuracionesAgrupadas).map(([categoria, configs]) => (
                  <div key={categoria}>
                    <div className="px-4 py-2 bg-gray-50 border-b">
                      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {categoria}
                      </h4>
                    </div>
                    <div className="p-2">
                      {configs.map(config => (
                        <button
                          key={config.id}
                          onClick={() => {
                            setEditandoFiltro(config);
                            setMostrarPanel(false);
                          }}
                          className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded flex items-center justify-between"
                        >
                          <span>{config.label}</span>
                          <Plus className="h-4 w-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {filtrosActivos.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limpiarFiltros}
              className="text-red-600 hover:text-red-700"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Opciones de guardar/cargar */}
        <div className="flex items-center space-x-2">
          {mostrarCargar && configuracionesGuardadas.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" />
                  Cargar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0">
                <div className="p-3 border-b">
                  <h3 className="font-medium text-sm">Configuraciones Guardadas</h3>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {configuracionesGuardadas.map(config => (
                    <button
                      key={config.id}
                      onClick={() => cargarConfiguracion(config)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b"
                    >
                      <div className="text-sm font-medium">{config.nombre}</div>
                      <div className="text-xs text-gray-500">
                        {config.filtros.length} filtro(s) • {formatearFecha(config.fechaCreacion)}
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {mostrarGuardar && filtrosActivos.length > 0 && (
            <Popover open={mostrarGuardarDialog} onOpenChange={setMostrarGuardarDialog}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-3">
                  <h3 className="font-medium text-sm">Guardar Configuración</h3>
                  <Input
                    placeholder="Nombre de la configuración"
                    value={nombreConfiguracion}
                    onChange={(e) => setNombreConfiguracion(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMostrarGuardarDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={guardarConfiguracion}
                      disabled={!nombreConfiguracion.trim()}
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Filtros activos */}
      {filtrosActivos.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {filtrosActivos.map(renderizarFiltroActivo)}
          </div>
          
          {mostrarContadores && (
            <div className="text-xs text-gray-600">
              {filtrosActivos.length} filtro{filtrosActivos.length !== 1 ? 's' : ''} activo{filtrosActivos.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Editor de filtro */}
      {editandoFiltro && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <EditorFiltro
            configuracion={editandoFiltro}
            filtro={filtroEnEdicion}
            onGuardar={agregarFiltro}
            onCancelar={() => {
              setEditandoFiltro(null);
              setFiltroEnEdicion(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default FiltrosAvanzados;