/**
 * frontend/src/paginas/admin/reportes/ReportesSunat.tsx
 * Reportes específicos para SUNAT
 */
import React, { useState } from 'react';
import { Download, FileText, Calendar, CheckCircle, XCircle } from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Badge } from '../../../componentes/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../componentes/ui/tabs';

export const ReportesSunat: React.FC = () => {
  const [generandoReporte, setGenerandoReporte] = useState(false);

  const generarReportePLE = async (tipo: string) => {
    setGenerandoReporte(true);
    // Simular generación de reporte
    setTimeout(() => {
      setGenerandoReporte(false);
      // Aquí se descargaría el archivo
    }, 2000);
  };

  return (
    <LayoutAdmin
      title="Reportes SUNAT"
      description="Reportes para cumplimiento tributario"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Reportes', href: '/admin/reportes' },
        { label: 'SUNAT' }
      ]}
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes SUNAT</h1>

        <Tabs defaultValue="ple" className="w-full">
          <TabsList>
            <TabsTrigger value="ple">Libros Electrónicos (PLE)</TabsTrigger>
            <TabsTrigger value="estados">Estados de Documentos</TabsTrigger>
            <TabsTrigger value="resumen">Resumen Mensual</TabsTrigger>
          </TabsList>

          <TabsContent value="ple">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Programa de Libros Electrónicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">PLE 14.1 - Registro de Ventas</h3>
                        <Badge variant="default">Requerido</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Registro de ventas e ingresos mensual
                      </p>
                      <Button 
                        onClick={() => generarReportePLE('ventas')}
                        disabled={generandoReporte}
                        className="w-full"
                      >
                        {generandoReporte ? 'Generando...' : 'Generar PLE Ventas'}
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">PLE 3.2 - Libro de Inventarios</h3>
                        <Badge variant="secondary">Opcional</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Inventarios y balances valorizado
                      </p>
                      <Button 
                        onClick={() => generarReportePLE('inventarios')}
                        disabled={generandoReporte}
                        variant="outline"
                        className="w-full"
                      >
                        Generar PLE Inventarios
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">PLE 5.1 - Libro Diario</h3>
                        <Badge variant="default">Requerido</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Libro diario de formato simplificado
                      </p>
                      <Button 
                        onClick={() => generarReportePLE('diario')}
                        disabled={generandoReporte}
                        className="w-full"
                      >
                        Generar PLE Diario
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">PLE 6.1 - Libro Mayor</h3>
                        <Badge variant="default">Requerido</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Libro mayor de formato simplificado
                      </p>
                      <Button 
                        onClick={() => generarReportePLE('mayor')}
                        disabled={generandoReporte}
                        className="w-full"
                      >
                        Generar PLE Mayor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="estados">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Documentos Electrónicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-600">Aceptados</p>
                          <p className="text-2xl font-bold text-gray-900">145</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-yellow-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-600">Pendientes</p>
                          <p className="text-2xl font-bold text-gray-900">3</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <XCircle className="h-8 w-8 text-red-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-600">Rechazados</p>
                          <p className="text-2xl font-bold text-gray-900">2</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Reporte de Estados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resumen">
            <Card>
              <CardHeader>
                <CardTitle>Resumen Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Resumen tributario mensual</p>
                  <Button className="mt-4">
                    Generar Resumen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutAdmin>
  );
};

export default ReportesSunat;

