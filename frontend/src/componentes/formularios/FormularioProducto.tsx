/**
 * Formulario de Producto - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Formulario completo para gestión de productos e inventario
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Package, BarChart3, DollarSign, Hash, Image, Save, X, 
  Upload, AlertTriangle, Info, Calculator, Tags, Percent
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
import { Switch } from '../ui/switch';

// Importar tipos y utilidades
import { Producto, FormularioProducto, CategoriaProducto, TipoProducto } from '../../types/producto';
import { formatearMoneda, formatearPorcentaje } from '../../utils/formatters';
import { calcularPrecioConImpuestos, calcularMargenGanancia } from '../../utils/moneyUtils';
import { validarCodigoProducto, validarPrecio } from '../../utils/validaciones';
import { UNIDADES_MEDIDA_SUNAT, CODIGOS_PRODUCTO_SUNAT } from '../../utils/constants';
import { useApi } from '../../hooks/useApi';
import { useNotificaciones } from '../comunes/Notificaciones';
import { useCarga } from '../comunes/ComponenteCarga';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesFormularioProducto {
  productoInicial?: Partial<Producto>;
  modoEdicion?: boolean;
  onGuardar: (datos: FormularioProducto) => Promise<void>;
  onCancelar: () => void;
  onEliminar?: (id: number) => Promise<void>;
  onDuplicar?: (producto: Producto) => void;
  categoriasDisponibles?: CategoriaProducto[];
  className?: string;
}

interface FormularioProductoData {
  // Identificación
  codigo: string;
  codigo_barras: string;
  codigo_sunat: string;
  nombre: string;
  descripcion: string;
  descripcion_corta: string;
  
  // Clasificación
  tipo_producto: TipoProducto;
  categoria_id: number | null;
  marca: string;
  modelo: string;
  
  // Unidades y medidas
  unidad_medida: string;
  peso: number;
  dimensiones: string;
  
  // Precios y costos
  costo_unitario: number;
  precio_venta: number;
  precio_minimo: number;
  precio_mayorista: number;
  margen_ganancia: number;
  aplica_igv: boolean;
  porcentaje_igv: number;
  
  // Inventario
  maneja_inventario: boolean;
  stock_minimo: number;
  stock_maximo: number;
  punto_reorden: number;
  ubicacion_almacen: string;
  
  // Imágenes y archivos
  imagen_principal: string;
  imagenes_adicionales: string[];
  
  // Configuración
  activo: boolean;
  visible_tienda: boolean;
  permite_descuento: boolean;
  descuento_maximo: number;
  
  // Notas
  notas_internas: string;
  etiquetas: string[];
}

// =======================================================
// CONFIGURACIÓN
// =======================================================

const TIPOS_PRODUCTO: Array<{value: TipoProducto; label: string; descripcion: string}> = [
  { value: 'bien', label: 'Bien', descripcion: 'Producto físico tangible' },
  { value: 'servicio', label: 'Servicio', descripcion: 'Servicio intangible' },
  { value: 'combo', label: 'Combo', descripcion: 'Conjunto de productos' }
];

const UNIDADES_COMUNES = [
  { value: 'NIU', label: 'Unidad (NIU)', descripcion: 'Unidad básica' },
  { value: 'ZZ', label: 'Unidad (ZZ)', descripcion: 'Unidad genérica' },
  { value: 'KGM', label: 'Kilogramo', descripcion: 'Peso en kilogramos' },
  { value: 'LTR', label: 'Litro', descripcion: 'Volumen en litros' },
  { value: 'MTR', label: 'Metro', descripcion: 'Longitud en metros' },
  { value: 'M2', label: 'Metro cuadrado', descripción: 'Área en metros cuadrados' },
  { value: 'M3', label: 'Metro cúbico', descripcion: 'Volumen en metros cúbicos' },
  { value: 'HUR', label: 'Hora', descripcion: 'Tiempo en horas' },
  { value: 'DAY', label: 'Día', descripcion: 'Tiempo en días' }
];

// =======================================================
// HOOK PARA CÁLCULOS AUTOMÁTICOS
// =======================================================

const useCalculosProducto = (watch: any, setValue: any) => {
  const costoUnitario = watch('costo_unitario');
  const precioVenta = watch('precio_venta');
  const margenGanancia = watch('margen_ganancia');
  const aplicaIgv = watch('aplica_igv');
  const porcentajeIgv = watch('porcentaje_igv');

  // Calcular precio basado en margen
  const calcularPrecioPorMargen = useCallback(() => {
    if (costoUnitario > 0 && margenGanancia > 0) {
      const nuevoPrecio = costoUnitario * (1 + margenGanancia / 100);
      setValue('precio_venta', Math.round(nuevoPrecio * 100) / 100);
    }
  }, [costoUnitario, margenGanancia, setValue]);

  // Calcular margen basado en precio
  const calcularMargenPorPrecio = useCallback(() => {
    if (costoUnitario > 0 && precioVenta > 0) {
      const nuevoMargen = ((precioVenta - costoUnitario) / costoUnitario) * 100;
      setValue('margen_ganancia', Math.round(nuevoMargen * 100) / 100);
    }
  }, [costoUnitario, precioVenta, setValue]);

  // Calcular precio con impuestos
  const precioConImpuestos = useMemo(() => {
    if (!aplicaIgv || !precioVenta) return precioVenta;
    return precioVenta * (1 + porcentajeIgv / 100);
  }, [precioVenta, aplicaIgv, porcentajeIgv]);

  return {
    calcularPrecioPorMargen,
    calcularMargenPorPrecio,
    precioConImpuestos
  };
};

// =======================================================
// HOOK PARA GESTIÓN DE IMÁGENES
// =======================================================

const useGestionImagenes = () => {
  const [subiendo, setSubiendo] = useState(false);
  const { api } = useApi();

  const subirImagen = useCallback(async (archivo: File): Promise<string | null> => {
    if (!archivo) return null;

    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('imagen', archivo);

      const response = await api.post('/productos/subir-imagen/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.url;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      return null;
    } finally {
      setSubiendo(false);
    }
  }, [api]);

  const eliminarImagen = useCallback(async (url: string): Promise<boolean> => {
    try {
      await api.delete('/productos/eliminar-imagen/', {
        data: { url }
      });
      return true;
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      return false;
    }
  }, [api]);

  return { subirImagen, eliminarImagen, subiendo };
};

// =======================================================
// COMPONENTE GESTOR DE IMÁGENES
// =======================================================

const GestorImagenes: React.FC<{
  imagenPrincipal: string;
  imagenesAdicionales: string[];
  onImagenPrincipalChange: (url: string) => void;
  onImagenesAdicionalesChange: (urls: string[]) => void;
}> = ({ 
  imagenPrincipal, 
  imagenesAdicionales, 
  onImagenPrincipalChange, 
  onImagenesAdicionalesChange 
}) => {
  const { subirImagen, eliminarImagen, subiendo } = useGestionImagenes();
  const { mostrarExito, mostrarError } = useNotificaciones();

  const manejarSubidaImagenPrincipal = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    const url = await subirImagen(archivo);
    if (url) {
      onImagenPrincipalChange(url);
      mostrarExito('Imagen subida', 'La imagen principal se ha subido correctamente');
    } else {
      mostrarError('Error', 'No se pudo subir la imagen');
    }
  };

  const manejarSubidaImagenAdicional = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(event.target.files || []);
    if (archivos.length === 0) return;

    const urls: string[] = [];
    for (const archivo of archivos) {
      const url = await subirImagen(archivo);
      if (url) urls.push(url);
    }

    if (urls.length > 0) {
      onImagenesAdicionalesChange([...imagenesAdicionales, ...urls]);
      mostrarExito('Imágenes subidas', `${urls.length} imagen(es) subida(s) correctamente`);
    }
  };

  const eliminarImagenAdicional = async (indice: number) => {
    const url = imagenesAdicionales[indice];
    const eliminada = await eliminarImagen(url);
    
    if (eliminada) {
      const nuevasImagenes = imagenesAdicionales.filter((_, i) => i !== indice);
      onImagenesAdicionalesChange(nuevasImagenes);
      mostrarExito('Imagen eliminada', 'La imagen se ha eliminado correctamente');
    }
  };

  return (
    <div className="space-y-6">
      {/* Imagen principal */}
      <div>
        <Label className="text-base font-medium">Imagen Principal</Label>
        <div className="mt-2">
          {imagenPrincipal ? (
            <div className="relative inline-block">
              <img 
                src={imagenPrincipal} 
                alt="Imagen principal"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                onClick={() => onImagenPrincipalChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <Image className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          <div className="mt-2">
            <input
              type="file"
              accept="image/*"
              onChange={manejarSubidaImagenPrincipal}
              className="hidden"
              id="imagen-principal"
              disabled={subiendo}
            />
            <Label 
              htmlFor="imagen-principal"
              className={cn(
                "inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50",
                subiendo && "opacity-50 cursor-not-allowed"
              )}
            >
              <Upload className="h-4 w-4 mr-2" />
              {subiendo ? 'Subiendo...' : 'Subir Imagen'}
            </Label>
          </div>
        </div>
      </div>

      {/* Imágenes adicionales */}
      <div>
        <Label className="text-base font-medium">Imágenes Adicionales</Label>
        <div className="mt-2 space-y-4">
          {imagenesAdicionales.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {imagenesAdicionales.map((url, indice) => (
                <div key={indice} className="relative">
                  <img 
                    src={url} 
                    alt={`Imagen ${indice + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0"
                    onClick={() => eliminarImagenAdicional(indice)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={manejarSubidaImagenAdicional}
              className="hidden"
              id="imagenes-adicionales"
              disabled={subiendo}
            />
            <Label 
              htmlFor="imagenes-adicionales"
              className={cn(
                "inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50",
                subiendo && "opacity-50 cursor-not-allowed"
              )}
            >
              <Upload className="h-4 w-4 mr-2" />
              {subiendo ? 'Subiendo...' : 'Agregar Imágenes'}
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Puedes seleccionar múltiples archivos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE CALCULADORA DE PRECIOS
// =======================================================

const CalculadoraPrecios: React.FC<{
  control: any;
  watch: any;
  setValue: any;
}> = ({ control, watch, setValue }) => {
  const { calcularPrecioPorMargen, calcularMargenPorPrecio, precioConImpuestos } = useCalculosProducto(watch, setValue);
  
  const costoUnitario = watch('costo_unitario');
  const precioVenta = watch('precio_venta');
  const margenGanancia = watch('margen_ganancia');
  const aplicaIgv = watch('aplica_igv');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Calculadora de Precios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Costo Unitario (S/)</Label>
            <Controller
              name="costo_unitario"
              control={control}
              rules={{ min: { value: 0, message: 'El costo no puede ser negativo' } }}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => {
                    const valor = parseFloat(e.target.value) || 0;
                    field.onChange(valor);
                    setTimeout(calcularMargenPorPrecio, 100);
                  }}
                  icon={<DollarSign className="h-4 w-4" />}
                />
              )}
            />
          </div>

          <div>
            <Label>Precio de Venta (S/)</Label>
            <Controller
              name="precio_venta"
              control={control}
              rules={{ 
                required: 'Precio de venta es requerido',
                min: { value: 0, message: 'El precio no puede ser negativo' }
              }}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => {
                    const valor = parseFloat(e.target.value) || 0;
                    field.onChange(valor);
                    setTimeout(calcularMargenPorPrecio, 100);
                  }}
                  icon={<DollarSign className="h-4 w-4" />}
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Margen de Ganancia (%)</Label>
            <div className="flex space-x-2">
              <Controller
                name="margen_ganancia"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    onChange={(e) => {
                      const valor = parseFloat(e.target.value) || 0;
                      field.onChange(valor);
                      setTimeout(calcularPrecioPorMargen, 100);
                    }}
                    icon={<Percent className="h-4 w-4" />}
                  />
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={calcularPrecioPorMargen}
                disabled={!costoUnitario || !margenGanancia}
              >
                Calcular
              </Button>
            </div>
          </div>

          <div>
            <Label>Precio con IGV (S/)</Label>
            <div className="p-2 bg-gray-50 border rounded-md">
              <span className="text-lg font-semibold text-blue-600">
                {formatearMoneda(precioConImpuestos)}
              </span>
              {aplicaIgv && (
                <p className="text-xs text-gray-500">
                  Incluye IGV (18%)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Precio Mínimo (S/)</Label>
            <Controller
              name="precio_minimo"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  icon={<DollarSign className="h-4 w-4" />}
                />
              )}
            />
          </div>

          <div>
            <Label>Precio Mayorista (S/)</Label>
            <Controller
              name="precio_mayorista"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  icon={<DollarSign className="h-4 w-4" />}
                />
              )}
            />
          </div>
        </div>

        {/* Resumen */}
        {costoUnitario > 0 && precioVenta > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Ganancia:</strong> {formatearMoneda(precioVenta - costoUnitario)}
                </div>
                <div>
                  <strong>Margen:</strong> {formatearPorcentaje(margenGanancia)}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const FormularioProducto: React.FC<PropiedadesFormularioProducto> = ({
  productoInicial,
  modoEdicion = false,
  onGuardar,
  onCancelar,
  onEliminar,
  onDuplicar,
  categoriasDisponibles = [],
  className
}) => {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormularioProductoData>({
    defaultValues: {
      codigo: productoInicial?.codigo || '',
      codigo_barras: productoInicial?.codigo_barras || '',
      codigo_sunat: productoInicial?.codigo_sunat || '',
      nombre: productoInicial?.nombre || '',
      descripcion: productoInicial?.descripcion || '',
      descripcion_corta: productoInicial?.descripcion_corta || '',
      tipo_producto: productoInicial?.tipo_producto || 'bien',
      categoria_id: productoInicial?.categoria_id || null,
      marca: productoInicial?.marca || '',
      modelo: productoInicial?.modelo || '',
      unidad_medida: productoInicial?.unidad_medida || 'NIU',
      peso: productoInicial?.peso || 0,
      dimensiones: productoInicial?.dimensiones || '',
      costo_unitario: productoInicial?.costo_unitario || 0,
      precio_venta: productoInicial?.precio_venta || 0,
      precio_minimo: productoInicial?.precio_minimo || 0,
      precio_mayorista: productoInicial?.precio_mayorista || 0,
      margen_ganancia: productoInicial?.margen_ganancia || 0,
      aplica_igv: productoInicial?.aplica_igv !== undefined ? productoInicial.aplica_igv : true,
      porcentaje_igv: productoInicial?.porcentaje_igv || 18,
      maneja_inventario: productoInicial?.maneja_inventario !== undefined ? productoInicial.maneja_inventario : true,
      stock_minimo: productoInicial?.stock_minimo || 0,
      stock_maximo: productoInicial?.stock_maximo || 0,
      punto_reorden: productoInicial?.punto_reorden || 0,
      ubicacion_almacen: productoInicial?.ubicacion_almacen || '',
      imagen_principal: productoInicial?.imagen_principal || '',
      imagenes_adicionales: productoInicial?.imagenes_adicionales || [],
      activo: productoInicial?.activo !== undefined ? productoInicial.activo : true,
      visible_tienda: productoInicial?.visible_tienda !== undefined ? productoInicial.visible_tienda : true,
      permite_descuento: productoInicial?.permite_descuento !== undefined ? productoInicial.permite_descuento : true,
      descuento_maximo: productoInicial?.descuento_maximo || 0,
      notas_internas: productoInicial?.notas_internas || '',
      etiquetas: productoInicial?.etiquetas || []
    }
  });

  const { mostrarExito, mostrarError } = useNotificaciones();
  const { mostrarCargaConProgreso, ocultarCarga, actualizarProgreso } = useCarga();

  const valoresForm = watch();

  // Generar código automático
  const generarCodigo = useCallback(() => {
    const prefijo = valoresForm.tipo_producto === 'servicio' ? 'SER' : 'PRO';
    const timestamp = Date.now().toString().slice(-6);
    const codigo = `${prefijo}${timestamp}`;
    setValue('codigo', codigo);
  }, [valoresForm.tipo_producto, setValue]);

  // Función para manejar envío
  const manejarEnvio = async (datos: FormularioProductoData) => {
    try {
      mostrarCargaConProgreso('Guardando producto', 'Validando datos...');
      actualizarProgreso(25);

      // Construir datos del producto
      const datosProducto: FormularioProducto = {
        id: productoInicial?.id,
        ...datos,
        fecha_creacion: productoInicial?.fecha_creacion || new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        usuario_creacion: productoInicial?.usuario_creacion || 1,
        usuario_actualizacion: 1
      };

      actualizarProgreso(75, 'Guardando producto...');
      
      await onGuardar(datosProducto);
      
      actualizarProgreso(100, 'Completado');
      mostrarExito('Producto guardado', 'El producto se ha guardado correctamente');
      
    } catch (error) {
      console.error('Error guardando producto:', error);
      mostrarError('Error', 'Error al guardar el producto');
    } finally {
      setTimeout(ocultarCarga, 1000);
    }
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit(manejarEnvio)} className={cn("space-y-6", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>{modoEdicion ? 'Editar' : 'Nuevo'} Producto</span>
              </div>
              <div className="flex space-x-2">
                {!valoresForm.codigo && (
                  <Button type="button" variant="outline" size="sm" onClick={generarCodigo}>
                    <Hash className="h-4 w-4 mr-1" />
                    Generar Código
                  </Button>
                )}
                {modoEdicion && onDuplicar && productoInicial && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDuplicar(productoInicial as Producto)}
                  >
                    Duplicar
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="datos-basicos" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="datos-basicos">Datos Básicos</TabsTrigger>
                <TabsTrigger value="precios">Precios</TabsTrigger>
                <TabsTrigger value="inventario">Inventario</TabsTrigger>
                <TabsTrigger value="imagenes">Imágenes</TabsTrigger>
                <TabsTrigger value="avanzado">Avanzado</TabsTrigger>
              </TabsList>

              {/* Tab Datos Básicos */}
              <TabsContent value="datos-basicos" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Código *</Label>
                    <Controller
                      name="codigo"
                      control={control}
                      rules={{ required: 'Código es requerido' }}
                      render={({ field }) => (
                        <Input {...field} placeholder="Código único del producto" />
                      )}
                    />
                    {errors.codigo && (
                      <p className="text-sm text-red-600 mt-1">{errors.codigo.message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Código de Barras</Label>
                    <Controller
                      name="codigo_barras"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="EAN13, UPC..." />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Tipo de Producto</Label>
                    <Controller
                      name="tipo_producto"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_PRODUCTO.map(tipo => (
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
                </div>

                <div>
                  <Label>Nombre del Producto *</Label>
                  <Controller
                    name="nombre"
                    control={control}
                    rules={{ required: 'Nombre es requerido' }}
                    render={({ field }) => (
                      <Input {...field} placeholder="Nombre descriptivo del producto" />
                    )}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-600 mt-1">{errors.nombre.message}</p>
                  )}
                </div>

                <div>
                  <Label>Descripción Corta</Label>
                  <Controller
                    name="descripcion_corta"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Descripción breve para listados" />
                    )}
                  />
                </div>

                <div>
                  <Label>Descripción Completa</Label>
                  <Controller
                    name="descripcion"
                    control={control}
                    render={({ field }) => (
                      <Textarea 
                        {...field} 
                        placeholder="Descripción detallada del producto..."
                        rows={4}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Categoría</Label>
                    <Controller
                      name="categoria_id"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          value={field.value?.toString() || ''} 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriasDisponibles.map(categoria => (
                              <SelectItem key={categoria.id} value={categoria.id.toString()}>
                                {categoria.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label>Marca</Label>
                    <Controller
                      name="marca"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Marca del producto" />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Modelo</Label>
                    <Controller
                      name="modelo"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Modelo del producto" />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Unidad de Medida</Label>
                    <Controller
                      name="unidad_medida"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIDADES_COMUNES.map(unidad => (
                              <SelectItem key={unidad.value} value={unidad.value}>
                                <div>
                                  <div className="font-medium">{unidad.label}</div>
                                  <div className="text-xs text-gray-500">{unidad.descripcion}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label>Peso (kg)</Label>
                    <Controller
                      name="peso"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Dimensiones</Label>
                    <Controller
                      name="dimensiones"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Largo x Ancho x Alto" />
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab Precios */}
              <TabsContent value="precios">
                <CalculadoraPrecios
                  control={control}
                  watch={watch}
                  setValue={setValue}
                />

                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Configuración de Impuestos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="aplica_igv"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              id="aplica-igv"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label htmlFor="aplica-igv">Aplica IGV</Label>
                      </div>

                      {valoresForm.aplica_igv && (
                        <div className="w-32">
                          <Label>Porcentaje IGV (%)</Label>
                          <Controller
                            name="porcentaje_igv"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 18)}
                              />
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab Inventario */}
              <TabsContent value="inventario" className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Controller
                    name="maneja_inventario"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="maneja-inventario"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="maneja-inventario">Manejar inventario</Label>
                </div>

                {valoresForm.maneja_inventario && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Stock Mínimo</Label>
                      <Controller
                        name="stock_minimo"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Label>Stock Máximo</Label>
                      <Controller
                        name="stock_maximo"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Label>Punto de Reorden</Label>
                      <Controller
                        name="punto_reorden"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        )}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label>Ubicación en Almacén</Label>
                  <Controller
                    name="ubicacion_almacen"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Pasillo A, Estante 3, Nivel 2..." />
                    )}
                  />
                </div>
              </TabsContent>

              {/* Tab Imágenes */}
              <TabsContent value="imagenes">
                <GestorImagenes
                  imagenPrincipal={valoresForm.imagen_principal}
                  imagenesAdicionales={valoresForm.imagenes_adicionales}
                  onImagenPrincipalChange={(url) => setValue('imagen_principal', url)}
                  onImagenesAdicionalesChange={(urls) => setValue('imagenes_adicionales', urls)}
                />
              </TabsContent>

              {/* Tab Avanzado */}
              <TabsContent value="avanzado" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Configuración de Ventas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="permite_descuento"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              id="permite-descuento"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label htmlFor="permite-descuento">Permite descuentos</Label>
                      </div>

                      {valoresForm.permite_descuento && (
                        <div>
                          <Label>Descuento Máximo (%)</Label>
                          <Controller
                            name="descuento_maximo"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Controller
                          name="visible_tienda"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              id="visible-tienda"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label htmlFor="visible-tienda">Visible en tienda</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Controller
                          name="activo"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              id="activo"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label htmlFor="activo">Producto activo</Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Información Adicional</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label>Notas Internas</Label>
                        <Controller
                          name="notas_internas"
                          control={control}
                          render={({ field }) => (
                            <Textarea 
                              {...field} 
                              placeholder="Notas internas del producto..."
                              rows={4}
                            />
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-between">
          <div>
            {modoEdicion && onEliminar && productoInicial?.id && (
              <Button 
                type="button" 
                variant="destructive"
                onClick={() => onEliminar(productoInicial.id!)}
              >
                <X className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onCancelar}>
              Cancelar
            </Button>
            
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {modoEdicion ? 'Actualizar' : 'Guardar'} Producto
            </Button>
          </div>
        </div>
      </form>
    </TooltipProvider>
  );
};

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default FormularioProducto;