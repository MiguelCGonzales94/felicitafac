/**
 * Hook useFormulario - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Hook genérico para manejo de formularios con validaciones
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNotificaciones } from '../componentes/comunes/Notificaciones';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

export interface ReglasValidacion {
  [campo: string]: {
    requerido?: boolean;
    minLength?: number;
    maxLength?: number;
    patron?: RegExp;
    min?: number;
    max?: number;
    personalizada?: (valor: any) => string | null;
    mensaje?: string;
  };
}

export interface ErroresFormulario {
  [campo: string]: string;
}

export interface ConfiguracionFormulario {
  validarEnTiempoReal?: boolean;
  validarAlEnfocar?: boolean;
  validarAlPerderFoco?: boolean;
  mostrarErroresInmediatamente?: boolean;
  resetearDespuesDeEnvio?: boolean;
  confirmarSalidaSinGuardar?: boolean;
  autocompletarCampos?: boolean;
  formatearCamposAutomatico?: boolean;
}

export interface EstadoFormulario<T = any> {
  valores: T;
  errores: ErroresFormulario;
  tocados: Record<string, boolean>;
  enviando: boolean;
  valido: boolean;
  sucio: boolean;
  inicializado: boolean;
}

export interface EventosCampo {
  onChange: (valor: any) => void;
  onBlur: () => void;
  onFocus: () => void;
}

export interface MetodosCampo {
  obtenerValor: (campo: string) => any;
  establecerValor: (campo: string, valor: any) => void;
  obtenerError: (campo: string) => string | null;
  tieneError: (campo: string) => boolean;
  estaVacio: (campo: string) => boolean;
  estaTocado: (campo: string) => boolean;
  limpiarError: (campo: string) => void;
  establecerError: (campo: string, error: string) => void;
}

// =======================================================
// HOOK PRINCIPAL
// =======================================================

export const useFormulario = <T extends Record<string, any>>(
  valoresIniciales: T,
  reglasValidacion?: ReglasValidacion,
  configuracion?: ConfiguracionFormulario
) => {
  // =======================================================
  // CONFIGURACIÓN POR DEFECTO
  // =======================================================

  const config: ConfiguracionFormulario = {
    validarEnTiempoReal: false,
    validarAlEnfocar: false,
    validarAlPerderFoco: true,
    mostrarErroresInmediatamente: false,
    resetearDespuesDeEnvio: false,
    confirmarSalidaSinGuardar: true,
    autocompletarCampos: false,
    formatearCamposAutomatico: true,
    ...configuracion,
  };

  // =======================================================
  // ESTADO LOCAL
  // =======================================================

  const [estado, setEstado] = useState<EstadoFormulario<T>>({
    valores: { ...valoresIniciales },
    errores: {},
    tocados: {},
    enviando: false,
    valido: true,
    sucio: false,
    inicializado: true,
  });

  // =======================================================
  // REFS
  // =======================================================

  const valoresInicialesRef = useRef<T>(valoresIniciales);
  const configuracionRef = useRef<ConfiguracionFormulario>(config);
  const reglasValidacionRef = useRef<ReglasValidacion | undefined>(reglasValidacion);

  // =======================================================
  // HOOKS EXTERNOS
  // =======================================================

  const { mostrarError, mostrarAdvertencia } = useNotificaciones();

  // =======================================================
  // EFECTOS
  // =======================================================

  // Detectar cambios y marcar como sucio
  useEffect(() => {
    const esSucio = Object.keys(estado.valores).some(
      key => estado.valores[key] !== valoresInicialesRef.current[key]
    );

    if (esSucio !== estado.sucio) {
      setEstado(prev => ({ ...prev, sucio: esSucio }));
    }
  }, [estado.valores, estado.sucio]);

  // Validar en tiempo real si está habilitado
  useEffect(() => {
    if (configuracionRef.current.validarEnTiempoReal && estado.sucio) {
      const errores = validarTodosLosCampos(estado.valores);
      const valido = Object.keys(errores).length === 0;

      if (JSON.stringify(errores) !== JSON.stringify(estado.errores) || valido !== estado.valido) {
        setEstado(prev => ({
          ...prev,
          errores,
          valido,
        }));
      }
    }
  }, [estado.valores, estado.sucio, estado.errores, estado.valido]);

  // Confirmar salida sin guardar
  useEffect(() => {
    if (!configuracionRef.current.confirmarSalidaSinGuardar) return;

    const manejarAntesDeSalir = (event: BeforeUnloadEvent) => {
      if (estado.sucio && !estado.enviando) {
        event.preventDefault();
        event.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
      }
    };

    window.addEventListener('beforeunload', manejarAntesDeSalir);

    return () => {
      window.removeEventListener('beforeunload', manejarAntesDeSalir);
    };
  }, [estado.sucio, estado.enviando]);

  // =======================================================
  // FUNCIONES DE VALIDACIÓN
  // =======================================================

  const validarCampo = useCallback((campo: string, valor: any): string | null => {
    if (!reglasValidacionRef.current?.[campo]) return null;

    const reglas = reglasValidacionRef.current[campo];

    // Validación de requerido
    if (reglas.requerido && (valor === null || valor === undefined || valor === '')) {
      return reglas.mensaje || `${campo} es requerido`;
    }

    // Si el campo está vacío y no es requerido, no validar el resto
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }

    // Validación de longitud mínima
    if (reglas.minLength && typeof valor === 'string' && valor.length < reglas.minLength) {
      return reglas.mensaje || `${campo} debe tener al menos ${reglas.minLength} caracteres`;
    }

    // Validación de longitud máxima
    if (reglas.maxLength && typeof valor === 'string' && valor.length > reglas.maxLength) {
      return reglas.mensaje || `${campo} no puede exceder ${reglas.maxLength} caracteres`;
    }

    // Validación de valor mínimo
    if (reglas.min !== undefined && typeof valor === 'number' && valor < reglas.min) {
      return reglas.mensaje || `${campo} debe ser mayor o igual a ${reglas.min}`;
    }

    // Validación de valor máximo
    if (reglas.max !== undefined && typeof valor === 'number' && valor > reglas.max) {
      return reglas.mensaje || `${campo} debe ser menor o igual a ${reglas.max}`;
    }

    // Validación de patrón
    if (reglas.patron && typeof valor === 'string' && !reglas.patron.test(valor)) {
      return reglas.mensaje || `${campo} no tiene el formato correcto`;
    }

    // Validación personalizada
    if (reglas.personalizada) {
      return reglas.personalizada(valor);
    }

    return null;
  }, []);

  const validarTodosLosCampos = useCallback((valores: T): ErroresFormulario => {
    const errores: ErroresFormulario = {};

    Object.keys(valores).forEach(campo => {
      const error = validarCampo(campo, valores[campo]);
      if (error) {
        errores[campo] = error;
      }
    });

    return errores;
  }, [validarCampo]);

  // =======================================================
  // FUNCIONES DE FORMATEO
  // =======================================================

  const formatearValor = useCallback((campo: string, valor: any): any => {
    if (!configuracionRef.current.formatearCamposAutomatico) return valor;

    // Formateo específico según el tipo de campo
    switch (campo.toLowerCase()) {
      case 'email':
        return typeof valor === 'string' ? valor.toLowerCase().trim() : valor;
        
      case 'telefono':
      case 'celular':
        // Remover caracteres no numéricos excepto + al inicio
        if (typeof valor === 'string') {
          return valor.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
        }
        return valor;
        
      case 'ruc':
      case 'dni':
      case 'numero_documento':
        // Solo números
        return typeof valor === 'string' ? valor.replace(/\D/g, '') : valor;
        
      default:
        // Trim para strings por defecto
        return typeof valor === 'string' ? valor.trim() : valor;
    }
  }, []);

  // =======================================================
  // FUNCIONES PRINCIPALES
  // =======================================================

  const establecerValor = useCallback((campo: string, valor: any) => {
    const valorFormateado = formatearValor(campo, valor);

    setEstado(prev => {
      const nuevosValores = {
        ...prev.valores,
        [campo]: valorFormateado,
      };

      let nuevosErrores = prev.errores;
      let nuevoValido = prev.valido;

      // Validar el campo si está habilitado en tiempo real o si ya está tocado
      if (configuracionRef.current.validarEnTiempoReal || prev.tocados[campo]) {
        const error = validarCampo(campo, valorFormateado);
        
        if (error) {
          nuevosErrores = { ...prev.errores, [campo]: error };
        } else {
          const { [campo]: _, ...restoErrores } = prev.errores;
          nuevosErrores = restoErrores;
        }

        nuevoValido = Object.keys(nuevosErrores).length === 0;
      }

      return {
        ...prev,
        valores: nuevosValores,
        errores: nuevosErrores,
        valido: nuevoValido,
      };
    });
  }, [formatearValor, validarCampo]);

  const establecerValores = useCallback((nuevosValores: Partial<T>) => {
    setEstado(prev => {
      const valoresActualizados = {
        ...prev.valores,
        ...nuevosValores,
      };

      // Formatear todos los valores nuevos
      Object.keys(nuevosValores).forEach(campo => {
        if (nuevosValores[campo] !== undefined) {
          valoresActualizados[campo] = formatearValor(campo, nuevosValores[campo]);
        }
      });

      let nuevosErrores = prev.errores;
      let nuevoValido = prev.valido;

      // Revalidar si es necesario
      if (configuracionRef.current.validarEnTiempoReal) {
        nuevosErrores = validarTodosLosCampos(valoresActualizados);
        nuevoValido = Object.keys(nuevosErrores).length === 0;
      }

      return {
        ...prev,
        valores: valoresActualizados,
        errores: nuevosErrores,
        valido: nuevoValido,
      };
    });
  }, [formatearValor, validarTodosLosCampos]);

  const marcarCampoComoTocado = useCallback((campo: string) => {
    setEstado(prev => ({
      ...prev,
      tocados: {
        ...prev.tocados,
        [campo]: true,
      },
    }));
  }, []);

  const establecerError = useCallback((campo: string, error: string) => {
    setEstado(prev => ({
      ...prev,
      errores: {
        ...prev.errores,
        [campo]: error,
      },
      valido: false,
    }));
  }, []);

  const limpiarError = useCallback((campo: string) => {
    setEstado(prev => {
      const { [campo]: _, ...restoErrores } = prev.errores;
      return {
        ...prev,
        errores: restoErrores,
        valido: Object.keys(restoErrores).length === 0,
      };
    });
  }, []);

  const validarFormulario = useCallback((): boolean => {
    const errores = validarTodosLosCampos(estado.valores);
    const valido = Object.keys(errores).length === 0;

    setEstado(prev => ({
      ...prev,
      errores,
      valido,
      tocados: Object.keys(prev.valores).reduce((acc, campo) => {
        acc[campo] = true;
        return acc;
      }, {} as Record<string, boolean>),
    }));

    if (!valido && configuracionRef.current.mostrarErroresInmediatamente) {
      const primerError = Object.values(errores)[0];
      mostrarError('Formulario inválido', primerError);
    }

    return valido;
  }, [estado.valores, validarTodosLosCampos, mostrarError]);

  const resetearFormulario = useCallback((nuevosValoresIniciales?: Partial<T>) => {
    const valoresParaResetear = nuevosValoresIniciales 
      ? { ...valoresInicialesRef.current, ...nuevosValoresIniciales }
      : valoresInicialesRef.current;

    setEstado({
      valores: { ...valoresParaResetear },
      errores: {},
      tocados: {},
      enviando: false,
      valido: true,
      sucio: false,
      inicializado: true,
    });

    // Actualizar valores iniciales si se proporcionaron nuevos
    if (nuevosValoresIniciales) {
      valoresInicialesRef.current = { ...valoresInicialesRef.current, ...nuevosValoresIniciales };
    }
  }, []);

  const manejarEnvio = useCallback(async (
    onSubmit: (valores: T) => Promise<void> | void,
    validarAntes: boolean = true
  ) => {
    if (validarAntes && !validarFormulario()) {
      return false;
    }

    setEstado(prev => ({ ...prev, enviando: true }));

    try {
      await onSubmit(estado.valores);
      
      if (configuracionRef.current.resetearDespuesDeEnvio) {
        resetearFormulario();
      } else {
        setEstado(prev => ({ ...prev, sucio: false }));
      }
      
      return true;
    } catch (error: any) {
      console.error('Error al enviar formulario:', error);
      mostrarError('Error al enviar', error.message || 'Ocurrió un error inesperado');
      return false;
    } finally {
      setEstado(prev => ({ ...prev, enviando: false }));
    }
  }, [estado.valores, validarFormulario, resetearFormulario, mostrarError]);

  // =======================================================
  // FUNCIONES DE EVENTOS
  // =======================================================

  const crearEventosCampo = useCallback((campo: string): EventosCampo => {
    return {
      onChange: (valor: any) => establecerValor(campo, valor),
      
      onBlur: () => {
        marcarCampoComoTocado(campo);
        
        if (configuracionRef.current.validarAlPerderFoco) {
          const error = validarCampo(campo, estado.valores[campo]);
          if (error) {
            establecerError(campo, error);
          } else {
            limpiarError(campo);
          }
        }
      },
      
      onFocus: () => {
        if (configuracionRef.current.validarAlEnfocar) {
          const error = validarCampo(campo, estado.valores[campo]);
          if (error) {
            establecerError(campo, error);
          }
        }
      },
    };
  }, [estado.valores, establecerValor, marcarCampoComoTocado, validarCampo, establecerError, limpiarError]);

  // =======================================================
  // MÉTODOS DE CAMPO
  // =======================================================

  const metodosCampo: MetodosCampo = useMemo(() => ({
    obtenerValor: (campo: string) => estado.valores[campo],
    
    establecerValor: (campo: string, valor: any) => establecerValor(campo, valor),
    
    obtenerError: (campo: string) => estado.errores[campo] || null,
    
    tieneError: (campo: string) => !!estado.errores[campo],
    
    estaVacio: (campo: string) => {
      const valor = estado.valores[campo];
      return valor === null || valor === undefined || valor === '';
    },
    
    estaTocado: (campo: string) => !!estado.tocados[campo],
    
    limpiarError: (campo: string) => limpiarError(campo),
    
    establecerError: (campo: string, error: string) => establecerError(campo, error),
  }), [estado.valores, estado.errores, estado.tocados, establecerValor, limpiarError, establecerError]);

  // =======================================================
  // FUNCIONES DE UTILIDAD
  // =======================================================

  const obtenerCamposConErrores = useCallback((): string[] => {
    return Object.keys(estado.errores);
  }, [estado.errores]);

  const obtenerCamposTocados = useCallback((): string[] => {
    return Object.keys(estado.tocados).filter(campo => estado.tocados[campo]);
  }, [estado.tocados]);

  const hayErroresVisibles = useCallback((): boolean => {
    return Object.keys(estado.errores).some(campo => estado.tocados[campo] || configuracionRef.current.mostrarErroresInmediatamente);
  }, [estado.errores, estado.tocados]);

  const puedeEnviar = useCallback((): boolean => {
    return estado.valido && !estado.enviando && estado.sucio;
  }, [estado.valido, estado.enviando, estado.sucio]);

  const confirmarSalida = useCallback((): boolean => {
    if (!estado.sucio) return true;
    
    return window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?');
  }, [estado.sucio]);

  // =======================================================
  // VALORES COMPUTADOS
  // =======================================================

  const resumen = useMemo(() => ({
    totalCampos: Object.keys(estado.valores).length,
    camposConErrores: Object.keys(estado.errores).length,
    camposTocados: Object.keys(estado.tocados).filter(campo => estado.tocados[campo]).length,
    porcentajeCompletado: Math.round(
      (Object.keys(estado.valores).filter(campo => {
        const valor = estado.valores[campo];
        return valor !== null && valor !== undefined && valor !== '';
      }).length / Object.keys(estado.valores).length) * 100
    ),
  }), [estado.valores, estado.errores, estado.tocados]);

  // =======================================================
  // RETURN DEL HOOK
  // =======================================================

  return {
    // Estado del formulario
    valores: estado.valores,
    errores: estado.errores,
    tocados: estado.tocados,
    enviando: estado.enviando,
    valido: estado.valido,
    sucio: estado.sucio,
    inicializado: estado.inicializado,

    // Funciones principales
    establecerValor,
    establecerValores,
    marcarCampoComoTocado,
    establecerError,
    limpiarError,
    validarFormulario,
    resetearFormulario,
    manejarEnvio,

    // Eventos de campo
    crearEventosCampo,

    // Métodos de campo
    campo: metodosCampo,

    // Utilidades
    obtenerCamposConErrores,
    obtenerCamposTocados,
    hayErroresVisibles,
    puedeEnviar,
    confirmarSalida,

    // Información de resumen
    resumen,
  };
};

export default useFormulario;