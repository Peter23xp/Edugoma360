import { createContext, useContext, useState, useRef, useEffect } from 'react';

interface DropdownMenuContextValue {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | undefined>(undefined);

function useDropdownMenu() {
    const context = useContext(DropdownMenuContext);
    if (!context) {
        throw new Error('useDropdownMenu must be used within DropdownMenu');
    }
    return context;
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
            <div className="relative inline-block">{children}</div>
        </DropdownMenuContext.Provider>
    );
}

export function DropdownMenuTrigger({
    children,
    asChild,
}: {
    children: React.ReactNode;
    asChild?: boolean;
}) {
    const { isOpen, setIsOpen } = useDropdownMenu();

    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    if (asChild && typeof children === 'object' && children !== null && 'props' in children) {
        const child = children as React.ReactElement;
        return (
            <div onClick={handleClick}>
                {child}
            </div>
        );
    }

    return (
        <button onClick={handleClick} type="button">
            {children}
        </button>
    );
}

export function DropdownMenuContent({
    children,
    align = 'start',
    className = '',
}: {
    children: React.ReactNode;
    align?: 'start' | 'end';
    className?: string;
}) {
    const { isOpen, setIsOpen } = useDropdownMenu();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    if (!isOpen) return null;

    const alignClass = align === 'end' ? 'right-0' : 'left-0';

    return (
        <div
            ref={ref}
            className={`absolute ${alignClass} mt-2 z-50 min-w-[12rem] 
                       bg-white rounded-lg border border-neutral-200 shadow-lg 
                       py-1 ${className}`}
        >
            {children}
        </div>
    );
}

export function DropdownMenuItem({
    children,
    onClick,
    className = '',
}: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}) {
    const { setIsOpen } = useDropdownMenu();

    const handleClick = () => {
        onClick?.();
        setIsOpen(false);
    };

    return (
        <button
            onClick={handleClick}
            className={`w-full flex items-center px-3 py-2 text-sm text-neutral-700 
                       hover:bg-neutral-100 transition-colors text-left ${className}`}
        >
            {children}
        </button>
    );
}

export function DropdownMenuSeparator() {
    return <div className="h-px bg-neutral-200 my-1" />;
}
