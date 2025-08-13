/**
 * frontend/src/paginas/admin/facturacion/NuevaFactura.tsx
 * Página para crear nueva factura
 */
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Calculator, Send, Eye } from 'lucide-react';
import LayoutAdmin from '../../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../componentes/ui/card';
import { Button } from '../../../componentes/ui/button';
import { Input } from '../../../componentes/ui/input';
import { Label } from '../../../componentes/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../componentes/ui/select';
import { Textarea } from '../../../componentes/ui/textarea';
import { useFacturacion } from '../../../hooks/useFacturacion';
import { useClientes } from '../../../hooks/useClientes';
import { useProductos } from '../../../hooks/useProductos';
import { useNotificaciones } from '../../../hooks/useNotificaciones';
import FormularioFactura from '../../../componentes/formularios/FormularioFactura';
import BuscadorGeneral from '../../../componentes/comunes/BuscadorGeneral';

export const NuevaFactura: React.FC = () => {
  const { crearFactura, calcularTotalesFactura, cargandoFactura } = useFacturacion();
  const { buscarClientes } = useClientes();
  const { buscarProductos } = useProductos();
  const { mostrarExito, mostrarError } = useNotificaciones();

  const [facturaData, setFacturaData] = useState({
    tipo_documento: 'factura',
    cliente_id: null,
    items: [],
    observaciones: '',
    tipo_pago: 'contado',
    dias_credito: 0
  });

  const manejarGuardarFactura = async (datos: any) => {
    try {
      const nuevaFactura = await crearFactura(datos);
      mostrarExito('Factura creada correctamente');
      // Navegar a detalle de factura o lista
    } catch (error) {
      mostrarError('Error al crear la factura');
    }
  };

  return (
    <LayoutAdmin
      title="Nueva Factura"
      description="Crear documento de facturación electrónica"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Facturación', href: '/admin/facturacion' },
        { label: 'Nueva Factura' }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nueva Factura Electrónica</h1>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </Button>
            <Button disabled={cargandoFactura}>
              <Save className="h-4 w-4 mr-2" />
              {cargandoFactura ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>

        <FormularioFactura
          onGuardar={manejarGuardarFactura}
          onCancelar={() => window.history.back()}
        />
      </div>
    </LayoutAdmin>
  );
};

export default NuevaFactura;

