import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DataTableProps<T> {
    columns: Array<{
        key: string;
        label: string;
        render?: (row: T) => React.ReactNode;
        className?: string;
    }>;
    data: T[];
    page?: number;
    totalPages?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    onRowClick?: (row: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    page = 1,
    totalPages = 1,
    totalItems,
    onPageChange,
    onRowClick,
    isLoading,
    emptyMessage = 'Aucune donnée disponible',
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
                <div className="animate-pulse space-y-3 p-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-10 bg-neutral-100 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-neutral-300/50 p-12 text-center">
                <p className="text-neutral-500 text-sm">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="table-header">
                            {columns.map((col) => (
                                <th key={col.key} className={`px-4 py-3 text-left ${col.className || ''}`}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {data.map((row, rowIdx) => (
                            <tr
                                key={rowIdx}
                                onClick={() => onRowClick?.(row)}
                                className={`hover:bg-neutral-100/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className={`px-4 py-3 text-sm ${col.className || ''}`}>
                                        {col.render ? col.render(row) : String(row[col.key] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && onPageChange && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
                    <p className="text-xs text-neutral-500">
                        Page {page} sur {totalPages}
                        {totalItems != null && ` — ${totalItems} résultat(s)`}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(1)}
                            disabled={page <= 1}
                            className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30"
                        >
                            <ChevronsLeft size={14} />
                        </button>
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30"
                        >
                            <ChevronRight size={14} />
                        </button>
                        <button
                            onClick={() => onPageChange(totalPages)}
                            disabled={page >= totalPages}
                            className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30"
                        >
                            <ChevronsRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
