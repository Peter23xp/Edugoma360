import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/api";

// ── Types ────────────────────────────────────────────────────────────────────
export interface UserItem {
  id: string;
  email: string | null;
  nom: string;
  postNom: string;
  prenom?: string | null;
  phone: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  online: number;
}

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Administrateur",
  PREFET: "Préfet des études",
  ECONOME: "Économe",
  SECRETAIRE: "Secrétaire",
  ENSEIGNANT: "Enseignant",
  PARENT: "Parent / Tuteur",
};

export const ROLE_LIST = [
  "SUPER_ADMIN",
  "PREFET",
  "ECONOME",
  "SECRETAIRE",
  "ENSEIGNANT",
  "PARENT",
];

// ── Main hook ────────────────────────────────────────────────────────────────
export function useUsers(role?: string, status?: string, search?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<{ users: UserItem[]; stats: UserStats }>({
    queryKey: ["users-management", role, status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (role) params.set("role", role);
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      const res = await api.get(`/users?${params.toString()}`);
      return res.data;
    },
  });

  // Create user
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/users", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-management"] });
      toast.success("Utilisateur créé avec succès");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || "Erreur lors de la création");
    },
  });

  // Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.put(`/users/${userId}/toggle-status`);
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["users-management"] });
      toast.success(data.isActive ? "Compte activé" : "Compte désactivé");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || "Erreur");
    },
  });

  // Reset password
  const resetPasswordMutation = useMutation({
    mutationFn: async ({
      userId,
      ...body
    }: {
      userId: string;
      newPassword?: string;
      autoGenerate: boolean;
      mustChangePassword: boolean;
      sendEmail: boolean;
    }) => {
      const res = await api.post(`/users/${userId}/reset-password`, body);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Mot de passe réinitialisé");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || "Erreur");
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-management"] });
      toast.success("Utilisateur supprimé");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || "Erreur");
    },
  });

  // Update permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({
      userId,
      permissions,
    }: {
      userId: string;
      permissions: Record<string, string[]>;
    }) => {
      const res = await api.put(`/users/${userId}/permissions`, {
        permissions,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Permissions mises à jour");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || "Erreur");
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,

    createUser: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createResult: createMutation.data,

    toggleStatus: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,

    resetPassword: resetPasswordMutation.mutateAsync,
    isResetting: resetPasswordMutation.isPending,
    resetResult: resetPasswordMutation.data,

    deleteUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    updatePermissions: updatePermissionsMutation.mutateAsync,
    isUpdatingPermissions: updatePermissionsMutation.isPending,
  };
}
