"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "../empty-state";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  align?: "left" | "right" | "center";
  className?: string;
  headerClassName?: string;
  width?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  pageSize?: number;
  searchable?: boolean;
  searchFn?: (row: T, query: string) => boolean;
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  emptyState?: React.ReactNode;
  stickyHeader?: boolean;
  dense?: boolean;
  className?: string;
}

type SortDir = "asc" | "desc";

export function DataTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  actions,
  pageSize = 8,
  searchable = false,
  searchFn,
  searchPlaceholder = "Search…",
  toolbar,
  emptyState,
  stickyHeader = true,
  dense = false,
  className,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [page, setPage] = React.useState(0);

  const filtered = React.useMemo(() => {
    if (!searchable || !searchFn || !query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) => searchFn(row, q));
  }, [data, query, searchable, searchFn]);

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const arr = [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [filtered, sortKey, sortDir, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * pageSize;
  const end = Math.min(start + pageSize, sorted.length);
  const pageData = sorted.slice(start, end);

  React.useEffect(() => {
    setPage(0);
  }, [query, sortKey, sortDir]);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const alignClass = (a?: string) =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  return (
    <div className={cn("flex flex-col", className)}>
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-3">
          {toolbar}
          {searchable && (
            <div className="relative ml-auto w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 pl-8 pr-3 text-sm"
              />
            </div>
          )}
        </div>
      )}

      <div className="scrollbar-thin overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-border/70 hover:bg-transparent">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const sortable = !!col.sortValue;
                return (
                  <TableHead
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      "h-9 px-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
                      alignClass(col.align),
                      col.headerClassName,
                      sortable && "cursor-pointer select-none hover:text-foreground",
                      col.hideOnMobile && "hidden sm:table-cell"
                    )}
                    onClick={() => sortable && toggleSort(col.key)}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        col.align === "right" && "flex-row-reverse"
                      )}
                    >
                      {col.header}
                      {sortable && (
                        <span className="text-muted-foreground/60">
                          {isSorted ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="size-3" />
                            ) : (
                              <ArrowDown className="size-3" />
                            )
                          ) : (
                            <ChevronDown className="size-3 opacity-0 group-hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </span>
                  </TableHead>
                );
              })}
              {actions && <TableHead className="w-10 px-4 text-right" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="p-0">
                  {emptyState ?? (
                    <EmptyState
                      title="No results found"
                      description="Try adjusting your search or filters."
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-border/60 group",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        dense ? "py-2" : "py-3",
                        "px-4 text-sm text-foreground",
                        alignClass(col.align),
                        col.className,
                        col.hideOnMobile && "hidden sm:table-cell"
                      )}
                    >
                      {col.cell(row)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell
                      className="px-4 py-2 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end">{actions(row)}</div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sorted.length > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-4 py-3">
          <p className="text-xs text-muted-foreground tnum">
            Showing <span className="font-medium text-foreground">{start + 1}</span>
            {"–"}
            <span className="font-medium text-foreground">{end}</span> of{" "}
            <span className="font-medium text-foreground">{sorted.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => setPage(0)}
              disabled={currentPage === 0}
              aria-label="First page"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="px-2 text-xs text-muted-foreground tnum">
              Page {currentPage + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={currentPage >= pageCount - 1}
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => setPage(pageCount - 1)}
              disabled={currentPage >= pageCount - 1}
              aria-label="Last page"
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
