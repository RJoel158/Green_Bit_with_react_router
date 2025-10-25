// SortableTable.tsx - Componente de tabla reutilizable con ordenamiento y paginación
import { useState, useMemo, useEffect } from 'react';
import '../UserManagementComp/UserManagement.css';

export type SortDirection = 'asc' | 'desc';

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface SortableTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (item: T) => void;
  selectedItemKey?: string | number;
  itemsPerPage?: number;
  emptyMessage?: string;
  getRowKey: (item: T) => string | number;
}

export default function SortableTable<T>({
  data,
  columns,
  onRowClick,
  selectedItemKey,
  itemsPerPage = 10,
  emptyMessage = 'No hay datos disponibles',
  getRowKey,
}: SortableTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Datos ordenados usando useMemo para evitar recalcular innecesariamente
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortColumn];
      const bValue = (b as any)[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Comparación numérica
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Comparación de strings
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  }, [data, sortColumn, sortDirection]);

  // Calcular paginación usando useMemo
  const { totalPages, currentData, validCurrentPage } = useMemo(() => {
    const total = Math.ceil(sortedData.length / itemsPerPage);
    const validPage = Math.min(Math.max(1, currentPage), Math.max(1, total));
    const startIndex = (validPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      totalPages: total,
      currentData: sortedData.slice(startIndex, endIndex),
      validCurrentPage: validPage
    };
  }, [sortedData, currentPage, itemsPerPage]);

  // Resetear a página 1 cuando cambie la cantidad de datos
  useEffect(() => {
    if (currentPage > 1 && sortedData.length <= itemsPerPage) {
      setCurrentPage(1);
    }
  }, [sortedData.length, itemsPerPage, currentPage]);

  // Función de ordenamiento - Solo alterna entre asc y desc
  const handleSort = (columnKey: string, sortable: boolean = true) => {
    if (!sortable) return;

    if (sortColumn === columnKey) {
      // Alternar entre asc y desc
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nueva columna, empezar en ascendente
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Resetear a primera página al ordenar
  };

  // Renderizar icono de ordenamiento
  const renderSortIcon = (columnKey: string, sortable: boolean = true) => {
    if (!sortable) return null;
    
    if (sortColumn !== columnKey) {
      return <span className="sort-icon">⇅</span>;
    }
    
    return (
      <span className="sort-icon active">
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="user-management-table-container">
      <div className="user-management-table-scroll">
        <table 
          className="user-management-table"
          key={`table-${sortColumn}-${sortDirection}`}
        >
          <thead>
            <tr className="user-management-table-head-row">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`user-management-table-head-cell ${
                    column.sortable !== false ? 'sortable' : ''
                  } ${column.className || ''}`}
                  onClick={() => handleSort(column.key, column.sortable !== false)}
                  style={column.sortable !== false ? { cursor: 'pointer', userSelect: 'none' } : {}}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {column.label}
                    {renderSortIcon(column.key, column.sortable !== false)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#6b7280',
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentData.map((item) => {
                const rowKey = getRowKey(item);
                const isSelected = selectedItemKey === rowKey;
                
                return (
                  <tr
                    key={rowKey}
                    className={`user-management-table-body-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => onRowClick?.(item)}
                    style={onRowClick ? { cursor: 'pointer' } : {}}
                  >
                    {columns.map((column) => (
                      <td
                        key={`${rowKey}-${column.key}`}
                        className={`user-management-table-body-cell ${column.className || ''}`}
                      >
                        {column.render
                          ? column.render(item)
                          : String((item as any)[column.key] || '')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="user-management-table-pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={validCurrentPage === 1}
            className="user-management-table-pagination-btn"
          >
            ◀
          </button>
          <span className="user-management-table-pagination-page">
            {validCurrentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={validCurrentPage === totalPages}
            className="user-management-table-pagination-btn"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
