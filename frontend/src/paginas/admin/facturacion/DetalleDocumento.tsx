/**
 * frontend/src/paginas/admin/facturacion/DetalleDocumento.tsx
 * Página de detalle completo de un documento
 */
import React, { useState, useEffect } from 'react';
import { 
  Download, Send, Edit, Trash2, Eye, FileText, 
  CheckCircle, XCircle, Clock, AlertTriangle 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Badge } from '../../../componentes/ui/badge';
import { Separator } from '../../../componentes/ui/separator';
import { useFacturacion } from '../../../hooks/useFacturacion';
import { formatearMoneda, formatearFecha } from '../../../utils/formatters';

export const DetalleDocumento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obtenerFactura, facturaActual, cargandoFactura } = useFacturacion();

  useEffect(() => {
    if (id) {
      obtenerFactura(parseInt(id));
    }
  }, [id]);

  if (cargandoFactura) {
    return (
      <LayoutAdmin title="Cargando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </LayoutAdmin>
    );
  }

  if (!facturaActual) {
    return (
      <LayoutAdmin title="Documento no encontrado">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Documento no encontrado</h3>
          <Button onClick={() => navigate('/admin/facturacion/documentos')}>
            Volver a la Lista
          </Button>
        </div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin
      title={`Documento ${facturaActual.numero_completo}`}
      description="Detalle completo del documento"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Facturación', href: '/admin/facturacion' },
        { label: 'Documentos', href: '/admin/facturacion/documentos' },
        { label: facturaActual.numero_completo }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header del Documento */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{facturaActual.numero_completo}</CardTitle>
                <p className="text-gray-600">{facturaActual.tipo_documento.toUpperCase()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={facturaActual.estado === 'emitida' ? 'default' : 'secondary'}>
                  {facturaActual.estado}
                </Badge>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Información del Cliente y Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-medium">{facturaActual.cliente?.nombre_o_razon_social}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Documento</p>
                <p className="font-medium">{facturaActual.cliente?.numero_documento}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dirección</p>
                <p className="text-sm">{facturaActual.cliente?.direccion}</p>
              </div>
              {facturaActual.cliente?.email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-sm">{facturaActual.cliente.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Fecha de Emisión</p>
                <p className="font-medium">{formatearFecha(facturaActual.fecha_emision)}</p>
              </div>
              {facturaActual.fecha_vencimiento && (
                <div>
                  <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                  <p className="font-medium">{formatearFecha(facturaActual.fecha_vencimiento)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Tipo de Pago</p>
                <p className="font-medium">{facturaActual.tipo_pago}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado de Pago</p>
                <Badge variant={facturaActual.estado_pago === 'pagado' ? 'default' : 'secondary'}>
                  {facturaActual.estado_pago}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalle de Items */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Descuento</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">IGV</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {facturaActual.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.descripcion}</p>
                          <p className="text-sm text-gray-500">Código: {item.codigo_producto}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{item.cantidad}</td>
                      <td className="px-4 py-3 text-right">{formatearMoneda(item.precio_unitario)}</td>
                      <td className="px-4 py-3 text-right">{formatearMoneda(item.descuento)}</td>
                      <td className="px-4 py-3 text-right">{formatearMoneda(item.igv)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatearMoneda(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Totales */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatearMoneda(facturaActual.subtotal)}</span>
                </div>
                {facturaActual.descuento_global > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descuento:</span>
                    <span>-{formatearMoneda(facturaActual.descuento_global)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">IGV (18%):</span>
                  <span>{formatearMoneda(facturaActual.igv)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatearMoneda(facturaActual.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado SUNAT */}
        {facturaActual.estado_sunat && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Estado SUNAT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Código de Respuesta</p>
                  <p className="font-medium">{facturaActual.estado_sunat.codigo_respuesta}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Descripción</p>
                  <p className="font-medium">{facturaActual.estado_sunat.descripcion_respuesta}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observaciones */}
        {facturaActual.observaciones && (
          <Card>
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{facturaActual.observaciones}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default DetalleDocumento;

