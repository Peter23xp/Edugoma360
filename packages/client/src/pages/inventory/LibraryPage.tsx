import { useState } from 'react';
import { Plus, Search, BookOpen, CheckCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { useLibrary, type Book, type BookLoan } from '../../hooks/useLibrary';
import AddBookModal from '../../components/inventory/AddBookModal';
import LoanModal from '../../components/inventory/LoanModal';

const NIVEAUX_LABELS: Record<number, string> = { 1: 'TC-1', 2: 'TC-2', 3: '3ème', 4: '4ème', 5: '5ème', 6: '6ème' };

export default function LibraryPage() {
  const [filters, setFilters] = useState({ matiere: '', search: '' });
  const [tab, setTab] = useState<'catalogue' | 'loans' | 'overdue' | 'history'>('catalogue');
  const [showAddBook, setShowAddBook] = useState(false);
  const [loanBook, setLoanBook] = useState<Book | null>(null);
  const [returnLoanId, setReturnLoanId] = useState<string | null>(null);
  const [returnForm, setReturnForm] = useState({ etatRetour: 'BON', coutReparation: 0 });

  const { books, stats, loans, overdueLoans, isLoading, createBook, createLoan, returnLoan } = useLibrary({
    matiere: filters.matiere || undefined,
    search: filters.search || undefined,
  });

  const handleCreateBook = (data: any) => {
    createBook.mutate(data, { onSuccess: () => setShowAddBook(false) });
  };

  const handleLoan = (data: any) => {
    createLoan.mutate(data, { onSuccess: () => setLoanBook(null) });
  };

  const handleReturn = () => {
    if (!returnLoanId) return;
    returnLoan.mutate({
      loanId: returnLoanId,
      etatRetour: returnForm.etatRetour,
      coutReparation: returnForm.coutReparation || undefined,
    }, { onSuccess: () => setReturnLoanId(null) });
  };

  const getDaysOverdue = (loan: BookLoan) => {
    const expected = new Date(loan.expectedReturn);
    const now = new Date();
    return Math.max(0, Math.floor((now.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const statsCards = [
    { label: 'Total livres', value: stats.total, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
    { label: 'Disponibles', value: stats.available, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Prêtés', value: stats.loaned, icon: BookOpen, color: 'text-orange-600 bg-orange-50' },
    { label: 'En retard', value: stats.overdue, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Bibliothèque</h1>
        <button
          onClick={() => setShowAddBook(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter livre
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue Alert */}
      {stats.overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-800">⚠️ {stats.overdue} livres en retard de retour</p>
              {overdueLoans.length > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Retard le plus long : {overdueLoans[0]?.student?.nom} ({getDaysOverdue(overdueLoans[0])} jours)
                </p>
              )}
            </div>
            <button
              onClick={() => setTab('overdue')}
              className="text-sm text-red-700 hover:underline"
            >
              Voir les retards
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {[
          { key: 'catalogue', label: 'Catalogue' },
          { key: 'loans', label: 'Prêts actifs' },
          { key: 'overdue', label: 'En retard' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Catalogue Tab */}
      {tab === 'catalogue' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filters.matiere}
              onChange={(e) => setFilters({ ...filters, matiere: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Toutes matières</option>
              {['Mathématiques', 'Français', 'Anglais', 'Physique', 'Chimie', 'Biologie', 'Histoire', 'Géographie'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un titre..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Chargement...</div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Aucun livre trouvé</div>
          ) : (
            <div className="grid gap-3">
              {books.map((book) => {
                let niveaux: number[] = [];
                try { niveaux = JSON.parse(book.niveaux); } catch { /* ignore */ }
                const loanedQty = book.totalQty - (book.availableQty ?? 0);
                return (
                  <div key={book.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">📗 {book.titre}</h3>
                        {book.auteur && <p className="text-sm text-gray-500">Auteur : {book.auteur}</p>}
                        <p className="text-sm text-gray-600 mt-1">
                          Quantité : {book.totalQty} ex. — Disponibles : {book.availableQty} — Prêtés : {loanedQty}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Niveaux : {niveaux.map((n) => NIVEAUX_LABELS[n] || n).join(', ')}
                        </p>
                      </div>
                      <button
                        onClick={() => setLoanBook(book)}
                        disabled={book.availableQty === 0}
                        className="px-3 py-1.5 text-sm bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] disabled:opacity-50"
                      >
                        Prêter
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Loans Tab */}
      {tab === 'loans' && (
        <div className="space-y-3">
          {loans.filter((l) => l.status !== 'RETURNED').length === 0 ? (
            <div className="text-center py-12 text-gray-500">Aucun prêt actif</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Livre</th>
                    <th className="pb-2 font-medium">Élève</th>
                    <th className="pb-2 font-medium">Prêté le</th>
                    <th className="pb-2 font-medium">Retour</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {loans.filter((l) => l.status !== 'RETURNED').map((loan) => {
                    const overdue = getDaysOverdue(loan);
                    return (
                      <tr key={loan.id} className="border-b">
                        <td className="py-3">
                          {loan.book?.titre} {loan.exemplaire && `(${loan.exemplaire})`}
                        </td>
                        <td className="py-3">
                          {loan.student?.nom} {loan.student?.postNom}
                          {loan.student?.enrollments?.[0] && (
                            <span className="text-gray-400 text-xs ml-1">
                              ({loan.student.enrollments[0].class.name})
                            </span>
                          )}
                        </td>
                        <td className="py-3">{new Date(loan.loanDate).toLocaleDateString('fr-FR')}</td>
                        <td className="py-3">
                          {new Date(loan.expectedReturn).toLocaleDateString('fr-FR')}
                          {overdue > 0 ? (
                            <span className="ml-2 text-xs text-red-600">🔴 {overdue}j retard</span>
                          ) : (
                            <span className="ml-2 text-xs text-green-600">✅</span>
                          )}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => { setReturnLoanId(loan.id); setReturnForm({ etatRetour: 'BON', coutReparation: 0 }); }}
                            className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Retourner
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Overdue Tab */}
      {tab === 'overdue' && (
        <div className="space-y-3">
          {overdueLoans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Aucun retard</div>
          ) : (
            overdueLoans.map((loan) => (
              <div key={loan.id} className="bg-white border border-red-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{loan.book?.titre}</p>
                    <p className="text-sm text-gray-600">
                      {loan.student?.nom} {loan.student?.postNom}
                      {loan.student?.enrollments?.[0] && ` (${loan.student.enrollments[0].class.name})`}
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      🔴 {getDaysOverdue(loan)} jours de retard — Prévu le {new Date(loan.expectedReturn).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <button
                    onClick={() => { setReturnLoanId(loan.id); setReturnForm({ etatRetour: 'BON', coutReparation: 0 }); }}
                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                  >
                    Retourner
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <AddBookModal
        open={showAddBook}
        onClose={() => setShowAddBook(false)}
        onSubmit={handleCreateBook}
        isLoading={createBook.isPending}
      />

      <LoanModal
        open={!!loanBook}
        book={loanBook}
        onClose={() => setLoanBook(null)}
        onSubmit={handleLoan}
        isLoading={createLoan.isPending}
      />

      {/* Return Modal */}
      {returnLoanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Retour de livre</h2>
            <div>
              <label className="block text-sm font-medium mb-2">État au retour *</label>
              <div className="flex gap-4">
                {[
                  { value: 'BON', label: 'Bon' },
                  { value: 'DEGRADE', label: 'Dégradé' },
                  { value: 'ENDOMMAGE', label: 'Endommagé' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="etatRetour"
                      value={opt.value}
                      checked={returnForm.etatRetour === opt.value}
                      onChange={(e) => setReturnForm({ ...returnForm, etatRetour: e.target.value })}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {returnForm.etatRetour !== 'BON' && (
              <div>
                <label className="block text-sm font-medium mb-1">Coût réparation/remplacement (FC)</label>
                <input
                  type="number"
                  min={0}
                  value={returnForm.coutReparation}
                  onChange={(e) => setReturnForm({ ...returnForm, coutReparation: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setReturnLoanId(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={handleReturn}
                disabled={returnLoan.isPending}
                className="px-4 py-2 text-sm bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] disabled:opacity-50"
              >
                {returnLoan.isPending ? 'Enregistrement...' : 'Confirmer retour'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
