'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import {
  ColumnFiltersState,
  ExpandedState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FileNode } from './types';
import {
  getFileNodes,
  flattenNodes,
  getAcceleratedUrl,
  downloadBatchFiles,
} from './utils';
import { createColumns } from './columns';
import { Toolbar } from './toolbar';

interface FileTreeTableProps {
  data: FileNode[];
  className?: string;
  url?: string;
}

export function FileTreeTable({ data, className, url }: FileTreeTableProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>(() => {
    // Initialize expanded state based on defaultOpen
    const initialExpanded: Record<string, boolean> = {};
    function initExpanded(nodes: FileNode[]) {
      for (const node of nodes) {
        if (node.type === 'folder' && node.defaultOpen) {
          initialExpanded[node.id] = true;
        }
        if (node.children) {
          initExpanded(node.children);
        }
      }
    }
    initExpanded(data);
    return initialExpanded;
  });
  const [isAccelerated, setIsAccelerated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const prevFilterRef = useRef(globalFilter);

  // Memoize columns with current acceleration state
  const columns = useMemo(
    () => createColumns({ isAccelerated }),
    [isAccelerated]
  );

  // Auto-expand folders that match search
  useEffect(() => {
    if (globalFilter) {
      const newExpanded: Record<string, boolean> = {};
      const query = globalFilter.toLowerCase();

      function expandMatching(nodes: FileNode[]) {
        for (const node of nodes) {
          const matchesSelf = node.name.toLowerCase().includes(query);
          const hasMatchingChild = node.children?.some(
            (child) =>
              child.name.toLowerCase().includes(query) ||
              (child.children &&
                flattenNodes([child]).some((n) =>
                  n.name.toLowerCase().includes(query)
                ))
          );

          if (node.type === 'folder' && (matchesSelf || hasMatchingChild)) {
            newExpanded[node.id] = true;
          }

          if (node.children) {
            expandMatching(node.children);
          }
        }
      }
      expandMatching(data);
      setExpanded(newExpanded);
    } else if (prevFilterRef.current !== '') {
      // Clear all expanded folders when search is cleared
      setExpanded({});
    }
    prevFilterRef.current = globalFilter;
  }, [globalFilter, data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      rowSelection,
      columnFilters,
      expanded,
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
    filterFromLeafRows: true,
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const name = row.original.name;
      return name.toLowerCase().includes(filterValue.toLowerCase());
    },
  });

  const selectedRowCount = Object.keys(rowSelection).length;
  const hasResults = table.getRowModel().rows.length > 0;

  const handleBatchDownload = async () => {
    if (selectedRowCount === 0) return;
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Get all file nodes and filter by selection
      const allFiles = getFileNodes(data);
      const selectedFiles = allFiles
        .filter((file) => rowSelection[file.id])
        .map((file) => ({
          path: file.id,
          url: isAccelerated ? getAcceleratedUrl(file.url!) : file.url!,
          name: file.name,
        }));

      if (selectedFiles.length === 0) {
        toast.error('请选择要下载的文件');
        return;
      }

      await downloadBatchFiles(selectedFiles, setDownloadProgress);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Batch download failed:', error);
      toast.error(`下载失败: ${message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4 w-full not-prose', className)}>
      <Toolbar
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        isAccelerated={isAccelerated}
        setIsAccelerated={setIsAccelerated}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
        selectedRowCount={selectedRowCount}
        onBatchDownload={handleBatchDownload}
        url={url}
      />

      {/* Table */}
      <div className="bg-background overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/50 whitespace-nowrap"
              >
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | { className?: string }
                    | undefined;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn('h-9 py-2', meta?.className)}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {hasResults ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    row.original.type === 'folder' && 'cursor-pointer h-12'
                  )}
                  onClick={
                    row.original.type === 'folder'
                      ? () => row.toggleExpanded()
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | { className?: string }
                      | undefined;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn('py-2', meta?.className)}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  未找到相关文件
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
