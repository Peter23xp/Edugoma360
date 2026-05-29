import React, { useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Paperclip, UploadCloud, File as FileIcon, X, AlertCircle } from 'lucide-react';
import { Label } from '../ui/label';

interface AttachmentManagerProps {
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  maxFiles?: number;
  maxTotalSizeMB?: number; // default 10MB
}

export function AttachmentManager({
  attachments,
  setAttachments,
  maxFiles = 3,
  maxTotalSizeMB = 10
}: AttachmentManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateTotalSize = (files: File[]) => files.reduce((acc, f) => acc + f.size, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    
    // Check max files limit
    if (attachments.length + newFiles.length > maxFiles) {
      setError(`Vous ne pouvez pas ajouter plus de ${maxFiles} pièces jointes.`);
      return;
    }

    // Check total size limit
    const currentSize = calculateTotalSize(attachments);
    const newSize = calculateTotalSize(newFiles);
    if ((currentSize + newSize) / (1024 * 1024) > maxTotalSizeMB) {
      setError(`La taille totale des pièces jointes ne doit pas dépasser ${maxTotalSizeMB} Mo.`);
      return;
    }

    setAttachments(prev => [...prev, ...newFiles]);
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const currentTotalSizeMB = (calculateTotalSize(attachments) / (1024 * 1024)).toFixed(1);

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-transparent border-b border-gray-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
          <Paperclip className="h-5 w-5 text-gray-500" />
          Pièces jointes
          <span className="text-xs font-normal text-gray-400 ml-auto bg-white px-2 py-1 rounded-full border border-gray-100">
            {attachments.length}/{maxFiles} fichiers — {currentTotalSizeMB}/{maxTotalSizeMB} Mo
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Dropzone / Upload btn */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors hover:bg-gray-50 hover:border-[#1B5E20]
            ${attachments.length >= maxFiles ? 'opacity-50 pointer-events-none' : 'border-gray-300'}
          `}
        >
          <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Cliquez pour ajouter des fichiers</p>
          <p className="text-xs text-gray-500 mt-1">PDF, DOCX, Images (Max: {maxTotalSizeMB} Mo au total)</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            multiple 
            className="hidden" 
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* File List */}
        {attachments.length > 0 && (
          <div className="space-y-2 mt-4">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Fichiers sélectionnés :
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {attachments.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white shadow-sm group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center shrink-0">
                      <FileIcon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFile(i)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
