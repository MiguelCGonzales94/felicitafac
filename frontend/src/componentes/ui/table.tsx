/**
 * Table Component - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente base de tabla con ordenamiento, paginación y filtros
 */

import React from 'react';
import { cn } from '../../utils/cn.ts';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface ColumnaTabla<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  fixed?: 'left' | 'right';
  className?: string;
}

export interface PropiedadesTable<T = any> {
  columnas: ColumnaTabla<T>[];
  datos: T[];
  loading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  sticky?: boolean;
  maxHeight?: string;
  emptyText?: string;
  onRow?: (record: T, index: number) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
    className?: string;
  };
  rowKey?: keyof T | ((record: T) => string | number);
  selectedRows?: (string | number)[];
  onSelectRow?: (selectedKeys: (string | number)[]) => void;
  selectable?: boolean;
}

export interface PropiedadesTablePaginacion {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  pageSizeOptions?: number[];
}

export interface PropiedadesTableHeader {
  columna: ColumnaTabla;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
}

// =======================================================
// COMPONENTE TABLE HEADER
// =======================================================

const TableHeader: React.FC<PropiedadesTableHeader> = ({
  columna,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const handleSort = () => {
    if (!columna.sortable || !onSort) return;

    const newOrder = sortBy === columna.key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(columna.key, newOrder);
  };

  const isActive = sortBy === columna.key;

  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        columna.align === 'center' && 'text-center',
        columna.align === 'right' && 'text-right',
        columna.sortable && 'cursor-pointer hover:bg-gray-100 select-none',
        columna.className
      )}
      style={{ width: columna.width }}
      onClick={handleSort}
    >
      <div className="flex items-center gap-1">
        <span>{columna.title}</span>
        {columna.sortable && (
          <div className="flex flex-col">
            <svg
              className={cn(
                'h-3 w-3',
                isActive && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-400'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <svg
              className={cn(
                'h-3 w-3 -mt-1',
                isActive && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </th>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL - TABLE
// =======================================================

const Table = <T extends Record<string, any>>({
  columnas,
  datos,
  loading = false,
  className,
  size = 'md',
  bordered = true,
  hoverable = true,
  striped = false,
  sticky = false,
  maxHeight,
  emptyText = 'No hay datos disponibles',
  onRow,
  rowKey = 'id',
  selectedRows = [],
  onSelectRow,
  selectable = false,
  ...props
}: PropiedadesTable<T>) => {
  const [sortBy, setSortBy] = React.useState<string>('');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  // Obtener clave de fila
  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index;
  };

  // Manejar ordenamiento
  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(order);
  };

  // Ordenar datos
  const datosSorteados = React.useMemo(() => {
    if (!sortBy) return datos;

    return [...datos].sort((a, b) => {
      const columna = columnas.find(col => col.key === sortBy);
      const aValue = columna?.dataIndex ? a[columna.dataIndex] : a[sortBy];
      const bValue = columna?.dataIndex ? b[columna.dataIndex] : b[sortBy];

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [datos, sortBy, sortOrder, columnas]);

  // Manejar selección de fila
  const handleSelectRow = (key: string | number, checked: boolean) => {
    if (!onSelectRow) return;

    let newSelectedRows: (string | number)[];
    if (checked) {
      newSelectedRows = [...selectedRows, key];
    } else {
      newSelectedRows = selectedRows.filter(item => item !== key);
    }
    onSelectRow(newSelectedRows);
  };

  // Manejar seleccionar todos
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectRow) return;

    if (checked) {
      const allKeys = datosSorteados.map((record, index) => getRowKey(record, index));
      onSelectRow(allKeys);
    } else {
      onSelectRow([]);
    }
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const paddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const containerClasses = cn(
    'overflow-auto',
    maxHeight && 'max-h-96',
    className
  );

  const tableClasses = cn(
    'min-w-full divide-y divide-gray-200',
    sizeClasses[size],
    bordered && 'border border-gray-200',
    className
  );

  const isAllSelected = selectedRows.length === datosSorteados.length && datosSorteados.length > 0;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < datosSorteados.length;

  return (
    <div className={containerClasses} style={{ maxHeight }}>
      <table className={tableClasses} {...props}>
        {/* Header */}
        <thead className={cn('bg-gray-50', sticky && 'sticky top-0 z-10')}>
          <tr>
            {/* Columna de selección */}
            {selectable && (
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
            )}
            
            {/* Columnas de datos */}
            {columnas.map((columna) => (
              <TableHeader
                key={columna.key}
                columna={columna}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td
                colSpan={columnas.length + (selectable ? 1 : 0)}
                className="px-4 py-8 text-center text-gray-500"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  Cargando...
                </div>
              </td>
            </tr>
          ) : datosSorteados.length === 0 ? (
            <tr>
              <td
                colSpan={columnas.length + (selectable ? 1 : 0)}
                className="px-4 py-8 text-center text-gray-500"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            datosSorteados.map((record, index) => {
              const key = getRowKey(record, index);
              const rowProps = onRow?.(record, index) || {};
              const isSelected = selectedRows.includes(key);

              return (
                <tr
                  key={key}
                  className={cn(
                    'transition-colors',
                    hoverable && 'hover:bg-gray-50',
                    striped && index % 2 === 1 && 'bg-gray-25',
                    isSelected && 'bg-blue-50',
                    rowProps.className
                  )}
                  onClick={rowProps.onClick}
                  onDoubleClick={rowProps.onDoubleClick}
                >
                  {/* Celda de selección */}
                  {selectable && (
                    <td className={paddingClasses[size]}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}

                  {/* Celdas de datos */}
                  {columnas.map((columna) => {
                    const value = columna.dataIndex ? record[columna.dataIndex] : record[columna.key];
                    const content = columna.render ? columna.render(value, record, index) : value;

                    return (
                      <td
                        key={columna.key}
                        className={cn(
                          paddingClasses[size],
                          'whitespace-nowrap',
                          columna.align === 'center' && 'text-center',
                          columna.align === 'right' && 'text-right',
                          columna.className
                        )}
                        style={{ width: columna.width }}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

// =======================================================
// COMPONENTE TABLE PAGINATION
// =======================================================

const TablePagination: React.FC<PropiedadesTablePaginacion> = ({
  current,
  pageSize,
  total,
  onChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal,
  pageSizeOptions = [10, 20, 50, 100],
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const start = (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  const handlePrevious = () => {
    if (current > 1) onChange(current - 1, pageSize);
  };

  const handleNext = () => {
    if (current < totalPages) onChange(current + 1, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    onChange(1, newPageSize);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      {/* Información total */}
      <div className="text-sm text-gray-700">
        {showTotal ? showTotal(total, [start, end]) : `Mostrando ${start}-${end} de ${total} registros`}
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-4">
        {/* Selector de tamaño de página */}
        {showSizeChanger && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">por página</span>
          </div>
        )}

        {/* Navegación */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={current <= 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <span className="text-sm text-gray-700">
            Página {current} de {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={current >= totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>

        {/* Salto rápido */}
        {showQuickJumper && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Ir a página</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const page = Number((e.target as HTMLInputElement).value);
                  if (page >= 1 && page <= totalPages) {
                    onChange(page, pageSize);
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// =======================================================
// HOOK PERSONALIZADO PARA TABLA
// =======================================================

export const useTable = <T extends Record<string, any>>(
  datos: T[],
  opciones: {
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(opciones.pageSize || 20);
  const [sortBy, setSortBy] = React.useState(opciones.sortBy || '');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>(opciones.sortOrder || 'asc');
  const [selectedRows, setSelectedRows] = React.useState<(string | number)[]>([]);

  // Datos paginados
  const datosPaginados = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return datos.slice(start, end);
  }, [datos, currentPage, pageSize]);

  const handlePageChange = (page: number, newPageSize: number) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(order);
  };

  return {
    datosPaginados,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    selectedRows,
    setSelectedRows,
    handlePageChange,
    handleSort,
    total: datos.length,
  };
};

// =======================================================
// EXPORTACIONES
// =======================================================

export { Table, TablePagination };
export default Table;