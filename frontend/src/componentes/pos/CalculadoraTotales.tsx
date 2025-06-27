/**
 * Calculadora de Totales - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente para mostrar y calcular totales en tiempo real
 */

import React, { useMemo, useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Eye, 
  EyeOff,
  Percent,
  DollarSign,
  FileText,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button, ButtonIcono } from '../ui/button';
import { usePuntoDeVenta } from '../../hooks/useFacturacion';
import { formatearMoneda, formatearPorcentaje } from '../../utils/formatos';
import { calcularTotalesFactura, IGV_TASA } from '../../utils/calculos';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesCalculadoraTotales {
  className?: string;
  compacta?: boolean;
  mostrarDetalles?: boolean;
  mostrarImpuestos?: boolean;
  animarCambios?: boolean;
}

interface AnalisisTotales {
  subtotalSinIGV: number;
  subtotalConIGV: number;
  igvCalculado: number;
  descuentoMonto: number;
  totalFinal: number;
  margenDescuento: number;
  promedioUnitario: number;
  totalUnidades: number;
}

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const CalculadoraTotales: React.FC<PropiedadesCalculadoraTotales> = ({
  className,
  compacta = false,
  mostrarDetalles = true,
  mostrarImpuestos = true,
  animarCambios = true,
}) => {
  // Estados locales
  const [mostrarAnalisis, setMostrarAnalisis] = useState(false);
  const [ultimoTotal, setUltimoTotal] = useState(0);

  // Hook del punto de venta
  const { estado, obtenerResumenCarrito } = usePuntoDeVenta();

  // =======================================================
  // CÁLCULOS Y ANÁLISIS
  // =======================================================

  const analisis = useMemo((): AnalisisTotales => {
    const items = estado.items;
    
    if (items.length === 0) {
      return {
        subtotalSinIGV: 0,
        subtotalConIGV: 0,
        igvCalculado: 0,
        descuentoMonto: 0,
        totalFinal: 0,
        margenDescuento: 0,
        promedioUnitario: 0,
        totalUnidades: 0,
      };
    }

    // Calcular totales base
    const totales = calcularTotalesFactura(items, estado.descuentoGlobal);
    
    // Calcular estadísticas adicionales
    const totalUnidades = items.reduce((sum, item) => sum + item.cantidad, 0);
    const subtotalSinDescuento = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
    const descuentoMonto = subtotalSinDescuento * (estado.descuentoGlobal / 100);
    const promedioUnitario = totalUnidades > 0 ? totales.subtotal / totalUnidades : 0;
    const margenDescuento = subtotalSinDescuento > 0 ? (descuentoMonto / subtotalSinDescuento) * 100 : 0;

    return {
      subtotalSinIGV: totales.subtotal,
      subtotalConIGV: totales.subtotal + totales.igv,
      igvCalculado: totales.igv,
      descuentoMonto,
      totalFinal: totales.total,
      margenDescuento,
      promedioUnitario,
      totalUnidades,
    };
  }, [estado.items, estado.descuentoGlobal]);

  // Detectar cambios para animaciones
  React.useEffect(() => {
    if (animarCambios && analisis.totalFinal !== ultimoTotal) {
      setUltimoTotal(analisis.totalFinal);
    }
  }, [analisis.totalFinal, ultimoTotal, animarCambios]);

  // =======================================================
  // COMPONENTES DE VISUALIZACIÓN
  // =======================================================

  const LineaTotal: React.FC<{
    label: string;
    valor: number;
    destacado?: boolean;
    color?: 'default' | 'green' | 'red' | 'blue';
    icono?: React.ReactNode;
  }> = ({ label, valor, destacado = false, color = 'default', icono }) => {
    const colores = {
      default: 'text-gray-900',
      green: 'text-green-600',
      red: 'text-red-600',
      blue: 'text-blue-600',
    };

    return (
      <div className={cn(
        'flex items-center justify-between py-1',
        destacado && 'py-2 border-t border-gray-200 font-semibold text-lg'
      )}>
        <div className="flex items-center gap-2">
          {icono}
          <span className={cn(
            'text-sm',
            destacado && 'text-base font-medium'
          )}>
            {label}
          </span>
        </div>
        <span className={cn(
          'font-medium',
          colores[color],
          destacado && 'text-lg font-bold',
          animarCambios && 'transition-all duration-300'
        )}>
          {formatearMoneda(valor)}
        </span>
      </div>
    );
  };

  const EstadisticaRapida: React.FC<{
    label: string;
    valor: string | number;
    icono: React.ReactNode;
    color?: string;
  }> = ({ label, valor, icono, color = 'text-blue-600' }) => (
    <div className="text-center p-2 bg-gray-50 rounded">
      <div className={cn('flex justify-center mb-1', color)}>
        {icono}
      </div>
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-sm font-medium">
        {typeof valor === 'number' ? formatearMoneda(valor) : valor}
      </div>
    </div>
  );

  // =======================================================
  // RENDERIZADO
  // =======================================================

  const tieneItems = estado.items.length > 0;

  if (!tieneItems) {
    return (
      <Card className={cn('text-center', className)}>
        <CardContent className="p-6">
          <Calculator className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No hay items para calcular</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className={cn('pb-3', compacta && 'pb-2')}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            'flex items-center gap-2',
            compacta ? 'text-base' : 'text-lg'
          )}>
            <Calculator className="h-5 w-5" />
            Totales
          </CardTitle>
          
          {mostrarDetalles && (
            <ButtonIcono
              icono={mostrarAnalisis ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              variant="ghost"
              size="sm"
              onClick={() => setMostrarAnalisis(!mostrarAnalisis)}
              title={mostrarAnalisis ? 'Ocultar análisis' : 'Mostrar análisis'}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className={cn('space-y-3', compacta && 'space-y-2')}>
        {/* Totales principales */}
        <div className="space-y-1">
          <LineaTotal
            label="Subtotal"
            valor={analisis.subtotalSinIGV}
            icono={<DollarSign className="h-4 w-4 text-gray-500" />}
          />

          {estado.descuentoGlobal > 0 && (
            <LineaTotal
              label={`Descuento (${estado.descuentoGlobal}%)`}
              valor={-analisis.descuentoMonto}
              color="red"
              icono={<TrendingDown className="h-4 w-4 text-red-500" />}
            />
          )}

          {mostrarImpuestos && (
            <LineaTotal
              label={`IGV (${formatearPorcentaje(IGV_TASA)})`}
              valor={analisis.igvCalculado}
              color="blue"
              icono={<FileText className="h-4 w-4 text-blue-500" />}
            />
          )}

          <LineaTotal
            label="TOTAL"
            valor={analisis.totalFinal}
            destacado
            color="green"
            icono={<TrendingUp className="h-5 w-5 text-green-600" />}
          />
        </div>

        {/* Información adicional en modo compacto */}
        {compacta && (
          <div className="text-xs text-gray-600 flex justify-between">
            <span>{analisis.totalUnidades} unidades</span>
            <span>{estado.items.length} items</span>
          </div>
        )}

        {/* Análisis detallado */}
        {mostrarAnalisis && !compacta && (
          <div className="pt-3 border-t border-gray-200 space-y-3">
            <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Análisis Detallado
            </h4>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 gap-2">
              <EstadisticaRapida
                label="Promedio/Unidad"
                valor={analisis.promedioUnitario}
                icono={<Calculator className="h-4 w-4" />}
                color="text-purple-600"
              />
              
              <EstadisticaRapida
                label="Total Unidades"
                valor={analisis.totalUnidades.toString()}
                icono={<Package className="h-4 w-4" />}
                color="text-indigo-600"
              />
            </div>

            {/* Información de impuestos */}
            {mostrarImpuestos && (
              <div className="bg-blue-50 rounded-lg p-3">
                <h5 className="text-xs font-medium text-blue-900 mb-2">
                  Información Tributaria
                </h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Base imponible:</span>
                    <span className="font-medium text-blue-900">
                      {formatearMoneda(analisis.subtotalSinIGV)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">IGV (18%):</span>
                    <span className="font-medium text-blue-900">
                      {formatearMoneda(analisis.igvCalculado)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-1">
                    <span className="text-blue-700 font-medium">Total con IGV:</span>
                    <span className="font-bold text-blue-900">
                      {formatearMoneda(analisis.totalFinal)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Alertas y validaciones */}
            {estado.descuentoGlobal > 50 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-yellow-800">Descuento Alto</p>
                    <p className="text-yellow-700">
                      El descuento aplicado es mayor al 50%. Verifique la autorización.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analisis.totalFinal > 10000 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-blue-800">Venta de Alto Valor</p>
                    <p className="text-blue-700">
                      Esta venta supera los S/ 10,000. Asegúrese de que el cliente tenga RUC válido.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resumen final del tipo de documento */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Tipo de documento:</span>
            <span className="font-medium capitalize">
              {estado.tipoDocumento}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Modalidad de pago:</span>
            <span className="font-medium">
              {estado.tipoPago === 'contado' ? 'Al contado' : `Crédito ${estado.diasCredito}d`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculadoraTotales;