/**
 * Botones de Acción - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente para botones principales del POS (Facturar, Boleta, etc.)
 */

import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  Receipt, 
  CreditCard, 
  Calendar, 
  Percent,
  Save,
  Trash2,
  Printer,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button, ButtonPrimario, ButtonSecundario } from '../ui/button';
import { Input, InputMonto } from '../ui/input';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalTitle, ModalConfirmacion } from '../ui/modal';
import { usePuntoDeVenta } from '../../hooks/useFacturacion';
import type { TipoDocumento, TipoPago } from '../../types/factura';
import { formatearMoneda } from '../../utils/formatos';
import { POS_CONFIG, MENSAJES } from '../../utils/constantes';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesBotonesAccion {
  className?: string;
  layout?: 'vertical' | 'horizontal';
  mostrarConfiguracion?: boolean;
  mostrarGuardado?: boolean;
  onFacturaEmitida?: (factura: any) => void;
}

interface ConfiguracionEmision {
  validarStock: boolean;
  imprimirAutomatico: boolean;
  limpiarDespuesEmision: boolean;
  mostrarConfirmacion: boolean;
}

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const BotonesAccion: React.FC<PropiedadesBotonesAccion> = ({
  className,
  layout = 'vertical',
  mostrarConfiguracion = true,
  mostrarGuardado = true,
  onFacturaEmitida,
}) => {
  // Estados locales
  const [modalConfiguracionAbierto, setModalConfiguracionAbierto] = useState(false);
  const [modalDescuentoAbierto, setModalDescuentoAbierto] = useState(false);
  const [modalCreditoAbierto, setModalCreditoAbierto] = useState(false);
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
  const [tipoEmision, setTipoEmision] = useState<TipoDocumento>('factura');
  const [configuracion, setConfiguracion] = useState<ConfiguracionEmision>({
    validarStock: true,
    imprimirAutomatico: false,
    limpiarDespuesEmision: true,
    mostrarConfirmacion: true,
  });

  // Hook del punto de venta
  const {
    estado,
    emitirDocumento,
    cambiarTipoDocumento,
    cambiarTipoPago,
    cambiarDiasCredito,
    cambiarDescuentoGlobal,
    cambiarObservaciones,
    limpiarCarrito,
    guardarTemporal,
    validarParaEmision,
    emitiendoFactura,
    puedeEmitir,
    obtenerResumenCarrito,
  } = usePuntoDeVenta();

  // =======================================================
  // FUNCIONES DE EMISIÓN
  // =======================================================

  const iniciarEmision = async (tipo: TipoDocumento) => {
    setTipoEmision(tipo);
    cambiarTipoDocumento(tipo);

    // Validar antes de proceder
    const validacion = await validarParaEmision({
      validarStock: configuracion.validarStock,
    });

    if (!validacion.valido) {
      alert(`Errores encontrados:\n\n${validacion.errores.join('\n')}`);
      return;
    }

    if (validacion.advertencias.length > 0 && configuracion.mostrarConfirmacion) {
      alert(`Advertencias:\n\n${validacion.advertencias.join('\n')}`);
    }

    // Mostrar confirmación si está habilitada
    if (configuracion.mostrarConfirmacion) {
      setModalConfirmacionAbierto(true);
    } else {
      procederConEmision();
    }
  };

  const procederConEmision = async () => {
    setModalConfirmacionAbierto(false);

    try {
      const resultado = await emitirDocumento({
        validarStock: configuracion.validarStock,
        imprimirAutomatico: configuracion.imprimirAutomatico,
        limpiarDespuesEmision: configuracion.limpiarDespuesEmision,
        mostrarConfirmacion: false, // Ya se mostró antes
      });

      if (resultado.exito) {
        // TODO: Mostrar toast de éxito
        console.log('Documento emitido exitosamente:', resultado.factura);
        onFacturaEmitida?.(resultado.factura);
      } else {
        alert(`Error al emitir documento:\n\n${resultado.errores?.join('\n') || resultado.mensaje}`);
      }
    } catch (error) {
      console.error('Error emitiendo documento:', error);
      alert('Error interno al emitir el documento');
    }
  };

  // =======================================================
  // FUNCIONES DE CONFIGURACIÓN
  // =======================================================

  const aplicarDescuentoGlobal = (descuento: number) => {
    if (descuento >= 0 && descuento <= 100) {
      cambiarDescuentoGlobal(descuento);
      setModalDescuentoAbierto(false);
    }
  };

  const configurarCredito = (dias: number) => {
    if (dias > 0) {
      cambiarTipoPago('credito');
      cambiarDiasCredito(dias);
      setModalCreditoAbierto(false);
    }
  };

  const alternarTipoPago = () => {
    const nuevoTipo: TipoPago = estado.tipoPago === 'contado' ? 'credito' : 'contado';
    cambiarTipoPago(nuevoTipo);
    
    if (nuevoTipo === 'credito' && estado.diasCredito <= 0) {
      setModalCreditoAbierto(true);
    }
  };

  // =======================================================
  // COMPONENTES DE INFORMACIÓN
  // =======================================================

  const ResumenRapido: React.FC = () => {
    const resumen = obtenerResumenCarrito();
    
    return (
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items:</span>
          <span className="font-medium">{resumen.cantidadItems}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Unidades:</span>
          <span className="font-medium">{resumen.totalUnidades}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
          <span>Total:</span>
          <span className="text-blue-600">{resumen.total}</span>
        </div>
      </div>
    );
  };

  const EstadoCliente: React.FC = () => (
    <div className="text-sm">
      <span className="text-gray-600">Cliente: </span>
      <span className="font-medium">
        {estado.cliente?.nombre_o_razon_social || 'Sin seleccionar'}
      </span>
    </div>
  );

  // =======================================================
  // RENDERIZADO
  // =======================================================

  const resumen = obtenerResumenCarrito();
  const tieneItems = estado.items.length > 0;

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Acciones
          {mostrarConfiguracion && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setModalConfiguracionAbierto(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Resumen rápido */}
        {tieneItems && <ResumenRapido />}

        {/* Estado del cliente */}
        <EstadoCliente />

        {/* Configuración de documento */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tipo de pago:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={alternarTipoPago}
              className={cn(
                estado.tipoPago === 'credito' && 'bg-yellow-50 border-yellow-300 text-yellow-700'
              )}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              {estado.tipoPago === 'contado' ? 'Contado' : `Crédito (${estado.diasCredito}d)`}
            </Button>
          </div>

          {estado.descuentoGlobal > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Descuento:</span>
              <span className="text-sm font-medium text-red-600">
                -{estado.descuentoGlobal}%
              </span>
            </div>
          )}
        </div>

        {/* Botones de configuración */}
        <div className={cn(
          'grid gap-2',
          layout === 'horizontal' ? 'grid-cols-2' : 'grid-cols-1'
        )}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalDescuentoAbierto(true)}
            disabled={!tieneItems}
          >
            <Percent className="h-4 w-4 mr-1" />
            Descuento
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalCreditoAbierto(true)}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Crédito
          </Button>
        </div>

        {/* Botones principales de emisión */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <ButtonPrimario
            onClick={() => iniciarEmision('factura')}
            disabled={!puedeEmitir || emitiendoFactura}
            loading={emitiendoFactura && tipoEmision === 'factura'}
            className="w-full"
          >
            <FileText className="h-5 w-5 mr-2" />
            Emitir Factura
          </ButtonPrimario>

          <ButtonSecundario
            onClick={() => iniciarEmision('boleta')}
            disabled={!puedeEmitir || emitiendoFactura}
            loading={emitiendoFactura && tipoEmision === 'boleta'}
            className="w-full"
          >
            <Receipt className="h-5 w-5 mr-2" />
            Emitir Boleta
          </ButtonSecundario>
        </div>

        {/* Acciones secundarias */}
        <div className={cn(
          'grid gap-2 pt-3 border-t border-gray-200',
          layout === 'horizontal' ? 'grid-cols-2' : 'grid-cols-1'
        )}>
          {mostrarGuardado && (
            <Button
              variant="ghost"
              size="sm"
              onClick={guardarTemporal}
              disabled={!tieneItems}
            >
              <Save className="h-4 w-4 mr-1" />
              Guardar
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm('¿Está seguro de limpiar el carrito?')) {
                limpiarCarrito();
              }
            }}
            disabled={!tieneItems}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>

        {/* Estado del sistema */}
        {!puedeEmitir && tieneItems && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">No se puede emitir</p>
                <p className="text-xs mt-1">
                  Verifique que haya seleccionado un cliente válido y que todos los productos tengan stock.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal de confirmación de emisión */}
      <ModalConfirmacion
        abierto={modalConfirmacionAbierto}
        onCerrar={() => setModalConfirmacionAbierto(false)}
        onConfirmar={procederConEmision}
        titulo={`Confirmar ${tipoEmision === 'factura' ? 'Factura' : 'Boleta'}`}
        mensaje={`¿Está seguro de emitir ${tipoEmision === 'factura' ? 'la factura' : 'la boleta'} por ${resumen.total}?`}
        textoConfirmar="Emitir"
        tipo="default"
        cargando={emitiendoFactura}
      />

      {/* Modal de descuento global */}
      <ModalDescuentoGlobal
        abierto={modalDescuentoAbierto}
        onCerrar={() => setModalDescuentoAbierto(false)}
        onAplicar={aplicarDescuentoGlobal}
        descuentoActual={estado.descuentoGlobal}
      />

      {/* Modal de configuración de crédito */}
      <ModalConfiguracionCredito
        abierto={modalCreditoAbierto}
        onCerrar={() => setModalCreditoAbierto(false)}
        onConfigurar={configurarCredito}
        diasActuales={estado.diasCredito}
      />

      {/* Modal de configuración general */}
      <ModalConfiguracionEmision
        abierto={modalConfiguracionAbierto}
        onCerrar={() => setModalConfiguracionAbierto(false)}
        configuracion={configuracion}
        onCambiar={setConfiguracion}
      />
    </Card>
  );
};

// =======================================================
// MODALES AUXILIARES
// =======================================================

interface PropiedadesModalDescuentoGlobal {
  abierto: boolean;
  onCerrar: () => void;
  onAplicar: (descuento: number) => void;
  descuentoActual: number;
}

const ModalDescuentoGlobal: React.FC<PropiedadesModalDescuentoGlobal> = ({
  abierto,
  onCerrar,
  onAplicar,
  descuentoActual,
}) => {
  const [descuento, setDescuento] = useState(descuentoActual.toString());

  React.useEffect(() => {
    setDescuento(descuentoActual.toString());
  }, [descuentoActual, abierto]);

  const manejarAplicar = () => {
    const valor = parseFloat(descuento) || 0;
    if (valor >= 0 && valor <= 100) {
      onAplicar(valor);
    }
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} tamaño="sm">
      <ModalHeader onCerrar={onCerrar}>
        <ModalTitle>Descuento Global</ModalTitle>
      </ModalHeader>
      
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Porcentaje de descuento
            </label>
            <Input
              type="number"
              value={descuento}
              onChange={(e) => setDescuento(e.target.value)}
              placeholder="0"
              min={0}
              max={100}
              sufijo={<span className="text-gray-500">%</span>}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingrese un valor entre 0% y 100%
            </p>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button variant="outline" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button onClick={manejarAplicar}>
          Aplicar Descuento
        </Button>
      </ModalFooter>
    </Modal>
  );
};

interface PropiedadesModalConfiguracionCredito {
  abierto: boolean;
  onCerrar: () => void;
  onConfigurar: (dias: number) => void;
  diasActuales: number;
}

const ModalConfiguracionCredito: React.FC<PropiedadesModalConfiguracionCredito> = ({
  abierto,
  onCerrar,
  onConfigurar,
  diasActuales,
}) => {
  const [dias, setDias] = useState(diasActuales.toString());

  React.useEffect(() => {
    setDias(diasActuales > 0 ? diasActuales.toString() : '30');
  }, [diasActuales, abierto]);

  const manejarConfigurar = () => {
    const valor = parseInt(dias) || 0;
    if (valor > 0) {
      onConfigurar(valor);
    }
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} tamaño="sm">
      <ModalHeader onCerrar={onCerrar}>
        <ModalTitle>Configurar Crédito</ModalTitle>
      </ModalHeader>
      
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Días de crédito
            </label>
            <Input
              type="number"
              value={dias}
              onChange={(e) => setDias(e.target.value)}
              placeholder="30"
              min={1}
              max={365}
              sufijo={<span className="text-gray-500">días</span>}
            />
            <p className="text-xs text-gray-500 mt-1">
              Número de días para el pago
            </p>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button variant="outline" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button onClick={manejarConfigurar}>
          Configurar Crédito
        </Button>
      </ModalFooter>
    </Modal>
  );
};

interface PropiedadesModalConfiguracionEmision {
  abierto: boolean;
  onCerrar: () => void;
  configuracion: ConfiguracionEmision;
  onCambiar: (config: ConfiguracionEmision) => void;
}

const ModalConfiguracionEmision: React.FC<PropiedadesModalConfiguracionEmision> = ({
  abierto,
  onCerrar,
  configuracion,
  onCambiar,
}) => {
  const [config, setConfig] = useState(configuracion);

  React.useEffect(() => {
    setConfig(configuracion);
  }, [configuracion, abierto]);

  const manejarCambio = (campo: keyof ConfiguracionEmision, valor: boolean) => {
    setConfig(prev => ({ ...prev, [campo]: valor }));
  };

  const manejarGuardar = () => {
    onCambiar(config);
    onCerrar();
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} tamaño="md">
      <ModalHeader onCerrar={onCerrar}>
        <ModalTitle>Configuración de Emisión</ModalTitle>
      </ModalHeader>
      
      <ModalBody>
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.validarStock}
                onChange={(e) => manejarCambio('validarStock', e.target.checked)}
                className="rounded"
              />
              <div>
                <span className="font-medium">Validar stock</span>
                <p className="text-xs text-gray-500">
                  Verificar disponibilidad antes de emitir
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.imprimirAutomatico}
                onChange={(e) => manejarCambio('imprimirAutomatico', e.target.checked)}
                className="rounded"
              />
              <div>
                <span className="font-medium">Imprimir automáticamente</span>
                <p className="text-xs text-gray-500">
                  Imprimir documento después de emitir
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.limpiarDespuesEmision}
                onChange={(e) => manejarCambio('limpiarDespuesEmision', e.target.checked)}
                className="rounded"
              />
              <div>
                <span className="font-medium">Limpiar después de emitir</span>
                <p className="text-xs text-gray-500">
                  Limpiar carrito después de emitir exitosamente
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.mostrarConfirmacion}
                onChange={(e) => manejarCambio('mostrarConfirmacion', e.target.checked)}
                className="rounded"
              />
              <div>
                <span className="font-medium">Mostrar confirmación</span>
                <p className="text-xs text-gray-500">
                  Solicitar confirmación antes de emitir
                </p>
              </div>
            </label>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button variant="outline" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button onClick={manejarGuardar}>
          Guardar Configuración
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default BotonesAccion;