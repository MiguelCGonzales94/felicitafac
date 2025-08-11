/**
 * Formulario de Factura - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Formulario completo para emisión de facturas SUNAT
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { 
  Plus, X, Search, Calculator, FileText, Save, Send, 
  AlertTriangle, Info, Package, User, CreditCard, Percent
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Tabla } from '../ui/table';

// Importar tipos y utilidades
import { DatosFactura, ItemFactura, TipoDocumento } from '../../types/factura';
import { Cliente } from '../../types/cliente';
import { Producto } from '../../types/producto';
import { validarRuc, validarDni, validarEmail } from '../../utils/validaciones';
import { formatearMoneda, formatearPorcentaje } from '../../utils/formatters';
import { calcularIgv, calcularTotal, calcularSubtotal } from '../../utils/moneyUtils';
import { useApi } from '../../hooks/useApi';
import { useNotificaciones } from '../comunes/Notificaciones';
import { useCarga } from '../comunes/ComponenteCarga';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesFormularioFactura {
  facturaInicial?: Partial<DatosFactura>;
  modoEdicion?: boolean;
  onGuardar: (datos: DatosFactura) => Promise<void>;
  onCancelar: () => void;
  onPrevisualizar?: (datos: DatosFactura) => void;
  clientePreseleccionado?: Cliente;
  productosDisponibles?: Producto[];
  className?: string;
}

interface FormularioFacturaData {
  // Cliente
  cliente: Cliente | null;
  busquedaCliente: string;
  
  // Documento
  tipoDocumento: TipoDocumento;
  serie: string;
  numero: string;
  fechaEmision: string;
  fechaVencimiento: string;
  moneda: 'PEN' | 'USD' | 'EUR';
  tipoCambio: number;
  
  // Items
  items: ItemFactura[];
  
  // Totales
  descuentoGlobal: number;
  tipoDescuentoGlobal: 'porcentaje' | 'monto';
  aplicarDescuentoAntes: boolean;
  
  // Observaciones
  observaciones: string;
  notasInternas: string;
  
  // Configuración
  enviarPorEmail: boolean;
  emailAdicional: string;
  guardarBorrador: boolean;
}

// =======================================================
// CONFIGURACIÓN
// =======================================================

const TIPOS_DOCUMENTO: Array<{value: TipoDocumento; label: string; descripcion: string}> = [
  { value: '01', label: 'Factura', descripcion: 'Para personas jurídicas con RUC' },
  { value: '03', label: 'Boleta', descripcion: 'Para personas naturales o jurídicas' },
  { value: '07', label: 'Nota de Crédito', descripcion: 'Corrección o anulación' },
  { value: '08', label: 'Nota de Débito', descripcion: 'Cargos adicionales' }
];

const MONEDAS = [
  { value: 'PEN', label: 'Soles (PEN)', simbolo: 'S/' },
  { value: 'USD', label: 'Dólares (USD)', simbolo: '$' },
  { value: 'EUR', label: 'Euros (EUR)', simbolo: '€' }
];

// =======================================================
// HOOK PARA BÚSQUEDA DE CLIENTES
// =======================================================

const useBusquedaClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(false);
  const { api } = useApi();

  const buscarClientes = useCallback(async (termino: string) => {
    if (termino.length < 3) {
      setClientes([]);
      return;
    }

    setCargando(true);
    try {
      const response = await api.get('/clientes/buscar/', {
        params: { q: termino, limit: 10 }
      });
      setClientes(response.data);
    } catch (error) {
      console.error('Error buscando clientes:', error);
      setClientes([]);
    } finally {
      setCargando(false);
    }
  }, [api]);

  return { clientes, cargando, buscarClientes };
};

// =======================================================
// HOOK PARA BÚSQUEDA DE PRODUCTOS
// =======================================================

const useBusquedaProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const { api } = useApi();

  const buscarProductos = useCallback(async (termino: string) => {
    if (termino.length < 2) {
      setProductos([]);
      return;
    }

    setCargando(true);
    try {
      const response = await api.get('/productos/buscar/', {
        params: { q: termino, limit: 20 }
      });
      setProductos(response.data);
    } catch (error) {
      console.error('Error buscando productos:', error);
      setProductos([]);
    } finally {
      setCargando(false);
    }
  }, [api]);

  return { productos, cargando, buscarProductos };
};

// =======================================================
// COMPONENTE SELECTOR DE CLIENTE
// =======================================================

const SelectorCliente: React.FC<{
  cliente: Cliente | null;
  onChange: (cliente: Cliente | null) => void;
  tipoDocumento: TipoDocumento;
}> = ({ cliente, onChange, tipoDocumento }) => {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const { clientes, cargando, buscarClientes } = useBusquedaClientes();

  useEffect(() => {
    buscarClientes(busqueda);
  }, [busqueda, buscarClientes]);

  const tipoClienteRequerido = tipoDocumento === '01' ? 'juridica' : 'ambos';

  const clientesFiltrados = clientes.filter(c => {
    if (tipoClienteRequerido === 'juridica') {
      return c.tipo_cliente === 'juridica' && c.tipo_documento === '6';
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="busqueda-cliente">Buscar Cliente</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="busqueda-cliente"
              placeholder="RUC, DNI, razón social..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setMostrarResultados(true);
              }}
              onFocus={() => setMostrarResultados(true)}
              className="pl-10"
            />
            {cargando && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Resultados de búsqueda */}
          {mostrarResultados && clientesFiltrados.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {clientesFiltrados.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    onChange(c);
                    setBusqueda('');
                    setMostrarResultados(false);
                  }}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{c.razon_social}</div>
                  <div className="text-sm text-gray-600">
                    {c.tipo_documento} {c.numero_documento}
                  </div>
                  {c.email && (
                    <div className="text-xs text-gray-500">{c.email}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {tipoDocumento === '01' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Las facturas solo se pueden emitir a personas jurídicas con RUC.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Cliente seleccionado */}
      {cliente && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Cliente Seleccionado</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-gray-500">Razón Social</Label>
                <p className="font-medium">{cliente.razon_social}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Documento</Label>
                <p>{cliente.tipo_documento} {cliente.numero_documento}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Email</Label>
                <p>{cliente.email || 'No registrado'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Teléfono</Label>
                <p>{cliente.telefono || 'No registrado'}</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Dirección</Label>
              <p className="text-sm">{cliente.direccion}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE TABLA DE ITEMS
// =======================================================

const TablaItems: React.FC<{
  items: ItemFactura[];
  onAgregarItem: () => void;
  onEliminarItem: (index: number) => void;
  onActualizarItem: (index: number, item: ItemFactura) => void;
  moneda: string;
}> = ({ items, onAgregarItem, onEliminarItem, onActualizarItem, moneda }) => {
  const { productos, buscarProductos } = useBusquedaProductos();
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [indiceEditando, setIndiceEditando] = useState<number | null>(null);

  const simboloMoneda = MONEDAS.find(m => m.value === moneda)?.simbolo || 'S/';

  const calcularTotalItem = (item: ItemFactura): number => {
    const subtotal = item.cantidad * item.precio_unitario;
    const descuento = item.descuento || 0;
    const subtotalConDescuento = subtotal - descuento;
    const igv = subtotalConDescuento * (item.porcentaje_igv / 100);
    return subtotalConDescuento + igv;
  };

  const columnas = [
    { key: 'codigo', label: 'Código', ancho: '120px' },
    { key: 'descripcion', label: 'Descripción', ancho: 'auto' },
    { key: 'cantidad', label: 'Cant.', ancho: '80px' },
    { key: 'precio', label: `Precio (${simboloMoneda})`, ancho: '120px' },
    { key: 'descuento', label: 'Desc.', ancho: '100px' },
    { key: 'total', label: `Total (${simboloMoneda})`, ancho: '120px' },
    { key: 'acciones', label: 'Acciones', ancho: '100px' }
  ];

  return (
    <div className="space-y-4">
      {/* Búsqueda de productos */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar producto por código o descripción..."
            value={busquedaProducto}
            onChange={(e) => {
              setBusquedaProducto(e.target.value);
              buscarProductos(e.target.value);
            }}
            className="pl-10"
          />
        </div>
        <Button onClick={onAgregarItem} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Agregar
        </Button>
      </div>

      {/* Resultados de búsqueda de productos */}
      {productos.length > 0 && busquedaProducto && (
        <Card>
          <CardContent className="p-3">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {productos.map(producto => (
                <button
                  key={producto.id}
                  onClick={() => {
                    const nuevoItem: ItemFactura = {
                      id: `item-${Date.now()}`,
                      codigo_producto: producto.codigo,
                      descripcion: producto.nombre,
                      cantidad: 1,
                      precio_unitario: producto.precio_venta,
                      descuento: 0,
                      porcentaje_igv: 18,
                      unidad_medida: producto.unidad_medida || 'NIU',
                      producto_id: producto.id
                    };
                    onActualizarItem(items.length, nuevoItem);
                    setBusquedaProducto('');
                  }}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded border"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{producto.nombre}</div>
                      <div className="text-sm text-gray-600">
                        Código: {producto.codigo} | Stock: {producto.stock_actual}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatearMoneda(producto.precio_venta)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de items */}
      <Tabla
        columnas={columnas}
        datos={items}
        renderizarFila={(item, index) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="p-2">
              <Input
                value={item.codigo_producto}
                onChange={(e) => onActualizarItem(index, { ...item, codigo_producto: e.target.value })}
                className="w-full"
                size="sm"
              />
            </td>
            <td className="p-2">
              <Input
                value={item.descripcion}
                onChange={(e) => onActualizarItem(index, { ...item, descripcion: e.target.value })}
                className="w-full"
                size="sm"
              />
            </td>
            <td className="p-2">
              <Input
                type="number"
                min="1"
                value={item.cantidad}
                onChange={(e) => onActualizarItem(index, { ...item, cantidad: parseFloat(e.target.value) || 1 })}
                className="w-full"
                size="sm"
              />
            </td>
            <td className="p-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.precio_unitario}
                onChange={(e) => onActualizarItem(index, { ...item, precio_unitario: parseFloat(e.target.value) || 0 })}
                className="w-full"
                size="sm"
              />
            </td>
            <td className="p-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.descuento || 0}
                onChange={(e) => onActualizarItem(index, { ...item, descuento: parseFloat(e.target.value) || 0 })}
                className="w-full"
                size="sm"
              />
            </td>
            <td className="p-2 text-right font-medium">
              {formatearMoneda(calcularTotalItem(item))}
            </td>
            <td className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEliminarItem(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </td>
          </tr>
        )}
      />

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No hay items agregados</p>
          <p className="text-sm">Busca productos arriba o agrega items manualmente</p>
        </div>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE RESUMEN DE TOTALES
// =======================================================

const ResumenTotales: React.FC<{
  items: ItemFactura[];
  descuentoGlobal: number;
  tipoDescuentoGlobal: 'porcentaje' | 'monto';
  moneda: string;
}> = ({ items, descuentoGlobal, tipoDescuentoGlobal, moneda }) => {
  const simboloMoneda = MONEDAS.find(m => m.value === moneda)?.simbolo || 'S/';

  const calculos = useMemo(() => {
    const subtotal = items.reduce((acc, item) => {
      return acc + (item.cantidad * item.precio_unitario);
    }, 0);

    const descuentoItems = items.reduce((acc, item) => {
      return acc + (item.descuento || 0);
    }, 0);

    const subtotalConDescuentos = subtotal - descuentoItems;

    const descuentoGlobalCalculado = tipoDescuentoGlobal === 'porcentaje'
      ? subtotalConDescuentos * (descuentoGlobal / 100)
      : descuentoGlobal;

    const baseImponible = subtotalConDescuentos - descuentoGlobalCalculado;
    const igv = baseImponible * 0.18;
    const total = baseImponible + igv;

    return {
      subtotal,
      descuentoItems,
      descuentoGlobal: descuentoGlobalCalculado,
      baseImponible,
      igv,
      total
    };
  }, [items, descuentoGlobal, tipoDescuentoGlobal]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Resumen de Totales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{simboloMoneda} {formatearMoneda(calculos.subtotal)}</span>
          </div>
          
          {calculos.descuentoItems > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Descuentos en items:</span>
              <span>-{simboloMoneda} {formatearMoneda(calculos.descuentoItems)}</span>
            </div>
          )}
          
          {calculos.descuentoGlobal > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Descuento global:</span>
              <span>-{simboloMoneda} {formatearMoneda(calculos.descuentoGlobal)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Base imponible:</span>
            <span className="font-medium">{simboloMoneda} {formatearMoneda(calculos.baseImponible)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">IGV (18%):</span>
            <span className="font-medium">{simboloMoneda} {formatearMoneda(calculos.igv)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-blue-600">{simboloMoneda} {formatearMoneda(calculos.total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const FormularioFactura: React.FC<PropiedadesFormularioFactura> = ({
  facturaInicial,
  modoEdicion = false,
  onGuardar,
  onCancelar,
  onPrevisualizar,
  clientePreseleccionado,
  className
}) => {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormularioFacturaData>({
    defaultValues: {
      cliente: clientePreseleccionado || null,
      busquedaCliente: '',
      tipoDocumento: '01',
      serie: 'F001',
      numero: '',
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaVencimiento: new Date().toISOString().split('T')[0],
      moneda: 'PEN',
      tipoCambio: 1,
      items: [],
      descuentoGlobal: 0,
      tipoDescuentoGlobal: 'porcentaje',
      aplicarDescuentoAntes: true,
      observaciones: '',
      notasInternas: '',
      enviarPorEmail: true,
      emailAdicional: '',
      guardarBorrador: false
    }
  });

  const { mostrarExito, mostrarError } = useNotificaciones();
  const { mostrarCargaConProgreso, ocultarCarga, actualizarProgreso } = useCarga();

  const valoresForm = watch();

  // Función para agregar item
  const agregarItem = useCallback(() => {
    const nuevosItems = [...valoresForm.items, {
      id: `item-${Date.now()}`,
      codigo_producto: '',
      descripcion: '',
      cantidad: 1,
      precio_unitario: 0,
      descuento: 0,
      porcentaje_igv: 18,
      unidad_medida: 'NIU'
    }];
    setValue('items', nuevosItems);
  }, [valoresForm.items, setValue]);

  // Función para eliminar item
  const eliminarItem = useCallback((index: number) => {
    const nuevosItems = valoresForm.items.filter((_, i) => i !== index);
    setValue('items', nuevosItems);
  }, [valoresForm.items, setValue]);

  // Función para actualizar item
  const actualizarItem = useCallback((index: number, item: ItemFactura) => {
    const nuevosItems = [...valoresForm.items];
    if (index >= nuevosItems.length) {
      nuevosItems.push(item);
    } else {
      nuevosItems[index] = item;
    }
    setValue('items', nuevosItems);
  }, [valoresForm.items, setValue]);

  // Función para manejar envío
  const manejarEnvio = async (datos: FormularioFacturaData) => {
    if (!datos.cliente) {
      mostrarError('Validation Error', 'Debe seleccionar un cliente');
      return;
    }

    if (datos.items.length === 0) {
      mostrarError('Validation Error', 'Debe agregar al menos un item');
      return;
    }

    try {
      mostrarCargaConProgreso('Procesando factura', 'Validando datos...');
      actualizarProgreso(25);

      // Construir datos de la factura
      const datosFactura: DatosFactura = {
        id: facturaInicial?.id,
        tipo_documento: datos.tipoDocumento,
        serie: datos.serie,
        numero: datos.numero,
        fecha_emision: datos.fechaEmision,
        fecha_vencimiento: datos.fechaVencimiento,
        cliente: datos.cliente,
        items: datos.items,
        moneda: datos.moneda,
        tipo_cambio: datos.tipoCambio,
        descuento_global: datos.descuentoGlobal,
        tipo_descuento_global: datos.tipoDescuentoGlobal,
        observaciones: datos.observaciones,
        notas_internas: datos.notasInternas,
        enviar_por_email: datos.enviarPorEmail,
        email_adicional: datos.emailAdicional,
        guardar_borrador: datos.guardarBorrador,
        estado: 'borrador',
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        usuario_creacion: 1 // TODO: obtener del contexto de usuario
      };

      actualizarProgreso(75, 'Guardando factura...');
      
      await onGuardar(datosFactura);
      
      actualizarProgreso(100, 'Completado');
      mostrarExito('Factura guardada', 'La factura se ha guardado correctamente');
      
    } catch (error) {
      console.error('Error guardando factura:', error);
      mostrarError('Error', 'Error al guardar la factura');
    } finally {
      setTimeout(ocultarCarga, 1000);
    }
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit(manejarEnvio)} className={cn("space-y-6", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{modoEdicion ? 'Editar' : 'Nueva'} Factura</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="datos-generales" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="datos-generales">Datos Generales</TabsTrigger>
                <TabsTrigger value="cliente">Cliente</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="totales">Totales</TabsTrigger>
              </TabsList>

              {/* Tab Datos Generales */}
              <TabsContent value="datos-generales" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Tipo de Documento</Label>
                    <Controller
                      name="tipoDocumento"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_DOCUMENTO.map(tipo => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                <div>
                                  <div className="font-medium">{tipo.label}</div>
                                  <div className="text-xs text-gray-500">{tipo.descripcion}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label>Serie</Label>
                    <Controller
                      name="serie"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="F001" />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Número</Label>
                    <Controller
                      name="numero"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Automático" readOnly />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Fecha de Emisión</Label>
                    <Controller
                      name="fechaEmision"
                      control={control}
                      render={({ field }) => (
                        <Input type="date" {...field} />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Fecha de Vencimiento</Label>
                    <Controller
                      name="fechaVencimiento"
                      control={control}
                      render={({ field }) => (
                        <Input type="date" {...field} />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Moneda</Label>
                    <Controller
                      name="moneda"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MONEDAS.map(moneda => (
                              <SelectItem key={moneda.value} value={moneda.value}>
                                {moneda.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab Cliente */}
              <TabsContent value="cliente">
                <SelectorCliente
                  cliente={valoresForm.cliente}
                  onChange={(cliente) => setValue('cliente', cliente)}
                  tipoDocumento={valoresForm.tipoDocumento}
                />
              </TabsContent>

              {/* Tab Items */}
              <TabsContent value="items">
                <TablaItems
                  items={valoresForm.items}
                  onAgregarItem={agregarItem}
                  onEliminarItem={eliminarItem}
                  onActualizarItem={actualizarItem}
                  moneda={valoresForm.moneda}
                />
              </TabsContent>

              {/* Tab Totales */}
              <TabsContent value="totales" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Descuentos y Configuración</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Descuento Global</Label>
                        <Controller
                          name="descuentoGlobal"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          )}
                        />
                      </div>
                      
                      <div>
                        <Label>Tipo</Label>
                        <Controller
                          name="tipoDescuentoGlobal"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                                <SelectItem value="monto">Monto fijo</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Observaciones</Label>
                      <Controller
                        name="observaciones"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Observaciones que aparecerán en el documento..."
                            rows={3}
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Controller
                        name="enviarPorEmail"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="enviar-email"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <Label htmlFor="enviar-email">Enviar por email al cliente</Label>
                          </div>
                        )}
                      />

                      <Controller
                        name="guardarBorrador"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="guardar-borrador"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <Label htmlFor="guardar-borrador">Guardar como borrador</Label>
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <ResumenTotales
                    items={valoresForm.items}
                    descuentoGlobal={valoresForm.descuentoGlobal}
                    tipoDescuentoGlobal={valoresForm.tipoDescuentoGlobal}
                    moneda={valoresForm.moneda}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          
          {onPrevisualizar && (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onPrevisualizar(valoresForm as any)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Previsualizar
            </Button>
          )}
          
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            {modoEdicion ? 'Actualizar' : 'Guardar'} Factura
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
};

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default FormularioFactura;