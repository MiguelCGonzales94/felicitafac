/**
 * frontend/src/paginas/admin/clientes/DetalleCliente.tsx
 * Página de detalle completo de un cliente
 */
import React, { useState, useEffect } from 'react';
import { 
  Edit, Trash2, Mail, Phone, MapPin, Calendar, 
  CreditCard, FileText, TrendingUp, Star
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Badge } from '../../../componentes/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../componentes/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../componentes/ui/tabs';
import { useClientes } from '../../../hooks/useClientes';
import { formatearMoneda, formatearFecha } from '../../../utils/formatters';

export const DetalleCliente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obtenerCliente, clienteActual, cargandoCliente } = useClientes();

  useEffect(() => {
    if (id) {
      obtenerCliente(parseInt(id));
    }
  }, [id]);

  if (cargandoCliente) {
    return (
      <LayoutAdmin title="Cargando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </LayoutAdmin>
    );
  }

  if (!clienteActual) {
    return (
      <LayoutAdmin title="Cliente no encontrado">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cliente no encontrado</h3>
          <Button onClick={() => navigate('/admin/clientes')}>
            Volver a la Lista
          </Button>
        </div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin
      title={clienteActual.nombre_completo}
      description="Información completa del cliente"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Comercial', href: '/admin/comercial' },
        { label: 'Clientes', href: '/admin/clientes' },
        { label: clienteActual.nombre_completo }
      ]}
    >
      <div className="space-y-6">
        {/* Header del Cliente */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={clienteActual.foto_perfil} />
                  <AvatarFallback className="text-xl">
                    {clienteActual.nombre_completo.split(' ').map(n => n.charAt(0)).slice(0, 2).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {clienteActual.nombre_completo}
                    </h1>
                    {clienteActual.favorito && (
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <p className="text-gray-600">
                    {clienteActual.tipo_documento === '1' ? 'DNI' : 'RUC'}: {clienteActual.numero_documento}
                  </p>
                  <p className="text-sm text-gray-500">
                    Cliente desde {formatearFecha(clienteActual.fecha_creacion)}
                  </p>
                  <Badge className={clienteActual.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {clienteActual.estado}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button onClick={() => navigate(`/admin/clientes/editar/${clienteActual.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Nueva Factura
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas del Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Facturado</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatearMoneda(clienteActual.estadisticas?.total_facturado || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Documentos</p>
                  <p className="text-xl font-bold text-gray-900">
                    {clienteActual.estadisticas?.total_documentos || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Promedio Compra</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatearMoneda(clienteActual.estadisticas?.promedio_compra || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Última Compra</p>
                  <p className="text-sm font-bold text-gray-900">
                    {clienteActual.estadisticas?.ultima_compra ? 
                      formatearFecha(clienteActual.estadisticas.ultima_compra) : 
                      'Nunca'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Información */}
        <Tabs defaultValue="informacion" className="w-full">
          <TabsList>
            <TabsTrigger value="informacion">Información General</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="cuenta_corriente">Cuenta Corriente</TabsTrigger>
            <TabsTrigger value="contactos">Contactos</TabsTrigger>
          </TabsList>

          <TabsContent value="informacion">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre Completo</p>
                    <p className="font-medium">{clienteActual.nombre_completo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Cliente</p>
                    <p className="font-medium">
                      {clienteActual.tipo_cliente === 'natural' ? 'Persona Natural' : 'Persona Jurídica'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Documento de Identidad</p>
                    <p className="font-medium">
                      {clienteActual.tipo_documento === '1' ? 'DNI' : 'RUC'}: {clienteActual.numero_documento}
                    </p>
                  </div>
                  {clienteActual.nombre_comercial && (
                    <div>
                      <p className="text-sm text-gray-600">Nombre Comercial</p>
                      <p className="font-medium">{clienteActual.nombre_comercial}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{clienteActual.email || 'No registrado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium">{clienteActual.telefono || 'No registrado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Dirección</p>
                      <p className="font-medium">{clienteActual.direccion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración Comercial</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Límite de Crédito</p>
                    <p className="font-medium">{formatearMoneda(clienteActual.limite_credito || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Días de Crédito</p>
                    <p className="font-medium">{clienteActual.dias_credito || 0} días</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Descuento Permitido</p>
                    <p className="font-medium">{clienteActual.descuento_permitido || 0}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información Fiscal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Agente de Retención</span>
                    <Badge variant={clienteActual.es_agente_retencion ? 'default' : 'secondary'}>
                      {clienteActual.es_agente_retencion ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Buen Contribuyente</span>
                    <Badge variant={clienteActual.es_buen_contribuyente ? 'default' : 'secondary'}>
                      {clienteActual.es_buen_contribuyente ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documentos">
            <Card>
              <CardHeader>
                <CardTitle>Documentos Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay documentos recientes</p>
                  <Button className="mt-4">
                    <FileText className="h-4 w-4 mr-2" />
                    Nueva Factura
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cuenta_corriente">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay movimientos en cuenta corriente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contactos">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Contactos Adicionales</CardTitle>
                  <Button variant="outline" size="sm">
                    Agregar Contacto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay contactos adicionales registrados</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutAdmin>
  );
};

export default DetalleCliente;

