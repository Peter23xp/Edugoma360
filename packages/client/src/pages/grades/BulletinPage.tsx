import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Printer, Download } from 'lucide-react';
import api from '../../lib/api';
import { useSchoolStore } from '../../stores/school.store';

export default function BulletinPage() {
    const { studentId } = useParams<{ studentId: string }>();
    const { activeTermId, schoolName, academicYearLabel, termLabel } = useSchoolStore();

    const { data: bulletin, isLoading } = useQuery({
        queryKey: ['bulletin', studentId, activeTermId],
        queryFn: async () => (await api.get(`/reports/bulletin/${studentId}?termId=${activeTermId}`)).data,
        enabled: !!studentId && !!activeTermId,
    });

    if (isLoading) return <div className="animate-pulse"><div className="h-96 bg-neutral-200 rounded-xl" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between no-print">
                <h1 className="text-xl font-bold">Bulletin Scolaire</h1>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-100"><Printer size={14} /> Imprimer</button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"><Download size={14} /> Télécharger PDF</button>
                </div>
            </div>

            {/* Bulletin Preview */}
            <div className="bg-white rounded-xl border border-neutral-300/50 p-8 max-w-4xl mx-auto" style={{ fontFamily: "'Times New Roman', serif" }}>
                {/* Header */}
                <div className="text-center mb-4">
                    <p className="text-xs italic">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO — MEPST</p>
                    <h2 className="text-lg font-bold uppercase tracking-wide mt-1">{schoolName}</h2>
                    <p className="text-xs">Province du Nord-Kivu — Ville de Goma</p>
                    <div className="inline-block border-2 border-black px-6 py-1 mt-2 font-bold text-sm">BULLETIN SCOLAIRE</div>
                </div>
                <hr className="border-black border-t-2 my-3" />

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-1 text-xs mb-4">
                    <p><strong>Nom :</strong> {bulletin?.studentName}</p>
                    <p><strong>Matricule :</strong> {bulletin?.matricule}</p>
                    <p><strong>Classe :</strong> {bulletin?.className}</p>
                    <p><strong>Année :</strong> {academicYearLabel}</p>
                    <p><strong>Trimestre :</strong> {termLabel}</p>
                    <p><strong>Sexe :</strong> {bulletin?.sexe}</p>
                </div>

                {/* Grades Table */}
                <table className="w-full border-collapse text-xs mb-4">
                    <thead>
                        <tr className="bg-neutral-200">
                            <th className="border border-black px-2 py-1 text-left">Matière</th>
                            <th className="border border-black px-2 py-1 text-center">Coeff</th>
                            <th className="border border-black px-2 py-1 text-center">Inter.</th>
                            <th className="border border-black px-2 py-1 text-center">TP</th>
                            <th className="border border-black px-2 py-1 text-center">Exam</th>
                            <th className="border border-black px-2 py-1 text-center">Moy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bulletin?.subjects?.map((s: { name: string; coefficient: number; interro: number; tp: number; exam: number; average: number }, i: number) => (
                            <tr key={i}>
                                <td className="border border-black px-2 py-1">{s.name}</td>
                                <td className="border border-black px-2 py-1 text-center">{s.coefficient}</td>
                                <td className="border border-black px-2 py-1 text-center">{s.interro ?? '—'}</td>
                                <td className="border border-black px-2 py-1 text-center">{s.tp ?? '—'}</td>
                                <td className="border border-black px-2 py-1 text-center">{s.exam ?? '—'}</td>
                                <td className="border border-black px-2 py-1 text-center font-bold">{s.average?.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Summary */}
                <div className="text-center my-4">
                    <p className="text-sm"><strong>Moyenne Générale :</strong> <span className="text-lg font-bold">{bulletin?.generalAverage}/20</span></p>
                    <p className="text-sm"><strong>Rang :</strong> {bulletin?.rank}/{bulletin?.totalStudents}</p>
                </div>

                <div className="border-2 border-black p-2 text-center font-bold text-sm uppercase mt-3">
                    DÉCISION : {bulletin?.decision}
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-8 mt-12 text-center text-xs">
                    <div className="mt-10 pt-2 border-t border-black">Le Préfet des Études</div>
                    <div className="mt-10 pt-2 border-t border-black">Cachet de l'École</div>
                    <div className="mt-10 pt-2 border-t border-black">Signature Parent</div>
                </div>
            </div>
        </div>
    );
}
