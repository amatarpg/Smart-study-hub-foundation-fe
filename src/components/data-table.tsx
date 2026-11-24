import type { ReactNode } from "react";
import { Skeleton } from "./ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { EmptyState } from "./empty-state";
import { t } from "../i18n";

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  getRowKey: (item: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, rows, loading, getRowKey, emptyMessage }: DataTableProps<T>): JSX.Element {
  if (loading) {
    return (
      <div className="space-y-2 rounded-xl border p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }
  if (rows.length === 0) {
    return <EmptyState message={emptyMessage ?? t("common.noData")} />;
  }
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
