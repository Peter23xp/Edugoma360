import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
];

export default function UploadZone({ onFileSelect }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const validateFile = (file: File): boolean => {
        // Check file type
        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error('Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv');
            return false;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            toast.error('Fichier trop volumineux. Taille maximum : 5 MB');
            return false;
        }

        return true;
    };

    const handleFile = (file: File) => {
        if (validateFile(file)) {
            onFileSelect(file);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                    relative border-2 border-dashed rounded-lg p-12 text-center
                    transition-all duration-200 cursor-pointer
                    ${
                        isDragging
                            ? 'border-primary bg-primary/5 scale-[1.02]'
                            : 'border-neutral-300 hover:border-primary hover:bg-neutral-50'
                    }
                `}
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileInput}
                    className="hidden"
                />

                <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 
                                    rounded-full bg-primary/10">
                        {isDragging ? (
                            <Upload size={32} className="text-primary animate-bounce" />
                        ) : (
                            <FileSpreadsheet size={32} className="text-primary" />
                        )}
                    </div>

                    <div>
                        <p className="text-lg font-medium text-neutral-900 mb-1">
                            {isDragging
                                ? 'Déposez le fichier ici'
                                : 'Glissez-déposez votre fichier ici'}
                        </p>
                        <p className="text-sm text-neutral-600">
                            ou cliquez pour parcourir
                        </p>
                    </div>

                    <div className="text-xs text-neutral-500 space-y-1">
                        <p>Formats acceptés : .xlsx, .xls, .csv</p>
                        <p>Taille maximum : 5 MB</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
