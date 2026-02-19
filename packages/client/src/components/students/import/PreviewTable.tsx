import { useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import type { ParsedStudent } from '../../../lib/excel/parseStudents';

interface PreviewTableProps {
    data: ParsedStudent[];
}

type FilterType = 'all' | 'valid' | 'warnings' | 'errors';

export default function PreviewTable({ data }: PreviewTableProps) {
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredData = data.filter((row) => {
        if (filter === 'all') return true;
        if (filter === 'valid') return row.errors.length === 0 && row.warnings.length === 0;
        if (filter === 'warnings') return row.errors.length === 0 && row.warnings.length > 0;
        if (filter === 'errors') return row.errors.length > 0;
        return true;
    });

    const getRowStatus = (row: ParsedStudent) => {
        if (row.errors.length > 0) return 'error';
        if (row.warnings.length > 0) return 'warning';
        return 'valid';
    };



    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'valid':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full 
                                     bg-green-100 text-green-700 text-xs font-medium">
                        <CheckCircle2 size={12} />
                        Valide
                    </span>
                );
            case 'warning':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full 
                                     bg-amber-100 text-amber-700 text-xs font-medium">
                        <AlertCircle size={12} />
                        Avertissement
                    </span>
                );
            case 'error':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full 
                                     bg-red-100 text-red-700 text-xs font-medium">
                        <XCircle size={12} />
                        Erreur
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg border border-neutral-200">
            {/* Filter */}
            <div className="p-4 border-b border-neutral-200">
                <label className="text-sm font-medium text-neutral-700 mr-3">
                    Afficher :
                </label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterType)}
                    className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                    <option value="all">Toutes les lignes ({data.length})</option>
                    <option value="valid">
                        Seulement les valides (
                        {data.filter((r) => r.errors.length === 0 && r.warnings.length === 0).length}
                        )
                    </option>
                    <option value="warnings">
                        Seulement les avertissements (
                        {data.filter((r) => r.errors.length === 0 && r.warnings.length > 0).length}
                        )
                    </option>
                    <option value="errors">
                        Seulement les erreurs ({data.filter((r) => r.errors.length > 0).length})
                    </option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
                                Ligne
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
                                Nom complet
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
                                Sexe
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
                                Classe
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
                                Téléphone
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
                                État
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                                    Aucune ligne à afficher avec ce filtre
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((row) => {
                                const status = getRowStatus(row);
                                return (
                                    <tr
                                        key={row.row}
                                        className={`
                                            ${status === 'error' ? 'bg-red-50/50' : ''}
                                            ${status === 'warning' ? 'bg-amber-50/50' : ''}
                                            hover:bg-neutral-50
                                        `}
                                    >
                                        <td className="px-4 py-3 text-neutral-600 font-mono">
                                            {row.row}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-neutral-900">
                                                {row.data.nom} {row.data.postNom}
                                            </div>
                                            {row.data.prenom && (
                                                <div className="text-xs text-neutral-600">
                                                    {row.data.prenom}
                                                </div>
                                            )}
                                            {(row.errors.length > 0 || row.warnings.length > 0) && (
                                                <div className="mt-1 space-y-0.5">
                                                    {row.errors.map((error, i) => (
                                                        <div
                                                            key={i}
                                                            className="text-xs text-red-600"
                                                        >
                                                            • {error}
                                                        </div>
                                                    ))}
                                                    {row.warnings.map((warning, i) => (
                                                        <div
                                                            key={i}
                                                            className="text-xs text-amber-600"
                                                        >
                                                            • {warning}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-700">
                                            {row.data.sexe === 'M' ? 'M' : 'F'}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-700">
                                            {row.data.className || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-700 font-mono text-xs">
                                            {row.data.telTuteur || '—'}
                                        </td>
                                        <td className="px-4 py-3">{getStatusBadge(status)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
