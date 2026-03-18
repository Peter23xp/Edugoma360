import React, { useCallback, useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface LogoUploadZoneProps {
    currentLogoUrl?: string;
    onUpload: (file: File) => void;
    onRemove: () => void;
    isUploading: boolean;
}

export default function LogoUploadZone({ currentLogoUrl, onUpload, onRemove, isUploading }: LogoUploadZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const processFile = (file: File) => {
        // Validation
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            toast.error("Format invalide. Utilisez PNG, JPG ou SVG.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Le fichier ne doit pas dépasser 2MB.");
            return;
        }

        // Preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        onUpload(file);
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    }, [onUpload]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreviewUrl(null);
        onRemove();
    };

    if (isUploading) {
        return (
            <div className="w-full flex items-center justify-center border-2 border-dashed border-neutral-300 rounded-lg p-6 bg-neutral-50 min-h-[160px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-sm font-medium text-neutral-600">Upload en cours...</p>
                </div>
            </div>
        );
    }

    if (previewUrl) {
        return (
            <div className="w-full flex flex-col items-center border border-neutral-200 rounded-lg p-6 bg-white shadow-sm min-h-[160px]">
                <div className="relative group">
                    <img 
                        src={previewUrl} 
                        alt="Logo de l'école" 
                        className="w-[200px] h-[200px] object-cover rounded-md border border-neutral-100" 
                    />
                    <button 
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Supprimer"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="mt-4 flex gap-3 w-full justify-center">
                    <label className="cursor-pointer text-sm font-medium text-primary hover:text-primary-hover hover:underline transition-colors px-4 py-2 bg-primary-lighter rounded-md">
                        Changer le logo
                        <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg, image/svg+xml" onChange={handleChange} />
                    </label>
                    <button type="button" onClick={handleRemove} className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline transition-colors px-4 py-2 border border-red-200 rounded-md">
                        Supprimer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 min-h-[160px] cursor-pointer transition-colors duration-200",
                isDragOver 
                    ? "border-primary bg-primary-lighter" 
                    : "border-neutral-300 hover:bg-neutral-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('logo-upload')?.click()}
        >
            <input 
                id="logo-upload"
                type="file" 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg, image/svg+xml" 
                onChange={handleChange} 
            />
            <UploadCloud className={cn("h-12 w-12 mb-3", isDragOver ? "text-primary" : "text-neutral-400")} />
            <p className="text-sm font-medium text-neutral-700 text-center mb-1">
                Glissez-déposez votre logo ici <br/> ou cliquez pour parcourir
            </p>
            <div className="text-xs text-neutral-500 text-center space-y-0.5 mt-2">
                <p>Formats acceptés : PNG, JPG, SVG</p>
                <p>Taille maximale : 2MB</p>
                <p>Dimensions recommandées : 500×500px</p>
            </div>
        </div>
    );
}

