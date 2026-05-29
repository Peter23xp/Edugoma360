import { NavLink } from 'react-router-dom';
import { User, GraduationCap, Wallet, CalendarCheck, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useParentChildren } from '../../hooks/useParentPortal';
import { formatFC } from '@edugoma360/shared';

const NAV_ITEMS = [
  { to: '/parent/home', label: 'Accueil', icon: Home },
  { to: '/parent/grades', label: 'Notes', icon: GraduationCap },
  { to: '/parent/attendance', label: 'Absences', icon: CalendarCheck },
  { to: '/parent/payments', label: 'Paiements', icon: Wallet },
];

export default function ParentHomePage() {
  const { user } = useAuth();
  const { data: children, isLoading } = useParentChildren();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Portail Parent</h1>
        <p className="text-sm text-neutral-500">Bienvenue, {user?.prenom || user?.nom}</p>
      </div>

      <nav className="flex gap-1 border-b overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/parent/home'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                isActive ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : children && children.length > 0 ? (
        children.map((child) => (
          <div key={child.id} className="bg-white rounded-xl border border-neutral-300/50 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center text-[#1B5E20] font-bold">
                {child.nom.charAt(0)}{child.postNom.charAt(0)}
              </div>
              <div>
                <h2 className="font-semibold">{child.nom.toUpperCase()} {child.postNom.toUpperCase()} {child.prenom || ''}</h2>
                <p className="text-xs text-neutral-500">{child.className} — {child.matricule}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <NavLink to={`/parent/grades?child=${child.id}`} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <p className="text-xs text-neutral-500 flex items-center gap-1"><GraduationCap size={12} /> Dernière moyenne</p>
                <p className="text-lg font-bold text-[#1B5E20] mt-1">{child.lastAverage ?? '—'}/20</p>
              </NavLink>
              <NavLink to={`/parent/attendance?child=${child.id}`} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <p className="text-xs text-neutral-500 flex items-center gap-1"><CalendarCheck size={12} /> Présences</p>
                <p className="text-lg font-bold text-green-600 mt-1">{child.attendanceRate ?? '—'}%</p>
              </NavLink>
              <NavLink to={`/parent/payments?child=${child.id}`} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <p className="text-xs text-neutral-500 flex items-center gap-1"><Wallet size={12} /> Solde dû</p>
                <p className={`text-lg font-bold mt-1 ${child.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatFC(child.balance)}
                </p>
              </NavLink>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-neutral-500 text-sm">
          <User size={32} className="mx-auto mb-3 text-neutral-300" />
          Aucun enfant associé à ce compte
        </div>
      )}
    </div>
  );
}
