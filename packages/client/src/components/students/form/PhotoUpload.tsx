import { useRef, useState } from 'react';
import { Upload, X, User } from 'lucide-react';

interface PhotoUploadProps {
    preview?: string;
    onChange: (file: File | undefined, preview: string | undefined) => void;
    error?: string;
}

export default function PhotoUpload({ preview, onChange, error }: PhotoUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image (JPG ou PNG)');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('La taille de l\'image ne doit pas dépasser 2MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            onChange(file, reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleRemove = () => {
        onChange(undefined, undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative w-40 h-40 rounded-lg border-2 border-dashed 
                           cursor-pointer transition-all duration-200 overflow-hidden
                           ${
                               isDragging
                                   ? 'border-primary bg-primary/5'
                                   : error
                                   ? 'border-red-500 bg-red-50'
                                   : 'border-neutral-300 hover:border-primary hover:bg-neutral-50'
                           }`}
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Photo élève"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white 
                                       rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            aria-label="Supprimer la photo"
                        >
                            <X size={14} />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                            {isDragging ? (
                                <Upload size={20} className="text-primary" />
                            ) : (
                                <User size={20} className="text-neutral-400" />
                            )}
                        </div>
                        <p className="text-xs text-neutral-600 font-medium mb-1">
                            {isDragging ? 'Déposez la photo' : 'Photo de l\'élève'}
                        </p>
                        <p className="text-xs text-neutral-400">
                            Cliquez ou glissez
                        </p>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
            />

            <p className="text-xs text-neutral-500 mt-2 text-center">
                JPG ou PNG • Max 2MB
            </p>

            {error && (
                <p className="text-xs text-red-600 mt-1 text-center">{error}</p>
            )}

            {preview && (
                <button
                    type="button"
                    onClick={handleClick}
                    className="mt-2 text-xs text-primary hover:underline"
                >
                    Changer la photo
                </button>
            )}
        </div>
    );
}
