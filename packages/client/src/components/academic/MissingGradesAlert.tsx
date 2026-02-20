import { AlertTriangle, Send } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface MissingGrade {
    subjectId: string;
    subjectName: string;
    teacherId: string | null;
    teacherName: string | null;
    count: number;
}

interface MissingGradesAlertProps {
    missing: MissingGrade[];
    className: string;
    termName: string;
}

export default function MissingGradesAlert({
    missing,
    className,
    termName,
}: MissingGradesAlertProps) {
    const [sending, setSending] = useState(false);

    const totalMissing = missing.reduce((sum, m) => sum + m.count, 0);

    const handleSendReminders = async () => {
        setSending(true);
        try {
            // TODO: Implement SMS reminder API call
            toast.success('Relances envoyées aux enseignants');
        } catch (error) {
            toast.error('Erreur lors de l\'envoi des relances');
        } finally {
            setSending(false);
        }
    };

    if (missing.length === 0) {
        return null;
    }

    return (
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center 
                                    justify-center">
                        <AlertTriangle size={20} className="text-orange-600" />
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">
                        ⚠️ Notes manquantes
                    </h3>

                    <p className="text-sm text-orange-800 mb-4">
                        {totalMissing} note{totalMissing > 1 ? 's' : ''} manquante
                        {totalMissing > 1 ? 's' : ''} pour {termName} :
                    </p>

                    <ul className="space-y-2 mb-4">
                        {missing.map((item) => (
                            <li key={item.subjectId} className="text-sm text-orange-800">
                                <span className="font-medium">• {item.subjectName}</span>
                                <span className="text-orange-700">
                                    {' '}
                                    ({item.count} élève{item.count > 1 ? 's' : ''})
                                </span>
                                {item.teacherName && (
                                    <span className="text-orange-600">
                                        {' '}
                                        — Enseignant: {item.teacherName}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={handleSendReminders}
                        disabled={sending}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white 
                                   rounded-lg hover:bg-orange-700 font-medium text-sm 
                                   transition-colors disabled:opacity-50 
                                   disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                        {sending ? 'Envoi en cours...' : 'Relancer les enseignants par SMS'}
                    </button>
                </div>
            </div>
        </div>
    );
}

