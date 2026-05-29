import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Lock, Phone, Mail, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrateur',
  PREFET: 'Préfet des Études',
  ECONOME: 'Économe',
  SECRETAIRE: 'Secrétaire',
  ENSEIGNANT: 'Enseignant',
  PARENT: 'Parent',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile')).data.user,
  });

  const changePassword = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) =>
      (await api.put('/profile/password', payload)).data,
    onSuccess: () => {
      toast.success('Mot de passe modifié avec succès');
      setShowPasswordForm(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors du changement');
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    changePassword.mutate({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <User className="w-6 h-6 text-[#1B5E20]" />
        Mon Profil
      </h1>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#1B5E20]/10 rounded-full flex items-center justify-center text-[#1B5E20] text-xl font-bold">
            {user?.nom?.charAt(0)}{user?.postNom?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user?.nom} {user?.postNom} {user?.prenom || ''}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {ROLE_LABELS[user?.role || ''] || user?.role}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Téléphone</p>
              <p className="text-sm font-medium">{profile?.phone || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium">{profile?.email || '—'}</p>
            </div>
          </div>
        </div>

        {profile?.lastLoginAt && (
          <p className="text-xs text-gray-400 pt-2 border-t">
            Dernière connexion : {new Date(profile.lastLoginAt).toLocaleString('fr-FR')}
          </p>
        )}
      </div>

      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Sécurité
          </h3>
          {!showPasswordForm && (
            <button onClick={() => setShowPasswordForm(true)} className="text-sm text-[#1B5E20] hover:underline">
              Changer le mot de passe
            </button>
          )}
        </div>

        {!showPasswordForm && (
          <p className="text-sm text-gray-500">••••••••</p>
        )}

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe actuel</label>
              <input type="password" required value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
              <input type="password" required minLength={6} value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmer le nouveau mot de passe</label>
              <input type="password" required value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowPasswordForm(false)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button type="submit" disabled={changePassword.isPending}
                className="px-4 py-2 text-sm bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] disabled:opacity-50">
                {changePassword.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
