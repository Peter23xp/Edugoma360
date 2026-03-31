import { useState, useMemo } from 'react';
import { Plus, FileSpreadsheet, ChevronRight, Settings2 } from 'lucide-react';
import { useFees, type Fee } from '../../hooks/useFees';
import { FEE_TYPES } from '@edugoma360/shared';
import FeeStatsCards from '../../components/finance/FeeStatsCards';
import FeeCard from '../../components/finance/FeeCard';
import FeeFormModal from '../../components/finance/FeeFormModal';
import FeeTemplateModal from '../../components/finance/FeeTemplateModal';

export default function FeesConfigPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);

  const { feesQuery, createMutation, updateMutation, deleteMutation, archiveMutation, templateMutation } = useFees();

  const { fees = [], stats } = feesQuery.data || {};

  // Group fees by type
  const groupedFees = useMemo(() => {
    const groups: Record<string, Fee[]> = {};
    for (const fee of fees) {
      const type = fee.type || 'AUTRE';
      if (!groups[type]) groups[type] = [];
      groups[type].push(fee);
    }
    return groups;
  }, [fees]);

  const handleCreateOrUpdate = (data: any) => {
    if (editingFee) {
      updateMutation.mutate(
        { id: editingFee.id, ...data },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingFee(null);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      });
    }
  };

  const handleEdit = (fee: Fee) => {
    setEditingFee(fee);
    setIsFormOpen(true);
  };

  const handleDuplicate = (fee: Fee) => {
    createMutation.mutate({
      type: fee.type,
      label: fee.name + ' (copie)',
      amount: fee.amount,
      scope: fee.scope,
      sectionIds: fee.sectionIds,
      classIds: fee.classIds,
      frequency: fee.frequency,
      months: fee.months,
      required: fee.isRequired,
      observations: fee.observations,
    });
  };

  const handleArchive = (fee: Fee) => {
    if (confirm(`Archiver le frais "${fee.name}" ?`)) {
      archiveMutation.mutate(fee.id);
    }
  };

  const handleDelete = (fee: Fee) => {
    if (confirm(`Supprimer définitivement le frais "${fee.name}" ? Cette action est irréversible.`)) {
      deleteMutation.mutate(fee.id);
    }
  };

  const handleTemplate = (templateName: string) => {
    templateMutation.mutate(templateName, {
      onSuccess: () => {
        setIsTemplateOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
            <span>Finance</span>
            <ChevronRight size={14} />
            <span className="text-primary font-medium">Configuration des frais</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Settings2 className="text-primary" />
            Configuration des Frais Scolaires
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTemplateOpen(true)}
            className="flex items-center gap-2 px-4 h-10 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-medium text-sm hover:bg-neutral-50 transition-colors"
          >
            <FileSpreadsheet size={16} />
            Utiliser modèle
          </button>
          <button
            onClick={() => {
              setEditingFee(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 h-10 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
          >
            <Plus size={16} />
            Nouveau frais
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <FeeStatsCards stats={stats} isLoading={feesQuery.isLoading} />

      {/* Fee List or Empty State */}
      {feesQuery.isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : fees.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Settings2 size={28} className="text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-2">Aucun frais configuré</h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
            Commencez par créer vos frais scolaires ou utilisez un modèle prédéfini pour configurer
            rapidement tous les frais de l'école.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsTemplateOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors w-full sm:w-auto"
            >
              <FileSpreadsheet size={16} />
              Utiliser un modèle
            </button>
            <button
              onClick={() => {
                setEditingFee(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors w-full sm:w-auto"
            >
              <Plus size={16} />
              Créer manuellement
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedFees).map(([type, typeFees]) => {
            const typeDef = FEE_TYPES[type as keyof typeof FEE_TYPES];
            return (
              <div key={type}>
                <h2 className="text-sm font-bold text-neutral-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {typeDef?.label || type}
                  <span className="text-neutral-400 font-normal">({typeFees.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {typeFees.map((fee) => (
                    <FeeCard
                      key={fee.id}
                      fee={fee}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicate}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <FeeFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFee(null);
        }}
        onSubmit={handleCreateOrUpdate}
        fee={editingFee}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <FeeTemplateModal
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        onApply={handleTemplate}
        isSubmitting={templateMutation.isPending}
      />
    </div>
  );
}
