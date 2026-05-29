import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import api from '../../lib/api';
import type { Book } from '../../hooks/useLibrary';

interface Props {
  open: boolean;
  book: Book | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

interface StudentOption {
  id: string;
  nom: string;
  postNom: string;
  prenom: string | null;
  matricule: string;
  className?: string;
}

export default function LoanModal({ open, book, onClose, onSubmit, isLoading }: Props) {
  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [searching, setSearching] = useState(false);
  const [form, setForm] = useState({
    exemplaire: '',
    datePret: new Date().toISOString().split('T')[0],
    dateRetourPrevue: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      setSelectedStudent(null);
      setStudentSearch('');
      setStudents([]);
      // Default return date: end of current quarter (3 months)
      const returnDate = new Date();
      returnDate.setMonth(returnDate.getMonth() + 3);
      setForm({
        exemplaire: '',
        datePret: new Date().toISOString().split('T')[0],
        dateRetourPrevue: returnDate.toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [open]);

  useEffect(() => {
    if (studentSearch.length < 2) {
      setStudents([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get('/students', { params: { search: studentSearch, limit: 10 } });
        const list = (data.data || data.students || []).map((s: any) => ({
          id: s.id,
          nom: s.nom,
          postNom: s.postNom,
          prenom: s.prenom,
          matricule: s.matricule,
          className: s.enrollments?.[0]?.class?.name || s.className || '',
        }));
        setStudents(list);
      } catch {
        setStudents([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  if (!open || !book) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    onSubmit({
      bookId: book.id,
      studentId: selectedStudent.id,
      exemplaire: form.exemplaire || undefined,
      datePret: form.datePret,
      dateRetourPrevue: form.dateRetourPrevue,
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-semibold">Prêt — {book.titre}</h2>
            <p className="text-sm text-gray-500">{book.availableQty} exemplaires disponibles</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Élève *</label>
            {selectedStudent ? (
              <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                <span className="text-sm">
                  {selectedStudent.nom} {selectedStudent.postNom} {selectedStudent.prenom || ''}
                  {selectedStudent.className && <span className="text-gray-500 ml-1">({selectedStudent.className})</span>}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Changer
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                  placeholder="Rechercher élève..."
                />
                {(students.length > 0 || searching) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                    {searching && <p className="px-3 py-2 text-sm text-gray-500">Recherche...</p>}
                    {students.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { setSelectedStudent(s); setStudents([]); setStudentSearch(''); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        {s.nom} {s.postNom} {s.prenom || ''} <span className="text-gray-400">({s.className})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Exemplaire N°</label>
            <input
              type="text"
              value={form.exemplaire}
              onChange={(e) => setForm({ ...form, exemplaire: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Auto-assigné si vide"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date de prêt *</label>
              <input
                type="date"
                value={form.datePret}
                onChange={(e) => setForm({ ...form, datePret: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date retour prévue *</label>
              <input
                type="date"
                value={form.dateRetourPrevue}
                onChange={(e) => setForm({ ...form, dateRetourPrevue: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
              placeholder="État au moment du prêt..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedStudent}
              className="px-4 py-2 text-sm bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer prêt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
