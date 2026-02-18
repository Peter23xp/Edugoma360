import { useState, useEffect } from 'react';
import { SCHOOL_SECTIONS, generateClassName, type Step5Data, type SectionCode } from '@edugoma360/shared';

interface Step5ClassesProps {
    data: Partial<Step5Data>;
    onChange: (data: Partial<Step5Data>) => void;
    errors: Record<string, string[]>;
}

export default function Step5Classes({ data, onChange, errors }: Step5ClassesProps) {
    const [selectedSections, setSelectedSections] = useState<string[]>(
        data.sections || ['TC']
    );
    const [classesPerYear, setClassesPerYear] = useState<Record<string, number>>({});

    useEffect(() => {
        // Generate classes based on selections
        const classes: Step5Data['classes'] = [];

        selectedSections.forEach((sectionCode) => {
            const section = SCHOOL_SECTIONS.find((s) => s.code === sectionCode);
            if (!section) return;

            section.years.forEach((year) => {
                const key = `${sectionCode}-${year}`;
                const count = classesPerYear[key] || 1;

                for (let i = 0; i < count; i++) {
                    const letter = String.fromCharCode(65 + i); // A, B, C...
                    classes.push({
                        sectionCode: sectionCode as SectionCode,
                        year,
                        name: generateClassName(sectionCode as SectionCode, year, letter),
                        maxStudents: 45,
                    });
                }
            });
        });

        onChange({ sections: selectedSections, classes });
    }, [selectedSections, classesPerYear]);

    const handleSectionToggle = (sectionCode: string) => {
        if (selectedSections.includes(sectionCode)) {
            setSelectedSections(selectedSections.filter((s) => s !== sectionCode));
        } else {
            setSelectedSections([...selectedSections, sectionCode]);
        }
    };

    const handleClassCountChange = (sectionCode: string, year: number, count: number) => {
        const key = `${sectionCode}-${year}`;
        setClassesPerYear({ ...classesPerYear, [key]: count });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Sections & Classes
                </h2>
                <p className="text-sm text-neutral-600">
                    Sélectionnez les sections et créez les classes
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Colonne gauche: Sections */}
                <div>
                    <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                        Sections ouvertes <span className="text-red-500">*</span>
                    </h3>
                    <div className="space-y-2">
                        {SCHOOL_SECTIONS.map((section) => (
                            <label
                                key={section.code}
                                className="flex items-start gap-3 p-3 border border-neutral-200 
                                           rounded-lg cursor-pointer hover:bg-neutral-50 
                                           transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSections.includes(section.code)}
                                    onChange={() => handleSectionToggle(section.code)}
                                    className="mt-1 w-4 h-4 rounded border-neutral-300 
                                               text-primary focus:ring-primary/20"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-900">
                                        {section.name}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {section.description}
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>
                    {errors.sections && (
                        <p className="mt-2 text-sm text-red-600">{errors.sections[0]}</p>
                    )}
                </div>

                {/* Colonne droite: Classes */}
                <div>
                    <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                        Nombre de classes par année
                    </h3>
                    {selectedSections.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500 text-sm">
                            Sélectionnez au moins une section
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedSections.map((sectionCode) => {
                                const section = SCHOOL_SECTIONS.find(
                                    (s) => s.code === sectionCode
                                );
                                if (!section) return null;

                                return (
                                    <div
                                        key={sectionCode}
                                        className="border border-neutral-200 rounded-lg p-4"
                                    >
                                        <h4 className="font-semibold text-neutral-900 mb-3">
                                            {section.name}
                                        </h4>
                                        <div className="space-y-2">
                                            {section.years.map((year) => {
                                                const key = `${sectionCode}-${year}`;
                                                const count = classesPerYear[key] || 1;
                                                const letters = Array.from(
                                                    { length: count },
                                                    (_, i) => String.fromCharCode(65 + i)
                                                );

                                                return (
                                                    <div
                                                        key={year}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <span className="text-sm text-neutral-700">
                                                            {sectionCode === 'TC'
                                                                ? `${year}ère année`
                                                                : `${year}ème année`}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                value={count}
                                                                onChange={(e) =>
                                                                    handleClassCountChange(
                                                                        sectionCode,
                                                                        year,
                                                                        parseInt(e.target.value)
                                                                    )
                                                                }
                                                                className="px-3 py-1 text-sm border 
                                                                           border-neutral-300 rounded-lg 
                                                                           focus:ring-2 focus:ring-primary/20 
                                                                           focus:border-primary"
                                                            >
                                                                {[0, 1, 2, 3, 4, 5].map((n) => (
                                                                    <option key={n} value={n}>
                                                                        {n} classe{n > 1 ? 's' : ''}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {count > 0 && (
                                                                <span className="text-xs text-neutral-500">
                                                                    →{' '}
                                                                    {letters
                                                                        .map((l) =>
                                                                            generateClassName(
                                                                                sectionCode as SectionCode,
                                                                                year,
                                                                                l
                                                                            )
                                                                        )
                                                                        .join(', ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {errors.classes && (
                        <p className="mt-2 text-sm text-red-600">{errors.classes[0]}</p>
                    )}
                </div>
            </div>

            {/* Résumé */}
            {data.classes && data.classes.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-primary">
                        ✓ {data.classes.length} classe{data.classes.length > 1 ? 's' : ''}{' '}
                        créée{data.classes.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">
                        {data.classes.map((c) => c.name).join(', ')}
                    </p>
                </div>
            )}
        </div>
    );
}
