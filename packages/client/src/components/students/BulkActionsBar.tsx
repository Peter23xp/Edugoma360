import { Download, Printer, Archive, X } from 'lucide-react';

interface BulkActionsBarProps {
    count: number;
    onExport: () => void;
    onPrint: () => void;
    onArchive: () => void;
    onClear: () => void;
    isArchiving?: boolean;
}

export default function BulkActionsBar({
    count,
    onExport,
    onPrint,
    onArchive,
    onClear,
    isArchiving = false,
}: BulkActionsBarProps) {
    if (count === 0) return null;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between 
                        bg-neutral-900 text-white px-6 py-3.5 
                        shadow-[0_-4px_20px_rgba(0,0,0,0.15)]
                        animate-slide-up"
            style={{
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
        >
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                    {count}
                </div>
                <span className="text-sm font-medium">
                    élève{count > 1 ? 's' : ''} sélectionné{count > 1 ? 's' : ''}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <BulkButton
                    icon={<Download size={14} />}
                    label="Exporter Excel"
                    onClick={onExport}
                />
                <BulkButton
                    icon={<Printer size={14} />}
                    label="Imprimer liste"
                    onClick={onPrint}
                />
                <BulkButton
                    icon={<Archive size={14} />}
                    label="Archiver"
                    onClick={onArchive}
                    variant="danger"
                    loading={isArchiving}
                />
                <div className="w-px h-6 bg-neutral-700 mx-1" />
                <button
                    onClick={onClear}
                    className="p-2 rounded-lg hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
                    aria-label="Désélectionner tout"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

function BulkButton({
    icon,
    label,
    onClick,
    variant = 'default',
    loading = false,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
    loading?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium 
                transition-all duration-150 disabled:opacity-50
                ${variant === 'danger'
                    ? 'bg-danger/90 hover:bg-danger text-white'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                }
            `}
        >
            {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                icon
            )}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
