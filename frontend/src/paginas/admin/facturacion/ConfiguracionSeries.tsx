/**
 * frontend/src/paginas/admin/facturacion/ConfiguracionSeries.tsx
 * Configuración de series de documentos
 */
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, FileText } from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Input } from '../../../componentes/ui/input';
import { Label } from '../../../componentes/ui/label';
import { Badge } from '../../../componentes/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../componentes/ui/select';
import { useFacturacion } from '../../../hooks/useFacturacion';
import { useNotificaciones } from '../../../hooks/useNotificaciones';

export const ConfiguracionSeries: React.FC = () => {
  const { series, obtenerSeries, crearSerie, actualizarSerie, eliminarSerie } = useFacturacion();
  const { mostrarExito, mostrarError } = useNotificaciones();
  const [editando, setEditando] = useState<number | null>(null);
  const [nuevaSerie, setNuevaSerie] = useState(false);

  useEffect(() => {
    obtenerSeries();
  }, []);

  return (
    <LayoutAdmin
      title="Configuración de Series"
      description="Gestión de series de documentos electrónicos"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Facturación', href: '/admin/facturacion' },
        { label: 'Configuración de Series' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Series de Documentos</h1>
          <Button onClick={() => setNuevaSerie(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Serie
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo Documento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Próximo Número</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {series?.map((serie) => (
                    <tr key={serie.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{serie.codigo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{serie.tipo_documento}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{serie.numero_actual + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={serie.activa ? 'default' : 'secondary'}>
                          {serie.activa ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center space-x-2 justify-end">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutAdmin>
  );
};

export default ConfiguracionSeries;

