/**
 * Formulario de Empresa - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Formulario completo para configuración de datos de empresa emisora
 */

import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Building, FileText, Upload, Save, X, Shield, Globe, 
  Mail, Phone, MapPin, CreditCard, Eye, EyeOff, Key,
  Settings, Zap, Image, CheckCircle, AlertTriangle
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
import { validarRuc, validarEmail, validarTelefono } from '../../utils/validaciones';
import { formatearTelefono, formatearRuc } from '../../utils/formatters';
import { DEPARTAMENTOS_PERU, REGIMENES_TRIBUTARIOS } from '../../utils/constants';
import { useApi } from '../../hooks/useApi';
import { useNotificaciones } from '../comunes/Notificaciones';
import { useCarga } from '../comunes/ComponenteCarga';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface ConfiguracionEmpresa {
  id?: number;
  
  // Datos básicos
  razon_social: string;
  nombre_comercial: string;
  ruc: string;
  
  // Contacto
  email: string;
  telefono: string;
  web: string;
  
  // Dirección
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  codigo_postal: string;
  ubigeo: string;
  
  // Configuración tributaria
  regimen_tributario: string;
  actividad_economica: string;
  codigo_actividad: string;
  
  // Certificado digital
  certificado_digital: string;
  password_certificado: string;
  fecha_vencimiento_certificado: string;
  
  // Configuración SUNAT
  usuario_sunat: string;
  password_sunat: string;
  endpoint_sunat: string;
  modo_produccion: boolean;
  
  // Configuración de documentos
  logo_empresa: string;
  serie_factura: string;
  serie_boleta: string;
  serie_nota_credito: string;
  serie_nota_debito: string;
  
  // Configuración adicional
  moneda_predeterminada: string;
  igv_predeterminado: number;
  incluir_igv_precios: boolean;
  
  // Metadatos
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  activo: boolean;
}

export interface PropiedadesFormularioEmpresa {
  empresaInicial?: Partial<ConfiguracionEmpresa>;
  onGuardar: (datos: ConfiguracionEmpresa) => Promise<void>;
  onCancelar: () => void;
  onProbarConexion?: () => Promise<boolean>;
  className?: string;
}

// =======================================================
// CONFIGURACIÓN
// =======================================================

const REGIMENES_DISPONIBLES = [
  { value: 'general', label: 'Régimen General', descripcion: 'Para empresas con ingresos mayores a 1700 UIT' },
  { value: 'especial', label: 'Régimen Especial de Renta', descripcion: 'Para empresas con ingresos hasta 525 UIT' },
  { value: 'mype', label: 'Régimen MYPE Tributario', descripcion: 'Para micro y pequeñas empresas' },
  { value: 'nuevo_rus', label: 'Nuevo RUS', descripcion: 'Régimen Único Simplificado' }
];

const MONEDAS = [
  { value: 'PEN', label: 'Soles (PEN)', simbolo: 'S/' },
  { value: 'USD', label: 'Dólares (USD)', simbolo: '$' },
  { value: 'EUR', label: 'Euros (EUR)', simbolo: '€' }
];

const ENDPOINTS_SUNAT = {
  produccion: {
    facturacion: 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService',
    consultas: 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billConsultService'
  },
  homologacion: {
    facturacion: 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService',
    consultas: 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billConsultService'
  }
};

// =======================================================
// HOOK PARA CONSULTA RUC
// =======================================================

const useConsultaRuc = () => {
  const [consultando, setConsultando] = useState(false);
  const [datosRuc, setDatosRuc] = useState<any>(null);
  const { api } = useApi();

  const consultarRuc = useCallback(async (ruc: string) => {
    if (!ruc || ruc.length !== 11) return null;

    setConsultando(true);
    try {
      const response = await api.get('/empresas/consultar-ruc/', {
        params: { ruc }
      });
      setDatosRuc(response.data);
      return response.data;
    } catch (error) {
      console.error('Error consultando RUC:', error);
      return null;
    } finally {
      setConsultando(false);
    }
  }, [api]);

  return { consultarRuc, consultando, datosRuc };
};

// =======================================================
// HOOK PARA GESTIÓN DE CERTIFICADOS
// =======================================================

const useGestionCertificados = () => {
  const [subiendo, setSubiendo] = useState(false);
  const [validando, setValidando] = useState(false);
  const { api } = useApi();

  const subirCertificado = useCallback(async (archivo: File, password: string): Promise<string | null> => {
    if (!archivo) return null;

    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('certificado', archivo);
      formData.append('password', password);

      const response = await api.post('/empresas/subir-certificado/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.ruta;
    } catch (error) {
      console.error('Error subiendo certificado:', error);
      throw error;
    } finally {
      setSubiendo(false);
    }
  }, [api]);

  const validarCertificado = useCallback(async (ruta: string, password: string): Promise<any> => {
    setValidando(true);
    try {
      const response = await api.post('/empresas/validar-certificado/', {
        ruta,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Error validando certificado:', error);
      throw error;
    } finally {
      setValidando(false);
    }
  }, [api]);

  return { subirCertificado, validarCertificado, subiendo, validando };
};

// =======================================================
// COMPONENTE SECCIÓN RUC
// =======================================================

const SeccionRuc: React.FC<{
  control: any;
  watch: any;
  setValue: any;
  errors: any;
}> = ({ control, watch, setValue, errors }) => {
  const ruc = watch('ruc');
  const { consultarRuc, consultando, datosRuc } = useConsultaRuc();
  const { mostrarExito, mostrarError } = useNotificaciones();

  const manejarConsultaRuc = async () => {
    if (!ruc || ruc.length !== 11) {
      mostrarError('RUC inválido', 'El RUC debe tener 11 dígitos');
      return;
    }

    const datos = await consultarRuc(ruc);
    if (datos) {
      setValue('razon_social', datos.razon_social || '');
      setValue('direccion', datos.direccion || '');
      setValue('actividad_economica', datos.actividad_economica || '');
      setValue('codigo_actividad', datos.codigo_actividad || '');
      mostrarExito('Datos obtenidos', 'Información actualizada desde SUNAT');
    } else {
      mostrarError('Sin datos', 'No se encontraron datos para este RUC');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>RUC de la Empresa *</Label>
        <div className="flex space-x-2">
          <Controller
            name="ruc"
            control={control}
            rules={{ 
              required: 'RUC es requerido',
              validate: (value) => validarRuc(value) || 'RUC inválido'
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="20123456789"
                maxLength={11}
                onChange={(e) => {
                  const valor = e.target.value.replace(/[^0-9]/g, '');
                  field.onChange(valor);
                }}
              />
            )}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={manejarConsultaRuc}
                  disabled={consultando || !ruc || ruc.length !== 11}
                >
                  {consultando ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Consultar datos en SUNAT</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {errors.ruc && (
          <p className="text-sm text-red-600 mt-1">{errors.ruc.message}</p>
        )}
      </div>

      {datosRuc && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="text-sm">
              <div><strong>Estado:</strong> {datosRuc.estado || 'Activo'}</div>
              <div><strong>Condición:</strong> {datosRuc.condicion || 'Habido'}</div>
              {datosRuc.fecha_alta && (
                <div><strong>Fecha de Alta:</strong> {datosRuc.fecha_alta}</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE GESTIÓN DE CERTIFICADOS
// =======================================================

const GestionCertificados: React.FC<{
  control: any;
  certificadoActual: string;
  onCertificadoChange: (ruta: string) => void;
}> = ({ control, certificadoActual, onCertificadoChange }) => {
  const [archivoCertificado, setArchivoCertificado] = useState<File | null>(null);
  const [passwordTemporal, setPasswordTemporal] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [estadoCertificado, setEstadoCertificado] = useState<any>(null);
  
  const { subirCertificado, validarCertificado, subiendo, validando } = useGestionCertificados();
  const { mostrarExito, mostrarError } = useNotificaciones();

  const manejarSeleccionArchivo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (archivo) {
      if (!archivo.name.toLowerCase().endsWith('.p12') && !archivo.name.toLowerCase().endsWith('.pfx')) {
        mostrarError('Archivo inválido', 'Solo se permiten archivos .p12 o .pfx');
        return;
      }
      setArchivoCertificado(archivo);
    }
  };

  const manejarSubidaCertificado = async () => {
    if (!archivoCertificado || !passwordTemporal) {
      mostrarError('Datos incompletos', 'Selecciona un archivo y proporciona la contraseña');
      return;
    }

    try {
      const rutaCertificado = await subirCertificado(archivoCertificado, passwordTemporal);
      if (rutaCertificado) {
        onCertificadoChange(rutaCertificado);
        
        // Validar certificado
        const estado = await validarCertificado(rutaCertificado, passwordTemporal);
        setEstadoCertificado(estado);
        
        mostrarExito('Certificado subido', 'El certificado se ha subido y validado correctamente');
        setArchivoCertificado(null);
        setPasswordTemporal('');
      }
    } catch (error) {
      mostrarError('Error', 'Error al subir o validar el certificado');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Certificado Digital (.p12/.pfx)</Label>
        
        {certificadoActual ? (
          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Certificado configurado</span>
                </div>
                {estadoCertificado && (
                  <div className="mt-2 text-sm text-green-700">
                    <div><strong>Válido hasta:</strong> {estadoCertificado.fecha_vencimiento}</div>
                    <div><strong>Emisor:</strong> {estadoCertificado.emisor}</div>
                    <div><strong>Sujeto:</strong> {estadoCertificado.sujeto}</div>
                  </div>
                )}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => onCertificadoChange('')}
              >
                Cambiar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <input
                type="file"
                accept=".p12,.pfx"
                onChange={manejarSeleccionArchivo}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            {archivoCertificado && (
              <div className="space-y-3">
                <div>
                  <Label>Contraseña del Certificado</Label>
                  <div className="relative">
                    <Input
                      type={mostrarPassword ? 'text' : 'password'}
                      value={passwordTemporal}
                      onChange={(e) => setPasswordTemporal(e.target.value)}
                      placeholder="Contraseña del certificado"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button
                  type="button"
                  onClick={manejarSubidaCertificado}
                  disabled={subiendo || validando || !passwordTemporal}
                >
                  {subiendo || validando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {subiendo ? 'Subiendo...' : 'Validando...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir y Validar
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <Label>Contraseña del Certificado *</Label>
        <Controller
          name="password_certificado"
          control={control}
          rules={{ required: 'Contraseña del certificado es requerida' }}
          render={({ field }) => (
            <div className="relative">
              <Input
                {...field}
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Contraseña para firmar documentos"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}
        />
      </div>

      <div>
        <Label>Fecha de Vencimiento del Certificado</Label>
        <Controller
          name="fecha_vencimiento_certificado"
          control={control}
          render={({ field }) => (
            <Input type="date" {...field} />
          )}
        />
        <p className="text-xs text-gray-500 mt-1">
          Configura una fecha para recibir alertas antes del vencimiento
        </p>
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const FormularioEmpresa: React.FC<PropiedadesFormularioEmpresa> = ({
  empresaInicial,
  onGuardar,
  onCancelar,
  onProbarConexion,
  className
}) => {
  const [mostrarPasswordSunat, setMostrarPasswordSunat] = useState(false);
  const [probandoConexion, setProbandoConexion] = useState(false);
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ConfiguracionEmpresa>({
    defaultValues: {
      razon_social: empresaInicial?.razon_social || '',
      nombre_comercial: empresaInicial?.nombre_comercial || '',
      ruc: empresaInicial?.ruc || '',
      email: empresaInicial?.email || '',
      telefono: empresaInicial?.telefono || '',
      web: empresaInicial?.web || '',
      direccion: empresaInicial?.direccion || '',
      distrito: empresaInicial?.distrito || '',
      provincia: empresaInicial?.provincia || '',
      departamento: empresaInicial?.departamento || '',
      codigo_postal: empresaInicial?.codigo_postal || '',
      ubigeo: empresaInicial?.ubigeo || '',
      regimen_tributario: empresaInicial?.regimen_tributario || 'general',
      actividad_economica: empresaInicial?.actividad_economica || '',
      codigo_actividad: empresaInicial?.codigo_actividad || '',
      certificado_digital: empresaInicial?.certificado_digital || '',
      password_certificado: empresaInicial?.password_certificado || '',
      fecha_vencimiento_certificado: empresaInicial?.fecha_vencimiento_certificado || '',
      usuario_sunat: empresaInicial?.usuario_sunat || '',
      password_sunat: empresaInicial?.password_sunat || '',
      endpoint_sunat: empresaInicial?.endpoint_sunat || ENDPOINTS_SUNAT.homologacion.facturacion,
      modo_produccion: empresaInicial?.modo_produccion || false,
      logo_empresa: empresaInicial?.logo_empresa || '',
      serie_factura: empresaInicial?.serie_factura || 'F001',
      serie_boleta: empresaInicial?.serie_boleta || 'B001',
      serie_nota_credito: empresaInicial?.serie_nota_credito || 'FC01',
      serie_nota_debito: empresaInicial?.serie_nota_debito || 'FD01',
      moneda_predeterminada: empresaInicial?.moneda_predeterminada || 'PEN',
      igv_predeterminado: empresaInicial?.igv_predeterminado || 18,
      incluir_igv_precios: empresaInicial?.incluir_igv_precios !== undefined ? empresaInicial.incluir_igv_precios : false,
      activo: empresaInicial?.activo !== undefined ? empresaInicial.activo : true
    }
  });

  const { mostrarExito, mostrarError } = useNotificaciones();
  const { mostrarCargaConProgreso, ocultarCarga, actualizarProgreso } = useCarga();

  const valoresForm = watch();

  // Función para probar conexión SUNAT
  const manejarProbarConexion = async () => {
    if (!onProbarConexion) return;
    
    setProbandoConexion(true);
    try {
      const exito = await onProbarConexion();
      if (exito) {
        mostrarExito('Conexión exitosa', 'La conexión con SUNAT se estableció correctamente');
      } else {
        mostrarError('Error de conexión', 'No se pudo conectar con SUNAT. Verifica tus credenciales');
      }
    } catch (error) {
      mostrarError('Error', 'Error al probar la conexión con SUNAT');
    } finally {
      setProbandoConexion(false);
    }
  };

  // Función para manejar envío
  const manejarEnvio = async (datos: ConfiguracionEmpresa) => {
    try {
      mostrarCargaConProgreso('Guardando configuración', 'Validando datos de empresa...');
      actualizarProgreso(25);

      // Validaciones adicionales
      if (!datos.certificado_digital) {
        mostrarError('Certificado requerido', 'Debe subir un certificado digital válido');
        return;
      }

      if (!datos.usuario_sunat || !datos.password_sunat) {
        mostrarError('Credenciales SUNAT', 'Debe configurar las credenciales de SUNAT');
        return;
      }

      actualizarProgreso(50, 'Guardando configuración...');

      // Construir datos finales
      const datosFinales: ConfiguracionEmpresa = {
        ...datos,
        fecha_actualizacion: new Date().toISOString()
      };

      actualizarProgreso(75, 'Finalizando...');

      await onGuardar(datosFinales);

      actualizarProgreso(100, 'Completado');
      mostrarExito('Configuración guardada', 'Los datos de la empresa se han guardado correctamente');

    } catch (error) {
      console.error('Error guardando empresa:', error);
      mostrarError('Error', 'Error al guardar la configuración de la empresa');
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
              <Building className="h-5 w-5" />
              <span>Configuración de Empresa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="datos-basicos" className="space-y-4">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="datos-basicos">Datos Básicos</TabsTrigger>
                <TabsTrigger value="contacto">Contacto</TabsTrigger>
                <TabsTrigger value="tributario">Tributario</TabsTrigger>
                <TabsTrigger value="certificado">Certificado</TabsTrigger>
                <TabsTrigger value="sunat">SUNAT</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
              </TabsList>

              {/* Tab Datos Básicos */}
              <TabsContent value="datos-basicos" className="space-y-4">
                <SeccionRuc
                  control={control}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                />

                <div>
                  <Label>Razón Social *</Label>
                  <Controller
                    name="razon_social"
                    control={control}
                    rules={{ required: 'Razón social es requerida' }}
                    render={({ field }) => (
                      <Input {...field} placeholder="Razón social de la empresa" />
                    )}
                  />
                  {errors.razon_social && (
                    <p className="text-sm text-red-600 mt-1">{errors.razon_social.message}</p>
                  )}
                </div>

                <div>
                  <Label>Nombre Comercial</Label>
                  <Controller
                    name="nombre_comercial"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Nombre comercial (opcional)" />
                    )}
                  />
                </div>

                <div>
                  <Label>Logo de la Empresa</Label>
                  <div className="space-y-2">
                    {valoresForm.logo_empresa ? (
                      <div className="flex items-center space-x-4">
                        <img 
                          src={valoresForm.logo_empresa} 
                          alt="Logo" 
                          className="w-16 h-16 object-contain border rounded"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setValue('logo_empresa', '')}
                        >
                          Cambiar Logo
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Subir Logo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab Contacto */}
              <TabsContent value="contacto" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Controller
                      name="email"
                      control={control}
                      rules={{ 
                        required: 'Email es requerido',
                        validate: (value) => validarEmail(value) || 'Email inválido'
                      }}
                      render={({ field }) => (
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="contacto@empresa.com"
                          icon={<Mail className="h-4 w-4" />}
                        />
                      )}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Teléfono</Label>
                    <Controller
                      name="telefono"
                      control={control}
                      rules={{ 
                        validate: (value) => {
                          if (!value) return true;
                          return validarTelefono(value) || 'Teléfono inválido';
                        }
                      }}
                      render={({ field }) => (
                        <Input 
                          {...field} 
                          placeholder="+51 1 234-5678"
                          icon={<Phone className="h-4 w-4" />}
                        />
                      )}
                    />
                    {errors.telefono && (
                      <p className="text-sm text-red-600 mt-1">{errors.telefono.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Sitio Web</Label>
                  <Controller
                    name="web"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        {...field} 
                        placeholder="https://www.empresa.com"
                        icon={<Globe className="h-4 w-4" />}
                      />
                    )}
                  />
                </div>

                <div>
                  <Label>Dirección *</Label>
                  <Controller
                    name="direccion"
                    control={control}
                    rules={{ required: 'Dirección es requerida' }}
                    render={({ field }) => (
                      <Textarea 
                        {...field} 
                        placeholder="Dirección completa de la empresa..."
                        rows={2}
                      />
                    )}
                  />
                  {errors.direccion && (
                    <p className="text-sm text-red-600 mt-1">{errors.direccion.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Departamento</Label>
                    <Controller
                      name="departamento"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(DEPARTAMENTOS_PERU).map(dep => (
                              <SelectItem key={dep} value={dep}>
                                {DEPARTAMENTOS_PERU[dep]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label>Código Postal</Label>
                    <Controller
                      name="codigo_postal"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="15001" />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Ubigeo</Label>
                    <Controller
                      name="ubigeo"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="150101" />
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab Tributario */}
              <TabsContent value="tributario" className="space-y-4">
                <div>
                  <Label>Régimen Tributario</Label>
                  <Controller
                    name="regimen_tributario"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REGIMENES_DISPONIBLES.map(regimen => (
                            <SelectItem key={regimen.value} value={regimen.value}>
                              <div>
                                <div className="font-medium">{regimen.label}</div>
                                <div className="text-xs text-gray-500">{regimen.descripcion}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Actividad Económica</Label>
                    <Controller
                      name="actividad_economica"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Descripción de la actividad" />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Código de Actividad (CIIU)</Label>
                    <Controller
                      name="codigo_actividad"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="1234" />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Moneda Predeterminada</Label>
                    <Controller
                      name="moneda_predeterminada"
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

                  <div>
                    <Label>IGV Predeterminado (%)</Label>
                    <Controller
                      name="igv_predeterminado"
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

                  <div className="flex items-center space-x-2 mt-6">
                    <Controller
                      name="incluir_igv_precios"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="incluir-igv"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="incluir-igv">Precios incluyen IGV</Label>
                  </div>
                </div>
              </TabsContent>

              {/* Tab Certificado */}
              <TabsContent value="certificado">
                <GestionCertificados
                  control={control}
                  certificadoActual={valoresForm.certificado_digital}
                  onCertificadoChange={(ruta) => setValue('certificado_digital', ruta)}
                />
              </TabsContent>

              {/* Tab SUNAT */}
              <TabsContent value="sunat" className="space-y-4">
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Importante:</strong> Estas credenciales son necesarias para la comunicación con SUNAT. 
                    Mantén esta información segura y actualizada.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Usuario SUNAT *</Label>
                    <Controller
                      name="usuario_sunat"
                      control={control}
                      rules={{ required: 'Usuario SUNAT es requerido' }}
                      render={({ field }) => (
                        <Input {...field} placeholder="20123456789USUARIO01" />
                      )}
                    />
                    {errors.usuario_sunat && (
                      <p className="text-sm text-red-600 mt-1">{errors.usuario_sunat.message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Contraseña SUNAT *</Label>
                    <div className="relative">
                      <Controller
                        name="password_sunat"
                        control={control}
                        rules={{ required: 'Contraseña SUNAT es requerida' }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type={mostrarPasswordSunat ? 'text' : 'password'}
                            placeholder="Contraseña de SUNAT"
                          />
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarPasswordSunat(!mostrarPasswordSunat)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {mostrarPasswordSunat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password_sunat && (
                      <p className="text-sm text-red-600 mt-1">{errors.password_sunat.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Endpoint SUNAT</Label>
                  <Controller
                    name="endpoint_sunat"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ENDPOINTS_SUNAT.homologacion.facturacion}>
                            Homologación (Pruebas)
                          </SelectItem>
                          <SelectItem value={ENDPOINTS_SUNAT.produccion.facturacion}>
                            Producción
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="modo_produccion"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="modo-produccion"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="modo-produccion">Modo Producción</Label>
                  {valoresForm.modo_produccion && (
                    <Badge variant="destructive" className="ml-2">
                      PRODUCCIÓN
                    </Badge>
                  )}
                </div>

                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={manejarProbarConexion}
                    disabled={probandoConexion || !valoresForm.usuario_sunat || !valoresForm.password_sunat}
                  >
                    {probandoConexion ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                        Probando...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Probar Conexión
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Tab Documentos */}
              <TabsContent value="documentos" className="space-y-4">
                <h3 className="text-lg font-semibold">Configuración de Series</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Serie Facturas</Label>
                    <Controller
                      name="serie_factura"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="F001" />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Serie Boletas</Label>
                    <Controller
                      name="serie_boleta"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="B001" />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Serie Notas de Crédito</Label>
                    <Controller
                      name="serie_nota_credito"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="FC01" />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Serie Notas de Débito</Label>
                    <Controller
                      name="serie_nota_debito"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="FD01" />
                      )}
                    />
                  </div>
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Las series deben estar autorizadas por SUNAT. Asegúrate de que las series configuradas 
                    correspondan a las autorizadas para tu empresa.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
};

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default FormularioEmpresa;