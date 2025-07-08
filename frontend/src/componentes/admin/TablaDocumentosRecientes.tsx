/**
 * Tabla Documentos Recientes - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente para mostrar documentos recientes en el dashboard
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Edit, 
  Download, 
  Trash2, 
  MoreHorizontal,
  FileText,
  Calendar,
  User,
  DollarSign,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { DocumentoReciente, EstadoDocumento, TipoDocumento } from '../../types/admin';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES
// =======================================================

interface PropiedadesTablaDocumentos {
  documentos: DocumentoReciente[];
  cargando?: boolean;
  onActualizar?: () => void;
  onVerDocumento?: (documento: DocumentoReciente) => void;
  onEditarDocumento?: (documento: DocumentoReciente) => void;
  onDescargarDocumento?: (documento: DocumentoReciente) => void;
  onAnularDocumento?: (documento: DocumentoReciente) => void;
  mostrarAcciones?: boolean;
  limite?: number;
  className?: string;
}

interface PropiedadesFilaDocumento {
  documento: DocumentoReciente;
  onVerDocumento?: (documento: DocumentoReciente) => void;
  onEditarDocumento?: (documento: DocumentoReciente) => void;
  onDescargarDocumento?: (documento: DocumentoReciente) => void;
  onAnularDocumento?: (documento: DocumentoReciente) => void;
  mostrarAcciones: boolean;
}

interface PropiedadesMenuAcciones {
  documento: DocumentoReciente;
  onVerDocumento?: (documento: DocumentoReciente) => void;
  onEditarDocumento?: (documento: DocumentoReciente) => void;
  onDescargarDocumento?: (documento: DocumentoReciente) => void;
  onAnularDocumento?: (documento: DocumentoReciente) => void;
  onCerrar: () => void;
}

// =======================================================
// COMPONENTE MENU ACCIONES
// =======================================================

const MenuAcciones: React.FC<PropiedadesMenuAcciones> = ({
  documento,
  onVerDocumento,
  onEditarDocumento,
  onDescargarDocumento,
  onAnularDocumento,
  onCerrar
}) => {
  const handleAccion = (accion: () => void) => {
    accion();
    onCerrar();
  };

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
      <div className="py-1">
        {onVerDocumento && (
          <button
            onClick={() => handleAccion(() => onVerDocumento(documento))}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Eye className="h-4 w-4 mr-3 text-gray-400" />
            Ver Documento
          </button>
        )}
        
        {onEditarDocumento && documento.puedeEditar && (
          <button
            onClick={() => handleAccion(() => onEditarDocumento(documento))}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Edit className="h-4 w-4 mr-3 text-gray-400" />
            Editar
          </button>
        )}
        
        {onDescargarDocumento && documento.puedeDescargar && (
          <button
            onClick={() => handleAccion(() => onDescargarDocumento(documento))}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Download className="h-4 w-4 mr-3 text-gray-400" />
            Descargar PDF
          </button>
        )}
        
        <div className="border-t border-gray-100 my-1"></div>
        
        {onAnularDocumento && documento.puedeAnular && documento.estado !== 'Anulado' && (
          <button
            onClick={() => handleAccion(() => onAnularDocumento(documento))}
            className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-3 text-red-400" />
            Anular Documento
          </button>
        )}
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE FILA DOCUMENTO
// =======================================================

const FilaDocumento: React.FC<PropiedadesFilaDocumento> = ({
  documento,
  onVerDocumento,
  onEditarDocumento,
  onDescargarDocumento,
  onAnularDocumento,
  mostrarAcciones
}) => {
  const [mostrarMenu, setMostrarMenu] = useState(false);

  // =======================================================
  // FUNCIONES AUXILIARES
  // =======================================================

  const obtenerColorEstado = (estado: EstadoDocumento): string => {
    const colores = {
      'Enviado': 'bg-green-100 text-green-800 border-green-200',
      'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Error': 'bg-red-100 text-red-800 border-red-200',
      'Anulado': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const obtenerIconoTipo = (tipo: TipoDocumento) => {
    const iconos = {
      'Factura': '📄',
      'Boleta': '🧾',
      'Nota Crédito': '📝',
      'Nota Débito': '📋'
    };
    return iconos[tipo] || '📄';
  };

  const formatearFecha = (fecha: string): string => {
    try {
      return new Date(fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  const formatearMonto = (monto: number, moneda: string = 'PEN'): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 2
    }).format(monto);
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Tipo y Número */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{obtenerIconoTipo(documento.tipo)}</span>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{documento.numero}</span>
              <span className={cn(
                'px-2 py-1 text-xs rounded-full border',
                obtenerColorEstado(documento.estado)
              )}>
                {documento.estado}
              </span>
            </div>
            <p className="text-sm text-gray-500">{documento.tipo}</p>
          </div>
        </div>
      </td>

      {/* Cliente */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900 truncate max-w-xs" title={documento.cliente}>
              {documento.cliente}
            </p>
            {documento.clienteId && (
              <p className="text-sm text-gray-500">ID: {documento.clienteId}</p>
            )}
          </div>
        </div>
      </td>

      {/* Monto */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {formatearMonto(documento.monto, documento.moneda)}
            </p>
            {documento.moneda && documento.moneda !== 'PEN' && (
              <p className="text-sm text-gray-500">{documento.moneda}</p>
            )}
          </div>
        </div>
      </td>

      {/* Fecha */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-sm text-gray-900">{formatearFecha(documento.fecha)}</p>
            {documento.fechaVencimiento && (
              <p className="text-xs text-gray-500">
                Vence: {formatearFecha(documento.fechaVencimiento)}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Acciones */}
      {mostrarAcciones && (
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            {/* Acciones rápidas */}
            <div className="flex items-center space-x-1">
              {onVerDocumento && (
                <button
                  onClick={() => onVerDocumento(documento)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Ver documento"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              
              {onEditarDocumento && documento.puedeEditar && (
                <button
                  onClick={() => onEditarDocumento(documento)}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  title="Editar documento"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
              
              {onDescargarDocumento && documento.puedeDescargar && (
                <button
                  onClick={() => onDescargarDocumento(documento)}
                  className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                  title="Descargar PDF"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Menú más opciones */}
            <div className="relative">
              <button
                onClick={() => setMostrarMenu(!mostrarMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Más opciones"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {mostrarMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-[5]" 
                    onClick={() => setMostrarMenu(false)}
                  />
                  <MenuAcciones
                    documento={documento}
                    onVerDocumento={onVerDocumento}
                    onEditarDocumento={onEditarDocumento}
                    onDescargarDocumento={onDescargarDocumento}
                    onAnularDocumento={onAnularDocumento}
                    onCerrar={() => setMostrarMenu(false)}
                  />
                </>
              )}
            </div>
          </div>
        </td>
      )}
    </tr>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const TablaDocumentosRecientes: React.FC<PropiedadesTablaDocumentos> = ({
  documentos,
  cargando = false,
  onActualizar,
  onVerDocumento,
  onEditarDocumento,
  onDescargarDocumento,
  onAnularDocumento,
  mostrarAcciones = true,
  limite,
  className
}) => {
  // Limitar documentos si se especifica
  const documentosMostrar = limite ? documentos.slice(0, limite) : documentos;

  // =======================================================
  // COMPONENTE LOADING
  // =======================================================

  if (cargando) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 animate-pulse">
                <div className="h-12 bg-gray-200 rounded w-16"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // RENDER PRINCIPAL
  // =======================================================

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Documentos Recientes
            </h3>
            {documentos.length > 0 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {documentos.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {onActualizar && (
              <button
                onClick={onActualizar}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Actualizar lista"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            
            <Link
              to="/admin/facturacion/documentos"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Ver todos
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        {documentosMostrar.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No hay documentos recientes</p>
            <Link
              to="/admin/facturacion/pos"
              className="inline-flex items-center mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Crear Documento
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                {mostrarAcciones && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documentosMostrar.map((documento) => (
                <FilaDocumento
                  key={documento.id}
                  documento={documento}
                  onVerDocumento={onVerDocumento}
                  onEditarDocumento={onEditarDocumento}
                  onDescargarDocumento={onDescargarDocumento}
                  onAnularDocumento={onAnularDocumento}
                  mostrarAcciones={mostrarAcciones}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer con enlace a ver más */}
      {limite && documentos.length > limite && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <Link
              to="/admin/facturacion/documentos"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Ver los {documentos.length - limite} documentos restantes
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaDocumentosRecientes;