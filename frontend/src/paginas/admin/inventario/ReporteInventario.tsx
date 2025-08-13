/**
 * frontend/src/paginas/admin/inventario/ReporteInventario.tsx
 * Reporte valorizado de inventario
 */
import React, { useState, useEffect } from 'react';
import { Download, Filter, BarChart3, Package, DollarSign } from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Badge } from '../../../componentes/ui/badge';
import { useInventario } from '../../../hooks/useInventario';
import { formatearMoneda } from '../../../utils/formatters';

export const ReporteInventario: React.FC = () => {
  const { reporteValorizacion, obtenerReporteValorizacion, cargandoDatos } = useInventario();

  useEffect(() => {
    cargarReporte();
  }, []);

  const cargarReporte = async () => {
    await obtenerReporteValorizacion();
  };

  return (
    <LayoutAdmin
      title="Reporte de Inventario"
      description="Valorización y estado del inventario"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Inventario', href: '/admin/inventario' },
        { label: 'Reporte' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Reporte de Inventario</h1>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatearMoneda(reporteValorizacion?.valorTotal || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteValorizacion?.totalProductos || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Productos Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteValorizacion?.productosActivos || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalle por Producto */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle por Producto</CardTitle>
          </CardHeader>
          <CardContent>
            {cargandoDatos ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Generando reporte...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Reporte de valorización</p>
                <Button className="mt-4" onClick={cargarReporte}>
                  Generar Reporte
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutAdmin>
  );
};

export default ReporteInventario;

