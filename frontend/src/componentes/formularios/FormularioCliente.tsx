/**
 * Formulario de Cliente - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Formulario completo para gestión de clientes con validaciones SUNAT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  User, Building, Mail, Phone, MapPin, CreditCard, 
  Save, X, Search, AlertTriangle, CheckCircle, Eye, EyeOff
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

// Importar tipos y utilidades
import { Cliente, FormularioCliente, TipoCliente, ContactoCliente } from '../../types/cliente';
import { 
  validarRuc, 
  validarDni, 
  validarEmail, 
  validarTelefono,
  validarDocumentoAutomatico 
} from '../../utils/validaciones';
import { formatearTelefono, formatearDocumento } from '../../utils/formatters';
import { DEPARTAMENTOS_PERU, PROVINCIAS_PERU, DISTRITOS_PERU } from '../../utils/constants';
import { useApi } from '../../hooks/useApi';
import { useNotificaciones } from '../comunes/Notificaciones';
import { useCarga } from '../comunes/ComponenteCarga';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesFormularioCliente {
  clienteInicial?: Partial<Cliente>;
  modoEdicion?: boolean;
  onGuardar: (datos: FormularioCliente) => Promise<void>;
  onCancelar: () => void;
  onEliminar?: (id: number) => Promise<void>;
  className?: string;
}

interface FormularioClienteData {
  // Datos básicos
  tipo_cliente: TipoCliente;
  tipo_documento: string;
  numero_documento: string;
  razon_social: string;
  nombre_comercial: string;
  
  // Contacto
  email: string;
  telefono: string;
  celular: string;
  web: string;
  
  // Dirección
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  codigo_postal: string;
  ubigeo: string;
  
  // Datos comerciales
  limite_credito: number;
  dias_credito: number;
  es_agente_retencion: boolean;
  es_buen_contribuyente: boolean;
  
  // Contactos adicionales
  contactos: ContactoCliente[];
  
  // Observaciones
  observaciones: string;
  notas_internas: string;
  
  // Control
  activo: boolean;
}

// =======================================================
// CONFIGURACIÓN
// =======================================================

const TIPOS_DOCUMENTO = [
  { value: '1', label: 'DNI', descripcion: 'Documento Nacional de Identidad', longitud: 8 },
  { value: '4', label: 'Carnet de Extranjería', descripcion: 'Para extranjeros', longitud: 12 },
  { value: '6', label: 'RUC', descripcion: 'Registro Único de Contribuyentes', longitud: 11 },
  { value: '7', label: 'Pasaporte', descripcion: 'Documento de viaje', longitud: 12 },
  { value: '11', label: 'Partida de Nacimiento', descripcion: 'Para menores', longitud: 15 },
  { value: '0', label: 'Otros', descripcion: 'Otros tipos de documento', longitud: 15 }
];

const TIPOS_CLIENTE: Array<{value: TipoCliente; label: string; descripcion: string}> = [
  { value: 'natural', label: 'Persona Natural', descripcion: 'Persona física individual' },
  { value: 'juridica', label: 'Persona Jurídica', descripcion: 'Empresa o institución' }
];

// =======================================================
// HOOK PARA CONSULTA SUNAT
// =======================================================

const useConsultaSunat = () => {
  const [consultando, setConsultando] = useState(false);
  const { api } = useApi();

  const consultarSunat = useCallback(async (documento: string, tipoDocumento: string) => {
    if (!documento || documento.length < 8) return null;

    setConsultando(true);
    try {
      const endpoint = tipoDocumento === '6' ? '/clientes/consultar-ruc/' : '/clientes/consultar-dni/';
      const response = await api.get(endpoint, {
        params: { documento }
      });
      return response.data;
    } catch (error) {
      console.error('Error consultando SUNAT:', error);
      return null;
    } finally {
      setConsultando(false);
    }
  }, [api]);

  return { consultarSunat, consultando };
};

// =======================================================
// COMPONENTE SELECTOR DE UBICACIÓN
// =======================================================

const SelectorUbicacion: React.FC<{
  departamento: string;
  provincia: string;
  distrito: string;
  onDepartamentoChange: (value: string) => void;
  onProvinciaChange: (value: string) => void;
  onDistritoChange: (value: string) => void;
}> = ({ 
  departamento, 
  provincia, 
  distrito, 
  onDepartamentoChange, 
  onProvinciaChange, 
  onDistritoChange 
}) => {
  const provinciasDisponibles = departamento ? PROVINCIAS_PERU[departamento] || [] : [];
  const distritosDisponibles = provincia ? DISTRITOS_PERU[provincia] || [] : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label>Departamento</Label>
        <Select value={departamento} onValueChange={onDepartamentoChange}>
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
      </div>

      <div>
        <Label>Provincia</Label>
        <Select value={provincia} onValueChange={onProvinciaChange} disabled={!departamento}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            {provinciasDisponibles.map(prov => (
              <SelectItem key={prov.codigo} value={prov.codigo}>
                {prov.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Distrito</Label>
        <Select value={distrito} onValueChange={onDistritoChange} disabled={!provincia}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            {distritosDisponibles.map(dist => (
              <SelectItem key={dist.codigo} value={dist.codigo}>
                {dist.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE DATOS DE DOCUMENTO
// =======================================================

const SeccionDocumento: React.FC<{
  control: any;
  watch: any;
  setValue: any;
  errors: any;
}> = ({ control, watch, setValue, errors }) => {
  const [datosConsultados, setDatosConsultados] = useState<any>(null);
  const { consultarSunat, consultando } = useConsultaSunat();
  const { mostrarExito, mostrarAdvertencia } = useNotificaciones();

  const tipoDocumento = watch('tipo_documento');
  const numeroDocumento = watch('numero_documento');
  const tipoCliente = watch('tipo_cliente');

  const tipoDocumentoInfo = TIPOS_DOCUMENTO.find(t => t.value === tipoDocumento);

  // Validación en tiempo real del documento
  const validarDocumento = useCallback((documento: string, tipo: string) => {
    if (!documento) return null;

    const validacion = validarDocumentoAutomatico(documento);
    if (!validacion.esValido) {
      return validacion.mensaje;
    }

    // Validaciones específicas adicionales
    if (tipo === '6' && tipoCliente === 'natural') {
      return 'Las personas naturales no pueden tener RUC como documento principal';
    }

    if (tipo === '1' && tipoCliente === 'juridica') {
      return 'Las personas jurídicas deben tener RUC';
    }

    return null;
  }, [tipoCliente]);

  // Consultar SUNAT cuando el documento sea válido
  const manejarConsultaSunat = async () => {
    if (!numeroDocumento || numeroDocumento.length < 8) return;

    const error = validarDocumento(numeroDocumento, tipoDocumento);
    if (error) {
      mostrarAdvertencia('Documento inválido', error);
      return;
    }

    const datos = await consultarSunat(numeroDocumento, tipoDocumento);
    if (datos) {
      setDatosConsultados(datos);
      
      // Auto-completar campos si vienen datos
      if (datos.razon_social || datos.nombre) {
        setValue('razon_social', datos.razon_social || datos.nombre);
      }
      if (datos.direccion) {
        setValue('direccion', datos.direccion);
      }
      if (datos.estado) {
        const activo = datos.estado.toLowerCase().includes('activo');
        setValue('activo', activo);
      }

      mostrarExito('Datos obtenidos', 'Información actualizada desde SUNAT');
    } else {
      mostrarAdvertencia('Sin datos', 'No se encontraron datos en SUNAT para este documento');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Cliente</Label>
          <Controller
            name="tipo_cliente"
            control={control}
            rules={{ required: 'Tipo de cliente es requerido' }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_CLIENTE.map(tipo => (
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
          {errors.tipo_cliente && (
            <p className="text-sm text-red-600 mt-1">{errors.tipo_cliente.message}</p>
          )}
        </div>

        <div>
          <Label>Tipo de Documento</Label>
          <Controller
            name="tipo_documento"
            control={control}
            rules={{ required: 'Tipo de documento es requerido' }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
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
          {errors.tipo_documento && (
            <p className="text-sm text-red-600 mt-1">{errors.tipo_documento.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Número de Documento</Label>
          <div className="flex space-x-2">
            <Controller
              name="numero_documento"
              control={control}
              rules={{ 
                required: 'Número de documento es requerido',
                validate: (value) => validarDocumento(value, tipoDocumento) || true
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={tipoDocumentoInfo ? `${tipoDocumentoInfo.longitud} dígitos` : 'Número...'}
                  maxLength={tipoDocumentoInfo?.longitud}
                  onChange={(e) => {
                    // Solo números para documentos que lo requieren
                    if (['1', '6', '4'].includes(tipoDocumento)) {
                      const valor = e.target.value.replace(/[^0-9]/g, '');
                      field.onChange(valor);
                    } else {
                      field.onChange(e.target.value);
                    }
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
                    size="sm"
                    onClick={manejarConsultaSunat}
                    disabled={consultando || !numeroDocumento || numeroDocumento.length < 8}
                  >
                    {consultando ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Consultar datos en SUNAT</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {errors.numero_documento && (
            <p className="text-sm text-red-600 mt-1">{errors.numero_documento.message}</p>
          )}
          {tipoDocumentoInfo && (
            <p className="text-xs text-gray-500 mt-1">
              Debe tener exactamente {tipoDocumentoInfo.longitud} caracteres
            </p>
          )}
        </div>

        {datosConsultados && (
          <div className="md:col-span-1">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="text-sm">
                  <div><strong>Estado SUNAT:</strong> {datosConsultados.estado || 'Consultado'}</div>
                  {datosConsultados.condicion && (
                    <div><strong>Condición:</strong> {datosConsultados.condicion}</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE CONTACTOS ADICIONALES
// =======================================================

const SeccionContactos: React.FC<{
  contactos: ContactoCliente[];
  onContactosChange: (contactos: ContactoCliente[]) => void;
}> = ({ contactos, onContactosChange }) => {
  const agregarContacto = () => {
    const nuevoContacto: ContactoCliente = {
      id: Date.now(),
      nombres: '',
      apellidos: '',
      cargo: '',
      email: '',
      telefono: '',
      es_principal: false,
      recibe_facturas: false,
      notas: '',
      activo: true
    };
    onContactosChange([...contactos, nuevoContacto]);
  };

  const eliminarContacto = (index: number) => {
    const nuevosContactos = contactos.filter((_, i) => i !== index);
    onContactosChange(nuevosContactos);
  };

  const actualizarContacto = (index: number, contacto: ContactoCliente) => {
    const nuevosContactos = [...contactos];
    nuevosContactos[index] = contacto;
    onContactosChange(nuevosContactos);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contactos Adicionales</h3>
        <Button type="button" variant="outline" size="sm" onClick={agregarContacto}>
          <User className="h-4 w-4 mr-2" />
          Agregar Contacto
        </Button>
      </div>

      {contactos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No hay contactos adicionales</p>
          <p className="text-sm">Agrega personas de contacto para este cliente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contactos.map((contacto, index) => (
            <Card key={contacto.id} className="border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium">Contacto {index + 1}</h4>
                    {contacto.es_principal && (
                      <Badge variant="default" className="text-xs">Principal</Badge>
                    )}
                    {contacto.recibe_facturas && (
                      <Badge variant="secondary" className="text-xs">Recibe Facturas</Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarContacto(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Nombres</Label>
                    <Input
                      value={contacto.nombres}
                      onChange={(e) => actualizarContacto(index, { ...contacto, nombres: e.target.value })}
                      placeholder="Nombres..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Apellidos</Label>
                    <Input
                      value={contacto.apellidos}
                      onChange={(e) => actualizarContacto(index, { ...contacto, apellidos: e.target.value })}
                      placeholder="Apellidos..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Cargo</Label>
                    <Input
                      value={contacto.cargo}
                      onChange={(e) => actualizarContacto(index, { ...contacto, cargo: e.target.value })}
                      placeholder="Cargo en la empresa..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      value={contacto.email}
                      onChange={(e) => actualizarContacto(index, { ...contacto, email: e.target.value })}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Teléfono</Label>
                    <Input
                      value={contacto.telefono}
                      onChange={(e) => actualizarContacto(index, { ...contacto, telefono: e.target.value })}
                      placeholder="+51 999 999 999"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`principal-${index}`}
                        checked={contacto.es_principal}
                        onCheckedChange={(checked) => {
                          // Solo uno puede ser principal
                          if (checked) {
                            const nuevosContactos = contactos.map((c, i) => ({
                              ...c,
                              es_principal: i === index
                            }));
                            onContactosChange(nuevosContactos);
                          } else {
                            actualizarContacto(index, { ...contacto, es_principal: false });
                          }
                        }}
                      />
                      <Label htmlFor={`principal-${index}`} className="text-xs">
                        Contacto principal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`facturas-${index}`}
                        checked={contacto.recibe_facturas}
                        onCheckedChange={(checked) => 
                          actualizarContacto(index, { ...contacto, recibe_facturas: checked as boolean })
                        }
                      />
                      <Label htmlFor={`facturas-${index}`} className="text-xs">
                        Recibe facturas por email
                      </Label>
                    </div>
                  </div>
                </div>

                {contacto.notas !== undefined && (
                  <div>
                    <Label className="text-xs">Notas</Label>
                    <Textarea
                      value={contacto.notas}
                      onChange={(e) => actualizarContacto(index, { ...contacto, notas: e.target.value })}
                      placeholder="Notas adicionales sobre este contacto..."
                      rows={2}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const FormularioCliente: React.FC<PropiedadesFormularioCliente> = ({
  clienteInicial,
  modoEdicion = false,
  onGuardar,
  onCancelar,
  onEliminar,
  className
}) => {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormularioClienteData>({
    defaultValues: {
      tipo_cliente: clienteInicial?.tipo_cliente || 'natural',
      tipo_documento: clienteInicial?.tipo_documento || '1',
      numero_documento: clienteInicial?.numero_documento || '',
      razon_social: clienteInicial?.razon_social || '',
      nombre_comercial: clienteInicial?.nombre_comercial || '',
      email: clienteInicial?.email || '',
      telefono: clienteInicial?.telefono || '',
      celular: clienteInicial?.celular || '',
      web: clienteInicial?.web || '',
      direccion: clienteInicial?.direccion || '',
      distrito: clienteInicial?.distrito || '',
      provincia: clienteInicial?.provincia || '',
      departamento: clienteInicial?.departamento || '',
      codigo_postal: clienteInicial?.codigo_postal || '',
      ubigeo: clienteInicial?.ubigeo || '',
      limite_credito: clienteInicial?.limite_credito || 0,
      dias_credito: clienteInicial?.dias_credito || 0,
      es_agente_retencion: clienteInicial?.es_agente_retencion || false,
      es_buen_contribuyente: clienteInicial?.es_buen_contribuyente || false,
      contactos: clienteInicial?.contactos || [],
      observaciones: clienteInicial?.observaciones || '',
      notas_internas: clienteInicial?.notas_internas || '',
      activo: clienteInicial?.activo !== undefined ? clienteInicial.activo : true
    }
  });

  const { mostrarExito, mostrarError } = useNotificaciones();
  const { mostrarCargaConProgreso, ocultarCarga, actualizarProgreso } = useCarga();

  const valoresForm = watch();

  // Función para manejar envío
  const manejarEnvio = async (datos: FormularioClienteData) => {
    try {
      mostrarCargaConProgreso('Guardando cliente', 'Validando datos...');
      actualizarProgreso(25);

      // Construir datos del cliente
      const datosCliente: FormularioCliente = {
        id: clienteInicial?.id,
        ...datos,
        fecha_creacion: clienteInicial?.fecha_creacion || new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        usuario_creacion: clienteInicial?.usuario_creacion || 1,
        usuario_actualizacion: 1
      };

      actualizarProgreso(75, 'Guardando cliente...');
      
      await onGuardar(datosCliente);
      
      actualizarProgreso(100, 'Completado');
      mostrarExito('Cliente guardado', 'El cliente se ha guardado correctamente');
      
    } catch (error) {
      console.error('Error guardando cliente:', error);
      mostrarError('Error', 'Error al guardar el cliente');
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
              <User className="h-5 w-5" />
              <span>{modoEdicion ? 'Editar' : 'Nuevo'} Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="datos-basicos" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="datos-basicos">Datos Básicos</TabsTrigger>
                <TabsTrigger value="contacto">Contacto</TabsTrigger>
                <TabsTrigger value="direccion">Dirección</TabsTrigger>
                <TabsTrigger value="comercial">Comercial</TabsTrigger>
                <TabsTrigger value="adicional">Adicional</TabsTrigger>
              </TabsList>

              {/* Tab Datos Básicos */}
              <TabsContent value="datos-basicos" className="space-y-4">
                <SeccionDocumento 
                  control={control}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                />

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label>Razón Social / Nombre Completo</Label>
                    <Controller
                      name="razon_social"
                      control={control}
                      rules={{ required: 'Razón social es requerida' }}
                      render={({ field }) => (
                        <Input {...field} placeholder="Ingrese razón social o nombre completo..." />
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
                        <Input {...field} placeholder="Nombre comercial (opcional)..." />
                      )}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nombre por el cual es conocido comercialmente
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Tab Contacto */}
              <TabsContent value="contacto" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Controller
                      name="email"
                      control={control}
                      rules={{ 
                        validate: (value) => {
                          if (!value) return true;
                          return validarEmail(value) || 'Email inválido';
                        }
                      }}
                      render={({ field }) => (
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="email@ejemplo.com"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Celular</Label>
                    <Controller
                      name="celular"
                      control={control}
                      render={({ field }) => (
                        <Input 
                          {...field} 
                          placeholder="+51 999 999 999"
                          icon={<Phone className="h-4 w-4" />}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Sitio Web</Label>
                    <Controller
                      name="web"
                      control={control}
                      render={({ field }) => (
                        <Input 
                          {...field} 
                          placeholder="https://www.ejemplo.com"
                        />
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab Dirección */}
              <TabsContent value="direccion" className="space-y-4">
                <div>
                  <Label>Dirección</Label>
                  <Controller
                    name="direccion"
                    control={control}
                    rules={{ required: 'Dirección es requerida' }}
                    render={({ field }) => (
                      <Textarea 
                        {...field} 
                        placeholder="Dirección completa..."
                        rows={2}
                      />
                    )}
                  />
                  {errors.direccion && (
                    <p className="text-sm text-red-600 mt-1">{errors.direccion.message}</p>
                  )}
                </div>

                <SelectorUbicacion
                  departamento={valoresForm.departamento}
                  provincia={valoresForm.provincia}
                  distrito={valoresForm.distrito}
                  onDepartamentoChange={(value) => {
                    setValue('departamento', value);
                    setValue('provincia', '');
                    setValue('distrito', '');
                  }}
                  onProvinciaChange={(value) => {
                    setValue('provincia', value);
                    setValue('distrito', '');
                  }}
                  onDistritoChange={(value) => setValue('distrito', value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Código Postal</Label>
                    <Controller
                      name="codigo_postal"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Código postal..." />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Ubigeo</Label>
                    <Controller
                      name="ubigeo"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Código ubigeo..." />
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab Comercial */}
              <TabsContent value="comercial" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Límite de Crédito (S/)</Label>
                    <Controller
                      name="limite_credito"
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
                    <p className="text-xs text-gray-500 mt-1">
                      Monto máximo de crédito otorgado
                    </p>
                  </div>

                  <div>
                    <Label>Días de Crédito</Label>
                    <Controller
                      name="dias_credito"
                      control={control}
                      render={({ field }) => (
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          placeholder="0" 
                        />
                      )}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Días de plazo para pago
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="es_agente_retencion"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="agente-retencion"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="agente-retencion">Es Agente de Retención</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="es_buen_contribuyente"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="buen-contribuyente"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="buen-contribuyente">Buen Contribuyente</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="activo"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="activo"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="activo">Cliente Activo</Label>
                  </div>
                </div>
              </TabsContent>

              {/* Tab Adicional */}
              <TabsContent value="adicional" className="space-y-6">
                <SeccionContactos
                  contactos={valoresForm.contactos}
                  onContactosChange={(contactos) => setValue('contactos', contactos)}
                />

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Observaciones</Label>
                    <Controller
                      name="observaciones"
                      control={control}
                      render={({ field }) => (
                        <Textarea 
                          {...field} 
                          placeholder="Observaciones visibles en documentos..."
                          rows={3}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Notas Internas</Label>
                    <Controller
                      name="notas_internas"
                      control={control}
                      render={({ field }) => (
                        <Textarea 
                          {...field} 
                          placeholder="Notas internas de uso exclusivo..."
                          rows={3}
                        />
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-between">
          <div>
            {modoEdicion && onEliminar && clienteInicial?.id && (
              <Button 
                type="button" 
                variant="destructive"
                onClick={() => onEliminar(clienteInicial.id!)}
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
              {modoEdicion ? 'Actualizar' : 'Guardar'} Cliente
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

export default FormularioCliente;