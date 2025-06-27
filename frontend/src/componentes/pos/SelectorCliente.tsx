/**
 * Selector de Cliente - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente para buscar y seleccionar clientes en el POS
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  UserPlus, 
  User, 
  Building, 
  MapPin, 
  Phone, 
  Mail,
  Check,
  X,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button, ButtonIcono } from '../ui/button';
import { Input, InputBusqueda } from '../ui/input';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalTitle } from '../ui/modal';
import { useApiBusqueda, useApiPost } from '../../hooks/useApi';
import { useClientesPOS } from '../../hooks/useFacturacion';
import type { Cliente, ClienteFactura, CrearClienteRequest } from '../../types/cliente';
import { API_ENDPOINTS, CLIENTE_GENERICO } from '../../utils/constantes';
import { formatearDocumento, capitalizarPalabras } from '../../utils/formatos';
import { validarDocumentoAutomatico, validarEmail, validarTelefono } from '../../utils/validaciones';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesSelectorCliente {
  className?: string;
  mostrarClienteGenerico?: boolean;
  onClienteSeleccionado?: (cliente: ClienteFactura) => void;
  clienteActual?: ClienteFactura | null;
}

interface FormularioClienteRapido {
  tipo_documento: '1' | '6';
  numero_documento: string;
  nombre_o_razon_social: string;
  direccion: string;
  telefono: string;
  email: string;
}

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const SelectorCliente: React.FC<PropiedadesSelectorCliente> = ({
  className,
  mostrarClienteGenerico = true,
  onClienteSeleccionado,
  clienteActual,
}) => {
  // Estados locales
  const [modalBusquedaAbierto, setModalBusquedaAbierto] = useState(false);
  const [modalClienteRapidoAbierto, setModalClienteRapidoAbierto] = useState(false);
  const [documentoBusqueda, setDocumentoBusqueda] = useState('');

  // Hooks personalizados
  const {
    seleccionarYCerrar,
    clienteActual: clienteContexto,
  } = useClientesPOS();

  // APIs
  const {
    data: clientesBusqueda,
    loading: cargandoBusqueda,
    termino: terminoBusqueda,
    setTermino: setTerminoBusqueda,
    limpiarBusqueda,
  } = useApiBusqueda<{
    count: number;
    results: Cliente[];
  }>(
    API_ENDPOINTS.CLIENTES.LIST,
    300, // 300ms debounce
    undefined,
    { cachear: true }
  );

  const {
    ejecutar: crearClienteRapido,
    loading: creandoCliente,
    error: errorCreacion,
  } = useApiPost<Cliente, CrearClienteRequest>(API_ENDPOINTS.CLIENTES.CREATE);

  const {
    ejecutar: buscarPorDocumento,
    loading: buscandoPorDocumento,
  } = useApiPost<{ cliente?: Cliente; datos_sunat?: any }>(
    API_ENDPOINTS.CLIENTES.BUSCAR
  );

  // Cliente final a mostrar
  const clienteFinal = clienteActual || clienteContexto;

  // =======================================================
  // FUNCIONES DE SELECCIÓN
  // =======================================================

  const seleccionarCliente = useCallback((cliente: Cliente | ClienteFactura) => {
    const clienteParaFacturacion: ClienteFactura = {
      id: cliente.id,
      tipo_documento: cliente.tipo_documento,
      numero_documento: cliente.numero_documento,
      nombre_o_razon_social: cliente.nombre_o_razon_social,
      direccion: cliente.direccion,
      distrito: cliente.distrito,
      provincia: cliente.provincia,
      departamento: cliente.departamento,
      email: cliente.email,
    };

    if (onClienteSeleccionado) {
      onClienteSeleccionado(clienteParaFacturacion);
    } else {
      seleccionarYCerrar(clienteParaFacturacion);
    }
    
    cerrarModalBusqueda();
  }, [onClienteSeleccionado, seleccionarYCerrar]);

  const seleccionarClienteGenerico = () => {
    const clienteGenerico: ClienteFactura = {
      id: CLIENTE_GENERICO.id,
      tipo_documento: CLIENTE_GENERICO.tipo_documento,
      numero_documento: CLIENTE_GENERICO.numero_documento,
      nombre_o_razon_social: CLIENTE_GENERICO.nombre_o_razon_social,
      direccion: CLIENTE_GENERICO.direccion,
      distrito: CLIENTE_GENERICO.distrito,
      provincia: CLIENTE_GENERICO.provincia,
      departamento: CLIENTE_GENERICO.departamento,
      email: CLIENTE_GENERICO.email,
    };
    seleccionarCliente(clienteGenerico);
  };

  // =======================================================
  // FUNCIONES DE MODAL
  // =======================================================

  const abrirModalBusqueda = () => {
    setModalBusquedaAbierto(true);
  };

  const cerrarModalBusqueda = () => {
    setModalBusquedaAbierto(false);
    limpiarBusqueda();
    setDocumentoBusqueda('');
  };

  const abrirModalClienteRapido = () => {
    setModalClienteRapidoAbierto(true);
  };

  const cerrarModalClienteRapido = () => {
    setModalClienteRapidoAbierto(false);
  };

  // =======================================================
  // BÚSQUEDA POR DOCUMENTO
  // =======================================================

  const buscarClientePorDocumento = async () => {
    if (!documentoBusqueda.trim()) return;

    const validacion = validarDocumentoAutomatico(documentoBusqueda);
    if (!validacion.valido) {
      alert(validacion.mensaje || 'Documento inválido');
      return;
    }

    try {
      const resultado = await buscarPorDocumento({
        numero_documento: documentoBusqueda.trim(),
        tipo_documento: validacion.tipo_documento,
      });

      if (resultado?.cliente) {
        seleccionarCliente(resultado.cliente);
      } else {
        // No encontrado, ofrecer crear cliente rápido
        if (window.confirm('Cliente no encontrado. ¿Desea crear un cliente rápido?')) {
          abrirModalClienteRapido();
        }
      }
    } catch (error) {
      console.error('Error buscando cliente:', error);
    }
  };

  // =======================================================
  // COMPONENTE TARJETA CLIENTE
  // =======================================================

  const TarjetaCliente: React.FC<{ cliente: Cliente }> = ({ cliente }) => {
    const esPersonaJuridica = cliente.tipo_documento === '6';

    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => seleccionarCliente(cliente)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {esPersonaJuridica ? (
                  <Building className="h-4 w-4 text-blue-600 flex-shrink-0" />
                ) : (
                  <User className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
                <h3 className="font-medium text-sm text-gray-900 truncate">
                  {cliente.nombre_o_razon_social}
                </h3>
              </div>

              <div className="space-y-1 text-xs text-gray-600">
                <p>
                  {cliente.tipo_documento === '6' ? 'RUC' : 'DNI'}: {cliente.numero_documento}
                </p>
                
                {cliente.direccion && (
                  <div className="flex items-start gap-1">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{cliente.direccion}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {cliente.telefono && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{cliente.telefono}</span>
                    </div>
                  )}
                  
                  {cliente.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="flex-shrink-0 text-blue-600"
            >
              <Check className="h-4 w-4" />
              Seleccionar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // =======================================================
  // RENDERIZADO PRINCIPAL
  // =======================================================

  return (
    <div className={cn('space-y-3', className)}>
      {/* Cliente actual */}
      {clienteFinal ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {clienteFinal.tipo_documento === '6' ? (
                  <Building className="h-5 w-5 text-blue-600" />
                ) : (
                  <User className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {clienteFinal.nombre_o_razon_social}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatearDocumento(
                      clienteFinal.tipo_documento,
                      clienteFinal.numero_documento,
                      { incluirEtiqueta: true }
                    )}
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={abrirModalBusqueda}
              >
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Selector inicial */
        <div className="space-y-2">
          {/* Cliente genérico */}
          {mostrarClienteGenerico && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={seleccionarClienteGenerico}
            >
              <User className="h-4 w-4 mr-2" />
              Cliente Genérico (Boleta)
            </Button>
          )}

          {/* Buscar cliente */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={abrirModalBusqueda}
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar Cliente
          </Button>

          {/* Cliente rápido */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={abrirModalClienteRapido}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Cliente Rápido
          </Button>
        </div>
      )}

      {/* Modal de búsqueda */}
      <Modal
        abierto={modalBusquedaAbierto}
        onCerrar={cerrarModalBusqueda}
        tamaño="lg"
      >
        <ModalHeader onCerrar={cerrarModalBusqueda}>
          <ModalTitle>Buscar Cliente</ModalTitle>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            {/* Búsqueda por documento */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">Buscar por documento</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Ingrese DNI o RUC..."
                  value={documentoBusqueda}
                  onChange={(e) => setDocumentoBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarClientePorDocumento()}
                  className="flex-1"
                />
                <Button
                  onClick={buscarClientePorDocumento}
                  disabled={!documentoBusqueda.trim() || buscandoPorDocumento}
                  loading={buscandoPorDocumento}
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </div>

            {/* Búsqueda general */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Buscar por nombre</h4>
              <InputBusqueda
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                placeholder="Buscar por nombre, RUC, DNI..."
                clearable
                onClear={limpiarBusqueda}
              />
            </div>

            {/* Resultados */}
            <div className="max-h-96 overflow-auto">
              {cargandoBusqueda ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Buscando...</span>
                </div>
              ) : clientesBusqueda?.results?.length ? (
                <div className="space-y-2">
                  {clientesBusqueda.results.map(cliente => (
                    <TarjetaCliente key={cliente.id} cliente={cliente} />
                  ))}
                </div>
              ) : terminoBusqueda.trim() ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No se encontraron clientes</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={abrirModalClienteRapido}
                    className="mt-2"
                  >
                    Crear cliente rápido
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Ingrese un término de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="outline" onClick={cerrarModalBusqueda}>
            Cancelar
          </Button>
          <Button onClick={abrirModalClienteRapido}>
            <UserPlus className="h-4 w-4 mr-2" />
            Cliente Rápido
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de cliente rápido */}
      <ModalClienteRapido
        abierto={modalClienteRapidoAbierto}
        onCerrar={cerrarModalClienteRapido}
        onClienteCreado={seleccionarCliente}
        documentoInicial={documentoBusqueda}
      />
    </div>
  );
};

// =======================================================
// COMPONENTE MODAL CLIENTE RÁPIDO
// =======================================================

interface PropiedadesModalClienteRapido {
  abierto: boolean;
  onCerrar: () => void;
  onClienteCreado: (cliente: Cliente) => void;
  documentoInicial?: string;
}

const ModalClienteRapido: React.FC<PropiedadesModalClienteRapido> = ({
  abierto,
  onCerrar,
  onClienteCreado,
  documentoInicial = '',
}) => {
  const [formulario, setFormulario] = useState<FormularioClienteRapido>({
    tipo_documento: '1',
    numero_documento: '',
    nombre_o_razon_social: '',
    direccion: '',
    telefono: '',
    email: '',
  });
  
  const [errores, setErrores] = useState<Partial<FormularioClienteRapido>>({});
  const [creando, setCreando] = useState(false);

  // API para crear cliente
  const {
    ejecutar: crearCliente,
    loading: creandoCliente,
  } = useApiPost<Cliente, CrearClienteRequest>(API_ENDPOINTS.CLIENTES.CREATE);

  // Inicializar con documento si se proporciona
  useEffect(() => {
    if (documentoInicial && abierto) {
      const validacion = validarDocumentoAutomatico(documentoInicial);
      if (validacion.valido) {
        setFormulario(prev => ({
          ...prev,
          numero_documento: documentoInicial,
          tipo_documento: validacion.tipo_documento || '1',
        }));
      }
    }
  }, [documentoInicial, abierto]);

  const manejarCambio = (campo: keyof FormularioClienteRapido, valor: string) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }));
    
    // Limpiar error del campo
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: undefined }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Partial<FormularioClienteRapido> = {};

    // Validar documento
    const validacionDoc = validarDocumentoAutomatico(formulario.numero_documento);
    if (!validacionDoc.valido) {
      nuevosErrores.numero_documento = validacionDoc.mensaje;
    }

    // Validar nombre
    if (!formulario.nombre_o_razon_social.trim()) {
      nuevosErrores.nombre_o_razon_social = 'El nombre es requerido';
    }

    // Validar dirección
    if (!formulario.direccion.trim()) {
      nuevosErrores.direccion = 'La dirección es requerida';
    }

    // Validar email (opcional)
    if (formulario.email.trim()) {
      const validacionEmail = validarEmail(formulario.email);
      if (!validacionEmail.valido) {
        nuevosErrores.email = validacionEmail.mensaje;
      }
    }

    // Validar teléfono (opcional)
    if (formulario.telefono.trim()) {
      const validacionTel = validarTelefono(formulario.telefono);
      if (!validacionTel.valido) {
        nuevosErrores.telefono = validacionTel.mensaje;
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarGuardar = async () => {
    if (!validarFormulario()) return;

    setCreando(true);
    try {
      const clienteData: CrearClienteRequest = {
        tipo_documento: formulario.tipo_documento,
        numero_documento: formulario.numero_documento,
        nombre_o_razon_social: capitalizarPalabras(formulario.nombre_o_razon_social),
        direccion: capitalizarPalabras(formulario.direccion),
        distrito: 'Lima', // Por defecto
        provincia: 'Lima',
        departamento: 'Lima',
        tipo_persona: formulario.tipo_documento === '6' ? 'juridica' : 'natural',
        telefono: formulario.telefono || undefined,
        email: formulario.email || undefined,
        validar_con_sunat: true,
      };

      const clienteCreado = await crearCliente(clienteData);
      
      if (clienteCreado) {
        onClienteCreado(clienteCreado);
        onCerrar();
        
        // Limpiar formulario
        setFormulario({
          tipo_documento: '1',
          numero_documento: '',
          nombre_o_razon_social: '',
          direccion: '',
          telefono: '',
          email: '',
        });
        setErrores({});
      }
    } catch (error) {
      console.error('Error creando cliente:', error);
    } finally {
      setCreando(false);
    }
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} tamaño="md">
      <ModalHeader onCerrar={onCerrar}>
        <ModalTitle>Cliente Rápido</ModalTitle>
      </ModalHeader>
      
      <ModalBody>
        <div className="space-y-4">
          {/* Tipo y número de documento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={formulario.tipo_documento}
                onChange={(e) => manejarCambio('tipo_documento', e.target.value as '1' | '6')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="1">DNI</option>
                <option value="6">RUC</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Número de documento *
              </label>
              <Input
                value={formulario.numero_documento}
                onChange={(e) => manejarCambio('numero_documento', e.target.value)}
                placeholder={formulario.tipo_documento === '6' ? 'RUC (11 dígitos)' : 'DNI (8 dígitos)'}
                estado={errores.numero_documento ? 'error' : 'default'}
              />
              {errores.numero_documento && (
                <p className="text-xs text-red-600 mt-1">{errores.numero_documento}</p>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {formulario.tipo_documento === '6' ? 'Razón Social' : 'Nombres y Apellidos'} *
            </label>
            <Input
              value={formulario.nombre_o_razon_social}
              onChange={(e) => manejarCambio('nombre_o_razon_social', e.target.value)}
              placeholder="Ingrese el nombre completo"
              estado={errores.nombre_o_razon_social ? 'error' : 'default'}
            />
            {errores.nombre_o_razon_social && (
              <p className="text-xs text-red-600 mt-1">{errores.nombre_o_razon_social}</p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium mb-1">Dirección *</label>
            <Input
              value={formulario.direccion}
              onChange={(e) => manejarCambio('direccion', e.target.value)}
              placeholder="Ingrese la dirección"
              estado={errores.direccion ? 'error' : 'default'}
            />
            {errores.direccion && (
              <p className="text-xs text-red-600 mt-1">{errores.direccion}</p>
            )}
          </div>

          {/* Teléfono y Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <Input
                value={formulario.telefono}
                onChange={(e) => manejarCambio('telefono', e.target.value)}
                placeholder="Teléfono"
                estado={errores.telefono ? 'error' : 'default'}
              />
              {errores.telefono && (
                <p className="text-xs text-red-600 mt-1">{errores.telefono}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                value={formulario.email}
                onChange={(e) => manejarCambio('email', e.target.value)}
                placeholder="email@ejemplo.com"
                estado={errores.email ? 'error' : 'default'}
              />
              {errores.email && (
                <p className="text-xs text-red-600 mt-1">{errores.email}</p>
              )}
            </div>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button variant="outline" onClick={onCerrar} disabled={creando}>
          Cancelar
        </Button>
        <Button 
          onClick={manejarGuardar} 
          loading={creando || creandoCliente}
          disabled={creando || creandoCliente}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Crear Cliente
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SelectorCliente;