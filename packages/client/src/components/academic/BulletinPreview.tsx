import { useState } from 'react';
import { Download, Printer, ExternalLink, AlertCircle } from 'lucide-react';
import type { BulletinData } from '@edugoma360/shared/src/types/academic';
import DecisionBadge from './DecisionBadge';

interface BulletinPreviewProps {
    bulletin: BulletinData;
    onDownloadPDF: () => void;
    isGenerating?: boolean;
}

function ScoreCell({ value, max }: { value: number | null; max: number }) {
    if (value === null) return <span className="text-neutral-400">—</span>;
    const pct = (value / max) * 100;
    const color = pct >= 70 ? 'text-green-700' : pct >= 50 ? 'text-blue-700' : pct >= 40 ? 'text-orange-600' : 'text-red-600';
    return <span className={`font-semibold ${color}`}>{value.toFixed(1)}</span>;
}

function AverageCell({ value }: { value: number | null }) {
    if (value === null) return <span className="text-neutral-400">—</span>;
    const color = value >= 14 ? 'text-green-700 font-bold' : value >= 10 ? 'text-blue-700 font-semibold' : 'text-red-600 font-semibold';
    return <span className={color}>{value.toFixed(2)}</span>;
}

export default function BulletinPreview({ bulletin, onDownloadPDF, isGenerating }: BulletinPreviewProps) {
    const [activeTab, setActiveTab] = useState<'recto' | 'verso'>('recto');

    return (
        <div className="space-y-4">
            {/* Barre d'actions */}
            <div className="flex items-center justify-between">
                <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
                    {(['recto', 'verso'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
                                }`}
                        >
                            {tab === 'recto' ? 'Recto (Notes)' : 'Verso (Observations)'}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="h-9 px-4 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2"
                    >
                        <Printer size={15} />
                        Imprimer
                    </button>
                    <button
                        onClick={onDownloadPDF}
                        disabled={isGenerating}
                        className="h-9 px-4 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
                    >
                        <Download size={15} />
                        {isGenerating ? 'Génération…' : 'Télécharger PDF'}
                    </button>
                </div>
            </div>

            {/* Watermark brouillon */}
            {!bulletin.deliberationApproved && (
                <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                    <AlertCircle size={16} />
                    <span>
                        <strong>BROUILLON</strong> — La délibération n'est pas encore approuvée.
                        Le PDF portera un filigrane.
                    </span>
                </div>
            )}

            {/* Corps du bulletin — A4 simulé */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden" style={{ fontFamily: 'Times New Roman, serif' }}>
                {activeTab === 'recto' ? (
                    <RectoContent bulletin={bulletin} />
                ) : (
                    <VersoContent bulletin={bulletin} />
                )}
            </div>
        </div>
    );
}

function RectoContent({ bulletin }: { bulletin: BulletinData }) {
    const { student, school, term, academicYear } = bulletin;

    return (
        <div className="p-8 space-y-6">
            {/* En-tête */}
            <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-4">
                <div className="text-center flex-1">
                    {school.logoUrl ? (
                        <img src={school.logoUrl} alt="Logo école" className="h-16 w-auto mx-auto mb-2 object-contain" />
                    ) : (
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-neutral-200 flex items-center justify-center">
                            <ExternalLink size={20} className="text-neutral-400" />
                        </div>
                    )}
                    <p className="text-xs text-neutral-500">République Démocratique du Congo</p>
                    <p className="text-xs text-neutral-500">Province : {school.province}</p>
                </div>
                <div className="text-center flex-2 px-4">
                    <h1 className="text-xl font-black uppercase tracking-wide">{school.name}</h1>
                    <p className="text-sm text-neutral-600">{school.ville} — {school.address}</p>
                    <p className="text-base font-bold mt-1">BULLETIN DE POINTS</p>
                    <p className="text-sm">Année scolaire {academicYear} — {term.name}</p>
                </div>
                <div className="text-center flex-1">
                    {student.photoUrl ? (
                        <img src={student.photoUrl} alt="Photo élève" className="w-20 h-24 object-cover mx-auto border border-neutral-300" />
                    ) : (
                        <div className="w-20 h-24 mx-auto border border-neutral-300 bg-neutral-100 flex items-center justify-center">
                            <span className="text-xs text-neutral-400">Photo</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Identité élève */}
            <div className="grid grid-cols-2 gap-x-8 text-sm border border-neutral-300 rounded p-3">
                <div><span className="font-bold">Nom :</span> {student.nom} {student.postNom}</div>
                <div><span className="font-bold">Prénom :</span> {student.prenom ?? '—'}</div>
                <div><span className="font-bold">Matricule :</span> {student.matricule}</div>
                <div><span className="font-bold">Classe :</span> {student.className}</div>
                <div><span className="font-bold">Section :</span> {student.sectionName}</div>
            </div>

            {/* Tableau des notes */}
            <table className="w-full text-sm border-collapse border border-neutral-400">
                <thead>
                    <tr className="bg-neutral-800 text-white">
                        <th className="border border-neutral-600 px-2 py-1.5 text-left">Matière</th>
                        <th className="border border-neutral-600 px-2 py-1.5 text-center w-10">Coef</th>
                        <th className="border border-neutral-600 px-2 py-1.5 text-center w-14">Inter /10</th>
                        <th className="border border-neutral-600 px-2 py-1.5 text-center w-14">TP /10</th>
                        <th className="border border-neutral-600 px-2 py-1.5 text-center w-16">Exam /20</th>
                        <th className="border border-neutral-600 px-2 py-1.5 text-center w-16">Moy /20</th>
                        <th className="border border-neutral-600 px-2 py-1.5 text-center w-12">Rang</th>
                    </tr>
                </thead>
                <tbody>
                    {bulletin.grades.map((grade, i) => (
                        <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} ${grade.isEliminatory ? 'font-semibold' : ''}`}>
                            <td className="border border-neutral-300 px-2 py-1">
                                {grade.subjectName}
                                {grade.isEliminatory && <span className="text-red-500 ml-1 text-xs">*</span>}
                            </td>
                            <td className="border border-neutral-300 px-2 py-1 text-center">{grade.coefficient}</td>
                            <td className="border border-neutral-300 px-2 py-1 text-center"><ScoreCell value={grade.interro} max={10} /></td>
                            <td className="border border-neutral-300 px-2 py-1 text-center"><ScoreCell value={grade.tp} max={10} /></td>
                            <td className="border border-neutral-300 px-2 py-1 text-center"><ScoreCell value={grade.exam} max={20} /></td>
                            <td className="border border-neutral-300 px-2 py-1 text-center"><AverageCell value={grade.average} /></td>
                            <td className="border border-neutral-300 px-2 py-1 text-center text-neutral-600">{grade.rank ?? '—'}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-neutral-800 text-white font-bold">
                        <td className="border border-neutral-600 px-2 py-2" colSpan={2}>TOTAL</td>
                        <td className="border border-neutral-600 px-2 py-2 text-center" colSpan={3}>— — —</td>
                        <td className="border border-neutral-600 px-2 py-2 text-center text-xl">
                            {bulletin.generalAverage?.toFixed(2) ?? '—'}
                        </td>
                        <td className="border border-neutral-600 px-2 py-2 text-center">
                            {bulletin.rank}/{bulletin.totalStudents}
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* Décision */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold">Décision du conseil de classe :</p>
                    <div className="mt-1">
                        <DecisionBadge decision={bulletin.decision} size="lg" />
                    </div>
                </div>
                <div className="text-right text-sm">
                    <p className="text-neutral-500">Total des points</p>
                    <p className="text-2xl font-black">{bulletin.totalPoints.toFixed(0)}</p>
                </div>
            </div>

            <p className="text-xs text-neutral-400">* Matière éliminatoire</p>
        </div>
    );
}

function VersoContent({ bulletin }: { bulletin: BulletinData }) {
    return (
        <div className="p-8 space-y-6">
            <h2 className="text-lg font-bold text-center border-b-2 border-neutral-900 pb-3">
                RECTO-VERSO — OBSERVATIONS & SIGNATURES
            </h2>

            {/* Absences */}
            <div>
                <p className="text-sm font-bold mb-2">Absences</p>
                <table className="w-full text-sm border-collapse border border-neutral-300">
                    <thead>
                        <tr className="bg-neutral-100">
                            <th className="border border-neutral-300 px-3 py-1.5 text-left">Type</th>
                            <th className="border border-neutral-300 px-3 py-1.5 text-center">Nombre de jours</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-neutral-300 px-3 py-1.5">Justifiées</td>
                            <td className="border border-neutral-300 px-3 py-1.5 text-center">{bulletin.absences.justified}</td>
                        </tr>
                        <tr>
                            <td className="border border-neutral-300 px-3 py-1.5">Non justifiées</td>
                            <td className="border border-neutral-300 px-3 py-1.5 text-center">{bulletin.absences.unjustified}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Observations conduite */}
            <div>
                <p className="text-sm font-bold mb-2">Conduite & Discipline</p>
                <div className="border border-neutral-300 rounded p-3 min-h-16 text-sm text-neutral-700">
                    {bulletin.conductObservations ?? <span className="text-neutral-400 italic">Aucune observation</span>}
                </div>
            </div>

            {/* Observations générales */}
            <div>
                <p className="text-sm font-bold mb-2">Observations générales du Titulaire</p>
                <div className="border border-neutral-300 rounded p-3 min-h-20 text-sm text-neutral-700">
                    {bulletin.generalObservations ?? <span className="text-neutral-400 italic">—</span>}
                </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-neutral-300">
                {[
                    { label: 'Titulaire de classe', name: bulletin.homeroomTeacher },
                    { label: 'Le Préfet des études', name: bulletin.prefectSignature },
                    { label: 'Signature du Parent', name: null },
                ].map((sig) => (
                    <div key={sig.label} className="text-center">
                        <p className="text-xs font-semibold text-neutral-700">{sig.label}</p>
                        <div className="h-16 border-b border-neutral-400 mt-4" />
                        <p className="text-xs text-neutral-500 mt-1">{sig.name ?? 'Signature + Date'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}


