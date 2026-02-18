import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { RDC_NATIONAL_HOLIDAYS, type Step4Data } from '@edugoma360/shared';

interface Step4AcademicYearProps {
    data: Partial<Step4Data>;
    onChange: (data: Partial<Step4Data>) => void;
    errors: Record<string, string[]>;
}

export default function Step4AcademicYear({ data, onChange, errors }: Step4AcademicYearProps) {
    // Initialize with default values
    useEffect(() => {
        if (!data.label) {
            const currentYear = new Date().getFullYear();
            const nextYear = currentYear + 1;

            onChange({
                label: `${currentYear}-${nextYear}`,
                startDate: new Date(currentYear, 8, 1), // Sept 1
                endDate: new Date(nextYear, 6, 1), // July 1
                terms: [
                    {
                        number: 1,
                        startDate: new Date(currentYear, 8, 1),
                        endDate: new Date(currentYear, 11, 14),
                        examStartDate: new Date(currentYear, 11, 5),
                        examEndDate: new Date(currentYear, 11, 13),
                    },
                    {
                        number: 2,
                        startDate: new Date(nextYear, 0, 6),
                        endDate: new Date(nextYear, 2, 28),
                        examStartDate: new Date(nextYear, 2, 17),
                        examEndDate: new Date(nextYear, 2, 27),
                    },
                    {
                        number: 3,
                        startDate: new Date(nextYear, 3, 7),
                        endDate: new Date(nextYear, 5, 27),
                        examStartDate: new Date(nextYear, 5, 9),
                        examEndDate: new Date(nextYear, 5, 20),
                    },
                ],
                holidays: RDC_NATIONAL_HOLIDAYS.map((h) => ({
                    date: h.date,
                    label: h.label,
                })),
            });
        }
    }, []);

    const formatDateForInput = (date: Date | undefined) => {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        return d.toISOString().split('T')[0];
    };

    const handleDateChange = (field: string, value: string) => {
        onChange({ ...data, [field]: new Date(value) });
    };

    const handleTermChange = (termIndex: number, field: string, value: string) => {
        const terms = [...(data.terms || [])];
        terms[termIndex] = {
            ...terms[termIndex],
            [field]: new Date(value),
        };
        onChange({ ...data, terms });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Année scolaire</h2>
                <p className="text-sm text-neutral-600">
                    Configurons l'année académique et les trimestres
                </p>
            </div>

            {/* Libellé */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Libellé de l'année <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={data.label || ''}
                    onChange={(e) => onChange({ ...data, label: e.target.value })}
                    placeholder="2024-2025"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary 
                               transition-colors"
                />
                {errors.label && (
                    <p className="mt-1 text-sm text-red-600">{errors.label[0]}</p>
                )}
            </div>

            {/* Dates de l'année */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Date de début <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={formatDateForInput(data.startDate)}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                   focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                   transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Date de fin <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={formatDateForInput(data.endDate)}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                   focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                   transition-colors"
                    />
                    {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.endDate[0]}</p>
                    )}
                </div>
            </div>

            {/* Trimestres */}
            <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                    Configuration des trimestres
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((termNum) => {
                        const term = data.terms?.[termNum - 1];
                        return (
                            <div
                                key={termNum}
                                className="border border-neutral-200 rounded-lg p-4"
                            >
                                <h4 className="font-semibold text-neutral-900 mb-3">
                                    Trimestre {termNum}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                                            Début
                                        </label>
                                        <input
                                            type="date"
                                            value={formatDateForInput(term?.startDate)}
                                            onChange={(e) =>
                                                handleTermChange(termNum - 1, 'startDate', e.target.value)
                                            }
                                            className="w-full px-3 py-2 text-sm border border-neutral-300 
                                                       rounded-lg focus:ring-2 focus:ring-primary/20 
                                                       focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                                            Fin
                                        </label>
                                        <input
                                            type="date"
                                            value={formatDateForInput(term?.endDate)}
                                            onChange={(e) =>
                                                handleTermChange(termNum - 1, 'endDate', e.target.value)
                                            }
                                            className="w-full px-3 py-2 text-sm border border-neutral-300 
                                                       rounded-lg focus:ring-2 focus:ring-primary/20 
                                                       focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                                            Examens du
                                        </label>
                                        <input
                                            type="date"
                                            value={formatDateForInput(term?.examStartDate)}
                                            onChange={(e) =>
                                                handleTermChange(termNum - 1, 'examStartDate', e.target.value)
                                            }
                                            className="w-full px-3 py-2 text-sm border border-neutral-300 
                                                       rounded-lg focus:ring-2 focus:ring-primary/20 
                                                       focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                                            au
                                        </label>
                                        <input
                                            type="date"
                                            value={formatDateForInput(term?.examEndDate)}
                                            onChange={(e) =>
                                                handleTermChange(termNum - 1, 'examEndDate', e.target.value)
                                            }
                                            className="w-full px-3 py-2 text-sm border border-neutral-300 
                                                       rounded-lg focus:ring-2 focus:ring-primary/20 
                                                       focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Jours fériés */}
            <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                    Jours fériés RDC (pré-sélectionnés)
                </h3>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {RDC_NATIONAL_HOLIDAYS.map((holiday) => (
                            <div key={holiday.date} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked
                                    readOnly
                                    className="w-4 h-4 rounded border-neutral-300 text-primary"
                                />
                                <span className="text-sm text-neutral-700">
                                    {holiday.date.replace('-', '/')} - {holiday.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
