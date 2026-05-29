import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface Book {
  id: string;
  titre: string;
  auteur: string | null;
  isbn: string | null;
  matiere: string;
  niveaux: string;
  totalQty: number;
  availableQty: number;
  etat: string;
  unitValue: number | null;
  acquiredAt: string | null;
  loans: BookLoan[];
}

export interface BookLoan {
  id: string;
  bookId: string;
  studentId: string;
  exemplaire: string | null;
  notes: string | null;
  loanDate: string;
  expectedReturn: string;
  actualReturn: string | null;
  etatRetour: string | null;
  coutReparation: number | null;
  status: string;
  book?: { titre: string; matiere?: string };
  student?: {
    nom: string;
    postNom: string;
    prenom: string | null;
    matricule: string;
    enrollments?: { class: { name: string } }[];
  };
}

export interface LibraryStats {
  total: number;
  available: number;
  loaned: number;
  overdue: number;
}

export interface LibraryFilters {
  matiere?: string;
  niveau?: string;
  disponible?: string;
  search?: string;
}

export function useLibrary(filters: LibraryFilters = {}) {
  const queryClient = useQueryClient();

  const booksQuery = useQuery({
    queryKey: ['library-books', filters],
    queryFn: async () => {
      const params: any = {};
      if (filters.matiere) params.matiere = filters.matiere;
      if (filters.niveau) params.niveau = filters.niveau;
      if (filters.disponible) params.disponible = filters.disponible;
      if (filters.search) params.search = filters.search;
      const { data } = await api.get('/inventory/books', { params });
      return data as { books: Book[]; stats: LibraryStats };
    },
  });

  const loansQuery = useQuery({
    queryKey: ['library-loans'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/books/loans');
      return data.loans as BookLoan[];
    },
  });

  const overdueQuery = useQuery({
    queryKey: ['library-overdue'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/books/loans/overdue');
      return data.loans as BookLoan[];
    },
  });

  const createBook = useMutation({
    mutationFn: async (payload: {
      titre: string;
      auteur?: string;
      isbn?: string;
      matiere: string;
      niveaux: number[];
      totalQty: number;
      etat: string;
      unitValue?: number;
      acquiredAt?: string;
    }) => {
      const { data } = await api.post('/inventory/books', payload);
      return data.book;
    },
    onSuccess: () => {
      toast.success('Livre ajouté avec succès');
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout');
    },
  });

  const createLoan = useMutation({
    mutationFn: async ({ bookId, ...payload }: {
      bookId: string;
      studentId: string;
      exemplaire?: string;
      datePret: string;
      dateRetourPrevue: string;
      notes?: string;
    }) => {
      const { data } = await api.post(`/inventory/books/${bookId}/loan`, payload);
      return data.loan;
    },
    onSuccess: () => {
      toast.success('Prêt enregistré');
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      queryClient.invalidateQueries({ queryKey: ['library-loans'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors du prêt');
    },
  });

  const returnLoan = useMutation({
    mutationFn: async ({ loanId, ...payload }: {
      loanId: string;
      etatRetour: string;
      coutReparation?: number;
    }) => {
      const { data } = await api.post(`/inventory/books/loans/${loanId}/return`, payload);
      return data.loan;
    },
    onSuccess: () => {
      toast.success('Retour enregistré');
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      queryClient.invalidateQueries({ queryKey: ['library-loans'] });
      queryClient.invalidateQueries({ queryKey: ['library-overdue'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors du retour');
    },
  });

  return {
    books: booksQuery.data?.books || [],
    stats: booksQuery.data?.stats || { total: 0, available: 0, loaned: 0, overdue: 0 },
    loans: loansQuery.data || [],
    overdueLoans: overdueQuery.data || [],
    isLoading: booksQuery.isLoading,
    isError: booksQuery.isError,
    refetch: booksQuery.refetch,
    createBook,
    createLoan,
    returnLoan,
  };
}
