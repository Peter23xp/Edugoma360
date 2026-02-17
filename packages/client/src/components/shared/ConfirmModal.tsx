import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const variantColors = {
        danger: { icon: 'text-danger bg-danger-bg', btn: 'bg-danger hover:bg-red-800' },
        warning: { icon: 'text-warning bg-warning-bg', btn: 'bg-warning hover:bg-amber-700' },
        info: { icon: 'text-info bg-info-bg', btn: 'bg-info hover:bg-blue-800' },
    };

    const colors = variantColors[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                <button
                    onClick={onCancel}
                    className="absolute top-3 right-3 p-1 rounded-lg hover:bg-neutral-100"
                >
                    <X size={16} />
                </button>

                <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-full ${colors.icon}`}>
                        <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
                        <p className="mt-1 text-sm text-neutral-600">{message}</p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${colors.btn}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
