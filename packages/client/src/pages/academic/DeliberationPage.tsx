import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, FileText, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import DeliberationWizard from '../../components/academic/DeliberationWizard';
import DecisionSelector from '../../components/academic/DecisionSelector';
import DeliberationSummary from '../../components/academic/DeliberationSummary';
import { DelibDecision } from '@edugoma360/shared/src/constants/decisions';
import { suggestDelibDecision } from '@edugoma360/shared/src/utils/gradeCalc';

export default function DeliberationPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const classId = searchParams.get('classId');
    const termId = searchParams.get('termId');

    const [currentStep, setCurrentStep] = useState(1);
    const [decisions, setDecisions] = useState<
        Record<string, { decision: DelibDecision; justification: string }>
    >({});
    const [showValidateModal, setShowValidateModal] = useState(false);

    // Fetch deliberation data
    const { data: deliberationData, isLoading } = useQuery({
        queryKey: ['deliberation', classId, termId],
        queryFn: async () => {
            const response = await api.get(`/deliberation/${classId}/${termId}`);
            return response.data;
        },
        enabled: !!classId && !!termId,
    });

    // Initialize decisions from suggestions
    useEffect(() => {
        if (deliberationData?.students && Object.keys(decisions).length === 0) {
            const initialDecisions: Record<
                string,
                { decision: DelibDecision; justification: string }
            > = {};
            deliberationData.students.forEach((student: any) => {
                const suggestion = suggestDelibDecision(
                    student.generalAverage,
                    student.hasEliminatoryFailure
                ) as DelibDecision;
                initialDecisions[student.studentId] = {
                    decision: suggestion,
                    justification: '',
                };
            });
            setDecisions(initialDecisions);
        }
    }, [deliberationData, decisions]);

    // Validate mutation
    const validateMutation = useMutation({
        mutationFn: async () => {
            const decisionsArray = Object.entries(decisions).map(([studentId, d]) => ({
                studentId,
                decision: d.decision,
                justification: d.justification || undefined,
            }));

            const response = await api.post(`/deliberation/${classId}/${termId}/validate`, {
                decisions: decisionsArray,
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success('Délibération validée avec succès');
            setShowValidateModal(false);
            // Redirect to PV page or bulletins
            navigate(`/deliberation/pv?deliberationId=${data.deliberationId}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la validation');
        },
    });

    if (!classId || !termId) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle size={48} className="text-orange-600 mx-auto mb-4" />
                    <p className="text-neutral-600">Paramètres manquants</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }

    const students = deliberationData?.students || [];
    const classData = deliberationData?.class;
    const termData = deliberationData?.term;
    const prefetName = deliberationData?.prefetName || 'Préfet';
    const verification = deliberationData?.verification || {};

    const steps = [
        { number: 1, label: 'Vérification', status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending' },
        { number: 2, label: 'Calcul', status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending' },
        { number: 3, label: 'Décisions', status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : 'pending' },
        { number: 4, label: 'PV', status: currentStep === 4 ? 'active' : 'pending' },
    ];

    const handleDecisionChange = (studentId: string, decision: DelibDecision) => {
        setDecisions((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                decision,
            },
        }));
    };

    const handleJustificationChange = (studentId: string, justification: string) => {
        setDecisions((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                justification,
            },
        }));
    };

    const canProceedToStep2 = verification.allGradesEntered && verification.allGradesLocked && verification.averagesValidated;
    const canProceedToStep3 = currentStep >= 2;
    const canProceedToStep4 = () => {
        // Check all modified decisions have justifications
        return Object.entries(decisions).every(([studentId, d]) => {
            const student = students.find((s: any) => s.studentId === studentId);
            if (!student) return true;
            const suggestion = suggestDelibDecision(
                student.generalAverage,
                student.hasEliminatoryFailure
            ) as DelibDecision;
            return d.decision === suggestion || d.justification.trim().length > 0;
        });
    };

    const handleNext = () => {
        if (currentStep === 1 && !canProceedToStep2) {
            toast.error('Veuillez compléter toutes les vérifications');
            return;
        }
        if (currentStep === 3 && !canProceedToStep4()) {
            toast.error('Veuillez justifier toutes les décisions modifiées');
            return;
        }
        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleValidate = () => {
        if (!canProceedToStep4()) {
            toast.error('Veuillez justifier toutes les décisions modifiées');
            return;
        }
        setShowValidateModal(true);
    };

    const handleConfirmValidate = () => {
        validateMutation.mutate();
    };

    // Get suggestions for summary
    const suggestions: Record<string, DelibDecision> = {};
    students.forEach((student: any) => {
        suggestions[student.studentId] = suggestDelibDecision(
            student.generalAverage,
            student.hasEliminatoryFailure
        ) as DelibDecision;
    });

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <h1 className="text-2xl font-bold text-neutral-900">
                        Délibération — {classData?.name} — {termData?.label}
                    </h1>
                    <p className="text-sm text-neutral-600 mt-1">
                        Année {deliberationData?.academicYear?.label}
                    </p>
                </div>
            </div>

            {/* Wizard */}
            <DeliberationWizard currentStep={currentStep} steps={steps as any} />

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* STEP 1: Verification */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-lg border border-neutral-200 p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-6">
                            Vérification des prérequis
                        </h2>

                        <div className="space-y-4">
                            <div
                                className={`flex items-center gap-3 p-4 rounded-lg border ${
                                    verification.allGradesEntered
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-red-50 border-red-200'
                                }`}
                            >
                                {verification.allGradesEntered ? (
                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm">✓</span>
                                    </div>
                                ) : (
                                    <AlertTriangle size={24} className="text-red-600" />
                                )}
                                <div>
                                    <p className="font-medium text-neutral-900">
                                        Toutes les notes saisies
                                    </p>
                                    <p className="text-sm text-neutral-600">
                                        {verification.gradesEntered}/{verification.totalGradesRequired}{' '}
                                        notes
                                    </p>
                                </div>
                            </div>

                            <div
                                className={`flex items-center gap-3 p-4 rounded-lg border ${
                                    verification.allGradesLocked
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-red-50 border-red-200'
                                }`}
                            >
                                {verification.allGradesLocked ? (
                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm">✓</span>
                                    </div>
                                ) : (
                                    <AlertTriangle size={24} className="text-red-600" />
                                )}
                                <div>
                                    <p className="font-medium text-neutral-900">
                                        Toutes les notes verrouillées
                                    </p>
                                </div>
                            </div>

                            <div
                                className={`flex items-center gap-3 p-4 rounded-lg border ${
                                    verification.averagesValidated
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-red-50 border-red-200'
                                }`}
                            >
                                {verification.averagesValidated ? (
                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm">✓</span>
                                    </div>
                                ) : (
                                    <AlertTriangle size={24} className="text-red-600" />
                                )}
                                <div>
                                    <p className="font-medium text-neutral-900">
                                        Moyennes calculées et validées
                                    </p>
                                </div>
                            </div>

                            {verification.eliminatoryCount > 0 && (
                                <div className="flex items-center gap-3 p-4 rounded-lg border bg-orange-50 border-orange-200">
                                    <AlertTriangle size={24} className="text-orange-600" />
                                    <div>
                                        <p className="font-medium text-neutral-900">
                                            {verification.eliminatoryCount} élève(s) avec notes
                                            éliminatoires
                                        </p>
                                        <p className="text-sm text-neutral-600">
                                            Ces élèves seront automatiquement refusés
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 2: Calcul */}
                {currentStep === 2 && (
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="p-6 border-b border-neutral-200">
                            <h2 className="text-lg font-bold text-neutral-900">
                                Moyennes calculées
                            </h2>
                            <p className="text-sm text-neutral-600 mt-1">
                                Vérifiez les moyennes et les suggestions de décision
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">
                                            Élève
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-700 uppercase">
                                            Moyenne
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-700 uppercase">
                                            Points
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-700 uppercase">
                                            Mtn Elim
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">
                                            Suggestion
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                    {students.map((student: any) => {
                                        const suggestion = suggestDelibDecision(
                                            student.generalAverage,
                                            student.hasEliminatoryFailure
                                        );
                                        return (
                                            <tr key={student.studentId}>
                                                <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                                    {student.studentName}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center font-semibold">
                                                    {student.generalAverage.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center">
                                                    {student.totalPoints.toFixed(0)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {student.hasEliminatoryFailure ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            OUI
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-neutral-600">
                                                            Non
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-neutral-700">
                                                    {suggestion}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* STEP 3: Decisions */}
                {currentStep === 3 && (
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="p-6 border-b border-neutral-200">
                            <h2 className="text-lg font-bold text-neutral-900">
                                Décisions finales
                            </h2>
                            <p className="text-sm text-neutral-600 mt-1">
                                Modifiez les décisions si nécessaire (justification requise)
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">
                                            Élève
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-700 uppercase">
                                            Moy
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">
                                            Suggestion
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">
                                            Décision finale
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">
                                            Justification
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student: any) => {
                                        const suggestion = suggestDelibDecision(
                                            student.generalAverage,
                                            student.hasEliminatoryFailure
                                        ) as DelibDecision;
                                        return (
                                            <DecisionSelector
                                                key={student.studentId}
                                                studentId={student.studentId}
                                                studentName={student.studentName}
                                                average={student.generalAverage}
                                                suggestion={suggestion}
                                                currentDecision={
                                                    decisions[student.studentId]?.decision ||
                                                    suggestion
                                                }
                                                justification={
                                                    decisions[student.studentId]?.justification || ''
                                                }
                                                onDecisionChange={handleDecisionChange}
                                                onJustificationChange={handleJustificationChange}
                                            />
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* STEP 4: Summary */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <DeliberationSummary
                            className={classData?.name}
                            termLabel={termData?.label}
                            prefetName={prefetName}
                            decisions={decisions}
                            suggestions={suggestions}
                            totalStudents={students.length}
                        />

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-900">
                                        Action irréversible
                                    </p>
                                    <p className="text-sm text-amber-800 mt-1">
                                        La validation génèrera automatiquement le PV et tous les
                                        bulletins. Les parents recevront un SMS de notification.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className="px-6 py-2 text-sm font-medium text-neutral-700 
                                   hover:bg-neutral-100 rounded-lg transition-colors
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ← Précédent
                    </button>

                    {currentStep < 4 ? (
                        <button
                            onClick={handleNext}
                            disabled={currentStep === 1 && !canProceedToStep2}
                            className="px-6 py-2 bg-primary text-white rounded-lg 
                                       hover:bg-primary/90 font-medium text-sm transition-colors
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suivant →
                        </button>
                    ) : (
                        <button
                            onClick={handleValidate}
                            className="flex items-center gap-2 px-6 py-2 bg-orange-600 
                                       text-white rounded-lg hover:bg-orange-700 
                                       font-medium text-sm transition-colors"
                        >
                            <FileText size={16} />
                            Valider la délibération
                        </button>
                    )}
                </div>
            </div>

            {/* Validate Modal */}
            {showValidateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle size={20} className="text-orange-600" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900">
                                    Valider la délibération ?
                                </h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-800 font-medium">
                                    ⚠️ Cette action est IRRÉVERSIBLE
                                </p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <p className="text-neutral-700">Cette action va :</p>
                                <ul className="list-disc list-inside space-y-1 text-neutral-600 ml-2">
                                    <li>Générer le Procès-Verbal (PV) en PDF</li>
                                    <li>Générer tous les bulletins de la classe</li>
                                    <li>Envoyer un SMS à tous les parents</li>
                                    <li>Verrouiller définitivement la délibération</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
                            <button
                                onClick={() => setShowValidateModal(false)}
                                disabled={validateMutation.isPending}
                                className="px-4 py-2 text-sm font-medium text-neutral-700 
                                           hover:bg-neutral-100 rounded-lg transition-colors
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmValidate}
                                disabled={validateMutation.isPending}
                                className="flex items-center gap-2 px-6 py-2 bg-orange-600 
                                           text-white rounded-lg hover:bg-orange-700 
                                           font-medium text-sm transition-colors
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {validateMutation.isPending && (
                                    <Loader2 size={16} className="animate-spin" />
                                )}
                                Valider définitivement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
