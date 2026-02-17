import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit, Phone, MapPin, Calendar, User } from 'lucide-react';
import api from '../../lib/api';
import { formatStudentName, formatDate } from '../../lib/utils';
import ScreenBadge from '../../components/shared/ScreenBadge';
import { useAuth } from '../../hooks/useAuth';

export default function StudentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { hasRole } = useAuth();

    const { data: student, isLoading } = useQuery({
        queryKey: ['student', id],
        queryFn: async () => {
            const res = await api.get(`/students/${id}`);
            return res.data;
        },
    });

    if (isLoading) {
        return <div className="animate-pulse space-y-4"><div className="h-48 bg-neutral-200 rounded-xl" /></div>;
    }

    if (!student) {
        return <p className="text-center text-neutral-500 py-12">Élève non trouvé</p>;
    }

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary">
                <ArrowLeft size={16} /> Retour à la liste
            </button>

            {/* Student Header Card */}
            <div className="bg-white rounded-xl border border-neutral-300/50 p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold">
                            {student.nom.charAt(0)}{student.postNom.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900">
                                {formatStudentName(student.nom, student.postNom, student.prenom)}
                            </h1>
                            <p className="text-sm text-primary font-mono">{student.matricule}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <ScreenBadge label={student.sexe === 'M' ? 'Masculin' : 'Féminin'} variant={student.sexe === 'M' ? 'info' : 'warning'} />
                                <ScreenBadge label={student.statut} variant="success" />
                            </div>
                        </div>
                    </div>
                    {hasRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE') && (
                        <button
                            onClick={() => navigate(`/students/${id}/edit`)}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"
                        >
                            <Edit size={14} /> Modifier
                        </button>
                    )}
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="bg-white rounded-xl border border-neutral-300/50 p-5">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <User size={16} /> Informations personnelles
                    </h3>
                    <dl className="space-y-3 text-sm">
                        <div className="flex justify-between"><dt className="text-neutral-500">Date de naissance</dt><dd className="font-medium flex items-center gap-1"><Calendar size={12} />{formatDate(student.dateNaissance)}</dd></div>
                        <div className="flex justify-between"><dt className="text-neutral-500">Lieu de naissance</dt><dd className="font-medium flex items-center gap-1"><MapPin size={12} />{student.lieuNaissance}</dd></div>
                        <div className="flex justify-between"><dt className="text-neutral-500">Nationalité</dt><dd className="font-medium">{student.nationalite}</dd></div>
                    </dl>
                </div>

                {/* Family Info */}
                <div className="bg-white rounded-xl border border-neutral-300/50 p-5">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <Phone size={16} /> Contacts famille
                    </h3>
                    <dl className="space-y-3 text-sm">
                        {student.nomPere && <div className="flex justify-between"><dt className="text-neutral-500">Père</dt><dd className="font-medium">{student.nomPere} {student.telPere && <span className="text-primary ml-1">({student.telPere})</span>}</dd></div>}
                        {student.nomMere && <div className="flex justify-between"><dt className="text-neutral-500">Mère</dt><dd className="font-medium">{student.nomMere} {student.telMere && <span className="text-primary ml-1">({student.telMere})</span>}</dd></div>}
                        {student.nomTuteur && <div className="flex justify-between"><dt className="text-neutral-500">Tuteur</dt><dd className="font-medium">{student.nomTuteur} {student.telTuteur && <span className="text-primary ml-1">({student.telTuteur})</span>}</dd></div>}
                    </dl>
                </div>
            </div>
        </div>
    );
}
