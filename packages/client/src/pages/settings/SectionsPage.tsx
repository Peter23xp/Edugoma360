import { useState } from 'react';
import { Plus, BookOpen, AlertCircle } from 'lucide-react';
import { useSections } from '../../hooks/useSections';
import SectionCard from '../../components/settings/SectionCard';
import CreateSectionModal from '../../components/settings/CreateSectionModal';

export default function SectionsPage() {
    const { 
        data, 
        isLoading, 
        isError, 
        createSection, 
        isCreating, 
        updateSection, 
        deleteSection, 
        addSubject, 
        updateSubject, 
        removeSubject 
    } = useSections();
    
    const [showCreateModal, setShowCreateModal] = useState(false);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleCreateSection = async (formData: any) => {
        await createSection(formData);
    };

    const handleEditSection = async (section: any) => {
        // Not requested in prompt UI but good for UX: Could be a rename prompt or modal
        const newName = window.prompt("Nouveau nom de la section", section.name);
        if (newName && newName !== section.name) {
            await updateSection({ id: section.code, data: { name: newName, code: section.code } });
        }
    };

    const handleDeleteSection = async (code: string) => {
        await deleteSection(code);
    };

    const handleAddSubject = async (sectionCode: string, data: any) => {
        await addSubject({ sectionId: sectionCode, data });
    };

    const handleUpdateSubject = async (sectionCode: string, subjectId: string, data: any) => {
        await updateSubject({ sectionId: sectionCode, subjectId, data });
    };

    const handleRemoveSubject = async (sectionCode: string, subjectId: string) => {
        await removeSubject({ sectionId: sectionCode, subjectId });
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                <p className="text-sm text-neutral-500">Chargement des sections…</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <AlertCircle size={36} className="text-red-400" />
                <p className="text-sm font-medium text-neutral-700">Impossible de charger les données</p>
                <p className="text-xs text-neutral-400">Vérifiez votre connexion et réessayez.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">

            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white border border-neutral-200 rounded-2xl px-6 py-5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <BookOpen size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900 uppercase tracking-tight">Sections de l'école</h1>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            Gérez les filières, les années d'études et les matières rattachées.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm shrink-0"
                >
                    <Plus size={16} />
                    Nouvelle section
                </button>
            </div>

            {/* ── Info Box ─────────────────────────────────────────────────── */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-4">
                <div className="mt-0.5 p-1 bg-blue-100 rounded text-blue-600">
                    <AlertCircle size={20} />
                </div>
                <div className="text-sm text-blue-900 leading-relaxed">
                    <strong>Structurez votre école :</strong> Les sections définissent l'architecture académique (Tronc Commun, Scientifique, Pédagogie...). <br />
                    Ajoutez ensuite des matières spécifiques à chaque section. Les classes (1ère A, 1ère B) seront créées à partir de cette structure.
                </div>
            </div>

            {/* ── Sections List ─────────────────────────────────────────────── */}
            {(!data || data.length === 0) ? (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-12 text-center mt-6">
                    <BookOpen size={48} className="mx-auto text-orange-400 mb-4" />
                    <p className="font-bold text-orange-800 text-lg">Aucune section configurée</p>
                    <p className="text-sm text-orange-600 mt-2 mb-6 max-w-sm mx-auto">
                        Commencez par créer les sections disponibles dans votre établissement (Tronc commun, humanités...).
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} /> Ajouter ma première section
                    </button>
                </div>
            ) : (
                <div className="mt-6">
                    {data.map(section => (
                        <SectionCard 
                            key={section.id} 
                            section={section} 
                            onDeleteStr={handleDeleteSection}
                            onEditStr={handleEditSection}
                            onAddSubject={handleAddSubject}
                            onUpdateSubject={handleUpdateSubject}
                            onRemoveSubject={handleRemoveSubject}
                        />
                    ))}
                </div>
            )}

            {/* ── Modals ────────────────────────────────────────────────────── */}
            <CreateSectionModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateSection}
                isSubmitting={isCreating}
            />

        </div>
    );
}
