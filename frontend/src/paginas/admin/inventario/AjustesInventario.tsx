/**
 * frontend/src/paginas/admin/inventario/AjustesInventario.tsx
 * Página para ajustes masivos de inventario
 */
import React, { useState } from 'react';
import { Upload, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Alert, AlertDescription } from '../../../componentes/ui/alert';

export const AjustesInventario: React.FC = () => {
  const [archivo, setArchivo] = useState<File | null>(null);

  return (
    <LayoutAdmin
      title="Ajustes de Inventario"
      description="Ajustes masivos y toma de inventario"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Inventario', href: '/admin/inventario' },
        { label: 'Ajustes' }
      ]}
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Ajustes de Inventario</h1>

        {/* Ajuste Manual */}
        <Card>
          <CardHeader>
            <CardTitle>Ajuste Manual Individual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Realiza ajustes de stock producto por producto.
            </p>
            <Button>
              Iniciar Ajuste Manual
            </Button>
          </CardContent>
        </Card>

        {/* Ajuste Masivo */}
        <Card>
          <CardHeader>
            <CardTitle>Ajuste Masivo por Archivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Los ajustes masivos afectarán el stock de múltiples productos. 
                Asegúrate de revisar el archivo antes de procesar.
              </AlertDescription>
            </Alert>

            <div>
              <p className="text-gray-600 mb-2">
                Descarga la plantilla, complétala con los nuevos stocks y súbela para procesarla.
              </p>
              <Button variant="outline" className="mr-2">
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Arrastra el archivo aquí o haz clic para seleccionar
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                className="hidden"
                id="archivo-ajuste"
              />
              <label htmlFor="archivo-ajuste">
                <Button variant="outline" className="mt-2" as="span">
                  Seleccionar Archivo
                </Button>
              </label>
            </div>

            {archivo && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-800">
                    Archivo seleccionado: {archivo.name}
                  </p>
                </div>
                <Button className="mt-3">
                  Procesar Ajustes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Toma de Inventario */}
        <Card>
          <CardHeader>
            <CardTitle>Toma de Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Inicia un proceso de toma de inventario física completa.
            </p>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Durante la toma de inventario se bloqueará la modificación de stocks.
              </AlertDescription>
            </Alert>
            <Button variant="outline">
              Iniciar Toma de Inventario
            </Button>
          </CardContent>
        </Card>
      </div>
    </LayoutAdmin>
  );
};

export default AjustesInventario;

