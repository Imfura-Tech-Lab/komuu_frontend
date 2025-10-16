"use client";
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import autoTable from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface FilterComponent {
  type: "text" | "select" | "date" | "number" | "custom";
  options?: { label: string; value: string }[];
  component?: React.ComponentType<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }>;
}

export interface BaseTableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterComponent?: FilterComponent;
  render?: (item: T, value: any) => React.ReactNode;
  exportRender?: (item: T, value: any) => string | number;
  className?: string;
  headerClassName?: string;
  width?: number;
  minWidth?: number;
  resizable?: boolean;
  visible?: boolean;
}

export interface BaseTableProps<T = any> {
  data: T[];
  columns: BaseTableColumn<T>[];
  loading?: boolean;
  title?: string;
  exportFileName?: string;
  searchable?: boolean;
  searchFields?: string[];
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  actions?: React.ReactNode;
  className?: string;
  enableExcelExport?: boolean;
  enablePDFExport?: boolean;
  enableBulkSelection?: boolean;
  onBulkAction?: (selectedItems: T[]) => void;
  bulkActions?: Array<{
    label: string;
    action: (selectedItems: T[]) => void;
    icon?: React.ReactNode;
  }>;
  virtualScrolling?: boolean;
  itemHeight?: number;
  enableColumnManagement?: boolean;
  onColumnVisibilityChange?: (columnKey: string, visible: boolean) => void;
  stickyHeader?: boolean;
  rowKey?: string;
}

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface FilterConfig {
  [key: string]: string;
}

interface ColumnWidths {
  [key: string]: number;
}

const useVirtualScrolling = (
  containerRef: React.RefObject<HTMLDivElement>,
  items: any[],
  itemHeight: number = 50,
  buffer: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScrollTop = () => setScrollTop(container.scrollTop);
    const updateHeight = () => setContainerHeight(container.clientHeight);

    updateHeight();
    container.addEventListener("scroll", updateScrollTop);
    window.addEventListener("resize", updateHeight);

    return () => {
      container.removeEventListener("scroll", updateScrollTop);
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
  };
};

export function BaseTable<T extends Record<string, any>>({
  data,
  columns: initialColumns,
  loading = false,
  title,
  exportFileName = "export",
  searchable = true,
  searchFields = [],
  pagination = true,
  pageSize = 10,
  onRowClick,
  emptyMessage = "No data available",
  actions,
  className = "",
  enableExcelExport = true,
  enablePDFExport = true,
  enableBulkSelection = false,
  onBulkAction,
  bulkActions = [],
  virtualScrolling = false,
  itemHeight = 50,
  enableColumnManagement = false,
  onColumnVisibilityChange,
  stickyHeader = false,
  rowKey = "id",
}: BaseTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(() =>
    initialColumns.reduce<ColumnWidths>((acc, col) => {
      if (typeof col.width === "number") {
        acc[col.key] = col.width;
      }
      return acc;
    }, {})
  );

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () =>
      new Set<string>(
        initialColumns
          .filter((col) => col.visible !== false)
          .map((col) => col.key)
      )
  );
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const virtualContainerRef = useRef<HTMLDivElement>(null);

  const columns = useMemo(() => {
    return initialColumns
      .filter((col) => visibleColumns.has(col.key))
      .map((col) => ({
        ...col,
        width: columnWidths[col.key] || col.width,
      }));
  }, [initialColumns, visibleColumns, columnWidths]);

  const getNestedValue = useCallback((obj: any, path: string): any => {
    return path.split(".").reduce((value, key) => value?.[key], obj);
  }, []);

  const getRowKey = useCallback(
    (item: T): string => {
      return String(getNestedValue(item, rowKey) || Math.random());
    },
    [getNestedValue, rowKey]
  );

  const processedData = useMemo(() => {
    let filtered = [...data];

    if (searchTerm && searchable) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        if (searchFields.length > 0) {
          return searchFields.some((field) => {
            const value = getNestedValue(item, field);
            return String(value || "")
              .toLowerCase()
              .includes(searchLower);
          });
        }

        return Object.values(item).some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(searchLower)
        );
      });
    }

    Object.entries(filterConfig).forEach(([key, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter((item) => {
          const value = getNestedValue(item, key);
          return String(value || "")
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      }
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [
    data,
    searchTerm,
    searchable,
    searchFields,
    filterConfig,
    sortConfig,
    getNestedValue,
  ]);

  const {
    visibleItems: virtualVisibleItems,
    totalHeight,
    offsetY,
    // @ts-ignore
  } = useVirtualScrolling(virtualContainerRef, processedData, itemHeight);

  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (virtualScrolling) return virtualVisibleItems;
    if (!pagination) return processedData;

    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [
    processedData,
    currentPage,
    pageSize,
    pagination,
    virtualScrolling,
    virtualVisibleItems,
  ]);

  const isAllSelected =
    selectedItems.size === processedData.length && processedData.length > 0;
  const isIndeterminate =
    selectedItems.size > 0 && selectedItems.size < processedData.length;

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedItems(new Set());
    } else {
      const allKeys = processedData.map(getRowKey);
      setSelectedItems(new Set(allKeys));
    }
  }, [isAllSelected, processedData, getRowKey]);

  const handleSelectItem = useCallback(
    (item: T) => {
      const key = getRowKey(item);
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }
        return newSet;
      });
    },
    [getRowKey]
  );

  const handleColumnVisibilityChange = useCallback(
    (columnKey: string, visible: boolean) => {
      setVisibleColumns((prev) => {
        const newSet = new Set(prev);
        if (visible) {
          newSet.add(columnKey);
        } else {
          newSet.delete(columnKey);
        }
        return newSet;
      });
      onColumnVisibilityChange?.(columnKey, visible);
    },
    [onColumnVisibilityChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, columnKey: string) => {
      e.preventDefault();
      setResizingColumn(columnKey);

      const startX = e.clientX;
      const startWidth = columnWidths[columnKey] || 150;

      const handleMouseMove = (e: MouseEvent) => {
        const newWidth = Math.max(80, startWidth + e.clientX - startX);
        setColumnWidths((prev) => ({ ...prev, [columnKey]: newWidth }));
      };

      const handleMouseUp = () => {
        setResizingColumn(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [columnWidths]
  );

  const handleSort = useCallback(
    (key: string) => {
      const column = columns.find((col) => col.key === key);
      if (!column?.sortable) return;

      setSortConfig((current) => {
        if (current?.key === key) {
          if (current.direction === "asc") {
            return { key, direction: "desc" };
          } else {
            return null;
          }
        }
        return { key, direction: "asc" };
      });
    },
    [columns]
  );

  const handleFilter = useCallback((key: string, value: string) => {
    setFilterConfig((current) => ({
      ...current,
      [key]: value,
    }));
    setCurrentPage(1);
  }, []);

  const renderFilterComponent = useCallback(
    (column: BaseTableColumn<T>) => {
      const filterComponent = column.filterComponent;
      const value = filterConfig[column.key] || "";

      if (!filterComponent || filterComponent.type === "text") {
        return (
          <input
            type="text"
            placeholder={`Filter ${column.label.toLowerCase()}...`}
            value={value}
            onChange={(e) => handleFilter(column.key, e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          />
        );
      }

      if (filterComponent.type === "select" && filterComponent.options) {
        return (
          <select
            value={value}
            onChange={(e) => handleFilter(column.key, e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">All</option>
            {filterComponent.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      if (filterComponent.type === "date") {
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFilter(column.key, e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          />
        );
      }

      if (filterComponent.type === "number") {
        return (
          <input
            type="number"
            placeholder={`Filter ${column.label.toLowerCase()}...`}
            value={value}
            onChange={(e) => handleFilter(column.key, e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          />
        );
      }

      if (filterComponent.type === "custom" && filterComponent.component) {
        const CustomComponent = filterComponent.component;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <CustomComponent
              value={value}
              onChange={(newValue) => handleFilter(column.key, newValue)}
              placeholder={`Filter ${column.label.toLowerCase()}...`}
            />
          </div>
        );
      }

      return null;
    },
    [filterConfig, handleFilter]
  );

  const exportToExcel = useCallback(() => {
    const selectedData =
      enableBulkSelection && selectedItems.size > 0
        ? processedData.filter((item) => selectedItems.has(getRowKey(item)))
        : processedData;

    const exportData = selectedData.map((item) => {
      const row: Record<string, any> = {};
      columns.forEach((column) => {
        const value = getNestedValue(item, column.key);
        if (column.exportRender) {
          row[column.label] = column.exportRender(item, value);
        } else {
          row[column.label] = value;
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const fileName = `${exportFileName}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }, [
    processedData,
    columns,
    exportFileName,
    getNestedValue,
    enableBulkSelection,
    selectedItems,
    getRowKey,
  ]);

  const exportToPDF = useCallback(() => {
    const selectedData =
      enableBulkSelection && selectedItems.size > 0
        ? processedData.filter((item) => selectedItems.has(getRowKey(item)))
        : processedData;

    const doc = new jsPDF();

    // Add title if provided
    if (title) {
      doc.setFontSize(16);
      doc.text(title, 14, 22);
    }

    // Prepare table headers
    const headers = columns.map((column) => column.label);

    // Prepare table data
    const tableData = selectedData.map((item) => {
      return columns.map((column) => {
        const value = getNestedValue(item, column.key);
        if (column.exportRender) {
          return String(column.exportRender(item, value) || "");
        }
        return String(value || "");
      });
    });

    // Add table to PDF using autoTable
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: title ? 30 : 20,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 20 },
      tableWidth: "auto",
    });

    // Save the PDF
    const fileName = `${exportFileName}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);
  }, [
    processedData,
    columns,
    exportFileName,
    title,
    getNestedValue,
    enableBulkSelection,
    selectedItems,
    getRowKey,
  ]);

  const resetFilters = useCallback(() => {
    setFilterConfig({});
    setSearchTerm("");
    setSortConfig(null);
    setCurrentPage(1);
    setSelectedItems(new Set());
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  const paginationButtons = useMemo(() => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`px-3 py-1 text-sm rounded-md transition-colors duration-150 ${
            page === currentPage
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          }`}
        >
          {page}
        </button>
      );
    }

    return buttons;
  }, [currentPage, totalPages, goToPage]);

  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden ${className}`}
      ref={tableRef}
    >
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            {title && (
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {processedData.length} of {data.length} entries
              {enableBulkSelection &&
                selectedItems.size > 0 &&
                ` • ${selectedItems.size} selected`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {searchable && (
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full"
                />
              </div>
            )}

            {enableBulkSelection &&
              selectedItems.size > 0 &&
              bulkActions.length > 0 && (
                <div className="flex items-center gap-2">
                  {bulkActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const selectedData = processedData.filter((item) =>
                          selectedItems.has(getRowKey(item))
                        );
                        action.action(selectedData);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150"
                    >
                      {action.icon && (
                        <span className="mr-1">{action.icon}</span>
                      )}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

            {enableColumnManagement && (
              <div className="relative">
                <button
                  onClick={() => setShowColumnManager(!showColumnManager)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150"
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
                  Columns
                </button>

                {showColumnManager && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Manage Columns
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {initialColumns.map((column) => (
                          <label key={column.key} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={visibleColumns.has(column.key)}
                              onChange={(e) =>
                                handleColumnVisibilityChange(
                                  column.key,
                                  e.target.checked
                                )
                              }
                              className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              {column.label}
                            </span>
                            <button
                              onClick={() =>
                                handleColumnVisibilityChange(
                                  column.key,
                                  !visibleColumns.has(column.key)
                                )
                              }
                              className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
                              title={
                                visibleColumns.has(column.key)
                                  ? "Hide column"
                                  : "Show column"
                              }
                            >
                              <EyeIcon
                                className={`h-4 w-4 ${
                                  visibleColumns.has(column.key)
                                    ? ""
                                    : "text-red-500"
                                }`}
                              />
                            </button>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {actions && <div className="flex items-center">{actions}</div>}

            <div className="flex items-center gap-2">
              {enableExcelExport && (
                <button
                  onClick={exportToExcel}
                  disabled={processedData.length === 0}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  title="Export to Excel"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Excel
                </button>
              )}

              {enablePDFExport && (
                <button
                  onClick={exportToPDF}
                  disabled={processedData.length === 0}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  title="Export to PDF"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                  PDF
                </button>
              )}
            </div>

            {(Object.values(filterConfig).some((v) => v) ||
              searchTerm ||
              sortConfig) && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        className={`overflow-x-auto ${virtualScrolling ? "h-96" : ""}`}
        ref={virtualScrolling ? virtualContainerRef : undefined}
      >
        {virtualScrolling && (
          <div style={{ height: totalHeight, position: "relative" }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead
                  className={`bg-gray-50 dark:bg-gray-900 ${
                    stickyHeader ? "sticky top-0 z-10" : ""
                  }`}
                >
                  <tr>
                    {enableBulkSelection && (
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = isIndeterminate;
                          }}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                    )}

                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider relative ${
                          column.headerClassName || ""
                        }`}
                        style={{
                          width: column.width,
                          minWidth: column.minWidth,
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <span
                            className={
                              column.sortable
                                ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150"
                                : ""
                            }
                            onClick={() =>
                              column.sortable && handleSort(column.key)
                            }
                          >
                            {column.label}
                          </span>

                          {column.sortable && (
                            <div className="flex flex-col">
                              <ChevronUpIcon
                                className={`h-3 w-3 ${
                                  sortConfig?.key === column.key &&
                                  sortConfig.direction === "asc"
                                    ? "text-blue-500"
                                    : "text-gray-400"
                                }`}
                              />
                              <ChevronDownIcon
                                className={`h-3 w-3 -mt-1 ${
                                  sortConfig?.key === column.key &&
                                  sortConfig.direction === "desc"
                                    ? "text-blue-500"
                                    : "text-gray-400"
                                }`}
                              />
                            </div>
                          )}
                        </div>

                        {column.filterable && (
                          <div className="mt-2">
                            {renderFilterComponent(column)}
                          </div>
                        )}

                        {column.resizable !== false && (
                          <div
                            className={`absolute top-0 right-0 w-2 h-full cursor-col-resize ${
                              resizingColumn === column.key
                                ? "bg-blue-300 dark:bg-blue-600"
                                : "hover:bg-blue-200 dark:hover:bg-blue-700"
                            }`}
                            onMouseDown={(e) => handleMouseDown(e, column.key)}
                          />
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={columns.length + (enableBulkSelection ? 1 : 0)}
                        className="px-6 py-12 text-center"
                      >
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          <span className="ml-2 text-gray-500 dark:text-gray-400">
                            Loading...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + (enableBulkSelection ? 1 : 0)}
                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        {emptyMessage}
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => {
                      const rowKeyValue = getRowKey(item);
                      const isSelected = selectedItems.has(rowKeyValue);

                      return (
                        <tr
                          key={rowKeyValue}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                            onRowClick ? "cursor-pointer" : ""
                          } ${
                            isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                          onClick={() => onRowClick?.(item)}
                          style={{
                            height: itemHeight,
                          }}
                        >
                          {enableBulkSelection && (
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSelectItem(item);
                                }}
                                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                          )}

                          {columns.map((column) => {
                            const value = getNestedValue(item, column.key);
                            return (
                              <td
                                key={column.key}
                                className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${
                                  column.className || ""
                                }`}
                                style={{
                                  width: column.width,
                                  minWidth: column.minWidth,
                                }}
                              >
                                {column.render
                                  ? column.render(item, value)
                                  : String(value || "")}
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
          </div>
        )}

        {!virtualScrolling && (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead
              className={`bg-gray-50 dark:bg-gray-900 ${
                stickyHeader ? "sticky top-0 z-10" : ""
              }`}
            >
              <tr>
                {enableBulkSelection && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}

                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider relative ${
                      column.headerClassName || ""
                    }`}
                    style={{ width: column.width, minWidth: column.minWidth }}
                  >
                    <div className="flex items-center space-x-1">
                      <span
                        className={
                          column.sortable
                            ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150"
                            : ""
                        }
                        onClick={() =>
                          column.sortable && handleSort(column.key)
                        }
                      >
                        {column.label}
                      </span>

                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUpIcon
                            className={`h-3 w-3 ${
                              sortConfig?.key === column.key &&
                              sortConfig.direction === "asc"
                                ? "text-blue-500"
                                : "text-gray-400"
                            }`}
                          />
                          <ChevronDownIcon
                            className={`h-3 w-3 -mt-1 ${
                              sortConfig?.key === column.key &&
                              sortConfig.direction === "desc"
                                ? "text-blue-500"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    {column.filterable && (
                      <div className="mt-2">
                        {renderFilterComponent(column)}
                      </div>
                    )}

                    {column.resizable !== false && (
                      <div
                        className={`absolute top-0 right-0 w-2 h-full cursor-col-resize ${
                          resizingColumn === column.key
                            ? "bg-blue-300 dark:bg-blue-600"
                            : "hover:bg-blue-200 dark:hover:bg-blue-700"
                        }`}
                        onMouseDown={(e) => handleMouseDown(e, column.key)}
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (enableBulkSelection ? 1 : 0)}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-500 dark:text-gray-400">
                        Loading...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (enableBulkSelection ? 1 : 0)}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const rowKeyValue = getRowKey(item);
                  const isSelected = selectedItems.has(rowKeyValue);

                  return (
                    <tr
                      key={rowKeyValue}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                        onRowClick ? "cursor-pointer" : ""
                      } ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                      onClick={() => onRowClick?.(item)}
                    >
                      {enableBulkSelection && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectItem(item);
                            }}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      )}

                      {columns.map((column) => {
                        const value = getNestedValue(item, column.key);
                        return (
                          <td
                            key={column.key}
                            className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${
                              column.className || ""
                            }`}
                            style={{
                              width: column.width,
                              minWidth: column.minWidth,
                            }}
                          >
                            {column.render
                              ? column.render(item, value)
                              : String(value || "")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {pagination && !virtualScrolling && totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages} • {processedData.length} items
              {enableBulkSelection &&
                selectedItems.size > 0 &&
                ` • ${selectedItems.size} selected`}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              <div className="flex space-x-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                {paginationButtons}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showColumnManager && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowColumnManager(false)}
        />
      )}
    </div>
  );
}
