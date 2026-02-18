import { useState, useCallback, useRef } from 'react';
import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../lib/api';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type ImportStep = 'upload' | 'preview' | 'confirm' | 'result';

interface ParsedRow {
    matricule: string;
    nom: string;
    postNom: string;
    prenom: string;
    sexe: string;
    dateNaissance: string;
    lieuNaissance: string;
    classe: string;
    statut: string;
}

interface ImportResult {
    imported: number;
    skipped: number;
    errors: Array<{ line: number; message: string }>;
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
    const [step, setStep] = useState<ImportStep>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [parseErrors, setParseErrors] = useState<Array<{ line: number; message: string }>>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetModal = useCallback(() => {
        setStep('upload');
        setFile(null);
        setPreviewRows([]);
        setTotalRows(0);
        setParseErrors([]);
        setIsUploading(false);
        setResult(null);
        setDragOver(false);
    }, []);

    const handleClose = useCallback(() => {
        resetModal();
        onClose();
    }, [resetModal, onClose]);

    const handleFileSelect = useCallback(async (selectedFile: File) => {
        setFile(selectedFile);

        // Parse the file for preview using a dynamic import of SheetJS
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const XLSX = (await import('xlsx')) as any;
            const arrayBuffer = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            if (!sheet) {
                setParseErrors([{ line: 0, message: 'Aucune feuille trouvée dans le fichier' }]);
                return;
            }

            const jsonData: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            setTotalRows(jsonData.length);

            // Map to expected format
            const mapped: ParsedRow[] = jsonData.map((row) => ({
                matricule: String(row.matricule ?? row.Matricule ?? ''),
                nom: String(row.nom ?? row.Nom ?? ''),
                postNom: String(row.postNom ?? row['Post-Nom'] ?? row.PostNom ?? ''),
                prenom: String(row.prenom ?? row.Prenom ?? row['Prénom'] ?? ''),
                sexe: String(row.sexe ?? row.Sexe ?? ''),
                dateNaissance: String(row.dateNaissance ?? row['Date Naissance'] ?? ''),
                lieuNaissance: String(row.lieuNaissance ?? row['Lieu Naissance'] ?? ''),
                classe: String(row.classe ?? row.Classe ?? ''),
                statut: String(row.statut ?? row.Statut ?? 'NOUVEAU'),
            }));

            // Validate rows
            const errors: Array<{ line: number; message: string }> = [];
            mapped.forEach((row, idx) => {
                const issues: string[] = [];
                if (!row.nom || row.nom.length < 2) issues.push("'nom' manquant");
                if (!row.postNom || row.postNom.length < 2) issues.push("'postNom' manquant");
                if (!row.sexe || !['M', 'F'].includes(row.sexe)) issues.push("'sexe' invalide");
                if (!row.dateNaissance) issues.push("'dateNaissance' manquante");
                if (issues.length > 0) {
                    errors.push({ line: idx + 2, message: issues.join(', ') });
                }
            });

            setParseErrors(errors);
            setPreviewRows(mapped.slice(0, 5));
            setStep('preview');
        } catch {
            setParseErrors([{ line: 0, message: 'Erreur lors de la lecture du fichier. Vérifiez le format.' }]);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) handleFileSelect(droppedFile);
        },
        [handleFileSelect],
    );

    const handleImport = useCallback(async () => {
        if (!file) return;
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await api.post('/students/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setResult(res.data.data);
            setStep('result');
        } catch (err: any) {
            setParseErrors([{
                line: 0,
                message: err?.response?.data?.error?.message ?? "Erreur lors de l'import",
            }]);
        } finally {
            setIsUploading(false);
        }
    }, [file]);

    const downloadTemplate = useCallback(async () => {
        try {
            const res = await api.get('/students/import-template', {
                responseType: 'blob',
            });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'modele-import-eleves.xlsx';
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            // Silently fail
        }
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileSpreadsheet size={20} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900">
                                Importer des élèves
                            </h2>
                            <p className="text-xs text-neutral-500">
                                {step === 'upload' && 'Étape 1 — Sélection du fichier'}
                                {step === 'preview' && 'Étape 2 — Prévisualisation'}
                                {step === 'confirm' && 'Étape 3 — Confirmation'}
                                {step === 'result' && 'Étape 4 — Résultat'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* ── Step 1: Upload ────────────────────────────────── */}
                    {step === 'upload' && (
                        <div className="space-y-4">
                            {/* Drop zone */}
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    flex flex-col items-center justify-center p-10 rounded-xl 
                                    border-2 border-dashed cursor-pointer transition-all duration-200
                                    ${dragOver
                                        ? 'border-primary bg-primary/5 scale-[1.02]'
                                        : 'border-neutral-300 hover:border-primary/50 hover:bg-neutral-50'
                                    }
                                `}
                            >
                                <Upload
                                    size={36}
                                    className={`mb-3 ${dragOver ? 'text-primary' : 'text-neutral-400'}`}
                                />
                                <p className="text-sm font-medium text-neutral-700 text-center">
                                    Glissez votre fichier ici ou{' '}
                                    <span className="text-primary underline">parcourez</span>
                                </p>
                                <p className="text-xs text-neutral-400 mt-1.5">
                                    Formats : .xlsx, .xls, .csv — Max : 5 Mo
                                </p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileSelect(f);
                                }}
                                className="hidden"
                            />

                            {/* Download template */}
                            <button
                                onClick={downloadTemplate}
                                className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark 
                                           font-medium transition-colors mx-auto"
                            >
                                <Download size={14} />
                                Télécharger le modèle Excel
                            </button>
                        </div>
                    )}

                    {/* ── Step 2: Preview ───────────────────────────────── */}
                    {step === 'preview' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1.5 text-success">
                                    <CheckCircle size={14} />
                                    <span className="font-medium">
                                        {totalRows - parseErrors.length} lignes valides
                                    </span>
                                </div>
                                {parseErrors.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-danger">
                                        <AlertCircle size={14} />
                                        <span className="font-medium">
                                            {parseErrors.length} erreur{parseErrors.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Preview table */}
                            <div className="overflow-x-auto rounded-lg border border-neutral-200">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-neutral-100 text-neutral-600">
                                            <th className="px-2 py-2 text-left font-semibold">Matricule</th>
                                            <th className="px-2 py-2 text-left font-semibold">Nom</th>
                                            <th className="px-2 py-2 text-left font-semibold">Post-Nom</th>
                                            <th className="px-2 py-2 text-left font-semibold">Prénom</th>
                                            <th className="px-2 py-2 text-left font-semibold">Sexe</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {previewRows.map((row, i) => (
                                            <tr key={i} className="hover:bg-neutral-50">
                                                <td className="px-2 py-1.5 font-mono">{row.matricule}</td>
                                                <td className="px-2 py-1.5 font-medium">{row.nom}</td>
                                                <td className="px-2 py-1.5">{row.postNom}</td>
                                                <td className="px-2 py-1.5">{row.prenom}</td>
                                                <td className="px-2 py-1.5">{row.sexe}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalRows > 5 && (
                                <p className="text-xs text-neutral-400 text-center">
                                    Affichage de 5 / {totalRows} lignes
                                </p>
                            )}

                            {/* Errors */}
                            {parseErrors.length > 0 && (
                                <div className="bg-danger-bg rounded-lg p-3 space-y-1.5">
                                    <p className="font-medium text-danger text-xs">Erreurs détectées :</p>
                                    {parseErrors.slice(0, 5).map((err, i) => (
                                        <p key={i} className="text-xs text-danger/80">
                                            Ligne {err.line} : {err.message}
                                        </p>
                                    ))}
                                    {parseErrors.length > 5 && (
                                        <p className="text-xs text-danger/60">
                                            ... et {parseErrors.length - 5} autres erreurs
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setStep('upload');
                                        setFile(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-neutral-700 
                                               bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                                >
                                    Changer de fichier
                                </button>
                                <button
                                    onClick={() => setStep('confirm')}
                                    disabled={totalRows - parseErrors.length === 0}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary 
                                               hover:bg-primary-dark rounded-lg transition-colors 
                                               disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continuer
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Confirm ───────────────────────────────── */}
                    {step === 'confirm' && (
                        <div className="space-y-5 text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                <FileSpreadsheet size={28} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-neutral-900">
                                    Importer {totalRows - parseErrors.length} élève{totalRows - parseErrors.length > 1 ? 's' : ''} ?
                                </p>
                                {parseErrors.length > 0 && (
                                    <p className="text-sm text-neutral-500 mt-1">
                                        {parseErrors.length} ligne{parseErrors.length > 1 ? 's' : ''} seront ignorée{parseErrors.length > 1 ? 's' : ''}
                                    </p>
                                )}
                                <p className="text-xs text-neutral-400 mt-2">
                                    Fichier : {file?.name}
                                </p>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setStep('preview')}
                                    className="px-4 py-2 text-sm font-medium text-neutral-700 
                                               bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                                >
                                    Retour
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={isUploading}
                                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium 
                                               text-white bg-primary hover:bg-primary-dark rounded-lg 
                                               transition-colors disabled:opacity-50"
                                >
                                    {isUploading && (
                                        <Loader2 size={14} className="animate-spin" />
                                    )}
                                    Lancer l'import
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 4: Result ────────────────────────────────── */}
                    {step === 'result' && result && (
                        <div className="space-y-5 text-center">
                            <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto">
                                <CheckCircle size={28} className="text-success" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-neutral-900">
                                    Import terminé
                                </p>
                                <div className="flex items-center justify-center gap-4 mt-3">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-success">{result.imported}</p>
                                        <p className="text-xs text-neutral-500">importés</p>
                                    </div>
                                    {result.skipped > 0 && (
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-warning">{result.skipped}</p>
                                            <p className="text-xs text-neutral-500">ignorés</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    handleClose();
                                    onSuccess();
                                }}
                                className="px-5 py-2 text-sm font-medium text-white bg-primary 
                                           hover:bg-primary-dark rounded-lg transition-colors mx-auto"
                            >
                                Fermer et actualiser
                            </button>
                        </div>
                    )}
                </div>

                {/* Progress/Step indicators */}
                <div className="flex items-center justify-center gap-1.5 pb-4">
                    {(['upload', 'preview', 'confirm', 'result'] as ImportStep[]).map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-300 ${s === step
                                ? 'w-6 bg-primary'
                                : (['upload', 'preview', 'confirm', 'result'].indexOf(s) <
                                    ['upload', 'preview', 'confirm', 'result'].indexOf(step)
                                    ? 'w-1.5 bg-primary/40'
                                    : 'w-1.5 bg-neutral-200')
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
