/**
 * frontend/src/paginas/admin/facturacion/ListaDocumentos.tsx
 * Lista de todos los documentos de facturación
 */
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Eye, Edit, Trash2, 
  FileText, Plus, Calendar, DollarSign 
} from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Input } from '../../../componentes/ui/input';
import { Badge } from '../../../componentes/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../componentes/ui/tabs';
import { useFacturacion } from '../../../hooks/useFacturacion';
import { useNavigate } from 'react-router-dom';
import { formatearMoneda, formatearFecha } from '../../../utils/formatters';
import FiltrosAvanzados from '../../../componentes/comunes/FiltrosAvanzados';
import PaginacionPersonalizada from '../../../componentes/comunes/PaginacionPersonalizada';

export const ListaDocumentos: React.FC = () => {
  const navigate = useNavigate();
  const { 
    facturas, 
    totalFacturas, 
    paginaActual, 
    totalPaginas,
    obtenerFacturas, 
    eliminarFactura,
    cargandoFacturas 
  } = useFacturacion();

  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo_documento: '',
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    cliente: ''
  });

  useEffect(() => {
    cargarDocumentos();
  }, [paginaActual, filtros]);

  const cargarDocumentos = async () => {
    await obtenerFacturas(filtros);
  };

  const manejarFiltrar = (nuevosFiltros: any) => {
    setFiltros({ ...filtros, ...nuevosFiltros });
  };

  const manejarEliminar = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este documento?')) {
      await eliminarFactura(id);
      cargarDocumentos();
    }
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'emitida': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'anulada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const obtenerIconoTipo = (tipo: string) => {
    return <FileText className="h-4 w-4" />;
  };

  return (
    <LayoutAdmin
      title="Documentos de Facturación"
      description="Gestión de facturas, boletas y notas"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Facturación', href: '/admin/facturacion' },
        { label: 'Documentos' }
      ]}
    >
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Documentos de Facturación</h1>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={() => navigate('/admin/facturacion/nueva-factura')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Documento
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FiltrosAvanzados 
              filtros={[
                {
                  nombre: 'busqueda',
                  tipo: 'texto',
                  placeholder: 'Buscar por número, cliente...',
                  valor: filtros.busqueda
                },
                {
                  nombre: 'tipo_documento',
                  tipo: 'select',
                  placeholder: 'Tipo de documento',
                  opciones: [
                    { valor: '', etiqueta: 'Todos' },
                    { valor: 'factura', etiqueta: 'Facturas' },
                    { valor: 'boleta', etiqueta: 'Boletas' },
                    { valor: 'nota_credito', etiqueta: 'Notas de Crédito' },
                    { valor: 'nota_debito', etiqueta: 'Notas de Débito' }
                  ],
                  valor: filtros.tipo_documento
                },
                {
                  nombre: 'estado',
                  tipo: 'select',
                  placeholder: 'Estado',
                  opciones: [
                    { valor: '', etiqueta: 'Todos' },
                    { valor: 'pendiente', etiqueta: 'Pendiente' },
                    { valor: 'emitida', etiqueta: 'Emitida' },
                    { valor: 'anulada', etiqueta: 'Anulada' }
                  ],
                  valor: filtros.estado
                },
                {
                  nombre: 'fecha_desde',
                  tipo: 'fecha',
                  placeholder: 'Desde',
                  valor: filtros.fecha_desde
                },
                {
                  nombre: 'fecha_hasta',
                  tipo: 'fecha',
                  placeholder: 'Hasta',
                  valor: filtros.fecha_hasta
                }
              ]}
              onFiltrar={manejarFiltrar}
            />
          </CardContent>
        </Card>

        {/* Tabs por tipo de documento */}
        <Tabs defaultValue="todos" className="w-full">
          <TabsList>
            <TabsTrigger value="todos">Todos ({totalFacturas})</TabsTrigger>
            <TabsTrigger value="facturas">Facturas</TabsTrigger>
            <TabsTrigger value="boletas">Boletas</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
          </TabsList>

          <TabsContent value="todos">
            <Card>
              <CardContent className="p-0">
                {cargandoFacturas ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Cargando documentos...</p>
                  </div>
                ) : facturas.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
                    <p className="text-gray-500 mb-4">
                      No se encontraron documentos con los filtros aplicados.
                    </p>
                    <Button onClick={() => navigate('/admin/facturacion/nueva-factura')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Documento
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Documento
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cliente
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {facturas.map((factura) => (
                          <tr key={factura.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {obtenerIconoTipo(factura.tipo_documento)}
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {factura.numero_completo}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {factura.tipo_documento.toUpperCase()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {factura.cliente?.nombre_o_razon_social}
                              </div>
                              <div className="text-sm text-gray-500">
                                {factura.cliente?.numero_documento}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatearFecha(factura.fecha_emision)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatearMoneda(factura.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={obtenerColorEstado(factura.estado)}>
                                {factura.estado}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/admin/facturacion/documento/${factura.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/admin/facturacion/editar/${factura.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => manejarEliminar(factura.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <PaginacionPersonalizada
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                onCambioPagina={(pagina) => {
                  // Actualizar página en el hook
                }}
              />
            )}
          </TabsContent>

          {/* Otros tabs serían similares pero filtrados */}
          <TabsContent value="facturas">
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Vista específica de facturas</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boletas">
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Vista específica de boletas</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notas">
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Vista específica de notas de crédito/débito</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutAdmin>
  );
};

export default ListaDocumentos;

