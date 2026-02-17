import { cn } from '../../lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface ScreenBadgeProps {
    label: string;
    variant?: BadgeVariant;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    neutral: 'bg-neutral-100 text-neutral-700',
};

export default function ScreenBadge({ label, variant = 'neutral', className }: ScreenBadgeProps) {
    return (
        <span className={cn('badge', variantClasses[variant], className)}>
            {label}
        </span>
    );
}
